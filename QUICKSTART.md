# Quick Start Guide - Home Appliance Maintenance App

## Prerequisites
- Node.js 18 or higher
- npm or yarn
- A modern web browser

## Installation & Setup

### 1. Install Dependencies

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Testing the Application

### Test User Accounts

Use these test credentials to explore different user roles:

#### Customer Account
- **Phone**: 1234567890
- **Password**: customer123
- **Features to test**:
  - Create service requests
  - Upload images
  - Select location on map
  - Track issue status
  - Rate completed services

#### Technician Account
- **Phone**: 9876543210
- **Password**: tech123
- **Features to test**:
  - View assigned jobs
  - Accept/reject jobs
  - Schedule appointments
  - Complete jobs with images
  - Browse spare parts shop
  - Place orders

#### Admin Account
- **Phone**: 5555555555
- **Password**: admin123
- **Features to test**:
  - View dashboard statistics
  - Assign technicians to issues
  - Verify technicians
  - Manage inventory
  - Use technician finder algorithm

## Feature Testing Checklist

### Customer Features

1. **Registration & Login**
   - [ ] Register new customer account
   - [ ] Login with credentials
   - [ ] View dashboard

2. **Create Service Request**
   - [ ] Select appliance type
   - [ ] Enter description
   - [ ] Upload issue images
   - [ ] Search for address (autocomplete)
   - [ ] Select location on map
   - [ ] Submit request

3. **Track Service Request**
   - [ ] View request details
   - [ ] See assigned technician
   - [ ] View scheduled date/time
   - [ ] See completion details
   - [ ] Rate the service

4. **Notifications**
   - [ ] Receive real-time notifications
   - [ ] Mark notifications as read

### Technician Features

1. **Registration & Login**
   - [ ] Register with skills and working areas
   - [ ] Upload government ID
   - [ ] Login after verification

2. **Job Management**
   - [ ] View assigned jobs
   - [ ] Accept job
   - [ ] Schedule appointment
   - [ ] Start job
   - [ ] Upload completion images (min 3)
   - [ ] Add work summary and cost
   - [ ] Complete job

3. **Spare Parts**
   - [ ] Browse spare parts
   - [ ] Search by category
   - [ ] Add items to cart
   - [ ] Adjust quantities
   - [ ] Place order
   - [ ] Track order status

4. **Profile**
   - [ ] View ratings
   - [ ] View completed jobs
   - [ ] Update profile information

### Admin Features

1. **Dashboard**
   - [ ] View statistics
   - [ ] See pending issues count
   - [ ] Monitor active jobs

2. **Issue Management**
   - [ ] View all issues
   - [ ] Filter by status
   - [ ] Assign technician to issue
   - [ ] View issue details

3. **Technician Management**
   - [ ] View all technicians
   - [ ] Filter by verification status
   - [ ] Verify new technicians
   - [ ] Block/unblock technicians

4. **User Management**
   - [ ] View all users
   - [ ] Filter by role
   - [ ] View user details

5. **Inventory Management**
   - [ ] View spare parts
   - [ ] Create new spare part
   - [ ] Edit spare part details
   - [ ] Delete spare part
   - [ ] Monitor stock levels

6. **Find Technicians**
   - [ ] Enter issue ID
   - [ ] View matched technicians
   - [ ] See matching score
   - [ ] Assign technician

## Mobile Testing

### Responsive Design
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1024px+)

### Mobile Navigation
- Customer/Technician: Bottom navigation bar
- Admin: Full sidebar (desktop) or hamburger menu (mobile)

### Touch Interactions
- [ ] Test touch scrolling
- [ ] Test button taps
- [ ] Test form inputs
- [ ] Test file uploads
- [ ] Test map interactions

## Real-time Features Testing

### Socket.IO Testing
1. Open two browser windows
2. Login as customer in one, admin in another
3. Create issue as customer
4. Verify admin receives notification
5. Assign technician as admin
6. Verify customer receives notification

### Notification Testing
- [ ] Browser notifications (allow permissions)
- [ ] In-app notifications
- [ ] Notification badge counter
- [ ] Mark as read functionality

## Map Features Testing

### Location Picker
- [ ] Click on map to select location
- [ ] Marker updates on click
- [ ] Coordinates update correctly

### Address Autocomplete
- [ ] Type address in search box
- [ ] See autocomplete suggestions
- [ ] Select address from list
- [ ] Map updates to selected location

## Error Handling Testing

### Form Validation
- [ ] Submit empty form
- [ ] Enter invalid phone number
- [ ] Enter mismatched passwords
- [ ] Upload invalid file types

### API Error Handling
- [ ] Test with invalid credentials
- [ ] Test with expired token
- [ ] Test network errors
- [ ] Verify error messages display

### Loading States
- [ ] Verify loading spinners
- [ ] Test button loading states
- [ ] Test page loading states

## Performance Testing

### Page Load Times
- [ ] Initial load < 3 seconds
- [ ] Navigation between pages < 1 second
- [ ] API calls complete quickly

### Image Optimization
- [ ] Images load progressively
- [ ] Thumbnails load before full images
- [ ] No layout shift during load

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Common Issues & Solutions

### Issue: Maps not loading
**Solution**: Check if Leaflet CSS is imported in index.css

### Issue: Socket connection fails
**Solution**: 
1. Verify backend server is running
2. Check VITE_SOCKET_URL in .env
3. Ensure CORS is configured correctly

### Issue: File upload fails
**Solution**: 
1. Check file size (max 20MB)
2. Verify file type (images only)
3. Check backend multer configuration

### Issue: Location autocomplete not working
**Solution**: 
1. Verify internet connection
2. Nominatim API may be rate limited
3. Try again after a few seconds

## Development Tips

### Hot Module Replacement (HMR)
- Changes to components auto-reload
- State persists across HMR updates
- Clear cache if issues occur

### TypeScript Errors
```bash
# Check for TypeScript errors
npm run build
```

### Linting
```bash
# Run ESLint
npm run lint
```

### Clean Install
```bash
# If experiencing issues, try:
rm -rf node_modules package-lock.json
npm install
```

## Production Build Testing

### Build the Application
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Check Build Output
- Verify bundle size
- Check for console errors
- Test all features in production mode

## Next Steps

1. **Testing**: Run through all features in checklist
2. **Bug Reports**: Document any issues found
3. **Feedback**: Share user experience feedback
4. **Enhancement Ideas**: Suggest improvements

## Support

For issues or questions:
- Check documentation in README_FRONTEND.md
- Review code comments
- Contact development team

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Leaflet Documentation](https://leafletjs.com)
- [Socket.IO Documentation](https://socket.io)
