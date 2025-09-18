// Event management and CRUD operations
let events = [];
let currentEventId = null;
let editingEventId = null;

// Load events from Firebase
function loadEventsFromFirebase() {
    db.collection('events')
        .orderBy('start', 'asc')
        .get()
        .then((querySnapshot) => {
            events = [];
            querySnapshot.forEach((doc) => {
                events.push({ id: doc.id, ...doc.data() });
            });
            renderCalendar();
            updateUpcomingEvents();
        })
        .catch((error) => {
            console.error("Error loading events: ", error);
            renderCalendar();
            updateUpcomingEvents();
        });
}

// Check rate limits before allowing event creation
async function checkRateLimits(userId) {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Count recent events by this user
        const recentEvents = await db.collection('events')
            .where('created_by_uid', '==', userId)
            .where('created_at', '>=', oneWeekAgo)
            .get();

        let eventsLastHour = 0;
        let eventsLastDay = 0;
        let eventsLastWeek = recentEvents.size;

        recentEvents.forEach(doc => {
            const eventTime = doc.data().created_at.toDate();
            if (eventTime >= oneHourAgo) eventsLastHour++;
            if (eventTime >= oneDayAgo) eventsLastDay++;
        });

        // Check limits
        if (eventsLastHour >= RATE_LIMITS.events_per_hour) {
            throw new Error(`Rate limit exceeded: Maximum ${RATE_LIMITS.events_per_hour} events per hour. Please wait before creating another event.`);
        }
        if (eventsLastDay >= RATE_LIMITS.events_per_day) {
            throw new Error(`Rate limit exceeded: Maximum ${RATE_LIMITS.events_per_day} events per day. Please try again tomorrow.`);
        }
        if (eventsLastWeek >= RATE_LIMITS.events_per_week) {
            throw new Error(`Rate limit exceeded: Maximum ${RATE_LIMITS.events_per_week} events per week. Please try again later.`);
        }

        return true;
    } catch (error) {
        throw error;
    }
}

// Save event (create or update)
async function saveEvent() {
    if (!currentUser || !userProfile) {
        showToast('You must be logged in to create events', 'error');
        return;
    }

    if (!validateEventForm()) {
        return;
    }

    const saveBtn = document.getElementById('saveEventBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = editingEventId ? 'Updating...' : 'Creating...';

    try {
        // Check rate limits only for new events, not edits
        if (!editingEventId) {
            await checkRateLimits(currentUser.uid);
        }

        const eventData = {
    title: document.getElementById('eventTitle').value.trim(),
    category: document.getElementById('eventCategory').value,
    start: document.getElementById('startDate').value,
    end: document.getElementById('endDate').value,
    location: document.getElementById('location').value.trim(),
    description: document.getElementById('description').value.trim(),
    image_url: uploadedImage || null,
    updated_at: firebase.firestore.FieldValue.serverTimestamp()
};
        if (!editingEventId) {
            eventData.created_by_uid = currentUser.uid;
            eventData.created_by_name = userProfile.full_name;
            eventData.status = 'public';
            eventData.created_at = firebase.firestore.FieldValue.serverTimestamp();
        }

        if (editingEventId) {
            await db.collection('events').doc(editingEventId).update(eventData);
            showToast('Event updated successfully!');
        } else {
            await db.collection('events').add(eventData);
            showToast('Event created successfully!');
        }
        
        loadEventsFromFirebase();
        closeEventModal();
    } catch (error) {
        console.error('Error saving event:', error);
        if (error.message.includes('Rate limit exceeded')) {
            showToast(error.message, 'error');
        } else if (error.code === 'permission-denied') {
            showToast('Rate limit exceeded. Please wait before creating another event.', 'error');
        } else {
            showToast('Failed to save event. Please try again.', 'error');
        }
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = editingEventId ? 'Update Event' : 'Create Event';
    }
}

// Validate event form
function validateEventForm() {
    let isValid = true;
    
    const title = document.getElementById('eventTitle').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const errorElements = document.querySelectorAll('.error-message');
    const inputElements = document.querySelectorAll('.form-input');
    
    errorElements.forEach(error => error.classList.remove('show'));
    inputElements.forEach(input => input.classList.remove('error'));

    if (!title) {
        showFieldError('eventTitle', 'titleError', 'Please enter an event title');
        isValid = false;
    }

    if (!startDate) {
        showFieldError('startDate', 'startError', 'Please select a start date');
        isValid = false;
    }

    if (!endDate) {
        showFieldError('endDate', 'endError', 'Please select an end date');
        isValid = false;
    }

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (end <= start) {
            showFieldError('endDate', 'endError', 'End date must be after start date');
            isValid = false;
        }
    }

    return isValid;
}

// Show field error
function showFieldError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    
    field.classList.add('error');
    error.textContent = message;
    error.classList.add('show');
}

// Show event details in preview modal
function showEventDetails(event) {
    currentEventId = event.id;
    
    document.getElementById('eventPreviewModal').classList.add('show');
    document.getElementById('previewEventTitle').textContent = event.title;
    document.getElementById('previewEventStart').textContent = formatEventDate(event.start);
    document.getElementById('previewEventEnd').textContent = formatEventDate(event.end);
    document.getElementById('previewEventLocation').textContent = event.location || 'No location specified';
    document.getElementById('previewEventDescription').textContent = event.description || 'No description provided';
    document.getElementById('previewEventCreator').textContent = event.created_by_name;
    
    const imageContainer = document.getElementById('previewEventImage');
    if (event.image_url) {
        imageContainer.innerHTML = `<img src="${event.image_url}" class="preview-image" alt="Event image">`;
        imageContainer.style.display = 'block';
    } else {
        imageContainer.style.display = 'none';
    }
    
    const ownerControls = document.getElementById('eventOwnerControls');
    if (currentUser && currentUser.uid === event.created_by_uid) {
        ownerControls.style.display = 'flex';
    } else {
        ownerControls.style.display = 'none';
    }
}

// Edit current event
function editCurrentEvent() {
    if (!currentEventId) return;
    
    const event = events.find(e => e.id === currentEventId);
    if (!event) return;
    
    closeEventPreviewModal();
    openEditEventModal(event);
}

// Delete current event
function deleteCurrentEvent() {
    if (!currentEventId) return;
    
    const event = events.find(e => e.id === currentEventId);
    if (!event) return;
    
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
        deleteEventWithImage(currentEventId, event.image_url);
    }
    closeEventPreviewModal();
}

// Delete event with image cleanup
async function deleteEventWithImage(eventId, imageUrl) {
    try {
        await db.collection('events').doc(eventId).delete();
        
        if (imageUrl) {
            try {
                const imageRef = storage.refFromURL(imageUrl);
                await imageRef.delete();
            } catch (imageError) {
                console.warn('Could not delete image:', imageError);
            }
        }
        
        showToast('Event deleted successfully!');
        loadEventsFromFirebase();
    } catch (error) {
        console.error('Error deleting event:', error);
        showToast('Failed to delete event. Please try again.', 'error');
    }
}

// Admin delete event function
function adminDeleteEvent(eventId, eventTitle) {
    if (!isAdmin) {
        showToast('Access denied. Admin privileges required.', 'error');
        return;
    }
    
    const reason = prompt(`Admin Action: Delete event "${eventTitle}"?\n\nOptional: Enter reason for deletion (will be logged):`);
    
    if (reason !== null) {
        deleteEventWithReason(eventId, eventTitle, reason || 'No reason provided');
    }
}

// Delete event with admin reason logging
async function deleteEventWithReason(eventId, eventTitle, reason) {
    try {
        const event = events.find(e => e.id === eventId);
        
        await db.collection('admin_actions').add({
            action: 'delete_event',
            event_id: eventId,
            event_title: eventTitle,
            admin_email: currentUser.email,
            admin_name: userProfile.full_name,
            reason: reason,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        await db.collection('events').doc(eventId).delete();
        
        if (event && event.image_url) {
            try {
                const imageRef = storage.refFromURL(event.image_url);
                await imageRef.delete();
            } catch (imageError) {
                console.warn('Could not delete image:', imageError);
            }
        }
        
        showToast(`Event "${eventTitle}" deleted by admin`);
        loadEventsFromFirebase();
    } catch (error) {
        console.error('Error deleting event:', error);
        showToast('Failed to delete event. Please try again.', 'error');
    }
}

// Add category validation to validateEventForm function
function validateEventFormWithCategory() {
    let isValid = true;
    
    const title = document.getElementById('eventTitle').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const categorySelect = document.getElementById("eventCategory");
    const categories = Array.from(categorySelect.selectedOptions).map(opt => opt.value);


    const errorElements = document.querySelectorAll('.error-message');
    const inputElements = document.querySelectorAll('.form-input, .form-select');
    
    errorElements.forEach(error => error.classList.remove('show'));
    inputElements.forEach(input => input.classList.remove('error'));

    if (!title) {
        showFieldError('eventTitle', 'titleError', 'Please enter an event title');
        isValid = false;
    }

    if (!category) {
        showFieldError('eventCategory', 'categoryError', 'Please select a category');
        isValid = false;
    }

    if (!startDate) {
        showFieldError('startDate', 'startError', 'Please select a start date');
        isValid = false;
    }

    if (!endDate) {
        showFieldError('endDate', 'endError', 'Please select an end date');
        isValid = false;
    }

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (end <= start) {
            showFieldError('endDate', 'endError', 'End date must be after start date');
            isValid = false;
        }
    }

    return isValid;
}

// Override the original validateEventForm
window.validateEventForm = validateEventFormWithCategory;
