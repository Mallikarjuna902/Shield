import { Bell, BellRing } from 'lucide-react';
import { useAlerts } from '../hooks/useAlerts';
import { useState, useEffect } from 'react';

export const AlertBadge = ({ userId, className = '' }) => {
  const { alerts } = useAlerts(userId, 50); // Get up to 50 most recent alerts
  const [unreadCount, setUnreadCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate unread count
  useEffect(() => {
    const unread = alerts.filter(alert => !alert.read).length;
    setUnreadCount(unread);
  }, [alerts]);

  // Animate when count changes
  useEffect(() => {
    if (unreadCount > 0) {
      const timer = setTimeout(() => {
        // Trigger animation
        const badge = document.getElementById('alert-badge');
        if (badge) {
          badge.classList.add('animate-ping-once');
          badge.addEventListener('animationend', () => {
            badge.classList.remove('animate-ping-once');
          }, { once: true });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  if (unreadCount === 0) {
    return (
      <div className={`relative ${className}`}>
        <Bell className="w-5 h-5 text-gray-400" />
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? (
        <BellRing className="w-5 h-5 text-yellow-400" />
      ) : (
        <Bell className="w-5 h-5 text-yellow-400" />
      )}
      <span 
        id="alert-badge"
        className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold"
      >
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    </div>
  );
};

export default AlertBadge;
