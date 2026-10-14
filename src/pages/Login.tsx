import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ForestEnvironment } from '../components/ForestEnvironment';
import { AuthService } from '../services/authService';
import { soundscape } from '../services/soundscape';
import { ArrowLeft, Eye, EyeOff, LogIn, Sparkles, HelpCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotTip, setShowForgotTip] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your email address or username.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    soundscape.playTuningClick();

    // Natural responsive delay for feel
    setTimeout(async () => {
      const res = await AuthService.login(identifier, password);
      setLoading(false);

      if (!res.success) {
        soundscape.playStaticBurst(200);
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      } else {
        soundscape.playStaticBurst(250);
        // Direct user to Choose Your Clearing
        navigate('/choose-your-clearing');
      }
    }, 400);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* 1. Forest Atmosphere */}
      <ForestEnvironment intensity="subtle" showCRTAnchor={true} />

      {/* 2. Login Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[#030E0B]/92 border border-[#14352B] p-6 sm:p-8 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-left">
        
        {/* Top Back Link & Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-[#14352B]/70 text-xs font-mono">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[#D8C9A5]/60 hover:text-[#A7F3D0] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>The Sanctuary</span>
          </Link>
          <span className="text-[#A7F3D0]/60">PORTAL 01</span>
        </div>

        {/* Heading & Subtitle */}
        <div className="my-6 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-[#A7F3D0]">
            <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
            <span>AUTHENTICATED PASSAGE</span>
          </div>
          <h1 className="font-editorial text-3xl font-light text-[#A7F3D0] tracking-wide crt-glow">
            Enter the Grove
          </h1>
          <p className="font-editorial italic text-sm text-[#D8C9A5]/80">
            Welcome back. Your next story is waiting.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email or Username */}
          <div>
            <label className="block text-xs font-mono text-[#D8C9A5]/80 uppercase tracking-wider mb-1.5">
              Email Address or Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. keeper or you@domain.com"
              className="w-full rounded-lg bg-[#020705] border border-[#14352B] py-2.5 px-3.5 text-sm font-mono text-[#A7F3D0] placeholder-[#D8C9A5]/30 focus:outline-none focus:border-[#A7F3D0] focus:ring-1 focus:ring-[#A7F3D0]"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono text-[#D8C9A5]/80 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotTip(!showForgotTip)}
                className="text-[11px] font-mono text-[#EC4899]/80 hover:text-[#EC4899] transition-colors"
              >
                Forgot password?
              </button>
            </div>
            
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="••••••••"
                className="w-full rounded-lg bg-[#020705] border border-[#14352B] py-2.5 pl-3.5 pr-10 text-sm font-mono text-[#A7F3D0] placeholder-[#D8C9A5]/30 focus:outline-none focus:border-[#A7F3D0] focus:ring-1 focus:ring-[#A7F3D0]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#D8C9A5]/50 hover:text-[#A7F3D0] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {showForgotTip && (
              <div className="mt-2 p-2.5 rounded bg-[#061D16] border border-[#14352B] text-xs font-mono text-[#D8C9A5]/80 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                <span>
                  Demo Account credentials: <strong>keeper</strong> / <strong>admin123</strong>. Or create your own free account via Find Your Roots.
                </span>
              </div>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs font-mono">
            <label className="flex items-center gap-2 cursor-pointer text-[#D8C9A5]/70 hover:text-[#D8C9A5]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-[#020705] border-[#14352B] accent-[#A7F3D0]"
              />
              <span>Remember this station</span>
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-[#260C0A] border border-red-500/50 text-xs font-mono text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#061D16] border border-[#A7F3D0] text-sm font-mono text-[#A7F3D0] hover:bg-[#0A2E22] hover:box-phosphor-glow disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg group"
          >
            <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span>{loading ? 'OPENING THE GROVE...' : 'ENTER THE GROVE'}</span>
          </button>
        </form>

        {/* Footer Link to Find Your Roots */}
        <div className="mt-6 pt-5 border-t border-[#14352B]/60 text-center text-xs font-mono text-[#D8C9A5]/70">
          <span>New to MŨGUMO? </span>
          <Link
            to="/register"
            className="text-[#EC4899] hover:text-[#F472B6] hover:underline font-semibold ml-1"
          >
            Find Your Roots.
          </Link>
        </div>
      </div>
    </div>
  );
};
