import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './env';

let io: Server | null = null;

export function setSocket(server: Server): void {
  io = server;
}

export function getSocket(): Server | null {
  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown): void {
  io?.to(`user:${String(userId)}`).emit(event, payload);
}

export function emitToRoom(room: string, event: string, payload: unknown): void {
  io?.to(room).emit(event, payload);
}

export function initSocket(server: Server): void {
  setSocket(server);
  io?.on('connection', (socket) => {
    const token = (socket.handshake.auth?.token || '') as string;
    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
        socket.join(`user:${decoded.id}`);
      } catch {
        /* ignore */
      }
    }
    socket.on('join-room', (room: string) => socket.join(room));
    socket.on('disconnect', () => {});
  });
}