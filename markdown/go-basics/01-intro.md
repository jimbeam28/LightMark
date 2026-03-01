---
title: Go 语言入门
date: 2026-03-01
tags: [go, basics]
excerpt:  Go 是一门由 Google 开发的编程语言，以其简洁、高效和强大的并发支持而闻名。
---

# Go 语言入门

Go（又称 Golang）是 Google 开发的一种静态强类型、编译型、并发型，并具有垃圾回收功能的编程语言。

## 安装 Go

### macOS

使用 Homebrew 安装：

```bash
brew install go
```

### Linux

```bash
sudo apt-get install golang-go
```

### Windows

下载 MSI 安装包并运行。

## Hello World

创建第一个 Go 程序：

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

运行程序：

```bash
go run hello.go
```

## 基础语法

### 变量声明

```go
// 完整声明
var name string = "Go"

// 类型推断
var age = 25

// 短变量声明
message := "Hello"
```

### 函数定义

```go
func add(a, b int) int {
    return a + b
}
```

### 结构体

```go
type Person struct {
    Name string
    Age  int
}

func main() {
    p := Person{Name: "Alice", Age: 30}
    fmt.Println(p.Name)
}
```

## 并发编程

Go 的 goroutine 让并发变得简单：

```go
func say(s string) {
    for i := 0; i < 5; i++ {
        time.Sleep(100 * time.Millisecond)
        fmt.Println(s)
    }
}

func main() {
    go say("world")
    say("hello")
}
```

## 总结

Go 语言以其简洁的语法和强大的标准库，成为云原生时代的首选语言之一。
