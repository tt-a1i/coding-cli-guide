import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'settings-manager', label: '设置管理器', description: '配置系统详解' },
  { id: 'ui-state-management', label: 'UI 状态管理', description: 'React Context 状态' },
  { id: 'shell-modes', label: 'Shell 模式', description: '交互式 Shell' },
  { id: 'custom-cmd', label: '自定义命令', description: '命令扩展' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--purple)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">⌨️</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">30秒快速理解</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-5">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <p className="text-[var(--text-primary)] font-medium">
              <span className="text-[var(--cyber-blue)] font-bold">一句话：</span>
              数据驱动的键盘快捷键配置系统，通过 Command 枚举和 KeyBinding 接口实现可扩展的按键映射
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">27</div>
              <div className="text-xs text-[var(--text-muted)]">Command 类型</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">6</div>
              <div className="text-xs text-[var(--text-muted)]">修饰键类型</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">5</div>
              <div className="text-xs text-[var(--text-muted)]">功能分组</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">∞</div>
              <div className="text-xs text-[var(--text-muted)]">可扩展绑定</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">按键处理流程</h4>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-3 py-1.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded-lg border border-[var(--cyber-blue)]/30">
                Keypress 事件
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--purple)]/20 text-[var(--purple)] rounded-lg border border-[var(--purple)]/30">
                KeyBinding 匹配
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                Command 派发
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--amber)]/20 text-[var(--amber)] rounded-lg border border-[var(--amber)]/30">
                Handler 执行
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码入口:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/cli/src/config/keyBindings.ts
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

export function KeyBindings() {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  const keyBindingFlowChart = `flowchart TD
    subgraph Input["用户输入层"]
        KP[Keypress Event]
        MOD[修饰键状态<br/>ctrl/shift/command]
    end

    subgraph Matching["匹配层"]
        CFG[KeyBindingConfig]
        BIND[KeyBinding 规则]
        MATCH{匹配检查}
    end

    subgraph Dispatch["派发层"]
        CMD[Command 枚举]
        CTX[上下文检查]
        HANDLER[Command Handler]
    end

    KP --> MOD
    MOD --> MATCH
    CFG --> BIND
    BIND --> MATCH
    MATCH -->|匹配成功| CMD
    MATCH -->|无匹配| KP
    CMD --> CTX
    CTX --> HANDLER

    style KP fill:#1a1a2e,stroke:#00d4ff
    style CMD fill:#1a1a2e,stroke:#00ff88
    style MATCH fill:#2d1f3d,stroke:#a855f7
    style HANDLER fill:#1a1a2e,stroke:#f59e0b`;

  const commandEnumCode = `// Command 枚举定义所有可用的键盘快捷键命令
export enum Command {
  // 基础操作
  RETURN = 'return',
  ESCAPE = 'escape',

  // 光标移动
  HOME = 'home',           // Ctrl+A → 行首
  END = 'end',             // Ctrl+E → 行尾

  // 文本删除
  KILL_LINE_RIGHT = 'killLineRight',   // Ctrl+K → 删除到行尾
  KILL_LINE_LEFT = 'killLineLeft',     // Ctrl+U → 删除到行首
  CLEAR_INPUT = 'clearInput',          // Ctrl+C → 清空输入
  DELETE_WORD_BACKWARD = 'deleteWordBackward', // Ctrl+Backspace

  // 屏幕控制
  CLEAR_SCREEN = 'clearScreen',        // Ctrl+L → 清屏

  // 历史导航
  HISTORY_UP = 'historyUp',            // Ctrl+P → 上一条
  HISTORY_DOWN = 'historyDown',        // Ctrl+N → 下一条
  NAVIGATION_UP = 'navigationUp',      // ↑ 方向键
  NAVIGATION_DOWN = 'navigationDown',  // ↓ 方向键

  // 自动补全
  ACCEPT_SUGGESTION = 'acceptSuggestion',  // Tab/Enter
  COMPLETION_UP = 'completionUp',
  COMPLETION_DOWN = 'completionDown',

  // 文本输入
  SUBMIT = 'submit',       // Enter (无修饰键)
  NEWLINE = 'newline',     // Ctrl+Enter / Shift+Enter

  // 外部工具
  OPEN_EXTERNAL_EDITOR = 'openExternalEditor',  // Ctrl+X
  PASTE_CLIPBOARD_IMAGE = 'pasteClipboardImage', // Ctrl+V

  // 应用级绑定
  SHOW_ERROR_DETAILS = 'showErrorDetails',     // Ctrl+O
  TOGGLE_TOOL_DESCRIPTIONS = 'toggleToolDescriptions', // Ctrl+T
  QUIT = 'quit',           // Ctrl+C
  EXIT = 'exit',           // Ctrl+D

  // Shell 命令
  REVERSE_SEARCH = 'reverseSearch',    // Ctrl+R
  TOGGLE_SHELL_INPUT_FOCUS = 'toggleShellInputFocus', // Ctrl+F
}`;

  const keyBindingInterfaceCode = `// KeyBinding 接口定义单个按键绑定规则
export interface KeyBinding {
  /** 按键名称 (e.g., 'a', 'return', 'tab', 'escape') */
  key?: string;

  /** 按键序列 (e.g., '\\x18' for Ctrl+X) */
  sequence?: string;

  /** Ctrl 键要求: true=必须按下, false=必须未按下, undefined=忽略 */
  ctrl?: boolean;

  /** Shift 键要求 */
  shift?: boolean;

  /** Command/Meta 键要求 */
  command?: boolean;

  /** 粘贴操作要求 */
  paste?: boolean;
}

// 配置类型：Command → KeyBinding[] 映射
export type KeyBindingConfig = {
  readonly [C in Command]: readonly KeyBinding[];
};`;

  const defaultBindingsCode = `// 默认键盘绑定配置（部分示例）
export const defaultKeyBindings: KeyBindingConfig = {
  // 基础绑定
  [Command.RETURN]: [{ key: 'return' }],
  [Command.ESCAPE]: [{ key: 'escape' }],

  // 光标移动 - Emacs 风格
  [Command.HOME]: [{ key: 'a', ctrl: true }],
  [Command.END]: [{ key: 'e', ctrl: true }],

  // 文本删除
  [Command.KILL_LINE_RIGHT]: [{ key: 'k', ctrl: true }],
  [Command.KILL_LINE_LEFT]: [{ key: 'u', ctrl: true }],
  [Command.DELETE_WORD_BACKWARD]: [
    { key: 'backspace', ctrl: true },
    { key: 'backspace', command: true }, // macOS 兼容
  ],

  // 提交 - 排除所有修饰键和粘贴
  [Command.SUBMIT]: [{
    key: 'return',
    ctrl: false,
    command: false,
    paste: false,
    shift: false,
  }],

  // 换行 - 多种方式支持
  [Command.NEWLINE]: [
    { key: 'return', ctrl: true },
    { key: 'return', command: true },
    { key: 'return', paste: true },
    { key: 'return', shift: true },
    { key: 'j', ctrl: true },
  ],

  // Shell 反向搜索
  [Command.REVERSE_SEARCH]: [{ key: 'r', ctrl: true }],

  // 外部编辑器
  [Command.OPEN_EXTERNAL_EDITOR]: [
    { key: 'x', ctrl: true },
    { sequence: '\\x18', ctrl: true },
  ],
};`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Key Bindings 键盘绑定系统</h1>
        <p className="text-[var(--text-secondary)] text-lg">
          数据驱动的键盘快捷键配置系统，支持 27 种命令类型和灵活的按键组合
        </p>
      </div>

      <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

      <Layer title="系统架构" icon="🏗️" defaultOpen={true}>
        <HighlightBox title="按键处理流程" color="blue" className="mb-6">
          <MermaidDiagram chart={keyBindingFlowChart} />
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)]">
            <div className="text-[var(--cyber-blue)] font-bold mb-2">🎹 Input 层</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 捕获 keypress 事件</li>
              <li>• 识别修饰键状态</li>
              <li>• 处理特殊序列</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)]">
            <div className="text-[var(--purple)] font-bold mb-2">🔍 Matching 层</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 遍历 KeyBindingConfig</li>
              <li>• 检查 KeyBinding 规则</li>
              <li>• 支持多绑定映射</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)]">
            <div className="text-[var(--terminal-green)] font-bold mb-2">⚡ Dispatch 层</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 解析 Command 枚举</li>
              <li>• 检查上下文条件</li>
              <li>• 调用对应 Handler</li>
            </ul>
          </div>
        </div>
      </Layer>

      <Layer title="Command 枚举" icon="📋" defaultOpen={true}>
        <p className="text-[var(--text-secondary)] mb-4">
          所有可用的键盘命令通过 <code className="text-[var(--cyber-blue)]">Command</code> 枚举定义，
          分为 5 个功能分组：
        </p>

        <CodeBlock code={commandEnumCode} language="typescript" title="config/keyBindings.ts - Command 枚举" />

        <div className="mt-4 prose prose-invert max-w-none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 text-[var(--text-muted)]">分类</th>
                  <th className="text-left py-2 text-[var(--text-muted)]">命令</th>
                  <th className="text-left py-2 text-[var(--text-muted)]">默认绑定</th>
                  <th className="text-left py-2 text-[var(--text-muted)]">说明</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-subtle)]/30">
                  <td className="py-2 font-medium text-[var(--cyber-blue)]">基础</td>
                  <td><code>RETURN</code></td>
                  <td><kbd className="px-1 bg-[var(--bg-terminal)] rounded">Enter</kbd></td>
                  <td>回车确认</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/30">
                  <td></td>
                  <td><code>ESCAPE</code></td>
                  <td><kbd className="px-1 bg-[var(--bg-terminal)] rounded">Esc</kbd></td>
                  <td>取消/退出</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/30">
                  <td className="py-2 font-medium text-[var(--terminal-green)]">光标</td>
                  <td><code>HOME</code></td>
                  <td><kbd className="px-1 bg-[var(--bg-terminal)] rounded">Ctrl+A</kbd></td>
                  <td>行首</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/30">
                  <td></td>
                  <td><code>END</code></td>
                  <td><kbd className="px-1 bg-[var(--bg-terminal)] rounded">Ctrl+E</kbd></td>
                  <td>行尾</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/30">
                  <td className="py-2 font-medium text-[var(--amber)]">编辑</td>
                  <td><code>KILL_LINE_RIGHT</code></td>
                  <td><kbd className="px-1 bg-[var(--bg-terminal)] rounded">Ctrl+K</kbd></td>
                  <td>删除到行尾</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/30">
                  <td></td>
                  <td><code>KILL_LINE_LEFT</code></td>
                  <td><kbd className="px-1 bg-[var(--bg-terminal)] rounded">Ctrl+U</kbd></td>
                  <td>删除到行首</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/30">
                  <td className="py-2 font-medium text-[var(--purple)]">历史</td>
                  <td><code>HISTORY_UP</code></td>
                  <td><kbd className="px-1 bg-[var(--bg-terminal)] rounded">Ctrl+P</kbd></td>
                  <td>上一条历史</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/30">
                  <td></td>
                  <td><code>REVERSE_SEARCH</code></td>
                  <td><kbd className="px-1 bg-[var(--bg-terminal)] rounded">Ctrl+R</kbd></td>
                  <td>反向搜索</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Layer>

      <Layer title="KeyBinding 接口" icon="🔗" defaultOpen={true}>
        <p className="text-[var(--text-secondary)] mb-4">
          每个 Command 可以绑定多个 <code className="text-[var(--cyber-blue)]">KeyBinding</code>，
          支持精确控制修饰键要求：
        </p>

        <CodeBlock code={keyBindingInterfaceCode} language="typescript" title="KeyBinding 接口定义" />

        <HighlightBox title="修饰键逻辑" color="purple" className="mt-4">
          <ul className="text-sm text-[var(--text-secondary)] space-y-2">
            <li>• <code className="text-[var(--terminal-green)]">ctrl: true</code> → 必须按下 Ctrl 键</li>
            <li>• <code className="text-[var(--error)]">ctrl: false</code> → 必须未按下 Ctrl 键</li>
            <li>• <code className="text-[var(--text-muted)]">ctrl: undefined</code> → 忽略 Ctrl 键状态</li>
            <li>• 同一 Command 可有多个绑定，任一匹配即触发</li>
          </ul>
        </HighlightBox>
      </Layer>

      <Layer title="默认配置示例" icon="⚙️" defaultOpen={false}>
        <CodeBlock code={defaultBindingsCode} language="typescript" title="defaultKeyBindings 配置" />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="设计亮点" color="green">
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>✅ 数据驱动，易于扩展</li>
              <li>✅ 多绑定支持同一命令</li>
              <li>✅ macOS/Linux 兼容</li>
              <li>✅ Emacs 风格快捷键</li>
            </ul>
          </HighlightBox>
          <HighlightBox title="使用场景" color="orange">
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>🔹 主输入框编辑</li>
              <li>🔹 历史记录导航</li>
              <li>🔹 自动补全选择</li>
              <li>🔹 Shell 交互模式</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      <Layer title="扩展机制" icon="🔧" defaultOpen={false}>
        <p className="text-[var(--text-secondary)] mb-4">
          未来可通过用户配置文件自定义键盘绑定：
        </p>

        <CodeBlock
          code={`// 用户自定义绑定示例 (未来支持)
{
  "keyBindings": {
    "submit": [{ "key": "return", "ctrl": false }],
    "openExternalEditor": [
      { "key": "e", "ctrl": true },
      { "key": "x", "ctrl": true }
    ]
  }
}`}
          language="json"
          title="settings.json 自定义绑定"
        />

        <div className="mt-4 p-4 bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)]">
          <div className="text-sm text-[var(--text-muted)]">
            <strong className="text-[var(--text-primary)]">💡 扩展思路：</strong>
            <ul className="mt-2 space-y-1">
              <li>• 合并用户配置与默认配置</li>
              <li>• 支持完全覆盖或追加模式</li>
              <li>• 验证绑定冲突</li>
            </ul>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
