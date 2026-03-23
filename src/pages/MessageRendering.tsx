import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
 { id: 'ui-components', label: 'UI 组件库', description: 'Ink 组件' },
 { id: 'tool-system', label: 'Tool 系统', description: '工具执行' },
 { id: 'ui-state-management', label: 'UI 状态管理', description: '状态流转' },
 { id: 'output-formatter', label: '输出格式化', description: 'Markdown 渲染' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-xl border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">💬</span>
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
 基于 Ink 的消息渲染系统，支持多种消息类型（用户、模型、工具、错误等），包含 Markdown 渲染、语法高亮和 Sticky Header
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">15+</div>
 <div className="text-xs text-dim">消息类型</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">Ink</div>
 <div className="text-xs text-dim">React 终端</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-amber-500">MD</div>
 <div className="text-xs text-dim">Markdown</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">Sticky</div>
 <div className="text-xs text-dim">粘性头部</div>
 </div>
 </div>

 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">消息类型</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 用户消息
 </span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 模型响应
 </span>
 <span className="px-3 py-1.5 bg-amber-500/20 text-amber-500 rounded-lg border border-amber-500/30">
 工具调用
 </span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 确认对话框
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">📍 源码位置:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/cli/src/ui/components/messages/
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function MessageRendering() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const messageHierarchyChart = `flowchart TD
 subgraph HistoryItems["HistoryItem 类型"]
 USER[HistoryItemUser]
 GEMINI[HistoryItemGemini]
 TOOL[HistoryItemToolGroup]
 INFO[HistoryItemInfo]
 ERROR[HistoryItemError]
 WARNING[HistoryItemWarning]
 ABOUT[HistoryItemAbout]
 HELP[HistoryItemHelp]
 STATS[HistoryItemStats]
 end

 subgraph Components["消息组件"]
 USER_MSG[UserMessage]
 GEMINI_MSG[GeminiMessage]
 TOOL_GROUP[ToolGroupMessage]
 TOOL_MSG[ToolMessage]
 SHELL_MSG[ShellToolMessage]
 CONFIRM_MSG[ToolConfirmationMessage]
 INFO_MSG[InfoMessage]
 ERROR_MSG[ErrorMessage]
 WARNING_MSG[WarningMessage]
 end

 subgraph Shared["共享组件"]
 MD[MarkdownDisplay]
 STICKY[StickyHeader]
 RESULT[ToolResultDisplay]
 DIFF[DiffRenderer]
 end

 USER --> USER_MSG
 GEMINI --> GEMINI_MSG
 TOOL --> TOOL_GROUP
 TOOL_GROUP --> TOOL_MSG
 TOOL_GROUP --> SHELL_MSG
 TOOL_GROUP --> CONFIRM_MSG
 INFO --> INFO_MSG
 ERROR --> ERROR_MSG
 WARNING --> WARNING_MSG

 GEMINI_MSG --> MD
 TOOL_MSG --> STICKY
 TOOL_MSG --> RESULT
 RESULT --> MD
 RESULT --> DIFF

 style HistoryItems stroke:#00d4ff
 style Components stroke:#00ff88
 style Shared stroke:#a855f7`;

 const toolStatusFlow = `stateDiagram-v2
 [*] --> Pending: 工具调用请求
 Pending --> Confirming: 需要确认
 Pending --> Executing: 自动执行
 Confirming --> Executing: 用户批准
 Confirming --> Canceled: 用户拒绝
 Executing --> Success: 执行成功
 Executing --> Error: 执行失败
 Success --> [*]
 Error --> [*]
 Canceled --> [*]`;

 const historyItemTypesCode = `// HistoryItem 类型定义
export type HistoryItemUser = HistoryItemBase & {
 type: 'user';
 text: string;
};

export type HistoryItemGemini = HistoryItemBase & {
 type: 'gemini';
 text: string;
};

export type HistoryItemInfo = HistoryItemBase & {
 type: 'info';
 text: string;
 icon?: string;
 color?: string;
};

export type HistoryItemError = HistoryItemBase & {
 type: 'error';
 text: string;
};

export type HistoryItemWarning = HistoryItemBase & {
 type: 'warning';
 text: string;
};

export type HistoryItemToolGroup = HistoryItemBase & {
 type: 'tool_group';
 groupId: number;
 toolCalls: IndividualToolCallDisplay[];
};

export type HistoryItemAbout = HistoryItemBase & {
 type: 'about';
 cliVersion: string;
 osVersion: string;
 sandboxEnv: string;
 modelVersion: string;
 selectedAuthType: string;
 gcpProject: string;
 ideClient: string;
 userEmail?: string;
};

// 所有消息类型的联合类型
export type HistoryItem =
 | HistoryItemUser
 | HistoryItemGemini
 | HistoryItemInfo
 | HistoryItemError
 | HistoryItemWarning
 | HistoryItemToolGroup
 | HistoryItemAbout
 | HistoryItemHelp
 | HistoryItemStats
 // ... 更多类型`;

 const geminiMessageCode = `// GeminiMessage - 模型响应渲染
export const GeminiMessage: React.FC<GeminiMessageProps> = ({
 text,
 isPending,
 availableTerminalHeight,
 terminalWidth,
}) => {
 const { renderMarkdown } = useUIState();
 const prefix = '✦ '; // 模型响应前缀图标
 const prefixWidth = prefix.length;

 const isAlternateBuffer = useAlternateBuffer();

 return (
 <Box flexDirection="row">
 {/* 前缀图标 */}
 <Box width={prefixWidth}>
 <Text color={theme.text.accent} aria-label={SCREEN_READER_MODEL_PREFIX}>
 {prefix}
 </Text>
 </Box>
 {/* 内容区域 */}
 <Box flexGrow={1} flexDirection="column">
 <MarkdownDisplay
 text={text}
 isPending={isPending}
 availableTerminalHeight={
 isAlternateBuffer ? undefined : availableTerminalHeight
 }
 terminalWidth={terminalWidth}
 renderMarkdown={renderMarkdown}
 />
 </Box>
 </Box>
 );
};`;

 const toolMessageCode = `// ToolMessage - 工具调用渲染
export interface ToolMessageProps extends IndividualToolCallDisplay {
 availableTerminalHeight?: number;
 terminalWidth: number;
 emphasis?: TextEmphasis;
 renderOutputAsMarkdown?: boolean;
 isFirst: boolean;
 borderColor: string;
 borderDimColor: boolean;
 activeShellPtyId?: number | null;
 embeddedShellFocused?: boolean;
 ptyId?: number;
 config?: Config;
}

export const ToolMessage: React.FC<ToolMessageProps> = ({
 name,
 description,
 resultDisplay,
 status,
 availableTerminalHeight,
 terminalWidth,
 emphasis = 'medium',
 renderOutputAsMarkdown = true,
 isFirst,
 borderColor,
 borderDimColor,
 activeShellPtyId,
 embeddedShellFocused,
 ptyId,
 config,
}) => {
 const isThisShellFocused =
 (name === SHELL_COMMAND_NAME || name === 'Shell') &&
 status === ToolCallStatus.Executing &&
 ptyId === activeShellPtyId &&
 embeddedShellFocused;

 return (
 <Box flexDirection="column" width={terminalWidth}>
 {/* Sticky Header - 工具状态和名称 */}
 <StickyHeader
 width={terminalWidth}
 isFirst={isFirst}
 borderColor={borderColor}
 borderDimColor={borderDimColor}
 >
 <ToolStatusIndicator status={status} name={name} />
 <ToolInfo
 name={name}
 status={status}
 description={description}
 emphasis={emphasis}
 />
 {shouldShowFocusHint && (
 <Box marginLeft={1}>
 <Text color={theme.text.accent}>
 {isThisShellFocused ? '(Focused)' : '(ctrl+f to focus)'}
 </Text>
 </Box>
 )}
 </StickyHeader>

 {/* 工具输出内容 */}
 <Box
 width={terminalWidth}
 borderStyle="round"
 borderColor={borderColor}
 borderTop={false}
 borderBottom={false}
 paddingX={1}
 >
 <ToolResultDisplay
 resultDisplay={resultDisplay}
 availableTerminalHeight={availableTerminalHeight}
 terminalWidth={terminalWidth}
 renderOutputAsMarkdown={renderOutputAsMarkdown}
 />
 </Box>
 </Box>
 );
};`;

 const toolGroupMessageCode = `// ToolGroupMessage - 工具组渲染
export const ToolGroupMessage: React.FC<ToolGroupMessageProps> = ({
 toolCalls,
 availableTerminalHeight,
 terminalWidth,
 isFocused = true,
 activeShellPtyId,
 embeddedShellFocused,
}) => {
 const config = useConfig();

 // 检查是否有待处理的工具
 const hasPending = !toolCalls.every(
 (t) => t.status === ToolCallStatus.Success,
 );

 // 是否是 Shell 命令
 const isShellCommand = toolCalls.some(
 (t) => t.name === SHELL_COMMAND_NAME || t.name === SHELL_NAME,
 );

 // 动态边框颜色
 const borderColor =
 (isShellCommand && hasPending) || isEmbeddedShellFocused
 ? theme.ui.symbol // Shell 执行中: 高亮
 : hasPending
 ? theme.status.warning // 待确认: 警告色
 : theme.border.default; // 已完成: 默认

 // 找到第一个需要确认的工具
 const toolAwaitingApproval = useMemo(
 () => toolCalls.find((tc) => tc.status === ToolCallStatus.Confirming),
 [toolCalls],
 );

 return (
 <Box flexDirection="column" width={terminalWidth} marginBottom={1}>
 {toolCalls.map((tool, index) => (
 <React.Fragment key={tool.callId}>
 {/* 确认对话框 */}
 {toolAwaitingApproval?.callId === tool.callId && (
 <ToolConfirmationMessage
 tool={tool}
 terminalWidth={terminalWidth}
 />
 )}

 {/* 工具消息 */}
 {tool.name === SHELL_TOOL_NAME ? (
 <ShellToolMessage {...tool} ... />
 ) : (
 <ToolMessage
 {...tool}
 isFirst={index === 0}
 borderColor={borderColor}
 ...
 />
 )}
 </React.Fragment>
 ))}
 </Box>
 );
};`;

 const toolCallStatusCode = `// 工具调用状态枚举
export enum ToolCallStatus {
 Pending = 'Pending', // 等待执行
 Canceled = 'Canceled', // 用户取消
 Confirming = 'Confirming', // 等待确认
 Executing = 'Executing', // 执行中
 Success = 'Success', // 成功
 Error = 'Error', // 失败
}

// 工具调用显示信息
export interface IndividualToolCallDisplay {
 callId: string; // 调用 ID
 name: string; // 工具名称
 description: string; // 描述
 resultDisplay: ToolResultDisplay | undefined; // 结果显示
 status: ToolCallStatus; // 状态
 confirmationDetails: ToolCallConfirmationDetails | undefined;
 renderOutputAsMarkdown?: boolean;
 ptyId?: number; // PTY ID (Shell)
 outputFile?: string; // 输出文件
}`;

 const messageTypesTableData = [
 { type: 'user', component: 'UserMessage', icon: '👤', description: '用户输入消息' },
 { type: 'gemini', component: 'GeminiMessage', icon: '✦', description: '模型响应，支持 Markdown' },
 { type: 'tool_group', component: 'ToolGroupMessage', icon: '🔧', description: '工具调用组' },
 { type: 'info', component: 'InfoMessage', icon: 'ℹ️', description: '信息提示' },
 { type: 'error', component: 'ErrorMessage', icon: '❌', description: '错误消息' },
 { type: 'warning', component: 'WarningMessage', icon: '⚠️', description: '警告消息' },
 { type: 'about', component: 'AboutBox', icon: '📋', description: '关于信息' },
 { type: 'help', component: 'HelpDisplay', icon: '❓', description: '帮助信息' },
 { type: 'stats', component: 'StatsDisplay', icon: '📊', description: '统计信息' },
 { type: 'compression', component: 'CompressionMessage', icon: '📦', description: '压缩状态' },
 ];

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-3xl font-bold text-heading mb-2">消息渲染系统</h1>
 <p className="text-body text-lg">
 基于 Ink 的终端消息渲染系统，支持多种消息类型、Markdown 渲染和工具状态显示
 </p>
 </div>

 <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

 <Layer title="消息组件层次" icon="🏗️" defaultOpen={true}>
 <HighlightBox title="消息渲染架构" color="blue" className="mb-6">
 <MermaidDiagram chart={messageHierarchyChart} />
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">📝 HistoryItem</div>
 <ul className="text-sm text-body space-y-1">
 <li>• 消息数据模型</li>
 <li>• 类型标识 + 内容</li>
 <li>• 存储在历史数组中</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">🧩 消息组件</div>
 <ul className="text-sm text-body space-y-1">
 <li>• React/Ink 组件</li>
 <li>• 类型 → 组件映射</li>
 <li>• 独立渲染逻辑</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">🔧 共享组件</div>
 <ul className="text-sm text-body space-y-1">
 <li>• MarkdownDisplay</li>
 <li>• StickyHeader</li>
 <li>• DiffRenderer</li>
 </ul>
 </div>
 </div>
 </Layer>

 <Layer title="消息类型" icon="📋" defaultOpen={true}>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-dim">类型</th>
 <th className="text-left py-2 text-dim">组件</th>
 <th className="text-left py-2 text-dim">图标</th>
 <th className="text-left py-2 text-dim">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 {messageTypesTableData.map((row, idx) => (
 <tr key={idx} className="border- border-edge/30">
 <td className="py-2"><code className="text-heading">{row.type}</code></td>
 <td className="py-2"><code>{row.component}</code></td>
 <td className="py-2">{row.icon}</td>
 <td className="py-2">{row.description}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Layer>

 <Layer title="工具状态流转" icon="🔄" defaultOpen={true}>
 <MermaidDiagram chart={toolStatusFlow} />

 <div className="mt-4">
 <CodeBlock code={toolCallStatusCode} language="typescript" title="ToolCallStatus 枚举" />
 </div>
 </Layer>

 <Layer title="HistoryItem 类型" icon="📦" defaultOpen={false}>
 <CodeBlock code={historyItemTypesCode} language="typescript" title="HistoryItem 类型定义" />
 </Layer>

 <Layer title="GeminiMessage" icon="✦" defaultOpen={false}>
 <CodeBlock code={geminiMessageCode} language="typescript" title="GeminiMessage 组件" />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="渲染特点" color="blue">
 <ul className="text-sm text-body space-y-1">
 <li>• <code>✦</code> 前缀图标</li>
 <li>• Markdown 渲染支持</li>
 <li>• 流式输出（isPending）</li>
 <li>• 终端高度自适应</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="无障碍支持" color="green">
 <ul className="text-sm text-body space-y-1">
 <li>• aria-label 屏幕阅读器</li>
 <li>• 语义化文本前缀</li>
 <li>• 可配置渲染模式</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 <Layer title="ToolMessage" icon="🔧" defaultOpen={false}>
 <CodeBlock code={toolMessageCode} language="typescript" title="ToolMessage 组件" />

 <div className="mt-4 bg-base p-4 rounded-lg">
 <h4 className="text-heading font-bold mb-2">Sticky Header</h4>
 <p className="text-sm text-body">
 工具消息使用 StickyHeader 组件，在终端滚动时保持头部可见。
 头部包含状态指示器、工具名称和描述，以及可选的焦点提示。
 </p>
 </div>
 </Layer>

 <Layer title="ToolGroupMessage" icon="📦" defaultOpen={false}>
 <CodeBlock code={toolGroupMessageCode} language="typescript" title="ToolGroupMessage 组件" />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="边框颜色逻辑" color="orange">
 <ul className="text-sm text-body space-y-1">
 <li>• <strong>高亮</strong>：Shell 执行中或聚焦</li>
 <li>• <strong>警告</strong>：有待确认的工具</li>
 <li>• <strong>默认</strong>：全部完成</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="确认处理" color="blue">
 <ul className="text-sm text-body space-y-1">
 <li>• 只显示第一个待确认工具</li>
 <li>• 确认后自动移到下一个</li>
 <li>• 支持批量确认</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 <Layer title="渲染优化" icon="⚡" defaultOpen={false}>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <h4 className="text-heading font-bold mb-2">终端高度分配</h4>
 <ul className="text-sm text-body space-y-1">
 <li>• 计算有结果的工具数量</li>
 <li>• 平均分配可用高度</li>
 <li>• 单行工具不占用高度</li>
 <li>• 最小高度保证</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <h4 className="text-heading font-bold mb-2">Ink 渲染保护</h4>
 <ul className="text-sm text-body space-y-1">
 <li>• 固定宽度约束</li>
 <li>• 防止边框渲染错误</li>
 <li>• 状态变化优化</li>
 <li>• 避免多行边框问题</li>
 </ul>
 </div>
 </div>
 </Layer>

 <Layer title="使用示例" icon="💡" defaultOpen={false}>
 <CodeBlock
 code={`// 在 DetailedMessagesDisplay 中渲染消息
function renderHistoryItem(item: HistoryItem): ReactNode {
 switch (item.type) {
 case 'user':
 return <UserMessage text={item.text} />;

 case 'gemini':
 return (
 <GeminiMessage
 text={item.text}
 isPending={item.isPending}
 terminalWidth={terminalWidth}
 />
 );

 case 'tool_group':
 return (
 <ToolGroupMessage
 groupId={item.groupId}
 toolCalls={item.toolCalls}
 terminalWidth={terminalWidth}
 />
 );

 case 'info':
 return <InfoMessage text={item.text} icon={item.icon} />;

 case 'error':
 return <ErrorMessage text={item.text} />;

 case 'warning':
 return <WarningMessage text={item.text} />;

 default:
 return null;
 }
}`}
 language="typescript"
 title="消息渲染分发"
 />
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
