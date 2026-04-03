'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Registration {
  email: string;
  registeredAt: string;
}

interface EventData {
  eventName: string;
  count: number;
  registrations: Registration[];
}

interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export default function RegistrationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [data, setData] = useState<EventData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/events')
        .then(r => r.json())
        .then(d => setEvents(d.events || []))
        .catch(e => {
          console.error(e);
          toast.error('Failed to load events');
        });
    }
  }, [status]);

  const fetchRegistrations = async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations?slug=${slug}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const d = await res.json();
      setData(d);
      setSelectedSlug(slug);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load registrations');
    }
    setLoading(false);
  };

  const filteredRegistrations = data?.registrations.filter(r =>
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const downloadCSV = () => {
    if (!data) return;

    const headers = ['Email', 'Registered At'];
    const rows = filteredRegistrations.map(r => [
      r.email,
      new Date(r.registeredAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.eventName.replace(/\s+/g, '_')}_registrations.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#030708] bg-gray-50">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="admin-registrations-container">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="admin-registrations-header">
          <Link href="/admin" className="back-button">
            <ArrowLeft size={20} className="back-button-icon" />
          </Link>
          <h1 className="text-3xl font-bold dark:text-white text-gray-900">Event Registrations</h1>
        </div>

        <div className="admin-registrations-grid">
          {/* Events List */}
          <div className="events-list-card">
            <h2 className="events-list-heading">Events</h2>
            <div className="events-list-container">
              {events.map(event => (
                <button
                  key={event.slug}
                  onClick={() => fetchRegistrations(event.slug)}
                  className={`event-button ${
                    selectedSlug === event.slug
                      ? 'event-button-active'
                      : 'event-button-inactive'
                  }`}
                >
                  <p className="event-button-title">{event.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Registrations */}
          <div className="registrations-card">
            {data ? (
              <>
                <div className="registrations-header">
                  <div>
                    <h2 className="registrations-title">{data.eventName}</h2>
                    <p className="registrations-count">{data.count} registrations</p>
                  </div>
                  <button onClick={downloadCSV} className="download-button">
                    <Download size={16} /> Download CSV
                  </button>
                </div>

                {/* Search */}
                <div className="search-input-wrapper">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 dark:text-gray-500 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>

                {/* Table */}
                <div className="registrations-table">
                  <table className="w-full">
                    <thead>
                      <tr className="table-header">
                        <th className="table-header-cell">Email</th>
                        <th className="table-header-cell">Registered At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.length > 0 ? (
                        filteredRegistrations.map((reg, idx) => (
                          <tr key={idx} className="table-row">
                            <td className="table-cell">{reg.email}</td>
                            <td className="table-cell-date">
                              {new Date(reg.registeredAt).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="table-empty">
                            No registrations found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="registrations-loading">
                {loading ? (
                  <>
                    <div className="loading-spinner" />
                    <p>Loading registrations...</p>
                  </>
                ) : (
                  <p>Select an event to view registrations</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
