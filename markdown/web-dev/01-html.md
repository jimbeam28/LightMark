---
title: HTML 基础
date: 2026-03-03
tags: [html, web, frontend]
excerpt:  HTML 是构建网页的基础语言，学习 HTML 标签和语义化结构。
---

# HTML 基础

HTML（HyperText Markup Language）是构建网页的标准标记语言。

## 基本结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面标题</title>
</head>
<body>
    <h1>Hello World</h1>
    <p>这是一个段落。</p>
</body>
</html>
```

## 常用标签

### 标题

```html
<h1>一级标题</h1>
<h2>二级标题</h2>
<h3>三级标题</h3>
```

### 段落和文本

```html
<p>这是一个段落。</p>
<strong>加粗文本</strong>
<em>斜体文本</em>
<code>代码</code>
```

### 链接和图片

```html
<a href="https://example.com">链接文本</a>
<img src="image.jpg" alt="描述文字">
```

### 列表

```html
<!-- 无序列表 -->
<ul>
    <li>项目 1</li>
    <li>项目 2</li>
</ul>

<!-- 有序列表 -->
<ol>
    <li>第一步</li>
    <li>第二步</li>
</ol>
```

## 语义化标签

HTML5 引入了语义化标签：

```html
<header>
    <nav>导航链接</nav>
</header>

<main>
    <article>
        <h1>文章标题</h1>
        <p>文章内容...</p>
    </article>
</main>

<footer>
    <p>版权信息</p>
</footer>
```

## 表单

```html
<form action="/submit" method="POST">
    <label for="name">姓名：</label>
    <input type="text" id="name" name="name" required>

    <label for="email">邮箱：</label>
    <input type="email" id="email" name="email">

    <button type="submit">提交</button>
</form>
```

## 最佳实践

1. 使用语义化标签
2. 添加 alt 属性到图片
3. 使用正确的标题层级
4. 确保表单有 label
