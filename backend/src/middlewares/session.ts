import session from 'express-session';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import { redisClient } from '../config/redis';
import config from '../config/config';

// Tạo Redis store cho session
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'session:',
});

// Cấu hình session middleware
const sessionMiddleware = session({
  store: redisStore,
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.NODE_ENV === 'production', // Chỉ khi dùng HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    sameSite: 'lax',
  },
});

export default sessionMiddleware; 