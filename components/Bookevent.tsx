'use client';

import { useState } from "react";

interface Props {
    eventId: string;
    slug: string;
}

const BookEvent = ({ eventId, slug }: Props) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setStatus('loading');

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, eventId, slug }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMessage(data.message || 'Something went wrong');
                setStatus('error');
                return;
            }

            setStatus('sent');
            setEmail('');
        } catch (error) {
            setErrorMessage('Failed to send verification email');
            setStatus('error');
        }
    };

    if (status === 'sent') {
        return (
            <div className="mt-2">
                <p className="text-green-600 font-medium text-sm">✅ Check your email for verification link!</p>
                <p className="text-gray-600 text-xs mt-1">Click the link to confirm your registration</p>
            </div>
        );
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
                        disabled={status === 'loading'}
                    />
                </div>

                {status === 'error' && errorMessage && (
                    <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                )}

                <button
                    type="submit"
                    className="button-submit"
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? 'Sending email...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default BookEvent;
