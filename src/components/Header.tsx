import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, LogOut, Clock, Zap, Trophy, ChevronDown } from 'lucide-react';
import { useApp } from '../store/AppContext';

const titleMap: Record<string, string> = {
  '/dashboard': '工作台',
  '/projects': '我的项目',
  '/projects/create': '新建项目',
  '/prd': '我的需求',
  '/prd/create': '新建需求',
  '/ui': '我的设计',
  '/ui/create': '新建设计',
  '/ai-news/favorites': '我的收藏',
  '/ai-news': 'AI 动态',
};

const BC = '#EDEDEE';

export default function Header() {
  const location = useLocation();
  const { userInfo } = useApp();

  const [showUsage, setShowUsage] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showRank, setShowRank] = useState(false);
  const usageRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<HTMLDivElement>(null);
  const rankRef = useRef<HTMLDivElement>(null);

  const closeAll = () => { setShowUsage(false); setShowToken(false); setShowRank(false); };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (usageRef.current && !usageRef.current.contains(e.target as Node)) setShowUsage(false);
      if (tokenRef.current && !tokenRef.current.contains(e.target as Node)) setShowToken(false);
      if (rankRef.current && !rankRef.current.contains(e.target as Node)) setShowRank(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getTitle = () => {
    if (titleMap[location.pathname]) return titleMap[location.pathname];
    for (const [path, title] of Object.entries(titleMap)) {
      if (location.pathname.startsWith(path)) return title;
    }
    return '我的项目';
  };

  const handleLogout = () => {
    if (window.confirm('确定要退出当前账号吗？')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-text-primary">{getTitle()}</h1>

      <div className="flex items-center gap-2">
        {/* 使用时长 */}
        <div className="relative" ref={usageRef}>
          <button onClick={() => { closeAll(); setShowUsage(v => !v); }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm hover:bg-gray-50" style={{ border: `1px solid ${BC}` }}>
            <Clock className="w-3.5 h-3.5" style={{ color: '#4E5969' }} /><span style={{ color: '#1E2533' }}>3h</span><ChevronDown className="w-3 h-3" style={{ color: '#84888F' }} />
          </button>
          {showUsage && (<div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg p-3 z-50" style={{ border: `1px solid ${BC}` }}>
            <div className="text-sm font-medium mb-2" style={{ color: '#1E2533' }}>使用统计</div>
            <div className="space-y-1.5 text-sm">{[['今日','3小时'],['本周','15小时'],['本月','68小时']].map(([l,v])=>(<div key={l} className="flex justify-between"><span style={{color:'#4E5969'}}>{l}</span><span style={{color:'#1E2533'}}>{v}</span></div>))}</div>
          </div>)}
        </div>
        {/* Token */}
        <div className="relative" ref={tokenRef}>
          <button onClick={() => { closeAll(); setShowToken(v => !v); }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm hover:bg-gray-50" style={{ border: `1px solid ${BC}` }}>
            <Zap className="w-3.5 h-3.5" style={{ color: '#4E5969' }} /><span style={{ color: '#1E2533' }}>15.7K</span><ChevronDown className="w-3 h-3" style={{ color: '#84888F' }} />
          </button>
          {showToken && (<div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg p-3 z-50" style={{ border: `1px solid ${BC}` }}>
            <div className="text-sm font-medium mb-2" style={{color:'#1E2533'}}>Token 消耗</div>
            <div className="space-y-1.5 text-sm">{[['今日','15.7K'],['本周','87.2K'],['本月','342K']].map(([l,v])=>(<div key={l} className="flex justify-between"><span style={{color:'#4E5969'}}>{l}</span><span style={{color:'#1E2533'}}>{v}</span></div>))}</div>
          </div>)}
        </div>
        {/* 排名 */}
        <div className="relative" ref={rankRef}>
          <button onClick={() => { closeAll(); setShowRank(v => !v); }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm hover:bg-gray-50" style={{ border: `1px solid ${BC}` }}>
            <Trophy className="w-3.5 h-3.5" style={{ color: '#4E5969' }} /><span style={{ color: '#1E2533' }}>#{userInfo.rank}</span><ChevronDown className="w-3 h-3" style={{ color: '#84888F' }} />
          </button>
          {showRank && (<div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg p-3 z-50" style={{ border: `1px solid ${BC}` }}>
            <div className="text-sm font-medium mb-2" style={{color:'#1E2533'}}>我的排行</div>
            <div className="space-y-1.5 text-sm">{[['当前排名','第 5 名'],['历史最佳','第 2 名'],['进入TOP3','5 次']].map(([l,v])=>(<div key={l} className="flex justify-between"><span style={{color:'#4E5969'}}>{l}</span><span style={{color:'#1E2533'}}>{v}</span></div>))}</div>
          </div>)}
        </div>

        <div className="w-px h-6 mx-1" style={{ backgroundColor: BC }} />

        {/* 用户信息 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            {userInfo.avatar ? (
              <img src={userInfo.avatar} alt="cancanli" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={16} className="text-gray-600" />
            )}
          </div>
          <span className="text-sm font-medium text-text-primary">cancanli</span>
        </div>
        <button onClick={handleLogout} className="p-2 hover:bg-bg-light rounded transition-colors" title="退出登录">
          <LogOut size={16} className="text-text-secondary" />
        </button>
      </div>
    </header>
  );
}
