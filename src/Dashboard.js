import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import ThreatDashboard from './components/ThreatDashboard';
import { useThreat } from './contexts/ThreatContext';
import { generateAlertsFromThreatData } from './utils/alertUtils';
import { Eye } from 'lucide-react';
import { mockAlerts } from './mockData';

export default function Dashboard() {
  const navigate = useNavigate();
  const { threatData, hasData, threatSummary } = useThreat();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (hasData && threatData?.results?.users) {
      // Generate alerts from threat detection data
      const generatedAlerts = generateAlertsFromThreatData(threatData.results.users);
      setAlerts(generatedAlerts);
    } else {
      setAlerts(mockAlerts);
    }
  }, [hasData, threatData, threatSummary]);


  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getRowStyle = (severity) => {
    switch(severity) {
      case 'high': return 'border-l-4 border-l-red-500 bg-red-500/5 hover:bg-red-500/10';
      case 'medium': return 'border-l-4 border-l-orange-500 bg-orange-500/5 hover:bg-orange-500/10';
      case 'low': return 'border-l-4 border-l-green-500 bg-green-500/5 hover:bg-green-500/10';
      default: return 'border-l-4 border-l-slate-500 hover:bg-slate-800/50';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Security Dashboard</h1>
          <p className="text-slate-400">Real-time insider threat monitoring and analysis</p>
        </div>


        {/* Interactive Threat Analytics Dashboard */}
        <ThreatDashboard />

        <Card className="glass-effect p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              Recent Alerts
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[15%]" /> {/* Timestamp */}
                <col className="w-[15%]" /> {/* User */}
                <col className="w-[30%]" /> {/* Event */}
                <col className="w-[12%]" /> {/* Severity */}
                <col className="w-[10%]" /> {/* Score */}
                <col className="w-[18%]" /> {/* Action */}
              </colgroup>
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Timestamp</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">User</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Event</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Severity</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Score</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr
                    key={alert.id}
                    data-testid={`alert-row-${alert.id}`}
                    className={`${getRowStyle(alert.severity)} cursor-pointer transition-colors`}
                    onClick={() => navigate(`/alert/${alert.id}`)}
                  >
                    <td className="py-4 px-4 text-slate-300 text-sm">{alert.timestamp}</td>
                    <td className="py-4 px-4 text-white font-medium text-center">{alert.user}</td>
                    <td className="py-4 px-4 text-slate-300 text-sm text-center">{alert.event}</td>
                    <td className="py-4 px-4 text-right">
                      <Badge className={`${getSeverityColor(alert.severity)} uppercase text-xs inline-block`}>
                        {alert.severity}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-white font-mono font-semibold">{alert.score}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        data-testid={`view-alert-${alert.id}`}
                        className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors px-3 py-1 rounded hover:bg-cyan-400/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/alert/${alert.id}`);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
