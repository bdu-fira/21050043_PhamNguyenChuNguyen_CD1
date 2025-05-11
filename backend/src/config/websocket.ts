import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import logger from '../utils/logger';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import config from './config';

// Biến lưu trữ instance của Socket.IO server
let io: Server;

export const initSocketServer = (httpServer: HttpServer) => {
  // Bỏ qua nếu SKIP_REDIS=true
  if (process.env.SKIP_REDIS === 'true') {
    logger.info('Bỏ qua khởi tạo Socket.IO server do SKIP_REDIS=true');
    return;
  }

  try {
    // Tải session middleware nếu cần
    let sessionMiddleware;
    try {
      sessionMiddleware = require('../middlewares/session').default;
    } catch (error) {
      logger.warn('Không thể tải session middleware, Socket.IO vẫn hoạt động nhưng không có session');
    }

    // Wrap express-session middleware cho socket.io nếu tồn tại
    const wrap = sessionMiddleware 
      ? (middleware: any) => (socket: Socket, next: any) => middleware(socket.request, {}, next)
      : null;

    // Khởi tạo Socket.IO server
    io = new Server(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.FRONTEND_URL || 'https://yourdomain.com' 
          : 'http://localhost:3000',
        credentials: true,
      },
    });

    // Áp dụng session middleware nếu có
    if (sessionMiddleware && wrap) {
      io.use(wrap(sessionMiddleware));
    }

    // Middleware xác thực người dùng
    io.use(async (socket, next) => {
      try {
        // Lấy token từ cookie hoặc từ handshake auth
        let token = null;
        
        if (socket.handshake.headers.cookie) {
          const cookies = parse(socket.handshake.headers.cookie);
          token = cookies.jwt;
        }
        
        if (!token && socket.handshake.auth && socket.handshake.auth.token) {
          token = socket.handshake.auth.token;
        }

        if (!token) {
          return next(new Error('Không có quyền truy cập. Vui lòng đăng nhập.'));
        }

        // Kiểm tra token có trong blacklist không - bỏ qua nếu SKIP_REDIS=true
        if (process.env.SKIP_REDIS !== 'true') {
          try {
            const { redisClient } = require('./redis');
            const isBlacklisted = await redisClient.get(`blacklist:${token}`);
            if (isBlacklisted) {
              return next(new Error('Token không hợp lệ. Vui lòng đăng nhập lại.'));
            }
          } catch (error) {
            logger.warn('Không thể kiểm tra blacklist token, bỏ qua bước này');
          }
        }

        // Xác thực token
        const decoded: any = jwt.verify(token, config.JWT_SECRET);
        
        // Lưu thông tin người dùng vào socket
        socket.data.user = decoded;
        
        next();
      } catch (error) {
        logger.error(`Socket authentication error: ${error}`);
        next(new Error('Xác thực thất bại. Vui lòng đăng nhập lại.'));
      }
    });

    // Xử lý kết nối
    io.on('connection', (socket) => {
      logger.info(`Socket connected: ${socket.id}`);
      
      // Thêm socket vào phòng dựa trên ID người dùng
      if (socket.data.user) {
        socket.join(`user:${socket.data.user.id}`);
      }

      // Xử lý các sự kiện
      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });

      // Thêm các sự kiện khác ở đây
    });

    logger.info('Socket.IO server initialized');
    return io;
  } catch (error) {
    logger.error(`Error initializing Socket.IO server: ${error}`);
    return null;
  }
};

// Hàm gửi thông báo riêng cho một người dùng
export const sendNotificationToUser = (userId: string, event: string, data: any) => {
  if (!io) {
    logger.error('Socket.IO server chưa được khởi tạo');
    return;
  }
  io.to(`user:${userId}`).emit(event, data);
};

// Hàm gửi thông báo cho tất cả người dùng
export const sendNotificationToAll = (event: string, data: any) => {
  if (!io) {
    logger.error('Socket.IO server chưa được khởi tạo');
    return;
  }
  io.emit(event, data);
};

// Hàm lấy số lượng người dùng đang kết nối
export const getConnectedClientsCount = (): number => {
  if (!io) {
    return 0;
  }
  return io.engine.clientsCount;
};

export { io }; 