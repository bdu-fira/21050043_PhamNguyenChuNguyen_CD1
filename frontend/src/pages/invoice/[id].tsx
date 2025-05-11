import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useNotification } from '@/lib/notification-context';
import { orderAPI } from '@/lib/api';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Package, 
  Truck, 
  Calendar, 
  Clock, 
  Check, 
  MapPin, 
  User, 
  Phone,
  Mail,
  FileText,
  CreditCard,
  CheckCircle
} from 'lucide-react';

interface OrderItem {
  MaChiTietDH: number;
  MaDonHang: number;
  MaSP: number;
  TenSP: string;
  HinhAnhChinhURL: string;
  SoLuong: number;
  DonGia: number;
  ThanhTien: number;
}

interface OrderDetails {
  MaDonHang: number;
  MaKH: string;
  TenKhachHang: string;
  TenNguoiNhan: string;
  SoDienThoaiNhan: string;
  DiaChiGiaoHang: string;
  EmailNguoiNhan: string;
  NgayDatHang: string;
  TongTienSanPham: number;
  PhiVanChuyen: number;
  GiamGia: number;
  TongThanhToan: number;
  PhuongThucThanhToan: string; 
  TrangThaiThanhToan: string;
  TrangThaiDonHang: string;
  GhiChuKhachHang?: string;
  GhiChuQuanTri?: string;
  NgayCapNhat: string;
  ChiTietDonHang: OrderItem[];
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn, user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await orderAPI.getOrderById(id);
        
        if (response.status === 'success' && response.data) {
          setOrder(response.data);
        } else {
          showNotification('error', 'Không thể tải thông tin đơn hàng');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        showNotification('error', 'Đã xảy ra lỗi khi tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    
    if (isLoggedIn) {
      fetchOrderDetails();
    } else {
      navigate('/login');
    }
  }, [id, isLoggedIn, navigate, showNotification]);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND', 
      minimumFractionDigits: 0 
    }).format(price);
  };
  
  // Tính số ngày dự kiến giao hàng (3-5 ngày làm việc)
  const getEstimatedDeliveryDate = (orderDate: string) => {
    const date = new Date(orderDate);
    const minDate = new Date(date);
    const maxDate = new Date(date);
    
    // Thêm 3-5 ngày làm việc (không tính thứ 7, chủ nhật)
    let minBusinessDays = 3;
    let maxBusinessDays = 5;
    let minDaysAdded = 0;
    let maxDaysAdded = 0;
    
    while (minDaysAdded < minBusinessDays) {
      minDate.setDate(minDate.getDate() + 1);
      // Bỏ qua thứ 7 (6), chủ nhật (0)
      if (minDate.getDay() !== 0 && minDate.getDay() !== 6) {
        minDaysAdded++;
      }
    }
    
    while (maxDaysAdded < maxBusinessDays) {
      maxDate.setDate(maxDate.getDate() + 1);
      // Bỏ qua thứ 7 (6), chủ nhật (0)
      if (maxDate.getDay() !== 0 && maxDate.getDay() !== 6) {
        maxDaysAdded++;
      }
    }
    
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    };
    
    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  // Nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen pt-16 pb-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }
  
  // Nếu không tìm thấy đơn hàng
  if (!order) {
    return (
      <div className="min-h-screen pt-16 pb-12 flex flex-col items-center justify-center">
        <div className="bg-red-100 rounded-full p-4">
          <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy đơn hàng</h2>
        <p className="mt-2 text-gray-600">Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
        <button
          onClick={() => navigate('/account/orders')}
          className="mt-6 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Xem danh sách đơn hàng
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Nút quay lại và thanh trạng thái */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Quay lại</span>
          </button>
          
          <div className="flex items-center space-x-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Printer className="h-4 w-4 mr-2" />
              In hóa đơn
            </button>
            <button
              className="flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Tải PDF
            </button>
          </div>
        </div>
        
        {/* Hóa đơn */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 print:shadow-none print:border-none">
          {/* Header */}
          <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 print:bg-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900">HÓA ĐƠN ĐẶT HÀNG</h1>
                <p className="text-gray-600 mt-1">Mã đơn hàng: #{order.MaDonHang}</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-sm text-gray-600 mb-2">Modern Stationery Store</div>
                <img src="/logo.png" alt="Logo" className="h-10" />
              </div>
            </div>
          </div>

          {/* Thông tin đơn hàng và khách hàng */}
          <div className="p-8 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin đơn hàng */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                  Thông tin đơn hàng
                </h2>
                <div className="space-y-3">
                  <div className="flex">
                    <div className="w-40 text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Ngày đặt hàng:
                    </div>
                    <div className="font-medium">{formatDate(order.NgayDatHang)}</div>
                  </div>
                  <div className="flex">
                    <div className="w-40 text-gray-600 flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-gray-400" />
                      Dự kiến giao:
                    </div>
                    <div className="font-medium">{getEstimatedDeliveryDate(order.NgayDatHang)}</div>
                  </div>
                  <div className="flex">
                    <div className="w-40 text-gray-600 flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                      Phương thức:
                    </div>
                    <div className="font-medium">
                      {order.PhuongThucThanhToan === 'cod' 
                        ? 'Thanh toán khi nhận hàng (COD)' 
                        : 'Thanh toán qua ví điện tử'}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-40 text-gray-600 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      Trạng thái:
                    </div>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {order.TrangThaiDonHang === 'ChoXacNhan' ? 'Chờ xác nhận' : order.TrangThaiDonHang}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Thông tin khách hàng */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Thông tin khách hàng
                </h2>
                <div className="space-y-3">
                  <div className="flex">
                    <div className="w-40 text-gray-600 flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      Tên khách hàng:
                    </div>
                    <div className="font-medium">{order.TenNguoiNhan}</div>
                  </div>
                  <div className="flex">
                    <div className="w-40 text-gray-600 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      Số điện thoại:
                    </div>
                    <div className="font-medium">{order.SoDienThoaiNhan}</div>
                  </div>
                  <div className="flex">
                    <div className="w-40 text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      Email:
                    </div>
                    <div className="font-medium">{order.EmailNguoiNhan}</div>
                  </div>
                  <div className="flex">
                    <div className="w-40 text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      Địa chỉ giao hàng:
                    </div>
                    <div className="font-medium">{order.DiaChiGiaoHang}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ghi chú (nếu có) */}
          {order.GhiChuKhachHang && (
            <div className="px-8 py-4 bg-yellow-50 border-b border-gray-200">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Ghi chú từ khách hàng:</h3>
                  <p className="mt-1 text-sm text-gray-600">{order.GhiChuKhachHang}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Chi tiết sản phẩm */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn giá
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {order.ChiTietDonHang.map((item) => (
                  <tr key={item.MaChiTietDH}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={item.HinhAnhChinhURL || 'https://via.placeholder.com/80'}
                            alt={item.TenSP}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.TenSP}</div>
                          <div className="text-sm text-gray-500">Mã SP: {item.MaSP}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {formatPrice(item.DonGia)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {item.SoLuong}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {formatPrice(item.ThanhTien)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Tóm tắt thanh toán */}
          <div className="p-8 border-t border-gray-200 bg-gray-50">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-2">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Thông tin thanh toán</h3>
                  <div className="text-sm">
                    {order.PhuongThucThanhToan === 'cod' ? (
                      <div className="flex space-x-2 items-center text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Thanh toán khi nhận hàng (COD)</span>
                      </div>
                    ) : (
                      <div className="flex space-x-2 items-center text-blue-600">
                        <CreditCard className="h-4 w-4" />
                        <span>Thanh toán qua ví điện tử</span>
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-500">
                      <p className="text-red-600 font-medium">
                        Lưu ý: Đây không phải là thanh toán thật, dự án đang trong quá trình thử nghiệm.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-600">Tạm tính:</div>
                    <div className="text-sm font-medium text-gray-900">{formatPrice(order.TongTienSanPham)}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-600">Phí vận chuyển:</div>
                    <div className="text-sm font-medium text-gray-900">{formatPrice(order.PhiVanChuyen)}</div>
                  </div>
                  {order.GiamGia > 0 && (
                    <div className="flex justify-between">
                      <div className="text-sm text-gray-600">Giảm giá:</div>
                      <div className="text-sm font-medium text-green-600">-{formatPrice(order.GiamGia)}</div>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <div className="text-base font-medium text-gray-900">Tổng cộng:</div>
                      <div className="text-base font-bold text-blue-600">{formatPrice(order.TongThanhToan)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 print:bg-white">
            <div className="flex flex-col items-center text-center text-sm text-gray-500">
              <p>Cảm ơn bạn đã mua sắm tại Modern Stationery Store!</p>
              <p className="mt-1">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email: 21050032@sudent.bdu.edu.vn</p>
              <p className="mt-3 text-xs">© {new Date().getFullYear()} Modern Stationery Store. Tất cả quyền được bảo lưu.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 