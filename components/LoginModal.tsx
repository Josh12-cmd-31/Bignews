
import React, { useState, useEffect } from 'react';
import { X, Lock, User, Key, LogIn, AlertCircle, Save, ShieldAlert, Timer } from 'lucide-react';
import Logo from './Logo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  
  // Security State
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const storedCreds = localStorage.getItem('bigNewsAdminCredentials');
      setIsFirstTime(!storedCreds);
      
      // Check Security State
      const storedAttempts = parseInt(localStorage.getItem('bigNewsLoginAttempts') || '0');
      const storedLockout = localStorage.getItem('bigNewsLockoutUntil');

      if (storedLockout && parseInt(storedLockout) > Date.now()) {
        setLockoutUntil(parseInt(storedLockout));
      } else {
        // Reset if lockout expired
        if (storedLockout) {
            localStorage.removeItem('bigNewsLockoutUntil');
            localStorage.setItem('bigNewsLoginAttempts', '0');
            setAttempts(0);
        } else {
            setAttempts(storedAttempts);
        }
        setLockoutUntil(null);
      }

      setUsername('');
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  const handleLockout = () => {
     const lockoutTime = Date.now() + LOCKOUT_DURATION;
     setLockoutUntil(lockoutTime);
     localStorage.setItem('bigNewsLockoutUntil', lockoutTime.toString());
     setError(`Too many failed attempts. System locked for 15 minutes.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lockoutUntil && Date.now() < lockoutUntil) {
        setError(`System is locked for security. Try again later.`);
        return;
    }

    setError('');
    setIsLoading(true);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    setTimeout(() => {
      const storedCredsJson = localStorage.getItem('bigNewsAdminCredentials');

      if (!storedCredsJson) {
        // First Time Setup
        if (cleanUsername.length < 5 || cleanPassword.length < 8) {
           setError('Security Policy: Username > 5 chars, Password > 8 chars.');
           setIsLoading(false);
           return;
        }

        const newCreds = { username: cleanUsername, password: cleanPassword };
        localStorage.setItem('bigNewsAdminCredentials', JSON.stringify(newCreds));
        
        onLogin();
        onClose();
      } else {
        // Login Check
        try {
          const storedCreds = JSON.parse(storedCredsJson);
          if (cleanUsername === storedCreds.username && cleanPassword === storedCreds.password) {
            // Success: Reset attempts
            localStorage.setItem('bigNewsLoginAttempts', '0');
            onLogin();
            onClose();
          } else {
            // Failure
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            localStorage.setItem('bigNewsLoginAttempts', newAttempts.toString());
            
            if (newAttempts >= MAX_ATTEMPTS) {
                handleLockout();
            } else {
                setError(`Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
            }
          }
        } catch (e) {
           localStorage.removeItem('bigNewsAdminCredentials');
           setError('Security error. Credentials reset required.');
           setIsFirstTime(true);
        }
      }
      setIsLoading(false);
    }, 1000); // Artificial delay to slow down brute force scripts
  };

  if (!isOpen) return null;

  const isLocked = lockoutUntil !== null && Date.now() < lockoutUntil;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-950 p-6 flex justify-between items-start border-b border-slate-800">
          <div className="flex flex-col gap-2">
            <Logo isDark={true} />
            <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2 mt-2">
              <ShieldAlert size={20} className={isLocked ? "text-red-500" : "text-green-500"} />
              {isLocked ? 'Security Lockout' : (isFirstTime ? 'Secure Setup' : 'Admin Portal')}
            </h2>
            <p className="text-slate-400 text-sm">
              {isLocked ? 'Access suspended due to suspicious activity.' : 'Enter encrypted credentials to access dashboard.'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 relative">
          {/* Security Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
             <ShieldAlert size={200} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {isLocked ? (
                 <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <Lock size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Access Denied</h3>
                    <p className="text-slate-500 text-sm mt-2">
                        To protect this system from unauthorized access, login has been disabled for 15 minutes.
                    </p>
                    <div className="mt-4 text-xs font-mono bg-slate-100 px-3 py-1 rounded">
                        Error Code: BRUTE_FORCE_DETECTED
                    </div>
                 </div>
            ) : (
                <>
                    <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Username</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Admin ID"
                        autoFocus
                        autoComplete="off"
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
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                        placeholder="••••••••••••"
                        />
                    </div>
                    </div>

                    <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                        isFirstTime ? 'bg-indigo-900 hover:bg-indigo-800' : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                    >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Verifying...
                        </span>
                    ) : (
                        <>
                        {isFirstTime ? <Save size={18} /> : <LogIn size={18} />}
                        {isFirstTime ? 'Set Secure Credentials' : 'Authenticate'}
                        </>
                    )}
                    </button>
                </>
            )}
            
            <div className="flex justify-center items-center gap-2 text-[10px] text-slate-400 mt-6 uppercase tracking-wider">
                <ShieldAlert size={12} />
                <span>256-bit Secure Session</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
