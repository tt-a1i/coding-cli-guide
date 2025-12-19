import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';

export function SubagentSystem() {
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

      {/* 子代理文件格式 */}
      <Layer title="子代理文件格式" icon="📝">
        <CodeBlock
          title="YAML Frontmatter + Markdown"
          code={`---
name: code-reviewer
description: 专业代码审查代理，分析代码质量和潜在问题

tools:
  - read_file
  - grep
  - glob

modelConfig:
  temp: 0.3
  top_p: 0.9

runConfig:
  max_turns: 10
  max_time_minutes: 5

color: "#4CAF50"
---

你是一个专业的代码审查专家。

## 职责
1. 检查代码质量和规范性
2. 识别潜在的 bug 和安全问题
3. 提供改进建议

## 审查标准
- 代码可读性
- 性能优化
- 安全最佳实践
- 测试覆盖率`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">YAML Frontmatter</h4>
            <ul className="text-sm space-y-1">
              <li><code>name</code> - 子代理名称（必需）</li>
              <li><code>description</code> - 描述（必需）</li>
              <li><code>tools</code> - 可用工具列表</li>
              <li><code>modelConfig</code> - 模型参数</li>
              <li><code>runConfig</code> - 运行限制</li>
              <li><code>color</code> - UI 显示颜色</li>
            </ul>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">Markdown 内容</h4>
            <p className="text-sm text-gray-300">
              Frontmatter 之后的 Markdown 内容作为子代理的 <strong>系统提示 (System Prompt)</strong>，
              定义代理的角色、职责和行为规则。
            </p>
          </div>
        </div>
      </Layer>

      {/* SubagentManager */}
      <Layer title="SubagentManager" icon="🔧">
        <CodeBlock
          title="packages/core/src/subagents/subagent-manager.ts"
          code={`class SubagentManager {
    private subagentsCache: Map<SubagentLevel, SubagentConfig[]> | null = null;
    private validator: SubagentValidator;

    // 加载子代理（优先级：项目 > 用户 > 内置）
    async loadSubagent(
        name: string,
        level?: SubagentLevel
    ): Promise<SubagentConfig | null> {
        // 1. 尝试项目级
        const projectConfig = await this.findSubagentByNameAtLevel(name, 'project');
        if (projectConfig) return projectConfig;

        // 2. 尝试用户级
        const userConfig = await this.findSubagentByNameAtLevel(name, 'user');
        if (userConfig) return userConfig;

        // 3. 尝试内置
        return BuiltinAgentRegistry.getBuiltinAgent(name);
    }

    // 解析子代理文件
    parseSubagentContent(
        content: string,
        filePath: string,
        level: SubagentLevel
    ): SubagentConfig {
        // 1. 分割 frontmatter 和内容
        const frontmatterRegex = /^---\\n([\\s\\S]*?)\\n---\\n([\\s\\S]*)$/;
        const match = content.match(frontmatterRegex);

        const [, frontmatterYaml, systemPrompt] = match;

        // 2. 解析 YAML frontmatter
        const frontmatter = parseYaml(frontmatterYaml);

        // 3. 构建配置对象
        return {
            name: String(frontmatter['name']),
            description: String(frontmatter['description']),
            tools: frontmatter['tools'],
            systemPrompt: systemPrompt.trim(),
            modelConfig: frontmatter['modelConfig'],
            runConfig: frontmatter['runConfig'],
            color: frontmatter['color'],
            level,
            filePath,
        };
    }

    // 创建子代理作用域
    async createSubagentScope(
        config: SubagentConfig,
        runtimeContext: Config
    ): Promise<SubAgentScope> {
        const runtimeConfig = this.convertToRuntimeConfig(config);
        return SubAgentScope.create(
            config.name,
            runtimeContext,
            runtimeConfig.promptConfig,
            runtimeConfig.modelConfig,
            runtimeConfig.runConfig,
            runtimeConfig.toolConfig
        );
    }
}`}
        />
      </Layer>

      {/* SubAgentScope */}
      <Layer title="SubAgentScope 执行环境" icon="⚡">
        <CodeBlock
          title="packages/core/src/subagents/subagent.ts"
          code={`class SubAgentScope {
    private executionStats: ExecutionStats;
    private toolUsage = new Map<string, ToolUsageStats>();
    private finalText: string = '';
    private terminateMode: SubagentTerminateMode;

    // 非交互模式运行
    async runNonInteractive(
        context: ContextState,
        externalSignal?: AbortSignal
    ): Promise<void> {
        const chat = await this.createChatObject(context);
        const toolsList = this.prepareToolsList();

        const startTime = Date.now();
        let turnCounter = 0;

        while (true) {
            // 检查终止条件
            if (this.runConfig.max_turns &&
                turnCounter >= this.runConfig.max_turns) {
                this.terminateMode = SubagentTerminateMode.MAX_TURNS;
                break;
            }

            if (this.runConfig.max_time_minutes &&
                durationMin >= this.runConfig.max_time_minutes) {
                this.terminateMode = SubagentTerminateMode.TIMEOUT;
                break;
            }

            // 发送消息并获取响应流
            const responseStream = await chat.sendMessageStream(
                this.modelConfig.model,
                { message: currentMessages, config: { tools } }
            );

            // 处理响应
            for await (const streamEvent of responseStream) {
                if (streamEvent.type === 'chunk') {
                    // 收集函数调用和文本
                    if (resp.functionCalls) functionCalls.push(...);
                    if (txt) roundText += txt;
                }
            }

            // 如果有工具调用，执行它们
            if (functionCalls.length > 0) {
                currentMessages = await this.processFunctionCalls(
                    functionCalls,
                    abortController
                );
            } else {
                // 没有工具调用 = 最终答案
                this.finalText = roundText.trim();
                this.terminateMode = SubagentTerminateMode.GOAL;
                break;
            }
        }
    }
}`}
        />

        <div className="bg-black/30 rounded-xl p-6 mt-4">
          <h4 className="text-cyan-400 font-bold mb-4 text-center">子代理执行流程</h4>
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-blue-400/20 border border-blue-400 rounded-lg px-4 py-2 text-center">
              <strong>1. 初始化</strong>
              <div className="text-xs text-gray-400">创建 Chat 对象，准备工具列表</div>
            </div>
            <div className="text-cyan-400">↓</div>
            <div className="bg-purple-400/20 border border-purple-400 rounded-lg px-4 py-2 text-center">
              <strong>2. 发送消息</strong>
              <div className="text-xs text-gray-400">流式接收 AI 响应</div>
            </div>
            <div className="text-cyan-400">↓</div>
            <div className="bg-orange-400/20 border border-orange-400 rounded-lg px-4 py-2 text-center">
              <strong>3. 处理响应</strong>
              <div className="text-xs text-gray-400">执行工具调用或收集文本</div>
            </div>
            <div className="text-cyan-400">↓</div>
            <div className="bg-green-400/20 border border-green-400 rounded-lg px-4 py-2 text-center">
              <strong>4. 循环或终止</strong>
              <div className="text-xs text-gray-400">检查终止条件，继续或结束</div>
            </div>
          </div>
        </div>
      </Layer>

      {/* 终止模式 */}
      <Layer title="终止模式 (Terminate Modes)" icon="🛑">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">GOAL</h4>
            <p className="text-sm text-gray-300">任务成功完成，AI 返回了最终答案</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">MAX_TURNS</h4>
            <p className="text-sm text-gray-300">达到最大轮次限制</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-400 font-bold mb-2">TIMEOUT</h4>
            <p className="text-sm text-gray-300">超过最大执行时间</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2">ERROR</h4>
            <p className="text-sm text-gray-300">执行过程中发生错误</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 md:col-span-2">
            <h4 className="text-purple-400 font-bold mb-2">CANCELLED</h4>
            <p className="text-sm text-gray-300">用户或系统取消了执行</p>
          </div>
        </div>
      </Layer>

      {/* 事件系统 */}
      <Layer title="子代理事件系统" icon="📡">
        <JsonBlock
          code={`// SubAgentEventType 枚举
{
    "START": "subagent_start",
    "ROUND_START": "round_start",
    "ROUND_END": "round_end",
    "STREAM_TEXT": "stream_text",
    "TOOL_CALL": "tool_call",
    "TOOL_RESULT": "tool_result",
    "TOOL_WAITING_APPROVAL": "tool_waiting_approval",
    "FINISH": "subagent_finish",
    "ERROR": "subagent_error"
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

      {/* ContextState */}
      <Layer title="ContextState 上下文状态" icon="📦">
        <CodeBlock
          title="变量模板替换"
          code={`// ContextState 类 - 存储子代理运行时的键值对状态
class ContextState {
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

// 模板字符串替换
// 系统提示中的 \${key} 会被替换为 context 中的值
function templateString(template: string, context: ContextState): string {
    const placeholderRegex = /\\$\\{(\\w+)\\}/g;
    return template.replace(placeholderRegex, (_match, key) =>
        String(context.get(key))
    );
}

// 使用示例
const context = new ContextState();
context.set('task_prompt', '请审查 src/utils.ts 文件');
context.set('language', 'TypeScript');

// 模板: "请用 \${language} 完成: \${task_prompt}"
// 结果: "请用 TypeScript 完成: 请审查 src/utils.ts 文件"`}
        />
      </Layer>

      {/* 统计信息 */}
      <Layer title="执行统计 (SubagentStatistics)" icon="📊">
        <JsonBlock
          code={`// SubagentStatsSummary 结构
{
    "startTimeMs": 1703001234567,
    "totalDurationMs": 15000,
    "rounds": 3,
    "totalToolCalls": 5,
    "successfulToolCalls": 5,
    "failedToolCalls": 0,
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
            "name": "grep",
            "count": 2,
            "success": 2,
            "failure": 0,
            "totalDurationMs": 200,
            "averageDurationMs": 100
        }
    ]
}`}
        />
      </Layer>

      {/* 使用方式 */}
      <Layer title="使用子代理" icon="🚀">
        <CodeBlock
          code={`# 在 CLI 中使用子代理

# 1. 通过 /agents 命令管理
/agents list              # 列出所有子代理
/agents create            # 创建新子代理（打开对话框）
/agents delete <name>     # 删除子代理

# 2. 子代理作为工具被 AI 调用
# 当用户请求复杂任务时，主 AI 可以调用 Task 工具
# Task 工具会启动对应的子代理来处理

# 3. 子代理配置位置
~/.innies/agents/         # 用户级子代理
.innies/agents/           # 项目级子代理

# 4. 示例：创建代码审查子代理
# 创建文件: .innies/agents/reviewer.md
---
name: reviewer
description: 代码审查专家
tools:
  - read_file
  - grep
runConfig:
  max_turns: 5
---
你是代码审查专家...`}
        />

        <HighlightBox title="优先级规则" icon="📋" variant="green">
          <ol className="pl-5 list-decimal space-y-1">
            <li><strong>项目级</strong> - .innies/agents/ 下的子代理优先</li>
            <li><strong>用户级</strong> - ~/.innies/agents/ 下的子代理次之</li>
            <li><strong>内置</strong> - 代码中定义的内置子代理最后</li>
          </ol>
          <p className="text-sm text-gray-400 mt-2">
            相同名称的子代理，高优先级会覆盖低优先级。
          </p>
        </HighlightBox>
      </Layer>
    </div>
  );
}
