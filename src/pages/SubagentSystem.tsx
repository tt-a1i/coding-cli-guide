import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

function Introduction({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">
            子代理系统导读
          </span>
        </div>
        <span
          className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">
              🎯 什么是子代理？
            </h4>
            <p className="text-[var(--text-secondary)] text-sm">
              子代理是<strong>专门执行特定任务的独立 AI 代理</strong>。
              每个子代理有自己的系统提示、工具配置和运行参数。
              通过子代理，可以将<strong>复杂任务分解</strong>并委托给专门的代理处理。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">
              🔧 三级子代理
            </h4>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-xs text-[var(--terminal-green)]">项目级</div>
                <div className="text-[10px] text-[var(--text-muted)]">.gemini/agents/</div>
              </div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-xs text-[var(--cyber-blue)]">用户级</div>
                <div className="text-[10px] text-[var(--text-muted)]">~/.gemini/agents/</div>
              </div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-xs text-[var(--amber)]">内置</div>
                <div className="text-[10px] text-[var(--text-muted)]">BuiltinAgentRegistry</div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">
              🏗️ 核心特性
            </h4>
            <ul className="text-[var(--text-secondary)] text-sm space-y-1">
              <li>• <strong>非交互模式</strong> - 不询问用户，直接完成任务</li>
              <li>• <strong>工具过滤</strong> - 移除 Task 工具防止递归</li>
              <li>• <strong>模板变量</strong> - $&#123;key&#125; 占位符替换</li>
              <li>• <strong>终止条件</strong> - MAX_TURNS、TIMEOUT、GOAL</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">📊 关键数字</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--terminal-green)]">3</div>
                <div className="text-xs text-[var(--text-muted)]">配置层级</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--cyber-blue)]">100</div>
                <div className="text-xs text-[var(--text-muted)]">默认最大轮次</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--amber)]">.md</div>
                <div className="text-xs text-[var(--text-muted)]">配置格式</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--purple)]">YAML</div>
                <div className="text-xs text-[var(--text-muted)]">Frontmatter</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SubagentSystem() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  const relatedPages: RelatedPage[] = [
    { id: 'agent-framework', label: 'Agent 框架', description: 'Agent 定义与配置系统' },
    { id: 'interaction-loop', label: '交互循环', description: '子代理与主循环的协作' },
    { id: 'tool-arch', label: '工具系统', description: '子代理可用的工具集' },
    { id: 'mcp', label: 'MCP集成', description: '子代理与MCP服务器的连接' },
    { id: 'approval-mode', label: '审批模式', description: '子代理权限控制' },
    { id: 'services-arch', label: '服务架构', description: '子代理依赖的核心服务' },
    { id: 'lifecycle', label: '请求生命周期', description: '子代理请求处理流程' },
  ];

  // 模板变量替换流程 - Mermaid flowchart
  const templateFlowChart = `flowchart TD
    start([System Prompt<br/>模板])
    context[ContextState<br/>设置变量]
    extract[提取占位符<br/>&#34;&#36;&#123;key&#125;&#34;]
    check{"所有 key<br/>都存在?"}
    replace[执行替换<br/>String value]
    error([抛出异常<br/>Missing keys])
    done([最终 Prompt])

    start --> context
    context --> extract
    extract --> check
    check -->|No| error
    check -->|Yes| replace
    replace --> done

    classDef input_node fill:#22d3ee,color:#000
    classDef output_node fill:#22c55e,color:#000
    classDef error_node fill:#ef4444,color:#fff
    classDef decision_node fill:#f59e0b,color:#000

    class start input_node
    class done output_node
    class error error_node
    class check decision_node`;

  // 非交互式执行流程 - Mermaid flowchart
  const executionFlowChart = `flowchart TD
    start([初始化<br/>SubAgentScope])
    tools[准备工具列表<br/>过滤 Task 工具]
    check_limit{检查<br/>终止条件}
    send[发送消息<br/>流式响应]
    has_tools{有工具<br/>调用?}
    exec_tools[并行执行<br/>工具调用]
    goal([任务完成<br/>GOAL])
    limit([达到限制<br/>MAX_TURNS/TIMEOUT])

    start --> tools
    tools --> check_limit
    check_limit -->|超限| limit
    check_limit -->|继续| send
    send --> has_tools
    has_tools -->|No| goal
    has_tools -->|Yes| exec_tools
    exec_tools --> check_limit

    style start fill:#22d3ee,color:#000
    style goal fill:#22c55e,color:#000
    style limit fill:#f59e0b,color:#000
    style check_limit fill:#a855f7,color:#fff
    style has_tools fill:#a855f7,color:#fff`;

  return (
    <div>
      <Introduction
        isExpanded={isIntroExpanded}
        onToggle={() => setIsIntroExpanded(!isIntroExpanded)}
      />

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
            <p className="text-sm text-gray-400">.gemini/agents/*.md</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">🏠</div>
            <h4 className="text-cyan-400 font-bold">用户级</h4>
            <p className="text-sm text-gray-400">~/.gemini/agents/*.md</p>
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
                <td className="border border-gray-700 p-3 text-center"><code>.gemini/agents/*.md</code></td>
                <td className="border border-gray-700 p-3 text-center"><code>~/.gemini/agents/*.md</code></td>
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
  model: gemini-2.0-flash
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
context.set('project_name', 'gemini-cli');

await subagent.runNonInteractive(context);`}
        />

        <MermaidDiagram chart={templateFlowChart} title="模板变量替换流程" />

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
        <MermaidDiagram chart={executionFlowChart} title="非交互式执行流程" />

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
~/.gemini/agents/         # 用户级子代理（全局可用）
.gemini/agents/           # 项目级子代理（仅当前项目）

# 4. 示例：创建代码审查子代理
# 创建文件: .gemini/agents/reviewer.md
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
            <li><strong>项目级</strong> - .gemini/agents/ 下的子代理优先</li>
            <li><strong>用户级</strong> - ~/.gemini/agents/ 下的子代理次之</li>
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

      {/* ==================== 深化内容 ==================== */}

      {/* 边界条件深度解析 */}
      <Layer title="边界条件深度解析" icon="🔬">
        <div className="space-y-6">
          {/* 边界 1: 模板变量缺失 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-red-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-red-400 font-bold">边界 1: 模板变量缺失</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-[var(--bg-card)] p-3 rounded">
                <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🎯 触发场景</h5>
                <ul className="text-xs text-[var(--text-muted)] space-y-1">
                  <li>• 子代理模板中使用了 <code className="bg-black/30 px-1 rounded">${'{task_prompt}'}</code>，但调用时未提供</li>
                  <li>• Task 工具传入的 prompt 参数中缺少必需的上下文变量</li>
                  <li>• 模板中的变量名拼写错误（如 <code>${'{task_promtp}'}</code>）</li>
                </ul>
              </div>
              <CodeBlock
                title="模板变量验证"
                code={`// packages/core/src/subagents/subagent.ts

function templateString(template: string, context: ContextState): string {
  const placeholderRegex = /\\$\\{(\\w+)\\}/g;

  // 提取所有占位符
  const requiredKeys = new Set(
    Array.from(template.matchAll(placeholderRegex), (match) => match[1])
  );

  // 检查缺失的键
  const contextKeys = new Set(context.get_keys());
  const missingKeys = Array.from(requiredKeys).filter(
    (key) => !contextKeys.has(key)
  );

  if (missingKeys.length > 0) {
    // 关键：抛出异常而非静默失败
    throw new Error(
      \`Missing context values for: \${missingKeys.join(', ')}\\n\` +
      \`Available keys: \${context.get_keys().join(', ')}\`
    );
  }

  return template.replace(placeholderRegex, (_, key) =>
    String(context.get(key))
  );
}`}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                  <h5 className="text-red-400 text-sm font-semibold mb-1">❌ 错误示例</h5>
                  <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap">{`// 模板
请完成: \${task_prompt}
语言: \${language}

// 调用
context.set('task_prompt', '...');
// 缺少 language！
// Error: Missing context values for: language`}</pre>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <h5 className="text-green-400 text-sm font-semibold mb-1">✅ 正确做法</h5>
                  <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap">{`// 方案 1: 提供所有变量
context.set('task_prompt', '...');
context.set('language', 'TypeScript');

// 方案 2: 使用可选语法（如果支持）
请完成: \${task_prompt}
\${language ? '语言: ' + language : ''}`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* 边界 2: 子代理递归防护 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-amber-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-amber-400 font-bold">边界 2: 子代理递归调用防护</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-[var(--bg-card)] p-3 rounded">
                <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🎯 设计考虑</h5>
                <p className="text-xs text-[var(--text-muted)]">
                  如果子代理可以调用 Task 工具，可能导致无限递归：
                  <br />
                  <code>主代理 → Task → 子代理A → Task → 子代理B → Task → ...</code>
                </p>
              </div>
              <CodeBlock
                title="Task 工具过滤实现"
                code={`// packages/core/src/subagents/subagent.ts:296-313

// 准备工具列表时，始终排除 Task 工具
private prepareToolsList(): FunctionDeclaration[] {
  const toolsList: FunctionDeclaration[] = [];

  if (hasWildcard || asStrings.length === 0) {
    // 继承所有工具，但必须过滤 Task
    toolsList.push(
      ...toolRegistry
        .getFunctionDeclarations()
        .filter((t) => t.name !== TaskTool.Name)  // 关键！
    );
  } else {
    // 使用指定工具列表
    const filtered = asStrings.filter(name => name !== TaskTool.Name);
    toolsList.push(
      ...toolRegistry.getFunctionDeclarationsFiltered(filtered)
    );
  }

  return toolsList;
}

// 即使配置中显式指定了 Task，也会被过滤
// tools: ['read_file', 'Task']  →  实际只有 ['read_file']`}
              />
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-3">
                <h5 className="text-cyan-400 text-sm font-semibold mb-1">💡 设计决策</h5>
                <p className="text-xs text-[var(--text-muted)]">
                  通过在工具准备阶段就过滤 Task 工具，而非运行时检查，确保子代理
                  <strong>绝对无法</strong>调用 Task 工具，从根本上防止递归。
                </p>
              </div>
            </div>
          </div>

          {/* 边界 3: 终止条件竞争 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-purple-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-purple-400 font-bold">边界 3: 终止条件竞争</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-[var(--bg-card)] p-3 rounded">
                <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🎯 触发场景</h5>
                <ul className="text-xs text-[var(--text-muted)] space-y-1">
                  <li>• 子代理在第 100 轮（max_turns 限制）返回了最终答案</li>
                  <li>• 执行超时的同时，用户触发了取消操作</li>
                  <li>• 工具执行失败与 GOAL 状态同时发生</li>
                </ul>
              </div>
              <CodeBlock
                title="终止条件优先级处理"
                code={`// packages/core/src/subagents/subagent.ts

async runNonInteractive(context: ContextState, signal?: AbortSignal) {
  while (true) {
    // 1. 最高优先级：用户取消
    if (signal?.aborted) {
      this.terminateMode = SubagentTerminateMode.CANCELLED;
      return;  // 立即返回，不保存任何结果
    }

    // 2. 次高优先级：超时
    if (durationMin >= this.runConfig.max_time_minutes) {
      this.terminateMode = SubagentTerminateMode.TIMEOUT;
      break;  // 保存当前状态，但标记为超时
    }

    // 3. 轮次限制
    if (turnCounter >= this.runConfig.max_turns) {
      this.terminateMode = SubagentTerminateMode.MAX_TURNS;
      break;  // 保存当前状态
    }

    // ... 执行逻辑 ...

    // 4. 正常完成
    if (functionCalls.length === 0) {
      this.finalText = roundText.trim();
      this.terminateMode = SubagentTerminateMode.GOAL;
      break;
    }
  }
}

// 优先级总结：CANCELLED > TIMEOUT > MAX_TURNS > GOAL > ERROR`}
              />
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-purple-500/20 p-2 rounded">
                  <div className="font-bold text-purple-400">1</div>
                  <div className="text-[var(--text-muted)]">CANCELLED</div>
                </div>
                <div className="bg-yellow-500/20 p-2 rounded">
                  <div className="font-bold text-yellow-400">2</div>
                  <div className="text-[var(--text-muted)]">TIMEOUT</div>
                </div>
                <div className="bg-orange-500/20 p-2 rounded">
                  <div className="font-bold text-orange-400">3</div>
                  <div className="text-[var(--text-muted)]">MAX_TURNS</div>
                </div>
                <div className="bg-green-500/20 p-2 rounded">
                  <div className="font-bold text-green-400">4</div>
                  <div className="text-[var(--text-muted)]">GOAL</div>
                </div>
                <div className="bg-red-500/20 p-2 rounded">
                  <div className="font-bold text-red-400">5</div>
                  <div className="text-[var(--text-muted)]">ERROR</div>
                </div>
              </div>
            </div>
          </div>

          {/* 边界 4: 工具全部失败 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-cyan-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-cyan-400 font-bold">边界 4: 工具调用全部失败</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-[var(--bg-card)] p-3 rounded">
                <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🎯 触发场景</h5>
                <ul className="text-xs text-[var(--text-muted)] space-y-1">
                  <li>• 所有文件操作都因权限不足失败</li>
                  <li>• 网络工具全部超时</li>
                  <li>• 参数验证全部失败</li>
                </ul>
              </div>
              <CodeBlock
                title="全失败处理逻辑"
                code={`// packages/core/src/subagents/subagent.ts

private async processFunctionCalls(functionCalls: FunctionCall[]) {
  // 执行所有工具调用
  const results = await scheduler.schedule(requests, signal);

  // 检查是否全部失败
  const allFailed = results.every(r => r.status !== 'success');

  if (allFailed) {
    // 不是直接 ERROR，而是让 AI 知道情况
    const errorMessage = \`All \${results.length} tool calls failed. \\n\` +
      \`Errors: \${results.map(r => r.error?.message).join('; ')}\\n\` +
      \`Please try alternative approaches or complete the task with available information.\`;

    // 将错误信息作为工具结果返回给 AI
    return [{
      role: 'user',
      parts: [{
        functionResponse: {
          name: 'system_notification',
          response: { error: errorMessage }
        }
      }]
    }];
  }

  // 正常返回工具结果
  return toolResults;
}`}
              />
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3">
                <h5 className="text-amber-400 text-sm font-semibold mb-1">⚠️ 设计要点</h5>
                <p className="text-xs text-[var(--text-muted)]">
                  工具全部失败<strong>不会</strong>立即终止子代理，而是给 AI 一次机会
                  使用替代方案或基于已有信息完成任务。只有在多轮失败后才会真正终止。
                </p>
              </div>
            </div>
          </div>

          {/* 边界 5: 子代理配置冲突 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-green-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-green-400 font-bold">边界 5: 多级配置冲突</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-[var(--bg-card)] p-3 rounded">
                <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🎯 触发场景</h5>
                <ul className="text-xs text-[var(--text-muted)] space-y-1">
                  <li>• 项目级和用户级都定义了同名子代理 <code>reviewer</code></li>
                  <li>• 用户级子代理覆盖了内置子代理 <code>general-purpose</code></li>
                  <li>• 子代理引用了不存在的工具</li>
                </ul>
              </div>
              <CodeBlock
                title="子代理解析优先级"
                code={`// packages/core/src/subagents/registry.ts

class SubagentRegistry {
  private projectAgents: Map<string, Subagent> = new Map();
  private userAgents: Map<string, Subagent> = new Map();
  private builtinAgents: Map<string, Subagent> = new Map();

  // 按优先级解析子代理
  resolve(name: string): Subagent | undefined {
    // 1. 项目级最优先
    if (this.projectAgents.has(name)) {
      return this.projectAgents.get(name);
    }

    // 2. 用户级次之
    if (this.userAgents.has(name)) {
      return this.userAgents.get(name);
    }

    // 3. 内置最后
    if (this.builtinAgents.has(name)) {
      return this.builtinAgents.get(name);
    }

    return undefined;
  }

  // 列出所有可用子代理（去重）
  listAll(): SubagentInfo[] {
    const seen = new Set<string>();
    const result: SubagentInfo[] = [];

    // 按优先级顺序添加
    for (const [name, agent] of this.projectAgents) {
      if (!seen.has(name)) {
        seen.add(name);
        result.push({ ...agent, level: 'project' });
      }
    }
    for (const [name, agent] of this.userAgents) {
      if (!seen.has(name)) {
        seen.add(name);
        result.push({ ...agent, level: 'user' });
      }
    }
    for (const [name, agent] of this.builtinAgents) {
      if (!seen.has(name)) {
        seen.add(name);
        result.push({ ...agent, level: 'builtin' });
      }
    }

    return result;
  }
}`}
              />
            </div>
          </div>

          {/* 边界 6: Home 目录特殊处理 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-orange-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-orange-400 font-bold">边界 6: Home 目录项目</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-[var(--bg-card)] p-3 rounded">
                <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🎯 触发场景</h5>
                <p className="text-xs text-[var(--text-muted)]">
                  当用户在 Home 目录 (<code>~</code>) 下运行 CLI 时，
                  <code>.gemini/agents/</code> 和 <code>~/.gemini/agents/</code> 指向同一位置。
                </p>
              </div>
              <CodeBlock
                title="Home 目录检测"
                code={`// packages/core/src/subagents/loader.ts

async loadProjectAgents(projectRoot: string): Promise<Map<string, Subagent>> {
  // 检查是否是 Home 目录
  const homeDir = os.homedir();
  if (path.resolve(projectRoot) === path.resolve(homeDir)) {
    // 在 Home 目录下，禁用项目级子代理
    // 避免与用户级子代理冲突
    console.debug('[Subagent] Project root is home directory, skipping project agents');
    return new Map();
  }

  // 正常加载项目级子代理
  const agentsDir = path.join(projectRoot, '.gemini', 'agents');
  return this.loadFromDirectory(agentsDir, 'project');
}`}
              />
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3">
                <h5 className="text-amber-400 text-sm font-semibold mb-1">⚠️ 影响</h5>
                <p className="text-xs text-[var(--text-muted)]">
                  在 Home 目录下运行 CLI 时，只有用户级和内置子代理可用。
                  这避免了同一子代理被加载两次导致的行为不确定性。
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layer>

      {/* 常见问题与调试技巧 */}
      <Layer title="常见问题与调试技巧" icon="🐛">
        <div className="space-y-6">
          {/* 问题 1 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-red-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-red-400 font-bold">问题 1: 子代理未被识别</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🔍 常见原因</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>• 文件名不是 <code>.md</code> 结尾</li>
                    <li>• YAML Frontmatter 格式错误</li>
                    <li>• <code>name</code> 或 <code>description</code> 字段缺失</li>
                    <li>• 文件放错目录</li>
                  </ul>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🛠️ 排查步骤</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>1. 检查文件路径是否正确</li>
                    <li>2. 验证 YAML 语法（使用在线验证器）</li>
                    <li>3. 确认必需字段存在</li>
                    <li>4. 运行 <code>/agents list</code> 查看加载结果</li>
                  </ul>
                </div>
              </div>
              <CodeBlock
                title="检查子代理配置"
                code={`# 1. 确认文件位置
ls -la ~/.gemini/agents/          # 用户级
ls -la .gemini/agents/            # 项目级

# 2. 验证 YAML 格式
cat ~/.gemini/agents/reviewer.md | head -20

# 正确格式：
---
name: reviewer
description: 代码审查专家
---
系统提示内容...

# 错误格式（注意 --- 必须在文件开头）：
# 这行注释会破坏 frontmatter
---
name: reviewer
---

# 3. 在 CLI 中检查
/agents list`}
              />
            </div>
          </div>

          {/* 问题 2 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-amber-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-amber-400 font-bold">问题 2: 子代理执行后无输出</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🔍 常见原因</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>• 子代理因 MAX_TURNS 或 TIMEOUT 终止</li>
                    <li>• 工具调用循环未正确退出</li>
                    <li>• 系统提示导致 AI 只调用工具不返回文本</li>
                    <li>• AbortSignal 提前取消</li>
                  </ul>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🛠️ 排查步骤</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>1. 检查终止原因（terminateReason）</li>
                    <li>2. 查看执行统计（rounds、toolCalls）</li>
                    <li>3. 增加 max_turns 限制测试</li>
                    <li>4. 检查系统提示是否明确要求返回最终答案</li>
                  </ul>
                </div>
              </div>
              <CodeBlock
                title="调试子代理执行"
                code={`// 在系统提示中明确要求返回最终答案
---
name: analyzer
description: 代码分析专家
runConfig:
  max_turns: 20  # 增加轮次限制
  max_time_minutes: 10
---
你是代码分析专家。

重要规则：
1. 完成分析后，必须用纯文本返回分析结果
2. 不要在最后一步调用工具
3. 如果无法完成任务，也要返回文本说明原因

// 检查执行结果
const result = await subagent.runNonInteractive(context);
console.log('Terminate reason:', subagent.terminateMode);
console.log('Stats:', subagent.getStatsSummary());
console.log('Final text:', subagent.getFinalText());`}
              />
            </div>
          </div>

          {/* 问题 3 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-purple-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-purple-400 font-bold">问题 3: 模板变量替换失败</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🔍 常见原因</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>• 变量名拼写错误</li>
                    <li>• 使用了不支持的语法（如 <code>${'{foo.bar}'}</code>）</li>
                    <li>• 变量值包含特殊字符</li>
                    <li>• 变量未在 ContextState 中设置</li>
                  </ul>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🛠️ 排查步骤</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>1. 检查错误消息中的 missing keys</li>
                    <li>2. 确认变量名只包含 <code>\\w+</code> 字符</li>
                    <li>3. 打印 context.get_keys() 检查已设置的变量</li>
                    <li>4. 测试简化的模板</li>
                  </ul>
                </div>
              </div>
              <CodeBlock
                title="模板变量调试"
                code={`// 支持的语法
\${task_prompt}     // ✅ 简单变量
\${user_name}       // ✅ 下划线分隔
\${taskId123}       // ✅ 包含数字

// 不支持的语法
\${task.prompt}     // ❌ 不支持点号
\${task-prompt}     // ❌ 不支持连字符
\${task prompt}     // ❌ 不支持空格
\$task_prompt       // ❌ 必须有花括号

// 调试技巧
const context = new ContextState();
context.set('task_prompt', 'Review code');

// 检查所有已设置的变量
console.log('Available keys:', context.get_keys());

// 手动测试替换
const template = 'Please: \${task_prompt}';
try {
  const result = templateString(template, context);
  console.log('Result:', result);
} catch (e) {
  console.error('Missing keys:', e.message);
}`}
              />
            </div>
          </div>

          {/* 问题 4 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-cyan-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-cyan-400 font-bold">问题 4: 子代理工具不可用</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🔍 常见原因</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>• 配置中指定的工具名称错误</li>
                    <li>• 工具未在 ToolRegistry 中注册</li>
                    <li>• MCP 工具服务器未连接</li>
                    <li>• 显式指定了 Task 工具（会被过滤）</li>
                  </ul>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🛠️ 排查步骤</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>1. 检查工具名称是否正确</li>
                    <li>2. 使用 <code>tools: ['*']</code> 测试</li>
                    <li>3. 确认 MCP 服务器状态</li>
                    <li>4. 查看子代理实际可用的工具列表</li>
                  </ul>
                </div>
              </div>
              <CodeBlock
                title="检查子代理工具"
                code={`# 常见工具名称
tools:
  - Read           # 读取文件
  - Write          # 写入文件
  - Edit           # 编辑文件
  - Bash           # 执行命令
  - Grep           # 搜索内容
  - Glob           # 搜索文件
  - WebFetch       # 获取网页
  - WebSearch      # 网页搜索
  # - Task         # ❌ 会被自动过滤！

# 使用通配符继承所有工具
tools:
  - '*'

# 检查实际可用的工具
# 在 CLI 中查看
/tools list        # 列出所有可用工具`}
              />
            </div>
          </div>

          {/* 调试工具参考表 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[var(--bg-card)]">
                  <th className="border border-[var(--border-subtle)] px-3 py-2 text-left text-[var(--text-primary)]">调试场景</th>
                  <th className="border border-[var(--border-subtle)] px-3 py-2 text-left text-[var(--text-primary)]">命令/方法</th>
                  <th className="border border-[var(--border-subtle)] px-3 py-2 text-left text-[var(--text-primary)]">说明</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">列出所有子代理</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">/agents list</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">显示所有级别的子代理</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">查看子代理详情</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">/agents show [name]</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">显示配置和系统提示</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">检查执行统计</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">subagent.getStatsSummary()</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">获取轮次、工具调用等统计</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">查看终止原因</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">subagent.terminateMode</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">GOAL/MAX_TURNS/TIMEOUT 等</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">获取最终输出</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">subagent.getFinalText()</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">获取子代理最终文本输出</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">启用调试日志</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">DEBUG=subagent:* gemini</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">输出详细的子代理日志</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Layer>

      {/* 性能优化建议 */}
      <Layer title="性能优化建议" icon="⚡">
        <div className="space-y-6">
          {/* 优化 1: 工具列表精简 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-cyan-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-cyan-400 font-bold">优化 1: 精简工具列表</h4>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">
                每个工具的 schema 都会消耗 token，精简工具列表可以显著减少每轮请求的 token 消耗。
              </p>
              <CodeBlock
                title="工具列表优化对比"
                code={`# ❌ 不推荐：继承所有工具
tools:
  - '*'
# 结果：30+ 工具 schema，每轮消耗 ~3000 tokens

# ✅ 推荐：只保留必需工具
tools:
  - Read
  - Grep
  - Glob
# 结果：3 工具 schema，每轮消耗 ~300 tokens

# 省了 2700 tokens/轮 × 10 轮 = 27000 tokens`}
              />
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
                  <div className="text-xl font-bold text-red-400">~3000</div>
                  <div className="text-xs text-[var(--text-muted)]">全部工具 tokens/轮</div>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
                  <div className="text-xl font-bold text-green-400">~300</div>
                  <div className="text-xs text-[var(--text-muted)]">精简工具 tokens/轮</div>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
                  <div className="text-xl font-bold text-cyan-400">90%</div>
                  <div className="text-xs text-[var(--text-muted)]">Token 节省</div>
                </div>
              </div>
            </div>
          </div>

          {/* 优化 2: 合理的终止条件 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-purple-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-purple-400 font-bold">优化 2: 合理设置终止条件</h4>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">
                根据任务复杂度设置合适的 max_turns 和 max_time_minutes，避免资源浪费。
              </p>
              <CodeBlock
                title="终止条件配置指南"
                code={`# 简单任务（单文件操作）
runConfig:
  max_turns: 5          # 读取 + 分析 + 返回
  max_time_minutes: 2

# 中等任务（多文件分析）
runConfig:
  max_turns: 15         # 多次读取和搜索
  max_time_minutes: 5

# 复杂任务（全项目扫描）
runConfig:
  max_turns: 30         # 大量文件操作
  max_time_minutes: 10

# 危险配置（避免）
runConfig:
  max_turns: 100        # 太多！
  max_time_minutes: 30  # 太长！`}
              />
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3">
                <h5 className="text-amber-400 text-sm font-semibold mb-1">⚠️ 经验法则</h5>
                <ul className="text-xs text-[var(--text-muted)] space-y-1">
                  <li>• 每个工具调用大约需要 1-2 轮</li>
                  <li>• 预估任务需要多少个工具调用</li>
                  <li>• max_turns = 预估工具调用数 × 2 + 5（缓冲）</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 优化 3: 系统提示优化 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-green-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-green-400 font-bold">优化 3: 精简系统提示</h4>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">
                系统提示每轮都会发送，精简系统提示可以显著减少 token 消耗。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                  <h5 className="text-red-400 text-sm font-semibold mb-1">❌ 冗长的系统提示</h5>
                  <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap">{`你是一个专业的代码审查专家，拥有多年的软件开发经验。
你精通各种编程语言和框架...
（500+ 字描述）
你需要检查以下方面：
1. 代码质量...
2. 性能问题...
（详细列举 20+ 点）
~2000 tokens`}</pre>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <h5 className="text-green-400 text-sm font-semibold mb-1">✅ 精简的系统提示</h5>
                  <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap">{`代码审查专家。检查：
- 代码质量和可读性
- 潜在 bug 和安全问题
- 性能优化机会

完成后返回简洁的审查报告。
~100 tokens`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* 优化 4: 并行工具执行 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-amber-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-amber-400 font-bold">优化 4: 利用并行工具执行</h4>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">
                子代理默认支持并行工具执行。编写系统提示时，引导 AI 一次请求多个独立的工具调用。
              </p>
              <CodeBlock
                title="并行执行提示示例"
                code={`---
name: file-analyzer
description: 文件分析专家
---
文件分析专家。

执行策略：
1. 对于独立的文件操作，一次请求多个工具调用
   ✅ 同时读取 file1.ts, file2.ts, file3.ts
   ❌ 依次读取每个文件

2. 等所有文件读取完成后再分析
3. 返回统一的分析报告

# AI 会生成类似这样的请求：
# {
#   "tool_calls": [
#     { "name": "Read", "args": { "path": "file1.ts" } },
#     { "name": "Read", "args": { "path": "file2.ts" } },
#     { "name": "Read", "args": { "path": "file3.ts" } }
#   ]
# }
# 三个文件同时读取，而非串行`}
              />
            </div>
          </div>

          {/* 性能基准表 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[var(--bg-card)]">
                  <th className="border border-[var(--border-subtle)] px-3 py-2 text-left text-[var(--text-primary)]">优化项</th>
                  <th className="border border-[var(--border-subtle)] px-3 py-2 text-left text-[var(--text-primary)]">优化前</th>
                  <th className="border border-[var(--border-subtle)] px-3 py-2 text-left text-[var(--text-primary)]">优化后</th>
                  <th className="border border-[var(--border-subtle)] px-3 py-2 text-left text-[var(--text-primary)]">节省</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">工具 schema tokens/轮</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-red-400">~3000</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-green-400">~300</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-cyan-400">90%</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">系统提示 tokens</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-red-400">~2000</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-green-400">~100</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-cyan-400">95%</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">10 轮任务总 tokens</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-red-400">~50000</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-green-400">~8000</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-cyan-400">84%</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">并行读取 5 文件耗时</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-red-400">~5000ms</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-green-400">~1200ms</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-cyan-400">76%</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">预计成本 (10 轮)</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-red-400">~$0.25</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-green-400">~$0.04</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-cyan-400">84%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Layer>

      {/* 与其他模块的交互关系 */}
      <Layer title="与其他模块的交互关系" icon="🔗">
        <div className="space-y-6">
          {/* 依赖关系图 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
            <h4 className="text-[var(--text-primary)] font-bold mb-3">📊 Subagent 系统依赖关系图</h4>
            <CodeBlock
              title="Mermaid 依赖图"
              code={`graph TB
    subgraph CLI["CLI 层"]
        AgentCmd["/agents 命令"]
        TaskUI["Task 工具 UI"]
    end

    subgraph Core["Core 层"]
        TaskTool["Task 工具"]
        Registry["SubagentRegistry"]
        Subagent["Subagent 实例"]
        ContextState["ContextState"]
        Scheduler["CoreToolScheduler"]
    end

    subgraph Storage["存储层"]
        ProjectDir[".gemini/agents/"]
        UserDir["~/.gemini/agents/"]
        Builtin["内置代理"]
    end

    subgraph External["外部依赖"]
        AI["AI 模型"]
        Tools["工具系统"]
    end

    AgentCmd --> Registry
    TaskUI --> TaskTool
    TaskTool --> Registry
    Registry --> ProjectDir
    Registry --> UserDir
    Registry --> Builtin
    TaskTool --> Subagent
    Subagent --> ContextState
    Subagent --> Scheduler
    Scheduler --> Tools
    Subagent --> AI

    style TaskTool fill:#9333ea,color:#fff
    style Subagent fill:#3b82f6,color:#fff
    style Registry fill:#10b981,color:#fff`}
            />
          </div>

          {/* 上下游模块说明 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
              <h4 className="text-[var(--purple)] font-bold mb-3">⬆️ 上游依赖</h4>
              <div className="space-y-2">
                <div className="bg-[var(--bg-card)] p-3 rounded border-l-4 border-purple-500">
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">SubagentRegistry</h5>
                  <p className="text-xs text-[var(--text-muted)]">
                    从三级目录加载子代理配置，提供解析和列表功能
                  </p>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded border-l-4 border-purple-500">
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">ToolRegistry</h5>
                  <p className="text-xs text-[var(--text-muted)]">
                    提供子代理可用的工具列表和 schema
                  </p>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded border-l-4 border-purple-500">
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">AI 模型服务</h5>
                  <p className="text-xs text-[var(--text-muted)]">
                    提供聊天接口，支持流式响应和工具调用
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
              <h4 className="text-[var(--terminal-green)] font-bold mb-3">⬇️ 下游消费者</h4>
              <div className="space-y-2">
                <div className="bg-[var(--bg-card)] p-3 rounded border-l-4 border-green-500">
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">Task 工具</h5>
                  <p className="text-xs text-[var(--text-muted)]">
                    主要入口，AI 通过 Task 工具调用子代理
                  </p>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded border-l-4 border-green-500">
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">/agents 命令</h5>
                  <p className="text-xs text-[var(--text-muted)]">
                    CLI 命令，用于列出、创建、删除子代理
                  </p>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded border-l-4 border-green-500">
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">事件监听器</h5>
                  <p className="text-xs text-[var(--text-muted)]">
                    监听子代理事件，用于 UI 更新和日志记录
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 关键接口 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
            <h4 className="text-[var(--text-primary)] font-bold mb-3">🔌 关键接口定义</h4>
            <CodeBlock
              title="Subagent 模块导出接口"
              code={`// packages/core/src/subagents/index.ts

// 核心类
export { Subagent } from './subagent';
export { ContextState } from './subagent';
export { SubagentRegistry } from './registry';

// 类型定义
export interface SubagentConfig {
  name: string;                    // 代理名称
  description: string;             // 代理描述
  tools?: string[];                // 可用工具列表
  modelConfig?: {                  // 模型配置
    model?: string;
    temp?: number;
    top_p?: number;
  };
  runConfig?: {                    // 运行配置
    max_turns?: number;            // 最大轮次 (默认 100)
    max_time_minutes?: number;     // 最大时间 (默认 10)
  };
  color?: string;                  // UI 颜色
}

export interface SubagentPromptConfig {
  systemPrompt: string;            // 系统提示（Markdown 内容）
}

export enum SubagentTerminateMode {
  GOAL = 'GOAL',                   // 任务完成
  MAX_TURNS = 'MAX_TURNS',         // 达到轮次限制
  TIMEOUT = 'TIMEOUT',             // 超时
  ERROR = 'ERROR',                 // 错误
  CANCELLED = 'CANCELLED'          // 用户取消
}

export interface SubagentStatsSummary {
  rounds: number;
  totalDurationMs: number;
  totalToolCalls: number;
  successfulToolCalls: number;
  failedToolCalls: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  toolUsage: ToolUsageStat[];
}

// 事件类型
export enum SubAgentEventType {
  START = 'start',
  ROUND_START = 'round_start',
  ROUND_END = 'round_end',
  STREAM_TEXT = 'stream_text',
  TOOL_CALL = 'tool_call',
  TOOL_RESULT = 'tool_result',
  FINISH = 'finish',
  ERROR = 'error'
}`}
            />
          </div>

          {/* 数据流 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
            <h4 className="text-[var(--text-primary)] font-bold mb-3">🔄 子代理调用数据流</h4>
            <CodeBlock
              title="完整调用流程"
              code={`sequenceDiagram
    participant User as 用户
    participant AI as 主 AI
    participant Task as Task 工具
    participant Registry as SubagentRegistry
    participant Subagent as Subagent
    participant SubAI as 子代理 AI
    participant Tools as 工具系统

    User->>AI: 复杂任务请求
    AI->>Task: 调用 Task 工具
    Task->>Registry: 解析子代理名称
    Registry-->>Task: Subagent 配置
    Task->>Subagent: 创建实例

    loop 非交互执行
        Subagent->>SubAI: 发送消息
        SubAI-->>Subagent: 流式响应

        alt 有工具调用
            Subagent->>Tools: 执行工具
            Tools-->>Subagent: 工具结果
        else 无工具调用
            Subagent->>Subagent: 设置 GOAL 终止
        end

        alt 检查终止条件
            Subagent->>Subagent: MAX_TURNS?
            Subagent->>Subagent: TIMEOUT?
        end
    end

    Subagent-->>Task: 最终结果
    Task-->>AI: 子代理输出
    AI-->>User: 整合响应`}
            />
          </div>

          {/* 扩展点 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
            <h4 className="text-[var(--text-primary)] font-bold mb-3">🧩 扩展点</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border-subtle)]">
                <h5 className="text-[var(--cyber-blue)] font-semibold mb-2">自定义子代理加载器</h5>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  除了文件系统，可以从其他来源加载子代理：
                </p>
                <CodeBlock
                  code={`interface SubagentLoader {
  load(): Promise<SubagentConfig[]>;
  watch?(callback: (event: 'add' | 'remove', name: string) => void): void;
}

// 示例：从远程 API 加载
class RemoteSubagentLoader implements SubagentLoader {
  async load() {
    const response = await fetch('https://api.example.com/agents');
    return response.json();
  }
}`}
                />
              </div>

              <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border-subtle)]">
                <h5 className="text-[var(--amber)] font-semibold mb-2">自定义钩子</h5>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  在子代理执行的各个阶段注入自定义逻辑：
                </p>
                <CodeBlock
                  code={`interface SubagentHooks {
  preToolUse?(payload: ToolUsePayload): Promise<void>;
  postToolUse?(payload: ToolResultPayload): Promise<void>;
  onStop?(payload: StopPayload): Promise<void>;
}

// 示例：工具调用计费
class BillingHook implements SubagentHooks {
  async postToolUse(payload) {
    await billingService.record({
      tool: payload.toolName,
      duration: payload.durationMs,
      success: payload.success
    });
  }
}`}
                />
              </div>

              <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border-subtle)]">
                <h5 className="text-[var(--terminal-green)] font-semibold mb-2">自定义终止条件</h5>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  除了内置的终止条件，可以添加自定义判断：
                </p>
                <CodeBlock
                  code={`interface TerminationChecker {
  shouldTerminate(context: {
    rounds: number;
    duration: number;
    tokens: number;
    toolCalls: ToolCallResult[];
  }): { terminate: boolean; reason?: string };
}

// 示例：Token 预算终止
class TokenBudgetChecker implements TerminationChecker {
  constructor(private budget: number) {}

  shouldTerminate(ctx) {
    if (ctx.tokens > this.budget) {
      return { terminate: true, reason: 'TOKEN_BUDGET' };
    }
    return { terminate: false };
  }
}`}
                />
              </div>

              <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border-subtle)]">
                <h5 className="text-[var(--purple)] font-semibold mb-2">模板引擎扩展</h5>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  扩展模板变量语法支持更复杂的表达式：
                </p>
                <CodeBlock
                  code={`interface TemplateEngine {
  render(template: string, context: ContextState): string;
  registerHelper(name: string, fn: HelperFn): void;
}

// 示例：添加条件语法支持
engine.registerHelper('if', (condition, thenVal, elseVal) => {
  return condition ? thenVal : elseVal;
});

// 使用: \${if(hasTests, "运行测试", "跳过测试")}`}
                />
              </div>
            </div>
          </div>
        </div>
      </Layer>

      {/* 为什么这样设计 */}
      <Layer title="为什么这样设计子代理系统" icon="🤔" defaultOpen={false}>
        <div className="space-y-6">
          <HighlightBox title="设计决策解析" icon="💡" variant="blue">
            <p className="text-sm text-[var(--text-secondary)]">
              子代理系统的设计目标是<strong>任务分解与专业化执行</strong>，
              让复杂任务可以被分解为多个专门的子任务，由具备特定能力的代理完成。
            </p>
          </HighlightBox>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)]">
              <h4 className="text-[var(--terminal-green)] font-bold mb-2">1. 为什么使用非交互模式？</h4>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                子代理<strong>不询问用户问题</strong>，直接根据可用上下文完成任务。
              </p>
              <ul className="text-xs text-[var(--text-muted)] space-y-1">
                <li>• <strong>原因</strong>: 子代理是自动执行的后台任务</li>
                <li>• <strong>好处</strong>: 避免阻塞主流程，提高执行效率</li>
                <li>• <strong>权衡</strong>: 需要更完整的初始上下文</li>
              </ul>
            </div>

            <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)]">
              <h4 className="text-[var(--cyber-blue)] font-bold mb-2">2. 为什么过滤 Task 工具？</h4>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                子代理工具列表中<strong>移除 Task 工具</strong>，防止递归调用。
              </p>
              <ul className="text-xs text-[var(--text-muted)] space-y-1">
                <li>• <strong>原因</strong>: 防止子代理无限嵌套调用自己</li>
                <li>• <strong>好处</strong>: 避免资源耗尽和死循环</li>
                <li>• <strong>权衡</strong>: 子代理无法再委托任务</li>
              </ul>
            </div>

            <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)]">
              <h4 className="text-[var(--amber)] font-bold mb-2">3. 为什么使用 Markdown + YAML Frontmatter？</h4>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                子代理配置文件使用 <code>.md</code> 格式，Frontmatter 存储元数据。
              </p>
              <ul className="text-xs text-[var(--text-muted)] space-y-1">
                <li>• <strong>原因</strong>: Markdown 适合长文本系统提示</li>
                <li>• <strong>好处</strong>: 可读性强，支持富文本格式</li>
                <li>• <strong>权衡</strong>: 需要解析 Frontmatter</li>
              </ul>
            </div>

            <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)]">
              <h4 className="text-[var(--purple)] font-bold mb-2">4. 为什么采用三级配置层次？</h4>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                项目级 &gt; 用户级 &gt; 内置，优先级递减。
              </p>
              <ul className="text-xs text-[var(--text-muted)] space-y-1">
                <li>• <strong>原因</strong>: 允许项目自定义覆盖默认行为</li>
                <li>• <strong>好处</strong>: 灵活性与一致性兼顾</li>
                <li>• <strong>权衡</strong>: 配置来源可能不明确</li>
              </ul>
            </div>

            <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)] md:col-span-2">
              <h4 className="text-[var(--terminal-green)] font-bold mb-2">5. 为什么使用模板变量系统？</h4>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                系统提示支持 <code>$&#123;key&#125;</code> 占位符，运行时替换为 ContextState 中的值。
              </p>
              <ul className="text-xs text-[var(--text-muted)] space-y-1">
                <li>• <strong>原因</strong>: 同一个子代理可以根据上下文执行不同任务</li>
                <li>• <strong>好处</strong>: 复用配置，减少重复定义</li>
                <li>• <strong>权衡</strong>: 缺失变量会导致运行时错误</li>
              </ul>
            </div>
          </div>

          {/* 子代理类型参考表 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
            <h4 className="text-[var(--text-primary)] font-bold mb-3">📊 内置子代理类型参考</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="text-left py-2 px-3 text-[var(--text-muted)]">类型</th>
                    <th className="text-left py-2 px-3 text-[var(--text-muted)]">用途</th>
                    <th className="text-left py-2 px-3 text-[var(--text-muted)]">特殊配置</th>
                    <th className="text-left py-2 px-3 text-[var(--text-muted)]">终止模式</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--text-secondary)]">
                  <tr className="border-b border-[var(--border-subtle)]/50">
                    <td className="py-2 px-3 font-mono text-[var(--terminal-green)]">Explore</td>
                    <td className="py-2 px-3">代码库探索</td>
                    <td className="py-2 px-3">仅读取工具</td>
                    <td className="py-2 px-3">GOAL</td>
                  </tr>
                  <tr className="border-b border-[var(--border-subtle)]/50">
                    <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">Plan</td>
                    <td className="py-2 px-3">任务规划</td>
                    <td className="py-2 px-3">读取+分析工具</td>
                    <td className="py-2 px-3">GOAL</td>
                  </tr>
                  <tr className="border-b border-[var(--border-subtle)]/50">
                    <td className="py-2 px-3 font-mono text-[var(--amber)]">general-purpose</td>
                    <td className="py-2 px-3">通用任务</td>
                    <td className="py-2 px-3">全部工具（除Task）</td>
                    <td className="py-2 px-3">MAX_TURNS=100</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-[var(--purple)]">自定义</td>
                    <td className="py-2 px-3">用户定义</td>
                    <td className="py-2 px-3">YAML 配置</td>
                    <td className="py-2 px-3">可配置</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
