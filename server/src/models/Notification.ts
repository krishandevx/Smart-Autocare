import { Schema, model } from 'mongoose';

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, default: 'general' },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    link: { type: String, default: '' },
    data: { type: Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export const Notification = model<any>('Notification', notificationSchema);