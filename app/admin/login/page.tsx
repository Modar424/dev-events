'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Terminal } from 'lucide-react';

// Particle component
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
    const colors = ['#22d3ee', '#a855f7', '#6366f1', '#59deca'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// Typing animation hook
function useTypingAnimation(text: string, speed = 80) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const router = useRouter();
  const { data: session, status } = useSession();

  const { displayed, done } = useTypingAnimation('Admin Portal');

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/admin');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        triggerShake();
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
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
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(34,211,238,0.1) 0%, transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(168,85,247,0.1) 0%, transparent 60%)',
          animation: 'bgShift 8s ease-in-out infinite alternate',
        }}
      />

      <FloatingParticles />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="relative rounded-2xl p-8 overflow-hidden"
          style={{
            background: 'rgba(3, 7, 8, 0.7)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(34,211,238,0.2)',
            boxShadow:
              '0 0 80px rgba(34,211,238,0.05), 0 40px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Top glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)',
            }}
          />

          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(168,85,247,0.2))',
                border: '1px solid rgba(34,211,238,0.3)',
                boxShadow: '0 0 30px rgba(34,211,238,0.1)',
              }}
            >
              <Lock size={28} className="text-cyan-400" />
            </motion.div>

            <h1
              className="text-2xl font-bold text-white mb-1 font-mono tracking-wide"
              style={{ minHeight: '2rem' }}
            >
              {displayed}
              <motion.span
                animate={{ opacity: done ? 0 : [1, 0] }}
                transition={{ repeat: done ? 0 : Infinity, duration: 0.8 }}
                className="inline-block w-0.5 h-5 bg-cyan-400 ml-0.5 align-middle"
              />
            </h1>
            <p className="text-sm text-gray-500">
              Sign in to manage DevEvent
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  height: 'auto',
                  x: shake
                    ? [0, -8, 8, -8, 8, -4, 4, 0]
                    : 0,
                }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 flex items-center gap-2"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                }}
              >
                <span className="text-red-500">⚠</span>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="group"
            >
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@devevent.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(34,211,238,0.5)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(34,211,238,0.08)';
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            {/* Password field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="group"
            >
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(34,211,238,0.5)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(34,211,238,0.08)';
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-3 rounded-xl font-semibold text-sm text-black overflow-hidden transition-all duration-200 disabled:opacity-70"
                style={{
                  background: isLoading
                    ? 'rgba(34,211,238,0.5)'
                    : 'linear-gradient(135deg, #22d3ee, #a855f7)',
                  boxShadow: isLoading
                    ? 'none'
                    : '0 0 30px rgba(34,211,238,0.3)',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow =
                      '0 0 40px rgba(34,211,238,0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 0 30px rgba(34,211,238,0.3)';
                }}
              >
                {/* Shimmer effect */}
                {isLoading && (
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Terminal size={16} />
                      Sign In
                    </>
                  )}
                </span>
              </button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center text-xs text-gray-600"
          >
            Protected admin area · DevEvent Platform
          </motion.p>

          {/* Bottom glow */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent)',
            }}
          />
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes bgShift {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
