'use server';
import Event from '@/database/event.model';
import connectDB from '@/lib/mongodb';

export const getAllEvents = async () => {
  try {
    await connectDB();
    const events = await Event.find({}).lean();
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const getEventBySlug = async (slug: string) => {
  try {
    await connectDB();
    const event = await Event.findOne({ slug }).lean();
    return event;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};

export const getSimilarEventBySlug = async (slug: string) => {
  try {
    await connectDB();

    const event = await Event.findOne({ slug });
    if (!event) {
      return [];
    }   
        return await Event.find({ _id : { $ne: event._id },tags: { $in: event.tags } }).lean();
        
  } catch {
 
    return [];
  }
};