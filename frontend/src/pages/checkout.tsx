import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { useNotification } from '@/lib/notification-context';
import { orderAPI } from '@/lib/api';
import { 
  ChevronLeft, 
  Truck, 
  Check, 
  AlertCircle, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  FileText,
  Home,
  DollarSign,
  Edit,
  Wallet
} from 'lucide-react';

// State cho phương thức thanh toán ví điện tử
type DigitalWallet = 'momo' | 'zalopay' | 'vnpay';

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  // Thêm ref để đảm bảo thông báo chỉ hiển thị một lần
  const notificationDisplayed = useRef(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    address: user?.address || '',
    city: '',
    district: '',
    ward: '',
    paymentMethod: 'cod' as 'cod' | 'digital',
    notes: '',
    digitalWallet: '' as DigitalWallet | '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Kiểm tra thông tin giao hàng chỉ khi chưa hiển thị thông báo trước đó
    if (user && (!user.phoneNumber || !user.address) && !notificationDisplayed.current) {
      notificationDisplayed.current = true;
      showNotification('warning', 'Vui lòng cập nhật thông tin giao hàng trước khi thanh toán');
    }
  }, [user]); // Loại bỏ showNotification khỏi dependencies

  const shippingFee = 30000;
  const finalTotal = totalPrice + shippingFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND', 
      minimumFractionDigits: 0 
    }).format(price);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Vui lòng chọn phương thức thanh toán';
    
    // Nếu chọn thanh toán qua ví điện tử mà chưa chọn loại ví
    if (formData.paymentMethod === 'digital' && !formData.digitalWallet) {
      newErrors.digitalWallet = 'Vui lòng chọn ví điện tử';
    }

    // Kiểm tra thông tin giao hàng
    if (!user?.phoneNumber) {
      newErrors.phoneNumber = 'Vui lòng cập nhật số điện thoại trong thông tin tài khoản';
      // Không hiển thị thông báo vì đã có lỗi trên form
    }
    
    if (!user?.address) {
      newErrors.address = 'Vui lòng cập nhật địa chỉ giao hàng trong thông tin tài khoản';
      // Không hiển thị thông báo vì đã có lỗi trên form
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDigitalWalletChange = (wallet: DigitalWallet) => {
    setFormData(prev => ({ ...prev, digitalWallet: wallet }));
    
    // Clear error
    if (errors.digitalWallet) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.digitalWallet;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      showNotification('warning', 'Vui lòng đăng nhập để tiếp tục thanh toán');
      navigate('/login');
      return;
    }
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        userId: user?.id,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        shippingAddress: user?.address || '',
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        digitalWallet: formData.paymentMethod === 'digital' ? formData.digitalWallet as DigitalWallet : undefined
      };
      
      console.log('Sending order data:', orderData);
      
      // Gửi đơn hàng đến server
      const orderResponse = await orderAPI.createOrder(orderData);
      
      if (orderResponse.status === 'success' && orderResponse.data) {
        const orderId = orderResponse.data.id || orderResponse.data.MaDonHang;
        
        // Hiển thị thông báo thành công với cảnh báo đặc biệt
        showNotification('success', 'Thanh toán thành công!');
        // Hiển thị thông báo cảnh báo riêng biệt
        setTimeout(() => {
          showNotification('warning', 'Lưu ý đây không phải là thanh toán thật, dự án đang trong quá trình thử nghiệm');
        }, 500);
        
        // Xóa giỏ hàng và chuyển hướng đến trang hóa đơn
        clearCart();
        navigate(`/invoice/${orderId}`);
      } else {
        throw new Error(orderResponse.message || 'Đặt hàng thất bại');
      }
    } catch (error: any) {
      console.error('Checkout error details:', error);
      let errorMessage = 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại';
      
      if (error.response) {
        // Lỗi từ server
        const serverError = error.response.data;
        errorMessage = serverError.message || 'Lỗi máy chủ: ' + (error.response.status || '');
      } else if (error.message) {
        // Lỗi từ client
        errorMessage = error.message;
      }
      
      showNotification('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Chuyển hướng nếu giỏ hàng trống
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  // Chuyển hướng người dùng chưa đăng nhập
  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="mr-4 text-gray-600 hover:text-blue-600 transition-colors duration-300 focus:outline-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
        </div>

        {/* Hiển thị thông báo lỗi nếu không có thông tin giao hàng */}
        {(!user?.phoneNumber || !user?.address) && (
          <div className="mb-6 p-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Thông tin giao hàng chưa đầy đủ</p>
                <p className="mt-1 text-sm">
                  Vui lòng cập nhật {!user?.phoneNumber && 'số điện thoại'} 
                  {!user?.phoneNumber && !user?.address && ' và '}
                  {!user?.address && 'địa chỉ'} trong trang thông tin tài khoản trước khi thanh toán.
                </p>
                <button 
                  onClick={() => navigate('/profile', { state: { openEditMode: true, fromCheckout: true } })}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Cập nhật thông tin ngay
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form thông tin thanh toán */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Thông tin giao hàng (chỉ hiển thị, không thể chỉnh sửa) */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100 transition-all hover:shadow-xl">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900">Thông tin giao hàng</h2>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => navigate('/profile', { state: { openEditMode: true, fromCheckout: true } })}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Chỉnh sửa thông tin
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500 flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        Họ và tên
                      </p>
                      <p className="mt-1 text-sm font-medium">{user?.fullName || 'Chưa có thông tin'}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        Email
                      </p>
                      <p className="mt-1 text-sm font-medium">{user?.email || 'Chưa có thông tin'}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        Số điện thoại
                      </p>
                      <p className="mt-1 text-sm font-medium">{user?.phoneNumber || 'Chưa có thông tin'}</p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-gray-500 flex items-center">
                        <Home className="h-4 w-4 mr-1 text-gray-400" />
                        Địa chỉ nhận hàng
                      </p>
                      <p className="mt-1 text-sm font-medium">{user?.address || 'Chưa có thông tin'}</p>
                    </div>

                    {formData.notes && (
                    <div className="sm:col-span-2">
                        <p className="text-sm font-medium text-gray-500 flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-gray-400" />
                          Ghi chú
                        </p>
                        <p className="mt-1 text-sm">{formData.notes}</p>
                      </div>
                    )}
                    </div>
                  </div>

                <div className="px-6 py-4 bg-blue-50 border-t border-blue-100 flex items-center">
                  <Truck className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-700">Giao hàng nhanh trong vòng 3-5 ngày làm việc</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100 transition-all hover:shadow-xl">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Phương thức thanh toán</h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Chọn phương thức thanh toán phù hợp với bạn</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                    <input
                      id="payment-cod"
                      name="paymentMethod"
                      type="radio"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="payment-cod" className="ml-3 flex flex-col cursor-pointer w-full">
                      <span className="block text-sm font-medium text-gray-900">
                      Thanh toán khi nhận hàng (COD)
                      </span>
                      <span className="mt-1 text-xs text-gray-500">
                        Thanh toán bằng tiền mặt khi nhận hàng tại địa chỉ của bạn
                      </span>
                    </label>
                    <div className="ml-auto bg-blue-100 rounded-full p-2">
                      <Check className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>

                  <div className="flex items-center bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                    <input
                      id="payment-digital"
                      name="paymentMethod"
                      type="radio"
                      checked={formData.paymentMethod === 'digital'}
                      onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'digital' }))}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="payment-digital" className="ml-3 flex flex-col cursor-pointer w-full">
                      <span className="block text-sm font-medium text-gray-900">
                        Thanh toán qua ví điện tử
                      </span>
                      <span className="mt-1 text-xs text-gray-500">
                        Thanh toán qua Momo, ZaloPay, VNPAY
                      </span>
                    </label>
                    <div className="ml-auto bg-gray-100 rounded-full p-2">
                      <Wallet className="h-5 w-5 text-gray-600" />
                  </div>
                  </div>

                  {formData.paymentMethod === 'digital' && (
                    <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Wallet className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-800">Chọn ví điện tử</h3>
                          {errors.digitalWallet && (
                            <p className="text-sm text-red-600 mt-1">{errors.digitalWallet}</p>
                          )}
                          <div className="mt-4 grid grid-cols-3 gap-3">
                            <div className="flex flex-col items-center space-y-2">
                              <div 
                                className={`bg-pink-600 rounded-lg p-3 w-full flex items-center justify-center cursor-pointer transition-all ${formData.digitalWallet === 'momo' ? 'ring-4 ring-pink-300' : 'opacity-80 hover:opacity-100'}`}
                                onClick={() => handleDigitalWalletChange('momo')}
                              >
                                <span className="text-white font-bold">Momo</span>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  name="digitalWallet"
                                  id="wallet-momo"
                                  checked={formData.digitalWallet === 'momo'}
                                  onChange={() => handleDigitalWalletChange('momo')}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <label htmlFor="wallet-momo" className="ml-2 text-xs font-medium text-gray-700">Momo</label>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-center space-y-2">
                              <div 
                                className={`bg-blue-500 rounded-lg p-3 w-full flex items-center justify-center cursor-pointer transition-all ${formData.digitalWallet === 'zalopay' ? 'ring-4 ring-blue-300' : 'opacity-80 hover:opacity-100'}`}
                                onClick={() => handleDigitalWalletChange('zalopay')}
                              >
                                <span className="text-white font-bold">ZaloPay</span>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  name="digitalWallet"
                                  id="wallet-zalopay"
                                  checked={formData.digitalWallet === 'zalopay'}
                                  onChange={() => handleDigitalWalletChange('zalopay')}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <label htmlFor="wallet-zalopay" className="ml-2 text-xs font-medium text-gray-700">ZaloPay</label>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-center space-y-2">
                              <div 
                                className={`bg-blue-700 rounded-lg p-3 w-full flex items-center justify-center cursor-pointer transition-all ${formData.digitalWallet === 'vnpay' ? 'ring-4 ring-blue-300' : 'opacity-80 hover:opacity-100'}`}
                                onClick={() => handleDigitalWalletChange('vnpay')}
                              >
                                <span className="text-white font-bold">VNPAY</span>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  name="digitalWallet"
                                  id="wallet-vnpay"
                                  checked={formData.digitalWallet === 'vnpay'}
                                  onChange={() => handleDigitalWalletChange('vnpay')}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <label htmlFor="wallet-vnpay" className="ml-2 text-xs font-medium text-gray-700">VNPAY</label>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                            <p className="text-xs text-blue-800">
                              Bạn sẽ được chuyển đến trang thanh toán của đơn vị thanh toán sau khi xác nhận đơn hàng.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.paymentMethod && (
                    <p className="text-sm text-red-600">{errors.paymentMethod}</p>
                  )}
                </div>
              </div>

              {/* Thêm field notes riêng cho đơn hàng này */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100">
                <div className="p-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-gray-500" />
                    Ghi chú đơn hàng
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                    />
                  </div>
                </div>
              </div>

              {/* Tóm tắt đơn hàng chỉ hiển thị ở màn hình nhỏ */}
              <div className="lg:hidden mb-6">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900">Tóm tắt đơn hàng</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Tạm tính ({totalItems} sản phẩm)</p>
                      <p className="text-sm font-medium text-gray-900">{formatPrice(totalPrice)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                      <p className="text-sm text-gray-600">Phí vận chuyển</p>
                        <div className="ml-2 group relative">
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-xs text-gray-600 cursor-help">?</span>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            Phí vận chuyển cố định 30.000đ cho mọi đơn hàng.
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{formatPrice(shippingFee)}</p>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                      <p className="text-base font-medium text-gray-900">Tổng cộng</p>
                      <p className="text-base font-bold text-blue-600">{formatPrice(finalTotal)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-lg shadow-md py-4 px-6 text-base font-medium text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Hoàn tất đặt hàng
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Tóm tắt đơn hàng chỉ hiển thị ở màn hình lớn */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 sticky top-24 transition-all hover:shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Tóm tắt đơn hàng</h2>
                </div>
              </div>
              
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flow-root">
                  <ul className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <li key={item.product.id} className="py-3 flex hover:bg-gray-50 transition-colors rounded-lg">
                        <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {item.product.name}
                            </h3>
                            <p className="text-sm font-medium text-gray-900">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                          <div className="mt-1 flex text-sm">
                            <p className="text-gray-500">SL: {item.quantity}</p>
                            <p className="ml-2 text-xs text-blue-600 font-medium">{formatPrice(item.product.price)}/cái</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Tạm tính ({totalItems} sản phẩm)</p>
                  <p className="text-sm font-medium text-gray-900">{formatPrice(totalPrice)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <p className="text-sm text-gray-600">Phí vận chuyển</p>
                    <div className="ml-2 group relative">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-xs text-gray-600 cursor-help">?</span>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        Phí vận chuyển cố định 30.000đ cho mọi đơn hàng.
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formatPrice(shippingFee)}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <p className="text-base font-medium text-gray-900">Tổng cộng</p>
                  <p className="text-base font-bold text-blue-600">{formatPrice(finalTotal)}</p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 flex items-start">
                  <div className="flex-shrink-0">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">Thông tin vận chuyển</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Đơn hàng sẽ được giao trong vòng 3-5 ngày làm việc kể từ khi xác nhận thanh toán thành công.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center mt-4 text-center">
                  <p className="text-xs text-gray-500 font-medium mb-2">Chúng tôi chấp nhận</p>
                  <div className="flex justify-center space-x-3">
                    <div className="bg-pink-600 rounded-md p-1 w-16 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Momo</span>
                    </div>
                    <div className="bg-blue-500 rounded-md p-1 w-16 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">ZaloPay</span>
                    </div>
                    <div className="bg-blue-700 rounded-md p-1 w-16 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">VNPAY</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 