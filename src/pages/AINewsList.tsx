import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Share2,
  Trash2,
  MoreVertical,
  Flame,
  Clock,
  BookOpen
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useClickOutside } from '../hooks/useClickOutside';
import ConfirmDialog from '../components/ConfirmDialog';
import { AINewsCardSkeleton } from '../components/Skeleton';
import type { AINewsItem, AINewsCategory } from '../types';

export default function AINewsList() {
  const navigate = useNavigate();
  const { aiNewsList, deleteAINews, toggleFavorite, showToast } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<AINewsCategory | 'all' | 'read' | 'favorited'>('all');
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

  // 筛选逻辑
  const filteredList = aiNewsList.filter(item => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'read') return item.isRead;
    if (categoryFilter === 'favorited') return item.isFavorited;
    return item.category === categoryFilter;
  });

  // 分类标签
  type FilterValue = AINewsCategory | 'all' | 'read' | 'favorited';
  const categories: Array<{ value: FilterValue; label: string; icon?: 'read' | 'star' }> = [
    { value: 'all', label: '全部' },
    { value: 'read', label: '我读过的', icon: 'read' },
    { value: 'favorited', label: '我收藏的', icon: 'star' },
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
    showToast('success', item.isFavorited ? '已取消收藏' : '已收藏');
    setActiveMenu(null);
  };

  const handleShare = (item: AINewsItem) => {
    // 复制链接到剪贴板
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

  // 按日期分组
  const groupedByDate = filteredList.reduce((acc, item) => {
    const date = item.publishedAt;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, AINewsItem[]>);

  // 获取排序后的日期列表（最新的在前）
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="mb-4">
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
                categoryFilter === cat.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {cat.icon === 'read' && <BookOpen size={13} />}
              {cat.icon === 'star' && <Star size={13} className={categoryFilter === cat.value ? 'fill-white' : ''} />}
              {cat.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-text-tertiary whitespace-nowrap">
            {filteredList.length} 条
          </span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="pr-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="mb-6">
                <AINewsCardSkeleton />
              </div>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
            <p>暂无AI动态记录</p>
          </div>
        ) : (
          <div className="pr-2">
            {/* Timeline */}
            <div className="relative">
              {sortedDates.map((date, dateIndex) => (
                <div key={date} className="relative">
                  {/* Timeline Line */}
                  {dateIndex < sortedDates.length - 1 && (
                    <div className="absolute left-[15px] top-[40px] bottom-0 w-[2px] bg-gray-200" />
                  )}

                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-medium z-10">
                      <Clock size={16} />
                    </div>
                    <div className="text-base font-medium text-text-primary">
                      {formatDate(date)}
                      <span className="ml-2 text-sm text-text-tertiary font-normal">
                        {date}
                      </span>
                    </div>
                  </div>

                  {/* News Items for this date */}
                  <div className="ml-10 space-y-3 mb-6">
                    {groupedByDate[date].map(item => (
                      <div
                        key={item.id}
                        className="bg-white rounded-card border border-border p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleView(item)}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
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
                                  <Star size={14} className={item.isFavorited ? 'fill-yellow-400 text-yellow-400' : ''} />
                                  {item.isFavorited ? '取消收藏' : '收藏'}
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
                        <p className="text-sm text-text-secondary mb-3 line-clamp-3">
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
                          <div className="flex items-center gap-1.5">
                            {item.isRead && (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full text-[11px]">
                                <BookOpen size={10} />
                                已读
                              </span>
                            )}
                            {item.isFavorited && (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-50 text-yellow-600 rounded-full text-[11px]">
                                <Star size={10} className="fill-yellow-400" />
                                收藏
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-gray-100 text-text-secondary rounded-full">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
