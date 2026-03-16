/* quarto-ai-helper.js */
(function () {
  // ── i18n 多语言支持（根据浏览器/系统语言自动切换）──────────────────────
  var lang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
  var isChinese = lang.startsWith("zh");

  var i18n = {
    zh: {
      askChatGPT: "🤖 问问 ChatGPT",
      copyPrompt: "📋 复制提问到其它大模型",
      copied: "✅ 已复制到剪贴板",
      promptTemplate: function (source, error, language) {
        return "我在 Quarto 文档中运行 " + language + " 代码时遇到了报错，请帮我分析原因并修复代码。\n\n" +
          "## 源代码\n\n" +
          "```" + language.toLowerCase() + "\n" + source + "\n```\n\n" +
          "## 报错信息\n\n" +
          "```\n" + error + "\n```\n\n" +
          "请用 Markdown 格式回答，直接给出修复后的代码及原因简述。";
      },
      noSource: "（无法获取源代码）"
    },
    en: {
      askChatGPT: "🤖 Ask ChatGPT",
      copyPrompt: "📋 Copy prompt for other AI",
      copied: "✅ Copied to clipboard",
      promptTemplate: function (source, error, language) {
        return "I encountered an error while running " + language + " code in a Quarto document. " +
          "Please help me diagnose the issue and fix the code.\n\n" +
          "## Source Code\n\n" +
          "```" + language.toLowerCase() + "\n" + source + "\n```\n\n" +
          "## Error Message\n\n" +
          "```\n" + error + "\n```\n\n" +
          "Please respond in Markdown format with the fixed code and a brief explanation.";
      },
      noSource: "(Source code not available)"
    }
  };

  var t = isChinese ? i18n.zh : i18n.en;

  // ── 辅助函数：检测代码语言 ─────────────────────────────────────────────
  function detectLanguage(sourceCodeBlock) {
    if (!sourceCodeBlock) return "R";
    // Quarto 生成的 <pre class="sourceCode r"> 或 <pre class="sourceCode python">
    var classList = sourceCodeBlock.className || "";
    if (classList.indexOf("python") !== -1) return "Python";
    if (classList.indexOf("julia") !== -1) return "Julia";
    if (classList.indexOf("bash") !== -1) return "Bash";
    if (classList.indexOf("js") !== -1 || classList.indexOf("javascript") !== -1) return "JavaScript";
    return "R"; // 默认 R
  }

  // ── 辅助函数：获取纯错误文本（排除按钮容器）────────────────────────────
  function getErrorText(block) {
    var text = "";
    var children = block.childNodes;
    for (var i = 0; i < children.length; i++) {
      var node = children[i];
      // 跳过按钮容器
      if (node.nodeType === 1 && node.classList && node.classList.contains("quarto-ai-helper-buttons")) {
        continue;
      }
      text += (node.textContent || "");
    }
    return text.trim();
  }

  // ── 辅助函数：获取完整的源代码（包括代码块中的所有 <pre> 内容）──────────
  function getSourceCode(parentCell) {
    if (!parentCell) return null;
    var codeBlocks = parentCell.querySelectorAll("pre.sourceCode");
    if (codeBlocks.length === 0) return null;
    var parts = [];
    for (var i = 0; i < codeBlocks.length; i++) {
      var code = codeBlocks[i].innerText.trim();
      if (code) parts.push(code);
    }
    return parts.length > 0 ? parts.join("\n\n") : null;
  }

  // ── 主逻辑 ──────────────────────────────────────────────────────────────
  function initAIHelper() {
    var errorBlocks = document.querySelectorAll(".cell-output-error");

    errorBlocks.forEach(function (block) {
      // 避免重复添加
      if (block.querySelector(".quarto-ai-helper-buttons")) return;

      // 找到所属 cell
      var parentCell = block.closest(".cell");

      // 获取源代码块（用于检测语言）
      var firstSourceBlock = parentCell
        ? parentCell.querySelector("pre.sourceCode")
        : null;

      // 检测编程语言
      var language = detectLanguage(firstSourceBlock);

      // 先保存原始错误文本（在添加按钮之前）
      var originalErrorText = block.innerText.trim();

      // 构造发送给大模型的完整 prompt
      var getFullPrompt = function () {
        var sourceCode = getSourceCode(parentCell) || t.noSource;
        var errorMessage = originalErrorText;
        return t.promptTemplate(sourceCode, errorMessage, language);
      };

      // ── 容器（放在 block 外部，作为兄弟元素）──────────────────────────
      var container = document.createElement("div");
      container.className = "quarto-ai-helper-buttons";
      container.style.cssText =
        "margin-top: 12px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;";

      // ── ChatGPT 按钮 ─────────────────────────────────────────────────────
      var chatBtn = document.createElement("button");
      chatBtn.innerText = t.askChatGPT;
      chatBtn.className = "btn btn-success btn-sm";
      chatBtn.onclick = function () {
        var prompt = getFullPrompt();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(prompt).catch(function () {});
        }
        window.open(
          "https://chatgpt.com/?q=" + encodeURIComponent(prompt),
          "_blank"
        );
      };

      // ── 复制按钮 ─────────────────────────────────────────────────────────
      var copyBtn = document.createElement("button");
      copyBtn.innerText = t.copyPrompt;
      copyBtn.className = "btn btn-outline-secondary btn-sm";
      copyBtn.onclick = function () {
        var prompt = getFullPrompt();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(prompt).then(function () {
            var original = copyBtn.innerText;
            copyBtn.innerText = t.copied;
            setTimeout(function () {
              copyBtn.innerText = original;
            }, 2000);
          });
        } else {
          // 降级方案：使用 execCommand
          var ta = document.createElement("textarea");
          ta.value = prompt;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          try {
            document.execCommand("copy");
            var original = copyBtn.innerText;
            copyBtn.innerText = t.copied;
            setTimeout(function () {
              copyBtn.innerText = original;
            }, 2000);
          } catch (e) {}
          document.body.removeChild(ta);
        }
      };

      container.appendChild(chatBtn);
      container.appendChild(copyBtn);

      // 将按钮容器插入到 error block 的后面（作为兄弟节点），而非内部
      block.parentNode.insertBefore(container, block.nextSibling);
    });
  }

  // ── 确保 DOM 已就绪后执行 ────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAIHelper);
  } else {
    // DOM 已经加载完成（脚本在 body 末尾时常见此情况）
    initAIHelper();
  }
})();
