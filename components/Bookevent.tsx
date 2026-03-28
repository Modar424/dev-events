'use client';

import { useState } from "react";

interface Props {
    eventId: string;
    slug: string;
}

const BookEvent = ({ eventId, slug }: Props) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, eventId, slug }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Something went wrong');
                return;
            }

            setSubmitted(true);
        } catch {
            setError('Failed to book. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return <p className="text-sm mt-2">Thank you for signing up!</p>;
    }

    return (
        <div id="book-event">
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        id="email"
                        placeholder="Enter your email address"
                        required
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                )}

                <button
                    type="submit"
                    className="button-submit"
                    disabled={loading}
                >
                    {loading ? 'Booking...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default BookEvent;
