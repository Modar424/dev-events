import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/database/booking.model';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Invalid verification link' },
        { status: 400 }
      );
    }

    const booking = await Booking.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!booking) {
      return NextResponse.json(
        { message: 'Link expired or invalid' },
        { status: 400 }
      );
    }

    booking.emailVerified = true;
    booking.verificationToken = null;
    booking.verificationTokenExpiry = null;
    await booking.save();

    return NextResponse.json(
      { message: 'Email verified successfully! You are registered for the event.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
