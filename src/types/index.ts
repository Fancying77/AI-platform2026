export type GovernanceStatus = 'draft' | 'review' | 'frozen';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ChangeRequest {
  id: string;
  entityType: 'project' | 'prd' | 'ui';
  entityId: string;
  createdBy: string;
  createdAt: string;
  reason: string;
  impact: string;
  approvalStatus: ApprovalStatus;
  relatedTasks: string[];
}

export interface VersionBase {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  changeRequestId?: string;
  summary: string;
}

export interface PRDVersion extends VersionBase {
  title: string;
  description: string;
  content: string;
  status: 'in_progress' | 'completed';
  projectId?: string;
  requirementName?: string;
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  source?: string;
}

export interface UIDesignVersion extends VersionBase {
  title: string;
  description: string;
  prdId?: string;
  prdTitle?: string;
  projectId?: string;
  status: 'in_progress' | 'completed';
  tool: string;
  thumbnail?: string;
  componentTree?: string;
}

export interface ProjectVersion extends VersionBase {
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed';
  prdVersionIds: string[];
  uiVersionIds: string[];
}

export interface PRDItem {
  id: string;
  title: string;
  description: string;
  content: string;
  status: 'in_progress' | 'completed';
  projectId?: string;
  createdAt: string;
  updatedAt?: string;
  currentVersionId: string;
  versions: PRDVersion[];
  governanceStatus: GovernanceStatus;
  frozenAt?: string;
  changeRequests: ChangeRequest[];
  requirementName?: string;
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  source?: string;
}

export interface UIDesignItem {
  id: string;
  title: string;
  description: string;
  prdId?: string;
  prdTitle?: string;
  projectId?: string;
  status: 'in_progress' | 'completed';
  tool: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt?: string;
  currentVersionId: string;
  versions: UIDesignVersion[];
  governanceStatus: GovernanceStatus;
  frozenAt?: string;
  changeRequests: ChangeRequest[];
}

export interface UserInfo {
  name: string;
  avatar: string;
  weeklyUsageTime: string;
  tokenUsage: number;
  rank: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed';
  members?: string[]; // Format: ["username(displayName)", ...]
  createdAt: string;
  updatedAt?: string;
  currentVersionId: string;
  versions: ProjectVersion[];
  changeRequests: ChangeRequest[];
}

// AI动态文章数据结构
export interface AINewsItem {
  id: string;
  title: string;              // 中文标题（AI翻译）
  originalTitle: string;      // 原始标题
  summary: string;            // AI生成的中文摘要（100-200字）
  content: string;            // 中文正文（Markdown格式）
  source: string;             // 来源网站名称
  sourceUrl: string;          // 原文链接
  category: AINewsCategory;   // 分类标签
  coverImage?: string;        // 封面图（如有）
  publishedAt: string;        // 原文发布时间
  crawledAt: string;          // 爬取时间
  readCount: number;          // 阅读量
  isFavorited: boolean;       // 当前用户是否已收藏
  isRead: boolean;            // 当前用户是否已阅读
  isHot: boolean;             // 是否热门（24h阅读量Top3）
  createdAt: string;          // 创建时间
}

// 分类枚举
export type AINewsCategory =
  | '大模型'
  | 'AI产品'
  | '开源项目'
  | '研究论文'
  | '行业融资'
  | '政策法规'
  | 'AI工具'
  | '技术教程';

// Dashboard相关类型定义

// 扩展的用户信息（包含详细使用数据）
export interface ExtendedUserInfo extends UserInfo {
  totalUsageMinutes: number;
  todayUsageMinutes: number;
  weeklyUsageMinutes: number;
  tokenBreakdown: {
    prd: number;
    ui: number;
    aiNews: number;
  };
  rankTrend: 'up' | 'down' | 'stable';
  previousRank: number;
  joinDate: string;
}

// 成就系统
export interface Achievement {
  id: string;
  type: 'prd' | 'ui' | 'project' | 'usage' | 'streak';
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward?: string;
}

// 排行榜条目
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatar: string;
  rank: number;
  previousRank: number;
  score: number;
  metrics: {
    prdCount: number;
    uiCount: number;
    projectCount: number;
    usageMinutes: number;
    tokenUsage: number;
  };
  badges: string[];
  trend: 'up' | 'down' | 'stable';
}

// Dashboard统计数据
export interface DashboardStats {
  projects: {
    total: number;
    completed: number;
    inProgress: number;
    planning: number;
    completionRate: number;
  };
  prds: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
  };
  uiDesigns: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
  };
  aiNews: {
    total: number;
    favorites: number;
    readToday: number;
  };
  weeklyActivity: {
    prdCreated: number;
    uiCreated: number;
    projectCreated: number;
  };
}

// AI动态时间轴分组
export interface AINewsTimelineGroup {
  label: string;
  date: string;
  items: AINewsItem[];
}
