import { Schema, model } from 'mongoose';

const appointmentSchema = new Schema(
  {
    appointmentId: { type: String, required: true, unique: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    service: { type: Schema.Types.ObjectId, ref: 'Service', default: null },
    serviceAdvisor: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    mechanic: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    duration: { type: Number, default: 60 },
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled', 'No Show'],
      default: 'Scheduled',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ customer: 1 });

export const Appointment = model<any>('Appointment', appointmentSchema);