import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/database/booking.model';
import Event from '@/database/event.model';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { email, eventId, slug } = await req.json();

        // Validate inputs
        if (!email || !eventId || !slug) {
            return NextResponse.json(
                { message: 'Email, eventId, and slug are required' },
                { status: 400 }
            );
        }

        // Check if user already booked this event
        const existingBooking = await Booking.findOne({ email, slug });
        if (existingBooking) {
            return NextResponse.json(
                { message: 'You have already booked this event' },
                { status: 409 }
            );
        }

        // Check event capacity
        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json(
                { message: 'Event not found' },
                { status: 404 }
            );
        }

        const bookingCount = await Booking.countDocuments({ slug });
        if (bookingCount >= event.capacity) {
            return NextResponse.json(
                { message: 'Event is fully booked' },
                { status: 409 }
            );
        }

        // Save booking to database
        const booking = await Booking.create({ email, eventId, slug });

        return NextResponse.json(
            { message: 'Booking created successfully', booking },
            { status: 201 }
        );
    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json(
            { message: 'Failed to create booking' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json(
                { message: 'Slug is required' },
                { status: 400 }
            );
        }

        const count = await Booking.countDocuments({ slug });

        return NextResponse.json({ count }, { status: 200 });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json(
            { message: 'Failed to fetch bookings' },
            { status: 500 }
        );
    }
}
