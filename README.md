# Quarto AI Error Helper Extension

这是一个专为 R 语言及数据科学教学设计的 Quarto 扩展。它能自动识别文档中出现的代码运行错误，并在错误信息下方生成“一键求助”按钮，帮助学生快速调用大模型（ChatGPT 等）获取修复建议。

## Installing

请在你的项目根目录下运行以下命令进行安装：

```bash
quarto add gaospecial/quarto-ai-helper
```

安装完成后，扩展文件将保存在 `_extensions` 子目录中。如果你使用 Git 进行版本控制，请务必将该目录一并提交。

## Using

在你的 Quarto 文档（`.qmd`）的 YAML 元数据中添加 `ai-helper` 过滤器即可启用：

```yaml
---
title: "我的实验报告"
filters:
  - quarto-ai-helper
---

```

**功能说明：**

* **自动检测**：当代码块设置了 `#| error: true` 且运行出错时，文档会自动在报错信息下渲染工具栏。
* **问问 ChatGPT**：自动将“源代码 + 错误信息”组合成提示词并跳转至 ChatGPT 对话框。
* **复制提问到其它大模型**：一键复制经过清洁处理的结构化提示词，方便手动粘贴至 Gemini、通义千问、豆包等其它大语言模型进行咨询。

## Example

你可以参考仓库中的 [example.qmd](./example.qmd) 快速上手。

简单的测试示例如下：

````markdown
---
title: "AI Helper Test"
filters:
  - quarto-ai-helper
---

## 故意制造一个错误

```{r}
#| error: true
# 运行这段代码将看到 AI 辅助按钮
10 / "a"
```

````

---

### 💡 给维护者的建议：

1. **替换 ID**：将上述 `Installing` 部分的 `<your-github-id>` 替换为你真实的 GitHub 用户名。
2. **教学提示**：建议在课程开始前，让学生统一运行一次 `quarto add`，以确保他们的本地环境都能享受到这个便捷功能。
3. **版本更新**：如果你后续修改了 Prompt 模板，告知学生运行 `quarto update gaospecial/quarto-ai-helper` 即可完成升级。
