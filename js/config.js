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
