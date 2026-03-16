/**
 * 微信公众号编辑器 - 魔法一键排版助手 (V1.8 完美间距与样式修复版)
 */

(function () {
    console.log("微信排版助手 V1.8 - 核心已加载");

    const TypesetLogic = {
        isMarkdownSpecial(line) {
            const t = line.trim();
            if (!t) return false;
            return t.startsWith('#') || t.startsWith('-') || t.startsWith('*') ||
                t.startsWith('>') || t.startsWith('|') || /^\d+\.\s/.test(t);
        },
        isSpecialSection(line) {
            const t = line.trim().toLowerCase();
            const keywords = ['参考资料', '互动话题', '今日话题', 'sources', '推荐阅读', '小贴士', '参考书目'];
            return keywords.some(k => t.includes(k)) && t.length < 60;
        },
        preprocessMarkdown(md) {
            let content = md.replace(/\p{Extended_Pictographic}/gu, '');
            let lines = content.split('\n');
            const result = [];

            // 采用更稳健的空行过滤法
            let emptyCount = 0;
            for (let i = 0; i < lines.length; i++) {
                let text = lines[i].trim();
                if (!text) {
                    emptyCount++;
                    continue;
                }

                // 当遇到有效文本时，结算之前的空行
                // 不管用户敲了几个空行，最多只允许留 1 个额外的表示间隔
                if (emptyCount > 0 && result.length > 0) {
                    result.push(''); // 如果有空行，就插入一条代表视觉上的一行距离
                }
                emptyCount = 0;

                if (text === '---' || text === '***') {
                    result.push(text);
                    continue;
                }

                result.push(lines[i]); // 保留缩进
            }
            return result.join('\n');
        }
    };

    // --- 极简防御解析引擎 (自带渲染) ---
    // 为了防止复杂的 marked 再次引起冲突，我们自己实现一个安全、完全可控的 Markdown 转 HTML 引擎，
    // 支持：粗体、列表、标题、引用、分割线、特殊区块
    const DefenseParser = {
        parseInline: function (text) {
            // 加粗
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // 高亮或斜体，这里为了公号样式，把单星号也转成加粗
            text = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
            return text;
        },
        parse: function (md) {
            // 注意：属性里的字体名必须使用单引号，否则会报 InvalidCharacterError 导致大面积崩溃！
            const commonFont = "-apple-system-font,BlinkMacSystemFont,'Helvetica Neue','PingFang SC','Hiragino Sans GB','Microsoft YaHei UI','Microsoft YaHei',Arial,sans-serif;";
            const h1Style = 'font-size: 18px; font-weight: bold; margin: 25px 0 15px; text-align: center; color: #222; display: block; line-height: 1.4;';
            const h2Style = 'font-size: 17px; font-weight: bold; margin: 25px 0 15px; border-left: 5px solid #07c160; padding-left: 12px; color: #222; display: block; line-height: 1.3;';
            const pStyle = 'margin-bottom: 25px; line-height: 1.8; font-size: 15px; color:#3f3f3f; display: block;';
            const quoteStyle = 'background-color:#f8fcf9; border-left:5px solid #07c160; padding:20px 18px; border-radius:0 10px 10px 0; margin: 25px 0; display: block; font-size:15px; color:#333; line-height:1.6;';

            let result = [];
            let inList = false;
            let listItems = [];

            let lines = md.split('\n');

            const flushList = () => {
                if (inList && listItems.length > 0) {
                    result.push(`<ul style="margin-bottom: 25px; padding-left: 20px; font-size: 15px; color: #3f3f3f; line-height: 1.8;">${listItems.join('')}</ul>`);
                    listItems = [];
                    inList = false;
                }
            };

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                let t = line.trim();

                if (!t) {
                    flushList();
                    // 只在明确有一个空行时加入隔离
                    result.push(`<div style="height:25px;"></div>`);
                    continue;
                }

                if (t.startsWith('- ') || t.startsWith('* ')) {
                    inList = true;
                    listItems.push(`<li style="margin-bottom: 10px;">${this.parseInline(t.substring(2))}</li>`);
                    continue;
                }

                flushList();

                if (t === '---' || t === '***') {
                    result.push(`<div style="text-align:center;margin:35px 0;height:1px;background:#e1e8ed;clear:both;"><span style="position:relative;top:-13px;background:white;padding:0 15px;color:#07c160;letter-spacing:4px;font-size:14px;">✦ ✦ ✦</span></div>`);
                    continue;
                }

                // 处理特殊块（如互动话题、参考资料）- 这个逻辑必须在普通标题和段落之前
                if (TypesetLogic.isSpecialSection(t)) {
                    if (t.toLowerCase().match(/参考资料|sources|参考书目/)) {
                        const inner = t.replace(/^.*?(参考资料|Sources|参考书目)[:：]?\s*/i, '');
                        result.push(`<section style="font-size:12px; color:#888; background:#fafafa; padding:15px; border-radius:8px; margin:30px 0; border:1px solid #f0f0f0; display:block;"><strong style="color:#666; display:block; margin-bottom:10px; font-size:13px;">📚 推荐阅读 / 参考资料</strong><div style="line-height:1.7;">${this.parseInline(inner)}</div></section>`);
                    } else {
                        // 互动话题
                        result.push(`<section style="margin:30px 0; padding:20px 25px; background-color:#f0f9ff; border:1px dashed #3ea6ff; border-radius:12px; display:block;"><p style="font-size:15px; font-weight: bold; color:#1e40af; margin:0; line-height:1.6; text-align:center;">${this.parseInline(t)}</p></section>`);
                    }
                    continue;
                }

                if (t.startsWith('# ')) {
                    result.push(`<h1 style="${h1Style}">${this.parseInline(t.slice(2))}</h1>`);
                    continue;
                }
                if (t.startsWith('## ') || t.startsWith('### ')) {
                    result.push(`<h2 style="${h2Style}">${this.parseInline(t.replace(/^#+\s*/, ''))}</h2>`);
                    continue;
                }

                // 这里是微信特殊识别的要点：由于前面很多文本可能被解析过，引用必须严格匹配前缀
                if (t.startsWith('> ') || t.startsWith('＞ ')) {
                    const quoteText = t.replace(/^[>＞]\s*/, '');
                    result.push(`<div style="${quoteStyle}"><strong style="color:#07c160;font-size:17px;display:block;margin-bottom:10px;">QUOTE / 引言</strong>${this.parseInline(quoteText)}</div>`);
                    continue;
                }

                // 普通段落
                result.push(`<p style="${pStyle}">${this.parseInline(line)}</p>`);
            }
            flushList();

            return `<section style="font-family:${commonFont} padding:15px; background:white;">${result.join('')}</section>`;
        }
    };

    function addMagicBtn() {
        if (document.getElementById("magic-typeset-btn")) return;
        const btn = document.createElement("button");
        btn.id = "magic-typeset-btn";
        btn.innerHTML = "✨ 魔法自动排版 (V2.0)";
        btn.style.cssText = `
            position: fixed; right: 20px; top: 210px; z-index: 2147483647;
            padding: 14px 22px; background: linear-gradient(135deg, #07c160, #06ae56);
            color: #fff; border: none; border-radius: 50px; cursor: pointer;
            box-shadow: 0 4px 15px rgba(7, 193, 96, 0.4); font-weight: bold; font-size: 14px;
        `;
        btn.onclick = executeLayout;
        document.body.appendChild(btn);
    }

    function executeLayout() {
        const btn = this;
        btn.innerHTML = "🪄 正在施法...";
        btn.disabled = true;

        try {
            // 1. 获取编辑器
            const iframe = document.querySelector("#ueditor_0");
            let targetDoc = document;
            let editor = null;

            if (iframe) {
                try {
                    const win = iframe.contentWindow;
                    targetDoc = iframe.contentDocument || (win ? win.document : null);
                    if (targetDoc) editor = targetDoc.body;
                } catch (e) { console.warn("Iframe access denied."); }
            }

            if (!editor) {
                targetDoc = document;
                editor = document.querySelector("#js_editor") ||
                    document.querySelector(".edui-editor-body") ||
                    document.querySelector("[contenteditable='true']");
            }

            if (!editor) {
                alert("未能找到编辑器，请先点击一下文章正文。");
                btn.disabled = false;
                btn.innerHTML = "✨ 魔法自动排版 (V2.0)";
                return;
            }

            // 2. 预处理文本：处理间距、Emoji、特殊节点
            const rawMd = editor.innerText.trim();
            if (rawMd.length < 5) {
                alert("请先输入一些文字再排版。");
                btn.disabled = false;
                btn.innerHTML = "✨ 魔法自动排版 (V2.0)";
                return;
            }

            const processedMd = TypesetLogic.preprocessMarkdown(rawMd);

            // 3. 渲染 (使用原生安全解析器，100% 避开属性双引号等语法错误)
            const outputHtml = DefenseParser.parse(processedMd);

            // 4. 填充
            editor.focus();

            if (targetDoc && typeof targetDoc.execCommand === 'function') {
                targetDoc.execCommand('selectAll', false, null);
                targetDoc.execCommand('insertHTML', false, outputHtml);
            } else {
                editor.innerHTML = outputHtml;
                ['input', 'change', 'blur'].forEach(name => {
                    editor.dispatchEvent(new Event(name, { bubbles: true }));
                });
            }

            btn.innerHTML = "✅ 魔法完成！";
        } catch (err) {
            console.error("Critical Layout Error:", err);
            btn.innerHTML = "❌ 请看后台报错";
        } finally {
            setTimeout(function () {
                btn.disabled = false;
                btn.innerHTML = "✨ 魔法自动排版 (V2.0)";
            }, 3000);
        }
    }

    setInterval(addMagicBtn, 3000);
})();
