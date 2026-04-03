'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, LogOut, LayoutDashboard, Menu, X, User } from 'lucide-react';

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 0); return () => clearTimeout(t); }, []);
  if (!mounted) return <div className="w-8 h-8" />;
  const isDark = resolvedTheme === 'dark';
  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.08 }}
      className="w-8 h-8 rounded-lg flex items-center justify-center dark:bg-white/5 bg-black/5 dark:hover:bg-white/10 hover:bg-black/10 border dark:border-white/10 border-black/10 transition-colors"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        <motion.div key={isDark ? 'sun' : 'moon'}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Sun size={14} className="text-cyan-400" /> : <Moon size={14} className="text-indigo-600" />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

const Navbar = () => {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = session?.user?.role === 'admin';

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <header className="sticky top-0 z-10 backdrop-blur-sm border-b dark:border-white/6 border-black/6 transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

     {/* Logo */}
<Link href="/" className="flex items-center gap-2.5 group">
  <motion.div
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
    className="relative w-9 h-9 flex items-center justify-center"
  >
    {/* Glow pulse */}
    <motion.div
      className="absolute inset-0 rounded-xl"
      style={{ background: '#5dfeca', filter: 'blur(8px)', opacity: 0.25 }}
      animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
    {/* Box */}
    <div
      className="relative w-9 h-9 rounded-xl flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111 100%)',
        border: '1.5px solid rgba(93,254,202,0.5)',
        boxShadow: '0 0 16px rgba(93,254,202,0.3), inset 0 0 12px rgba(93,254,202,0.05)',
      }}
    >
      <span
        className="font-black text-base"
        style={{
          color: '#5dfeca',
          textShadow: '0 0 10px rgba(93,254,202,0.8)',
          letterSpacing: '-0.03em',
        }}
      >
        E
      </span>
    </div>
  </motion.div>

  {/* Text */}
  <div className="flex flex-col leading-none">
    <span
      className="font-black text-sm tracking-tight"
      style={{
        background: 'linear-gradient(90deg, #5dfeca, #38f0b8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: 'none',
      }}
    >
      DevEvent
    </span>
    <span className="text-[9px] font-semibold dark:text-white/30 text-black/30 tracking-[0.15em] uppercase">
      Platform
    </span>
  </div>
</Link>
        {/* Desktop nav */}
        <ul className="hidden sm:flex items-center gap-1">
          {/* Home — visible to everyone */}
          <li>
            <Link href="/" className="px-3 py-1.5 rounded-lg text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-black/5 transition-all">
              Home
            </Link>
          </li>

          {session ? (
            <>
              {/* Admin-only links */}
              {isAdmin && (
                <>
                  <li>
                    <Link href="/events/create" className="px-3 py-1.5 rounded-lg text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-black/5 transition-all">
                      Create Event
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-cyan-500 dark:hover:bg-cyan-500/10 hover:bg-cyan-50 transition-all">
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                  </li>
                </>
              )}

              {/* Regular user: show name/avatar only */}
              {!isAdmin && (
                <li className="flex items-center gap-2 px-2 py-1">
                  {session.user?.image ? (
                    <Image src={session.user.image} alt="avatar" width={24} height={24} className="rounded-full border dark:border-white/20 border-black/10" />
                  ) : (
                    <User size={14} className="dark:text-gray-400 text-gray-600" />
                  )}
                  <span className="text-sm dark:text-gray-300 text-gray-700 max-w-[100px] truncate">{session.user?.name}</span>
                </li>
              )}

              {/* Sign out — both roles */}
              <li>
                <button onClick={handleSignOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm dark:text-gray-400 text-gray-600 dark:hover:text-red-400 hover:text-red-500 dark:hover:bg-red-500/10 hover:bg-red-50 transition-all">
                  <LogOut size={14} /> Sign Out
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link href="/admin/login" className="px-3 py-1.5 rounded-lg text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-black/5 transition-all">
                Sign In
              </Link>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={14} className="dark:text-white text-gray-900" /> : <Menu size={14} className="dark:text-white text-gray-900" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden overflow-hidden backdrop-blur-sm border-t dark:border-white/6 border-black/6"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {/* Home — always */}
              <Link href="/" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-sm dark:text-gray-300 text-gray-700 dark:hover:bg-white/5 hover:bg-black/5 transition-colors">
                Home
              </Link>

              {session ? (
                <>
                  {/* Admin-only */}
                  {isAdmin && (
                    <>
                      <Link href="/events/create" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-sm dark:text-gray-300 text-gray-700 dark:hover:bg-white/5 hover:bg-black/5 transition-colors">
                        Create Event
                      </Link>
                      <Link href="/admin" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-sm text-cyan-500 dark:hover:bg-cyan-500/10 hover:bg-cyan-50 transition-colors">
                        <LayoutDashboard size={14} className="inline mr-2" />Dashboard
                      </Link>
                    </>
                  )}

                  {/* User name in mobile */}
                  {!isAdmin && (
                    <div className="flex items-center gap-2 px-3 py-2">
                      {session.user?.image ? (
                        <Image src={session.user.image} alt="avatar" width={20} height={20} className="rounded-full" />
                      ) : (
                        <User size={14} className="dark:text-gray-400 text-gray-600" />
                      )}
                      <span className="text-sm dark:text-gray-300 text-gray-700 truncate">{session.user?.name}</span>
                    </div>
                  )}

                  {/* Sign out — both roles */}
                  <button onClick={() => { setMobileOpen(false); handleSignOut(); }} className="px-3 py-2 rounded-lg text-sm text-left text-red-400 dark:hover:bg-red-500/10 hover:bg-red-50 transition-colors">
                    <LogOut size={14} className="inline mr-2" />Sign Out
                  </button>
                </>
              ) : (
                <Link href="/admin/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-sm dark:text-gray-300 text-gray-700 dark:hover:bg-white/5 hover:bg-black/5 transition-colors">
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
