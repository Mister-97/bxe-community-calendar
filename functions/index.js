const { onDocumentCreated, onDocumentDeleted } = require('firebase-functions/v2/firestore');
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
            type: "event_created",   // 👈 Added type field
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
// Event Deleted Function
//
exports.onEventDeleted = onDocumentDeleted('events/{eventId}', async (event) => {
    const eventData = event.data;
    const eventId = event.params.eventId;

    if (!eventData) {
        console.log("No event data found for deleted doc");
        return null;
    }

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
            type: "event_deleted",
            event_id: eventId,
            event: {
                title: eventData.title,
                start_date: eventData.start,
                end_date: eventData.end,
                location: eventData.location || '',
                description: eventData.description || ''
            },
            user: {
                uid: eventData.created_by_uid,
                name: userProfile.full_name,
                email: userProfile.contact_email,
                phone: userProfile.phone_number
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
        if (userProfile.fcmToken) {
            const message = {
                token: userProfile.fcmToken,
                notification: {
                    title: 'Event Removed',
                    body: `Your event "${eventData.title}" was removed by an admin.`
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
});
