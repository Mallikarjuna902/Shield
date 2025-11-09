import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, BellRing, X } from 'lucide-react';
import { Button } from './ui/button';
import { useAlerts } from '../../hooks/useAlerts';
import { useAuth } from '../../AuthContext';

const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'high':
      return <AlertCircle className="w-5 h-5 text-orange-500" />;
    case 'medium':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'low':
      return <Info className="w-5 h-5 text-blue-500" />;
    default:
      return <BellRing className="w-5 h-5 text-gray-500" />;
  }
};

export const AlertsList = ({ maxItems = 10 }) => {
  const { user } = useAuth();
  const { alerts, loading, error, markAsRead, markAllAsRead } = useAlerts(user?.uid, maxItems);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading alerts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading alerts: {error}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No alerts to display
      </div>
    );
  }

  const unreadCount = alerts.filter(alert => !alert.read).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-200">Recent Alerts</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500 text-white">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Mark all as read
          </Button>
        )}
      </div>
      
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border ${
              alert.read 
                ? 'bg-gray-900/50 border-gray-800' 
                : 'bg-blue-900/10 border-blue-800/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="pt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-100 truncate">
                      {alert.metadata?.title || alert.type.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      alert.severity === 'critical' ? 'bg-red-900/50 text-red-300' :
                      alert.severity === 'high' ? 'bg-orange-900/50 text-orange-300' :
                      alert.severity === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                      'bg-blue-900/50 text-blue-300'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    {alert.message}
                  </p>
                  {alert.metadata?.details && (
                    <p className="mt-1 text-xs text-gray-500">
                      {alert.metadata.details}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center space-x-3 text-xs text-gray-500">
                    {alert.createdAt && (
                      <span>
                        {new Date(alert.createdAt.seconds * 1000).toLocaleString()}
                      </span>
                    )}
                    {alert.userId && (
                      <span>• User: {alert.metadata?.userName || alert.userId.substring(0, 6)}...</span>
                    )}
                  </div>
                </div>
              </div>
              {!alert.read && (
                <button
                  onClick={() => markAsRead(alert.id)}
                  className="p-1 -m-1 text-gray-400 hover:text-gray-200"
                  title="Mark as read"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsList;
