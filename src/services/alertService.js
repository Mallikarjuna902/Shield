import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where, 
  updateDoc, 
  doc, 
  getCountFromServer,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

const ALERTS_COLLECTION = 'alerts';
const MAX_ALERTS = 100; // Maximum number of alerts to keep

// Store active listeners
const alertListeners = new Map();

/**
 * Create a new alert in Firestore
 * @param {Object} alertData - The alert data to store
 * @param {string} alertData.type - The type of alert (e.g., 'login_attempt', 'file_access')
 * @param {string} alertData.severity - The severity level ('low', 'medium', 'high', 'critical')
 * @param {string} alertData.message - A descriptive message about the alert
 * @param {string} [alertData.userId] - Optional user ID associated with the alert
 * @param {Object} [alertData.metadata] - Additional metadata about the alert
 * @returns {Promise<string>} The ID of the created alert document
 */
export const createAlert = async ({
  type,
  severity = 'medium',
  message,
  userId = null,
  metadata = {}
}) => {
  try {
    const alertRef = await addDoc(collection(db, ALERTS_COLLECTION), {
      type,
      severity,
      message,
      userId,
      metadata,
      read: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Clean up old alerts if we exceed the maximum
    await cleanupOldAlerts();
    
    return alertRef.id;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

/**
 * Get recent alerts, optionally filtered by user ID
 * @param {string} [userId] - Optional user ID to filter alerts
 * @param {number} [limitCount=20] - Maximum number of alerts to return
 * @returns {Promise<Array>} Array of alert documents
 */
export const getRecentAlerts = async (userId = null, limitCount = 20) => {
  try {
    let q = query(
      collection(db, ALERTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (userId) {
      q = query(q, where('userId', '==', userId));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

/**
 * Mark an alert as read
 * @param {string} alertId - The ID of the alert to update
 * @returns {Promise<void>}
 */
export const markAlertAsRead = async (alertId) => {
  try {
    await updateDoc(doc(db, ALERTS_COLLECTION, alertId), {
      read: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for alerts
 * @param {Function} callback - Function to call with updated alerts
 * @param {Object} options - Options for the subscription
 * @param {number} [options.limit=20] - Maximum number of alerts to return
 * @param {string} [options.userId] - Optional user ID to filter alerts
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAlerts = (callback, { limit: limitCount = 20, userId } = {}) => {
  let q = query(
    collection(db, ALERTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  if (userId) {
    q = query(q, where('userId', '==', userId));
  }

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const alerts = [];
    querySnapshot.forEach((doc) => {
      alerts.push({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to JavaScript Date
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt,
      });
    });
    callback(alerts);
  }, (error) => {
    console.error('Error in alerts subscription:', error);
  });

  // Store the unsubscribe function
  const listenerId = `alerts_${Date.now()}`;
  alertListeners.set(listenerId, unsubscribe);

  // Return cleanup function
  return () => {
    if (alertListeners.has(listenerId)) {
      alertListeners.get(listenerId)();
      alertListeners.delete(listenerId);
    }
  };
};

/**
 * Clean up all active alert listeners
 */
export const cleanupAllAlertListeners = () => {
  alertListeners.forEach(unsubscribe => unsubscribe());
  alertListeners.clear();
};

/**
 * Clean up old alerts to prevent the collection from growing too large
 * @private
 */
const cleanupOldAlerts = async () => {
  try {
    // Get the total count of alerts
    const countQuery = query(collection(db, ALERTS_COLLECTION));
    const snapshot = await getCountFromServer(countQuery);
    
    if (snapshot.data().count <= MAX_ALERTS) {
      return; // No need to clean up yet
    }

    // Get the oldest alerts to delete
    const oldestQuery = query(
      collection(db, ALERTS_COLLECTION),
      orderBy('createdAt', 'asc'),
      limit(snapshot.data().count - MAX_ALERTS + 50) // Keep some buffer
    );
    
    const oldestSnapshot = await getDocs(oldestQuery);
    const batch = writeBatch(db);
    
    oldestSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error cleaning up old alerts:', error);
    // Don't throw, as this is a background task
  }
};
