# 主题设计指南

本文档指导如何为 LightMark 静态站点生成器开发主题，基于当前项目架构实现。

---

## 1. 核心架构理解

### 1.1 核心与主题的分工

```
┌─────────────────────────────────────────────────────────────┐
│                      LightMark Core                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   Parser   │  │ Generator  │  │  Renderer  │             │
│  │            │  │            │  │            │             │
│  │ - Markdown │  │ - 组织数据  │  │ - Nunjucks │             │
│  │ - FrontMatter│ │ - 生成索引  │  │ - 模板渲染  │             │
│  │ - TOC      │  │ - URL生成   │  │            │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ 传递结构化数据
┌─────────────────────────────────────────────────────────────┐
│                      Your Theme                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │ Templates  │  │    CSS     │  │    JS      │             │
│  │            │  │            │  │            │             │
│  │ - 页面结构  │  │ - 视觉样式  │  │ - 交互逻辑  │             │
│  │ - 布局定义  │  │ - 响应式    │  │ - 搜索功能  │             │
│  │ - 组件复用  │  │ - 主题切换  │  │ - 目录导航  │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 数据流向

```
Markdown Files
      │
      ▼
┌─────────────────┐
│  Core Parser    │  →  解析 Front Matter + Markdown
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Core Generator │  →  组织系列、标签、生成索引
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Theme Templates │  →  Nunjucks 渲染 HTML
└─────────────────┘
      │
      ▼
   dist/ 输出
```

---

## 2. 主题目录结构

```
themes/<your-theme-name>/
├── templates/              # 必需：Nunjucks 模板
│   ├── layout.html         # 基础布局（必须）
│   ├── home.html           # 首页（必须）
│   ├── series.html         # 系列页（必须）
│   ├── article.html        # 文章页（必须）
│   ├── tags.html           # 标签列表页（必须）
│   └── tag.html            # 单个标签页（必须）
│
├── assets/                 # 必需：静态资源
│   ├── css/
│   │   ├── base.css        # CSS 变量、重置样式
│   │   ├── layout.css      # 布局样式
│   │   ├── components.css  # 组件样式
│   │   └── dark.css        # 暗色模式（可选）
│   └── js/
│       ├── main.js         # 入口脚本
│       ├── toc.js          # 目录导航（可选）
│       ├── search.js       # 搜索功能（可选）
│       └── theme.js        # 主题切换（可选）
│
└── theme.yaml              # 可选：主题元信息
```

---

## 3. 模板变量参考

### 3.1 全局可用变量

所有模板都可以访问以下变量：

| 变量 | 类型 | 说明 |
|------|------|------|
| `site` | Object | 站点配置（site.yaml 内容） |
| `allSeries` | Array | 所有系列列表 |
| `allTags` | Array | 所有标签名称列表 |
| `page` | Object | 当前页面信息 |
| `rootPath` | String | 当前页面到站点根目录的相对路径 |

> **注意**：`rootPath` 用于构建相对路径，确保站点可移植。详见 [3.6 相对路径设计](#36-相对路径设计)。

### 3.2 site 对象

```javascript
{
  title: '我的笔记站',           // 网站标题
  description: '技术学习笔记',    // 网站描述
  author: 'your-name',           // 作者
  url: 'https://example.com',    // 网站 URL
  language: 'zh-CN'              // 语言
}
```

### 3.3 Series 对象

```javascript
{
  name: 'go-basics',             // 系列标识名（URL 用）
  title: 'Go语言基础',            // 系列显示标题
  url: '/series/go-basics/',     // 系列 URL
  articles: [                    // 文章数组（已按 order 排序）
    {
      title: '文章标题',
      url: '/series/go-basics/intro.html',
      date: '2026-03-01',
      excerpt: '摘要...',
      tags: ['go', 'basics'],
      order: 1
    }
  ]
}
```

### 3.4 Article 对象

```javascript
{
  title: '文章标题',
  date: '2026-03-01',
  tags: ['go', 'basics'],
  excerpt: '摘要内容',
  series: 'go-basics',           // 所属系列
  seriesTitle: 'Go语言基础',      // 系列显示名
  order: 1,                      // 系列内排序
  slug: 'intro',                 // URL 片段
  url: '/series/go-basics/intro.html',
  content: '<p>HTML 内容...</p>', // 仅在 article.html 可用
  toc: [                         // 仅在 article.html 可用
    { level: 2, text: '标题', id: 'heading-id' }
  ]
}
```

### 3.5 页面类型特定变量

#### 首页 (home.html)

```javascript
{
  page: {
    template: 'home',
    title: '网站标题'
  }
  // allSeries 已包含所有数据
}
```

#### 系列页 (series.html)

```javascript
{
  page: {
    template: 'series',
    title: '系列标题'
  },
  series: { /* 当前系列对象 */ }
}
```

#### 文章页 (article.html)

```javascript
{
  page: {
    template: 'article',
    title: '文章标题'
  },
  article: { /* 文章对象 */ },
  content: '<p>HTML...</p>',     // 文章正文（已转义）
  toc: [ /* 目录数组 */ ],        // 目录结构
  series: { /* 当前系列 */ }      // 所属系列信息
}
```

#### 标签列表页 (tags.html)

```javascript
{
  page: {
    template: 'tags',
    title: 'Tags'
  },
  tags: {
    'go': [ /* 文章数组 */ ],
    'basics': [ /* 文章数组 */ ]
  }
}
```

#### 标签详情页 (tag.html)

```javascript
{
  page: {
    template: 'tag',
    title: 'Tag: go'
  },
  tag: 'go',                     // 当前标签名
  articles: [ /* 该标签下的文章 */ ]
}
```

---

## 4. Nunjucks 过滤器

Core 提供了以下自定义过滤器：

| 过滤器 | 用法 | 说明 |
|--------|------|------|
| `date` | `{{ date \| date('YYYY-MM-DD') }}` | 格式化日期 |
| `slug` | `{{ title \| slug }}` | 转换为 URL slug |
| `truncate` | `{{ content \| truncate(200) }}` | 截取文本 |
| `striptags` | `{{ html \| striptags }}` | 去除 HTML 标签 |
| `json` | `{{ obj \| json }}` | JSON 序列化 |
| `unique` | `{{ arr \| unique }}` | 数组去重 |
| `sortBy` | `{{ arr \| sortBy('date', 'desc') }}` | 按属性排序 |

示例：

```html
<!-- 格式化日期 -->
<time>{{ article.date | date('YYYY年MM月DD日') }}</time>

<!-- 生成 slug -->
<a href="#{{ heading.text | slug }}">{{ heading.text }}</a>

<!-- 截取摘要 -->
<p>{{ article.content | striptags | truncate(150) }}</p>

<!-- 输出 JSON 给 JS 使用 -->
<script>
  const siteData = {{ { series: allSeries } | json | safe }};
</script>
```

---

## 5. 模板编写指南

### 5.1 基础布局模板 (layout.html)

所有页面模板都应继承此布局：

```html
<!DOCTYPE html>
<html lang="{{ site.language }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}{{ site.title }}{% endblock %}</title>
  <meta name="description" content="{{ site.description }}">

  <!-- 样式文件 -->
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/layout.css">
  <link rel="stylesheet" href="/assets/css/components.css">
  {% block styles %}{% endblock %}
</head>
<body>
  <!-- 站点头部 -->
  <header class="site-header">
    <a href="/" class="site-title">{{ site.title }}</a>
    <nav class="site-nav">
      {% for s in allSeries %}
        <a href="{{ s.url }}">{{ s.title }}</a>
      {% endfor %}
      <button class="search-toggle">搜索</button>
    </nav>
  </header>

  <!-- 页面内容 -->
  <main class="{% block mainClass %}{% endblock %}">
    {% block content %}{% endblock %}
  </main>

  <!-- 站点底部 -->
  <footer class="site-footer">
    <p>&copy; {{ site.author }}</p>
  </footer>

  <!-- 脚本 -->
  <script src="/assets/js/main.js"></script>
  {% block scripts %}{% endblock %}
</body>
</html>
```

### 5.2 首页模板 (home.html)

```html
{% extends "layout.html" %}

{% block title %}{{ site.title }}{% endblock %}
{% block mainClass %}home{% endblock %}

{% block content %}
<div class="home-container">
  {% for series in allSeries %}
  <section class="series-card">
    <h2 class="series-title">
      <a href="{{ series.url }}">{{ series.title }}</a>
    </h2>
    <ul class="article-list">
      {% for article in series.articles %}
      <li class="article-item">
        <a href="{{ article.url }}">{{ article.title }}</a>
        <span class="article-date">{{ article.date | date('MM-DD') }}</span>
      </li>
      {% endfor %}
    </ul>
  </section>
  {% endfor %}
</div>
{% endblock %}
```

### 5.3 系列页模板 (series.html)

```html
{% extends "layout.html" %}

{% block title %}{{ series.title }} - {{ site.title }}{% endblock %}
{% block mainClass %}series-page{% endblock %}

{% block content %}
<div class="series-layout">
  <!-- 左侧：系列文章列表 -->
  <aside class="series-sidebar">
    <h2>{{ series.title }}</h2>
    <nav class="series-nav">
      {% for article in series.articles %}
      <a href="{{ article.url }}" class="series-link">
        <span class="order">{{ article.order }}</span>
        <span class="title">{{ article.title }}</span>
      </a>
      {% endfor %}
    </nav>
  </aside>

  <!-- 中间：最新文章内容 -->
  <article class="series-content">
    {% if series.firstArticle %}
    <h1>{{ series.firstArticle.title }}</h1>
    <div class="article-meta">
      <time>{{ series.firstArticle.date }}</time>
      {% for tag in series.firstArticle.tags %}
      <span class="tag">{{ tag }}</span>
      {% endfor %}
    </div>
    <div class="article-body">
      {{ series.firstArticle.content | safe }}
    </div>
    {% else %}
    <p>该系列暂无文章</p>
    {% endif %}
  </article>
</div>
{% endblock %}
```

### 5.4 文章页模板 (article.html)

```html
{% extends "layout.html" %}

{% block title %}{{ article.title }} - {{ site.title }}{% endblock %}
{% block mainClass %}article-page{% endblock %}

{% block content %}
<div class="article-layout">
  <!-- 左侧：系列导航 -->
  <aside class="series-sidebar">
    <h2>{{ series.title }}</h2>
    <nav class="series-nav">
      {% for art in series.articles %}
      <a href="{{ art.url }}"
         class="series-link {% if art.url == article.url %}active{% endif %}">
        <span class="order">{{ art.order }}</span>
        <span class="title">{{ art.title }}</span>
      </a>
      {% endfor %}
    </nav>
  </aside>

  <!-- 中间：文章内容 -->
  <article class="article-main">
    <header class="article-header">
      <h1>{{ article.title }}</h1>
      <div class="article-meta">
        <time>{{ article.date | date('YYYY-MM-DD') }}</time>
        {% for tag in article.tags %}
        <a href="/tags/{{ tag }}/" class="tag">{{ tag }}</a>
        {% endfor %}
      </div>
    </header>

    <div class="article-body">
      {{ content | safe }}
    </div>

    <nav class="article-nav">
      {% if article.prev %}
      <a href="{{ article.prev.url }}" class="prev">
        ← {{ article.prev.title }}
      </a>
      {% endif %}
      {% if article.next %}
      <a href="{{ article.next.url }}" class="next">
        {{ article.next.title }} →
      </a>
      {% endif %}
    </nav>
  </article>

  <!-- 右侧：TOC 导航 -->
  {% if toc and toc.length > 0 %}
  <aside class="toc-sidebar">
    <div class="toc">
      <h3>目录</h3>
      <ul>
        {% for item in toc %}
        <li class="toc-level-{{ item.level }}">
          <a href="#{{ item.id }}">{{ item.text }}</a>
        </li>
        {% endfor %}
      </ul>
    </div>
  </aside>
  {% endif %}
</div>
{% endblock %}

{% block scripts %}
<script src="/assets/js/toc.js"></script>
{% endblock %}
```

### 5.5 标签页模板

**tags.html**（标签列表）：

```html
{% extends "layout.html" %}

{% block title %}标签 - {{ site.title }}{% endblock %}
{% block mainClass %}tags-page{% endblock %}

{% block content %}
<div class="tags-container">
  <h1>所有标签</h1>
  <div class="tags-cloud">
    {% for tagName, tagArticles in tags %}
    <a href="/tags/{{ tagName }}/" class="tag-item">
      {{ tagName }}
      <span class="count">({{ tagArticles.length }})</span>
    </a>
    {% endfor %}
  </div>
</div>
{% endblock %}
```

**tag.html**（单个标签）：

```html
{% extends "layout.html" %}

{% block title %}{{ tag }} - {{ site.title }}{% endblock %}
{% block mainClass %}tag-page{% endblock %}

{% block content %}
<div class="tag-container">
  <h1>标签: {{ tag }}</h1>
  <ul class="article-list">
    {% for article in articles %}
    <li class="article-item">
      <a href="{{ article.url }}">{{ article.title }}</a>
      <span class="series">{{ article.seriesTitle }}</span>
      <time>{{ article.date }}</time>
    </li>
    {% endfor %}
  </ul>
</div>
{% endblock %}
```

---

## 6. CSS 架构建议

### 6.1 CSS 变量系统

```css
/* base.css - 定义设计令牌 */
:root {
  /* 颜色 */
  --color-bg: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-text: #1a1a1a;
  --color-text-secondary: #666666;
  --color-border: #e0e0e0;
  --color-accent: #0066cc;
  --color-accent-hover: #0052a3;

  /* 字体 */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: "SF Mono", Monaco, Consolas, monospace;

  /* 间距 */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* 尺寸 */
  --sidebar-width: 260px;
  --toc-width: 220px;
  --content-max-width: 720px;

  /* 过渡 */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease;
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1a1a;
    --color-bg-secondary: #252525;
    --color-text: #e0e0e0;
    --color-text-secondary: #999999;
    --color-border: #333333;
    --color-accent: #66b3ff;
    --color-accent-hover: #4d9fe6;
  }
}
```

### 6.2 布局系统

```css
/* layout.css */

/* 三栏布局 */
.article-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr var(--toc-width);
  gap: var(--space-xl);
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-lg);
}

/* 系列侧边栏 */
.series-sidebar {
  position: sticky;
  top: var(--space-lg);
  height: calc(100vh - var(--space-lg) * 2);
  overflow-y: auto;
}

/* 文章内容 */
.article-main {
  min-width: 0; /* 防止 grid 子项溢出 */
}

/* TOC 侧边栏 */
.toc-sidebar {
  position: sticky;
  top: var(--space-lg);
}

/* 响应式 */
@media (max-width: 1200px) {
  .article-layout {
    grid-template-columns: var(--sidebar-width) 1fr;
  }
  .toc-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .article-layout {
    grid-template-columns: 1fr;
  }
  .series-sidebar {
    display: none; /* 移动端使用抽屉 */
  }
}
```

---

## 7. JavaScript 功能实现

### 7.1 目录导航 (toc.js)

```javascript
/**
 * TOC 高亮当前阅读位置
 */
class TocHighlighter {
  constructor() {
    this.tocLinks = document.querySelectorAll('.toc a');
    this.headings = document.querySelectorAll('.article-body [id]');
    this.currentActive = null;

    this.init();
  }

  init() {
    if (!this.headings.length) return;

    // 使用 IntersectionObserver 监听标题进入视口
    const observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
      }
    );

    this.headings.forEach(heading => observer.observe(heading));
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.activateTocItem(entry.target.id);
      }
    });
  }

  activateTocItem(id) {
    if (this.currentActive) {
      this.currentActive.classList.remove('active');
    }

    const link = document.querySelector(`.toc a[href="#${id}"]`);
    if (link) {
      link.classList.add('active');
      this.currentActive = link;
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new TocHighlighter();
});
```

### 7.2 搜索功能 (search.js)

```javascript
/**
 * 客户端搜索
 */
class SiteSearch {
  constructor() {
    this.index = null;
    this.searchInput = document.querySelector('.search-input');
    this.resultsContainer = document.querySelector('.search-results');

    this.init();
  }

  async init() {
    // 加载搜索索引
    try {
      const response = await fetch('/assets/search-index.json');
      this.index = await response.json();
    } catch (err) {
      console.error('Failed to load search index:', err);
      return;
    }

    // 绑定事件
    this.searchInput?.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });
  }

  handleSearch(query) {
    if (!query || query.length < 2) {
      this.resultsContainer.innerHTML = '';
      return;
    }

    // 简单搜索实现（生产环境建议使用 Fuse.js）
    const results = this.index.filter(item => {
      const text = `${item.title} ${item.content} ${item.tags.join(' ')}`.toLowerCase();
      return text.includes(query.toLowerCase());
    });

    this.renderResults(results.slice(0, 10));
  }

  renderResults(results) {
    if (!results.length) {
      this.resultsContainer.innerHTML = '<p>无搜索结果</p>';
      return;
    }

    this.resultsContainer.innerHTML = results
      .map(r => `
        <a href="${r.url}" class="search-result">
          <h4>${r.title}</h4>
          <p>${r.excerpt}</p>
        </a>
      `).join('');
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new SiteSearch();
});
```

### 7.3 主题切换 (theme.js)

```javascript
/**
 * 暗色/亮色模式切换
 */
class ThemeToggle {
  constructor() {
    this.toggleBtn = document.querySelector('.theme-toggle');
    this.currentTheme = localStorage.getItem('theme');

    this.init();
  }

  init() {
    // 应用保存的主题或系统偏好
    if (this.currentTheme) {
      document.documentElement.setAttribute('data-theme', this.currentTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // 绑定切换事件
    this.toggleBtn?.addEventListener('click', () => this.toggle());
  }

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new ThemeToggle();
});
```

---

## 8. 主题配置 (theme.yaml)

可选的主题元信息文件：

```yaml
name: minimal
version: 1.0.0
description: A clean and minimal theme for LightMark
author: Your Name
license: MIT

# 主题支持的功能
features:
  - dark-mode
  - search
  - responsive

# 主题依赖（如果有）
dependencies: []
```

---

## 9. 开发工作流

### 9.1 创建新主题

```bash
# 1. 创建主题目录
mkdir -p themes/my-theme/{templates,assets/{css,js}}

# 2. 复制默认主题作为起点（可选）
cp -r themes/minimal/templates/* themes/my-theme/templates/

# 3. 修改 site.yaml 使用新主题
echo "theme: my-theme" >> site.yaml

# 4. 构建并预览
lightmark build
```

### 9.2 调试技巧

1. **查看可用变量**：在模板中添加 `{{ page | json | safe }}`
2. **检查构建输出**：查看 `dist/` 目录生成的 HTML
3. **使用浏览器开发者工具**：检查元素、查看控制台错误

### 9.3 性能优化

1. **CSS**：使用 CSS 变量，避免过度嵌套
2. **JS**：延迟加载非关键脚本
3. **图片**：使用现代格式（WebP），添加懒加载
4. **字体**：使用系统字体栈或字体子集

---

## 10. 最佳实践

1. **移动优先**：先设计移动端，再通过 media query 扩展
2. **可访问性**：确保足够的颜色对比度，支持键盘导航
3. **渐进增强**：核心功能不依赖 JavaScript
4. **语义化 HTML**：使用正确的标签（nav、main、article 等）
5. **CSS 隔离**：避免使用全局选择器污染样式

---

## 11. 参考资源

- [Nunjucks 文档](https://mozilla.github.io/nunjucks/)
- [default-theme.md](../themes/default-theme.md) - 默认主题实现细节
- [core-design.md](./core-design.md) - 核心架构说明
