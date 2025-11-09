import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Search, Filter, Download, AlertCircle, Clock as ClockIcon, CheckCircle2, XCircle, FileText, User, History } from 'lucide-react';

// Tab component for the response center
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 text-sm font-medium border-b-2 ${
      active 
        ? 'border-blue-500 text-blue-400' 
        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
    }`}
  >
    {children}
  </button>
);

// Severity badge component
const SeverityBadge = ({ level }) => {
  const colors = {
    high: 'bg-red-500/10 text-red-400',
    medium: 'bg-yellow-500/10 text-yellow-400',
    low: 'bg-blue-500/10 text-blue-400',
    info: 'bg-gray-500/10 text-gray-400'
  };
  
  const levelText = level.charAt(0).toUpperCase() + level.slice(1);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[level] || colors.info}`}>
      {levelText}
    </span>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    open: { color: 'bg-yellow-500/10 text-yellow-400', icon: <AlertCircle className="h-3 w-3 mr-1" /> },
    in_progress: { color: 'bg-blue-500/10 text-blue-400', icon: <ClockIcon className="h-3 w-3 mr-1" /> },
    resolved: { color: 'bg-green-500/10 text-green-400', icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
    closed: { color: 'bg-gray-500/10 text-gray-400', icon: <XCircle className="h-3 w-3 mr-1" /> }
  };
  
  const config = statusConfig[status] || statusConfig.closed;
  const statusText = status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {statusText}
    </span>
  );
};

// Mock data for incidents
const mockIncidents = [
  {
    id: 1,
    alert: 'Multiple failed login attempts',
    user: 'john.doe@example.com',
    source: 'Azure AD',
    severity: 'high',
    status: 'open',
    time: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    notes: '',
    history: [
      { id: 1, timestamp: new Date(Date.now() - 10 * 60 * 1000), action: 'Alert created', user: 'System' },
      { id: 2, timestamp: new Date(Date.now() - 8 * 60 * 1000), action: 'Assigned to analyst', user: 'Admin' }
    ]
  },
  {
    id: 2,
    alert: 'Suspicious file download detected',
    user: 'jane.smith@example.com',
    source: 'Endpoint Protection',
    severity: 'medium',
    status: 'in_progress',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    notes: 'User claims this was a legitimate download of a work document.',
    history: [
      { id: 1, timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000), action: 'Alert created', user: 'System' },
      { id: 2, timestamp: new Date(Date.now() - 2.2 * 60 * 60 * 1000), action: 'Marked as In Progress', user: 'analyst1' },
      { id: 3, timestamp: new Date(Date.now() - 2.1 * 60 * 60 * 1000), action: 'Note added', user: 'analyst1' }
    ]
  },
  {
    id: 3,
    alert: 'Unusual data transfer volume',
    user: 'mark.johnson@example.com',
    source: 'Network Monitor',
    severity: 'low',
    status: 'resolved',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    notes: 'False positive - user was transferring large project files to cloud storage.',
    history: [
      { id: 1, timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000), action: 'Alert created', user: 'System' },
      { id: 2, timestamp: new Date(Date.now() - 24.5 * 60 * 60 * 1000), action: 'Marked as Resolved', user: 'analyst2' },
      { id: 3, timestamp: new Date(Date.now() - 24.5 * 60 * 60 * 1000), action: 'Note added', user: 'analyst2' }
    ]
  },
  {
    id: 4,
    alert: 'Privilege escalation attempt',
    user: 'admin@example.com',
    source: 'Active Directory',
    severity: 'critical',
    status: 'open',
    time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    notes: 'Potential security incident under investigation.',
    history: [
      { id: 1, timestamp: new Date(Date.now() - 35 * 60 * 1000), action: 'Alert created', user: 'System' },
      { id: 2, timestamp: new Date(Date.now() - 32 * 60 * 1000), action: 'Note added', user: 'analyst1' }
    ]
  },
  {
    id: 5,
    alert: 'Malware detection',
    user: 'remote.user@example.com',
    source: 'EDR',
    severity: 'high',
    status: 'in_progress',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    notes: 'Malware detected and quarantined. System scan in progress.',
    history: [
      { id: 1, timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000), action: 'Alert created', user: 'System' },
      { id: 2, timestamp: new Date(Date.now() - 3.4 * 60 * 60 * 1000), action: 'Marked as In Progress', user: 'analyst2' },
      { id: 3, timestamp: new Date(Date.now() - 3.3 * 60 * 60 * 1000), action: 'Note added', user: 'analyst2' },
      { id: 4, timestamp: new Date(Date.now() - 3.2 * 60 * 60 * 1000), action: 'Malware quarantined', user: 'EDR System' }
    ]
  }
];

const mockPlaybooks = [
  {
    id: 1,
    name: 'Phishing Response',
    description: 'Standard operating procedure for handling phishing incidents',
    lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    category: 'Email Security'
  },
  {
    id: 2,
    name: 'Malware Containment',
    description: 'Steps to contain and eradicate malware infections',
    lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    category: 'Endpoint Security'
  },
  {
    id: 3,
    name: 'Data Breach Response',
    description: 'Procedures for responding to potential data breaches',
    lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    category: 'Data Protection'
  }
];

const mockThreatIntel = [
  {
    id: 1,
    title: 'New Ransomware Campaign Targeting Healthcare',
    source: 'CISA',
    severity: 'high',
    published: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    url: '#',
    tags: ['ransomware', 'healthcare', 'ioc']
  },
  {
    id: 2,
    title: 'Zero-Day Vulnerability in Log4j',
    source: 'NVD',
    severity: 'critical',
    published: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    url: '#',
    tags: ['vulnerability', 'log4j', 'zero-day']
  },
  {
    id: 3,
    title: 'Phishing Campaign Using Fake Job Offers',
    source: 'US-CERT',
    severity: 'medium',
    published: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    url: '#',
    tags: ['phishing', 'social-engineering']
  }
];

// Action Buttons Component
const ActionButtons = ({ onInvestigate, onResolve, onFalsePositive, isResolved }) => (
  <div className="flex space-x-2">
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onInvestigate}
      className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20"
    >
      <FileText className="h-3.5 w-3.5 mr-1.5" />
      Investigate
    </Button>
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onResolve}
      disabled={isResolved}
      className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20 disabled:opacity-50"
    >
      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
      Resolve
    </Button>
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onFalsePositive}
      className="bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 border-gray-500/20"
    >
      <XCircle className="h-3.5 w-3.5 mr-1.5" />
      False Positive
    </Button>
  </div>
);

// Audit Log Component
const AuditLog = ({ logs }) => (
  <div className="space-y-4 mt-4">
    <div className="flex items-center text-sm text-gray-400">
      <History className="h-4 w-4 mr-2" />
      <span className="font-medium">Audit Log</span>
    </div>
    <div className="border border-gray-700 rounded-lg divide-y divide-gray-700">
      {logs.map((log) => (
        <div key={log.id} className="p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white">{log.action}</span>
            <span className="text-gray-400">
              {new Date(log.timestamp).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center mt-1 text-xs text-gray-400">
            <User className="h-3 w-3 mr-1" />
            {log.user}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function ResponseCenter() {
  const [activeTab, setActiveTab] = useState('incidents');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [note, setNote] = useState('');
  const [incidents, setIncidents] = useState(mockIncidents);
  
  // Filter incidents based on search query and status
  const filteredIncidents = incidents.filter(incident => 
    (incident.alert.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.user.toLowerCase().includes(searchQuery.toLowerCase())) &&
    incident.status !== 'resolved' && incident.status !== 'closed'
  );

  const filteredPlaybooks = mockPlaybooks.filter(playbook => 
    playbook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playbook.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredThreatIntel = mockThreatIntel.filter(intel => 
    intel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    intel.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle incident actions
  const handleInvestigate = (incidentId) => {
    setIncidents(incidents.map(incident => 
      incident.id === incidentId 
        ? { 
            ...incident, 
            status: 'in_progress',
            history: [
              ...incident.history,
              { 
                id: incident.history.length + 1, 
                timestamp: new Date(), 
                action: 'Investigation started',
                user: 'Current User' 
              }
            ]
          } 
        : incident
    ));
  };

  const handleResolve = (incidentId) => {
    setIncidents(incidents.map(incident => 
      incident.id === incidentId 
        ? { 
            ...incident, 
            status: 'resolved',
            history: [
              ...incident.history,
              { 
                id: incident.history.length + 1, 
                timestamp: new Date(), 
                action: 'Incident resolved',
                user: 'Current User' 
              }
            ]
          } 
        : incident
    ));
  };

  const handleFalsePositive = (incidentId) => {
    setIncidents(incidents.map(incident => 
      incident.id === incidentId 
        ? { 
            ...incident, 
            status: 'resolved',
            notes: incident.notes ? `${incident.notes}\nMarked as false positive.` : 'Marked as false positive.',
            history: [
              ...incident.history,
              { 
                id: incident.history.length + 1, 
                timestamp: new Date(), 
                action: 'Marked as False Positive',
                user: 'Current User' 
              }
            ]
          } 
        : incident
    ));
  };

  const handleAddNote = (incidentId) => {
    if (!note.trim()) return;
    
    setIncidents(incidents.map(incident => 
      incident.id === incidentId 
        ? { 
            ...incident, 
            notes: incident.notes ? `${incident.notes}\n${note}` : note,
            history: [
              ...incident.history,
              { 
                id: incident.history.length + 1, 
                timestamp: new Date(), 
                action: 'Note added',
                user: 'Current User' 
              }
            ]
          } 
        : incident
    ));
    
    setNote('');
  };

  const handleIncidentSelect = (incident) => {
    setSelectedIncident(incident);
    setNote('');
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    
    if (interval > 1) return `${interval} years ago`;
    if (interval === 1) return '1 year ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    if (interval === 1) return '1 month ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    if (interval === 1) return '1 day ago';
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    if (interval === 1) return '1 hour ago';
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    if (interval === 1) return '1 minute ago';
    
    return 'just now';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Response Center</h1>
          <p className="text-sm text-gray-400">Monitor and respond to security incidents</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search incidents..."
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <TabButton 
              active={activeTab === 'incidents'}
              onClick={() => setActiveTab('incidents')}
            >
              Incidents
            </TabButton>
            <TabButton 
              active={activeTab === 'playbooks'}
              onClick={() => setActiveTab('playbooks')}
            >
              Playbooks
            </TabButton>
            <TabButton 
              active={activeTab === 'threat-intel'}
              onClick={() => setActiveTab('threat-intel')}
            >
              Threat Intel
            </TabButton>
          </nav>
        </div>

        {activeTab === 'incidents' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-gray-700 bg-gray-800/50 mb-6">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="font-medium text-white flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-yellow-400" />
                    Active Incidents
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Alert</TableHead>
                        <TableHead className="text-gray-300">Severity</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300 text-right">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIncidents.length > 0 ? (
                        filteredIncidents.map((incident) => (
                          <TableRow 
                            key={`incident-${incident.id}`} 
                            className={`border-gray-700 hover:bg-gray-700/50 cursor-pointer ${selectedIncident?.id === incident.id ? 'bg-gray-700/30' : ''}`}
                            onClick={() => handleIncidentSelect(incident)}
                          >
                            <TableCell className="font-medium text-white">
                              <div className="flex flex-col">
                                <span>{incident.alert}</span>
                                <span className="text-xs text-gray-400">{incident.user} • {incident.source}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <SeverityBadge level={incident.severity} />
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={incident.status} />
                            </TableCell>
                            <TableCell className="text-right text-sm text-gray-400">
                              {formatTimeAgo(incident.time)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                            No active incidents found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>

            {/* Incident Details Sidebar */}
            {selectedIncident ? (
              <div className="space-y-6">
                <Card className="border-gray-700 bg-gray-800/50 p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-white">Incident Details</h3>
                      <p className="text-sm text-gray-400">ID: {selectedIncident.id}</p>
                    </div>
                    <StatusBadge status={selectedIncident.status} />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Alert</h4>
                      <p className="text-white">{selectedIncident.alert}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">User</h4>
                        <p className="text-white">{selectedIncident.user}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Source</h4>
                        <p className="text-white">{selectedIncident.source}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Severity</h4>
                        <SeverityBadge level={selectedIncident.severity} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Detected</h4>
                        <p className="text-white">{formatTimeAgo(selectedIncident.time)}</p>
                      </div>
                    </div>

                    {selectedIncident.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Notes</h4>
                        <div className="bg-gray-900/50 p-3 rounded text-sm whitespace-pre-line">
                          {selectedIncident.notes}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Actions</h4>
                      <ActionButtons
                        onInvestigate={() => handleInvestigate(selectedIncident.id)}
                        onResolve={() => handleResolve(selectedIncident.id)}
                        onFalsePositive={() => handleFalsePositive(selectedIncident.id)}
                        isResolved={selectedIncident.status === 'resolved' || selectedIncident.status === 'closed'}
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Add Note</h4>
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Add investigation notes..."
                          className="bg-gray-900/50 border-gray-700 text-white"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={3}
                        />
                        <Button 
                          onClick={() => handleAddNote(selectedIncident.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={!note.trim()}
                        >
                          Add Note
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Audit Log */}
                <AuditLog logs={selectedIncident.history} />
              </div>
            ) : (
              <Card className="border-gray-700 bg-gray-800/50 p-6 flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-10 w-10 mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-400">Select an incident to view details</p>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'playbooks' && (
          <Card className="border-gray-700 bg-gray-800/50">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Description</TableHead>
                  <TableHead className="text-gray-300">Category</TableHead>
                  <TableHead className="text-gray-300 text-right">Last Modified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlaybooks.map((playbook) => (
                  <TableRow key={`playbook-${playbook.id}`} className="border-gray-700 hover:bg-gray-700/50">
                    <TableCell className="font-medium text-white">
                      {playbook.name}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {playbook.description}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-900/50 text-blue-300">
                        {playbook.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-400">
                      {formatTimeAgo(playbook.lastModified)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {activeTab === 'threat-intel' && (
          <div className="space-y-4">
            {filteredThreatIntel.map((intel) => (
              <Card key={`threat-${intel.id}`} className="border-gray-700 bg-gray-800/50 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-white">{intel.title}</span>
                      <SeverityBadge level={intel.severity} />
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Source: {intel.source} • {formatDate(intel.published)}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {intel.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <a 
                    href={intel.url} 
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View Details →
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
