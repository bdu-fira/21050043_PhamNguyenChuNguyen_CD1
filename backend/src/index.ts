import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { AppError } from './middlewares/errorHandler';
import errorHandler from './middlewares/errorHandler';
import routes from './routes';
import logger from './utils/logger';
import { testConnection } from './config/database';
import { connectRedis } from './config/redis';
import { initSocketServer } from './config/websocket';
import corsMiddleware from './middlewares/cors';
import config from './config/config';

// Đảm bảo biến môi trường được load
dotenv.config({ path: path.join(__dirname, '../.env') });

// Khởi tạo express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware cơ bản
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Phục vụ favicon.ico và các tệp tĩnh khác
app.use(express.static(path.join(__dirname, '..')));

// Khởi tạo session middleware nếu không bỏ qua Redis
if (process.env.SKIP_REDIS === 'true') {
  logger.info('Đang chạy ở chế độ phát triển mà không có Redis');
} else {
  try {
    // Thử khởi tạo session middleware, nếu lỗi thì bỏ qua
    const sessionMiddleware = require('./middlewares/session').default;
    app.use(sessionMiddleware);
  } catch (error) {
    logger.warn('Không thể khởi tạo session middleware, bỏ qua');
  }
}

app.use(helmet());
app.use(morgan('dev'));

// CORS
app.use(corsMiddleware);

// Trang chủ
app.get('/', (req: Request, res: Response) => {
  res.status(200).send(`
    <html>
      <head>
        <title>E-commerce API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          h2 {
            margin-top: 30px;
            color: #444;
          }
          .endpoints {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .endpoint {
            margin-bottom: 10px;
          }
          .method {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
            margin-right: 10px;
            min-width: 60px;
            text-align: center;
          }
          .get {
            background: #2196F3;
            color: white;
          }
          .post {
            background: #4CAF50;
            color: white;
          }
          .put, .patch {
            background: #FF9800;
            color: white;
          }
          .delete {
            background: #F44336;
            color: white;
          }
          .notes {
            font-size: 13px;
            color: #777;
            font-style: italic;
          }
          .role {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
            background: #E1E1E1;
            color: #333;
            margin-left: 5px;
          }
          .section {
            margin-bottom: 30px;
          }
          .info {
            background: #E8F4FD;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #2196F3;
          }
        </style>
      </head>
      <body>
        <h1>E-commerce API</h1>
        <p>Chào mừng đến với API của ứng dụng E-commerce! API này cung cấp các endpoints để quản lý người dùng, sản phẩm và đơn hàng.</p>
        
        <div class="info">
          <h3>Thông tin máy chủ</h3>
          <p>Máy chủ đang hoạt động bình thường! Kiểm tra sức khỏe của máy chủ tại: <a href="/health">/health</a></p>
          
          <h3>Tài khoản mẫu (Chế độ phát triển)</h3>
          <p><strong>Admin:</strong> email: admin@example.com | password: Admin123!</p>
          <p><strong>Nhân viên:</strong> email: nhanvien@example.com | password: Nhanvien1!</p>
        </div>
        
        <h2>API Endpoints</h2>
        
        <div class="section">
          <h3>Khách hàng</h3>
          <div class="endpoints">
            <div class="endpoint">
              <span class="method post">POST</span>
              <span>/api/khach-hang/register</span> - Đăng ký khách hàng mới
            </div>
            <div class="endpoint">
              <span class="method post">POST</span>
              <span>/api/khach-hang/login</span> - Đăng nhập
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span>/api/khach-hang/profile</span> - Lấy thông tin cá nhân
            </div>
            <div class="endpoint">
              <span class="method put">PUT</span>
              <span>/api/khach-hang/:id</span> - Cập nhật thông tin khách hàng
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span>/api/khach-hang</span> - Lấy danh sách khách hàng
              <span class="role">admin</span>
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span>/api/khach-hang/:id</span> - Lấy thông tin chi tiết khách hàng
              <span class="role">admin</span>
            </div>
            <div class="endpoint">
              <span class="method post">POST</span>
              <span>/api/khach-hang/:id/deactivate</span> - Vô hiệu hóa khách hàng
              <span class="role">admin</span>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>Nhân viên</h3>
          <div class="endpoints">
            <div class="endpoint">
              <span class="method get">GET</span>
              <span>/api/nhan-vien</span> - Lấy danh sách nhân viên
              <span class="role">admin</span>
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span>/api/nhan-vien/:id</span> - Lấy thông tin chi tiết nhân viên
              <span class="role">admin</span>
            </div>
            <div class="endpoint">
              <span class="method post">POST</span>
              <span>/api/nhan-vien</span> - Tạo nhân viên mới
              <span class="role">admin</span>
            </div>
            <div class="endpoint">
              <span class="method put">PUT</span>
              <span>/api/nhan-vien/:id</span> - Cập nhật thông tin nhân viên
              <span class="role">admin</span>
            </div>
            <div class="endpoint">
              <span class="method post">POST</span>
              <span>/api/nhan-vien/:id/deactivate</span> - Vô hiệu hóa nhân viên
              <span class="role">admin</span>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>Sản phẩm</h3>
          <div class="endpoints">
            <div class="endpoint">
              <span class="method get">GET</span>
              <span>/api/san-pham</span> - Lấy danh sách sản phẩm
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span>/api/san-pham/ban-chay</span> - Lấy danh sách sản phẩm bán chạy
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span>/api/san-pham/:id</span> - Lấy thông tin chi tiết sản phẩm
            </div>
            <div class="endpoint">
              <span class="method post">POST</span>
              <span>/api/san-pham</span> - Tạo sản phẩm mới
              <span class="role">admin</span>
              <span class="role">nhân viên</span>
            </div>
            <div class="endpoint">
              <span class="method put">PUT</span>
              <span>/api/san-pham/:id</span> - Cập nhật sản phẩm
              <span class="role">admin</span>
              <span class="role">nhân viên</span>
            </div>
            <div class="endpoint">
              <span class="method delete">DELETE</span>
              <span>/api/san-pham/:id</span> - Xóa sản phẩm
              <span class="role">admin</span>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>Danh mục</h3>
          <div class="endpoints">
            <div class="endpoint">
              <span class="method get">GET</span>
              <span>/api/danh-muc</span> - Lấy danh sách danh mục
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span>/api/danh-muc/:id</span> - Lấy thông tin chi tiết danh mục
            </div>
            <div class="endpoint">
              <span class="method post">POST</span>
              <span>/api/danh-muc</span> - Tạo danh mục mới
              <span class="role">admin</span>
            </div>
            <div class="endpoint">
              <span class="method put">PUT</span>
              <span>/api/danh-muc/:id</span> - Cập nhật danh mục
              <span class="role">admin</span>
            </div>
            <div class="endpoint">
              <span class="method delete">DELETE</span>
              <span>/api/danh-muc/:id</span> - Xóa danh mục
              <span class="role">admin</span>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>Đơn hàng</h3>
          <div class="endpoints">
            <div class="endpoint">
              <span class="method get">GET</span>
              <span>/api/don-hang</span> - Lấy danh sách đơn hàng
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span>/api/don-hang/:id</span> - Lấy thông tin chi tiết đơn hàng
            </div>
            <div class="endpoint">
              <span class="method post">POST</span>
              <span>/api/don-hang</span> - Tạo đơn hàng mới
            </div>
            <div class="endpoint">
              <span class="method patch">PATCH</span>
              <span>/api/don-hang/:id</span> - Cập nhật trạng thái đơn hàng
              <span class="role">admin</span>
              <span class="role">nhân viên</span>
            </div>
            <div class="endpoint">
              <span class="method post">POST</span>
              <span>/api/don-hang/:id/cancel</span> - Hủy đơn hàng
              <span class="role">admin</span>
              <span class="role">nhân viên</span>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>Đánh giá</h3>
          <div class="endpoints">
            <div class="endpoint">
              <span class="method get">GET</span>
              <span>/api/danh-gia/product/:productId</span> - Lấy danh sách đánh giá của sản phẩm
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span>/api/danh-gia/:id</span> - Lấy thông tin chi tiết đánh giá
            </div>
            <div class="endpoint">
              <span class="method post">POST</span>
              <span>/api/danh-gia</span> - Tạo đánh giá mới
            </div>
            <div class="endpoint">
              <span class="method put">PUT</span>
              <span>/api/danh-gia/:id</span> - Cập nhật đánh giá
            </div>
            <div class="endpoint">
              <span class="method delete">DELETE</span>
              <span>/api/danh-gia/:id</span> - Xóa đánh giá
              <span class="role">admin</span>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>WebSocket Events</h3>
          <div class="endpoints">
            <div class="endpoint">
              <span class="method">Connection</span> - Thiết lập kết nối với server
            </div>
            <div class="endpoint">
              <span class="method">Authentication</span> - Xác thực WebSocket với JWT
            </div>
            <div class="endpoint">
              <span class="method">Notifications</span> - Nhận thông báo real-time về trạng thái đơn hàng
            </div>
            <div class="endpoint">
              <span class="method">Chat</span> - Giao tiếp trực tiếp giữa khách hàng và nhân viên hỗ trợ
            </div>
          </div>
        </div>
        
        <p class="notes">Xem chi tiết đầy đủ trong file README.md của dự án.</p>
      </body>
    </html>
  `);
});

// Routes
app.use('/api', routes);

// Route kiểm tra health
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Server hoạt động bình thường' });
});

// Xử lý lỗi 404
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Không tìm thấy ${req.originalUrl} trên server này!`, 404));
});

// Middleware xử lý lỗi
app.use(errorHandler);

// Khởi tạo server HTTP
const server = createServer(app);

// Khởi tạo Socket.IO server
if (process.env.SKIP_REDIS === 'true') {
  logger.info('Bỏ qua việc khởi tạo Socket.IO server do không có Redis');
} else {
  try {
    initSocketServer(server);
  } catch (error) {
    logger.warn('Không thể khởi tạo Socket.IO server, bỏ qua');
  }
}

// Khởi động server
const startServer = async () => {
  try {
    // Kết nối Redis nếu không bỏ qua
    if (process.env.SKIP_REDIS !== 'true') {
      try {
        await connectRedis();
      } catch (error) {
        logger.warn('Không thể kết nối đến Redis, tiếp tục khởi động server');
      }
    } else {
      logger.info('Bỏ qua kết nối Redis trong chế độ phát triển');
    }
    
    // Kiểm tra kết nối đến cơ sở dữ liệu nếu không bỏ qua
    let dbConnected = false;
    if (true) { // Luôn yêu cầu kết nối đến cơ sở dữ liệu
      try {
        dbConnected = await testConnection();
        if (dbConnected) {
          logger.info('Sử dụng cơ sở dữ liệu SQL Server thật');
        } else {
          logger.error('Không thể kết nối đến cơ sở dữ liệu, không thể khởi động server.');
          process.exit(1);
        }
      } catch (error) {
        logger.error('Không thể kết nối đến cơ sở dữ liệu, không thể khởi động server.');
        process.exit(1);
      }
    } else {
      throw new Error('Phải kết nối đến cơ sở dữ liệu để khởi động server');
    }
    
    // Khởi động server
    server.listen(PORT, () => {
      logger.info(`Server đang chạy trên cổng ${PORT} trong môi trường ${process.env.NODE_ENV || 'development'}`);
      if (dbConnected) {
        logger.info(`Sử dụng cơ sở dữ liệu SQL Server thật: ${config.DB.HOST}/${config.DB.NAME}`);
      } else {
        logger.error('Không thể khởi động server nếu không kết nối được đến cơ sở dữ liệu');
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error(`Không thể khởi động server: ${error}`);
    process.exit(1);
  }
};

// Xử lý lỗi không được bắt
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Đang tắt...');
  logger.error(err.name, err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! Đang tắt...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Khởi động server
startServer(); 