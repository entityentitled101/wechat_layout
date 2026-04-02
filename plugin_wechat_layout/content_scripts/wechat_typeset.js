/**
 * 微信公众号编辑器 - 魔法一键排版助手 (V2.6 精细排版版)
 * 支持：紧凑行间距、单独加粗、单独分割线、图片解释文字
 */

(function () {
    console.log("微信排版助手 V2.6 - 精细排版已加载");

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
        themeColor: '#07c160',
        // 行间距设置
        paragraphSpacing: 'normal', // 'compact'(紧凑), 'normal'(标准), 'loose'(宽松)
        boxIcons: {
            quote: '💬',
            tip: '💡',
            info: 'ℹ️',
            warning: '⚠️',
            keypoint: '🎯',
            elegant: '✨',
            minimal: '▪️',
            card: '📋',
            caption: '🖼️'  // 图片解释
        }
    };

    // 可选图标列表
    const AVAILABLE_ICONS = [
        '💬', '💡', 'ℹ️', '⚠️', '🎯', '✨', '▪️', '📋', '🖼️',
        '🔔', '📌', '⭐', '🔥', '💎', '🎨', '📖', '📝',
        '🔍', '🚀', '🎉', '✅', '❌', '⚡', '🔑',
        '🎁', '📢', '💭', '👆', '👇', '👈', '👉',
        '🌟', '🌈', '🎵', '🎬', '📷', '🎮', '🏆', '📊',
        '🔢', '📅', '📎', '🔗', '⏰', '📍', '🏷️', '✂️',
        '🎓', '💼', '📚', '🔖', '📜', '🗂️', '📇', '🗒️'
    ];

    // Alt+数字 到功能的映射
    const ALT_KEY_MAP = {
        '1': 'quote',
        '2': 'tip',
        '3': 'info',
        '4': 'warning',
        '5': 'keypoint',
        '6': 'elegant',
        '7': 'minimal',
        '8': 'card',
        '9': 'caption',  // 图片解释
        '0': 'bold'      // 单独加粗
    };

    // ============================================
    // 框样式定义
    // ============================================
    const BOX_STYLES = {
        quote: {
            name: '引言框',
            shortcut: '1',
            render: (content, color, icon) => `
                <div style="background-color: #f8fcf9; border-left: 5px solid ${color}; padding: 16px 14px; border-radius: 0 8px 8px 0; margin: 16px 0; display: block;">
                    <strong style="color: ${color}; font-size: 15px; display: block; margin-bottom: 8px;">${icon} 引言</strong>
                    <span style="font-size: 15px; color: #333; line-height: 1.7;">${content}</span>
                </div>
            `
        },
        tip: {
            name: '提示框',
            shortcut: '2',
            render: (content, color, icon) => `
                <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); border: 1px solid ${color}; border-radius: 10px; padding: 16px; margin: 16px 0;">
                    <strong style="color: ${color}; font-size: 14px; display: block; margin-bottom: 6px;">${icon} 提示</strong>
                    <span style="font-size: 15px; color: #333; line-height: 1.7;">${content}</span>
                </div>
            `
        },
        info: {
            name: '信息框',
            shortcut: '3',
            render: (content, color, icon) => `
                <div style="background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%); border: 1px solid #3ea6ff; border-radius: 10px; padding: 16px; margin: 16px 0;">
                    <strong style="color: #3ea6ff; font-size: 14px; display: block; margin-bottom: 6px;">${icon} 信息</strong>
                    <span style="font-size: 15px; color: #333; line-height: 1.7;">${content}</span>
                </div>
            `
        },
        warning: {
            name: '警告框',
            shortcut: '4',
            render: (content, color, icon) => `
                <div style="background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%); border-left: 4px solid #f59e0b; border-radius: 0 10px 10px 0; padding: 16px; margin: 16px 0;">
                    <strong style="color: #f59e0b; font-size: 14px; display: block; margin-bottom: 6px;">${icon} 注意</strong>
                    <span style="font-size: 15px; color: #333; line-height: 1.7;">${content}</span>
                </div>
            `
        },
        keypoint: {
            name: '重点框',
            shortcut: '5',
            render: (content, color, icon) => `
                <div style="background: #fafafa; border: 2px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <strong style="color: ${color}; font-size: 14px; display: block; margin-bottom: 6px;">${icon} 重点</strong>
                    <span style="font-size: 15px; color: #333; line-height: 1.7;">${content}</span>
                </div>
            `
        },
        elegant: {
            name: '优雅框',
            shortcut: '6',
            render: (content, color, icon) => `
                <div style="background: white; border: 1px solid ${color}; box-shadow: 0 4px 12px rgba(7, 193, 96, 0.1); border-radius: 14px; padding: 20px; margin: 16px 0;">
                    <div style="text-align: center; margin-bottom: 10px; font-size: 22px;">${icon}</div>
                    <span style="font-size: 15px; color: #333; line-height: 1.7;">${content}</span>
                </div>
            `
        },
        minimal: {
            name: '简约框',
            shortcut: '7',
            render: (content, color, icon) => `
                <div style="border-bottom: 3px solid ${color}; padding: 14px 0; margin: 16px 0;">
                    <span style="font-size: 16px; margin-right: 8px;">${icon}</span>
                    <span style="font-size: 15px; color: #333; line-height: 1.7;">${content}</span>
                </div>
            `
        },
        card: {
            name: '卡片框',
            shortcut: '8',
            render: (content, color, icon) => `
                <div style="background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 16px; margin: 16px 0; border: 1px solid #f0f0f0;">
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 18px; margin-right: 8px;">${icon}</span>
                        <span style="color: ${color}; font-weight: 600; font-size: 13px;">卡片</span>
                    </div>
                    <span style="font-size: 15px; color: #333; line-height: 1.7;">${content}</span>
                </div>
            `
        },
        caption: {
            name: '图片解释',
            shortcut: '9',
            render: (content, color, icon) => `
                <div style="text-align: center; margin: 12px 0;">
                    <span style="font-size: 13px; color: ${color}; font-style: italic; line-height: 1.6;">${icon} ${content}</span>
                </div>
            `
        }
    };

    // ============================================
    // 工具函数
    // ============================================
    const Utils = {
        getSettings() {
            try {
                const saved = localStorage.getItem('wechat_typeset_settings');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (!parsed.boxIcons) parsed.boxIcons = { ...DEFAULT_SETTINGS.boxIcons };
                    if (!parsed.paragraphSpacing) parsed.paragraphSpacing = 'normal';
                    return { ...DEFAULT_SETTINGS, ...parsed };
                }
            } catch (e) {
                console.error('Settings load error:', e);
            }
            return { ...DEFAULT_SETTINGS };
        },

        saveSettings(settings) {
            localStorage.setItem('wechat_typeset_settings', JSON.stringify(settings));
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
        }
    };

    // ============================================
    // 样式生成器
    // ============================================
    const StyleGenerator = {
        getCommonFont() {
            return "-apple-system-font,BlinkMacSystemFont,'Helvetica Neue','PingFang SC','Hiragino Sans GB','Microsoft YaHei UI','Microsoft YaHei',Arial,sans-serif;";
        },

        getH1Style(settings) {
            const size = settings?.h1Size || 20;
            return `font-size: ${size}px; font-weight: bold; margin: 22px 0 12px; text-align: center; color: #222; display: block; line-height: 1.4;`;
        },

        getH2Style(settings) {
            const size = settings?.h2Size || 17;
            const color = settings?.themeColor || '#07c160';
            return `font-size: ${size}px; font-weight: bold; margin: 20px 0 12px; border-left: 5px solid ${color}; padding-left: 12px; color: #222; display: block; line-height: 1.3;`;
        },

        getH3Style(settings) {
            const size = settings?.h3Size || 15;
            const color = settings?.themeColor || '#07c160';
            return `font-size: ${size}px; font-weight: bold; margin: 16px 0 10px; color: ${color}; display: block; line-height: 1.3;`;
        },

        getParagraphStyle(spacing = 'normal') {
            // 根据间距设置调整
            const margins = {
                compact: 'margin-bottom: 12px;',
                normal: 'margin-bottom: 16px;',
                loose: 'margin-bottom: 25px;'
            };
            return `${margins[spacing] || margins.normal} line-height: 1.75; font-size: 15px; color: #3f3f3f; display: block;`;
        },

        getHrHTML(settings) {
            const style = settings?.hrStyle || 'stars';
            const color = settings?.themeColor || '#07c160';
            
            const styles = {
                stars: `<div style="text-align: center; margin: 24px 0; height: 1px; background: #e1e8ed; position: relative;"><span style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: white; padding: 0 15px; color: ${color}; letter-spacing: 4px; font-size: 14px;">✦ ✦ ✦</span></div>`,
                line: `<div style="text-align: center; margin: 24px 0;"><div style="height: 1px; background: linear-gradient(to right, transparent, ${color}, transparent); width: 60%; margin: 0 auto;"></div></div>`,
                dots: `<div style="text-align: center; margin: 24px 0; color: ${color}; letter-spacing: 8px; font-size: 20px; opacity: 0.6;">···</div>`,
                wave: `<div style="text-align: center; margin: 24px 0; color: ${color}; letter-spacing: 4px; font-size: 18px; opacity: 0.7;">〜 〜 〜</div>`,
                none: ''
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
    // 内容处理器
    // ============================================
    const ContentProcessor = {
        settings: null,

        init(settings) {
            this.settings = settings;
        },

        preprocess(md) {
            let content = md.replace(/\p{Extended_Pictographic}/gu, '');
            let lines = content.split('\n');
            const result = [];
            let prevWasContent = false;
            let emptyCount = 0;

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                let trimmed = line.trim();

                if (!trimmed) {
                    emptyCount++;
                    continue;
                }

                // 最多保留一个空行
                if (emptyCount > 0 && result.length > 0) {
                    result.push('');
                }
                emptyCount = 0;

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
                    if (prevWasContent && result.length > 0) {
                        let lastNonEmpty = result.length - 1;
                        while (lastNonEmpty >= 0 && result[lastNonEmpty] === '') {
                            lastNonEmpty--;
                        }
                        if (lastNonEmpty >= 0 && result[lastNonEmpty] !== '---') {
                            result.push('---');
                        }
                    }
                }

                result.push(line);

                if (!Utils.isMarkdownSpecial(line) && !Utils.isSpecialSection(trimmed)) {
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

        parse(md) {
            if (!md) return '';

            const processed = this.preprocess(md);
            const settings = this.settings;
            const spacing = settings?.paragraphSpacing || 'normal';
            const result = [];
            let inList = false;
            let listItems = [];
            let inCodeBlock = false;
            let codeBlockContent = [];

            const flushList = () => {
                if (inList && listItems.length > 0) {
                    const listMargin = spacing === 'compact' ? '12px' : (spacing === 'loose' ? '25px' : '16px');
                    result.push(`<ul style="margin-bottom: ${listMargin}; padding-left: 20px; font-size: 15px; color: #3f3f3f; line-height: 1.75;">${listItems.join('')}</ul>`);
                    listItems = [];
                    inList = false;
                }
            };

            const flushCodeBlock = () => {
                if (inCodeBlock && codeBlockContent.length > 0) {
                    const code = codeBlockContent.join('\n').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    const codeMargin = spacing === 'compact' ? '12px' : (spacing === 'loose' ? '25px' : '20px');
                    result.push(`<pre style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; overflow-x: auto; margin: ${codeMargin} 0;"><code style="font-family: 'Fira Code', Consolas, monospace; font-size: 13px; line-height: 1.6; color: #333;">${code}</code></pre>`);
                    codeBlockContent = [];
                    inCodeBlock = false;
                }
            };

            let lines = processed.split('\n');

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                let t = line.trim();

                if (t.startsWith('```')) {
                    if (!inCodeBlock) {
                        flushList();
                        inCodeBlock = true;
                    } else {
                        flushCodeBlock();
                    }
                    continue;
                }

                if (inCodeBlock) {
                    codeBlockContent.push(line);
                    continue;
                }

                if (!t) {
                    flushList();
                    continue;
                }

                if (t.startsWith('- ') || t.startsWith('* ')) {
                    inList = true;
                    listItems.push(`<li style="margin-bottom: 8px;">${this.parseInline(t.substring(2))}</li>`);
                    continue;
                }

                if (/^\d+\.\s/.test(t)) {
                    flushList();
                    const content = t.replace(/^\d+\.\s*/, '');
                    const listMargin = spacing === 'compact' ? '12px' : (spacing === 'loose' ? '25px' : '16px');
                    result.push(`<ol style="margin-bottom: ${listMargin}; padding-left: 25px; font-size: 15px; color: #3f3f3f; line-height: 1.75; list-style-type: decimal;"><li style="margin-bottom: 8px;">${this.parseInline(content)}</li></ol>`);
                    continue;
                }

                flushList();

                if (t === '---' || t === '***') {
                    result.push(StyleGenerator.getHrHTML(settings));
                    continue;
                }

                if (Utils.isSpecialSection(t)) {
                    const isReference = /参考资料|sources|参考书目/i.test(t);
                    if (isReference) {
                        const inner = t.replace(/^.*?(参考资料|Sources|参考书目)[:：]?\s*/i, '');
                        result.push(`<section style="font-size: 12px; color: #888; background: #fafafa; padding: 12px; border-radius: 8px; margin: 16px 0; border: 1px solid #f0f0f0; display: block;"><strong style="color: #666; display: block; margin-bottom: 8px; font-size: 13px;">📚 推荐阅读 / 参考资料</strong><div style="line-height: 1.7;">${this.parseInline(inner)}</div></section>`);
                    } else {
                        result.push(`<section style="margin: 20px 0; padding: 16px 20px; background-color: #f0f9ff; border: 1px dashed #3ea6ff; border-radius: 10px; display: block;"><p style="font-size: 14px; font-weight: bold; color: #1e40af; margin: 0; line-height: 1.6; text-align: center;">${this.parseInline(t)}</p></section>`);
                    }
                    continue;
                }

                if (t.startsWith('# ')) {
                    result.push(`<h1 style="${StyleGenerator.getH1Style(settings)}">${this.parseInline(t.slice(2))}</h1>`);
                    continue;
                }
                if (t.startsWith('## ')) {
                    result.push(`<h2 style="${StyleGenerator.getH2Style(settings)}">${this.parseInline(t.slice(3))}</h2>`);
                    continue;
                }
                if (t.startsWith('### ')) {
                    result.push(`<h3 style="${StyleGenerator.getH3Style(settings)}">${this.parseInline(t.slice(4))}</h3>`);
                    continue;
                }

                if (t.startsWith('> ') || t.startsWith('＞ ')) {
                    const quoteText = t.replace(/^[>＞]\s*/, '');
                    const themeColor = settings?.themeColor || '#07c160';
                    const icon = settings?.boxIcons?.quote || '💬';
                    result.push(BOX_STYLES.quote.render(this.parseInline(quoteText), themeColor, icon));
                    continue;
                }

                result.push(`<p style="${StyleGenerator.getParagraphStyle(spacing)}">${this.parseInline(line)}</p>`);
            }

            flushList();
            flushCodeBlock();

            const commonFont = StyleGenerator.getCommonFont();
            return `<section style="font-family: ${commonFont} padding: 15px; background: white;">${result.join('')}</section>`;
        }
    };

    // ============================================
    // 框样式应用管理器
    // ============================================
    const BoxStyleManager = {
        // 应用框样式到当前选中的文字
        apply(boxType) {
            const settings = Utils.getSettings();
            const themeColor = settings?.themeColor || '#07c160';
            
            // 获取当前选中的文字
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();

            let html = '';

            if (boxType === 'hr') {
                // 分割线 - 不需要选中文字，直接在光标位置插入
                html = StyleGenerator.getHrHTML(settings);
                this.insertHTML(html, '分割线');
                return;
            } else if (!selectedText) {
                // 其他样式需要选中文字
                this.showToast('⚠️ 请先选中文字');
                return;
            }

            if (boxType === 'bold') {
                // 单独加粗 - 绿色
                const boldColor = settings?.boldColor || '#07c160';
                html = `<strong style="color: ${boldColor}; font-weight: bold;">${selectedText}</strong>`;
            } else {
                // 框样式
                const icon = settings?.boxIcons?.[boxType] || '💬';
                const boxRenderer = BOX_STYLES[boxType];
                if (!boxRenderer) {
                    this.showToast('❌ 未知样式');
                    return;
                }
                html = boxRenderer.render(selectedText, themeColor, icon);
            }
            
            this.insertHTML(html, boxType === 'bold' ? '加粗（绿色）' : BOX_STYLES[boxType]?.name);
        },

        insertHTML(html, successMsg) {
            const selection = window.getSelection();
            let inserted = false;
            
            try {
                document.execCommand('insertHTML', false, html);
                inserted = true;
            } catch (e) {}
            
            if (!inserted) {
                const iframe = document.querySelector("#ueditor_0");
                if (iframe) {
                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                        if (iframeDoc) {
                            iframeDoc.execCommand('insertHTML', false, html);
                            inserted = true;
                        }
                    } catch (e) {}
                }
            }
            
            if (!inserted && selection.rangeCount > 0) {
                try {
                    const range = selection.getRangeAt(0);
                    const fragment = document.createRange().createContextualFragment(html);
                    range.deleteContents();
                    range.insertNode(fragment);
                    inserted = true;
                } catch (e) {}
            }
            
            if (inserted) {
                this.showToast(`✅ 已应用「${successMsg}」`);
            } else {
                this.showToast('❌ 应用失败');
            }
        },

        showToast(message) {
            const toast = document.createElement('div');
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: #07c160;
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                font-size: 14px;
                z-index: 2147483647;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        }
    };

    // ============================================
    // 全局快捷键监听
    // ============================================
    document.addEventListener('keydown', (e) => {
        if (e.altKey && !e.ctrlKey && !e.metaKey) {
            const boxType = ALT_KEY_MAP[e.key];
            if (boxType) {
                e.preventDefault();
                BoxStyleManager.apply(boxType);
            }
        }
    }, true);

    // iframe 监听
    function setupIframeListener() {
        const iframe = document.querySelector("#ueditor_0");
        if (iframe) {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                    iframeDoc.addEventListener('keydown', (e) => {
                        if (e.altKey && !e.ctrlKey && !e.metaKey) {
                            const boxType = ALT_KEY_MAP[e.key];
                            if (boxType) {
                                e.preventDefault();
                                BoxStyleManager.apply(boxType);
                            }
                        }
                    }, true);
                }
            } catch (e) {}
        }
    }
    setInterval(setupIframeListener, 3000);

    // ============================================
    // 按钮管理
    // ============================================
    const ButtonManager = {
        btn: null,
        settingsPanel: null,
        iconPickerPanel: null,
        isEditingIcons: false,

        create() {
            if (document.getElementById('magic-typeset-container')) return;

            const container = document.createElement('div');
            container.id = 'magic-typeset-container';
            container.style.cssText = `
                position: fixed;
                right: 20px;
                top: 210px;
                z-index: 2147483647;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 8px;
            `;

            const btnGroup = document.createElement('div');
            btnGroup.style.cssText = `
                display: flex;
                align-items: center;
                background: linear-gradient(135deg, #07c160, #06ae56);
                border-radius: 50px;
                padding: 3px;
                box-shadow: 0 4px 15px rgba(7, 193, 96, 0.4);
            `;

            const textBtn = document.createElement('button');
            textBtn.innerHTML = '<span style="margin-right: 4px;">✨</span>魔法自动排版';
            textBtn.style.cssText = `
                background: transparent;
                color: white;
                border: none;
                padding: 8px 14px;
                border-radius: 50px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                white-space: nowrap;
            `;
            textBtn.onclick = () => this.executeLayout();

            const playBtn = document.createElement('button');
            playBtn.innerHTML = '▶';
            playBtn.style.cssText = `
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                font-size: 10px;
                cursor: pointer;
                margin-left: 2px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            playBtn.onclick = () => this.executeLayout();

            const menuBtn = document.createElement('button');
            menuBtn.innerHTML = '☰';
            menuBtn.style.cssText = `
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                font-size: 12px;
                cursor: pointer;
                margin-left: 2px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            menuBtn.onclick = () => this.toggleSettingsPanel();

            btnGroup.appendChild(textBtn);
            btnGroup.appendChild(playBtn);
            btnGroup.appendChild(menuBtn);
            container.appendChild(btnGroup);

            this.settingsPanel = this.createSettingsPanel();
            container.appendChild(this.settingsPanel);

            document.body.appendChild(container);
            this.btn = textBtn;
        },

        createSettingsPanel() {
            const panel = document.createElement('div');
            panel.id = 'wechat-settings-panel';
            const settings = Utils.getSettings();

            const renderBoxStyleButtons = () => {
                return Object.entries(BOX_STYLES).map(([key, style]) => {
                    const icon = settings.boxIcons?.[key] || '💬';
                    return `
                        <button class="box-style-btn" data-box="${key}" title="Alt+${style.shortcut}" style="
                            padding: 8px 4px;
                            border: 1px solid #e5e7eb;
                            border-radius: 6px;
                            background: white;
                            cursor: pointer;
                            font-size: 11px;
                            color: #374151;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 4px;
                        ">
                            <span class="box-icon" style="font-size: 18px;">${icon}</span>
                            <span>${style.name}</span>
                            <span style="font-size: 9px; color: #9ca3af;">Alt+${style.shortcut}</span>
                        </button>
                    `;
                }).join('');
            };

            panel.style.cssText = `
                background: white;
                border-radius: 12px;
                padding: 16px 16px 80px 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                width: 320px;
                display: none;
                font-size: 13px;
                max-height: calc(100vh - 300px);
                overflow-y: auto;
                position: fixed;
                right: 20px;
                top: 270px;
                box-sizing: border-box;
            `;

            const spacingValue = settings?.paragraphSpacing || 'normal';
            const spacingCompact = spacingValue === 'compact' ? 'checked' : '';
            const spacingNormal = spacingValue === 'normal' ? 'checked' : '';
            const spacingLoose = spacingValue === 'loose' ? 'checked' : '';

            panel.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 12px; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">⚙️ 排版设置</div>
                
                <div style="margin-bottom: 12px;">
                    <div style="color: #6b7280; margin-bottom: 6px; font-size: 12px;">一级标题: <span id="h1-val">${settings.h1Size}</span>px</div>
                    <input type="range" id="h1-size" min="16" max="28" value="${settings.h1Size}" style="width: 100%; accent-color: #07c160;">
                </div>
                
                <div style="margin-bottom: 12px;">
                    <div style="color: #6b7280; margin-bottom: 6px; font-size: 12px;">二级标题: <span id="h2-val">${settings.h2Size}</span>px</div>
                    <input type="range" id="h2-size" min="14" max="22" value="${settings.h2Size}" style="width: 100%; accent-color: #07c160;">
                </div>
                
                <div style="margin-bottom: 12px;">
                    <div style="color: #6b7280; margin-bottom: 6px; font-size: 12px;">三级标题: <span id="h3-val">${settings.h3Size}</span>px</div>
                    <input type="range" id="h3-size" min="13" max="19" value="${settings.h3Size}" style="width: 100%; accent-color: #07c160;">
                </div>

                <div style="margin-bottom: 12px;">
                    <div style="color: #6b7280; margin-bottom: 6px; font-size: 12px;">行间距</div>
                    <div style="display: flex; gap: 6px;">
                        <label style="flex: 1; padding: 6px; border: 1px solid ${spacingCompact ? '#07c160' : '#e5e7eb'}; border-radius: 6px; background: ${spacingCompact ? '#f0fdf4' : 'white'}; cursor: pointer; font-size: 11px; text-align: center;">
                            <input type="radio" name="spacing" value="compact" ${spacingCompact} style="accent-color: #07c160; margin-right: 4px;">紧凑
                        </label>
                        <label style="flex: 1; padding: 6px; border: 1px solid ${spacingNormal ? '#07c160' : '#e5e7eb'}; border-radius: 6px; background: ${spacingNormal ? '#f0fdf4' : 'white'}; cursor: pointer; font-size: 11px; text-align: center;">
                            <input type="radio" name="spacing" value="normal" ${spacingNormal} style="accent-color: #07c160; margin-right: 4px;">标准
                        </label>
                        <label style="flex: 1; padding: 6px; border: 1px solid ${spacingLoose ? '#07c160' : '#e5e7eb'}; border-radius: 6px; background: ${spacingLoose ? '#f0fdf4' : 'white'}; cursor: pointer; font-size: 11px; text-align: center;">
                            <input type="radio" name="spacing" value="loose" ${spacingLoose} style="accent-color: #07c160; margin-right: 4px;">宽松
                        </label>
                    </div>
                </div>

                <div style="margin-bottom: 12px;">
                    <div style="color: #6b7280; margin-bottom: 6px; font-size: 12px;">三横线样式</div>
                    <div style="display: flex; gap: 6px;">
                        <button class="hr-style-btn active" data-style="stars" style="flex: 1; padding: 8px; border: 1px solid #07c160; border-radius: 6px; background: #f0fdf4; cursor: pointer; font-size: 12px; color: #07c160;">✦✦✦</button>
                        <button class="hr-style-btn" data-style="line" style="flex: 1; padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer; font-size: 12px; color: #6b7280;">───</button>
                        <button class="hr-style-btn" data-style="dots" style="flex: 1; padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer; font-size: 12px; color: #6b7280;">···</button>
                    </div>
                </div>

                <div style="margin-bottom: 12px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; color: #374151;">
                        <input type="checkbox" id="bold-green" ${settings.boldColor ? 'checked' : ''} style="accent-color: #07c160;">
                        加粗文字变绿色
                    </label>
                </div>

                <div style="margin-bottom: 12px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; color: #374151;">
                        <input type="checkbox" id="quote-highlight" ${settings.highlightQuotes ? 'checked' : ''} style="accent-color: #07c160;">
                        书名号《》高亮
                    </label>
                </div>

                <div style="border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 10px;">
                    <div style="font-size: 11px; color: #9ca3af; margin-bottom: 6px;">自动插入三横线</div>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                        <input type="checkbox" id="auto-hr-h1" ${settings.autoHrBeforeH1 ? 'checked' : ''} style="accent-color: #07c160;">
                        一级标题前
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 11px; color: #6b7280;">
                        <input type="checkbox" id="auto-hr-h2" ${settings.autoHrBeforeH2 ? 'checked' : ''} style="accent-color: #07c160;">
                        二级标题前
                    </label>
                </div>

                <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div>
                            <span style="font-size: 12px; font-weight: 600; color: #374151;">框样式</span>
                            <div style="font-size: 10px; color: #9ca3af;">选中文字后按 Alt+1~9 快速应用</div>
                        </div>
                        <button id="toggle-edit-icons" style="
                            font-size: 11px;
                            padding: 4px 10px;
                            border: 1px solid #e5e7eb;
                            border-radius: 12px;
                            background: #f9fafb;
                            cursor: pointer;
                            color: #6b7280;
                        ">✏️ 编辑图标</button>
                    </div>
                    <div id="box-styles-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px;">
                        ${renderBoxStyleButtons()}
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding-top: 10px; border-top: 1px dashed #e5e7eb;">
                        <button id="apply-bold" style="padding: 10px; border: 1px solid #07c160; border-radius: 8px; background: #f0fdf4; cursor: pointer; font-size: 12px; color: #07c160; font-weight: 600;">
                            <span style="font-size: 16px;">𝐁</span> 加粗文字 (Alt+0)
                        </button>
                        <button id="apply-hr" style="padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; font-size: 12px; color: #374151;">
                            <span style="font-size: 16px;">✦✦✦</span> 插入分割线
                        </button>
                    </div>
                </div>

                <button id="save-settings" style="width: 100%; margin-top: 16px; padding: 10px; background: #07c160; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">保存设置</button>
            `;

            setTimeout(() => this.bindPanelEvents(panel, settings), 0);
            return panel;
        },

        bindPanelEvents(panel, settings) {
            ['h1', 'h2', 'h3'].forEach(level => {
                const slider = panel.querySelector(`#${level}-size`);
                const display = panel.querySelector(`#${level}-val`);
                slider?.addEventListener('input', (e) => {
                    display.textContent = e.target.value;
                });
            });

            panel.querySelectorAll('.hr-style-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    panel.querySelectorAll('.hr-style-btn').forEach(b => {
                        b.style.borderColor = '#e5e7eb';
                        b.style.background = 'white';
                        b.style.color = '#6b7280';
                    });
                    e.target.style.borderColor = '#07c160';
                    e.target.style.background = '#f0fdf4';
                    e.target.style.color = '#07c160';
                });
            });

            panel.querySelectorAll('.box-style-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (this.isEditingIcons) {
                        const boxType = e.currentTarget.dataset.box;
                        this.showIconPicker(boxType, e.currentTarget);
                    } else {
                        const boxType = e.currentTarget.dataset.box;
                        BoxStyleManager.apply(boxType);
                    }
                });
            });

            panel.querySelector('#apply-bold')?.addEventListener('click', () => {
                BoxStyleManager.apply('bold');
            });

            panel.querySelector('#apply-hr')?.addEventListener('click', () => {
                BoxStyleManager.apply('hr');
            });

            panel.querySelector('#toggle-edit-icons')?.addEventListener('click', (e) => {
                this.isEditingIcons = !this.isEditingIcons;
                panel.querySelectorAll('.box-style-btn').forEach(btn => {
                    if (this.isEditingIcons) {
                        btn.style.border = '2px dashed #07c160';
                        btn.style.background = '#f0fdf4';
                    } else {
                        btn.style.border = '1px solid #e5e7eb';
                        btn.style.background = 'white';
                    }
                });
                e.target.textContent = this.isEditingIcons ? '✓ 完成' : '✏️ 编辑图标';
            });

            panel.querySelector('#save-settings')?.addEventListener('click', () => {
                const activeHrBtn = panel.querySelector('.hr-style-btn[style*="border-color: rgb(7, 193, 96)"]') || panel.querySelector('.hr-style-btn.active');
                const spacingRadio = panel.querySelector('input[name="spacing"]:checked');
                
                const newSettings = {
                    h1Size: parseInt(panel.querySelector('#h1-size').value),
                    h2Size: parseInt(panel.querySelector('#h2-size').value),
                    h3Size: parseInt(panel.querySelector('#h3-size').value),
                    paragraphSpacing: spacingRadio?.value || 'normal',
                    hrStyle: activeHrBtn?.dataset.style || 'stars',
                    boldColor: panel.querySelector('#bold-green').checked ? '#07c160' : null,
                    highlightQuotes: panel.querySelector('#quote-highlight').checked,
                    autoHrBeforeH1: panel.querySelector('#auto-hr-h1').checked,
                    autoHrBeforeH2: panel.querySelector('#auto-hr-h2').checked,
                    autoHrBeforeH3: false,
                    themeColor: '#07c160',
                    boxIcons: settings.boxIcons
                };
                Utils.saveSettings(newSettings);
                panel.style.display = 'none';
                this.isEditingIcons = false;
                BoxStyleManager.showToast('✅ 设置已保存');
            });
        },

        showIconPicker(boxType, targetBtn) {
            if (this.iconPickerPanel) {
                this.iconPickerPanel.remove();
            }

            const settings = Utils.getSettings();
            const picker = document.createElement('div');
            picker.style.cssText = `
                position: fixed;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                z-index: 2147483648;
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                gap: 6px;
                max-width: 320px;
                max-height: 200px;
                overflow-y: auto;
            `;

            AVAILABLE_ICONS.forEach(icon => {
                const btn = document.createElement('button');
                btn.textContent = icon;
                btn.style.cssText = `
                    font-size: 20px;
                    padding: 8px;
                    border: 1px solid transparent;
                    border-radius: 6px;
                    background: white;
                    cursor: pointer;
                `;
                btn.onmouseenter = () => {
                    btn.style.background = '#f0fdf4';
                    btn.style.borderColor = '#07c160';
                };
                btn.onmouseleave = () => {
                    btn.style.background = 'white';
                    btn.style.borderColor = 'transparent';
                };
                btn.onclick = () => {
                    settings.boxIcons[boxType] = icon;
                    Utils.saveSettings(settings);
                    this.refreshBoxStylesGrid();
                    picker.remove();
                    BoxStyleManager.showToast(`${BOX_STYLES[boxType]?.name} → ${icon}`);
                };
                picker.appendChild(btn);
            });

            const rect = targetBtn.getBoundingClientRect();
            picker.style.left = Math.min(rect.left, window.innerWidth - 340) + 'px';
            picker.style.top = (rect.bottom + 8) + 'px';

            document.body.appendChild(picker);
            this.iconPickerPanel = picker;

            setTimeout(() => {
                document.addEventListener('click', function closePicker(e) {
                    if (!picker.contains(e.target) && !targetBtn.contains(e.target)) {
                        picker.remove();
                        document.removeEventListener('click', closePicker);
                    }
                }, { once: true });
            }, 0);
        },

        refreshBoxStylesGrid() {
            const grid = this.settingsPanel?.querySelector('#box-styles-grid');
            if (!grid) return;

            const settings = Utils.getSettings();
            const isEditing = this.isEditingIcons;
            
            grid.innerHTML = Object.entries(BOX_STYLES).map(([key, style]) => {
                const icon = settings.boxIcons?.[key] || '💬';
                const borderStyle = isEditing ? '2px dashed #07c160' : '1px solid #e5e7eb';
                const bgStyle = isEditing ? '#f0fdf4' : 'white';
                
                return `
                    <button class="box-style-btn" data-box="${key}" title="Alt+${style.shortcut}" style="
                        padding: 8px 4px;
                        border: ${borderStyle};
                        border-radius: 6px;
                        background: ${bgStyle};
                        cursor: pointer;
                        font-size: 11px;
                        color: #374151;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 4px;
                    ">
                        <span class="box-icon" style="font-size: 18px;">${icon}</span>
                        <span>${style.name}</span>
                        <span style="font-size: 9px; color: #9ca3af;">Alt+${style.shortcut}</span>
                    </button>
                `;
            }).join('');

            grid.querySelectorAll('.box-style-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (this.isEditingIcons) {
                        const boxType = e.currentTarget.dataset.box;
                        this.showIconPicker(boxType, e.currentTarget);
                    } else {
                        const boxType = e.currentTarget.dataset.box;
                        BoxStyleManager.apply(boxType);
                    }
                });
            });
        },

        toggleSettingsPanel() {
            if (this.settingsPanel) {
                const isVisible = this.settingsPanel.style.display === 'block';
                this.settingsPanel.style.display = isVisible ? 'none' : 'block';
                
                if (isVisible) {
                    this.isEditingIcons = false;
                    if (this.iconPickerPanel) {
                        this.iconPickerPanel.remove();
                    }
                }
            }
        },

        executeLayout() {
            const btn = this.btn;
            if (!btn) return;

            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span style="margin-right: 4px;">🪄</span>排版中...';
            btn.disabled = true;

            try {
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
                    btn.innerHTML = originalHTML;
                    return;
                }

                const rawMd = editor.innerText.trim();
                if (rawMd.length < 5) {
                    alert("请先输入一些文字再排版。");
                    btn.disabled = false;
                    btn.innerHTML = originalHTML;
                    return;
                }

                const settings = Utils.getSettings();
                ContentProcessor.init(settings);
                const outputHtml = ContentProcessor.parse(rawMd);

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

                btn.innerHTML = '<span style="margin-right: 4px;">✅</span>完成！';
            } catch (err) {
                console.error("Layout error:", err);
                btn.innerHTML = '<span style="margin-right: 4px;">❌</span>失败';
            } finally {
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = '<span style="margin-right: 4px;">✨</span>魔法自动排版';
                }, 2000);
            }
        }
    };

    // ============================================
    // 初始化
    // ============================================
    setInterval(() => ButtonManager.create(), 3000);
})();
