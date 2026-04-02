'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  LogOut,
  Sun,
  Moon,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';

interface Event {
  _id: string;
  title: string;
  slug: string;
  location: string;
  date: string;
  mode: string;
  image: string;
}

interface Stats {
  totalEvents: number;
  totalBookings: number;
  upcomingEvents: number;
  pastEvents: number;
}

type EventMode = 'all' | 'online' | 'offline' | 'hybrid';

// ─── CountUp hook ──────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (target === 0 || started.current) return;
    started.current = true;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

// ─── Theme Toggle ──────────────────────────────────────────────────────────────
function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  
  if (!mounted) {
    return <div className="w-9 h-9" />;
  }
  
  const isDark = resolvedTheme === 'dark';
  
  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 dark:bg-white/5 bg-black/5 dark:hover:bg-white/10 hover:bg-black/10 dark:border-white/10 border-black/10 border"
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.05 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? 'sun' : 'moon'}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? (
            <Sun size={16} className="text-cyan-400" />
          ) : (
            <Moon size={16} className="text-indigo-600" />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl p-6 dark:bg-white/3 bg-white dark:border-white/6 border-black/6 border animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 w-24 rounded dark:bg-white/10 bg-black/10 mb-3" />
          <div className="h-8 w-16 rounded dark:bg-white/10 bg-black/10" />
        </div>
        <div className="h-12 w-12 rounded-2xl dark:bg-white/10 bg-black/10" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b dark:border-white/6 border-black/6 animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg dark:bg-white/10 bg-black/10" />
          <div>
            <div className="h-3 w-32 rounded dark:bg-white/10 bg-black/10 mb-2" />
            <div className="h-2 w-20 rounded dark:bg-white/10 bg-black/10" />
          </div>
        </div>
        </td>
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-3 w-20 rounded dark:bg-white/10 bg-black/10" />
        </td>
      ))}
    </tr>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon: Icon,
  gradFrom,
  gradTo,
  delay = 0,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  gradFrom: string;
  gradTo: string;
  delay?: number;
}) {
  const count = useCountUp(value);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.03, y: -4 }}
      className="relative rounded-2xl p-6 cursor-default overflow-hidden dark:bg-white/3 bg-white border transition-all duration-300"
      style={{
        borderColor: hovered ? gradFrom : 'rgba(0,0,0,0.06)',
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.15), 0 0 20px ${gradFrom}22` : 'none',
      }}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10"
            style={{
              background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
            }}
          />
        )}
      </AnimatePresence>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider dark:text-gray-500 text-gray-400 mb-2">
            {title}
          </p>
          <p className="text-4xl font-bold dark:text-white text-gray-900 tabular-nums">
            {count}
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${gradFrom}30, ${gradTo}20)` }}
        >
          <Icon size={22} style={{ color: gradFrom }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({
  slug,
  onConfirm,
  onCancel,
}: {
  slug: string;
  onConfirm: (slug: string) => void;
  onCancel: () => void;
}) {
  const [shakeTrigger, setShakeTrigger] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl p-6 dark:bg-gray-900 bg-white"
        style={{ border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 0 60px rgba(239,68,68,0.1)' }}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-lg dark:hover:bg-white/10 hover:bg-black/10 transition-colors"
        >
          <X size={16} className="dark:text-gray-400 text-gray-500" />
        </button>
        <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-red-500/10">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-center dark:text-white text-gray-900 mb-2">Delete Event?</h2>
        <p className="text-sm text-center dark:text-gray-400 text-gray-500 mb-6">
          This action cannot be undone. All bookings will be permanently lost.
        </p>
        <div className="flex gap-3">
          <motion.button
            onHoverStart={() => setShakeTrigger((p) => p + 1)}
            animate={shakeTrigger > 0 ? { x: [0, -5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
            onClick={() => onConfirm(slug)}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            Delete
          </motion.button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm dark:text-white text-gray-900 dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats>({ totalEvents: 0, totalBookings: 0, upcomingEvents: 0, pastEvents: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<EventMode>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/admin/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const fetchData = async () => {
      try {
        const eventsRes = await fetch('/api/events');
        const eventsData = await eventsRes.json();
        const allEvents = eventsData.events || [];
        setEvents(allEvents);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const upcomingCount = allEvents.filter((e: Event) => new Date(e.date) >= today).length;
        let totalBookings = 0;
        for (const event of allEvents) {
          const r = await fetch(`/api/bookings?slug=${event.slug}`);
          const d = await r.json();
          totalBookings += d.count || 0;
        }
        setStats({ totalEvents: allEvents.length, totalBookings, upcomingEvents: upcomingCount, pastEvents: allEvents.length - upcomingCount });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [status]);

  const filteredEvents = events.filter((e) => {
    const s = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.location.toLowerCase().includes(searchTerm.toLowerCase());
    const m = filterMode === 'all' || e.mode === filterMode;
    return s && m;
  });

  const handleDelete = async (slug: string) => {
    const id = toast.loading('Deleting...');
    try {
      const res = await fetch(`/api/events/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setEvents((prev) => prev.filter((e) => e.slug !== slug));
      setDeleteConfirm(null);
      toast.success('Event deleted', { id });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed', { id });
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
    toast.success('Signed out');
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#030708] bg-gray-50">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen dark:bg-[#030708] bg-gray-50">
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(34,211,238,0.04) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(168,85,247,0.04) 0%, transparent 50%)' }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold dark:text-white text-gray-900">Dashboard</h1>
              <p className="text-sm dark:text-gray-500 text-gray-400 mt-1">
                Welcome back, <span className="text-cyan-500">{session?.user?.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/events/create" className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-black transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #22d3ee, #a855f7)', boxShadow: '0 0 20px rgba(34,211,238,0.3)' }}>
                <Plus size={16} /> New Event
              </Link>
              <motion.button onClick={handleSignOut} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all dark:text-gray-400 dark:hover:text-red-400 text-gray-600 hover:text-red-500 dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border">
                <LogOut size={16} /> Sign Out
              </motion.button>
            </div>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 px-4 py-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                <AlertTriangle size={16} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <>
                <StatCard title="Total Events" value={stats.totalEvents} icon={Calendar} gradFrom="#22d3ee" gradTo="#6366f1" delay={0} />
                <StatCard title="Total Bookings" value={stats.totalBookings} icon={Users} gradFrom="#a855f7" gradTo="#ec4899" delay={0.1} />
                <StatCard title="Upcoming Events" value={stats.upcomingEvents} icon={Clock} gradFrom="#34d399" gradTo="#22d3ee" delay={0.2} />
                <StatCard title="Past Events" value={stats.pastEvents} icon={CheckCircle} gradFrom="#6366f1" gradTo="#a855f7" delay={0.3} />
              </>
            )}
          </div>

          {/* Search & Filter */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 dark:text-gray-500 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search events..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all dark:bg-white/4 bg-white dark:border-white/8 border-black/8 border dark:text-white text-gray-900 dark:placeholder-gray-600 placeholder-gray-400 focus:border-cyan-500/50" 
              />
            </div>
            <div className="relative">
              <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 dark:text-gray-500 text-gray-400 pointer-events-none" />
              <select 
                value={filterMode} 
                onChange={(e) => setFilterMode(e.target.value as EventMode)} 
                className="pl-10 pr-8 py-2.5 rounded-xl text-sm outline-none appearance-none dark:bg-white/4 bg-white dark:border-white/8 border-black/8 border dark:text-white text-gray-900 cursor-pointer min-w-[140px]"
              >
                <option value="all">All Types</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-2xl overflow-hidden dark:bg-white/2 bg-white dark:border-white/6 border-black/6 border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="dark:border-b dark:border-white/6 border-b border-black/6">
                    {['Event', 'Location', 'Date', 'Type', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider dark:text-gray-500 text-gray-500 ${i === 1 ? 'hidden md:table-cell' : ''} ${i === 2 ? 'hidden lg:table-cell' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : filteredEvents.length > 0 ? (
                    filteredEvents.map((event, index) => (
                      <motion.tr
                        key={event._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="dark:border-b dark:border-white/4 border-b border-black/4 dark:hover:bg-white/2 hover:bg-black/2 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Image src={event.image} alt={event.title} width={40} height={40} className="rounded-lg object-cover shrink-0" />
                            <div>
                              <p className="font-medium text-sm dark:text-white text-gray-900 line-clamp-1">{event.title}</p>
                              <p className="text-xs dark:text-gray-500 text-gray-400 mt-0.5">{event.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm dark:text-gray-400 text-gray-600 hidden md:table-cell">{event.location}</td>
                        <td className="px-6 py-4 text-sm dark:text-gray-400 text-gray-600 hidden lg:table-cell">{event.date}</td>
                        <td className="px-6 py-4">
                          <span 
                            className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{ 
                              background: event.mode === 'online' ? 'rgba(34,211,238,0.1)' : event.mode === 'offline' ? 'rgba(168,85,247,0.1)' : 'rgba(52,211,153,0.1)', 
                              color: event.mode === 'online' ? '#22d3ee' : event.mode === 'offline' ? '#a855f7' : '#34d399' 
                            }}
                          >
                            {event.mode.charAt(0).toUpperCase() + event.mode.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <Link href={`/events/${event.slug}/edit`} className="p-2 rounded-lg dark:hover:bg-blue-500/20 hover:bg-blue-50 transition-colors group">
                              <Edit size={16} className="text-blue-400" />
                            </Link>
                            <button onClick={() => setDeleteConfirm(event.slug)} className="p-2 rounded-lg dark:hover:bg-red-500/20 hover:bg-red-50 transition-colors">
                              <Trash2 size={16} className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center dark:text-gray-500 text-gray-400 text-sm">No events found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <AnimatePresence>
        {deleteConfirm && <DeleteModal slug={deleteConfirm} onConfirm={handleDelete} onCancel={() => setDeleteConfirm(null)} />}
      </AnimatePresence>
    </>
  );
}