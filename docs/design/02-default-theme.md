# 默认主题实现方案

## 1. 职责定义

主题只负责：
- 页面HTML结构
- 样式（CSS）
- 前端交互（JS）

**不关心**：内容解析、数据生成、构建流程

---

## 2. 目录结构

```
themes/minimal/
├── templates/
│   ├── layout.html        # 基础布局
│   ├── home.html          # 首页
│   ├── series.html        # 系列页（含文章目录）
│   ├── article.html       # 文章页（继承 series）
│   ├── tags.html          # 标签云
│   └── tag.html           # 单标签页
│
├── assets/
│   ├── css/
│   │   ├── base.css       # 基础样式、变量
│   │   ├── layout.css     # 布局样式
│   │   ├── components.css # 组件样式
│   │   └── dark.css       # 暗色模式
│   └── js/
│       ├── main.js        # 入口
│       ├── toc.js         # 目录导航
│       ├── search.js      # 搜索功能
│       └── sidebar.js     # 侧边栏交互
│
└── theme.yaml
```

---

## 3. 页面布局设计

### 首页

```
┌─────────────────────────────────────────────────┐
│  网站名                        系列1 系列2 🔍   │
├─────────────────────────────────────────────────┤
│                                                 │
│  系列1                                           │
│  ├── 文章1                                       │
│  ├── 文章2                                       │
│  └── 文章3                                       │
│                                                 │
│  系列2                                           │
│  ├── 文章1                                       │
│  └── 文章2                                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 系列页（点击系列后进入）

```
┌─────────────────────────────────────────────────────────────┐
│  网站名                          系列1 系列2 🔍   [暗/亮]   │
├────────────┬──────────────────────────────┬────────────────┤
│            │                              │                │
│  系列1     │     文章标题                  │  目录导航       │
│            │     日期 | 标签               │                │
│  > 文章1   │                              │  ┌─ 标题1       │
│    文章2   │     正文内容...               │  ├─ 标题2       │
│    文章3   │                              │  │  └─ 子标题    │
│            │                              │  └─ 标题3       │
│            │                              │                │
│            │     上一篇 | 下一篇          │  (点击跳转)     │
├────────────┴──────────────────────────────┴────────────────┤
│                          Footer                             │
└─────────────────────────────────────────────────────────────┘
```

### 移动端适配

```
┌─────────────────────┐
│ 网站名    系列 🔍   │
├─────────────────────┤
│ [目录]  [文章目录]  │  ← 点击展开抽屉
├─────────────────────┤
│                     │
│     文章标题        │
│     正文内容...     │
│                     │
├─────────────────────┤
│  上一篇 | 下一篇    │
└─────────────────────┘
```

---

## 4. 页面模板设计

### layout.html（基础布局）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}{{ site.title }}{% endblock %}</title>
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/layout.css">
  <link rel="stylesheet" href="/assets/css/components.css">
  <link rel="stylesheet" href="/assets/css/dark.css">
</head>
<body>
  <header class="site-header">
    <a href="/" class="site-title">{{ site.title }}</a>
    <nav class="site-nav">
      {% for s in allSeries %}
        <a href="/series/{{ s.name }}/">{{ s.title }}</a>
      {% endfor %}
      <button class="search-btn">搜索</button>
    </nav>
  </header>

  {% block content %}{% endblock %}

  <footer class="site-footer">
    <p>© {{ site.author }}</p>
  </footer>

  <script src="/assets/js/main.js"></script>
</body>
</html>
```

### series.html（系列页布局）

```html
{% extends "layout.html" %}

{% block content %}
<div class="series-container">
  <!-- 左侧：系列文章目录 -->
  <aside class="series-sidebar">
    <h2>{{ series.title }}</h2>
    <ul class="article-list">
      {% for article in series.articles %}
      <li>
        <a href="{{ article.url }}"
           class="{% if article.url == page.url %}active{% endif %}">
          {{ article.title }}
        </a>
      </li>
      {% endfor %}
    </ul>
  </aside>

  <!-- 中间：文章内容 -->
  <main class="article-content">
    {% block article %}{% endblock %}
  </main>

  <!-- 右侧：TOC导航 -->
  <aside class="toc-sidebar">
    <div class="toc"></div>
  </aside>
</div>
{% endblock %}
```

### article.html（继承 series）

```html
{% extends "series.html" %}

{% block article %}
<article>
  <header class="article-header">
    <h1>{{ page.title }}</h1>
    <div class="meta">
      <time>{{ page.date }}</time>
      {% for tag in page.tags %}
      <span class="tag">{{ tag }}</span>
      {% endfor %}
    </div>
  </header>

  <div class="article-body">
    {{ content | safe }}
  </div>

  <nav class="article-nav">
    {% if page.prev %}
    <a href="{{ page.prev.url }}">← {{ page.prev.title }}</a>
    {% endif %}
    {% if page.next %}
    <a href="{{ page.next.url }}">{{ page.next.title }} →</a>
    {% endif %}
  </nav>
</article>
{% endblock %}
```

### home.html（首页）

```html
{% extends "layout.html" %}

{% block content %}
<main class="home">
  {% for series in allSeries %}
  <section class="series-section">
    <h2><a href="/series/{{ series.name }}/">{{ series.title }}</a></h2>
    <ul class="article-list">
      {% for article in series.articles %}
      <li>
        <a href="{{ article.url }}">{{ article.title }}</a>
        <span class="date">{{ article.date }}</span>
      </li>
      {% endfor %}
    </ul>
  </section>
  {% endfor %}
</main>
{% endblock %}
```

---

## 5. 样式设计

### CSS 变量系统

```css
:root {
  /* 亮色模式 */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --accent-color: #0066cc;
  --code-bg: #f8f8f8;
}

[data-theme="dark"] {
  /* 暗色模式 */
  --bg-primary: #1a1a1a;
  --bg-secondary: #252525;
  --text-primary: #e0e0e0;
  --text-secondary: #999999;
  --border-color: #333333;
  --accent-color: #66b3ff;
  --code-bg: #2d2d2d;
}
```

### 布局（三栏响应式）

```css
.series-container {
  display: grid;
  grid-template-columns: 240px 1fr 200px;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 移动端 */
@media (max-width: 768px) {
  .series-container {
    grid-template-columns: 1fr;
  }

  .series-sidebar {
    position: fixed;
    left: -100%;
    /* 抽屉式 */
  }

  .toc-sidebar {
    display: none;
    /* 或底部展开 */
  }
}
```

---

## 6. 前端交互

### toc.js - 目录导航

```javascript
// 功能：
// 1. 解析文章中的 h1-h4，生成 TOC
// 2. 滚动时高亮当前章节
// 3. 点击 TOC 平滑滚动到对应位置

class TocNavigator {
  constructor(container) {
    this.container = container
    this.headings = []
    this.init()
  }

  init() {
    this.parseHeadings()
    this.render()
    this.bindScroll()
  }

  parseHeadings() {
    const article = document.querySelector('.article-body')
    this.headings = Array.from(article.querySelectorAll('h1, h2, h3, h4'))
  }

  render() {
    // 生成 TOC 列表
  }

  bindScroll() {
    // 滚动监听，高亮当前章节
  }

  // ... 其他方法
}
```

### search.js - 全局搜索

```javascript
// 功能：
// 1. 加载 search-index.json
// 2. Fuse.js 模糊搜索
// 3. 展示搜索结果

class Search {
  constructor() {
    this.index = null
    this.fuse = null
  }

  async init() {
    const res = await fetch('/assets/search-index.json')
    this.index = await res.json()
    this.fuse = new Fuse(this.index, {
      keys: ['title', 'content', 'tags']
    })
  }

  search(query) {
    return this.fuse.search(query)
  }
}
```

### sidebar.js - 移动端侧边栏

```javascript
// 功能：
// 1. 抽屉式展开/收起
// 2. 点击外部关闭
// 3. 遮罩层

class Sidebar {
  constructor() {
    this.sidebar = document.querySelector('.series-sidebar')
    this.overlay = null
    this.init()
  }

  init() {
    this.createOverlay()
    this.bindEvents()
  }

  createOverlay() {
    // 创建遮罩层
  }

  bindEvents() {
    // 绑定打开/关闭事件
  }

  open() {
    this.sidebar.classList.add('open')
    this.overlay.classList.add('visible')
  }

  close() {
    this.sidebar.classList.remove('open')
    this.overlay.classList.remove('visible')
  }
}
```

---

## 7. 响应式断点

| 断点 | 布局 |
|------|------|
| > 1200px | 三栏：左目录 + 中文章 + 右TOC |
| 768px - 1200px | 两栏：左目录 + 中文章，TOC收起 |
| < 768px | 单栏：目录抽屉、TOC收起或底部 |

---

## 8. 暗色模式实现

两种方案：

### 方案A：构建时固定
- 在 `site.yaml` 中配置 `theme: minimal-dark`
- 构建时直接输出暗色CSS

### 方案B：运行时切换
- 使用 `data-theme` 属性
- localStorage 记忆用户选择
- 默认跟随系统偏好

**建议采用方案B**，提升用户体验。

```javascript
// main.js
function initTheme() {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (saved) {
    document.documentElement.setAttribute('data-theme', saved)
  } else if (prefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme')
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('theme', next)
}
```

---

## 9. 搜索索引格式

```json
[
  {
    "title": "Go语言入门",
    "url": "/series/go-basics/intro.html",
    "excerpt": "Go是一门...",
    "tags": ["go", "basics"],
    "series": "go-basics"
  }
]
```

---

## 10. 组件清单

| 组件 | 文件 | 功能 |
|------|------|------|
| 头部导航 | layout.html | 站点名、系列链接、搜索按钮 |
| 系列目录 | series.html | 左侧文章列表 |
| TOC导航 | toc.js | 右侧标题导航 |
| 搜索弹窗 | search.js | 全局搜索功能 |
| 主题切换 | main.js | 暗/亮模式切换 |
| 移动端抽屉 | sidebar.js | 移动端目录展开 |
| 文章导航 | article.html | 上一篇/下一篇 |