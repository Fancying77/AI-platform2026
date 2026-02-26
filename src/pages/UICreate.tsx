import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Send,
  Upload,
  Link2,
  Sparkles,
  RefreshCw,
  Trash2,
  ChevronRight,
  Image as ImageIcon,
  FileImage
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import StepIndicator from '../components/StepIndicator';
import Celebration from '../components/Celebration';
import { ChangeRequestDialog } from '../components/versioning/ChangeRequestDialog';
import { AI_ASSISTANT, getRandomEncouragement, checkMilestone } from '../constants/aiAssistant';
import type { UIDesignItem } from '../types';

const steps = [
  { id: 1, label: '需求输入' },
  { id: 2, label: '设计调整' },
  { id: 3, label: '导出' },
];

const toolOptions = [
  { id: 'figma', name: 'Figma', icon: '🎨' },
  { id: 'pencil', name: 'Pencil', icon: '✏️' },
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface UICreateLocationState {
  prdId?: string;
  prdTitle?: string;
  projectId?: string;
  requirement?: string;
  editUIDesign?: UIDesignItem;
  editDesign?: UIDesignItem;
}

export const UICreate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast, addUIDesign, prdList, uiDesignList, projectList, createUIDesignVersion } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const locationState = location.state as UICreateLocationState | null;
  const linkedPRD = locationState;

  // 编辑模式
  const editUIDesign = linkedPRD?.editUIDesign || linkedPRD?.editDesign;
  const isEditMode = !!editUIDesign;
  const initialProjectId = linkedPRD?.projectId || editUIDesign?.projectId;

  const [currentStep, setCurrentStep] = useState(1);
  const [requirement, setRequirement] = useState('');
  const [selectedTool, setSelectedTool] = useState('figma');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [selectedPRD, setSelectedPRD] = useState(linkedPRD?.prdId || '');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(initialProjectId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [encouragement] = useState(getRandomEncouragement());
  const [isChangeRequestOpen, setIsChangeRequestOpen] = useState(false);
  const [pendingVersion, setPendingVersion] = useState<Pick<UIDesignItem, 'title' | 'description' | 'status' | 'tool' | 'prdId' | 'prdTitle' | 'projectId' | 'thumbnail'> & { componentTree?: string } | null>(null);

  // 编辑模式：填充数据
  useEffect(() => {
    if (editUIDesign) {
      const resetTimer = setTimeout(() => {
        setRequirement(editUIDesign.description);
        setSelectedPRD(editUIDesign.prdId || '');
        setCurrentStep(2); // 直接跳到第二步
      }, 0);
      return () => clearTimeout(resetTimer);
    }
    return undefined;
  }, [editUIDesign]);

  // Chat states for Step 2
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');

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

  const handleStartDesign = async () => {
    if (!requirement.trim()) {
      showToast('warning', '请先输入设计需求');
      return;
    }

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setCurrentStep(2);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: '设计方案已生成，您可以通过对话来调整设计细节。\n\n例如：\n- "把主按钮颜色改成蓝色"\n- "增加一个返回按钮"\n- "调整标题字号大一些"',
      }
    ]);
    showToast('success', 'UI设计生成成功');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `好的，已根据您的要求"${inputMessage}"进行了调整。请查看右侧预览效果。`,
    };
    setMessages(prev => [...prev, aiMessage]);
  };

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
        {isEditMode && editUIDesign?.governanceStatus === 'frozen' && (
          <div className="max-w-4xl mx-auto mb-4 bg-bg-gray border border-border rounded-card p-3 text-sm text-text-secondary">
            当前 UI 设计已冻结，继续修改需要提交变更单并生成新版本。
          </div>
        )}
        {/* Step 1: 需求输入 */}
        {currentStep === 1 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-card p-6 border border-border">
              <h3 className="text-lg font-medium text-text-primary mb-6">创建UI设计</h3>

              {/* PRD Selection - At Top */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-text-primary mb-1.5">
                  关联PRD（可选）
                </label>
                {linkedPRD?.prdTitle ? (
                  <div className="p-3 bg-primary-light rounded-card">
                    <div className="flex items-center gap-2 text-sm">
                      <Link2 size={14} className="text-primary" />
                      <span className="text-text-secondary">关联PRD：</span>
                      <span className="text-primary font-medium">{linkedPRD.prdTitle}</span>
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedPRD}
                    onChange={(e) => setSelectedPRD(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-card focus:outline-none focus:border-primary"
                  >
                    <option value="">不关联PRD</option>
                    {prdList.map(prd => (
                      <option key={prd.id} value={prd.id}>{prd.title}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Project Selection */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-text-primary mb-1.5">
                  关联项目（可选）
                </label>
                <select
                  value={selectedProjectId || ''}
                  onChange={(e) => setSelectedProjectId(e.target.value || undefined)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-card focus:outline-none focus:border-primary"
                >
                  <option value="">不关联项目</option>
                  {projectList.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>

              {/* Tool Selection - Compact, One Row */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-text-primary mb-1.5">
                  生成工具
                </label>
                <div className="flex gap-2">
                  {toolOptions.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-card border transition-colors ${
                        selectedTool === tool.id
                          ? 'border-primary bg-primary-light text-primary'
                          : 'border-border text-text-secondary hover:border-primary'
                      }`}
                    >
                      <span>{tool.icon}</span>
                      <span>{tool.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Requirement Input - Taller */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-text-primary mb-1.5">
                  设计需求描述
                </label>
                <textarea
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  placeholder="请描述您需要的UI设计，例如：设计一个简洁的登录页面，包含手机号登录和第三方登录..."
                  className="w-full h-[32rem] p-4 border border-border rounded-card resize-none focus:outline-none focus:border-primary text-sm"
                />
              </div>

              {/* Reference Images - Compact */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-text-primary mb-1.5">
                  上传竞品/参考图（可选）
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
                    className="w-14 h-14 border-2 border-dashed border-border rounded-card flex flex-col items-center justify-center text-text-tertiary hover:border-primary hover:text-primary transition-colors"
                  >
                    <Upload size={16} />
                    <span className="text-[10px] mt-0.5">上传</span>
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

              {/* Start Button */}
              <button
                onClick={handleStartDesign}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm bg-primary text-white rounded-card hover:bg-primary-hover disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    开始生成设计
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 设计调整 */}
        {currentStep === 2 && (
          <div className="grid grid-cols-5 gap-6 h-full">
            {/* Chat Area */}
            <div className="flex flex-col bg-white rounded-card border border-border">
              {/* AI Assistant Header */}
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                    {AI_ASSISTANT.ui.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-text-primary">{AI_ASSISTANT.ui.name}</h3>
                    <p className="text-[10px] text-text-tertiary">{AI_ASSISTANT.ui.slogan}</p>
                  </div>
                </div>
              </div>

              {/* Encouragement Message */}
              <div className="mx-3 mt-3 p-2 bg-bg-light rounded-card">
                <p className="text-xs text-text-secondary">{encouragement}</p>
              </div>

              {/* Quick Suggestions */}
              <div className="mx-3 mt-3">
                <p className="text-xs text-text-tertiary mb-2">快捷建议</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    '调整配色方案',
                    '优化布局结构',
                    '增加交互细节',
                    '添加空状态',
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setInputMessage(suggestion)}
                      className="px-2 py-1 text-xs bg-bg-light text-text-secondary rounded-card hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-auto p-3 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex-1" />
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-card text-xs whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-primary text-white'
                            : 'bg-bg-light text-text-primary'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <span className="text-primary font-medium">{AI_ASSISTANT.ui.name}：</span>
                        )}
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-border">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`向${AI_ASSISTANT.ui.name}提问...`}
                    className="flex-1 min-w-0 px-2 py-1.5 border border-border rounded-card text-xs focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="flex-shrink-0 px-3 py-1.5 bg-primary text-white rounded-card hover:bg-primary-hover"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="col-span-4 flex flex-col bg-white rounded-card border border-border">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-medium text-text-primary">设计预览</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartDesign}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-text-secondary hover:text-primary border border-border rounded-card hover:border-primary"
                  >
                    <RefreshCw size={12} />
                    重新生成
                  </button>
                  <button
                    onClick={() => {
                      const prd = prdList.find(p => p.id === selectedPRD);
                      const componentTree = requirement.trim() ? `需求描述:\n${requirement.trim()}` : undefined;
                      const designPayload = {
                        title: `${requirement.slice(0, 20)}...设计`,
                        description: requirement,
                        prdId: selectedPRD || undefined,
                        prdTitle: prd?.title,
                        projectId: selectedProjectId,
                        status: 'completed' as const,
                        tool: toolOptions.find(t => t.id === selectedTool)?.name || 'Figma',
                      };
                      const versionPayload = {
                        ...designPayload,
                        componentTree,
                      };
                      if (isEditMode && editUIDesign) {
                        if (editUIDesign.governanceStatus === 'frozen') {
                          setPendingVersion(versionPayload);
                          setIsChangeRequestOpen(true);
                          return;
                        }
                        createUIDesignVersion(editUIDesign.id, versionPayload, { summary: '编辑更新' });
                        showToast('success', 'UI设计已更新');
                      } else {
                        addUIDesign(designPayload);

                        // 检查里程碑
                        const newCount = uiDesignList.length + 1;
                        const milestone = checkMilestone('ui', newCount);
                        if (milestone) {
                          showToast('success', milestone.message);
                        } else {
                          showToast('success', 'UI设计已保存');
                        }

                        // 显示庆祝动画
                        setShowCelebration(true);
                      }
                      setCurrentStep(3);
                    }}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
                  >
                    下一步
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6 bg-bg-gray">
                {/* 模拟的UI设计预览 - 登录页面 */}
                <div className="max-w-sm mx-auto">
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-border">
                    {/* 顶部装饰 */}
                    <div className="h-28 bg-primary relative">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                        <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 表单区域 */}
                    <div className="pt-12 pb-6 px-6">
                      <h2 className="text-lg font-medium text-center text-text-primary mb-5">欢迎登录</h2>

                      {/* 手机号输入 */}
                      <div className="mb-3">
                        <div className="flex items-center gap-3 px-3 py-2.5 bg-bg-light rounded-card border border-border">
                          <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="text-text-tertiary text-sm">请输入手机号</span>
                        </div>
                      </div>

                      {/* 验证码输入 */}
                      <div className="mb-5">
                        <div className="flex gap-2">
                          <div className="flex-1 flex items-center gap-3 px-3 py-2.5 bg-bg-light rounded-card border border-border">
                            <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-text-tertiary text-sm">验证码</span>
                          </div>
                          <button className="px-3 py-2.5 bg-primary/10 text-primary text-xs font-medium rounded-card whitespace-nowrap">
                            获取验证码
                          </button>
                        </div>
                      </div>

                      {/* 登录按钮 */}
                      <button className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-card">
                        登 录
                      </button>

                      {/* 分割线 */}
                      <div className="flex items-center gap-4 my-5">
                        <div className="flex-1 h-px bg-border"></div>
                        <span className="text-xs text-text-tertiary">其他登录方式</span>
                        <div className="flex-1 h-px bg-border"></div>
                      </div>

                      {/* 第三方登录 */}
                      <div className="flex justify-center gap-5">
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-100 transition-colors">
                          <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18z"/>
                            <path d="M23.96 14.187c0-3.246-3.09-5.882-6.914-5.882-3.823 0-6.913 2.636-6.913 5.882 0 3.247 3.09 5.883 6.913 5.883.752 0 1.48-.098 2.164-.294a.66.66 0 01.546.074l1.453.853a.25.25 0 00.127.041.226.226 0 00.221-.226c0-.054-.022-.11-.037-.163l-.297-1.13a.45.45 0 01.163-.507c1.398-1.03 2.574-2.556 2.574-4.531zm-9.463.049c-.49 0-.888-.404-.888-.9 0-.497.398-.9.888-.9.49 0 .888.403.888.9 0 .496-.398.9-.888.9zm5.098 0c-.49 0-.888-.404-.888-.9 0-.497.398-.9.888-.9.49 0 .888.403.888.9 0 .496-.398.9-.888.9z"/>
                          </svg>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors">
                          <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.001 2C6.47813 2 2.00098 6.47715 2.00098 12C2.00098 16.9913 5.65783 21.1283 10.4385 21.8785V14.8906H7.89941V12H10.4385V9.79688C10.4385 7.29063 11.9314 5.90625 14.2156 5.90625C15.3097 5.90625 16.4541 6.10156 16.4541 6.10156V8.5625H15.1931C13.9509 8.5625 13.5635 9.33334 13.5635 10.1242V12H16.3369L15.8936 14.8906H13.5635V21.8785C18.3441 21.1283 22.001 16.9913 22.001 12C22.001 6.47715 17.5765 2 12.001 2Z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 底部提示 */}
                  <p className="text-center text-xs text-text-tertiary mt-3">
                    登录即表示同意《用户协议》和《隐私政策》
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 导出 */}
        {currentStep === 3 && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-card p-8 border border-border">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <h2 className="text-lg font-medium text-text-primary mb-2">太棒了！UI设计已完成</h2>
                <p className="text-text-secondary mb-3">设计稿已保存，请选择导出格式</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bg-light rounded-card">
                  <span className="text-xs text-text-secondary">
                    这是你的第 {uiDesignList.length} 份设计
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {/* 导出为Figma格式 */}
                <div
                  onClick={() => {
                    showToast('success', '已导出为Figma格式');
                  }}
                  className="flex items-center gap-4 p-4 border border-border rounded-card hover:border-primary cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-card flex items-center justify-center">
                    <FileImage size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary text-sm mb-0.5">导出为Figma格式</h3>
                    <p className="text-xs text-text-secondary">导出为 .fig 文件，可直接在Figma中打开编辑</p>
                  </div>
                  <ChevronRight size={18} className="text-text-tertiary group-hover:text-primary" />
                </div>

                {/* 导出为PNG格式 */}
                <div
                  onClick={() => {
                    showToast('success', '已导出为PNG格式');
                  }}
                  className="flex items-center gap-4 p-4 border border-border rounded-card hover:border-primary cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-card flex items-center justify-center">
                    <ImageIcon size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary text-sm mb-0.5">导出为PNG格式</h3>
                    <p className="text-xs text-text-secondary">导出为高清PNG图片，适合分享和预览</p>
                  </div>
                  <ChevronRight size={18} className="text-text-tertiary group-hover:text-primary" />
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
                >
                  返回编辑
                </button>
                <button
                  onClick={() => navigate('/ui')}
                  className="px-6 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
                >
                  完成
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Celebration Animation */}
      <Celebration show={showCelebration} onComplete={() => setShowCelebration(false)} />

      <ChangeRequestDialog
        isOpen={isChangeRequestOpen}
        entityLabel={editUIDesign?.title || 'UI设计'}
        onCancel={() => {
          setIsChangeRequestOpen(false);
          setPendingVersion(null);
        }}
        onSubmit={(payload) => {
          if (!editUIDesign || !pendingVersion) return;
          createUIDesignVersion(editUIDesign.id, pendingVersion, {
            changeRequest: payload,
            summary: payload.reason || '变更单更新',
          });
          showToast('success', '变更单已提交，生成新版本');
          setIsChangeRequestOpen(false);
          setPendingVersion(null);
          setCurrentStep(3);
        }}
      />
    </div>
  );
};
