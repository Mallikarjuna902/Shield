import React, { useState, useMemo } from 'react';
import Layout from '../Layout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useThreat } from '../contexts/ThreatContext';
import { generateAlertsFromThreatData } from '../utils/alertUtils';
import { 
  Send, Mail, MessageSquare, Clock, 
  CheckCircle2, XCircle, AlertTriangle, User, 
  Search, RefreshCw, Eye
} from 'lucide-react';

// Mock sent notifications history
const mockSentNotifications = [
  {
    id: '1',
    recipientEmail: 'admin@company.com',
    recipientName: 'System Administrator',
    alertId: 'alert-001',
    alertType: 'Honeytoken Access',
    severity: 'high',
    status: 'delivered',
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000), // 30 seconds later
    subject: 'CRITICAL: Honeytoken Access Detected - User_001',
    message: 'A critical security alert has been triggered. User_001 has accessed a decoy file, indicating potential insider threat activity.'
  },
  {
    id: '2',
    recipientEmail: 'security@company.com',
    recipientName: 'Security Team',
    alertId: 'alert-002',
    alertType: 'After Hours Activity',
    severity: 'medium',
    status: 'delivered',
    sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    deliveredAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 45000),
    subject: 'ALERT: Excessive After-Hours Activity - User_007',
    message: 'User_007 has 85 after-hours logons, significantly above normal patterns. Please review user activity.'
  },
  {
    id: '3',
    recipientEmail: 'manager@company.com',
    recipientName: 'IT Manager',
    alertId: 'alert-003',
    alertType: 'Data Exfiltration Risk',
    severity: 'high',
    status: 'failed',
    sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    deliveredAt: null,
    subject: 'HIGH: Data Exfiltration Risk - User_012',
    message: 'User_012 transferred 15 files to removable media, indicating potential data exfiltration.'
  }
];

export default function AlertNotifications() {
  const { threatData, hasData } = useThreat();
  const [sentNotifications, setSentNotifications] = useState(mockSentNotifications);
  const [activeTab, setActiveTab] = useState('send');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [recipientEmail, setRecipientEmail] = useState('admin@company.com');
  const [recipientName, setRecipientName] = useState('System Administrator');
  const [isSending, setIsSending] = useState(false);
  
  // Get current alerts from threat data
  const currentAlerts = useMemo(() => {
    if (hasData && threatData?.results?.users) {
      return generateAlertsFromThreatData(threatData.results.users);
    }
    return [];
  }, [hasData, threatData]);
  
  // Filter sent notifications based on search term
  const filteredSentNotifications = sentNotifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.alertType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });
  
  // Handle sending alerts
  const handleSendAlerts = async () => {
    if (selectedAlerts.length === 0 || !recipientEmail) return;
    
    setIsSending(true);
    
    // Simulate sending emails (in real app, this would call an API)
    for (const alertId of selectedAlerts) {
      const alert = currentAlerts.find(a => a.id === alertId);
      if (alert) {
        const newNotification = {
          id: Date.now() + Math.random(),
          recipientEmail,
          recipientName,
          alertId: alert.id,
          alertType: alert.event,
          severity: alert.severity,
          status: 'sent',
          sentAt: new Date(),
          deliveredAt: null,
          subject: `${alert.severity.toUpperCase()}: ${alert.event} - ${alert.user}`,
          message: alert.description || `Alert triggered for user ${alert.user}: ${alert.event}`
        };
        
        setSentNotifications(prev => [newNotification, ...prev]);
        
        // Simulate delivery after 2-5 seconds
        setTimeout(() => {
          setSentNotifications(prev => 
            prev.map(notif => 
              notif.id === newNotification.id 
                ? { ...notif, status: 'delivered', deliveredAt: new Date() }
                : notif
            )
          );
        }, Math.random() * 3000 + 2000);
      }
    }
    
    setSelectedAlerts([]);
    setIsSending(false);
  };
  
  // Format timestamp to relative time
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    
    if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    return 'Just now';
  };
  
  // Handle alert selection
  const handleAlertSelection = (alertId) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };
  
  // Select all alerts
  const handleSelectAll = () => {
    if (selectedAlerts.length === currentAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(currentAlerts.map(alert => alert.id));
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Get severity color
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
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Alert Notifications</h1>
          <p className="text-slate-400">Send security alerts to website users and track notification history</p>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('send')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'send'
                ? 'bg-cyan-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Send Alerts
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-cyan-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Message History ({sentNotifications.length})
          </button>
        </div>
        
        {/* Send Alerts Tab */}
        {activeTab === 'send' && (
          <div className="space-y-6">
            {/* Recipient Configuration */}
            <Card className="glass-effect p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                Recipient Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="admin@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="System Administrator"
                  />
                </div>
              </div>
            </Card>
            
            {/* Current Alerts */}
            <Card className="glass-effect p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-cyan-400" />
                  Current Alerts ({currentAlerts.length})
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSelectAll}
                    variant="outline"
                    size="sm"
                    className="text-slate-300 border-slate-600 hover:bg-slate-700"
                  >
                    {selectedAlerts.length === currentAlerts.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    onClick={handleSendAlerts}
                    disabled={selectedAlerts.length === 0 || !recipientEmail || isSending}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Selected ({selectedAlerts.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {currentAlerts.length > 0 ? (
                <div className="space-y-3">
                  {currentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        selectedAlerts.includes(alert.id)
                          ? 'bg-cyan-500/10 border-cyan-500/50'
                          : 'bg-slate-800/30 border-slate-700 hover:bg-slate-800/50'
                      }`}
                      onClick={() => handleAlertSelection(alert.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedAlerts.includes(alert.id)}
                            onChange={() => handleAlertSelection(alert.id)}
                            className="w-4 h-4 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium">{alert.event}</span>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-400">
                              User: {alert.user} • Score: {alert.score} • {alert.timestamp}
                            </div>
                          </div>
                        </div>
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No current alerts available</p>
                  <p className="text-sm">Upload threat data to generate alerts</p>
                </div>
              )}
            </Card>
          </div>
        )}
        
        {/* Message History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Search */}
            <Card className="glass-effect p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            </Card>
            
            {/* Notifications History */}
            <Card className="glass-effect p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                Sent Notifications History
              </h3>
              
              {filteredSentNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredSentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(notification.status)}
                            <span className="text-white font-medium">{notification.subject}</span>
                            <Badge className={getSeverityColor(notification.severity)}>
                              {notification.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-300 mb-2">
                            To: {notification.recipientEmail} ({notification.recipientName})
                          </div>
                          <div className="text-sm text-slate-400 mb-2">
                            {notification.message}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Sent: {formatTimeAgo(notification.sentAt)}</span>
                            {notification.deliveredAt && (
                              <span>Delivered: {formatTimeAgo(notification.deliveredAt)}</span>
                            )}
                            <span>Alert ID: {notification.alertId}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-slate-300 border-slate-600 hover:bg-slate-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No notifications sent yet</p>
                  <p className="text-sm">Send some alerts to see the history here</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
