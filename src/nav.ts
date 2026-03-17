export interface NavItem {
  id: string;
  label: string;
  highlight?: boolean;
}

export interface NavGroup {
  id: string;
  title: string;
  icon: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

export const navGroups: NavGroup[] = [
  {
    id: 'start',
    title: '快速入门',
    icon: '🚀',
    defaultOpen: true,
    items: [
      { id: 'start-here', label: 'Start Here', highlight: true },
      { id: 'learning-path', label: '学习路径指南', highlight: true },
      { id: 'overview', label: '架构概览' },
      { id: 'e2e', label: '端到端走读', highlight: true },
      { id: 'glossary', label: '术语表' },
    ],
  },
  {
    id: 'core',
    title: '核心机制',
    icon: '⚙️',
    defaultOpen: true,
    items: [
      { id: 'startup-chain', label: '启动链路', highlight: true },
      { id: 'lifecycle', label: '请求生命周期', highlight: true },
      { id: 'interaction-loop', label: '交互主循环', highlight: true },
      { id: 'gemini-chat', label: '核心循环' },
      { id: 'turn-state-machine', label: 'Turn状态机', highlight: true },
      { id: 'token-accounting', label: 'Token计费系统', highlight: true },
      { id: 'token-lifecycle-overview', label: 'Token生命周期全景', highlight: true },
      { id: 'token-management-strategy', label: 'Token计算策略', highlight: true },
      { id: 'session-persistence', label: '会话持久化', highlight: true },
      { id: 'services-arch', label: '服务层架构', highlight: true },
      { id: 'git-service-deep', label: 'GitService深度解析', highlight: true },
      { id: 'shell-execution-service-deep', label: 'Shell执行服务深度', highlight: true },
      { id: 'system-prompt', label: 'Prompt构建' },
      { id: 'content-gen', label: 'API调用层' },
      { id: 'multi-provider', label: '兼容层：多厂商架构', highlight: true },
      { id: 'content-format-conversion', label: '兼容层：格式转换详解', highlight: true },
      { id: 'streaming-response-processing', label: '流式响应处理', highlight: true },
      { id: 'interactive-shell', label: '交互式 Shell (PTY)', highlight: true },
      { id: 'vlm-switch', label: '多模态输入' },
      { id: 'memory', label: '上下文管理' },
    ],
  },
  {
    id: 'tools',
    title: '工具系统',
    icon: '🔧',
    defaultOpen: false,
    items: [
      { id: 'tool-ref', label: '工具参考', highlight: true },
      { id: 'tool-dev-guide', label: '工具开发指南', highlight: true },
      { id: 'tool-scheduler', label: '工具调度详解', highlight: true },
      { id: 'file-discovery', label: '文件发现系统', highlight: true },
      { id: 'tool-arch', label: '工具架构' },
      { id: 'tool-detail', label: '工具执行' },
      { id: 'ai-tool', label: 'AI工具交互' },
    ],
  },
  {
    id: 'commands',
    title: '命令系统',
    icon: '💻',
    defaultOpen: false,
    items: [
      { id: 'slash-cmd', label: '斜杠命令' },
      { id: 'command-execution-context', label: '命令执行上下文', highlight: true },
      { id: 'command-loading', label: '命令加载系统', highlight: true },
      { id: 'custom-cmd', label: '自定义命令', highlight: true },
      { id: 'shell-modes', label: 'Shell模式', highlight: true },
      { id: 'plan-mode', label: 'Plan Mode', highlight: true },
      { id: 'task-tracking', label: '任务追踪', highlight: true },
      { id: 'prompt-processors', label: 'Prompt 处理器', highlight: true },
      { id: 'at-cmd', label: '@命令' },
      { id: 'memory-split', label: '记忆系统', highlight: true },
    ],
  },
  {
    id: 'extensions',
    title: '扩展集成',
    icon: '🔌',
    defaultOpen: false,
    items: [
      { id: 'agent-framework', label: 'Agent 框架', highlight: true },
      { id: 'agent-skills', label: 'Agent Skills', highlight: true },
      { id: 'subagent', label: '子代理系统' },
      { id: 'subagent-architecture', label: '子代理架构深度', highlight: true },
      { id: 'mcp', label: 'MCP集成' },
      { id: 'prompt-registry', label: 'Prompt 注册表', highlight: true },
      { id: 'extension', label: '扩展系统' },
      { id: 'ide-integration-overview', label: 'IDE集成总览', highlight: true },
      { id: 'ide-integration', label: 'IDE集成详情' },
      { id: 'ide-client', label: 'IDE客户端深度', highlight: true },
      { id: 'zed-integration', label: 'Zed ACP协议', highlight: true },
      { id: 'ide-diff', label: 'IDE Diff协议', highlight: true },
      { id: 'browser-agent', label: 'Browser Agent', highlight: true },
    ],
  },
  {
    id: 'events-policy',
    title: '事件与策略',
    icon: '🎯',
    defaultOpen: true,
    items: [
      { id: 'hook-system', label: 'Hook 事件系统', highlight: true },
      { id: 'policy-engine', label: 'Policy 策略引擎', highlight: true },
      { id: 'message-bus', label: '消息总线', highlight: true },
      { id: 'model-routing', label: '模型路由', highlight: true },
      { id: 'model-availability', label: '模型可用性', highlight: true },
    ],
  },
  {
    id: 'security',
    title: '安全可靠',
    icon: '🛡️',
    defaultOpen: false,
    items: [
      { id: 'approval-mode', label: '审批模式', highlight: true },
      { id: 'trusted-folders', label: '信任机制' },
      { id: 'checkpointing', label: '检查点恢复' },
      { id: 'sandbox', label: '沙箱系统' },
      { id: 'loop-detect', label: '循环检测' },
      { id: 'retry', label: '重试回退' },
      { id: 'fallback-system', label: 'Fallback 降级', highlight: true },
      { id: 'error', label: '错误处理' },
      { id: 'error-recovery-decision-tree', label: '错误恢复决策树', highlight: true },
    ],
  },
  {
    id: 'runtime',
    title: '运行模式',
    icon: '▶️',
    defaultOpen: false,
    items: [
      { id: 'non-interactive', label: '非交互模式' },
      { id: 'non-interactive-deep', label: '非交互深度解析', highlight: true },
      { id: 'chat-compression', label: '聊天压缩系统', highlight: true },
      { id: 'output-formatter', label: '输出格式化', highlight: true },
      { id: 'welcome-back', label: '会话恢复' },
      { id: 'chat-recording', label: '会话录制', highlight: true },
      { id: 'summarizer-system', label: 'LLM 摘要器', highlight: true },
    ],
  },
  {
    id: 'ui',
    title: 'UI与观测',
    icon: '🎨',
    defaultOpen: false,
    items: [
      { id: 'ui', label: 'UI渲染层' },
      { id: 'ui-state-management', label: 'UI 状态管理', highlight: true },
      { id: 'ui-components', label: 'UI 组件库', highlight: true },
      { id: 'react-hooks', label: 'React Hooks', highlight: true },
      { id: 'key-bindings', label: '键盘绑定', highlight: true },
      { id: 'text-buffer', label: 'TextBuffer 编辑器', highlight: true },
      { id: 'message-rendering', label: '消息渲染系统', highlight: true },
      { id: 'context-system', label: 'Context 系统', highlight: true },
      { id: 'theme', label: '主题系统' },
      { id: 'telemetry', label: '遥测系统' },
    ],
  },
  {
    id: 'animations',
    title: '动画演示',
    icon: '🎬',
    defaultOpen: false,
    items: [
      { id: 'animation', label: '完整流程动画', highlight: true },
      { id: 'slash-cmd-exec-anim', label: '斜杠命令执行', highlight: true },
      { id: 'tool-scheduler-anim', label: '工具调度状态机', highlight: true },
      { id: 'streaming-parser-anim', label: '兼容层：流式解析器', highlight: true },
      { id: 'mcp-discovery-anim', label: 'MCP服务发现', highlight: true },
      { id: 'context-compression-anim', label: '上下文压缩', highlight: true },
      { id: 'subagent-anim', label: '子代理系统', highlight: true },
    ],
  },
  {
    id: 'internal-animations',
    title: '内部机制动画',
    icon: '🔬',
    defaultOpen: true,
    items: [
      { id: 'hook-event-anim', label: 'Hook 事件流', highlight: true },
      { id: 'policy-decision-anim', label: 'Policy 决策流', highlight: true },
      { id: 'message-bus-anim', label: '消息总线流', highlight: true },
      { id: 'routing-chain-anim', label: '路由策略链', highlight: true },
      { id: 'agent-loop-anim', label: 'Agent 执行循环', highlight: true },
      { id: 'turn-internal-anim', label: 'Turn 状态流转', highlight: true },
      { id: 'format-converter-anim', label: '兼容层：格式转换管道', highlight: true },
      { id: 'chunk-assembly-anim', label: '兼容层：Chunk 组装', highlight: true },
      { id: 'token-counting-anim', label: 'Token 计数', highlight: true },
      { id: 'function-response-anim', label: 'FunctionResponse 构建', highlight: true },
      { id: 'mcp-handshake-anim', label: 'MCP 协议握手', highlight: true },
      { id: 'permission-approval-anim', label: '权限审批流', highlight: true },
      { id: 'subagent-config-anim', label: 'Subagent 配置解析', highlight: true },
      { id: 'history-compression-anim', label: 'History 压缩', highlight: true },
      { id: 'streaming-tool-parser-anim', label: '兼容层：流式工具调用解析', highlight: true },
      { id: 'loop-detection-anim', label: '循环检测服务', highlight: true },
      { id: 'request-tokenizer-anim', label: '请求 Token 计算', highlight: true },
      { id: 'result-cache-anim', label: '文件搜索缓存', highlight: true },
      { id: 'terminal-serializer-anim', label: '终端序列化器', highlight: true },
      { id: 'content-converter-anim', label: 'OpenAI 内容转换', highlight: true },
      { id: 'multi-provider-pipeline-anim', label: '兼容层：多厂商内容管道', highlight: true },
      { id: 'smart-edit-anim', label: 'Smart Edit 替换引擎', highlight: true },
      { id: 'vim-buffer-anim', label: 'Vim 文本缓冲区', highlight: true },
      { id: 'chat-compression-anim', label: '聊天压缩分割点', highlight: true },
      { id: 'prompt-template-anim', label: 'Prompt 模板引擎', highlight: true },
      { id: 'message-format-anim', label: '消息格式转换管道', highlight: true },
      { id: 'streaming-decoder-anim', label: '兼容层：流式响应解码器', highlight: true },
      { id: 'tool-scheduler-queue-anim', label: '工具调用队列', highlight: true },
      { id: 'session-state-anim', label: '会话状态机', highlight: true },
      { id: 'sandbox-policy-anim', label: '沙箱策略解析器', highlight: true },
      { id: 'command-injection-anim', label: '命令注入检测', highlight: true },
      { id: 'loop-detection-engine-anim', label: '循环检测引擎', highlight: true },
      { id: 'content-pipeline-anim', label: '内容生成管道', highlight: true },
      { id: 'streaming-response-anim', label: '流式响应生成', highlight: true },
      { id: 'oauth-device-flow-anim', label: 'OAuth 登录流程', highlight: true },
      { id: 'mcp-client-connection-anim', label: 'MCP 客户端连接', highlight: true },
      { id: 'react-tool-scheduler-anim', label: 'React 工具调度器', highlight: true },
      { id: 'session-metrics-anim', label: '会话指标聚合', highlight: true },
      { id: 'gemini-chat-flow-anim', label: 'GeminiChat 流程', highlight: true },
      { id: 'token-limit-matcher-anim', label: 'Token 限制匹配', highlight: true },
      { id: 'shell-injection-anim', label: 'Shell 注入处理', highlight: true },
      { id: 'at-file-processor-anim', label: '@File 处理器', highlight: true },
      { id: 'image-tokenizer-anim', label: 'Image Tokenizer 解析', highlight: true },
      { id: 'exponential-backoff-anim', label: '指数退避重试', highlight: true },
      { id: 'bfs-file-search-anim', label: 'BFS 文件搜索', highlight: true },
      { id: 'injection-parser-anim', label: 'Injection 解析器', highlight: true },
      { id: 'lru-cache-anim', label: 'LRU 缓存淘汰', highlight: true },
      { id: 'pty-lifecycle-anim', label: 'PTY 生命周期', highlight: true },
      { id: 'streaming-json-parser-anim', label: '兼容层：流式 JSON 解析', highlight: true },
      { id: 'vim-composite-actions-anim', label: 'Vim 复合操作', highlight: true },
      { id: 'prompt-pipeline-anim', label: 'Prompt 处理管道', highlight: true },
      { id: 'memory-import-anim', label: 'Memory Import 解析', highlight: true },
      { id: 'command-loading-anim', label: '命令加载冲突解决', highlight: true },
      { id: 'tool-confirmation-anim', label: '工具确认状态机', highlight: true },
      { id: 'model-config-cache-anim', label: 'ModelConfig 缓存 TTL', highlight: true },
      { id: 'subagent-resolution-anim', label: 'Subagent 优先级解析', highlight: true },
      { id: 'shadow-git-checkpoint-anim', label: '影子 Git 检查点', highlight: true },
      { id: 'chat-recording-anim', label: '会话记录队列', highlight: true },
    ],
  },
  {
    id: 'appendix',
    title: '附录',
    icon: '📚',
    defaultOpen: false,
    items: [
      { id: 'config', label: '配置系统' },
      { id: 'auth', label: '认证流程' },
      { id: 'google-authentication', label: 'Google OAuth 详解', highlight: true },
      { id: 'model-configuration', label: '模型配置机制', highlight: true },
      { id: 'design-tradeoffs', label: '设计权衡分析', highlight: true },
      { id: 'error-recovery-patterns', label: '错误恢复模式', highlight: true },
      { id: 'concurrency-patterns', label: '并发模式详解', highlight: true },
      { id: 'settings-manager', label: '设置管理器', highlight: true },
      { id: 'quota-detection', label: '配额检测', highlight: true },
      { id: 'code-assist', label: 'Code Assist', highlight: true },
      { id: 'startup', label: '启动流程' },
      { id: 'code', label: '核心代码' },
      { id: 'loop', label: 'Loop机制' },
    ],
  },
];

export type FlatNavItem = NavItem & {
  groupId: string;
  groupTitle: string;
  groupIcon: string;
};

export function flattenNav(groups: NavGroup[] = navGroups): FlatNavItem[] {
  const out: FlatNavItem[] = [];
  for (const group of groups) {
    for (const item of group.items) {
      out.push({
        ...item,
        groupId: group.id,
        groupTitle: group.title,
        groupIcon: group.icon,
      });
    }
  }
  return out;
}

export const flatNavItems = flattenNav(navGroups);
