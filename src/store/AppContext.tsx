import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  PRDItem,
  UIDesignItem,
  UserInfo,
  ToastMessage,
  ProjectItem,
  AINewsItem,
  ChangeRequest,
  PRDVersion,
  UIDesignVersion,
  ProjectVersion,
  GovernanceStatus,
  ApprovalStatus,
} from '../types';

// localStorage keys
export const STORAGE_KEYS = {
  PRD_LIST: 'lexin_prd_list',
  UI_DESIGN_LIST: 'lexin_ui_design_list',
  PROJECT_LIST: 'lexin_project_list',
  AI_NEWS_LIST: 'lexin_ai_news_list',
  AI_NEWS_FAVORITES: 'lexin_ai_news_favorites',
  DASHBOARD_ACHIEVEMENTS: 'lexin_dashboard_achievements',
  DASHBOARD_LEADERBOARD: 'lexin_dashboard_leaderboard',
  DASHBOARD_USER_STATS: 'lexin_dashboard_user_stats',
  PRD_DRAFT_PREFIX: 'lexin_draft_prd_',
  UI_DRAFT_PREFIX: 'lexin_draft_ui_',
};

export const getPRDDraftKey = (id?: string): string => `${STORAGE_KEYS.PRD_DRAFT_PREFIX}${id || 'new'}`;
export const getUIDraftKey = (id?: string): string => `${STORAGE_KEYS.UI_DRAFT_PREFIX}${id || 'new'}`;

const DEFAULT_GOVERNANCE_STATUS: GovernanceStatus = 'draft';
const DEFAULT_ACTOR = '系统';

const getTodayString = (): string => new Date().toISOString().split('T')[0];

interface AppContextType {
  // PRD State
  prdList: PRDItem[];
  addPRD: (prd: PRDInput) => void;
  updatePRD: (id: string, prd: Partial<PRDItem>) => void;
  deletePRD: (id: string) => void;
  createPRDVersion: (
    id: string,
    next: Pick<PRDItem, 'title' | 'description' | 'content' | 'status' | 'projectId'> & { requirementName?: string; priority?: PRDItem['priority']; source?: string },
    options?: { changeRequest?: ChangeRequestInput; summary?: string }
  ) => void;
  setPRDGovernanceStatus: (id: string, status: GovernanceStatus) => void;

  // UI Design State
  uiDesignList: UIDesignItem[];
  addUIDesign: (design: UIDesignInput) => void;
  updateUIDesign: (id: string, design: Partial<UIDesignItem>) => void;
  deleteUIDesign: (id: string) => void;
  createUIDesignVersion: (
    id: string,
    next: Pick<UIDesignItem, 'title' | 'description' | 'status' | 'tool' | 'prdId' | 'prdTitle' | 'projectId' | 'thumbnail' | 'htmlContent'> & { componentTree?: string },
    options?: { changeRequest?: ChangeRequestInput; summary?: string }
  ) => void;
  setUIDesignGovernanceStatus: (id: string, status: GovernanceStatus) => void;

  // Project State
  projectList: ProjectItem[];
  addProject: (project: ProjectInput) => void;
  updateProject: (id: string, project: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;

  // AI News State
  aiNewsList: AINewsItem[];
  aiNewsFavorites: string[];
  addAINews: (news: Omit<AINewsItem, 'id' | 'createdAt'>) => void;
  updateAINews: (id: string, news: Partial<AINewsItem>) => void;
  deleteAINews: (id: string) => void;
  toggleFavorite: (newsId: string) => void;
  markAsRead: (newsId: string) => void;

  // User Info
  userInfo: UserInfo;

  // Toast
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
}

interface ChangeRequestInput {
  reason: string;
  impact: string;
  relatedTasks: string[];
  approvalStatus?: ApprovalStatus;
}

type PRDInput = Pick<PRDItem, 'title' | 'description' | 'content' | 'status' | 'projectId' | 'requirementName' | 'priority' | 'source'>;

type UIDesignInput = Pick<UIDesignItem, 'title' | 'description' | 'status' | 'tool' | 'prdId' | 'prdTitle' | 'projectId' | 'thumbnail' | 'htmlContent'>;

type ProjectInput = Pick<ProjectItem, 'title' | 'description' | 'status' | 'members'>;

const AppContext = createContext<AppContextType | undefined>(undefined);

// 默认数据
const defaultPRDList: PRDItem[] = [
  // 项目1: 用户登录体验优化 (1条)
  {
    id: '1', title: '用户登录优化需求', description: '优化现有登录流程，提升用户体验',
    content: '## 背景\n用户反馈登录流程繁琐...\n\n## 目标\n简化登录步骤，提升转化率',
    status: 'completed', projectId: '1', createdAt: '2024-01-20', updatedAt: '2024-01-22',
    currentVersionId: '1-v1', versions: [{ id: '1-v1', version: 1, createdAt: '2024-01-20', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '用户登录优化需求', description: '优化现有登录流程，提升用户体验', content: '## 背景\n用户反馈登录流程繁琐...\n\n## 目标\n简化登录步骤，提升转化率', status: 'completed', projectId: '1' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  // 项目2: 首页改版项目 (1条)
  {
    id: '2', title: '首页改版需求', description: '重新设计首页布局和交互',
    content: '## 背景\n首页跳出率较高...',
    status: 'in_progress', projectId: '2', createdAt: '2024-01-25',
    currentVersionId: '2-v1', versions: [{ id: '2-v1', version: 1, createdAt: '2024-01-25', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '首页改版需求', description: '重新设计首页布局和交互', content: '## 背景\n首页跳出率较高...', status: 'in_progress', projectId: '2' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  // 项目3: 分期乐会员体系搭建 (1条)
  {
    id: '3', title: '会员等级体系需求', description: '定义会员等级规则、权益和升降级机制',
    content: '## 背景\n用户粘性不足，需要搭建会员体系...\n\n## 目标\n提升用户复购率和留存率',
    status: 'completed', projectId: '3', createdAt: '2024-01-11', updatedAt: '2024-01-18',
    currentVersionId: '3-v1', versions: [{ id: '3-v1', version: 1, createdAt: '2024-01-11', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '会员等级体系需求', description: '定义会员等级规则、权益和升降级机制', content: '## 背景\n用户粘性不足，需要搭建会员体系...\n\n## 目标\n提升用户复购率和留存率', status: 'completed', projectId: '3' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  // 项目4: 客服系统优化 (6条)
  {
    id: '4', title: '智能客服机器人需求', description: '接入AI大模型，实现智能问答和自动分流',
    content: '## 背景\n人工客服成本高，响应慢\n\n## 目标\n通过AI客服解决80%常见问题',
    status: 'completed', projectId: '4', createdAt: '2024-02-01', updatedAt: '2024-02-15',
    currentVersionId: '4-v1', versions: [{ id: '4-v1', version: 1, createdAt: '2024-02-01', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '智能客服机器人需求', description: '接入AI大模型，实现智能问答和自动分流', content: '## 背景\n人工客服成本高，响应慢\n\n## 目标\n通过AI客服解决80%常见问题', status: 'completed', projectId: '4' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '5', title: '工单系统重构需求', description: '重构工单流转引擎，支持自定义SLA和自动升级',
    content: '## 背景\n现有工单系统流转效率低\n\n## 目标\n工单平均处理时长降低40%',
    status: 'completed', projectId: '4', createdAt: '2024-02-03', updatedAt: '2024-02-18',
    currentVersionId: '5-v1', versions: [{ id: '5-v1', version: 1, createdAt: '2024-02-03', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '工单系统重构需求', description: '重构工单流转引擎，支持自定义SLA和自动升级', content: '## 背景\n现有工单系统流转效率低\n\n## 目标\n工单平均处理时长降低40%', status: 'completed', projectId: '4' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '6', title: '客服知识库建设需求', description: '搭建结构化知识库，支持AI检索和自动推荐',
    content: '## 背景\n客服知识分散，查找困难\n\n## 目标\n知识库覆盖率达到95%',
    status: 'in_progress', projectId: '4', createdAt: '2024-02-05', updatedAt: '2024-02-20',
    currentVersionId: '6-v1', versions: [{ id: '6-v1', version: 1, createdAt: '2024-02-05', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '客服知识库建设需求', description: '搭建结构化知识库，支持AI检索和自动推荐', content: '## 背景\n客服知识分散，查找困难\n\n## 目标\n知识库覆盖率达到95%', status: 'in_progress', projectId: '4' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '7', title: '客服质检系统需求', description: '基于AI的客服对话质量检测和评分系统',
    content: '## 背景\n人工质检覆盖率低\n\n## 目标\n实现100%对话自动质检',
    status: 'in_progress', projectId: '4', createdAt: '2024-02-08',
    currentVersionId: '7-v1', versions: [{ id: '7-v1', version: 1, createdAt: '2024-02-08', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '客服质检系统需求', description: '基于AI的客服对话质量检测和评分系统', content: '## 背景\n人工质检覆盖率低\n\n## 目标\n实现100%对话自动质检', status: 'in_progress', projectId: '4' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '8', title: '客服数据看板需求', description: '实时展示客服运营数据和关键指标',
    content: '## 背景\n缺乏统一的客服数据视图\n\n## 目标\n建立实时数据监控体系',
    status: 'completed', projectId: '4', createdAt: '2024-02-10', updatedAt: '2024-02-22',
    currentVersionId: '8-v1', versions: [{ id: '8-v1', version: 1, createdAt: '2024-02-10', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '客服数据看板需求', description: '实时展示客服运营数据和关键指标', content: '## 背景\n缺乏统一的客服数据视图\n\n## 目标\n建立实时数据监控体系', status: 'completed', projectId: '4' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '9', title: '客服满意度调研需求', description: '用户满意度评价和NPS调研功能',
    content: '## 背景\n缺乏系统化的满意度收集机制\n\n## 目标\n建立完整的用户反馈闭环',
    status: 'completed', projectId: '4', createdAt: '2024-02-12', updatedAt: '2024-02-25',
    currentVersionId: '9-v1', versions: [{ id: '9-v1', version: 1, createdAt: '2024-02-12', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '客服满意度调研需求', description: '用户满意度评价和NPS调研功能', content: '## 背景\n缺乏系统化的满意度收集机制\n\n## 目标\n建立完整的用户反馈闭环', status: 'completed', projectId: '4' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  // 项目5: 触达平台建设 (3条)
  {
    id: '10', title: '消息推送中心需求', description: '统一消息推送平台，支持多渠道触达',
    content: '## 背景\n推送渠道分散，缺乏统一管理\n\n## 目标\n建立统一的消息推送中心',
    status: 'completed', projectId: '5', createdAt: '2024-02-15', updatedAt: '2024-03-01',
    currentVersionId: '10-v1', versions: [{ id: '10-v1', version: 1, createdAt: '2024-02-15', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '消息推送中心需求', description: '统一消息推送平台，支持多渠道触达', content: '## 背景\n推送渠道分散，缺乏统一管理\n\n## 目标\n建立统一的消息推送中心', status: 'completed', projectId: '5' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '11', title: '用户分群策略需求', description: '基于用户画像的智能分群和精准触达策略',
    content: '## 背景\n触达缺乏精准性，转化率低\n\n## 目标\n触达转化率提升30%',
    status: 'in_progress', projectId: '5', createdAt: '2024-02-18',
    currentVersionId: '11-v1', versions: [{ id: '11-v1', version: 1, createdAt: '2024-02-18', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '用户分群策略需求', description: '基于用户画像的智能分群和精准触达策略', content: '## 背景\n触达缺乏精准性，转化率低\n\n## 目标\n触达转化率提升30%', status: 'in_progress', projectId: '5' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '12', title: '触达效果分析需求', description: '触达效果追踪、A/B测试和ROI分析',
    content: '## 背景\n触达效果难以量化评估\n\n## 目标\n建立完整的效果归因体系',
    status: 'in_progress', projectId: '5', createdAt: '2024-02-20',
    currentVersionId: '12-v1', versions: [{ id: '12-v1', version: 1, createdAt: '2024-02-20', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '触达效果分析需求', description: '触达效果追踪、A/B测试和ROI分析', content: '## 背景\n触达效果难以量化评估\n\n## 目标\n建立完整的效果归因体系', status: 'in_progress', projectId: '5' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  // 项目6: 管户工作台 (4条)
  {
    id: '13', title: '客户360视图需求', description: '整合客户全维度信息，构建统一客户视图',
    content: '## 背景\n客户信息分散在多个系统\n\n## 目标\n一站式查看客户全貌',
    status: 'completed', projectId: '6', createdAt: '2024-03-01', updatedAt: '2024-03-15',
    currentVersionId: '13-v1', versions: [{ id: '13-v1', version: 1, createdAt: '2024-03-01', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '客户360视图需求', description: '整合客户全维度信息，构建统一客户视图', content: '## 背景\n客户信息分散在多个系统\n\n## 目标\n一站式查看客户全貌', status: 'completed', projectId: '6' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '14', title: '任务分配引擎需求', description: '智能任务分配和工作量均衡管理',
    content: '## 背景\n任务分配不均，效率低下\n\n## 目标\n实现智能化任务分配',
    status: 'completed', projectId: '6', createdAt: '2024-03-03', updatedAt: '2024-03-18',
    currentVersionId: '14-v1', versions: [{ id: '14-v1', version: 1, createdAt: '2024-03-03', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '任务分配引擎需求', description: '智能任务分配和工作量均衡管理', content: '## 背景\n任务分配不均，效率低下\n\n## 目标\n实现智能化任务分配', status: 'completed', projectId: '6' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '15', title: '客户跟进记录需求', description: '客户沟通记录管理和跟进提醒功能',
    content: '## 背景\n跟进记录不规范，容易遗漏\n\n## 目标\n标准化客户跟进流程',
    status: 'in_progress', projectId: '6', createdAt: '2024-03-05',
    currentVersionId: '15-v1', versions: [{ id: '15-v1', version: 1, createdAt: '2024-03-05', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '客户跟进记录需求', description: '客户沟通记录管理和跟进提醒功能', content: '## 背景\n跟进记录不规范，容易遗漏\n\n## 目标\n标准化客户跟进流程', status: 'in_progress', projectId: '6' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '16', title: '管户绩效考核需求', description: '管户人员KPI指标和绩效看板',
    content: '## 背景\n管户绩效缺乏量化评估\n\n## 目标\n建立数据驱动的绩效体系',
    status: 'in_progress', projectId: '6', createdAt: '2024-03-08',
    currentVersionId: '16-v1', versions: [{ id: '16-v1', version: 1, createdAt: '2024-03-08', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '管户绩效考核需求', description: '管户人员KPI指标和绩效看板', content: '## 背景\n管户绩效缺乏量化评估\n\n## 目标\n建立数据驱动的绩效体系', status: 'in_progress', projectId: '6' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
];

const defaultUIDesignList: UIDesignItem[] = [
  // 项目1: 用户登录体验优化
  {
    id: '1', title: '登录页面设计', description: '新版登录页面UI设计',
    prdId: '1', prdTitle: '用户登录优化需求',
    projectId: '1', status: 'completed', tool: 'Figma',
    createdAt: '2024-01-21',
    currentVersionId: '1-v1', versions: [{ id: '1-v1', version: 1, createdAt: '2024-01-21', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '登录页面设计', description: '新版登录页面UI设计', prdId: '1', prdTitle: '用户登录优化需求', projectId: '1', status: 'completed', tool: 'Figma' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '2', title: '注册流程设计', description: '新用户注册引导流程UI设计',
    prdId: '1', prdTitle: '用户登录优化需求',
    projectId: '1', status: 'completed', tool: 'Sketch',
    createdAt: '2024-01-22',
    updatedAt: '2024-01-24',
    currentVersionId: '2-v1', versions: [{ id: '2-v1', version: 1, createdAt: '2024-01-22', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '注册流程设计', description: '新用户注册引导流程UI设计', prdId: '1', prdTitle: '用户登录优化需求', projectId: '1', status: 'completed', tool: 'Sketch' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  // 项目2: 首页改版项目
  {
    id: '3', title: '首页改版设计', description: '重新设计App首页布局和视觉风格',
    prdId: '2', prdTitle: '首页改版需求',
    projectId: '2', status: 'in_progress', tool: 'Figma',
    createdAt: '2024-01-26',
    currentVersionId: '3-v1', versions: [{ id: '3-v1', version: 1, createdAt: '2024-01-26', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '首页改版设计', description: '重新设计App首页布局和视觉风格', prdId: '2', prdTitle: '首页改版需求', projectId: '2', status: 'in_progress', tool: 'Figma' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  // 项目3: 分期乐会员体系搭建
  {
    id: '4', title: '会员等级页面设计', description: '会员体系等级展示和权益说明页面设计',
    projectId: '3', status: 'completed', tool: 'Figma',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-18',
    currentVersionId: '4-v1', versions: [{ id: '4-v1', version: 1, createdAt: '2024-01-12', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '会员等级页面设计', description: '会员体系等级展示和权益说明页面设计', projectId: '3', status: 'completed', tool: 'Figma' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '5', title: '会员中心设计', description: '会员中心主页面及积分商城设计',
    projectId: '3', status: 'completed', tool: 'Figma',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-19',
    currentVersionId: '5-v1', versions: [{ id: '5-v1', version: 1, createdAt: '2024-01-14', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '会员中心设计', description: '会员中心主页面及积分商城设计', projectId: '3', status: 'completed', tool: 'Figma' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  // 项目4: 客服系统优化
  {
    id: '6', title: '智能客服对话界面设计', description: 'AI客服聊天窗口和交互设计',
    prdId: '4', prdTitle: '智能客服机器人需求',
    projectId: '4', status: 'completed', tool: 'Figma',
    createdAt: '2024-02-02',
    updatedAt: '2024-02-14',
    currentVersionId: '6-v1', versions: [{ id: '6-v1', version: 1, createdAt: '2024-02-02', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '智能客服对话界面设计', description: 'AI客服聊天窗口和交互设计', prdId: '4', prdTitle: '智能客服机器人需求', projectId: '4', status: 'completed', tool: 'Figma' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '7', title: '工单管理界面设计', description: '工单列表、详情和流转操作界面',
    prdId: '5', prdTitle: '工单系统重构需求',
    projectId: '4', status: 'completed', tool: 'Figma',
    createdAt: '2024-02-04',
    updatedAt: '2024-02-17',
    currentVersionId: '7-v1', versions: [{ id: '7-v1', version: 1, createdAt: '2024-02-04', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '工单管理界面设计', description: '工单列表、详情和流转操作界面', prdId: '5', prdTitle: '工单系统重构需求', projectId: '4', status: 'completed', tool: 'Figma' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '8', title: '知识库管理界面设计', description: '知识库编辑、分类和搜索界面',
    prdId: '6', prdTitle: '客服知识库建设需求',
    projectId: '4', status: 'in_progress', tool: 'Figma',
    createdAt: '2024-02-06',
    currentVersionId: '8-v1', versions: [{ id: '8-v1', version: 1, createdAt: '2024-02-06', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '知识库管理界面设计', description: '知识库编辑、分类和搜索界面', prdId: '6', prdTitle: '客服知识库建设需求', projectId: '4', status: 'in_progress', tool: 'Figma' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '9', title: '客服数据看板设计', description: '客服运营数据可视化大屏设计',
    prdId: '8', prdTitle: '客服数据看板需求',
    projectId: '4', status: 'completed', tool: 'Figma',
    createdAt: '2024-02-11',
    updatedAt: '2024-02-21',
    currentVersionId: '9-v1', versions: [{ id: '9-v1', version: 1, createdAt: '2024-02-11', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '客服数据看板设计', description: '客服运营数据可视化大屏设计', prdId: '8', prdTitle: '客服数据看板需求', projectId: '4', status: 'completed', tool: 'Figma' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  // 项目5: 触达平台建设
  {
    id: '10', title: '消息推送配置界面设计', description: '推送任务创建和渠道配置界面',
    prdId: '10', prdTitle: '消息推送中心需求',
    projectId: '5', status: 'completed', tool: 'Figma',
    createdAt: '2024-02-16',
    updatedAt: '2024-02-28',
    currentVersionId: '10-v1', versions: [{ id: '10-v1', version: 1, createdAt: '2024-02-16', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '消息推送配置界面设计', description: '推送任务创建和渠道配置界面', prdId: '10', prdTitle: '消息推送中心需求', projectId: '5', status: 'completed', tool: 'Figma' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '11', title: '用户分群界面设计', description: '用户画像标签和分群规则配置界面',
    prdId: '11', prdTitle: '用户分群策略需求',
    projectId: '5', status: 'in_progress', tool: 'Figma',
    createdAt: '2024-02-19',
    currentVersionId: '11-v1', versions: [{ id: '11-v1', version: 1, createdAt: '2024-02-19', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '用户分群界面设计', description: '用户画像标签和分群规则配置界面', prdId: '11', prdTitle: '用户分群策略需求', projectId: '5', status: 'in_progress', tool: 'Figma' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  // 项目6: 管户工作台
  {
    id: '12', title: '客户360视图界面设计', description: '客户全景信息展示界面',
    prdId: '13', prdTitle: '客户360视图需求',
    projectId: '6', status: 'completed', tool: 'Figma',
    createdAt: '2024-03-02',
    updatedAt: '2024-03-14',
    currentVersionId: '12-v1', versions: [{ id: '12-v1', version: 1, createdAt: '2024-03-02', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '客户360视图界面设计', description: '客户全景信息展示界面', prdId: '13', prdTitle: '客户360视图需求', projectId: '6', status: 'completed', tool: 'Figma' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '13', title: '任务工作台界面设计', description: '管户任务列表和操作界面',
    prdId: '14', prdTitle: '任务分配引擎需求',
    projectId: '6', status: 'completed', tool: 'Figma',
    createdAt: '2024-03-04',
    updatedAt: '2024-03-17',
    currentVersionId: '13-v1', versions: [{ id: '13-v1', version: 1, createdAt: '2024-03-04', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '任务工作台界面设计', description: '管户任务列表和操作界面', prdId: '14', prdTitle: '任务分配引擎需求', projectId: '6', status: 'completed', tool: 'Figma' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
  {
    id: '14', title: '客户跟进记录界面设计', description: '沟通记录时间轴和跟进表单设计',
    prdId: '15', prdTitle: '客户跟进记录需求',
    projectId: '6', status: 'in_progress', tool: 'Figma',
    createdAt: '2024-03-06',
    currentVersionId: '14-v1', versions: [{ id: '14-v1', version: 1, createdAt: '2024-03-06', createdBy: DEFAULT_ACTOR, summary: '初始版本', title: '客户跟进记录界面设计', description: '沟通记录时间轴和跟进表单设计', prdId: '15', prdTitle: '客户跟进记录需求', projectId: '6', status: 'in_progress', tool: 'Figma' }],
    governanceStatus: DEFAULT_GOVERNANCE_STATUS, changeRequests: [],
  },
];

const defaultProjectList: ProjectItem[] = [
  {
    id: '1', title: '用户登录体验优化',
    description: '优化现有登录流程，提升用户登录转化率和使用体验',
    status: 'in_progress',
    members: ['cancanli(李灿灿)', 'kriswu(吴泽平)'],
    createdAt: '2024-01-18', updatedAt: '2024-01-25',
    currentVersionId: '1-v1',
    versions: [{ id: '1-v1', version: 1, createdAt: '2024-01-18', createdBy: DEFAULT_ACTOR, summary: '项目创建', title: '用户登录体验优化', description: '优化现有登录流程，提升用户登录转化率和使用体验', status: 'in_progress', prdVersionIds: ['1-v1'], uiVersionIds: ['1-v1', '2-v1'] }],
    changeRequests: [],
  },
  {
    id: '2', title: '首页改版项目',
    description: '重新设计App首页，降低跳出率，提升用户活跃度',
    status: 'planning',
    members: ['cancanli(李灿灿)', 'lilywang(王莉萍)'],
    createdAt: '2024-01-22', updatedAt: '2024-01-25',
    currentVersionId: '2-v1',
    versions: [{ id: '2-v1', version: 1, createdAt: '2024-01-22', createdBy: DEFAULT_ACTOR, summary: '项目创建', title: '首页改版项目', description: '重新设计App首页，降低跳出率，提升用户活跃度', status: 'planning', prdVersionIds: ['2-v1'], uiVersionIds: ['3-v1'] }],
    changeRequests: [],
  },
  {
    id: '3', title: '分期乐会员体系搭建',
    description: '搭建完整的会员等级体系，提升用户粘性和复购率',
    status: 'completed',
    members: ['cancanli(李灿灿)', 'kriswu(吴泽平)', 'lilywang(王莉萍)'],
    createdAt: '2024-01-10', updatedAt: '2024-01-20',
    currentVersionId: '3-v1',
    versions: [{ id: '3-v1', version: 1, createdAt: '2024-01-10', createdBy: DEFAULT_ACTOR, summary: '项目创建', title: '分期乐会员体系搭建', description: '搭建完整的会员等级体系，提升用户粘性和复购率', status: 'completed', prdVersionIds: ['3-v1'], uiVersionIds: ['4-v1', '5-v1'] }],
    changeRequests: [],
  },
  {
    id: '4', title: '客服系统优化',
    description: '全面优化客服系统，接入AI能力，提升服务效率和用户满意度',
    status: 'in_progress',
    members: ['cancanli(李灿灿)', 'kriswu(吴泽平)', 'zhangsan(张三)'],
    createdAt: '2024-02-01', updatedAt: '2024-02-25',
    currentVersionId: '4-v1',
    versions: [{ id: '4-v1', version: 1, createdAt: '2024-02-01', createdBy: DEFAULT_ACTOR, summary: '项目创建', title: '客服系统优化', description: '全面优化客服系统，接入AI能力，提升服务效率和用户满意度', status: 'in_progress', prdVersionIds: ['4-v1', '5-v1', '6-v1', '7-v1', '8-v1', '9-v1'], uiVersionIds: ['6-v1', '7-v1', '8-v1', '9-v1'] }],
    changeRequests: [],
  },
  {
    id: '5', title: '触达平台建设',
    description: '搭建统一的用户触达平台，实现精准营销和效果追踪',
    status: 'in_progress',
    members: ['cancanli(李灿灿)', 'lilywang(王莉萍)'],
    createdAt: '2024-02-15', updatedAt: '2024-03-01',
    currentVersionId: '5-v1',
    versions: [{ id: '5-v1', version: 1, createdAt: '2024-02-15', createdBy: DEFAULT_ACTOR, summary: '项目创建', title: '触达平台建设', description: '搭建统一的用户触达平台，实现精准营销和效果追踪', status: 'in_progress', prdVersionIds: ['10-v1', '11-v1', '12-v1'], uiVersionIds: ['10-v1', '11-v1'] }],
    changeRequests: [],
  },
  {
    id: '6', title: '管户工作台',
    description: '构建一站式管户工作台，提升客户管理效率',
    status: 'in_progress',
    members: ['cancanli(李灿灿)', 'kriswu(吴泽平)', 'lilywang(王莉萍)'],
    createdAt: '2024-03-01', updatedAt: '2024-03-18',
    currentVersionId: '6-v1',
    versions: [{ id: '6-v1', version: 1, createdAt: '2024-03-01', createdBy: DEFAULT_ACTOR, summary: '项目创建', title: '管户工作台', description: '构建一站式管户工作台，提升客户管理效率', status: 'in_progress', prdVersionIds: ['13-v1', '14-v1', '15-v1', '16-v1'], uiVersionIds: ['12-v1', '13-v1', '14-v1'] }],
    changeRequests: [],
  },
];

const defaultAINewsList: AINewsItem[] = [
  {
    id: '1',
    title: 'OpenAI发布GPT-5：多模态能力大幅提升',
    originalTitle: 'OpenAI Releases GPT-5: Major Multimodal Improvements',
    summary: 'OpenAI正式发布GPT-5模型，在多模态理解、推理能力和代码生成方面取得显著突破。新模型支持图像、视频、音频的深度理解，并在多个基准测试中超越前代模型。',
    content: '## 核心亮点\n\nOpenAI今日正式发布GPT-5模型，这是继GPT-4之后的又一重大突破。新模型在以下方面取得显著进展：\n\n### 多模态理解\n- 支持图像、视频、音频的深度理解\n- 可以分析复杂场景并生成详细描述\n- 视频理解能力提升3倍\n\n### 推理能力\n- 在数学推理任务上准确率提升40%\n- 支持更长的上下文窗口（200K tokens）\n- 逻辑推理能力接近人类水平\n\n### 代码生成\n- 代码生成准确率提升至95%\n- 支持50+编程语言\n- 可以理解和修复复杂的代码bug',
    source: 'OpenAI Blog',
    sourceUrl: 'https://openai.com/blog/gpt-5',
    category: '大模型',
    publishedAt: '2025-02-05',
    crawledAt: '2025-02-05',
    readCount: 1328,
    isFavorited: false,
    isRead: false,
    isHot: true,
    createdAt: '2025-02-05',
  },
  {
    id: '2',
    title: 'Anthropic Claude 4发布，推理能力超越GPT-4o',
    originalTitle: 'Anthropic Releases Claude 4 with Superior Reasoning',
    summary: 'Anthropic发布新一代Claude 4模型，在推理、数学和编程任务上表现优异。新模型采用Constitutional AI技术，确保输出更加安全可靠。',
    content: '## Claude 4 核心特性\n\nAnthropic今日发布Claude 4，这是该公司迄今为止最强大的AI模型。\n\n### 推理能力\n- 在MMLU基准测试中得分92.3%\n- 数学推理准确率提升50%\n- 支持复杂的多步推理任务\n\n### 安全性\n- 采用Constitutional AI技术\n- 拒绝有害内容生成\n- 更好的价值观对齐\n\n### 应用场景\n- 科研论文分析\n- 法律文档审查\n- 复杂问题求解',
    source: 'Anthropic Blog',
    sourceUrl: 'https://anthropic.com/news/claude-4',
    category: '大模型',
    publishedAt: '2025-02-04',
    crawledAt: '2025-02-04',
    readCount: 856,
    isFavorited: false,
    isRead: false,
    isHot: true,
    createdAt: '2025-02-04',
  },
  {
    id: '3',
    title: 'Midjourney V7发布：图像生成质量再创新高',
    originalTitle: 'Midjourney V7: Next-Level Image Generation',
    summary: 'Midjourney发布V7版本，图像生成质量大幅提升，支持更精确的文本理解和风格控制。新版本还增加了视频生成功能。',
    content: '## Midjourney V7 新特性\n\n### 图像质量提升\n- 分辨率提升至8K\n- 细节表现更加真实\n- 光影效果更自然\n\n### 文本理解\n- 支持更复杂的提示词\n- 更准确的风格控制\n- 支持中文提示词\n\n### 视频生成\n- 支持生成5秒短视频\n- 帧率可达60fps\n- 支持镜头运动控制',
    source: 'Midjourney Blog',
    sourceUrl: 'https://midjourney.com/blog/v7',
    category: 'AI产品',
    publishedAt: '2025-02-03',
    crawledAt: '2025-02-03',
    readCount: 642,
    isFavorited: false,
    isRead: false,
    isHot: true,
    createdAt: '2025-02-03',
  },
  {
    id: '4',
    title: 'Meta发布Llama 4：开源大模型新标杆',
    originalTitle: 'Meta Releases Llama 4: Open Source LLM Benchmark',
    summary: 'Meta发布Llama 4开源大模型，性能接近GPT-4，支持商业使用。这是迄今为止最强大的开源语言模型。',
    content: '## Llama 4 特点\n\n### 性能表现\n- 参数规模：700B\n- 性能接近GPT-4\n- 支持100+语言\n\n### 开源协议\n- 完全开源\n- 支持商业使用\n- 社区驱动开发\n\n### 应用场景\n- 企业级应用\n- 研究项目\n- 教育培训',
    source: 'Meta AI Blog',
    sourceUrl: 'https://ai.meta.com/blog/llama-4',
    category: '开源项目',
    publishedAt: '2025-02-02',
    crawledAt: '2025-02-02',
    readCount: 523,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-02-02',
  },
  {
    id: '5',
    title: 'Google DeepMind发表AlphaFold 3论文',
    originalTitle: 'DeepMind Publishes AlphaFold 3 Paper',
    summary: 'Google DeepMind在Nature发表AlphaFold 3论文，蛋白质结构预测准确率再次提升，可预测蛋白质与DNA、RNA的相互作用。',
    content: '## AlphaFold 3 突破\n\n### 预测能力\n- 蛋白质结构预测准确率98%\n- 支持蛋白质-DNA相互作用预测\n- 支持蛋白质-RNA相互作用预测\n\n### 科研影响\n- 加速药物研发\n- 推动生物学研究\n- 开放API供研究使用\n\n### 应用前景\n- 新药开发\n- 疾病治疗\n- 生物工程',
    source: 'Nature',
    sourceUrl: 'https://nature.com/articles/alphafold3',
    category: '研究论文',
    publishedAt: '2025-02-01',
    crawledAt: '2025-02-01',
    readCount: 412,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-02-01',
  },
  {
    id: '6',
    title: 'OpenAI获得100亿美元融资，估值达到1000亿美元',
    originalTitle: 'OpenAI Raises $10B at $100B Valuation',
    summary: 'OpenAI完成新一轮100亿美元融资，估值达到1000亿美元。本轮融资由微软领投，将用于AI基础设施建设和模型研发。',
    content: '## 融资详情\n\n### 融资规模\n- 融资金额：100亿美元\n- 估值：1000亿美元\n- 领投方：微软\n\n### 资金用途\n- AI基础设施建设\n- 模型研发\n- 团队扩张\n\n### 市场影响\n- 巩固行业领先地位\n- 加速AGI研发\n- 推动AI商业化',
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/openai-funding',
    category: '行业融资',
    publishedAt: '2025-01-31',
    crawledAt: '2025-01-31',
    readCount: 789,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-31',
  },
  {
    id: '7',
    title: '欧盟通过AI法案，全球首部AI监管法律',
    originalTitle: 'EU Passes AI Act: First Comprehensive AI Regulation',
    summary: '欧盟正式通过AI法案，这是全球首部全面的AI监管法律。法案对高风险AI应用进行严格监管，违规企业将面临巨额罚款。',
    content: '## AI法案要点\n\n### 监管范围\n- 高风险AI应用\n- 生物识别系统\n- 关键基础设施\n\n### 合规要求\n- 透明度要求\n- 数据质量标准\n- 人工监督机制\n\n### 处罚措施\n- 最高罚款3000万欧元\n- 或全球营收的6%\n- 严重违规可能被禁止运营',
    source: 'EU Official',
    sourceUrl: 'https://ec.europa.eu/ai-act',
    category: '政策法规',
    publishedAt: '2025-01-30',
    crawledAt: '2025-01-30',
    readCount: 345,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-30',
  },
  {
    id: '8',
    title: 'Cursor AI编辑器用户突破100万',
    originalTitle: 'Cursor AI Editor Surpasses 1 Million Users',
    summary: 'AI代码编辑器Cursor用户数突破100万，成为最受欢迎的AI编程工具。Cursor集成了GPT-4，可以理解代码上下文并提供智能建议。',
    content: '## Cursor 成功因素\n\n### 核心功能\n- AI代码补全\n- 智能重构\n- Bug修复建议\n\n### 用户体验\n- 流畅的编辑体验\n- 快速响应\n- 支持多种编程语言\n\n### 商业模式\n- 免费版\n- Pro版：$20/月\n- 企业版：定制价格',
    source: 'Product Hunt',
    sourceUrl: 'https://producthunt.com/cursor',
    category: 'AI工具',
    publishedAt: '2025-01-29',
    crawledAt: '2025-01-29',
    readCount: 567,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-29',
  },
  {
    id: '9',
    title: 'LangChain发布v0.2：简化AI应用开发',
    originalTitle: 'LangChain v0.2: Simplified AI App Development',
    summary: 'LangChain发布v0.2版本，新增多个实用功能，简化AI应用开发流程。新版本支持更多LLM提供商，优化了链式调用性能。',
    content: '## LangChain v0.2 新特性\n\n### 新增功能\n- 支持更多LLM提供商\n- 优化链式调用性能\n- 新增向量数据库集成\n\n### 开发体验\n- 更简洁的API\n- 更好的文档\n- 更多示例代码\n\n### 社区生态\n- 活跃的开发者社区\n- 丰富的插件生态\n- 定期的技术分享',
    source: 'LangChain Blog',
    sourceUrl: 'https://blog.langchain.dev/v0.2',
    category: '开源项目',
    publishedAt: '2025-01-28',
    crawledAt: '2025-01-28',
    readCount: 234,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-28',
  },
  {
    id: '10',
    title: 'Stability AI发布Stable Diffusion 3.5',
    originalTitle: 'Stability AI Releases Stable Diffusion 3.5',
    summary: 'Stability AI发布Stable Diffusion 3.5，图像生成质量大幅提升，支持更高分辨率和更精确的文本控制。',
    content: '## SD 3.5 改进\n\n### 图像质量\n- 支持4K分辨率\n- 细节更丰富\n- 色彩更准确\n\n### 文本理解\n- 更准确的提示词理解\n- 支持复杂场景描述\n- 改进的文字渲染\n\n### 性能优化\n- 生成速度提升30%\n- 显存占用降低20%\n- 支持批量生成',
    source: 'Stability AI Blog',
    sourceUrl: 'https://stability.ai/blog/sd-3.5',
    category: 'AI产品',
    publishedAt: '2025-01-27',
    crawledAt: '2025-01-27',
    readCount: 456,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-27',
  },
  {
    id: '11',
    title: '斯坦福发布Alpaca：基于Llama的指令微调模型',
    originalTitle: 'Stanford Releases Alpaca: Instruction-Tuned Llama',
    summary: '斯坦福大学发布Alpaca模型，这是基于Meta Llama进行指令微调的开源模型。Alpaca在多个任务上表现优异，训练成本仅需600美元。',
    content: '## Alpaca 特点\n\n### 模型性能\n- 基于Llama 7B\n- 指令跟随能力强\n- 性能接近GPT-3.5\n\n### 训练方法\n- 使用Self-Instruct方法\n- 训练数据：52K指令\n- 训练成本：$600\n\n### 开源贡献\n- 完全开源\n- 详细的训练文档\n- 活跃的社区支持',
    source: 'Stanford CRFM',
    sourceUrl: 'https://crfm.stanford.edu/alpaca',
    category: '研究论文',
    publishedAt: '2025-01-26',
    crawledAt: '2025-01-26',
    readCount: 312,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-26',
  },
  {
    id: '12',
    title: 'Hugging Face推出Transformers 5.0',
    originalTitle: 'Hugging Face Launches Transformers 5.0',
    summary: 'Hugging Face发布Transformers 5.0，新增多个预训练模型，优化了推理性能，支持更多硬件加速。',
    content: '## Transformers 5.0 亮点\n\n### 新增模型\n- 支持最新的LLM\n- 新增视觉模型\n- 多模态模型支持\n\n### 性能优化\n- 推理速度提升2倍\n- 显存占用降低30%\n- 支持量化加速\n\n### 生态系统\n- 10万+模型\n- 活跃的社区\n- 丰富的教程',
    source: 'Hugging Face Blog',
    sourceUrl: 'https://huggingface.co/blog/transformers-5',
    category: '开源项目',
    publishedAt: '2025-01-25',
    crawledAt: '2025-01-25',
    readCount: 289,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-25',
  },
  {
    id: '13',
    title: 'GitHub Copilot X发布：AI编程助手全面升级',
    originalTitle: 'GitHub Copilot X: Next-Gen AI Coding Assistant',
    summary: 'GitHub发布Copilot X，集成GPT-4，支持聊天式编程、PR审查、文档生成等功能。这是AI编程助手的重大升级。',
    content: '## Copilot X 新功能\n\n### 聊天式编程\n- 自然语言交互\n- 代码解释\n- 问题解答\n\n### PR审查\n- 自动代码审查\n- 安全漏洞检测\n- 最佳实践建议\n\n### 文档生成\n- 自动生成文档\n- API文档\n- 使用示例',
    source: 'GitHub Blog',
    sourceUrl: 'https://github.blog/copilot-x',
    category: 'AI工具',
    publishedAt: '2025-01-24',
    crawledAt: '2025-01-24',
    readCount: 678,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-24',
  },
  {
    id: '14',
    title: 'MIT发布大规模多模态数据集MM-1B',
    originalTitle: 'MIT Releases MM-1B: Large-Scale Multimodal Dataset',
    summary: 'MIT发布MM-1B多模态数据集，包含10亿对图文数据，是目前最大的开源多模态数据集，将推动多模态AI研究。',
    content: '## MM-1B 数据集\n\n### 数据规模\n- 10亿图文对\n- 覆盖100+语言\n- 多样化的场景\n\n### 数据质量\n- 人工标注\n- 质量控制\n- 去重处理\n\n### 应用价值\n- 多模态模型训练\n- 视觉语言研究\n- 跨模态检索',
    source: 'MIT CSAIL',
    sourceUrl: 'https://csail.mit.edu/mm-1b',
    category: '研究论文',
    publishedAt: '2025-01-23',
    crawledAt: '2025-01-23',
    readCount: 198,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-23',
  },
  {
    id: '15',
    title: 'Anthropic获得40亿美元投资，Google领投',
    originalTitle: 'Anthropic Secures $4B Investment Led by Google',
    summary: 'Anthropic获得Google领投的40亿美元投资，这是AI领域最大的单笔投资之一。资金将用于开发更安全、更可靠的AI系统。',
    content: '## 投资详情\n\n### 融资信息\n- 投资金额：40亿美元\n- 领投方：Google\n- 估值：250亿美元\n\n### 战略合作\n- 使用Google Cloud\n- 技术合作\n- 产品集成\n\n### 发展规划\n- 开发更强大的模型\n- 提升安全性\n- 扩大团队规模',
    source: 'The Information',
    sourceUrl: 'https://theinformation.com/anthropic-funding',
    category: '行业融资',
    publishedAt: '2025-01-22',
    crawledAt: '2025-01-22',
    readCount: 445,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-22',
  },
  {
    id: '16',
    title: 'Prompt工程完全指南：提升AI输出质量的10个技巧',
    originalTitle: 'Complete Guide to Prompt Engineering: 10 Tips',
    summary: '本文总结了Prompt工程的10个实用技巧，帮助开发者更好地与AI模型交互，提升输出质量和准确性。',
    content: '## Prompt工程技巧\n\n### 基础技巧\n1. 明确指令\n2. 提供上下文\n3. 使用示例\n\n### 高级技巧\n4. 角色扮演\n5. 思维链\n6. 自我一致性\n\n### 优化技巧\n7. 迭代优化\n8. A/B测试\n9. 模板化\n10. 评估指标',
    source: 'Towards Data Science',
    sourceUrl: 'https://towardsdatascience.com/prompt-engineering',
    category: '技术教程',
    publishedAt: '2025-01-21',
    crawledAt: '2025-01-21',
    readCount: 523,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-21',
  },
  {
    id: '17',
    title: '中国发布《生成式人工智能服务管理暂行办法》',
    originalTitle: 'China Issues Interim Measures for Generative AI Services',
    summary: '中国网信办发布《生成式人工智能服务管理暂行办法》，对生成式AI服务提出明确监管要求，强调内容安全和数据保护。',
    content: '## 管理办法要点\n\n### 监管要求\n- 内容安全审核\n- 数据来源合法\n- 算法透明度\n\n### 服务规范\n- 用户协议\n- 投诉机制\n- 应急响应\n\n### 法律责任\n- 违规处罚\n- 整改要求\n- 行政处分',
    source: 'CAC',
    sourceUrl: 'http://www.cac.gov.cn/ai-measures',
    category: '政策法规',
    publishedAt: '2025-01-20',
    crawledAt: '2025-01-20',
    readCount: 267,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-20',
  },
  {
    id: '18',
    title: 'LangSmith：LangChain推出AI应用调试平台',
    originalTitle: 'LangSmith: LangChain Launches AI App Debugging Platform',
    summary: 'LangChain推出LangSmith平台，专门用于AI应用的调试、测试和监控。平台提供可视化界面，帮助开发者快速定位问题。',
    content: '## LangSmith 功能\n\n### 调试工具\n- 链式调用可视化\n- 中间结果查看\n- 性能分析\n\n### 测试功能\n- 自动化测试\n- 回归测试\n- A/B测试\n\n### 监控能力\n- 实时监控\n- 错误追踪\n- 性能指标',
    source: 'LangChain Blog',
    sourceUrl: 'https://blog.langchain.dev/langsmith',
    category: 'AI工具',
    publishedAt: '2025-01-19',
    crawledAt: '2025-01-19',
    readCount: 334,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-19',
  },
  {
    id: '19',
    title: 'Sora正式开放：OpenAI视频生成模型面向公众',
    originalTitle: 'Sora Now Available: OpenAI Video Generation Goes Public',
    summary: 'OpenAI正式向公众开放Sora视频生成模型，用户可通过ChatGPT Plus订阅使用，支持生成最长60秒的高质量视频。',
    content: '## Sora 开放详情\n\n### 功能特性\n- 支持60秒视频生成\n- 1080p分辨率\n- 多种风格选择\n\n### 使用方式\n- ChatGPT Plus用户可用\n- API即将开放\n- 企业版定制方案',
    source: 'OpenAI Blog',
    sourceUrl: 'https://openai.com/sora',
    category: 'AI产品',
    publishedAt: '2025-01-18',
    crawledAt: '2025-01-18',
    readCount: 1892,
    isFavorited: false,
    isRead: false,
    isHot: true,
    createdAt: '2025-01-18',
  },
  {
    id: '20',
    title: 'Apple发布Apple Intelligence 2.0：端侧AI全面升级',
    originalTitle: 'Apple Releases Apple Intelligence 2.0',
    summary: 'Apple发布Apple Intelligence 2.0，在iPhone、iPad和Mac上实现更强大的端侧AI能力，包括高级写作工具和图像生成。',
    content: '## Apple Intelligence 2.0\n\n### 新增能力\n- 高级写作助手\n- 端侧图像生成\n- 智能摘要增强\n\n### 隐私保护\n- 全部端侧处理\n- 无需云端上传\n- 差分隐私技术',
    source: 'Apple Newsroom',
    sourceUrl: 'https://apple.com/newsroom/ai-2',
    category: 'AI产品',
    publishedAt: '2025-01-17',
    crawledAt: '2025-01-17',
    readCount: 723,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-17',
  },
  {
    id: '21',
    title: 'DeepSeek-V3发布：国产大模型性能比肩GPT-4',
    originalTitle: 'DeepSeek-V3: Chinese LLM Matches GPT-4 Performance',
    summary: 'DeepSeek发布V3版本，在多项基准测试中达到GPT-4水平，采用MoE架构，推理成本大幅降低。',
    content: '## DeepSeek-V3 亮点\n\n### 性能表现\n- MMLU得分89.5%\n- 代码生成能力突出\n- 中文理解领先\n\n### 技术架构\n- MoE混合专家架构\n- 推理成本降低80%\n- 支持128K上下文',
    source: 'DeepSeek Blog',
    sourceUrl: 'https://deepseek.com/blog/v3',
    category: '大模型',
    publishedAt: '2025-01-16',
    crawledAt: '2025-01-16',
    readCount: 1456,
    isFavorited: false,
    isRead: false,
    isHot: true,
    createdAt: '2025-01-16',
  },
  {
    id: '22',
    title: 'Figma推出AI设计助手：自动生成UI组件',
    originalTitle: 'Figma Launches AI Design Assistant',
    summary: 'Figma推出内置AI设计助手，可根据文字描述自动生成UI组件和页面布局，大幅提升设计效率。',
    content: '## Figma AI 功能\n\n### 自动生成\n- 文字描述生成UI\n- 智能布局建议\n- 组件变体生成\n\n### 设计优化\n- 自动对齐\n- 配色建议\n- 响应式适配',
    source: 'Figma Blog',
    sourceUrl: 'https://figma.com/blog/ai-assistant',
    category: 'AI工具',
    publishedAt: '2025-01-15',
    crawledAt: '2025-01-15',
    readCount: 634,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-15',
  },
  {
    id: '23',
    title: 'Nvidia发布Blackwell Ultra GPU：AI训练性能翻倍',
    originalTitle: 'Nvidia Launches Blackwell Ultra GPU',
    summary: 'Nvidia发布新一代Blackwell Ultra GPU，AI训练性能较上代提升2倍，功耗降低30%，已获多家云厂商订单。',
    content: '## Blackwell Ultra\n\n### 性能提升\n- AI训练性能2倍提升\n- 推理吞吐量3倍\n- 功耗降低30%\n\n### 市场反应\n- AWS/Azure/GCP已下单\n- 预计Q2量产\n- 售价$40,000起',
    source: 'Nvidia Blog',
    sourceUrl: 'https://nvidia.com/blackwell-ultra',
    category: 'AI产品',
    publishedAt: '2025-01-14',
    crawledAt: '2025-01-14',
    readCount: 567,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-14',
  },
  {
    id: '24',
    title: '谷歌Gemini 2.0 Flash发布：速度与质量兼得',
    originalTitle: 'Google Releases Gemini 2.0 Flash',
    summary: 'Google发布Gemini 2.0 Flash模型，在保持高质量输出的同时将推理速度提升5倍，适合实时应用场景。',
    content: '## Gemini 2.0 Flash\n\n### 速度优势\n- 推理速度提升5倍\n- 首token延迟<100ms\n- 支持流式输出\n\n### 质量保证\n- 接近Pro版质量\n- 多模态支持\n- 200K上下文窗口',
    source: 'Google AI Blog',
    sourceUrl: 'https://blog.google/gemini-flash',
    category: '大模型',
    publishedAt: '2025-01-13',
    crawledAt: '2025-01-13',
    readCount: 489,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-13',
  },
  {
    id: '25',
    title: 'Perplexity AI估值突破90亿美元',
    originalTitle: 'Perplexity AI Valuation Surpasses $9B',
    summary: 'AI搜索引擎Perplexity完成新一轮融资，估值突破90亿美元，月活用户超1500万，正在重新定义搜索体验。',
    content: '## Perplexity 发展\n\n### 融资情况\n- 估值90亿美元\n- 月活1500万\n- 年收入超1亿美元\n\n### 产品优势\n- AI原生搜索\n- 实时信息获取\n- 引用来源透明',
    source: 'Bloomberg',
    sourceUrl: 'https://bloomberg.com/perplexity',
    category: '行业融资',
    publishedAt: '2025-01-12',
    crawledAt: '2025-01-12',
    readCount: 378,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-12',
  },
  {
    id: '26',
    title: 'Anthropic发布Model Spec：AI安全新标准',
    originalTitle: 'Anthropic Publishes Model Spec: New AI Safety Standard',
    summary: 'Anthropic发布Model Spec文档，详细定义AI模型行为规范，为行业提供安全对齐的参考标准。',
    content: '## Model Spec 要点\n\n### 行为规范\n- 诚实性原则\n- 无害性保证\n- 有用性平衡\n\n### 行业影响\n- 安全标准参考\n- 开源社区采纳\n- 监管机构关注',
    source: 'Anthropic Blog',
    sourceUrl: 'https://anthropic.com/model-spec',
    category: '政策法规',
    publishedAt: '2025-01-11',
    crawledAt: '2025-01-11',
    readCount: 245,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-11',
  },
  {
    id: '27',
    title: 'Mistral发布Mixtral 8x22B：开源MoE模型新突破',
    originalTitle: 'Mistral Releases Mixtral 8x22B',
    summary: 'Mistral发布Mixtral 8x22B开源模型，采用MoE架构，在多项基准测试中超越Llama 3 70B，推理效率极高。',
    content: '## Mixtral 8x22B\n\n### 模型架构\n- 8个专家网络\n- 每次激活2个专家\n- 总参数176B\n\n### 性能表现\n- 超越Llama 3 70B\n- 推理成本更低\n- 支持多语言',
    source: 'Mistral AI Blog',
    sourceUrl: 'https://mistral.ai/mixtral-8x22b',
    category: '开源项目',
    publishedAt: '2025-01-10',
    crawledAt: '2025-01-10',
    readCount: 312,
    isFavorited: false,
    isRead: false,
    isHot: false,
    createdAt: '2025-01-10',
  },
];

const mockUserInfo: UserInfo = {
  name: 'cancanli(李灿灿)',
  avatar: '/assets/avatar.svg',
  weeklyUsageTime: '5h 24min',
  tokenUsage: 15680,
  rank: 5,
};

const buildChangeRequest = (input: {
  entityType: ChangeRequest['entityType'];
  entityId: string;
  actor: string;
  changeRequest?: ChangeRequestInput;
}): ChangeRequest => {
  const now = getTodayString();
  const reason = input.changeRequest?.reason || '常规更新';
  const impact = input.changeRequest?.impact || '未标注';
  const relatedTasks = input.changeRequest?.relatedTasks || [];
  const approvalStatus: ApprovalStatus = input.changeRequest?.approvalStatus || 'approved';
  return {
    id: `${input.entityType}-${input.entityId}-${Date.now()}`,
    entityType: input.entityType,
    entityId: input.entityId,
    createdBy: input.actor,
    createdAt: now,
    reason,
    impact,
    approvalStatus,
    relatedTasks,
  };
};

const buildPRDVersion = (
  base: Pick<PRDItem, 'title' | 'description' | 'content' | 'status' | 'projectId'>,
  version: number,
  createdBy: string,
  summary: string,
  changeRequestId?: string,
  createdAt?: string
): PRDVersion => ({
  id: `${Date.now()}-prd-v${version}`,
  version,
  createdAt: createdAt || getTodayString(),
  createdBy,
  changeRequestId,
  summary,
  title: base.title,
  description: base.description,
  content: base.content,
  status: base.status,
  projectId: base.projectId,
});

const buildUIDesignVersion = (
  base: Pick<UIDesignItem, 'title' | 'description' | 'status' | 'tool' | 'prdId' | 'prdTitle' | 'projectId' | 'thumbnail' | 'htmlContent'> & { componentTree?: string },
  version: number,
  createdBy: string,
  summary: string,
  changeRequestId?: string,
  createdAt?: string
): UIDesignVersion => ({
  id: `${Date.now()}-ui-v${version}`,
  version,
  createdAt: createdAt || getTodayString(),
  createdBy,
  changeRequestId,
  summary,
  title: base.title,
  description: base.description,
  prdId: base.prdId,
  prdTitle: base.prdTitle,
  projectId: base.projectId,
  status: base.status,
  tool: base.tool,
  thumbnail: base.thumbnail,
  componentTree: base.componentTree,
  htmlContent: base.htmlContent,
});

const buildProjectVersion = (
  base: Pick<ProjectItem, 'title' | 'description' | 'status'> & { prdVersionIds: string[]; uiVersionIds: string[] },
  version: number,
  createdBy: string,
  summary: string,
  changeRequestId?: string,
  createdAt?: string
): ProjectVersion => ({
  id: `${Date.now()}-project-v${version}`,
  version,
  createdAt: createdAt || getTodayString(),
  createdBy,
  changeRequestId,
  summary,
  title: base.title,
  description: base.description,
  status: base.status,
  prdVersionIds: base.prdVersionIds,
  uiVersionIds: base.uiVersionIds,
});

const normalizePRDItem = (item: Partial<PRDItem>): PRDItem => {
  const fallbackId = item.id || Date.now().toString();
  const createdAt = item.createdAt || getTodayString();
  const versionId = item.currentVersionId || `${fallbackId}-v1`;
  const versions = item.versions && item.versions.length
    ? item.versions
    : [
        {
          id: versionId,
          version: 1,
          createdAt,
          createdBy: DEFAULT_ACTOR,
          summary: '初始版本',
          title: item.title || '未命名需求',
          description: item.description || '',
          content: item.content || '',
          status: item.status || 'in_progress',
          projectId: item.projectId,
        },
      ];

  return {
    id: fallbackId,
    title: item.title || '未命名需求',
    description: item.description || '',
    content: item.content || '',
    status: item.status || 'in_progress',
    projectId: item.projectId,
    createdAt,
    updatedAt: item.updatedAt,
    currentVersionId: item.currentVersionId || versions[versions.length - 1].id,
    versions,
    governanceStatus: item.governanceStatus || DEFAULT_GOVERNANCE_STATUS,
    frozenAt: item.frozenAt,
    changeRequests: item.changeRequests || [],
  };
};

const normalizeUIDesignItem = (item: Partial<UIDesignItem>): UIDesignItem => {
  const fallbackId = item.id || Date.now().toString();
  const createdAt = item.createdAt || getTodayString();
  const versionId = item.currentVersionId || `${fallbackId}-v1`;
  const versions = item.versions && item.versions.length
    ? item.versions
    : [
        {
          id: versionId,
          version: 1,
          createdAt,
          createdBy: DEFAULT_ACTOR,
          summary: '初始版本',
          title: item.title || '未命名设计',
          description: item.description || '',
          prdId: item.prdId,
          prdTitle: item.prdTitle,
          projectId: item.projectId,
          status: item.status || 'in_progress',
          tool: item.tool || 'Figma',
          thumbnail: item.thumbnail,
          componentTree: item.versions?.[0]?.componentTree,
        },
      ];

  return {
    id: fallbackId,
    title: item.title || '未命名设计',
    description: item.description || '',
    prdId: item.prdId,
    prdTitle: item.prdTitle,
    projectId: item.projectId,
    status: item.status || 'in_progress',
    tool: item.tool || 'Figma',
    thumbnail: item.thumbnail,
    createdAt,
    updatedAt: item.updatedAt,
    currentVersionId: item.currentVersionId || versions[versions.length - 1].id,
    versions,
    governanceStatus: item.governanceStatus || DEFAULT_GOVERNANCE_STATUS,
    frozenAt: item.frozenAt,
    changeRequests: item.changeRequests || [],
  };
};

const normalizeProjectItem = (item: Partial<ProjectItem>): ProjectItem => {
  const fallbackId = item.id || Date.now().toString();
  const createdAt = item.createdAt || getTodayString();
  const versionId = item.currentVersionId || `${fallbackId}-v1`;
  const versions = item.versions && item.versions.length
    ? item.versions
    : [
        {
          id: versionId,
          version: 1,
          createdAt,
          createdBy: DEFAULT_ACTOR,
          summary: '项目创建',
          title: item.title || '未命名项目',
          description: item.description || '',
          status: item.status || 'planning',
          prdVersionIds: [],
          uiVersionIds: [],
        },
      ];

  return {
    id: fallbackId,
    title: item.title || '未命名项目',
    description: item.description || '',
    status: item.status || 'planning',
    members: item.members,
    createdAt,
    updatedAt: item.updatedAt,
    currentVersionId: item.currentVersionId || versions[versions.length - 1].id,
    versions,
    changeRequests: item.changeRequests || [],
  };
};

// 从 localStorage 加载数据
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return defaultValue;
}

// 保存数据到 localStorage
function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

export function loadDraftFromStorage<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`Error loading draft ${key} from localStorage:`, error);
    return null;
  }
}

export function saveDraftToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving draft ${key} to localStorage:`, error);
  }
}

export function clearDraftFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing draft ${key} from localStorage:`, error);
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  // 从 localStorage 初始化数据
  const [prdList, setPrdList] = useState<PRDItem[]>(() => {
    const stored = loadFromStorage<Partial<PRDItem>[]>(STORAGE_KEYS.PRD_LIST, defaultPRDList);
    return stored.map(item => normalizePRDItem(item));
  });
  const [uiDesignList, setUIDesignList] = useState<UIDesignItem[]>(() => {
    const stored = loadFromStorage<Partial<UIDesignItem>[]>(STORAGE_KEYS.UI_DESIGN_LIST, defaultUIDesignList);
    return stored.map(item => normalizeUIDesignItem(item));
  });
  const [projectList, setProjectList] = useState<ProjectItem[]>(() => {
    const stored = loadFromStorage<Partial<ProjectItem>[]>(STORAGE_KEYS.PROJECT_LIST, defaultProjectList);
    return stored.map(item => normalizeProjectItem(item));
  });
  const [aiNewsList, setAINewsList] = useState<AINewsItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.AI_NEWS_LIST, defaultAINewsList)
  );
  const [aiNewsFavorites, setAINewsFavorites] = useState<string[]>(() =>
    loadFromStorage(STORAGE_KEYS.AI_NEWS_FAVORITES, [])
  );
  const [userInfo] = useState<UserInfo>(mockUserInfo);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 当 prdList 变化时保存到 localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PRD_LIST, prdList);
  }, [prdList]);

  // 当 uiDesignList 变化时保存到 localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.UI_DESIGN_LIST, uiDesignList);
  }, [uiDesignList]);

  // 当 projectList 变化时保存到 localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PROJECT_LIST, projectList);
  }, [projectList]);

  // 当 aiNewsList 变化时保存到 localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.AI_NEWS_LIST, aiNewsList);
  }, [aiNewsList]);

  // 当 aiNewsFavorites 变化时保存到 localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.AI_NEWS_FAVORITES, aiNewsFavorites);
  }, [aiNewsFavorites]);

  const appendProjectVersion = useCallback((
    projectId: string,
    summary: string,
    changeRequestId?: string,
    overrides?: { prdVersionIds?: string[]; uiVersionIds?: string[] }
  ) => {
    const actor = userInfo.name || DEFAULT_ACTOR;
    setProjectList(prev => prev.map(project => {
      if (project.id !== projectId) return project;
      const prdVersionIds = overrides?.prdVersionIds
        || prdList.filter(prd => prd.projectId === projectId).map(prd => prd.currentVersionId);
      const uiVersionIds = overrides?.uiVersionIds
        || uiDesignList.filter(ui => ui.projectId === projectId).map(ui => ui.currentVersionId);
      const versionNumber = project.versions.length + 1;
      const nextVersion = buildProjectVersion(
        {
          title: project.title,
          description: project.description,
          status: project.status,
          prdVersionIds,
          uiVersionIds,
        },
        versionNumber,
        actor,
        summary,
        changeRequestId
      );
      return {
        ...project,
        currentVersionId: nextVersion.id,
        versions: [...project.versions, nextVersion],
        updatedAt: getTodayString(),
      };
    }));
  }, [prdList, uiDesignList, userInfo.name]);

  const addPRD = useCallback((prd: PRDInput) => {
    const actor = userInfo.name || DEFAULT_ACTOR;
    const id = Date.now().toString();
    const createdAt = getTodayString();
    const version = buildPRDVersion(
      {
        title: prd.title,
        description: prd.description,
        content: prd.content,
        status: prd.status,
        projectId: prd.projectId,
      },
      1,
      actor,
      '初始版本',
      undefined,
      createdAt
    );
    const newPRD: PRDItem = {
      ...prd,
      id,
      createdAt,
      currentVersionId: version.id,
      versions: [version],
      governanceStatus: DEFAULT_GOVERNANCE_STATUS,
      changeRequests: [],
    };
    setPrdList(prev => [newPRD, ...prev]);
    if (prd.projectId) {
      const prdVersionIds = [...prdList.filter(item => item.projectId === prd.projectId).map(item => item.currentVersionId), version.id];
      appendProjectVersion(prd.projectId, '新增需求版本', undefined, { prdVersionIds });
    }
  }, [appendProjectVersion, prdList, userInfo.name]);

  const updatePRD = useCallback((id: string, prd: Partial<PRDItem>) => {
    setPrdList(prev => prev.map(item =>
      item.id === id ? { ...item, ...prd, updatedAt: getTodayString() } : item
    ));
  }, []);

  const createPRDVersion = useCallback((
    id: string,
    next: Pick<PRDItem, 'title' | 'description' | 'content' | 'status' | 'projectId'> & { requirementName?: string; priority?: PRDItem['priority']; source?: string },
    options?: { changeRequest?: ChangeRequestInput; summary?: string }
  ) => {
    const actor = userInfo.name || DEFAULT_ACTOR;
    const changeRequest = buildChangeRequest({
      entityType: 'prd',
      entityId: id,
      actor,
      changeRequest: options?.changeRequest,
    });
    let nextVersionId = '';
    setPrdList(prev => prev.map(item => {
      if (item.id !== id) return item;
      const versionNumber = item.versions.length + 1;
      const summary = options?.summary || changeRequest.reason;
      const version = buildPRDVersion(
        {
          title: next.title,
          description: next.description,
          content: next.content,
          status: next.status,
          projectId: next.projectId,
        },
        versionNumber,
        actor,
        summary,
        changeRequest.id
      );
      nextVersionId = version.id;
      return {
        ...item,
        ...next,
        updatedAt: getTodayString(),
        currentVersionId: version.id,
        versions: [...item.versions, version],
        changeRequests: [...item.changeRequests, changeRequest],
      };
    }));
    if (next.projectId) {
      const prdVersionIds = prdList
        .filter(item => item.projectId === next.projectId && item.id !== id)
        .map(item => item.currentVersionId)
        .concat(nextVersionId)
        .filter(Boolean);
      appendProjectVersion(
        next.projectId,
        `需求版本更新：${options?.summary || changeRequest.reason}`,
        changeRequest.id,
        { prdVersionIds }
      );
    }
  }, [appendProjectVersion, prdList, userInfo.name]);

  const setPRDGovernanceStatus = useCallback((id: string, status: GovernanceStatus) => {
    setPrdList(prev => prev.map(item =>
      item.id === id
        ? { ...item, governanceStatus: status, frozenAt: status === 'frozen' ? getTodayString() : undefined }
        : item
    ));
  }, []);

  const deletePRD = useCallback((id: string) => {
    setPrdList(prev => prev.filter(item => item.id !== id));
  }, []);

  const addUIDesign = useCallback((design: UIDesignInput) => {
    const actor = userInfo.name || DEFAULT_ACTOR;
    const id = Date.now().toString();
    const createdAt = getTodayString();
    const version = buildUIDesignVersion(
      {
        title: design.title,
        description: design.description,
        status: design.status,
        tool: design.tool,
        prdId: design.prdId,
        prdTitle: design.prdTitle,
        projectId: design.projectId,
        thumbnail: design.thumbnail,
      },
      1,
      actor,
      '初始版本',
      undefined,
      createdAt
    );
    const newDesign: UIDesignItem = {
      ...design,
      id,
      createdAt,
      currentVersionId: version.id,
      versions: [version],
      governanceStatus: DEFAULT_GOVERNANCE_STATUS,
      changeRequests: [],
    };
    setUIDesignList(prev => [newDesign, ...prev]);
    if (design.projectId) {
      const uiVersionIds = [...uiDesignList.filter(item => item.projectId === design.projectId).map(item => item.currentVersionId), version.id];
      appendProjectVersion(design.projectId, '新增设计版本', undefined, { uiVersionIds });
    }
  }, [appendProjectVersion, uiDesignList, userInfo.name]);

  const updateUIDesign = useCallback((id: string, design: Partial<UIDesignItem>) => {
    setUIDesignList(prev => prev.map(item =>
      item.id === id ? { ...item, ...design, updatedAt: getTodayString() } : item
    ));
  }, []);

  const createUIDesignVersion = useCallback((
    id: string,
    next: Pick<UIDesignItem, 'title' | 'description' | 'status' | 'tool' | 'prdId' | 'prdTitle' | 'projectId' | 'thumbnail'> & { componentTree?: string },
    options?: { changeRequest?: ChangeRequestInput; summary?: string }
  ) => {
    const actor = userInfo.name || DEFAULT_ACTOR;
    const changeRequest = buildChangeRequest({
      entityType: 'ui',
      entityId: id,
      actor,
      changeRequest: options?.changeRequest,
    });
    let nextVersionId = '';
    setUIDesignList(prev => prev.map(item => {
      if (item.id !== id) return item;
      const versionNumber = item.versions.length + 1;
      const summary = options?.summary || changeRequest.reason;
      const version = buildUIDesignVersion(
        {
          title: next.title,
          description: next.description,
          status: next.status,
          tool: next.tool,
          prdId: next.prdId,
          prdTitle: next.prdTitle,
          projectId: next.projectId,
          thumbnail: next.thumbnail,
          componentTree: next.componentTree,
        },
        versionNumber,
        actor,
        summary,
        changeRequest.id
      );
      nextVersionId = version.id;
      return {
        ...item,
        ...next,
        updatedAt: getTodayString(),
        currentVersionId: version.id,
        versions: [...item.versions, version],
        changeRequests: [...item.changeRequests, changeRequest],
      };
    }));
    if (next.projectId) {
      const uiVersionIds = uiDesignList
        .filter(item => item.projectId === next.projectId && item.id !== id)
        .map(item => item.currentVersionId)
        .concat(nextVersionId)
        .filter(Boolean);
      appendProjectVersion(
        next.projectId,
        `设计版本更新：${options?.summary || changeRequest.reason}`,
        changeRequest.id,
        { uiVersionIds }
      );
    }
  }, [appendProjectVersion, uiDesignList, userInfo.name]);

  const setUIDesignGovernanceStatus = useCallback((id: string, status: GovernanceStatus) => {
    setUIDesignList(prev => prev.map(item =>
      item.id === id
        ? { ...item, governanceStatus: status, frozenAt: status === 'frozen' ? getTodayString() : undefined }
        : item
    ));
  }, []);

  const deleteUIDesign = useCallback((id: string) => {
    setUIDesignList(prev => prev.filter(item => item.id !== id));
  }, []);

  const addProject = useCallback((project: ProjectInput) => {
    const actor = userInfo.name || DEFAULT_ACTOR;
    const id = Date.now().toString();
    const createdAt = getTodayString();
    const version = buildProjectVersion(
      {
        title: project.title,
        description: project.description,
        status: project.status,
        prdVersionIds: [],
        uiVersionIds: [],
      },
      1,
      actor,
      '项目创建',
      undefined,
      createdAt
    );
    const newProject: ProjectItem = {
      ...project,
      id,
      createdAt,
      currentVersionId: version.id,
      versions: [version],
      changeRequests: [],
    };
    setProjectList(prev => [newProject, ...prev]);
  }, [userInfo.name]);

  const updateProject = useCallback((id: string, project: Partial<ProjectItem>) => {
    const actor = userInfo.name || DEFAULT_ACTOR;
    setProjectList(prev => prev.map(item => {
      if (item.id !== id) return item;
      const summary = '项目信息更新';
      const versionNumber = item.versions.length + 1;
      const version = buildProjectVersion(
        {
          title: project.title || item.title,
          description: project.description || item.description,
          status: project.status || item.status,
          prdVersionIds: prdList.filter(prd => prd.projectId === item.id).map(prd => prd.currentVersionId),
          uiVersionIds: uiDesignList.filter(ui => ui.projectId === item.id).map(ui => ui.currentVersionId),
        },
        versionNumber,
        actor,
        summary
      );
      return {
        ...item,
        ...project,
        updatedAt: getTodayString(),
        currentVersionId: version.id,
        versions: [...item.versions, version],
      };
    }));
  }, [prdList, uiDesignList, userInfo.name]);

  const deleteProject = useCallback((id: string) => {
    setProjectList(prev => prev.filter(item => item.id !== id));
  }, []);

  const addAINews = useCallback((news: Omit<AINewsItem, 'id' | 'createdAt'>) => {
    const newNews: AINewsItem = {
      ...news,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAINewsList(prev => [newNews, ...prev]);
  }, []);

  const updateAINews = useCallback((id: string, news: Partial<AINewsItem>) => {
    setAINewsList(prev => prev.map(item =>
      item.id === id ? { ...item, ...news } : item
    ));
  }, []);

  const deleteAINews = useCallback((id: string) => {
    setAINewsList(prev => prev.filter(item => item.id !== id));
  }, []);

  const toggleFavorite = useCallback((newsId: string) => {
    setAINewsFavorites(prev => {
      if (prev.includes(newsId)) {
        return prev.filter(id => id !== newsId);
      } else {
        return [...prev, newsId];
      }
    });
    // 同时更新 aiNewsList 中的 isFavorited 状态
    setAINewsList(prev => prev.map(item =>
      item.id === newsId ? { ...item, isFavorited: !item.isFavorited } : item
    ));
  }, []);

  const markAsRead = useCallback((newsId: string) => {
    setAINewsList(prev => prev.map(item =>
      item.id === newsId ? { ...item, isRead: true } : item
    ));
  }, []);

  const showToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      prdList,
      addPRD,
      updatePRD,
      deletePRD,
      createPRDVersion,
      setPRDGovernanceStatus,
      uiDesignList,
      addUIDesign,
      updateUIDesign,
      deleteUIDesign,
      createUIDesignVersion,
      setUIDesignGovernanceStatus,
      projectList,
      addProject,
      updateProject,
      deleteProject,
      aiNewsList,
      aiNewsFavorites,
      addAINews,
      updateAINews,
      deleteAINews,
      toggleFavorite,
      markAsRead,
      userInfo,
      toasts,
      showToast,
      removeToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
