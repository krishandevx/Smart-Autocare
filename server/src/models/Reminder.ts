import { Schema, model } from 'mongoose';

const reminderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    type: {
      type: String,
      enum: ['Periodic Service', 'Oil Change', 'Brake Inspection', 'Tyre Replacement', 'Battery Check', 'Insurance Renewal', 'PUC Renewal', 'Custom'],
      default: 'Periodic Service',
    },
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    dueMileage: { type: Number, default: null },
    status: { type: String, enum: ['Pending', 'Due Soon', 'Overdue', 'Completed'], default: 'Pending' },
    note: { type: String, default: '' },
  },
  { timestamps: true },
);

reminderSchema.index({ customer: 1, status: 1, dueDate: 1 });

export const Reminder = model<any>('Reminder', reminderSchema);