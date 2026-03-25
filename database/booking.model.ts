import mongoose, { Schema, Document, Types } from 'mongoose';
import Event from './event.model';

export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        // Email validation regex
        validator: (v: string) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Email must be a valid email address',
      },
    },
  },
  { timestamps: true }
);

// Verify that referenced event exists before saving
bookingSchema.pre<IBooking>('save', async function () {
  // Check if event exists in the database
  const eventExists = await Event.findById(this.eventId);
  if (!eventExists) {
    throw new Error('Referenced event does not exist');
  }
});

// Create index on eventId for faster queries
bookingSchema.index({ eventId: 1 });

const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;