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

  // Create minimal theme templates
  await createThemeTemplates(absoluteDir)

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

  // Layout template
  await writeFile(
    path.join(templatesDir, 'layout.html'),
    `<!DOCTYPE html>
<html lang="{{ site.language | default('zh-CN') }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}{{ site.title }}{% endblock %}</title>
  <meta name="description" content="{{ site.description }}">
</head>
<body>
  <header>
    <h1><a href="/">{{ site.title }}</a></h1>
    <p>{{ site.description }}</p>
    <nav>
      <a href="/">Home</a>
      <a href="/tags/">Tags</a>
    </nav>
  </header>
  <main>
    {% block content %}{% endblock %}
  </main>
  <footer>
    <p>&copy; {{ site.author }}</p>
  </footer>
</body>
</html>`
  )

  // Home template
  await writeFile(
    path.join(templatesDir, 'home.html'),
    `{% extends "layout.html" %}
{% block content %}
<h2>Series</h2>
<ul>
{% for series in allSeries %}
  <li>
    <a href="{{ series.url }}">{{ series.title }}</a>
    <span>({{ series.articles | length }} articles)</span>
  </li>
{% endfor %}
</ul>
{% endblock %}`
  )

  // Series template
  await writeFile(
    path.join(templatesDir, 'series.html'),
    `{% extends "layout.html" %}
{% block title %}{{ series.title }} - {{ site.title }}{% endblock %}
{% block content %}
<h2>{{ series.title }}</h2>
<ul>
{% for article in series.articles %}
  <li>
    <a href="{{ article.url }}">{{ article.title }}</a>
    <span>{{ article.date | date }}</span>
  </li>
{% endfor %}
</ul>
{% endblock %}`
  )

  // Article template
  await writeFile(
    path.join(templatesDir, 'article.html'),
    `{% extends "layout.html" %}
{% block title %}{{ article.title }} - {{ site.title }}{% endblock %}
{% block content %}
<article>
  <header>
    <h1>{{ article.title }}</h1>
    <p>
      <time>{{ article.date | date }}</time>
      {% if article.tags | length > 0 %}
      <span>Tags:
        {% for tag in article.tags %}
        <a href="/tags/{{ tag }}/">{{ tag }}</a>
        {% endfor %}
      </span>
      {% endif %}
    </p>
  </header>
  {{ content | safe }}
  {% if toc | length > 0 %}
  <nav class="toc">
    <h3>Table of Contents</h3>
    <ul>
    {% for item in toc %}
      <li><a href="#{{ item.id }}">{{ item.text }}</a></li>
    {% endfor %}
    </ul>
  </nav>
  {% endif %}
</article>
{% endblock %}`
  )

  // Tags template
  await writeFile(
    path.join(templatesDir, 'tags.html'),
    `{% extends "layout.html" %}
{% block title %}Tags - {{ site.title }}{% endblock %}
{% block content %}
<h2>Tags</h2>
<ul>
{% for tag in tags %}
  <li>
    <a href="/tags/{{ tag.name }}/">{{ tag.name }}</a>
    <span>({{ tag.count }})</span>
  </li>
{% endfor %}
</ul>
{% endblock %}`
  )

  // Tag template
  await writeFile(
    path.join(templatesDir, 'tag.html'),
    `{% extends "layout.html" %}
{% block title %}Tag: {{ tag }} - {{ site.title }}{% endblock %}
{% block content %}
<h2>Tag: {{ tag }}</h2>
<ul>
{% for article in articles %}
  <li>
    <a href="{{ article.url }}">{{ article.title }}</a>
    <span>{{ article.date | date }}</span>
  </li>
{% endfor %}
</ul>
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