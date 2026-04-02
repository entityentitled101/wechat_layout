/**
 * 微信排版助手 - Popup 核心逻辑 (V2.0)
 */

// ============================================
// 默认设置
// ============================================
const DEFAULT_SETTINGS = {
    h1Size: 20,
    h2Size: 17,
    h3Size: 15,
    hrStyle: 'stars',
    boldColor: '#07c160',
    highlightQuotes: true,
    autoHrBeforeH1: true,
    autoHrBeforeH2: true,
    autoHrBeforeH3: false,
    themeColor: '#07c160'
};

// ============================================
// 设置管理
// ============================================
const SettingsManager = {
    get() {
        try {
            const saved = localStorage.getItem('wechat_typeset_settings');
            if (saved) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Settings load error:', e);
        }
        return { ...DEFAULT_SETTINGS };
    },

    set(settings) {
        localStorage.setItem('wechat_typeset_settings', JSON.stringify(settings));
    }
};

// ============================================
// 样式生成器
// ============================================
const StyleGenerator = {
    getCommonFont() {
        return '-apple-system-font,BlinkMacSystemFont,"Helvetica Neue","PingFang SC","Hiragino Sans GB","Microsoft YaHei UI","Microsoft YaHei",Arial,sans-serif;';
    },

    getContainerStyle() {
        return `font-family: ${this.getCommonFont()} font-size: 15px; color: #3f3f3f; line-height: 1.75; letter-spacing: 0.5px; padding: 10px 15px;`;
    },

    getH1Style(settings) {
        const size = settings?.h1Size || 20;
        return `font-size: ${size}px; font-weight: bold; margin: 35px 0 20px; text-align: center; color: #222; line-height: 1.4;`;
    },

    getH2Style(settings) {
        const size = settings?.h2Size || 17;
        const color = settings?.themeColor || '#07c160';
        return `font-size: ${size}px; font-weight: bold; margin: 30px 0 15px; border-left: 5px solid ${color}; padding-left: 12px; color: #222; line-height: 1.3;`;
    },

    getH3Style(settings) {
        const size = settings?.h3Size || 15;
        const color = settings?.themeColor || '#07c160';
        return `font-size: ${size}px; font-weight: bold; margin: 25px 0 12px; color: ${color}; line-height: 1.3;`;
    },

    getParagraphStyle() {
        return `margin-bottom: 1.6em; line-height: 1.8; font-size: 15px; color: #3f3f3f;`;
    },

    getHrStyle(settings) {
        const style = settings?.hrStyle || 'stars';
        const color = settings?.themeColor || '#07c160';
        
        const styles = {
            stars: {
                container: 'text-align: center; margin: 45px 0; height: 1px; border: none; display: block;',
                content: `<div style="display: inline-block; position: relative; top: -14px; padding: 0 15px; background: #fff; color: ${color}; letter-spacing: 12px; font-size: 14px;">✦ ✦ ✦</div><div style="height: 1px; background-color: #e1e8ed; width: 100%; margin-top: -12px;"></div>`
            },
            line: {
                container: 'text-align: center; margin: 40px 0; height: 1px; border: none; display: block;',
                content: `<div style="height: 1px; background: linear-gradient(to right, transparent, ${color}, transparent); width: 60%; margin: 0 auto;"></div>`
            },
            dots: {
                container: 'text-align: center; margin: 40px 0; display: block;',
                content: `<div style="color: ${color}; letter-spacing: 8px; font-size: 20px; opacity: 0.6;">···</div>`
            },
            wave: {
                container: 'text-align: center; margin: 40px 0; display: block;',
                content: `<div style="color: ${color}; letter-spacing: 4px; font-size: 18px; opacity: 0.7;">〜 〜 〜</div>`
            },
            none: {
                container: 'display: none;',
                content: ''
            }
        };
        
        return styles[style] || styles.stars;
    },

    getBoldStyle(settings) {
        if (settings?.boldColor) {
            return `color: ${settings.boldColor}; font-weight: bold;`;
        }
        return 'font-weight: bold;';
    }
};

// ============================================
// Markdown 处理器
// ============================================
const MarkdownProcessor = {
    settings: null,

    init(settings) {
        this.settings = settings;
    },

    isMarkdownSpecial(line) {
        const t = line.trim();
        return t.startsWith('#') || t.startsWith('-') || t.startsWith('*') ||
            t.startsWith('>') || t.startsWith('|') || /^\d+\.\s/.test(t);
    },

    isSpecialSection(line) {
        const t = line.trim().toLowerCase();
        const keywords = ['参考资料', '互动话题', '今日话题', 'sources', '推荐阅读', '小贴士', '参考书目', '总结', '结语'];
        return keywords.some(k => t.includes(k)) && t.length < 60;
    },

    preprocess(content) {
        let lines = content.replace(/\p{Extended_Pictographic}/gu, '').split('\n');
        const result = [];
        let prevWasContent = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let trimmed = line.trim();

            if (!trimmed) {
                result.push('');
                continue;
            }

            if (trimmed === '---' || trimmed === '***') {
                result.push('---');
                prevWasContent = false;
                continue;
            }

            const isH1 = trimmed.startsWith('# ') && !trimmed.startsWith('## ');
            const isH2 = trimmed.startsWith('## ') && !trimmed.startsWith('### ');
            const isH3 = trimmed.startsWith('### ') && !trimmed.startsWith('#### ');

            if ((isH1 && this.settings?.autoHrBeforeH1) || 
                (isH2 && this.settings?.autoHrBeforeH2)) {
                if (prevWasContent && result.length > 0 && result[result.length - 1] !== '---') {
                    result.push('---');
                }
            }

            result.push(line);

            if (!this.isMarkdownSpecial(line) && !this.isSpecialSection(trimmed)) {
                prevWasContent = true;
            } else if (isH1 || isH2 || isH3 || trimmed === '---') {
                prevWasContent = false;
            }
        }

        return result.join('\n');
    },

    parseInline(text) {
        const boldStyle = StyleGenerator.getBoldStyle(this.settings);
        text = text.replace(/\*\*(.*?)\*\*/g, `<strong style="${boldStyle}">$1</strong>`);
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        text = text.replace(/`([^`]+)`/g, '<code style="background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #e83e8c;">$1</code>');
        text = text.replace(/~~(.*?)~~/g, '<del style="opacity: 0.6;">$1</del>');
        
        if (this.settings?.highlightQuotes) {
            const themeColor = this.settings?.themeColor || '#07c160';
            text = text.replace(/《([^》]+)》/g, `<span style="color: ${themeColor}; font-weight: 500;">《$1》</span>`);
        }
        
        return text;
    },

    transform(md) {
        if (!md) return '';

        const processed = this.preprocess(md);
        const settings = this.settings;

        const renderer = new marked.Renderer();

        renderer.heading = (text, level) => {
            if (this.isSpecialSection(text)) {
                return `<p style="font-weight: bold; font-size: 15px; margin: 20px 0 10px; color: #222;">${text}</p>`;
            }
            
            const parsedText = this.parseInline(text);
            
            if (level === 1) {
                return `<h1 style="${StyleGenerator.getH1Style(settings)}">${parsedText}</h1>`;
            }
            if (level === 2) {
                return `<h2 style="${StyleGenerator.getH2Style(settings)}">${parsedText}</h2>`;
            }
            if (level === 3) {
                return `<h3 style="${StyleGenerator.getH3Style(settings)}">${parsedText}</h3>`;
            }
            return `<h4 style="font-size: 15px; font-weight: bold; margin: 20px 0 10px; color: #333;">${parsedText}</h4>`;
        };

        renderer.blockquote = (text) => {
            const lineContent = text.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '').trim();
            const parsedContent = this.parseInline(lineContent);
            const themeColor = settings?.themeColor || '#07c160';
            
            return `
                <table style="width: 100%; margin: 30px 0; border: none; border-collapse: collapse; display: table;">
                    <tr>
                        <td style="background-color: #f8fcf9; border-left: 5px solid ${themeColor}; padding: 22px 18px; border-radius: 0 10px 10px 0;">
                            <section style="font-size: 17px; color: ${themeColor}; font-weight: bold; margin-bottom: 12px; display: block;">QUOTE / 引言</section>
                            <section style="font-size: 15px; color: #333; line-height: 1.6; display: block; font-style: normal;">${parsedContent}</section>
                        </td>
                    </tr>
                </table>
            `;
        };

        renderer.table = (header, body) => {
            const themeColor = settings?.themeColor || '#07c160';
            return `
                <section style="width: 100%; border: 1px solid #e1e8ed; border-radius: 8px; margin: 30px 0; overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; min-width: 400px; display: table; table-layout: auto;">
                        <thead style="background-color: #f6ffed; border-bottom: 1px solid #e1e8ed;">${header}</thead>
                        <tbody style="background-color: #fff;">${body}</tbody>
                    </table>
                </section>
            `;
        };

        renderer.tablecell = (content, flags) => {
            const tag = flags.header ? 'th' : 'td';
            const cleanContent = content.replace(/<\/?p[^>]*>/g, '').trim();
            const parsedContent = this.parseInline(cleanContent);
            const themeColor = settings?.themeColor || '#07c160';
            const cellStyle = `padding: 12px 10px; border: 1px solid #e1e8ed; text-align: left; font-size: 14px; line-height: 1.4; ${flags.header ? `color: ${themeColor}; font-weight: bold;` : 'color: #444;'}`;
            return `<${tag} style="${cellStyle}">${parsedContent}</${tag}>`;
        };

        renderer.paragraph = (text) => {
            const cleanT = text.trim();
            if (this.isSpecialSection(cleanT)) {
                const isReference = /参考资料|sources|参考书目/i.test(cleanT);
                const parsedText = this.parseInline(cleanT);
                
                if (isReference) {
                    const inner = cleanT.replace(/^.*?(参考资料|Sources|参考书目)[:：]?\s*/i, '');
                    return `<section style="font-size: 12px; color: #888; background: #fafafa; padding: 20px; border-radius: 8px; margin: 40px 0; border: 1px solid #f0f0f0;"><strong style="color: #666; display: block; margin-bottom: 10px; font-size: 13px;">📚 推荐阅读 / 参考资料</strong><div style="line-height: 1.7;">${this.parseInline(inner)}</div></section>`;
                } else {
                    return `<section style="margin: 40px 0; padding: 25px; background-color: #f0f9ff; border: 1px dashed #3ea6ff; border-radius: 12px;"><p style="font-size: 14px; font-weight: bold; color: #1e40af; margin: 0; line-height: 1.6;">${parsedText}</p></section>`;
                }
            }
            
            const parsedText = this.parseInline(text);
            return `<p style="${StyleGenerator.getParagraphStyle()}">${parsedText}</p>`;
        };

        renderer.hr = () => {
            const hrStyle = StyleGenerator.getHrStyle(settings);
            return `<section style="${hrStyle.container}">${hrStyle.content}</section>`;
        };

        renderer.list = (body, ordered) => {
            const type = ordered ? 'ol' : 'ul';
            const style = ordered 
                ? 'margin-bottom: 25px; padding-left: 25px; font-size: 15px; color: #3f3f3f; line-height: 1.8; list-style-type: decimal;'
                : 'margin-bottom: 25px; padding-left: 20px; font-size: 15px; color: #3f3f3f; line-height: 1.8; list-style-type: disc;';
            return `<${type} style="${style}">${body}</${type}>`;
        };

        renderer.listitem = (text) => {
            const parsedText = this.parseInline(text);
            return `<li style="margin-bottom: 10px;">${parsedText}</li>`;
        };

        renderer.link = (href, title, text) => {
            return `<a href="${href}" style="color: #576b95; text-decoration: underline;" target="_blank">${text}</a>`;
        };

        renderer.code = (code, language) => {
            return `<pre style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; overflow-x: auto; margin: 20px 0;"><code style="font-family: 'Fira Code', Consolas, monospace; font-size: 13px; line-height: 1.6; color: #333;">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
        };

        renderer.image = (href, title, text) => {
            return `<img src="${href}" alt="${text}" style="max-width: 100%; height: auto; display: block; margin: 20px auto; border-radius: 8px;" />`;
        };

        const html = marked.parse(processed, { renderer });
        return `<section style="${StyleGenerator.getContainerStyle()}">${html}</section>`;
    }
};

// ============================================
// UI 控制器
// ============================================
const UIController = {
    settings: null,

    init() {
        this.settings = SettingsManager.get();
        MarkdownProcessor.init(this.settings);
        this.bindEvents();
        this.renderSettings();
    },

    bindEvents() {
        const inputMd = document.getElementById('input-md');
        const btnFormat = document.getElementById('btn-format');
        const btnPlay = document.getElementById('btn-play');
        const btnCopy = document.getElementById('btn-copy');
        const btnSettingsToggle = document.getElementById('btn-settings-toggle');
        const settingsPanel = document.getElementById('settings-panel');
        const btnSaveSettings = document.getElementById('btn-save-settings');

        // 排版按钮
        const doFormat = () => {
            const md = inputMd?.value?.trim();
            const outputHtml = document.getElementById('output-html');
            
            if (!md) {
                outputHtml.innerHTML = '<div class="empty-state">请输入 Markdown 内容</div>';
                return;
            }

            // 播放按钮动画
            if (btnPlay) {
                btnPlay.innerHTML = '✨';
                setTimeout(() => btnPlay.innerHTML = '▶', 500);
            }

            MarkdownProcessor.init(this.settings);
            const html = MarkdownProcessor.transform(md);
            outputHtml.innerHTML = html;
        };

        btnFormat?.addEventListener('click', doFormat);
        btnPlay?.addEventListener('click', doFormat);

        // 设置面板切换
        btnSettingsToggle?.addEventListener('click', () => {
            if (settingsPanel) {
                settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
            }
        });

        // 复制按钮
        btnCopy?.addEventListener('click', () => {
            const outputHtml = document.getElementById('output-html');
            const htmlContent = outputHtml?.innerHTML;
            
            if (!htmlContent || outputHtml.querySelector('.empty-state')) {
                alert('请先生成排版内容！');
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
                setTimeout(() => btnCopy.innerHTML = originalText, 2000);
            }).catch(err => {
                console.error('Copy failed:', err);
                alert('复制失败，请重试');
            });
        });

        // 滑块事件
        ['h1', 'h2', 'h3'].forEach(level => {
            const slider = document.getElementById(`${level}-size`);
            const display = document.getElementById(`${level}-val`);
            
            slider?.addEventListener('input', (e) => {
                if (display) display.textContent = e.target.value;
            });
        });

        // 三横线样式选择
        document.querySelectorAll('.hr-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.hr-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // 保存设置
        btnSaveSettings?.addEventListener('click', () => {
            this.settings = {
                h1Size: parseInt(document.getElementById('h1-size')?.value || 20),
                h2Size: parseInt(document.getElementById('h2-size')?.value || 17),
                h3Size: parseInt(document.getElementById('h3-size')?.value || 15),
                hrStyle: document.querySelector('.hr-btn.active')?.dataset.hr || 'stars',
                boldColor: document.getElementById('bold-green')?.checked ? '#07c160' : null,
                highlightQuotes: document.getElementById('quote-highlight')?.checked || false,
                autoHrBeforeH1: document.getElementById('auto-hr-h1')?.checked || false,
                autoHrBeforeH2: document.getElementById('auto-hr-h2')?.checked || false,
                autoHrBeforeH3: false,
                themeColor: '#07c160'
            };
            
            SettingsManager.set(this.settings);
            MarkdownProcessor.init(this.settings);
            
            if (settingsPanel) {
                settingsPanel.style.display = 'none';
            }
            
            // 重新排版
            doFormat();
        });
    },

    renderSettings() {
        const s = this.settings;
        
        // 滑块
        const h1Slider = document.getElementById('h1-size');
        const h1Val = document.getElementById('h1-val');
        if (h1Slider) h1Slider.value = s.h1Size;
        if (h1Val) h1Val.textContent = s.h1Size;

        const h2Slider = document.getElementById('h2-size');
        const h2Val = document.getElementById('h2-val');
        if (h2Slider) h2Slider.value = s.h2Size;
        if (h2Val) h2Val.textContent = s.h2Size;

        const h3Slider = document.getElementById('h3-size');
        const h3Val = document.getElementById('h3-val');
        if (h3Slider) h3Slider.value = s.h3Size;
        if (h3Val) h3Val.textContent = s.h3Size;

        // 三横线样式
        document.querySelectorAll('.hr-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.hr === s.hrStyle);
        });

        // 开关
        const boldGreen = document.getElementById('bold-green');
        if (boldGreen) boldGreen.checked = !!s.boldColor;

        const quoteHighlight = document.getElementById('quote-highlight');
        if (quoteHighlight) quoteHighlight.checked = s.highlightQuotes;

        const autoHrH1 = document.getElementById('auto-hr-h1');
        if (autoHrH1) autoHrH1.checked = s.autoHrBeforeH1;

        const autoHrH2 = document.getElementById('auto-hr-h2');
        if (autoHrH2) autoHrH2.checked = s.autoHrBeforeH2;
    }
};

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 检查 marked 是否加载
    if (typeof marked === 'undefined') {
        console.error('Marked library not loaded!');
        document.getElementById('output-html').innerHTML = '<div class="empty-state" style="color: red;">错误：Marked 库未加载</div>';
        return;
    }
    
    UIController.init();
});
