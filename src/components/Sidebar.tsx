import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, Palette, ChevronLeft, ChevronRight, FolderKanban, Newspaper, Home } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: '工作台',
    path: '/dashboard',
    icon: <Home size={18} aria-hidden="true" />,
  },
  {
    label: 'AI 动态',
    path: '/ai-news',
    icon: <Newspaper size={18} aria-hidden="true" />,
  },
  {
    label: '我的项目',
    path: '/projects',
    icon: <FolderKanban size={18} aria-hidden="true" />,
  },
  {
    label: '我的需求',
    path: '/prd',
    icon: <FileText size={18} aria-hidden="true" />,
  },
  {
    label: '我的设计',
    path: '/ui',
    icon: <Palette size={18} aria-hidden="true" />,
  },
];

const SIDEBAR_COLLAPSED_KEY = 'lexin_sidebar_collapsed';

export default function Sidebar() {
  // 始终默认收起状态
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`h-screen bg-sidebar text-white flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
      aria-label="主导航"
    >
      {/* Logo / Toggle */}
      <div className="h-20 flex flex-col justify-center px-4 border-b border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center justify-between">
            <div>
              <div
                style={{
                  fontFamily: 'PingFang SC',
                  fontSize: '16px',
                  lineHeight: '22px',
                  fontWeight: 600,
                }}
              >
                乐信
              </div>
              <div
                className="text-gray-300"
                style={{
                  fontFamily: 'PingFang SC',
                  fontSize: '14px',
                  lineHeight: '20px',
                  fontWeight: 500,
                }}
              >
                产品AI工作平台
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-800 rounded-card transition-colors"
              aria-label="收起侧边栏"
              title="收起侧边栏"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-800 rounded-card transition-colors mx-auto"
            aria-label="展开侧边栏"
            title="展开侧边栏"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto" aria-label="功能导航">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors ${
                isActive ? 'bg-gray-800 text-primary' : 'text-white'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
            title={isCollapsed ? item.label : undefined}
          >
            {item.icon}
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
