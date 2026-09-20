import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { bootstrap } from './config/bootstrap';
import { initSocket } from './config/socket';

async function start(): Promise<void> {
  try {
    await connectDB();
    await bootstrap();
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: { origin: [env.CLIENT_URL, 'http://localhost:5173'], credentials: true },
    });
    initSocket(io);

    server.listen(env.PORT, () => {
      console.log(`[server] Smart AutoCare API running on ${env.SERVER_URL}`);
      console.log(`[server] environment=${env.NODE_ENV}`);
    });

    const shutdown = async () => {
      console.log('\n[server] shutting down...');
      io.close();
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 8000).unref();
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[server] failed to start', err);
    process.exit(1);
  }
}

void start();