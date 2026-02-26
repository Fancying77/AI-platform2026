import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Upload,
  Trash2,
  RefreshCw,
  Copy,
  ChevronRight,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useApp, getPRDDraftKey } from '../store/AppContext';
import { useHeaderSlot } from '../store/HeaderSlotContext';
import ConfirmDialog from '../components/ConfirmDialog';
import Celebration from '../components/Celebration';
import { ChangeRequestDialog } from '../components/versioning/ChangeRequestDialog';
import AIInputBar from '../components/AIInputBar';
import MarkdownToolbar from '../components/MarkdownToolbar';
import { AI_ASSISTANT, getRandomEncouragement, checkMilestone } from '../constants/aiAssistant';
import type { PRDItem } from '../types';

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

const STEPS = [
  { id: 1, label: '编辑', icon: FileText },
  { id: 2, label: 'AI检测', icon: CheckCircle2 },
  { id: 3, label: '导出', icon: Copy },
] as const;

export const PRDCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, addPRD, prdList, projectList, createPRDVersion } = useApp();
  const { setHeaderSlot, clearHeaderSlot } = useHeaderSlot();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const draftSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [, setEncouragement] = useState(getRandomEncouragement());
  const [isChangeRequestOpen, setIsChangeRequestOpen] = useState(false);
  const [pendingVersion, setPendingVersion] = useState<Pick<PRDItem, 'title' | 'description' | 'content' | 'status' | 'projectId'> & { requirementName?: string; priority?: PRDItem['priority']; source?: string } | null>(null);

  const [isChatLoading, setIsChatLoading] = useState(false);
  const [aiReply, setAiReply] = useState<{ content: string } | null>(null);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isReviewScanning, setIsReviewScanning] = useState(true);
  const [reviewScore, setReviewScore] = useState(0);
  const [reviewItems, setReviewItems] = useState<Array<{ id: string; name: string; status: 'pass' | 'optimize' | 'fix'; description: string }>>([]);

  // 将控件注入全局 Header
  useEffect(() => {
    setHeaderSlot({
      left: (
        <>
          <button onClick={() => navigate('/prd')} className="p-1 text-text-secondary hover:text-text-primary hover:bg-bg-light rounded transition-colors">
            <ArrowLeft size={16} />
          </button>
          <input type="text" value={requirementName} onChange={(e) => { setRequirementName(e.target.value); setPrdTitle(e.target.value); }} placeholder="需求名称" className="w-36 px-2 py-1 text-xs border border-border rounded-md focus:outline-none focus:border-primary" />
          <select value={selectedProjectId || ''} onChange={(e) => setSelectedProjectId(e.target.value || undefined)} className="px-2 py-1 text-xs border border-border rounded-md focus:outline-none focus:border-primary">
            <option value="">无关联项目</option>
            {projectList.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </>
      ),
      right: (
        <div className={`flex items-center gap-0.5 ${isReviewOpen || isExportOpen ? 'pointer-events-none opacity-50' : ''}`}>
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${step.id === currentStep ? 'bg-primary/10 text-primary' : step.id < currentStep ? 'text-green-600' : 'text-text-tertiary'}`}>
                {step.id < currentStep ? <CheckCircle2 size={11} className="text-green-500" /> : step.id === currentStep ? <step.icon size={11} /> : <Circle size={11} />}
                {step.label}
              </div>
              {i < STEPS.length - 1 && <ChevronRight size={10} className="text-text-tertiary mx-0.5" />}
            </div>
          ))}
        </div>
      ),
    });
  }, [requirementName, selectedProjectId, currentStep, isReviewOpen, isExportOpen, projectList, navigate, setHeaderSlot, setPrdTitle]);

  useEffect(() => () => clearHeaderSlot(), [clearHeaderSlot]);

  useEffect(() => {
    if (editPRD) {
      setPrdTitle(editPRD.title);
      setRequirement(editPRD.content || editPRD.description);
      setPrdContent(editPRD.content);
      setRequirementName(editPRD.requirementName || '');
      setPriority(editPRD.priority || 'P1');
    }
  }, [editPRD]);

  useEffect(() => {
    if (isReviewOpen) {
      setIsReviewScanning(true);
      setReviewItems([]);
      setReviewScore(0);
      const timer = setTimeout(() => {
        setIsReviewScanning(false);
        setReviewItems([
          { id: '1', name: '需求完整性', status: 'pass', description: '需求描述完整，包含背景、目标、功能点' },
          { id: '2', name: '背景目标阐述', status: 'pass', description: '背景清晰，目标明确可衡量' },
          { id: '3', name: '用户流程清晰度', status: 'optimize', description: '建议补充异常流程处理说明' },
          { id: '4', name: '埋点规范性', status: 'fix', description: '缺少关键埋点定义，需要补充' },
          { id: '5', name: '指标可衡量性', status: 'fix', description: '部分指标缺少具体数值目标' },
        ]);
        setReviewScore(72);
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isReviewOpen]);

  // 草稿恢复（仅新建模式）
  useEffect(() => {
    if (isEditMode) return;
    const saved = localStorage.getItem(getPRDDraftKey());
    if (!saved) return;
    try {
      const d = JSON.parse(saved);
      if (d.requirementName) setRequirementName(d.requirementName);
      if (d.requirement) { setRequirement(d.requirement); setPrdContent(d.requirement); }
      if (d.selectedProjectId) setSelectedProjectId(d.selectedProjectId);
      if (d.priority) setPriority(d.priority);
      if (d.selectedModel) setSelectedModel(d.selectedModel);
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 草稿自动保存（节流 1s，仅新建模式）
  useEffect(() => {
    if (isEditMode) return;
    if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current);
    draftSaveTimerRef.current = setTimeout(() => {
      localStorage.setItem(getPRDDraftKey(), JSON.stringify({ requirementName, requirement, selectedProjectId, priority, selectedModel, updatedAt: new Date().toISOString() }));
    }, 1000);
    return () => { if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current); };
  }, [requirementName, requirement, selectedProjectId, priority, selectedModel, isEditMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) setReferenceImages(prev => [...prev, ev.target!.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSendAIMessage = async (message: string) => {
    setIsChatLoading(true);
    if (!prdContent) {
      // 首次发送：生成 PRD
      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const generatedPRD = `# ${requirementName || '需求文档'}\n\n## 1. 背景与目标\n${message}\n\n### 1.1 业务背景\n当前流程存在以下问题：\n- 操作步骤繁琐，用户流失率高\n- 不支持多种方式\n- 缺少状态记忆功能\n\n### 1.2 项目目标\n- 简化流程，减少用户操作步骤\n- 提升成功率至95%以上\n- 支持多种方式\n\n## 2. 目标用户\n- 新注册用户\n- 活跃用户\n- 流失用户\n\n## 3. 功能需求\n\n### 3.1 核心功能\n- 功能点 A\n- 功能点 B\n- 功能点 C\n\n## 4. 非功能需求\n- 接口响应时间 < 500ms\n- 支持高并发场景\n- 兼容主流浏览器\n\n## 5. 验收标准\n- [ ] 流程步骤不超过3步\n- [ ] 支持所有主流浏览器\n- [ ] 成功率 ≥ 95%\n`;
      setRequirement(generatedPRD);
      setPrdContent(generatedPRD);
      if (!prdTitle) setPrdTitle(requirementName || message.slice(0, 20));
      setIsGenerating(false);
      setAiReply({ content: '需求文档已生成！您可以继续描述需要调整的地方，或直接点击「下一步」进行 AI 检测。' });
      showToast('success', '需求文档已生成');
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAiReply({ content: `已理解您的需求："${message}"。\n\n建议的调整内容：\n- 在「功能需求」章节补充该场景的详细描述\n- 增加对应的验收标准\n- 补充相关埋点定义` });
    }
    setIsChatLoading(false);
  };

  const handleInsertAIReply = () => {
    if (!aiReply) return;
    const el = textareaRef.current;
    let newContent: string;
    if (el && el.selectionStart !== el.selectionEnd) {
      // 策略1：选区替换
      newContent = requirement.slice(0, el.selectionStart) + aiReply.content + requirement.slice(el.selectionEnd);
    } else if (el && el.selectionStart > 0 && el.selectionStart < requirement.length) {
      // 策略2：段落替换（光标所在段落）
      const cursor = el.selectionStart;
      const paraStart = (() => { const i = requirement.lastIndexOf('\n\n', cursor - 1); return i === -1 ? 0 : i + 2; })();
      const paraEnd = (() => { const i = requirement.indexOf('\n\n', cursor); return i === -1 ? requirement.length : i; })();
      newContent = requirement.slice(0, paraStart) + aiReply.content + requirement.slice(paraEnd);
    } else {
      // 策略3：追加末尾
      newContent = requirement + '\n\n' + aiReply.content;
    }
    setRequirement(newContent); setPrdContent(newContent);
    setAiReply(null);
    showToast('success', '已插入到编辑器');
  };

  const handleCopyReply = () => { if (aiReply) { navigator.clipboard.writeText(aiReply.content); showToast('success', '已复制到剪贴板'); } };
  const handleCopy = () => { navigator.clipboard.writeText(requirement); showToast('success', '已复制到剪贴板'); };

  const handleExportMD = () => {
    const blob = new Blob([requirement], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${prdTitle || '需求文档'}.md`; a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Markdown文档已导出');
  };

  const handleExportWord = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${prdTitle || '需求文档'}</title><style>body{font-family:'Microsoft YaHei',Arial,sans-serif;line-height:1.6;padding:40px;}h1{color:#333;border-bottom:2px solid #4D83FF;padding-bottom:10px;}h2{color:#444;margin-top:24px;}h3{color:#555;}</style></head><body>${requirement.replace(/^# (.*$)/gm, '<h1>$1</h1>').replace(/^## (.*$)/gm, '<h2>$1</h2>').replace(/^### (.*$)/gm, '<h3>$1</h3>').replace(/^- (.*$)/gm, '<li>$1</li>').replace(/\n\n/g, '</p><p>')}</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${prdTitle || '需求文档'}.doc`; a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Word文档已导出');
  };

  const handleNextStep = () => {
    if (!requirement.trim()) { showToast('warning', '请先输入需求内容'); return; }
    setCurrentStep(2); setIsReviewOpen(true);
  };

  const handleReviewPass = () => {
    if (fixCount > 0) showToast('warning', `有 ${fixCount} 项建议修复，已忽略继续提交`);
    const payload = { title: prdTitle || requirementName || '未命名需求', description: requirement.slice(0, 100), content: prdContent || requirement, status: 'completed' as const, projectId: selectedProjectId, requirementName: requirementName || undefined, priority, source: undefined };
    if (isEditMode && editPRD) {
      if (editPRD.governanceStatus === 'frozen') { setPendingVersion(payload); setIsChangeRequestOpen(true); setIsReviewOpen(false); return; }
      createPRDVersion(editPRD.id, payload, { summary: '编辑更新' }); showToast('success', 'PRD 已更新');
    } else {
      addPRD(payload);
      localStorage.removeItem(getPRDDraftKey());
      const milestone = checkMilestone('prd', prdList.length + 1);
      showToast('success', milestone ? milestone.message : 'PRD 已保存');
      setShowCelebration(true);
    }
    setIsReviewOpen(false); setCurrentStep(3); setIsExportOpen(true); setEncouragement(getRandomEncouragement());
  };

  const confirmClear = () => { setRequirement(''); setPrdContent(''); setReferenceImages([]); setIsClearConfirmOpen(false); showToast('success', '已清空内容'); };

  const passCount = reviewItems.filter(i => i.status === 'pass').length;
  const optimizeCount = reviewItems.filter(i => i.status === 'optimize').length;
  const fixCount = reviewItems.filter(i => i.status === 'fix').length;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (reviewScore / 100) * circumference;
  const getScoreColor = (s: number) => s >= 80 ? '#22c55e' : s >= 60 ? '#eab308' : '#ef4444';

  return (
    <div className="h-full flex flex-col bg-bg-light">
      {isEditMode && editPRD?.governanceStatus === 'frozen' && (
        <div className="mx-4 mt-2 bg-bg-gray border border-border rounded-card p-2.5 text-xs text-text-secondary shrink-0">当前 PRD 已冻结，继续修改需要提交变更单并生成新版本。</div>
      )}

      <div className="shrink-0">
        <MarkdownToolbar textareaRef={textareaRef} onContentChange={(val) => { setRequirement(val); if (prdContent) setPrdContent(val); }} content={requirement} />
      </div>

      {/* 主编辑区 — 占满剩余空间 */}
      <div className="flex-1 overflow-hidden relative min-h-0">
        <textarea ref={textareaRef} value={requirement} onChange={(e) => { const v = e.target.value.slice(0, MAX_CHARS); setRequirement(v); if (prdContent) setPrdContent(v); }} placeholder={isGenerating ? 'AI 正在生成需求文档...' : '在下方输入框描述你的需求，AI 将自动生成完整的 PRD 文档\n\n也可以直接在这里手动编写内容'} className="w-full h-full px-8 py-4 resize-none focus:outline-none text-[15px] font-mono leading-[1.9] bg-white" />
        <div className="absolute bottom-2 right-4 flex items-center gap-2">
          {prdContent && <span className="px-2 py-0.5 bg-primary-light text-primary text-xs rounded">已生成</span>}
          <span className="text-xs text-text-tertiary bg-white/80 px-1.5 py-0.5 rounded">{requirement.length}/{MAX_CHARS}</span>
        </div>
      </div>

      {/* 底部 AI 输入栏 */}
      <div className="shrink-0">
        <AIInputBar onSend={handleSendAIMessage} isLoading={isChatLoading} assistantName={AI_ASSISTANT.prd.name}
          aiReply={aiReply ? { content: aiReply.content, onInsert: handleInsertAIReply, onCopy: handleCopyReply } : null}
          onDismissReply={() => setAiReply(null)} placeholder={prdContent ? `向 ${AI_ASSISTANT.prd.name} 提问，优化你的需求文档...` : `描述你的需求，${AI_ASSISTANT.prd.name} 将自动生成 PRD...`}
          leftActions={<>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 px-2 py-1 text-[11px] text-text-secondary border border-border rounded-md hover:border-primary hover:text-primary transition-colors"><Upload size={12} />参考图</button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
            {referenceImages.length > 0 && <div className="flex gap-1">{referenceImages.map((img, i) => (
              <div key={i} className="relative w-7 h-7 rounded overflow-hidden border border-border group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setReferenceImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center"><Trash2 size={9} className="text-white" /></button>
              </div>
            ))}</div>}
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="px-1.5 py-1 text-[11px] border border-border rounded-md focus:outline-none focus:border-primary">
              {modelOptions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </>}
          rightActions={<>
            <button onClick={handleNextStep} className="flex items-center gap-1 px-3 py-1 text-[11px] bg-primary text-white rounded-md hover:bg-primary-hover transition-colors shadow-sm">下一步<ChevronRight size={12} /></button>
          </>}
        />
      </div>

      {/* 审查弹窗 */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text-primary">需求 AI 检测</h2>
              <p className="text-xs text-text-tertiary mt-0.5">{prdTitle}</p>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="flex items-center justify-center mb-5">
                <div className="relative">
                  <svg width="90" height="90" className="transform -rotate-90">
                    <circle cx="45" cy="45" r="40" fill="none" stroke="#e5e7eb" strokeWidth="7" />
                    <circle cx="45" cy="45" r="40" fill="none" stroke={isReviewScanning ? '#e5e7eb' : getScoreColor(reviewScore)} strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={isReviewScanning ? circumference : strokeDashoffset} className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {isReviewScanning ? <RefreshCw size={18} className="text-primary animate-spin" /> : <>
                      <span className="text-xl font-bold" style={{ color: getScoreColor(reviewScore) }}>{reviewScore}</span>
                      <span className="text-[10px] text-text-tertiary">质量评分</span>
                    </>}
                  </div>
                </div>
              </div>
              {!isReviewScanning && (
                <div className="flex justify-center gap-5 mb-4">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs text-text-secondary">通过 {passCount}</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500" /><span className="text-xs text-text-secondary">优化 {optimizeCount}</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-xs text-text-secondary">修复 {fixCount}</span></div>
                </div>
              )}
              <div className="space-y-2">
                {isReviewScanning ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-bg-light rounded-card"><div className="flex items-center gap-2"><RefreshCw size={12} className="text-primary animate-spin" /><span className="text-xs text-text-secondary">扫描中...</span></div></div>
                )) : reviewItems.map(item => (
                  <div key={item.id} className="p-3 rounded-card border border-border bg-bg-light">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${item.status === 'pass' ? 'bg-green-500' : item.status === 'optimize' ? 'bg-yellow-500' : 'bg-red-500'}`} /><span className="text-sm font-medium text-text-primary">{item.name}</span></div>
                      <span className={`text-xs px-2 py-0.5 rounded ${item.status === 'pass' ? 'bg-green-50 text-green-600' : item.status === 'optimize' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>{item.status === 'pass' ? '通过' : item.status === 'optimize' ? '建议优化' : '必须修复'}</span>
                    </div>
                    <p className="text-xs text-text-secondary pl-4">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-between">
              <button onClick={() => { setIsReviewOpen(false); setCurrentStep(1); }} className="px-5 py-2 text-sm text-text-secondary hover:text-text-primary border border-border rounded-card">返回修改</button>
              {!isReviewScanning && <button onClick={handleReviewPass} className="flex items-center gap-1 px-6 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover">通过并继续<ChevronRight size={14} /></button>}
            </div>
          </div>
        </div>
      )}

      {/* 导出弹窗 */}
      {isExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-border text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-2xl">🎉</span></div>
              <h2 className="text-base font-semibold text-text-primary">PRD文档已完成</h2>
              <p className="text-xs text-text-tertiary mt-1">「{prdTitle}」已保存，请选择导出方式</p>
            </div>
            <div className="p-6 space-y-3">
              <button onClick={handleExportMD} className="w-full flex items-center gap-3 p-3 border border-border rounded-card hover:border-primary transition-colors text-left">
                <div className="w-9 h-9 bg-primary/10 rounded-card flex items-center justify-center"><Copy size={16} className="text-primary" /></div>
                <div><p className="text-sm font-medium text-text-primary">Markdown (.md)</p><p className="text-xs text-text-secondary">导出为 Markdown 文件</p></div>
              </button>
              <button onClick={handleExportWord} className="w-full flex items-center gap-3 p-3 border border-border rounded-card hover:border-primary transition-colors text-left">
                <div className="w-9 h-9 bg-primary/10 rounded-card flex items-center justify-center"><Copy size={16} className="text-primary" /></div>
                <div><p className="text-sm font-medium text-text-primary">Word (.doc)</p><p className="text-xs text-text-secondary">导出为 Word 文件</p></div>
              </button>
              <button onClick={handleCopy} className="w-full flex items-center gap-3 p-3 border border-border rounded-card hover:border-primary transition-colors text-left">
                <div className="w-9 h-9 bg-primary/10 rounded-card flex items-center justify-center"><Copy size={16} className="text-primary" /></div>
                <div><p className="text-sm font-medium text-text-primary">复制内容</p><p className="text-xs text-text-secondary">复制到剪贴板</p></div>
              </button>
              <button onClick={() => navigate('/ui/create', { state: { prdId: prdTitle, prdTitle, requirement: prdContent } })} className="w-full flex items-center gap-3 p-3 border border-border rounded-card hover:border-primary transition-colors text-left">
                <div className="w-9 h-9 bg-primary/10 rounded-card flex items-center justify-center"><Sparkles size={16} className="text-primary" /></div>
                <div><p className="text-sm font-medium text-text-primary">导入到UI设计</p><p className="text-xs text-text-secondary">基于此PRD生成UI设计稿</p></div>
              </button>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-between">
              <button onClick={() => { setIsExportOpen(false); setCurrentStep(1); }} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary">返回编辑</button>
              <button onClick={() => navigate('/prd')} className="px-6 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover">完成</button>
            </div>
          </div>
        </div>
      )}

      <ChangeRequestDialog isOpen={isChangeRequestOpen} entityLabel={prdTitle || editPRD?.title || 'PRD'}
        onCancel={() => { setIsChangeRequestOpen(false); setPendingVersion(null); }}
        onSubmit={(payload) => {
          if (!editPRD || !pendingVersion) return;
          createPRDVersion(editPRD.id, pendingVersion, { changeRequest: payload, summary: payload.reason || '变更单更新' });
          showToast('success', '变更单已提交，生成新版本');
          setIsChangeRequestOpen(false); setPendingVersion(null); setCurrentStep(3); setIsExportOpen(true); setEncouragement(getRandomEncouragement());
        }}
      />
      <ConfirmDialog isOpen={isClearConfirmOpen} onCancel={() => setIsClearConfirmOpen(false)} onConfirm={confirmClear} title="确认清空" message="确定要清空当前输入的内容吗？此操作不可恢复。" type="warning" />
      <Celebration show={showCelebration} onComplete={() => setShowCelebration(false)} />
    </div>
  );
};
