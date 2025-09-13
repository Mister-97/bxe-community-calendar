// Modal management functions

// Auth modal functions
function openAuthModal() {
    document.getElementById('authModal').classList.add('show');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('show');
    document.getElementById('authForm').reset();
}

// Onboarding modal functions
function openOnboardingModal() {
    document.getElementById('onboardingModal').classList.add('show');
    
    if (currentUser) {
        if (currentUser.displayName) {
            document.getElementById('fullName').value = currentUser.displayName;
        }
        if (currentUser.email) {
            document.getElementById('contactEmail').value = currentUser.email;
        }
    }
}

function closeOnboardingModal() {
    document.getElementById('onboardingModal').classList.remove('show');
    document.getElementById('onboardingForm').reset();
}

// Event modal functions
function openEventModal(selectedDate = null) {
    if (!currentUser || !userProfile) {
        handleAuthButtonClick();
        return;
    }
    
    editingEventId = null;
    document.getElementById('modalTitle').textContent = 'Create Event';
    document.getElementById('saveEventBtn').textContent = 'Create Event';
    
    clearEventForm();
    document.getElementById('createdByName').value = userProfile.full_name;
    
    if (selectedDate) {
        const start = new Date(selectedDate);
        start.setHours(9, 0);
        const end = new Date(selectedDate);
        end.setHours(10, 0);
        
        document.getElementById('startDate').value = formatDateTimeLocal(start);
        document.getElementById('endDate').value = formatDateTimeLocal(end);
    }
    
    document.getElementById('eventModal').classList.add('show');
}

function openEditEventModal(event) {
    if (!currentUser || !userProfile) {
        handleAuthButtonClick();
        return;
    }
    
    editingEventId = event.id;
    document.getElementById('modalTitle').textContent = 'Edit Event';
    document.getElementById('saveEventBtn').textContent = 'Update Event';
    
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('startDate').value = event.start;
    document.getElementById('endDate').value = event.end;
    document.getElementById('location').value = event.location || '';
    document.getElementById('description').value = event.description || '';
    document.getElementById('createdByName').value = event.created_by_name;
    
    if (event.image_url) {
        uploadedImage = event.image_url;
        showImagePreview(event.image_url);
    } else {
        resetImageUpload();
    }
    
    document.getElementById('eventModal').classList.add('show');
}

function closeEventModal() {
    document.getElementById('eventModal').classList.remove('show');
    clearEventForm();
    editingEventId = null;
}

function clearEventForm() {
    document.getElementById('eventTitle').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('location').value = '';
    document.getElementById('description').value = '';
    document.getElementById('createdByName').value = '';
    
    resetImageUpload();
    
    const errorElements = document.querySelectorAll('.error-message');
    const inputElements = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    
    errorElements.forEach(error => error.classList.remove('show'));
    inputElements.forEach(input => input.classList.remove('error'));
}

// Event preview modal functions
function closeEventPreviewModal() {
    document.getElementById('eventPreviewModal').classList.remove('show');
    currentEventId = null;
}

// Help modal functions
function showHelp() {
    document.getElementById('helpModal').classList.add('show');
}

function closeHelpModal() {
    document.getElementById('helpModal').classList.remove('show');
}

// Terms and Guidelines modal functions
function showTermsModal() {
    document.getElementById('termsModal').classList.add('show');
}

function closeTermsModal() {
    document.getElementById('termsModal').classList.remove('show');
}

function showGuidelinesModal() {
    document.getElementById('guidelinesModal').classList.add('show');
}

function closeGuidelinesModal() {
    document.getElementById('guidelinesModal').classList.remove('show');
}

// Setup modal event listeners
function setupModalEventListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            if (e.target.id === 'authModal') closeAuthModal();
            if (e.target.id === 'onboardingModal') closeOnboardingModal();
            if (e.target.id === 'eventModal') closeEventModal();
            if (e.target.id === 'eventPreviewModal') closeEventPreviewModal();
            if (e.target.id === 'termsModal') closeTermsModal();
            if (e.target.id === 'guidelinesModal') closeGuidelinesModal();
            if (e.target.id === 'helpModal') closeHelpModal();
        }
    });
}
