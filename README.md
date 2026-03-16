# Quarto AI Helper

一个 Quarto Extension，自动识别文档中的代码运行错误，并在错误信息下方生成"一键求助"按钮，帮助学生快速调用大模型（ChatGPT 等）获取修复建议。

## 功能特性

- 🔍 **自动识别错误**：检测 Quarto 文档中所有 `error: true` 的代码块输出
- 🤖 **一键问 ChatGPT**：点击按钮即可将源代码和报错信息发送给 ChatGPT
- 📋 **复制 Prompt**：一键复制格式化的提问内容，方便在其他大模型中使用
- 🌐 **语言自适应**：根据浏览器/系统语言自动切换中英文界面
- ✅ **智能匹配**：只对 Error 输出显示按钮，Warning 和正常输出不受影响

## 安装

```bash
quarto add gaospecial/quarto-ai-helper
```

## 使用方法

在 Quarto 文档的 YAML 头部添加 filter：

```yaml
---
title: "My Document"
filters:
  - quarto-ai-helper
---
```

然后在代码块中使用 `error: true` 选项允许错误输出：

````markdown
```{r}
#| error: true
10 / "a"
```
````

渲染后，每个错误输出块下方会自动出现两个按钮：

- **🤖 问问 ChatGPT** — 自动将源代码和报错信息发送给 ChatGPT
- **📋 复制提问到其它大模型** — 将格式化的提问复制到剪贴板

## 示例

运行以下命令查看效果：

```bash
quarto render example.qmd
```

## 工作原理

1. Lua filter（`quarto-ai-helper.lua`）在渲染 HTML 时注入 JavaScript
2. JavaScript 在页面加载后扫描所有 `.cell-output-error` 元素
3. 对每个错误块，自动提取同一 cell 中的源代码和报错信息
4. 生成结构化的 Prompt 并创建交互按钮

## 支持格式

- ✅ HTML 输出（包括 Quarto 网站、书籍、幻灯片等）
- ❌ PDF / Word 等非 HTML 格式不支持（JavaScript 特性）

## 许可证

MIT
