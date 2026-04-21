/**
 * Mock Notification Service (Firebase Placeholder)
 */
export const sendNotification = (userId, message) => {
  // In a real application, you would initialize Firebase Admin SDK here
  // and send a push notification to the user's FCM token.
  console.log(`[FIREBASE_MOCK] Sending Notification to User ${userId}: ${message}`);
};
