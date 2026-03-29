'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function RouteLoadingBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const prevPathname = useRef<string>(pathname); // ✅ أعطينا قيمة ابتدائية
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined); // ✅ أعطينا قيمة ابتدائية

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      // تأخير setState باستخدام setTimeout
      const startTimer = setTimeout(() => {
        setLoading(true);
      }, 0);
      
      prevPathname.current = pathname;
      
      // إلغاء المؤقت السابق إذا كان موجوداً
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(() => {
        setLoading(false);
      }, 600);
      
      return () => {
        clearTimeout(startTimer);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loading-bar"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed top-0 left-0 right-0 h-0.5 z-50 origin-left"
          style={{
            background: 'linear-gradient(90deg, #22d3ee, #a855f7, #22d3ee)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1s linear infinite',
          }}
        />
      )}
    </AnimatePresence>
  );
}