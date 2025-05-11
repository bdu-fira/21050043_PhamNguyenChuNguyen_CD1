import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ChevronLeft, ChevronRight, Plus, Minus, AlertTriangle, Check } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { useNotification } from '@/lib/notification-context';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  const shippingFee = 30000;
  const couponDiscount = couponApplied ? (totalPrice * discount) : 0;
  const finalTotal = totalPrice + shippingFee - couponDiscount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND', 
      minimumFractionDigits: 0 
    }).format(price);
  };

  const handleApplyCoupon = () => {
    // Mô phỏng việc áp dụng mã giảm giá
    if (couponCode.toUpperCase() === 'DISCOUNT10') {
      setCouponApplied(true);
      setDiscount(0.1); // Giảm 10%
      showNotification('success', 'Đã áp dụng mã giảm giá 10% thành công!');
    } else if (couponCode.toUpperCase() === 'DISCOUNT20') {
      setCouponApplied(true);
      setDiscount(0.2); // Giảm 20%
      showNotification('success', 'Đã áp dụng mã giảm giá 20% thành công!');
    } else {
      showNotification('error', 'Mã giảm giá không hợp lệ hoặc đã hết hạn!');
    }
  };

  const handleQuantityChange = (productId: string, quantity: number, newValue: number) => {
    const newQuantity = Math.max(1, quantity + newValue);
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      showNotification('warning', 'Vui lòng đăng nhập để tiếp tục thanh toán');
      navigate('/login');
      return;
    }

    // Tiến hành thanh toán nếu đã đăng nhập
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-gray-400" />
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">Giỏ hàng trống</h2>
            <p className="mt-2 text-gray-600">
              Giỏ hàng của bạn hiện đang trống. Hãy tiếp tục mua sắm để thêm sản phẩm vào giỏ hàng.
            </p>
            <div className="mt-6">
              <Link 
                to="/products" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
          <p className="text-gray-600">{totalItems} sản phẩm</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Danh sách sản phẩm trong giỏ hàng */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="p-6">
                <div className="flow-root">
                  <ul className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <li key={item.product.id} className="py-6 flex">
                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>

                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>
                                <Link to={`/products/${item.product.id}`} className="hover:text-blue-600">
                                  {item.product.name}
                                </Link>
                              </h3>
                              <p className="ml-4 font-semibold">
                                {formatPrice(item.product.price * item.quantity)}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              Danh mục: {item.product.category}
                            </p>
                          </div>
                          
                          <div className="flex-1 flex items-end justify-between">
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity, -1)}
                                className="p-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              
                              <span className="mx-2 text-gray-700 w-8 text-center">
                                {item.quantity}
                              </span>
                              
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity, 1)}
                                className="p-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                disabled={item.quantity >= item.product.stock}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                              
                              {item.quantity >= item.product.stock && (
                                <span className="ml-2 text-xs text-orange-500 flex items-center">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Tối đa
                                </span>
                              )}
                            </div>
                            
                            <div className="flex">
                              <button
                                type="button"
                                onClick={() => removeItem(item.product.id)}
                                className="font-medium text-red-600 hover:text-red-500 flex items-center"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Xóa</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => navigate('/products')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Tiếp tục mua sắm
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      clearCart();
                      showNotification('success', 'Giỏ hàng đã được xóa!');
                    }}
                    className="text-sm font-medium text-red-600 hover:text-red-500 flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Xóa giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <p className="text-gray-600">Tạm tính</p>
                    <p className="font-medium text-gray-900">{formatPrice(totalPrice)}</p>
                  </div>
                  
                  <div className="flex justify-between">
                    <p className="text-gray-600">Phí vận chuyển</p>
                    <p className="font-medium text-gray-900">{formatPrice(shippingFee)}</p>
                  </div>
                  
                  {couponApplied && (
                    <div className="flex justify-between text-green-600">
                      <p>Giảm giá ({discount * 100}%)</p>
                      <p className="font-medium">-{formatPrice(couponDiscount)}</p>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <p className="text-base font-medium text-gray-900">Tổng cộng</p>
                    <p className="text-xl font-bold text-gray-900">{formatPrice(finalTotal)}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center mb-4">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Mã giảm giá"
                      className={cn(
                        "block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                        couponApplied && "bg-green-50 border-green-300"
                      )}
                      disabled={couponApplied}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className={cn(
                        "ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                        couponApplied 
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      )}
                      disabled={couponApplied || !couponCode}
                    >
                      {couponApplied ? <span className="flex items-center"><Check className="h-4 w-4 mr-1" />Đã áp dụng</span> : 'Áp dụng'}
                    </button>
                  </div>
                  
                  {couponApplied && (
                    <div className="mb-4 text-sm bg-green-50 text-green-700 px-3 py-2 rounded-md flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      Đã áp dụng mã giảm giá {discount * 100}%
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                  >
                    Thanh toán
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
                
                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>Chúng tôi chấp nhận</p>
                  <div className="mt-2 flex justify-center space-x-2">
                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
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