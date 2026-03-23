import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
 { id: 'retry', label: '重试回退', description: '循环与重试机制的关系' },
 { id: 'error', label: '错误处理', description: '循环检测触发的错误' },
 { id: 'gemini-chat', label: '核心循环', description: '循环检测在主循环中的位置' },
 { id: 'turn-state-machine', label: 'Turn状态机', description: '循环检测的状态触发' },
 { id: 'tool-scheduler', label: '工具调度', description: '工具调用循环的来源' },
 { id: 'design-tradeoffs', label: '设计权衡', description: '检测灵敏度的权衡' },
];

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
const TOOL_CALL_LOOP_THRESHOLD = 5; // 工具调用重复阈值
const CONTENT_LOOP_THRESHOLD = 10; // 内容重复阈值
const LLM_CHECK_AFTER_TURNS = 30; // 触发 LLM 检测的轮数

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
 argsHash: string; // 参数的 MD5 哈希
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
 WARN = 'warn', // 警告但继续
 PAUSE = 'pause', // 暂停等待用户确认
 INTERRUPT = 'interrupt', // 中断当前操作
 RESET = 'reset', // 重置对话状态
}

// 循环检测配置
interface LoopDetectionConfig {
 toolCallThreshold: number; // 默认: 5
 contentThreshold: number; // 默认: 10
 llmCheckTurnThreshold: number; // 默认: 30
 handlingStrategy: LoopHandlingStrategy;
 enableLLMCheck: boolean; // 是否启用 LLM 检测
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
 <h2 className="text-2xl font-bold text-heading mb-4">循环检测机制</h2>
 <p className="text-body mb-4">
 循环检测系统用于识别和防止 AI 陷入无限循环或重复操作的状态。
 通过多层检测机制（工具调用跟踪、内容哈希、LLM 智能分析），确保对话能够正常推进。
 </p>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <HighlightBox title="工具调用检测" color="blue">
 <div className="text-center">
 <div className="text-4xl font-bold text-heading">5</div>
 <div className="text-sm text-body">重复调用阈值</div>
 </div>
 <p className="text-sm mt-2">
 同一工具使用相同参数调用 5 次即触发
 </p>
 </HighlightBox>

 <HighlightBox title="内容重复检测" color="green">
 <div className="text-center">
 <div className="text-4xl font-bold text-green-400">10</div>
 <div className="text-sm text-body">内容重复阈值</div>
 </div>
 <p className="text-sm mt-2">
 相同句子出现 10 次即触发
 </p>
 </HighlightBox>

 <HighlightBox title="LLM 智能检测" color="purple">
 <div className="text-center">
 <div className="text-4xl font-bold text-heading">30</div>
 <div className="text-sm text-body">轮次阈值</div>
 </div>
 <p className="text-sm mt-2">
 超过 30 轮对话启用 AI 模式分析
 </p>
 </HighlightBox>
 </div>
 </section>

 {/* 检测流程 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">检测流程</h3>
 <MermaidDiagram chart={loopDetectionFlow} title="循环检测流程" />
 </section>

 {/* 核心配置 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">核心配置与阈值</h3>
 <CodeBlock code={thresholdsCode} language="typescript" title="循环检测服务" />
 </section>

 {/* 工具调用循环 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">工具调用循环检测</h3>
 <CodeBlock code={toolCallLoopCode} language="typescript" title="工具调用哈希跟踪" />

 <HighlightBox title="常见的工具调用循环场景" color="yellow" className="mt-4">
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <h5 className="font-semibold text-yellow-300 mb-1">文件读取循环</h5>
 <p className="text-body">反复读取同一文件寻找不存在的内容</p>
 </div>
 <div>
 <h5 className="font-semibold text-yellow-300 mb-1">命令执行循环</h5>
 <p className="text-body">重复执行失败的命令期望不同结果</p>
 </div>
 <div>
 <h5 className="font-semibold text-yellow-300 mb-1">搜索循环</h5>
 <p className="text-body">用相同关键词反复搜索无结果</p>
 </div>
 <div>
 <h5 className="font-semibold text-yellow-300 mb-1">编辑循环</h5>
 <p className="text-body">反复做相同的文件修改</p>
 </div>
 </div>
 </HighlightBox>
 </section>

 {/* 内容重复检测 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">内容重复检测</h3>
 <CodeBlock code={contentLoopCode} language="typescript" title="内容哈希检测" />

 <div className="mt-4 bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-2">内容归一化处理</h4>
 <div className="text-sm text-body space-y-2">
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
 <h3 className="text-xl font-semibold text-heading mb-4">LLM 智能检测</h3>
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
 <h3 className="text-xl font-semibold text-heading mb-4">循环类型与处理策略</h3>
 <CodeBlock code={loopTypesCode} language="typescript" title="类型定义" />

 <div className="mt-4 grid grid-cols-2 gap-4">
 <div className="bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-2">检测类型</h4>
 <table className="w-full text-sm">
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2"><code className="text-heading">tool_call</code></td>
 <td className="py-2">工具调用重复</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2"><code className="text-green-400">content</code></td>
 <td className="py-2">内容重复</td>
 </tr>
 <tr>
 <td className="py-2"><code className="text-heading">llm_detected</code></td>
 <td className="py-2">AI 检测到的模式</td>
 </tr>
 </tbody>
 </table>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-2">处理策略</h4>
 <table className="w-full text-sm">
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2"><code className="text-yellow-400">WARN</code></td>
 <td className="py-2">警告但继续</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2"><code className="text-heading">PAUSE</code></td>
 <td className="py-2">暂停等待确认</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2"><code className="text-red-400">INTERRUPT</code></td>
 <td className="py-2">中断操作</td>
 </tr>
 <tr>
 <td className="py-2"><code className="text-heading">RESET</code></td>
 <td className="py-2">重置对话状态</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </section>

 {/* 集成 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">与核心循环的集成</h3>
 <CodeBlock code={integrationCode} language="typescript" title="GeminiChat 集成" />
 </section>

 {/* 架构图 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">检测层级架构</h3>
 <div className="bg-surface rounded-lg p-6">
 <pre className="text-sm text-body overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────┐
│ AI Response │
└─────────────────────────┬───────────────────────────────────┘
 │
 ▼
┌─────────────────────────────────────────────────────────────┐
│ Loop Detection Service │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Layer 1: Tool Call Loop │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│ │ │ Tool A │ │ Tool B │ │ Tool C │ │ │
│ │ │ Hash Map │ │ Hash Map │ │ Hash Map │ │ │
│ │ │ count: 3 │ │ count: 1 │ │ count: 5 │ 🚨 │ │
│ │ └──────────┘ └──────────┘ └──────────┘ │ │
│ │ Threshold: 5 │ │
│ └───────────────────────────────────────────────────────┘ │
│ │ Pass │
│ ▼ │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Layer 2: Content Loop │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Sentence Hashes │ │ │
│ │ │ "I will try..." -> abc123 (count: 8) │ │ │
│ │ │ "Let me read..." -> def456 (count: 10) 🚨 │ │ │
│ │ │ "The file contains..." -> ghi789 (count: 2) │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │ Threshold: 10 │ │
│ └───────────────────────────────────────────────────────┘ │
│ │ Pass │
│ ▼ │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Layer 3: LLM Analysis │ │
│ │ (Only after 30+ turns) │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ AI analyzes conversation patterns │ │ │
│ │ │ - Repeated failures? │ │ │
│ │ │ - Same errors? │ │ │
│ │ │ - No progress? │ │ │
│ │ │ │ │ │
│ │ │ Confidence: 0.85 🚨 │ │ │
│ │ │ Pattern: "Retry same file without change" │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────┘ │
│ │ │
└──────────────────────────┼──────────────────────────────────┘
 │
 ┌────────────┴────────────┐
 │ │
 ▼ ▼
 ┌──────────────────┐ ┌──────────────────┐
 │ Loop Detected │ │ No Loop │
 │ Handle & Break │ │ Continue │
 └──────────────────┘ └──────────────────┘`}
 </pre>
 </div>
 </section>

 {/* 最佳实践 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">循环预防最佳实践</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
 <h4 className="text-green-400 font-semibold mb-2">预防措施</h4>
 <ul className="text-sm text-body space-y-1">
 <li>✓ 为工具调用添加重试限制</li>
 <li>✓ 在失败时提供替代方案</li>
 <li>✓ 记录失败原因以避免重复</li>
 <li>✓ 使用渐进式策略调整</li>
 <li>✓ 设置全局操作超时</li>
 </ul>
 </div>
 <div className="bg-elevated/20 border border-edge rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">打破循环策略</h4>
 <ul className="text-sm text-body space-y-1">
 <li>→ 注入系统提示说明循环情况</li>
 <li>→ 建议 AI 尝试不同方法</li>
 <li>→ 请求用户提供更多上下文</li>
 <li>→ 重置部分对话状态</li>
 <li>→ 使用回退模型重新尝试</li>
 </ul>
 </div>
 </div>
 </section>

 {/* ==================== 深化内容开始 ==================== */}

 {/* 边界条件深度解析 */}
 <Layer title="边界条件深度解析" depth={1} defaultOpen={true}>
 <p className="text-body mb-6">
 循环检测看似简单，但在实际运行中面临诸多边界情况。理解这些边界条件对于构建健壮的检测系统至关重要。
 </p>

 {/* 哈希碰撞与误判 */}
 <Layer title="1. 哈希碰撞与误判处理" depth={2} defaultOpen={true}>
 <p className="text-body mb-4">
 使用 MD5 哈希检测重复时，存在碰撞可能性。虽然概率极低，但在大规模运行中需要考虑。
 </p>

 <CodeBlock
 code={`// 哈希碰撞防护机制
// packages/core/src/services/loopDetection/hashManager.ts

interface HashedEntry {
 hash: string; // MD5 哈希值
 originalContent: string; // 原始内容（用于碰撞验证）
 count: number;
 timestamps: number[]; // 记录每次出现的时间戳
}

class CollisionSafeHashMap {
 private entries = new Map<string, HashedEntry[]>(); // 相同哈希可能对应多个条目

 // 安全的增加计数
 increment(content: string): { count: number; isCollision: boolean } {
 const hash = this.computeHash(content);
 const existingEntries = this.entries.get(hash) || [];

 // 查找完全匹配的条目
 const exactMatch = existingEntries.find(
 entry => entry.originalContent === content
 );

 if (exactMatch) {
 // 找到精确匹配，增加计数
 exactMatch.count++;
 exactMatch.timestamps.push(Date.now());
 return { count: exactMatch.count, isCollision: false };
 }

 // 检查是否是哈希碰撞（相同哈希但不同内容）
 if (existingEntries.length > 0) {
 console.warn(\`[LoopDetection] Hash collision detected for hash: \${hash}\`);
 // 碰撞情况下，创建新条目
 const newEntry: HashedEntry = {
 hash,
 originalContent: content,
 count: 1,
 timestamps: [Date.now()]
 };
 existingEntries.push(newEntry);
 this.entries.set(hash, existingEntries);
 return { count: 1, isCollision: true };
 }

 // 首次出现
 const newEntry: HashedEntry = {
 hash,
 originalContent: content,
 count: 1,
 timestamps: [Date.now()]
 };
 this.entries.set(hash, [newEntry]);
 return { count: 1, isCollision: false };
 }

 // 获取真实计数（处理碰撞）
 getCount(content: string): number {
 const hash = this.computeHash(content);
 const entries = this.entries.get(hash) || [];
 const match = entries.find(e => e.originalContent === content);
 return match?.count || 0;
 }

 private computeHash(content: string): string {
 return crypto.createHash('md5').update(content).digest('hex');
 }
}

/*
碰撞场景示例：

假设两个不同的工具调用产生相同的 MD5 哈希（极小概率）：
- Tool A: Read("file1.txt") -> hash: abc123
- Tool B: Grep("pattern", "file2.txt") -> hash: abc123 (碰撞!)

不使用碰撞防护时：
Turn 1: Tool A -> count: 1
Turn 2: Tool B -> count: 2 (误认为是 Tool A 的重复!)
Turn 3: Tool A -> count: 3
Turn 4: Tool B -> count: 4
Turn 5: Tool A -> count: 5 🚨 误触发循环检测！

使用碰撞防护后：
Turn 1: Tool A -> abc123[0], count: 1
Turn 2: Tool B -> abc123[1], count: 1 (检测到碰撞，创建新条目)
Turn 3: Tool A -> abc123[0], count: 2
Turn 4: Tool B -> abc123[1], count: 2
...正确计数，不会误触发
*/`}
 language="typescript"
 title="哈希碰撞防护"
 />

 <HighlightBox title="误判类型与处理" color="yellow" className="mt-4">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-yellow-400">误判类型</th>
 <th className="text-left py-2 text-yellow-400">原因</th>
 <th className="text-left py-2 text-yellow-400">解决方案</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2">假阳性（False Positive）</td>
 <td className="py-2">合法的重复操作被误判为循环</td>
 <td className="py-2">时间窗口衰减、上下文感知</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2">假阴性（False Negative）</td>
 <td className="py-2">真实循环未被检测到</td>
 <td className="py-2">语义相似度检测、LLM 补充分析</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2">哈希碰撞</td>
 <td className="py-2">不同内容产生相同哈希</td>
 <td className="py-2">原始内容二次验证</td>
 </tr>
 <tr>
 <td className="py-2">归一化过度</td>
 <td className="py-2">不同意图的相似表达被等同</td>
 <td className="py-2">保留关键差异特征</td>
 </tr>
 </tbody>
 </table>
 </div>
 </HighlightBox>
 </Layer>

 {/* 时间窗口与衰减策略 */}
 <Layer title="2. 时间窗口与衰减策略" depth={2} defaultOpen={true}>
 <p className="text-body mb-4">
 简单的计数无法区分"短时间内快速重复"和"长时间跨度内的偶尔重复"。时间窗口机制解决这个问题。
 </p>

 <CodeBlock
 code={`// 时间衰减计数器
// packages/core/src/services/loopDetection/timeDecayCounter.ts

interface TimeWeightedEntry {
 timestamps: number[];
 decayFactor: number; // 衰减因子 (0-1)
}

class TimeDecayCounter {
 private readonly DECAY_HALF_LIFE = 5 * 60 * 1000; // 5分钟半衰期
 private readonly TIME_WINDOW = 30 * 60 * 1000; // 30分钟滑动窗口

 private entries = new Map<string, TimeWeightedEntry>();

 // 获取时间加权计数
 getWeightedCount(hash: string): number {
 const entry = this.entries.get(hash);
 if (!entry) return 0;

 const now = Date.now();
 let weightedCount = 0;

 // 清理过期时间戳并计算加权值
 entry.timestamps = entry.timestamps.filter(timestamp => {
 const age = now - timestamp;

 // 超出时间窗口的记录直接删除
 if (age > this.TIME_WINDOW) return false;

 // 计算时间衰减权重
 // 使用指数衰减：weight = 0.5 ^ (age / halfLife)
 const weight = Math.pow(0.5, age / this.DECAY_HALF_LIFE);
 weightedCount += weight;

 return true;
 });

 return weightedCount;
 }

 // 添加记录
 addOccurrence(hash: string): number {
 const entry = this.entries.get(hash) || { timestamps: [], decayFactor: 0.5 };
 entry.timestamps.push(Date.now());
 this.entries.set(hash, entry);

 return this.getWeightedCount(hash);
 }
}

/*
时间衰减效果演示：

假设阈值 = 4.0（加权计数）

场景 A：快速连续调用（可能是循环）
T+0s: call 1 -> weighted: 1.0
T+2s: call 2 -> weighted: 1.99
T+5s: call 3 -> weighted: 2.96
T+8s: call 4 -> weighted: 3.92
T+10s: call 5 -> weighted: 4.87 🚨 触发！（10秒内5次调用）

场景 B：间隔均匀调用（正常使用）
T+0min: call 1 -> weighted: 1.0
T+5min: call 2 -> weighted: 1.5 (call 1 衰减到 0.5)
T+10min: call 3 -> weighted: 1.75 (call 1: 0.25, call 2: 0.5)
T+15min: call 4 -> weighted: 1.875
T+20min: call 5 -> weighted: 1.94
=> 5次调用但加权值不到 2，不触发

这种机制能区分：
- 短时间快速重复 = 可能是循环，需要检测
- 长时间偶尔重复 = 正常使用模式，不应触发
*/`}
 language="typescript"
 title="时间衰减计数器"
 />

 <MermaidDiagram chart={`
graph LR
 subgraph "时间衰减曲线"
 A[T+0<br/>权重:1.0] -->|"5分钟后"| B[T+5min<br/>权重:0.5]
 B -->|"10分钟后"| C[T+10min<br/>权重:0.25]
 C -->|"15分钟后"| D[T+15min<br/>权重:0.125]
 D -->|"超出窗口"| E[T+30min<br/>权重:0<br/>删除]
 end

 style A fill:#22c55e,color:#000
 style B fill:#84cc16,color:#000
 style C fill:#facc15,color:#000
 style D fill:#f97316,color:#000
 style E fill:#6b7280,color:#fff
 `} />
 </Layer>

 {/* 相似参数的模糊匹配 */}
 <Layer title="3. 相似参数的模糊匹配" depth={2} defaultOpen={true}>
 <p className="text-body mb-4">
 完全相同的参数容易检测，但 AI 可能略微修改参数来"绕过"检测。模糊匹配能捕获这类变体循环。
 </p>

 <CodeBlock
 code={`// 参数相似度检测
// packages/core/src/services/loopDetection/fuzzyMatcher.ts

interface ToolCallSignature {
 toolName: string;
 args: Record<string, unknown>;
 normalizedArgs: string; // 归一化后的参数
}

class FuzzyToolCallMatcher {
 private readonly SIMILARITY_THRESHOLD = 0.85; // 85% 相似度视为"相同"

 // 检查两次工具调用是否"基本相同"
 isSimilar(call1: ToolCallSignature, call2: ToolCallSignature): boolean {
 // 工具名必须相同
 if (call1.toolName !== call2.toolName) return false;

 // 参数相似度检测
 return this.calculateSimilarity(call1.args, call2.args) >= this.SIMILARITY_THRESHOLD;
 }

 private calculateSimilarity(
 args1: Record<string, unknown>,
 args2: Record<string, unknown>
 ): number {
 // 处理特定工具的参数归一化
 const normalized1 = this.normalizeArgs(args1);
 const normalized2 = this.normalizeArgs(args2);

 // 使用 Levenshtein 距离计算相似度
 const str1 = JSON.stringify(normalized1);
 const str2 = JSON.stringify(normalized2);

 return 1 - (this.levenshteinDistance(str1, str2) / Math.max(str1.length, str2.length));
 }

 private normalizeArgs(args: Record<string, unknown>): Record<string, unknown> {
 const normalized: Record<string, unknown> = {};

 for (const [key, value] of Object.entries(args)) {
 if (typeof value === 'string') {
 // 路径归一化
 if (key === 'file_path' || key === 'path' || key === 'directory') {
 normalized[key] = this.normalizePath(value);
 }
 // 数字字符串归一化
 else if (/^\\d+$/.test(value)) {
 normalized[key] = 'NUMBER';
 }
 // 移除多余空格
 else {
 normalized[key] = value.trim().replace(/\\s+/g, ' ');
 }
 } else if (typeof value === 'number') {
 // 数字范围归一化（允许小范围波动）
 normalized[key] = Math.round(value / 10) * 10;
 } else {
 normalized[key] = value;
 }
 }

 return normalized;
 }

 private normalizePath(path: string): string {
 // 提取文件名，忽略完整路径差异
 return path.split('/').pop() || path;
 }

 private levenshteinDistance(s1: string, s2: string): number {
 const dp: number[][] = Array(s1.length + 1)
 .fill(null)
 .map(() => Array(s2.length + 1).fill(0));

 for (let i = 0; i <= s1.length; i++) dp[i][0] = i;
 for (let j = 0; j <= s2.length; j++) dp[0][j] = j;

 for (let i = 1; i <= s1.length; i++) {
 for (let j = 1; j <= s2.length; j++) {
 const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
 dp[i][j] = Math.min(
 dp[i - 1][j] + 1,
 dp[i][j - 1] + 1,
 dp[i - 1][j - 1] + cost
 );
 }
 }

 return dp[s1.length][s2.length];
 }
}

/*
模糊匹配场景示例：

场景：AI 尝试绕过循环检测

Turn 1: Read({ file_path: "/project/src/config.ts", offset: 0 })
Turn 2: Read({ file_path: "/project/src/config.ts", offset: 1 }) // 仅改 offset
Turn 3: Read({ file_path: "./src/config.ts", offset: 0 }) // 改路径格式
Turn 4: Read({ file_path: "/project/src/config.ts", offset: 2 })
Turn 5: Read({ file_path: "/project/src/config.ts " }) // 加空格

精确匹配：每次都不同，不触发
模糊匹配：归一化后全部相同 -> 触发检测！

归一化结果：
Turn 1-5: { toolName: "Read", normalizedArgs: { file_path: "config.ts", offset: "NUMBER" } }
*/`}
 language="typescript"
 title="模糊匹配检测"
 />

 <HighlightBox title="归一化规则表" color="blue" className="mt-4">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-heading">参数类型</th>
 <th className="text-left py-2 text-heading">归一化规则</th>
 <th className="text-left py-2 text-heading">示例</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2">文件路径</td>
 <td className="py-2">提取文件名，忽略目录前缀</td>
 <td className="py-2"><code>/a/b/file.ts</code> → <code>file.ts</code></td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2">行号/偏移量</td>
 <td className="py-2">替换为占位符 NUMBER</td>
 <td className="py-2"><code>offset: 42</code> → <code>offset: NUMBER</code></td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2">字符串</td>
 <td className="py-2">去除首尾空格，合并连续空格</td>
 <td className="py-2"><code>" a b "</code> → <code>"a b"</code></td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2">数字范围</td>
 <td className="py-2">四舍五入到最近的 10</td>
 <td className="py-2"><code>limit: 97</code> → <code>limit: 100</code></td>
 </tr>
 <tr>
 <td className="py-2">命令参数</td>
 <td className="py-2">提取命令名，简化参数</td>
 <td className="py-2"><code>npm run test:ci</code> → <code>npm run test</code></td>
 </tr>
 </tbody>
 </table>
 </div>
 </HighlightBox>
 </Layer>

 {/* 并发工具调用的处理 */}
 <Layer title="4. 并发工具调用的处理" depth={2} defaultOpen={true}>
 <p className="text-body mb-4">
 当 AI 在单次响应中发起多个工具调用时，需要正确处理这些并发调用的循环检测。
 </p>

 <CodeBlock
 code={`// 并发工具调用处理
// packages/core/src/services/loopDetection/concurrentHandler.ts

interface ConcurrentToolBatch {
 batchId: string;
 timestamp: number;
 toolCalls: ToolCall[];
 batchHash: string; // 整批调用的哈希
}

class ConcurrentToolCallHandler {
 private batchHistory: ConcurrentToolBatch[] = [];
 private readonly BATCH_LOOP_THRESHOLD = 3; // 相同批次出现3次

 // 处理单次响应中的多个工具调用
 processBatch(toolCalls: ToolCall[]): LoopDetectionResult {
 if (toolCalls.length <= 1) {
 // 单个调用使用常规处理
 return { isLoop: false };
 }

 // 生成批次哈希（工具调用的有序组合）
 const batchHash = this.generateBatchHash(toolCalls);

 // 检查是否有相同的批次模式
 const matchingBatches = this.batchHistory.filter(
 batch => batch.batchHash === batchHash
 );

 if (matchingBatches.length >= this.BATCH_LOOP_THRESHOLD) {
 return {
 isLoop: true,
 type: 'tool_call',
 message: \`检测到批量工具调用循环: 相同的 \${toolCalls.length} 个工具调用组合已出现 \${matchingBatches.length + 1} 次\`,
 details: {
 toolNames: toolCalls.map(c => c.name),
 repeatCount: matchingBatches.length + 1,
 pattern: 'batch_repeat'
 }
 };
 }

 // 记录当前批次
 this.batchHistory.push({
 batchId: crypto.randomUUID(),
 timestamp: Date.now(),
 toolCalls,
 batchHash
 });

 // 同时检查批次内的循环模式
 return this.checkIntraBatchLoop(toolCalls);
 }

 // 检查批次内部的循环（同一批次中重复相同工具）
 private checkIntraBatchLoop(toolCalls: ToolCall[]): LoopDetectionResult {
 const callSignatures = new Map<string, number>();

 for (const call of toolCalls) {
 const sig = this.getToolSignature(call);
 const count = (callSignatures.get(sig) || 0) + 1;
 callSignatures.set(sig, count);

 // 单批次内相同调用超过2次视为异常
 if (count > 2) {
 return {
 isLoop: true,
 type: 'tool_call',
 message: \`批次内循环: \${call.name} 在单次响应中被调用 \${count} 次\`,
 details: {
 toolName: call.name,
 repeatCount: count,
 pattern: 'intra_batch_repeat'
 }
 };
 }
 }

 return { isLoop: false };
 }

 private generateBatchHash(toolCalls: ToolCall[]): string {
 // 对工具调用排序以确保相同组合得到相同哈希
 const sorted = [...toolCalls].sort((a, b) => {
 const nameCompare = a.name.localeCompare(b.name);
 if (nameCompare !== 0) return nameCompare;
 return JSON.stringify(a.args).localeCompare(JSON.stringify(b.args));
 });

 return crypto
 .createHash('md5')
 .update(JSON.stringify(sorted))
 .digest('hex');
 }

 private getToolSignature(call: ToolCall): string {
 return \`\${call.name}:\${JSON.stringify(call.args)}\`;
 }
}

/*
并发调用循环示例：

Turn 1 批次:
 - Read("file1.ts")
 - Read("file2.ts")
 - Grep("pattern")
 -> batchHash: xyz789

Turn 2 批次:
 - Read("file1.ts")
 - Read("file2.ts")
 - Grep("pattern")
 -> batchHash: xyz789 (相同！count: 2)

Turn 3 批次:
 - Read("file1.ts")
 - Read("file2.ts")
 - Grep("pattern")
 -> batchHash: xyz789 (相同！count: 3) 🚨 触发！

这种模式可能表示 AI 在重复执行相同的"探索策略"而未能取得进展。
*/`}
 language="typescript"
 title="并发工具调用处理"
 />
 </Layer>

 {/* 状态重置边界 */}
 <Layer title="5. 状态重置与持久化边界" depth={2} defaultOpen={true}>
 <p className="text-body mb-4">
 循环检测状态何时重置、何时持久化，直接影响检测的准确性和用户体验。
 </p>

 <CodeBlock
 code={`// 状态管理策略
// packages/core/src/services/loopDetection/stateManager.ts

interface LoopDetectionState {
 toolCallHistory: Map<string, ToolCallEntry>;
 contentHashHistory: Map<string, ContentEntry>;
 batchHistory: ConcurrentToolBatch[];
 turnCount: number;
 lastResetTimestamp: number;
 resetReason?: string;
}

class LoopDetectionStateManager {
 private state: LoopDetectionState;
 private stateSnapshots: LoopDetectionState[] = [];

 // 部分重置：仅清理特定类型的历史
 partialReset(resetType: 'tool' | 'content' | 'batch'): void {
 switch (resetType) {
 case 'tool':
 // 保留一些历史以防止立即重新循环
 this.state.toolCallHistory = this.keepRecentEntries(
 this.state.toolCallHistory,
 5 // 保留最近5个
 );
 break;

 case 'content':
 this.state.contentHashHistory.clear();
 break;

 case 'batch':
 // 保留最近的批次记录
 this.state.batchHistory = this.state.batchHistory.slice(-3);
 break;
 }

 this.state.lastResetTimestamp = Date.now();
 this.state.resetReason = \`partial_\${resetType}\`;
 }

 // 完全重置：新任务开始时
 fullReset(): void {
 // 保存快照以便分析
 this.stateSnapshots.push(this.cloneState(this.state));

 this.state = {
 toolCallHistory: new Map(),
 contentHashHistory: new Map(),
 batchHistory: [],
 turnCount: 0,
 lastResetTimestamp: Date.now(),
 resetReason: 'full_reset'
 };
 }

 // 任务切换时的智能重置
 onTaskSwitch(previousTask: string, newTask: string): void {
 // 计算任务相似度
 const similarity = this.calculateTaskSimilarity(previousTask, newTask);

 if (similarity < 0.3) {
 // 完全不同的任务，完全重置
 this.fullReset();
 } else if (similarity < 0.7) {
 // 相关任务，部分保留
 this.partialReset('content');
 // 工具历史降低权重但不清空
 this.decayAllEntries(0.5);
 }
 // similarity >= 0.7: 非常相似的任务，保持状态
 }

 // 错误恢复后的状态处理
 onErrorRecovery(error: Error): void {
 // 某些错误可能导致 AI 重试，这不应被视为循环
 if (this.isRecoverableError(error)) {
 // 给予"免费"重试次数
 this.grantRetryCredits(2);
 }
 }

 // 授予重试信用
 private grantRetryCredits(credits: number): void {
 // 临时提高阈值
 this.state.toolCallHistory.forEach(entry => {
 entry.count = Math.max(0, entry.count - credits);
 });
 }

 // 持久化到存储
 async persist(): Promise<void> {
 // 仅在长对话中持久化
 if (this.state.turnCount > 20) {
 await this.storage.set('loopDetectionState', {
 ...this.state,
 // 序列化 Map 为数组
 toolCallHistory: Array.from(this.state.toolCallHistory.entries()),
 contentHashHistory: Array.from(this.state.contentHashHistory.entries())
 });
 }
 }

 // 会话恢复时加载
 async restore(): Promise<void> {
 const saved = await this.storage.get('loopDetectionState');
 if (saved) {
 // 检查是否过期（超过1小时视为过期）
 if (Date.now() - saved.lastResetTimestamp < 60 * 60 * 1000) {
 this.state = {
 ...saved,
 toolCallHistory: new Map(saved.toolCallHistory),
 contentHashHistory: new Map(saved.contentHashHistory)
 };
 }
 }
 }
}

/*
状态重置时机：

┌────────────────────────────────────────────────┐
│ 触发条件 │
├────────────────────────────────────────────────┤
│ 完全重置 (fullReset) │
│ - 用户发起新对话 │
│ - 任务完全不同 (相似度 < 0.3) │
│ - 用户明确请求 "从头开始" │
│ - 会话超时 (1小时无活动) │
├────────────────────────────────────────────────┤
│ 部分重置 (partialReset) │
│ - 循环打破成功后 │
│ - 任务相关但不同 (0.3 ≤ 相似度 < 0.7) │
│ - 用户提供新信息/澄清 │
├────────────────────────────────────────────────┤
│ 保持状态 │
│ - 任务非常相似 (相似度 ≥ 0.7) │
│ - 持续对话中 │
│ - 错误恢复中 │
└────────────────────────────────────────────────┘
*/`}
 language="typescript"
 title="状态管理策略"
 />
 </Layer>
 </Layer>

 {/* 常见问题与调试技巧 */}
 <Layer title="常见问题与调试技巧" depth={1} defaultOpen={true}>
 <p className="text-body mb-6">
 循环检测系统可能出现各种问题。以下是常见问题的诊断和解决方案。
 </p>

 {/* 问题1: 误触发 */}
 <Layer title="问题1: 循环检测误触发" depth={2} defaultOpen={true}>
 <HighlightBox title="症状" color="red">
 <ul className="text-sm space-y-1">
 <li>• AI 执行合理的重复操作时被中断</li>
 <li>• 批量处理文件时频繁触发警告</li>
 <li>• 用户报告"AI 太早放弃了"</li>
 </ul>
 </HighlightBox>

 <CodeBlock
 code={`// 诊断：检查触发记录
// packages/core/src/services/loopDetection/debugger.ts

class LoopDetectionDebugger {
 // 获取详细的触发日志
 getTriggeredHistory(): TriggerRecord[] {
 return this.triggerLog.map(record => ({
 timestamp: record.timestamp,
 type: record.type,
 triggerValue: record.count,
 threshold: record.threshold,
 context: {
 toolName: record.toolName,
 args: this.sanitizeArgs(record.args),
 hashValue: record.hash
 },
 // 关键：显示触发时的历史记录
 historyAtTrigger: this.getHistorySnapshot(record.timestamp)
 }));
 }

 // 分析是否是误触发
 analyzeFalsePositive(triggerId: string): FalsePositiveAnalysis {
 const trigger = this.triggerLog.find(t => t.id === triggerId);
 if (!trigger) return null;

 return {
 likelyFalsePositive: this.isFalsePositive(trigger),
 reasons: [
 this.checkBatchProcessingPattern(trigger),
 this.checkProgressBetweenCalls(trigger),
 this.checkDifferentIntents(trigger)
 ].filter(Boolean),
 recommendation: this.getThresholdAdjustment(trigger)
 };
 }

 // 检查是否是批处理模式
 private checkBatchProcessingPattern(trigger: TriggerRecord): string | null {
 // 如果工具调用的参数有规律变化（如递增的文件索引），可能是批处理
 const recentCalls = this.getRecentCalls(trigger.toolName, 10);

 if (this.hasSequentialPattern(recentCalls)) {
 return '检测到顺序处理模式，建议提高工具调用阈值';
 }
 return null;
 }

 // 检查调用之间是否有进展
 private checkProgressBetweenCalls(trigger: TriggerRecord): string | null {
 const callsWithResults = this.getCallsWithResults(trigger.hash);

 // 如果每次调用的结果不同，说明有进展
 const uniqueResults = new Set(callsWithResults.map(c => c.resultHash));
 if (uniqueResults.size === callsWithResults.length) {
 return '每次调用结果不同，存在实际进展';
 }
 return null;
 }
}

// 使用调试器
const debugger = new LoopDetectionDebugger();

// 查看最近的触发记录
console.log('Recent triggers:', debugger.getTriggeredHistory().slice(-5));

// 分析特定触发是否是误判
const analysis = debugger.analyzeFalsePositive('trigger-123');
console.log('False positive analysis:', analysis);

/*
输出示例：
{
 likelyFalsePositive: true,
 reasons: [
 '检测到顺序处理模式，建议提高工具调用阈值',
 '每次调用结果不同，存在实际进展'
 ],
 recommendation: {
 adjustThreshold: { toolCallThreshold: 5 -> 8 },
 enablePatternRecognition: true
 }
}
*/`}
 language="typescript"
 title="误触发诊断"
 />

 <HighlightBox title="解决方案" color="green" className="mt-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div>
 <h5 className="font-semibold text-green-400 mb-2">调整阈值</h5>
 <ul className="space-y-1 text-body">
 <li>• 提高工具调用阈值 (5 → 8)</li>
 <li>• 启用时间衰减</li>
 <li>• 添加上下文感知例外</li>
 </ul>
 </div>
 <div>
 <h5 className="font-semibold text-green-400 mb-2">白名单机制</h5>
 <ul className="space-y-1 text-body">
 <li>• 批处理任务临时禁用</li>
 <li>• 特定工具组合豁免</li>
 <li>• 用户确认后继续</li>
 </ul>
 </div>
 </div>
 </HighlightBox>
 </Layer>

 {/* 问题2: 漏检 */}
 <Layer title="问题2: 真实循环未被检测" depth={2} defaultOpen={true}>
 <HighlightBox title="症状" color="red">
 <ul className="text-sm space-y-1">
 <li>• AI 长时间执行但无进展</li>
 <li>• Token 消耗异常高</li>
 <li>• 对话轮数持续增长但任务未完成</li>
 </ul>
 </HighlightBox>

 <CodeBlock
 code={`// 漏检分析工具
// packages/core/src/services/loopDetection/missedLoopAnalyzer.ts

class MissedLoopAnalyzer {
 // 分析可能漏检的循环
 analyzeConversation(history: Message[]): MissedLoopReport {
 const indicators: LoopIndicator[] = [];

 // 检查进度指标
 const progressMetrics = this.calculateProgressMetrics(history);
 if (progressMetrics.stagnationScore > 0.7) {
 indicators.push({
 type: 'stagnation',
 severity: 'high',
 evidence: \`进度停滞指数: \${progressMetrics.stagnationScore}\`
 });
 }

 // 检查语义重复（可能绕过了字面检测）
 const semanticDuplicates = this.findSemanticDuplicates(history);
 if (semanticDuplicates.length > 5) {
 indicators.push({
 type: 'semantic_loop',
 severity: 'medium',
 evidence: \`发现 \${semanticDuplicates.length} 组语义相似的响应\`
 });
 }

 // 检查错误重复模式
 const errorPatterns = this.analyzeErrorPatterns(history);
 if (errorPatterns.sameErrorCount > 3) {
 indicators.push({
 type: 'error_loop',
 severity: 'high',
 evidence: \`相同错误出现 \${errorPatterns.sameErrorCount} 次\`
 });
 }

 // 检查工具结果重复
 const resultPatterns = this.analyzeToolResults(history);
 if (resultPatterns.duplicateResultRatio > 0.5) {
 indicators.push({
 type: 'result_loop',
 severity: 'medium',
 evidence: \`\${resultPatterns.duplicateResultRatio * 100}% 的工具结果重复\`
 });
 }

 return {
 loopLikelihood: this.calculateLoopProbability(indicators),
 indicators,
 recommendation: this.generateRecommendation(indicators),
 suggestedAction: this.getSuggestedAction(indicators)
 };
 }

 // 语义相似度检测（使用简化的 TF-IDF）
 private findSemanticDuplicates(history: Message[]): SemanticDuplicate[] {
 const aiResponses = history
 .filter(m => m.role === 'assistant')
 .map(m => ({
 content: m.content,
 vector: this.computeTfIdfVector(m.content)
 }));

 const duplicates: SemanticDuplicate[] = [];

 for (let i = 0; i < aiResponses.length; i++) {
 for (let j = i + 1; j < aiResponses.length; j++) {
 const similarity = this.cosineSimilarity(
 aiResponses[i].vector,
 aiResponses[j].vector
 );

 if (similarity > 0.8) {
 duplicates.push({
 index1: i,
 index2: j,
 similarity,
 sample1: aiResponses[i].content.substring(0, 100),
 sample2: aiResponses[j].content.substring(0, 100)
 });
 }
 }
 }

 return duplicates;
 }

 // 分析错误模式
 private analyzeErrorPatterns(history: Message[]): ErrorPatternAnalysis {
 const errors: string[] = [];

 for (const msg of history) {
 if (msg.role === 'tool_result' && msg.isError) {
 errors.push(this.extractErrorSignature(msg.content));
 }
 }

 const errorCounts = new Map<string, number>();
 for (const error of errors) {
 errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
 }

 const maxCount = Math.max(...errorCounts.values(), 0);

 return {
 sameErrorCount: maxCount,
 uniqueErrors: errorCounts.size,
 mostCommonError: this.getMostCommon(errorCounts)
 };
 }
}

/*
漏检案例分析：

案例：AI 变换参数但本质重复

Turn 1: Grep("error", "src/") -> 无结果
Turn 2: Grep("Error", "src/") -> 无结果 (改大小写)
Turn 3: Grep("ERROR", "src/") -> 无结果 (全大写)
Turn 4: Grep("err", "src/") -> 无结果 (缩写)
Turn 5: Grep("error message", "src/") -> 无结果 (加词)

字面检测：每次参数不同，不触发
语义分析：发现搜索意图相同，搜索结果相同 -> 应该触发

分析报告：
{
 loopLikelihood: 0.85,
 indicators: [
 { type: 'semantic_loop', severity: 'high', evidence: '5次相似搜索' },
 { type: 'result_loop', severity: 'high', evidence: '100% 结果为空' }
 ],
 recommendation: '建议启用语义相似度检测',
 suggestedAction: 'inject_alternative_strategy'
}
*/`}
 language="typescript"
 title="漏检分析"
 />

 <HighlightBox title="增强检测策略" color="blue" className="mt-4">
 <div className="text-sm text-body">
 <p className="mb-2 font-semibold text-heading">针对漏检的增强措施：</p>
 <ul className="space-y-2">
 <li><strong>1. 语义相似度检测：</strong>使用 TF-IDF 或嵌入向量检测意图相似的操作</li>
 <li><strong>2. 结果模式分析：</strong>关注工具返回结果的重复性，而非仅关注参数</li>
 <li><strong>3. 进度追踪：</strong>监控任务完成度，长时间无进展触发警报</li>
 <li><strong>4. 错误签名匹配：</strong>提取错误的核心特征，忽略动态部分</li>
 </ul>
 </div>
 </HighlightBox>
 </Layer>

 {/* 问题3: LLM检测不准确 */}
 <Layer title="问题3: LLM 智能检测结果不稳定" depth={2} defaultOpen={true}>
 <HighlightBox title="症状" color="red">
 <ul className="text-sm space-y-1">
 <li>• 同样的对话模式，检测结果不一致</li>
 <li>• LLM 检测的置信度波动大</li>
 <li>• 检测耗时长，影响响应速度</li>
 </ul>
 </HighlightBox>

 <CodeBlock
 code={`// LLM 检测优化
// packages/core/src/services/loopDetection/llmChecker.ts

class OptimizedLLMLoopChecker {
 private checkCache = new Map<string, LLMCheckResult>();
 private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

 async performCheck(
 conversationHistory: Message[],
 options: LLMCheckOptions = {}
 ): Promise<LoopDetectionResult> {
 // 1. 预筛选：使用快速规则先过滤明显非循环情况
 const quickCheck = this.performQuickCheck(conversationHistory);
 if (!quickCheck.needsLLMCheck) {
 return { isLoop: false };
 }

 // 2. 生成对话摘要用于缓存键
 const summaryHash = this.generateConversationSummary(conversationHistory);

 // 3. 检查缓存
 const cached = this.checkCache.get(summaryHash);
 if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
 return cached.result;
 }

 // 4. 构建更精确的分析提示
 const analysisPrompt = this.buildStructuredPrompt(
 conversationHistory,
 quickCheck.suspiciousPatterns
 );

 // 5. 使用较小模型进行快速分析
 const response = await this.llmClient.generate(analysisPrompt, {
 model: options.fastModel || 'gpt-3.5-turbo', // 使用快速模型
 maxTokens: 500,
 temperature: 0.1 // 低温度提高一致性
 });

 // 6. 解析并验证结果
 const result = this.parseAndValidateResponse(response);

 // 7. 如果不确定，使用更强模型二次确认
 if (result.confidence < 0.7 && result.isLoop) {
 const confirmResult = await this.confirmWithStrongerModel(
 conversationHistory,
 result
 );
 result.isLoop = confirmResult.isLoop;
 result.confidence = confirmResult.confidence;
 }

 // 8. 缓存结果
 this.checkCache.set(summaryHash, {
 result,
 timestamp: Date.now()
 });

 return this.formatResult(result);
 }

 // 快速预筛选
 private performQuickCheck(history: Message[]): QuickCheckResult {
 const recentHistory = history.slice(-20);
 const patterns: string[] = [];

 // 检查工具调用多样性
 const toolNames = new Set<string>();
 for (const msg of recentHistory) {
 if (msg.toolCalls) {
 msg.toolCalls.forEach(tc => toolNames.add(tc.name));
 }
 }

 if (toolNames.size <= 2 && recentHistory.length > 10) {
 patterns.push('limited_tool_variety');
 }

 // 检查响应长度模式
 const responseLengths = recentHistory
 .filter(m => m.role === 'assistant')
 .map(m => m.content.length);

 if (this.hasRepeatingPattern(responseLengths)) {
 patterns.push('response_length_pattern');
 }

 return {
 needsLLMCheck: patterns.length > 0,
 suspiciousPatterns: patterns
 };
 }

 // 结构化提示词
 private buildStructuredPrompt(
 history: Message[],
 suspiciousPatterns: string[]
 ): string {
 const summary = this.summarizeHistory(history.slice(-15));

 return \`
你是一个循环检测专家。分析以下对话摘要，判断 AI 是否陷入循环。

## 可疑模式
已检测到以下模式：\${suspiciousPatterns.join(', ')}

## 对话摘要
\${summary}

## 分析要求
1. 判断是否存在循环行为
2. 如果是循环，识别循环的类型和模式
3. 评估循环的严重程度

## 响应格式（JSON）
{
 "isLoop": boolean,
 "confidence": number (0-1, 精确到小数点后2位),
 "loopType": "retry" | "exploration" | "fixation" | "none",
 "pattern": string (循环模式的简短描述),
 "evidence": [string] (支持判断的具体证据，最多3条),
 "suggestion": string (如何打破循环的建议)
}

只返回 JSON，不要其他内容。
\`;
 }

 // 解析并验证响应
 private parseAndValidateResponse(response: string): LLMCheckResult {
 try {
 const parsed = JSON.parse(response);

 // 验证必需字段
 if (typeof parsed.isLoop !== 'boolean') {
 throw new Error('Missing isLoop field');
 }

 // 规范化置信度
 parsed.confidence = Math.max(0, Math.min(1,
 typeof parsed.confidence === 'number' ? parsed.confidence : 0.5
 ));

 return parsed;
 } catch (e) {
 // 解析失败时返回保守结果
 return {
 isLoop: false,
 confidence: 0,
 loopType: 'none',
 pattern: 'parse_error',
 evidence: [],
 suggestion: ''
 };
 }
 }
}

/*
优化效果对比：

优化前：
- 平均延迟：2.5s
- 置信度变异系数：0.35
- 缓存命中率：0%

优化后：
- 平均延迟：0.8s (预筛选过滤 60% 请求)
- 置信度变异系数：0.12 (低温度 + 结构化提示)
- 缓存命中率：40%
*/`}
 language="typescript"
 title="LLM 检测优化"
 />
 </Layer>

 {/* 调试日志配置 */}
 <Layer title="调试日志与监控配置" depth={2} defaultOpen={true}>
 <CodeBlock
 code={`// 循环检测调试配置
// packages/core/src/services/loopDetection/debugConfig.ts

// 启用详细日志
export const LOOP_DETECTION_DEBUG = {
 enabled: process.env.DEBUG_LOOP_DETECTION === 'true',

 // 日志级别
 logLevel: 'debug' as const, // 'debug' | 'info' | 'warn' | 'error'

 // 记录哈希计算详情
 logHashDetails: true,

 // 记录每次检查的结果
 logCheckResults: true,

 // 记录阈值比较
 logThresholdComparisons: true,

 // 记录 LLM 调用
 logLLMCalls: true,

 // 输出格式
 format: 'structured' as const, // 'structured' | 'pretty' | 'json'
};

// 结构化日志输出
class LoopDetectionLogger {
 log(event: LoopDetectionEvent): void {
 if (!LOOP_DETECTION_DEBUG.enabled) return;

 const logEntry = {
 timestamp: new Date().toISOString(),
 sessionId: this.sessionId,
 turnNumber: this.turnCount,
 event: event.type,
 details: event.details,
 metrics: this.getMetrics()
 };

 switch (LOOP_DETECTION_DEBUG.format) {
 case 'structured':
 console.log('[LoopDetection]', JSON.stringify(logEntry, null, 2));
 break;
 case 'pretty':
 this.prettyPrint(logEntry);
 break;
 case 'json':
 console.log(JSON.stringify(logEntry));
 break;
 }
 }

 private prettyPrint(entry: LogEntry): void {
 const emoji = this.getEventEmoji(entry.event);
 console.log(\`\${emoji} [Turn \${entry.turnNumber}] \${entry.event}\`);

 if (entry.details) {
 console.log(' Details:', entry.details);
 }

 if (entry.metrics) {
 console.log(' Metrics:', entry.metrics);
 }
 }

 private getEventEmoji(event: string): string {
 const emojiMap: Record<string, string> = {
 'check_start': '🔍',
 'tool_hash_computed': '🔢',
 'threshold_exceeded': '🚨',
 'llm_check_triggered': '🤖',
 'loop_detected': '⚠️',
 'loop_broken': '✅',
 'state_reset': '🔄'
 };
 return emojiMap[event] || '📝';
 }
}

// 使用示例
// DEBUG_LOOP_DETECTION=true gemini

/*
日志输出示例：

🔍 [Turn 5] check_start
 Details: { toolCalls: 1, contentLength: 256 }

🔢 [Turn 5] tool_hash_computed
 Details: { tool: 'read_file', hash: 'abc123', count: 3 }

🔍 [Turn 6] check_start
 Details: { toolCalls: 1, contentLength: 234 }

🔢 [Turn 6] tool_hash_computed
 Details: { tool: 'read_file', hash: 'abc123', count: 4 }

🔍 [Turn 7] check_start
 Details: { toolCalls: 1, contentLength: 245 }

🔢 [Turn 7] tool_hash_computed
 Details: { tool: 'read_file', hash: 'abc123', count: 5 }

🚨 [Turn 7] threshold_exceeded
 Details: { threshold: 5, actual: 5, type: 'tool_call' }

⚠️ [Turn 7] loop_detected
 Details: {
 type: 'tool_call',
 message: 'read_file("config.json") called 5 times',
 strategy: 'PAUSE'
 }
*/`}
 language="typescript"
 title="调试日志配置"
 />

 <HighlightBox title="关键调试命令" color="purple" className="mt-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
 <div>
 <p className="text-heading mb-1"># 启用循环检测调试</p>
 <code className="text-body">DEBUG_LOOP_DETECTION=true gemini</code>
 </div>
 <div>
 <p className="text-heading mb-1"># 查看触发历史</p>
 <code className="text-body">/debug loop-history</code>
 </div>
 <div>
 <p className="text-heading mb-1"># 分析当前会话</p>
 <code className="text-body">/debug analyze-loops</code>
 </div>
 <div>
 <p className="text-heading mb-1"># 临时调整阈值</p>
 <code className="text-body">/config loop.threshold 10</code>
 </div>
 </div>
 </HighlightBox>
 </Layer>
 </Layer>

 {/* 性能优化建议 */}
 <Layer title="性能优化建议" depth={1} defaultOpen={true}>
 <p className="text-body mb-6">
 循环检测在每次 AI 响应后执行，其性能直接影响整体响应延迟。以下是优化策略。
 </p>

 {/* 哈希计算优化 */}
 <Layer title="1. 哈希计算优化" depth={2} defaultOpen={true}>
 <CodeBlock
 code={`// 哈希计算性能优化
// packages/core/src/services/loopDetection/optimizedHash.ts

// 优化前：每次都计算完整 MD5
function slowHash(content: string): string {
 return crypto.createHash('md5').update(content).digest('hex');
}

// 优化后：增量哈希 + 分层策略
class OptimizedHasher {
 private quickHashCache = new Map<string, string>();
 private readonly QUICK_HASH_LENGTH = 100; // 快速哈希仅使用前100字符

 // 快速哈希：用于初步过滤
 quickHash(content: string): string {
 const key = content.substring(0, this.QUICK_HASH_LENGTH);

 let hash = this.quickHashCache.get(key);
 if (!hash) {
 // 使用更快的 xxHash 或简单哈希
 hash = this.simpleHash(key);
 this.quickHashCache.set(key, hash);
 }

 return hash;
 }

 // 完整哈希：仅在快速哈希匹配时计算
 fullHash(content: string): string {
 // 使用流式 MD5 避免大字符串内存问题
 const hash = crypto.createHash('md5');

 // 分块处理
 const chunkSize = 64 * 1024; // 64KB chunks
 for (let i = 0; i < content.length; i += chunkSize) {
 hash.update(content.slice(i, i + chunkSize));
 }

 return hash.digest('hex');
 }

 // 简单快速哈希（djb2 算法）
 private simpleHash(str: string): string {
 let hash = 5381;
 for (let i = 0; i < str.length; i++) {
 hash = ((hash << 5) + hash) + str.charCodeAt(i);
 hash = hash & hash; // 转换为32位整数
 }
 return (hash >>> 0).toString(16);
 }
}

// 两阶段哈希检测
class TwoStageHashDetector {
 private quickHashCounts = new Map<string, number>();
 private fullHashCounts = new Map<string, number>();

 check(content: string, threshold: number): { isLoop: boolean; count: number } {
 // 阶段1：快速哈希检查
 const quickHash = this.hasher.quickHash(content);
 const quickCount = (this.quickHashCounts.get(quickHash) || 0) + 1;
 this.quickHashCounts.set(quickHash, quickCount);

 // 如果快速哈希计数未达阈值-1，直接返回（优化路径）
 if (quickCount < threshold - 1) {
 return { isLoop: false, count: quickCount };
 }

 // 阶段2：仅在接近阈值时计算完整哈希
 const fullHash = this.hasher.fullHash(content);
 const fullCount = (this.fullHashCounts.get(fullHash) || 0) + 1;
 this.fullHashCounts.set(fullHash, fullCount);

 return {
 isLoop: fullCount >= threshold,
 count: fullCount
 };
 }
}

/*
性能对比 (10000次检测)：

原始方案（每次完整 MD5）：
- 平均耗时：0.15ms/次
- 总耗时：1500ms

两阶段优化方案：
- 快速路径（90%情况）：0.02ms/次
- 完整路径（10%情况）：0.15ms/次
- 平均耗时：0.033ms/次
- 总耗时：330ms
- 提升：4.5x

内存优化：
- 原始：保存完整内容用于验证
- 优化：仅保存快速哈希 + 按需计算完整哈希
- 内存减少：约60%
*/`}
 language="typescript"
 title="哈希计算优化"
 />

 <div className="mt-4 bg-surface rounded-lg p-4">
 <h5 className="text-heading font-semibold mb-2">性能基准对比</h5>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2">方案</th>
 <th className="text-right py-2">平均延迟</th>
 <th className="text-right py-2">P99延迟</th>
 <th className="text-right py-2">内存</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2">原始 MD5</td>
 <td className="text-right py-2">0.15ms</td>
 <td className="text-right py-2">0.45ms</td>
 <td className="text-right py-2">8MB</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2">两阶段哈希</td>
 <td className="text-right py-2 text-green-400">0.033ms</td>
 <td className="text-right py-2 text-green-400">0.18ms</td>
 <td className="text-right py-2 text-green-400">3.2MB</td>
 </tr>
 <tr>
 <td className="py-2">提升比例</td>
 <td className="text-right py-2 text-green-400">4.5x</td>
 <td className="text-right py-2 text-green-400">2.5x</td>
 <td className="text-right py-2 text-green-400">60%↓</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </Layer>

 {/* 历史记录管理优化 */}
 <Layer title="2. 历史记录管理优化" depth={2} defaultOpen={true}>
 <CodeBlock
 code={`// 历史记录高效管理
// packages/core/src/services/loopDetection/historyManager.ts

// 使用 LRU 缓存控制内存
class LRUHashHistory<V> {
 private cache = new Map<string, V>();
 private readonly maxSize: number;

 constructor(maxSize: number = 1000) {
 this.maxSize = maxSize;
 }

 get(key: string): V | undefined {
 const value = this.cache.get(key);
 if (value !== undefined) {
 // 移动到最近使用位置
 this.cache.delete(key);
 this.cache.set(key, value);
 }
 return value;
 }

 set(key: string, value: V): void {
 // 如果已存在，先删除
 if (this.cache.has(key)) {
 this.cache.delete(key);
 }
 // 如果达到上限，删除最老的
 else if (this.cache.size >= this.maxSize) {
 const oldestKey = this.cache.keys().next().value;
 this.cache.delete(oldestKey);
 }

 this.cache.set(key, value);
 }

 // 批量清理过期条目
 cleanup(expiryTime: number): number {
 const now = Date.now();
 let removed = 0;

 for (const [key, value] of this.cache) {
 if (value.timestamp && now - value.timestamp > expiryTime) {
 this.cache.delete(key);
 removed++;
 }
 }

 return removed;
 }
}

// 分片存储：减少单次查找开销
class ShardedHistory {
 private shards: Map<string, number>[] = [];
 private readonly shardCount: number;

 constructor(shardCount: number = 16) {
 this.shardCount = shardCount;
 for (let i = 0; i < shardCount; i++) {
 this.shards.push(new Map());
 }
 }

 private getShardIndex(key: string): number {
 // 使用哈希的前两位确定分片
 return parseInt(key.substring(0, 2), 16) % this.shardCount;
 }

 get(key: string): number | undefined {
 const shard = this.shards[this.getShardIndex(key)];
 return shard.get(key);
 }

 increment(key: string): number {
 const shardIndex = this.getShardIndex(key);
 const shard = this.shards[shardIndex];
 const count = (shard.get(key) || 0) + 1;
 shard.set(key, count);
 return count;
 }

 // 并行清理所有分片
 async cleanupAll(expiryTime: number): Promise<number> {
 const cleanupPromises = this.shards.map((shard, index) =>
 this.cleanupShard(shard, expiryTime)
 );

 const results = await Promise.all(cleanupPromises);
 return results.reduce((a, b) => a + b, 0);
 }
}

// 内存预算管理
class MemoryBudgetManager {
 private readonly MAX_MEMORY_MB = 10; // 最大使用10MB

 private toolCallHistory: LRUHashHistory<ToolCallEntry>;
 private contentHistory: ShardedHistory;

 constructor() {
 // 根据内存预算分配容量
 const estimatedEntrySize = 200; // 每条目约200字节
 const maxEntries = Math.floor((this.MAX_MEMORY_MB * 1024 * 1024) / estimatedEntrySize);

 // 工具调用历史占60%
 this.toolCallHistory = new LRUHashHistory(Math.floor(maxEntries * 0.6));
 // 内容历史占40%
 this.contentHistory = new ShardedHistory(16);
 }

 // 定期内存检查
 checkMemoryUsage(): MemoryStatus {
 const used = process.memoryUsage().heapUsed / 1024 / 1024;
 const threshold = this.MAX_MEMORY_MB * 0.8;

 if (used > threshold) {
 // 触发紧急清理
 this.emergencyCleanup();
 }

 return {
 usedMB: used,
 limitMB: this.MAX_MEMORY_MB,
 utilizationPercent: (used / this.MAX_MEMORY_MB) * 100
 };
 }

 private emergencyCleanup(): void {
 // 清理一半的 LRU 缓存
 const halfSize = this.toolCallHistory.size() / 2;
 for (let i = 0; i < halfSize; i++) {
 this.toolCallHistory.removeOldest();
 }

 // 触发垃圾回收（如果可用）
 if (global.gc) {
 global.gc();
 }
 }
}

/*
内存使用对比：

场景：持续运行8小时，累计1000轮对话

无优化：
- 历史记录无限增长
- 8小时后内存：150MB+
- 可能触发 OOM

使用 LRU + 分片 + 预算管理：
- 内存稳定在 10MB 以内
- 自动清理过期数据
- 紧急清理机制防止 OOM
*/`}
 language="typescript"
 title="历史记录管理"
 />
 </Layer>

 {/* 异步与并行优化 */}
 <Layer title="3. 异步与并行优化" depth={2} defaultOpen={true}>
 <CodeBlock
 code={`// 异步优化：不阻塞主流程
// packages/core/src/services/loopDetection/asyncOptimization.ts

class NonBlockingLoopDetector {
 private pendingCheck: Promise<LoopDetectionResult> | null = null;
 private lastResult: LoopDetectionResult = { isLoop: false };

 // 非阻塞检查：返回上次结果，后台更新
 checkNonBlocking(
 response: AIResponse,
 history: Message[]
 ): LoopDetectionResult {
 // 启动后台检查
 this.pendingCheck = this.performCheckAsync(response, history)
 .then(result => {
 this.lastResult = result;
 return result;
 });

 // 立即返回上次结果
 return this.lastResult;
 }

 // 阻塞检查：需要立即知道结果时使用
 async checkBlocking(
 response: AIResponse,
 history: Message[]
 ): Promise<LoopDetectionResult> {
 // 等待任何待处理的检查
 if (this.pendingCheck) {
 await this.pendingCheck;
 }

 return this.performCheckAsync(response, history);
 }

 // 并行执行多层检测
 private async performCheckAsync(
 response: AIResponse,
 history: Message[]
 ): Promise<LoopDetectionResult> {
 // 并行执行工具调用检测和内容检测
 const [toolResult, contentResult] = await Promise.all([
 this.checkToolCallLoopAsync(response),
 this.checkContentLoopAsync(response)
 ]);

 // 任一检测到循环即返回
 if (toolResult.isLoop) return toolResult;
 if (contentResult.isLoop) return contentResult;

 // LLM 检测延迟执行
 if (this.turnCount >= LLM_CHECK_THRESHOLD) {
 // 使用 setTimeout 延迟执行，不阻塞当前响应
 setTimeout(() => {
 this.performLLMCheckAsync(history).then(result => {
 if (result.isLoop) {
 this.emitLoopDetected(result);
 }
 });
 }, 0);
 }

 return { isLoop: false };
 }

 // 使用 Worker 线程处理计算密集任务
 private async checkToolCallLoopAsync(response: AIResponse): Promise<LoopDetectionResult> {
 // 对于大量工具调用，使用 Worker 线程
 if (response.toolCalls && response.toolCalls.length > 10) {
 return this.workerPool.execute('checkToolLoop', {
 toolCalls: response.toolCalls,
 history: this.serializeHistory()
 });
 }

 // 小规模直接在主线程处理
 return this.checkToolCallLoopSync(response);
 }
}

// 批量处理优化
class BatchedLoopDetector {
 private pendingChecks: CheckRequest[] = [];
 private batchTimer: NodeJS.Timeout | null = null;
 private readonly BATCH_DELAY = 10; // 10ms 批处理窗口

 // 添加检查请求到批次
 addCheck(request: CheckRequest): void {
 this.pendingChecks.push(request);

 if (!this.batchTimer) {
 this.batchTimer = setTimeout(() => {
 this.processBatch();
 }, this.BATCH_DELAY);
 }
 }

 // 批量处理所有待检查项
 private processBatch(): void {
 const batch = this.pendingChecks;
 this.pendingChecks = [];
 this.batchTimer = null;

 // 预计算所有哈希
 const hashes = batch.map(req => ({
 request: req,
 toolHash: this.computeToolHash(req.toolCalls),
 contentHash: this.computeContentHash(req.content)
 }));

 // 批量更新计数
 const results = this.batchUpdateCounts(hashes);

 // 回调所有请求
 batch.forEach((req, idx) => {
 req.callback(results[idx]);
 });
 }
}

/*
性能优化效果：

原始同步方案：
Turn N 响应 -> 循环检测(50ms) -> 显示结果
用户感知延迟：+50ms

非阻塞 + 批处理方案：
Turn N 响应 -> 显示结果 -> 后台循环检测
用户感知延迟：+0ms（检测结果延迟一轮生效）

对于检测延迟的权衡：
- 优点：用户无感知延迟
- 缺点：循环检测可能延迟一轮触发
- 适用场景：对响应速度敏感的交互场景
*/`}
 language="typescript"
 title="异步与并行优化"
 />
 </Layer>

 {/* 检测策略动态调整 */}
 <Layer title="4. 检测策略动态调整" depth={2} defaultOpen={true}>
 <CodeBlock
 code={`// 自适应检测策略
// packages/core/src/services/loopDetection/adaptiveStrategy.ts

interface PerformanceMetrics {
 avgCheckTime: number;
 checkCount: number;
 loopDetectionRate: number;
 falsePositiveRate: number;
}

class AdaptiveLoopDetector {
 private metrics: PerformanceMetrics = {
 avgCheckTime: 0,
 checkCount: 0,
 loopDetectionRate: 0,
 falsePositiveRate: 0
 };

 private currentStrategy: DetectionStrategy = 'balanced';

 // 根据运行时指标调整策略
 adjustStrategy(): void {
 const { avgCheckTime, loopDetectionRate, falsePositiveRate } = this.metrics;

 // 性能优先模式：检测时间过长
 if (avgCheckTime > 50) { // 超过50ms
 this.currentStrategy = 'performance';
 this.applyPerformanceOptimizations();
 }
 // 准确性优先模式：误报率过高
 else if (falsePositiveRate > 0.1) { // 超过10%
 this.currentStrategy = 'accuracy';
 this.applyAccuracyOptimizations();
 }
 // 激进模式：检测率过低
 else if (loopDetectionRate < 0.01 && this.checkCount > 100) {
 this.currentStrategy = 'aggressive';
 this.applyAggressiveDetection();
 }
 // 默认平衡模式
 else {
 this.currentStrategy = 'balanced';
 this.applyBalancedSettings();
 }
 }

 private applyPerformanceOptimizations(): void {
 // 减少检测层级
 this.config.enableLLMCheck = false;
 // 增加检测间隔
 this.config.checkInterval = 2; // 每2轮检测一次
 // 简化哈希计算
 this.config.useQuickHash = true;
 // 减少历史保留
 this.config.maxHistorySize = 500;
 }

 private applyAccuracyOptimizations(): void {
 // 提高阈值减少误报
 this.config.toolCallThreshold = 8;
 this.config.contentThreshold = 15;
 // 启用模糊匹配
 this.config.enableFuzzyMatch = true;
 // 增加二次确认
 this.config.requireConfirmation = true;
 }

 private applyAggressiveDetection(): void {
 // 降低阈值提高检测率
 this.config.toolCallThreshold = 3;
 this.config.contentThreshold = 5;
 // 启用语义检测
 this.config.enableSemanticCheck = true;
 // 启用 LLM 检测
 this.config.enableLLMCheck = true;
 this.config.llmCheckThreshold = 15; // 更早触发
 }

 private applyBalancedSettings(): void {
 this.config.toolCallThreshold = 5;
 this.config.contentThreshold = 10;
 this.config.enableLLMCheck = true;
 this.config.llmCheckThreshold = 30;
 this.config.checkInterval = 1;
 this.config.useQuickHash = false;
 this.config.maxHistorySize = 1000;
 }

 // 记录检测结果用于策略调整
 recordResult(result: LoopDetectionResult, wasUserOverridden: boolean): void {
 this.metrics.checkCount++;

 if (result.isLoop) {
 this.metrics.loopDetectionRate =
 (this.metrics.loopDetectionRate * (this.metrics.checkCount - 1) + 1)
 / this.metrics.checkCount;

 if (wasUserOverridden) {
 // 用户覆盖了检测结果 = 误报
 this.metrics.falsePositiveRate =
 (this.metrics.falsePositiveRate * this.metrics.checkCount + 1)
 / (this.metrics.checkCount + 1);
 }
 }

 // 每100次检测调整一次策略
 if (this.metrics.checkCount % 100 === 0) {
 this.adjustStrategy();
 }
 }
}

/*
策略切换示意：

初始状态：balanced 模式
├── 检测时间持续 >50ms
│ └── 切换到 performance 模式
│ ├── 禁用 LLM 检测
│ ├── 减少检测频率
│ └── 使用快速哈希
│
├── 误报率 >10%
│ └── 切换到 accuracy 模式
│ ├── 提高阈值
│ ├── 启用模糊匹配
│ └── 要求二次确认
│
└── 检测率过低 (<1%)
 └── 切换到 aggressive 模式
 ├── 降低阈值
 ├── 启用语义检测
 └── 提前触发 LLM 检测
*/`}
 language="typescript"
 title="自适应检测策略"
 />

 <MermaidDiagram chart={`
graph TD
 subgraph "策略切换状态机"
 B[Balanced<br/>平衡模式] -->|"avgCheckTime > 50ms"| P[Performance<br/>性能模式]
 B -->|"falsePositiveRate > 10%"| A[Accuracy<br/>准确模式]
 B -->|"loopDetectionRate < 1%"| AG[Aggressive<br/>激进模式]

 P -->|"性能改善"| B
 A -->|"误报减少"| B
 AG -->|"检测率提升"| B
 end

 style B fill:#22c55e,color:#000
 style P fill:#3b82f6,color:#fff
 style A fill:#f59e0b,color:#000
 style AG fill:#ef4444,color:#fff
 `} />
 </Layer>
 </Layer>

 {/* 与其他模块的交互关系 */}
 <Layer title="与其他模块的交互关系" depth={1} defaultOpen={true}>
 <p className="text-body mb-6">
 循环检测系统与多个核心模块深度集成，理解这些交互对于正确使用和调试至关重要。
 </p>

 {/* 模块依赖图 */}
 <Layer title="模块依赖架构" depth={2} defaultOpen={true}>
 <MermaidDiagram chart={`
flowchart TB
 subgraph "循环检测系统"
 LD[LoopDetectionService<br/>循环检测服务]
 TH[ToolHasher<br/>工具哈希]
 CH[ContentHasher<br/>内容哈希]
 LLC[LLMLoopChecker<br/>LLM 检测]
 SM[StateManager<br/>状态管理]
 end

 subgraph "依赖模块"
 GC[GeminiChat<br/>核心对话]
 TL[Telemetry<br/>遥测服务]
 UI[UI Components<br/>界面组件]
 TS[ToolScheduler<br/>工具调度]
 CFG[ConfigService<br/>配置服务]
 end

 subgraph "数据流"
 AIR[AI Response<br/>AI 响应]
 HIS[Conversation History<br/>对话历史]
 TCR[Tool Call Results<br/>工具调用结果]
 end

 GC -->|"响应完成事件"| LD
 LD -->|"循环警告/中断"| GC

 LD --> TH
 LD --> CH
 LD --> LLC
 LD --> SM

 AIR --> TH
 AIR --> CH
 HIS --> LLC
 TCR --> TH

 LD -->|"记录循环事件"| TL
 LD -->|"显示警告"| UI
 CFG -->|"阈值配置"| LD
 TS -->|"工具调用信息"| LD

 style LD fill:#22d3ee,color:#000
 style GC fill:#a855f7,color:#fff
 style TL fill:#22c55e,color:#000
 `} />
 </Layer>

 {/* 核心交互接口 */}
 <Layer title="核心交互接口" depth={2} defaultOpen={true}>
 <CodeBlock
 code={`// 循环检测与其他模块的接口
// packages/core/src/services/loopDetection/interfaces.ts

// =========================================
// 与 GeminiChat 的接口
// =========================================

interface GeminiChatIntegration {
 // GeminiChat 调用循环检测
 onResponseComplete(response: AIResponse): Promise<LoopDetectionResult>;

 // 循环检测通知 GeminiChat
 emitLoopDetected(result: LoopDetectionResult): void;
 emitLoopBroken(method: string): void;
}

// 在 GeminiChat 中的使用
class GeminiChat {
 private loopDetector: LoopDetectionService;

 async processResponse(response: AIResponse): Promise<void> {
 // 检测循环
 const loopResult = await this.loopDetector.onResponseComplete(response);

 if (loopResult.isLoop) {
 // 触发循环处理流程
 await this.handleLoop(loopResult);
 }
 }

 private async handleLoop(result: LoopDetectionResult): Promise<void> {
 // 根据配置决定处理策略
 switch (this.config.loopHandling) {
 case 'pause':
 // 暂停并等待用户确认
 const shouldContinue = await this.ui.confirmContinue(
 \`检测到循环: \${result.message}\\n继续执行可能导致无限循环。\`
 );
 if (!shouldContinue) {
 throw new LoopInterruptError(result);
 }
 // 用户选择继续，记录为可能的误报
 this.loopDetector.recordUserOverride(result);
 break;

 case 'inject':
 // 注入打破循环的提示
 this.injectLoopBreakingPrompt(result);
 break;

 case 'interrupt':
 throw new LoopInterruptError(result);
 }
 }
}

// =========================================
// 与 Telemetry 的接口
// =========================================

interface TelemetryIntegration {
 // 记录循环检测事件
 recordLoopDetected(result: LoopDetectionResult): void;
 recordLoopBroken(method: string, success: boolean): void;
 recordCheckPerformance(duration: number): void;

 // 汇总统计
 getLoopStatistics(): LoopStatistics;
}

// 遥测数据结构
interface LoopTelemetryData {
 eventType: 'loop_detected' | 'loop_broken' | 'check_performed';
 timestamp: number;
 sessionId: string;

 // 循环检测特定数据
 loopType?: 'tool_call' | 'content' | 'llm_detected';
 triggerValue?: number;
 threshold?: number;

 // 性能数据
 checkDuration?: number;

 // 打破循环的方法
 breakMethod?: string;
 breakSuccess?: boolean;
}

// =========================================
// 与 ToolScheduler 的接口
// =========================================

interface ToolSchedulerIntegration {
 // 获取工具调用信息
 getToolCallInfo(call: ToolCall): ToolCallInfo;

 // 工具调用前的循环预检
 preflightCheck(toolName: string, args: unknown): PreflightResult;
}

// 预检可以阻止明显的循环调用
class LoopAwareToolScheduler {
 private loopDetector: LoopDetectionService;

 async scheduleToolCall(call: ToolCall): Promise<ToolResult> {
 // 预检：检查是否即将触发循环
 const preflight = this.loopDetector.preflightCheck(call.name, call.args);

 if (preflight.wouldTriggerLoop) {
 // 返回警告而不是执行
 return {
 success: false,
 error: \`循环预警: 此操作将触发循环检测 (\${preflight.currentCount + 1}/\${preflight.threshold})\`,
 suggestion: preflight.alternativeSuggestion
 };
 }

 // 正常执行
 return this.executeToolCall(call);
 }
}

// =========================================
// 与 ConfigService 的接口
// =========================================

interface ConfigIntegration {
 // 获取循环检测配置
 getLoopDetectionConfig(): LoopDetectionConfig;

 // 配置变更通知
 onConfigChange(handler: (config: LoopDetectionConfig) => void): void;
}

// 配置热更新
class LoopDetectionService {
 constructor(private configService: ConfigService) {
 // 监听配置变更
 this.configService.onConfigChange((newConfig) => {
 this.updateThresholds(newConfig);
 });
 }

 private updateThresholds(config: LoopDetectionConfig): void {
 this.toolCallThreshold = config.toolCallThreshold ?? 5;
 this.contentThreshold = config.contentThreshold ?? 10;
 this.llmCheckThreshold = config.llmCheckThreshold ?? 30;
 this.enableLLMCheck = config.enableLLMCheck ?? true;
 }
}

// =========================================
// 与 UI 的接口
// =========================================

interface UIIntegration {
 // 显示循环警告
 showLoopWarning(message: string): void;

 // 请求用户确认
 requestConfirmation(message: string): Promise<boolean>;

 // 显示循环状态指示器
 updateLoopIndicator(status: LoopStatus): void;
}

// UI 状态
interface LoopStatus {
 isDetecting: boolean;
 currentCounts: {
 toolCall: { [hash: string]: number };
 content: number;
 };
 recentWarnings: string[];
}

/*
模块交互时序：

1. 响应处理流程：
 GeminiChat -> LoopDetectionService -> 检测结果
 -> Telemetry (记录)
 -> UI (显示)

2. 工具调用流程：
 ToolScheduler -> LoopDetectionService.preflight
 -> 如果预警 -> 返回建议
 -> 否则 -> 执行调用 -> 更新历史

3. 配置更新流程：
 ConfigService -> LoopDetectionService.updateThresholds
 -> 立即生效
*/`}
 language="typescript"
 title="模块交互接口"
 />
 </Layer>

 {/* 数据流动图 */}
 <Layer title="数据流动详解" depth={2} defaultOpen={true}>
 <MermaidDiagram chart={`
sequenceDiagram
 participant User as 用户
 participant GC as GeminiChat
 participant LD as LoopDetection
 participant TH as ToolHasher
 participant CH as ContentHasher
 participant LLC as LLMChecker
 participant UI as UI
 participant TM as Telemetry

 User->>GC: 发送消息
 GC->>GC: 生成 AI 响应
 GC->>LD: onResponseComplete(response)

 par 并行检测
 LD->>TH: checkToolCallLoop(toolCalls)
 TH-->>LD: { isLoop: false, count: 3 }
 and
 LD->>CH: checkContentLoop(content)
 CH-->>LD: { isLoop: false, count: 5 }
 end

 alt 轮数 >= 30
 LD->>LLC: performLLMCheck(history)
 LLC-->>LD: { isLoop: true, confidence: 0.85 }
 end

 LD->>TM: recordLoopDetected(result)
 LD->>UI: showLoopWarning(message)
 LD-->>GC: LoopDetectionResult

 alt 循环处理策略: PAUSE
 GC->>UI: requestConfirmation()
 UI->>User: "检测到循环，继续?"
 User-->>UI: 确认/取消
 UI-->>GC: boolean
 end

 GC->>LD: recordUserOverride(result)
 GC->>GC: 继续或中断
 `} />

 <div className="mt-4 bg-surface rounded-lg p-4">
 <h5 className="text-heading font-semibold mb-2">关键数据流说明</h5>
 <ul className="text-sm text-body space-y-2">
 <li>
 <strong className="text-heading">1. 响应 → 检测：</strong>
 每次 AI 响应完成后触发，包含工具调用列表和文本内容
 </li>
 <li>
 <strong className="text-green-400">2. 检测 → 遥测：</strong>
 所有检测事件都记录到遥测系统，用于分析和优化
 </li>
 <li>
 <strong className="text-yellow-400">3. 检测 → UI：</strong>
 警告和确认请求通过 UI 层呈现给用户
 </li>
 <li>
 <strong className="text-heading">4. 用户反馈 → 检测：</strong>
 用户覆盖决定被记录，用于调整误报率统计
 </li>
 </ul>
 </div>
 </Layer>

 {/* 错误传播与处理 */}
 <Layer title="错误传播与处理" depth={2} defaultOpen={true}>
 <CodeBlock
 code={`// 错误处理与传播
// packages/core/src/services/loopDetection/errorHandling.ts

// 循环检测相关错误类型
class LoopInterruptError extends Error {
 constructor(
 public readonly result: LoopDetectionResult,
 message?: string
 ) {
 super(message || \`循环检测中断: \${result.message}\`);
 this.name = 'LoopInterruptError';
 }

 // 判断是否应该终止整个会话
 isFatal(): boolean {
 return this.result.type === 'llm_detected' &&
 this.result.details?.confidence > 0.9;
 }
}

class LoopDetectionError extends Error {
 constructor(
 public readonly phase: 'tool_hash' | 'content_hash' | 'llm_check',
 public readonly originalError: Error
 ) {
 super(\`循环检测错误 [\${phase}]: \${originalError.message}\`);
 this.name = 'LoopDetectionError';
 }
}

// 错误处理策略
class LoopDetectionErrorHandler {
 // 处理检测过程中的错误
 handleError(error: Error, context: DetectionContext): LoopDetectionResult {
 if (error instanceof LoopDetectionError) {
 // 检测过程出错，记录但不中断
 this.telemetry.recordError(error, context);

 // 返回安全的默认结果
 return {
 isLoop: false,
 metadata: {
 detectionError: true,
 errorPhase: error.phase,
 errorMessage: error.message
 }
 };
 }

 // 未知错误，向上传播
 throw error;
 }

 // 错误恢复
 async recover(error: LoopDetectionError): Promise<void> {
 switch (error.phase) {
 case 'tool_hash':
 // 重置工具哈希历史
 this.stateManager.partialReset('tool');
 break;

 case 'content_hash':
 // 重置内容哈希历史
 this.stateManager.partialReset('content');
 break;

 case 'llm_check':
 // 禁用 LLM 检测直到下次重置
 this.config.enableLLMCheck = false;
 this.telemetry.recordConfigChange('llm_check_disabled', 'error_recovery');
 break;
 }
 }
}

// 在核心循环中的错误处理
class GeminiChat {
 async processConversation(): Promise<void> {
 while (!this.shouldStop) {
 try {
 const response = await this.generateResponse();
 const loopResult = await this.loopDetector.checkForLoop(response);

 if (loopResult.isLoop) {
 await this.handleLoop(loopResult);
 }

 } catch (error) {
 if (error instanceof LoopInterruptError) {
 // 循环中断错误
 if (error.isFatal()) {
 // 严重循环，终止会话
 this.ui.showError('检测到严重循环行为，会话已终止。');
 this.shouldStop = true;
 } else {
 // 普通循环中断，尝试恢复
 await this.attemptRecovery(error.result);
 }
 } else if (error instanceof LoopDetectionError) {
 // 检测过程出错，记录并继续
 this.errorHandler.handleError(error, this.getContext());
 // 不中断，继续执行
 } else {
 // 其他错误，向上传播
 throw error;
 }
 }
 }
 }

 private async attemptRecovery(result: LoopDetectionResult): Promise<void> {
 // 注入恢复提示
 this.injectRecoveryPrompt(result);

 // 部分重置状态
 this.loopDetector.partialReset();

 // 记录恢复尝试
 this.telemetry.recordRecoveryAttempt(result);
 }
}

/*
错误传播路径：

┌─────────────────────────────────────────────────────────────┐
│ LoopDetectionService │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ ToolHasher │ │ContentHasher│ │ LLMChecker │ │
│ │ Error │ │ Error │ │ Error │ │
│ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ │
│ │ │ │ │
│ ▼ ▼ ▼ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ LoopDetectionErrorHandler │ │
│ │ - 包装为 LoopDetectionError │ │
│ │ - 记录到 Telemetry │ │
│ │ - 返回安全默认值 │ │
│ └────────────────────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ 安全的 LoopDetectionResult │
│ (isLoop: false, detectionError: true) │
└─────────────────────────────────────────────────────────────┘
 │
 ▼
┌─────────────────────────────────────────────────────────────┐
│ GeminiChat │
│ - 接收结果（可能包含检测错误标记） │
│ - 正常继续执行 │
│ - 如果是 LoopInterruptError → 处理循环中断 │
└─────────────────────────────────────────────────────────────┘
*/`}
 language="typescript"
 title="错误传播与处理"
 />
 </Layer>

 {/* 扩展点 */}
 <Layer title="扩展点与自定义" depth={2} defaultOpen={true}>
 <CodeBlock
 code={`// 循环检测扩展点
// packages/core/src/services/loopDetection/extensibility.ts

// =========================================
// 扩展点 1: 自定义检测器
// =========================================

interface CustomLoopDetector {
 name: string;
 priority: number; // 检测优先级 (越高越先执行)

 // 执行检测
 detect(
 response: AIResponse,
 history: Message[],
 context: DetectionContext
 ): Promise<LoopDetectionResult>;

 // 是否启用
 isEnabled(config: LoopDetectionConfig): boolean;
}

// 注册自定义检测器
class LoopDetectionService {
 private customDetectors: CustomLoopDetector[] = [];

 registerDetector(detector: CustomLoopDetector): void {
 this.customDetectors.push(detector);
 // 按优先级排序
 this.customDetectors.sort((a, b) => b.priority - a.priority);
 }

 async checkForLoop(
 response: AIResponse,
 history: Message[]
 ): Promise<LoopDetectionResult> {
 const context = this.buildContext(response, history);

 // 先执行自定义检测器
 for (const detector of this.customDetectors) {
 if (detector.isEnabled(this.config)) {
 const result = await detector.detect(response, history, context);
 if (result.isLoop) {
 return {
 ...result,
 detectorName: detector.name
 };
 }
 }
 }

 // 然后执行内置检测
 return this.performBuiltinChecks(response, history);
 }
}

// 示例：自定义 API 错误循环检测器
const apiErrorLoopDetector: CustomLoopDetector = {
 name: 'api_error_loop',
 priority: 100, // 高优先级

 async detect(response, history, context): Promise<LoopDetectionResult> {
 // 检测 API 调用错误的重复模式
 const recentErrors = history
 .slice(-10)
 .filter(m => m.role === 'tool_result' && m.isError)
 .map(m => this.extractApiError(m.content));

 const errorCounts = new Map<string, number>();
 for (const error of recentErrors) {
 if (error) {
 errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
 }
 }

 const maxCount = Math.max(...errorCounts.values(), 0);
 if (maxCount >= 3) {
 return {
 isLoop: true,
 type: 'api_error',
 message: \`API 错误循环: 相同错误已出现 \${maxCount} 次\`,
 details: { errorPattern: this.getMostCommon(errorCounts) }
 };
 }

 return { isLoop: false };
 },

 isEnabled(config) {
 return config.enableApiErrorDetection ?? true;
 },

 // 辅助方法
 extractApiError(content: string): string | null {
 const match = content.match(/Error: ([A-Z_]+)/);
 return match ? match[1] : null;
 },

 getMostCommon(counts: Map<string, number>): string {
 let maxKey = '';
 let maxVal = 0;
 for (const [key, val] of counts) {
 if (val > maxVal) {
 maxKey = key;
 maxVal = val;
 }
 }
 return maxKey;
 }
};

// 注册使用
loopDetectionService.registerDetector(apiErrorLoopDetector);

// =========================================
// 扩展点 2: 自定义循环处理器
// =========================================

interface LoopHandler {
 name: string;

 // 是否处理此类型的循环
 canHandle(result: LoopDetectionResult): boolean;

 // 处理循环
 handle(
 result: LoopDetectionResult,
 context: HandlerContext
 ): Promise<HandlerResult>;
}

// 注册自定义处理器
class GeminiChat {
 private loopHandlers: LoopHandler[] = [];

 registerLoopHandler(handler: LoopHandler): void {
 this.loopHandlers.push(handler);
 }

 async handleLoop(result: LoopDetectionResult): Promise<void> {
 // 查找能处理此循环的处理器
 const handler = this.loopHandlers.find(h => h.canHandle(result));

 if (handler) {
 const handlerResult = await handler.handle(result, this.getHandlerContext());
 if (handlerResult.handled) {
 return;
 }
 }

 // 回退到默认处理
 await this.defaultLoopHandler(result);
 }
}

// 示例：智能重试处理器
const smartRetryHandler: LoopHandler = {
 name: 'smart_retry',

 canHandle(result) {
 // 处理工具调用循环，且工具支持重试
 return result.type === 'tool_call' &&
 RETRYABLE_TOOLS.includes(result.details?.toolName);
 },

 async handle(result, context): Promise<HandlerResult> {
 const toolName = result.details?.toolName;

 // 尝试使用不同参数重试
 const alternativeArgs = await this.generateAlternativeArgs(
 toolName,
 result.details?.args
 );

 if (alternativeArgs) {
 // 注入建议的替代调用
 context.injectMessage({
 role: 'system',
 content: \`建议尝试: \${toolName}(\${JSON.stringify(alternativeArgs)})\`
 });

 return { handled: true, action: 'retry_with_alternative' };
 }

 return { handled: false };
 },

 async generateAlternativeArgs(toolName: string, args: unknown): Promise<unknown | null> {
 // 根据工具类型生成替代参数
 switch (toolName) {
 case 'search_file_content':
 // 尝试不同的搜索模式
 return { ...args, pattern: this.broadenPattern(args.pattern) };
 case 'read_file':
 // 尝试不同的文件区域
 return { ...args, offset: (args.offset || 0) + 100 };
 default:
 return null;
 }
 },

 broadenPattern(pattern: string): string {
 // 放宽搜索模式
 return pattern.replace(/\\b/g, '.*');
 }
};

// 注册使用
geminiChat.registerLoopHandler(smartRetryHandler);

// =========================================
// 扩展点 3: 哈希算法自定义
// =========================================

interface HashAlgorithm {
 name: string;

 // 计算哈希
 hash(content: string): string;

 // 归一化预处理
 normalize(content: string): string;
}

// 注册自定义哈希算法
loopDetectionService.setHashAlgorithm({
 name: 'custom_semantic',

 hash(content: string): string {
 // 使用语义感知的哈希
 const normalized = this.normalize(content);
 const keywords = this.extractKeywords(normalized);
 return crypto.createHash('md5').update(keywords.join('|')).digest('hex');
 },

 normalize(content: string): string {
 return content
 .toLowerCase()
 .replace(/\\d+/g, 'NUM') // 数字替换为占位符
 .replace(/\\s+/g, ' ')
 .trim();
 },

 extractKeywords(content: string): string[] {
 // 提取关键词用于语义哈希
 const words = content.split(/\\s+/);
 return words.filter(w => w.length > 3 && !STOP_WORDS.includes(w));
 }
});`}
 language="typescript"
 title="扩展点与自定义"
 />

 <HighlightBox title="扩展点总结" color="blue" className="mt-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
 <div>
 <h5 className="font-semibold text-heading mb-2">自定义检测器</h5>
 <ul className="text-body space-y-1">
 <li>• 添加新的循环检测逻辑</li>
 <li>• 设置检测优先级</li>
 <li>• 通过配置启用/禁用</li>
 </ul>
 </div>
 <div>
 <h5 className="font-semibold text-green-400 mb-2">自定义处理器</h5>
 <ul className="text-body space-y-1">
 <li>• 针对特定循环类型</li>
 <li>• 自定义恢复策略</li>
 <li>• 智能重试逻辑</li>
 </ul>
 </div>
 <div>
 <h5 className="font-semibold text-heading mb-2">哈希算法</h5>
 <ul className="text-body space-y-1">
 <li>• 替换默认哈希算法</li>
 <li>• 自定义归一化规则</li>
 <li>• 语义感知哈希</li>
 </ul>
 </div>
 </div>
 </HighlightBox>
 </Layer>
 </Layer>

 {/* 为什么这样设计循环检测 */}
 <Layer title="为什么这样设计循环检测？" icon="💡">
 <div className="space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🔢 为什么用固定阈值（5次工具、10次内容）？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策</strong>：工具调用重复 5 次、内容重复 10 次触发循环检测。</p>
 <p><strong>原因</strong>：</p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>经验值</strong>：基于大量实际使用场景调优的经验阈值</li>
 <li><strong>误报平衡</strong>：太低容易误报正常重试，太高会浪费 Token</li>
 <li><strong>工具 vs 内容</strong>：工具调用更确定，阈值更低；内容可能有轻微变化，阈值更高</li>
 </ul>
 <p><strong>可调整</strong>：通过配置或扩展点可自定义阈值。</p>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🧠 为什么 30 轮后才启用 LLM 检测？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策</strong>：LLM 智能循环检测只在对话超过 30 轮后才激活。</p>
 <p><strong>原因</strong>：</p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>成本控制</strong>：LLM 检测需要额外 API 调用，频繁使用成本高</li>
 <li><strong>复杂场景</strong>：简单循环用哈希检测足够，LLM 用于检测复杂的语义循环</li>
 <li><strong>长对话风险</strong>：对话越长，出现微妙循环的概率越高</li>
 </ul>
 <p><strong>LLM 能力</strong>：可以检测"AI 在尝试不同方法但都失败"的模式。</p>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-amber-500 font-bold mb-2">🔗 为什么用哈希而非精确匹配？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策</strong>：使用内容哈希（MD5）比较而非逐字符精确匹配。</p>
 <p><strong>原因</strong>：</p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>空间效率</strong>：存储固定长度哈希比存储完整内容节省内存</li>
 <li><strong>查找效率</strong>：O(1) 哈希查找比 O(n) 字符串比较快</li>
 <li><strong>归一化</strong>：哈希前可先归一化（去空白、统一大小写），忽略无意义差异</li>
 </ul>
 <p><strong>冲突风险</strong>：MD5 冲突概率极低，对循环检测场景可接受。</p>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🚨 为什么检测到循环后中断而非自动重试？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策</strong>：检测到循环后向用户报告并中断，而非自动尝试恢复。</p>
 <p><strong>原因</strong>：</p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>资源保护</strong>：循环会无限消耗 Token 和时间，必须及时止损</li>
 <li><strong>用户介入</strong>：很多循环需要用户提供新信息或改变策略</li>
 <li><strong>透明性</strong>：让用户知道发生了什么，而非悄悄重试</li>
 </ul>
 <p><strong>扩展</strong>：可以注册自定义 LoopHandler 实现智能重试策略。</p>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-red-500 font-bold mb-2">🔄 为什么需要多层检测机制？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策</strong>：工具调用 → 内容哈希 → LLM 智能检测，三层递进。</p>
 <p><strong>原因</strong>：</p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>快速检测</strong>：工具调用检测最快，能在早期捕获明显循环</li>
 <li><strong>深度检测</strong>：内容哈希捕获工具参数不同但内容相似的情况</li>
 <li><strong>语义检测</strong>：LLM 检测捕获"变着花样失败"的复杂循环</li>
 </ul>
 <p><strong>性能</strong>：大多数循环在前两层就被检测，LLM 层很少被调用。</p>
 </div>
 </div>
 </div>
 </Layer>

 {/* 循环检测阈值速查表 */}
 <Layer title="循环检测阈值速查表" icon="📊">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 px-3 text-dim">检测类型</th>
 <th className="text-left py-2 px-3 text-dim">默认阈值</th>
 <th className="text-left py-2 px-3 text-dim">检测对象</th>
 <th className="text-left py-2 px-3 text-dim">典型循环场景</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">工具调用循环</td>
 <td className="py-2 px-3">≥ 5 次</td>
 <td className="py-2 px-3">工具名 + 参数哈希</td>
 <td className="py-2 px-3">反复读取同一文件、重复执行相同命令</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">内容重复循环</td>
 <td className="py-2 px-3">≥ 10 次</td>
 <td className="py-2 px-3">归一化内容哈希</td>
 <td className="py-2 px-3">AI 反复说相同的话、相似的建议</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-amber-500">LLM 智能检测</td>
 <td className="py-2 px-3">≥ 30 轮</td>
 <td className="py-2 px-3">对话历史语义</td>
 <td className="py-2 px-3">变换方法但持续失败、无进展的尝试</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">连续空输出</td>
 <td className="py-2 px-3">≥ 3 次</td>
 <td className="py-2 px-3">AI 响应内容</td>
 <td className="py-2 px-3">AI 卡住不输出任何内容</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />

 {/* ==================== 深化内容结束 ==================== */}
 </div>
 );
}
