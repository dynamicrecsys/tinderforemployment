import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../../utils/jwt';
import { saveMessage, markMessagesRead } from './chat.service';

const onlineUsers = new Set<string>();

let io: Server;

export function initSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'development'
        ? ['http://localhost:3000']
        : [],
      credentials: true,
    },
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = verifyAccessToken(token);
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const userId = (socket as any).userId as string;
    console.log(`User connected: ${userId}`);

    // Join personal room for notifications
    socket.join(`user:${userId}`);

    // Mark online
    onlineUsers.add(userId);

    // Chat events
    socket.on('chat:join', ({ matchId }) => {
      socket.join(`match:${matchId}`);
    });

    socket.on('chat:leave', ({ matchId }) => {
      socket.leave(`match:${matchId}`);
    });

    socket.on('chat:send', async ({ matchId, body }) => {
      if (!body?.trim()) return;

      const msg = await saveMessage(matchId, userId, body.trim());

      io.to(`match:${matchId}`).emit('chat:message', {
        id: msg.id,
        matchId: msg.matchId,
        senderId: msg.senderId,
        body: msg.body,
        createdAt: msg.createdAt.toISOString(),
      });
    });

    socket.on('chat:read', async ({ matchId }) => {
      await markMessagesRead(matchId, userId);
      io.to(`match:${matchId}`).emit('chat:read_receipt', {
        matchId,
        readBy: userId,
      });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
}

// Emit match notification to both users
export function emitMatchNotification(workerId: string, employerId: string, matchData: any) {
  if (!io) return;
  io.to(`user:${workerId}`).emit('match:new', matchData);
  io.to(`user:${employerId}`).emit('match:new', matchData);
}
