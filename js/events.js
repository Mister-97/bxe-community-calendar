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
            eventData.status =
