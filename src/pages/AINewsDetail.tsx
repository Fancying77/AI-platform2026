import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Share2,
  ExternalLink,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { addVisitRecord } from '../utils/visitHistory';
import ReactMarkdown from 'react-markdown';

export default function AINewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { aiNewsList, updateAINews, toggleFavorite, markAsRead, showToast } = useApp();
  const readRecordedRef = useRef<string | null>(null);
  const [showOriginalWarning, setShowOriginalWarning] = useState(false);

  const article = useMemo(() => aiNewsList.find(item => item.id === id) || null, [aiNewsList, id]);

  useEffect(() => {
    if (!article) {
      showToast('error', '文章不存在');
      navigate('/ai-news');
      return;
    }
    if (readRecordedRef.current === article.id) return;
    readRecordedRef.current = article.id;
    // 记录阅读量
    updateAINews(article.id, { readCount: article.readCount + 1 });
    // 标记为已读
    markAsRead(article.id);
    // 记录访问历史
    addVisitRecord({
      id: article.id,
      type: 'ai-news',
      title: article.title,
      path: `/ai-news/${article.id}`,
    });
  }, [article, navigate, showToast, updateAINews]);

  if (!article) {
    return null;
  }

  // 相关推荐（同分类，排除当前文章，最多3篇）
  const relatedArticles = aiNewsList
    .filter(item => item.id !== id && item.category === article.category)
    .slice(0, 3);

  const handleFavorite = () => {
    toggleFavorite(article.id);
    showToast('success', article.isFavorited ? '已取消收藏' : '已收藏');
  };

  const handleShare = () => {
    const url = `${window.location.origin}/ai-news/${article.id}`;
    navigator.clipboard.writeText(url);
    showToast('success', '链接已复制到剪贴板');
  };

  const handleOriginalLink = () => {
    setShowOriginalWarning(true);
  };

  const formatDate = (dateString: string) => {
    return dateString;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/ai-news')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={18} />
          返回列表
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFavorite}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-card transition-colors ${
              article.isFavorited
                ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            <Star size={16} className={article.isFavorited ? 'fill-yellow-400' : ''} />
            {article.isFavorited ? '已收藏' : '收藏'}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-text-secondary rounded-card hover:bg-gray-200 transition-colors"
          >
            <Share2 size={16} />
            分享
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="bg-white rounded-card border border-border p-8 mb-6">
            <h1 className="text-3xl font-bold text-text-primary mb-4">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-text-tertiary mb-4">
              <span>{article.source}</span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatDate(article.publishedAt)}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-text-secondary rounded-full">
                {article.category}
              </span>
            </div>

            {/* Original Link */}
            <div className="mb-6">
              <button
                onClick={handleOriginalLink}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover"
              >
                <ExternalLink size={14} />
                查看原文
              </button>
            </div>

            {/* Warning Modal */}
            {showOriginalWarning && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-card p-6 max-w-md mx-4">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-text-primary mb-2">境外地址提示</h3>
                      <p className="text-sm text-text-secondary mb-2">
                        原文链接为境外地址，内网可能无法访问。
                      </p>
                      <p className="text-sm text-text-tertiary">
                        {article.sourceUrl}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setShowOriginalWarning(false)}
                      className="px-4 py-2 text-sm text-text-secondary hover:bg-gray-100 rounded-card"
                    >
                      关闭
                    </button>
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowOriginalWarning(false)}
                      className="px-4 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
                    >
                      继续访问
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="bg-white rounded-card border border-border p-6">
              <h2 className="text-lg font-medium text-text-primary mb-4">相关推荐</h2>
              <div className="space-y-3">
                {relatedArticles.map(item => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/ai-news/${item.id}`)}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-card cursor-pointer transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-text-primary mb-1 line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-text-tertiary">
                        <span>{item.source}</span>
                        <span>·</span>
                        <span>{formatDate(item.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
