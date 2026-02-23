// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyAQQwmtpr17jHgx73ux6TaaXRJgwPqTTSM",
    authDomain: "bxe-community-calendar.firebaseapp.com",
    projectId: "bxe-community-calendar",
    storageBucket: "bxe-community-calendar.firebasestorage.app",
    messagingSenderId: "99255180622",
    appId: "1:99255180622:web:2be196ce5aadcb55eb921f",
    measurementId: "G-HD861K8CNG"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// Constants
const ADMIN_EMAILS = [
    '97franchise@gmail.com',
    'afgarner@bxellc.com',
    'craigdbarnes@gmail.com'
    'dremeekins@gmail.com'
];

const RATE_LIMITS = {
    events_per_hour: 20,
    events_per_day: 50,
    events_per_week: 1000
};

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// FCM Token management (will be available after messaging script loads)
async function getFCMToken() {
    if (!firebase.messaging) {
        console.log('Firebase messaging not available');
        return null;
    }
    
    try {
        const messaging = firebase.messaging();
        const currentToken = await messaging.getToken({
            vapidKey: 'BG3fc9jg5P-vkhUcCQ6NvdcGNOrr2dGRSQ8892BwNehPjjrnPXVx5B_8H8TsBeWeh9mL7HCnlLrvyONya7Q6gdY'
        });
        
        if (currentToken) {
            console.log('FCM Token:', currentToken);
            return currentToken;
        } else {
            console.log('No registration token available.');
            return null;
        }
    } catch (err) {
        console.log('An error occurred while retrieving token. ', err);
        return null;
    }
}

// Save FCM token to user profile
async function saveFCMTokenToProfile(token) {
    if (!currentUser || !token) return;
    
    try {
        await db.collection('profiles').doc(currentUser.uid).update({
            fcmToken: token,
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('FCM token saved to profile');
    } catch (error) {
        console.error('Error saving FCM token:', error);
    }
}

// Make functions available globally
window.getFCMToken = getFCMToken;
window.saveFCMTokenToProfile = saveFCMTokenToProfile;
