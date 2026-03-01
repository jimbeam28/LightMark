# 默认主题实现方案

LightMark 默认主题 `minimal` 的完整实现文档。本主题基于 Core 提供的标准数据结构和 Nunjucks 模板引擎实现。

---

## 1. 职责定义

主题只负责：
- 页面 HTML 结构（Nunjucks 模板）
- 视觉样式（CSS）
- 前端交互（JavaScript）

**不关心**：Markdown 解析、数据生成、构建流程（由 Core 处理）

---

## 2. 目录结构

```
themes/minimal/
├── templates/              # Nunjucks 模板文件
│   ├── layout.html         # 基础布局模板（所有页面继承）
│   ├── home.html           # 首页：展示所有系列
│   ├── series.html         # 系列页：系列文章列表 + 首篇文章内容
│   ├── article.html        # 文章页：三栏布局（系列导航 + 文章 + TOC）
│   ├── tags.html           # 标签列表页：所有标签云
│   └── tag.html            # 单个标签页：该标签下的文章列表
│
├── assets/                 # 静态资源
│   ├── css/
│   │   ├── base.css        # CSS 变量、重置样式、基础排版
│   │   ├── layout.css      # 页面布局、网格系统、响应式
│   │   ├── components.css  # 组件样式（按钮、标签、卡片等）
│   │   └── code.css        # 代码块高亮样式
│   └── js/
│       ├── main.js         # 入口：主题切换、移动端菜单、回到顶部
│       ├── toc.js          # TOC 高亮、平滑滚动
│       └── sidebar.js      # 移动端侧边栏抽屉
│
└── theme.yaml              # 主题元信息
```

---

## 3. 可用变量与数据结构

### 3.1 全局变量（所有模板可用）

| 变量 | 类型 | 说明 |
|------|------|------|
| `site` | Object | 站点配置：title, description, author, url, language |
| `allSeries` | Array | 所有系列列表，按名称排序 |
| `allTags` | Array | 所有标签名称列表，按字母排序 |
| `page` | Object | 当前页面信息：template, title |
| `rootPath` | String | 相对路径前缀，用于正确引用静态资源 |

### 3.2 site 对象结构

```yaml
{
  title: '我的笔记站',
  description: '技术学习笔记',
  author: 'your-name',
  url: 'https://example.com',
  language: 'zh-CN'
}
```

### 3.3 Series 对象结构

```yaml
{
  name: 'go-basics',              # 系列目录名
  title: 'Go语言基础',             # 系列显示标题
  url: 'series/go-basics/',       # 系列首页 URL（相对路径）
  articles: [                     # 文章数组（已按 order 排序）
    {
      title: 'Go 语言入门',
      date: '2026-03-01',
      tags: ['go', 'basics'],
      excerpt: '文章摘要...',
      series: 'go-basics',
      seriesTitle: 'Go语言基础',
      order: 1,
      slug: 'intro',
      url: 'series/go-basics/intro.html'
    }
  ],
  firstArticle: { /* 第一篇文章对象 */ }  # 系列首篇文章
}
```

### 3.4 Article 对象结构

```yaml
{
  title: '文章标题',
  date: '2026-03-01',
  tags: ['go', 'basics'],
  excerpt: '摘要内容',
  series: 'go-basics',
  seriesTitle: 'Go语言基础',
  order: 1,
  slug: 'intro',
  url: 'series/go-basics/intro.html',
  content: '<p>HTML 内容...</p>',   # 仅在 article.html 模板可用
  toc: [                              # 仅在 article.html 模板可用
    { level: 2, text: '安装 Go', id: 'install-go' },
    { level: 2, text: 'Hello World', id: 'hello-world' },
    { level: 3, text: '代码解释', id: 'code-explanation' }
  ],
  prev: { /* 上一篇文章 */ },        # 仅在 article.html 模板可用
  next: { /* 下一篇文章 */ }         # 仅在 article.html 模板可用
}
```

### 3.5 各模板特定变量

#### home.html
```yaml
{
  page: { template: 'home', title: '网站标题' },
  rootPath: './'
  # allSeries 包含完整系列数据
}
```

#### series.html
```yaml
{
  page: { template: 'series', title: '系列标题' },
  series: { /* 当前系列完整数据 */ },
  rootPath: '../../'
}
```

#### article.html
```yaml
{
  page: { template: 'article', title: '文章标题' },
  article: { /* 当前文章完整数据 */ },
  content: '<p>HTML...</p>',     # 文章正文（已渲染）
  toc: [ /* 目录数组 */ ],        # 文章目录结构
  series: { /* 当前系列数据 */ }, # 用于左侧导航
  rootPath: '../../'
}
```

#### tags.html
```yaml
{
  page: { template: 'tags', title: 'Tags' },
  tags: [                        # 标签数组（已排序）
    { name: 'go', count: 5, url: 'tags/go/index.html' },
    { name: 'basics', count: 3, url: 'tags/basics/index.html' }
  ],
  rootPath: '../'
}
```

#### tag.html
```yaml
{
  page: { template: 'tag', title: 'Tag: xxx' },
  tag: 'go',                      # 当前标签名
  articles: [ /* 该标签下的文章数组 */ ],
  rootPath: '../../'
}
```

### 3.6 Nunjucks 过滤器

Core 提供的自定义过滤器：

| 过滤器 | 用法 | 输出示例 |
|--------|------|----------|
| `date` | `{{ '2026-03-01' \| date('YYYY-MM-DD') }}` | 2026-03-01 |
| `date` | `{{ '2026-03-01' \| date('YYYY年MM月DD日') }}` | 2026年03月01日 |
| `slug` | `{{ 'Hello World' \| slug }}` | hello-world |
| `truncate` | `{{ content \| truncate(200) }}` | 截取前200字符... |
| `striptags` | `{{ '<p>text</p>' \| striptags }}` | text |
| `json` | `{{ obj \| json }}` | JSON 字符串 |
| `unique` | `{{ [1,1,2] \| unique }}` | [1,2] |
| `sortBy` | `{{ arr \| sortBy('date', 'desc') }}` | 按 date 降序排列 |

---

## 4. 模板实现

### 4.1 layout.html - 基础布局

```html
<!DOCTYPE html>
<html lang="{{ site.language }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}{{ site.title }}{% endblock %}</title>
  <meta name="description" content="{{ site.description }}">

  <!-- 样式文件 -->
  <link rel="stylesheet" href="{{ rootPath }}assets/css/base.css">
  <link rel="stylesheet" href="{{ rootPath }}assets/css/layout.css">
  <link rel="stylesheet" href="{{ rootPath }}assets/css/components.css">
  <link rel="stylesheet" href="{{ rootPath }}assets/css/code.css">

  {% block styles %}{% endblock %}
</head>
<body>
  <!-- 站点头部 -->
  <header class="site-header">
    <div class="header-container">
      <a href="{{ rootPath }}index.html" class="site-title">{{ site.title }}</a>

      <button class="mobile-menu-toggle" aria-label="打开菜单">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav class="site-nav">
        {% for s in allSeries %}
          <a href="..." class="nav-link">{{ s.title }}</a>
        {% endfor %}
        <a href="..." class="nav-link">标签</a>
      </nav>

      <div class="header-actions">
        <button class="theme-toggle" aria-label="切换主题">
          <span class="light-icon">&#9728;</span>
          <span class="dark-icon">&#127769;</span>
        </button>
      </div>
    </div>
  </header>

  <!-- 移动端遮罩 -->
  <div class="mobile-overlay" hidden></div>

  <!-- 页面内容 -->
  <main class="main-content {% block mainClass %}{% endblock %}">
    {% block content %}{% endblock %}
  </main>

  <!-- 站点底部 -->
  <footer class="site-footer">
    <div class="footer-container">
      <p>&copy; {{ site.author }} &middot; 使用 LightMark 构建</p>
    </div>
  </footer>

  <!-- 回到顶部按钮 -->
  <button class="back-to-top" aria-label="回到顶部" hidden>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  </button>

  <!-- 脚本 -->
  <script src="{{ rootPath }}assets/js/main.js"></script>
  {% block scripts %}{% endblock %}
</body>
</html>
```

**关键实现细节：**
- 使用 `{{ rootPath }}` 变量处理相对路径，确保在不同目录层级下资源引用正确
- 导航链接根据当前页面模板类型（`page.template`）生成正确的相对路径
- 不包含搜索功能

### 4.2 home.html - 首页

```html
{% extends "layout.html" %}

{% block title %}{{ site.title }}{% endblock %}
{% block mainClass %}home-page{% endblock %}

{% block content %}
<div class="home-container">
  <div class="home-header">
    <h1 class="site-description">{{ site.description }}</h1>
  </div>

  <div class="series-grid">
    {% for series in allSeries %}
    <section class="series-card">
      <header class="series-card-header">
        <h2 class="series-card-title">
          <a href="{{ rootPath }}series/{{ series.name }}/{{ series.articles[0].slug }}.html">{{ series.title }}</a>
        </h2>
        <span class="article-count">{{ series.articles.length }} 篇</span>
      </header>

      <ul class="article-list-mini">
        {% for article in series.articles %}
        <li class="article-item-mini">
          <span class="article-order">{{ article.order }}</span>
          <a href="{{ rootPath }}series/{{ article.series }}/{{ article.slug }}.html" class="article-link">{{ article.title }}</a>
          <time class="article-date">{{ article.date | date('MM-DD') }}</time>
        </li>
        {% endfor %}
      </ul>

      <a href="{{ rootPath }}series/{{ series.name }}/{{ series.articles[0].slug }}.html" class="series-view-all">查看全部 &rarr;</a>
    </section>
    {% endfor %}
  </div>
</div>
{% endblock %}
```

### 4.3 series.html - 系列页

```html
{% extends "layout.html" %}

{% block title %}{{ series.title }} - {{ site.title }}{% endblock %}
{% block mainClass %}series-page{% endblock %}

{% block content %}
<div class="page-layout has-sidebar">
  <!-- 左侧：系列导航 -->
  <aside class="sidebar series-sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">{{ series.title }}</h2>
      <span class="sidebar-count">{{ series.articles.length }} 篇文章</span>
    </div>

    <nav class="series-nav">
      {% for article in series.articles %}
      <a href="./{{ article.slug }}.html" class="series-nav-link{% if loop.first %} active{% endif %}">
        <span class="nav-order">{{ article.order }}</span>
        <span class="nav-title">{{ article.title }}</span>
      </a>
      {% endfor %}
    </nav>
  </aside>

  <!-- 中间：首篇文章内容 -->
  <article class="content-main">
    {% if series.firstArticle %}
      {% set article = series.firstArticle %}

      <header class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <time datetime="{{ article.date }}">{{ article.date }}</time>
          {% if article.tags.length > 0 %}
          <div class="article-tags">
            {% for tag in article.tags %}
            <a href="{{ rootPath }}tags/{{ tag }}/index.html" class="tag">{{ tag }}</a>
            {% endfor %}
          </div>
          {% endif %}
        </div>
      </header>

      <div class="article-body">
        {{ article.content | safe }}
      </div>

      <nav class="article-pagination">
        {% if series.articles.length > 1 %}
        <a href="./{{ series.articles[1].slug }}.html" class="pagination-next">
          下一篇：{{ series.articles[1].title }} &rarr;
        </a>
        {% endif %}
      </nav>
    {% else %}
      <div class="empty-state">
        <p>该系列暂无文章</p>
      </div>
    {% endif %}
  </article>
</div>
{% endblock %}

{% block scripts %}
<script src="{{ rootPath }}assets/js/sidebar.js"></script>
{% endblock %}
```

### 4.4 article.html - 文章页

```html
{% extends "layout.html" %}

{% block title %}{{ article.title }} - {{ site.title }}{% endblock %}
{% block mainClass %}article-page{% endblock %}

{% block content %}
<div class="page-layout has-sidebar{% if toc and toc.length > 0 %} has-toc{% endif %}">
  <!-- 左侧：系列导航 -->
  <aside class="sidebar series-sidebar">
    <div class="sidebar-header">
      <a href="./{{ series.articles[0].slug }}.html" class="series-back">&larr; {{ series.title }}</a>
    </div>

    <nav class="series-nav">
      {% for art in series.articles %}
      <a href="./{{ art.slug }}.html" class="series-nav-link{% if art.slug == article.slug %} active{% endif %}">
        <span class="nav-order">{{ art.order }}</span>
        <span class="nav-title">{{ art.title }}</span>
      </a>
      {% endfor %}
    </nav>
  </aside>

  <!-- 中间：文章内容 -->
  <article class="content-main">
    <header class="article-header">
      <h1 class="article-title">{{ article.title }}</h1>
      <div class="article-meta">
        <time datetime="{{ article.date }}">{{ article.date | date('YYYY-MM-DD') }}</time>
        {% if article.tags.length > 0 %}
        <div class="article-tags">
          {% for tag in article.tags %}
          <a href="{{ rootPath }}tags/{{ tag }}/index.html" class="tag">{{ tag }}</a>
          {% endfor %}
        </div>
        {% endif %}
      </div>
    </header>

    <div class="article-body">
      {{ content | safe }}
    </div>

    <nav class="article-pagination">
      {% if article.prev %}
      <a href="./{{ article.prev.slug }}.html" class="pagination-prev">
        &larr; {{ article.prev.title }}
      </a>
      {% endif %}
      {% if article.next %}
      <a href="./{{ article.next.slug }}.html" class="pagination-next">
        {{ article.next.title }} &rarr;
      </a>
      {% endif %}
    </nav>
  </article>

  <!-- 右侧：TOC -->
  {% if toc and toc.length > 0 %}
  <aside class="toc-sidebar">
    <div class="toc-container">
      <h3 class="toc-title">目录</h3>
      <nav class="toc-nav">
        {% for item in toc %}
        <a href="#{{ item.id }}" class="toc-link toc-level-{{ item.level }}">
          {{ item.text }}
        </a>
        {% endfor %}
      </nav>
    </div>
  </aside>
  {% endif %}
</div>
{% endblock %}

{% block scripts %}
<script src="{{ rootPath }}assets/js/sidebar.js"></script>
<script src="{{ rootPath }}assets/js/toc.js"></script>
{% endblock %}
```

### 4.5 tags.html - 标签列表

```html
{% extends "layout.html" %}

{% block title %}所有标签 - {{ site.title }}{% endblock %}
{% block mainClass %}tags-page{% endblock %}

{% block content %}
<div class="tags-container">
  <h1 class="page-title">所有标签</h1>

  <div class="tags-cloud">
    {% for tag in tags %}
    <a href="{{ rootPath }}tags/{{ tag.name }}/index.html" class="tag-item" style="font-size: {{ 14 + tag.count * 2 }}px">
      {{ tag.name }}
      <span class="tag-count">{{ tag.count }}</span>
    </a>
    {% endfor %}
  </div>
</div>
{% endblock %}
```

### 4.6 tag.html - 单个标签

```html
{% extends "layout.html" %}

{% block title %}{{ tag }} - {{ site.title }}{% endblock %}
{% block mainClass %}tag-detail-page{% endblock %}

{% block content %}
<div class="tag-detail-container">
  <header class="tag-header">
    <h1 class="page-title">
      <span class="tag-label">{{ tag }}</span>
      <span class="tag-meta">{{ articles.length }} 篇文章</span>
    </h1>
  </header>

  <div class="article-list">
    {% for article in articles %}
    <article class="article-card">
      <h2 class="article-card-title">
        <a href="{{ rootPath }}series/{{ article.series }}/{{ article.slug }}.html">{{ article.title }}</a>
      </h2>
      <div class="article-card-meta">
        <span class="series-name">{{ article.seriesTitle }}</span>
        <time>{{ article.date }}</time>
      </div>
      <p class="article-card-excerpt">{{ article.excerpt }}</p>
      <div class="article-card-tags">
        {% for t in article.tags %}
        <a href="{{ rootPath }}tags/{{ t }}/index.html" class="tag{% if t == tag %} active{% endif %}">{{ t }}</a>
        {% endfor %}
      </div>
    </article>
    {% endfor %}
  </div>
</div>
{% endblock %}
```

---

## 5. 样式实现

样式文件保持原有的 CSS 变量系统和响应式设计，详见 `themes/minimal/assets/css/` 目录。

---

## 6. JavaScript 实现

### 6.1 main.js - 入口脚本

```javascript
/**
 * LightMark Default Theme - Main Entry
 * 功能：主题切换、移动端菜单、回到顶部
 */

class ThemeManager {
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

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }
}

class MobileMenu {
  constructor() {
    this.toggleBtn = document.querySelector('.mobile-menu-toggle');
    this.sidebar = document.querySelector('.sidebar');
    this.overlay = document.querySelector('.mobile-overlay');

    this.init();
  }

  init() {
    if (!this.toggleBtn || !this.sidebar) return;

    this.toggleBtn.addEventListener('click', () => this.toggle());
    this.overlay?.addEventListener('click', () => this.close());

    // 点击导航链接后自动关闭
    this.sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.close());
    });
  }

  toggle() {
    const isOpen = this.sidebar.classList.toggle('open');
    this.overlay.hidden = !isOpen;
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  close() {
    this.sidebar.classList.remove('open');
    this.overlay.hidden = true;
    document.body.style.overflow = '';
  }
}

class BackToTop {
  constructor() {
    this.btn = document.querySelector('.back-to-top');
    this.threshold = 300; // 滚动超过300px显示按钮

    this.init();
  }

  init() {
    if (!this.btn) return;

    // 点击事件
    this.btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // 滚动事件
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

    // 初始检查
    this.handleScroll();
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > this.threshold) {
      this.btn.hidden = false;
    } else {
      this.btn.hidden = true;
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  new MobileMenu();
  new BackToTop();
});
```

### 6.2 toc.js - 目录导航

```javascript
/**
 * TOC 高亮与平滑滚动
 */

class TocController {
  constructor() {
    this.tocContainer = document.querySelector('.toc-nav');
    this.tocSidebar = document.querySelector('.toc-sidebar');
    this.articleBody = document.querySelector('.article-body');
    this.tocLinks = [];
    this.headings = [];
    this.activeLink = null;
    this.observer = null;
    this.isManualScrolling = false;

    this.init();
  }

  init() {
    if (!this.tocContainer || !this.articleBody) return;

    this.tocLinks = Array.from(this.tocContainer.querySelectorAll('.toc-link'));
    this.headings = Array.from(this.articleBody.querySelectorAll('h2, h3, h4'));

    if (!this.headings.length || !this.tocLinks.length) {
      if (this.tocSidebar) {
        this.tocSidebar.style.display = 'none';
      }
      return;
    }

    // 使用 IntersectionObserver 监听标题
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        rootMargin: '-100px 0px -70% 0px',
        threshold: 0
      }
    );

    this.headings.forEach(heading => this.observer.observe(heading));

    // 点击 TOC 平滑滚动
    this.tocLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        // ... 平滑滚动实现
      });
    });
  }

  // ... 其他方法
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    new TocController();
  }, 100);
});
```

### 6.3 sidebar.js - 侧边栏管理

```javascript
/**
 * 侧边栏管理（主要用于移动端）
 */

class SidebarManager {
  constructor() {
    this.sidebar = document.querySelector('.series-sidebar');
    this.overlay = document.querySelector('.mobile-overlay');
    this.isOpen = false;

    this.init();
  }

  init() {
    if (!this.sidebar) return;

    // 点击导航链接后关闭侧边栏
    this.sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.close());
    });

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open() {
    this.sidebar.classList.add('open');
    if (this.overlay) this.overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    this.isOpen = true;
  }

  close() {
    this.sidebar.classList.remove('open');
    if (this.overlay) this.overlay.hidden = true;
    document.body.style.overflow = '';
    this.isOpen = false;
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}

// 导出供 main.js 使用
window.SidebarManager = SidebarManager;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  window.sidebarManager = new SidebarManager();
});
```

---

## 7. theme.yaml - 主题配置

```yaml
name: minimal
version: 1.0.0
description: LightMark 默认主题，简洁清晰的三栏布局
author: LightMark Team
license: MIT

# 主题特性
features:
  - responsive          # 响应式设计
  - dark-mode          # 暗色模式支持
  - toc-highlight      # TOC 滚动高亮

# 依赖的外部库（可选）
dependencies: []

# 主题配置项
config:
  # 是否默认启用暗色模式
  defaultDarkMode: false

  # TOC 显示层级
  tocLevels: [2, 3]

  # 代码块主题
  codeTheme: github-dark
```

---

## 8. 实现检查清单

### 模板文件
- [x] layout.html - 基础布局，包含 header、footer、回到顶部按钮
- [x] home.html - 首页，展示系列卡片网格
- [x] series.html - 系列页，双栏布局（导航 + 内容）
- [x] article.html - 文章页，三栏布局（导航 + 内容 + TOC）
- [x] tags.html - 标签云页面
- [x] tag.html - 单个标签文章列表

### 样式文件
- [x] base.css - CSS 变量、重置样式、文章正文排版
- [x] layout.css - 页面布局、侧边栏、响应式断点
- [x] components.css - 按钮、标签、卡片等组件
- [x] code.css - 代码块高亮样式

### 脚本文件
- [x] main.js - 主题切换、移动端菜单、回到顶部
- [x] toc.js - TOC 高亮、平滑滚动
- [x] sidebar.js - 侧边栏管理

### 功能
- [x] 响应式布局（桌面三栏、平板两栏、移动端单栏 + 抽屉）
- [x] 暗色/亮色模式切换，记忆用户偏好
- [x] TOC 滚动高亮，点击平滑滚动
- [x] 文章上一篇/下一篇导航
- [x] 回到顶部按钮

---

## 9. 与 Core 的接口约定

### Core 提供的保证

1. **模板位置**：Core 会从 `themes/{theme}/templates/` 加载模板
2. **静态资源**：Core 会复制 `themes/{theme}/assets/` 到 `dist/assets/`
3. **数据完整性**：所有模板变量都保证存在，可能为空数组/对象
4. **相对路径**：Core 为每个页面提供正确的 `rootPath` 变量
5. **URL 格式**：
   - 首页：`index.html`
   - 系列页：`series/{name}/{firstArticleSlug}.html`
   - 文章页：`series/{name}/{slug}.html`
   - 标签列表：`tags/index.html`
   - 标签详情：`tags/{tag}/index.html`

### 主题需要遵守的约定

1. **必须文件**：六个模板文件必须存在
2. **静态资源引用**：使用 `{{ rootPath }}assets/` 相对路径
3. **模板继承**：所有页面模板应继承 `layout.html`
4. **CSS 变量**：建议使用 Core 文档推荐的变量名以保持一致性