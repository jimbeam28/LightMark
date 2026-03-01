---
title: Go 基础语法
date: 2026-03-02
tags: [go, basics, syntax]
excerpt:  学习 Go 语言的基础语法，包括变量、常量、数据类型和控制结构。
---

# Go 基础语法

本文介绍 Go 语言的基础语法知识。

## 变量和常量

### 变量

Go 语言使用 `var` 关键字声明变量：

```go
var a int = 10
var b = 20  // 类型推断
c := 30     // 短变量声明，只能在函数内部使用
```

### 常量

使用 `const` 声明常量：

```go
const Pi = 3.14159
const (
    Monday = iota
    Tuesday
    Wednesday
)
```

## 数据类型

### 基本类型

| 类型 | 说明 | 示例 |
|------|------|------|
| bool | 布尔型 | true, false |
| string | 字符串 | "hello" |
| int | 整型 | 42 |
| float64 | 浮点型 | 3.14 |
| complex64 | 复数 | 1+2i |

### 复合类型

#### 数组和切片

```go
// 数组
arr := [5]int{1, 2, 3, 4, 5}

// 切片
slice := []int{1, 2, 3}
slice = append(slice, 4)
```

#### Map

```go
m := make(map[string]int)
m["key"] = 100

// 字面量
m2 := map[string]int{
    "a": 1,
    "b": 2,
}
```

## 控制结构

### if 语句

```go
if x > 0 {
    fmt.Println("positive")
} else if x < 0 {
    fmt.Println("negative")
} else {
    fmt.Println("zero")
}

// 带初始化语句
if err := doSomething(); err != nil {
    return err
}
```

### for 循环

```go
// 基础形式
for i := 0; i < 10; i++ {
    fmt.Println(i)
}

// 条件形式
for x < 100 {
    x *= 2
}

// 无限循环
for {
    // do something
}

// 遍历切片
for i, v := range slice {
    fmt.Printf("index: %d, value: %d\n", i, v)
}
```

### switch 语句

```go
switch os := runtime.GOOS; os {
case "darwin":
    fmt.Println("macOS")
case "linux":
    fmt.Println("Linux")
default:
    fmt.Println("Other")
}
```

## 函数

### 多返回值

```go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}
```

### 匿名函数

```go
func main() {
    add := func(a, b int) int {
        return a + b
    }
    fmt.Println(add(1, 2))
}
```

## 下一步

继续学习 [Go 的面向对象特性](../03-oop)。
