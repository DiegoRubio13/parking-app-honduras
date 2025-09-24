# Quick Reference Guide - UX/UI Enhancements

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Optional but recommended for offline mode
npm install @react-native-community/netinfo
```

### 2. Wrap App with Toast Provider
```typescript
// App.tsx
import { ToastProvider } from './src/components/ui/ToastProvider';

export default function App() {
  return (
    <ToastProvider>
      {/* Your app */}
    </ToastProvider>
  );
}
```

### 3. Initialize Services
```typescript
// App.tsx
import { notificationService } from './src/services/notificationService';
import { offlineService } from './src/services/offlineService';

useEffect(() => {
  notificationService.initialize();
  offlineService.initialize();
}, []);
```

---

## 📋 Common Use Cases

### Error Handling
```typescript
import { handleError } from './src/utils';

try {
  await createParkingSession(data);
} catch (error) {
  handleError(error, 'Create Session');
}
```

### Form Validation
```typescript
import Validator, { validationRules } from './src/utils/validation';

const validateForm = () => {
  const { isValid, errors } = Validator.validateForm({
    email: {
      value: email,
      rules: [validationRules.required(), validationRules.email()]
    }
  });

  if (!isValid) {
    // Show errors
  }
};
```

### User Feedback
```typescript
import { showSuccess, showError, showConfirm } from './src/utils';

// Success toast
showSuccess('Session created!');

// Error toast
showError('Payment failed');

// Confirmation
showConfirm(
  'Delete Session',
  'Are you sure?',
  () => deleteSession()
);
```

### Loading States
```typescript
import { LoadingState, CardSkeleton } from './src/components/ui';

{isLoading ? (
  <LoadingState message="Loading..." />
) : (
  <Content data={data} />
)}

// Or skeleton
{isLoading ? <CardSkeleton count={3} /> : <Cards />}
```

### Date Filtering
```typescript
import { DateFilter } from './src/components/DateFilter';

<DateFilter
  onDateRangeChange={(range) => fetchData(range)}
  showQuickFilters={true}
/>
```

### Notifications
```typescript
import { notificationService } from './src/services/notificationService';

// Local notification
await notificationService.sendLocalNotification({
  type: 'parking',
  title: 'Session Started',
  body: 'Your parking session has begun'
});

// Schedule reminder
await notificationService.scheduleParkingReminder(
  expirationDate,
  sessionId,
  15 // minutes before
);
```

### Offline Mode
```typescript
import { offlineService, useOfflineStatus } from './src/services/offlineService';

// React hook
const isOnline = useOfflineStatus();

// Cache data
await offlineService.cacheData('key', data, 3600000);

// Get cached
const cached = await offlineService.getCachedData('key');

// Queue offline action
await offlineService.queueAction('CREATE_SESSION', data);
```

### Performance
```typescript
import { useDebounce, useThrottle } from './src/utils';

// Debounce search
const debouncedSearch = useDebounce(searchTerm, 500);

// Throttle scroll
const throttledScroll = useThrottle(scrollPosition, 200);
```

---

## 🎨 Component Imports

### All at Once
```typescript
// Utils
import {
  handleError,
  Validator,
  validationRules,
  showSuccess,
  showError,
  useDebounce
} from './src/utils';

// UI Components
import {
  LoadingState,
  Skeleton,
  CardSkeleton,
  Toast,
  ConfirmDialog,
  ToastProvider
} from './src/components/ui';

// Services
import { notificationService } from './src/services/notificationService';
import { offlineService } from './src/services/offlineService';

// Components
import { DateFilter } from './src/components/DateFilter';
```

---

## 🔧 Configuration

### Notification Service
```typescript
// Update project ID in notificationService.ts
const tokenData = await Notifications.getExpoPushTokenAsync({
  projectId: 'your-expo-project-id' // <-- Update this
});
```

### Offline Service
```typescript
// Install NetInfo for full functionality
npm install @react-native-community/netinfo

// Then it will automatically detect network status
```

---

## 📝 TypeScript Types

```typescript
// Error handling
import { AppError, ErrorType } from './src/utils/errorHandler';

// Validation
import { ValidationResult, ValidationRule } from './src/utils/validation';

// Feedback
import { FeedbackType } from './src/utils/feedbackManager';
import { ToastType } from './src/components/ui/Toast';

// Date filter
import { DateRange } from './src/components/DateFilter';
```

---

## 🎯 Best Practices

1. **Always use error handler** in async operations
2. **Validate forms** before submission
3. **Show loading states** during data fetching
4. **Provide feedback** for user actions
5. **Cache data** for offline support
6. **Debounce user input** for performance
7. **Use confirmation dialogs** for destructive actions

---

## 📚 Full Documentation

See `/src/UX_UI_ENHANCEMENTS.md` for complete documentation.

---

*Quick Reference - Agent 8 UX/UI Enhancements*