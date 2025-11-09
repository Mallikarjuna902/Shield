import React, { useState } from 'react';
import Card from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Filter, Download, AlertTriangle, Shield, Activity, Globe } from 'lucide-react';

// Mock data for threat intelligence
const threatIntelData = [
  {
    id: 1,
    title: 'Phishing Campaign Targeting Financial Sector',
    description: 'New phishing campaign identified targeting banking credentials with sophisticated social engineering tactics.',
    severity: 'high',
    source: 'CERT-In',
    date: '2023-11-05',
    tags: ['phishing', 'financial', 'credential-theft']
  },
  {
    id: 2,
    title: 'Ransomware Attack on Healthcare Providers',
    description: 'Multiple healthcare organizations reporting ransomware attacks with data exfiltration.',
    severity: 'critical',
    source: 'CISA',
    date: '2023-11-04',
    tags: ['ransomware', 'healthcare', 'data-breach']
  },
  {
    id: 3,
    title: 'Zero-Day in Popular VPN Software',
    description: 'Critical vulnerability found in widely used VPN software allowing remote code execution.',
    severity: 'high',
    source: 'NVD',
    date: '2023-11-03',
    tags: ['vulnerability', 'vpn', 'zero-day']
  },
  {
    id: 4,
    title: 'Supply Chain Attack on Open-Source Package',
    description: 'Malicious code found in popular npm package with over 1M weekly downloads.',
    severity: 'high',
    source: 'GitHub Security',
    date: '2023-11-02',
    tags: ['supply-chain', 'npm', 'malware']
  }
];

const ThreatIntelligence = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const filteredThreats = threatIntelData.filter(threat => {
    const matchesSearch = threat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         threat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         threat.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = activeTab === 'all' || threat.severity === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const getSeverityBadge = (severity) => {
    const colors = {
      critical: 'bg-red-500/10 text-red-500 border-red-500/20',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      low: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[severity] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getSourceIcon = (source) => {
    const icons = {
      'CERT-In': <Shield className="h-4 w-4 mr-1.5" />,
      'CISA': <Activity className="h-4 w-4 mr-1.5" />,
      'NVD': <Globe className="h-4 w-4 mr-1.5" />,
      'GitHub Security': <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.254-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.393.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path>
      </svg>
    };
    
    return icons[source] || <Globe className="h-4 w-4 mr-1.5" />;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Threat Intelligence</h1>
          <p className="text-gray-400">Stay updated with the latest cybersecurity threats and vulnerabilities</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-gray-700 bg-gray-800/50 p-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-white">Categories</h3>
            </div>
            <div>
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'all' ? 'bg-blue-500/10 text-blue-400' : 'text-gray-300 hover:bg-gray-700/50'}`}
                >
                  All Threats
                </button>
                <button 
                  onClick={() => setActiveTab('critical')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${activeTab === 'critical' ? 'bg-red-500/10 text-red-400' : 'text-gray-300 hover:bg-gray-700/50'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  Critical
                </button>
                <button 
                  onClick={() => setActiveTab('high')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${activeTab === 'high' ? 'bg-orange-500/10 text-orange-400' : 'text-gray-300 hover:bg-gray-700/50'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                  High
                </button>
                <button 
                  onClick={() => setActiveTab('medium')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${activeTab === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'text-gray-300 hover:bg-gray-700/50'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                  Medium
                </button>
                <button 
                  onClick={() => setActiveTab('low')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${activeTab === 'low' ? 'bg-blue-500/10 text-blue-400' : 'text-gray-300 hover:bg-gray-700/50'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                  Low
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search threats..."
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Threat list */}
          <div className="space-y-4">
            {filteredThreats.length > 0 ? (
              filteredThreats.map((threat) => (
                <div 
                  key={threat.id} 
                  className={`rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-700/30 transition-colors cursor-pointer p-4 mb-4 ${selectedThreat?.id === threat.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedThreat(threat)}
                >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white flex items-center">
                          <AlertTriangle className={`h-4 w-4 mr-2 ${
                            threat.severity === 'critical' ? 'text-red-500' : 
                            threat.severity === 'high' ? 'text-orange-500' : 
                            threat.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />
                          {threat.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">{threat.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {threat.tags.map((tag, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-4">
                        {getSeverityBadge(threat.severity)}
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          {getSourceIcon(threat.source)}
                          <span>{threat.source}</span>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{threat.date}</span>
                      </div>
                    </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No threats found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatIntelligence;
