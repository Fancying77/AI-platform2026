import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Link,
  Code,
  Quote,
  Minus,
} from 'lucide-react';

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onContentChange: (newValue: string) => void;
  content: string;
}

type ToolAction = {
  icon: React.ElementType;
  label: string;
  prefix: string;
  suffix?: string;
  block?: boolean; // 是否是块级操作（在行首插入）
};

const tools: ToolAction[] = [
  { icon: Bold, label: '加粗', prefix: '**', suffix: '**' },
  { icon: Italic, label: '斜体', prefix: '*', suffix: '*' },
  { icon: Code, label: '代码', prefix: '`', suffix: '`' },
  { icon: Heading1, label: '标题1', prefix: '# ', block: true },
  { icon: Heading2, label: '标题2', prefix: '## ', block: true },
  { icon: Heading3, label: '标题3', prefix: '### ', block: true },
  { icon: List, label: '无序列表', prefix: '- ', block: true },
  { icon: ListOrdered, label: '有序列表', prefix: '1. ', block: true },
  { icon: CheckSquare, label: '任务列表', prefix: '- [ ] ', block: true },
  { icon: Quote, label: '引用', prefix: '> ', block: true },
  { icon: Link, label: '链接', prefix: '[', suffix: '](url)' },
  { icon: Minus, label: '分割线', prefix: '\n---\n', block: true },
];

export default function MarkdownToolbar({
  textareaRef,
  onContentChange,
  content,
}: MarkdownToolbarProps) {
  const applyTool = (tool: ToolAction) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);

    let newContent: string;
    let cursorPos: number;

    if (tool.block) {
      // 块级操作：在行首插入前缀
      const lineStart = content.lastIndexOf('\n', start - 1) + 1;
      newContent =
        content.slice(0, lineStart) +
        tool.prefix +
        content.slice(lineStart);
      cursorPos = start + tool.prefix.length;
    } else {
      // 内联操作：包裹选中文本
      const prefix = tool.prefix;
      const suffix = tool.suffix || '';
      newContent =
        content.slice(0, start) +
        prefix +
        (selected || '文本') +
        suffix +
        content.slice(end);
      cursorPos = selected
        ? end + prefix.length + suffix.length
        : start + prefix.length + 2; // "文本" 长度
    }

    onContentChange(newContent);

    // 恢复光标位置
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursorPos, cursorPos);
    });
  };

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 bg-bg-light border-b border-border overflow-x-auto">
      {tools.map((tool, i) => (
        <button
          key={tool.label}
          onClick={() => applyTool(tool)}
          title={tool.label}
          className={`p-1.5 rounded hover:bg-white hover:shadow-sm text-text-secondary hover:text-text-primary transition-colors ${
            i === 3 || i === 6 || i === 9 ? 'ml-1.5 pl-2 border-l border-border' : ''
          }`}
        >
          <tool.icon size={15} />
        </button>
      ))}
    </div>
  );
}
