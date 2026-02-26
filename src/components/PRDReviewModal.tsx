import { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';

interface ReviewItem {
  id: string;
  name: string;
  status: 'pass' | 'optimize' | 'fix' | 'scanning';
  description: string;
}

interface PRDReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  prdTitle: string;
  onBackToEdit?: () => void;
  onContinue?: () => void;
}

const mockReviewItems: ReviewItem[] = [
  { id: '1', name: '需求完整性', status: 'pass', description: '需求描述完整，包含背景、目标、功能点' },
  { id: '2', name: '背景目标阐述', status: 'pass', description: '背景清晰，目标明确可衡量' },
  { id: '3', name: '用户流程清晰度', status: 'optimize', description: '建议补充异常流程处理说明' },
  { id: '4', name: '埋点规范性', status: 'fix', description: '缺少关键埋点定义，需要补充' },
  { id: '5', name: '指标可衡量性', status: 'fix', description: '部分指标缺少具体数值目标' },
];

export default function PRDReviewModal({ isOpen, onClose, prdTitle, onBackToEdit, onContinue }: PRDReviewModalProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const resetTimer = setTimeout(() => {
        setIsScanning(true);
        setReviewItems([]);
        setScore(0);
      }, 0);

      // 模拟扫描过程
      const timer = setTimeout(() => {
        setIsScanning(false);
        setReviewItems(mockReviewItems);
        setScore(72);
      }, 2000);

      return () => {
        clearTimeout(resetTimer);
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [isOpen]);

  if (!isOpen) return null;

  const passCount = reviewItems.filter(item => item.status === 'pass').length;
  const optimizeCount = reviewItems.filter(item => item.status === 'optimize').length;
  const fixCount = reviewItems.filter(item => item.status === 'fix').length;

  const getStatusIcon = (status: ReviewItem['status']) => {
    switch (status) {
      case 'pass':
        return <Check size={16} className="text-green-500" />;
      case 'optimize':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'fix':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'scanning':
        return <Loader2 size={16} className="text-primary animate-spin" />;
    }
  };

  const getStatusLabel = (status: ReviewItem['status']) => {
    switch (status) {
      case 'pass':
        return <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded">通过</span>;
      case 'optimize':
        return <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded">建议优化</span>;
      case 'fix':
        return <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">必须修复</span>;
      case 'scanning':
        return <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">扫描中</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  // 计算圆环进度
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-card w-[560px] max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 id="review-modal-title" className="text-lg font-semibold text-text-primary">需求文档智能审查</h2>
            <p className="text-sm text-text-tertiary mt-0.5">{prdTitle}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-text-tertiary hover:text-text-primary"
            aria-label="关闭审查弹窗"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* Score Circle */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <svg width="120" height="120" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke={isScanning ? '#e5e7eb' : getScoreColor(score)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={isScanning ? circumference : strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isScanning ? (
                  <Loader2 size={24} className="text-primary animate-spin" />
                ) : (
                  <>
                    <span className="text-3xl font-bold" style={{ color: getScoreColor(score) }}>
                      {score}
                    </span>
                    <span className="text-xs text-text-tertiary">质量评分</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          {!isScanning && (
            <div className="flex justify-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-text-secondary">通过 {passCount} 项</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm text-text-secondary">优化 {optimizeCount} 项</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-text-secondary">修复 {fixCount} 项</span>
              </div>
            </div>
          )}

          {/* Review Items */}
          <div className="space-y-3">
            {isScanning ? (
              // Scanning state
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-bg-light rounded-card">
                  <div className="flex items-center gap-3">
                    <Loader2 size={16} className="text-primary animate-spin" />
                    <span className="text-sm text-text-secondary">扫描中...</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">扫描中</span>
                </div>
              ))
            ) : (
              reviewItems.map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-card border ${
                    item.status === 'pass'
                      ? 'bg-green-50 border-green-200'
                      : item.status === 'optimize'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="font-medium text-text-primary">{item.name}</span>
                    </div>
                    {getStatusLabel(item.status)}
                  </div>
                  <p className="text-sm text-text-secondary pl-6">{item.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-bg-light">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
          >
            关闭
          </button>
          {!isScanning && (fixCount > 0 || optimizeCount > 0) && (
            <button
              onClick={() => {
                onClose();
                onBackToEdit?.();
              }}
              className="px-4 py-2 text-sm text-primary border border-primary rounded-card hover:bg-primary-light"
            >
              返回修改
            </button>
          )}
          {!isScanning && onContinue && (
            <button
              onClick={() => {
                onClose();
                onContinue();
              }}
              className="px-4 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
            >
              继续
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
