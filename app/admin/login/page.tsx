'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Terminal, Zap } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: Particle[] = [];
    const colors = ['#22d3ee', '#a855f7', '#6366f1', '#59deca', '#f472b6'];
    for (let i = 0; i < 70; i++) {
      particles.push({
        id: i, x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5, speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5, opacity: Math.random() * 0.7 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX; p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity; ctx.fill();
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };
    animate();
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

function useTypingAnimation(text: string, speed = 80) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(''); setDone(false); let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else { setDone(true); clearInterval(interval); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return { displayed, done };
}

type LoginMode = 'user' | 'admin';

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { status } = useSession();
  const { displayed, done } = useTypingAnimation(mode === 'admin' ? 'Admin Portal' : 'Welcome Back');

  useEffect(() => { if (status === 'authenticated') router.replace('/'); }, [status, router]);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setIsLoading(true); setError('');
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) setError('Invalid email or password');
      else { router.push('/admin'); router.refresh(); }
    } catch { setError('An unexpected error occurred'); }
    finally { setIsLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true); setError('');
    try { await signIn('google', { callbackUrl: '/' }); }
    catch { setError('Google sign-in failed'); setIsGoogleLoading(false); }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030708]">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#030708]">
      <div className="absolute inset-0 z-0" style={{
        background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(34,211,238,0.1) 0%, transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(168,85,247,0.1) 0%, transparent 60%)',
      }} />
      <FloatingParticles />
      <div className="absolute inset-0 z-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="relative rounded-2xl p-8 overflow-hidden" style={{
          background: 'rgba(3, 7, 8, 0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(34,211,238,0.2)',
          boxShadow: '0 0 80px rgba(34,211,238,0.05), 0 40px 60px rgba(0,0,0,0.5)',
        }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)' }} />

          {/* Mode toggle tabs */}
          <div className="flex mb-8 p-1 rounded-xl gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['user', 'admin'] as LoginMode[]).map((m) => (
              <motion.button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300"
                whileTap={{ scale: 0.97 }}
                style={mode === m ? {
                  background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(168,85,247,0.2))',
                  border: '1px solid rgba(34,211,238,0.3)',
                  color: '#22d3ee',
                  boxShadow: '0 0 15px rgba(34,211,238,0.1)',
                } : { color: 'rgba(255,255,255,0.4)', border: '1px solid transparent' }}
              >
                {m === 'admin' ? '⚡ Admin' : '👤 User'}
              </motion.button>
            ))}
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              key={mode}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{
                background: mode === 'admin'
                  ? 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(168,85,247,0.2))'
                  : 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,211,238,0.2))',
                border: `1px solid ${mode === 'admin' ? 'rgba(34,211,238,0.3)' : 'rgba(99,102,241,0.3)'}`,
                boxShadow: `0 0 30px ${mode === 'admin' ? 'rgba(34,211,238,0.15)' : 'rgba(99,102,241,0.15)'}`,
              }}
            >
              {mode === 'admin' ? <Lock size={28} className="text-cyan-400" /> : <Zap size={28} className="text-indigo-400" />}
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-1 font-mono tracking-wide" style={{ minHeight: '2rem' }}>
              {displayed}
              <motion.span
                animate={{ opacity: done ? 0 : [1, 0] }}
                transition={{ repeat: done ? 0 : Infinity, duration: 0.8 }}
                className="inline-block w-0.5 h-5 bg-cyan-400 ml-0.5 align-middle"
              />
            </h1>
            <p className="text-sm text-gray-500">
              {mode === 'admin' ? 'Sign in to manage DevEvent' : 'Join DevEvent with your Google account'}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 flex items-center gap-2"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <span className="text-red-500">⚠</span> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {mode === 'user' ? (
              <motion.div key="user" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-4">
                <motion.button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                >
                  {isGoogleLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
                </motion.button>
                <p className="text-center text-xs text-gray-600 pt-2">Regular users sign in with Google · Free to join</p>
              </motion.div>
            ) : (
              <motion.form key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="group">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@devevent.com" disabled={isLoading}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(34,211,238,0.5)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(34,211,238,0.08)'; }}
                      onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" disabled={isLoading}
                      className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(34,211,238,0.5)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(34,211,238,0.08)'; }}
                      onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="pt-2">
                  <motion.button type="submit" disabled={isLoading} whileHover={!isLoading ? { y: -2 } : {}} whileTap={{ scale: 0.98 }}
                    className="relative w-full py-3 rounded-xl font-semibold text-sm text-black overflow-hidden transition-all duration-200 disabled:opacity-70"
                    style={{ background: isLoading ? 'rgba(34,211,238,0.5)' : 'linear-gradient(135deg, #22d3ee, #a855f7)', boxShadow: isLoading ? 'none' : '0 0 30px rgba(34,211,238,0.3)' }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Authenticating...</> : <><Terminal size={16} /> Sign In as Admin</>}
                    </span>
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-6 text-center text-xs text-gray-600">
            {mode === 'admin' ? 'Protected admin area · DevEvent Platform' : 'DevEvent · Discover & Join Developer Events'}
          </motion.p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent)' }} />
        </div>
      </motion.div>
    </div>
  );
}
