---
name: react-native-firebase
description: Firebase services configuration and usage patterns for React Native
---

## Firebase Services

All Firebase services are pre-configured in the app. Import and use them as follows:

### Firebase Auth

```typescript
import auth from '@react-native-firebase/auth';

const signIn = async (email: string, password: string) => {
  const userCredential = await auth().signInWithEmailAndPassword(
    email,
    password,
  );
  return userCredential.user;
};

const signOut = async () => {
  await auth().signOut();
};

const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return auth().onAuthStateChanged(callback);
};

const createUserWithEmailAndPassword = async (
  email: string,
  password: string,
) => {
  const userCredential = await auth().createUserWithEmailAndPassword(
    email,
    password,
  );
  return userCredential.user;
};

const sendPasswordResetEmail = async (email: string) => {
  await auth().sendPasswordResetEmail(email);
};

const updateProfile = async (profile: {
  displayName?: string;
  photoURL?: string;
}) => {
  const user = auth().currentUser;
  if (user) {
    await user.updateProfile(profile);
  }
};
```

### Firestore

```typescript
import firestore from '@react-native-firebase/firestore';

const getAppointments = async (userId: string) => {
  const snapshot = await firestore()
    .collection('appointments')
    .where('userId', '==', userId)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const createAppointment = async (data: AppointmentData) => {
  const docRef = await firestore()
    .collection('appointments')
    .add({
      ...data,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  return docRef.id;
};

const updateAppointment = async (
  id: string,
  data: Partial<AppointmentData>,
) => {
  await firestore().collection('appointments').doc(id).update(data);
};

const deleteAppointment = async (id: string) => {
  await firestore().collection('appointments').doc(id).delete();
};

const getDoc = async (collection: string, id: string) => {
  const doc = await firestore().collection(collection).doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

// Real-time listener
const subscribeToAppointments = (
  userId: string,
  callback: (appointments: Appointment[]) => void,
) => {
  return firestore()
    .collection('appointments')
    .where('userId', '==', userId)
    .onSnapshot((snapshot) => {
      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(appointments);
    });
};

// Batch operations
const batchWrite = async (operations: WriteOperation[]) => {
  const batch = firestore().batch();

  operations.forEach((op) => {
    const docRef = firestore().collection(op.collection).doc(op.id);
    if (op.type === 'set') {
      batch.set(docRef, op.data);
    } else if (op.type === 'update') {
      batch.update(docRef, op.data);
    } else if (op.type === 'delete') {
      batch.delete(docRef);
    }
  });

  await batch.commit();
};
```

### Cloud Functions

```typescript
import functions from '@react-native-firebase/functions';

const callFunction = async (functionName: string, data?: object) => {
  const httpsCallable = functions().httpsCallable(functionName);
  const result = await httpsCallable(data);
  return result.data;
};

// Example: send notification
await callFunction('sendPushNotification', {
  userId: 'user-123',
  title: 'Appointment Reminder',
  body: 'Your appointment is in 1 hour',
});

// Using region
const callFunctionWithRegion = async (functionName: string, data?: object) => {
  const httpsCallable = functions().httpsCallable(functionName);
  const result = await httpsCallable(data);
  return result.data;
};

// Callable with timeout
const callFunctionWithTimeout = async (functionName: string, data?: object) => {
  const httpsCallable = functions().httpsCallable(functionName);
  const result = await httpsCallable(data);
  return result.data;
};
```

### Crashlytics

```typescript
import crashlytics from '@react-native-firebase/crashlytics';

const logError = (error: Error, context?: object) => {
  crashlytics().recordError(error);
  crashlytics().log(`Error in ${context}: ${error.message}`);
};

const setUserIdentifier = (userId: string) => {
  crashlytics().setUserId(userId);
};

const logCustomKey = (key: string, value: string) => {
  crashlytics().setAttribute(key, value);
};

const logMessage = (message: string) => {
  crashlytics().log(message);
};

const setCrashlyticsCollectionEnabled = (enabled: boolean) => {
  crashlytics().setCrashlyticsCollectionEnabled(enabled);
};

// Using with try-catch
try {
  await riskyOperation();
} catch (error) {
  crashlytics().recordError(error);
  throw error;
}
```

### Analytics

```typescript
import analytics from '@react-native-firebase/analytics';

const logScreenView = async (screenName: string) => {
  await analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenName,
  });
};

const logEvent = async (eventName: string, params?: object) => {
  await analytics().logEvent(eventName, params);
};

// Predefined events
await analytics().logSignUp({ method: 'email' });
await analytics().logLogin({ method: 'email' });
await analytics().logPurchase({ currency: 'USD', value: 29.99 });
await analytics().logAddToCart({
  currency: 'USD',
  value: 10.0,
  item_id: 'item_123',
});
await analytics().logBeginCheckout({ currency: 'USD', value: 50.0 });
await analytics().logSearch({ search_term: 'haircut' });

// User properties
await analytics().setUserProperty('is_premium', 'true');
await analytics().setUserId('user_123');

// Reset analytics
await analytics().resetAnalyticsData();
```

### Messaging

```typescript
import messaging from '@react-native-firebase/messaging';

const requestPermission = async () => {
  const authorizationStatus = await messaging().requestPermission();
  return authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED;
};

const getToken = async () => {
  return await messaging().getToken();
};

const onMessageReceived = (callback: (message: RemoteMessage) => void) => {
  return messaging().onMessage(callback);
};

const onNotificationOpenedApp = (
  callback: (message: RemoteMessage) => void,
) => {
  return messaging().onNotificationOpenedApp(callback);
};

const getInitialNotification = async () => {
  const message = await messaging().getInitialNotification();
  return message;
};

// Topic subscription
const subscribeToTopic = async (topic: string) => {
  await messaging().subscribeToTopic(topic);
};

const unsubscribeFromTopic = async (topic: string) => {
  await messaging().unsubscribeFromTopic(topic);
};

// Channel configuration for Android
const setupNotificationChannel = () => {
  // Handled automatically by react-native-firebase
};
```

### Remote Config

```typescript
import remoteConfig from '@react-native-firebase/remote-config';

const initializeRemoteConfig = async () => {
  await remoteConfig().setDefaults({
    enable_promotions: true,
    max_booking_days: 30,
    cancellation_hours: 24,
    app_version: '1.0.0',
  });
  await remoteConfig().fetchAndActivate();
};

const fetchConfig = async () => {
  // Fetch with expiration
  await remoteConfig().fetch(3600); // 1 hour cache
  await remoteConfig().activate();
};

const getConfigValue = (key: string): string | boolean | number => {
  return (
    remoteConfig().getValue(key).asNumber() ||
    remoteConfig().getValue(key).asBoolean() ||
    remoteConfig().getValue(key).asString()
  );
};

const getAllConfig = () => {
  return remoteConfig().getAll();
};
```
