/**
 * Default template files for LightMark initialization
 * These are used when the built-in theme is not available
 */

import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Get path to default templates directory
 * @returns {string}
 */
export function getDefaultsDir() {
  return path.join(__dirname, 'defaults')
}

/**
 * Get paths to all default theme files
 * @returns {Object} - Object with file paths
 */
export function getDefaultThemePaths() {
  const defaultsDir = getDefaultsDir()

  return {
    themeYaml: path.join(defaultsDir, 'theme.yaml'),
    layout: path.join(defaultsDir, 'layout.html'),
    home: path.join(defaultsDir, 'home.html'),
    series: path.join(defaultsDir, 'series.html'),
    article: path.join(defaultsDir, 'article.html'),
    tags: path.join(defaultsDir, 'tags.html'),
    tag: path.join(defaultsDir, 'tag.html'),
    style: path.join(defaultsDir, 'style.css')
  }
}

/**
 * Get site.yaml template content
 * @returns {string}
 */
export function getSiteYamlContent() {
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
 * Get package.json template content
 * @returns {string}
 */
export function getPackageJsonContent() {
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
 * @param {string} date - Date string for article
 * @returns {string}
 */
export function getExampleMarkdownContent(date = new Date().toISOString().split('T')[0]) {
  return `---
title: Welcome to LightMark
date: ${date}
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
