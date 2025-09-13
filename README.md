# The Black Experience Community Calendar

A community-driven event calendar built with Firebase, featuring user authentication, event management, and responsive design.

## Project Structure

```
/calendar-app
├── index.html                 # Main HTML file
├── css/
│   ├── styles.css            # Base styles and layout
│   ├── calendar.css          # Calendar-specific styles
│   ├── modals.css            # Modal and form styles
│   └── responsive.css        # Mobile responsive styles
├── js/
│   ├── config.js             # Firebase configuration and constants
│   ├── auth.js               # Authentication logic
│   ├── calendar.js           # Calendar rendering and navigation
│   ├── events.js             # Event CRUD operations
│   ├── modals.js             # Modal management
│   ├── upload.js             # Image upload handling
│   ├── utils.js              # Utility functions
│   └── main.js               # Application initialization
└── README.md                 # This file
```

## Features

- **User Authentication**: Email/password and Google sign-in
- **Event Management**: Create, edit, and delete community events
- **Image Upload**: Event images stored in Firebase Storage
- **Calendar View**: Monthly calendar with event display
- **Search**: Search upcoming events
- **Admin Controls**: Admin users can moderate content
- **Rate Limiting**: Prevents spam with configurable limits
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Events sync across all users

## Installation

1. **Clone or download the project files**
   ```bash
   git clone [repository-url]
   cd calendar-app
   ```

2. **Set up Firebase**
   - Create a new Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Set up Firebase Storage
   - Get your config object from Project Settings

3. **Update Firebase configuration**
   - Open `js/config.js`
   - Replace the `firebaseConfig` object with your Firebase config

4. **Configure Firestore security rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /events/{eventId} {
         allow read: if true;
         allow create: if request.auth != null && 
                      request.auth.uid == resource.data.created_by_uid;
         allow update: if request.auth != null && 
                      request.auth.uid == resource.data.created_by_uid;
         allow delete: if request.auth != null && 
                      request.auth.uid == resource.data.created_by_uid;
       }
       
       match /profiles/{userId} {
         allow read, write: if request.auth != null && 
                           request.auth.uid == userId;
       }
       
       match /admin_actions/{actionId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

5. **Configure Storage security rules**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /event-images/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

6. **Deploy**
   - Upload all files to your web server
   - Or use Firebase Hosting for easy deployment

## Configuration

### Admin Users
Update the `ADMIN_EMAILS` array in `js/config.js`:
```javascript
const ADMIN_EMAILS = [
    'admin1@example.com',
    'admin2@example.com'
];
```

### Rate Limits
Modify limits in `js/config.js`:
```javascript
const RATE_LIMITS = {
    events_per_hour: 5,
    events_per_day: 20,
    events_per_week: 50
};
```

### Time Zone
The app uses Central Time by default. To change it, update references to `"America/Chicago"` in the calendar.js file.

## File Descriptions

### HTML Files
- **index.html**: Main structure with modals and containers

### CSS Files
- **styles.css**: Base typography, colors, buttons, forms, and layout
- **calendar.css**: Calendar grid, day cells, event styling
- **modals.css**: Modal dialogs, forms, and overlay styles
- **responsive.css**: Mobile breakpoints and responsive design

### JavaScript Files
- **config.js**: Firebase setup and app constants
- **auth.js**: User login, signup, profile management
- **calendar.js**: Calendar rendering, navigation, event display
- **events.js**: Create, read, update, delete operations for events
- **modals.js**: Modal open/close and form management
- **upload.js**: Image upload to Firebase Storage
- **utils.js**: Helper functions, date formatting, notifications
- **main.js**: App initialization and global error handling

## Usage

1. **Visit the application** in your web browser
2. **Browse events** without logging in
3. **Click "Log in to post"** to create an account
4. **Complete your profile** after first login
5. **Click any date** or "Post an event" to create events
6. **Search events** using the search box in the sidebar
7. **Navigate months** using arrow buttons or "Today" button

## Development

### Adding New Features

1. **CSS Changes**: Add styles to the appropriate CSS file based on component
2. **JavaScript Changes**: Add functions to the relevant JS file based on functionality
3. **New Components**: Create new CSS/JS files and include them in index.html

### Code Organization Principles

- **Separation of Concerns**: Each file handles one main responsibility
- **Modularity**: Functions are focused and reusable
- **Maintainability**: Clear file structure makes updates easier
- **Performance**: CSS and JS can be cached separately

### Testing

- Test authentication flow (signup, login, logout)
- Test event creation, editing, deletion
- Test image upload functionality
- Test responsive design on various screen sizes
- Test admin controls (if applicable)
- Verify rate limiting works correctly

## Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Check your Firebase config in `config.js`
   - Verify Firebase project settings
   - Check browser console for specific errors

2. **Authentication Not Working**
   - Ensure Email/Password and Google auth are enabled in Firebase Console
   - Check domain authorization in Firebase Auth settings

3. **Images Not Uploading**
   - Verify Firebase Storage is set up
   - Check storage security rules
   - Ensure file size is under 5MB

4. **Events Not Saving**
   - Check Firestore security rules
   - Verify user is properly authenticated
   - Check browser console for rate limiting messages

5. **Calendar Not Displaying**
   - Check JavaScript console for errors
   - Verify all JS files are loading correctly
   - Ensure Firebase connection is established

### Performance Optimization

- Enable Firebase hosting compression
- Use CDN for static assets
- Implement service worker for offline support
- Optimize images before upload
- Consider pagination for large event lists

## Security Considerations

- Never expose Firebase admin keys in client code
- Keep Firestore security rules restrictive
- Validate all user inputs
- Sanitize HTML content to prevent XSS
- Use HTTPS in production
- Regular security audits of dependencies

## Browser Compatibility

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 70+

## Contributing

1. Follow the existing file structure
2. Add comments for complex logic
3. Test on multiple devices and browsers
4. Update this README for any new features
5. Maintain consistent code style

## License

This project is for educational and community use. Modify as needed for your community's requirements.

## Support

For technical issues:
1. Check the browser console for error messages
2. Verify Firebase configuration
3. Review Firestore and Storage security rules
4. Test with different browsers/devices

For community guidelines or content issues, contact the administrators listed in the admin emails configuration.
