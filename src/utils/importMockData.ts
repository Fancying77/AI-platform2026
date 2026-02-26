// 导入Mock数据工具
import type { ProjectItem, PRDItem } from '../types';

const getTodayString = (): string => new Date().toISOString().split('T')[0];

// 项目数据（对应TAPD的分类）
export const mockProjects: Partial<ProjectItem>[] = [
  {
    id: 'proj-kefu',
    title: '客服系统优化',
    description: '新客服系统功能迭代，包括chatbot机器人、防黑灰产、听音功能等模块的优化升级',
    status: 'in_progress',
    members: ['cancanli(李灿灿)', 'kriswu(吴泽平)', 'lilywang(王莉萍)'],
    createdAt: '2024-12-01',
    updatedAt: getTodayString(),
  },
  {
    id: 'proj-chuda',
    title: '触达平台建设',
    description: 'IM站内通知、短信、push等多渠道触达能力建设，支持模板管理和灰度放量',
    status: 'in_progress',
    members: ['cancanli(李灿灿)', 'tomzhang(张涛)', 'lucychen(陈露西)'],
    createdAt: '2024-11-15',
    updatedAt: getTodayString(),
  },
  {
    id: 'proj-guanhu',
    title: '管户工作台',
    description: '管户坐席工作台功能优化，包括企微客户管理、IM消息、用户信息展示等功能',
    status: 'in_progress',
    members: ['cancanli(李灿灿)', 'kriswu(吴泽平)', 'amylin(林艾米)'],
    createdAt: '2024-11-20',
    updatedAt: getTodayString(),
  },
  {
    id: 'proj-waihu',
    title: '外呼平台',
    description: '外呼系统功能建设，支持智能外呼、通话记录、质检等功能',
    status: 'planning',
    members: ['cancanli(李灿灿)', 'jackwu(吴杰克)'],
    createdAt: '2024-12-10',
    updatedAt: getTodayString(),
  },
];

// PRD数据（从TAPD截图中提取的典型需求）
export const mockPRDs: Partial<PRDItem>[] = [
  // 客服系统相关需求
  {
    id: 'prd-1413338',
    title: 'chatbot机器人区分是否管户流量',
    description: '实现chatbot机器人对管户流量和非管户流量的区分识别和差异化处理',
    content: `## 需求背景
当前chatbot机器人无法区分用户是否为管户流量，导致服务策略无法差异化。

## 需求目标
- 实现流量类型识别：管户流量 vs 非管户流量
- 支持差异化的机器人应答策略
- 提升管户用户的服务体验

## 功能需求
### 1. 流量识别
- 接入用户标签系统，获取用户管户状态
- 在会话开始时判断流量类型
- 记录流量类型到会话日志

### 2. 差异化策略
- 管户流量：优先级更高，快速转人工
- 非管户流量：标准机器人流程

## 技术方案
- 调用用户中心API获取管户标签
- 在chatbot路由层增加流量类型判断逻辑
- 配置不同流量类型的应答策略

## 验收标准
- 流量识别准确率 > 99%
- 管户流量转人工时长 < 30s
- 非管户流量机器人解决率 > 60%`,
    status: 'in_progress',
    projectId: 'proj-kefu',
    createdAt: '2025-01-15',
    priority: 'P0',
    source: 'TAPD-1413338',
    requirementName: 'chatbot流量区分',
  },
  {
    id: 'prd-1413329',
    title: '【新客服系统】顶部信息区增加提还转单标签',
    description: '在客服工作台顶部信息区增加提额、还款、转单等关键业务标签展示',
    content: `## 需求背景
客服在处理用户咨询时，需要快速了解用户的提额、还款、转单等关键业务状态，当前信息展示不够直观。

## 需求目标
- 在顶部信息区增加业务标签展示
- 提升客服工作效率
- 减少信息查询时间

## 功能需求
### 1. 标签类型
- 提额标签：显示用户提额申请状态（待审核/已通过/已拒绝）
- 还款标签：显示用户还款状态（正常/逾期/已结清）
- 转单标签：显示工单转派状态（待接收/处理中/已完成）

### 2. 展示规则
- 标签颜色区分：绿色（正常）、黄色（待处理）、红色（异常）
- 鼠标悬停显示详细信息
- 点击标签跳转到对应业务详情页

## UI设计
- 标签位置：顶部信息区右侧
- 标签样式：圆角矩形，带图标
- 标签大小：高度24px，宽度自适应

## 验收标准
- 标签信息实时更新，延迟 < 2s
- 标签点击跳转准确率 100%
- 支持最多展示5个标签`,
    status: 'in_progress',
    projectId: 'proj-kefu',
    createdAt: '2025-01-14',
    priority: 'P0',
    source: 'TAPD-1413329',
    requirementName: '顶部信息区标签',
  },
  {
    id: 'prd-1413326',
    title: '【新客服系统】防黑灰产专项-支持机器人配置',
    description: '在客服系统中增加防黑灰产机器人配置能力，支持风险用户识别和拦截',
    content: `## 需求背景
黑灰产用户通过客服渠道进行欺诈行为，需要在机器人层面进行识别和拦截。

## 需求目标
- 支持风险用户识别规则配置
- 实现机器人层面的风险拦截
- 降低黑灰产损失

## 功能需求
### 1. 风险规则配置
- 支持配置风险识别规则（IP、设备、行为等）
- 支持规则优先级设置
- 支持规则启用/禁用

### 2. 机器人拦截
- 风险用户触发拦截规则后，机器人自动应答
- 支持自定义拦截话术
- 记录拦截日志

### 3. 人工审核
- 高风险用户可转人工审核
- 支持白名单机制

## 验收标准
- 风险识别准确率 > 95%
- 拦截响应时间 < 1s
- 误拦截率 < 1%`,
    status: 'in_progress',
    projectId: 'proj-kefu',
    createdAt: '2025-01-13',
    priority: 'P0',
    source: 'TAPD-1413326',
    requirementName: '防黑灰产机器人',
  },
  {
    id: 'prd-1413226',
    title: '【客服听音】增加根据会话小结模糊搜索能力',
    description: '在客服听音功能中增加基于会话小结的模糊搜索能力，提升质检效率',
    content: `## 需求背景
当前听音功能只能按时间、客服等维度搜索，无法根据会话内容快速定位，质检效率低。

## 需求目标
- 支持会话小结模糊搜索
- 提升质检效率
- 快速定位问题会话

## 功能需求
### 1. 搜索功能
- 支持关键词模糊搜索
- 支持多关键词组合搜索
- 支持搜索结果高亮显示

### 2. 搜索范围
- 会话小结内容
- 用户问题描述
- 客服回复内容

### 3. 搜索结果
- 按相关度排序
- 显示匹配片段
- 支持快速播放

## 技术方案
- 使用Elasticsearch实现全文检索
- 会话小结实时同步到ES
- 支持中文分词

## 验收标准
- 搜索响应时间 < 2s
- 搜索准确率 > 90%
- 支持10万+会话检索`,
    status: 'completed',
    projectId: 'proj-kefu',
    createdAt: '2025-01-10',
    priority: 'P1',
    source: 'TAPD-1413226',
    requirementName: '听音模糊搜索',
  },

  // 触达平台相关需求
  {
    id: 'prd-1413118',
    title: '【触达】IM站内通知新增素材类型',
    description: 'IM站内通知支持更多素材类型，包括图片、视频、卡片等',
    content: `## 需求背景
当前IM站内通知只支持纯文本，无法满足运营活动的多样化需求。

## 需求目标
- 支持多种素材类型
- 提升消息打开率
- 增强用户体验

## 功能需求
### 1. 素材类型
- 图片消息：支持单图、多图
- 视频消息：支持短视频封面+播放
- 卡片消息：支持图文卡片、商品卡片
- 链接消息：支持跳转H5页面

### 2. 素材管理
- 素材上传和预览
- 素材尺寸校验
- 素材审核机制

### 3. 消息渲染
- 不同素材类型的渲染样式
- 支持点击交互
- 支持埋点统计

## 技术方案
- 扩展消息协议，支持多媒体类型
- 客户端适配不同素材渲染
- CDN加速素材加载

## 验收标准
- 支持5种以上素材类型
- 素材加载时间 < 1s
- 消息打开率提升 > 20%`,
    status: 'in_progress',
    projectId: 'proj-chuda',
    createdAt: '2025-01-16',
    priority: 'P0',
    source: 'TAPD-1413118',
    requirementName: 'IM素材类型',
  },
  {
    id: 'prd-1412514',
    title: '【触达】短信供应商容联回执状态报告数据修复',
    description: '修复容联短信供应商回执状态数据异常问题，确保数据准确性',
    content: `## 需求背景
容联短信供应商回执状态数据存在异常，导致发送成功率统计不准确。

## 问题描述
- 部分已发送成功的短信，回执状态显示失败
- 回执时间延迟，导致统计数据滞后
- 状态码映射错误

## 修复方案
### 1. 数据修复
- 回溯近30天的回执数据
- 重新解析状态码
- 更新数据库记录

### 2. 状态码映射
- 完善容联状态码映射表
- 统一状态码定义
- 增加异常状态处理

### 3. 监控告警
- 增加回执数据监控
- 异常数据自动告警
- 定时数据校验

## 验收标准
- 历史数据修复完成率 100%
- 状态码映射准确率 100%
- 回执延迟 < 5min`,
    status: 'completed',
    projectId: 'proj-chuda',
    createdAt: '2025-01-08',
    priority: 'P0',
    source: 'TAPD-1412514',
    requirementName: '短信回执修复',
  },
  {
    id: 'prd-1412142',
    title: '【触达】新增模板支持阶梯灰度放量 + 停投+恢复机制建设',
    description: '触达模板支持阶梯灰度放量策略，并提供停投和恢复机制',
    content: `## 需求背景
当前模板上线后全量发送，风险较高，需要支持灰度放量和紧急停投能力。

## 需求目标
- 支持阶梯灰度放量
- 提供紧急停投机制
- 支持恢复发送

## 功能需求
### 1. 阶梯灰度
- 支持配置灰度阶梯：5% -> 20% -> 50% -> 100%
- 每个阶梯可设置观察时长
- 支持自动/手动晋级

### 2. 停投机制
- 一键紧急停投
- 停投后不再发送新消息
- 已发送消息不受影响

### 3. 恢复机制
- 支持恢复发送
- 可选择从当前阶梯或重新开始
- 记录停投和恢复日志

### 4. 监控指标
- 实时监控发送量、打开率、转化率
- 异常指标自动告警
- 支持指标对比

## 技术方案
- 灰度策略配置存储
- 定时任务控制放量节奏
- Redis缓存灰度状态

## 验收标准
- 灰度策略执行准确率 100%
- 停投响应时间 < 10s
- 支持100+模板并发灰度`,
    status: 'in_progress',
    projectId: 'proj-chuda',
    createdAt: '2025-01-05',
    priority: 'P0',
    source: 'TAPD-1412142',
    requirementName: '模板灰度放量',
  },

  // 管户工作台相关需求
  {
    id: 'prd-1413271',
    title: '【管户】离职企微号客户批量转移',
    description: '支持离职员工的企微客户批量转移到其他管户，确保客户服务连续性',
    content: `## 需求背景
员工离职后，其企微客户需要转移到其他管户，当前只能手动逐个转移，效率低。

## 需求目标
- 支持批量转移客户
- 确保客户服务连续性
- 提升转移效率

## 功能需求
### 1. 批量转移
- 支持选择多个客户批量转移
- 支持按标签、地区等条件筛选客户
- 支持指定接收管户

### 2. 转移规则
- 支持平均分配：自动分配到多个管户
- 支持指定分配：手动指定每个客户的接收管户
- 支持负载均衡：根据管户当前客户数分配

### 3. 转移通知
- 转移前通知接收管户
- 转移后通知客户（可选）
- 转移记录留痕

### 4. 数据同步
- 同步客户基本信息
- 同步历史沟通记录
- 同步客户标签

## 技术方案
- 调用企微API批量转移客户
- 异步任务处理大批量转移
- 数据库记录转移日志

## 验收标准
- 支持单次转移1000+客户
- 转移成功率 > 99%
- 转移耗时 < 5min（1000客户）`,
    status: 'in_progress',
    projectId: 'proj-guanhu',
    createdAt: '2025-01-17',
    priority: 'P0',
    source: 'TAPD-1413271',
    requirementName: '企微客户转移',
  },
  {
    id: 'prd-1413184',
    title: '【管户IM】IM 顶部文案根据业务线差异化显示',
    description: '管户IM顶部文案根据不同业务线（分期乐、乐花卡等）差异化展示',
    content: `## 需求背景
当前IM顶部文案统一展示，无法体现不同业务线的特色，用户体验不佳。

## 需求目标
- 支持业务线差异化文案
- 提升用户体验
- 增强业务线品牌感知

## 功能需求
### 1. 文案配置
- 支持按业务线配置顶部文案
- 支持配置文案样式（颜色、字号）
- 支持配置文案图标

### 2. 业务线识别
- 根据用户标签识别业务线
- 根据会话来源识别业务线
- 支持多业务线用户的优先级规则

### 3. 文案展示
- 实时切换文案
- 支持文案动画效果
- 支持文案点击跳转

## 业务线文案示例
- 分期乐：「分期乐管户为您服务」
- 乐花卡：「乐花卡专属客服」
- 乐卡：「乐卡贴心服务」

## 验收标准
- 文案识别准确率 100%
- 文案切换延迟 < 500ms
- 支持10+业务线配置`,
    status: 'in_progress',
    projectId: 'proj-guanhu',
    createdAt: '2025-01-16',
    priority: 'P1',
    source: 'TAPD-1413184',
    requirementName: 'IM文案差异化',
  },
  {
    id: 'prd-1413060',
    title: '【管户】用户信息-超市卡余额改为可点击',
    description: '用户信息中的超市卡余额改为可点击，点击后跳转到超市卡详情页',
    content: `## 需求背景
管户在查看用户信息时，需要了解超市卡详情，当前只能看到余额，无法快速跳转。

## 需求目标
- 超市卡余额可点击
- 快速跳转到详情页
- 提升管户工作效率

## 功能需求
### 1. 点击交互
- 超市卡余额文字可点击
- 鼠标悬停显示"点击查看详情"提示
- 点击后新标签页打开详情页

### 2. 详情页内容
- 超市卡基本信息（卡号、余额、有效期）
- 超市卡交易记录
- 超市卡使用规则

### 3. 权限控制
- 只有管户角色可点击
- 普通客服不可点击

## UI设计
- 余额文字添加下划线
- 鼠标悬停变为手型指针
- 点击后有loading状态

## 验收标准
- 点击跳转准确率 100%
- 详情页加载时间 < 2s
- 支持移动端适配`,
    status: 'completed',
    projectId: 'proj-guanhu',
    createdAt: '2025-01-12',
    priority: 'P2',
    source: 'TAPD-1413060',
    requirementName: '超市卡余额点击',
  },
  {
    id: 'prd-1412967',
    title: '【管户IM C端】用户在线客服排队策略方案（长期方案）',
    description: '优化用户在线客服排队策略，提升用户等待体验和客服接待效率',
    content: `## 需求背景
当前排队策略简单，高峰期用户等待时间长，客服负载不均衡。

## 需求目标
- 优化排队策略
- 缩短用户等待时间
- 提升客服接待效率

## 功能需求
### 1. 智能排队
- VIP用户优先
- 紧急问题优先
- 老用户优先

### 2. 负载均衡
- 根据客服当前接待量分配
- 根据客服技能标签匹配
- 根据客服历史服务质量分配

### 3. 等待体验
- 实时显示排队位置
- 预估等待时间
- 支持留言转异步

### 4. 溢出处理
- 超时自动转机器人
- 支持预约回呼
- 支持工单转派

## 技术方案
- 使用Redis实现分布式队列
- 实时计算客服负载
- 机器学习预测等待时间

## 验收标准
- 平均等待时间缩短 > 30%
- 客服负载均衡度 > 85%
- 用户满意度提升 > 15%`,
    status: 'in_progress',
    projectId: 'proj-guanhu',
    createdAt: '2025-01-09',
    priority: 'P0',
    source: 'TAPD-1412967',
    requirementName: '排队策略优化',
  },
];

// 导入函数
export function importMockDataToLocalStorage() {
  try {
    // 导入项目数据
    const existingProjects = JSON.parse(localStorage.getItem('lexin_project_list') || '[]');
    const newProjects = [...mockProjects, ...existingProjects];
    localStorage.setItem('lexin_project_list', JSON.stringify(newProjects));

    // 导入PRD数据
    const existingPRDs = JSON.parse(localStorage.getItem('lexin_prd_list') || '[]');
    const newPRDs = [...mockPRDs, ...existingPRDs];
    localStorage.setItem('lexin_prd_list', JSON.stringify(newPRDs));

    console.log('✅ Mock数据导入成功！');
    console.log(`- 导入项目数: ${mockProjects.length}`);
    console.log(`- 导入需求数: ${mockPRDs.length}`);

    return {
      success: true,
      projectCount: mockProjects.length,
      prdCount: mockPRDs.length,
    };
  } catch (error) {
    console.error('❌ Mock数据导入失败:', error);
    return {
      success: false,
      error,
    };
  }
}
