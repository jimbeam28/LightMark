# 网站核心实现方案

## 1. 职责定义

核心只负责：
- 解析 Markdown 文件
- 生成结构化数据
- 调用主题模板渲染
- 输出纯静态文件

**不关心**：样式、布局、前端交互（由主题负责）

---

## 2. 模块划分

```
core/
├── cli/                    # CLI 入口
│   ├── index.js           # 命令注册
│   └── commands/
│       ├── init.js        # lightmark init
│       ├── new.js         # lightmark new
│       └── build.js       # lightmark build
│
├── parser/                 # 内容解析
│   ├── markdown.js        # Markdown → HTML
│   ├── frontmatter.js     # YAML front matter 解析
│   └── toc.js             # 从 HTML 提取目录结构
│
├── generator/              # 构建生成
│   ├── index.js           # 构建入口
│   ├── indexer.js         # 生成搜索索引
│   ├── tags.js            # 生成标签数据
│   └── series.js          # 生成系列数据
│
├── renderer/               # 模板渲染
│   └── nunjucks.js        # Nunjucks 渲染器
│
└── utils/
    ├── file.js            # 文件操作
    └── config.js          # 配置读取
```

---

## 3. 数据结构定义

### 文章对象

```javascript
{
  title: '文章标题',
  date: '2026-03-01',
  tags: ['go', 'basics'],
  excerpt: '摘要内容',
  series: 'go-basics',
  seriesTitle: 'Go语言基础',  // 可在 front matter 覆盖
  order: 1,                    // 从文件名解析
  slug: 'intro',               // URL 友好名
  url: '/series/go-basics/intro.html',
  content: '<p>HTML内容...</p>',
  toc: [
    { level: 1, text: '标题1', id: 'title-1' },
    { level: 2, text: '子标题', id: 'sub-title' }
  ]
}
```

### 系列对象

```javascript
{
  name: 'go-basics',           // 目录名
  title: 'Go语言基础',
  articles: [/* 文章对象数组，按order排序 */]
}
```

### 站点数据（传给模板）

```javascript
{
  site: {
    title: '我的笔记站',
    description: '技术学习笔记',
    author: 'your-name',
    url: 'https://example.com'
  },
  series: [/* 所有系列对象 */],
  tags: {
    'go': [/* 相关文章 */],
    'basics': [/* 相关文章 */]
  },
  searchIndex: [/* 用于搜索的扁平数据 */]
}
```

---

## 4. 核心API设计

### 构建流程

```javascript
// 入口
async function build(rootDir) {
  // 1. 读取配置
  const config = loadConfig(rootDir)

  // 2. 解析所有文章
  const articles = await parseMarkdownFiles(rootDir + '/markdown')

  // 3. 组织数据结构
  const { series, tags, searchIndex } = organizeData(articles)

  // 4. 加载主题
  const theme = loadTheme(rootDir + '/themes/' + config.theme)

  // 5. 渲染页面
  await renderPages({ config, series, tags, searchIndex }, theme, rootDir + '/dist')

  // 6. 复制静态资源
  await copyAssets(theme, rootDir + '/dist')

  // 7. 输出搜索索引
  await writeJSON(rootDir + '/dist/assets/search-index.json', searchIndex)
}
```

### 模板可访问的变量

```javascript
// 每个模板可访问
{
  site,        // 站点配置
  page,        // 当前页面信息
  content,     // 文章HTML（仅文章页）
  toc,         // 目录结构（仅文章页）
  series,      // 当前系列信息（仅系列页/文章页）
  allSeries,   // 所有系列（首页、导航用）
  allTags,     // 所有标签
  articles     // 相关文章列表（标签页）
}
```

---

## 5. CLI 命令详细设计

### init

```
lightmark init <dir>

创建目录结构：
  dir/
  ├── markdown/
  ├── themes/
  │   └── minimal/   (内置默认主题)
  ├── site.yaml
  └── package.json
```

### new

```
lightmark new <series> [--title "文章标题"]

1. 检查 markdown/<series>/ 是否存在
   - 不存在则创建目录
2. 扫描目录，确定下一个序号
3. 创建文件：<序号>-<slug>.md
4. 写入 front matter 模板
```

### build

```
lightmark build [--config site.yaml] [--output dist/]

1. 清空输出目录
2. 执行构建流程
3. 输出统计信息
```

---

## 6. 主题接口规范

主题必须提供：

```
themes/<name>/
├── templates/
│   ├── layout.html       # 必须：基础布局
│   ├── home.html         # 必须：首页
│   ├── series.html       # 必须：系列页
│   ├── article.html      # 必须：文章页
│   ├── tags.html         # 必须：标签列表
│   └── tag.html          # 必须：标签详情
├── assets/               # 必须：复制到输出目录
└── theme.yaml           # 可选：主题元信息
```

### 模板继承约定

```
layout.html 定义基础结构，包含 block：
  - block header
  - block content
  - block footer

其他模板继承 layout，填充 content block
```

---

## 7. 技术选型

| 模块 | 选型 | 理由 |
|------|------|------|
| CLI | commander | 轻量，标准选择 |
| 配置解析 | js-yaml | YAML可读性好 |
| Front matter | gray-matter | 成熟，支持YAML |
| Markdown | markdown-it | 插件生态丰富 |
| 代码高亮 | shiki | 构建时处理，零运行时 |
| 模板 | nunjucks | 支持继承、宏、过滤器 |
| 文件操作 | fs-extra | Promise API |

---

## 8. 项目目录结构

```
project/
├── markdown/                   # 内容
│   ├── go-basics/
│   │   ├── 01-intro.md
│   │   └── 02-syntax.md
│   └── rust-guide/
│       └── 01-install.md
│
├── themes/                     # 主题
│   └── minimal/
│       ├── templates/
│       └── assets/
│
├── dist/                       # 构建输出
│   ├── index.html
│   ├── series/
│   ├── tags/
│   └── assets/
│
├── site.yaml                   # 站点配置
└── package.json
```

---

## 9. 配置文件设计

### site.yaml（站点配置）

配置文件位于项目根目录，包含以下字段：

```yaml
# 站点基本信息
title: 我的笔记站                    # 网站名称，显示在页面标题和头部
description: 技术学习笔记             # 网站描述，用于SEO meta description
author: your-name                    # 作者名称，显示在页脚
url: https://your-domain.com         # 网站URL，用于生成绝对路径和SEO
language: zh-CN                      # 网站语言，用于html lang属性

# 主题配置
theme: minimal                       # 当前使用的主题（对应 themes/ 目录下的文件夹名）
darkMode: true                       # 是否默认启用暗色模式（运行时可切换）

# 构建配置
output: dist                         # 输出目录，默认 dist
perPage: 20                          # 列表页每页文章数（预留，暂不分页）

# Markdown 配置
markdown:
  tocLevel: [2, 3, 4]               # TOC 提取的标题级别，默认 h2-h4
  excerptLength: 200                # 自动截取摘要的字符数

# SEO 配置
seo:
  googleAnalytics:                  # Google Analytics ID（可选）
  baiduAnalytics:                   # 百度统计 ID（可选）
```

### 配置字段说明

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| title | string | 是 | - | 网站名称 |
| description | string | 否 | '' | 网站描述 |
| author | string | 否 | '' | 作者名称 |
| url | string | 否 | '' | 网站URL |
| language | string | 否 | zh-CN | 网站语言 |
| theme | string | 否 | minimal | 主题名称 |
| darkMode | boolean | 否 | true | 默认暗色模式 |
| output | string | 否 | dist | 输出目录 |
| perPage | number | 否 | 20 | 每页文章数 |
| markdown.tocLevel | array | 否 | [2,3,4] | TOC标题级别 |
| markdown.excerptLength | number | 否 | 200 | 摘要长度 |
| seo.googleAnalytics | string | 否 | - | GA ID |
| seo.baiduAnalytics | string | 否 | - | 百度统计ID |

### markdown/front matter

```yaml
---
title: 文章标题                      # 必填：文章标题
date: 2026-03-01                    # 必填：发布日期
tags: [tag1, tag2]                  # 可选：标签列表
excerpt: 摘要内容                    # 可选：手动指定摘要，不填则自动截取
series: 系列显示名                   # 可选：覆盖系列名（默认用目录名）
---

正文...
```

### front matter 字段说明

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| title | string | 是 | - | 文章标题 |
| date | string | 是 | - | 发布日期，格式 YYYY-MM-DD |
| tags | array | 否 | [] | 标签列表 |
| excerpt | string | 否 | 自动截取 | 文章摘要 |
| series | string | 否 | 目录名 | 系列显示名称 |

---

## 10. 构建流程

```
1. 读取 site.yaml 配置
2. 扫描 markdown/ 目录
   - 解析 front matter
   - 按文件名序号排序
3. 处理每篇文章
   - Markdown → HTML
   - 代码高亮
   - 生成 TOC 数据
4. 生成索引
   - 文章索引（搜索用）
   - 标签索引
   - 系列索引
5. 渲染页面
   - 应用模板
   - 复制静态资源
6. 输出到 dist/
```

---

## 11. URL 设计

| 页面 | URL | 说明 |
|------|-----|------|
| 首页 | `/index.html` | 系列列表 |
| 系列页 | `/series/{name}/index.html` | 系列第一篇文章 |
| 文章页 | `/series/{name}/{slug}.html` | 具体文章 |
| 标签列表 | `/tags/index.html` | 所有标签 |
| 标签详情 | `/tags/{tag}/index.html` | 标签下文章 |