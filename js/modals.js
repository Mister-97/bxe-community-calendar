// Modal management functions

function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
    // Reset form
    const form = document.getElementById('authForm');
    if (form) form.reset();
}

function openOnboardingModal() {
    const modal = document.getElementById('onboardingModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Pre-fill email if available
        if (currentUser && currentUser.email) {
            const emailField = document.getElementById('contactEmail');
            if (emailField) emailField.value = currentUser.email;
        }
        
        // Pre-fill name if available
        if (currentUser && currentUser.displayName) {
            const nameField = document.getElementById('fullName');
            if (nameField) nameField.value = currentUser.displayName;
        }
    }
}

function closeOnboardingModal() {
    const modal = document.getElementById('onboardingModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
    // Reset form
    const form = document.getElementById('onboardingForm');
    if (form) form.reset();
}

function openEventModal(selectedDate = null) {
    if (!currentUser || !userProfile) {
        handleAuthButtonClick();
        return;
    }
    
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Clear and setup form
        clearEventForm();
        const createdByField = document.getElementById('createdByName');
        if (createdByField && userProfile) {
            createdByField.value = userProfile.full_name;
        }
        
        // Set date if provided
        if (selectedDate) {
            const start = new Date(selectedDate);
            start.setHours(9, 0);
            const end = new Date(selectedDate);
            end.setHours(10, 0);
            
            const startField = document.getElementById('startDate');
            const endField = document.getElementById('endDate');
            if (startField && endField) {
                startField.value = formatDateTimeLocal(start);
                endField.value = formatDateTimeLocal(end);
            }
        }
    }
}

function closeEventModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
    clearEventForm();
}

function showHelp() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

function closeEventPreviewModal() {
    const modal = document.getElementById('eventPreviewModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

function handleAuthButtonClick() {
    if (!currentUser) {
        openAuthModal();
    } else if (!userProfile) {
        openOnboardingModal();
    } else {
        openEventModal();
    }
}

function clearEventForm() {
    const fields = ['eventTitle', 'eventCategory', 'startDate', 'endDate', 'location', 'description', 'createdByName'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    // Reset image upload
    if (typeof resetImageUpload === 'function') {
        resetImageUpload();
    }
    
    // Clear errors
    const errorElements = document.querySelectorAll('.error-message');
    const inputElements = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    
    errorElements.forEach(error => error.classList.remove('show'));
    inputElements.forEach(input => input.classList.remove('error'));
}

// Helper function from utils.js
function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Setup modal event listeners
function setupModalEventListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            if (e.target.id === 'authModal') closeAuthModal();
            if (e.target.id === 'onboardingModal') closeOnboardingModal();
            if (e.target.id === 'eventModal') closeEventModal();
            if (e.target.id === 'eventPreviewModal') closeEventPreviewModal();
            if (e.target.id === 'helpModal') closeHelpModal();
        }
    });
}

// Export to global scope for inline event handlers
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.openOnboardingModal = openOnboardingModal;
window.closeOnboardingModal = closeOnboardingModal;
window.openEventModal = openEventModal;
window.closeEventModal = closeEventModal;
window.showHelp = showHelp;
window.closeHelpModal = closeHelpModal;
window.closeEventPreviewModal = closeEventPreviewModal;
window.handleAuthButtonClick = handleAuthButtonClick;
window.setupModalEventListeners = setupModalEventListeners;

function showTermsModal() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeTermsModal() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

function showGuidelinesModal() {
    const modal = document.getElementById('guidelinesModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeGuidelinesModal() {
    const modal = document.getElementById('guidelinesModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// Export to global scope
window.showTermsModal = showTermsModal;
window.closeTermsModal = closeTermsModal;
window.showGuidelinesModal = showGuidelinesModal;
window.closeGuidelinesModal = closeGuidelinesModal;

function showTermsModal() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeTermsModal() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

function showGuidelinesModal() {
    const modal = document.getElementById('guidelinesModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeGuidelinesModal() {
    const modal = document.getElementById('guidelinesModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// Export to global scope
window.showTermsModal = showTermsModal;
window.closeTermsModal = closeTermsModal;
window.showGuidelinesModal = showGuidelinesModal;
window.closeGuidelinesModal = closeGuidelinesModal;

function openEditEventModal(event) {
    if (!currentUser || !userProfile) {
        handleAuthButtonClick();
        return;
    }
    
    editingEventId = event.id;
    document.getElementById('modalTitle').textContent = 'Edit Event';
    document.getElementById('saveEventBtn').textContent = 'Update Event';
    
    // Pre-fill all the form fields with existing event data
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventCategory').value = event.category || '';
    document.getElementById('startDate').value = event.start;
    document.getElementById('endDate').value = event.end;
    document.getElementById('location').value = event.location || '';
    document.getElementById('description').value = event.description || '';
    document.getElementById('createdByName').value = event.created_by_name;
    
    // Handle image
    if (event.image_url) {
        uploadedImage = event.image_url;
        showImagePreview(event.image_url);
    } else {
        resetImageUpload();
    }
    
    // Open the event modal
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

// Export to global scope
window.openEditEventModal = openEditEventModal;
