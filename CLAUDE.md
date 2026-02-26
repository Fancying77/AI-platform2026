# Claude 开发指南

本文档为 Claude AI 助手提供项目开发规范和工作流程指引。

## 项目概述

**项目名称**：乐信产品AI工作平台
**技术栈**：React 19.2.0 + TypeScript 5.9.3 + Vite 7.2.4 + Tailwind CSS 3.4.19
**当前版本**：V1.1
**PRD文档**：[乐信产品AI工作平台PRD.md](./乐信产品AI工作平台PRD.md)

## 核心工作流程

### 1. 功能开发完成后必须同步更新 PRD

**重要原则**：每次完成功能开发后，必须立即更新 PRD 文档，确保文档与代码实现保持同步。

#### 需要更新的 PRD 章节：

1. **功能模块清单（2.2 节）**
   - 将已完成功能的状态从 `⏳ 待开发` 更新为 `✅ 已完成`
   - 示例：
     ```markdown
     | AI动态 | 动态信息流展示 | P0 | ✅ 已完成 |
     ```

2. **路由配置表（5.4 节）**
   - 更新路由实现状态
   - 示例：
     ```markdown
     | `/ai-news` | AINewsList | AI动态列表 | ✅ 已实现 |
     ```

3. **侧边栏导航（5.5 节）**
   - 更新导航项实现状态
   - 如有导航顺序调整，同步更新表格顺序

4. **项目结构（5.2 节）**
   - 新增页面组件时，移除"（待开发）"标注
   - 新增文件时，添加到对应目录结构中

5. **版本规划（7.1 节）**
   - 将已完成功能标记为 `✅ 已完成`
   - 添加"状态"列记录进度

6. **实现差距审计（8 节）**
   - 如修复了已知问题，从问题列表中移除或标注已修复
   - 如发现新的差距，添加到对应章节

#### 更新示例：

完成 AI 动态模块开发后，需要更新：

```markdown
# 2.2 功能模块清单
| AI动态 | 动态信息流展示 | P0 | ✅ 已完成 |
| AI动态 | 分类筛选与搜索 | P0 | ✅ 已完成 |
| AI动态 | 文章详情阅读 | P0 | ✅ 已完成 |

# 5.4 路由配置
| `/ai-news` | AINewsList | AI动态列表 | ✅ 已实现 |
| `/ai-news/:id` | AINewsDetail | AI动态详情 | ✅ 已实现 |
| `/ai-news/favorites` | AINewsFavorites | AI动态收藏 | ✅ 已实现 |

# 5.5 侧边栏导航
| AI 动态 | Newspaper | `/ai-news` | ✅ 已实现 |

# 7.1 V1.1 规划
| AI动态模块前端 | P0 | AI动态列表、详情、收藏页面（Mock数据） | ✅ 已完成 |
```

### 2. 代码规范

#### 文件命名
- 页面组件：大驼峰命名，如 `AINewsList.tsx`
- 工具函数：小驼峰命名，如 `useClickOutside.ts`
- 类型定义：统一在 `src/types/index.ts` 中定义

#### 组件开发
- 使用函数组件 + Hooks
- 遵循 TypeScript 严格模式
- 使用 Tailwind CSS 进行样式开发
- 图标使用 lucide-react 库

#### 状态管理
- 全局状态使用 Context API（`src/store/AppContext.tsx`）
- 本地状态使用 useState
- localStorage 存储键名统一使用 `lexin_` 前缀

#### 路由配置
- 所有路由在 `src/App.tsx` 中注册
- 嵌套路由使用 React Router DOM 的 `<Route>` 嵌套语法

### 3. 开发流程

1. **需求确认**：阅读 PRD 文档，理解功能需求
2. **类型定义**：在 `src/types/index.ts` 中定义数据类型
3. **状态管理**：在 `AppContext.tsx` 中添加状态和方法
4. **路由注册**：在 `App.tsx` 中注册路由
5. **页面开发**：创建页面组件，实现功能
6. **测试验证**：运行 `npm run dev`，测试功能
7. **更新 PRD**：按照上述规范更新 PRD 文档

### 4. 常用命令

```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 5. 数据存储规范

#### localStorage 键名规范

| 存储键 | 说明 |
|--------|------|
| `lexin_prd_list` | PRD列表数据 |
| `lexin_ui_design_list` | UI设计列表数据 |
| `lexin_project_list` | 项目列表数据 |
| `lexin_ai_news_list` | AI动态文章列表数据 |
| `lexin_ai_news_favorites` | AI动态收藏ID列表 |
| `lexin_sidebar_collapsed` | 侧边栏折叠状态 |

#### 数据持久化模式

```typescript
// 保存数据
useEffect(() => {
  localStorage.setItem(STORAGE_KEYS.KEY_NAME, JSON.stringify(data));
}, [data]);

// 加载数据
const [data, setData] = useState<Type[]>(() =>
  loadFromStorage(STORAGE_KEYS.KEY_NAME, defaultValue)
);
```

### 6. UI/UX 规范

#### 加载状态
- 列表加载：使用骨架屏（Skeleton）组件
- 延迟 500ms 显示，避免闪烁

#### 反馈机制
- 成功操作：绿色 Toast，3秒自动消失
- 错误操作：红色 Toast
- 危险操作：使用 ConfirmDialog 二次确认

#### 响应式设计
- 使用 Tailwind CSS 的响应式类名
- 断点：`sm:` `md:` `lg:` `xl:`

### 7. 注意事项

1. **不要创建不必要的文件**：优先编辑现有文件，避免文件膨胀
2. **保持代码简洁**：不要过度工程化，只实现必要功能
3. **遵循现有模式**：参考已有代码的实现模式，保持一致性
4. **及时更新文档**：功能完成后立即更新 PRD，不要遗漏
5. **测试验证**：每次修改后运行开发服务器，确保功能正常

## 当前开发状态

### 已完成功能（V1.1）

- ✅ 项目管理模块（列表、创建、详情页面 - 路由待注册）
- ✅ PRD管理模块（列表、创建、审核、导出）
- ✅ UI设计模块（列表、创建、预览、导出）
- ✅ AI动态模块（列表、详情、收藏、时间线布局）
- ✅ 成就系统（里程碑、庆祝动画）
- ✅ 侧边栏导航（折叠/展开、个性化问候）

### 待开发功能

- ⏳ 项目详情路由注册（`/projects/:id`）
- ⏳ PRD/UI 编辑功能
- ⏳ 移动端适配优化
- ⏳ AI动态后端爬虫服务（V2.0）
- ⏳ TAPD 集成（V2.0）

## 问题反馈

如发现 PRD 与代码实现不一致，请：
1. 在开发过程中及时修正
2. 更新 PRD 文档的"实现差距审计"章节
3. 确保后续开发遵循最新的 PRD 规范

---

**最后更新**：2025-02-07
**维护者**：Claude AI Assistant
