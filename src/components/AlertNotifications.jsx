import { useEffect } from 'react';
import { toast } from 'sonner';
import { AlertCircle, BellRing, X } from 'lucide-react';
import { useAlerts } from '../hooks/useAlerts';

export const AlertNotifications = () => {
  const { alerts } = useAlerts(5); // Only show notifications for the 5 most recent alerts

  useEffect(() => {
    // Show toast for new alerts
    const newAlerts = alerts.filter(alert => !alert.read);
    
    newAlerts.forEach(alert => {
      toast.custom((t) => (
        <div className={`p-4 rounded-lg shadow-lg w-80 ${
          alert.severity === 'critical' ? 'bg-red-900/90 border-l-4 border-red-500' :
          alert.severity === 'high' ? 'bg-orange-900/90 border-l-4 border-orange-500' :
          'bg-blue-900/90 border-l-4 border-blue-500'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              {alert.severity === 'critical' || alert.severity === 'high' ? (
                <AlertCircle className="h-5 w-5 text-red-400" />
              ) : (
                <BellRing className="h-5 w-5 text-blue-400" />
              )}
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-white">
                {alert.type.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </p>
              <p className="mt-1 text-sm text-gray-200">
                {alert.message}
              </p>
              <div className="mt-1 flex">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {alert.severity}
                </span>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => toast.dismiss(t)}
                className="inline-flex text-gray-300 hover:text-white focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ), {
        duration: 10000,
        position: 'top-right',
      });
    });
  }, [alerts]);

  return null; // This component doesn't render anything visible
};

export default AlertNotifications;
