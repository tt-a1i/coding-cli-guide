import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'command-loading', label: '命令加载', description: '命令加载系统' },
  { id: 'custom-cmd', label: '自定义命令', description: 'TOML 命令定义' },
  { id: 'at-cmd', label: '@命令', description: '@文件引用' },
  { id: 'policy-engine', label: 'Policy引擎', description: 'Shell 权限检查' },
  { id: 'sandbox', label: '沙箱系统', description: '命令执行隔离' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--amber)]/10 to-[var(--terminal-green)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚙️</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">30秒快速理解</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-5">
          {/* 一句话总结 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <p className="text-[var(--text-primary)] font-medium">
              <span className="text-[var(--amber)] font-bold">一句话：</span>
              Prompt 预处理管道，支持 @文件注入、!Shell 命令执行、参数替换，将 TOML 模板转换为最终 Prompt
            </p>
          </div>

          {/* 关键数字 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">3</div>
              <div className="text-xs text-[var(--text-muted)]">处理器类型</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">2</div>
              <div className="text-xs text-[var(--text-muted)]">注入触发器</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">1</div>
              <div className="text-xs text-[var(--text-muted)]">参数占位符</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">链式</div>
              <div className="text-xs text-[var(--text-muted)]">执行模式</div>
            </div>
          </div>

          {/* 核心流程 */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">处理器链执行顺序</h4>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-3 py-1.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded-lg border border-[var(--cyber-blue)]/30">
                @{'{'}文件{'}'}
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--amber)]/20 text-[var(--amber)] rounded-lg border border-[var(--amber)]/30">
                !{'{'}Shell{'}'}
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                {'{'}{'{'} args {'}'}{'}'}
              </span>
            </div>
          </div>

          {/* 源码入口 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码入口:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/cli/src/services/prompt-processors/
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

export function PromptProcessors() {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  const pipelineFlowChart = `flowchart TD
    input([TOML prompt 模板])
    atFile[AtFileProcessor<br/>@文件注入]
    shell[ShellProcessor<br/>!命令执行]
    args[DefaultArgumentProcessor<br/>参数追加]
    output([最终 Prompt])

    input --> atFile
    atFile --> shell
    shell --> args
    args --> output

    style input fill:#6366f1,color:#fff
    style atFile fill:#22d3ee,color:#000
    style shell fill:#f59e0b,color:#000
    style args fill:#22c55e,color:#000
    style output fill:#a855f7,color:#fff`;

  const interfaceCode = `// packages/cli/src/services/prompt-processors/types.ts

/** Prompt 处理管道内容类型 */
export type PromptPipelineContent = PartUnion[];

/** 处理器接口 */
export interface IPromptProcessor {
  /**
   * 处理 Prompt 内容
   * @param prompt 当前 Prompt 状态（可能已被前序处理器修改）
   * @param context 命令上下文
   * @returns 处理后的 Prompt 内容
   */
  process(
    prompt: PromptPipelineContent,
    context: CommandContext,
  ): Promise<PromptPipelineContent>;
}

/** 触发器常量 */
export const SHORTHAND_ARGS_PLACEHOLDER = '{{args}}';  // 参数占位符
export const SHELL_INJECTION_TRIGGER = '!{';           // Shell 注入
export const AT_FILE_INJECTION_TRIGGER = '@{';         // 文件注入`;

  const atFileProcessorCode = `// packages/cli/src/services/prompt-processors/atFileProcessor.ts

export class AtFileProcessor implements IPromptProcessor {
  constructor(private readonly commandName?: string) {}

  async process(
    input: PromptPipelineContent,
    context: CommandContext,
  ): Promise<PromptPipelineContent> {
    return flatMapTextParts(input, async (text) => {
      // 无触发器则跳过
      if (!text.includes(AT_FILE_INJECTION_TRIGGER)) {
        return [{ text }];
      }

      // 解析注入点
      const injections = extractInjections(
        text,
        AT_FILE_INJECTION_TRIGGER,
        this.commandName,
      );

      const output: PromptPipelineContent = [];
      let lastIndex = 0;

      for (const injection of injections) {
        // 1. 添加注入点之前的文本
        const prefix = text.substring(lastIndex, injection.startIndex);
        if (prefix) output.push({ text: prefix });

        // 2. 读取文件内容
        const pathStr = injection.content;
        try {
          const fileContentParts = await readPathFromWorkspace(pathStr, config);
          if (fileContentParts.length === 0) {
            // 文件被 .gitignore 忽略
            context.ui.addItem({ type: MessageType.INFO,
              text: \`File '@{\${pathStr}}' was ignored\` });
          }
          output.push(...fileContentParts);
        } catch (error) {
          // 读取失败，保留原始占位符
          context.ui.addItem({ type: MessageType.ERROR,
            text: \`Failed to inject '@{\${pathStr}}'\` });
          output.push({ text: text.substring(injection.startIndex, injection.endIndex) });
        }

        lastIndex = injection.endIndex;
      }

      // 3. 添加最后一段文本
      const suffix = text.substring(lastIndex);
      if (suffix) output.push({ text: suffix });

      return output;
    });
  }
}`;

  const shellProcessorCode = `// packages/cli/src/services/prompt-processors/shellProcessor.ts

export class ShellProcessor implements IPromptProcessor {
  constructor(private readonly commandName: string) {}

  async process(
    prompt: PromptPipelineContent,
    context: CommandContext,
  ): Promise<PromptPipelineContent> {
    return flatMapTextParts(prompt, (text) =>
      this.processString(text, context)
    );
  }

  private async processString(
    prompt: string,
    context: CommandContext,
  ): Promise<PromptPipelineContent> {
    const userArgsRaw = context.invocation?.args || '';

    // 无 Shell 触发器，仅替换 {{args}}
    if (!prompt.includes(SHELL_INJECTION_TRIGGER)) {
      return [{ text: prompt.replaceAll(SHORTHAND_ARGS_PLACEHOLDER, userArgsRaw) }];
    }

    // 解析所有 !{...} 注入点
    const injections = extractInjections(prompt, SHELL_INJECTION_TRIGGER);

    // 安全检查：Shell 命令权限
    const commandsToConfirm = new Set<string>();
    for (const injection of injections) {
      const { allAllowed, disallowedCommands, isHardDenial } =
        checkCommandPermissions(injection.resolvedCommand, config);

      if (isHardDenial) {
        throw new Error(\`Blocked command: "\${injection.resolvedCommand}"\`);
      }

      if (!allAllowed && approvalMode !== ApprovalMode.YOLO) {
        disallowedCommands.forEach((c) => commandsToConfirm.add(c));
      }
    }

    // 需要用户确认
    if (commandsToConfirm.size > 0) {
      throw new ConfirmationRequiredError(
        'Shell command confirmation required',
        Array.from(commandsToConfirm),
      );
    }

    // 执行 Shell 命令并替换
    let processedPrompt = '';
    let lastIndex = 0;

    for (const injection of injections) {
      // 添加前置文本（替换 {{args}} 为原始值）
      processedPrompt += prompt.substring(lastIndex, injection.startIndex)
        .replaceAll(SHORTHAND_ARGS_PLACEHOLDER, userArgsRaw);

      // 执行命令
      const { result } = await ShellExecutionService.execute(
        injection.resolvedCommand,
        config.getTargetDir(),
      );
      processedPrompt += (await result).output;

      lastIndex = injection.endIndex;
    }

    // 添加尾部文本
    processedPrompt += prompt.substring(lastIndex)
      .replaceAll(SHORTHAND_ARGS_PLACEHOLDER, userArgsRaw);

    return [{ text: processedPrompt }];
  }
}`;

  const argsProcessorCode = `// 默认参数处理器

export class DefaultArgumentProcessor implements IPromptProcessor {
  async process(
    prompt: PromptPipelineContent,
    context: CommandContext,
  ): Promise<PromptPipelineContent> {
    const userArgs = context.invocation?.args?.trim();

    // 无用户参数则原样返回
    if (!userArgs) {
      return prompt;
    }

    // 在 Prompt 末尾追加用户参数
    return [...prompt, { text: \`\\n\\n\${userArgs}\` }];
  }
}

// 使用场景：
// 当 TOML 模板中没有 {{args}} 占位符时，
// 自动将用户输入追加到 Prompt 末尾`;

  const injectionParserCode = `// packages/cli/src/services/prompt-processors/injectionParser.ts

export interface Injection {
  startIndex: number;   // 注入起始位置
  endIndex: number;     // 注入结束位置
  content: string;      // 大括号内的内容
}

/**
 * 解析注入点，支持嵌套大括号
 *
 * 示例：
 * "前缀 !{echo {nested}} 后缀"
 * → [{ startIndex: 3, endIndex: 20, content: "echo {nested}" }]
 */
export function extractInjections(
  text: string,
  trigger: string,  // "!{" 或 "@{"
  commandName?: string,
): Injection[] {
  const injections: Injection[] = [];
  let i = 0;

  while (i < text.length) {
    const triggerIndex = text.indexOf(trigger, i);
    if (triggerIndex === -1) break;

    // 寻找匹配的闭合大括号（处理嵌套）
    let depth = 1;
    let j = triggerIndex + trigger.length;

    while (j < text.length && depth > 0) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}') depth--;
      j++;
    }

    if (depth !== 0) {
      throw new Error(
        \`Unmatched brace in \${commandName || 'prompt'} at position \${triggerIndex}\`
      );
    }

    injections.push({
      startIndex: triggerIndex,
      endIndex: j,
      content: text.substring(triggerIndex + trigger.length, j - 1),
    });

    i = j;
  }

  return injections;
}`;

  return (
    <div className="space-y-8">
      <QuickSummary
        isExpanded={isSummaryExpanded}
        onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
      />

      {/* 页面标题 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Prompt 处理器</h2>
        <p className="text-gray-300 mb-4">
          Prompt 处理器是自定义命令的核心组件，将 TOML 模板中的特殊语法（@文件引用、!Shell 命令、{'{{args}}'} 参数）
          转换为最终发送给 AI 的 Prompt 内容。处理器以管道方式链式执行，确保安全性和灵活性。
        </p>
      </section>

      {/* 1. 管道架构 */}
      <Layer title="处理器管道" icon="🔄">
        <div className="space-y-4">
          <MermaidDiagram chart={pipelineFlowChart} title="处理器执行顺序" />
          <CodeBlock code={interfaceCode} language="typescript" title="处理器接口与触发器" />

          <HighlightBox title="执行顺序设计" variant="blue">
            <div className="text-sm space-y-2 text-gray-300">
              <p><strong>为什么 @文件先于 !Shell？</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>安全性</strong>：先注入静态文件，再执行 Shell</li>
                <li><strong>防注入</strong>：避免 Shell 动态生成恶意 @路径</li>
                <li><strong>可预测</strong>：文件内容在 Shell 执行前确定</li>
              </ul>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 2. AtFileProcessor */}
      <Layer title="@文件处理器" icon="📄">
        <div className="space-y-4">
          <CodeBlock code={atFileProcessorCode} language="typescript" title="AtFileProcessor" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HighlightBox title="语法" variant="blue">
              <div className="text-sm space-y-2">
                <code className="block bg-black/30 px-2 py-1 rounded">@{'{path/to/file}'}</code>
                <p className="text-gray-400 mt-2">示例：</p>
                <code className="block bg-black/30 px-2 py-1 rounded text-xs">
                  Review this: @{'{src/main.ts}'}
                </code>
              </div>
            </HighlightBox>

            <HighlightBox title="行为" variant="green">
              <div className="text-sm space-y-2 text-gray-400">
                <ul className="space-y-1">
                  <li>• 读取文件内容注入 Prompt</li>
                  <li>• 支持图片等多模态内容</li>
                  <li>• 尊重 .gitignore 规则</li>
                  <li>• 失败时保留原始占位符</li>
                </ul>
              </div>
            </HighlightBox>
          </div>
        </div>
      </Layer>

      {/* 3. ShellProcessor */}
      <Layer title="!Shell 处理器" icon="💻">
        <div className="space-y-4">
          <CodeBlock code={shellProcessorCode} language="typescript" title="ShellProcessor" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HighlightBox title="语法" variant="yellow">
              <div className="text-sm space-y-2">
                <code className="block bg-black/30 px-2 py-1 rounded">!{'{shell command}'}</code>
                <p className="text-gray-400 mt-2">带参数：</p>
                <code className="block bg-black/30 px-2 py-1 rounded text-xs">
                  !{'{grep "{{args}}" src/}'}
                </code>
              </div>
            </HighlightBox>

            <HighlightBox title="安全特性" variant="red">
              <div className="text-sm space-y-2 text-gray-400">
                <ul className="space-y-1">
                  <li>• {'{{args}}'} 自动 Shell 转义</li>
                  <li>• Policy 权限检查</li>
                  <li>• 危险命令硬拒绝</li>
                  <li>• 非 YOLO 模式需确认</li>
                </ul>
              </div>
            </HighlightBox>
          </div>

          <MermaidDiagram chart={`sequenceDiagram
    participant SP as ShellProcessor
    participant PE as PolicyEngine
    participant SE as ShellExecutionService
    participant User as 用户

    SP->>SP: 解析 !{...} 注入点
    SP->>SP: 替换 {{args}} (转义)
    SP->>PE: checkCommandPermissions
    alt 硬拒绝
        PE-->>SP: isHardDenial = true
        SP-->>SP: throw Error
    else 需要确认
        PE-->>SP: disallowedCommands
        SP-->>SP: throw ConfirmationRequiredError
        User-->>SP: 确认/拒绝
    else 允许
        PE-->>SP: allAllowed = true
        SP->>SE: execute(command)
        SE-->>SP: output
    end`} title="Shell 安全检查流程" />
        </div>
      </Layer>

      {/* 4. DefaultArgumentProcessor */}
      <Layer title="参数处理器" icon="📝">
        <div className="space-y-4">
          <CodeBlock code={argsProcessorCode} language="typescript" title="DefaultArgumentProcessor" />

          <HighlightBox title="使用场景" variant="purple">
            <div className="text-sm space-y-2 text-gray-300">
              <p><strong>场景 A：模板使用 {'{{args}}'}</strong></p>
              <code className="block bg-black/30 px-2 py-1 rounded text-xs mb-2">
                prompt = "Explain: {'{{args}}'}"
              </code>
              <p className="text-gray-400">→ ShellProcessor 处理，DefaultArgumentProcessor 跳过</p>

              <p className="mt-3"><strong>场景 B：模板无 {'{{args}}'}</strong></p>
              <code className="block bg-black/30 px-2 py-1 rounded text-xs mb-2">
                prompt = "Summarize the code"
              </code>
              <p className="text-gray-400">→ DefaultArgumentProcessor 追加用户输入到末尾</p>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 5. 注入解析器 */}
      <Layer title="注入点解析" icon="🔍">
        <div className="space-y-4">
          <CodeBlock code={injectionParserCode} language="typescript" title="extractInjections" />

          <HighlightBox title="嵌套大括号处理" variant="blue">
            <div className="text-sm space-y-2 text-gray-300">
              <p><strong>示例输入：</strong></p>
              <code className="block bg-black/30 px-2 py-1 rounded text-xs">
                !{'{echo ${NESTED_VAR}}'}
              </code>
              <p className="mt-2"><strong>解析结果：</strong></p>
              <ul className="text-gray-400 space-y-1">
                <li>• content: <code>"echo ${'{NESTED_VAR}'}"</code></li>
                <li>• 深度计数确保匹配正确的闭合括号</li>
                <li>• 未闭合时抛出错误</li>
              </ul>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 6. 完整示例 */}
      <Layer title="完整示例" icon="💡">
        <div className="space-y-4">
          <CodeBlock code={`# commands/review.toml

prompt = """
Review the following code changes:

@{.git/COMMIT_EDITMSG}

Git diff:
!{git diff HEAD~1}

Additional context: {{args}}
"""`} language="toml" title="自定义命令模板" />

          <MermaidDiagram chart={`flowchart LR
    subgraph Input["输入"]
        toml[review.toml]
        user["/review focus on security"]
    end

    subgraph Pipeline["处理管道"]
        at["@{.git/COMMIT_EDITMSG}<br/>→ 提交消息内容"]
        shell["!{git diff}<br/>→ diff 输出"]
        args["{{args}}<br/>→ focus on security"]
    end

    subgraph Output["输出"]
        final[最终 Prompt]
    end

    toml --> at
    user --> args
    at --> shell
    shell --> args
    args --> final`} title="处理流程示例" />
        </div>
      </Layer>

      {/* 7. 关键文件 */}
      <Layer title="关键文件与入口" icon="📁">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/cli/src/services/prompt-processors/types.ts
            </code>
            <span className="text-gray-400">IPromptProcessor 接口与常量</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/cli/src/services/prompt-processors/atFileProcessor.ts
            </code>
            <span className="text-gray-400">@文件注入处理器</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/cli/src/services/prompt-processors/shellProcessor.ts
            </code>
            <span className="text-gray-400">!Shell 命令处理器</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/cli/src/services/prompt-processors/argumentProcessor.ts
            </code>
            <span className="text-gray-400">默认参数处理器</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/cli/src/services/prompt-processors/injectionParser.ts
            </code>
            <span className="text-gray-400">注入点解析工具</span>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
