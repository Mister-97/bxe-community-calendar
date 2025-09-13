const { onDocumentCreated, onDocumentDeleted, onDocumentWritten } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

//
// Event Created Function
//
exports.onEventCreated = onDocumentCreated('events/{eventId}', async (event) => {
    const eventData = event.data.data(); // new doc data
    const eventId = event.params.eventId;

    try {
        const db = getFirestore();

        // Get the user profile who created this event
        const userDoc = await db.collection('profiles')
            .doc(eventData.created_by_uid)
            .get();
        
        if (!userDoc.exists) {
            console.log('User profile not found');
            return null;
        }

        const userProfile = userDoc.data();

        // Prepare payload for Make webhook
        const payload = {
            type: "event_created",
            event_id: eventId,
            event: {
                title: eventData.title,
                category: eventData.category || '',
                start_date: eventData.start,
                end_date: eventData.end,
                location: eventData.location || '',
                description: eventData.description || '',
                image_url: eventData.image_url || ''
            },
            user: {
                uid: eventData.created_by_uid,
                name: userProfile.full_name,
                email: userProfile.contact_email,
                phone: userProfile.phone_number,
                company: userProfile.company_name
            },
            timestamp: new Date().toISOString()
        };

        // Send webhook to Make.com
        const makeWebhookUrl = 'https://hook.us2.make.com/l62z98fn0lrffbuvspyutmkmd72rre3k';
        await fetch(makeWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log(`Created event ${eventId} webhook sent`);

    } catch (error) {
        console.error('Error handling event creation:', error);
    }
});

//
// Event Changed Function (handles both creation and deletion)
//
exports.onEventChanged = onDocumentWritten('events/{eventId}', async (event) => {
    const beforeData = event.data.before?.data();
    const afterData = event.data.after?.data();
    const eventId = event.params.eventId;

    // Check if this is a deletion (document existed before but not after)
    if (beforeData && !afterData) {
        console.log('Event deleted:', eventId);
        console.log('Deleted event data:', beforeData);
        console.log('created_by_uid:', beforeData.created_by_uid);

        try {
            const db = getFirestore();
            let userProfile = null;

            // Check if we have a valid created_by_uid
            if (!beforeData.created_by_uid || beforeData.created_by_uid.trim() === '') {
                console.log("No valid created_by_uid found, using default user data");
            } else {
                try {
                    // Get the user profile who created this event
                    const userDoc = await db.collection('profiles')
                        .doc(beforeData.created_by_uid.trim())
                        .get();
                    
                    if (!userDoc.exists) {
                        console.log('User profile not found for uid:', beforeData.created_by_uid);
                    } else {
                        userProfile = userDoc.data();
                    }
                } catch (profileError) {
                    console.log('Error fetching user profile:', profileError.message);
                }
            }

            // Prepare payload for Make webhook
            const payload = {
                type: "event_deleted",
                event_id: eventId,
                event: {
                    title: beforeData.title || 'Unknown Event',
                    start_date: beforeData.start,
                    end_date: beforeData.end,
                    location: beforeData.location || '',
                    description: beforeData.description || '',
                    category: beforeData.category || ''
                },
                user: {
                    uid: beforeData.created_by_uid || 'unknown',
                    name: userProfile?.full_name || 'Unknown User',
                    email: userProfile?.contact_email || 'unknown@example.com',
                    phone: userProfile?.phone_number || 'unknown',
                    company: userProfile?.company_name || 'unknown'
                },
                timestamp: new Date().toISOString()
            };

            // Send webhook to Make.com
            const makeWebhookUrl = 'https://hook.us2.make.com/l62z98fn0lrffbuvspyutmkmd72rre3k';
            await fetch(makeWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log(`Deleted event ${eventId} webhook sent`);

            // Optional: also push FCM notification if user has token
            if (userProfile?.fcmToken) {
                const message = {
                    token: userProfile.fcmToken,
                    notification: {
                        title: 'Event Removed',
                        body: `Your event "${beforeData.title}" was removed by an admin.`
                    },
                    data: {
                        eventId: eventId,
                        eventType: 'deleted'
                    }
                };
                const response = await getMessaging().send(message);
                console.log('FCM delete notification sent:', response);
            }

        } catch (error) {
            console.error('Error handling event deletion:', error);
        }
    }
    // Note: Creation events are still handled by onEventCreated function above
});

// Remove the old onEventDeleted function since it doesn't work
// The onEventChanged function now handles deletions properly