/**
 * Dashboard Mock数据生成和计算工具
 */

import type {
  Achievement,
  LeaderboardEntry,
  ExtendedUserInfo,
  DashboardStats,
  AINewsTimelineGroup,
  UserInfo,
  ProjectItem,
  PRDItem,
  UIDesignItem,
  AINewsItem,
} from '../types';

// localStorage键名
const STORAGE_KEYS = {
  ACHIEVEMENTS: 'lexin_dashboard_achievements',
  LEADERBOARD: 'lexin_dashboard_leaderboard',
  USER_STATS: 'lexin_dashboard_user_stats',
  LAST_UPDATE: 'lexin_dashboard_last_update',
};

/**
 * 生成Mock排行榜数据（10个用户）
 */
export function generateMockLeaderboard(): LeaderboardEntry[] {
  const mockUsers = [
    { name: '张三', avatar: '👨' },
    { name: '李四', avatar: '👩' },
    { name: '王五', avatar: '👨‍💼' },
    { name: '赵六', avatar: '👩‍💼' },
    { name: 'cancanli', avatar: '👤' },
    { name: '刘七', avatar: '👨‍🎓' },
    { name: '陈八', avatar: '👩‍🎓' },
    { name: '杨九', avatar: '👨‍🔬' },
    { name: '周十', avatar: '👩‍🔬' },
    { name: '吴十一', avatar: '👨‍💻' },
  ];

  return mockUsers.map((user, index) => {
    const rank = index + 1;
    const previousRank = rank + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
    const prdCount = Math.floor(Math.random() * 20) + 5;
    const uiCount = Math.floor(Math.random() * 15) + 3;
    const projectCount = Math.floor(Math.random() * 10) + 1;
    const usageMinutes = Math.floor(Math.random() * 500) + 100;
    const tokenUsage = Math.floor(Math.random() * 50000) + 10000;

    // 计算综合得分
    const score = prdCount * 100 + uiCount * 80 + projectCount * 150 + Math.floor(usageMinutes / 10) + Math.floor(tokenUsage / 100);

    return {
      userId: `user-${index + 1}`,
      userName: user.name,
      avatar: user.avatar,
      rank,
      previousRank,
      score,
      metrics: {
        prdCount,
        uiCount,
        projectCount,
        usageMinutes,
        tokenUsage,
      },
      badges: rank <= 3 ? ['🏆'] : rank <= 5 ? ['⭐'] : [],
      trend: (rank < previousRank ? 'up' : rank > previousRank ? 'down' : 'stable') as 'up' | 'down' | 'stable',
    };
  }).sort((a, b) => b.score - a.score).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

/**
 * 生成Mock成就数据
 */
export function generateMockAchievements(
  prdCount: number,
  uiCount: number,
  projectCount: number,
  usageMinutes: number
): Achievement[] {
  const achievements: Achievement[] = [
    {
      id: 'prd-beginner',
      type: 'prd',
      title: 'PRD新手',
      description: '完成第一份PRD文档',
      icon: '📋',
      progress: Math.min(prdCount, 1),
      target: 1,
      unlocked: prdCount >= 1,
      unlockedAt: prdCount >= 1 ? '2025-02-01' : undefined,
      rarity: 'common',
      reward: '解锁PRD模板库',
    },
    {
      id: 'prd-master',
      type: 'prd',
      title: 'PRD达人',
      description: '完成10份PRD文档',
      icon: '📚',
      progress: Math.min(prdCount, 10),
      target: 10,
      unlocked: prdCount >= 10,
      unlockedAt: prdCount >= 10 ? '2025-02-05' : undefined,
      rarity: 'rare',
      reward: '获得PRD专家徽章',
    },
    {
      id: 'ui-beginner',
      type: 'ui',
      title: '设计新星',
      description: '完成第一份UI设计',
      icon: '🎨',
      progress: Math.min(uiCount, 1),
      target: 1,
      unlocked: uiCount >= 1,
      unlockedAt: uiCount >= 1 ? '2025-02-02' : undefined,
      rarity: 'common',
      reward: '解锁设计组件库',
    },
    {
      id: 'ui-master',
      type: 'ui',
      title: '设计大师',
      description: '完成10份UI设计',
      icon: '🖼️',
      progress: Math.min(uiCount, 10),
      target: 10,
      unlocked: uiCount >= 10,
      unlockedAt: uiCount >= 10 ? '2025-02-06' : undefined,
      rarity: 'rare',
      reward: '获得设计专家徽章',
    },
    {
      id: 'project-starter',
      type: 'project',
      title: '项目启动者',
      description: '创建第一个项目',
      icon: '🚀',
      progress: Math.min(projectCount, 1),
      target: 1,
      unlocked: projectCount >= 1,
      unlockedAt: projectCount >= 1 ? '2025-01-30' : undefined,
      rarity: 'common',
      reward: '解锁项目管理工具',
    },
    {
      id: 'usage-active',
      type: 'usage',
      title: '活跃用户',
      description: '累计使用5小时',
      icon: '⚡',
      progress: Math.min(usageMinutes, 300),
      target: 300,
      unlocked: usageMinutes >= 300,
      unlockedAt: usageMinutes >= 300 ? '2025-02-04' : undefined,
      rarity: 'common',
      reward: '获得活跃用户徽章',
    },
    {
      id: 'usage-power',
      type: 'usage',
      title: '超级用户',
      description: '累计使用20小时',
      icon: '🔥',
      progress: Math.min(usageMinutes, 1200),
      target: 1200,
      unlocked: usageMinutes >= 1200,
      unlockedAt: usageMinutes >= 1200 ? '2025-02-07' : undefined,
      rarity: 'epic',
      reward: '获得超级用户特权',
    },
    {
      id: 'all-rounder',
      type: 'project',
      title: '全能选手',
      description: '完成5个项目、5份PRD、5份设计',
      icon: '🏆',
      progress: Math.min(projectCount, 5) + Math.min(prdCount, 5) + Math.min(uiCount, 5),
      target: 15,
      unlocked: projectCount >= 5 && prdCount >= 5 && uiCount >= 5,
      unlockedAt: projectCount >= 5 && prdCount >= 5 && uiCount >= 5 ? '2025-02-07' : undefined,
      rarity: 'legendary',
      reward: '获得全能选手称号',
    },
  ];

  return achievements;
}

/**
 * 生成扩展用户统计数据
 */
export function generateExtendedUserStats(
  userInfo: UserInfo,
  _prdCount: number,
  _uiCount: number,
  _projectCount: number
): ExtendedUserInfo {
  // Mock使用时长数据
  const totalUsageMinutes = 324; // 5.4小时
  const todayUsageMinutes = 45;
  const weeklyUsageMinutes = 180; // 3小时

  // Mock Token分类数据
  const tokenBreakdown = {
    prd: Math.floor(userInfo.tokenUsage * 0.5),
    ui: Math.floor(userInfo.tokenUsage * 0.3),
    aiNews: Math.floor(userInfo.tokenUsage * 0.2),
  };

  return {
    ...userInfo,
    totalUsageMinutes,
    todayUsageMinutes,
    weeklyUsageMinutes,
    tokenBreakdown,
    rankTrend: userInfo.rank < 7 ? 'up' : 'stable',
    previousRank: userInfo.rank + 2,
    joinDate: '2025-01-15',
  };
}

/**
 * 计算Dashboard统计数据
 */
export function calculateDashboardStats(
  projects: ProjectItem[],
  prds: PRDItem[],
  uiDesigns: UIDesignItem[],
  aiNews: AINewsItem[]
): DashboardStats {
  // 项目统计
  const projectsCompleted = projects.filter(p => p.status === 'completed').length;
  const projectsInProgress = projects.filter(p => p.status === 'in_progress').length;
  const projectsPlanning = projects.filter(p => p.status === 'planning').length;
  const projectsTotal = projects.length;
  const projectsCompletionRate = projectsTotal > 0 ? Math.round((projectsCompleted / projectsTotal) * 100) : 0;

  // PRD统计
  const prdsCompleted = prds.filter(p => p.status === 'completed').length;
  const prdsInProgress = prds.filter(p => p.status === 'in_progress').length;
  const prdsTotal = prds.length;
  const prdsCompletionRate = prdsTotal > 0 ? Math.round((prdsCompleted / prdsTotal) * 100) : 0;

  // UI设计统计
  const uiCompleted = uiDesigns.filter(u => u.status === 'completed').length;
  const uiInProgress = uiDesigns.filter(u => u.status === 'in_progress').length;
  const uiTotal = uiDesigns.length;
  const uiCompletionRate = uiTotal > 0 ? Math.round((uiCompleted / uiTotal) * 100) : 0;

  // AI动态统计
  const aiNewsTotal = aiNews.length;
  const aiNewsFavorites = aiNews.filter(n => n.isFavorited).length;
  const today = new Date().toISOString().split('T')[0];
  const aiNewsReadToday = aiNews.filter(n => n.createdAt === today).length;

  // 本周活动统计（Mock数据）
  const weeklyActivity = {
    prdCreated: 3,
    uiCreated: 2,
    projectCreated: 1,
  };

  return {
    projects: {
      total: projectsTotal,
      completed: projectsCompleted,
      inProgress: projectsInProgress,
      planning: projectsPlanning,
      completionRate: projectsCompletionRate,
    },
    prds: {
      total: prdsTotal,
      completed: prdsCompleted,
      inProgress: prdsInProgress,
      completionRate: prdsCompletionRate,
    },
    uiDesigns: {
      total: uiTotal,
      completed: uiCompleted,
      inProgress: uiInProgress,
      completionRate: uiCompletionRate,
    },
    aiNews: {
      total: aiNewsTotal,
      favorites: aiNewsFavorites,
      readToday: aiNewsReadToday,
    },
    weeklyActivity,
  };
}

/**
 * 将AI动态按时间分组
 */
export function groupAINewsByTimeline(newsList: AINewsItem[]): AINewsTimelineGroup[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: AINewsTimelineGroup[] = [];

  // 今天
  const todayItems = newsList.filter(n => n.publishedAt === today);
  if (todayItems.length > 0) {
    groups.push({
      label: '今天',
      date: today,
      items: todayItems,
    });
  }

  // 昨天
  const yesterdayItems = newsList.filter(n => n.publishedAt === yesterdayStr);
  if (yesterdayItems.length > 0) {
    groups.push({
      label: '昨天',
      date: yesterdayStr,
      items: yesterdayItems,
    });
  }

  // 本周
  const thisWeekItems = newsList.filter(n => {
    const publishDate = new Date(n.publishedAt);
    return publishDate > weekAgo && publishDate < yesterday;
  });
  if (thisWeekItems.length > 0) {
    groups.push({
      label: '本周',
      date: 'this-week',
      items: thisWeekItems,
    });
  }

  // 更早
  const olderItems = newsList.filter(n => {
    const publishDate = new Date(n.publishedAt);
    return publishDate <= weekAgo;
  });
  if (olderItems.length > 0) {
    groups.push({
      label: '更早',
      date: 'older',
      items: olderItems.slice(0, 10), // 只显示前10条
    });
  }

  return groups;
}

/**
 * 从localStorage加载排行榜数据
 */
export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
  }

  // 如果没有数据，生成并保存
  const leaderboard = generateMockLeaderboard();
  saveLeaderboard(leaderboard);
  return leaderboard;
}

/**
 * 保存排行榜数据到localStorage
 */
export function saveLeaderboard(leaderboard: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
  } catch (error) {
    console.error('Failed to save leaderboard:', error);
  }
}

/**
 * 从localStorage加载成就数据
 */
export function loadAchievements(
  prdCount: number,
  uiCount: number,
  projectCount: number,
  usageMinutes: number
): Achievement[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load achievements:', error);
  }

  // 如果没有数据，生成并保存
  const achievements = generateMockAchievements(prdCount, uiCount, projectCount, usageMinutes);
  saveAchievements(achievements);
  return achievements;
}

/**
 * 保存成就数据到localStorage
 */
export function saveAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (error) {
    console.error('Failed to save achievements:', error);
  }
}

/**
 * 格式化使用时长
 */
export function formatUsageTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}

/**
 * 格式化Token数量
 */
export function formatTokenCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  }
  if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return `${(count / 1000000).toFixed(1)}M`;
}
