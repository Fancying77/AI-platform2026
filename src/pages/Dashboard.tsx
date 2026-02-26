import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import {
  FolderOpen,
  FileText,
  Palette,
  Clock,
  Trophy,
  Award,
} from 'lucide-react';

// 成就定义
interface Achievement {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
}

// 排行榜用户
interface LeaderboardUser {
  rank: number;
  name: string;
  prdCount: number;
  uiCount: number;
  score: number;
  isCurrentUser: boolean;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    projectList,
    prdList,
    uiDesignList,
    aiNewsList,
  } = useApp();

  // 统计数据
  const stats = {
    projects: {
      total: projectList.length,
      inProgress: projectList.filter(p => p.status === 'in_progress').length,
      completed: projectList.filter(p => p.status === 'completed').length,
    },
    prds: {
      total: prdList.length,
      completed: prdList.filter(p => p.status === 'completed').length,
    },
    uiDesigns: {
      total: uiDesignList.length,
      completed: uiDesignList.filter(u => u.status === 'completed').length,
    },
  };

  // 计算完成率
  const completionRates = {
    projects: stats.projects.total > 0 ? Math.round((stats.projects.completed / stats.projects.total) * 100) : 0,
    prds: stats.prds.total > 0 ? Math.round((stats.prds.completed / stats.prds.total) * 100) : 0,
    uiDesigns: stats.uiDesigns.total > 0 ? Math.round((stats.uiDesigns.completed / stats.uiDesigns.total) * 100) : 0,
  };

  // 最近访问（合并需求文档和UI设计，按更新时间排序，取前5条）
  const recentVisits = [...prdList, ...uiDesignList]
    .sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      return timeB - timeA;
    })
    .slice(0, 5);

  // 成就数据
  const achievements: Achievement[] = [
    {
      id: 'prd_beginner',
      name: '需求文档新手',
      description: '完成1个需求文档',
      target: 1,
      current: stats.prds.completed,
      completed: stats.prds.completed >= 1,
    },
    {
      id: 'prd_expert',
      name: '需求文档达人',
      description: '完成10个需求文档',
      target: 10,
      current: stats.prds.completed,
      completed: stats.prds.completed >= 10,
    },
    {
      id: 'ui_beginner',
      name: '设计新星',
      description: '完成1个设计',
      target: 1,
      current: stats.uiDesigns.completed,
      completed: stats.uiDesigns.completed >= 1,
    },
    {
      id: 'ui_expert',
      name: '设计大师',
      description: '完成10个设计',
      target: 10,
      current: stats.uiDesigns.completed,
      completed: stats.uiDesigns.completed >= 10,
    },
  ];

  // Mock排行榜数据 - TOP 10
  const leaderboard: LeaderboardUser[] = [
    { rank: 1, name: '张三', prdCount: 15, uiCount: 12, score: 270, isCurrentUser: false },
    { rank: 2, name: '李四', prdCount: 12, uiCount: 10, score: 220, isCurrentUser: false },
    { rank: 3, name: '王五', prdCount: 10, uiCount: 8, score: 180, isCurrentUser: false },
    { rank: 4, name: '赵六', prdCount: 8, uiCount: 7, score: 150, isCurrentUser: false },
    { rank: 5, name: '李灿灿', prdCount: stats.prds.total, uiCount: stats.uiDesigns.total, score: stats.prds.total * 10 + stats.uiDesigns.total * 10, isCurrentUser: true },
    { rank: 6, name: '孙七', prdCount: 6, uiCount: 5, score: 110, isCurrentUser: false },
    { rank: 7, name: '周八', prdCount: 5, uiCount: 4, score: 90, isCurrentUser: false },
    { rank: 8, name: '吴九', prdCount: 4, uiCount: 3, score: 70, isCurrentUser: false },
    { rank: 9, name: '郑十', prdCount: 3, uiCount: 2, score: 50, isCurrentUser: false },
    { rank: 10, name: '钱十一', prdCount: 2, uiCount: 1, score: 30, isCurrentUser: false },
  ];

  // 获取日期分组标签
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    }
  };

  // 按日期分组AI动态
  const groupedAINews = aiNewsList.slice(0, 8).reduce((groups, news) => {
    const dateLabel = getDateLabel(news.publishedAt);
    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(news);
    return groups;
  }, {} as Record<string, typeof aiNewsList>);

  return (
    <div className="min-h-screen bg-bg-light p-4">
      <div className="flex gap-6">
        {/* 左侧主要内容区 */}
        <div className="flex-1 space-y-6">
          {/* 数据概览卡片 - 3列 */}
          <div className="grid grid-cols-3 gap-3">
            {/* 项目卡片 */}
            <div
              className="bg-white rounded-lg border border-border px-4 py-3 cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => navigate('/projects')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen size={16} className="text-primary" />
                  <span className="text-sm font-semibold text-text-primary">项目</span>
                </div>
                <span className="text-xl font-bold text-text-primary">{stats.projects.total}</span>
              </div>
              <div className="mt-2 text-xs text-text-secondary">
                进行中 {stats.projects.inProgress} · 完成率 {completionRates.projects}%
              </div>
            </div>

            {/* 需求卡片 */}
            <div
              className="bg-white rounded-lg border border-border px-4 py-3 cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => navigate('/prd')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  <span className="text-sm font-semibold text-text-primary">需求</span>
                </div>
                <span className="text-xl font-bold text-text-primary">{stats.prds.total}</span>
              </div>
              <div className="mt-2 text-xs text-text-secondary">
                已完成 {stats.prds.completed} · 完成率 {completionRates.prds}%
              </div>
            </div>

            {/* 设计卡片 */}
            <div
              className="bg-white rounded-lg border border-border px-4 py-3 cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => navigate('/ui')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette size={16} className="text-primary" />
                  <span className="text-sm font-semibold text-text-primary">设计</span>
                </div>
                <span className="text-xl font-bold text-text-primary">{stats.uiDesigns.total}</span>
              </div>
              <div className="mt-2 text-xs text-text-secondary">
                已完成 {stats.uiDesigns.completed} · 完成率 {completionRates.uiDesigns}%
              </div>
            </div>
          </div>

          {/* 最近访问 */}
          <div className="bg-white rounded-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-text-secondary" />
              <h2 className="text-lg font-semibold text-text-primary">最近访问</h2>
            </div>
            {recentVisits.length > 0 ? (
              <div className="space-y-0">
                {recentVisits.map((item) => {
                  const isPRD = 'content' in item;
                  const project = projectList.find(p => p.id === item.projectId);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-b-0 hover:bg-bg-light cursor-pointer transition-colors"
                      onClick={() => navigate(isPRD ? `/prd` : `/ui`)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {isPRD ? (
                          <FileText size={16} className="text-primary flex-shrink-0" />
                        ) : (
                          <Palette size={16} className="text-primary flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-text-primary truncate">{item.title}</div>
                          <div className="text-xs text-text-tertiary">
                            {isPRD ? '需求' : '设计'}
                            {project && ` · ${project.title}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-text-tertiary flex-shrink-0 ml-4">
                        {new Date(item.updatedAt || item.createdAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-text-tertiary text-sm">暂无访问记录</div>
            )}
          </div>

          {/* 我的成就 */}
          <div className="bg-white rounded-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award size={18} className="text-text-secondary" />
              <h2 className="text-lg font-semibold text-text-primary">我的成就</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="bg-bg-light rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{achievement.completed ? '✅' : '⭕'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">
                        {achievement.name}
                      </div>
                      <div className="text-xs text-text-tertiary truncate">
                        {achievement.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${achievement.completed ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${Math.min((achievement.current / achievement.target) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-secondary whitespace-nowrap">
                      {achievement.current}/{achievement.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 本周排行榜 */}
          <div className="bg-white rounded-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-text-secondary" />
              <h2 className="text-lg font-semibold text-text-primary">本周排行榜</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {leaderboard.map((user) => (
                <div
                  key={user.rank}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    user.isCurrentUser
                      ? 'bg-primary-light border border-primary'
                      : 'bg-bg-light'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg w-6 text-center flex-shrink-0">
                      {user.rank === 1 && '🥇'}
                      {user.rank === 2 && '🥈'}
                      {user.rank === 3 && '🥉'}
                      {user.rank > 3 && user.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">
                        {user.name}{user.isCurrentUser && ' (你)'}
                      </div>
                      <div className="text-xs text-text-tertiary">
                        {user.prdCount}需求 · {user.uiCount}设计
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-text-secondary flex-shrink-0 ml-2">
                    {user.score}分
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧AI动态面板 */}
        <div className="w-[300px] flex-shrink-0">
          <div className="bg-white rounded-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">AI 动态</h2>
              <button
                onClick={() => navigate('/ai-news')}
                className="text-xs text-primary hover:underline"
              >
                更多
              </button>
            </div>

            <div>
              {Object.entries(groupedAINews).map(([dateLabel, newsItems]) => (
                <div key={dateLabel} className="mb-4 last:mb-0">
                  {/* 日期标题 */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs font-medium text-text-secondary">{dateLabel}</span>
                  </div>

                  {/* 该日期下的新闻列表 */}
                  <div className="ml-4 border-l-2 border-gray-200 pl-3 space-y-3">
                    {newsItems.map((news) => (
                      <div
                        key={news.id}
                        className="cursor-pointer hover:bg-bg-light p-2 rounded transition-colors -ml-2"
                        onClick={() => navigate(`/ai-news/${news.id}`)}
                      >
                        <div className="flex items-start gap-1 mb-1">
                          {news.isHot && <span className="text-xs">🔥</span>}
                          <h3 className="text-sm text-text-primary line-clamp-2 flex-1">
                            {news.title}
                          </h3>
                        </div>
                        <div className="text-xs text-text-tertiary">{news.source}</div>
                        <div className="mt-1">
                          <span className="inline-block px-2 py-0.5 bg-bg-light text-text-secondary text-xs rounded">
                            {news.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/ai-news')}
              className="w-full mt-4 py-2 text-sm text-primary border border-border rounded-lg hover:bg-primary-light transition-colors"
            >
              查看全部 AI 动态 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
