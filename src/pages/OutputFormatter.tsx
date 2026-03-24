import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
 { id: 'non-interactive', label: '非交互模式', description: 'CLI 管道模式' },
 { id: 'telemetry', label: '遥测系统', description: '指标收集' },
 { id: 'error', label: '错误处理', description: '错误格式化' },
 { id: 'content-gen', label: 'API 调用层', description: '响应生成' },
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
 非交互模式的 JSON 输出格式化器，支持结构化响应、会话指标和错误信息输出
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">2</div>
 <div className="text-xs text-dim">输出格式</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">3</div>
 <div className="text-xs text-dim">输出字段</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">JSON</div>
 <div className="text-xs text-dim">结构化格式</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">📊</div>
 <div className="text-xs text-dim">包含指标</div>
 </div>
 </div>

 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">输出模式</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 TEXT 模式
 </span>
 <span className="text-dim">→ 纯文本响应</span>
 <span className="text-dim mx-2">|</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 JSON 模式
 </span>
 <span className="text-dim">→ 结构化输出</span>
 </div>
 </div>

 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">源码入口:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/core/src/output/json-formatter.ts
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function OutputFormatter() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const outputFlowChart = `flowchart TD
 subgraph Input["会话结果"]
 RESP[AI 响应]
 STATS[SessionMetrics]
 ERR[错误信息]
 end

 subgraph Format["格式选择"]
 MODE{OutputFormat}
 TEXT[TEXT 模式]
 JSON[JSON 模式]
 end

 subgraph Output["输出"]
 PLAIN[纯文本<br/>response only]
 STRUCT[结构化 JSON<br/>response + stats + error]
 end

 RESP --> MODE
 STATS --> MODE
 ERR --> MODE

 MODE -->|text| TEXT
 MODE -->|json| JSON

 TEXT --> PLAIN
 JSON --> STRUCT

 style TEXT stroke:#00d4ff
 style JSON stroke:#00ff88
 style STRUCT stroke:#a855f7`;

 const typesCode = `import type { SessionMetrics } from '../telemetry/uiTelemetry.js';

// 输出格式枚举
export enum OutputFormat {
  TEXT = 'text', // 纯文本模式
  JSON = 'json', // JSON 结构化模式
}

// JSON 错误结构
export interface JsonError {
  type: string; // 错误类型
  message: string; // 错误消息
  code?: string | number; // 错误代码
}

// JSON 输出结构
export interface JsonOutput {
  response?: string; // AI 响应文本
  stats?: SessionMetrics; // 会话指标统计
  error?: JsonError; // 错误信息（如有）
}`;

 const sessionMetricsCode = `// SessionMetrics 会话指标（来自 telemetry）
interface SessionMetrics {
  // 时间指标
  totalDuration: number; // 总耗时 (ms)
  firstTokenLatency: number; // 首 Token 延迟 (ms)

  // Token 统计
  inputTokens: number; // 输入 Token 数
  outputTokens: number; // 输出 Token 数
  totalTokens: number; // 总 Token 数

  // 调用统计
  turnCount: number; // 对话轮次
  toolCalls: number; // 工具调用次数

  // 模型信息
  model: string; // 使用的模型

  // 成本估算（如可用）
  estimatedCost?: number; // 估算成本
}`;

 const jsonFormatterCode = `// json-formatter.ts 核心逻辑
import { OutputFormat, type JsonOutput, type JsonError } from './types.js';

export function formatOutput(
  format: OutputFormat,
  response: string | undefined,
  stats: SessionMetrics | undefined,
  error: JsonError | undefined,
): string {
  // TEXT 模式：仅输出响应文本
  if (format === OutputFormat.TEXT) {
  if (error) {
  return \`Error: \${error.message}\`;
  }
  return response ?? '';
  }

  // JSON 模式：结构化输出
  const output: JsonOutput = {};

  if (response) {
  output.response = response;
  }

  if (stats) {
  output.stats = stats;
  }

  if (error) {
  output.error = error;
  }

  return JSON.stringify(output, null, 2);
}

// 快捷方法
export function formatJsonResponse(response: string, stats?: SessionMetrics): string {
  return formatOutput(OutputFormat.JSON, response, stats, undefined);
}

export function formatJsonError(error: JsonError): string {
  return formatOutput(OutputFormat.JSON, undefined, undefined, error);
}`;

 const usageExampleCode = `// 非交互模式使用示例
import { formatOutput, OutputFormat } from './output/json-formatter.js';

// 处理成功响应
const result = await runNonInteractiveSession(prompt);

const output = formatOutput(
  OutputFormat.JSON,
  result.response,
  result.metrics,
  undefined
);

console.log(output);
// 输出:
// {
// "response": "这是 AI 的回复...",
// "stats": {
// "totalDuration": 2500,
// "inputTokens": 150,
// "outputTokens": 200,
// "model": "gemini-2.0-flash"
// }
// }

// 处理错误
const errorOutput = formatOutput(
  OutputFormat.JSON,
  undefined,
  undefined,
  {
  type: 'QuotaExceeded',
  message: 'API quota exceeded',
  code: 429
  }
);

console.log(errorOutput);
// 输出:
// {
// "error": {
// "type": "QuotaExceeded",
// "message": "API quota exceeded",
// "code": 429
// }
// }`;

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-3xl font-bold text-heading mb-2">Output Formatter 输出格式化器</h1>
 <p className="text-body text-lg">
 非交互模式的 JSON 输出格式化器，支持结构化响应、会话指标和错误信息
 </p>
 </div>

 <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

 <Layer title="格式化流程" defaultOpen={true}>
 <HighlightBox title="输出格式选择流程" color="blue" className="mb-6">
 <MermaidDiagram chart={outputFlowChart} />
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">TEXT 模式</div>
 <ul className="text-sm text-body space-y-1">
 <li>仅输出 AI 响应文本</li>
 <li>适合管道和脚本</li>
 <li>错误时输出 "Error: message"</li>
 <li>无额外元数据</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">JSON 模式</div>
 <ul className="text-sm text-body space-y-1">
 <li>结构化 JSON 输出</li>
 <li>包含响应 + 指标 + 错误</li>
 <li>适合程序解析</li>
 <li>完整会话元数据</li>
 </ul>
 </div>
 </div>
 </Layer>

 <Layer title="类型定义" defaultOpen={true}>
 <CodeBlock code={typesCode} language="typescript" title="output/types.ts" />
 </Layer>

 <Layer title="SessionMetrics 指标" defaultOpen={true}>
 <CodeBlock code={sessionMetricsCode} language="typescript" title="会话指标结构" />

 <div className="mt-4 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-dim">字段</th>
 <th className="text-left py-2 text-dim">类型</th>
 <th className="text-left py-2 text-dim">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/30">
 <td className="py-2"><code>totalDuration</code></td>
 <td>number</td>
 <td>会话总耗时 (ms)</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>firstTokenLatency</code></td>
 <td>number</td>
 <td>首 Token 延迟 (ms)</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>inputTokens</code></td>
 <td>number</td>
 <td>输入 Token 数</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>outputTokens</code></td>
 <td>number</td>
 <td>输出 Token 数</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>toolCalls</code></td>
 <td>number</td>
 <td>工具调用次数</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>model</code></td>
 <td>string</td>
 <td>使用的模型名称</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>

 <Layer title="格式化实现" defaultOpen={false}>
 <CodeBlock code={jsonFormatterCode} language="typescript" title="json-formatter.ts" />
 </Layer>

 <Layer title="使用示例" defaultOpen={false}>
 <CodeBlock code={usageExampleCode} language="typescript" title="非交互模式使用" />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="成功响应 JSON" color="green">
 <CodeBlock
 code={`{
 "response": "AI 响应内容...",
 "stats": {
 "totalDuration": 2500,
 "inputTokens": 150,
 "outputTokens": 200,
 "model": "gemini-2.0-flash"
 }
}`}
 language="json"
 />
 </HighlightBox>
 <HighlightBox title="错误响应 JSON" color="orange">
 <CodeBlock
 code={`{
 "error": {
 "type": "QuotaExceeded",
 "message": "API quota exceeded",
 "code": 429
 }
}`}
 language="json"
 />
 </HighlightBox>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
