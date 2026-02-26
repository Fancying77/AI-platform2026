import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Upload,
  Trash2,
  ChevronRight,
  Copy,
  Download,
  Save,
  ArrowLeft,
  Palette,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useHeaderSlot } from '../store/HeaderSlotContext';
import Celebration from '../components/Celebration';
import { ChangeRequestDialog } from '../components/versioning/ChangeRequestDialog';
import AIInputBar from '../components/AIInputBar';
import HTMLPreview from '../components/HTMLPreview';
import { AI_ASSISTANT, getRandomEncouragement, checkMilestone } from '../constants/aiAssistant';
import type { UIDesignItem } from '../types';

const STEPS = [
  { id: 1, label: '设计', icon: Palette },
  { id: 2, label: '导出', icon: Download },
] as const;

interface UICreateLocationState {
  prdId?: string;
  prdTitle?: string;
  projectId?: string;
  requirement?: string;
  editUIDesign?: UIDesignItem;
  editDesign?: UIDesignItem;
}

const mockLoginHTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f7fa;display:flex;justify-content:center;align-items:center;min-height:100vh}
.card{background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);width:360px;overflow:hidden}
.header{background:linear-gradient(135deg,#4D83FF,#6C5CE7);height:120px;position:relative;display:flex;align-items:center;justify-content:center}
.header h1{color:#fff;font-size:20px;font-weight:600}
.avatar{width:64px;height:64px;background:#fff;border-radius:50%;position:absolute;bottom:-32px;left:50%;transform:translateX(-50%);box-shadow:0 2px 12px rgba(0,0,0,0.1);display:flex;align-items:center;justify-content:center;font-size:28px}
.form{padding:48px 32px 32px}
.input-group{margin-bottom:16px}
.input-group input{width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;outline:none;transition:border-color .2s}
.input-group input:focus{border-color:#4D83FF}
.input-group label{display:block;font-size:12px;color:#6b7280;margin-bottom:6px;font-weight:500}
.btn{width:100%;padding:12px;background:#4D83FF;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s}
.btn:hover{background:#3b6de6}
.divider{display:flex;align-items:center;gap:12px;margin:24px 0;color:#9ca3af;font-size:12px}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:#e5e7eb}
.social{display:flex;justify-content:center;gap:16px}
.social span{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;transition:transform .2s}
.social span:hover{transform:scale(1.1)}
.wechat{background:#dcfce7;color:#22c55e}
.qq{background:#dbeafe;color:#3b82f6}
.footer{text-align:center;padding:16px;font-size:11px;color:#9ca3af}
</style></head><body>
<div class="card">
<div class="header"><h1>欢迎登录</h1><div class="avatar">👤</div></div>
<div class="form">
<div class="input-group"><label>手机号</label><input type="tel" placeholder="请输入手机号"></div>
<div class="input-group"><label>验证码</label><input type="text" placeholder="请输入验证码"></div>
<button class="btn">登 录</button>
<div class="divider">其他登录方式</div>
<div class="social"><span class="wechat">💬</span><span class="qq">🔵</span></div>
</div>
<div class="footer">登录即表示同意《用户协议》和《隐私政策》</div>
</div>
</body></html>`;

export const UICreate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast, addUIDesign, prdList, uiDesignList, projectList, createUIDesignVersion } = useApp();
  const { setHeaderSlot, clearHeaderSlot } = useHeaderSlot();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const locationState = location.state as UICreateLocationState | null;
  const linkedPRD = locationState;
  const editUIDesign = linkedPRD?.editUIDesign || linkedPRD?.editDesign;
  const isEditMode = !!editUIDesign;
  const initialProjectId = linkedPRD?.projectId || editUIDesign?.projectId;

  const [currentStep, setCurrentStep] = useState(1);
  const [htmlCode, setHtmlCode] = useState('');
  const [requirement, setRequirement] = useState('');
  const [selectedPRD, setSelectedPRD] = useState(linkedPRD?.prdId || '');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(initialProjectId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isChangeRequestOpen, setIsChangeRequestOpen] = useState(false);
  const [pendingVersion, setPendingVersion] = useState<Pick<UIDesignItem, 'title' | 'description' | 'status' | 'tool' | 'prdId' | 'prdTitle' | 'projectId' | 'thumbnail'> & { componentTree?: string } | null>(null);

  const [isChatLoading, setIsChatLoading] = useState(false);
  const [aiReply, setAiReply] = useState<{ content: string } | null>(null);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // 将控件注入全局 Header
  useEffect(() => {
    setHeaderSlot({
      left: (
        <>
          <button onClick={() => navigate('/ui')} className="p-1 text-text-secondary hover:text-text-primary hover:bg-bg-light rounded transition-colors">
            <ArrowLeft size={16} />
          </button>
          <select value={selectedPRD} onChange={(e) => setSelectedPRD(e.target.value)} className="px-2 py-1 text-xs border border-border rounded-md focus:outline-none focus:border-primary">
            <option value="">不关联PRD</option>
            {prdList.map(prd => <option key={prd.id} value={prd.id}>{prd.title}</option>)}
          </select>
          <select value={selectedProjectId || ''} onChange={(e) => setSelectedProjectId(e.target.value || undefined)} className="px-2 py-1 text-xs border border-border rounded-md focus:outline-none focus:border-primary">
            <option value="">不关联项目</option>
            {projectList.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </>
      ),
      right: (
        <div className="flex items-center gap-0.5">
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
  }, [selectedPRD, selectedProjectId, currentStep, prdList, projectList, navigate, setHeaderSlot]);

  useEffect(() => () => clearHeaderSlot(), [clearHeaderSlot]);

  useEffect(() => {
    if (editUIDesign) {
      setRequirement(editUIDesign.description);
      setSelectedPRD(editUIDesign.prdId || '');
      setHtmlCode(mockLoginHTML);
    }
  }, [editUIDesign]);

  useEffect(() => {
    if (linkedPRD?.requirement && !isEditMode) setRequirement(linkedPRD.requirement);
  }, [linkedPRD, isEditMode]);

  const handleSendMessage = async (message: string) => {
    setIsChatLoading(true);
    if (!htmlCode) {
      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHtmlCode(mockLoginHTML);
      setRequirement(message);
      setIsGenerating(false);
      setAiReply({ content: `设计方案已生成。您可以继续描述需要调整的地方，例如：\n- "把主按钮颜色改成绿色"\n- "增加一个返回按钮"\n- "调整标题字号大一些"` });
      showToast('success', 'UI设计已生成');
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAiReply({ content: `好的，已根据您的要求"${message}"进行了调整。请查看预览效果。` });
    }
    setIsChatLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => { if (ev.target?.result) setReferenceImages(prev => [...prev, ev.target!.result as string]); };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleNextStep = () => {
    if (!htmlCode) { showToast('warning', '请先生成设计方案'); return; }
    const prd = prdList.find(p => p.id === selectedPRD);
    const designPayload = { title: `${requirement.slice(0, 20)}...设计`, description: requirement, prdId: selectedPRD || undefined, prdTitle: prd?.title, projectId: selectedProjectId, status: 'completed' as const, tool: 'HTML' };
    if (isEditMode && editUIDesign) {
      if (editUIDesign.governanceStatus === 'frozen') { setPendingVersion(designPayload); setIsChangeRequestOpen(true); return; }
      createUIDesignVersion(editUIDesign.id, designPayload, { summary: '编辑更新' }); showToast('success', 'UI设计已更新');
    } else {
      addUIDesign(designPayload);
      const milestone = checkMilestone('ui', uiDesignList.length + 1);
      showToast('success', milestone ? milestone.message : 'UI设计已保存');
      setShowCelebration(true);
    }
    setCurrentStep(2); setIsExportOpen(true);
  };

  const handleExportHTML = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${requirement.slice(0, 20) || '设计稿'}.html`; a.click();
    URL.revokeObjectURL(url); showToast('success', 'HTML文件已导出');
  };

  const handleCopyHTML = () => { navigator.clipboard.writeText(htmlCode); showToast('success', 'HTML代码已复制'); };

  return (
    <div className="h-full flex flex-col bg-bg-light">
      {isEditMode && editUIDesign?.governanceStatus === 'frozen' && (
        <div className="mx-3 mt-2 bg-bg-gray border border-border rounded-card p-2.5 text-xs text-text-secondary shrink-0">当前 UI 设计已冻结，继续修改需要提交变更单并生成新版本。</div>
      )}

      {/* HTML 预览区 — 占满剩余空间 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <HTMLPreview htmlCode={htmlCode} emptyMessage={isGenerating ? '正在生成设计方案...' : '在下方输入设计需求，AI 将生成界面预览'} />
      </div>

      {/* 底部 AI 输入栏 */}
      <div className="shrink-0">
        <AIInputBar onSend={handleSendMessage} isLoading={isChatLoading} assistantName={AI_ASSISTANT.ui.name}
          aiReply={aiReply ? { content: aiReply.content, onCopy: () => { navigator.clipboard.writeText(aiReply.content); showToast('success', '已复制'); } } : null}
          onDismissReply={() => setAiReply(null)} placeholder="描述你想要的界面设计..."
          leftActions={<>
            <label className="flex items-center gap-1 px-2 py-1 text-[11px] text-text-secondary border border-border rounded-md hover:border-primary hover:text-primary transition-colors cursor-pointer">
              <Upload size={12} />参考图
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
            </label>
            {referenceImages.length > 0 && <div className="flex gap-1">{referenceImages.map((img, i) => (
              <div key={i} className="relative w-7 h-7 rounded overflow-hidden border border-border group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setReferenceImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center"><Trash2 size={9} className="text-white" /></button>
              </div>
            ))}</div>}
          </>}
          rightActions={<>
            <button onClick={() => showToast('success', '草稿已保存')} className="flex items-center gap-1 px-2 py-1 text-[11px] text-text-secondary border border-border rounded-md hover:border-primary hover:text-primary transition-colors"><Save size={12} />草稿</button>
            <button onClick={handleNextStep} className="flex items-center gap-1 px-3 py-1 text-[11px] bg-primary text-white rounded-md hover:bg-primary-hover transition-colors shadow-sm">下一步<ChevronRight size={12} /></button>
          </>}
        />
      </div>

      {/* 导出弹窗 */}
      {isExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-border text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-2xl">🎉</span></div>
              <h2 className="text-base font-semibold text-text-primary">UI设计已完成</h2>
              <p className="text-xs text-text-tertiary mt-1">设计稿已保存，请选择导出方式</p>
            </div>
            <div className="p-6 space-y-3">
              <button onClick={handleExportHTML} className="w-full flex items-center gap-3 p-3 border border-border rounded-card hover:border-primary transition-colors text-left">
                <div className="w-9 h-9 bg-primary/10 rounded-card flex items-center justify-center"><Download size={16} className="text-primary" /></div>
                <div><p className="text-sm font-medium text-text-primary">HTML 文件</p><p className="text-xs text-text-secondary">下载为 .html 文件，可直接在浏览器打开</p></div>
              </button>
              <button onClick={handleCopyHTML} className="w-full flex items-center gap-3 p-3 border border-border rounded-card hover:border-primary transition-colors text-left">
                <div className="w-9 h-9 bg-primary/10 rounded-card flex items-center justify-center"><Copy size={16} className="text-primary" /></div>
                <div><p className="text-sm font-medium text-text-primary">复制 HTML 代码</p><p className="text-xs text-text-secondary">复制完整 HTML+CSS 代码到剪贴板</p></div>
              </button>
              <div className="flex items-center gap-3 p-3 border border-border rounded-card opacity-50 cursor-not-allowed">
                <div className="w-9 h-9 bg-bg-light rounded-card flex items-center justify-center"><Download size={16} className="text-text-tertiary" /></div>
                <div><p className="text-sm font-medium text-text-secondary">PNG 图片</p><p className="text-xs text-text-tertiary">导出为高清图片（二期开放）</p></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-between">
              <button onClick={() => { setIsExportOpen(false); setCurrentStep(1); }} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary">返回编辑</button>
              <button onClick={() => navigate('/ui')} className="px-6 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover">完成</button>
            </div>
          </div>
        </div>
      )}

      <ChangeRequestDialog isOpen={isChangeRequestOpen} entityLabel={editUIDesign?.title || 'UI设计'}
        onCancel={() => { setIsChangeRequestOpen(false); setPendingVersion(null); }}
        onSubmit={(payload) => {
          if (!editUIDesign || !pendingVersion) return;
          createUIDesignVersion(editUIDesign.id, pendingVersion, { changeRequest: payload, summary: payload.reason || '变更单更新' });
          showToast('success', '变更单已提交，生成新版本');
          setIsChangeRequestOpen(false); setPendingVersion(null); setCurrentStep(2); setIsExportOpen(true);
        }}
      />
      <Celebration show={showCelebration} onComplete={() => setShowCelebration(false)} />
    </div>
  );
};
