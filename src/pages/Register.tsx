import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ForestEnvironment } from '../components/ForestEnvironment';
import { AuthService } from '../services/authService';
import { ProfileService } from '../services/profileService';
import { soundscape } from '../services/soundscape';
import { ArrowLeft, Eye, EyeOff, UserPlus, Sparkles, Check } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!displayName.trim()) {
      setErrorMsg('Please provide a display name for your sanctuary identity.');
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('Please acknowledge the sanctuary viewing guidelines.');
      return;
    }

    setLoading(true);
    soundscape.playTuningClick();

    setTimeout(async () => {
      const res = await AuthService.register(displayName, username, email, password);
      if (!res.success || !res.account) {
        setLoading(false);
        soundscape.playStaticBurst(200);
        setErrorMsg(res.error || 'Registration failed.');
        return;
      }

      // Automatically create their primary clearing profile matching their display name
      await ProfileService.createProfile(res.account.id, displayName, 'orchid');

      soundscape.playStaticBurst(300);
      setLoading(false);
      // Direct user into Choose Your Clearing
      navigate('/choose-your-clearing');
    }, 450);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* 1. Forest Environment */}
      <ForestEnvironment intensity="subtle" showCRTAnchor={true} />

      {/* 2. Registration Card */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-[#030E0B]/92 border border-[#14352B] p-6 sm:p-8 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-left">
        
        {/* Top Back Link */}
        <div className="flex items-center justify-between pb-4 border-b border-[#14352B]/70 text-xs font-mono">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[#D8C9A5]/60 hover:text-[#A7F3D0] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>The Sanctuary</span>
          </Link>
          <span className="text-[#EC4899]/70">NEW CLEARING REGISTRY</span>
        </div>

        {/* Heading & Welcoming Description */}
        <div className="my-5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-[#A7F3D0]">
            <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
            <span>INITIAL REEL REGISTRATION</span>
          </div>
          <h1 className="font-editorial text-3xl font-light text-[#A7F3D0] tracking-wide crt-glow">
            Find Your Roots
          </h1>
          <p className="font-editorial text-sm text-[#D8C9A5]/80 leading-relaxed">
            Create an account to establish your personal viewing clearings, preserve your own VHS tape vault, and maintain private viewing notes.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Display Name & Username (2-column on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono text-[#D8C9A5]/80 uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. Kagami"
                className="w-full rounded-lg bg-[#020705] border border-[#14352B] py-2 px-3 text-sm font-mono text-[#A7F3D0] placeholder-[#D8C9A5]/30 focus:outline-none focus:border-[#A7F3D0]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#D8C9A5]/80 uppercase tracking-wider mb-1">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. ikagam"
                className="w-full rounded-lg bg-[#020705] border border-[#14352B] py-2 px-3 text-sm font-mono text-[#A7F3D0] placeholder-[#D8C9A5]/30 focus:outline-none focus:border-[#A7F3D0]"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-mono text-[#D8C9A5]/80 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="you@sanctuary.tv"
              className="w-full rounded-lg bg-[#020705] border border-[#14352B] py-2 px-3 text-sm font-mono text-[#A7F3D0] placeholder-[#D8C9A5]/30 focus:outline-none focus:border-[#A7F3D0]"
            />
          </div>

          {/* Password & Confirm Password (2-column on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono text-[#D8C9A5]/80 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#D8C9A5]/50 hover:text-[#A7F3D0]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Min 6 characters"
                className="w-full rounded-lg bg-[#020705] border border-[#14352B] py-2 px-3 text-sm font-mono text-[#A7F3D0] placeholder-[#D8C9A5]/30 focus:outline-none focus:border-[#A7F3D0]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#D8C9A5]/80 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Re-enter password"
                className="w-full rounded-lg bg-[#020705] border border-[#14352B] py-2 px-3 text-sm font-mono text-[#A7F3D0] placeholder-[#D8C9A5]/30 focus:outline-none focus:border-[#A7F3D0]"
              />
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs font-mono text-[#D8C9A5]/70 hover:text-[#D8C9A5]">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 rounded bg-[#020705] border-[#14352B] accent-[#EC4899]"
              />
              <span className="leading-relaxed">
                I honor the quiet sanctuary, accept the viewing guidelines, and will treat the archive with care.
              </span>
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
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#061D16] border border-[#EC4899]/80 text-sm font-mono text-[#EC4899] hover:bg-[#0E281F] hover:border-[#EC4899] hover:box-orchid-glow disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg group"
          >
            <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>{loading ? 'PLANTING YOUR ROOTS...' : 'CREATE MY ACCOUNT'}</span>
          </button>
        </form>

        {/* Footer Link to Enter the Grove */}
        <div className="mt-5 pt-4 border-t border-[#14352B]/60 text-center text-xs font-mono text-[#D8C9A5]/70">
          <span>Already have a place here? </span>
          <Link
            to="/login"
            className="text-[#A7F3D0] hover:text-[#EC4899] hover:underline font-semibold ml-1"
          >
            Enter the Grove.
          </Link>
        </div>
      </div>
    </div>
  );
};
