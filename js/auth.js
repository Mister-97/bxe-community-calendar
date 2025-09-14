// Authentication state and user management
let currentUser = null;
let userProfile = null;
let isSignUpMode = false;
let isAdmin = false;

// Setup authentication state listener
function setupAuthStateListener() {
    auth.onAuthStateChanged(async (user) => {
        currentUser = user;
        
        if (user) {
            isAdmin = ADMIN_EMAILS.includes(user.email);
            await checkUserProfile();
            updateAuthUI(true);
        } else {
            userProfile = null;
            isAdmin = false;
            updateAuthUI(false);
        }
        
        renderCalendar();
        updateUpcomingEvents();
    });
}

// Check if user has completed profile setup and email verification
async function checkUserProfile() {
    if (!currentUser) return;
    
    // Check if email is verified first
    if (!currentUser.emailVerified) {
        updateAuthButton('needs_verification');
        return;
    }
    
    try {
        const profileDoc = await db.collection('profiles').doc(currentUser.uid).get();
        
        if (profileDoc.exists) {
            userProfile = profileDoc.data();
            updateAuthButton('authenticated');
            
            // Get and save FCM token for authenticated users
            const fcmToken = await getFCMToken();
            if (fcmToken) {
                await saveFCMTokenToProfile(fcmToken);
            }
            
        } else {
            userProfile = null;
            updateAuthButton('needs_onboarding');
            setTimeout(() => {
                openOnboardingModal();
            }, 500);
        }
    } catch (error) {
        console.error('Error checking user profile:', error);
        userProfile = null;
        updateAuthButton('needs_onboarding');
        setTimeout(() => {
            openOnboardingModal();
        }, 500);
    }
}

// Update authentication UI
function updateAuthUI(isAuthenticated) {
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    
    if (isAuthenticated && userProfile) {
        userInfo.style.display = 'flex';
        userName.innerHTML = userProfile.full_name + (isAdmin ? '<span class="admin-badge">ADMIN</span>' : '');
    } else {
        userInfo.style.display = 'none';
    }
}

// Update auth button state
function updateAuthButton(state) {
    const authButton = document.getElementById('authButton');
    
    switch (state) {
        case 'unauthenticated':
            authButton.textContent = 'Log in to post';
            authButton.className = 'btn btn-auth';
            break;
        case 'needs_verification':
            authButton.textContent = 'Verify email to post';
            authButton.className = 'btn btn-warning';
            break;
        case 'needs_onboarding':
            authButton.textContent = 'Complete setup';
            authButton.className = 'btn btn-primary';
            break;
        case 'authenticated':
            authButton.textContent = 'Post an event';
            authButton.className = 'btn btn-primary';
            break;
    }
}

// Handle auth button click
function handleAuthButtonClick() {
    if (!currentUser) {
        openAuthModal();
    } else if (!currentUser.emailVerified) {
        // Resend verification email
        currentUser.sendEmailVerification().then(() => {
            showToast('Verification email sent! Check your inbox and spam folder.');
        }).catch(error => {
            showToast('Error sending verification email: ' + error.message, 'error');
        });
    } else if (!userProfile) {
        openOnboardingModal();
    } else {
        openEventModal();
    }
}

// Toggle between login and signup modes
function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    
    const title = document.getElementById('authModalTitle');
    const toggleText = document.getElementById('authToggleText');
    const toggleLink = document.getElementById('authToggleLink');
    const submitBtn = document.getElementById('authSubmitBtn');
    
    if (isSignUpMode) {
        title.textContent = 'Sign Up';
        toggleText.textContent = 'Already have an account?';
        toggleLink.textContent = 'Log in';
        submitBtn.textContent = 'Sign Up';
    } else {
        title.textContent = 'Log In';
        toggleText.textContent = "Don't have an account?";
        toggleLink.textContent = 'Sign up';
        submitBtn.textContent = 'Log In';
    }
}

// Handle authentication form submission
async function handleAuthSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const submitBtn = document.getElementById('authSubmitBtn');

    submitBtn.disabled = true;
    submitBtn.textContent = isSignUpMode ? 'Signing up...' : 'Logging in...';
    
    try {
        if (isSignUpMode) {
            // Create account
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Send email verification
            await userCredential.user.sendEmailVerification();
            
            closeAuthModal();
            showToast('Account created! Please check your email and verify your address before creating events.');
            
        } else {
            await auth.signInWithEmailAndPassword(email, password);
            closeAuthModal();
            
            if (!currentUser.emailVerified) {
                showToast('Please verify your email before creating events. Check your inbox for the verification link.');
            } else {
                showToast('Logged in successfully!');
            }
        }
    } catch (error) {
        console.error('Auth error:', error);
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isSignUpMode ? 'Sign Up' : 'Log In';
    }
}

// Sign in with Google
async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    try {
        await auth.signInWithPopup(provider);
        closeAuthModal();
        showToast('Logged in with Google successfully!');
        // Note: Google accounts are automatically verified
    } catch (error) {
        console.error('Google sign-in error:', error);
        showToast(error.message, 'error');
    }
}

// Logout function
async function logout() {
    try {
        await auth.signOut();
        showToast('Logged out successfully!');
        updateAuthButton('unauthenticated');
    } catch (error) {
        console.error('Logout error:', error);
        showToast(error.message, 'error');
    }
}

// Show forgot password form
function showForgotPassword() {
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('forgotPasswordSection').style.display = 'block';
    document.getElementById('authModalTitle').textContent = 'Reset Password';
}

// Show main auth form
function showAuthForm() {
    document.getElementById('authForm').style.display = 'block';
    document.getElementById('forgotPasswordSection').style.display = 'none';
    document.getElementById('authModalTitle').textContent = isSignUpMode ? 'Sign Up' : 'Log In';
}

// Send password reset email
async function sendPasswordReset() {
    const email = document.getElementById('resetEmail').value.trim();
    const resetBtn = document.getElementById('resetBtn');
    
    if (!email) {
        showToast('Please enter your email address', 'error');
        return;
    }
    
    resetBtn.disabled = true;
    resetBtn.textContent = 'Sending...';
    
    try {
        await auth.sendPasswordResetEmail(email);
        showToast('Password reset email sent! Check your inbox.');
        
        // Clear form and go back to login
        document.getElementById('resetEmail').value = '';
        showAuthForm();
        
    } catch (error) {
        console.error('Password reset error:', error);
        
        // Handle specific errors
        if (error.code === 'auth/user-not-found') {
            showToast('No account found with that email address', 'error');
        } else if (error.code === 'auth/invalid-email') {
            showToast('Please enter a valid email address', 'error');
        } else {
            showToast('Error sending reset email: ' + error.message, 'error');
        }
    } finally {
        resetBtn.disabled = false;
        resetBtn.textContent = 'Send Reset Email';
    }
}



// Handle onboarding form submission
async function handleOnboardingSubmit(event) {
    event.preventDefault();
    
    if (!currentUser) return;
    
    const submitBtn = document.getElementById('onboardingSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating profile...';
    
    const profileData = {
        uid: currentUser.uid,
        full_name: document.getElementById('fullName').value.trim(),
        phone_number: document.getElementById('phoneNumber').value.trim(),
        contact_email: document.getElementById('contactEmail').value.trim(),
        company_name: document.getElementById('companyName').value.trim(),
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection('profiles').doc(currentUser.uid).set(profileData);
        userProfile = profileData;
        
        closeOnboardingModal();
        updateAuthButton('authenticated');
        updateAuthUI(true);
        showToast('Profile created successfully! You can now create events.');
    } catch (error) {
        console.error('Error creating profile:', error);
        showToast('Failed to create profile. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Setup';
    }
}

// Export functions to global scope
window.handleAuthButtonClick = handleAuthButtonClick;
window.toggleAuthMode = toggleAuthMode;
window.handleAuthSubmit = handleAuthSubmit;
window.signInWithGoogle = signInWithGoogle;
window.logout = logout;
window.handleOnboardingSubmit = handleOnboardingSubmit;
window.setupAuthStateListener = setupAuthStateListener;
window.showForgotPassword = showForgotPassword;
window.showAuthForm = showAuthForm;
window.sendPasswordReset = sendPasswordReset;