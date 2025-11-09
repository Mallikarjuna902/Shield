import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  createAlert, 
  getRecentAlerts, 
  markAlertAsRead, 
  subscribeToAlerts,
  cleanupAllAlertListeners
} from '../services/alertService';

export const useAlerts = (userId = null, initialLimit = 10) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Store the latest alerts in a ref to avoid dependency issues
  const alertsRef = useRef([]);
  
  // Update the ref whenever alerts change
  useEffect(() => {
    alertsRef.current = alerts;
  }, [alerts]);

  // Load initial alerts
  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const recentAlerts = await getRecentAlerts(userId, initialLimit);
      setAlerts(recentAlerts);
      setError(null);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [userId, initialLimit]);

  // Set up real-time subscription
  useEffect(() => {
    // Initial load
    loadAlerts();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToAlerts(
      (updatedAlerts) => {
        setAlerts(updatedAlerts);
      },
      { 
        limit: initialLimit,
        userId: userId 
      }
    );

    // Clean up subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [userId, initialLimit, loadAlerts]);
  
  // Clean up all listeners on unmount
  useEffect(() => {
    return () => {
      cleanupAllAlertListeners();
    };
  }, []);

  // Add a new alert
  const addAlert = useCallback(async (alertData) => {
    try {
      const alertId = await createAlert({
        ...alertData,
        userId: alertData.userId || userId,
      });
      // Refresh the alerts list
      await loadAlerts();
      return alertId;
    } catch (err) {
      console.error('Failed to create alert:', err);
      throw err;
    }
  }, [userId, loadAlerts]);

  // Mark an alert as read
  const markAsRead = useCallback(async (alertId) => {
    try {
      await markAlertAsRead(alertId);
      setAlerts(prevAlerts =>
        prevAlerts.map(alert =>
          alert.id === alertId ? { ...alert, read: true } : alert
        )
      );
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
      throw err;
    }
  }, []);

  // Mark all alerts as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadAlerts = alerts.filter(alert => !alert.read);
      await Promise.all(unreadAlerts.map(alert => markAlertAsRead(alert.id)));
      
      setAlerts(prevAlerts =>
        prevAlerts.map(alert => ({
          ...alert,
          read: true
        }))
      );
    } catch (err) {
      console.error('Failed to mark all alerts as read:', err);
      throw err;
    }
  }, [alerts]);

  return {
    alerts,
    loading,
    error,
    addAlert,
    markAsRead,
    markAllAsRead,
    refresh: loadAlerts,
  };
};
