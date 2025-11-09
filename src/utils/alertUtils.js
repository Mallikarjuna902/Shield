// Utility functions for generating alerts from threat data

// Cache for generated alerts to ensure consistency
let alertsCache = null;
let cacheKey = null;

export const generateAlertsFromThreatData = (users) => {
  // Create a cache key based on user data
  const currentCacheKey = JSON.stringify(users.map(u => ({ id: u.user_id, features: u.features })));
  
  // Return cached alerts if the data hasn't changed
  if (alertsCache && cacheKey === currentCacheKey) {
    return alertsCache;
  }
  const alerts = [];
  let alertId = 1;

  users.forEach((user, userIndex) => {
    const features = user.features || {};
    const riskLevel = user.risk_level;
    
    // Use user index to make timestamps deterministic
    const baseTime = Date.now() - (userIndex * 60 * 60 * 1000); // 1 hour apart
    
    // Generate alerts based on user's risk factors
    if (features.accessed_decoy > 0) {
      alerts.push({
        id: alertId++,
        timestamp: new Date(baseTime - (0 * 30 * 60 * 1000)).toLocaleString(), // Most recent
        user: user.user_id,
        event: 'Honeytoken access detected',
        severity: 'high',
        score: '0.98',
        description: 'User accessed a decoy file, indicating potential insider threat activity.',
        riskFactors: ['Decoy file access', 'Suspicious behavior pattern'],
        anomalyScore: user.anomaly_score
      });
    }

    if (features.after_hours_logons > 50) {
      alerts.push({
        id: alertId++,
        timestamp: new Date(baseTime - (1 * 30 * 60 * 1000)).toLocaleString(), // 30 min later
        user: user.user_id,
        event: 'Excessive after-hours activity',
        severity: 'high',
        score: Math.abs(user.anomaly_score).toFixed(2),
        description: `User has ${features.after_hours_logons} after-hours logons, significantly above normal patterns.`,
        riskFactors: ['After-hours activity', 'Unusual timing patterns'],
        anomalyScore: user.anomaly_score
      });
    }

    if (features.files_to_removable > 10) {
      alerts.push({
        id: alertId++,
        timestamp: new Date(baseTime - (2 * 30 * 60 * 1000)).toLocaleString(), // 1 hour later
        user: user.user_id,
        event: 'Large data transfer to removable media',
        severity: 'high',
        score: Math.abs(user.anomaly_score).toFixed(2),
        description: `User transferred ${features.files_to_removable} files to removable media, indicating potential data exfiltration.`,
        riskFactors: ['Removable media usage', 'Data exfiltration risk'],
        anomalyScore: user.anomaly_score
      });
    }

    if (features.unique_devices_logon > 10) {
      alerts.push({
        id: alertId++,
        timestamp: new Date(baseTime - (3 * 30 * 60 * 1000)).toLocaleString(), // 1.5 hours later
        user: user.user_id,
        event: 'Multiple device access pattern',
        severity: 'medium',
        score: Math.abs(user.anomaly_score).toFixed(2),
        description: `User accessed ${features.unique_devices_logon} different devices, showing unusual access patterns.`,
        riskFactors: ['Multiple device access', 'Unusual access patterns'],
        anomalyScore: user.anomaly_score
      });
    }

    if (features.weekend_logons > 5) {
      alerts.push({
        id: alertId++,
        timestamp: new Date(baseTime - (4 * 30 * 60 * 1000)).toLocaleString(), // 2 hours later
        user: user.user_id,
        event: 'Abnormal working hours activity',
        severity: riskLevel === 'High' ? 'medium' : 'low',
        score: Math.abs(user.anomaly_score).toFixed(2),
        description: `User has ${features.weekend_logons} weekend logons, indicating unusual work patterns.`,
        riskFactors: ['Weekend activity', 'Unusual timing patterns'],
        anomalyScore: user.anomaly_score
      });
    }

    if (features.after_hours_emails > 30) {
      alerts.push({
        id: alertId++,
        timestamp: new Date(baseTime - (5 * 30 * 60 * 1000)).toLocaleString(), // 2.5 hours later
        user: user.user_id,
        event: 'Unusual email activity pattern',
        severity: 'medium',
        score: Math.abs(user.anomaly_score).toFixed(2),
        description: `User sent ${features.after_hours_emails} emails after hours, showing unusual communication patterns.`,
        riskFactors: ['After-hours email activity', 'Communication anomalies'],
        anomalyScore: user.anomaly_score
      });
    }
  });

  // Sort by timestamp (most recent first) and limit to 10
  const sortedAlerts = alerts
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
  
  // Cache the results
  alertsCache = sortedAlerts;
  cacheKey = currentCacheKey;
  
  return sortedAlerts;
};

export const findAlertById = (alertId, users) => {
  const alerts = generateAlertsFromThreatData(users);
  return alerts.find(alert => alert.id === parseInt(alertId));
};

export const clearAlertsCache = () => {
  alertsCache = null;
  cacheKey = null;
};
