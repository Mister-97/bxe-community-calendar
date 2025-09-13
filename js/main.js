// Main application initialization

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
});

function initializeApplication() {
    console.log('Initializing Black Experience Community Calendar...');
    
    // Setup core functionality
    setupRealTimeDate();
    setupAuthStateListener();
    setupModalEventListeners();
    setupImageUpload();
    setupSearch();
    
    // Load initial data
    loadEventsFromFirebase();
    
    // Setup performance optimizations
    setupPerformanceOptimizations();
    
    console.log('Application initialized successfully');
}

function setupPerformanceOptimizations() {
    // Debounce search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const debouncedSearch = debounce(function(query) {
            currentSearchQuery = query;
            updateUpcomingEvents();
        }, 300);
        
        searchInput.addEventListener('input', function(e) {
            debouncedSearch(e.target.value.trim());
        });
    }
    
    // Throttle window resize events
    const throttledResize = throttle(function() {
        // Handle any resize-related updates here if needed
        console.log('Window resized');
    }, 250);
    
    window.addEventListener('resize', throttledResize);
    
    // Optimize scroll performance
    let ticking = false;
    function updateOnScroll() {
        // Add any scroll-related updates here if needed
        ticking = false;
    }
    
    document.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    });
}

// Handle errors globally
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    
    // Don't show toast for every error to avoid spam
    if (event.error && event.error.message) {
        const message = event.error.message;
        if (message.includes('Firebase') || message.includes('auth')) {
            showToast('Connection issue. Please check your internet and try again.', 'error');
        }
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Handle specific Firebase errors
    if (event.reason && event.reason.code) {
        switch (event.reason.code) {
            case 'permission-denied':
                showToast('Permission denied. Please check your authentication.', 'error');
                break;
            case 'unavailable':
                showToast('Service temporarily unavailable. Please try again.', 'error');
                break;
            default:
                showToast('An unexpected error occurred. Please try again.', 'error');
        }
    }
});

// Service worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Export functions to global scope for inline event handlers
// (In a production app, you might want to avoid this and use proper event listeners)
window.handleAuthButtonClick = handleAuthButtonClick;
window.toggleAuthMode = toggleAuthMode;
window.handleAuthSubmit = handleAuthSubmit;
window.signInWithGoogle = signInWithGoogle;
window.logout = logout;
window.handleOnboardingSubmit = handleOnboardingSubmit;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.goToToday = goToToday;
window.saveEvent = saveEvent;
window.editCurrentEvent = editCurrentEvent;
window.deleteCurrentEvent = deleteCurrentEvent;
window.adminDeleteEvent = adminDeleteEvent;
window.showEventDetails = showEventDetails;
window.showHelp = showHelp;
window.closeAuthModal = closeAuthModal;
window.closeOnboardingModal = closeOnboardingModal;
window.closeEventModal = closeEventModal;
window.closeEventPreviewModal = closeEventPreviewModal;
window.closeHelpModal = closeHelpModal;
window.closeTermsModal = closeTermsModal;
window.closeGuidelinesModal = closeGuidelinesModal;
