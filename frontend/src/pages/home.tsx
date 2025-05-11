import { Link } from 'react-router-dom';
import { PenLine, BookOpen, Palette, ShoppingBag, ArrowRight, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Import css module
import styles from '@/styles/home.module.css';

// Import animation variants
import {
  containerVariants,
  itemVariants,
  buttonVariants,
  fadeInUpVariants,
  cardHoverVariants,
  iconHoverVariants,
  scrollIndicatorVariants,
  linkHoverVariants
} from '@/animations/variants';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
    // Thiết lập hiệu ứng parallax khi trang được tải
  }, []);

  const categories = [
    { name: 'Bút viết', icon: PenLine, description: 'Bút bi, bút mực, bút chì và các loại bút khác' },
    { name: 'Sổ & Vở', icon: BookOpen, description: 'Sổ tay, vở ghi chép các loại' },
    { name: 'Dụng cụ vẽ', icon: Palette, description: 'Màu vẽ, cọ, giấy vẽ và phụ kiện' },
    { name: 'Văn phòng phẩm', icon: ShoppingBag, description: 'Kẹp giấy, ghim, kéo, băng keo và các dụng cụ văn phòng' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Hero Section with Parallax */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}>
          <div className={styles.heroOverlay}></div>
          <div 
            className={styles.heroBackgroundImage}
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1530025809667-59a078ea6e51?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80')",
              transform: isVisible ? 'scale(1.05)' : 'scale(1.15)',
              transition: 'transform 3s ease-out'
            }}
          ></div>
        </div>

        <motion.div 
          className={styles.heroContent}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 
            className={styles.heroTitle}
            variants={itemVariants}
          >
            <span className={styles.heroTitleGradient}>Modern Stationery Store</span>
            <span className={styles.heroTitleSecondary}>Văn phòng phẩm hiện đại</span>
          </motion.h1>
          
          <motion.p 
            className={styles.heroDescription}
            variants={itemVariants}
          >
            Khám phá bộ sưu tập văn phòng phẩm đa dạng và hiện đại. Từ bút viết cao cấp đến các dụng cụ học tập sáng tạo.
          </motion.p>
          
          <motion.div 
            className={styles.heroButtonContainer}
            variants={itemVariants}
          >
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Link
                to="/products"
                className="group relative inline-flex w-full sm:w-auto items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 text-center text-sm font-medium text-white"
              >
                <span className="relative flex w-full items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 px-8 py-3.5 transition-all duration-300 ease-out group-hover:bg-opacity-0 md:py-4 md:px-10 md:text-lg">
                  <span>Xem sản phẩm</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </Link>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Link
                to="/register"
                className="group relative inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-white p-0.5 text-center text-sm font-medium border border-transparent"
              >
                <span className="relative flex w-full items-center justify-center rounded-md bg-white px-8 py-3.5 text-blue-600 transition-all duration-300 ease-out md:py-4 md:px-10 md:text-lg">
                  Đăng ký ngay
                </span>
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className={styles.scrollIndicator}
            variants={scrollIndicatorVariants}
            initial="initial"
            animate="animate"
          >
            <ChevronDown className="h-10 w-10 text-gray-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* Categories Section with Hover Effects */}
      <section className={styles.categoriesSection}>
        <div className={styles.sectionContainer}>
          <motion.div
            className={styles.sectionHeader}
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className={styles.sectionTitle}>Danh mục sản phẩm</h2>
            <div className={styles.sectionDivider}></div>
            <p className={styles.sectionDescription}>Khám phá các danh mục sản phẩm đa dạng của chúng tôi</p>
          </motion.div>

          <div className={styles.categoriesGrid}>
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link 
                  key={category.name} 
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="block"
                >
                  <motion.div
                    className={styles.categoryCard}
                    variants={{
                      ...fadeInUpVariants,
                      hover: cardHoverVariants.hover
                    }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover="hover"
                    onHoverStart={() => setActiveCategory(index)}
                    onHoverEnd={() => setActiveCategory(null)}
                  >
                    <motion.div 
                      className={styles.categoryIcon}
                      variants={iconHoverVariants}
                      animate={activeCategory === index ? "hover" : "initial"}
                    >
                      <Icon className="h-8 w-8" />
                    </motion.div>
                    <div className={styles.categoryContent}>
                      <h3 className={styles.categoryTitle}>{category.name}</h3>
                      <p className={styles.categoryDescription}>{category.description}</p>
                    </div>
                    <motion.div 
                      className={styles.categoryLink}
                      variants={linkHoverVariants}
                      animate={activeCategory === index ? "hover" : "initial"}
                    >
                      <span>Xem thêm</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </motion.div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}