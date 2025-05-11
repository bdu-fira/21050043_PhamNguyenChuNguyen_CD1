import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TicketCheck, 
  Settings, 
  BarChart3,
  LayoutDashboard
} from 'lucide-react';

export default function AdminDashboard() {
  // Các chức năng chính
  const mainFeatures = [
    {
      title: "Sản phẩm",
      description: "Quản lý danh sách sản phẩm, thêm, sửa, xóa sản phẩm",
      icon: <Package size={48} className="text-blue-600" />,
      path: "/admin/products",
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Đơn hàng",
      description: "Xem và quản lý trạng thái đơn hàng",
      icon: <ShoppingBag size={48} className="text-green-600" />,
      path: "/admin/orders",
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Người dùng",
      description: "Quản lý tài khoản người dùng và phân quyền",
      icon: <Users size={48} className="text-purple-600" />,
      path: "/admin/users",
      color: "bg-purple-50 border-purple-200"
    },
    {
      title: "Thống kê",
      description: "Xem báo cáo doanh thu và thống kê kinh doanh",
      icon: <BarChart3 size={48} className="text-amber-600" />,
      path: "/admin/statistics",
      color: "bg-amber-50 border-amber-200"
    },
    {
      title: "Hỗ trợ khách hàng",
      description: "Quản lý yêu cầu hỗ trợ và phản hồi khách hàng",
      icon: <TicketCheck size={48} className="text-teal-600" />,
      path: "/admin/support",
      color: "bg-teal-50 border-teal-200"
    },
    {
      title: "Cài đặt",
      description: "Cấu hình hệ thống và thông tin cửa hàng",
      icon: <Settings size={48} className="text-gray-600" />,
      path: "/admin/settings",
      color: "bg-gray-50 border-gray-200"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-500 mt-2">Chào mừng bạn đến với hệ thống quản trị website</p>
        </div>
      </div>

      {/* Thông báo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <LayoutDashboard className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Chú ý</h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>
                Đây là trang tổng quan quản trị. Sử dụng các liên kết dưới đây để truy cập vào các chức năng quản lý.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Các chức năng chính */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Chức năng quản trị</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainFeatures.map((feature, index) => (
            <Link 
              key={index}
              to={feature.path}
              className={`block p-6 border rounded-lg shadow-sm transition-all duration-200 
              hover:shadow-md ${feature.color} border hover:-translate-y-1`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </Link>
            ))}
        </div>
      </div>

      {/* Tài liệu hướng dẫn */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-lg font-medium mb-4">Tài liệu hướng dẫn</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">1</div>
            <div>
              <h3 className="font-medium">Quản lý sản phẩm</h3>
              <p className="text-gray-600 text-sm">Hướng dẫn thêm, sửa, xóa và quản lý sản phẩm trong hệ thống</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">2</div>
            <div>
              <h3 className="font-medium">Quản lý đơn hàng</h3>
              <p className="text-gray-600 text-sm">Hướng dẫn xử lý đơn hàng và cập nhật trạng thái</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">3</div>
            <div>
              <h3 className="font-medium">Báo cáo doanh thu</h3>
              <p className="text-gray-600 text-sm">Hướng dẫn xem và xuất báo cáo doanh thu theo thời gian</p>
            </div>
        </div>
          <div className="flex items-start">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">4</div>
            <div>
              <h3 className="font-medium">Quản lý người dùng</h3>
              <p className="text-gray-600 text-sm">Hướng dẫn thêm và phân quyền người dùng trong hệ thống</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-3">5</div>
            <div>
              <h3 className="font-medium">Hỗ trợ khách hàng</h3>
              <p className="text-gray-600 text-sm">Hướng dẫn trả lời và quản lý các yêu cầu hỗ trợ từ khách hàng</p>
                </div>
                </div>
          <div className="flex items-start">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-3">6</div>
            <div>
              <h3 className="font-medium">Cài đặt hệ thống</h3>
              <p className="text-gray-600 text-sm">Hướng dẫn cấu hình thông tin cửa hàng và tùy chỉnh giao diện</p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
} 