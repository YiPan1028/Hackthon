import React, { useState } from 'react';
import { Heart, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { apiService } from '../services/apiService';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

type Mode = 'login' | 'register';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        // 1) Register
        const regRes = await apiService.register(email, password);
        if (!regRes.success) {
          setError(regRes.detail || 'Registration failed.');
          return;
        }

        // 2) Auto-login after register
        const loginRes = await apiService.login(email, password);
        if (loginRes.success) {
          onLoginSuccess(loginRes.user);
        } else {
          setError(loginRes.detail || 'Login failed after registration.');
        }
        return;
      }

      // Login mode
      const response = await apiService.login(email, password);
      if (response.success) {
        onLoginSuccess(response.user);
      } else {
        setError(response.detail || 'Access denied. Please check your credentials.');
      }
    } catch (err) {
      setError('Connection to secure server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl" />

        <div className="text-center mb-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30 mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {mode === 'login' ? 'Sign in to access your emotional vault' : 'Register to start saving logs to the database'}
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-6 relative z-10">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`py-3 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all
              ${mode === 'login'
                ? 'bg-rose-500/15 border-rose-500/30 text-white'
                : 'bg-black/20 border-white/10 text-stone-400 hover:text-white hover:bg-white/5'
              }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-3 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all
              ${mode === 'register'
                ? 'bg-rose-500/15 border-rose-500/30 text-white'
                : 'bg-black/20 border-white/10 text-stone-400 hover:text-white hover:bg-white/5'
              }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">
              Password (min 6 chars)
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center animate-in shake duration-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-900/20 group disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Continue' : 'Create Account'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-stone-500 text-[10px] uppercase tracking-widest font-medium leading-relaxed">
            Secured by LoveCare Python API <br />
            <span className="text-rose-500/60">End-to-End Emotional Encryption</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
