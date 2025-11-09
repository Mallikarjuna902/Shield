import { useState, useEffect, useRef } from 'react';
import { ChevronDown, User, Search } from 'lucide-react';

export function UserSelector({ users, selectedUser, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUserData = users.find(user => user.value === selectedUser) || {};

  const handleUserSelect = (user) => {
    onSelect(user.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full md:w-64" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700 rounded-lg px-4 py-2.5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-cyan-400">
            <User className="w-4 h-4" />
          </div>
          <span className="text-white font-medium truncate">
            {selectedUserData?.label || 'Select User'}
          </span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden transition-all duration-200 ease-out">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
              />
            </div>
          </div>
          
          {/* User List */}
          <div className="max-h-64 overflow-y-auto">
            <div className="p-1.5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.value}
                    onClick={() => handleUserSelect(user)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-md cursor-pointer transition-colors ${
                      selectedUser === user.value
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-cyan-400 flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{user.label}</div>
                  {user.role && (
                    <div className="text-xs text-slate-400 truncate">{user.role}</div>
                  )}
                </div>
                {user.riskLevel && (
                  <div className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${
                    user.riskLevel === 'High' 
                      ? 'bg-red-500/20 text-red-400'
                      : user.riskLevel === 'Medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {user.riskLevel}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-slate-400">
              <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No users found</p>
            </div>
          )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
