'use server';
import Event from '@/database/event.model';
import connectDB from '@/lib/mongodb';
import Booking from '@/database/booking.model';

export const getSimilarEventBySlug = async (slug: string) => {
  try {
    await connectDB();
    const event = await Event.findOne({ slug });
    if (!event) return [];
    return await Event.find({ _id: { $ne: event._id }, tags: { $in: event.tags } }).lean();
  } catch {
    return [];
  }
};

export const getAllEvents = async () => {
  try {
    await connectDB();
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    return events;
  } catch {
    return [];
  }
};

export const getEventBySlug = async (slug: string) => {
  try {
    await connectDB();
    const sanitizedSlug = slug.trim().toLowerCase();
    const event = await Event.findOne({ slug: sanitizedSlug }).lean();
    return event || null;
  } catch {
    return null;
  }
};

export const getBookingCount = async (slug: string) => {
  try {
    await connectDB();
    const count = await Booking.countDocuments({ slug });
    return count;
  } catch {
    return 0;
  }
};
