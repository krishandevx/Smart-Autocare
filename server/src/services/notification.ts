import { Notification } from '../models/Notification';
import { emitToUser } from '../config/socket';

export interface PushInput {
  user: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  data?: Record<string, unknown>;
}

export async function pushNotification(input: PushInput): Promise<unknown> {
  const doc = await Notification.create({
    user: input.user,
    type: input.type,
    title: input.title,
    message: input.message || '',
    link: input.link || '',
    data: input.data || {},
  });
  emitToUser(input.user, 'notification', doc);
  return doc;
}

export async function markAllRead(userId: string): Promise<void> {
  await Notification.updateMany({ user: userId, read: false }, { read: true, readAt: new Date() });
}