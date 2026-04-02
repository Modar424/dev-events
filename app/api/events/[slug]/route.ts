import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import { v2 as cloudinary } from 'cloudinary';

// Define types
interface EventData {
  title?: string;
  description?: string;
  overview?: string;
  venue?: string;
  location?: string;
  date?: string;
  time?: string;
  mode?: string;
  audience?: string;
  organizer?: string;
  tags?: string;
  agenda?: string;
  capacity?: string;
  image?: string;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: unknown;
}

const ALLOWED_FIELDS = [
  'title', 'description', 'overview', 'venue',
  'location', 'date', 'time', 'mode', 'audience',
  'organizer', 'tags', 'agenda', 'capacity'
] as const;

type AllowedField = typeof ALLOWED_FIELDS[number];

// GET - Fetch single event by slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;
    const sanitizedSlug = slug.trim().toLowerCase();
    
    const event = await Event.findOne({ slug: sanitizedSlug });
    
    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Event fetched successfully', event },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { message: 'Failed to fetch event', error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// PUT - Update event
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const { slug } = await params;
    const sanitizedSlug = slug.trim().toLowerCase();

    const formData = await req.formData();
    const eventData: Partial<EventData> = {};

    // Only accept allowed fields
    for (const field of ALLOWED_FIELDS) {
      const value = formData.get(field);
      if (value !== null && value !== undefined) {
        // تحقق من أن القيمة من نوع string وليس File
        if (typeof value === 'string') {
          eventData[field as AllowedField] = value;
        }
      }
    }

    // Find existing event
    const existingEvent = await Event.findOne({ slug: sanitizedSlug });
    if (!existingEvent) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    // Handle image upload if provided
    const file = formData.get('images') as File | null;
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'DevEvent' },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result as CloudinaryUploadResult);
            } else {
              reject(new Error('Upload failed'));
            }
          }
        ).end(buffer);
      });

      eventData.image = uploadResult.secure_url;

      // Delete old image from Cloudinary if different
      if (existingEvent.image && existingEvent.image !== eventData.image) {
        try {
          const publicId = existingEvent.image.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`DevEvent/${publicId}`);
          }
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
    }

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      existingEvent._id,
      eventData,
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { message: 'Event updated successfully', event: updatedEvent },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { message: 'Event update failed', error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// DELETE - Delete event
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const { slug } = await params;
    const sanitizedSlug = slug.trim().toLowerCase();

    // Find event to delete
    const event = await Event.findOne({ slug: sanitizedSlug });
    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary
    if (event.image) {
      try {
        const publicId = event.image.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`DevEvent/${publicId}`);
        }
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
      }
    }

    // Delete all bookings for this event
    const Booking = await import('@/database/booking.model');
    await Booking.default.deleteMany({ eventId: event._id });

    // Delete event
    await Event.findByIdAndDelete(event._id);

    return NextResponse.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { message: 'Failed to delete event', error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}