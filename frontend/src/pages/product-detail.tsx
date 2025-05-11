import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Minus, Plus, ShoppingCart, Heart, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI } from '@/lib/api';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';

// Import styles
import styles from '@/styles/product-detail.module.css';

// Khai báo kiểu cho danh sách sản phẩm
interface BackendProduct {
  MaSP: number;
  TenSP: string;
  MoTaDai: string;
  GiaBan: number;
  SoLuongTon: number;
  HinhAnhChinhURL: string;
  MaDanhMuc: number;
  DacDiemNoiBat?: string;
  LuotXem: number;
  NgayTao: string;
  NgayCapNhat: string;
  DiemDanhGiaTrungBinh?: number;
  SoLuongDanhGia?: number;
  DanhMuc?: {
    MaDanhMuc: number;
    TenDanhMuc: string;
  };
  DanhGia?: Array<{
    MaDanhGia: number;
    MaKH: number;
    DiemSo: number;
    BinhLuan: string;
    NgayDanhGia: string;
  }>;
}

// Hàm chuyển đổi từ cấu trúc backend sang cấu trúc Product trong frontend
const mapBackendProductToFrontend = (backendProduct: BackendProduct): Product => {
  // Xử lý trường đặc điểm nổi bật
  let features: string[] = [];
  if (backendProduct.DacDiemNoiBat) {
    // Chuyển chuỗi đặc điểm nổi bật thành mảng, phân tách bởi dấu chấm phẩy
    features = backendProduct.DacDiemNoiBat.split(';').map(feature => feature.trim()).filter(feature => feature !== '');
  }

  return {
    id: backendProduct.MaSP.toString(),
    name: backendProduct.TenSP,
    price: Number(backendProduct.GiaBan),
    description: backendProduct.MoTaDai,
    category: backendProduct.DanhMuc?.TenDanhMuc || 'Chưa phân loại',
    imageUrl: backendProduct.HinhAnhChinhURL,
    stock: Number(backendProduct.SoLuongTon),
    rating: Number(backendProduct.DiemDanhGiaTrungBinh || 0),
    reviews: Number(backendProduct.SoLuongDanhGia || backendProduct.DanhGia?.length || backendProduct.LuotXem || 0),
    features: features,
    comments: backendProduct.DanhGia?.map(review => ({
      id: review.MaDanhGia.toString(),
      userId: review.MaKH.toString(),
      rating: Number(review.DiemSo),
      comment: review.BinhLuan,
      date: new Date(review.NgayDanhGia)
    })) || []
  };
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { addItem } = useCart();

  // Lấy sản phẩm theo id từ API
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Lấy chi tiết sản phẩm theo ID
        const productId = parseInt(id || '0', 10);
        if (isNaN(productId) || productId <= 0) {
          throw new Error('ID sản phẩm không hợp lệ');
        }
        
        const response = await productAPI.getProductById(productId);
        
        if (response.status === 'success' && response.data) {
          const backendProduct = response.data as BackendProduct;
          const mappedProduct = mapBackendProductToFrontend(backendProduct);
          setProduct(mappedProduct);
          setSelectedImage(mappedProduct.imageUrl);
          
          // Sau khi có thông tin sản phẩm, lấy sản phẩm liên quan (cùng danh mục)
          if (backendProduct.MaDanhMuc) {
            await fetchRelatedProducts(backendProduct.MaDanhMuc, productId);
          }
        } else {
          setError('Không thể tải thông tin sản phẩm');
        }
      } catch (err) {
        console.error('Lỗi khi tải chi tiết sản phẩm:', err);
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async (categoryId: number, currentProductId: number) => {
      try {
        // Tạo tham số để lấy sản phẩm cùng danh mục, ngoại trừ sản phẩm hiện tại
        const params = {
          categoryId: categoryId.toString(),
          withReviews: 'true',
          limit: '4'
        };
        
        const response = await productAPI.getProducts(params);
        
        if (response.status === 'success' && response.data) {
          const backendProducts = response.data.products as BackendProduct[] || [];
          const mappedProducts = backendProducts
            .map(mapBackendProductToFrontend)
            .filter(product => product.id !== currentProductId.toString())
            .slice(0, 4);
          
          setRelatedProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm liên quan:', error);
        // Không hiển thị lỗi cho người dùng khi không thể tải được sản phẩm liên quan
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <motion.div 
        className={styles.loadingContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={styles.spinner}></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </motion.div>
    );
  }

  // Hiển thị thông báo lỗi
  if (error || !product) {
    return (
      <motion.div 
        className={styles.errorContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.errorContent}>
          <h2 className={styles.errorTitle}>Không tìm thấy sản phẩm</h2>
          <p className={styles.errorMessage}>
            {error || 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'}
          </p>
          <motion.button
            onClick={() => navigate('/products')}
            className={styles.errorButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách sản phẩm
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.max(1, Math.min(product.stock, quantity + value));
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    }
  };
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const slideUp = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/products"
            className={styles.backLink}
          >
            <ChevronLeft className={styles.backIcon} />
            Quay lại danh sách sản phẩm
          </Link>
        </motion.div>

        <motion.div 
          className={styles.productCard}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className={styles.productGrid}>
            {/* Ảnh sản phẩm */}
            <motion.div 
              className={styles.imageContainer}
              variants={fadeIn}
            >
              <motion.img
                src={selectedImage || product.imageUrl}
                  alt={product.name}
                className={styles.productImage}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                />
            </motion.div>

            {/* Thông tin sản phẩm */}
            <motion.div 
              className={styles.productInfo}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 
                className={styles.productTitle}
                variants={slideUp}
              >
                {product.name}
              </motion.h1>
              
              <motion.div 
                className={styles.ratingContainer}
                variants={slideUp}
              >
                <div className={styles.starContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        styles.star, 
                        i < Math.floor(product.rating) 
                          ? styles.starFilled
                          : styles.starEmpty
                      )}
                    />
                  ))}
                </div>
                <p className={styles.reviewCount}>{product.reviews} đánh giá</p>
              </motion.div>

              <motion.div 
                className={styles.priceContainer}
                variants={slideUp}
              >
                <p className={styles.price}>{formatPrice(product.price)}</p>
                <p className={styles.taxInfo}>Đã bao gồm thuế & phí</p>
              </motion.div>

              <motion.div 
                className={styles.shortDescription}
                variants={slideUp}
              >
                <h3 className={styles.sectionTitle}>Mô tả ngắn</h3>
                <p className={styles.sectionText}>{product.description}</p>
              </motion.div>

              <motion.div 
                className={styles.quantityContainer}
                variants={slideUp}
              >
                <div className={styles.quantityHeader}>
                  <h3 className={styles.sectionTitle}>Số lượng</h3>
                  <p className={styles.stockInfo}>{product.stock} sản phẩm có sẵn</p>
                </div>
                <div className={styles.quantityControls}>
                  <motion.button
                    type="button"
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Minus className="h-4 w-4" />
                  </motion.button>
                  <input
                    type="number"
                    className={styles.quantityInput}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    min="1"
                    max={product.stock}
                  />
                  <motion.button
                    type="button"
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>

              <motion.div 
                className={styles.actionButtons}
                variants={slideUp}
              >
                <motion.button
                  type="button"
                  onClick={handleAddToCart}
                  className={cn(
                    styles.primaryButton,
                    isAddedToCart && styles.success
                  )}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isAddedToCart ? (
                    <AnimatePresence>
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        <Check className={styles.buttonIcon} />
                      Đã thêm vào giỏ
                      </motion.span>
                    </AnimatePresence>
                  ) : (
                    <span className="flex items-center">
                      <ShoppingCart className={styles.buttonIcon} />
                      Thêm vào giỏ
                    </span>
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  className={styles.secondaryButton}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Heart className={styles.buttonIcon} />
                  Yêu thích
                </motion.button>
                <motion.button
                  type="button"
                  className={styles.iconButton}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Share2 />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabButtons}>
              <motion.button
                className={cn(
                  styles.tabButton,
                  activeTab === 'description' && styles.active
                )}
                onClick={() => setActiveTab('description')}
                whileHover={{ color: activeTab !== 'description' ? "#374151" : undefined }}
              >
                Mô tả chi tiết
              </motion.button>
              <motion.button
                className={cn(
                  styles.tabButton,
                  activeTab === 'specifications' && styles.active
                )}
                onClick={() => setActiveTab('specifications')}
                whileHover={{ color: activeTab !== 'specifications' ? "#374151" : undefined }}
              >
                Thông số kỹ thuật
              </motion.button>
            </div>

            <div className={styles.tabContent}>
              <AnimatePresence mode="wait">
              {activeTab === 'description' ? (
                  <motion.div
                    key="description"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className={styles.sectionText}>{product.description}</p>
                    <p className={styles.sectionText + " mt-4"}>
                    Sản phẩm {product.name} thuộc danh mục {product.category}, là một sự lựa chọn tuyệt vời cho những ai đang tìm kiếm sản phẩm chất lượng cao với giá cả hợp lý. Sản phẩm được sản xuất với chất lượng cao nhất, đảm bảo độ bền và hiệu suất sử dụng lâu dài.
                  </p>
                  </motion.div>
              ) : (
                  <motion.div
                    key="specifications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                  <div>
                      <h3 className={styles.sectionTitle}>Đặc điểm nổi bật</h3>
                      <ul className={styles.featureList}>
                      {product.features?.length ? (
                        product.features.map((feature, index) => (
                          <motion.li 
                            key={index} 
                            className={styles.featureItem}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Check className={styles.featureIcon} />
                            <span className={styles.sectionText}>{feature}</span>
                          </motion.li>
                        ))
                      ) : (
                        <motion.li 
                          className={styles.featureItem}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <span className={styles.sectionText}>Chưa có thông tin đặc điểm nổi bật.</span>
                        </motion.li>
                      )}
                    </ul>
                  </div>
                  
                    <div className={styles.specificationContainer}>
                      <h3 className={styles.sectionTitle}>Thông tin sản phẩm</h3>
                      <div className={styles.specificationTable}>
                        <div className={styles.specGrid}>
                          <div className={styles.specRow}>
                            <span className={styles.specLabel}>Danh mục</span>
                            <span className={styles.specValue}>{product.category}</span>
                          </div>
                          <div className={styles.specRow}>
                            <span className={styles.specLabel}>Trạng thái</span>
                            <span className={product.stock > 0 ? styles.specValueSuccess : styles.specValueError}>
                              {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                            </span>
                        </div>
                          <div className={styles.specRow}>
                            <span className={styles.specLabel}>Đánh giá</span>
                            <span className={styles.specValue}>{product.rating}/5 ({product.reviews} đánh giá)</span>
                        </div>
                          <div className={styles.specRow}>
                            <span className={styles.specLabel}>Số lượng còn</span>
                            <span className={styles.specValue}>{product.stock}</span>
                        </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
              )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Sản phẩm liên quan */}
        {relatedProducts.length > 0 && (
          <motion.div 
            className={styles.relatedProductsSection}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={styles.relatedProductsTitle}>Sản phẩm liên quan</h2>
            <div className={styles.relatedProductsGrid}>
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ y: -8 }}
                >
                  <Link
                    to={`/products/${relatedProduct.id}`}
                    className={styles.relatedProductCard}
                >
                    <div className={styles.relatedProductImageContainer}>
                    <img
                      src={relatedProduct.imageUrl}
                      alt={relatedProduct.name}
                        className={styles.relatedProductImage}
                    />
                  </div>
                    <div className={styles.relatedProductInfo}>
                      <h3 className={styles.relatedProductTitle}>
                      {relatedProduct.name}
                    </h3>
                      <div className={styles.relatedProductRating}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                            className={cn(
                              styles.star, 
                            i < Math.floor(relatedProduct.rating) 
                                ? styles.starFilled 
                                : styles.starEmpty
                          )}
                        />
                      ))}
                    </div>
                      <p className={styles.relatedProductPrice}>
                      {formatPrice(relatedProduct.price)}
                    </p>
                  </div>
                </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 