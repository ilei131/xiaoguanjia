import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeaderProps {
  title?: string;
  actions?: React.ReactNode;
  onMenuClick: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function Header({ title, actions, onMenuClick, sidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all duration-300"
            aria-label="菜单"
          >
            <Menu size={20} />
          </button>
          <button
            onClick={onToggleSidebar}
            className="hidden md:block p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all duration-300"
            aria-label={sidebarOpen ? '收起侧边栏' : '展开侧边栏'}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          {title && (
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
