/**
 * 访问历史记录工具
 */

export interface VisitRecord {
  id: string;
  type: 'project' | 'prd' | 'ui' | 'ai-news';
  title: string;
  path: string;
  visitedAt: string;
  timestamp: number;
}

const STORAGE_KEY = 'lexin_recent_visits';
const MAX_RECORDS = 20;

/**
 * 添加访问记录
 */
export const addVisitRecord = (record: Omit<VisitRecord, 'visitedAt' | 'timestamp'>) => {
  try {
    // 获取现有记录
    const existingRecords = getRecentVisits();

    // 移除相同ID和类型的旧记录
    const filteredRecords = existingRecords.filter(
      r => !(r.id === record.id && r.type === record.type)
    );

    // 添加新记录到开头
    const now = new Date();
    const newRecord: VisitRecord = {
      ...record,
      visitedAt: formatVisitTime(now),
      timestamp: now.getTime(),
    };

    const updatedRecords = [newRecord, ...filteredRecords].slice(0, MAX_RECORDS);

    // 保存到localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
  } catch (error) {
    console.error('Failed to add visit record:', error);
  }
};

/**
 * 获取最近访问记录
 */
export const getRecentVisits = (): VisitRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const records = JSON.parse(data) as VisitRecord[];
    return records.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to get recent visits:', error);
    return [];
  }
};

/**
 * 格式化访问时间
 */
const formatVisitTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 1分钟内
  if (diff < 60 * 1000) {
    return '刚刚';
  }

  // 1小时内
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}分钟前`;
  }

  // 今天
  if (date.toDateString() === now.toDateString()) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}小时前`;
  }

  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  }

  // 本周内
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (date > weekAgo) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}天前`;
  }

  // 更早
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
};
