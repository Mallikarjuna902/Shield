import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button } from './components/ui/button';
import { Modal } from './components/ui/modal';
import Profile from './components/profile/Profile';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Activity, 
  Menu, 
  X, 
  AlertTriangle, 
  Bell, 
  ChevronDown, 
  LogOut,
  User as UserIcon,
  Brain
} from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/user-activity', label: 'User Activity', icon: Activity },
    { path: '/threat-detection', label: 'AI Threat Detection', icon: Brain },
    { path: '/alert-intelligence', label: 'Incident Response', icon: AlertTriangle },
    { path: '/alert-notifications', label: 'Alert Notifications', icon: Bell }
  ];

  return (
    <div className="min-h-screen cyber-background">
      <nav className="nav-fixed">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-3 group">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent hidden sm:block tracking-tight">
                  Shield
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 text-white hover:bg-slate-800/50 rounded-lg p-1 transition-colors"
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium" data-testid="user-name">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-400">{user?.role || 'Role'}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    {user?.name ? (
                      <span className="text-sm font-medium text-white">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    ) : (
                      <UserIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-slate-900 border border-slate-800 shadow-xl overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          {user?.name ? (
                            <span className="text-sm font-medium text-white">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          ) : (
                            <UserIcon className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">{user?.email || 'user@example.com'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileOpen(true);
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-sm text-left text-slate-300 hover:bg-slate-800/50 flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4" />
                        Profile Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm text-left text-rose-400 hover:bg-slate-800/50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                className="md:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <main className="pt-16">{children}</main>

      {/* Profile Modal */}
      <Modal isOpen={profileOpen} onClose={() => setProfileOpen(false)}>
        <Profile onClose={() => setProfileOpen(false)} />
      </Modal>
    </div>
  );
}
