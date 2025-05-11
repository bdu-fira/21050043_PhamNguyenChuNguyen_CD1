import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import reviewRoutes from './review.routes';
import orderRoutes from './donhang.routes';
import staffRoutes from './nhanvien.routes';
import customerRoutes from './khachhang.routes';
// Import các routes khác ở đây

const router = Router();

// Các route chính
router.use('/auth', authRoutes);
router.use('/san-pham', productRoutes);
router.use('/danh-muc', categoryRoutes);
router.use('/danh-gia', reviewRoutes);
router.use('/don-hang', orderRoutes);
router.use('/nhan-vien', staffRoutes);
router.use('/khach-hang', customerRoutes);
// Thêm các routes khác ở đây
// router.use('/orders', orderRoutes);

export default router; 