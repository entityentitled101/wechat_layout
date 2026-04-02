import { marked } from 'https://cdn.jsdelivr.net/npm/marked@9.1.6/lib/marked.esm.js';

// ============================================
// 设置管理器 - 管理所有用户配置
// ============================================
const SettingsManager = {
    // 默认配置
    defaults: {
        // 标题字号
        h1Size: 20,        // 一级标题默认 20px（比二级大 3px）
        h2Size: 17,        // 二级标题默认 17px
        h3Size: 15,        // 三级标题默认 15px（和正文一样）
        
        // 三横线样式: 'stars'(✦✦✦), 'line'(───), 'dots'(···), 'wave'(〜〜〜), 'none'(无)
        hrStyle: 'stars',
        
        // 文字样式
        boldColor: '#07c160',      // 加粗文字颜色，null 表示不变色
        highlightQuotes: true,      // 书名号高亮
        bracketStyle: 'none',       // 括号样式: 'none', 'subtle', 'highlight'
        
        // 颜色主题
        themeColor: '#07c160',      // 主题色
        
        // 自动插入三横线
        autoHrBeforeH1: true,       // 一级标题前自动加三横线
        autoHrBeforeH2: true,       // 二级标题前自动加三横线
        autoHrBeforeH3: false,      // 三级标题前不加三横线
    },
    
    // 获取当前设置
    get() {
        const saved = localStorage.getItem('wechat_typeset_settings');
        if (saved) {
            try {
                return { ...this.defaults, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Settings parse error:', e);
            }
        }
        return { ...this.defaults };
    },
    
    // 保存设置
    set(settings) {
        localStorage.setItem('wechat_typeset_settings', JSON.stringify(settings));
    },
    
    // 重置为默认
    reset() {
        localStorage.removeItem('wechat_typeset_settings');
        return { ...this.defaults };
    }
};

// ============================================
// 样式生成器 - 根据配置生成样式
// ============================================
const StyleGenerator = {
    // 获取常见字体
    getCommonFont() {
        return '-apple-system-font,BlinkMacSystemFont,"Helvetica Neue","PingFang SC","Hiragino Sans GB","Microsoft YaHei UI","Microsoft YaHei",Arial,sans-serif;';
    },
    
    // 生成容器样式
    getContainerStyle(settings) {
        return `font-family: ${this.getCommonFont()} font-size: 15px; color: #3f3f3f; line-height: 1.75; letter-spacing: 0.5px; padding: 10px 15px;`;
    },
    
    // 生成标题样式
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
    
    // 生成段落样式
    getParagraphStyle(settings) {
        return `margin-bottom: 1.6em; line-height: 1.8; font-size: 15px; color: #3f3f3f;`;
    },
    
    // 生成三横线样式
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
    
    // 生成加粗样式
    getBoldStyle(settings) {
        if (settings?.boldColor) {
            return `color: ${settings.boldColor}; font-weight: bold;`;
        }
        return 'font-weight: bold;';
    },
    
    // 框样式集合
    getBoxStyles(settings) {
        const themeColor = settings?.themeColor || '#07c160';
        const lightColor = '#f8fcf9';
        
        return {
            quote: {
                name: '引言框',
                icon: '💬',
                style: `background-color: ${lightColor}; border-left: 5px solid ${themeColor}; padding: 20px 18px; border-radius: 0 10px 10px 0; margin: 25px 0; display: block;`
            },
            tip: {
                name: '提示框',
                icon: '💡',
                style: `background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); border: 1px solid ${themeColor}; border-radius: 12px; padding: 20px; margin: 25px 0; position: relative; overflow: hidden;`
            },
            info: {
                name: '信息框',
                icon: 'ℹ️',
                style: `background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%); border: 1px solid #3ea6ff; border-radius: 12px; padding: 20px; margin: 25px 0;`
            },
            warning: {
                name: '警告框',
                icon: '⚠️',
                style: `background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%); border-left: 4px solid #f59e0b; border-radius: 0 12px 12px 0; padding: 20px; margin: 25px 0;`
            },
            keypoint: {
                name: '重点框',
                icon: '🎯',
                style: `background: #fafafa; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; position: relative;`
            },
            elegant: {
                name: '优雅框',
                icon: '✨',
                style: `background: white; border: 1px solid ${themeColor}; box-shadow: 0 4px 12px rgba(7, 193, 96, 0.1); border-radius: 16px; padding: 24px; margin: 25px 0;`
            },
            minimal: {
                name: '简约框',
                icon: '▪️',
                style: `border-bottom: 3px solid ${themeColor}; padding: 16px 0; margin: 25px 0;`
            },
            card: {
                name: '卡片框',
                icon: '📋',
                style: `background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 20px; margin: 25px 0; border: 1px solid #f0f0f0;`
            }
        };
    }
};

// ============================================
// Markdown 处理器
// ============================================
const MarkdownProcessor = {
    settings: null,
    
    // 初始化
    init(settings) {
        this.settings = settings;
    },
    
    // 检查是否是 Markdown 特殊行
    isMarkdownSpecial(line) {
        const t = line.trim();
        return t.startsWith('#') || t.startsWith('-') || t.startsWith('*') ||
            t.startsWith('>') || t.startsWith('|') || /^\d+\.\s/.test(t);
    },
    
    // 检查是否是特殊区块
    isSpecialSection(line) {
        const t = line.trim().toLowerCase();
        const keywords = ['参考资料', '互动话题', '今日话题', 'sources', '推荐阅读', '小贴士', '参考书目', '总结', '结语'];
        return keywords.some(k => t.includes(k)) && t.length < 60;
    },
    
    // 预处理器 - 处理空行和三横线
    preprocess(content) {
        let lines = content.replace(/\p{Extended_Pictographic}/gu, '').split('\n');
        const result = [];
        let prevWasContent = false;  // 记录前一行是否是正文内容
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let trimmed = line.trim();
            
            if (!trimmed) {
                result.push('');
                continue;
            }
            
            // 处理三横线
            if (trimmed === '---' || trimmed === '***') {
                result.push('---');
                prevWasContent = false;
                continue;
            }
            
            // 检查是否需要自动插入三横线
            const isH1 = trimmed.startsWith('# ') && !trimmed.startsWith('## ');
            const isH2 = trimmed.startsWith('## ') && !trimmed.startsWith('### ');
            const isH3 = trimmed.startsWith('### ') && !trimmed.startsWith('#### ');
            
            // 在标题前根据设置和前文内容决定是否插入三横线
            if ((isH1 && this.settings?.autoHrBeforeH1) || 
                (isH2 && this.settings?.autoHrBeforeH2)) {
                // 如果前一行是正文内容，且结果最后一个不是三横线，则插入
                if (prevWasContent && result.length > 0 && result[result.length - 1] !== '---') {
                    // 检查结果中是否已经有足够的空行
                    let hasEmptyLine = false;
                    for (let j = result.length - 1; j >= 0 && j >= result.length - 3; j--) {
                        if (result[j] === '') {
                            hasEmptyLine = true;
                            break;
                        }
                        if (result[j] === '---') break;
                    }
                    if (!hasEmptyLine) {
                        result.push('---');
                    }
                }
            }
            
            result.push(line);
            
            // 更新前一行状态
            if (!this.isMarkdownSpecial(line) && !this.isSpecialSection(trimmed)) {
                prevWasContent = true;
            } else if (isH1 || isH2 || isH3 || trimmed === '---') {
                prevWasContent = false;
            }
        }
        
        return result.join('\n');
    },
    
    // 处理行内样式
    parseInline(text) {
        // 加粗 **text**
        const boldStyle = StyleGenerator.getBoldStyle(this.settings);
        text = text.replace(/\*\*(.*?)\*\*/g, `<strong style="${boldStyle}">$1</strong>`);
        
        // 斜体 *text*（如果不用作加粗）
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // 行内代码 `code`
        text = text.replace(/`([^`]+)`/g, '<code style="background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #e83e8c;">$1</code>');
        
        // 删除线 ~~text~~
        text = text.replace(/~~(.*?)~~/g, '<del style="opacity: 0.6;">$1</del>');
        
        // 书名号高亮
        if (this.settings?.highlightQuotes) {
            const themeColor = this.settings?.themeColor || '#07c160';
            text = text.replace(/《([^》]+)》/g, `<span style="color: ${themeColor}; font-weight: 500;">《$1》</span>`);
        }
        
        // 括号样式
        if (this.settings?.bracketStyle === 'subtle') {
            text = text.replace(/（([^）]+)）/g, '<span style="opacity: 0.8;">（$1）</span>');
            text = text.replace(/\(([^)]+)\)/g, '<span style="opacity: 0.8;">($1)</span>');
        } else if (this.settings?.bracketStyle === 'highlight') {
            const themeColor = this.settings?.themeColor || '#07c160';
            text = text.replace(/（([^）]+)）/g, `<span style="color: ${themeColor};">（$1）</span>`);
        }
        
        return text;
    },
    
    // 主转换函数
    transform(md) {
        if (!md) return '';
        
        // 预处理
        const processed = this.preprocess(md);
        
        // 创建 marked 渲染器
        const renderer = new marked.Renderer();
        const settings = this.settings;
        
        // 标题渲染
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
            // h4+
            return `<h4 style="font-size: 15px; font-weight: bold; margin: 20px 0 10px; color: #333;">${parsedText}</h4>`;
        };
        
        // 引用渲染
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
        
        // 表格渲染
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
        
        // 段落渲染
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
            return `<p style="${StyleGenerator.getParagraphStyle(settings)}">${parsedText}</p>`;
        };
        
        // 分割线渲染
        renderer.hr = () => {
            const hrStyle = StyleGenerator.getHrStyle(settings);
            return `<section style="${hrStyle.container}">${hrStyle.content}</section>`;
        };
        
        // 列表渲染
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
        
        // 链接渲染
        renderer.link = (href, title, text) => {
            return `<a href="${href}" style="color: #576b95; text-decoration: underline;" target="_blank">${text}</a>`;
        };
        
        // 代码块渲染
        renderer.code = (code, language) => {
            return `<pre style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; overflow-x: auto; margin: 20px 0;"><code style="font-family: 'Fira Code', Consolas, monospace; font-size: 13px; line-height: 1.6; color: #333;">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
        };
        
        // 图片渲染
        renderer.image = (href, title, text) => {
            return `<img src="${href}" alt="${text}" style="max-width: 100%; height: auto; display: block; margin: 20px auto; border-radius: 8px;" />`;
        };
        
        const html = marked.parse(processed, { renderer });
        return `<section style="${StyleGenerator.getContainerStyle(settings)}">${html}</section>`;
    }
};

// ============================================
// UI 控制器
// ============================================
const UIController = {
    settings: null,
    
    // 初始化
    init() {
        this.settings = SettingsManager.get();
        MarkdownProcessor.init(this.settings);
        this.bindEvents();
        this.renderSettingsPanel();
        this.updatePreview();
    },
    
    // 绑定事件
    bindEvents() {
        const btnFormat = document.getElementById('btn-format');
        const btnCopy = document.getElementById('btn-copy');
        const btnMenu = document.getElementById('btn-menu');
        const btnPlay = document.getElementById('btn-play');
        const inputMd = document.getElementById('input-md');
        const settingsPanel = document.getElementById('settings-panel');
        const btnCloseSettings = document.getElementById('btn-close-settings');
        
        // 播放按钮 - 直接排版
        btnPlay?.addEventListener('click', () => this.executeFormat());
        
        // 菜单按钮 - 打开设置面板
        btnMenu?.addEventListener('click', () => {
            settingsPanel?.classList.add('active');
        });
        
        // 关闭设置面板
        const closeSettings = () => {
            settingsPanel?.classList.remove('active');
            document.getElementById('settings-overlay')?.classList.remove('active');
        };
        
        btnCloseSettings?.addEventListener('click', closeSettings);
        
        // 点击遮罩层关闭
        document.getElementById('settings-overlay')?.addEventListener('click', closeSettings);
        
        // 菜单按钮 - 打开设置面板
        btnMenu?.addEventListener('click', () => {
            settingsPanel?.classList.add('active');
            document.getElementById('settings-overlay')?.classList.add('active');
        });
        
        // 格式化按钮（文本部分）
        btnFormat?.addEventListener('click', () => this.executeFormat());
        
        // 复制按钮
        btnCopy?.addEventListener('click', () => this.copyHtml());
        
        // 输入框变化时实时预览
        let timeout;
        inputMd?.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => this.updatePreview(), 500);
        });
        
        // 绑定设置面板控件事件
        this.bindSettingsEvents();
    },
    
    // 绑定设置面板事件
    bindSettingsEvents() {
        // 标题字号滑块
        ['h1-size', 'h2-size', 'h3-size'].forEach(id => {
            const slider = document.getElementById(id);
            const display = document.getElementById(`${id}-value`);
            
            slider?.addEventListener('input', (e) => {
                const value = e.target.value;
                if (display) display.textContent = `${value}px`;
                
                // 更新设置
                const key = id.replace('-size', 'Size').replace('h1', 'h1').replace('h2', 'h2').replace('h3', 'h3');
                this.settings[key] = parseInt(value);
                SettingsManager.set(this.settings);
                MarkdownProcessor.init(this.settings);
                this.updatePreview();
            });
        });
        
        // 三横线样式选择
        document.querySelectorAll('[data-hr-style]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const style = e.currentTarget.dataset.hrStyle;
                this.settings.hrStyle = style;
                SettingsManager.set(this.settings);
                MarkdownProcessor.init(this.settings);
                
                // 更新选中状态
                document.querySelectorAll('[data-hr-style]').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                this.updatePreview();
            });
        });
        
        // 加粗颜色开关
        const boldColorToggle = document.getElementById('bold-color-toggle');
        boldColorToggle?.addEventListener('change', (e) => {
            this.settings.boldColor = e.target.checked ? (this.settings.themeColor || '#07c160') : null;
            SettingsManager.set(this.settings);
            MarkdownProcessor.init(this.settings);
            this.updatePreview();
        });
        
        // 书名号高亮开关
        const quoteHighlightToggle = document.getElementById('quote-highlight-toggle');
        quoteHighlightToggle?.addEventListener('change', (e) => {
            this.settings.highlightQuotes = e.target.checked;
            SettingsManager.set(this.settings);
            MarkdownProcessor.init(this.settings);
            this.updatePreview();
        });
        
        // 自动三横线开关
        ['auto-hr-h1', 'auto-hr-h2', 'auto-hr-h3'].forEach(id => {
            const toggle = document.getElementById(id);
            toggle?.addEventListener('change', (e) => {
                const key = id.replace('auto-hr-', 'autoHrBefore').replace('h1', 'H1').replace('h2', 'H2').replace('h3', 'H3');
                this.settings[key] = e.target.checked;
                SettingsManager.set(this.settings);
                MarkdownProcessor.init(this.settings);
                this.updatePreview();
            });
        });
        
        // 框样式按钮
        document.querySelectorAll('[data-box-style]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const style = e.currentTarget.dataset.boxStyle;
                this.applyBoxStyleToSelection(style);
            });
        });
        
        // 重置按钮
        const btnReset = document.getElementById('btn-reset-settings');
        btnReset?.addEventListener('click', () => {
            this.settings = SettingsManager.reset();
            MarkdownProcessor.init(this.settings);
            this.renderSettingsPanel();
            this.updatePreview();
        });
    },
    
    // 渲染设置面板（根据当前设置更新 UI）
    renderSettingsPanel() {
        // 更新滑块
        const h1Slider = document.getElementById('h1-size');
        const h1Value = document.getElementById('h1-size-value');
        if (h1Slider) h1Slider.value = this.settings.h1Size;
        if (h1Value) h1Value.textContent = `${this.settings.h1Size}px`;
        
        const h2Slider = document.getElementById('h2-size');
        const h2Value = document.getElementById('h2-size-value');
        if (h2Slider) h2Slider.value = this.settings.h2Size;
        if (h2Value) h2Value.textContent = `${this.settings.h2Size}px`;
        
        const h3Slider = document.getElementById('h3-size');
        const h3Value = document.getElementById('h3-size-value');
        if (h3Slider) h3Slider.value = this.settings.h3Size;
        if (h3Value) h3Value.textContent = `${this.settings.h3Size}px`;
        
        // 更新三横线样式选中状态
        document.querySelectorAll('[data-hr-style]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.hrStyle === this.settings.hrStyle);
        });
        
        // 更新开关状态
        const boldColorToggle = document.getElementById('bold-color-toggle');
        if (boldColorToggle) boldColorToggle.checked = !!this.settings.boldColor;
        
        const quoteHighlightToggle = document.getElementById('quote-highlight-toggle');
        if (quoteHighlightToggle) quoteHighlightToggle.checked = this.settings.highlightQuotes;
        
        const autoHrH1 = document.getElementById('auto-hr-h1');
        if (autoHrH1) autoHrH1.checked = this.settings.autoHrBeforeH1;
        
        const autoHrH2 = document.getElementById('auto-hr-h2');
        if (autoHrH2) autoHrH2.checked = this.settings.autoHrBeforeH2;
        
        const autoHrH3 = document.getElementById('auto-hr-h3');
        if (autoHrH3) autoHrH3.checked = this.settings.autoHrBeforeH3;
    },
    
    // 执行排版
    executeFormat() {
        const inputMd = document.getElementById('input-md');
        const outputHtml = document.getElementById('output-html');
        const btnPlay = document.getElementById('btn-play');
        
        const md = inputMd?.value?.trim();
        if (!md) {
            outputHtml.innerHTML = '<div class="empty-state">请输入 Markdown 内容</div>';
            return;
        }
        
        // 按钮动画
        if (btnPlay) {
            btnPlay.innerHTML = '✨';
            setTimeout(() => {
                btnPlay.innerHTML = '▶';
            }, 600);
        }
        
        const html = MarkdownProcessor.transform(md);
        outputHtml.innerHTML = html;
    },
    
    // 更新预览
    updatePreview() {
        const inputMd = document.getElementById('input-md');
        const outputHtml = document.getElementById('output-html');
        
        const md = inputMd?.value?.trim();
        if (!md) {
            outputHtml.innerHTML = '<div class="empty-state">排版效果将在这里实时展示</div>';
            return;
        }
        
        const html = MarkdownProcessor.transform(md);
        outputHtml.innerHTML = html;
    },
    
    // 复制 HTML
    copyHtml() {
        const outputHtml = document.getElementById('output-html');
        const btnCopy = document.getElementById('btn-copy');
        
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
            btnCopy.innerHTML = '<span>✅</span> 已复制';
            setTimeout(() => btnCopy.innerHTML = originalText, 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('复制失败，请重试');
        });
    },
    
    // 应用框样式到选中文本
    applyBoxStyleToSelection(styleName) {
        const inputMd = document.getElementById('input-md');
        const start = inputMd.selectionStart;
        const end = inputMd.selectionEnd;
        
        if (start === end) {
            alert('请先选中要应用样式的文字');
            return;
        }
        
        const text = inputMd.value.substring(start, end);
        const boxStyles = StyleGenerator.getBoxStyles(this.settings);
        const style = boxStyles[styleName];
        
        if (!style) return;
        
        // 根据框类型生成不同的 Markdown 标记
        let wrappedText;
        switch(styleName) {
            case 'quote':
                wrappedText = `\n> ${text.replace(/\n/g, '\n> ')}\n`;
                break;
            default:
                // 其他框样式用特殊标记（在 HTML 渲染时处理）
                wrappedText = `<!-- BOX:${styleName} -->\n${text}\n<!-- /BOX -->`;
        }
        
        const newValue = inputMd.value.substring(0, start) + wrappedText + inputMd.value.substring(end);
        inputMd.value = newValue;
        inputMd.focus();
        inputMd.setSelectionRange(start + wrappedText.length, start + wrappedText.length);
        
        this.updatePreview();
    }
};

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    UIController.init();
});
