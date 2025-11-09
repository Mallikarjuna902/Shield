import React, { createContext, useContext, useState, useEffect } from 'react';
import { clearAlertsCache } from '../utils/alertUtils';

const ThreatContext = createContext();

export const useThreat = () => {
  const context = useContext(ThreatContext);
  if (!context) {
    throw new Error('useThreat must be used within a ThreatProvider');
  }
  return context;
};

export const ThreatProvider = ({ children }) => {
  const [threatData, setThreatData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [threatSummary, setThreatSummary] = useState({
    totalUsers: 0,
    anomalies: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    anomalyRate: 0
  });

  // Update threat summary when data changes
  useEffect(() => {
    if (threatData?.results?.summary) {
      const summary = threatData.results.summary;
      setThreatSummary({
        totalUsers: summary.total_users || 0,
        anomalies: summary.anomalies_detected || 0,
        highRisk: summary.risk_distribution?.High || 0,
        mediumRisk: summary.risk_distribution?.Medium || 0,
        lowRisk: summary.risk_distribution?.Low || 0,
        anomalyRate: summary.anomaly_rate || 0
      });
      setLastAnalysis(new Date().toISOString());
    }
  }, [threatData]);

  const updateThreatData = (data) => {
    clearAlertsCache(); // Clear cache when new data is loaded
    setThreatData(data);
  };

  const clearThreatData = () => {
    clearAlertsCache(); // Clear cache when data is cleared
    setThreatData(null);
    setThreatSummary({
      totalUsers: 0,
      anomalies: 0,
      highRisk: 0,
      mediumRisk: 0,
      lowRisk: 0,
      anomalyRate: 0
    });
    setLastAnalysis(null);
  };

  const getHighRiskUsers = () => {
    if (!threatData?.results?.users) return [];
    return threatData.results.users.filter(user => user.risk_level === 'High');
  };

  const getRecentAnomalies = () => {
    if (!threatData?.results?.users) return [];
    return threatData.results.users
      .filter(user => user.prediction === 'Anomaly')
      .sort((a, b) => a.anomaly_score - b.anomaly_score)
      .slice(0, 5);
  };

  const value = {
    threatData,
    isAnalyzing,
    setIsAnalyzing,
    lastAnalysis,
    threatSummary,
    updateThreatData,
    clearThreatData,
    getHighRiskUsers,
    getRecentAnomalies,
    hasData: !!(threatData && threatData.results)
  };

  return (
    <ThreatContext.Provider value={value}>
      {children}
    </ThreatContext.Provider>
  );
};
