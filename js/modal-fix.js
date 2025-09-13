// Emergency modal fix - ensures modals are hidden immediately when page loads
(function() {
    function hideAllModals() {
        const modalIds = [
            'authModal',
            'onboardingModal', 
            'eventModal',
            'eventPreviewModal',
            'helpModal'
        ];
        
        modalIds.forEach(function(id) {
            const modal = document.getElementById(id);
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('show');
            }
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideAllModals);
    } else {
        hideAllModals();
    }
    
    setTimeout(hideAllModals, 100);
})();
