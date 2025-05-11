import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useNotification } from '@/lib/notification-context';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUpVariants, containerVariants, itemVariants } from '@/animations/variants';

interface RegisterForm {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
  address?: string;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuth();
  const { showNotification } = useNotification();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  
  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    try {
      // Kiểm tra xác nhận mật khẩu
      if (data.password !== data.confirmPassword) {
        showNotification('error', 'Mật khẩu xác nhận không khớp.');
        return;
      }
      
      const success = await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        address: data.address
      });
      
      if (success) {
        showNotification('success', 'Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        showNotification('error', 'Đăng ký thất bại. Vui lòng thử lại sau.');
      }
    } catch (error) {
      showNotification('error', 'Có lỗi xảy ra khi đăng ký.');
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="sm:mx-auto sm:w-full sm:max-w-md"
        variants={fadeInUpVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 
          className="mt-6 text-center text-3xl font-extrabold text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Đăng ký tài khoản
        </motion.h2>
      </motion.div>

      <motion.div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        variants={fadeInUpVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <motion.div 
          className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.4,
            delay: 0.3
          }}
        >
          <motion.form 
            className="space-y-6" 
            onSubmit={handleSubmit(onSubmit)}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <motion.div whileTap={{ scale: 0.99 }}>
                  <Input
                    id="fullName"
                    type="text"
                    {...register('fullName', {
                      required: 'Họ và tên là bắt buộc',
                      minLength: {
                        value: 2,
                        message: 'Họ và tên phải có ít nhất 2 ký tự'
                      }
                    })}
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.fullName && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {errors.fullName.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <motion.div whileTap={{ scale: 0.99 }}>
                  <Input
                    id="email"
                    type="email"
                    {...register('email', {
                      required: 'Email là bắt buộc',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email không hợp lệ'
                      }
                    })}
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <div className="mt-1">
                <motion.div whileTap={{ scale: 0.99 }}>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    {...register('phoneNumber', {
                      pattern: {
                        value: /^(0|\+84)(\d{9,10})$/,
                        message: 'Số điện thoại không hợp lệ'
                      }
                    })}
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.phoneNumber && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {errors.phoneNumber.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Địa chỉ
              </label>
              <div className="mt-1">
                <motion.div whileTap={{ scale: 0.99 }}>
                  <Input
                    id="address"
                    type="text"
                    {...register('address')}
                  />
                </motion.div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <motion.div whileTap={{ scale: 0.99 }}>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Mật khẩu là bắt buộc',
                      minLength: {
                        value: 8,
                        message: 'Mật khẩu phải có ít nhất 8 ký tự'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                        message: 'Mật khẩu phải có ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt'
                      }
                    })}
                  />
                </motion.div>
                <motion.button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </motion.button>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <motion.div whileTap={{ scale: 0.99 }}>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: 'Xác nhận mật khẩu là bắt buộc',
                      validate: value => 
                        value === password || "Mật khẩu xác nhận không khớp"
                    })}
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full flex justify-center"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Đăng ký
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div 
            className="mt-6"
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            <motion.div 
              className="mt-6 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="flex items-center justify-center"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Quay lại
                </Button>
              </motion.div>
              
              <div className="text-sm text-center">
                <motion.div
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Đã có tài khoản? Đăng nhập
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}