import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import { v2 as Cloudinary } from 'cloudinary';

const ALLOWED_FIELDS = [
  'title', 'description', 'overview', 'venue',
  'location', 'date', 'time', 'mode', 'audience',
  'organizer', 'tags', 'agenda'
];

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
  image?: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();
    const eventData: EventData = {};

    for (const field of ALLOWED_FIELDS) {
      const value = formData.get(field);
      if (value !== null && value !== undefined) {
        eventData[field as keyof EventData] = String(value);
      }
    }

    const file = formData.get('images') as File;
    if (!file){
      return NextResponse.json({ message: 'Image file is required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      Cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'DevEvent' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as { secure_url: string });
          }
        }
      ).end(buffer);
    });

    eventData.image = uploadResult.secure_url;

    const createdEvent = await Event.create(eventData);
    return NextResponse.json(
      { message: 'Event created successfully', event: createdEvent },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { 
        message: 'Event Creation Failed',
        error: e instanceof Error ? e.message : "Unknown"
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const events = await Event.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Event.countDocuments();

    return NextResponse.json({
      message: 'Events fetched successfully',
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      {
        message: 'Failed to fetch events',
        error: e instanceof Error ? e.message : "Unknown"
      },
      { status: 500 }
    );
  }
}
