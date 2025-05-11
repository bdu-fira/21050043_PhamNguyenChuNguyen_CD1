import { useState, useEffect } from 'react';
import { ShoppingBag, Package, TrendingUp, AlertTriangle, Clock, DollarSign, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSellerDashboardData } from '@/lib/data';

interface SellerDashboardData {
  sellerRevenueData: { day: string; value: number }[];
  sellerProducts: { id: number; name: string; quantity: number; sold: number; stock: number }[];
  sellerOrders: { id: string; customer: string; date: string; amount: number; status: string }[];
  sellerLowStockProducts: { id: number; name: string; current: number; min: number }[];
  sellerStats: {
    title: string;
    value: string;
    color: string;
    growth: number;
    icon?: React.ReactNode;
  }[];
}

export default function SellerDashboard() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [dashboardData, setDashboardData] = useState<SellerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getSellerDashboardData();
        if (response.success && response.data) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Nếu đang tải dữ liệu, hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Nếu không có dữ liệu
  if (!dashboardData) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-700">Không thể tải dữ liệu</h2>
        <p className="text-gray-500 mt-2">Vui lòng thử lại sau</p>
      </div>
    );
  }

  // Đếm số đơn hàng theo trạng thái
  const orderStatusCount = {
    pending: dashboardData.sellerOrders.filter(order => order.status === 'pending').length,
    processing: dashboardData.sellerOrders.filter(order => order.status === 'processing').length,
    completed: dashboardData.sellerOrders.filter(order => order.status === 'completed').length,
    cancelled: dashboardData.sellerOrders.filter(order => order.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard nhân viên bán hàng</h1>
        <div className="bg-white rounded-md shadow p-1 flex">
          <button 
            className={cn(
              "px-3 py-1 text-sm rounded-md",
              timeRange === 'day' 
                ? "bg-blue-100 text-blue-700" 
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => setTimeRange('day')}
          >
            Ngày
          </button>
          <button 
            className={cn(
              "px-3 py-1 text-sm rounded-md",
              timeRange === 'week' 
                ? "bg-blue-100 text-blue-700" 
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => setTimeRange('week')}
          >
            Tuần
          </button>
          <button 
            className={cn(
              "px-3 py-1 text-sm rounded-md",
              timeRange === 'month' 
                ? "bg-blue-100 text-blue-700" 
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => setTimeRange('month')}
          >
            Tháng
          </button>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.sellerStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100 text-${stat.color}-600`}>
                {stat.icon ? stat.icon : <TrendingUp size={24} />}
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={stat.growth >= 0 ? "text-green-600" : "text-red-600"}>
                {stat.growth >= 0 ? "+" : ""}{stat.growth.toFixed(1)}%
              </span>
              <span className="text-gray-500 text-sm ml-2">so với kỳ trước</span>
            </div>
          </div>
        ))}
      </div>

      {/* Biểu đồ doanh thu và đơn hàng đang xử lý */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Doanh thu theo ngày</h2>
            <select className="text-sm border border-gray-300 rounded-md p-1">
              <option>7 ngày gần nhất</option>
              <option>14 ngày gần nhất</option>
              <option>30 ngày gần nhất</option>
            </select>
          </div>
          
          {/* Biểu đồ doanh thu */}
          <div className="h-64 w-full">
            <div className="flex items-end justify-between h-52 w-full">
              {dashboardData.sellerRevenueData.map((item, index) => (
                <div key={index} className="flex flex-col items-center w-full">
                  <div 
                    className="bg-blue-500 rounded-t-sm w-12"
                    style={{ height: `${Math.max((item.value / 300000) * 100, 10)}%` }}
                  ></div>
                  <span className="text-xs mt-2 text-gray-600">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Đơn hàng cần xử lý</h2>
            <div className="text-yellow-500 bg-yellow-50 rounded-full p-1">
              <Clock size={20} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{orderStatusCount.pending}</p>
              <p className="text-sm text-gray-600 mt-1">Chờ xác nhận</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{orderStatusCount.processing}</p>
              <p className="text-sm text-gray-600 mt-1">Đang xử lý</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{orderStatusCount.completed}</p>
              <p className="text-sm text-gray-600 mt-1">Hoàn thành</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{orderStatusCount.cancelled}</p>
              <p className="text-sm text-gray-600 mt-1">Đã hủy</p>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Xử lý đơn hàng
            </button>
          </div>
        </div>
      </div>

      {/* Sản phẩm của tôi và cảnh báo tồn kho */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-medium mb-4">Sản phẩm của tôi</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã bán</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Còn lại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.sellerProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{product.sold}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button className="mt-4 text-blue-600 text-sm font-medium hover:underline w-full text-center">
            Xem tất cả sản phẩm
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Cảnh báo tồn kho</h2>
            <div className="text-red-500 bg-red-50 rounded-full p-1">
              <AlertTriangle size={20} />
            </div>
          </div>
          
          <div className="space-y-4">
            {dashboardData.sellerLowStockProducts.map((product, index) => (
              <div key={index} className="flex items-start">
                <div className="p-2 rounded-md bg-red-50 text-red-500">
                  <Package size={18} />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                  <div className="mt-1 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-xs text-red-600 font-medium">Còn lại: {product.current}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-xs text-gray-500">Tối thiểu: {product.min}</span>
                    </div>
                    <button className="text-xs text-blue-600 font-medium hover:underline">
                      Nhập thêm
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="mt-6 w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-sm font-medium flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Xem tất cả cảnh báo
          </button>
        </div>
      </div>
    </div>
  );
} 