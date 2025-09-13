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

// Check if user has completed profile setup
async function checkUserProfile() {
    if (!currentUser) return;
    
    try {
        const profileDoc = await db.collection('profiles').doc(currentUser.uid).get();
        
        if (profileDoc.exists) {
            userProfile = profileDoc.data();
            updateAuthButton('authenticated');
        } else {
            userProfile = null;
            updateAuthButton('needs_onboarding');
        }
    } catch (error) {
        console.error('Error checking user profile:', error);
        userProfile = null;
        updateAuthButton('needs_onboarding');
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
        case 'needs_onboarding':
            authButton.textContent = 'Finish setup';
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
            await auth.createUserWithEmailAndPassword(email, password);
        } else {
            await auth.signInWithEmailAndPassword(email, password);
        }
        
        closeAuthModal();
        showToast(isSignUpMode ? 'Account created successfully!' : 'Logged in successfully!');
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
        showToast('Profile created successfully!');
    } catch (error) {
        console.error('Error creating profile:', error);
        showToast('Failed to create profile. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Setup';
    }
}
