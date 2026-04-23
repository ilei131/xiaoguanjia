import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ChevronRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, error, isLoading, clearError } = useAuthStore();

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-medium p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500 flex items-center justify-center shadow-glow">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-primary-600 mb-2">小管家</h1>
          <p className="text-gray-500">登录您的账户</p>
        </div>
        
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                记住我
              </label>
            </div>
            
            <div className="text-sm">
              <a href="#" className="font-medium text-primary-500 hover:text-primary-600">
                忘记密码?
              </a>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-soft"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>登录</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-gray-600">还没有账户? </span>
            <a href="/register" className="font-medium text-primary-500 hover:text-primary-600">
              立即注册
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
