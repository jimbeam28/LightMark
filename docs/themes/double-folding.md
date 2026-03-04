# Double Folding 主题设计文档

## 概述

Double Folding 是一个专为技术文档和系列教程设计的 LightMark 主题。采用三栏布局：左侧系列/文章导航（可折叠），右侧页面内标题索引（可折叠），中间为主内容区。充分利用宽屏空间，同时保持内容的可读性。

---

## 设计目标

1. **沉浸式阅读**：移除顶部导航栏，减少视觉干扰
2. **快速导航**：左侧系列切换 + 右侧标题索引，实现高效跳转
3. **空间优化**：可折叠的双侧导航，适应不同阅读习惯
4. **上下文保持**：始终可见的导航元素，不随滚动消失
5. **阅读连续性**：点击文章后侧边栏滚动位置保持不动

---

## 布局架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌──────────────┐  ┌──────────────────────────────────┐  ┌──────────┐  │
│  │              │  │                                  │  │          │  │
│  │  系列导航     │  │         主内容区                  │  │ 标题索引 │  │
│  │  (可折叠)     │  │                                  │  │ (可折叠) │  │
│  │              │  │                                  │  │          │  │
│  │  Site Title  │  │    文章内容...                   │  │  目录    │  │
│  │  [−] [<]     │  │                                  │  │ [>]      │  │
│  │              │  │                                  │  │          │  │
│  │ ▼ Go基础     │  │                                  │  │ 1. 概述   │  │
│  │   1. 文章1   │  │                                  │  │ 2. 安装   │  │
│  │   2. 文章2 ○ │  │                                  │  │   2.1    │  │
│  │ ▶ Web开发    │  │                                  │  │ 3. 使用   │  │
│  │              │  │                                  │  │          │  │
│  └──────────────┘  └──────────────────────────────────┘  └──────────┘  │
│                                                                         │
│                                          [▲] 回到顶部                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 页面结构

### 1. 首页 (home.html)

**功能**：显示网站首页，包含所有系列列表

**数据需求**：
- `allSeries` - 所有系列列表
- `allTags` - 所有标签列表

**交互逻辑**：
- 主内容区显示欢迎信息和系列卡片
- 左侧导航显示所有系列（默认展开第一个）
- 右侧显示首页内容概览（如有TOC）

### 2. 文章页 (article.html)

**功能**：显示单篇文章内容

**数据需求**：
- `article` - 当前文章对象
- `content` - 文章 HTML 内容
- `toc` - 文章目录（h2, h3, h4, h5, h6）
- `series` - 所属系列信息
- `prev/next` - 上一篇/下一篇文章

**交互逻辑**：
- 左侧展开当前文章所属系列，高亮当前文章
- 点击文章链接后，侧边栏滚动位置保持不变（通过 sessionStorage 保存/恢复）
- 右侧 TOC 高亮当前阅读位置，支持 h2-h6 层级显示

### 3. 系列页 (series.html)

**功能**：显示系列文章列表

**数据需求**：
- `series` - 当前系列对象
- `series.articles` - 系列内文章列表

**交互逻辑**：
- 左侧高亮当前系列并展开
- 主内容区显示该系列的所有文章卡片列表

### 4. 标签页 (tags.html, tag.html)

**功能**：标签云和标签文章列表

**布局**：
- 左侧导航保持完整功能
- 主内容区显示标签相关内容
- 右侧 TOC 正常显示（如有）

---

## 导航组件详细设计

### 左侧系列导航

#### 视觉设计
```
┌─────────────────┐
│  Site Title   │  ← 头部
│  [−] [<]      │  ← 折叠按钮、关闭按钮
├─────────────────┤
│ ▼ Go语言基础    │  ← 展开的系列
│   1. 环境搭建   │  ← 文章（支持两行显示）
│   2. 基础语法 ● │  ← 当前选中（蓝色高亮）
│   3. 函数与方法 │
├─────────────────┤
│ ▶ Web前端开发   │  ← 收起的系列
├─────────────────┤
│ ▶ 数据库原理    │
└─────────────────┘
```

#### 文章链接样式
- 字号：13px
- 行高：1.5
- 最多显示两行，超出显示省略号
- 选中状态：蓝色背景 + 左边框

#### 数据结构
```javascript
{
  series: [
    {
      name: 'go-basics',
      title: 'Go语言基础',
      articles: [
        { title: '环境搭建', slug: 'setup', order: 1 },
        { title: '基础语法', slug: 'syntax', order: 2 }
      ]
    }
  ],
  state: {
    expandedSeries: 'go-basics',
    currentArticle: 'syntax'
  }
}
```

#### 交互行为

| 操作 | 行为 |
|------|------|
| 点击系列名称 | 展开/收起该系列，不自动跳转 |
| 点击文章标题 | 加载对应文章，保存当前滚动位置 |
| 点击 [−] 按钮 | 收起所有系列 |
| 点击 [<] 按钮 | 关闭侧边栏 |
| 点击 [>] 按钮（展开按钮）| 打开侧边栏 |

#### 滚动位置保持
页面跳转前自动保存侧边栏滚动位置，加载后恢复，确保用户阅读连续性。

### 右侧标题索引 (TOC)

#### 视觉设计
```
┌─────────────────┐
│ [<]  目录       │  ← 固定头部，可折叠
├─────────────────┤
│ 安装 Go         │  ← h2 (16px, 粗体)
│   macOS         │  ← h3 (14px, 缩进)
│   Linux         │
│   Windows       │
│ Hello World     │  ← h2
│ 基础语法        │
│   变量声明      │  ← h3
│   函数定义      │
└─────────────────┘
```

#### 层级样式
| 层级 | 字号 | 字重 | 缩进 |
|------|------|------|------|
| h2 | 15px | 600 | 8px |
| h3 | 14px | normal | 24px |
| h4 | 13px | normal | 40px |
| h5 | 12px | normal | 56px |
| h6 | 12px | normal | 72px |

#### 折叠功能
- 点击 [>] 按钮：收起 TOC，只显示展开按钮
- 点击 [<] 按钮：展开 TOC
- 按钮大小：24x24px

---

## 样式规范

### 色彩系统

```css
:root {
  /* 主色调 */
  --color-primary: #2563eb;
  --color-primary-light: #3b82f6;
  --color-primary-dark: #1d4ed8;
  --color-primary-bg: #eff6ff;

  /* 背景色 */
  --color-bg: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-bg-hover: #e2e8f0;

  /* 文字色 */
  --color-text: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;
  --color-text-inverse: #ffffff;

  /* 边框 */
  --color-border: #e2e8f0;
  --color-border-light: #f1f5f9;
}

/* 暗色模式 */
[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-bg-tertiary: #334155;
  --color-bg-hover: #475569;

  --color-text: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;

  --color-border: #334155;
  --color-border-light: #1e293b;
}
```

### 布局尺寸

```css
:root {
  /* 侧边栏宽度 */
  --sidebar-width: 280px;          /* 左侧系列导航 */
  --toc-width: 240px;              /* 右侧标题索引 */
  --sidebar-collapsed-width: 60px; /* 收起状态 */

  /* 内容区 */
  --content-max-width: 800px;      /* 最大内容宽度 */

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* 字体 */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: "SF Mono", Monaco, Consolas, monospace;
}
```

### 按钮统一规范
所有控制按钮统一尺寸：
- 大小：24x24px
- 边框：1px solid var(--color-border)
- 圆角：4px
- 图标字号：14px
- 悬停效果：蓝色背景 + 边框

包含按钮：
- 左侧 [−] 折叠按钮
- 左侧 [<] 关闭按钮
- 左侧 [>] 展开按钮
- 右侧 [>] 折叠 TOC 按钮
- 右侧 [<] 展开 TOC 按钮

### 响应式断点

| 断点 | 布局调整 |
|------|----------|
| ≥1024px | 三栏完整显示 |
| 768-1023px | 左侧变为抽屉，右侧隐藏 |
| <768px | 左侧抽屉，底部固定导航 |

---

## JavaScript 功能模块

### 1. 左侧导航控制 (sidebar.js)

```javascript
class SeriesNav {
  constructor() {
    this.sidebar = document.getElementById('leftSidebar');
    this.nav = document.getElementById('seriesNav');
    // ... 初始化
  }

  // 主要功能：
  // - 系列展开/收起
  // - 文章高亮
  // - 侧边栏折叠/展开
  // - 保存/恢复滚动位置

  saveScrollPosition() {
    sessionStorage.setItem('doubleFolding_sidebarScroll', this.nav.scrollTop);
  }

  restoreScrollPosition() {
    const saved = sessionStorage.getItem('doubleFolding_sidebarScroll');
    if (saved) {
      this.nav.scrollTop = parseInt(saved, 10);
      sessionStorage.removeItem('doubleFolding_sidebarScroll');
    }
  }
}
```

### 2. TOC 控制器 (toc.js)

```javascript
class TocController {
  constructor() {
    this.tocContainer = document.getElementById('tocContainer');
    this.tocNav = document.getElementById('tocNav');
    // ... 初始化
  }

  // 主要功能：
  // - TOC 折叠/展开
  // - 滚动时高亮当前标题
  // - 点击标题平滑滚动
  // - 确保当前高亮标题可见
}
```

### 3. 回到顶部 (main.js)

```javascript
class BackToTop {
  constructor() {
    this.button = document.getElementById('backToTop');
    this.showThreshold = 300;
    // ... 初始化
  }

  // 滚动超过阈值显示按钮
  // 点击平滑滚动到顶部
}
```

---

## 模板文件清单

| 文件 | 用途 | 特殊说明 |
|------|------|----------|
| `layout.html` | 基础布局 | 定义三栏结构，无顶部导航 |
| `home.html` | 首页 | 显示系列卡片列表 |
| `article.html` | 文章页 | 完整文章内容，带分页导航 |
| `series.html` | 系列页 | 系列文章列表 |
| `tags.html` | 标签列表 | 标签云页面 |
| `tag.html` | 单个标签 | 该标签下的文章列表 |

---

## 与 LightMark Core 的约定

### 依赖的数据结构

```yaml
# 全局可用
site: { title, description, author, language, theme, darkMode, output }
allSeries: [{ name, title, url, articles: [{ title, slug, order, date, excerpt }] }]
allTags: [string]
page: { template, title, rootPath }

# 文章页
article: { title, date, tags, series, seriesTitle, order, slug, url, prev, next }
content: "HTML string"
toc: [{ level: 2-6, text, id }]
series: { name, title, articles }

# 系列页
series: { name, title, articles, firstArticle }

# 标签页
tags: { tagName: [articles] }
```

### URL 结构约定

- 首页：`index.html`
- 系列首页：`series/{name}/index.html`
- 文章：`series/{name}/{slug}.html`
- 标签列表：`tags/index.html`
- 单个标签：`tags/{name}/index.html`

---

## 文件结构

```
themes/double-folding/
├── theme.yaml              # 主题元信息
├── templates/
│   ├── layout.html         # 基础布局
│   ├── home.html           # 首页
│   ├── article.html        # 文章页
│   ├── series.html         # 系列页
│   ├── tags.html           # 标签列表
│   └── tag.html            # 单个标签
└── assets/
    ├── css/
    │   ├── base.css        # 基础样式、CSS变量
    │   ├── layout.css      # 三栏布局
    │   ├── sidebar.css     # 左侧系列导航
    │   ├── toc.css         # 右侧标题索引
    │   ├── article.css     # 文章内容样式
    │   ├── tags.css        # 标签页样式
    │   └── responsive.css  # 响应式调整
    └── js/
        ├── sidebar.js      # 左侧导航控制
        ├── toc.js          # TOC高亮与折叠
        └── main.js         # 回到顶部等通用功能
```

---

## 使用方式

```yaml
# site.yaml
title: 我的技术笔记
theme: double-folding
darkMode: true
```

---

## 特性清单

- [x] 三栏布局（左导航 + 中内容 + 右索引）
- [x] 双侧可折叠导航
- [x] 固定右侧 TOC，滚动高亮
- [x] TOC 支持 h2-h6 五级标题
- [x] 点击文章后侧边栏滚动位置保持
- [x] 所有控制按钮统一 24x24px
- [x] 文章名最多显示两行带省略号
- [x] 回到顶部按钮
- [x] 无顶部导航栏
- [x] 响应式设计
- [x] 暗色模式支持
- [x] 文章分页导航（上一篇/下一篇）
