import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';

export function UIRenderingLayer() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">UI 渲染层 (React + Ink)</h2>

      {/* Ink 介绍 */}
      <Layer title="什么是 Ink？" icon="🖊️">
        <HighlightBox title="React for CLI" icon="⚛️" variant="blue">
          <p className="mb-2">
            <strong>Ink</strong> 是一个让你可以用 React 组件来构建命令行界面的库。
            它使用 Yoga 布局引擎（和 React Native 相同）来实现 Flexbox 布局。
          </p>
          <p>
            这意味着你可以用熟悉的 React 模式（hooks、状态、组件）来构建复杂的终端 UI。
          </p>
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">⚛️</div>
            <h4 className="text-cyan-400 font-bold">React 组件</h4>
            <p className="text-sm text-gray-400">使用 JSX 和 hooks</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">📐</div>
            <h4 className="text-cyan-400 font-bold">Flexbox 布局</h4>
            <p className="text-sm text-gray-400">熟悉的 CSS 布局</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">🎨</div>
            <h4 className="text-cyan-400 font-bold">丰富的样式</h4>
            <p className="text-sm text-gray-400">颜色、边框、文本样式</p>
          </div>
        </div>
      </Layer>

      {/* 组件树 */}
      <Layer title="UI 组件树结构" icon="🌳">
        <CodeBlock
          title="packages/cli/src/ui/"
          code={`App
└── StreamingContext.Provider
    └── DefaultAppLayout
        └── AppContainer (主组件)
            ├── SettingsContext.Provider
            ├── KeypressProvider
            ├── SessionStatsProvider
            ├── VimModeProvider
            │
            └── 布局结构:
                │
                ├── Header
                │   ├── 版本信息
                │   ├── 模型名称
                │   └── 状态指示
                │
                ├── MainContent
                │   ├── Static (历史消息 - 已完成)
                │   │   └── HistoryItemDisplay[]
                │   │       ├── UserMessage
                │   │       ├── GeminiMessage
                │   │       ├── ToolGroupMessage
                │   │       └── SystemMessage
                │   │
                │   └── PendingItem (当前流式内容)
                │       └── HistoryItemDisplay (pending=true)
                │
                ├── InputPrompt
                │   └── TextInput (支持 VIM 模式)
                │
                ├── Sidebar (可选)
                │   ├── StatsDisplay
                │   ├── ToolsList
                │   └── HelpPanel
                │
                └── Dialogs
                    ├── ShellConfirmationDialog
                    ├── ModelSwitchDialog
                    ├── LoopDetectionConfirmation
                    └── ErrorDialog`}
        />
      </Layer>

      {/* 核心 Hooks */}
      <Layer title="核心 Hooks" icon="🪝">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-cyan-400/30">
            <h4 className="text-cyan-400 font-bold mb-2">useGeminiStream</h4>
            <p className="text-sm text-gray-400 mb-2">核心 AI 交互 hook</p>
            <CodeBlock
              code={`const {
    sendMessage,      // 发送消息
    isStreaming,      // 是否正在流式输出
    pendingItem,      // 当前待处理项
    abort,            // 中止当前请求
} = useGeminiStream();`}
            />
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-purple-400/30">
            <h4 className="text-purple-400 font-bold mb-2">useHistory</h4>
            <p className="text-sm text-gray-400 mb-2">消息历史管理</p>
            <CodeBlock
              code={`const {
    items,            // 历史项数组
    addItem,          // 添加项
    updateItem,       // 更新项
    clearHistory,     // 清空历史
} = useHistory();`}
            />
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-green-400/30">
            <h4 className="text-green-400 font-bold mb-2">useReactToolScheduler</h4>
            <p className="text-sm text-gray-400 mb-2">工具执行调度</p>
            <CodeBlock
              code={`const {
    toolCalls,        // 当前工具调用
    approve,          // 批准执行
    reject,           // 拒绝执行
    isExecuting,      // 是否执行中
} = useReactToolScheduler();`}
            />
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-orange-400/30">
            <h4 className="text-orange-400 font-bold mb-2">useKeypress</h4>
            <p className="text-sm text-gray-400 mb-2">键盘输入处理</p>
            <CodeBlock
              code={`useKeypress((key, ctrl, meta) => {
    if (ctrl && key === 'c') {
        handleAbort();
    }
    if (key === 'escape') {
        handleCancel();
    }
});`}
            />
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-pink-400/30">
            <h4 className="text-pink-400 font-bold mb-2">useVim</h4>
            <p className="text-sm text-gray-400 mb-2">VIM 模式支持</p>
            <CodeBlock
              code={`const {
    mode,             // normal | insert | visual
    processKey,       // 处理按键
    isEnabled,        // VIM 模式开关
} = useVim();`}
            />
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-blue-400/30">
            <h4 className="text-blue-400 font-bold mb-2">useModelCommand</h4>
            <p className="text-sm text-gray-400 mb-2">模型切换</p>
            <CodeBlock
              code={`const {
    currentModel,     // 当前模型
    switchModel,      // 切换模型
    availableModels,  // 可用模型列表
} = useModelCommand();`}
            />
          </div>
        </div>
      </Layer>

      {/* HistoryItemDisplay */}
      <Layer title="HistoryItemDisplay 消息渲染" icon="💬">
        <CodeBlock
          title="消息类型渲染"
          code={`function HistoryItemDisplay({ item, pending }: Props) {
    switch (item.type) {
        case 'user':
            return <UserMessage content={item.content} />;

        case 'gemini':
            return (
                <GeminiMessage
                    content={item.content}
                    thinking={item.thinking}
                    streaming={pending}
                />
            );

        case 'tool_group':
            return (
                <ToolGroupMessage
                    tools={item.tools}
                    results={item.results}
                />
            );

        case 'system':
            return <SystemMessage message={item.message} />;

        case 'error':
            return <ErrorMessage error={item.error} />;

        default:
            return null;
    }
}`}
        />
      </Layer>

      {/* Static vs Pending */}
      <Layer title="Static vs Pending 渲染" icon="📊">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">Static (已完成)</h4>
            <p className="text-sm text-gray-300 mb-3">
              已完成的消息，不会重新渲染
            </p>
            <CodeBlock
              code={`<Static items={history.items}>
    {(item) => (
        <HistoryItemDisplay
            key={item.id}
            item={item}
            pending={false}
        />
    )}
</Static>`}
            />
            <p className="text-xs text-gray-400 mt-2">
              Ink 的 Static 组件优化了渲染性能，只渲染一次
            </p>
          </div>

          <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">Pending (进行中)</h4>
            <p className="text-sm text-gray-300 mb-3">
              当前正在流式输出的内容，实时更新
            </p>
            <CodeBlock
              code={`{pendingItem && (
    <Box>
        <HistoryItemDisplay
            item={pendingItem}
            pending={true}  // 实时更新
        />
        <Spinner />
    </Box>
)}`}
            />
            <p className="text-xs text-gray-400 mt-2">
              每次新的 chunk 到达时重新渲染
            </p>
          </div>
        </div>
      </Layer>

      {/* InputPrompt */}
      <Layer title="InputPrompt 输入组件" icon="⌨️">
        <CodeBlock
          title="InputPrompt 组件"
          code={`function InputPrompt({ onSubmit, disabled }: Props) {
    const [value, setValue] = useState('');
    const { mode: vimMode } = useVim();

    const handleSubmit = (text: string) => {
        if (text.trim() === '') return;

        // 检查斜杠命令
        if (text.startsWith('/')) {
            handleSlashCommand(text);
            return;
        }

        // 检查 @ 命令
        const processed = processAtCommands(text);

        // 提交消息
        onSubmit(processed);
        setValue('');
    };

    return (
        <Box borderStyle="round" borderColor="cyan">
            {/* VIM 模式指示 */}
            {vimMode !== 'insert' && (
                <Text color="yellow">[{vimMode.toUpperCase()}]</Text>
            )}

            {/* 提示符 */}
            <Text color="cyan">{'>'} </Text>

            {/* 输入框 */}
            <TextInput
                value={value}
                onChange={setValue}
                onSubmit={handleSubmit}
                focus={!disabled}
            />
        </Box>
    );
}`}
        />
      </Layer>

      {/* 斜杠命令 */}
      <Layer title="斜杠命令处理" icon="/">
        <CodeBlock
          title="内置斜杠命令"
          code={`const SLASH_COMMANDS = {
    '/help':     () => showHelp(),
    '/clear':    () => clearHistory(),
    '/exit':     () => exit(),
    '/model':    (arg) => switchModel(arg),
    '/compact':  () => toggleCompactMode(),
    '/vim':      () => toggleVimMode(),
    '/memory':   () => showMemory(),
    '/cost':     () => showCostStats(),
    '/bug':      () => reportBug(),
    '/mcp':      () => showMCPStatus(),
};

function handleSlashCommand(input: string) {
    const [cmd, ...args] = input.split(' ');

    if (cmd in SLASH_COMMANDS) {
        SLASH_COMMANDS[cmd](args.join(' '));
    } else {
        showError(\`Unknown command: \${cmd}\`);
    }
}`}
        />
      </Layer>

      {/* @ 命令处理 */}
      <Layer title="@ 命令处理" icon="@">
        <CodeBlock
          title="@ 命令注入"
          code={`function processAtCommands(text: string): ProcessedInput {
    const injections = [];

    // @file - 文件内容注入
    const fileMatches = text.matchAll(/@([\\w./\\-]+)/g);
    for (const match of fileMatches) {
        const filePath = match[1];
        const content = await fs.readFile(filePath, 'utf-8');
        injections.push({
            type: 'file',
            path: filePath,
            content: content
        });
    }

    // @memory - 记忆注入
    if (text.includes('@memory')) {
        const memories = await loadRelevantMemories(text);
        injections.push({
            type: 'memory',
            content: memories
        });
    }

    // @url - URL 内容注入
    const urlMatches = text.matchAll(/@(https?:\\/\\/[^\\s]+)/g);
    for (const match of urlMatches) {
        const content = await fetchUrl(match[1]);
        injections.push({
            type: 'url',
            url: match[1],
            content: content
        });
    }

    return { text, injections };
}`}
        />
      </Layer>

      {/* 确认对话框 */}
      <Layer title="确认对话框" icon="✋">
        <CodeBlock
          title="ShellConfirmationDialog"
          code={`function ShellConfirmationDialog({ toolCall, onApprove, onReject }) {
    return (
        <Box flexDirection="column" borderStyle="round" borderColor="yellow">
            <Text color="yellow">⚠️ 工具需要确认执行</Text>

            <Box marginY={1}>
                <Text>工具: </Text>
                <Text color="cyan">{toolCall.name}</Text>
            </Box>

            <Box marginBottom={1}>
                <Text>命令: </Text>
                <Text color="white">{toolCall.args.command}</Text>
            </Box>

            <Box>
                <Text color="green">[Y] 执行</Text>
                <Text> | </Text>
                <Text color="red">[N] 取消</Text>
                <Text> | </Text>
                <Text color="blue">[E] 编辑</Text>
            </Box>
        </Box>
    );
}`}
        />
      </Layer>

      {/* 性能优化 */}
      <Layer title="UI 性能优化" icon="⚡">
        <div className="space-y-3">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">Static 组件</h4>
            <p className="text-sm text-gray-300">
              已完成的消息使用 Static 包装，只渲染一次，避免不必要的重绘
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-bold mb-2">useMemo / useCallback</h4>
            <p className="text-sm text-gray-300">
              缓存计算结果和回调函数，减少重新计算
            </p>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">流式更新节流</h4>
            <p className="text-sm text-gray-300">
              对快速到达的 chunks 进行节流，避免过于频繁的渲染
            </p>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">虚拟滚动</h4>
            <p className="text-sm text-gray-300">
              长历史记录使用虚拟滚动，只渲染可见区域
            </p>
          </div>
        </div>
      </Layer>

      {/* 调试工具 */}
      <Layer title="开发调试" icon="🔍">
        <HighlightBox title="React DevTools" icon="🛠️" variant="purple">
          <p className="mb-2">
            可以使用 React DevTools 4.x 调试 Ink 应用：
          </p>
          <CodeBlock
            code={`# 1. 安装 React DevTools
npm install -g react-devtools@4.28.5

# 2. 以调试模式启动 CLI
DEV=true qwen

# 3. 在另一个终端启动 DevTools
npx react-devtools@4.28.5`}
          />
        </HighlightBox>
      </Layer>
    </div>
  );
}
