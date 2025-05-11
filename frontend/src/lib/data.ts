// Đây là file dùng để quản lý và truy xuất dữ liệu từ backend
// Hãy sử dụng các API từ api.ts để lấy dữ liệu

import { productAPI, dashboardAPI, orderAPI, categoryAPI } from './api';

// Export các function getter để lấy dữ liệu từ backend
export const getProducts = () => productAPI.getProducts();
export const getProductsForDashboard = (params = {}) => productAPI.getProductsForDashboard(params);
export const getProductById = (id: string) => productAPI.getProductById(Number(id));
export const getDashboardData = () => dashboardAPI.getDashboardData();
export const getSellerDashboardData = () => dashboardAPI.getSellerDashboardData();
export const getOrders = () => orderAPI.getOrders();

// Category operations
export const getCategories = () => categoryAPI.getCategories();

// Product operations
export const createProduct = (productData: {
  tenSanPham: string;
  moTa: string;
  giaBan: string | number;
  soLuong: string | number;
  hinhAnh: string;
  maDanhMuc: string | number;
  dacDiemNoiBat?: string;
}) => productAPI.createProduct(productData);
export const updateProduct = (id: string, productData: FormData | any) => productAPI.updateProduct(id, productData);
export const deleteProduct = (id: string) => productAPI.deleteProduct(id);

// Các biến sẽ được lấy từ API
let products = [];
let adminProducts = [];

// Tự động fetch dữ liệu khi import
if (typeof window !== 'undefined') {
  getProducts().then(response => {
    if (response.success && response.data) {
      products = response.data;
    }
  }).catch(err => console.error('Lỗi khi tải sản phẩm:', err));
}

export { products }; 