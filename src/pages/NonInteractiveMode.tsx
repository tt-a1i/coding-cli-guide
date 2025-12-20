import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';

export function NonInteractiveMode() {
  const nonInteractiveFlow = `
flowchart TD
    start["命令行启动<br/>innies -p &quot;prompt&quot;"]
    parse_args["解析命令行参数"]
    check_stdin{"检查 stdin<br/>输入"}
    read_stdin["读取 stdin<br/>内容"]
    process_at["处理 @path<br/>文件引用"]
    build_prompt["构建完整<br/>prompt"]
    execute["执行 AI 请求"]
    is_multi{"多轮对话?"}
    continue["继续对话"]
    output["输出结果<br/>(stdout/文件)"]
    exit["退出<br/>(exit code)"]

    start --> parse_args
    parse_args --> check_stdin
    check_stdin -->|有| read_stdin
    check_stdin -->|无| process_at
    read_stdin --> process_at
    process_at --> build_prompt
    build_prompt --> execute
    execute --> is_multi
    is_multi -->|Yes| continue
    is_multi -->|No| output
    continue --> execute
    output --> exit

    style start fill:#22d3ee,color:#000
    style exit fill:#22c55e,color:#000
    style check_stdin fill:#f59e0b,color:#000
    style is_multi fill:#f59e0b,color:#000
`;

  const cliOptionsCode = `// packages/cli/src/nonInteractiveCli.ts

// 非交互模式命令行参数
interface NonInteractiveOptions {
  // 核心参数
  prompt?: string;              // -p, --prompt: 提示词
  stdin?: boolean;              // 从 stdin 读取输入
  output?: string;              // -o, --output: 输出文件
  format?: OutputFormat;        // --format: 输出格式

  // 执行控制
  maxTurns?: number;            // --max-turns: 最大对话轮数
  timeout?: number;             // --timeout: 超时时间 (秒)
  yesToAll?: boolean;           // -y, --yes: 自动确认所有操作

  // 上下文
  context?: string[];           // -c, --context: 额外上下文文件
  systemPrompt?: string;        // --system: 系统提示词
  resume?: string;              // --resume: 恢复会话 ID

  // 工具控制
  allowedTools?: string[];      // --tools: 允许的工具列表
  disabledTools?: string[];     // --no-tools: 禁用的工具
  sandbox?: boolean;            // --sandbox: 启用沙箱

  // 输出控制
  verbose?: boolean;            // -v, --verbose: 详细输出
  quiet?: boolean;              // -q, --quiet: 静默模式
  json?: boolean;               // --json: JSON 输出
}

type OutputFormat =
  | 'text'      // 纯文本 (默认)
  | 'markdown'  // Markdown 格式
  | 'json'      // JSON 结构化输出
  | 'stream';   // 流式输出`;

  const usageExamplesCode = `# 非交互模式使用示例

# 基本用法：单次请求
innies -p "解释这段代码的作用" @src/main.ts

# 从 stdin 读取输入
cat error.log | innies -p "分析这个错误日志"
git diff | innies -p "为这些更改写一个提交信息"

# 输出到文件
innies -p "生成 API 文档" @src/api.ts -o docs/api.md

# JSON 格式输出
innies -p "列出所有 TODO 项" --json > todos.json

# 多轮对话模式
innies -p "重构这个函数" @func.ts --max-turns 5

# 自动确认所有操作
innies -p "修复所有 lint 错误" --yes

# 指定系统提示词
innies -p "review code" --system "你是一个严格的代码审查员"

# 恢复之前的会话
innies -p "继续之前的任务" --resume session-abc123

# 限制可用工具
innies -p "只分析代码，不要修改" --tools "Read,Grep,Glob"

# 禁用危险工具
innies -p "清理项目" --no-tools "run_shell_command"

# 使用沙箱执行
innies -p "运行测试" --sandbox

# 设置超时
innies -p "分析大型代码库" --timeout 300

# 管道链式调用
innies -p "提取函数列表" @src/*.ts --json | \\
  jq '.functions[]' | \\
  innies -p "为每个函数生成测试"`;

  const implementationCode = `// 非交互模式主函数
// packages/cli/src/nonInteractiveCli.ts

export async function runNonInteractive(
  options: NonInteractiveOptions
): Promise<number> {
  // 1. 收集输入
  let input = options.prompt || '';

  // 从 stdin 读取
  if (options.stdin || !process.stdin.isTTY) {
    const stdinContent = await readStdin();
    input = stdinContent + '\\n' + input;
  }

  // 2. 处理 @ 文件引用
  input = await processAtReferences(input);

  // 3. 添加上下文文件
  if (options.context) {
    for (const file of options.context) {
      const content = await fs.readFile(file, 'utf-8');
      input += \`\\n\\n# Context from \${file}:\\n\${content}\`;
    }
  }

  // 4. 创建会话
  const session = await createSession({
    systemPrompt: options.systemPrompt,
    maxTurns: options.maxTurns || 1,
    timeout: options.timeout,
    yesToAll: options.yesToAll,
    sandbox: options.sandbox,
    allowedTools: options.allowedTools,
    disabledTools: options.disabledTools,
    resumeId: options.resume,
  });

  // 5. 执行对话
  try {
    const result = await session.execute(input);

    // 6. 输出结果
    await outputResult(result, options);

    return result.exitCode || 0;

  } catch (error) {
    if (!options.quiet) {
      console.error('Error:', (error as Error).message);
    }
    return 1;

  } finally {
    await session.cleanup();
  }
}

// 读取 stdin
async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString()));
    process.stdin.on('error', reject);
  });
}`;

  const outputHandlingCode = `// 输出处理
// packages/cli/src/nonInteractiveCli.ts

interface ExecutionResult {
  text: string;
  toolCalls?: ToolCallResult[];
  exitCode?: number;
  metadata?: {
    model: string;
    turns: number;
    tokensUsed: number;
    duration: number;
  };
}

async function outputResult(
  result: ExecutionResult,
  options: NonInteractiveOptions
): Promise<void> {
  let output: string;

  // 格式化输出
  switch (options.format || 'text') {
    case 'json':
      output = JSON.stringify(result, null, 2);
      break;

    case 'markdown':
      output = formatAsMarkdown(result);
      break;

    case 'stream':
      // 流式输出已在执行过程中处理
      return;

    default:
      output = result.text;
  }

  // 输出目标
  if (options.output) {
    // 写入文件
    await fs.writeFile(options.output, output);
    if (!options.quiet) {
      console.error(\`Output written to: \${options.output}\`);
    }
  } else {
    // 输出到 stdout
    process.stdout.write(output);
    if (!output.endsWith('\\n')) {
      process.stdout.write('\\n');
    }
  }
}

// 格式化为 Markdown
function formatAsMarkdown(result: ExecutionResult): string {
  let md = result.text;

  if (result.toolCalls?.length) {
    md += '\\n\\n## Tool Calls\\n\\n';
    for (const call of result.toolCalls) {
      md += \`### \${call.name}\\n\`;
      md += \`\\\`\\\`\\\`\\n\${JSON.stringify(call.args, null, 2)}\\n\\\`\\\`\\\`\\n\`;
      if (call.result) {
        md += \`\\nResult:\\n\\\`\\\`\\\`\\n\${call.result}\\n\\\`\\\`\\\`\\n\`;
      }
    }
  }

  if (result.metadata) {
    md += \`\\n\\n---\\n\`;
    md += \`*Model: \${result.metadata.model}, \`;
    md += \`Turns: \${result.metadata.turns}, \`;
    md += \`Tokens: \${result.metadata.tokensUsed}, \`;
    md += \`Duration: \${result.metadata.duration}ms*\\n\`;
  }

  return md;
}`;

  const multiTurnCode = `// 多轮对话处理
// packages/cli/src/nonInteractiveCli.ts

interface SessionConfig {
  maxTurns: number;
  timeout: number;
  yesToAll: boolean;
  // ...
}

class NonInteractiveSession {
  private turnCount = 0;
  private history: Message[] = [];

  async execute(input: string): Promise<ExecutionResult> {
    this.turnCount++;

    // 检查是否超过最大轮数
    if (this.turnCount > this.config.maxTurns) {
      throw new Error(
        \`Exceeded max turns (\${this.config.maxTurns})\`
      );
    }

    // 添加用户消息到历史
    this.history.push({ role: 'user', content: input });

    // 调用 AI
    const response = await this.ai.generate({
      messages: this.history,
      tools: this.getAvailableTools(),
    });

    // 添加 AI 响应到历史
    this.history.push({ role: 'assistant', content: response.text });

    // 处理工具调用
    if (response.toolCalls?.length) {
      const toolResults = await this.executeTools(
        response.toolCalls
      );

      // 如果需要继续对话
      if (this.shouldContinue(response, toolResults)) {
        // 构建下一轮输入
        const nextInput = this.buildContinuationPrompt(toolResults);
        return this.execute(nextInput);
      }
    }

    return {
      text: response.text,
      toolCalls: response.toolCalls,
      exitCode: 0,
      metadata: {
        model: this.config.model,
        turns: this.turnCount,
        tokensUsed: response.tokensUsed,
        duration: Date.now() - this.startTime,
      },
    };
  }

  // 判断是否需要继续对话
  private shouldContinue(
    response: AIResponse,
    toolResults: ToolResult[]
  ): boolean {
    // 如果 AI 明确表示任务完成，停止
    if (response.text.includes('[TASK_COMPLETE]')) {
      return false;
    }

    // 如果还有未完成的工具调用，继续
    if (toolResults.some(r => r.requiresFollowUp)) {
      return true;
    }

    // 如果未达到最大轮数且有更多工作，继续
    return this.turnCount < this.config.maxTurns &&
           response.needsMoreWork;
  }
}`;

  const exitCodesCode = `// 退出码定义
// packages/cli/src/nonInteractiveCli.ts

export enum ExitCode {
  SUCCESS = 0,           // 成功
  GENERAL_ERROR = 1,     // 一般错误
  INVALID_ARGS = 2,      // 参数错误
  AUTH_ERROR = 3,        // 认证错误
  NETWORK_ERROR = 4,     // 网络错误
  TIMEOUT = 5,           // 超时
  TOOL_ERROR = 6,        // 工具执行错误
  PERMISSION_DENIED = 7, // 权限拒绝
  USER_ABORT = 130,      // 用户中断 (Ctrl+C)
}

// 根据错误类型返回退出码
function getExitCode(error: Error): number {
  if (error instanceof AuthenticationError) {
    return ExitCode.AUTH_ERROR;
  }
  if (error instanceof NetworkError) {
    return ExitCode.NETWORK_ERROR;
  }
  if (error instanceof TimeoutError) {
    return ExitCode.TIMEOUT;
  }
  if (error instanceof ToolExecutionError) {
    return ExitCode.TOOL_ERROR;
  }
  if (error.message.includes('permission')) {
    return ExitCode.PERMISSION_DENIED;
  }
  return ExitCode.GENERAL_ERROR;
}

// 在脚本中使用退出码
// $ innies -p "test" && echo "success" || echo "failed"
// $ if innies -p "check"; then deploy; fi`;

  const ciIntegrationCode = `# CI/CD 集成示例

# GitHub Actions
name: Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: AI Code Review
        run: |
          git diff origin/main...HEAD | \\
            innies -p "审查这些代码更改，指出潜在问题" \\
            --json > review.json

      - name: Check Review Result
        run: |
          if jq -e '.issues | length > 0' review.json; then
            echo "发现问题，请查看 review.json"
            exit 1
          fi

# GitLab CI
code-review:
  script:
    - |
      innies -p "检查代码质量" @src/ \\
        --tools "Read,Grep,Glob" \\
        --timeout 120 \\
        --yes

# Jenkins Pipeline
pipeline {
  stages {
    stage('AI Analysis') {
      steps {
        sh '''
          innies -p "分析测试覆盖率并建议改进" \\
            @coverage/lcov.info \\
            -o reports/ai-analysis.md
        '''
      }
    }
  }
}

# 本地 Git Hook (pre-commit)
#!/bin/bash
# .git/hooks/pre-commit

staged_files=$(git diff --cached --name-only --diff-filter=ACM)
if [ -n "$staged_files" ]; then
  echo "$staged_files" | xargs innies -p "快速检查这些文件" --quiet
  if [ $? -ne 0 ]; then
    echo "AI 检查未通过"
    exit 1
  fi
fi`;

  return (
    <div className="space-y-8">
      {/* 概述 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">非交互模式</h2>
        <p className="text-gray-300 mb-4">
          非交互模式允许 CLI 在无需用户实时输入的情况下运行，适用于脚本自动化、CI/CD 集成、
          管道处理等场景。支持从 stdin 读取、输出到文件、JSON 格式化等功能。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <HighlightBox title="单次请求" color="blue">
            <code className="text-sm">innies -p "prompt"</code>
            <p className="text-xs text-gray-400 mt-1">执行一次请求后退出</p>
          </HighlightBox>

          <HighlightBox title="管道输入" color="green">
            <code className="text-sm">cat file | innies</code>
            <p className="text-xs text-gray-400 mt-1">从 stdin 读取内容</p>
          </HighlightBox>

          <HighlightBox title="文件输出" color="yellow">
            <code className="text-sm">innies -p "..." -o out.md</code>
            <p className="text-xs text-gray-400 mt-1">结果写入文件</p>
          </HighlightBox>

          <HighlightBox title="JSON 格式" color="purple">
            <code className="text-sm">innies --json</code>
            <p className="text-xs text-gray-400 mt-1">结构化输出</p>
          </HighlightBox>
        </div>
      </section>

      {/* 执行流程 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">执行流程</h3>
        <MermaidDiagram chart={nonInteractiveFlow} title="非交互模式执行流程" />
      </section>

      {/* 命令行参数 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">命令行参数</h3>
        <CodeBlock code={cliOptionsCode} language="typescript" title="参数定义" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-2">常用参数速查</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left p-2">参数</th>
                <th className="text-left p-2">简写</th>
                <th className="text-left p-2">说明</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>--prompt</code></td>
                <td className="p-2"><code>-p</code></td>
                <td className="p-2">提示词</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>--output</code></td>
                <td className="p-2"><code>-o</code></td>
                <td className="p-2">输出文件路径</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>--yes</code></td>
                <td className="p-2"><code>-y</code></td>
                <td className="p-2">自动确认所有操作</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>--json</code></td>
                <td className="p-2">-</td>
                <td className="p-2">JSON 格式输出</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>--quiet</code></td>
                <td className="p-2"><code>-q</code></td>
                <td className="p-2">静默模式</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>--max-turns</code></td>
                <td className="p-2">-</td>
                <td className="p-2">最大对话轮数</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>--timeout</code></td>
                <td className="p-2">-</td>
                <td className="p-2">超时时间 (秒)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 使用示例 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">使用示例</h3>
        <CodeBlock code={usageExamplesCode} language="bash" title="命令行示例" />
      </section>

      {/* 实现代码 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">实现逻辑</h3>
        <CodeBlock code={implementationCode} language="typescript" title="主函数" />
      </section>

      {/* 输出处理 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">输出处理</h3>
        <CodeBlock code={outputHandlingCode} language="typescript" title="输出格式化" />

        <div className="mt-4 grid grid-cols-3 gap-4">
          <HighlightBox title="text" color="blue">
            <p className="text-sm">纯文本输出，默认格式</p>
            <p className="text-xs text-gray-400 mt-1">适合人类阅读</p>
          </HighlightBox>

          <HighlightBox title="json" color="green">
            <p className="text-sm">JSON 结构化输出</p>
            <p className="text-xs text-gray-400 mt-1">适合程序解析</p>
          </HighlightBox>

          <HighlightBox title="markdown" color="purple">
            <p className="text-sm">Markdown 格式输出</p>
            <p className="text-xs text-gray-400 mt-1">适合文档生成</p>
          </HighlightBox>
        </div>
      </section>

      {/* 多轮对话 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">多轮对话模式</h3>
        <CodeBlock code={multiTurnCode} language="typescript" title="多轮对话处理" />
      </section>

      {/* 退出码 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">退出码</h3>
        <CodeBlock code={exitCodesCode} language="typescript" title="退出码定义" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-2">退出码参考</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <table className="w-full">
                <tbody className="text-gray-300">
                  <tr>
                    <td className="py-1"><code className="text-green-400">0</code></td>
                    <td className="py-1">成功</td>
                  </tr>
                  <tr>
                    <td className="py-1"><code className="text-red-400">1</code></td>
                    <td className="py-1">一般错误</td>
                  </tr>
                  <tr>
                    <td className="py-1"><code className="text-red-400">2</code></td>
                    <td className="py-1">参数错误</td>
                  </tr>
                  <tr>
                    <td className="py-1"><code className="text-red-400">3</code></td>
                    <td className="py-1">认证错误</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <table className="w-full">
                <tbody className="text-gray-300">
                  <tr>
                    <td className="py-1"><code className="text-red-400">4</code></td>
                    <td className="py-1">网络错误</td>
                  </tr>
                  <tr>
                    <td className="py-1"><code className="text-red-400">5</code></td>
                    <td className="py-1">超时</td>
                  </tr>
                  <tr>
                    <td className="py-1"><code className="text-red-400">6</code></td>
                    <td className="py-1">工具执行错误</td>
                  </tr>
                  <tr>
                    <td className="py-1"><code className="text-yellow-400">130</code></td>
                    <td className="py-1">用户中断 (Ctrl+C)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CI/CD 集成 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">CI/CD 集成</h3>
        <CodeBlock code={ciIntegrationCode} language="yaml" title="CI/CD 配置示例" />
      </section>

      {/* 架构图 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">非交互模式架构</h3>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <pre className="text-sm text-gray-300 overflow-x-auto">
{`┌──────────────────────────────────────────────────────────────────┐
│                    Command Line Interface                        │
│                                                                  │
│  $ innies -p "prompt" @file.ts --json -o output.json            │
│                                                                  │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Argument Parser                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  yargs                                                    │   │
│  │  ├── -p, --prompt    : "prompt"                          │   │
│  │  ├── @file.ts        : File reference                    │   │
│  │  ├── --json          : Output format                     │   │
│  │  └── -o output.json  : Output file                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Input Processor                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │  stdin Reader  │  │  @ Reference   │  │   Context      │     │
│  │                │  │   Resolver     │  │   Loader       │     │
│  │  cat file |    │  │   @path →      │  │   --context    │     │
│  │  innies        │  │   content      │  │   files        │     │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘     │
│          └───────────────────┴───────────────────┘               │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Non-Interactive Session                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    AI Executor                            │   │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────┐              │   │
│  │  │ Turn 1  │ →  │ Turn 2  │ →  │ Turn N  │              │   │
│  │  └─────────┘    └─────────┘    └─────────┘              │   │
│  │       │              │              │                    │   │
│  │       ▼              ▼              ▼                    │   │
│  │  ┌─────────────────────────────────────┐                │   │
│  │  │         Tool Execution              │                │   │
│  │  │  (--yes: auto-confirm)              │                │   │
│  │  └─────────────────────────────────────┘                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Output Handler                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │  Text Format   │  │  JSON Format   │  │  Markdown      │     │
│  │                │  │                │  │  Format        │     │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘     │
│          └───────────────────┴───────────────────┘               │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────┐      │
│  │         stdout          │           file              │      │
│  │         (default)       │         (-o path)           │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                  │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                        Exit Handler                              │
│                                                                  │
│  process.exit(exitCode)                                          │
│  0: Success | 1-7: Various errors | 130: User abort              │
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
            <h4 className="text-green-400 font-semibold mb-2">推荐做法</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ CI/CD 中使用 <code>--yes</code> 自动确认</li>
              <li>✓ 设置合理的 <code>--timeout</code></li>
              <li>✓ 使用 <code>--json</code> 便于程序解析</li>
              <li>✓ 检查退出码处理错误</li>
              <li>✓ 限制 <code>--max-turns</code> 防止无限循环</li>
            </ul>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-400 font-semibold mb-2">注意事项</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>⚠ 确保 API 密钥在环境变量中</li>
              <li>⚠ 大文件通过 <code>@path</code> 传递</li>
              <li>⚠ 敏感操作启用 <code>--sandbox</code></li>
              <li>⚠ 日志输出到 stderr，结果到 stdout</li>
              <li>⚠ 使用 <code>--tools</code> 限制可用工具</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
