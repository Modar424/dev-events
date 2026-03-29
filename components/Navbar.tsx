'use client';

import Link from 'next/link';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // ✅ استخدام setTimeout لتجنب التحذير
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  
  if (!mounted) return <div className="w-8 h-8" />;
  const isDark = resolvedTheme === 'dark';
  
  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.08 }}
      className="w-8 h-8 rounded-lg flex items-center justify-center dark:bg-white/5 bg-black/5 dark:hover:bg-white/10 hover:bg-black/10 border dark:border-white/10 border-black/10 transition-colors"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? 'sun' : 'moon'}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {isDark
            ? <Sun size={14} className="text-cyan-400" />
            : <Moon size={14} className="text-indigo-600" />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

const Navbar = () => {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <header className="sticky top-0 z-50 dark:bg-[#030708]/80 bg-white/80 backdrop-blur-xl border-b dark:border-white/6 border-black/6 transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
         <motion.div
  whileHover={{ scale: 1.1, rotate: 360 }}
  transition={{ duration: 0.3 }}
  className="w-9 h-9 rounded-full bg-gradient from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/50"
>
  <span className="text-white font-bold text-base">EV</span>
</motion.div>
          <span className="font-bold text-sm dark:text-white text-gray-900 tracking-wide">DevEvent</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden sm:flex items-center gap-1">
          <li>
            <Link href="/" className="px-3 py-1.5 rounded-lg text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-black/5 transition-all">
              Home
            </Link>
          </li>
          <li>
            <Link href="/events/create" className="px-3 py-1.5 rounded-lg text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-black/5 transition-all">
              Create Event
            </Link>
          </li>
          {session ? (
            <>
              <li>
                <Link href="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-cyan-500 dark:hover:bg-cyan-500/10 hover:bg-cyan-50 transition-all">
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
              </li>
              <li>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm dark:text-gray-400 text-gray-600 dark:hover:text-red-400 hover:text-red-500 dark:hover:bg-red-500/10 hover:bg-red-50 transition-all"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link href="/admin" className="px-3 py-1.5 rounded-lg text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-black/5 transition-all">
                Admin
              </Link>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Mobile menu button */}
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
            className="sm:hidden overflow-hidden dark:bg-[#030708]/95 bg-white/95 backdrop-blur-xl border-t dark:border-white/6 border-black/6"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {[
                { href: '/', label: 'Home' },
                { href: '/events/create', label: 'Create Event' },
                ...(session ? [] : [{ href: '/admin', label: 'Admin' }]),
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm dark:text-gray-300 text-gray-700 dark:hover:bg-white/5 hover:bg-black/5 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              {session && (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm text-cyan-500 dark:hover:bg-cyan-500/10 hover:bg-cyan-50 transition-colors"
                  >
                    <LayoutDashboard size={14} className="inline mr-2" /> Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleSignOut();
                    }}
                    className="px-3 py-2 rounded-lg text-sm text-left text-red-400 dark:hover:bg-red-500/10 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} className="inline mr-2" /> Sign Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;