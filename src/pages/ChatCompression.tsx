import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



const relatedPages: RelatedPage[] = [
 { id: 'summarizer-system', label: '摘要系统', description: '上下文压缩' },
 { id: 'context-system', label: 'Context 系统', description: '上下文管理' },
 { id: 'token-management', label: 'Token 管理', description: 'Token 计算' },
 { id: 'core-architecture', label: '核心架构', description: '系统设计' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-xl border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
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
 聊天历史压缩服务，当 Token 超过阈值时自动压缩早期对话，保留最近内容和系统摘要
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">50%</div>
 <div className="text-xs text-dim">压缩触发阈值</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">30%</div>
 <div className="text-xs text-dim">保留比例</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">LLM</div>
 <div className="text-xs text-dim">智能摘要</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">Auto</div>
 <div className="text-xs text-dim">自动触发</div>
 </div>
 </div>

 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">压缩策略</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Token 阈值检测
 </span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 分割点计算
 </span>
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 LLM 摘要生成
 </span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 历史重组
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">源码位置:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/core/src/services/chatCompressionService.ts
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function ChatCompression() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const compressionFlowChart = `flowchart TD
 subgraph Input["输入检测"]
 HISTORY[Chat History]
 TOKEN[Token 计算]
 CHECK{"超过 50% 阈值?"}
 end

 subgraph Split["分割计算"]
 FIND[findCompressSplitPoint]
 CALC[计算保留 30%]
 POINT[确定分割点]
 end

 subgraph Compress["压缩处理"]
 EXTRACT[提取待压缩部分]
 SUMMARY[LLM 生成摘要]
 MERGE[合并摘要+保留部分]
 end

 subgraph Output["输出结果"]
 NEW[新 History]
 STATUS[CompressionStatus]
 INFO[CompressionInfo]
 end

 HISTORY --> TOKEN
 TOKEN --> CHECK
 CHECK -->|No| STATUS
 CHECK -->|Yes| FIND
 FIND --> CALC
 CALC --> POINT
 POINT --> EXTRACT
 EXTRACT --> SUMMARY
 SUMMARY --> MERGE
 MERGE --> NEW
 NEW --> INFO

 style Input stroke:#00d4ff
 style Split stroke:#00ff88
 style Compress stroke:${getThemeColor("--color-warning", "#b45309")}
 style Output stroke:#a855f7`;

 const thresholdDiagram = `flowchart LR
 subgraph Thresholds["Token 阈值"]
 TOTAL["总 Token 限制<br/>MAX_TOKENS"]
 TRIGGER["触发阈值 50%<br/>COMPRESSION_TOKEN_THRESHOLD"]
 PRESERVE["保留比例 30%<br/>COMPRESSION_PRESERVE_THRESHOLD"]
 end

 subgraph Example["示例: 128K Token"]
 E_TOTAL["128,000 总量"]
 E_TRIGGER["64,000 触发压缩"]
 E_PRESERVE["38,400 保留"]
 end

 TOTAL --> E_TOTAL
 TRIGGER --> E_TRIGGER
 PRESERVE --> E_PRESERVE

 style Thresholds stroke:#00d4ff
 style Example stroke:#00ff88`;

 const constantsCode = `// 压缩阈值常量
export const COMPRESSION_TOKEN_THRESHOLD = 0.5; // 超过 50% 触发压缩
export const COMPRESSION_PRESERVE_THRESHOLD = 0.3; // 保留最近 30%

// 压缩状态枚举
export enum CompressionStatus {
  NOOP = 'noop', // 无需压缩
  COMPRESSED = 'compressed', // 压缩成功
  COMPRESSION_FAILED_EMPTY_SUMMARY = 'compression_failed_empty_summary',
  COMPRESSION_FAILED_EXCEEDED_TOKEN_BUDGET = 'compression_failed_exceeded_token_budget',
  COMPRESSION_FAILED_EXCEPTION = 'compression_failed_exception',
}

// 压缩信息接口
export interface ChatCompressionInfo {
  status: CompressionStatus;
  compressedTokens?: number; // 被压缩的 Token 数
  preservedTokens?: number; // 保留的 Token 数
  summaryTokens?: number; // 摘要 Token 数
  totalTokensBefore?: number; // 压缩前总 Token
  totalTokensAfter?: number; // 压缩后总 Token
}`;

 const splitPointCode = `// 计算分割点 - 找到保留 fraction 比例的位置
export function findCompressSplitPoint(
  contents: Content[],
  fraction: number
): number {
  // 计算总 Token 数
  const totalTokens = contents.reduce((sum, c) => sum + countTokens(c), 0);
  const targetPreserve = totalTokens * fraction;

  // 从后向前累计，找到保留边界
  let preservedTokens = 0;
  let splitIndex = contents.length;

  for (let i = contents.length - 1; i >= 0; i--) {
  const tokens = countTokens(contents[i]);
  preservedTokens += tokens;

  if (preservedTokens >= targetPreserve) {
  splitIndex = i;
  break;
  }
  }

  // 确保至少压缩一条消息
  return Math.max(1, splitIndex);
}

// 示例：10 条消息，保留 30%
// [msg1, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10]
// ↑ 分割点 ↑ 保留
// [压缩区: msg1-msg7] → 摘要 + [保留区: msg8-msg10]`;

 const serviceCode = `// ChatCompressionService 核心类
export class ChatCompressionService {
  private summarizer: Summarizer;
  private tokenCounter: TokenCounter;

  constructor(deps: ChatCompressionServiceDeps) {
  this.summarizer = deps.summarizer;
  this.tokenCounter = deps.tokenCounter;
  }

  async compress(
  chat: Chat,
  promptId: string,
  force: boolean,
  model: ModelConfig,
  config: CompressionConfig,
  hasFailedCompressionAttempt: boolean
  ): Promise<{
  newHistory: Content[] | null;
  info: ChatCompressionInfo;
  }> {
  const contents = chat.getHistory();
  const totalTokens = this.tokenCounter.countAll(contents);
  const maxTokens = model.maxTokens || 128000;

  // 检查是否需要压缩
  if (!force && totalTokens < maxTokens * COMPRESSION_TOKEN_THRESHOLD) {
  return {
  newHistory: null,
  info: { status: CompressionStatus.NOOP }
  };
  }

  // 计算分割点
  const splitPoint = findCompressSplitPoint(
  contents,
  COMPRESSION_PRESERVE_THRESHOLD
  );

  // 提取待压缩和保留部分
  const toCompress = contents.slice(0, splitPoint);
  const toPreserve = contents.slice(splitPoint);

  // 生成摘要
  const summary = await this.summarizer.summarize(toCompress, {
  maxTokens: config.summaryMaxTokens,
  model: config.summaryModel,
  });

  if (!summary || summary.trim() === '') {
  return {
  newHistory: null,
  info: { status: CompressionStatus.COMPRESSION_FAILED_EMPTY_SUMMARY }
  };
  }

  // 构建新历史
  const summaryContent: Content = {
  role: 'user',
  parts: [{ text: \`[Previous conversation summary]\\n\${summary}\` }]
  };

  const newHistory = [summaryContent, ...toPreserve];

  return {
  newHistory,
  info: {
  status: CompressionStatus.COMPRESSED,
  compressedTokens: this.tokenCounter.countAll(toCompress),
  preservedTokens: this.tokenCounter.countAll(toPreserve),
  summaryTokens: this.tokenCounter.count(summary),
  totalTokensBefore: totalTokens,
  totalTokensAfter: this.tokenCounter.countAll(newHistory),
  }
  };
  }
}`;

 const summaryPromptCode = `// 摘要生成 Prompt
const SUMMARY_SYSTEM_PROMPT = \`You are a conversation summarizer.
Your task is to create a concise summary of the conversation history.

Guidelines:
1. Focus on key decisions, code changes, and important context
2. Preserve file paths, function names, and technical details
3. Maintain chronological order of events
4. Keep the summary under the specified token limit
5. Use bullet points for clarity

Format:
- Start with "Conversation Summary:"
- List key points in chronological order
- End with "Current State:" describing the final context
\`;

// 摘要请求
async function generateSummary(
  history: Content[],
  maxTokens: number
): Promise<string> {
  const response = await model.generateContent({
  contents: history,
  systemInstruction: SUMMARY_SYSTEM_PROMPT,
  generationConfig: {
  maxOutputTokens: maxTokens,
  temperature: 0.3, // 低温度确保一致性
  }
  });

  return response.text;
}`;

 const integrationCode = `// 在主循环中集成压缩服务
async function runConversationLoop(chat: Chat) {
  const compressionService = new ChatCompressionService({
  summarizer: new LLMSummarizer(model),
  tokenCounter: new TikTokenCounter(),
  });

  while (true) {
  // 用户输入
  const userMessage = await getUserInput();

  // 检查并压缩历史（在发送前）
  const { newHistory, info } = await compressionService.compress(
  chat,
  promptId,
  false, // 非强制
  modelConfig,
  compressionConfig,
  hasFailedAttempt
  );

  if (info.status === CompressionStatus.COMPRESSED) {
  console.log(\`Compressed: \${info.compressedTokens} → \${info.summaryTokens} tokens\`);
  chat.setHistory(newHistory!);
  }

  // 发送消息并获取响应
  const response = await chat.sendMessage(userMessage);
  displayResponse(response);
  }
}`;

 const statusTableData = [
 { status: 'NOOP', description: 'Token 未超阈值，无需压缩', action: '继续正常对话' },
 { status: 'COMPRESSED', description: '压缩成功', action: '使用新历史继续' },
 { status: 'COMPRESSION_FAILED_EMPTY_SUMMARY', description: '摘要生成失败（空结果）', action: '保留原历史，标记失败' },
 { status: 'COMPRESSION_FAILED_EXCEEDED_TOKEN_BUDGET', description: '摘要超出 Token 预算', action: '重试或降级处理' },
 { status: 'COMPRESSION_FAILED_EXCEPTION', description: '压缩过程异常', action: '记录错误，保留原历史' },
 ];

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-3xl font-bold text-heading mb-2">ChatCompression 聊天压缩</h1>
 <p className="text-body text-lg">
 聊天历史自动压缩服务，通过 LLM 摘要保持上下文窗口在限制内
 </p>
 </div>

 <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

 <Layer title="压缩流程" defaultOpen={true}>
 <HighlightBox title="ChatCompression 工作流程" color="blue" className="mb-6">
 <MermaidDiagram chart={compressionFlowChart} />
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">1️⃣ 检测阶段</div>
 <ul className="text-sm text-body space-y-1">
 <li>计算当前历史 Token 数</li>
 <li>与 50% 阈值比较</li>
 <li>决定是否需要压缩</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">2️⃣ 分割阶段</div>
 <ul className="text-sm text-body space-y-1">
 <li>从后向前计算 Token</li>
 <li>找到保留 30% 的分割点</li>
 <li>确保至少压缩 1 条</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border-l-2 border-l-edge-hover/30">
 <div className="text-heading font-bold mb-2">3️⃣ 压缩阶段</div>
 <ul className="text-sm text-body space-y-1">
 <li>LLM 生成摘要</li>
 <li>合并摘要+保留部分</li>
 <li>返回压缩后历史</li>
 </ul>
 </div>
 </div>
 </Layer>

 <Layer title="阈值配置" defaultOpen={true}>
 <MermaidDiagram chart={thresholdDiagram} />

 <div className="mt-6">
 <CodeBlock code={constantsCode} language="typescript" title="压缩常量与类型" />
 </div>

 <div className="mt-4 bg-base p-4 rounded-lg">
 <h4 className="text-heading font-bold mb-2">阈值计算示例</h4>
 <div className="text-sm text-body space-y-2">
 <p>假设模型上下文窗口为 <strong>128,000 tokens</strong>：</p>
 <ul className="list-disc list-inside space-y-1 ml-2">
 <li><strong>触发阈值</strong>：128,000 × 0.5 = 64,000 tokens</li>
 <li><strong>保留目标</strong>：128,000 × 0.3 = 38,400 tokens</li>
 <li><strong>压缩目标</strong>：64,000 - 38,400 = 25,600 tokens → 摘要</li>
 </ul>
 </div>
 </div>
 </Layer>

 <Layer title="分割点算法" defaultOpen={true}>
 <CodeBlock code={splitPointCode} language="typescript" title="findCompressSplitPoint" />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="算法特点" color="green">
 <ul className="text-sm text-body space-y-1">
 <li><strong>从后向前</strong>计算，保留最新内容</li>
 <li>按 <strong>Token 数量</strong>而非消息数量</li>
 <li>保证至少压缩 <strong>1 条消息</strong></li>
 <li>支持不同长度的消息</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="边界情况" color="orange">
 <ul className="text-sm text-body space-y-1">
 <li>只有 1 条消息：返回 1（压缩它）</li>
 <li>保留比例 = 0：压缩全部</li>
 <li>保留比例 = 1：不压缩</li>
 <li>单条超长消息：单独处理</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 <Layer title="压缩服务" defaultOpen={false}>
 <CodeBlock code={serviceCode} language="typescript" title="ChatCompressionService" />
 </Layer>

 <Layer title="摘要生成" defaultOpen={false}>
 <CodeBlock code={summaryPromptCode} language="typescript" title="摘要 Prompt 设计" />

 <div className="mt-4 bg-surface p-4 rounded-lg border border-edge/30">
 <h4 className="text-heading font-bold mb-2">摘要质量保证</h4>
 <ul className="text-sm text-body space-y-1">
 <li>低温度 (0.3) 确保一致性</li>
 <li>保留技术细节（文件路径、函数名）</li>
 <li>按时间顺序组织关键点</li>
 <li>明确当前状态便于后续对话</li>
 </ul>
 </div>
 </Layer>

 <Layer title="状态处理" defaultOpen={false}>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-dim">状态</th>
 <th className="text-left py-2 text-dim">描述</th>
 <th className="text-left py-2 text-dim">处理方式</th>
 </tr>
 </thead>
 <tbody className="text-body">
 {statusTableData.map((row, idx) => (
 <tr key={idx} className="border- border-edge/30">
 <td className="py-2"><code className="text-heading">{row.status}</code></td>
 <td className="py-2">{row.description}</td>
 <td className="py-2">{row.action}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Layer>

 <Layer title="集成使用" defaultOpen={false}>
 <CodeBlock code={integrationCode} language="typescript" title="在对话循环中集成" />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="触发时机" color="blue">
 <ul className="text-sm text-body space-y-1">
 <li>每次发送消息前检查</li>
 <li>可通过 <code>force</code> 参数强制压缩</li>
 <li>失败后标记避免重复尝试</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="性能考虑" color="green">
 <ul className="text-sm text-body space-y-1">
 <li>压缩会产生额外 LLM 调用</li>
 <li>Token 预估使用 ASCII/CJK 启发式 + countTokens（媒体）</li>
 <li>摘要模型可配置为更快的模型</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 <Layer title="最佳实践" defaultOpen={false}>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <h4 className="text-heading font-bold mb-2">推荐做法</h4>
 <ul className="text-sm text-body space-y-1">
 <li>在发送消息前而非后压缩</li>
 <li>为摘要使用专用的快速模型</li>
 <li>记录压缩统计用于调试</li>
 <li>保留足够的最近上下文</li>
 <li>处理所有错误状态</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border-l-2 border-l-edge-hover/30">
 <h4 className="text-heading font-bold mb-2">避免做法</h4>
 <ul className="text-sm text-body space-y-1">
 <li>频繁触发压缩（阈值太低）</li>
 <li>忽略压缩失败状态</li>
 <li>使用过高的摘要 Token 限制</li>
 <li>保留比例过低丢失上下文</li>
 <li>在压缩后立即再次压缩</li>
 </ul>
 </div>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
