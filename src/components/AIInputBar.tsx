import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Send, X, Copy, ArrowDownToLine, Sparkles } from 'lucide-react';

interface AIReply {
  content: string;
  onInsert?: () => void;
  onCopy?: () => void;
}

interface AIInputBarProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  aiReply?: AIReply | null;
  onDismissReply?: () => void;
  leftActions?: ReactNode;
  rightActions?: ReactNode;
  placeholder?: string;
  assistantName?: string;
}

export default function AIInputBar({
  onSend,
  isLoading,
  aiReply,
  onDismissReply,
  leftActions,
  rightActions,
  placeholder = '向 AI 提问...',
  assistantName = 'AI 助手',
}: AIInputBarProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自适应高度
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.max(36, Math.min(el.scrollHeight, 120)) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="border-t border-border bg-white">
      {/* AI 回复区 */}
      {aiReply && (
        <div className="mx-3 mt-2 p-2.5 bg-primary/[0.03] rounded-lg border border-primary/15">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              <Sparkles size={12} className="text-primary" />
              <span className="text-[11px] font-medium text-primary">{assistantName}</span>
            </div>
            <button onClick={onDismissReply} className="p-0.5 text-text-tertiary hover:text-text-primary">
              <X size={13} />
            </button>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mb-1.5 max-h-32 overflow-auto whitespace-pre-wrap">
            {aiReply.content}
          </p>
          <div className="flex gap-1.5">
            {aiReply.onInsert && (
              <button onClick={aiReply.onInsert} className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-white bg-primary rounded hover:bg-primary-hover transition-colors">
                <ArrowDownToLine size={11} />插入
              </button>
            )}
            {aiReply.onCopy && (
              <button onClick={aiReply.onCopy} className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-text-secondary bg-white border border-border rounded hover:border-primary hover:text-primary transition-colors">
                <Copy size={11} />复制
              </button>
            )}
          </div>
        </div>
      )}

      {/* 输入行 + 操作按钮 — 单行布局 */}
      <div className="flex items-end gap-2 px-3 py-2">
        {leftActions && <div className="flex items-center gap-1.5 shrink-0 pb-0.5">{leftActions}</div>}
        <div className="flex-1 min-w-0 flex gap-1.5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder={isLoading ? '思考中...' : placeholder}
            rows={1}
            className="flex-1 min-w-0 px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-8 h-8 self-end flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
        {rightActions && <div className="flex items-center gap-1.5 shrink-0 pb-0.5">{rightActions}</div>}
      </div>
    </div>
  );
}
