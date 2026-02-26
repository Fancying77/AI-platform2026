import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

interface HTMLPreviewProps {
  htmlCode: string;
  emptyMessage?: string;
}

const sizes = [
  { id: 'mobile', label: '手机', icon: Smartphone, width: '375px' },
  { id: 'desktop', label: '桌面', icon: Monitor, width: '100%' },
] as const;

export default function HTMLPreview({
  htmlCode,
  emptyMessage = '在下方输入设计需求，AI 将生成界面预览',
}: HTMLPreviewProps) {
  const [activeSize, setActiveSize] = useState<string>('desktop');
  const currentSize = sizes.find((s) => s.id === activeSize) || sizes[1];

  return (
    <div className="h-full flex flex-col bg-bg-gray overflow-hidden relative">
      {/* 尺寸切换 — 右上角悬浮小按钮 */}
      {htmlCode && (
        <div className="absolute top-2 right-3 z-10 flex items-center gap-0.5 bg-white/90 backdrop-blur rounded-md border border-border shadow-sm p-0.5">
          {sizes.map((size) => (
            <button
              key={size.id}
              onClick={() => setActiveSize(size.id)}
              title={size.label}
              className={`p-1.5 rounded transition-colors ${
                activeSize === size.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-bg-light'
              }`}
            >
              <size.icon size={14} />
            </button>
          ))}
        </div>
      )}

      {/* 预览区域 */}
      <div className="flex-1 overflow-auto flex justify-center p-3">
        {htmlCode ? (
          <div
            style={{ width: currentSize.width, maxWidth: '100%' }}
            className="bg-white rounded-lg shadow-sm border border-border overflow-hidden h-full"
          >
            <iframe
              sandbox=""
              srcDoc={htmlCode}
              title="设计预览"
              className="w-full h-full border-none"
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                <Monitor size={24} className="text-primary/50" />
              </div>
              <p className="text-sm text-text-tertiary">{emptyMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
