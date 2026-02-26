import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Star,
  Share2,
  Trash2,
  MoreVertical,
  Flame,
  Clock,
  Heart
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useClickOutside } from '../hooks/useClickOutside';
import ConfirmDialog from '../components/ConfirmDialog';
import { AINewsCardSkeleton } from '../components/Skeleton';
import type { AINewsItem, AINewsCategory } from '../types';

export default function AINewsFavorites() {
  const navigate = useNavigate();
  const { aiNewsList, aiNewsFavorites, deleteAINews, toggleFavorite, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AINewsCategory | 'all'>('all');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; item: AINewsItem | null }>({ isOpen: false, item: null });

  // 模拟加载状态
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // 点击外部关闭菜单
  const closeMenu = useCallback(() => setActiveMenu(null), []);
  const menuRef = useClickOutside<HTMLDivElement>(closeMenu);

  // ESC 键关闭菜单
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // 获取收藏的文章
  const favoritedArticles = aiNewsList.filter(item =>
    aiNewsFavorites.includes(item.id)
  );

  // 筛选逻辑
  const filteredList = favoritedArticles.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // 分类标签
  const categories: Array<{ value: AINewsCategory | 'all'; label: string }> = [
    { value: 'all', label: '全部' },
    { value: '大模型', label: '大模型' },
    { value: 'AI产品', label: 'AI产品' },
    { value: '开源项目', label: '开源项目' },
    { value: '研究论文', label: '研究论文' },
    { value: '行业融资', label: '行业融资' },
    { value: '政策法规', label: '政策法规' },
    { value: 'AI工具', label: 'AI工具' },
    { value: '技术教程', label: '技术教程' },
  ];

  const handleDeleteClick = (item: AINewsItem) => {
    setDeleteConfirm({ isOpen: true, item });
    setActiveMenu(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.item) {
      deleteAINews(deleteConfirm.item.id);
      showToast('success', '文章已删除');
    }
    setDeleteConfirm({ isOpen: false, item: null });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, item: null });
  };

  const handleFavorite = (item: AINewsItem) => {
    toggleFavorite(item.id);
    showToast('success', '已取消收藏');
    setActiveMenu(null);
  };

  const handleShare = (item: AINewsItem) => {
    const url = `${window.location.origin}/ai-news/${item.id}`;
    navigator.clipboard.writeText(url);
    showToast('success', '链接已复制到剪贴板');
    setActiveMenu(null);
  };

  const handleView = (item: AINewsItem) => {
    navigate(`/ai-news/${item.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    return dateString;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Heart size={20} className="text-red-500 fill-red-500" />
            <h1 className="text-xl font-medium text-text-primary">我的收藏</h1>
          </div>

          <div className="text-sm text-text-secondary">
            共 {filteredList.length} 条记录
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索收藏的文章..."
              aria-label="搜索收藏的文章"
              className="pl-10 pr-4 py-2 w-64 border border-border rounded-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${
                categoryFilter === cat.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <AINewsCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
            <Heart size={48} className="mb-4 text-gray-300" />
            <p className="text-lg mb-2">还没有收藏的文章</p>
            <button
              onClick={() => navigate('/ai-news')}
              className="text-sm text-primary hover:text-primary-hover"
            >
              去AI动态看看吧
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-card border border-border p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleView(item)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-medium text-text-primary flex-1 line-clamp-2">
                    {item.isHot && (
                      <Flame size={16} className="inline-block text-orange-500 mr-1" aria-label="热门" />
                    )}
                    {item.title}
                  </h3>
                  <div className="relative ml-2" ref={activeMenu === item.id ? menuRef : null}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === item.id ? null : item.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      aria-label="更多操作"
                    >
                      <MoreVertical size={16} className="text-text-tertiary" />
                    </button>

                    {activeMenu === item.id && (
                      <div className="absolute right-0 top-8 w-40 bg-white border border-border rounded-card shadow-lg z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavorite(item);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-left"
                        >
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          取消收藏
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(item);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-left"
                        >
                          <Share2 size={14} />
                          分享
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(item);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-left text-red-600"
                        >
                          <Trash2 size={14} />
                          删除
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <p className="text-sm text-text-secondary mb-4 line-clamp-3">
                  {item.summary}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-text-tertiary">
                  <div className="flex items-center gap-3">
                    <span>{item.source}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(item.publishedAt)}
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-text-secondary rounded-full">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="删除文章"
        message={`确定要删除「${deleteConfirm.item?.title}」吗？此操作不可恢复。`}
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        type="danger"
      />
    </div>
  );
}