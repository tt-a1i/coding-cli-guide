import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';

const relatedPages: RelatedPage[] = [
 { id: 'ui-components', label: 'UI 组件库', description: '终端组件' },
 { id: 'key-bindings', label: '键盘绑定', description: '快捷键系统' },
 { id: 'ui-state', label: 'UI 状态管理', description: '状态流转' },
 { id: 'text-buffer', label: 'TextBuffer', description: '文本编辑器' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-xl border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
  <span className="text-xl font-bold text-heading">30秒快速理解</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-5">
 <div className="bg-base/50 rounded-lg p-4 ">
 <p className="text-heading font-medium">
 <span className="text-heading font-bold">一句话：</span>
 50+ 个自定义 React Hooks，涵盖输入处理、补全系统、命令执行、状态管理等核心功能
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">50+</div>
 <div className="text-xs text-dim">自定义 Hooks</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">8</div>
 <div className="text-xs text-dim">功能分类</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">Ink</div>
 <div className="text-xs text-dim">终端 React</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">Context</div>
 <div className="text-xs text-dim">全局状态</div>
 </div>
 </div>

 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">Hook 分类</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 输入处理
 </span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 补全系统
 </span>
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 命令 & 对话框
 </span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 系统集成
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">源码目录:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/cli/src/ui/hooks/
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function ReactHooksOverview() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const hooksDependencyChart = `flowchart TD
 subgraph Core["核心 Hooks"]
 KP[useKeypress]
 KB[useKeypressContext]
 TB[useTextBuffer]
 end

 subgraph Completion["补全系统"]
 COMP[useCompletion]
 SLASH[useSlashCompletion]
 AT[useAtCompletion]
 CMD[useCommandCompletion]
 PROMPT[usePromptCompletion]
 end

 subgraph Input["输入处理"]
 VIM[useVim]
 SEL[useSelectionList]
 HIST[useInputHistory]
 REV[useReverseSearchCompletion]
 end

 subgraph System["系统集成"]
 TERM[useTerminalSize]
 GIT[useGitBranchName]
 KITTY[useKittyKeyboardProtocol]
 FOCUS[useFocus]
 end

 KB --> KP
 KP --> VIM
 KP --> SEL
 TB --> VIM
 TB --> HIST

 COMP --> SLASH
 COMP --> AT
 COMP --> CMD
 COMP --> PROMPT

 style Core stroke:#00d4ff
 style Completion stroke:#00ff88
 style Input stroke:${getThemeColor("--color-warning", "#b45309")}
 style System stroke:#a855f7`;

 const useKeypressCode = `// useKeypress.ts - 键盘事件监听 Hook
import { useEffect } from 'react';
import { useKeypressContext } from '../contexts/KeypressContext.js';




export type { Key };

export function useKeypress(
  onKeypress: KeypressHandler,
  { isActive }: { isActive: boolean },
) {
  const { subscribe, unsubscribe } = useKeypressContext();

  useEffect(() => {
  if (!isActive) {
  return;
  }

  subscribe(onKeypress);
  return () => {
  unsubscribe(onKeypress);
  };
  }, [isActive, onKeypress, subscribe, unsubscribe]);
}

// 使用示例
function InputComponent() {
  const handleKeypress = useCallback((input: string, key: Key) => {
  if (key.return) {
  handleSubmit();
  } else if (key.escape) {
  handleCancel();
  }
  }, []);

  useKeypress(handleKeypress, { isActive: isFocused });
}`;

 const useCompletionCode = `// useCompletion.ts - 补全状态管理 Hook
export interface UseCompletionReturn {
  suggestions: Suggestion[];
  activeSuggestionIndex: number;
  visibleStartIndex: number;
  showSuggestions: boolean;
  isLoadingSuggestions: boolean;
  isPerfectMatch: boolean;
  // Setters
  setSuggestions: Dispatch<SetStateAction<Suggestion[]>>;
  setActiveSuggestionIndex: Dispatch<SetStateAction<number>>;
  // Actions
  resetCompletionState: () => void;
  navigateUp: () => void;
  navigateDown: () => void;
}

export function useCompletion(): UseCompletionReturn {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigateUp = useCallback(() => {
  if (suggestions.length === 0) return;
  setActiveSuggestionIndex((prev) =>
  prev <= 0 ? suggestions.length - 1 : prev - 1
  );
  // 调整滚动位置...
  }, [suggestions.length]);

  const navigateDown = useCallback(() => {
  if (suggestions.length === 0) return;
  setActiveSuggestionIndex((prev) =>
  prev >= suggestions.length - 1 ? 0 : prev + 1
  );
  // 调整滚动位置...
  }, [suggestions.length]);

  return { suggestions, activeSuggestionIndex, navigateUp, navigateDown, ... };
}`;

 const useVimCode = `// vim.ts - Vim 模式 Hook
export type VimMode = 'NORMAL' | 'INSERT';

type VimState = {
  mode: VimMode;
  count: number;
  pendingOperator: 'g' | 'd' | 'c' | null;
  lastCommand: { type: string; count: number } | null;
};

const CMD_TYPES = {
  DELETE_WORD_FORWARD: 'dw',
  DELETE_WORD_BACKWARD: 'db',
  CHANGE_WORD_FORWARD: 'cw',
  DELETE_CHAR: 'x',
  DELETE_LINE: 'dd',
  CHANGE_LINE: 'cc',
  DELETE_TO_EOL: 'D',
  CHANGE_TO_EOL: 'C',
} as const;

export function useVim(buffer: TextBuffer, onSubmit?: (value: string) => void) {
  const [state, dispatch] = useReducer(vimReducer, initialVimState);
  const { isVimModeEnabled } = useVimMode();

  const handleNormalModeKey = useCallback((input: string, key: Key) => {
  // 处理数字前缀 (count)
  if (DIGIT_1_TO_9.test(input)) {
  dispatch({ type: 'INCREMENT_COUNT', digit: parseInt(input) });
  return;
  }

  // 处理操作符 (d, c, g)
  switch (input) {
  case 'd': dispatch({ type: 'SET_PENDING_OPERATOR', operator: 'd' }); break;
  case 'c': dispatch({ type: 'SET_PENDING_OPERATOR', operator: 'c' }); break;
  case 'i': dispatch({ type: 'SET_MODE', mode: 'INSERT' }); break;
  case 'h': buffer.moveCursorLeft(count); break;
  case 'l': buffer.moveCursorRight(count); break;
  case 'w': buffer.moveWordForward(); break;
  case 'b': buffer.moveWordBackward(); break;
  // ...更多 Vim 命令
  }
  }, [buffer, state.count]);

  return { mode: state.mode, handleKey, ... };
}`;

 const useSelectionListCode = `// useSelectionList.ts - 列表选择 Hook
export interface SelectionListItem<T> {
  key: string;
  value: T;
  disabled?: boolean;
}

export interface UseSelectionListOptions<T> {
  items: Array<SelectionListItem<T>>;
  initialIndex?: number;
  onSelect: (value: T) => void;
  onHighlight?: (value: T) => void;
  isFocused?: boolean;
  showNumbers?: boolean; // 支持数字快捷键
}

export function useSelectionList<T>({
  items,
  initialIndex = 0,
  onSelect,
  onHighlight,
  isFocused = true,
  showNumbers = false,
}: UseSelectionListOptions<T>): UseSelectionListResult {
  const [state, dispatch] = useReducer(reducer, {
  activeIndex: initialIndex,
  pendingSelect: false,
  });

  // 上下导航，跳过 disabled 项
  const findNextValidIndex = (currentIndex, direction, items) => {
  const step = direction === 'down' ? 1 : -1;
  let nextIndex = currentIndex;
  for (let i = 0; i < items.length; i++) {
  nextIndex = (nextIndex + step + items.length) % items.length;
  if (!items[nextIndex]?.disabled) return nextIndex;
  }
  return currentIndex;
  };

  useKeypress(handleKeypress, { isActive: isFocused });

  return { activeIndex: state.activeIndex, setActiveIndex };
}`;

 const hooksCatalog = [
 {
 category: '输入处理',
 icon: '⌨️',
 bgClass: ' bg-elevated/10',
 textClass: 'text-heading',
 hooks: [
 { name: 'useKeypress', desc: '键盘事件监听，支持订阅/取消订阅模式' },
 { name: 'useKeypressContext', desc: '键盘事件 Context Provider' },
 { name: 'useVim', desc: 'Vim 模式支持，NORMAL/INSERT 模式切换' },
 { name: 'useSelectionList', desc: '列表选择，支持上下导航和数字快捷键' },
 { name: 'useBracketedPaste', desc: '终端括号粘贴模式检测' },
 { name: 'useKittyKeyboardProtocol', desc: 'Kitty 键盘协议支持' },
 { name: 'useTextBuffer', desc: '文本缓冲区管理，多行编辑' },
 ],
 },
 {
 category: '补全系统',
 icon: '✨',
 bgClass: ' bg-elevated/10',
 textClass: 'text-heading',
 hooks: [
 { name: 'useCompletion', desc: '补全状态管理（建议列表、导航）' },
 { name: 'useSlashCompletion', desc: '斜杠命令补全 (/help, /clear)' },
 { name: 'useAtCompletion', desc: '@引用补全 (@file, @url)' },
 { name: 'useCommandCompletion', desc: '内置命令补全' },
 { name: 'usePromptCompletion', desc: '提示词补全' },
 { name: 'useReverseSearchCompletion', desc: 'Ctrl+R 反向搜索历史' },
 ],
 },
 {
 category: '历史记录',
 icon: '📜',
 bgClass: 'bg-elevated',
 textClass: 'text-heading',
 hooks: [
 { name: 'useInputHistory', desc: '输入历史记录管理' },
 { name: 'useInputHistoryStore', desc: '历史记录持久化存储' },
 { name: 'useHistoryManager', desc: '历史管理器（useHistory）' },
 { name: 'useShellHistory', desc: 'Shell 命令历史' },
 ],
 },
 {
 category: '命令与对话框',
 icon: '💬',
 bgClass: ' bg-elevated/10',
 textClass: 'text-heading',
 hooks: [
 { name: 'useSettingsCommand', desc: '/settings 命令处理' },
 { name: 'useModelCommand', desc: '/model 命令处理' },
 { name: 'useThemeCommand', desc: '/theme 命令处理' },
 { name: 'useSubagentCreateDialog', desc: '创建子代理对话框' },
 { name: 'useAgentsManagerDialog', desc: '代理管理对话框' },
 { name: 'useDialogClose', desc: '对话框关闭处理（Esc/外部点击）' },
 { name: 'useQuitConfirmation', desc: '退出确认对话框' },
 ],
 },
 {
 category: '系统集成',
 icon: '🔌',
 bgClass: ' bg-elevated/10',
 textClass: 'text-heading',
 hooks: [
 { name: 'useTerminalSize', desc: '终端尺寸检测 (columns, rows)' },
 { name: 'useGitBranchName', desc: 'Git 分支名获取' },
 { name: 'useIdeTrustListener', desc: 'IDE 信任状态监听' },
 { name: 'useFolderTrust', desc: '文件夹信任状态管理' },
 { name: 'useLaunchEditor', desc: '启动外部编辑器' },
 { name: 'useEditorSettings', desc: '编辑器设置管理' },
 { name: 'useExtensionUpdates', desc: '扩展更新检测' },
 ],
 },
 {
 category: '认证与配额',
 icon: '🔐',
 bgClass: ' bg-elevated/10',
 textClass: 'text-heading',
 hooks: [
 { name: 'useAuth', desc: '认证状态管理' },
 { name: 'useQuotaAndFallback', desc: '配额检测与回退处理' },
 ],
 },
 {
 category: 'UI 状态',
 icon: '🎨',
 bgClass: 'bg-elevated',
 textClass: 'text-heading',
 hooks: [
 { name: 'useFocus', desc: '焦点管理' },
 { name: 'useLoadingIndicator', desc: '加载指示器状态' },
 { name: 'usePhraseCycler', desc: '短语循环动画' },
 { name: 'useAutoAcceptIndicator', desc: '自动接受倒计时指示器' },
 { name: 'useTimer', desc: '计时器 Hook' },
 { name: 'useStateAndRef', desc: '同步 state 和 ref' },
 { name: 'useMemoryMonitor', desc: '内存使用监控' },
 ],
 },
 {
 category: '工具调度',
 icon: '⚙️',
 bgClass: ' bg-elevated/10',
 textClass: 'text-heading',
 hooks: [
 { name: 'useReactToolScheduler', desc: 'React 组件中的工具调度' },
 { name: 'useMessageQueue', desc: '消息队列管理' },
 { name: 'useConsoleMessages', desc: '控制台消息收集' },
 { name: 'useGeminiStream', desc: 'Gemini 流式响应处理' },
 { name: 'useVisionAutoSwitch', desc: '视觉模型自动切换' },
 ],
 },
 ];

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-3xl font-bold text-heading mb-2">React Hooks 概览</h1>
 <p className="text-body text-lg">
 CLI 的 50+ 个自定义 React Hooks，涵盖输入、补全、命令、系统集成等核心功能
 </p>
 </div>

 <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

 <Layer title="Hook 依赖关系" defaultOpen={true}>
 <HighlightBox title="核心 Hook 依赖图" color="blue" className="mb-6">
 <MermaidDiagram chart={hooksDependencyChart} />
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">核心设计模式</div>
 <ul className="text-sm text-body space-y-1">
 <li><strong>Context 驱动</strong>：KeypressContext, VimModeContext</li>
 <li><strong>订阅模式</strong>：subscribe/unsubscribe 模式</li>
 <li><strong>useReducer</strong>：复杂状态管理</li>
 <li><strong>组合模式</strong>：小 Hook 组合成大功能</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">Hook 组织结构</div>
 <ul className="text-sm text-body space-y-1">
 <li><code>ui/hooks/</code> - 主要 Hook 目录</li>
 <li><code>ui/contexts/</code> - Context Provider</li>
 <li><code>ui/auth/</code> - 认证相关 Hook</li>
 <li>每个 Hook 配套 .test.ts 测试文件</li>
 </ul>
 </div>
 </div>
 </Layer>

 <Layer title="Hook 分类目录" defaultOpen={true}>
 <div className="space-y-6">
 {hooksCatalog.map((cat) => (
 <div key={cat.category} className="bg-surface rounded-lg border border-edge overflow-hidden">
 <div className={`px-4 py-3 ${cat.bgClass} border- border-edge`}>
 <h3 className={`font-bold ${cat.textClass}`}>
 {cat.icon} {cat.category}
 </h3>
 </div>
 <div className="p-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {cat.hooks.map((hook) => (
 <div key={hook.name} className="flex items-start gap-2">
 <code className="text-xs px-2 py-1 bg-base rounded text-heading whitespace-nowrap">
 {hook.name}
 </code>
 <span className="text-xs text-dim">{hook.desc}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 ))}
 </div>
 </Layer>

 <Layer title="核心 Hook 详解" defaultOpen={false}>
 <div className="space-y-6">
 <div>
 <h4 className="text-lg font-semibold text-heading mb-3">useKeypress - 键盘事件监听</h4>
 <CodeBlock code={useKeypressCode} language="typescript" title="useKeypress.ts" />
 </div>

 <div>
 <h4 className="text-lg font-semibold text-heading mb-3">useCompletion - 补全状态管理</h4>
 <CodeBlock code={useCompletionCode} language="typescript" title="useCompletion.ts" />
 </div>
 </div>
 </Layer>

 <Layer title="Vim Hook 详解" defaultOpen={false}>
 <CodeBlock code={useVimCode} language="typescript" title="vim.ts" />

 <div className="mt-4 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-dim">命令</th>
 <th className="text-left py-2 text-dim">操作</th>
 <th className="text-left py-2 text-dim">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/30">
 <td className="py-2"><code>i</code></td>
 <td>进入 INSERT</td>
 <td>切换到插入模式</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>Esc</code></td>
 <td>进入 NORMAL</td>
 <td>切换到普通模式</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>h/l</code></td>
 <td>左/右移动</td>
 <td>支持数字前缀 (3l = 右移3格)</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>w/b</code></td>
 <td>词移动</td>
 <td>向前/向后移动一个词</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>dw/db</code></td>
 <td>删除词</td>
 <td>向前/向后删除词</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>dd</code></td>
 <td>删除行</td>
 <td>删除整行内容</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>cc</code></td>
 <td>修改行</td>
 <td>删除行并进入 INSERT</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>

 <Layer title="列表选择 Hook" defaultOpen={false}>
 <CodeBlock code={useSelectionListCode} language="typescript" title="useSelectionList.ts" />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="使用场景" color="green">
 <ul className="text-sm text-body space-y-1">
 <li>命令选择菜单</li>
 <li>文件/目录选择器</li>
 <li>模型切换对话框</li>
 <li>补全建议列表</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="特性" color="blue">
 <ul className="text-sm text-body space-y-1">
 <li>支持 disabled 项跳过</li>
 <li>循环导航 (wrap-around)</li>
 <li>数字快捷键选择</li>
 <li>onHighlight 预览回调</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 <Layer title="最佳实践" defaultOpen={false}>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="Hook 设计原则" color="blue">
 <ul className="text-sm text-body space-y-2">
 <li><strong>单一职责</strong>：每个 Hook 只做一件事</li>
 <li><strong>可组合性</strong>：小 Hook 组合成复杂功能</li>
 <li><strong>isActive 模式</strong>：支持条件激活</li>
 <li><strong>useCallback</strong>：避免不必要的重渲染</li>
 <li><strong>useReducer</strong>：复杂状态用 reducer</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="常见模式" color="green">
 <ul className="text-sm text-body space-y-2">
 <li><strong>订阅/取消订阅</strong>：useKeypress, useMessageQueue</li>
 <li><strong>状态 + Setter</strong>：useCompletion 返回完整状态</li>
 <li><strong>Context 注入</strong>：通过 Provider 共享状态</li>
 <li><strong>Ref 同步</strong>：useStateAndRef 同步值</li>
 </ul>
 </HighlightBox>
 </div>

 <div className="mt-4 bg-base p-4 rounded-lg">
 <h4 className="text-heading font-bold mb-2">Hook 测试建议</h4>
 <ul className="text-sm text-body space-y-1">
 <li>每个 Hook 配套 <code>.test.ts</code> 文件</li>
 <li>使用 <code>@testing-library/react-hooks</code></li>
 <li>测试状态变化和回调触发</li>
 <li>模拟键盘事件测试 useKeypress</li>
 </ul>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
