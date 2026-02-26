import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Upload,
  Trash2,
  RefreshCw,
  Copy,
  Download,
  ChevronRight,
  Target,
  BarChart3,
  Users,
  Layers,
  Activity,
  FileDown,
  FileText,
  Share2,
  Palette,
  CheckCircle,
  Check,
  AlertTriangle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import StepIndicator from '../components/StepIndicator';
import ConfirmDialog from '../components/ConfirmDialog';
import Celebration from '../components/Celebration';
import { ChangeRequestDialog } from '../components/versioning/ChangeRequestDialog';
import { AI_ASSISTANT, getRandomEncouragement, checkMilestone } from '../constants/aiAssistant';
import type { PRDItem } from '../types';

const steps = [
  { id: 1, label: '新建需求' },
  { id: 2, label: '需求审查' },
  { id: 3, label: '需求导出' },
];

const aiSuggestionCategories = [
  {
    id: 'background',
    icon: Target,
    title: '背景目标',
    question: '这个需求要解决什么问题？',
    example: '例：提升用户登录转化率，目标从60%提升至80%'
  },
  {
    id: 'metrics',
    icon: BarChart3,
    title: '核心指标',
    question: '如何衡量需求是否成功？',
    example: '例：登录成功率、平均登录时长、用户留存率'
  },
  {
    id: 'users',
    icon: Users,
    title: '目标用户',
    question: '这个功能面向哪些用户群体？',
    example: '例：新注册用户、活跃用户、流失召回用户'
  },
  {
    id: 'scenarios',
    icon: Layers,
    title: '核心场景',
    question: '用户在什么场景下使用？',
    example: '例：首次登录、密码找回、切换账号'
  },
  {
    id: 'tracking',
    icon: Activity,
    title: '关键埋点',
    question: '需要追踪哪些用户行为？',
    example: '例：页面曝光、按钮点击、登录结果'
  },
];

// PRD智能检查清单
const prdChecklistItems = [
  { id: 'background', label: '需求背景与目标是否清晰？', category: '基础信息' },
  { id: 'users', label: '目标用户群体是否明确？', category: '基础信息' },
  { id: 'scenarios', label: '核心使用场景是否完整？', category: '基础信息' },
  { id: 'features', label: '功能需求是否详细描述？', category: '功能设计' },
  { id: 'priority', label: '功能优先级是否标注？', category: '功能设计' },
  { id: 'interaction', label: '交互流程是否清晰？', category: '功能设计' },
  { id: 'edge_cases', label: '异常情况是否考虑？', category: '功能设计' },
  { id: 'metrics', label: '成功指标是否定义？', category: '数据埋点' },
  { id: 'tracking', label: '关键埋点是否规划？', category: '数据埋点' },
  { id: 'performance', label: '性能要求是否明确？', category: '非功能需求' },
  { id: 'compatibility', label: '兼容性要求是否说明？', category: '非功能需求' },
  { id: 'security', label: '安全性考虑是否完善？', category: '非功能需求' },
];

const modelOptions = [
  { id: 'gpt4', name: 'GPT-4' },
  { id: 'gpt35', name: 'GPT-3.5' },
  { id: 'claude', name: 'Claude' },
];

const MAX_CHARS = 10000;

interface PRDCreateLocationState {
  editPRD?: PRDItem;
  projectId?: string;
}

export const PRDCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, addPRD, prdList, projectList, createPRDVersion } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 编辑模式
  const locationState = location.state as PRDCreateLocationState | null;
  const editPRD = locationState?.editPRD;
  const isEditMode = !!editPRD;
  const initialProjectId = locationState?.projectId || editPRD?.projectId;

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedModel, setSelectedModel] = useState('gpt4');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(initialProjectId);
  const [requirement, setRequirement] = useState('');
  const [prdContent, setPrdContent] = useState('');
  const [prdTitle, setPrdTitle] = useState('');
  const [requirementName, setRequirementName] = useState('');
  const [priority, setPriority] = useState<'P0' | 'P1' | 'P2' | 'P3'>('P1');
  const [source, setSource] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewScanning, setIsReviewScanning] = useState(true);
  const [reviewScore, setReviewScore] = useState(0);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [encouragement, setEncouragement] = useState(getRandomEncouragement());
  const [isChangeRequestOpen, setIsChangeRequestOpen] = useState(false);
  const [pendingVersion, setPendingVersion] = useState<Pick<PRDItem, 'title' | 'description' | 'content' | 'status' | 'projectId'> & { requirementName?: string; priority?: PRDItem['priority']; source?: string } | null>(null);

  // 编辑模式：填充数据
  useEffect(() => {
    if (editPRD) {
      const resetTimer = setTimeout(() => {
        setPrdTitle(editPRD.title);
        setRequirement(editPRD.description);
        setPrdContent(editPRD.content);
        setRequirementName(editPRD.requirementName || '');
        setPriority(editPRD.priority || 'P1');
        setSource(editPRD.source || '');
        setCurrentStep(1); // 编辑模式也从第一步开始
      }, 0);
      return () => clearTimeout(resetTimer);
    }
    return undefined;
  }, [editPRD]);

  // AI Chat states for Step 2
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showChecklist, setShowChecklist] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setReferenceImages(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleGenerate = async () => {
    if (!requirement.trim()) {
      showToast('warning', '请先输入需求描述');
      return;
    }

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 生成完整的 PRD 内容并替换到需求描述区域
    const generatedPRD = `# 用户登录流程优化需求

## 1. 背景与目标
${requirement}

### 1.1 业务背景
当前登录流程存在以下问题：
- 登录步骤繁琐，用户流失率高
- 不支持多种登录方式
- 缺少记住登录状态功能

### 1.2 项目目标
- 简化登录流程，减少用户操作步骤
- 提升登录成功率至95%以上
- 支持多种登录方式

## 2. 目标用户
- 新注册用户：首次使用产品的用户
- 活跃用户：日常使用产品的用户
- 流失用户：长期未登录需要召回的用户

## 3. 功能需求

### 3.1 手机号登录
- 支持手机号+验证码登录
- 验证码有效期60秒
- 每日发送上限10条

### 3.2 第三方登录
- 支持微信登录
- 支持支付宝登录
- 首次登录需绑定手机号

### 3.3 记住登录状态
- 支持7天免登录
- 支持手动退出登录

## 4. 非功能需求
- 登录接口响应时间 < 500ms
- 支持高并发场景（1000 QPS）
- 兼容主流浏览器

## 5. 数据埋点
| 埋点名称 | 触发时机 | 上报参数 |
|---------|---------|---------|
| login_page_view | 页面曝光 | page_source |
| login_btn_click | 点击登录 | login_type |
| login_result | 登录结果 | success, error_code |

## 6. 验收标准
- [ ] 登录流程步骤不超过3步
- [ ] 支持所有主流浏览器
- [ ] 登录成功率 ≥ 95%
`;

    // 直接替换需求描述内容
    setRequirement(generatedPRD);
    setPrdContent(generatedPRD);
    setPrdTitle('用户登录流程优化需求');

    setIsGenerating(false);
    showToast('success', '需求文档已生成并更新');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(requirement);
    showToast('success', '已复制到剪贴板');
  };

  const handleExportMD = () => {
    const blob = new Blob([requirement], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prdTitle || '需求文档'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Markdown文档已导出');
  };

  const handleExportWord = () => {
    // 将Markdown转换为简单的HTML格式用于Word
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${prdTitle || '需求文档'}</title>
<style>
body { font-family: 'Microsoft YaHei', Arial, sans-serif; line-height: 1.6; padding: 40px; }
h1 { color: #333; border-bottom: 2px solid #4D83FF; padding-bottom: 10px; }
h2 { color: #444; margin-top: 24px; }
h3 { color: #555; }
table { border-collapse: collapse; width: 100%; margin: 16px 0; }
th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
th { background-color: #f5f5f5; }
ul, ol { padding-left: 24px; }
li { margin: 4px 0; }
</style>
</head>
<body>
${requirement
  .replace(/^# (.*$)/gm, '<h1>$1</h1>')
  .replace(/^## (.*$)/gm, '<h2>$1</h2>')
  .replace(/^### (.*$)/gm, '<h3>$1</h3>')
  .replace(/^- (.*$)/gm, '<li>$1</li>')
  .replace(/\n\n/g, '</p><p>')
  .replace(/\|(.+)\|/g, (match) => {
    const cells = match.split('|').filter(c => c.trim());
    return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
  })
}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prdTitle || '需求文档'}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Word文档已导出');
  };

  const handleSyncTAPD = () => {
    showToast('info', 'TAPD同步功能开发中，敬请期待');
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsChatLoading(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse = `我已经理解您的需求："${userMessage}"。我会帮您优化PRD文档的相关内容。`;
    setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    setIsChatLoading(false);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setChatInput(suggestion);
  };

  const handleClear = () => {
    if (requirement.trim() || referenceImages.length > 0) {
      setIsClearConfirmOpen(true);
    }
  };

  const confirmClear = () => {
    setRequirement('');
    setReferenceImages([]);
    setIsClearConfirmOpen(false);
    showToast('success', '已清空内容');
  };

  const handleChecklistToggle = (itemId: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const checklistProgress = Math.round((checkedItems.size / prdChecklistItems.length) * 100);

  // 审核相关数据
  const mockReviewItems = [
    { id: '1', name: '需求完整性', status: 'pass' as const, description: '需求描述完整，包含背景、目标、功能点' },
    { id: '2', name: '背景目标阐述', status: 'pass' as const, description: '背景清晰，目标明确可衡量' },
    { id: '3', name: '用户流程清晰度', status: 'optimize' as const, description: '建议补充异常流程处理说明' },
    { id: '4', name: '埋点规范性', status: 'fix' as const, description: '缺少关键埋点定义，需要补充' },
    { id: '5', name: '指标可衡量性', status: 'fix' as const, description: '部分指标缺少具体数值目标' },
  ];
  const [reviewItems, setReviewItems] = useState<Array<{ id: string; name: string; status: 'pass' | 'optimize' | 'fix'; description: string }>>([]);

  // 进入 Step 2 时触发审核扫描
  useEffect(() => {
    if (currentStep === 2) {
      setIsReviewScanning(true);
      setReviewItems([]);
      setReviewScore(0);
      const timer = setTimeout(() => {
        setIsReviewScanning(false);
        setReviewItems(mockReviewItems);
        setReviewScore(72);
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [currentStep]);

  return (
    <div className="h-full flex flex-col">
      {/* Step Indicator */}
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={(step) => step <= currentStep && setCurrentStep(step)}
      />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isEditMode && editPRD?.governanceStatus === 'frozen' && (
          <div className="max-w-4xl mx-auto mb-4 bg-bg-gray border border-border rounded-card p-3 text-sm text-text-secondary">
            当前 PRD 已冻结，继续修改需要提交变更单并生成新版本。
          </div>
        )}
        {/* Step 1: 新建需求 */}
        {currentStep === 1 && (
          <div className="grid grid-cols-5 gap-6 h-full">
            {/* Left: AI 助手面板 (1/5) */}
            <div className="bg-white rounded-card p-4 border border-border flex flex-col">
              {/* AI Assistant Header */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                  {AI_ASSISTANT.prd.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-text-primary">{AI_ASSISTANT.prd.name}</h3>
                  <p className="text-xs text-text-tertiary">{AI_ASSISTANT.prd.slogan}</p>
                </div>
              </div>

              {/* Encouragement Message */}
              <div className="mb-3 p-2 bg-bg-light rounded-card">
                <p className="text-xs text-text-secondary">{encouragement}</p>
              </div>

              {/* Quick Suggestions */}
              <div className="mb-3">
                <p className="text-xs text-text-tertiary mb-2">快捷建议</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    '优化背景描述',
                    '补充功能细节',
                    '添加验收标准',
                    '完善数据埋点',
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => handleQuickSuggestion(suggestion)}
                      className="px-2 py-1 text-xs bg-bg-light text-text-secondary rounded-card hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="overflow-auto mb-3 space-y-2 max-h-[550px]">
                {chatMessages.length === 0 ? (
                  <div className="flex-1" />
                ) : (
                  chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-card text-xs ${
                        msg.role === 'user'
                          ? 'bg-primary-light text-text-primary ml-2'
                          : 'bg-bg-light text-text-secondary mr-2'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <span className="text-primary font-medium">{AI_ASSISTANT.prd.name}：</span>
                      )}
                      {msg.content}
                    </div>
                  ))
                )}
                {isChatLoading && (
                  <div className="flex items-center gap-2 p-2 bg-bg-light rounded-card text-xs text-text-secondary mr-2">
                    <RefreshCw size={12} className="animate-spin" />
                    {AI_ASSISTANT.prd.name}正在分析...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-1">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChatMessage();
                    }
                  }}
                  placeholder={`向${AI_ASSISTANT.prd.name}提问...`}
                  aria-label="输入AI对话内容"
                  className="flex-1 min-w-0 px-2 py-1.5 text-xs border border-border rounded-card focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                  aria-label="发送消息"
                  className="flex-shrink-0 px-3 py-1.5 text-xs bg-primary text-white rounded-card hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Right: 需求创建区域 (4/5) */}
            <div className="col-span-4 bg-white rounded-card p-6 border border-border flex flex-col">
              {/* 核心信息区 - 需求名称 + 归属项目 */}
              <div className="mb-4 pb-3">
                <h3 className="text-sm font-semibold text-text-primary mb-3">基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      需求名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={requirementName}
                      onChange={(e) => {
                        setRequirementName(e.target.value);
                        setPrdTitle(e.target.value); // 同步标题
                      }}
                      placeholder="请输入需求名称，例：用户登录流程优化"
                      className="w-full px-4 py-2.5 border border-border rounded-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">归属项目</label>
                    <select
                      value={selectedProjectId || ''}
                      onChange={(e) => setSelectedProjectId(e.target.value || undefined)}
                      className="w-full px-4 py-2.5 border border-border rounded-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">无关联项目</option>
                      {projectList.map(project => (
                        <option key={project.id} value={project.id}>{project.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 需求描述 */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-text-primary">需求描述</label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-tertiary">
                      {requirement.length}/{MAX_CHARS}字
                    </span>
                    {prdContent && (
                      <span className="px-2 py-0.5 bg-primary-light text-primary text-xs rounded">已生成</span>
                    )}
                  </div>
                </div>
                <textarea
                  value={requirement}
                  onChange={(e) => {
                    const newValue = e.target.value.slice(0, MAX_CHARS);
                    setRequirement(newValue);
                    // 如果已生成，同步更新 prdContent
                    if (prdContent) {
                      setPrdContent(newValue);
                    }
                  }}
                  placeholder="请详细描述您的产品需求，包括背景、目标、功能点等...&#10;&#10;点击下方「生成需求文档」按钮，AI 将自动扩展为完整的 PRD 文档"
                  className="w-full h-[500px] p-4 border border-border rounded-card resize-y focus:outline-none focus:border-primary text-sm font-mono leading-relaxed"
                />
              </div>

              {/* 竞品/参考图上传 */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-text-primary mb-1.5">
                  竞品/参考图（可选）
                </label>
                <div className="flex flex-wrap gap-2">
                  {referenceImages.map((img, index) => (
                    <div key={index} className="relative w-14 h-14 rounded-card overflow-hidden border border-border group">
                      <img src={img} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setReferenceImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Trash2 size={14} className="text-white" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 border border-dashed border-border rounded-card flex flex-col items-center justify-center text-text-tertiary hover:border-primary hover:text-primary transition-colors"
                  >
                    <Upload size={16} />
                    <span className="text-xs mt-0.5">上传</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* 元数据字段 */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs text-text-secondary mb-1.5">优先级</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'P0' | 'P1' | 'P2' | 'P3')}
                    className="w-full px-3 py-1.5 border border-border rounded-card text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="P0">P0 - 紧急</option>
                    <option value="P1">P1 - 重要</option>
                    <option value="P2">P2 - 普通</option>
                    <option value="P3">P3 - 低优先级</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1.5">AI模型</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-1.5 border border-border rounded-card text-sm focus:outline-none focus:border-primary"
                  >
                    {modelOptions.map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 生成按钮 */}
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
                  >
                    清空
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        生成需求文档
                      </>
                    )}
                  </button>
                  {prdContent && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-primary border border-border rounded-card hover:border-primary"
                      title="复制内容"
                    >
                      <Copy size={16} />
                      复制
                    </button>
                  )}
                </div>
                {prdContent && (
                  <button
                    onClick={() => {
                      if (!prdContent.trim()) {
                        showToast('warning', '请先生成需求文档');
                        return;
                      }
                      setCurrentStep(2);
                    }}
                    className="flex items-center gap-2 px-6 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
                  >
                    下一步
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 需求审查 - 全屏独立页面风格 */}
        {currentStep === 2 && (() => {
          const passCount = reviewItems.filter(item => item.status === 'pass').length;
          const optimizeCount = reviewItems.filter(item => item.status === 'optimize').length;
          const fixCount = reviewItems.filter(item => item.status === 'fix').length;
          const circumference = 2 * Math.PI * 40;
          const strokeDashoffset = circumference - (reviewScore / 100) * circumference;
          const getScoreColor = (s: number) => s >= 80 ? '#22c55e' : s >= 60 ? '#eab308' : '#ef4444';

          return (
            <div className="h-full flex flex-col bg-bg-light">
              {/* 全屏页面头部 */}
              <div className="bg-white border-b border-border px-6 py-4">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-lg font-bold text-text-primary mb-1">需求智能审查</h1>
                  <p className="text-xs text-text-tertiary">{prdTitle}</p>
                </div>
              </div>

              {/* 内容区域 */}
              <div className="flex-1 overflow-auto py-4">
                <div className="max-w-4xl mx-auto px-6">
                  {/* Score Circle */}
                  <div className="bg-white rounded-card p-5 border border-border mb-4">
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative">
                        <svg width="100" height="100" className="transform -rotate-90">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                          <circle
                            cx="50" cy="50" r="40" fill="none"
                            stroke={isReviewScanning ? '#e5e7eb' : getScoreColor(reviewScore)}
                            strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={isReviewScanning ? circumference : strokeDashoffset}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          {isReviewScanning ? (
                            <Loader2 size={20} className="text-primary animate-spin" />
                          ) : (
                            <>
                              <span className="text-2xl font-bold" style={{ color: getScoreColor(reviewScore) }}>
                                {reviewScore}
                              </span>
                              <span className="text-xs text-text-tertiary mt-0.5">质量评分</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    {!isReviewScanning && (
                      <div className="flex justify-center gap-6 mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          <span className="text-xs text-text-secondary">通过 {passCount} 项</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          <span className="text-xs text-text-secondary">优化 {optimizeCount} 项</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <span className="text-xs text-text-secondary">修复 {fixCount} 项</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Review Items */}
                  <div className="bg-white rounded-card p-5 border border-border">
                    <h2 className="text-base font-semibold text-text-primary mb-3">审查详情</h2>
                    <div className="space-y-2">
                      {isReviewScanning ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-bg-light rounded-card">
                            <div className="flex items-center gap-3">
                              <Loader2 size={14} className="text-primary animate-spin" />
                              <span className="text-xs text-text-secondary">扫描中...</span>
                            </div>
                            <span className="text-xs px-2 py-0.5 bg-primary-light text-primary rounded">扫描中</span>
                          </div>
                        ))
                      ) : (
                        reviewItems.map(item => (
                          <div
                            key={item.id}
                            className="p-3 rounded-card border border-border bg-bg-light"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                {item.status === 'pass' && <Check size={14} className="text-green-500" />}
                                {item.status === 'optimize' && <AlertTriangle size={14} className="text-yellow-500" />}
                                {item.status === 'fix' && <AlertCircle size={14} className="text-red-500" />}
                                <span className="text-sm font-medium text-text-primary">{item.name}</span>
                              </div>
                              {item.status === 'pass' && <span className="text-xs px-2 py-0.5 bg-bg-gray text-text-secondary rounded">通过</span>}
                              {item.status === 'optimize' && <span className="text-xs px-2 py-0.5 bg-bg-gray text-text-secondary rounded">建议优化</span>}
                              {item.status === 'fix' && <span className="text-xs px-2 py-0.5 bg-bg-gray text-text-secondary rounded">必须修复</span>}
                            </div>
                            <p className="text-xs text-text-secondary pl-5">{item.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 底部固定操作栏 */}
              <div className="bg-white border-t border-border px-6 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2.5 text-sm text-text-secondary hover:text-text-primary border border-border rounded-card hover:border-primary transition-colors"
                  >
                    返回修改
                  </button>
                  {!isReviewScanning && (
                    <button
                      onClick={() => {
                        // 检查是否有必须修复的项
                        const hasFixItems = reviewItems.some(item => item.status === 'fix');
                        if (hasFixItems) {
                          showToast('warning', '请先修复所有「必须修复」项后再提交');
                          return;
                        }

                        const nextPayload = {
                          title: prdTitle,
                          description: requirement.slice(0, 100),
                          content: prdContent,
                          status: 'completed' as const,
                          projectId: selectedProjectId,
                          requirementName: requirementName || undefined,
                          priority: priority,
                          source: source || undefined,
                        };
                        if (isEditMode && editPRD) {
                          if (editPRD.governanceStatus === 'frozen') {
                            setPendingVersion(nextPayload);
                            setIsChangeRequestOpen(true);
                            return;
                          }
                          createPRDVersion(editPRD.id, nextPayload, { summary: '编辑更新' });
                          showToast('success', 'PRD 已更新');
                        } else {
                          addPRD(nextPayload);
                          const newCount = prdList.length + 1;
                          const milestone = checkMilestone('prd', newCount);
                          if (milestone) {
                            showToast('success', milestone.message);
                          } else {
                            showToast('success', 'PRD 已保存');
                          }
                          setShowCelebration(true);
                        }
                        setCurrentStep(3);
                        setEncouragement(getRandomEncouragement());
                      }}
                      className="flex items-center gap-2 px-8 py-2.5 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
                    >
                      通过并继续
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Step 3: 需求导出 */}
        {currentStep === 3 && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-card p-8 border border-border">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <h2 className="text-lg font-medium text-text-primary mb-2">太棒了！PRD文档已完成</h2>
                <p className="text-text-secondary mb-3">「{prdTitle}」已保存，请选择导出方式</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bg-light rounded-card">
                  <span className="text-xs text-text-secondary">
                    这是你的第 {prdList.length} 份PRD
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {/* 导出到本地 - 展开式 */}
                <div className="border border-border rounded-card overflow-hidden">
                  <div className="flex items-center gap-4 p-4 bg-white">
                    <div className="w-10 h-10 bg-primary/10 rounded-card flex items-center justify-center">
                      <FileDown size={20} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-text-primary text-sm mb-0.5">导出到本地</h3>
                      <p className="text-xs text-text-secondary">选择文件格式下载到本地</p>
                    </div>
                  </div>
                  <div className="border-t border-border bg-bg-light p-3 flex gap-3">
                    <button
                      onClick={handleExportMD}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border rounded-card hover:border-primary hover:text-primary transition-colors text-sm"
                    >
                      <FileDown size={16} />
                      Markdown (.md)
                    </button>
                    <button
                      onClick={handleExportWord}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border rounded-card hover:border-primary hover:text-primary transition-colors text-sm"
                    >
                      <FileText size={16} />
                      Word (.doc)
                    </button>
                  </div>
                </div>

                {/* 导出到TAPD */}
                <div
                  onClick={handleSyncTAPD}
                  className="flex items-center gap-4 p-4 border border-border rounded-card hover:border-primary cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-10 bg-orange-50 rounded-card flex items-center justify-center">
                    <Share2 size={20} className="text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary text-sm mb-0.5">导出到TAPD</h3>
                    <p className="text-xs text-text-secondary">同步到TAPD项目管理平台</p>
                  </div>
                  <ChevronRight size={18} className="text-text-tertiary group-hover:text-primary" />
                </div>

                {/* 导入到UI设计 */}
                <div
                  onClick={() => navigate('/ui/create', { state: { prdId: prdTitle, prdTitle: prdTitle, requirement: prdContent } })}
                  className="flex items-center gap-4 p-4 border border-border rounded-card hover:border-primary cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-card flex items-center justify-center">
                    <Palette size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary text-sm mb-0.5">导入到UI设计</h3>
                    <p className="text-xs text-text-secondary">基于此PRD文档，快速生成UI设计稿</p>
                  </div>
                  <ChevronRight size={18} className="text-text-tertiary group-hover:text-primary" />
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
                >
                  返回编辑
                </button>
                <button
                  onClick={() => navigate('/prd')}
                  className="px-6 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
                >
                  完成
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChangeRequestDialog
        isOpen={isChangeRequestOpen}
        entityLabel={prdTitle || editPRD?.title || 'PRD'}
        onCancel={() => {
          setIsChangeRequestOpen(false);
          setPendingVersion(null);
        }}
        onSubmit={(payload) => {
          if (!editPRD || !pendingVersion) return;
          createPRDVersion(editPRD.id, pendingVersion, {
            changeRequest: payload,
            summary: payload.reason || '变更单更新',
          });
          showToast('success', '变更单已提交，生成新版本');
          setIsChangeRequestOpen(false);
          setPendingVersion(null);
          setCurrentStep(3);
          setEncouragement(getRandomEncouragement());
        }}
      />

      {/* Clear Confirm Dialog */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onCancel={() => setIsClearConfirmOpen(false)}
        onConfirm={confirmClear}
        title="确认清空"
        message="确定要清空当前输入的内容吗？此操作不可恢复。"
        type="warning"
      />

      {/* Celebration Animation */}
      <Celebration show={showCelebration} onComplete={() => setShowCelebration(false)} />
    </div>
  );
};
