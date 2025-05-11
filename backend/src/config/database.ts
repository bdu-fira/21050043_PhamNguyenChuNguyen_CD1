import { Sequelize } from 'sequelize';
import config from './config';
import logger from '../utils/logger';

// Tạo đối tượng kết nối Sequelize với SQL Server
const sequelize = new Sequelize(config.DB.NAME, config.DB.USER, config.DB.PASSWORD, {
  host: config.DB.HOST,
  port: config.DB.PORT,
  dialect: 'mssql',
  logging: (msg) => logger.debug(msg),
  dialectOptions: {
    options: {
      encrypt: true, // Cho Azure SQL
      trustServerCertificate: config.NODE_ENV === 'development', // Chỉ sử dụng cho môi trường dev
    },
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Hàm test kết nối
const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    logger.info('Kết nối đến cơ sở dữ liệu SQL Server thành công.');
    return true;
  } catch (error) {
    logger.error(`Không thể kết nối đến cơ sở dữ liệu SQL Server: ${error}`);
    
    // Trong môi trường phát triển, thử lại kết nối một lần nữa sau 2 giây
    if (config.NODE_ENV === 'development') {
      logger.info('Đang thử kết nối lại sau 2 giây...');
      return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            await sequelize.authenticate();
            logger.info('Kết nối đến cơ sở dữ liệu SQL Server thành công sau khi thử lại.');
            resolve(true);
          } catch (retryError) {
            logger.error(`Không thể kết nối lại đến SQL Server: ${retryError}`);
            if (config.NODE_ENV === 'production') {
              process.exit(1);
            }
            resolve(false);
          }
        }, 2000);
      });
    }
    
    // Trong môi trường sản xuất, dừng ứng dụng nếu không kết nối được
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
    
    return false;
  }
};

export { sequelize, testConnection }; 