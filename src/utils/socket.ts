import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import config from '@config/index';

let io: SocketIOServer;

export const initSocketIO = (server: HTTPServer): void => {
    console.log('Initializing Socket.io');
    io = new SocketIOServer(server, {
        cors: {
            origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
                if (!origin || config.allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};

export const getIO = (): SocketIOServer => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
