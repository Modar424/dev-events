import mongoose, { Schema, Document, Types } from 'mongoose';
import Event from './event.model';

export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  slug: string;
  emailVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpiry: Date | null;
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
        validator: (v: string) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Email must be a valid email address',
      },
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

bookingSchema.pre<IBooking>('save', async function () {
  const eventExists = await Event.findById(this.eventId);
  if (!eventExists) {
    throw new Error('Referenced event does not exist');
  }
});

bookingSchema.index({ eventId: 1 });
bookingSchema.index({ email: 1, slug: 1 }, { unique: true });

const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;