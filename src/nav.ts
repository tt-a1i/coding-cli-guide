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
      { id: 'overview', label: '架构概览' },
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
      { id: 'system-prompt', label: 'Prompt构建' },
      { id: 'content-gen', label: 'API调用层' },
      { id: 'vlm-switch', label: 'VLM切换' },
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
      { id: 'tool-scheduler', label: '工具调度详解', highlight: true },
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
      { id: 'custom-cmd', label: '自定义命令', highlight: true },
      { id: 'shell-modes', label: 'Shell模式', highlight: true },
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
      { id: 'subagent', label: '子代理系统' },
      { id: 'mcp', label: 'MCP集成' },
      { id: 'extension', label: '扩展系统' },
      { id: 'ide-integration', label: 'IDE集成' },
      { id: 'ide-diff', label: 'IDE Diff协议', highlight: true },
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
      { id: 'error', label: '错误处理' },
    ],
  },
  {
    id: 'runtime',
    title: '运行模式',
    icon: '▶️',
    defaultOpen: false,
    items: [
      { id: 'non-interactive', label: '非交互模式' },
      { id: 'welcome-back', label: '会话恢复' },
    ],
  },
  {
    id: 'ui',
    title: 'UI与观测',
    icon: '🎨',
    defaultOpen: false,
    items: [
      { id: 'ui', label: 'UI渲染层' },
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
      { id: 'tool-scheduler-anim', label: '工具调度状态机', highlight: true },
      { id: 'streaming-parser-anim', label: '流式解析器', highlight: true },
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
      { id: 'turn-internal-anim', label: 'Turn 状态流转', highlight: true },
      { id: 'format-converter-anim', label: '格式转换管道', highlight: true },
      { id: 'chunk-assembly-anim', label: 'Chunk 组装', highlight: true },
      { id: 'token-counting-anim', label: 'Token 计数', highlight: true },
      { id: 'function-response-anim', label: 'FunctionResponse 构建', highlight: true },
      { id: 'mcp-handshake-anim', label: 'MCP 协议握手', highlight: true },
      { id: 'permission-approval-anim', label: '权限审批流', highlight: true },
      { id: 'subagent-config-anim', label: 'Subagent 配置解析', highlight: true },
      { id: 'history-compression-anim', label: 'History 压缩', highlight: true },
      { id: 'streaming-tool-parser-anim', label: '流式工具调用解析', highlight: true },
      { id: 'loop-detection-anim', label: '循环检测服务', highlight: true },
      { id: 'request-tokenizer-anim', label: '请求 Token 计算', highlight: true },
      { id: 'result-cache-anim', label: '文件搜索缓存', highlight: true },
      { id: 'terminal-serializer-anim', label: '终端序列化器', highlight: true },
      { id: 'content-converter-anim', label: 'OpenAI 内容转换', highlight: true },
      { id: 'smart-edit-anim', label: 'Smart Edit 替换引擎', highlight: true },
      { id: 'vim-buffer-anim', label: 'Vim 文本缓冲区', highlight: true },
      { id: 'chat-compression-anim', label: '聊天压缩分割点', highlight: true },
      { id: 'prompt-template-anim', label: 'Prompt 模板引擎', highlight: true },
      { id: 'message-format-anim', label: '消息格式转换管道', highlight: true },
      { id: 'streaming-decoder-anim', label: '流式响应解码器', highlight: true },
      { id: 'tool-scheduler-queue-anim', label: '工具调用队列', highlight: true },
      { id: 'session-state-anim', label: '会话状态机', highlight: true },
      { id: 'sandbox-policy-anim', label: '沙箱策略解析器', highlight: true },
      { id: 'command-injection-anim', label: '命令注入检测', highlight: true },
      { id: 'loop-detection-engine-anim', label: '循环检测引擎', highlight: true },
      { id: 'content-pipeline-anim', label: '内容生成管道', highlight: true },
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
