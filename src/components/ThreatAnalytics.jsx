import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  TrendingUp, 
  Eye,
  ChevronDown,
  ChevronUp,
  Activity,
  Mail,
  HardDrive,
  Monitor
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const ThreatAnalytics = ({ analysisData, className = "" }) => {
  const [expandedUser, setExpandedUser] = useState(null);
  const [sortBy, setSortBy] = useState('anomaly_score');
  const [filterRisk, setFilterRisk] = useState('all');

  // Extract and memoize data
  const users = useMemo(() => analysisData?.results?.users || [], [analysisData?.results?.users]);
  const summary = analysisData?.results?.summary || null;

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!users.length) return [];
    
    let filtered = users;
    
    if (filterRisk !== 'all') {
      filtered = filtered.filter(user => user.risk_level.toLowerCase() === filterRisk);
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'anomaly_score') {
        return a.anomaly_score - b.anomaly_score; // Lower scores (more anomalous) first
      } else if (sortBy === 'risk_level') {
        const riskOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        return riskOrder[a.risk_level] - riskOrder[b.risk_level];
      }
      return 0;
    });
  }, [users, sortBy, filterRisk]);

  // Early return after all hooks
  if (!analysisData || !analysisData.results) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">No Analysis Data</h3>
        <p className="text-slate-500">Upload and analyze a CSV file to see threat analytics</p>
      </div>
    );
  }

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getFeatureIcon = (featureName) => {
    if (featureName.includes('logon')) return <Monitor className="w-4 h-4" />;
    if (featureName.includes('email')) return <Mail className="w-4 h-4" />;
    if (featureName.includes('file')) return <HardDrive className="w-4 h-4" />;
    if (featureName.includes('device')) return <Activity className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const formatFeatureName = (name) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTopFeatures = (features) => {
    // Get features with highest values (excluding zero values)
    return Object.entries(features)
      .filter(([_, value]) => value > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{summary.total_users}</p>
            </div>
            <Users className="w-8 h-8 text-cyan-400" />
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Anomalies Detected</p>
              <p className="text-2xl font-bold text-red-400">{summary.anomalies_detected}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Anomaly Rate</p>
              <p className="text-2xl font-bold text-yellow-400">
                {summary.anomaly_rate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg Anomaly Score</p>
              <p className="text-2xl font-bold text-slate-300">
                {summary.avg_anomaly_score.toFixed(3)}
              </p>
            </div>
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(summary.risk_distribution).map(([risk, count]) => (
            <div key={risk} className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(risk)}`}>
                {risk}
              </div>
              <p className="text-2xl font-bold text-white mt-2">{count}</p>
              <p className="text-slate-400 text-sm">
                {((count / summary.total_users) * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="anomaly_score">Sort by Anomaly Score</option>
            <option value="risk_level">Sort by Risk Level</option>
          </select>
        </div>

        <p className="text-slate-400 text-sm">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filteredUsers.map((user, index) => (
          <Card key={user.user_id} className="bg-slate-800/50 border-slate-700">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{user.user_id}</h4>
                      <p className="text-sm text-slate-400">
                        Score: {user.anomaly_score.toFixed(4)} | {user.prediction}
                      </p>
                    </div>
                  </div>
                  
                  <Badge className={getRiskColor(user.risk_level)}>
                    {user.risk_level} Risk
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedUser(expandedUser === user.user_id ? null : user.user_id)}
                  className="text-slate-400 hover:text-white"
                >
                  {expandedUser === user.user_id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {expandedUser === user.user_id && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <h5 className="text-sm font-medium text-slate-300 mb-3">Behavioral Features</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getTopFeatures(user.features).map(([feature, value]) => (
                      <div key={feature} className="bg-slate-900/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          {getFeatureIcon(feature)}
                          <span className="text-xs font-medium text-slate-300">
                            {formatFeatureName(feature)}
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-white">
                          {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {user.features.accessed_decoy_files > 0 && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium text-red-400">
                          Accessed Decoy Files: {user.features.accessed_decoy_files}
                        </span>
                      </div>
                      <p className="text-xs text-red-300 mt-1">
                        This user accessed honeypot files, indicating potential malicious activity.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <Eye className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-400">No users match the current filters</p>
        </div>
      )}
    </div>
  );
};

export default ThreatAnalytics;
