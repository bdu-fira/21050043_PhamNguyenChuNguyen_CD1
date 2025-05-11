import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Upload, 
  Save, 
  ArrowLeft, 
  X, 
  Info
} from 'lucide-react';
import { createProduct, getCategories } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';

interface Category {
  MaDanhMuc: number;
  TenDanhMuc: string;
}

export default function NewProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    tenSanPham: '',
    moTa: '',
    giaBan: '',
    soLuong: '0',
    maDanhMuc: '',
    dacDiemNoiBat: '',
  });

  // Image preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Validation state
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fetch categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const response = await getCategories();
        if (response.status === 'success' && response.data) {
          setCategories(response.data);
        } else {
          toast.error('Không thể tải danh sách danh mục');
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Đã xảy ra lỗi khi tải danh mục');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

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

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, image: 'Kích thước ảnh không được vượt quá 5MB' }));
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: 'Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP, GIF)' }));
        return;
      }

      // Clear error if any
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });

      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image preview
  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
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
    
    if (!imageFile && !imagePreview) {
      newErrors.image = 'Vui lòng tải lên hình ảnh sản phẩm';
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
      // Sử dụng URL hình ảnh từ input hoặc từ file đã chọn
      const hinhAnhURL = imagePreview || '';
      
      // Chuẩn bị dữ liệu để gửi lên server
      const productData = {
        tenSanPham: formData.tenSanPham,
        moTa: formData.moTa,
        giaBan: formData.giaBan,
        soLuong: formData.soLuong,
        maDanhMuc: formData.maDanhMuc,
        hinhAnh: hinhAnhURL, // Sử dụng URL hình ảnh
        dacDiemNoiBat: formData.dacDiemNoiBat || undefined
      };
      
      const response = await createProduct(productData);
      
      if (response.status === 'success') {
        toast.success('Tạo sản phẩm mới thành công!');
        navigate('/admin/products');
      } else {
        toast.error(response.message || 'Đã xảy ra lỗi khi tạo sản phẩm');
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi tạo sản phẩm');
    } finally {
      setFormSubmitting(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
        </div>
      </div>

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
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                id="moTa"
                name="moTa"
                rows={4}
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
              <label htmlFor="dacDiemNoiBat" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Đặc điểm nổi bật
                <span className="ml-1 inline-flex items-center" title="Các đặc điểm ngăn cách bằng dấu chấm phẩy (;)">
                  <Info size={16} className="text-gray-400" />
                </span>
              </label>
              <input
                type="text"
                id="dacDiemNoiBat"
                name="dacDiemNoiBat"
                value={formData.dacDiemNoiBat}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Ví dụ: Chống thấm nước;Bền bỉ;Nhẹ gọn"
              />
              <p className="mt-1 text-xs text-gray-500">Nhập các đặc điểm ngăn cách bởi dấu chấm phẩy (;)</p>
            </div>
          </div>

          {/* Cột bên phải */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Giá bán */}
              <div>
                <label htmlFor="giaBan" className="block text-sm font-medium text-gray-700 mb-1">
                  Giá bán (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="giaBan"
                  name="giaBan"
                  value={formData.giaBan}
                  onChange={handleInputChange}
                  min="1000"
                  step="1000"
                  className={cn(
                    "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
                    errors.giaBan && "border-red-300 focus:border-red-500 focus:ring-red-500"
                  )}
                  placeholder="Nhập giá bán"
                />
                {errors.giaBan && (
                  <p className="mt-1 text-sm text-red-600">{errors.giaBan}</p>
                )}
              </div>

              {/* Số lượng tồn */}
              <div>
                <label htmlFor="soLuong" className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng tồn
                </label>
                <input
                  type="number"
                  id="soLuong"
                  name="soLuong"
                  value={formData.soLuong}
                  onChange={handleInputChange}
                  min="0"
                  className={cn(
                    "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
                    errors.soLuong && "border-red-300 focus:border-red-500 focus:ring-red-500"
                  )}
                  placeholder="Nhập số lượng"
                />
                {errors.soLuong && (
                  <p className="mt-1 text-sm text-red-600">{errors.soLuong}</p>
                )}
              </div>
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

            {/* Hình ảnh */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh sản phẩm <span className="text-red-500">*</span>
              </label>
              
              {imagePreview ? (
                <div className="relative mt-2 rounded-lg border border-dashed border-gray-300 p-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="mx-auto h-64 w-auto object-contain" 
                  />
                  <button 
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                  >
                    <X size={16} className="text-red-500" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      URL hình ảnh
                    </label>
                    <div className="mt-1 flex rounded-md">
                      <input
                        type="text"
                        id="imageUrl"
                        name="imageUrl"
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        onChange={(e) => {
                          if (e.target.value) {
                            setImagePreview(e.target.value);
                            // Xóa lỗi nếu có
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.image;
                              return newErrors;
                            });
                          }
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Nhập URL hình ảnh trực tiếp hoặc upload file bên dưới</p>
                  </div>
                  
                  <div 
                    className={cn(
                      "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg",
                      errors.image ? "border-red-300" : "border-gray-300 hover:border-gray-400"
                    )}
                  >
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Tải ảnh lên</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">hoặc kéo thả vào đây</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WEBP hoặc GIF tối đa 5MB
                      </p>
                    </div>
                  </div>
                </>
              )}
              
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={formSubmitting}
            className={cn(
              "inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              formSubmitting && "opacity-75 cursor-not-allowed"
            )}
          >
            {formSubmitting ? (
              <>
                <span className="animate-spin -ml-1 mr-2 h-4 w-4 text-white">&#9696;</span>
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Lưu sản phẩm
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 