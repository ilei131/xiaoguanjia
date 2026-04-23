import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Package,
  BarChart3,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  MapPinHouse,
  LayoutDashboard
} from 'lucide-react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

export default function Layout({ children, title, actions }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: '仪表盘', path: '/' },
    { icon: Package, label: '物品管理', path: '/items' },
    { icon: BarChart3, label: '分类管理', path: '/categories' },
    { icon: MapPinHouse, label: '地点管理', path: '/locations' },
    { icon: Settings, label: '设置', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* 侧边栏 - 桌面版 */}
      <div className={`hidden md:flex ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out flex-col bg-white border-r border-gray-200 shadow-soft`}>
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center shadow-glow">
              <Package className="text-white" size={20} />
            </div>
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-primary-600">小管家</h1>
            )}
          </div>
        </div>

        <nav className="flex-1 mt-6 px-3">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`}
                  >
                    <Icon size={20} />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="h-16 flex items-center gap-3 px-4 border-t border-gray-200">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="text-gray-500" size={20} />
          </div>
          {sidebarOpen && (
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name || '用户'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all duration-300"
            title="退出登录"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* 侧边栏 - 移动版 */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 animate-slide-in">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center shadow-glow">
                  <Package className="text-white" size={20} />
                </div>
                <h1 className="text-xl font-bold text-primary-600">小管家</h1>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 mt-6 px-3">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-700'}`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="h-16 flex items-center gap-3 px-4 border-t border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="text-gray-500" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.name || '用户'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                title="退出登录"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <Header
          title={title}
          actions={actions}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {/* 侧边栏折叠/展开按钮（桌面端） */}
        <div className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 bg-white rounded-full shadow-soft flex items-center justify-center hover:bg-gray-50 transition-all duration-300 border border-gray-200"
            aria-label={sidebarOpen ? '收起侧边栏' : '展开侧边栏'}
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
