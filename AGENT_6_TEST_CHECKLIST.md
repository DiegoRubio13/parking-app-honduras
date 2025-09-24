# Agent 6: Emergency Services - Test Checklist

## Pre-Testing Setup
- [ ] Install dependencies: `npm install`
- [ ] Ensure expo-location is installed
- [ ] Test on physical device (not simulator for GPS/calling)
- [ ] Grant location permissions when prompted

## Task 18: Real Emergency Calls
### SOSServicesScreen
- [ ] Navigate to SOS Services screen
- [ ] Verify panic button is visible
- [ ] Click panic button
  - [ ] Confirm 5-second countdown appears
  - [ ] Verify countdown numbers display (5, 4, 3, 2, 1)
  - [ ] Test cancel button during countdown
  - [ ] Verify countdown cancels and shows alert
- [ ] Click panic button again
  - [ ] Let countdown reach 0
  - [ ] Verify 911 call is initiated
- [ ] Test direct 911 call button
  - [ ] Click "Llamar a 911" button
  - [ ] Verify confirmation dialog appears
  - [ ] Confirm and verify call is initiated

## Task 19: GPS in Emergencies
### EmergencyRequestScreen
- [ ] Navigate to Emergency Request screen
- [ ] Verify location is auto-detected
  - [ ] Check loading indicator appears
  - [ ] Verify address displays after loading
  - [ ] Verify GPS coordinates display
- [ ] Test location refresh
  - [ ] Click "Actualizar ubicación"
  - [ ] Verify location updates
- [ ] Test without location permission
  - [ ] Deny permission
  - [ ] Verify error message displays
- [ ] Test in different locations
  - [ ] Indoor vs outdoor
  - [ ] Moving vs stationary

### SOSServicesScreen
- [ ] Verify current location is captured on mount
- [ ] Check location is included in emergency call logs

## Task 20: Emergency History
### EmergencyHistoryScreen
- [ ] Navigate to Emergency History screen
- [ ] Verify filter buttons display (All, Pending, Completed, Cancelled)
- [ ] Test "All" filter
  - [ ] Verify all requests display
- [ ] Test "Pending" filter
  - [ ] Verify only pending requests show
- [ ] Test "Completed" filter
  - [ ] Verify only completed requests show
- [ ] Test "Cancelled" filter
  - [ ] Verify only cancelled requests show
- [ ] Verify request cards show:
  - [ ] Service type with icon
  - [ ] Status badge with correct color
  - [ ] Location information
  - [ ] Timestamp
  - [ ] Vehicle info (if available)
  - [ ] Price (if available)
  - [ ] Rating (if available)
- [ ] Test empty states
  - [ ] Verify message when no requests
  - [ ] Verify message for filtered empty results
- [ ] Test card interaction
  - [ ] Click on request card
  - [ ] Verify navigation to detail screen

## Task 21: Emergency Contacts
### EmergencyContactsScreen
- [ ] Navigate to Emergency Contacts screen
- [ ] Test add contact flow
  - [ ] Click add button (+)
  - [ ] Fill in contact name
  - [ ] Fill in phone number
  - [ ] Select relationship
  - [ ] Click save
  - [ ] Verify contact appears in list
- [ ] Test contact display
  - [ ] Verify name displays
  - [ ] Verify phone displays
  - [ ] Verify relationship displays
  - [ ] Verify call button displays
  - [ ] Verify delete button displays
- [ ] Test call contact
  - [ ] Click "Llamar" button
  - [ ] Verify phone app opens with number
- [ ] Test delete contact
  - [ ] Click delete button
  - [ ] Verify confirmation dialog
  - [ ] Confirm deletion
  - [ ] Verify contact removed from list
- [ ] Test emergency numbers section
  - [ ] Click 911 button
  - [ ] Verify call initiated
  - [ ] Click 199 (Bomberos)
  - [ ] Verify call initiated
  - [ ] Click 198 (Policía)
  - [ ] Verify call initiated
- [ ] Test empty state
  - [ ] Delete all contacts
  - [ ] Verify empty state message

## Enhanced Features Testing
### Panic Button
- [ ] Countdown visual
  - [ ] Circle displays correctly
  - [ ] Number is large and readable
  - [ ] Color is appropriate (red)
- [ ] Cancel functionality
  - [ ] Cancel button is prominent
  - [ ] Cancellation works at any point
  - [ ] Alert confirms cancellation

### GPS Features
- [ ] Permission handling
  - [ ] First-time request
  - [ ] Denied permission scenario
  - [ ] Granted permission scenario
- [ ] Accuracy
  - [ ] Indoor accuracy test
  - [ ] Outdoor accuracy test
  - [ ] Moving vehicle test
- [ ] Reverse geocoding
  - [ ] Address displays correctly
  - [ ] Falls back to coordinates if no address

### UI/UX
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Empty states display correctly
- [ ] All icons display correctly
- [ ] All colors match theme
- [ ] All text is in Spanish
- [ ] All buttons are touch-friendly
- [ ] Navigation works correctly

## Integration Testing
- [ ] Navigate between all emergency screens
- [ ] Test back button on all screens
- [ ] Test navigation from SOS Services to:
  - [ ] Emergency Request
  - [ ] Emergency History
  - [ ] Emergency Contacts
- [ ] Verify data persists across navigation

## Platform-Specific Testing
### iOS
- [ ] Location permissions dialog
- [ ] Call functionality
- [ ] Status bar handling
- [ ] Safe area handling

### Android
- [ ] Location permissions dialog
- [ ] Call functionality
- [ ] Back button handling
- [ ] Safe area handling

## Performance Testing
- [ ] Location fetch speed
- [ ] Screen load times
- [ ] List scrolling performance
- [ ] No memory leaks

## Edge Cases
- [ ] No internet connection
- [ ] Airplane mode
- [ ] Low battery
- [ ] Background/foreground transitions
- [ ] App restart with active emergency
- [ ] Invalid phone numbers
- [ ] Special characters in contact names
- [ ] Very long contact names
- [ ] Very long addresses

## Security & Privacy
- [ ] Location only captured during emergencies
- [ ] Permissions requested appropriately
- [ ] User can deny and app handles gracefully
- [ ] Emergency data encrypted in Firebase
- [ ] Call logs show correct timestamps

## Accessibility
- [ ] Screen reader compatibility
- [ ] Large text support
- [ ] Color contrast
- [ ] Touch target sizes

## Pass Criteria
All checklist items must pass for Agent 6 implementation to be considered complete and production-ready.

## Notes
- Record any bugs or issues found
- Document any unexpected behavior
- Note any performance concerns
- Suggest any UX improvements
