# Authentication and Navigation Instructions

## To Access the Login Page:

### Option 1: Use the Sign Out Button
1. Go to http://localhost:3001
2. Click the "Sign Out" button in the top-right corner
3. You'll be redirected to the login page

### Option 2: Clear Browser Storage (if stuck)
Open your browser console (F12) and run:
```javascript
localStorage.clear();
location.href = '/login';
```

## Available Test Credentials:
- Email: `john@example.com`
- Password: `password`

OR

- Email: `jane@example.com`
- Password: `password`

## Available Routes:
- `/login` - Login page
- `/chat` - Main chat interface (protected)
- `/channels` - Channel management page (protected)
- `/files` - Files page (protected)

## How Authentication Works:
1. When not authenticated, accessing protected routes redirects to `/login`
2. After logging in, credentials are stored in localStorage
3. The "Sign Out" button clears credentials and redirects to login
4. The mock server validates tokens for API requests

## Troubleshooting:
If you're stuck on a page:
1. Open browser console (F12)
2. Run: `localStorage.clear(); location.reload();`
3. You should be redirected to the login page