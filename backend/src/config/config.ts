import dotenv from 'dotenv';
import path from 'path';

// Đảm bảo biến môi trường được load từ file .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  PORT: number;
  NODE_ENV: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string | number;
  SESSION_SECRET: string;
  REDIS: {
    HOST: string;
    PORT: number;
    PASSWORD: string;
  };
  DB: {
    HOST: string;
    PORT: number;
    NAME: string;
    USER: string;
    PASSWORD: string;
  };
}

const config: Config = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'jwt_default_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SESSION_SECRET: process.env.SESSION_SECRET || 'session_default_secret',
  REDIS: {
    HOST: process.env.REDIS_HOST || 'localhost',
    PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    PASSWORD: process.env.REDIS_PASSWORD || '',
  },
  DB: {
    HOST: process.env.DB_HOST || 'DELL5580\SQLEXPRESS',
    PORT: parseInt(process.env.DB_PORT || '1433', 10),
    NAME: process.env.DB_NAME || 'shopdungcuhoctap',
    USER: process.env.DB_USER || 'sa',
    PASSWORD: process.env.DB_PASSWORD || '21050043',
  },
};

export default config; 