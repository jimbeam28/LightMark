import path from 'path'
import { ensureDir, writeFile, pathExists } from '../../utils/file.js'

/**
 * Initialize a new LightMark site
 * @param {string} targetDir - Target directory path
 */
export async function init(targetDir) {
  const absoluteDir = path.resolve(targetDir)

  // Check if directory exists and is not empty
  const exists = await pathExists(absoluteDir)
  if (exists) {
    const files = await listFiles(absoluteDir)
    if (files.length > 0) {
      throw new Error(`Directory "${absoluteDir}" is not empty`)
    }
  }

  // Create directory structure
  console.log(`Initializing LightMark site in ${absoluteDir}`)

  await ensureDir(path.join(absoluteDir, 'markdown'))
  await ensureDir(path.join(absoluteDir, 'themes', 'minimal', 'templates'))
  await ensureDir(path.join(absoluteDir, 'themes', 'minimal', 'assets'))

  // Create site.yaml
  await writeFile(
    path.join(absoluteDir, 'site.yaml'),
    getSiteYamlContent()
  )

  // Create package.json
  await writeFile(
    path.join(absoluteDir, 'package.json'),
    getPackageJsonContent()
  )

  // Create example markdown file
  await ensureDir(path.join(absoluteDir, 'markdown', 'getting-started'))
  await writeFile(
    path.join(absoluteDir, 'markdown', 'getting-started', '01-intro.md'),
    getExampleMarkdownContent()
  )

  // Create minimal theme templates and assets
  await createThemeTemplates(absoluteDir)
  await createThemeAssets(absoluteDir)

  // Create theme.yaml
  await writeFile(
    path.join(absoluteDir, 'themes', 'minimal', 'theme.yaml'),
    `name: minimal
version: 1.0.0
description: LightMark default minimal theme
author: LightMark
`)

  console.log('LightMark site initialized successfully!')
  console.log(`
Next steps:
  cd ${targetDir}
  lightmark build
`)
}

/**
 * Get default site.yaml content
 */
function getSiteYamlContent() {
  return `# LightMark 站点配置文件

# ============================================
# 站点基本信息
# ============================================
title: My Notes
description: A personal knowledge base
author:
url:
language: zh-CN

# ============================================
# 主题配置
# ============================================
theme: minimal
darkMode: true

# ============================================
# 构建配置
# ============================================
output: dist
perPage: 20

# ============================================
# Markdown 配置
# ============================================
markdown:
  tocLevel: [2, 3, 4]
  excerptLength: 200

# ============================================
# SEO 配置（可选）
# ============================================
seo:
  googleAnalytics:
  baiduAnalytics:
`
}

/**
 * Get default package.json content
 */
function getPackageJsonContent() {
  return JSON.stringify({
    name: 'my-lightmark-site',
    version: '1.0.0',
    private: true,
    scripts: {
      build: 'lightmark build'
    }
  }, null, 2)
}

/**
 * Get example markdown content
 */
function getExampleMarkdownContent() {
  return `---
title: Welcome to LightMark
date: ${new Date().toISOString().split('T')[0]}
tags: [tutorial, getting-started]
excerpt: This is your first article in LightMark.
---

# Welcome to LightMark

This is your first article. You can start writing your notes here!

## Features

- **Series Support**: Organize your notes into series
- **Tags**: Categorize articles with tags
- **Code Highlighting**: Syntax highlighting for code blocks
- **Search**: Full-text search support

## Code Example

\`\`\`javascript
function hello() {
  console.log('Hello, LightMark!')
}
\`\`\`

## Next Steps

1. Create more markdown files in \`markdown/\` directory
2. Run \`lightmark build\` to generate your site
3. Check the output in \`dist/\` directory
`
}

/**
 * Create minimal theme templates
 */
async function createThemeTemplates(absoluteDir) {
  const templatesDir = path.join(absoluteDir, 'themes', 'minimal', 'templates')

  // Layout template - 基础布局
  await writeFile(
    path.join(templatesDir, 'layout.html'),
    `<!DOCTYPE html>
<html lang="{{ site.language | default('zh-CN') }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}{{ site.title }}{% endblock %}</title>
  <meta name="description" content="{{ site.description }}">
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
        <a href="{{ s.url }}">{{ s.title }}</a>
      {% endfor %}
      <button class="search-btn" aria-label="搜索">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.7422 10.3439C12.5329 9.2673 13 7.9382 13 6.5C13 2.91015 10.0899 0 6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13C7.9382 13 9.2673 12.5329 10.3439 11.7422L14.1464 15.5456C14.3417 15.7409 14.6583 15.7409 14.8536 15.5456L15.5456 14.8536C15.7409 14.6583 15.7409 14.3417 15.5456 14.1464L11.7422 10.3439ZM6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 8.98528 8.98528 11 6.5 11Z"/>
        </svg>
      </button>
      {% if site.darkMode %}
      <button class="theme-toggle" aria-label="切换主题">
        <span class="theme-light">☀</span>
        <span class="theme-dark">🌙</span>
      </button>
      {% endif %}
    </nav>
    <button class="mobile-menu-btn" aria-label="菜单">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </header>

  {% block content %}{% endblock %}

  <footer class="site-footer">
    <p>&copy; {{ site.author }} {{ "now" | date("YYYY") }}</p>
  </footer>

  <div class="search-modal" id="searchModal">
    <div class="search-container">
      <input type="text" class="search-input" placeholder="搜索文章..." id="searchInput">
      <button class="search-close" id="searchClose">&times;</button>
      <div class="search-results" id="searchResults"></div>
    </div>
  </div>

  <div class="sidebar-overlay"></div>

  <script src="/assets/js/main.js"></script>
  <script src="/assets/js/toc.js"></script>
  <script src="/assets/js/search.js"></script>
  <script src="/assets/js/sidebar.js"></script>
</body>
</html>`
  )

  // Home template - 首页
  await writeFile(
    path.join(templatesDir, 'home.html'),
    `{% extends "layout.html" %}

{% block content %}
<main class="home">
  {% for series in allSeries %}
  <section class="series-section">
    <h2><a href="{{ series.url }}">{{ series.title }}</a></h2>
    <ul class="article-list">
      {% for article in series.articles %}
      <li>
        <a href="{{ article.url }}">{{ article.title }}</a>
        <span class="date">{{ article.date | date }}</span>
      </li>
      {% endfor %}
    </ul>
  </section>
  {% endfor %}
</main>
{% endblock %}`
  )

  // Series template - 系列页（含文章目录，作为基础布局）
  await writeFile(
    path.join(templatesDir, 'series.html'),
    `{% extends "layout.html" %}

{% block title %}{{ series.title }} - {{ site.title }}{% endblock %}

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
    {% block article %}
    <div class="series-intro">
      <h1>{{ series.title }}</h1>
      <p>共 {{ series.articles | length }} 篇文章</p>
      <ul class="series-article-list">
        {% for article in series.articles %}
        <li>
          <a href="{{ article.url }}">{{ article.title }}</a>
          <span class="meta">{{ article.date | date }}</span>
          {% if article.excerpt %}
          <p class="excerpt">{{ article.excerpt }}</p>
          {% endif %}
        </li>
        {% endfor %}
      </ul>
    </div>
    {% endblock %}
  </main>

  <!-- 右侧：TOC导航 -->
  <aside class="toc-sidebar">
    <div class="toc" id="toc"></div>
  </aside>
</div>
{% endblock %}`
  )

  // Article template - 文章页（继承 series）
  await writeFile(
    path.join(templatesDir, 'article.html'),
    `{% extends "series.html" %}

{% block article %}
<article>
  <header class="article-header">
    <h1>{{ article.title }}</h1>
    <div class="meta">
      <time>{{ article.date | date }}</time>
      {% if article.tags and article.tags | length > 0 %}
      <span class="tags">
        {% for tag in article.tags %}
        <a href="/tags/{{ tag | slug }}/" class="tag">{{ tag }}</a>
        {% endfor %}
      </span>
      {% endif %}
    </div>
  </header>

  <div class="article-body" id="articleBody">
    {{ content | safe }}
  </div>

  <nav class="article-nav">
    {% if article.prev %}
    <a href="{{ article.prev.url }}" class="prev">
      <span class="label">上一篇</span>
      <span class="title">&larr; {{ article.prev.title }}</span>
    </a>
    {% else %}
    <span></span>
    {% endif %}
    {% if article.next %}
    <a href="{{ article.next.url }}" class="next">
      <span class="label">下一篇</span>
      <span class="title">{{ article.next.title }} &rarr;</span>
    </a>
    {% endif %}
  </nav>
</article>
{% endblock %}`
  )

  // Tags template - 标签云
  await writeFile(
    path.join(templatesDir, 'tags.html'),
    `{% extends "layout.html" %}

{% block title %}标签 - {{ site.title }}{% endblock %}

{% block content %}
<main class="tags-page">
  <h1>标签</h1>
  <div class="tags-cloud">
    {% for tag in allTags %}
    <a href="/tags/{{ tag.name | slug }}/" class="tag" style="font-size: {{ 0.8 + (tag.count / maxTagCount) * 0.7 }}rem">
      {{ tag.name }}
      <span class="count">({{ tag.count }})</span>
    </a>
    {% endfor %}
  </div>
</main>
{% endblock %}`
  )

  // Tag template - 单标签页
  await writeFile(
    path.join(templatesDir, 'tag.html'),
    `{% extends "layout.html" %}

{% block title %}标签：{{ tag.name }} - {{ site.title }}{% endblock %}

{% block content %}
<main class="tag-page">
  <h1>标签：{{ tag.name }}</h1>
  <p class="tag-meta">共 {{ tag.articles | length }} 篇文章</p>
  <ul class="article-list">
    {% for article in tag.articles %}
    <li>
      <a href="{{ article.url }}">{{ article.title }}</a>
      <span class="meta">
        <time>{{ article.date | date }}</time>
        <span class="series">{{ article.seriesTitle }}</span>
      </span>
      {% if article.excerpt %}
      <p class="excerpt">{{ article.excerpt }}</p>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
</main>
{% endblock %}`
  )
}

/**
 * List files in directory
 */
async function listFiles(dir) {
  const { listFiles: ls } = await import('../../utils/file.js')
  return ls(dir)
}

export default {
  init
}