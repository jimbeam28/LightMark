import path from 'path'
import { fileURLToPath } from 'url'
import { ensureDir, writeFile, copy, pathExists, listFiles } from '../../utils/file.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

  // Copy theme from built-in minimal theme
  await copyBuiltinTheme(absoluteDir)

  console.log('LightMark site initialized successfully!')
  console.log(`
Next steps:
  cd ${targetDir}
  lightmark build
`)
}

/**
 * Copy built-in minimal theme to target directory
 * @param {string} targetDir - Target directory
 */
async function copyBuiltinTheme(targetDir) {
  // Get built-in theme directory (from package root)
  const builtinThemeDir = path.join(__dirname, '..', '..', '..', 'themes', 'minimal')

  // Check if built-in theme exists
  const exists = await pathExists(builtinThemeDir)
  if (!exists) {
    console.warn('Warning: Built-in theme not found, creating minimal theme from defaults...')
    await createMinimalThemeDefaults(targetDir)
    return
  }

  // Copy theme files
  const targetThemeDir = path.join(targetDir, 'themes', 'minimal')
  await copy(builtinThemeDir, targetThemeDir)
  console.log('Copied built-in minimal theme')
}

/**
 * Create minimal theme defaults when built-in theme is not available
 * @param {string} targetDir - Target directory
 */
async function createMinimalThemeDefaults(targetDir) {
  const themeDir = path.join(targetDir, 'themes', 'minimal')

  // Create minimal theme.yaml
  await writeFile(
    path.join(themeDir, 'theme.yaml'),
    `name: minimal
version: 1.0.0
description: LightMark minimal theme
author: LightMark
license: MIT

features:
  - responsive
  - dark-mode
  - toc-highlight

config:
  defaultDarkMode: false
  tocLevels: [2, 3]
  codeTheme: github-dark

pages:
  home:
    template: home.html
    output: index.html
  series:
    template: series.html
    output: series/{name}/index.html
  article:
    template: article.html
    output: series/{series}/{slug}.html
  tags:
    template: tags.html
    output: tags/index.html
  tag:
    template: tag.html
    output: tags/{name}/index.html
`
  )

  // Create minimal templates
  await ensureDir(path.join(themeDir, 'templates'))
  await ensureDir(path.join(themeDir, 'assets', 'css'))
  await ensureDir(path.join(themeDir, 'assets', 'js'))

  // Create basic layout.html
  await writeFile(
    path.join(themeDir, 'templates', 'layout.html'),
    `<!DOCTYPE html>
<html lang="{{ site.language }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}{{ site.title }}{% endblock %}</title>
  <meta name="description" content="{{ site.description }}">
  <link rel="stylesheet" href="{{ rootPath }}{{ asset('css/style.css') }}">
  {% block styles %}{% endblock %}
</head>
<body>
  <header class="site-header">
    <div class="header-container">
      <a href="{{ rootPath }}{{ url('home') }}" class="site-title">{{ site.title }}</a>
      <nav class="site-nav">
        {% for s in allSeries %}
          <a href="{{ rootPath }}{{ s.url }}" class="nav-link">{{ s.title }}</a>
        {% endfor %}
        <a href="{{ rootPath }}{{ url('tags') }}" class="nav-link">Tags</a>
      </nav>
    </div>
  </header>

  <main class="main-content {% block mainClass %}{% endblock %}">
    {% block content %}{% endblock %}
  </main>

  <footer class="site-footer">
    <p>&copy; {{ site.author }} &middot; Built with LightMark</p>
  </footer>

  {% block scripts %}{% endblock %}
</body>
</html>`
  )

  // Create basic home.html
  await writeFile(
    path.join(themeDir, 'templates', 'home.html'),
    `{% extends "layout.html" %}

{% block content %}
<div class="home-container">
  {% for s in allSeries %}
  <section class="series-section">
    <h2><a href="{{ rootPath }}{{ s.url }}">{{ s.title }}</a></h2>
    <ul class="article-list">
      {% for article in s.articles %}
      <li>
        <a href="{{ rootPath }}{{ article.url }}">{{ article.title }}</a>
        <span class="date">{{ article.date | date }}</span>
      </li>
      {% endfor %}
    </ul>
  </section>
  {% endfor %}
</div>
{% endblock %}`
  )

  // Create basic series.html
  await writeFile(
    path.join(themeDir, 'templates', 'series.html'),
    `{% extends "layout.html" %}

{% block title %}{{ series.title }} - {{ site.title }}{% endblock %}

{% block content %}
<div class="series-page">
  <aside class="series-sidebar">
    <h3>{{ series.title }}</h3>
    <ul class="article-list">
      {% for article in series.articles %}
      <li>
        <a href="{{ rootPath }}{{ article.url }}" class="{% if article.slug == page.article.slug %}active{% endif %}">
          {{ article.title }}
        </a>
      </li>
      {% endfor %}
    </ul>
  </aside>

  <main class="series-content">
    <h1>{{ series.title }}</h1>
    <p>{{ series.articles | length }} articles</p>
    <ul class="article-preview-list">
      {% for article in series.articles %}
      <li>
        <h3><a href="{{ rootPath }}{{ article.url }}">{{ article.title }}</a></h3>
        <span class="date">{{ article.date | date }}</span>
        {% if article.excerpt %}
        <p class="excerpt">{{ article.excerpt | striptags | truncate(150) }}</p>
        {% endif %}
      </li>
      {% endfor %}
    </ul>
  </main>

  <aside class="toc-sidebar">
    <div class="toc-placeholder"></div>
  </aside>
</div>
{% endblock %}`
  )

  // Create basic article.html
  await writeFile(
    path.join(themeDir, 'templates', 'article.html'),
    `{% extends "layout.html" %}

{% block title %}{{ article.title }} - {{ site.title }}{% endblock %}

{% block content %}
<div class="article-page">
  <aside class="series-sidebar">
    <h3><a href="{{ rootPath }}{{ series.url }}">{{ series.title }}</a></h3>
    <ul class="article-list">
      {% for a in series.articles %}
      <li>
        <a href="{{ rootPath }}{{ a.url }}" class="{% if a.slug == article.slug %}active{% endif %}">
          {{ a.title }}
        </a>
      </li>
      {% endfor %}
    </ul>
  </aside>

  <article class="article-content">
    <header class="article-header">
      <h1>{{ article.title }}</h1>
      <div class="meta">
        <time>{{ article.date | date }}</time>
        {% if article.tags %}
        <span class="tags">
          {% for tag in article.tags %}
          <a href="{{ rootPath }}{{ url('tag', tag) }}" class="tag">{{ tag }}</a>
          {% endfor %}
        </span>
        {% endif %}
      </div>
    </header>

    <div class="article-body">
      {{ content | safe }}
    </div>

    <nav class="article-nav">
      {% if article.prev %}
      <a href="{{ rootPath }}{{ article.prev.url }}" class="prev">
        <span class="label">Previous</span>
        <span class="title">&larr; {{ article.prev.title }}</span>
      </a>
      {% endif %}
      {% if article.next %}
      <a href="{{ rootPath }}{{ article.next.url }}" class="next">
        <span class="label">Next</span>
        <span class="title">{{ article.next.title }} &rarr;</span>
      </a>
      {% endif %}
    </nav>
  </article>

  <aside class="toc-sidebar">
    <div class="toc" id="toc">
      {{ toc | safe }}
    </div>
  </aside>
</div>
{% endblock %}`
  )

  // Create basic tags.html
  await writeFile(
    path.join(themeDir, 'templates', 'tags.html'),
    `{% extends "layout.html" %}

{% block title %}Tags - {{ site.title }}{% endblock %}

{% block content %}
<div class="tags-page">
  <h1>Tags</h1>
  <div class="tags-cloud">
    {% for tag in tags %}
    <a href="{{ rootPath }}{{ tag.url }}" class="tag">
      {{ tag.name }}
      <span class="count">({{ tag.count }})</span>
    </a>
    {% endfor %}
  </div>
</div>
{% endblock %}`
  )

  // Create basic tag.html
  await writeFile(
    path.join(themeDir, 'templates', 'tag.html'),
    `{% extends "layout.html" %}

{% block title %}Tag: {{ tag }} - {{ site.title }}{% endblock %}

{% block content %}
<div class="tag-page">
  <h1>Tag: {{ tag }}</h1>
  <p>{{ articles | length }} articles</p>
  <ul class="article-list">
    {% for article in articles %}
    <li>
      <a href="{{ rootPath }}{{ article.url }}">{{ article.title }}</a>
      <span class="meta">{{ article.date | date }}</span>
      {% if article.excerpt %}
      <p class="excerpt">{{ article.excerpt | striptags | truncate(150) }}</p>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
</div>
{% endblock %}`
  )

  // Create basic CSS
  await writeFile(
    path.join(themeDir, 'assets', 'css', 'style.css'),
    `/* LightMark Minimal Theme */

:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --link-color: #0066cc;
  --border-color: #e0e0e0;
  --header-bg: #f5f5f5;
  --sidebar-bg: #fafafa;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-color);
  color: var(--text-color);
  line-height: 1.6;
}

a {
  color: var(--link-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* Header */
.site-header {
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 2rem;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.site-nav {
  display: flex;
  gap: 1.5rem;
}

.site-nav a {
  color: var(--text-color);
}

/* Main content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 200px);
}

/* Footer */
.site-footer {
  background: var(--header-bg);
  border-top: 1px solid var(--border-color);
  padding: 1rem 2rem;
  text-align: center;
}

/* Article list */
.article-list {
  list-style: none;
}

.article-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

/* Series page layout */
.series-page,
.article-page {
  display: grid;
  grid-template-columns: 250px 1fr 200px;
  gap: 2rem;
}

.series-sidebar,
.toc-sidebar {
  background: var(--sidebar-bg);
  padding: 1rem;
  border-radius: 4px;
}

/* Article content */
.article-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.article-header h1 {
  margin-bottom: 0.5rem;
}

.article-header .meta {
  color: #666;
  font-size: 0.9rem;
}

.article-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.article-nav .prev,
.article-nav .next {
  display: flex;
  flex-direction: column;
}

.article-nav .label {
  font-size: 0.8rem;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .series-page,
  .article-page {
    grid-template-columns: 1fr;
  }

  .site-nav {
    display: none;
  }
}
`
  )
}

/**
 * Get default site.yaml content
 */
function getSiteYamlContent() {
  return `# LightMark Site Configuration

# ============================================
# Site Information
# ============================================
title: My Notes
description: A personal knowledge base
author:
url:
language: zh-CN

# ============================================
# Theme Configuration
# ============================================
theme: minimal
darkMode: true

# ============================================
# Build Configuration
# ============================================
output: dist
perPage: 20

# ============================================
# Markdown Configuration
# ============================================
markdown:
  tocLevel: [2, 3, 4]
  excerptLength: 200

# ============================================
# SEO Configuration (Optional)
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
- **Clean Theme**: Simple and minimal design

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

export default {
  init
}
