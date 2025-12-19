import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';

export function LoopDetection() {
  const loopDetectionFlow = `
flowchart TD
    start([AI 响应完成])
    record[记录工具调用<br/>和内容哈希]
    check_tool{工具调用重复<br/>≥5次?}
    check_content{内容哈希重复<br/>≥10次?}
    check_turns{对话轮数<br/>≥30?}
    llm_check[LLM 智能检测<br/>分析对话模式]
    is_loop{检测到循环?}
    report_loop([报告循环<br/>触发中断])
    continue([继续执行])

    start --> record
    record --> check_tool
    check_tool -->|Yes| report_loop
    check_tool -->|No| check_content
    check_content -->|Yes| report_loop
    check_content -->|No| check_turns
    check_turns -->|Yes| llm_check
    check_turns -->|No| continue
    llm_check --> is_loop
    is_loop -->|Yes| report_loop
    is_loop -->|No| continue

    style start fill:#22d3ee,color:#000
    style check_tool fill:#f59e0b,color:#000
    style check_content fill:#f59e0b,color:#000
    style check_turns fill:#f59e0b,color:#000
    style is_loop fill:#f59e0b,color:#000
    style report_loop fill:#ef4444,color:#fff
    style continue fill:#22c55e,color:#000
`;

  const thresholdsCode = `// packages/core/src/services/loopDetectionService.ts

// 循环检测阈值常量
const TOOL_CALL_LOOP_THRESHOLD = 5;     // 工具调用重复阈值
const CONTENT_LOOP_THRESHOLD = 10;       // 内容重复阈值
const LLM_CHECK_AFTER_TURNS = 30;       // 触发 LLM 检测的轮数

// 循环检测服务类
export class LoopDetectionService {
  private toolCallHistory: Map<string, number> = new Map();
  private contentHashHistory: Map<string, number> = new Map();
  private turnCount: number = 0;

  // 检查是否处于循环状态
  async checkForLoop(
    response: AIResponse,
    conversationHistory: Message[]
  ): Promise<LoopDetectionResult> {
    this.turnCount++;

    // 阶段1: 检测工具调用循环
    const toolLoopResult = this.checkToolCallLoop(response);
    if (toolLoopResult.isLoop) {
      return toolLoopResult;
    }

    // 阶段2: 检测内容重复循环
    const contentLoopResult = this.checkContentLoop(response);
    if (contentLoopResult.isLoop) {
      return contentLoopResult;
    }

    // 阶段3: 长对话的 LLM 智能检测
    if (this.turnCount >= LLM_CHECK_AFTER_TURNS) {
      return await this.performLLMLoopCheck(conversationHistory);
    }

    return { isLoop: false };
  }
}`;

  const toolCallLoopCode = `// 工具调用循环检测
// 基于工具名称和参数的哈希值跟踪重复调用

interface ToolCallHash {
  toolName: string;
  argsHash: string;      // 参数的 MD5 哈希
  timestamp: number;
}

private checkToolCallLoop(response: AIResponse): LoopDetectionResult {
  const toolCalls = response.toolCalls || [];

  for (const call of toolCalls) {
    // 生成工具调用的唯一哈希
    const hash = this.generateToolCallHash(call);
    const count = (this.toolCallHistory.get(hash) || 0) + 1;
    this.toolCallHistory.set(hash, count);

    // 检查是否超过阈值
    if (count >= TOOL_CALL_LOOP_THRESHOLD) {
      return {
        isLoop: true,
        type: 'tool_call',
        message: \`检测到工具调用循环: \${call.name} 已被调用 \${count} 次，参数相同\`,
        details: {
          toolName: call.name,
          repeatCount: count,
          args: call.args
        }
      };
    }
  }

  return { isLoop: false };
}

// 生成工具调用哈希
private generateToolCallHash(call: ToolCall): string {
  const hashInput = JSON.stringify({
    name: call.name,
    args: call.args
  });
  return crypto.createHash('md5').update(hashInput).digest('hex');
}

/*
示例场景：AI 陷入读取同一文件的循环

Turn 1: Read("config.json") -> hash: abc123
Turn 2: Read("config.json") -> hash: abc123 (count: 2)
Turn 3: Read("config.json") -> hash: abc123 (count: 3)
Turn 4: Read("config.json") -> hash: abc123 (count: 4)
Turn 5: Read("config.json") -> hash: abc123 (count: 5) 🚨 触发循环检测!
*/`;

  const contentLoopCode = `// 内容重复循环检测
// 基于 AI 响应内容的句子级哈希

private checkContentLoop(response: AIResponse): LoopDetectionResult {
  const content = response.text || '';

  // 提取句子并生成哈希
  const sentences = this.extractSentences(content);

  for (const sentence of sentences) {
    // 跳过太短的句子
    if (sentence.length < 20) continue;

    const hash = this.generateContentHash(sentence);
    const count = (this.contentHashHistory.get(hash) || 0) + 1;
    this.contentHashHistory.set(hash, count);

    // 检查是否超过阈值
    if (count >= CONTENT_LOOP_THRESHOLD) {
      return {
        isLoop: true,
        type: 'content',
        message: \`检测到内容重复循环: 相同内容已出现 \${count} 次\`,
        details: {
          repeatedContent: sentence.substring(0, 100) + '...',
          repeatCount: count
        }
      };
    }
  }

  return { isLoop: false };
}

// 提取句子
private extractSentences(content: string): string[] {
  // 使用标点符号和换行符分割
  return content
    .split(/[.!?\\n]+/)
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 0);
}

// 生成内容哈希 (忽略空格和大小写)
private generateContentHash(sentence: string): string {
  const normalized = sentence
    .toLowerCase()
    .replace(/\\s+/g, ' ')
    .trim();
  return crypto.createHash('md5').update(normalized).digest('hex');
}`;

  const llmCheckCode = `// LLM 智能循环检测
// 使用 AI 模型分析对话模式，检测复杂的循环行为

private async performLLMLoopCheck(
  conversationHistory: Message[]
): Promise<LoopDetectionResult> {
  // 提取最近的对话轮次用于分析
  const recentTurns = conversationHistory.slice(-20);

  const analysisPrompt = \`
分析以下对话历史，判断 AI 是否陷入了循环行为。

循环行为的特征包括：
1. 重复尝试相同的操作但期望不同结果
2. 在相同的错误上反复失败
3. 生成重复或高度相似的内容
4. 无法在任务上取得实质性进展
5. 反复请求相同的信息

对话历史:
\${JSON.stringify(recentTurns, null, 2)}

请以 JSON 格式回复:
{
  "isLoop": boolean,
  "confidence": number (0-1),
  "reasoning": "解释为什么认为是/不是循环",
  "pattern": "如果是循环，描述检测到的模式",
  "suggestion": "如何打破循环的建议"
}
\`;

  const response = await this.llmClient.generate(analysisPrompt);
  const analysis = JSON.parse(response.text);

  if (analysis.isLoop && analysis.confidence > 0.7) {
    return {
      isLoop: true,
      type: 'llm_detected',
      message: \`AI 检测到循环模式: \${analysis.pattern}\`,
      details: {
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        suggestion: analysis.suggestion
      }
    };
  }

  return { isLoop: false };
}`;

  const loopTypesCode = `// 循环类型定义
interface LoopDetectionResult {
  isLoop: boolean;
  type?: 'tool_call' | 'content' | 'llm_detected';
  message?: string;
  details?: {
    toolName?: string;
    repeatCount?: number;
    args?: any;
    repeatedContent?: string;
    confidence?: number;
    reasoning?: string;
    suggestion?: string;
    pattern?: string;
  };
}

// 循环处理策略
enum LoopHandlingStrategy {
  WARN = 'warn',           // 警告但继续
  PAUSE = 'pause',         // 暂停等待用户确认
  INTERRUPT = 'interrupt', // 中断当前操作
  RESET = 'reset',         // 重置对话状态
}

// 循环检测配置
interface LoopDetectionConfig {
  toolCallThreshold: number;      // 默认: 5
  contentThreshold: number;       // 默认: 10
  llmCheckTurnThreshold: number;  // 默认: 30
  handlingStrategy: LoopHandlingStrategy;
  enableLLMCheck: boolean;        // 是否启用 LLM 检测
}`;

  const integrationCode = `// 与核心循环的集成
// packages/core/src/core/geminiChat.ts

export class GeminiChat {
  private loopDetector: LoopDetectionService;

  async processConversation() {
    while (!this.shouldStop) {
      // 生成 AI 响应
      const response = await this.generateResponse();

      // 执行循环检测
      const loopResult = await this.loopDetector.checkForLoop(
        response,
        this.conversationHistory
      );

      if (loopResult.isLoop) {
        // 处理检测到的循环
        await this.handleLoopDetected(loopResult);
        continue;
      }

      // 继续正常处理...
      await this.processResponse(response);
    }
  }

  private async handleLoopDetected(result: LoopDetectionResult) {
    // 记录循环事件
    this.telemetry.recordLoopDetected(result);

    // 根据策略处理
    switch (this.config.loopHandlingStrategy) {
      case LoopHandlingStrategy.WARN:
        this.ui.showWarning(\`循环警告: \${result.message}\`);
        break;

      case LoopHandlingStrategy.PAUSE:
        await this.ui.showConfirmation(
          \`检测到循环行为: \${result.message}\\n是否继续?\`
        );
        break;

      case LoopHandlingStrategy.INTERRUPT:
        throw new LoopInterruptError(result);

      case LoopHandlingStrategy.RESET:
        this.resetConversationState();
        break;
    }

    // 尝试打破循环：向 AI 注入循环检测信息
    this.injectLoopBreakingContext(result);
  }

  private injectLoopBreakingContext(result: LoopDetectionResult) {
    // 向对话中注入系统消息，帮助 AI 意识到循环
    const breakingMessage = \`
[系统提示] 检测到可能的循环行为:
\${result.message}

请尝试不同的方法来完成任务，避免重复相同的操作。
如果当前方法不可行，请考虑：
1. 尝试其他工具或命令
2. 分析错误原因并调整策略
3. 向用户请求更多信息或确认
\`;

    this.conversationHistory.push({
      role: 'system',
      content: breakingMessage
    });
  }
}`;

  return (
    <div className="space-y-8">
      {/* 概述 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">循环检测机制</h2>
        <p className="text-gray-300 mb-4">
          循环检测系统用于识别和防止 AI 陷入无限循环或重复操作的状态。
          通过多层检测机制（工具调用跟踪、内容哈希、LLM 智能分析），确保对话能够正常推进。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightBox title="工具调用检测" color="blue">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">5</div>
              <div className="text-sm text-gray-400">重复调用阈值</div>
            </div>
            <p className="text-sm mt-2">
              同一工具使用相同参数调用 5 次即触发
            </p>
          </HighlightBox>

          <HighlightBox title="内容重复检测" color="green">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400">10</div>
              <div className="text-sm text-gray-400">内容重复阈值</div>
            </div>
            <p className="text-sm mt-2">
              相同句子出现 10 次即触发
            </p>
          </HighlightBox>

          <HighlightBox title="LLM 智能检测" color="purple">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400">30</div>
              <div className="text-sm text-gray-400">轮次阈值</div>
            </div>
            <p className="text-sm mt-2">
              超过 30 轮对话启用 AI 模式分析
            </p>
          </HighlightBox>
        </div>
      </section>

      {/* 检测流程 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">检测流程</h3>
        <MermaidDiagram chart={loopDetectionFlow} title="循环检测流程" />
      </section>

      {/* 核心配置 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">核心配置与阈值</h3>
        <CodeBlock code={thresholdsCode} language="typescript" title="循环检测服务" />
      </section>

      {/* 工具调用循环 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">工具调用循环检测</h3>
        <CodeBlock code={toolCallLoopCode} language="typescript" title="工具调用哈希跟踪" />

        <HighlightBox title="常见的工具调用循环场景" color="yellow" className="mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-yellow-300 mb-1">文件读取循环</h5>
              <p className="text-gray-400">反复读取同一文件寻找不存在的内容</p>
            </div>
            <div>
              <h5 className="font-semibold text-yellow-300 mb-1">命令执行循环</h5>
              <p className="text-gray-400">重复执行失败的命令期望不同结果</p>
            </div>
            <div>
              <h5 className="font-semibold text-yellow-300 mb-1">搜索循环</h5>
              <p className="text-gray-400">用相同关键词反复搜索无结果</p>
            </div>
            <div>
              <h5 className="font-semibold text-yellow-300 mb-1">编辑循环</h5>
              <p className="text-gray-400">反复做相同的文件修改</p>
            </div>
          </div>
        </HighlightBox>
      </section>

      {/* 内容重复检测 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">内容重复检测</h3>
        <CodeBlock code={contentLoopCode} language="typescript" title="内容哈希检测" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-2">内容归一化处理</h4>
          <div className="text-sm text-gray-300 space-y-2">
            <p><strong>目的：</strong>检测语义相同但格式略有不同的重复内容</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>转换为小写</li>
              <li>合并多余空格</li>
              <li>去除首尾空白</li>
              <li>忽略标点差异</li>
            </ul>
          </div>
        </div>
      </section>

      {/* LLM 智能检测 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">LLM 智能检测</h3>
        <CodeBlock code={llmCheckCode} language="typescript" title="AI 模式分析" />

        <HighlightBox title="LLM 检测的优势" color="purple" className="mt-4">
          <ul className="text-sm space-y-1">
            <li>• <strong>语义理解</strong>：理解上下文，识别逻辑循环</li>
            <li>• <strong>模式识别</strong>：检测复杂的、非字面重复的循环模式</li>
            <li>• <strong>建议提供</strong>：给出如何打破循环的具体建议</li>
            <li>• <strong>置信度评估</strong>：提供检测结果的可信度</li>
          </ul>
        </HighlightBox>
      </section>

      {/* 循环类型 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">循环类型与处理策略</h3>
        <CodeBlock code={loopTypesCode} language="typescript" title="类型定义" />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-cyan-400 mb-2">检测类型</h4>
            <table className="w-full text-sm">
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700">
                  <td className="py-2"><code className="text-blue-400">tool_call</code></td>
                  <td className="py-2">工具调用重复</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2"><code className="text-green-400">content</code></td>
                  <td className="py-2">内容重复</td>
                </tr>
                <tr>
                  <td className="py-2"><code className="text-purple-400">llm_detected</code></td>
                  <td className="py-2">AI 检测到的模式</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-cyan-400 mb-2">处理策略</h4>
            <table className="w-full text-sm">
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700">
                  <td className="py-2"><code className="text-yellow-400">WARN</code></td>
                  <td className="py-2">警告但继续</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2"><code className="text-orange-400">PAUSE</code></td>
                  <td className="py-2">暂停等待确认</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2"><code className="text-red-400">INTERRUPT</code></td>
                  <td className="py-2">中断操作</td>
                </tr>
                <tr>
                  <td className="py-2"><code className="text-pink-400">RESET</code></td>
                  <td className="py-2">重置对话状态</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 集成 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">与核心循环的集成</h3>
        <CodeBlock code={integrationCode} language="typescript" title="GeminiChat 集成" />
      </section>

      {/* 架构图 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">检测层级架构</h3>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <pre className="text-sm text-gray-300 overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────┐
│                     AI Response                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Loop Detection Service                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                Layer 1: Tool Call Loop                │  │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐        │  │
│  │  │ Tool A   │    │ Tool B   │    │ Tool C   │        │  │
│  │  │ Hash Map │    │ Hash Map │    │ Hash Map │        │  │
│  │  │ count: 3 │    │ count: 1 │    │ count: 5 │ 🚨     │  │
│  │  └──────────┘    └──────────┘    └──────────┘        │  │
│  │                    Threshold: 5                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │ Pass                             │
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Layer 2: Content Loop                   │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Sentence Hashes                                 │  │  │
│  │  │ "I will try..." -> abc123 (count: 8)           │  │  │
│  │  │ "Let me read..." -> def456 (count: 10) 🚨      │  │  │
│  │  │ "The file contains..." -> ghi789 (count: 2)    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                    Threshold: 10                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │ Pass                             │
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Layer 3: LLM Analysis                    │  │
│  │  (Only after 30+ turns)                               │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ AI analyzes conversation patterns               │  │  │
│  │  │ - Repeated failures?                            │  │  │
│  │  │ - Same errors?                                  │  │  │
│  │  │ - No progress?                                  │  │  │
│  │  │                                                 │  │  │
│  │  │ Confidence: 0.85 🚨                             │  │  │
│  │  │ Pattern: "Retry same file without change"      │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
   ┌──────────────────┐      ┌──────────────────┐
   │   Loop Detected  │      │    No Loop       │
   │   Handle & Break │      │    Continue      │
   └──────────────────┘      └──────────────────┘`}
          </pre>
        </div>
      </section>

      {/* 最佳实践 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">循环预防最佳实践</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">预防措施</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ 为工具调用添加重试限制</li>
              <li>✓ 在失败时提供替代方案</li>
              <li>✓ 记录失败原因以避免重复</li>
              <li>✓ 使用渐进式策略调整</li>
              <li>✓ 设置全局操作超时</li>
            </ul>
          </div>
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">打破循环策略</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>→ 注入系统提示说明循环情况</li>
              <li>→ 建议 AI 尝试不同方法</li>
              <li>→ 请求用户提供更多上下文</li>
              <li>→ 重置部分对话状态</li>
              <li>→ 使用回退模型重新尝试</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
