import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import logger from '../utils/logger';

// Thời gian mặc định cho cache: 10 phút
const DEFAULT_EXPIRATION = 10 * 60;

// Middleware caching theo route
export const cacheMiddleware = (duration = DEFAULT_EXPIRATION) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Bỏ qua cache nếu SKIP_REDIS=true
    if (process.env.SKIP_REDIS === 'true') {
      return next();
    }

    // Bỏ qua cache cho các phương thức không phải GET
    if (req.method !== 'GET') {
      return next();
    }

    // Tạo khóa cache từ đường dẫn URL và query params
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // Kiểm tra xem có dữ liệu trong cache không
      const cachedData = await redisClient.get(key);
      
      if (cachedData) {
        // Nếu có, trả về dữ liệu từ cache
        logger.debug(`Sử dụng cache cho: ${key}`);
        return res.json(JSON.parse(cachedData));
      }

      // Lưu response ban đầu để chúng ta có thể cache nó
      const originalSend = res.send;
      res.send = function(this: Response, body: any): Response {
        // Chỉ cache các phản hồi thành công
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            redisClient.setEx(key, duration, typeof body === 'string' ? body : JSON.stringify(body));
            logger.debug(`Đã thêm vào cache: ${key}`);
          } catch (error) {
            logger.error(`Lỗi khi cache: ${error}`);
          }
        }
        
        // Gọi hàm send gốc
        return originalSend.call(this, body);
      } as any;

      next();
    } catch (error) {
      logger.error(`Lỗi cache: ${error}`);
      next();
    }
  };
};

// Hàm xóa cache theo pattern
export const clearCache = async (pattern: string): Promise<void> => {
  // Bỏ qua nếu SKIP_REDIS=true
  if (process.env.SKIP_REDIS === 'true') {
    return;
  }

  try {
    // Lấy tất cả các khóa phù hợp với pattern
    const keys = await redisClient.keys(`cache:${pattern}`);
    
    if (keys.length > 0) {
      // Xóa tất cả các khóa
      await redisClient.del(keys);
      logger.info(`Đã xóa ${keys.length} cache key theo pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error(`Lỗi khi xóa cache: ${error}`);
  }
};

// Middleware xóa cache cho các route
export const clearCacheMiddleware = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Bỏ qua nếu SKIP_REDIS=true
    if (process.env.SKIP_REDIS === 'true') {
      return next();
    }

    // Chỉ xóa cache cho các phương thức thay đổi dữ liệu (POST, PUT, DELETE)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      // Đợi request xử lý xong trước khi xóa cache
      res.on('finish', async () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          await clearCache(pattern);
        }
      });
    }
    next();
  };
}; 