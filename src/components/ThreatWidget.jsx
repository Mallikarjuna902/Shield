import React from 'react';
import { AlertTriangle, Shield, Users, TrendingUp, Brain } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useThreat } from '../contexts/ThreatContext';
import { Link } from 'react-router-dom';

const ThreatWidget = ({ className = "" }) => {
  const { threatSummary, lastAnalysis, hasData, getHighRiskUsers } = useThreat();

  if (!hasData) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            AI Threat Analytics
          </h3>
          <div className="flex gap-2">
            {threatSummary?.file_type && (
              <Badge variant="outline" className="text-blue-400 border-blue-400/30 text-xs">
                {threatSummary.file_type}
              </Badge>
            )}
            <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
              {hasData ? 'Active' : 'Ready'}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          No threat analysis data available. Visit the Threat Detection page to start monitoring.
        </p>
      </Card>
    );
  }

  const highRiskUsers = getHighRiskUsers();
  const riskLevel = threatSummary.anomalyRate > 20 ? 'high' : threatSummary.anomalyRate > 10 ? 'medium' : 'low';

  return (
    <Card className={`bg-slate-800/50 border-slate-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-medium text-white">AI Threat Detection</h3>
          {threatSummary?.file_type && (
            <Badge variant="outline" className="text-blue-400 border-blue-400/30 text-xs">
              {threatSummary.file_type}
            </Badge>
          )}
        </div>
        <Badge 
          variant="outline" 
          className={`text-xs ${
            riskLevel === 'high' 
              ? 'text-red-400 border-red-500/20 bg-red-500/10' 
              : riskLevel === 'medium'
              ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10'
              : 'text-green-400 border-green-500/20 bg-green-500/10'
          }`}
        >
          {riskLevel === 'high' ? 'High Risk' : riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Anomalies</p>
              <p className="text-lg font-semibold text-red-400">{threatSummary.anomalies}</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
        </div>
        
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Total Users</p>
              <p className="text-lg font-semibold text-slate-300">{threatSummary.totalUsers}</p>
            </div>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Risk Distribution</span>
          <span className="text-xs text-slate-400">{threatSummary.anomalyRate.toFixed(1)}% anomaly rate</span>
        </div>
        <div className="flex space-x-1 h-2 bg-slate-900/50 rounded-full overflow-hidden">
          <div 
            className="bg-red-500 transition-all duration-300"
            style={{ width: `${(threatSummary.highRisk / threatSummary.totalUsers) * 100}%` }}
          />
          <div 
            className="bg-yellow-500 transition-all duration-300"
            style={{ width: `${(threatSummary.mediumRisk / threatSummary.totalUsers) * 100}%` }}
          />
          <div 
            className="bg-green-500 transition-all duration-300"
            style={{ width: `${(threatSummary.lowRisk / threatSummary.totalUsers) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>High: {threatSummary.highRisk}</span>
          <span>Med: {threatSummary.mediumRisk}</span>
          <span>Low: {threatSummary.lowRisk}</span>
        </div>
      </div>

      {/* High Risk Users */}
      {highRiskUsers.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2">High Risk Users</p>
          <div className="space-y-1">
            {highRiskUsers.slice(0, 3).map((user, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-900/50 rounded px-2 py-1">
                <span className="text-xs text-slate-300">{user.user_id}</span>
                <Badge variant="outline" className="text-xs text-red-400 border-red-500/20">
                  {user.anomaly_score.toFixed(2)}
                </Badge>
              </div>
            ))}
            {highRiskUsers.length > 3 && (
              <p className="text-xs text-slate-500 text-center">+{highRiskUsers.length - 3} more</p>
            )}
          </div>
        </div>
      )}

      {/* Last Analysis */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
        <span>Last Analysis:</span>
        <span>{lastAnalysis ? new Date(lastAnalysis).toLocaleString() : 'Never'}</span>
      </div>

      {/* Action Button */}
      <Link
        to="/threat-detection"
        className="w-full inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/50 rounded-lg text-xs font-medium transition-all duration-200"
      >
        <TrendingUp className="w-3 h-3 mr-1" />
        View Full Analysis
      </Link>
    </Card>
  );
};

export default ThreatWidget;
