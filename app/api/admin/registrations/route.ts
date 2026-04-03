import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/database/booking.model';
import Event from '@/database/event.model';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { message: 'Slug required' },
        { status: 400 }
      );
    }

    const bookings = await Booking.find({
      slug,
      emailVerified: true,
    }).sort({ createdAt: -1 });

    const event = await Event.findOne({ slug });

    return NextResponse.json({
      eventName: event?.title || 'Unknown Event',
      count: bookings.length,
      registrations: bookings.map(b => ({
        email: b.email,
        registeredAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error('Admin registrations error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
