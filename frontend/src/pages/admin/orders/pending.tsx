import { useState, useEffect } from 'react';
import { orderAPI } from '@/lib/api';
import { useNotification } from '@/lib/notification-context';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Order {
  MaDonHang: number;
  MaKH: string;
  TenKhachHang: string;
  TenNguoiNhan: string;
  SoDienThoaiNhan: string;
  EmailNguoiNhan: string;
  DiaChiGiaoHang: string;
  NgayDatHang: string;
  TongTienSanPham: number;
  PhiVanChuyen: number;
  GiamGia: number;
  TongThanhToan: number;
  PhuongThucThanhToan: string;
  TrangThaiThanhToan: string;
  TrangThaiDonHang: string;
}

export default function PendingOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  // Lấy danh sách đơn hàng
  useEffect(() => {
    fetchOrders();
  }, [currentPage]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const params: Record<string, any> = {
        page: currentPage,
        trangThai: 'ChoXacNhan'
      };
      
      const response = await orderAPI.getOrders(params);
      
      if (response.status === 'success' && response.data) {
        setOrders(response.data.donhangs);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        showNotification('error', 'Không thể tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showNotification('error', 'Đã xảy ra lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý cập nhật trạng thái đơn hàng
  const handleApproveOrder = async (orderId: number) => {
    try {
      const response = await orderAPI.updateOrderStatus(orderId.toString(), { 
        status: 'DangXuLy' 
      });
      
      if (response.status === 'success') {
        showNotification('success', 'Đã xác nhận đơn hàng thành công');
        fetchOrders(); // Refresh danh sách
      } else {
        showNotification('error', 'Không thể cập nhật trạng thái đơn hàng');
      }
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      showNotification('error', 'Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng');
    }
  };
  
  const handleCancelOrder = async (orderId: number) => {
    try {
      const response = await orderAPI.updateOrderStatus(orderId.toString(), { 
        status: 'DaHuy',
        adminNote: 'Đơn hàng đã bị hủy bởi quản trị viên'
      });
      
      if (response.status === 'success') {
        showNotification('success', 'Đã hủy đơn hàng thành công');
        fetchOrders(); // Refresh danh sách
      } else {
        showNotification('error', 'Không thể hủy đơn hàng');
      }
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
      showNotification('error', 'Đã xảy ra lỗi khi hủy đơn hàng');
    }
  };
  
  // Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Format ngày
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };
  
  // Lọc đơn hàng theo từ khóa tìm kiếm
  const filteredOrders = orders.filter(order => 
    order.TenNguoiNhan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.MaDonHang.toString().includes(searchTerm) ||
    order.SoDienThoaiNhan.includes(searchTerm)
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng chờ xác nhận</h1>
        
        <button
          onClick={fetchOrders}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Tìm kiếm theo tên khách hàng, mã đơn hàng, số điện thoại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Danh sách đơn hàng */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Không có đơn hàng nào đang chờ xác nhận.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.MaDonHang} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      #{order.MaDonHang}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.TenNguoiNhan}</div>
                      <div className="text-sm text-gray-500">{order.SoDienThoaiNhan}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.NgayDatHang)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(order.TongThanhToan)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {order.PhuongThucThanhToan === 'TienMat' || order.PhuongThucThanhToan === 'COD' ? 'Thanh toán khi nhận hàng' : 'Ví điện tử'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/admin/orders/${order.MaDonHang}`)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleApproveOrder(order.MaDonHang)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Xác nhận"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.MaDonHang)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Hủy đơn"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Trang trước</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Trang sau</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
} 