import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { useThreat } from './contexts/ThreatContext';
import { findAlertById } from './utils/alertUtils';
import { ArrowLeft, AlertTriangle, Info, Clock, User, Activity, Shield, FileText } from 'lucide-react';
import { mockAlerts } from './mockData';

export default function AlertDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { threatData, hasData } = useThreat();
  const [alert, setAlert] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    // First try to find alert from threat data
    if (hasData && threatData?.results?.users) {
      const generatedAlert = findAlertById(id, threatData.results.users);
      if (generatedAlert) {
        setAlert(generatedAlert);
        // Find user details
        const user = threatData.results.users.find(u => u.user_id === generatedAlert.user);
        setUserDetails(user);
        return;
      }
    }
    
    // Fallback to mock alerts
    const foundAlert = mockAlerts.find(a => a.id === id || a.id === parseInt(id));
    setAlert(foundAlert);
  }, [id, hasData, threatData]);

  if (!alert) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-slate-400">Alert not found</p>
        </div>
      </Layout>
    );
  }

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            data-testid="back-to-dashboard-btn"
            className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Alert Details</h1>
          <p className="text-slate-400">Comprehensive threat analysis and explanation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-effect p-6 lg:col-span-2">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white" data-testid="alert-title">{alert.event}</h2>
                  <p className="text-slate-400 text-sm mt-1">Alert ID: {alert.id}</p>
                </div>
              </div>
              <Badge className={`${getSeverityColor(alert.severity)} uppercase`}>
                {alert.severity}
              </Badge>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-cyan-400" />
                  Threat Explanation
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {alert.description || 'This alert indicates suspicious activity that requires investigation.'}
                </p>
              </div>

              {alert.riskFactors && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    Risk Factors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {alert.riskFactors.map((factor, index) => (
                      <Badge key={index} variant="outline" className="text-orange-400 border-orange-400/30">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {userDetails && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    User Behavioral Analysis
                  </h3>
                  <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 text-sm">Risk Level</p>
                        <Badge className={`${getSeverityColor(userDetails.risk_level.toLowerCase())} mt-1`}>
                          {userDetails.risk_level}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Anomaly Score</p>
                        <p className="text-white font-mono font-semibold">{Math.abs(userDetails.anomaly_score).toFixed(3)}</p>
                      </div>
                    </div>
                    
                    {userDetails.features && (
                      <div className="mt-4">
                        <p className="text-slate-400 text-sm mb-2">Key Behavioral Metrics</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {userDetails.features.total_logons && (
                            <div className="flex justify-between">
                              <span className="text-slate-300">Total Logons:</span>
                              <span className="text-white">{userDetails.features.total_logons}</span>
                            </div>
                          )}
                          {userDetails.features.after_hours_logons > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-300">After Hours:</span>
                              <span className="text-orange-400">{userDetails.features.after_hours_logons}</span>
                            </div>
                          )}
                          {userDetails.features.files_to_removable > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-300">Removable Media:</span>
                              <span className="text-red-400">{userDetails.features.files_to_removable}</span>
                            </div>
                          )}
                          {userDetails.features.accessed_decoy > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-300">Decoy Access:</span>
                              <span className="text-red-400 font-semibold">YES</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Sidebar with alert metadata */}
          <Card className="glass-effect p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Alert Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Timestamp</p>
                <p className="text-white font-mono">{alert.timestamp}</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm">User ID</p>
                <p className="text-white font-semibold">{alert.user}</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm">Threat Score</p>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono font-bold text-lg">{alert.score}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-red-500 h-2 rounded-full"
                      style={{ width: `${(parseFloat(alert.score) / 1.0) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-sm">Status</p>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mt-1">
                  Under Investigation
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
