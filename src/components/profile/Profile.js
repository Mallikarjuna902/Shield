import { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

const Profile = ({ onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    phone: '',
    notify_email: true,
    notify_sms: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load user data from localStorage or API
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setFormData(prev => ({
      ...prev,
      name: storedUser.name || '',
      designation: storedUser.designation || 'Security Analyst',
      department: storedUser.department || 'Threat Monitoring',
      phone: storedUser.phone || '',
      notify_email: storedUser.notify_email !== false,
      notify_sms: storedUser.notify_sms !== false
    }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real app, you would update Firestore here
      // For now, we'll just update localStorage
      const updatedUser = {
        ...user,
        ...formData,
        last_updated: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
      onClose?.();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Profile Settings
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <button className="absolute bottom-0 right-0 bg-slate-800 p-2 rounded-full border border-slate-700 hover:bg-slate-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
        <p className="mt-4 text-slate-300">{user?.email}</p>
        <span className="px-3 py-1 mt-2 text-sm font-medium rounded-full bg-cyan-500/10 text-cyan-400">
          {user?.role || 'Security Analyst'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation" className="text-slate-300">Designation</Label>
            <Input
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="E.g., Security Analyst"
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-slate-300">Department</Label>
            <Input
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="E.g., Threat Monitoring"
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50"
              pattern="\+[0-9]{1,3} [0-9]{5,15}"
              title="Please enter a valid phone number with country code (e.g., +91 9876543210)"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h4 className="text-sm font-medium text-slate-300">Notification Preferences</h4>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="notify_email"
                  checked={formData.notify_email}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-slate-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </div>
              <span className="text-sm text-slate-300">Email Notifications</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="notify_sms"
                  checked={formData.notify_sms}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-slate-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </div>
              <span className="text-sm text-slate-300">SMS Notifications</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <div className="text-sm text-slate-500">
            Last updated: {new Date().toLocaleString()}
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
