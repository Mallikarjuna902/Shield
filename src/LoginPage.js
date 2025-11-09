import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { toast, Toaster } from './components/ui/sonner';
import { ShieldCheck, Lock, Mail, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-slate-800/60 backdrop-blur-md bg-slate-900/80">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 pulse-glow">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Shield
            </h1>
            <p className="text-slate-400 text-sm mt-2">Secure Access Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                data-testid="login-email-input"
                placeholder="analyst@security.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-900/70 border-slate-700/80 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                data-testid="login-password-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-900/70 border-slate-700/80 focus:ring-cyan-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="login-submit-btn"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-3 rounded-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-sm text-slate-400 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Create one
            </Link>
          </p>
          
          <div className="mt-4">
            <Link 
              to="/signup" 
              className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Create New Account
            </Link>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
