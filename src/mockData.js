export const mockAlerts = [
    {
      id: 'alert-001',
      timestamp: '2025-01-15 14:32:18',
      user: 'john.doe',
      event: 'Unusual file access pattern',
      severity: 'high',
      score: '0.89',
      explanation: 'User accessed 47 confidential files within 15 minutes, which is 5x above their normal baseline. Access occurred during off-hours from an unusual IP address.'
    },
    {
      id: 'alert-002',
      timestamp: '2025-01-15 13:45:22',
      user: 'sarah.chen',
      event: 'Multiple failed login attempts',
      severity: 'medium',
      score: '0.67',
      explanation: 'Five failed login attempts detected from three different locations within 30 minutes, followed by successful authentication from a new device.'
    },
    {
      id: 'alert-003',
      timestamp: '2025-01-15 12:18:55',
      user: 'mike.jones',
      event: 'Large data download',
      severity: 'high',
      score: '0.92',
      explanation: 'Downloaded 15GB of sensitive customer data to external storage. This volume is unprecedented for this user and occurred just before their scheduled resignation date.'
    },
    {
      id: 'alert-004',
      timestamp: '2025-01-15 11:23:10',
      user: 'emily.watson',
      event: 'Honeytoken access detected',
      severity: 'high',
      score: '0.98',
      explanation: 'Accessed decoy file marked as highly sensitive. This is a clear indicator of unauthorized data exploration and potential insider threat activity.'
    },
    {
      id: 'alert-005',
      timestamp: '2025-01-15 10:47:33',
      user: 'james.lee',
      event: 'Permission escalation attempt',
      severity: 'medium',
      score: '0.71',
      explanation: 'Attempted to access admin-level resources without proper authorization. Multiple privilege escalation commands detected in system logs.'
    },
    {
      id: 'alert-006',
      timestamp: '2025-01-15 09:15:42',
      user: 'lisa.park',
      event: 'Abnormal working hours activity',
      severity: 'low',
      score: '0.54',
      explanation: 'Login detected at 3:47 AM, which is outside normal working hours. However, user has history of occasional late-night work sessions.'
    }
  ];
  
  export const mockUserActivities = [
    { day: 'Mon', events: 45 },
    { day: 'Tue', events: 52 },
    { day: 'Wed', events: 38 },
    { day: 'Thu', events: 67 },
    { day: 'Fri', events: 89 },
    { day: 'Sat', events: 12 },
    { day: 'Sun', events: 8 }
  ];
  
  export const mockUserLogs = [
    {
      timestamp: '2025-01-15 14:23:45',
      action: 'File Access',
      resource: '/docs/confidential/project_alpha.pdf',
      ip: '192.168.1.45',
      status: 'Success'
    },
    {
      timestamp: '2025-01-15 14:18:32',
      action: 'Login',
      resource: 'Web Portal',
      ip: '192.168.1.45',
      status: 'Success'
    },
    {
      timestamp: '2025-01-15 13:56:21',
      action: 'Download',
      resource: '/data/customer_records.csv',
      ip: '192.168.1.45',
      status: 'Success'
    },
    {
      timestamp: '2025-01-15 13:42:18',
      action: 'Permission Request',
      resource: '/admin/settings',
      ip: '192.168.1.45',
      status: 'Denied'
    },
    {
      timestamp: '2025-01-15 13:28:09',
      action: 'File Access',
      resource: '/reports/quarterly_summary.xlsx',
      ip: '192.168.1.45',
      status: 'Success'
    },
    {
      timestamp: '2025-01-15 13:15:44',
      action: 'Database Query',
      resource: 'employee_database',
      ip: '192.168.1.45',
      status: 'Success'
    },
    {
      timestamp: '2025-01-15 12:58:33',
      action: 'File Upload',
      resource: '/shared/team_documents/',
      ip: '192.168.1.45',
      status: 'Success'
    },
    {
      timestamp: '2025-01-15 12:42:27',
      action: 'API Call',
      resource: '/api/user/profile',
      ip: '192.168.1.45',
      status: 'Success'
    }
  ];
  