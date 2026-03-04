# Double Folding 主题设计文档

## 概述

Double Folding 是一个专为技术文档和系列教程设计的 LightMark 主题。采用双栏折叠导航设计，左侧为系列/文章导航，右侧为页面内标题索引，中间为主内容区。三栏布局充分利用宽屏空间，同时保持内容的可读性。

---

## 设计目标

1. **沉浸式阅读**：移除顶部导航栏，减少视觉干扰
2. **快速导航**：左侧系列切换 + 右侧标题索引，实现高效跳转
3. **空间优化**：可折叠的左侧导航，适应不同阅读习惯
4. **上下文保持**：始终可见的导航元素，不随滚动消失

---

## 布局架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌──────────────┐  ┌──────────────────────────────────┐  ┌──────────┐  │
│  │              │  │                                  │  │          │  │
│  │  系列导航     │  │         主内容区                  │  │ 标题索引 │  │
│  │  (可折叠)     │  │                                  │  │ (固定)   │  │
│  │              │  │    首页显示第一篇文章              │  │          │  │
│  │  [系列A ▼]   │  │                                  │  │ 1. 概述   │  │
│  │   - 文章1    │  │    文章内容...                   │  │ 2. 安装   │  │
│  │   - 文章2    │  │                                  │  │   2.1    │  │
│  │   - 文章3    │  │                                  │  │   2.2    │  │
│  │  [系列B ▶]   │  │                                  │  │ 3. 使用   │  │
│  │              │  │                                  │  │          │  │
│  │  [-] 折叠    │  │                                  │  │          │  │
│  └──────────────┘  └──────────────────────────────────┘  └──────────┘  │
│                                                                         │
│                                          [▲] 回到顶部                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 页面结构

### 1. 首页 (home.html)

**功能**：显示默认系列（第一个系列）的第一篇文章

**数据需求**：
- `allSeries` - 所有系列列表
- 默认选中 `allSeries[0]`
- 显示该系列的 `firstArticle`

**交互逻辑**：
- 左侧导航显示所有系列
- 默认展开第一个系列
- 点击系列名称切换展开/收起
- 点击文章标题加载对应文章

### 2. 系列页 (series.html)

**功能**：显示指定系列的文章列表和第一篇文章

**数据需求**：
- `series` - 当前系列对象
- `series.articles` - 系列内文章列表
- `series.firstArticle` - 系列第一篇文章

**交互逻辑**：
- 左侧高亮当前系列并展开
- 主内容区显示第一篇文章完整内容

### 3. 文章页 (article.html)

**功能**：显示单篇文章内容

**数据需求**：
- `article` - 当前文章对象
- `content` - 文章 HTML 内容
- `toc` - 文章目录（h1, h2, h3）
- `series` - 所属系列信息

**交互逻辑**：
- 左侧展开当前文章所属系列
- 高亮当前文章在系列中的位置
- 右侧 TOC 高亮当前阅读位置

### 4. 标签页 (tags.html, tag.html)

**功能**：标签云和标签文章列表

**布局调整**：
- 左侧导航简化，显示返回首页链接
- 主内容区显示标签相关内容
- 右侧 TOC 隐藏（标签页无固定内容结构）

---

## 导航组件详细设计

### 左侧系列导航

#### 视觉设计
```
┌─────────────────┐
│  📁 系列导航    │  ← 头部，带折叠按钮 [-]
├─────────────────┤
│ ▼ Go语言基础    │  ← 展开的系列
│   ○ 环境搭建    │  ← 文章（未选中）
│   ● 基础语法    │  ← 文章（当前选中）
│   ○ 函数与方法  │
├─────────────────┤
│ ▶ Web前端开发   │  ← 收起的系列
├─────────────────┤
│ ▶ 数据库原理    │
└─────────────────┘
```

#### 数据结构
```javascript
{
  // 系列列表（来自 allSeries）
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
  // 当前状态
  state: {
    expandedSeries: 'go-basics',  // 当前展开的系列名
    currentArticle: 'syntax'      // 当前选中的文章slug
  }
}
```

#### 交互行为

| 操作 | 行为 |
|------|------|
| 点击系列名称 | 展开该系列，收起其他；加载系列第一篇文章 |
| 点击文章标题 | 加载对应文章；URL 更新为文章地址 |
| 点击 [-] 按钮 | 收起所有系列，只显示系列名称列表 |
| 点击 [+] 按钮 | 恢复展开状态 |

### 右侧标题索引 (TOC)

#### 视觉设计
```
┌─────────────────┐
│     目录        │  ← 固定头部
├─────────────────┤
│ 1. 概述         │  ← h1 标题
│   1.1 背景      │  ← h2 标题（缩进）
│   1.2 目标      │
│ 2. 安装指南     │
│   2.1 环境要求  │
│   2.2 安装步骤  │
│     2.2.1       │  ← h3 标题（更多缩进）
│ 3. 使用说明     │
└─────────────────┘
     ↑
   当前阅读位置高亮（蓝色）
```

#### 数据结构
```javascript
// 来自模板变量 `toc`
[
  { level: 1, text: '概述', id: 'overview' },
  { level: 2, text: '背景', id: 'background' },
  { level: 2, text: '目标', id: 'goals' },
  { level: 1, text: '安装指南', id: 'installation' }
]
```

#### 交互行为

| 操作 | 行为 |
|------|------|
| 点击标题 | 平滑滚动到对应位置；URL 更新锚点 |
| 页面滚动 | 自动高亮当前可见的标题 |
| 滚动到顶部 | 第一个标题高亮 |

---

## 样式规范

### 色彩系统

```css
:root {
  /* 主色调 */
  --color-primary: #2563eb;        /* 蓝色 - 链接、高亮 */
  --color-primary-light: #3b82f6;  /* 浅蓝 - hover */
  --color-primary-dark: #1d4ed8;   /* 深蓝 - active */

  /* 背景色 */
  --color-bg-main: #ffffff;        /* 主内容区背景 */
  --color-bg-sidebar: #f8fafc;     /* 侧边栏背景 */
  --color-bg-hover: #f1f5f9;       /* hover 背景 */

  /* 文字色 */
  --color-text-primary: #1e293b;   /* 主文字 */
  --color-text-secondary: #64748b; /* 次要文字 */
  --color-text-muted: #94a3b8;     /* 辅助文字 */

  /* 边框 */
  --color-border: #e2e8f0;
  --color-border-light: #f1f5f9;
}

/* 暗色模式 */
[data-theme="dark"] {
  --color-bg-main: #0f172a;
  --color-bg-sidebar: #1e293b;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-border: #334155;
}
```

### 布局尺寸

```css
:root {
  /* 侧边栏宽度 */
  --sidebar-width: 280px;          /* 左侧系列导航 */
  --toc-width: 240px;              /* 右侧标题索引 */

  /* 内容区 */
  --content-max-width: 800px;      /* 最大内容宽度 */
  --content-padding: 40px;         /* 内容区内边距 */

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 字体 */
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
}
```

### 响应式断点

| 断点 | 布局调整 |
|------|----------|
| ≥1400px | 三栏完整显示 |
| 1024-1399px | 隐藏右侧 TOC，左侧保持 |
| 768-1023px | 左侧变为抽屉，默认隐藏 |
| <768px | 左侧抽屉，底部固定 TOC 按钮 |

---

## JavaScript 功能模块

### 1. 左侧导航控制 (sidebar.js)

```javascript
/**
 * 左侧系列导航控制器
 */
class SeriesNav {
  constructor() {
    this.container = document.querySelector('.series-nav');
    this.collapseBtn = document.querySelector('.nav-collapse-btn');
    this.isCollapsed = false;
    this.expandedSeries = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadState();
  }

  bindEvents() {
    // 系列展开/收起
    this.container.addEventListener('click', (e) => {
      if (e.target.matches('.series-header')) {
        const seriesName = e.target.dataset.series;
        this.toggleSeries(seriesName);
      }
    });

    // 折叠按钮
    this.collapseBtn?.addEventListener('click', () => {
      this.toggleCollapse();
    });
  }

  toggleSeries(seriesName) {
    if (this.expandedSeries === seriesName) {
      this.collapseSeries(seriesName);
    } else {
      this.expandSeries(seriesName);
      this.loadFirstArticle(seriesName);
    }
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.container.classList.toggle('collapsed', this.isCollapsed);
    this.saveState();
  }
}
```

### 2. TOC 高亮控制器 (toc.js)

```javascript
/**
 * 右侧标题索引控制器
 */
class TocHighlighter {
  constructor() {
    this.toc = document.querySelector('.toc-nav');
    this.headings = document.querySelectorAll('.article-content h1, .article-content h2, .article-content h3');
    this.activeLink = null;

    this.init();
  }

  init() {
    if (!this.headings.length) return;

    // 使用 IntersectionObserver 监听标题可见性
    const observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0
      }
    );

    this.headings.forEach(heading => observer.observe(heading));

    // 点击平滑滚动
    this.toc?.addEventListener('click', (e) => {
      if (e.target.matches('.toc-link')) {
        e.preventDefault();
        const id = e.target.getAttribute('href').slice(1);
        this.scrollToHeading(id);
      }
    });
  }

  handleIntersection(entries) {
    // 找到最靠近视口顶部的可见标题
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

    if (visible.length > 0) {
      this.highlightTocItem(visible[0].target.id);
    }
  }

  scrollToHeading(id) {
    const heading = document.getElementById(id);
    if (heading) {
      heading.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, null, `#${id}`);
    }
  }
}
```

### 3. 回到顶部 (back-to-top.js)

```javascript
/**
 * 回到顶部按钮
 */
class BackToTop {
  constructor() {
    this.button = document.querySelector('.back-to-top');
    this.showThreshold = 300;

    this.init();
  }

  init() {
    if (!this.button) return;

    window.addEventListener('scroll', () => {
      this.toggleVisibility();
    });

    this.button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  toggleVisibility() {
    const shouldShow = window.pageYOffset > this.showThreshold;
    this.button.classList.toggle('visible', shouldShow);
  }
}
```

---

## 模板文件清单

| 文件 | 用途 | 特殊说明 |
|------|------|----------|
| `layout.html` | 基础布局 | 无顶部导航，定义三栏结构 |
| `home.html` | 首页 | 显示默认系列的第一篇文章 |
| `series.html` | 系列页 | 显示系列文章列表和第一篇文章 |
| `article.html` | 文章页 | 完整文章内容，带 TOC |
| `tags.html` | 标签列表 | 简化的左侧导航 |
| `tag.html` | 单个标签 | 简化的左侧导航 |

---

## 与 Core 的约定

### 依赖的数据结构

```yaml
# 全局可用
site: { title, description, author, language }
allSeries: [{ name, title, url, articles, firstArticle }]
allTags: [string]
page: { template, title, rootPath }

# 页面特定
series: { name, title, articles, firstArticle }
article: { title, date, tags, series, seriesTitle, order, slug, url, prev, next, content, toc }
content: "HTML string"
toc: [{ level, text, id }]
tags: { tagName: [articles] }
```

### URL 结构约定

- 首页：`index.html`
- 系列：`series/{name}/index.html`
- 文章：`series/{name}/{slug}.html`
- 标签列表：`tags/index.html`
- 单个标签：`tags/{name}/index.html`

---

## 文件结构

```
themes/double-folding/
├── theme.yaml              # 主题元信息
├── templates/
│   ├── layout.html         # 基础布局（无顶部导航）
│   ├── home.html           # 首页
│   ├── series.html         # 系列页
│   ├── article.html        # 文章页
│   ├── tags.html           # 标签列表
│   └── tag.html            # 单个标签
└── assets/
    ├── css/
    │   ├── base.css        # 基础样式、CSS变量
    │   ├── layout.css      # 三栏布局
    │   ├── sidebar.css     # 左侧系列导航
    │   ├── toc.css         # 右侧标题索引
    │   ├── article.css     # 文章内容样式
    │   └── responsive.css  # 响应式调整
    └── js/
        ├── sidebar.js      # 左侧导航控制
        ├── toc.js          # TOC高亮
        └── back-to-top.js  # 回到顶部
```

---

## 使用方式

```yaml
# site.yaml
title: 我的技术笔记
theme: double-folding

# 可选的主题配置（未来扩展）
themeConfig:
  defaultExpanded: true        # 默认展开第一个系列
  tocMaxLevel: 3               # TOC 显示的最大标题层级
  sidebarWidth: 280            # 侧边栏宽度（px）
```

---

## 特性清单

- [x] 三栏布局（左导航 + 中内容 + 右索引）
- [x] 可折叠的系列导航
- [x] 固定右侧 TOC，滚动高亮
- [x] 首页显示默认系列文章
- [x] 回到顶部按钮
- [x] 无顶部导航栏
- [x] 响应式设计
- [x] 暗色模式支持
- [ ] 本地存储记住折叠状态
- [ ] 移动端手势支持
- [ ] 键盘快捷键（如 `?` 显示帮助）
