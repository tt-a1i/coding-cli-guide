import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';
import { FlowDiagram } from '../components/FlowDiagram';

export function SubagentSystem() {
  // 模板替换流程图
  const templateFlow = {
    title: '模板变量替换流程',
    nodes: [
      { id: 'start', label: 'System Prompt\n模板', type: 'start' as const },
      { id: 'context', label: 'ContextState\n设置变量', type: 'process' as const },
      { id: 'extract', label: '提取占位符\n${key}', type: 'process' as const },
      { id: 'check', label: '所有 key\n都存在?', type: 'decision' as const },
      { id: 'replace', label: '执行替换\nString(value)', type: 'process' as const },
      { id: 'error', label: '抛出异常\nMissing keys', type: 'end' as const },
      { id: 'done', label: '最终 Prompt', type: 'end' as const },
    ],
    edges: [
      { from: 'start', to: 'context' },
      { from: 'context', to: 'extract' },
      { from: 'extract', to: 'check' },
      { from: 'check', to: 'error', label: 'No' },
      { from: 'check', to: 'replace', label: 'Yes' },
      { from: 'replace', to: 'done' },
    ],
  };

  // 非交互执行流程图
  const executionFlow = {
    title: '非交互式执行流程',
    nodes: [
      { id: 'start', label: '初始化\nSubAgentScope', type: 'start' as const },
      { id: 'tools', label: '准备工具列表\n(过滤 Task 工具)', type: 'process' as const },
      { id: 'check_limit', label: '检查\n终止条件', type: 'decision' as const },
      { id: 'send', label: '发送消息\n流式响应', type: 'process' as const },
      { id: 'has_tools', label: '有工具\n调用?', type: 'decision' as const },
      { id: 'exec_tools', label: '并行执行\n工具调用', type: 'process' as const },
      { id: 'goal', label: '任务完成\nGOAL', type: 'end' as const },
      { id: 'limit', label: '达到限制\nMAX_TURNS/TIMEOUT', type: 'end' as const },
    ],
    edges: [
      { from: 'start', to: 'tools' },
      { from: 'tools', to: 'check_limit' },
      { from: 'check_limit', to: 'limit', label: '超限' },
      { from: 'check_limit', to: 'send', label: '继续' },
      { from: 'send', to: 'has_tools' },
      { from: 'has_tools', to: 'goal', label: 'No' },
      { from: 'has_tools', to: 'exec_tools', label: 'Yes' },
      { from: 'exec_tools', to: 'check_limit' },
    ],
  };

  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">子代理系统 (Subagent System)</h2>

      {/* 概述 */}
      <Layer title="什么是子代理？" icon="🤖">
        <HighlightBox title="Subagent 概念" icon="💡" variant="blue">
          <p className="mb-2">
            <strong>子代理 (Subagent)</strong> 是专门用于执行特定任务的独立 AI 代理。
            每个子代理有自己的系统提示、工具配置和运行参数。
          </p>
          <p>
            通过子代理，CLI 可以将复杂任务分解并委托给专门的代理处理，提高任务完成质量。
            子代理以<strong>非交互模式</strong>运行，不会询问用户问题，直接根据可用上下文完成任务。
          </p>
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">📂</div>
            <h4 className="text-cyan-400 font-bold">项目级</h4>
            <p className="text-sm text-gray-400">.innies/agents/*.md</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">🏠</div>
            <h4 className="text-cyan-400 font-bold">用户级</h4>
            <p className="text-sm text-gray-400">~/.innies/agents/*.md</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">📦</div>
            <h4 className="text-cyan-400 font-bold">内置</h4>
            <p className="text-sm text-gray-400">BuiltinAgentRegistry</p>
          </div>
        </div>
      </Layer>

      {/* 三级子代理对比 */}
      <Layer title="三级子代理详细对比" icon="📊">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="border border-gray-700 p-3 text-left text-cyan-400">特性</th>
                <th className="border border-gray-700 p-3 text-center text-purple-400">📂 项目级 (Project)</th>
                <th className="border border-gray-700 p-3 text-center text-blue-400">🏠 用户级 (User)</th>
                <th className="border border-gray-700 p-3 text-center text-orange-400">📦 内置 (Built-in)</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr>
                <td className="border border-gray-700 p-3 font-semibold">存储位置</td>
                <td className="border border-gray-700 p-3 text-center"><code>.innies/agents/*.md</code></td>
                <td className="border border-gray-700 p-3 text-center"><code>~/.innies/agents/*.md</code></td>
                <td className="border border-gray-700 p-3 text-center">内存 (代码嵌入)</td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="border border-gray-700 p-3 font-semibold">作用范围</td>
                <td className="border border-gray-700 p-3 text-center">当前项目</td>
                <td className="border border-gray-700 p-3 text-center">用户全局</td>
                <td className="border border-gray-700 p-3 text-center">所有用户</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-3 font-semibold">优先级</td>
                <td className="border border-gray-700 p-3 text-center text-green-400 font-bold">最高 (1)</td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">中等 (2)</td>
                <td className="border border-gray-700 p-3 text-center text-gray-400">最低 (3)</td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="border border-gray-700 p-3 font-semibold">可修改性</td>
                <td className="border border-gray-700 p-3 text-center">✅ 可增删改</td>
                <td className="border border-gray-700 p-3 text-center">✅ 可增删改</td>
                <td className="border border-gray-700 p-3 text-center">❌ 不可修改</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-3 font-semibold">适用场景</td>
                <td className="border border-gray-700 p-3 text-center">项目特定代理<br/>(如项目代码审查)</td>
                <td className="border border-gray-700 p-3 text-center">个人通用代理<br/>(如个人写作助手)</td>
                <td className="border border-gray-700 p-3 text-center">基础通用代理<br/>(如 general-purpose)</td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="border border-gray-700 p-3 font-semibold">覆盖规则</td>
                <td className="border border-gray-700 p-3 text-center" colSpan={3}>
                  同名代理按优先级覆盖：Project 的 <code>reviewer</code> 会覆盖 User 的 <code>reviewer</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <HighlightBox title="内置代理: general-purpose" icon="📦" variant="blue" className="mt-4">
          <p className="mb-2">目前仅有一个内置代理 <code>general-purpose</code>，用于：</p>
          <ul className="pl-5 list-disc space-y-1 text-sm">
            <li>在大型代码库中搜索代码、配置和模式</li>
            <li>分析多个文件以理解系统架构</li>
            <li>调查需要探索多个文件的复杂问题</li>
            <li>执行多步骤研究任务</li>
          </ul>
          <p className="text-xs text-gray-400 mt-2">
            内置代理的 filePath 标记为 <code>&lt;builtin:general-purpose&gt;</code>
          </p>
        </HighlightBox>
      </Layer>

      {/* 子代理文件格式 */}
      <Layer title="子代理文件格式" icon="📝">
        <CodeBlock
          title="YAML Frontmatter + Markdown"
          language="markdown"
          code={`---
name: code-reviewer
description: 专业代码审查代理，分析代码质量和潜在问题

tools:
  - read_file
  - grep_search
  - glob

modelConfig:
  model: qwen3-coder-plus
  temp: 0.3

runConfig:
  max_turns: 10
  max_time_minutes: 5

color: blue
---

你是一个专业的代码审查专家。

## 职责
1. 检查代码质量和规范性
2. 识别潜在的 bug 和安全问题
3. 提供改进建议

## 审查标准
- 代码可读性
- 性能优化
- 安全最佳实践`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">YAML Frontmatter (必需字段)</h4>
            <ul className="text-sm space-y-1">
              <li><code className="text-green-400">name</code> - 代理名称 (2-50字符, 仅 a-z0-9_-)</li>
              <li><code className="text-green-400">description</code> - 描述 (不能为空)</li>
            </ul>
            <h4 className="text-purple-400 font-bold mb-2 mt-3">可选字段</h4>
            <ul className="text-sm space-y-1">
              <li><code>tools</code> - 可用工具列表 (使用 <code>*</code> 继承所有)</li>
              <li><code>modelConfig</code> - 模型参数 (model, temp, top_p)</li>
              <li><code>runConfig</code> - 运行限制 (max_turns, max_time_minutes)</li>
              <li><code>color</code> - UI 显示颜色</li>
            </ul>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">Markdown 内容</h4>
            <p className="text-sm text-gray-300 mb-3">
              Frontmatter 之后的 Markdown 内容作为子代理的 <strong>系统提示 (System Prompt)</strong>。
            </p>
            <h4 className="text-green-400 font-bold mb-2">支持模板变量</h4>
            <p className="text-sm text-gray-300">
              使用 <code className="text-yellow-400">{'${variable}'}</code> 语法引用运行时变量：
            </p>
            <pre className="bg-black/30 p-2 rounded mt-2 text-xs">
{`请用 \${language} 完成:
\${task_prompt}`}
            </pre>
          </div>
        </div>
      </Layer>

      {/* 名称验证规则 */}
      <Layer title="名称验证规则" icon="✅">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2">❌ 验证错误 (会阻止保存)</h4>
            <ul className="text-sm space-y-1">
              <li>• 长度必须在 2-50 字符之间</li>
              <li>• 只能包含 <code>a-z A-Z 0-9 _ -</code></li>
              <li>• 不能以 <code>_</code> 或 <code>-</code> 开头/结尾</li>
              <li>• 不能使用保留名: <code>self, system, user, model, tool, config, default</code></li>
            </ul>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-400 font-bold mb-2">⚠️ 验证警告 (建议修改)</h4>
            <ul className="text-sm space-y-1">
              <li>• 建议使用全小写字母</li>
              <li>• 不要同时使用 <code>_</code> 和 <code>-</code> 分隔符</li>
              <li>• 描述过长 (&gt;500 字符) 可能影响可读性</li>
            </ul>
          </div>
        </div>

        <CodeBlock
          title="SubagentValidator 验证示例"
          language="typescript"
          code={`// 验证名称
validateName(name: string): ValidationResult {
    if (name.length < 2 || name.length > 50) {
        return { isValid: false, errors: ['Length must be 2-50'] };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        return { isValid: false, errors: ['Invalid characters'] };
    }
    if (/^[_-]|[_-]$/.test(name)) {
        return { isValid: false, errors: ['Cannot start/end with _ or -'] };
    }
    const reserved = ['self', 'system', 'user', 'model', 'tool', 'config', 'default'];
    if (reserved.includes(name.toLowerCase())) {
        return { isValid: false, errors: ['Reserved name'] };
    }
    return { isValid: true };
}`}
        />
      </Layer>

      {/* ContextState 模板引擎 */}
      <Layer title="ContextState 模板引擎 (核心机制)" icon="⚙️">
        <HighlightBox title="ContextState 类设计" icon="💡" variant="purple">
          <p className="text-sm mb-3">
            <code>ContextState</code> 是子代理的<strong>上下文状态管理器</strong>，
            提供简洁的 key-value 存储，支持模板变量动态替换。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-black/30 rounded p-3 text-center">
              <code className="text-cyan-400">get(key)</code>
              <p className="text-xs text-gray-400 mt-1">获取变量值</p>
            </div>
            <div className="bg-black/30 rounded p-3 text-center">
              <code className="text-green-400">set(key, value)</code>
              <p className="text-xs text-gray-400 mt-1">设置变量值</p>
            </div>
            <div className="bg-black/30 rounded p-3 text-center">
              <code className="text-yellow-400">get_keys()</code>
              <p className="text-xs text-gray-400 mt-1">获取所有 key</p>
            </div>
          </div>
        </HighlightBox>

        <CodeBlock
          title="packages/core/src/subagents/subagent.ts:85-116 - ContextState"
          language="typescript"
          code={`/**
 * 管理子代理的运行时上下文状态
 * 提供 key-value 存储，支持模板变量替换
 */
export class ContextState {
  private state: Record<string, unknown> = {};

  get(key: string): unknown {
    return this.state[key];
  }

  set(key: string, value: unknown): void {
    this.state[key] = value;
  }

  get_keys(): string[] {
    return Object.keys(this.state);
  }
}

// 使用示例（Task 工具调用子代理时）
const context = new ContextState();
context.set('task_prompt', '审查 src/utils.ts 的代码质量');
context.set('language', 'TypeScript');
context.set('project_name', 'innies-cli');

await subagent.runNonInteractive(context);`}
        />

        <FlowDiagram {...templateFlow} />

        <CodeBlock
          title="packages/core/src/subagents/subagent.ts:129-155 - templateString"
          language="typescript"
          code={`/**
 * 模板字符串替换函数
 * 使用正则 /\\$\\{(\\w+)\\}/g 匹配 \${key} 占位符
 */
function templateString(template: string, context: ContextState): string {
  const placeholderRegex = /\\$\\{(\\w+)\\}/g;

  // 1. 提取所有占位符键
  const requiredKeys = new Set(
    Array.from(template.matchAll(placeholderRegex), (match) => match[1])
  );

  // 2. 验证所有必需的键都存在
  const contextKeys = new Set(context.get_keys());
  const missingKeys = Array.from(requiredKeys).filter(
    (key) => !contextKeys.has(key)
  );

  if (missingKeys.length > 0) {
    // 抛出异常：缺少必需的上下文变量
    throw new Error(
      \`Missing context values for the following keys: \${missingKeys.join(', ')}\`
    );
  }

  // 3. 执行替换，将值转换为字符串
  return template.replace(placeholderRegex, (_match, key) =>
    String(context.get(key))
  );
}`}
        />

        <div className="bg-black/30 rounded-xl p-6 mt-4">
          <h4 className="text-cyan-400 font-bold mb-4">模板替换示例</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <h5 className="text-blue-400 font-semibold mb-2">1. 设置变量</h5>
              <pre className="text-xs">
{`context.set('task_prompt',
  '审查 src/utils.ts');
context.set('language',
  'TypeScript');`}
              </pre>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <h5 className="text-purple-400 font-semibold mb-2">2. 原始模板</h5>
              <pre className="text-xs">
{`请用 \${language} 完成:

\${task_prompt}`}
              </pre>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <h5 className="text-green-400 font-semibold mb-2">3. 替换结果</h5>
              <pre className="text-xs">
{`请用 TypeScript 完成:

审查 src/utils.ts`}
              </pre>
            </div>
          </div>
        </div>
      </Layer>

      {/* 非交互式运行时（核心） */}
      <Layer title="非交互式运行时 (Non-Interactive Runtime)" icon="🔒">
        <HighlightBox title="核心设计原则" icon="⚠️" variant="red">
          <p className="text-sm mb-3">
            子代理<strong>强制以非交互模式运行</strong>，这是与主 Agent 的关键区别：
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
              <h5 className="text-red-400 font-bold mb-1">❌ 禁止行为</h5>
              <ul className="text-xs space-y-1">
                <li>• 不能向用户提问</li>
                <li>• 不能等待用户输入</li>
                <li>• 不能调用 Task 工具（防止递归）</li>
              </ul>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
              <h5 className="text-green-400 font-bold mb-1">✅ 必须行为</h5>
              <ul className="text-xs space-y-1">
                <li>• 基于已有上下文自主决策</li>
                <li>• 任务完成时返回纯文本（非工具调用）</li>
                <li>• 遵守 max_turns/timeout 限制</li>
              </ul>
            </div>
          </div>
        </HighlightBox>

        <CodeBlock
          title="packages/core/src/subagents/subagent.ts:877-894 - 系统指令注入"
          language="typescript"
          code={`private buildChatSystemPrompt(context: ContextState): string {
  if (!this.promptConfig.systemPrompt) {
    return '';
  }

  // 1. 使用 ContextState 替换模板变量
  let finalPrompt = templateString(this.promptConfig.systemPrompt, context);

  // 2. 自动追加非交互模式指令（强制执行）
  finalPrompt += \`

Important Rules:
 - You operate in non-interactive mode: do not ask the user questions; proceed with available context.
 - Use tools only when necessary to obtain facts or make changes.
 - When the task is complete, return the final result as a normal model response (not a tool call) and stop.\`;

  return finalPrompt;
}`}
        />

        <HighlightBox title="Task 工具过滤：防止递归调用" icon="🛡️" variant="blue" className="mt-4">
          <p className="text-sm mb-2">
            子代理的工具列表<strong>始终排除 Task 工具</strong>，防止子代理调用自身导致无限递归：
          </p>
          <CodeBlock
            title="packages/core/src/subagents/subagent.ts:296-313"
            language="typescript"
            code={`// 过滤工具列表，排除 Task 工具
if (hasWildcard || asStrings.length === 0) {
  // 继承所有工具，但过滤掉 TaskTool
  toolsList.push(
    ...toolRegistry
      .getFunctionDeclarations()
      .filter((t) => t.name !== TaskTool.Name)  // 关键：排除 Task
  );
} else {
  // 使用指定工具列表
  toolsList.push(
    ...toolRegistry.getFunctionDeclarationsFiltered(asStrings)
  );
}

// 默认情况也过滤 Task
toolsList.push(
  ...toolRegistry
    .getFunctionDeclarations()
    .filter((t) => t.name !== TaskTool.Name)
);`}
          />
        </HighlightBox>
      </Layer>

      {/* 非交互式执行流程 */}
      <Layer title="非交互式执行流程" icon="⚡">
        <FlowDiagram {...executionFlow} />

        <CodeBlock
          title="runNonInteractive 核心逻辑"
          language="typescript"
          code={`async runNonInteractive(context: ContextState, signal?: AbortSignal): Promise<void> {
    const chat = await this.createChatObject(context);
    const toolsList = this.prepareToolsList(); // 排除 Task 工具防止递归

    while (true) {
        // 检查终止条件
        if (turnCounter >= this.runConfig.max_turns) {
            this.terminateMode = SubagentTerminateMode.MAX_TURNS;
            break;
        }
        if (durationMin >= this.runConfig.max_time_minutes) {
            this.terminateMode = SubagentTerminateMode.TIMEOUT;
            break;
        }

        // 流式接收响应
        const responseStream = await chat.sendMessageStream(model, params);
        for await (const event of responseStream) {
            if (signal?.aborted) {
                this.terminateMode = SubagentTerminateMode.CANCELLED;
                return;
            }
            // 收集工具调用和文本
        }

        if (functionCalls.length > 0) {
            // 并行执行工具调用
            await this.processFunctionCalls(functionCalls, abortController);
        } else {
            // 无工具调用 = 最终答案
            this.finalText = roundText.trim();
            this.terminateMode = SubagentTerminateMode.GOAL;
            break;
        }
    }
}`}
        />

        <HighlightBox title="工具列表准备规则" icon="🔧" variant="blue" className="mt-4">
          <ul className="pl-5 list-disc space-y-1 text-sm">
            <li>如果 <code>tools: ['*']</code> 或为空，继承所有工具（排除 Task）</li>
            <li>如果指定工具列表，只使用这些工具</li>
            <li><strong>始终排除 Task 工具</strong>，防止子代理递归调用自己</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* 工具调用处理 */}
      <Layer title="工具调用处理 (CoreToolScheduler)" icon="🔨">
        <CodeBlock
          title="processFunctionCalls 并行调度"
          language="typescript"
          code={`private async processFunctionCalls(
    functionCalls: FunctionCall[],
    abortController: AbortController
): Promise<Content[]> {
    const scheduler = new CoreToolScheduler({
        onAllToolCallsComplete: async (completedCalls) => {
            for (const call of completedCalls) {
                // 更新统计
                this.executionStats.totalToolCalls += 1;
                if (call.status === 'success') {
                    this.executionStats.successfulToolCalls += 1;
                } else {
                    this.executionStats.failedToolCalls += 1;
                }

                // 发送事件
                this.eventEmitter?.emit(SubAgentEventType.TOOL_RESULT, {
                    subagentId: this.subagentId,
                    name: call.request.name,
                    success: call.status === 'success',
                    durationMs: call.durationMs,
                });

                // 执行钩子
                await this.hooks?.postToolUse?.({ ... });
            }
        },
    });

    // 并行调度所有工具调用
    await scheduler.schedule(requests, abortController.signal);

    return [{ role: 'user', parts: toolResponseParts }];
}`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">并行执行优势</h4>
            <ul className="text-sm space-y-1">
              <li>• 多个独立工具调用同时执行</li>
              <li>• 减少总执行时间</li>
              <li>• 自动收集所有结果</li>
            </ul>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">错误处理</h4>
            <ul className="text-sm space-y-1">
              <li>• 如果所有工具都失败，通知模型尝试替代方案</li>
              <li>• 记录每个工具的成功/失败统计</li>
              <li>• 支持 AbortSignal 取消</li>
            </ul>
          </div>
        </div>
      </Layer>

      {/* 终止模式 */}
      <Layer title="终止模式 (Terminate Modes)" icon="🛑">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">✅ GOAL</h4>
            <p className="text-sm text-gray-300">任务成功完成，AI 返回了最终答案（无工具调用的文本响应）</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">⏱️ MAX_TURNS</h4>
            <p className="text-sm text-gray-300">达到 <code>runConfig.max_turns</code> 轮次限制</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-400 font-bold mb-2">⏰ TIMEOUT</h4>
            <p className="text-sm text-gray-300">超过 <code>runConfig.max_time_minutes</code> 执行时间</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2">❌ ERROR</h4>
            <p className="text-sm text-gray-300">执行过程中发生异常错误</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 md:col-span-2">
            <h4 className="text-purple-400 font-bold mb-2">🚫 CANCELLED</h4>
            <p className="text-sm text-gray-300">AbortSignal 被触发（用户取消或系统终止）- <strong>最高优先级</strong></p>
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-4 mt-4">
          <h4 className="text-cyan-400 font-bold mb-2">终止优先级</h4>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="bg-purple-500/20 px-3 py-1 rounded">CANCELLED</span>
            <span className="text-gray-400">&gt;</span>
            <span className="bg-yellow-500/20 px-3 py-1 rounded">TIMEOUT</span>
            <span className="text-gray-400">&gt;</span>
            <span className="bg-orange-500/20 px-3 py-1 rounded">MAX_TURNS</span>
            <span className="text-gray-400">&gt;</span>
            <span className="bg-green-500/20 px-3 py-1 rounded">GOAL</span>
            <span className="text-gray-400">&gt;</span>
            <span className="bg-red-500/20 px-3 py-1 rounded">ERROR</span>
          </div>
        </div>
      </Layer>

      {/* 钩子系统 */}
      <Layer title="钩子系统 (Subagent Hooks)" icon="🪝">
        <CodeBlock
          title="SubagentHooks 接口"
          language="typescript"
          code={`interface SubagentHooks {
    // 工具使用前 - 可用于日志、修改参数等
    preToolUse?(payload: {
        subagentId: string;
        name: string;
        toolName: string;
        args: Record<string, unknown>;
        timestamp: number;
    }): Promise<void> | void;

    // 工具使用后 - 可用于记录结果、错误处理等
    postToolUse?(payload: {
        subagentId: string;
        name: string;
        toolName: string;
        args: Record<string, unknown>;
        success: boolean;
        durationMs: number;
        errorMessage?: string;
        timestamp: number;
    }): Promise<void> | void;

    // 子代理停止时 - 清理资源、记录统计等
    onStop?(payload: {
        subagentId: string;
        name: string;
        terminateReason: SubagentTerminateMode;
        summary: SubagentStatsSummary;
        timestamp: number;
    }): Promise<void> | void;
}`}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🔜</div>
            <h4 className="text-blue-400 font-bold">preToolUse</h4>
            <p className="text-xs text-gray-400">工具执行前触发</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">✅</div>
            <h4 className="text-green-400 font-bold">postToolUse</h4>
            <p className="text-xs text-gray-400">工具执行后触发</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🏁</div>
            <h4 className="text-purple-400 font-bold">onStop</h4>
            <p className="text-xs text-gray-400">子代理结束时触发</p>
          </div>
        </div>
      </Layer>

      {/* 事件系统 */}
      <Layer title="子代理事件系统" icon="📡">
        <JsonBlock
          code={`// SubAgentEventType 枚举
{
    "START": "start",                      // 子代理启动
    "ROUND_START": "round_start",          // 新一轮开始
    "ROUND_END": "round_end",              // 当前轮结束
    "STREAM_TEXT": "stream_text",          // 流式文本输出
    "TOOL_CALL": "tool_call",              // 工具调用请求
    "TOOL_RESULT": "tool_result",          // 工具执行结果
    "TOOL_WAITING_APPROVAL": "tool_waiting_approval",  // 等待确认
    "FINISH": "finish",                    // 子代理完成
    "ERROR": "error"                       // 执行错误
}

// SubAgentFinishEvent 示例
{
    "subagentId": "code-reviewer-a1b2c3",
    "terminateReason": "GOAL",
    "timestamp": 1703001234567,
    "rounds": 3,
    "totalDurationMs": 15000,
    "totalToolCalls": 5,
    "successfulToolCalls": 5,
    "failedToolCalls": 0,
    "inputTokens": 2500,
    "outputTokens": 1200,
    "totalTokens": 3700
}`}
        />
      </Layer>

      {/* 统计信息 */}
      <Layer title="执行统计 (SubagentStatistics)" icon="📊">
        <JsonBlock
          code={`// SubagentStatsSummary 结构
{
    "rounds": 3,
    "totalDurationMs": 15000,
    "totalToolCalls": 5,
    "successfulToolCalls": 5,
    "failedToolCalls": 0,
    "successRate": 100,
    "inputTokens": 2500,
    "outputTokens": 1200,
    "totalTokens": 3700,
    "estimatedCost": 0.147,
    "toolUsage": [
        {
            "name": "read_file",
            "count": 3,
            "success": 3,
            "failure": 0,
            "totalDurationMs": 450,
            "averageDurationMs": 150
        },
        {
            "name": "grep_search",
            "count": 2,
            "success": 2,
            "failure": 0,
            "totalDurationMs": 200,
            "averageDurationMs": 100
        }
    ]
}`}
        />

        <HighlightBox title="成本估算公式" icon="💰" variant="green" className="mt-4">
          <pre className="bg-black/30 p-3 rounded text-sm">
{`estimatedCost = inputTokens × 0.00003 + outputTokens × 0.00006`}
          </pre>
          <p className="text-xs text-gray-400 mt-2">基于标准 API 定价估算</p>
        </HighlightBox>
      </Layer>

      {/* 使用方式 */}
      <Layer title="使用子代理" icon="🚀">
        <CodeBlock
          code={`# 在 CLI 中使用子代理

# 1. 通过 /agents 命令管理
/agents list              # 列出所有子代理（按优先级排序）
/agents create            # 创建新子代理（打开对话框）
/agents delete <name>     # 删除子代理

# 2. 子代理作为工具被 AI 调用
# 当用户请求复杂任务时，主 AI 可以调用 Task 工具
# Task 工具会启动对应的子代理来处理

# 3. 子代理配置位置
~/.innies/agents/         # 用户级子代理（全局可用）
.innies/agents/           # 项目级子代理（仅当前项目）

# 4. 示例：创建代码审查子代理
# 创建文件: .innies/agents/reviewer.md
---
name: reviewer
description: 代码审查专家
tools:
  - read_file
  - grep_search
runConfig:
  max_turns: 5
  max_time_minutes: 3
---
你是代码审查专家，请专注于：
- 代码质量和可读性
- 潜在的 bug 和安全问题
- 性能优化建议`}
        />

        <HighlightBox title="优先级规则" icon="📋" variant="green">
          <ol className="pl-5 list-decimal space-y-1">
            <li><strong>项目级</strong> - .innies/agents/ 下的子代理优先</li>
            <li><strong>用户级</strong> - ~/.innies/agents/ 下的子代理次之</li>
            <li><strong>内置</strong> - 代码中定义的内置子代理最后</li>
          </ol>
          <p className="text-sm text-gray-400 mt-2">
            相同名称的子代理，高优先级会覆盖低优先级。项目的 <code>reviewer</code> 会覆盖用户的 <code>reviewer</code>。
          </p>
        </HighlightBox>

        <HighlightBox title="特殊情况：Home 目录" icon="⚠️" variant="yellow" className="mt-4">
          <p className="text-sm">
            如果当前项目根目录就是用户 Home 目录 (<code>~</code>)，则项目级子代理将被禁用，
            只加载用户级和内置子代理，以避免冲突。
          </p>
        </HighlightBox>
      </Layer>

      {/* 源码位置 */}
      <Layer title="源码位置" icon="📍">
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/subagents/subagent.ts:85-116</code>
            <span className="text-gray-400">ContextState 类定义</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/subagents/subagent.ts:129-155</code>
            <span className="text-gray-400">templateString() 模板替换</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/subagents/subagent.ts:260-394</code>
            <span className="text-gray-400">runNonInteractive() 非交互执行</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/subagents/subagent.ts:877-894</code>
            <span className="text-gray-400">buildChatSystemPrompt() 指令注入</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/subagents/types.ts</code>
            <span className="text-gray-400">SubagentTerminateMode 等类型</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/tools/task.ts</code>
            <span className="text-gray-400">Task 工具（调用子代理）</span>
          </div>
        </div>
      </Layer>
    </div>
  );
}
