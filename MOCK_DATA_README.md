# Mock数据导入说明

## 📦 数据内容

本次导入的mock数据来自TAPD系统的真实需求，包括：

### 项目（4个）
1. **客服系统优化** - 新客服系统功能迭代
2. **触达平台建设** - IM站内通知、短信、push等多渠道触达
3. **管户工作台** - 管户坐席工作台功能优化
4. **外呼平台** - 外呼系统功能建设

### 需求（13个）

#### 客服系统相关（6个）
- `1413338` - chatbot机器人区分是否管户流量
- `1413329` - 【新客服系统】顶部信息区增加提还转单标签
- `1413326` - 【新客服系统】防黑灰产专项-支持机器人配置
- `1413226` - 【客服听音】增加根据会话小结模糊搜索能力
- `1413255` - 【客服切管户】场景管理-关联机器人，添加提示文案
- `1413212` - 【Chatbot】包装路由入口字段提供机器人使用

#### 触达平台相关（3个）
- `1413118` - 【触达】IM站内通知新增素材类型
- `1412514` - 【触达】短信供应商容联回执状态报告数据修复
- `1412142` - 【触达】新增模板支持阶梯灰度放量 + 停投+恢复机制建设

#### 管户工作台相关（4个）
- `1413271` - 【管户】离职企微号客户批量转移
- `1413184` - 【管户IM】IM 顶部文案根据业务线差异化显示
- `1413060` - 【管户】用户信息-超市卡余额改为可点击
- `1412967` - 【管户IM C端】用户在线客服排队策略方案（长期方案）

## 🚀 使用方法

### 方法一：通过浏览器访问（推荐）

1. 确保开发服务器正在运行：
   ```bash
   npm run dev
   ```

2. 在浏览器中访问：
   ```
   http://localhost:5173/import-mock-data.html
   ```

3. 点击"开始导入"按钮

4. 等待导入完成，页面会自动跳转到首页

### 方法二：通过浏览器控制台

1. 打开系统首页：`http://localhost:5173/`

2. 打开浏览器开发者工具（F12）

3. 在Console中执行以下代码：

```javascript
// 加载mock数据脚本
const script = document.createElement('script');
script.src = '/mock-data.js';
script.onload = () => {
  // 导入项目数据
  const existingProjects = JSON.parse(localStorage.getItem('lexin_project_list') || '[]');
  const newProjects = [...window.mockProjects, ...existingProjects];
  localStorage.setItem('lexin_project_list', JSON.stringify(newProjects));

  // 导入PRD数据
  const existingPRDs = JSON.parse(localStorage.getItem('lexin_prd_list') || '[]');
  const newPRDs = [...window.mockPRDs, ...existingPRDs];
  localStorage.setItem('lexin_prd_list', JSON.stringify(newPRDs));

  console.log('✅ 导入成功！');
  console.log(`- 项目数: ${window.mockProjects.length}`);
  console.log(`- 需求数: ${window.mockPRDs.length}`);

  // 刷新页面
  location.reload();
};
document.head.appendChild(script);
```

## ⚠️ 注意事项

1. **数据不会覆盖**：导入的数据会添加到现有数据中，不会覆盖已有数据
2. **清空数据**：如需清空所有数据，在浏览器控制台执行：
   ```javascript
   localStorage.clear();
   location.reload();
   ```
3. **查看数据**：导入后可以在以下页面查看：
   - 项目列表：`/projects`
   - PRD列表：`/prd`
   - 工作台：`/`（首页）

## 📊 数据特点

- **真实性**：所有数据来自TAPD真实需求
- **完整性**：包含需求ID、标题、描述、内容、优先级等完整信息
- **关联性**：需求与项目已建立关联关系
- **多样性**：涵盖客服、触达、管户等多个业务线

## 🔍 验证导入

导入成功后，可以通过以下方式验证：

1. **查看项目列表**：应该能看到4个新项目
2. **查看PRD列表**：应该能看到13个新需求
3. **查看项目详情**：点击项目可以看到关联的需求
4. **搜索功能**：可以搜索TAPD ID（如1413338）

## 📝 数据来源

所有数据均来自图片中的TAPD系统截图，包括：
- 客服分类（410个需求）
- 触达分类（199个需求）
- 管户分类（345个需求）

我们从中选取了最具代表性的13个需求作为mock数据。

---

**创建时间**：2025-02-07
**数据版本**：v1.0
