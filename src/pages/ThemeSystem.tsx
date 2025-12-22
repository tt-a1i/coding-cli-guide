import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';

export function ThemeSystem() {
  const themeDefinitionCode = `// 主题定义
// packages/cli/src/ui/themes/types.ts

interface Theme {
  name: string;
  description: string;

  // 主要颜色
  colors: {
    // 文本颜色
    text: string;
    textMuted: string;
    textHighlight: string;

    // 背景颜色
    background: string;
    backgroundAlt: string;

    // 强调色
    primary: string;
    secondary: string;
    accent: string;

    // 状态颜色
    success: string;
    warning: string;
    error: string;
    info: string;

    // 边框
    border: string;
    borderFocus: string;
  };

  // 语法高亮
  syntax: {
    keyword: string;
    string: string;
    number: string;
    comment: string;
    function: string;
    variable: string;
    operator: string;
    punctuation: string;
  };

  // UI 元素
  ui: {
    // 提示符
    prompt: string;
    promptSymbol: string;

    // 进度指示器
    spinner: string;
    progressBar: string;

    // 高亮
    selection: string;
    match: string;

    // 工具调用
    toolName: string;
    toolArg: string;
    toolResult: string;
  };
}`;

  const builtInThemesCode = `// 内置主题
// packages/cli/src/ui/themes/builtIn.ts

export const themes: Record<string, Theme> = {
  // 默认深色主题
  dark: {
    name: 'Dark',
    description: '默认深色主题',
    colors: {
      text: '#E0E0E0',
      textMuted: '#808080',
      textHighlight: '#FFFFFF',
      background: '#1E1E1E',
      backgroundAlt: '#2D2D2D',
      primary: '#4FC3F7',
      secondary: '#81C784',
      accent: '#FFB74D',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
      border: '#404040',
      borderFocus: '#4FC3F7',
    },
    syntax: {
      keyword: '#C792EA',
      string: '#C3E88D',
      number: '#F78C6C',
      comment: '#546E7A',
      function: '#82AAFF',
      variable: '#EEFFFF',
      operator: '#89DDFF',
      punctuation: '#89DDFF',
    },
    ui: {
      prompt: '#4FC3F7',
      promptSymbol: '❯',
      spinner: '#4FC3F7',
      progressBar: '#4FC3F7',
      selection: '#264F78',
      match: '#515C6A',
      toolName: '#82AAFF',
      toolArg: '#C3E88D',
      toolResult: '#808080',
    },
  },

  // 浅色主题
  light: {
    name: 'Light',
    description: '浅色主题',
    colors: {
      text: '#333333',
      textMuted: '#666666',
      textHighlight: '#000000',
      background: '#FFFFFF',
      backgroundAlt: '#F5F5F5',
      primary: '#0288D1',
      secondary: '#388E3C',
      accent: '#F57C00',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#D32F2F',
      info: '#1976D2',
      border: '#E0E0E0',
      borderFocus: '#0288D1',
    },
    syntax: {
      keyword: '#7B1FA2',
      string: '#388E3C',
      number: '#E64A19',
      comment: '#9E9E9E',
      function: '#1565C0',
      variable: '#212121',
      operator: '#00796B',
      punctuation: '#607D8B',
    },
    ui: {
      prompt: '#0288D1',
      promptSymbol: '❯',
      spinner: '#0288D1',
      progressBar: '#0288D1',
      selection: '#BBDEFB',
      match: '#FFF59D',
      toolName: '#1565C0',
      toolArg: '#388E3C',
      toolResult: '#666666',
    },
  },

  // Dracula 主题
  dracula: {
    name: 'Dracula',
    description: 'Dracula 暗色主题',
    colors: {
      text: '#F8F8F2',
      textMuted: '#6272A4',
      textHighlight: '#FFFFFF',
      background: '#282A36',
      backgroundAlt: '#44475A',
      primary: '#BD93F9',
      secondary: '#50FA7B',
      accent: '#FFB86C',
      success: '#50FA7B',
      warning: '#FFB86C',
      error: '#FF5555',
      info: '#8BE9FD',
      border: '#44475A',
      borderFocus: '#BD93F9',
    },
    syntax: {
      keyword: '#FF79C6',
      string: '#F1FA8C',
      number: '#BD93F9',
      comment: '#6272A4',
      function: '#50FA7B',
      variable: '#F8F8F2',
      operator: '#FF79C6',
      punctuation: '#F8F8F2',
    },
    ui: {
      prompt: '#BD93F9',
      promptSymbol: '❯',
      spinner: '#BD93F9',
      progressBar: '#BD93F9',
      selection: '#44475A',
      match: '#6272A4',
      toolName: '#50FA7B',
      toolArg: '#F1FA8C',
      toolResult: '#6272A4',
    },
  },

  // Monokai 主题
  monokai: {
    name: 'Monokai',
    description: 'Monokai Pro 风格',
    colors: {
      text: '#F8F8F2',
      textMuted: '#75715E',
      textHighlight: '#FFFFFF',
      background: '#272822',
      backgroundAlt: '#3E3D32',
      primary: '#66D9EF',
      secondary: '#A6E22E',
      accent: '#FD971F',
      success: '#A6E22E',
      warning: '#FD971F',
      error: '#F92672',
      info: '#66D9EF',
      border: '#3E3D32',
      borderFocus: '#66D9EF',
    },
    syntax: {
      keyword: '#F92672',
      string: '#E6DB74',
      number: '#AE81FF',
      comment: '#75715E',
      function: '#A6E22E',
      variable: '#F8F8F2',
      operator: '#F92672',
      punctuation: '#F8F8F2',
    },
    ui: {
      prompt: '#66D9EF',
      promptSymbol: '❯',
      spinner: '#66D9EF',
      progressBar: '#A6E22E',
      selection: '#49483E',
      match: '#75715E',
      toolName: '#A6E22E',
      toolArg: '#E6DB74',
      toolResult: '#75715E',
    },
  },

  // Nord 主题
  nord: {
    name: 'Nord',
    description: 'Nord 极简主题',
    colors: {
      text: '#ECEFF4',
      textMuted: '#4C566A',
      textHighlight: '#FFFFFF',
      background: '#2E3440',
      backgroundAlt: '#3B4252',
      primary: '#88C0D0',
      secondary: '#A3BE8C',
      accent: '#EBCB8B',
      success: '#A3BE8C',
      warning: '#EBCB8B',
      error: '#BF616A',
      info: '#5E81AC',
      border: '#4C566A',
      borderFocus: '#88C0D0',
    },
    syntax: {
      keyword: '#81A1C1',
      string: '#A3BE8C',
      number: '#B48EAD',
      comment: '#4C566A',
      function: '#88C0D0',
      variable: '#ECEFF4',
      operator: '#81A1C1',
      punctuation: '#ECEFF4',
    },
    ui: {
      prompt: '#88C0D0',
      promptSymbol: '❯',
      spinner: '#88C0D0',
      progressBar: '#88C0D0',
      selection: '#3B4252',
      match: '#4C566A',
      toolName: '#88C0D0',
      toolArg: '#A3BE8C',
      toolResult: '#4C566A',
    },
  },
};

// 更多内置主题...
// - solarized-dark
// - solarized-light
// - one-dark
// - github-dark
// - github-light
// - gruvbox
// - material
// - tokyo-night
// - catppuccin
// 共 20+ 内置主题`;

  const themeServiceCode = `// 主题服务
// packages/cli/src/ui/themes/service.ts

export class ThemeService {
  private currentTheme: Theme;
  private customThemes: Map<string, Theme> = new Map();

  constructor() {
    // 加载用户配置的主题
    const themeName = getConfig('theme') || 'dark';
    this.currentTheme = this.getTheme(themeName);
  }

  // 获取主题
  getTheme(name: string): Theme {
    // 优先检查自定义主题
    if (this.customThemes.has(name)) {
      return this.customThemes.get(name)!;
    }
    // 使用内置主题
    return themes[name] || themes.dark;
  }

  // 设置当前主题
  setTheme(name: string): void {
    this.currentTheme = this.getTheme(name);
    saveConfig('theme', name);
  }

  // 获取当前主题
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  // 注册自定义主题
  registerTheme(theme: Theme): void {
    this.customThemes.set(theme.name, theme);
  }

  // 列出所有可用主题
  listThemes(): ThemeInfo[] {
    const allThemes: ThemeInfo[] = [];

    // 内置主题
    for (const [name, theme] of Object.entries(themes)) {
      allThemes.push({
        name,
        description: theme.description,
        isBuiltIn: true,
        isCurrent: name === this.currentTheme.name,
      });
    }

    // 自定义主题
    for (const [name, theme] of this.customThemes) {
      allThemes.push({
        name,
        description: theme.description,
        isBuiltIn: false,
        isCurrent: name === this.currentTheme.name,
      });
    }

    return allThemes;
  }

  // 根据终端能力自动选择
  autoSelectTheme(): void {
    const colorSupport = getColorSupport();

    if (colorSupport === 'truecolor') {
      // 支持真彩色，使用完整主题
      return;
    } else if (colorSupport === '256') {
      // 256 色模式，使用简化调色板
      this.currentTheme = this.simplifyTheme(this.currentTheme, 256);
    } else {
      // 16 色模式，使用基本调色板
      this.currentTheme = this.simplifyTheme(this.currentTheme, 16);
    }
  }
}`;

  const colorUtilsCode = `// 颜色工具函数
// packages/cli/src/ui/themes/colors.ts

import chalk from 'chalk';

// 将十六进制颜色转换为 ANSI 256 色
export function hexTo256(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // 转换为 216 色立方体
  const ri = Math.round(r / 51);
  const gi = Math.round(g / 51);
  const bi = Math.round(b / 51);

  return 16 + 36 * ri + 6 * gi + bi;
}

// 将十六进制颜色转换为 RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// 应用主题颜色
export function applyColor(text: string, color: string): string {
  const colorSupport = getColorSupport();

  if (colorSupport === 'truecolor') {
    // 真彩色
    const { r, g, b } = hexToRgb(color);
    return chalk.rgb(r, g, b)(text);
  } else if (colorSupport === '256') {
    // 256 色
    const code = hexTo256(color);
    return chalk.ansi256(code)(text);
  } else {
    // 基本 16 色，使用最接近的颜色
    return mapToBasicColor(text, color);
  }
}

// 检测终端颜色支持
export function getColorSupport(): 'truecolor' | '256' | '16' | 'none' {
  // 环境变量检测
  if (process.env.COLORTERM === 'truecolor' ||
      process.env.COLORTERM === '24bit') {
    return 'truecolor';
  }

  if (process.env.TERM?.includes('256color')) {
    return '256';
  }

  // chalk 的检测
  if (chalk.supportsColor) {
    if (chalk.supportsColor.has16m) return 'truecolor';
    if (chalk.supportsColor.has256) return '256';
    if (chalk.supportsColor.hasBasic) return '16';
  }

  return 'none';
}

// 主题化输出
export function themed(part: keyof Theme['ui'], text: string): string {
  const theme = themeService.getCurrentTheme();
  const color = theme.ui[part];
  return applyColor(text, color);
}

// 语法高亮
export function highlight(type: keyof Theme['syntax'], text: string): string {
  const theme = themeService.getCurrentTheme();
  const color = theme.syntax[type];
  return applyColor(text, color);
}`;

  const customThemeCode = `// 自定义主题
// ~/.innies/themes/my-theme.json

{
  "name": "my-theme",
  "description": "我的自定义主题",

  "colors": {
    "text": "#E0E0E0",
    "textMuted": "#808080",
    "textHighlight": "#FFFFFF",
    "background": "#1A1A2E",
    "backgroundAlt": "#16213E",
    "primary": "#E94560",
    "secondary": "#0F3460",
    "accent": "#F39C12",
    "success": "#27AE60",
    "warning": "#F39C12",
    "error": "#E74C3C",
    "info": "#3498DB",
    "border": "#16213E",
    "borderFocus": "#E94560"
  },

  "syntax": {
    "keyword": "#E94560",
    "string": "#27AE60",
    "number": "#F39C12",
    "comment": "#808080",
    "function": "#3498DB",
    "variable": "#E0E0E0",
    "operator": "#E94560",
    "punctuation": "#808080"
  },

  "ui": {
    "prompt": "#E94560",
    "promptSymbol": "❯",
    "spinner": "#E94560",
    "progressBar": "#E94560",
    "selection": "#16213E",
    "match": "#0F3460",
    "toolName": "#3498DB",
    "toolArg": "#27AE60",
    "toolResult": "#808080"
  }
}

// 加载自定义主题
// innies config set theme my-theme`;

  const cliCommandsCode = `# 主题管理命令

# 列出所有可用主题
innies config themes
# 输出:
# Available Themes:
# ────────────────────────────────
#   dark           (current)
#   light
#   dracula
#   monokai
#   nord
#   solarized-dark
#   solarized-light
#   one-dark
#   github-dark
#   github-light
#   gruvbox
#   material
#   tokyo-night
#   catppuccin
#   my-theme       (custom)
# ────────────────────────────────

# 切换主题
innies config set theme dracula

# 预览主题
innies config preview-theme monokai

# 重置为默认主题
innies config set theme dark

# 导入自定义主题
innies config import-theme ./my-theme.json

# 导出当前主题
innies config export-theme > current-theme.json`;

  // 主题预览组件
  const ThemePreview = ({ themeName, theme }: { themeName: string; theme: Record<string, Record<string, string>> }) => (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
      <h5 className="font-semibold mb-2" style={{ color: theme.colors.primary }}>
        {themeName}
      </h5>
      <div className="space-y-1 text-sm font-mono">
        <div style={{ color: theme.ui.prompt }}>{theme.ui.promptSymbol} innies</div>
        <div>
          <span style={{ color: theme.syntax.keyword }}>const</span>{' '}
          <span style={{ color: theme.syntax.variable }}>greeting</span>{' '}
          <span style={{ color: theme.syntax.operator }}>=</span>{' '}
          <span style={{ color: theme.syntax.string }}>"Hello"</span>
          <span style={{ color: theme.syntax.punctuation }}>;</span>
        </div>
        <div style={{ color: theme.syntax.comment }}>// Comment</div>
        <div>
          <span style={{ color: theme.syntax.function }}>console</span>
          <span style={{ color: theme.syntax.punctuation }}>.</span>
          <span style={{ color: theme.syntax.function }}>log</span>
          <span style={{ color: theme.syntax.punctuation }}>(</span>
          <span style={{ color: theme.syntax.number }}>42</span>
          <span style={{ color: theme.syntax.punctuation }}>)</span>
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <span
          className="inline-block w-4 h-4 rounded"
          style={{ backgroundColor: theme.colors.success }}
          title="success"
        />
        <span
          className="inline-block w-4 h-4 rounded"
          style={{ backgroundColor: theme.colors.warning }}
          title="warning"
        />
        <span
          className="inline-block w-4 h-4 rounded"
          style={{ backgroundColor: theme.colors.error }}
          title="error"
        />
        <span
          className="inline-block w-4 h-4 rounded"
          style={{ backgroundColor: theme.colors.info }}
          title="info"
        />
      </div>
    </div>
  );

  // 预览用的简化主题数据
  const previewThemes = {
    dark: {
      colors: { primary: '#4FC3F7', success: '#4CAF50', warning: '#FF9800', error: '#F44336', info: '#2196F3' },
      syntax: { keyword: '#C792EA', string: '#C3E88D', number: '#F78C6C', comment: '#546E7A', function: '#82AAFF', variable: '#EEFFFF', operator: '#89DDFF', punctuation: '#89DDFF' },
      ui: { prompt: '#4FC3F7', promptSymbol: '❯' },
    },
    dracula: {
      colors: { primary: '#BD93F9', success: '#50FA7B', warning: '#FFB86C', error: '#FF5555', info: '#8BE9FD' },
      syntax: { keyword: '#FF79C6', string: '#F1FA8C', number: '#BD93F9', comment: '#6272A4', function: '#50FA7B', variable: '#F8F8F2', operator: '#FF79C6', punctuation: '#F8F8F2' },
      ui: { prompt: '#BD93F9', promptSymbol: '❯' },
    },
    monokai: {
      colors: { primary: '#66D9EF', success: '#A6E22E', warning: '#FD971F', error: '#F92672', info: '#66D9EF' },
      syntax: { keyword: '#F92672', string: '#E6DB74', number: '#AE81FF', comment: '#75715E', function: '#A6E22E', variable: '#F8F8F2', operator: '#F92672', punctuation: '#F8F8F2' },
      ui: { prompt: '#66D9EF', promptSymbol: '❯' },
    },
    nord: {
      colors: { primary: '#88C0D0', success: '#A3BE8C', warning: '#EBCB8B', error: '#BF616A', info: '#5E81AC' },
      syntax: { keyword: '#81A1C1', string: '#A3BE8C', number: '#B48EAD', comment: '#4C566A', function: '#88C0D0', variable: '#ECEFF4', operator: '#81A1C1', punctuation: '#ECEFF4' },
      ui: { prompt: '#88C0D0', promptSymbol: '❯' },
    },
  };

  return (
    <div className="space-y-8">
      {/* 概述 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">主题系统</h2>
        <p className="text-gray-300 mb-4">
          主题系统允许用户自定义 CLI 的视觉外观，包括颜色、语法高亮和 UI 元素样式。
          内置 20+ 流行主题，同时支持完全自定义。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <HighlightBox title="内置主题" color="blue">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">20+</div>
              <div className="text-sm text-gray-400">流行主题</div>
            </div>
          </HighlightBox>

          <HighlightBox title="自定义支持" color="green">
            <p className="text-sm">完全自定义调色板</p>
            <code className="text-xs text-green-400">JSON 格式</code>
          </HighlightBox>

          <HighlightBox title="语法高亮" color="yellow">
            <p className="text-sm">代码块颜色主题</p>
            <code className="text-xs text-yellow-400">8 种类型</code>
          </HighlightBox>

          <HighlightBox title="终端兼容" color="purple">
            <p className="text-sm">自动适配</p>
            <code className="text-xs text-purple-400">16/256/真彩色</code>
          </HighlightBox>
        </div>
      </section>

      {/* 主题预览 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">主题预览</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(previewThemes).map(([name, theme]) => (
            <ThemePreview key={name} themeName={name} theme={theme} />
          ))}
        </div>
      </section>

      {/* 主题定义 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">主题结构</h3>
        <CodeBlock code={themeDefinitionCode} language="typescript" title="Theme 接口" />
      </section>

      {/* 内置主题 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">内置主题</h3>
        <CodeBlock code={builtInThemesCode} language="typescript" title="内置主题定义" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-2">完整内置主题列表</h4>
          <div className="grid grid-cols-4 gap-2 text-sm">
            {[
              'dark', 'light', 'dracula', 'monokai',
              'nord', 'solarized-dark', 'solarized-light', 'one-dark',
              'github-dark', 'github-light', 'gruvbox', 'material',
              'tokyo-night', 'catppuccin', 'ayu-dark', 'ayu-light',
              'palenight', 'night-owl', 'synthwave', 'cyberpunk',
            ].map(theme => (
              <code key={theme} className="text-gray-400">{theme}</code>
            ))}
          </div>
        </div>
      </section>

      {/* 主题服务 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">主题服务</h3>
        <CodeBlock code={themeServiceCode} language="typescript" title="ThemeService" />
      </section>

      {/* 颜色工具 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">颜色工具</h3>
        <CodeBlock code={colorUtilsCode} language="typescript" title="颜色处理函数" />

        <HighlightBox title="终端颜色支持" color="blue" className="mt-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-blue-300">真彩色 (24-bit)</h5>
              <p className="text-gray-400">1600 万色，现代终端支持</p>
              <code className="text-xs">COLORTERM=truecolor</code>
            </div>
            <div>
              <h5 className="font-semibold text-blue-300">256 色</h5>
              <p className="text-gray-400">大多数终端支持</p>
              <code className="text-xs">TERM=xterm-256color</code>
            </div>
            <div>
              <h5 className="font-semibold text-blue-300">16 色</h5>
              <p className="text-gray-400">基本终端支持</p>
              <code className="text-xs">基本 ANSI 颜色</code>
            </div>
          </div>
        </HighlightBox>
      </section>

      {/* 自定义主题 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">自定义主题</h3>
        <CodeBlock code={customThemeCode} language="json" title="自定义主题文件" />
      </section>

      {/* CLI 命令 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">主题命令</h3>
        <CodeBlock code={cliCommandsCode} language="bash" title="主题管理" />
      </section>

      {/* 架构图 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">主题系统架构</h3>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <pre className="text-sm text-gray-300 overflow-x-auto">
{`┌──────────────────────────────────────────────────────────────────┐
│                        Theme System                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Theme Registry                          │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │ Built-in Themes                                     │   │  │
│  │  │ dark | light | dracula | monokai | nord | ...       │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │ Custom Themes (~/.innies/themes/)                   │   │  │
│  │  │ my-theme.json | company-theme.json | ...            │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Theme Service                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │  │
│  │  │ Theme Loader │  │ Theme Switch │  │ Color Utils  │     │  │
│  │  │              │  │              │  │              │     │  │
│  │  │ Load JSON    │  │ setTheme()   │  │ hex→RGB      │     │  │
│  │  │ Validate     │  │ Current: ○   │  │ hex→256      │     │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                 Terminal Adapter                           │  │
│  │                                                            │  │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐             │  │
│  │  │ TrueColor│    │   256    │    │    16    │             │  │
│  │  │  24-bit  │    │  Colors  │    │  Colors  │             │  │
│  │  │ #RRGGBB  │    │  \\e[38;5 │    │  \\e[31m  │             │  │
│  │  └──────────┘    └──────────┘    └──────────┘             │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                        UI Components                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Prompt     │  │ Code Blocks  │  │  Messages    │           │
│  │  themed()    │  │ highlight()  │  │  styled()    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </section>

      {/* 最佳实践 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">最佳实践</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">创建自定义主题</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ 保持足够的对比度</li>
              <li>✓ 使用一致的色调</li>
              <li>✓ 测试不同终端的兼容性</li>
              <li>✓ 考虑色盲用户</li>
              <li>✓ 提供语义化的颜色命名</li>
            </ul>
          </div>
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">终端兼容性</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>→ 检测终端颜色支持</li>
              <li>→ 提供降级方案</li>
              <li>→ 使用 chalk 库处理颜色</li>
              <li>→ 测试常见终端模拟器</li>
              <li>→ 支持 NO_COLOR 环境变量</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
