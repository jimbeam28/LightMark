---
title: CSS 布局技巧
date: 2026-03-04
tags: [css, web, frontend, layout]
excerpt:  掌握 CSS 布局技巧，包括 Flexbox 和 Grid 布局系统。
---

# CSS 布局技巧

CSS 提供了多种布局方式，从传统的浮动布局到现代的 Flexbox 和 Grid。

## Flexbox 布局

Flexbox 是一维布局系统，适合行或列的排列。

### 基础概念

```css
.container {
    display: flex;
    justify-content: center;  /* 主轴对齐 */
    align-items: center;      /* 交叉轴对齐 */
    gap: 20px;                /* 项目间距 */
}
```

### 常用属性

| 属性 | 说明 |
|------|------|
| `flex-direction` | 主轴方向 (row/column) |
| `justify-content` | 主轴对齐方式 |
| `align-items` | 交叉轴对齐方式 |
| `flex-wrap` | 是否换行 |
| `gap` | 项目间距 |

### 示例：居中布局

```css
.center-box {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}
```

### 示例：导航栏

```css
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
}

.nav-links {
    display: flex;
    gap: 30px;
    list-style: none;
}
```

## Grid 布局

Grid 是二维布局系统，可以同时处理行和列。

### 基础概念

```css
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}
```

### 常用属性

| 属性 | 说明 |
|------|------|
| `grid-template-columns` | 定义列 |
| `grid-template-rows` | 定义行 |
| `grid-gap` / `gap` | 间距 |
| `grid-column` | 跨越列数 |
| `grid-row` | 跨越行数 |

### 示例：响应式网格

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
}
```

### 示例：圣杯布局

```css
.layout {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
}

.header { grid-column: 1 / -1; }
.footer { grid-column: 1 / -1; }
```

## 响应式设计

### 媒体查询

```css
/* 移动端优先 */
.container {
    padding: 16px;
}

/* 平板 */
@media (min-width: 768px) {
    .container {
        padding: 24px;
        max-width: 720px;
        margin: 0 auto;
    }
}

/* 桌面 */
@media (min-width: 1024px) {
    .container {
        padding: 32px;
        max-width: 1200px;
    }
}
```

### 常用断点

| 断点 | 设备 |
|------|------|
| < 640px | 手机 |
| 640px - 768px | 大手机/小平板 |
| 768px - 1024px | 平板 |
| > 1024px | 桌面 |

## CSS 变量

```css
:root {
    --primary-color: #2563eb;
    --text-color: #1f2937;
    --bg-color: #ffffff;
    --spacing: 1rem;
}

.button {
    background-color: var(--primary-color);
    padding: var(--spacing);
}

@media (prefers-color-scheme: dark) {
    :root {
        --text-color: #f3f4f6;
        --bg-color: #111827;
    }
}
```

## 总结

- Flexbox 适合一维布局（导航、居中）
- Grid 适合二维布局（整体页面、卡片网格）
- 媒体查询实现响应式
- CSS 变量提高可维护性
