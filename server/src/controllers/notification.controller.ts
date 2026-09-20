import { Request, Response } from 'express';
import { Notification } from '../models';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate } from '../utils/pagination';

export const myNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { user: req.user?._id };
  const [docs, total] = await Promise.all([
    Notification.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);
  const unread = await Notification.countDocuments({ user: req.user?._id, read: false });
  res.json({ success: true, data: paginate(docs, total, page, limit), meta2: { unread } });
});

export const unreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await Notification.countDocuments({ user: req.user?._id, read: false });
  res.json({ success: true, data: { count } });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateOne({ _id: req.params.id, user: req.user?._id }, { read: true, readAt: new Date() });
  res.json({ success: true, message: 'Marked as read' });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany({ user: req.user?._id, read: false }, { read: true, readAt: new Date() });
  res.json({ success: true, message: 'All notifications marked as read' });
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  await Notification.deleteOne({ _id: req.params.id, user: req.user?._id });
  res.json({ success: true, message: 'Notification deleted' });
});