import { useState, useEffect, useMemo } from 'react';
import Layout from './Layout';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { UserSelector } from './components/ui/UserSelector';
import { useThreat } from './contexts/ThreatContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { 
  User, Shield, Activity, Clock, FileText, Monitor, 
  AlertTriangle, TrendingUp, Mail, 
  HardDrive, Calendar 
} from 'lucide-react';

export default function UserActivity() {
  const { threatData, hasData } = useThreat();
  const [selectedUser, setSelectedUser] = useState('');

  // Generate users from threat detection data or use mock data
  const users = useMemo(() => {
    if (hasData && threatData?.results?.users) {
      return threatData.results.users.map(user => ({
        value: user.user_id,
        label: user.user_id,
        role: user.risk_level === 'High' ? 'High Risk User' : 
              user.risk_level === 'Medium' ? 'Medium Risk User' : 'Standard User',
        avatar: user.user_id.substring(0, 2).toUpperCase(),
        riskLevel: user.risk_level,
        anomalyScore: user.anomaly_score,
        features: user.features || {}
      }));
    }
    // Generate 100 mock users if no real data
    const mockUsers = [];
    for (let i = 1; i <= 100; i++) {
      const userId = `User_${i.toString().padStart(3, '0')}`;
      const riskLevels = ['High', 'Medium', 'Low'];
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      
      mockUsers.push({
        value: userId,
        label: userId,
        role: riskLevel === 'High' ? 'High Risk User' : 
              riskLevel === 'Medium' ? 'Medium Risk User' : 'Standard User',
        avatar: `U${i}`,
        riskLevel: riskLevel,
        anomalyScore: Math.random() * -1, // Random anomaly score between 0 and -1
        features: {
          total_logons: Math.floor(Math.random() * 500) + 50,
          after_hours_logons: Math.floor(Math.random() * 100),
          total_emails_sent: Math.floor(Math.random() * 300) + 20,
          total_file_ops: Math.floor(Math.random() * 200),
          unique_devices_logon: Math.floor(Math.random() * 15) + 1,
          weekend_logons: Math.floor(Math.random() * 20),
          accessed_decoy: Math.random() < 0.1 ? 1 : 0, // 10% chance of decoy access
          files_to_removable: Math.floor(Math.random() * 25)
        },
        lastActivity: (() => {
          // Generate realistic last activity based on risk level
          const now = new Date();
          const hoursAgo = riskLevel === 'High' ? Math.random() * 2 : 
                          riskLevel === 'Medium' ? Math.random() * 8 : 
                          Math.random() * 24;
          return new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        })()
      });
    }
    return mockUsers;
  }, [hasData, threatData]);

  // Set initial selected user
  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      setSelectedUser(users[0].value);
    }
  }, [users, selectedUser]);

  // Get selected user data
  const selectedUserData = useMemo(() => {
    return users.find(u => u.value === selectedUser);
  }, [users, selectedUser]);

  // Generate activity metrics based on user features
  const activityMetrics = useMemo(() => {
    if (!selectedUserData) return [];
    
    const features = selectedUserData.features;
    return [
      {
        name: 'Total Logons',
        value: features.total_logons || 0,
        icon: Monitor,
        color: '#06b6d4',
        trend: '+12%'
      },
      {
        name: 'After Hours',
        value: features.after_hours_logons || 0,
        icon: Clock,
        color: features.after_hours_logons > 50 ? '#ef4444' : '#f59e0b',
        trend: features.after_hours_logons > 50 ? '+45%' : '+8%'
      },
      {
        name: 'Email Activity',
        value: features.total_emails_sent || 0,
        icon: Mail,
        color: '#10b981',
        trend: '+5%'
      },
      {
        name: 'File Operations',
        value: features.total_file_ops || 0,
        icon: FileText,
        color: '#8b5cf6',
        trend: '+15%'
      },
      {
        name: 'Device Access',
        value: features.unique_devices_logon || 0,
        icon: HardDrive,
        color: features.unique_devices_logon > 10 ? '#ef4444' : '#06b6d4',
        trend: features.unique_devices_logon > 10 ? '+25%' : '+3%'
      },
      {
        name: 'Weekend Activity',
        value: features.weekend_logons || 0,
        icon: Calendar,
        color: features.weekend_logons > 5 ? '#f59e0b' : '#10b981',
        trend: features.weekend_logons > 5 ? '+20%' : '+2%'
      }
    ];
  }, [selectedUserData]);

  // Generate behavioral analysis data
  const behaviorData = useMemo(() => {
    if (!selectedUserData) return [];
    
    const features = selectedUserData.features;
    return [
      { name: 'Normal Hours', value: (features.total_logons || 0) - (features.after_hours_logons || 0), fill: '#10b981' },
      { name: 'After Hours', value: features.after_hours_logons || 0, fill: '#ef4444' },
      { name: 'Weekend', value: features.weekend_logons || 0, fill: '#f59e0b' }
    ];
  }, [selectedUserData]);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">User Activity Analysis</h1>
            <p className="text-slate-400">Comprehensive behavioral analysis and activity monitoring</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {users.length} Users Available
              </span>
            </div>
          </div>
          <div className="w-full lg:w-80">
            <UserSelector 
              users={users} 
              selectedUser={selectedUser} 
              onSelect={setSelectedUser} 
            />
          </div>
        </div>

        {/* User Profile Card */}
        {selectedUserData && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-blue-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <Card className="relative bg-slate-900/90 backdrop-blur-sm ring-1 ring-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedUserData.label}</h2>
                    <p className="text-slate-400">{selectedUserData.role}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${
                        selectedUserData.riskLevel === 'High' 
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : selectedUserData.riskLevel === 'Medium'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 border-green-500/30'
                      }`}>
                        {selectedUserData.riskLevel === 'High' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {selectedUserData.riskLevel} Risk
                      </Badge>
                      <span className="text-slate-500 text-sm">
                        Anomaly Score: {selectedUserData.anomalyScore?.toFixed(3) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">Last Activity</div>
                  {(() => {
                    let lastActivityTime;
                    
                    // Use stored lastActivity if available, otherwise generate consistent time
                    if (selectedUserData.lastActivity) {
                      lastActivityTime = selectedUserData.lastActivity;
                    } else {
                      // Generate consistent last activity time based on user data
                      const now = new Date();
                      let hoursAgo;
                      
                      // Use user ID to create consistent but varied times
                      const userSeed = selectedUserData.value ? 
                        parseInt(selectedUserData.value.replace(/\D/g, '')) || 1 : 1;
                      const seedRandom = (userSeed * 9301 + 49297) % 233280 / 233280; // Simple seeded random
                      
                      if (selectedUserData.riskLevel === 'High') {
                        // High risk users - recent activity (within last 2 hours)
                        hoursAgo = seedRandom * 2;
                      } else if (selectedUserData.riskLevel === 'Medium') {
                        // Medium risk users - activity within last 8 hours
                        hoursAgo = seedRandom * 8;
                      } else {
                        // Low risk users - activity within last 24 hours
                        hoursAgo = seedRandom * 24;
                      }
                      
                      lastActivityTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
                    }
                    
                    return (
                      <>
                        <div className="text-white font-medium">{lastActivityTime.toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">{lastActivityTime.toLocaleTimeString()}</div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Activity Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activityMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-600 to-slate-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <Card className="relative bg-slate-900/90 backdrop-blur-sm ring-1 ring-slate-700/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">{metric.name}</p>
                      <p className="text-2xl font-bold text-white mt-1">{metric.value.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 text-xs font-medium">{metric.trend}</span>
                      </div>
                    </div>
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${metric.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: metric.color }} />
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Behavioral Analysis */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <Card className="relative bg-slate-900/90 backdrop-blur-sm ring-1 ring-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Activity Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={behaviorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {behaviorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {behaviorData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.fill }}
                    />
                    <span className="text-sm text-slate-300">{entry.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Risk Indicators */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <Card className="relative bg-slate-900/90 backdrop-blur-sm ring-1 ring-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Risk Indicators
              </h3>
              <div className="space-y-4">
                {selectedUserData && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <span className="text-slate-300">After Hours Access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{selectedUserData.features.after_hours_logons || 0}</span>
                        <Badge className={selectedUserData.features.after_hours_logons > 50 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                          {selectedUserData.features.after_hours_logons > 50 ? 'HIGH' : 'NORMAL'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <HardDrive className="w-5 h-5 text-purple-400" />
                        <span className="text-slate-300">Device Access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{selectedUserData.features.unique_devices_logon || 0}</span>
                        <Badge className={selectedUserData.features.unique_devices_logon > 10 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                          {selectedUserData.features.unique_devices_logon > 10 ? 'HIGH' : 'NORMAL'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="text-slate-300">Decoy Access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{selectedUserData.features.accessed_decoy ? 'YES' : 'NO'}</span>
                        <Badge className={selectedUserData.features.accessed_decoy ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                          {selectedUserData.features.accessed_decoy ? 'CRITICAL' : 'SAFE'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span className="text-slate-300">Removable Media</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{selectedUserData.features.files_to_removable || 0}</span>
                        <Badge className={selectedUserData.features.files_to_removable > 10 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                          {selectedUserData.features.files_to_removable > 10 ? 'HIGH' : 'NORMAL'}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
