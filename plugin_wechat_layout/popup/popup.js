/**
 * 微信排版助手 - Popup 核心逻辑 (插件专版)
 */

// --- 样式逻辑同步 (封装) ---
function isMarkdownSpecial(line) {
    const t = line.trim();
    return t.startsWith('#') || t.startsWith('-') || t.startsWith('*') ||
        t.startsWith('>') || t.startsWith('|') || /^\d+\.\s/.test(t);
}

function isSpecialSection(line) {
    const t = line.trim().toLowerCase();
    const keywords = ['参考资料', '互动话题', '今日话题', 'sources', '推荐阅读', '小贴士', '参考书目'];
    return keywords.some(k => t.includes(k)) && t.length < 60;
}

function preprocessMarkdown(lines) {
    const result = [];
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let trimmed = line.trim();

        if (trimmed === '---' || trimmed === '***') {
            result.push('\n---\n');
            let j = i + 1;
            while (j < lines.length && lines[j].trim() === '') { j++; }
            if (j < lines.length) {
                let candidate = lines[j].trim();
                if (!isMarkdownSpecial(candidate) && !isSpecialSection(candidate) &&
                    candidate.length > 0 && candidate.length < 35 && !candidate.endsWith('。')) {
                    if (/["“《「—-]/.test(candidate) || /VS/i.test(candidate)) {
                        result.push('\n\n# ' + candidate + '\n\n');
                        i = j;
                        continue;
                    }
                }
            }
            continue;
        }
        result.push(line);
    }
    return result;
}

function transformMarkdown(md) {
    if (!md) return '';
    // --- 库探测与初始化 (解决 Renderer is not a constructor) ---
    let markedInstance = window.marked;
    if (!markedInstance) {
        return '<p style="color:red;">错误：Marked 库未加载，请检查文件结构。</p>';
    }

    // 智能获取 Renderer 构造函数
    let RendererConstructor = null;
    if (markedInstance.Renderer) {
        RendererConstructor = markedInstance.Renderer;
    } else if (markedInstance.marked && markedInstance.marked.Renderer) {
        RendererConstructor = markedInstance.marked.Renderer;
    } else {
        try {
            const tempInstance = (typeof markedInstance === 'function') ? new markedInstance.Marked() : null;
            if (tempInstance && tempInstance.defaults && tempInstance.defaults.renderer) {
                RendererConstructor = tempInstance.defaults.renderer.constructor;
            }
        } catch(e) {}
    }

    if (!RendererConstructor) {
        return '<p style="color:red;">错误：无法找到有效的 Marked 渲染器构造函数。</p>';
    }

    try {
        let content = md.replace(/\p{Extended_Pictographic}/gu, '');
        let lines = content.split('\n');
        let processedLines = preprocessMarkdown(lines);
        const finalMd = processedLines.join('\n');

        const renderer = new RendererConstructor();
        const commonFont = '-apple-system-font,BlinkMacSystemFont,"Helvetica Neue","PingFang SC","Hiragino Sans GB","Microsoft YaHei UI","Microsoft YaHei",Arial,sans-serif;';
        const containerStyle = `font-family: ${commonFont} font-size: 15px; color: #3f3f3f; line-height: 1.75; letter-spacing: 0.5px; padding: 10px 15px;`;
        
        renderer.heading = (text, level) => {
            if (isSpecialSection(text)) {
                return `<p style="font-weight: bold; font-size: 15px; margin: 20px 0 10px; color: #222;">${text}</p>`;
            }
            if (level === 1) {
                return `<h1 style="font-size: 18px; font-weight: bold; margin: 35px 0 20px; text-align: center; color: #222; line-height: 1.4;">${text}</h1>`;
            }
            if (level === 2 || level === 3) {
                return `<h2 style="font-size: 17px; font-weight: bold; margin: 30px 0 15px; border-left: 5px solid #07c160; padding-left: 12px; color: #222; line-height: 1.3;">${text}</h2>`;
            }
            return `<p style="font-weight: bold; font-size: 15px; margin: 20px 0 8px; color: #333;">${text}</p>`;
        };

        renderer.blockquote = (text) => {
            const lineContent = text.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '').trim();
            return `
                <table style="width:100%; margin:30px 0; border:none; border-collapse:collapse; display:table;">
                    <tr>
                        <td style="background-color:#f8fcf9; border-left:5px solid #07c160; padding:22px 18px; border-radius:0 10px 10px 0;">
                            <section style="font-size:17px; color:#07c160; font-weight:bold; margin-bottom:12px; display:block;">QUOTE / 引言</section>
                            <section style="font-size:15px; color:#333; line-height:1.6; display:block; font-style:normal;">${lineContent}</section>
                        </td>
                    </tr>
                </table>
            `;
        };

        renderer.table = (header, body) => {
            return `
                <section style="width:100%; border:1px solid #e1e8ed; border-radius:8px; margin:30px 0; overflow-x:auto;">
                    <table style="width:100%; border-collapse:collapse; min-width:400px; display:table; table-layout:auto;">
                        <thead style="background-color:#f6ffed; border-bottom:1px solid #e1e8ed;">${header}</thead>
                        <tbody style="background-color:#fff;">${body}</tbody>
                    </table>
                </section>
            `;
        };

        renderer.tablecell = (content, flags) => {
            const tag = flags.header ? 'th' : 'td';
            const cleanContent = content.replace(/<\/?p[^>]*>/g, '').trim();
            const cellStyle = `padding:12px 10px; border:1px solid #e1e8ed; text-align:left; font-size:14px; line-height:1.4; ${flags.header ? 'color:#07c160; font-weight:bold;' : 'color:#444;'}`;
            return `<${tag} style="${cellStyle}">${cleanContent}</${tag}>`;
        };

        renderer.paragraph = (text) => {
            const cleanT = text.trim();
            if (isSpecialSection(cleanT)) {
                const isReference = cleanT.toLowerCase().includes('参考资料') || cleanT.toLowerCase().includes('sources') || cleanT.toLowerCase().includes('参考书目');
                if (isReference) {
                    const inner = cleanT.replace(/^.*?(参考资料|Sources|参考书目)[:：]?\s*/i, '');
                    return `<section style="font-size:12px; color:#888; background:#fafafa; padding:20px; border-radius:8px; margin:40px 0; border:1px solid #f0f0f0;"><strong style="color:#666; display:block; margin-bottom:10px; font-size:13px;">📚 推荐阅读 / 参考资料</strong><div style="line-height:1.7;">${inner}</div></section>`;
                } else {
                    return `<section style="margin:40px 0; padding:25px; background-color:#f0f9ff; border:1px dashed #3ea6ff; border-radius:12px;"><p style="font-size:14px; font-weight: bold; color:#1e40af; margin:0; line-height:1.6;">${cleanT}</p></section>`;
                }
            }
            return `<p style="margin-bottom:1.6em; line-height:1.8; font-size: 15px; color:#3f3f3f;">${text}</p>`;
        };

        renderer.hr = () => `
            <section style="text-align:center; margin:45px 0; height:1px; border:none; display:block;">
                <div style="display:inline-block; position:relative; top:-14px; padding:0 15px; background:#fff; color:#07c160; letter-spacing:12px; font-size:14px;">✦ ✦ ✦</div>
                <div style="height:1px; background-color:#e1e8ed; width:100%; margin-top:-12px;"></div>
            </section>
        `;

        const html = marked.parse(finalMd, { renderer });
        return `<section style="${containerStyle}">${html}</section>`;
    } catch (e) {
        console.error("Layout failed:", e);
        return `<p style="color:red;">排版失败：${e.message}</p>`;
    }
}

// --- UI Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const inputMd = document.getElementById('input-md');
    const outputHtml = document.getElementById('output-html');
    const btnFormat = document.getElementById('btn-format');
    const btnCopy = document.getElementById('btn-copy');

    if (!btnFormat || !inputMd || !outputHtml) {
        console.error("Required DOM elements missing!");
        return;
    }

    btnFormat.addEventListener('click', () => {
        const md = inputMd.value.trim();
        if (!md) {
            outputHtml.innerHTML = '<div class="empty-state">请输入内容再排版</div>';
            return;
        }
        const html = transformMarkdown(md);
        outputHtml.innerHTML = html;
        
        // 图片自适应
        outputHtml.querySelectorAll('img').forEach(img => {
            img.style.cssText = 'max-width:100%; height:auto; display:block; margin:15px auto;';
        });
    });

    btnCopy.addEventListener('click', () => {
        const htmlContent = outputHtml.innerHTML;
        if (!htmlContent || outputHtml.querySelector('.empty-state')) {
            alert("请先生成排版内容！");
            return;
        }

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const data = [new ClipboardItem({ 
            'text/html': blob, 
            'text/plain': new Blob([outputHtml.innerText], { type: 'text/plain' }) 
        })];

        navigator.clipboard.write(data).then(() => {
            const originalText = btnCopy.innerHTML;
            btnCopy.innerHTML = '✅ 已复制';
            setTimeout(() => btnCopy.innerHTML = '📋 复制 HTML', 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('复制失败，请重试');
        });
    });
});
