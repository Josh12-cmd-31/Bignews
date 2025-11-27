import React, { useState, useEffect } from 'react';
import { X, Lock, User, Key, LogIn, AlertCircle, Save } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedCreds = localStorage.getItem('bigNewsAdminCredentials');
      setIsFirstTime(!storedCreds);
      // Clear fields on open
      setUsername('');
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Normalize inputs: trim whitespace to prevent mismatch issues
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // Simulate network delay for realism
    setTimeout(() => {
      const storedCredsJson = localStorage.getItem('bigNewsAdminCredentials');

      if (!storedCredsJson) {
        // First time login - set credentials
        if (cleanUsername.length < 3 || cleanPassword.length < 3) {
           setError('Username and password must be at least 3 characters long.');
           setIsLoading(false);
           return;
        }

        const newCreds = { username: cleanUsername, password: cleanPassword };
        localStorage.setItem('bigNewsAdminCredentials', JSON.stringify(newCreds));
        
        onLogin();
        onClose();
      } else {
        // Standard login - verify credentials
        try {
          const storedCreds = JSON.parse(storedCredsJson);
          if (cleanUsername === storedCreds.username && cleanPassword === storedCreds.password) {
            onLogin();
            onClose();
          } else {
            setError('Invalid credentials. Please try again.');
          }
        } catch (e) {
          // Fallback if local storage is corrupted
           localStorage.removeItem('bigNewsAdminCredentials');
           setError('Stored credentials corrupted. Please reset by logging in again.');
           setIsFirstTime(true);
        }
      }
      setIsLoading(false);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white font-serif flex items-center gap-2">
              <Lock size={24} className="text-blue-500" />
              {isFirstTime ? 'Set Admin Access' : 'Admin Login'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {isFirstTime 
                ? 'Create your admin credentials to secure the dashboard.' 
                : 'Please log in to manage content.'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {isFirstTime && (
              <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-lg text-sm mb-4">
                <strong>First-time Setup:</strong> The username and password you enter below will become your permanent admin credentials.
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder={isFirstTime ? "Create username" : "Enter username"}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder={isFirstTime ? "Create password" : "Enter password"}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                isFirstTime ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>Processing...</>
              ) : (
                <>
                  {isFirstTime ? <Save size={18} /> : <LogIn size={18} />}
                  {isFirstTime ? 'Save Credentials & Login' : 'Login to Dashboard'}
                </>
              )}
            </button>
            
            {!isFirstTime && (
              <div className="text-center text-xs text-slate-400 mt-4">
                Use your previously set credentials.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;