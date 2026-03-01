# LightMark

一个简洁的静态网站生成器，专为系列化技术笔记和文档设计。

## 背景

在整理技术学习笔记时，经常需要按主题系列组织内容（如 "Go 语言基础"、"React 实战"）。传统的博客工具往往更适合单篇文章，而文档工具又过于复杂。

LightMark 应运而生，它专注于：
- **系列化管理**：按目录组织文章，自动识别序号排序
- **纯静态输出**：构建时生成完整 HTML，无需服务端运行
- **主题与内容分离**：核心只处理数据，样式完全由主题控制

## 优势

### 1. 系列化文章管理
```
markdown/
├── go-basics/           # 系列目录
│   ├── 01-intro.md      # 序号前缀自动识别顺序
│   ├── 02-syntax.md
│   └── 03-concurrency.md
└── rust-guide/
    ├── 01-install.md
    └── 02-ownership.md
```

### 2. 构建时代码高亮
使用 [Shiki](https://shiki.style/) 在构建时完成代码高亮，输出纯 HTML + CSS，浏览器无需执行任何 JavaScript 即可看到高亮效果。

支持语言：JavaScript、TypeScript、Python、Go、Rust、Java、C/C++、Bash、JSON、YAML 等。

### 3. 自动目录生成
自动从文章标题提取目录结构（默认 h2-h4），添加锚点链接，无需手动维护。

### 4. 标签系统
支持为文章添加多个标签，自动生成标签列表页和标签详情页。

### 5. 简洁的配置
通过 `site.yaml` 配置站点信息，支持主题、暗色模式、TOC 级别等设置。

## 安装

```bash
npm install -g lightmark
```

或直接运行（无需安装）：
```bash
npx lightmark init my-site
```

## 使用方式

### 1. 初始化项目

```bash
lightmark init my-site
cd my-site
```

这会创建以下目录结构：
```
my-site/
├── markdown/              # 文章内容
├── themes/                # 主题文件
│   └── minimal/
│       ├── templates/     # Nunjucks 模板
│       └── assets/        # CSS、JS、字体等
├── site.yaml              # 站点配置
└── package.json
```

### 2. 创建文章

```bash
# 创建新系列文章
lightmark new go-basics --title "Go 语言介绍"

# 指定标签
lightmark new go-basics --title "函数与控制流" --tags "go,basics"
```

文章会自动编号，生成如 `04-functions.md` 的文件。

### 3. 编写内容

文章使用 Markdown 格式，支持 YAML front matter：

```markdown
---
title: Go 语言介绍
date: 2026-03-01
tags: [go, basics]
---

## 什么是 Go

Go 是 Google 开发的开源编程语言...

## 安装

```bash
sudo apt install golang
```
```

### 4. 构建站点

```bash
lightmark build
```

输出到 `dist/` 目录，包含完整的静态网站文件。

### 5. 预览

```bash
cd dist
python3 -m http.server 8080
```

访问 http://localhost:8080 查看效果。

## 配置

编辑 `site.yaml` 自定义站点：

```yaml
title: 我的技术笔记
description: 学习记录与分享
author: your-name
url: https://your-domain.com

# 主题配置
theme: minimal
darkMode: true

# Markdown 配置
markdown:
  tocLevel: [2, 3, 4]       # 目录提取级别
  excerptLength: 200        # 自动摘要长度

# SEO 配置
seo:
  googleAnalytics: G-XXXXXXXXXX
```

## CLI 命令

| 命令 | 说明 | 选项 |
|------|------|------|
| `lightmark init <dir>` | 初始化新站点 | - |
| `lightmark new <series>` | 创建新文章 | `--title`, `--tags`, `--root` |
| `lightmark build` | 构建站点 | `--config`, `--output`, `--root` |

## 默认主题

LightMark 内置 `minimal` 主题，提供简洁清晰的三栏布局设计。

### 功能特性

- **响应式布局**：桌面端三栏（导航 + 内容 + 目录）、平板端两栏、移动端单栏 + 抽屉菜单
- **暗色模式**：支持亮色/暗色主题切换，自动记忆用户偏好
- **TOC 导航**：文章目录自动高亮当前阅读位置，点击平滑滚动
- **上下篇导航**：文章底部显示上一篇/下一篇链接
- **回到顶部**：滚动超过一定距离后显示回到顶部按钮

### 页面结构

| 页面 | 布局 | 说明 |
|------|------|------|
| 首页 | 系列卡片网格 | 展示所有系列及其文章列表 |
| 系列页 | 双栏布局 | 左侧系列导航 + 右侧首篇文章内容 |
| 文章页 | 三栏布局 | 左侧系列导航 + 中间文章 + 右侧目录 |
| 标签页 | 标签云 | 按文章数量计算标签字号大小 |
| 标签详情 | 文章列表 | 展示该标签下所有文章 |

### 资源结构

```
themes/minimal/
├── templates/          # Nunjucks 模板
│   ├── layout.html    # 基础布局
│   ├── home.html      # 首页
│   ├── series.html    # 系列页
│   ├── article.html   # 文章页
│   ├── tags.html      # 标签列表
│   └── tag.html       # 标签详情
└── assets/
    ├── css/           # 样式文件
    │   ├── base.css       # CSS 变量、重置、基础排版
    │   ├── layout.css     # 页面布局、响应式
    │   ├── components.css # 组件样式
    │   └── code.css       # 代码高亮
    └── js/            # 脚本文件
        ├── main.js        # 主题切换、移动菜单、回到顶部
        ├── toc.js         # 目录高亮、平滑滚动
        └── sidebar.js     # 侧边栏管理
```

## 主题开发

主题位于 `themes/<name>/` 目录，必须包含以下模板：

```
themes/my-theme/
├── templates/
│   ├── layout.html      # 基础布局
│   ├── home.html        # 首页
│   ├── series.html      # 系列页
│   ├── article.html     # 文章页
│   ├── tags.html        # 标签列表
│   └── tag.html         # 标签详情
└── assets/              # 静态资源
```

模板使用 [Nunjucks](https://mozilla.github.io/nunjucks/) 语法，可访问以下变量：
- `site` - 站点配置
- `page` - 当前页面信息
- `content` - 文章 HTML
- `toc` - 目录结构
- `series` - 当前系列
- `allSeries` - 所有系列列表
- `allTags` - 所有标签列表

## 技术栈

- **CLI**: [Commander.js](https://github.com/tj/commander.js/)
- **配置**: [js-yaml](https://github.com/nodeca/js-yaml)
- **Front Matter**: [gray-matter](https://github.com/jonschlinkert/gray-matter)
- **Markdown**: [markdown-it](https://github.com/markdown-it/markdown-it)
- **代码高亮**: [Shiki](https://shiki.style/)
- **模板**: [Nunjucks](https://mozilla.github.io/nunjucks/)

## License

MIT
