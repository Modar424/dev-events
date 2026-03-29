'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Edit, Plus } from 'lucide-react';

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

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalBookings: 0,
    upcomingEvents: 0,
    pastEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<EventMode>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await fetch('/api/events');
        const eventsData = await eventsRes.json();
        const allEvents = eventsData.events || [];
        setEvents(allEvents);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingCount = allEvents.filter((event: Event) => {
          const eventDate = new Date(event.date);
          return eventDate >= today;
        }).length;

        const pastCount = allEvents.length - upcomingCount;

        let totalBookings = 0;
        for (const event of allEvents) {
          const bookingRes = await fetch(`/api/bookings?slug=${event.slug}`);
          const bookingData = await bookingRes.json();
          totalBookings += bookingData.count || 0;
        }

        setStats({
          totalEvents: allEvents.length,
          totalBookings,
          upcomingEvents: upcomingCount,
          pastEvents: pastCount,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = filterMode === 'all' || event.mode === filterMode;
    return matchesSearch && matchesMode;
  });

  const handleDelete = async (slug: string) => {
    try {
      const response = await fetch(`/api/events/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete event');

      setEvents(events.filter(e => e.slug !== slug));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="text-center">
          <p className="text-lg text-gray-400">Loading dashboard...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 sm:space-y-8 py-8 md:py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">Manage Events</p>
        </div>
        <Link
          href="/events/create"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-cyan-500 hover:bg-cyan-600 text-black text-sm sm:text-base font-bold rounded-lg transition"
        >
          <Plus size={20} />
          Create Event
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          icon="📅"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon="👥"
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          icon="🔜"
        />
        <StatCard
          title="Past Events"
          value={stats.pastEvents}
          icon="✓"
        />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-600 rounded-lg bg-black text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
        />
        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value as EventMode)}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-600 rounded-lg bg-black text-white focus:outline-none focus:border-cyan-400"
        >
          <option value="all">All Types</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      {/* Events Table */}
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900">
                <th className="px-6 py-3 text-left text-sm font-semibold">Event</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <tr key={event._id} className="border-b border-gray-700 hover:bg-gray-900/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={event.image}
                          alt={event.title}
                          width={50}
                          height={50}
                          className="rounded object-cover"
                        />
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-400">{event.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{event.location}</td>
                    <td className="px-6 py-4 text-sm">{event.date}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        {event.mode === 'offline' ? 'Offline' : event.mode === 'online' ? 'Online' : 'Hybrid'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/events/${event.slug}/edit`}
                          className="p-2 hover:bg-gray-700 rounded transition"
                          title="Edit"
                        >
                          <Edit size={18} className="text-blue-400" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(event.slug)}
                          className="p-2 hover:bg-gray-700 rounded transition"
                          title="Delete"
                        >
                          <Trash2 size={18} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-sm mx-4">
            <h2 className="text-2xl font-bold mb-2">Delete Event?</h2>
            <p className="text-gray-400 mb-6">This action cannot be undone. All bookings will be permanently lost.</p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-600 hover:border-gray-400 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}