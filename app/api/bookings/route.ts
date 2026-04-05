import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import connectDB from '@/lib/mongodb';
import Booking from '@/database/booking.model';
import Event from '@/database/event.model';
import {
  validateEmailFormat,
  isBlockedDomain,
  verifyEmailDomain,
  generateToken,
  getTokenExpiry,
} from '@/lib/services/email.service';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(
  email: string,
  token: string,
  eventName: string
): Promise<boolean> {
  try {
    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/bookings/verify?token=${token}`;

    const { error } = await resend.emails.send({
      from: 'noreply@devevent.com',
      to: email,
      subject: `Verify your registration for ${eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p style="color: #666;">Thank you for registering for <strong>${eventName}</strong>!</p>
          <p style="color: #666;">Click the link below to verify your email:</p>
          <a href="${verifyUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #22d3ee;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
          ">
            Verify Email
          </a>
          <p style="color: #666;">Or copy this link:</p>
          <p style="color: #999; word-break: break-all; font-size: 12px;">${verifyUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link expires in 24 hours.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log(`✅ Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, eventId, slug } = await req.json();

    if (!email || !eventId || !slug) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!validateEmailFormat(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (isBlockedDomain(email)) {
      return NextResponse.json(
        { message: 'Please use a real email domain' },
        { status: 400 }
      );
    }

    const isValidDomain = await verifyEmailDomain(email);
    if (!isValidDomain) {
      return NextResponse.json(
        { message: 'Email domain not valid' },
        { status: 400 }
      );
    }

    const existing = await Booking.findOne({ email, slug });
    if (existing) {
      return NextResponse.json(
        { message: 'Already registered for this event' },
        { status: 409 }
      );
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    const verifiedCount = await Booking.countDocuments({
      slug,
      emailVerified: true,
    });
    if (verifiedCount >= event.capacity) {
      return NextResponse.json(
        { message: 'Event is full' },
        { status: 409 }
      );
    }

    const token = generateToken();
    const expiry = getTokenExpiry();

    const booking = await Booking.create({
      email,
      eventId,
      slug,
      emailVerified: false,
      verificationToken: token,
      verificationTokenExpiry: expiry,
    });

    const emailSent = await sendVerificationEmail(email, token, event.title);
    if (!emailSent) {
      await Booking.deleteOne({ _id: booking._id });
      return NextResponse.json(
        { message: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Check your email for verification link' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { message: 'Server error' },
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
        { message: 'Slug required' },
        { status: 400 }
      );
    }

    const count = await Booking.countDocuments({
      slug,
      emailVerified: true,
    });

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}