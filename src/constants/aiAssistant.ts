// AI 助手人格化配置
export const AI_ASSISTANT = {
  prd: {
    name: 'AI需求助手',
    avatar: '📋',
    slogan: '问问AI，需求更清晰',
  },
  ui: {
    name: 'AI设计助手',
    avatar: '🎨',
    slogan: '问问AI，设计更出彩',
  },
};

// 随机鼓励语 - 专业版
export const ENCOURAGEMENT_MESSAGES = [
  '清晰的需求描述是高效协作的基础',
  '结构化思维让产品方案更具说服力',
  '每一次迭代都是产品价值的提升',
  '数据驱动的决策让产品更有竞争力',
  '用户视角是产品设计的核心出发点',
  '细节决定体验，体验决定口碑',
  '好的产品文档是团队高效协作的保障',
  '持续优化是产品成功的关键路径',
  '专注核心场景，打造极致体验',
  '量化目标让产品迭代更有方向',
];

// AI 助手快捷回复
export const AI_QUICK_REPLIES = {
  prd: [
    '帮我优化背景描述',
    '补充功能细节',
    '添加验收标准',
    '完善数据埋点',
    '检查逻辑漏洞',
  ],
  ui: [
    '调整配色方案',
    '优化布局结构',
    '增加交互细节',
    '检查一致性',
    '添加空状态设计',
  ],
};

// 里程碑配置
export const MILESTONES = {
  prd: [
    { count: 1, message: '🎉 恭喜完成第一份需求文档！万事开头难，你做到了！', emoji: '🎯' },
    { count: 5, message: '🌟 已完成5份需求文档！你正在成为需求专家！', emoji: '⭐' },
    { count: 10, message: '🏆 10份需求文档达成！你已经是资深产品经理了！', emoji: '🏆' },
    { count: 20, message: '💎 20份需求文档！你的产品思维越来越成熟！', emoji: '💎' },
    { count: 50, message: '👑 50份需求文档！你是团队的需求文档之王！', emoji: '👑' },
    { count: 100, message: '🚀 100份需求文档！传奇产品经理诞生！', emoji: '🚀' },
  ],
  ui: [
    { count: 1, message: '🎨 第一份UI设计完成！设计之旅开始了！', emoji: '🎨' },
    { count: 5, message: '✨ 5份设计！你的审美越来越好了！', emoji: '✨' },
    { count: 10, message: '🎯 10份设计！设计达人就是你！', emoji: '🎯' },
    { count: 20, message: '💫 20份设计！你已经是设计专家了！', emoji: '💫' },
    { count: 50, message: '🌈 50份设计！设计大师非你莫属！', emoji: '🌈' },
  ],
};

// 个性化问候语
export function getGreeting(): { greeting: string; emoji: string } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 9) {
    return { greeting: '早上好', emoji: '🌅' };
  } else if (hour >= 9 && hour < 12) {
    return { greeting: '上午好', emoji: '☀️' };
  } else if (hour >= 12 && hour < 14) {
    return { greeting: '中午好', emoji: '🌞' };
  } else if (hour >= 14 && hour < 18) {
    return { greeting: '下午好', emoji: '🌤️' };
  } else if (hour >= 18 && hour < 22) {
    return { greeting: '晚上好', emoji: '🌙' };
  } else {
    return { greeting: '夜深了', emoji: '🌃' };
  }
}

// 获取随机鼓励语
export function getRandomEncouragement(): string {
  return ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
}

// 检查是否达到里程碑
export function checkMilestone(type: 'prd' | 'ui', count: number): { reached: boolean; message: string; emoji: string } | null {
  const milestones = MILESTONES[type];
  const milestone = milestones.find(m => m.count === count);

  if (milestone) {
    return {
      reached: true,
      message: milestone.message,
      emoji: milestone.emoji,
    };
  }

  return null;
}
