import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer;

export const initializeSocket = (server: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join-room', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Handle technician location updates
    socket.on('technician-location', (data: { userId: string; latitude: number; longitude: number }) => {
      console.log(`Technician ${data.userId} location updated:`, data.latitude, data.longitude);
      // Store location in database or cache
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Emit to specific user
export const emitToUser = (userId: string, event: string, data: any) => {
  const socketIO = getIO();
  socketIO.to(`user:${userId}`).emit(event, data);
};

// Emit to all admin users
export const emitToAdmins = (event: string, data: any) => {
  const socketIO = getIO();
  socketIO.to('admin').emit(event, data);
};

// Broadcast to all clients
export const broadcastEvent = (event: string, data: any) => {
  const socketIO = getIO();
  socketIO.emit(event, data);
};
