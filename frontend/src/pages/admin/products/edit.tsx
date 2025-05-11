import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Package, 
  Save, 
  ArrowLeft, 
  Trash2,
  Info,
  AlertCircle
} from 'lucide-react';
import { getProductById, updateProduct, deleteProduct, getCategories } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';

interface Category {
  MaDanhMuc: number;
  TenDanhMuc: string;
}

interface ProductData {
  MaSP: number;
  TenSP: string;
  MoTaNgan?: string;
  MoTaDai: string;
  GiaBan: number;
  SoLuongTon: number;
  MaDanhMuc: number;
  DanhMuc?: { TenDanhMuc: string };
  HinhAnhChinhURL: string;
  DacDiemNoiBat?: string;
  TrangThai: 'active' | 'draft' | 'outOfStock';
}

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    tenSanPham: '',
    moTa: '',
    giaBan: '',
    soLuong: '0',
    maDanhMuc: '',
    dacDiemNoiBat: '',
    trangThai: 'active',
    hinhAnh: ''
  });

  // Validation state
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fetch product data and categories when component mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Tải thông tin sản phẩm
        if (id) {
          const productResponse = await getProductById(id);
          if (productResponse.status === 'success' && productResponse.data) {
            const productData: ProductData = productResponse.data;
            setFormData({
              tenSanPham: productData.TenSP || '',
              moTa: productData.MoTaDai || '',
              giaBan: productData.GiaBan?.toString() || '',
              soLuong: productData.SoLuongTon?.toString() || '0',
              maDanhMuc: productData.MaDanhMuc?.toString() || '',
              dacDiemNoiBat: productData.DacDiemNoiBat || '',
              trangThai: productData.TrangThai || 'active',
              hinhAnh: productData.HinhAnhChinhURL || ''
            });
          } else {
            toast.error('Không thể tải thông tin sản phẩm');
            navigate('/admin/products');
          }
        }

        // Tải danh mục
        const categoriesResponse = await getCategories();
        if (categoriesResponse.status === 'success' && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        } else {
          toast.error('Không thể tải danh sách danh mục');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Đã xảy ra lỗi khi tải dữ liệu');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  // Form validation
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.tenSanPham.trim()) {
      newErrors.tenSanPham = 'Tên sản phẩm không được để trống';
    }
    
    if (!formData.moTa.trim()) {
      newErrors.moTa = 'Mô tả sản phẩm không được để trống';
    }
    
    if (!formData.giaBan.trim()) {
      newErrors.giaBan = 'Giá bán không được để trống';
    } else if (isNaN(Number(formData.giaBan)) || Number(formData.giaBan) <= 0) {
      newErrors.giaBan = 'Giá bán phải là số dương';
    }
    
    if (isNaN(Number(formData.soLuong)) || Number(formData.soLuong) < 0) {
      newErrors.soLuong = 'Số lượng không hợp lệ';
    }
    
    if (!formData.maDanhMuc) {
      newErrors.maDanhMuc = 'Vui lòng chọn danh mục cho sản phẩm';
    }
    
    if (!formData.hinhAnh) {
      newErrors.hinhAnh = 'Vui lòng nhập URL hình ảnh sản phẩm';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin sản phẩm');
      return;
    }
    
    setFormSubmitting(true);
    
    try {
      // Chuẩn bị dữ liệu để gửi lên server - sử dụng object thường, không phải FormData
      const productData = {
        tenSanPham: formData.tenSanPham,
        moTa: formData.moTa,
        giaBan: formData.giaBan,
        soLuong: formData.soLuong,
        maDanhMuc: formData.maDanhMuc,
        hinhAnh: formData.hinhAnh,
        dacDiemNoiBat: formData.dacDiemNoiBat || '',
        trangThai: formData.trangThai,
        // Thêm flag để sử dụng raw query cho thời gian
        useRawQuery: 'true'
      };
      
      if (id) {
        const response = await updateProduct(id, productData);
        
        if (response.status === 'success') {
          toast.success('Cập nhật sản phẩm thành công!');
          navigate('/admin/products');
        } else {
          toast.error(response.message || 'Đã xảy ra lỗi khi cập nhật sản phẩm');
        }
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật sản phẩm');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Xóa sản phẩm
  const handleDeleteProduct = async () => {
    if (!id) return;
    
    try {
      setFormSubmitting(true);
      const response = await deleteProduct(id);
      
      if (response.status === 'success') {
        toast.success('Xóa sản phẩm thành công!');
        navigate('/admin/products');
      } else {
        toast.error(response.message || 'Đã xảy ra lỗi khi xóa sản phẩm');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi xóa sản phẩm');
    } finally {
      setFormSubmitting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        </div>
        
        <button
          onClick={() => setDeleteDialogOpen(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
          disabled={formSubmitting}
        >
          <Trash2 size={16} className="mr-2" />
          Xóa sản phẩm
        </button>
      </div>

      {/* Modal xác nhận xóa */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="mb-4 flex items-center text-red-600">
              <AlertCircle size={24} className="mr-2" />
              <h3 className="text-lg font-semibold">Xác nhận xóa sản phẩm</h3>
            </div>
            <p className="mb-6 text-gray-700">Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                disabled={formSubmitting}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={formSubmitting}
              >
                {formSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xóa...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Trash2 size={16} className="mr-2" />
                    Xác nhận xóa
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột bên trái */}
          <div className="space-y-6">
            {/* Tên sản phẩm */}
            <div>
              <label htmlFor="tenSanPham" className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="tenSanPham"
                name="tenSanPham"
                value={formData.tenSanPham}
                onChange={handleInputChange}
                className={cn(
                  "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
                  errors.tenSanPham && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                placeholder="Nhập tên sản phẩm"
              />
              {errors.tenSanPham && (
                <p className="mt-1 text-sm text-red-600">{errors.tenSanPham}</p>
              )}
            </div>

            {/* Mô tả */}
            <div>
              <label htmlFor="moTa" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả sản phẩm <span className="text-red-500">*</span>
              </label>
              <textarea
                id="moTa"
                name="moTa"
                rows={5}
                value={formData.moTa}
                onChange={handleInputChange}
                className={cn(
                  "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
                  errors.moTa && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                placeholder="Nhập mô tả chi tiết về sản phẩm"
              />
              {errors.moTa && (
                <p className="mt-1 text-sm text-red-600">{errors.moTa}</p>
              )}
            </div>

            {/* Đặc điểm nổi bật */}
            <div>
              <label htmlFor="dacDiemNoiBat" className="block text-sm font-medium text-gray-700 mb-1">
                Đặc điểm nổi bật
              </label>
              <textarea
                id="dacDiemNoiBat"
                name="dacDiemNoiBat"
                rows={3}
                value={formData.dacDiemNoiBat}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Nhập đặc điểm nổi bật của sản phẩm (không bắt buộc)"
              />
              <p className="mt-1 text-sm text-gray-500 flex items-center">
                <Info size={14} className="mr-1" /> Mỗi đặc điểm sẽ được hiển thị thành một điểm trong danh sách
              </p>
            </div>
          </div>

          {/* Cột bên phải */}
          <div className="space-y-6">
            {/* Giá bán */}
            <div>
              <label htmlFor="giaBan" className="block text-sm font-medium text-gray-700 mb-1">
                Giá bán <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="giaBan"
                  name="giaBan"
                  value={formData.giaBan}
                  onChange={handleInputChange}
                  className={cn(
                    "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-12",
                    errors.giaBan && "border-red-300 focus:border-red-500 focus:ring-red-500"
                  )}
                  placeholder="Nhập giá bán"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">VNĐ</span>
                </div>
              </div>
              {errors.giaBan && (
                <p className="mt-1 text-sm text-red-600">{errors.giaBan}</p>
              )}
            </div>

            {/* Số lượng tồn kho */}
            <div>
              <label htmlFor="soLuong" className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng tồn kho <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                id="soLuong"
                name="soLuong"
                value={formData.soLuong}
                onChange={handleInputChange}
                className={cn(
                  "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
                  errors.soLuong && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.soLuong && (
                <p className="mt-1 text-sm text-red-600">{errors.soLuong}</p>
              )}
            </div>

            {/* Trạng thái */}
            <div>
              <label htmlFor="trangThai" className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái sản phẩm <span className="text-red-500">*</span>
              </label>
              <select
                id="trangThai"
                name="trangThai"
                value={formData.trangThai}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="active">Đang bán</option>
                <option value="draft">Nháp</option>
                <option value="outOfStock">Hết hàng</option>
              </select>
            </div>

            {/* Danh mục */}
            <div>
              <label htmlFor="maDanhMuc" className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                id="maDanhMuc"
                name="maDanhMuc"
                value={formData.maDanhMuc}
                onChange={handleInputChange}
                className={cn(
                  "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
                  errors.maDanhMuc && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((category) => (
                  <option key={category.MaDanhMuc} value={category.MaDanhMuc}>
                    {category.TenDanhMuc}
                  </option>
                ))}
              </select>
              {errors.maDanhMuc && (
                <p className="mt-1 text-sm text-red-600">{errors.maDanhMuc}</p>
              )}
            </div>

            {/* Hình ảnh URL */}
            <div>
              <label htmlFor="hinhAnh" className="block text-sm font-medium text-gray-700 mb-1">
                URL Hình ảnh sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="hinhAnh"
                name="hinhAnh"
                value={formData.hinhAnh}
                onChange={handleInputChange}
                className={cn(
                  "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
                  errors.hinhAnh && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                placeholder="Nhập URL hình ảnh sản phẩm"
              />
              {formData.hinhAnh && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Xem trước:</p>
                  <img
                    src={formData.hinhAnh}
                    alt="Xem trước"
                    className="h-24 w-24 object-cover border rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Hình+ảnh+lỗi';
                    }}
                  />
                </div>
              )}
              {errors.hinhAnh && (
                <p className="mt-1 text-sm text-red-600">{errors.hinhAnh}</p>
              )}
            </div>
          </div>
        </div>

        {/* Nút lưu */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none mr-3"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none flex items-center"
            disabled={formSubmitting}
          >
            {formSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang lưu...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 