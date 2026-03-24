/**
 * InteractiveShell - 交互式 Shell (PTY) 架构详解
 * 深入解析 Gemini CLI 中伪终端 (PTY) 的双向通信机制与架构设计
 */

import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
 { id: 'tool-system', label: 'Tool 系统', description: '工具执行框架' },
 { id: 'core-architecture', label: '核心架构', description: '系统整体设计' },
 { id: 'approval-mode', label: '审批模式', description: '命令执行安全' },
 { id: 'non-interactive-deep', label: '非交互模式', description: '管道友好 CLI' },
 { id: 'agent-framework', label: 'Agent 框架', description: 'Agent 循环机制' },
 { id: 'shell-execution', label: 'Shell 执行', description: '命令执行服务' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-xl border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">🖥️</span>
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
 PTY (伪终端) 为 Gemini CLI 提供双向终端通信能力，使 Agent 可以运行交互式程序（如编辑器、监控器），实现终端控制码支持与动态窗口调整
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">PTY</div>
 <div className="text-xs text-dim">伪终端</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">Bi-Dir</div>
 <div className="text-xs text-dim">双向通信</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">Resize</div>
 <div className="text-xs text-dim">动态调整</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">Sandbox</div>
 <div className="text-xs text-dim">安全沙箱</div>
 </div>
 </div>

 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">核心能力</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 交互式程序
 </span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 终端控制码
 </span>
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 输入写入
 </span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Shell 补全
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">📍 源码位置:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/cli/src/tools/pty/
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function InteractiveShell() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const architectureDiagram = `flowchart TB
 subgraph Agent["Agent 层"]
 AI["Gemini Model"]
 ToolScheduler["Tool Scheduler"]
 end

 subgraph PTYSystem["PTY 系统"]
 PtyManager["PtyManager<br/>PTY 生命周期管理"]
 TerminalSession["TerminalSession<br/>会话状态维护"]
 InputHandler["InputHandler<br/>输入处理与写入"]
 OutputBuffer["OutputBuffer<br/>输出缓冲与解析"]
 ResizeHandler["ResizeHandler<br/>终端尺寸管理"]
 end

 subgraph OS["操作系统层"]
 PTY["PTY Master/Slave"]
 Shell["Shell 进程<br/>(bash/zsh/fish)"]
 ChildProcess["子进程<br/>(vim/top/htop)"]
 end

 AI -->|"工具调用"| ToolScheduler
 ToolScheduler -->|"run_in_terminal"| PtyManager
 PtyManager --> TerminalSession
 TerminalSession --> InputHandler
 TerminalSession --> OutputBuffer
 TerminalSession --> ResizeHandler
 InputHandler -->|"stdin 写入"| PTY
 PTY -->|"stdout 读取"| OutputBuffer
 ResizeHandler -->|"SIGWINCH"| PTY
 PTY <-->|"fd 对"| Shell
 Shell -->|"fork/exec"| ChildProcess

 style Agent stroke:#00d4ff
 style PTYSystem stroke:#00ff88
 style OS stroke:#a855f7`;

 const lifecycleDiagram = `stateDiagram-v2
 [*] --> Creating: Agent 请求 run_in_terminal

 Creating --> Spawning: PtyManager.create()
 Spawning --> Connected: PTY fd 对建立

 Connected --> Active: Shell 进程就绪
 Active --> Writing: Agent 写入输入
 Writing --> Active: 输入完成
 Active --> Reading: 输出数据到达
 Reading --> Active: 数据处理完毕
 Active --> Resizing: 终端窗口变化
 Resizing --> Active: SIGWINCH 发送

 Active --> Closing: Agent 请求关闭 / 进程退出
 Closing --> Cleanup: 释放资源
 Cleanup --> [*]: fd 关闭 & 进程终止

 note right of Active
 核心活跃状态
 支持读/写/调整
 end note

 note right of Closing
 优雅关闭:
 SIGTERM → 等待 → SIGKILL
 end note`;

 const communicationDiagram = `sequenceDiagram
 participant Model as Gemini Model
 participant Scheduler as Tool Scheduler
 participant Manager as PtyManager
 participant Session as TerminalSession
 participant PTY as PTY (Master)
 participant Shell as Shell (Slave)

 Model->>Scheduler: run_in_terminal({ command: "vim file.ts" })
 Scheduler->>Manager: createSession(command, options)
 Manager->>PTY: pty.spawn(shell, args, { cols, rows })
 PTY->>Shell: fork + setsid + exec

 Shell-->>PTY: 初始化输出 (prompt / 启动消息)
 PTY-->>Session: onData(output)
 Session-->>Manager: bufferOutput(data)
 Manager-->>Scheduler: { sessionId, initialOutput }
 Scheduler-->>Model: 工具结果: 终端已启动

 Note over Model,Shell: 双向通信阶段

 Model->>Scheduler: write_to_terminal({ sessionId, input: ":wq\\n" })
 Scheduler->>Session: write(input)
 Session->>PTY: master.write(":wq\\n")
 PTY->>Shell: stdin 数据
 Shell-->>PTY: 处理结果输出
 PTY-->>Session: onData(output)
 Session-->>Scheduler: { output }
 Scheduler-->>Model: 工具结果: 终端输出

 Model->>Scheduler: resize_terminal({ sessionId, cols: 120, rows: 40 })
 Scheduler->>Session: resize(cols, rows)
 Session->>PTY: pty.resize(cols, rows)
 PTY->>Shell: SIGWINCH
 Scheduler-->>Model: 工具结果: 已调整大小

 Model->>Scheduler: close_terminal({ sessionId })
 Scheduler->>Manager: closeSession(sessionId)
 Manager->>Session: close()
 Session->>PTY: process.kill(SIGTERM)
 PTY->>Shell: SIGTERM
 Manager-->>Scheduler: { closed: true }
 Scheduler-->>Model: 工具结果: 终端已关闭`;

 const ptyManagerCode = `// packages/cli/src/tools/pty/PtyManager.ts

interface PtySessionOptions {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  cols?: number;
  rows?: number;
  timeout?: number;
}

interface PtySession {
  id: string;
  pty: IPty;
  output: string[];
  isAlive: boolean;
  exitCode: number | null;
}

export class PtyManager {
  private sessions: Map<string, PtySession> = new Map();
  private maxSessions: number;

  constructor(options: { maxSessions?: number } = {}) {
  this.maxSessions = options.maxSessions ?? 5;
  }

  /**
  * 创建新的 PTY 会话
  * - 检查会话数量限制
  * - 生成唯一 sessionId
  * - 使用 node-pty 创建伪终端
  */
  async createSession(options: PtySessionOptions): Promise<PtySession> {
  if (this.sessions.size >= this.maxSessions) {
  throw new Error(
  \`Maximum PTY sessions (\${this.maxSessions}) reached. \\
Close an existing session first.\`
  );
  }

  const sessionId = generateSessionId();
  const shell = options.command || getDefaultShell();

  const ptyProcess = pty.spawn(shell, options.args || [], {
  name: 'xterm-256color',
  cols: options.cols ?? 80,
  rows: options.rows ?? 24,
  cwd: options.cwd || process.cwd(),
  env: { ...process.env, ...options.env },
  });

  const session: PtySession = {
  id: sessionId,
  pty: ptyProcess,
  output: [],
  isAlive: true,
  exitCode: null,
  };

  // 监听输出
  ptyProcess.onData((data: string) => {
  session.output.push(data);
  // 限制输出缓冲大小，防止内存泄漏
  if (session.output.length > MAX_OUTPUT_LINES) {
  session.output = session.output.slice(-MAX_OUTPUT_LINES);
  }
  });

  // 监听退出
  ptyProcess.onExit(({ exitCode, signal }) => {
  session.isAlive = false;
  session.exitCode = exitCode;
  this.handleSessionExit(sessionId, exitCode, signal);
  });

  this.sessions.set(sessionId, session);
  return session;
  }

  /**
  * 向会话写入数据
  */
  write(sessionId: string, data: string): void {
  const session = this.getActiveSession(sessionId);
  session.pty.write(data);
  }

  /**
  * 调整终端大小
  */
  resize(sessionId: string, cols: number, rows: number): void {
  const session = this.getActiveSession(sessionId);
  session.pty.resize(cols, rows);
  }

  /**
  * 关闭会话 - 优雅关闭流程
  */
  async closeSession(sessionId: string): Promise<{ exitCode: number | null }> {
  const session = this.sessions.get(sessionId);
  if (!session) throw new Error(\`Session \${sessionId} not found\`);

  if (session.isAlive) {
  // 第一阶段：发送 SIGTERM
  session.pty.kill();

  // 等待进程退出
  await withTimeout(
  new Promise<void>(resolve => {
  const check = setInterval(() => {
  if (!session.isAlive) {
  clearInterval(check);
  resolve();
  }
  }, 100);
  }),
  GRACEFUL_SHUTDOWN_TIMEOUT
  ).catch(() => {
  // 第二阶段：强制 SIGKILL
  try { process.kill(session.pty.pid, 'SIGKILL'); } catch {}
  });
  }

  this.sessions.delete(sessionId);
  return { exitCode: session.exitCode };
  }

  /**
  * 关闭所有会话（CLI 退出时调用）
  */
  async closeAll(): Promise<void> {
  const closePromises = Array.from(this.sessions.keys())
  .map(id => this.closeSession(id));
  await Promise.allSettled(closePromises);
  }

  private getActiveSession(sessionId: string): PtySession {
  const session = this.sessions.get(sessionId);
  if (!session) throw new Error(\`Session \${sessionId} not found\`);
  if (!session.isAlive) throw new Error(\`Session \${sessionId} has exited\`);
  return session;
  }
}`;

 const terminalSessionCode = `// packages/cli/src/tools/pty/TerminalSession.ts

interface TerminalSessionConfig {
  /** 输出缓冲区最大行数 */
  maxOutputLines: number;
  /** 输出读取等待超时 (ms) */
  readTimeout: number;
  /** 是否启用 ANSI 控制码解析 */
  parseAnsi: boolean;
}

export class TerminalSession {
  private outputBuffer: OutputBuffer;
  private inputHandler: InputHandler;
  private resizeHandler: ResizeHandler;
  private ansiParser: AnsiParser | null;

  constructor(
  private pty: IPty,
  private config: TerminalSessionConfig,
  ) {
  this.outputBuffer = new OutputBuffer(config.maxOutputLines);
  this.inputHandler = new InputHandler(pty);
  this.resizeHandler = new ResizeHandler(pty);

  this.ansiParser = config.parseAnsi
  ? new AnsiParser()
  : null;

  // 注册输出监听器
  this.pty.onData((data: string) => {
  const processed = this.ansiParser
  ? this.ansiParser.process(data)
  : data;
  this.outputBuffer.append(processed);
  });
  }

  /**
  * 读取最近的终端输出
  * - 等待指定时间收集输出
  * - 返回累积的输出内容
  */
  async readOutput(waitMs?: number): Promise<string> {
  if (waitMs) {
  await new Promise(r => setTimeout(r, waitMs));
  }
  return this.outputBuffer.flush();
  }

  /**
  * 写入输入到终端
  * 支持特殊按键序列（如 Ctrl+C, Escape 等）
  */
  writeInput(input: string): void {
  this.inputHandler.write(input);
  }

  /**
  * 发送特殊控制序列
  */
  sendControlSequence(sequence: ControlSequence): void {
  this.inputHandler.sendControl(sequence);
  }

  /**
  * 调整终端窗口大小
  */
  resize(cols: number, rows: number): void {
  this.resizeHandler.resize(cols, rows);
  }

  /**
  * 获取当前终端尺寸
  */
  getSize(): { cols: number; rows: number } {
  return this.resizeHandler.getSize();
  }
}`;

 const toolDefinitionCode = `// packages/cli/src/tools/pty/ptyTools.ts

/**
  * run_in_terminal - 在伪终端中运行命令
  * 支持需要丰富终端功能的交互式程序
  */
export const runInTerminalTool: ToolDefinition = {
  name: 'run_in_terminal',
  description: \`Run a command in a pseudo-terminal (PTY) with full terminal
emulation. Use this for commands that need interactive features
like text editors (vim, nano), system monitors (top, htop),
or any program that uses terminal control codes.\`,
  parameters: {
  type: 'object',
  properties: {
  command: {
  type: 'string',
  description: 'The command to execute in the PTY',
  },
  cwd: {
  type: 'string',
  description: 'Working directory for the command',
  },
  cols: {
  type: 'number',
  description: 'Terminal width in columns (default: 80)',
  },
  rows: {
  type: 'number',
  description: 'Terminal height in rows (default: 24)',
  },
  timeout: {
  type: 'number',
  description: 'Execution timeout in milliseconds',
  },
  },
  required: ['command'],
  },
  execute: async (args, context) => {
  const session = await context.ptyManager.createSession({
  command: args.command,
  cwd: args.cwd,
  cols: args.cols,
  rows: args.rows,
  timeout: args.timeout,
  });

  // 等待初始输出
  const initialOutput = await session.readOutput(500);

  return {
  sessionId: session.id,
  output: initialOutput,
  isAlive: session.isAlive,
  };
  },
};

/**
  * write_to_terminal - 向活跃的 PTY 会话写入输入
  */
export const writeToTerminalTool: ToolDefinition = {
  name: 'write_to_terminal',
  description: 'Write input to an active PTY session.',
  parameters: {
  type: 'object',
  properties: {
  sessionId: {
  type: 'string',
  description: 'The ID of the PTY session',
  },
  input: {
  type: 'string',
  description: \`Input text to write. Supports special sequences:
  \\\\n for Enter, \\\\t for Tab, \\\\x03 for Ctrl+C,
  \\\\x1b for Escape.\`,
  },
  waitForOutput: {
  type: 'number',
  description: 'Milliseconds to wait for output after writing (default: 300)',
  },
  },
  required: ['sessionId', 'input'],
  },
  execute: async (args, context) => {
  const session = context.ptyManager.getSession(args.sessionId);
  session.writeInput(args.input);

  const output = await session.readOutput(args.waitForOutput ?? 300);

  return {
  output,
  isAlive: session.isAlive,
  };
  },
};

/**
  * resize_terminal - 调整 PTY 终端大小
  */
export const resizeTerminalTool: ToolDefinition = {
  name: 'resize_terminal',
  description: 'Resize an active PTY session terminal.',
  parameters: {
  type: 'object',
  properties: {
  sessionId: { type: 'string' },
  cols: { type: 'number', description: 'New width in columns' },
  rows: { type: 'number', description: 'New height in rows' },
  },
  required: ['sessionId', 'cols', 'rows'],
  },
  execute: async (args, context) => {
  context.ptyManager.resize(args.sessionId, args.cols, args.rows);
  return { resized: true, cols: args.cols, rows: args.rows };
  },
};

/**
  * close_terminal - 关闭 PTY 会话
  */
export const closeTerminalTool: ToolDefinition = {
  name: 'close_terminal',
  description: 'Close an active PTY session and release resources.',
  parameters: {
  type: 'object',
  properties: {
  sessionId: { type: 'string' },
  },
  required: ['sessionId'],
  },
  execute: async (args, context) => {
  const result = await context.ptyManager.closeSession(args.sessionId);
  return { closed: true, exitCode: result.exitCode };
  },
};`;

 const inputHandlerCode = `// packages/cli/src/tools/pty/InputHandler.ts

/** 特殊控制序列映射 */
const CONTROL_SEQUENCES: Record<string, string> = {
  'ctrl+c': '\\x03', // ETX - 中断
  'ctrl+d': '\\x04', // EOT - 文件结束
  'ctrl+z': '\\x1a', // SUB - 挂起
  'ctrl+l': '\\x0c', // FF - 清屏
  'ctrl+a': '\\x01', // SOH - 行首
  'ctrl+e': '\\x05', // ENQ - 行尾
  'ctrl+w': '\\x17', // ETB - 删除前一个单词
  'escape': '\\x1b', // ESC
  'tab': '\\x09', // HT - 补全
  'enter': '\\x0d', // CR - 回车
  'backspace':'\\x7f', // DEL
  'up': '\\x1b[A', // 向上箭头
  'down': '\\x1b[B', // 向下箭头
  'right': '\\x1b[C', // 向右箭头
  'left': '\\x1b[D', // 向左箭头
};

export class InputHandler {
  constructor(private pty: IPty) {}

  /**
  * 写入原始文本数据
  */
  write(data: string): void {
  // 处理转义序列
  const processed = data
  .replace(/\\\\n/g, '\\n')
  .replace(/\\\\t/g, '\\t')
  .replace(/\\\\x([0-9a-fA-F]{2})/g, (_, hex) =>
  String.fromCharCode(parseInt(hex, 16))
  );
  this.pty.write(processed);
  }

  /**
  * 发送命名控制序列
  */
  sendControl(name: string): void {
  const sequence = CONTROL_SEQUENCES[name.toLowerCase()];
  if (!sequence) {
  throw new Error(\`Unknown control sequence: \${name}\`);
  }
  this.pty.write(sequence);
  }

  /**
  * 发送 Tab 补全请求
  * 写入部分命令后发送 Tab 触发 Shell 自动补全
  */
  sendTabCompletion(partialCommand: string): void {
  this.pty.write(partialCommand);
  this.pty.write('\\t');
  }
}`;

 const sandboxIntegrationCode = `// packages/cli/src/tools/pty/ptySandbox.ts

interface PtySandboxConfig {
  /** 允许在 PTY 中执行的命令白名单 */
  allowedCommands: string[];
  /** 阻止的危险命令模式 */
  blockedPatterns: RegExp[];
  /** 是否在沙箱中运行 (macOS sandbox-exec) */
  useSandbox: boolean;
  /** 沙箱配置文件路径 */
  sandboxProfile?: string;
  /** PTY 会话的资源限制 */
  resourceLimits: {
  maxOutputBytes: number; // 最大输出大小
  maxSessionDuration: number; // 最大会话时长 (ms)
  maxConcurrentSessions: number; // 最大并发会话数
  };
}

/**
  * 命令安全校验 - 在创建 PTY 会话前执行
  */
export function validatePtyCommand(
  command: string,
  config: PtySandboxConfig,
): { allowed: boolean; reason?: string } {
  // 1. 检查命令是否匹配阻止模式
  for (const pattern of config.blockedPatterns) {
  if (pattern.test(command)) {
  return {
  allowed: false,
  reason: \`Command matches blocked pattern: \${pattern.source}\`,
  };
  }
  }

  // 2. 检查白名单（如果启用）
  if (config.allowedCommands.length > 0) {
  const baseCommand = command.split(/\\s+/)[0];
  if (!config.allowedCommands.includes(baseCommand)) {
  return {
  allowed: false,
  reason: \`Command "\${baseCommand}" not in allowed list\`,
  };
  }
  }

  return { allowed: true };
}

/**
  * 构建沙箱化的 PTY 环境
  */
export function buildSandboxedEnv(
  baseEnv: Record<string, string>,
  config: PtySandboxConfig,
): Record<string, string> {
  return {
  ...baseEnv,
  // 限制 PATH，仅包含必要的可执行文件路径
  PATH: filterPathEntries(baseEnv.PATH || ''),
  // 禁用危险的环境变量
  LD_PRELOAD: '',
  DYLD_INSERT_LIBRARIES: '',
  // 标记为沙箱环境
  GEMINI_PTY_SANDBOX: '1',
  };
}`;

 const autocompleteDiagram = `sequenceDiagram
 participant Model as Gemini Model
 participant Tool as write_to_terminal
 participant PTY as PTY Session
 participant Shell as Shell (补全引擎)

 Note over Model: 需要查找可用命令/文件

 Model->>Tool: write("git ch")
 Tool->>PTY: write("git ch")
 Model->>Tool: write("\\t")
 Tool->>PTY: write("\\t")

 Shell-->>PTY: 补全结果: "checkout cherry-pick"
 PTY-->>Tool: onData(补全输出)
 Tool-->>Model: output: "checkout cherry-pick"

 Note over Model: 解析补全结果，选择目标

 Model->>Tool: write("eckout main\\n")
 Tool->>PTY: write("eckout main\\n")
 Shell-->>PTY: 执行 git checkout main
 PTY-->>Tool: onData(执行结果)
 Tool-->>Model: output: "Switched to branch 'main'"`;

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-3xl font-bold text-heading mb-2">交互式 Shell (PTY)</h1>
 <p className="text-body text-lg">
 伪终端 (PTY) 双向通信机制，支持交互式程序运行、终端控制码与动态窗口管理
 </p>
 </div>

 <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

 {/* 概述 */}
 <Layer title="概述" icon="📖" defaultOpen={true}>
 <div className="space-y-4">
 <p className="text-body">
 伪终端 (Pseudo Terminal, PTY) 是 Gemini CLI 中实现<strong className="text-heading">双向终端通信</strong>的核心机制。
 与普通的 <code>child_process.exec()</code> 不同，PTY 提供了完整的终端仿真能力，
 使得 Agent 可以运行需要丰富终端功能的交互式程序，例如文本编辑器 (vim/nano)、系统监控器 (top/htop)
 以及任何使用终端控制码的程序。
 </p>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">普通 Shell 执行</div>
 <ul className="text-sm text-body space-y-1">
 <li>单向通信（命令 + 结果）</li>
 <li>无终端仿真</li>
 <li>不支持交互式输入</li>
 <li>适用于简单命令</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">PTY 交互式 Shell</div>
 <ul className="text-sm text-body space-y-1">
 <li>双向实时通信</li>
 <li>完整终端仿真 (xterm-256color)</li>
 <li>支持按键序列和控制码</li>
 <li>适用于交互式程序</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border-l-2 border-l-edge-hover/30">
 <div className="text-heading font-bold mb-2">关键差异</div>
 <ul className="text-sm text-body space-y-1">
 <li>PTY 有 Master/Slave fd 对</li>
 <li>PTY 支持 SIGWINCH 信号</li>
 <li>PTY 分配 controlling terminal</li>
 <li>PTY 支持 job control</li>
 </ul>
 </div>
 </div>
 </div>
 </Layer>

 {/* 架构设计 */}
 <Layer title="架构设计" icon="🏗️" defaultOpen={true}>
 <HighlightBox title="PTY 系统架构" color="blue" className="mb-6">
 <MermaidDiagram chart={architectureDiagram} />
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge">
 <h4 className="text-heading font-bold mb-2">PtyManager</h4>
 <p className="text-sm text-body">
 PTY 系统的顶层管理器，负责会话的创建、跟踪和销毁。维护一个 <code>Map&lt;string, PtySession&gt;</code>
 存储所有活跃会话，并限制最大并发数防止资源耗尽。在 CLI 退出时调用 <code>closeAll()</code> 清理所有会话。
 </p>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge">
 <h4 className="text-heading font-bold mb-2">TerminalSession</h4>
 <p className="text-sm text-body">
 单个 PTY 会话的封装，协调 InputHandler、OutputBuffer 和 ResizeHandler 三个子组件。
 提供高层 API 进行读写操作，内部处理 ANSI 控制码的解析与转换。
 </p>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge">
 <h4 className="text-heading font-bold mb-2">InputHandler</h4>
 <p className="text-sm text-body">
 处理向 PTY 写入数据的逻辑，支持原始文本和命名控制序列 (Ctrl+C, Tab, Escape 等)。
 负责转义序列的解析，确保特殊字符正确传递到终端。
 </p>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge">
 <h4 className="text-heading font-bold mb-2">OutputBuffer / ResizeHandler</h4>
 <p className="text-sm text-body">
 OutputBuffer 累积终端输出并限制缓冲区大小防止内存泄漏。
 ResizeHandler 管理终端尺寸变更，通过 <code>pty.resize()</code> 发送 SIGWINCH 信号通知子进程。
 </p>
 </div>
 </div>
 </Layer>

 {/* PTY 生命周期 */}
 <Layer title="PTY 生命周期" icon="🔄" defaultOpen={true}>
 <HighlightBox title="会话生命周期状态机" color="green" className="mb-6">
 <MermaidDiagram chart={lifecycleDiagram} />
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
 <div className="bg-surface p-3 rounded-lg border border-edge/30 text-center">
 <div className="text-heading font-bold text-sm mb-1">1. 创建</div>
 <p className="text-xs text-dim">
 Agent 调用 run_in_terminal，PtyManager 分配 sessionId 并 spawn PTY
 </p>
 </div>
 <div className="bg-surface p-3 rounded-lg border border-edge/30 text-center">
 <div className="text-heading font-bold text-sm mb-1">2. 连接</div>
 <p className="text-xs text-dim">
 Master/Slave fd 对建立，Shell 进程 fork + setsid + exec
 </p>
 </div>
 <div className="bg-surface p-3 rounded-lg border-l-2 border-l-edge-hover/30 text-center">
 <div className="text-heading font-bold text-sm mb-1">3. 通信</div>
 <p className="text-xs text-dim">
 双向读写，支持输入写入、输出读取和窗口大小调整
 </p>
 </div>
 <div className="bg-surface p-3 rounded-lg border border-edge/30 text-center">
 <div className="text-heading font-bold text-sm mb-1">4. 调整</div>
 <p className="text-xs text-dim">
 动态 resize 发送 SIGWINCH，子进程重新渲染
 </p>
 </div>
 <div className="bg-surface p-3 rounded-lg border-l-2 border-l-edge-hover/30 text-center">
 <div className="text-heading font-bold text-sm mb-1">5. 关闭</div>
 <p className="text-xs text-dim">
 优雅关闭: SIGTERM 后等待，超时则 SIGKILL 强制终止
 </p>
 </div>
 </div>
 </Layer>

 {/* 核心能力 */}
 <Layer title="核心能力" icon="⚡" defaultOpen={true}>
 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="运行交互式程序" color="green">
 <ul className="text-sm text-body space-y-2">
 <li><strong>文本编辑器：</strong>vim, nano, emacs - 完整的编辑器体验</li>
 <li><strong>系统监控器：</strong>top, htop, btop - 实时刷新的 TUI 程序</li>
 <li><strong>交互式 REPL：</strong>python, node, irb - 读取-执行-打印循环</li>
 <li><strong>数据库客户端：</strong>psql, mysql, redis-cli - 交互式查询</li>
 <li><strong>版本控制：</strong>git log (分页), git rebase -i - 需要编辑器的操作</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="终端控制码支持" color="blue">
 <ul className="text-sm text-body space-y-2">
 <li><strong>终端类型：</strong>xterm-256color 完整仿真</li>
 <li><strong>光标控制：</strong>移动、隐藏、显示光标</li>
 <li><strong>颜色支持：</strong>256 色和 True Color</li>
 <li><strong>屏幕操作：</strong>清屏、滚动、alternate screen</li>
 <li><strong>特殊模式：</strong>raw mode, application keypad mode</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="终端输入与动态调整" color="purple">
 <ul className="text-sm text-body space-y-2">
 <li><strong>文本写入：</strong>向 PTY stdin 写入普通文本</li>
 <li><strong>控制序列：</strong>Ctrl+C/D/Z, Escape, Tab 等</li>
 <li><strong>箭头按键：</strong>上/下/左/右方向键序列</li>
 <li><strong>窗口调整：</strong>动态修改 cols/rows 触发 SIGWINCH</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="Shell 自动补全" color="orange">
 <ul className="text-sm text-body space-y-2">
 <li><strong>Tab 补全：</strong>发送 Tab 键触发 Shell 原生补全</li>
 <li><strong>结果解析：</strong>读取补全输出，提取候选项</li>
 <li><strong>多轮交互：</strong>Agent 可根据补全结果选择目标</li>
 <li><strong>支持所有 Shell：</strong>bash, zsh, fish 的补全引擎</li>
 </ul>
 </HighlightBox>
 </div>
 </div>
 </Layer>

 {/* 双向通信协议 */}
 <Layer title="双向通信协议" icon="🔀" defaultOpen={true}>
 <HighlightBox title="Agent 与 PTY 之间的完整交互流程" color="blue" className="mb-6">
 <MermaidDiagram chart={communicationDiagram} />
 </HighlightBox>

 <div className="mt-4 bg-base p-4 rounded-lg">
 <h4 className="text-heading font-bold mb-2">通信协议要点</h4>
 <ul className="text-sm text-body space-y-2">
 <li><strong className="text-heading">工具调用驱动：</strong>所有 PTY 操作通过 Tool Scheduler 调度，Model 通过工具调用与 PTY 交互，无直接连接</li>
 <li><strong className="text-heading">异步输出收集：</strong>写入后等待指定时间 (waitForOutput) 收集输出，避免过早读取导致结果不完整</li>
 <li><strong className="text-heading">会话 ID 绑定：</strong>每个 PTY 会话有唯一 sessionId，后续操作 (write/resize/close) 通过 ID 定位目标会话</li>
 <li><strong className="text-heading">状态透传：</strong>每次工具结果都包含 isAlive 标志，Model 可感知会话是否仍然活跃</li>
 </ul>
 </div>
 </Layer>

 {/* Shell 自动补全 */}
 <Layer title="Shell 自动补全交互" icon="⌨️" defaultOpen={false}>
 <HighlightBox title="Tab 补全流程" color="green" className="mb-6">
 <MermaidDiagram chart={autocompleteDiagram} />
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
 <div className="bg-surface p-4 rounded-lg border border-edge">
 <h4 className="text-heading font-bold mb-2">工作原理</h4>
 <p className="text-sm text-body">
 Agent 利用 Shell 的原生补全引擎进行命令发现。通过 <code>write_to_terminal</code> 写入部分命令后发送 Tab 键，
 Shell 返回补全候选项，Agent 解析后选择合适的命令继续执行。这种方式无需预定义命令列表，
 直接利用目标环境的实际可用命令。
 </p>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge">
 <h4 className="text-heading font-bold mb-2">适用场景</h4>
 <ul className="text-sm text-body space-y-1">
 <li>探索未知环境中的可用命令</li>
 <li>自动补全文件路径和目录名</li>
 <li>发现 Git 分支名、远程仓库</li>
 <li>查找包管理器可用的包名</li>
 <li>自动完成长命令参数</li>
 </ul>
 </div>
 </div>
 </Layer>

 {/* 代码示例 */}
 <Layer title="核心代码实现" icon="💻" defaultOpen={false}>
 <div className="space-y-6">
 <div>
 <h3 className="text-lg font-bold text-heading mb-3">PtyManager - 会话管理器</h3>
 <CodeBlock code={ptyManagerCode} language="typescript" title="PtyManager" />
 </div>

 <div>
 <h3 className="text-lg font-bold text-heading mb-3">TerminalSession - 会话封装</h3>
 <CodeBlock code={terminalSessionCode} language="typescript" title="TerminalSession" />
 </div>

 <div>
 <h3 className="text-lg font-bold text-heading mb-3">InputHandler - 输入处理</h3>
 <CodeBlock code={inputHandlerCode} language="typescript" title="InputHandler" />
 </div>
 </div>
 </Layer>

 {/* 工具定义 */}
 <Layer title="工具接口定义" icon="🔧" defaultOpen={false}>
 <p className="text-body mb-4">
 PTY 系统通过四个工具暴露给 Agent：<code>run_in_terminal</code>、<code>write_to_terminal</code>、
 <code>resize_terminal</code>、<code>close_terminal</code>。这些工具遵循 Gemini CLI 统一的 ToolDefinition 接口，
 由 Tool Scheduler 统一调度。
 </p>
 <CodeBlock code={toolDefinitionCode} language="typescript" title="PTY 工具定义" />
 </Layer>

 {/* 安全考虑 */}
 <Layer title="安全考虑" icon="🛡️" defaultOpen={true}>
 <div className="space-y-4">
 <HighlightBox title="PTY 安全模型" icon="⚠️" color="red">
 <p className="text-sm text-body mb-3">
 PTY 会话提供完整的终端访问能力，相比普通 Shell 执行具有更大的攻击面。
 系统通过多层防御机制确保安全：
 </p>
 <ul className="text-sm text-body space-y-1">
 <li><strong>命令校验：</strong>创建会话前检查命令是否在白名单中，阻止已知危险命令模式</li>
 <li><strong>会话限制：</strong>最大并发会话数、单会话最大时长、输出缓冲区大小上限</li>
 <li><strong>环境隔离：</strong>清理危险环境变量 (LD_PRELOAD, DYLD_INSERT_LIBRARIES)</li>
 <li><strong>审批模式集成：</strong>在非 yolo 模式下，PTY 命令需要用户确认</li>
 </ul>
 </HighlightBox>

 <CodeBlock code={sandboxIntegrationCode} language="typescript" title="PTY 安全沙箱集成" />

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-surface p-4 rounded-lg border-l-2 border-l-edge-hover/30">
 <h4 className="text-heading font-bold mb-2">高风险操作</h4>
 <ul className="text-sm text-body space-y-1">
 <li>通过 PTY 执行 <code>rm -rf</code></li>
 <li>PTY 中运行 <code>sudo</code> 命令</li>
 <li>写入 <code>/etc</code> 系统配置</li>
 <li>修改 Shell 配置文件</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border-l-2 border-l-edge-hover/30">
 <h4 className="text-heading font-bold mb-2">防御策略</h4>
 <ul className="text-sm text-body space-y-1">
 <li>命令白名单过滤</li>
 <li>危险模式正则匹配</li>
 <li>资源使用量限制</li>
 <li>超时强制终止</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <h4 className="text-heading font-bold mb-2">审计与监控</h4>
 <ul className="text-sm text-body space-y-1">
 <li>会话创建/关闭日志</li>
 <li>输入/输出记录</li>
 <li>异常退出告警</li>
 <li>资源使用统计</li>
 </ul>
 </div>
 </div>
 </div>
 </Layer>

 {/* 与现有系统的集成 */}
 <Layer title="与现有系统的集成" icon="🔗" defaultOpen={false}>
 <div className="space-y-4">
 <p className="text-body">
 PTY 系统并非孤立存在，它与 Gemini CLI 的多个核心子系统紧密协作。
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <h4 className="text-heading font-bold mb-2">Tool Scheduler 集成</h4>
 <p className="text-sm text-body mb-2">
 PTY 工具 (run_in_terminal 等) 注册到 Tool Scheduler，与其他工具统一调度。
 Tool Scheduler 负责并发控制和执行超时，PTY 工具可与 Shell 执行工具 (run_shell_command) 并行使用。
 </p>
 <CodeBlock language="typescript" code={`// 工具注册
toolRegistry.register([
 runInTerminalTool,
 writeToTerminalTool,
 resizeTerminalTool,
 closeTerminalTool,
]);`} />
 </div>

 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <h4 className="text-heading font-bold mb-2">Shell 执行服务协作</h4>
 <p className="text-sm text-body mb-2">
 PTY 工具与 <code>run_shell_command</code> 工具互补。简单命令使用 Shell 执行（更快、更轻量），
 需要交互的命令使用 PTY。Model 根据命令特性自动选择合适的执行方式。
 </p>
 <CodeBlock language="typescript" code={`// Model 选择策略
// 简单命令 → run_shell_command
"ls -la", "cat file.txt", "git status"

// 交互式命令 → run_in_terminal
"vim config.ts", "top", "python3"`} />
 </div>

 <div className="bg-surface p-4 rounded-lg border-l-2 border-l-edge-hover/30">
 <h4 className="text-heading font-bold mb-2">审批模式 (Approval Mode)</h4>
 <p className="text-sm text-body">
 PTY 命令在非 yolo 模式下需要用户审批。审批系统会显示待执行的命令内容，
 用户可以选择允许、拒绝或加入会话白名单。PTY 工具复用现有的 PolicyEngine 进行权限检查，
 与 <code>run_shell_command</code> 共享同一套审批流程。
 </p>
 </div>

 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <h4 className="text-heading font-bold mb-2">Agent 循环集成</h4>
 <p className="text-sm text-body">
 PTY 工具在 Agent Loop 中可以跨多轮使用。Agent 可能在一轮中创建 PTY 会话，
 在后续多轮中写入命令、读取输出、调整大小，最后关闭会话。
 会话 ID 在工具结果中传递，确保 Model 跨轮次跟踪正确的会话。
 </p>
 </div>
 </div>

 <HighlightBox title="PTY vs Shell 执行选择指南" color="blue">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-dim">场景</th>
 <th className="text-left py-2 text-dim">推荐方式</th>
 <th className="text-left py-2 text-dim">原因</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/30">
 <td className="py-2">读取文件内容</td>
 <td className="py-2 text-heading">run_shell_command</td>
 <td className="py-2">无需交互，结果确定</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2">编辑文件 (vim)</td>
 <td className="py-2 text-heading">run_in_terminal</td>
 <td className="py-2">需要终端仿真和按键序列</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2">Git 操作</td>
 <td className="py-2 text-heading">run_shell_command</td>
 <td className="py-2">大部分 Git 命令非交互式</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2">系统监控 (top)</td>
 <td className="py-2 text-heading">run_in_terminal</td>
 <td className="py-2">持续刷新的 TUI 程序</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2">Python REPL</td>
 <td className="py-2 text-heading">run_in_terminal</td>
 <td className="py-2">多轮交互式输入</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2">安装依赖 (npm install)</td>
 <td className="py-2 text-heading">run_shell_command</td>
 <td className="py-2">单次执行，等待完成</td>
 </tr>
 </tbody>
 </table>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
