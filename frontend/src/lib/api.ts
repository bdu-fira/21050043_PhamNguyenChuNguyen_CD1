import axios from 'axios';

// API cơ sở URL từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Tạo axios instance với cấu hình chung
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Để gửi cookie CSRF và JWT
  timeout: 10000,
});

// Thêm interceptor để xử lý token trong header khi gửi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor xử lý lỗi
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API Authentication
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      // Lưu token vào localStorage
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
      }

      // Ánh xạ dữ liệu từ backend sang frontend format
      if (response.data.data && response.data.data.user) {
        const backendUser = response.data.data.user;
        response.data.data.user = {
          id: backendUser.MaKH || backendUser.MaNV,
          email: backendUser.Email,
          fullName: backendUser.HoTen,
          role: backendUser.MaVaiTro 
            ? (backendUser.TenVaiTro || (backendUser.MaVaiTro === 3 ? 'customer' : 'admin')) 
            : 'customer',
          phoneNumber: backendUser.SoDienThoai || null,
          address: backendUser.DiaChi || null,
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    address?: string;
  }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      
      // Ánh xạ dữ liệu từ backend sang frontend format
      if (response.data.status === 'success' && response.data.data) {
        const backendUser = response.data.data;
        response.data.data = {
          id: backendUser.MaKH || backendUser.MaNV,
          email: backendUser.Email,
          fullName: backendUser.HoTen,
          role: backendUser.MaVaiTro 
            ? (backendUser.TenVaiTro || (backendUser.MaVaiTro === 3 ? 'customer' : 'admin')) 
            : 'customer',
          phoneNumber: backendUser.SoDienThoai || null,
          address: backendUser.DiaChi || null,
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (userData: {
    fullName: string;
    phoneNumber?: string;
    address?: string;
  }) => {
    try {
      // Ánh xạ dữ liệu từ frontend sang backend format trước khi gửi
      const backendUserData = {
        hoTen: userData.fullName,
        soDienThoai: userData.phoneNumber,
        diaChi: userData.address
      };
      
      const response = await api.put('/auth/profile', backendUserData);
      
      // Ánh xạ dữ liệu từ backend sang frontend format
      if (response.data.status === 'success' && response.data.data) {
        const backendUser = response.data.data;
        response.data.data = {
          id: backendUser.MaKH || backendUser.MaNV,
          email: backendUser.Email,
          fullName: backendUser.HoTen,
          role: backendUser.MaVaiTro 
            ? (backendUser.TenVaiTro || (backendUser.MaVaiTro === 3 ? 'customer' : 'admin')) 
            : 'customer',
          phoneNumber: backendUser.SoDienThoai || null,
          address: backendUser.DiaChi || null,
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
};

// API Sản phẩm
export const productAPI = {
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/san-pham', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        status: 'error',
        message: 'Không thể tải danh sách sản phẩm',
      };
    }
  },

  // Thêm phương thức mới để lấy sản phẩm cho dashboard
  getProductsForDashboard: async (params = {}) => {
    try {
      const response = await api.get('/san-pham/dashboard', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard products:', error);
      return {
        status: 'error',
        message: 'Không thể tải danh sách sản phẩm cho dashboard',
      };
    }
  },

  getBestSellingProducts: async (limit = 10) => {
    try {
      const response = await api.get('/san-pham/ban-chay', { 
        params: { limit } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching best selling products:', error);
      return {
        status: 'error',
        message: 'Không thể tải sản phẩm bán chạy',
      };
    }
  },

  getProductById: async (productId: number) => {
    try {
      const response = await api.get(`/san-pham/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product details:', error);
      return {
        status: 'error',
        message: 'Không thể tải thông tin sản phẩm',
      };
    }
  },

  createProduct: async (productData: {
    tenSanPham: string;
    moTa: string;
    giaBan: string | number;
    soLuong: string | number;
    hinhAnh: string;
    maDanhMuc: string | number;
    dacDiemNoiBat?: string;
  }) => {
    try {
      const response = await api.post('/san-pham', productData);
      return response.data;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  },

  updateProduct: async (id: string, productData: any) => {
    try {
      // Kiểm tra xem dữ liệu là FormData hay object thường
      const isFormData = productData instanceof FormData;
      
      const response = await api.put(`/san-pham/${id}`, productData, {
        headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Update product ${id} error:`, error);
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const response = await api.delete(`/san-pham/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete product ${id} error:`, error);
      throw error;
    }
  }
};

// API Danh mục
export const categoryAPI = {
  getCategories: async () => {
    try {
      const response = await api.get('/danh-muc');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        status: 'error',
        message: 'Không thể tải danh sách danh mục',
      };
    }
  },

  getCategoryById: async (id: string) => {
    try {
      const response = await api.get(`/danh-muc/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get category ${id} error:`, error);
      throw error;
    }
  },

  createCategory: async (categoryData: FormData) => {
    try {
      const response = await api.post('/danh-muc', categoryData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  },

  updateCategory: async (id: string, categoryData: FormData) => {
    try {
      const response = await api.put(`/danh-muc/${id}`, categoryData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Update category ${id} error:`, error);
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    try {
      const response = await api.delete(`/danh-muc/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete category ${id} error:`, error);
      throw error;
    }
  }
};

// API Dashboard
export const dashboardAPI = {
  getDashboardData: async () => {
    try {
      const response = await api.get('/admin/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Get dashboard data error:', error);
      throw error;
    }
  },

  getSellerDashboardData: async () => {
    try {
      const response = await api.get('/nhan-vien/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Get seller dashboard data error:', error);
      throw error;
    }
  }
};

// API Giỏ hàng
export const cartAPI = {
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Get cart error:', error);
      throw error;
    }
  },

  addToCart: async (productId: string, quantity: number) => {
    try {
      const response = await api.post('/cart/items', { productId, quantity });
      return response.data;
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  },

  updateCartItem: async (productId: string, quantity: number) => {
    try {
      const response = await api.put(`/cart/items/${productId}`, { quantity });
      return response.data;
    } catch (error) {
      console.error('Update cart item error:', error);
      throw error;
    }
  },

  removeFromCart: async (productId: string) => {
    try {
      const response = await api.delete(`/cart/items/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Remove from cart error:', error);
      throw error;
    }
  },
};

// API Đơn hàng
export const orderAPI = {
  createOrder: async (orderData: {
    userId?: string;
    items: {
      productId: string;
      quantity: number;
    }[];
    shippingAddress: string;
    paymentMethod: 'cod' | 'digital';
    notes?: string;
    digitalWallet?: 'momo' | 'zalopay' | 'vnpay';
  }) => {
    try {
      // Kiểm tra xem có userId trước khi gửi request
      if (!orderData.userId) {
        console.warn('Missing userId in orderData');
      }
      
      const response = await api.post('/don-hang', orderData);
      return response.data;
    } catch (error) {
      console.error('Create order error:', error);
      
      // Log thêm thông tin chi tiết hơn về lỗi
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      
      throw error;
    }
  },

  getOrders: async (queryParams?: any) => {
    try {
      const response = await api.get('/don-hang', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  },

  getOrderById: async (id: string) => {
    try {
      const response = await api.get(`/don-hang/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get order ${id} error:`, error);
      throw error;
    }
  },

  updateOrderStatus: async (id: string, data: { status: string, adminNote?: string }) => {
    try {
      const response = await api.patch(`/don-hang/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Update order ${id} error:`, error);
      throw error;
    }
  }
};

// API Đánh giá
export const reviewAPI = {
  getProductReviews: async (productId: string) => {
    try {
      const response = await api.get(`/danh-gia`, { params: { productId } });
      return response.data;
    } catch (error) {
      console.error(`Get reviews for product ${productId} error:`, error);
      throw error;
    }
  },

  createReview: async (reviewData: {
    productId: string;
    rating: number;
    comment: string;
  }) => {
    try {
      const response = await api.post('/danh-gia', reviewData);
      return response.data;
    } catch (error) {
      console.error('Create review error:', error);
      throw error;
    }
  },

  updateReview: async (id: string, data: { rating?: number; comment?: string }) => {
    try {
      const response = await api.put(`/danh-gia/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Update review ${id} error:`, error);
      throw error;
    }
  },

  deleteReview: async (id: string) => {
    try {
      const response = await api.delete(`/danh-gia/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete review ${id} error:`, error);
      throw error;
    }
  }
};

// API Khách hàng (Admin only)
export const customerAPI = {
  getCustomers: async (queryParams?: any) => {
    try {
      const response = await api.get('/khach-hang', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Get customers error:', error);
      throw error;
    }
  },

  getCustomerById: async (id: string) => {
    try {
      const response = await api.get(`/khach-hang/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get customer ${id} error:`, error);
      throw error;
    }
  },

  updateCustomer: async (id: string, data: any) => {
    try {
      const response = await api.put(`/khach-hang/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Update customer ${id} error:`, error);
      throw error;
    }
  },

  deactivateCustomer: async (id: string) => {
    try {
      const response = await api.post(`/khach-hang/${id}/deactivate`);
      return response.data;
    } catch (error) {
      console.error(`Deactivate customer ${id} error:`, error);
      throw error;
    }
  }
};

// API Nhân viên (Admin only)
export const staffAPI = {
  getStaff: async (queryParams?: any) => {
    try {
      const response = await api.get('/nhan-vien', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Get staff error:', error);
      throw error;
    }
  },

  getStaffById: async (id: string) => {
    try {
      const response = await api.get(`/nhan-vien/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get staff ${id} error:`, error);
      throw error;
    }
  },

  createStaff: async (staffData: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    role: string;
  }) => {
    try {
      const response = await api.post('/nhan-vien', staffData);
      return response.data;
    } catch (error) {
      console.error('Create staff error:', error);
      throw error;
    }
  },

  updateStaff: async (id: string, data: any) => {
    try {
      const response = await api.put(`/nhan-vien/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Update staff ${id} error:`, error);
      throw error;
    }
  },

  deactivateStaff: async (id: string) => {
    try {
      const response = await api.post(`/nhan-vien/${id}/deactivate`);
      return response.data;
    } catch (error) {
      console.error(`Deactivate staff ${id} error:`, error);
      throw error;
    }
  }
};

export default api; 