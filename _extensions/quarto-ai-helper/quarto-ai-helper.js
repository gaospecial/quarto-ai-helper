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
      promptTemplate: function (source, error) {
        return "我在编程中遇到了报错，请帮我分析原因并修复代码。\n\n【源代码】\n" + source + "\n\n【报错信息】\n" + error + "\n\n请直接给出修复后的代码及原因简述。";
      },
      noSource: "（无法获取源代码）"
    },
    en: {
      askChatGPT: "🤖 Ask ChatGPT",
      copyPrompt: "📋 Copy prompt for other AI",
      copied: "✅ Copied to clipboard",
      promptTemplate: function (source, error) {
        return "I encountered an error in my code. Please help me diagnose the issue and fix the code.\n\n[Source Code]\n" + source + "\n\n[Error Message]\n" + error + "\n\nPlease provide the fixed code and a brief explanation.";
      },
      noSource: "(Source code not available)"
    }
  };

  var t = isChinese ? i18n.zh : i18n.en;

  // ── 主逻辑 ──────────────────────────────────────────────────────────────
  function initAIHelper() {
    var errorBlocks = document.querySelectorAll(".cell-output-error");

    errorBlocks.forEach(function (block) {
      // 避免重复添加
      if (block.querySelector(".quarto-ai-helper-buttons")) return;

      // 找到所属 cell，再查找其中的源代码块
      var parentCell = block.closest(".cell");
      var sourceCodeBlock = parentCell
        ? parentCell.querySelector("pre.sourceCode")
        : null;

      // 构造发送给大模型的完整 prompt
      var getFullPrompt = function () {
        var sourceCode = sourceCodeBlock
          ? sourceCodeBlock.innerText.trim()
          : t.noSource;
        var errorMessage = block.innerText.trim();
        return t.promptTemplate(sourceCode, errorMessage);
      };

      // ── 容器 ────────────────────────────────────────────────────────────
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
      block.appendChild(container);
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
