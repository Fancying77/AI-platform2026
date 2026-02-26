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
import { useApp, getUIDraftKey } from '../store/AppContext';
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

const mockDashboardHTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f7fa;display:flex;min-height:100vh}
.sidebar{width:200px;background:#1e293b;color:#fff;padding:20px 0;flex-shrink:0}
.sidebar .logo{padding:0 20px 20px;font-size:15px;font-weight:700;color:#4D83FF;border-bottom:1px solid #334155}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 20px;font-size:13px;color:#94a3b8;cursor:pointer}
.nav-item.active,.nav-item:hover{background:#334155;color:#fff}
.main{flex:1;padding:24px;overflow:auto}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
.stat-card{background:#fff;border-radius:12px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
.stat-card .label{font-size:12px;color:#64748b;margin-bottom:8px}
.stat-card .value{font-size:22px;font-weight:700;color:#1e293b}
.stat-card .change{font-size:11px;color:#22c55e;margin-top:4px}
.chart-area{background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
.chart-area h3{font-size:14px;font-weight:600;color:#1e293b;margin-bottom:16px}
.bar-chart{display:flex;align-items:flex-end;gap:8px;height:100px}
.bar{flex:1;background:linear-gradient(to top,#4D83FF,#6C5CE7);border-radius:4px 4px 0 0}
.bar-labels{display:flex;gap:8px;margin-top:8px}
.bar-labels span{flex:1;text-align:center;font-size:10px;color:#94a3b8}
</style></head><body>
<div class="sidebar">
<div class="logo">📊 数据中心</div>
<div class="nav-item active">🏠 首页</div>
<div class="nav-item">📈 数据分析</div>
<div class="nav-item">👥 用户管理</div>
<div class="nav-item">📋 报表中心</div>
<div class="nav-item">⚙️ 系统设置</div>
</div>
<div class="main">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"><h1 style="font-size:18px;font-weight:600;color:#1e293b">数据概览</h1><span style="font-size:12px;color:#64748b">2026-02-26</span></div>
<div class="stats">
<div class="stat-card"><div class="label">今日访问</div><div class="value">12,847</div><div class="change">↑ 12.5%</div></div>
<div class="stat-card"><div class="label">新增用户</div><div class="value">1,234</div><div class="change">↑ 8.3%</div></div>
<div class="stat-card"><div class="label">转化率</div><div class="value">3.8%</div><div class="change">↑ 0.5%</div></div>
<div class="stat-card"><div class="label">营收</div><div class="value">¥89,420</div><div class="change">↑ 15.2%</div></div>
</div>
<div class="chart-area">
<h3>近7日访问趋势</h3>
<div class="bar-chart">
<div class="bar" style="height:60%"></div><div class="bar" style="height:75%"></div><div class="bar" style="height:55%"></div>
<div class="bar" style="height:90%"></div><div class="bar" style="height:70%"></div><div class="bar" style="height:85%"></div>
<div class="bar" style="height:100%"></div>
</div>
<div class="bar-labels"><span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span><span>周六</span><span>周日</span></div>
</div>
</div>
</body></html>`;

const mockRegisterHTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;justify-content:center;align-items:center;min-height:100vh}
.card{background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.15);width:400px;padding:36px}
h2{font-size:20px;font-weight:700;color:#1e293b;margin-bottom:4px}
.subtitle{font-size:13px;color:#64748b;margin-bottom:24px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.field{margin-bottom:14px}
.field label{display:block;font-size:12px;font-weight:500;color:#374151;margin-bottom:5px}
.field input{width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;transition:border-color .2s}
.field input:focus{border-color:#4D83FF}
.btn{width:100%;padding:12px;background:linear-gradient(135deg,#4D83FF,#6C5CE7);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;margin-top:6px}
.login-link{text-align:center;margin-top:14px;font-size:12px;color:#64748b}
.login-link a{color:#4D83FF;text-decoration:none;font-weight:500}
</style></head><body>
<div class="card">
<h2>创建账号</h2>
<p class="subtitle">加入我们，开始您的旅程</p>
<div class="row">
<div class="field"><label>姓名</label><input type="text" placeholder="请输入姓名"></div>
<div class="field"><label>昵称</label><input type="text" placeholder="设置昵称"></div>
</div>
<div class="field"><label>邮箱</label><input type="email" placeholder="请输入邮箱地址"></div>
<div class="field"><label>手机号</label><input type="tel" placeholder="请输入手机号"></div>
<div class="field"><label>密码</label><input type="password" placeholder="设置密码（8位以上）"></div>
<div class="field"><label>确认密码</label><input type="password" placeholder="再次输入密码"></div>
<button class="btn">立即注册</button>
<div class="login-link">已有账号？<a href="#">立即登录</a></div>
</div>
</body></html>`;

const selectTemplate = (message: string): string => {
  const msg = message.toLowerCase();
  if (msg.includes('注册') || msg.includes('register') || msg.includes('signup')) return mockRegisterHTML;
  if (msg.includes('首页') || msg.includes('dashboard') || msg.includes('主页') || msg.includes('仪表') || msg.includes('数据')) return mockDashboardHTML;
  return mockLoginHTML;
};

const applyColorAdjustment = (html: string, message: string): string => {
  const colorMap: Record<string, string> = {
    '绿色': '#22c55e', '蓝色': '#3b82f6', '红色': '#ef4444',
    '橙色': '#f97316', '紫色': '#8b5cf6', '黄色': '#eab308',
  };
  for (const [keyword, color] of Object.entries(colorMap)) {
    if (message.includes(keyword)) {
      return html.replace(/#4D83FF/g, color).replace(/#6C5CE7/g, color);
    }
  }
  return html;
};

export const UICreate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast, addUIDesign, prdList, uiDesignList, projectList, createUIDesignVersion } = useApp();
  const { setHeaderSlot, clearHeaderSlot } = useHeaderSlot();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        <div className={`flex items-center gap-0.5 ${isExportOpen ? 'pointer-events-none opacity-50' : ''}`}>
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
  }, [selectedPRD, selectedProjectId, currentStep, isExportOpen, prdList, projectList, navigate, setHeaderSlot]);

  useEffect(() => () => clearHeaderSlot(), [clearHeaderSlot]);

  useEffect(() => {
    if (editUIDesign) {
      setRequirement(editUIDesign.description);
      setSelectedPRD(editUIDesign.prdId || '');
      setHtmlCode(editUIDesign.htmlContent || mockLoginHTML);
    }
  }, [editUIDesign]);

  useEffect(() => {
    if (linkedPRD?.requirement && !isEditMode) setRequirement(linkedPRD.requirement);
  }, [linkedPRD, isEditMode]);

  // 草稿恢复（仅新建模式）
  useEffect(() => {
    if (isEditMode) return;
    const saved = localStorage.getItem(getUIDraftKey());
    if (!saved) return;
    try {
      const d = JSON.parse(saved);
      if (d.htmlCode) setHtmlCode(d.htmlCode);
      if (d.requirement) setRequirement(d.requirement);
      if (d.selectedPRD) setSelectedPRD(d.selectedPRD);
      if (d.selectedProjectId) setSelectedProjectId(d.selectedProjectId);
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 草稿自动保存（节流 1s，仅新建模式）
  useEffect(() => {
    if (isEditMode) return;
    if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current);
    draftSaveTimerRef.current = setTimeout(() => {
      localStorage.setItem(getUIDraftKey(), JSON.stringify({ htmlCode, requirement, selectedPRD, selectedProjectId, updatedAt: new Date().toISOString() }));
    }, 1000);
    return () => { if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current); };
  }, [htmlCode, requirement, selectedPRD, selectedProjectId, isEditMode]);

  const handleSendMessage = async (message: string) => {
    setIsChatLoading(true);
    if (!htmlCode) {
      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHtmlCode(selectTemplate(message));
      setRequirement(message);
      setIsGenerating(false);
      setAiReply({ content: `设计方案已生成。您可以继续描述需要调整的地方，例如：\n- "把主按钮颜色改成绿色"\n- "增加一个返回按钮"\n- "调整标题字号大一些"` });
      showToast('success', 'UI设计已生成');
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const updated = applyColorAdjustment(htmlCode, message);
      if (updated !== htmlCode) {
        setHtmlCode(updated);
        setAiReply({ content: `好的，已根据您的要求调整了颜色。请查看预览效果。` });
      } else {
        setAiReply({ content: `好的，已根据您的要求"${message}"进行了调整。请查看预览效果。` });
      }
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
    const designPayload = { title: `${requirement.slice(0, 20)}...设计`, description: requirement, prdId: selectedPRD || undefined, prdTitle: prd?.title, projectId: selectedProjectId, status: 'completed' as const, tool: 'HTML', htmlContent: htmlCode };
    if (isEditMode && editUIDesign) {
      if (editUIDesign.governanceStatus === 'frozen') { setPendingVersion(designPayload); setIsChangeRequestOpen(true); return; }
      createUIDesignVersion(editUIDesign.id, designPayload, { summary: '编辑更新' }); showToast('success', 'UI设计已更新');
    } else {
      addUIDesign(designPayload);
      localStorage.removeItem(getUIDraftKey());
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
