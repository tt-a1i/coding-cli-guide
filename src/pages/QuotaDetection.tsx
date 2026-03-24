import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



const relatedPages: RelatedPage[] = [
 { id: 'fallback-system', label: 'Fallback 降级', description: '模型降级处理' },
 { id: 'retry', label: '重试回退', description: '重试策略' },
 { id: 'error', label: '错误处理', description: '错误处理基础' },
 { id: 'model-routing', label: '模型路由', description: '模型选择策略' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-xl border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">📊</span>
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
 API 配额错误检测系统，区分 Pro 配额超限、Gemini 配额耗尽和限流错误，决定是否重试或降级
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">4</div>
 <div className="text-xs text-dim">检测函数</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">2</div>
 <div className="text-xs text-dim">提供商支持</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">429</div>
 <div className="text-xs text-dim">限流状态码</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">⚠️</div>
 <div className="text-xs text-dim">ReDoS 安全</div>
 </div>
 </div>

 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">错误分类决策</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 Pro 配额超限
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 触发 Fallback
 </span>
 <span className="text-dim">|</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 限流 429
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 指数退避重试
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">📍 源码入口:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/core/src/utils/quotaErrorDetection.ts
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function QuotaDetection() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const quotaDecisionChart = `flowchart TD
 subgraph Input["错误输入"]
 ERR[API 错误]
 MSG[错误消息]
 CODE[状态码]
 end

 subgraph Detection["检测层"]
 PRO{isProQuotaExceededError}
 GEMINI{isGeminiQuotaExceededError}
 THROT{isGeminiThrottlingError}
 GEN{isGenericQuotaExceededError}
 end

 subgraph Decision["决策"]
 FB[触发 Fallback<br/>Pro → Flash]
 STOP[停止重试<br/>配额耗尽]
 RETRY[指数退避重试<br/>限流可恢复]
 PASS[透传错误]
 end

 ERR --> MSG
 ERR --> CODE
 MSG --> PRO
 MSG --> QWEN
 CODE --> THROT
 MSG --> GEN

 PRO -->|匹配| FB
 QWEN -->|匹配| STOP
 THROT -->|429 + throttling| RETRY
 GEN -->|通用配额| FB
 PRO -->|不匹配| PASS

 style FB stroke:${getThemeColor("--color-warning", "#b45309")}
 style STOP stroke:${getThemeColor("--color-danger", "#b91c1c")}
 style RETRY stroke:#00ff88
 style PASS stroke:#666`;

 const isApiErrorCode = `// 错误类型定义
export interface ApiError {
  error: {
  code: number;
  message: string;
  status: string;
  details: unknown[];
  };
}

export interface StructuredError {
  message: string;
  // ... 其他字段
}

// 类型守卫函数
export function isApiError(error: unknown): error is ApiError {
  return (
  typeof error === 'object' &&
  error !== null &&
  'error' in error &&
  typeof (error as ApiError).error === 'object' &&
  'message' in (error as ApiError).error
  );
}

export function isStructuredError(error: unknown): error is StructuredError {
  return (
  typeof error === 'object' &&
  error !== null &&
  'message' in error &&
  typeof (error as StructuredError).message === 'string'
  );
}`;

 const proQuotaCode = `// Pro 配额超限检测
// 匹配: "Quota exceeded for quota metric 'Gemini 2.5 Pro Requests'"
export function isProQuotaExceededError(error: unknown): boolean {
  // 使用字符串方法而非正则，避免 ReDoS 漏洞
  const checkMessage = (message: string): boolean =>
  message.includes("Quota exceeded for quota metric 'Gemini") &&
  message.includes("Pro Requests'");

  if (typeof error === 'string') {
  return checkMessage(error);
  }

  if (isStructuredError(error)) {
  return checkMessage(error.message);
  }

  if (isApiError(error)) {
  return checkMessage(error.error.message);
  }

  // 检查 Gaxios 错误响应
  if (error && typeof error === 'object' && 'response' in error) {
  const gaxiosError = error as {
  response?: { data?: unknown };
  };
  if (gaxiosError.response?.data) {
  // ... 解析 response.data
  }
  }

  return false;
}`;

 const geminiQuotaCode = `// Gemini 配额耗尽检测（不应重试）
export function isGeminiQuotaExceededError(error: unknown): boolean {
  const checkMessage = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return (
  lowerMessage.includes('insufficient_quota') ||
  lowerMessage.includes('free allocated quota exceeded') ||
  (lowerMessage.includes('quota') && lowerMessage.includes('exceeded'))
  );
  };

  if (typeof error === 'string') return checkMessage(error);
  if (isStructuredError(error)) return checkMessage(error.message);
  if (isApiError(error)) return checkMessage(error.error.message);
  return false;
}

// Gemini 限流检测（应该重试）
export function isGeminiThrottlingError(error: unknown): boolean {
  const checkMessage = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return (
  lowerMessage.includes('throttling') ||
  lowerMessage.includes('requests throttling triggered') ||
  lowerMessage.includes('rate limit') ||
  lowerMessage.includes('too many requests')
  );
  };

  const getStatusCode = (error: unknown): number | undefined => {
  if (error && typeof error === 'object') {
  const errorObj = error as { status?: number; code?: number };
  return errorObj.status || errorObj.code;
  }
  return undefined;
  };

  const statusCode = getStatusCode(error);

  // 必须是 429 + 限流消息
  if (isStructuredError(error)) {
  return statusCode === 429 && checkMessage(error.message);
  }

  if (isApiError(error)) {
  return error.error.code === 429 && checkMessage(error.error.message);
  }

  return false;
}`;

 const genericQuotaCode = `// 通用配额超限检测
export function isGenericQuotaExceededError(error: unknown): boolean {
  const checkMessage = (message: string): boolean =>
  message.includes('Quota exceeded for quota metric');

  if (typeof error === 'string') {
  return checkMessage(error);
  }

  if (isStructuredError(error)) {
  return checkMessage(error.message);
  }

  if (isApiError(error)) {
  return checkMessage(error.error.message);
  }

  return false;
}`;

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-3xl font-bold text-heading mb-2">Quota Detection 配额检测</h1>
 <p className="text-body text-lg">
 API 配额错误检测系统，区分配额超限和限流错误，决定重试或降级策略
 </p>
 </div>

 <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

 <Layer title="决策流程" icon="🔀" defaultOpen={true}>
 <HighlightBox title="配额错误检测与决策" color="blue" className="mb-6">
 <MermaidDiagram chart={quotaDecisionChart} />
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-surface p-4 rounded-lg border-l-2 border-l-edge-hover/30">
 <div className="text-heading font-bold mb-2">⚠️ Pro 配额超限</div>
 <ul className="text-sm text-body space-y-1">
 <li>触发 Fallback 降级</li>
 <li>Pro → Flash 模型</li>
 <li>继续会话不中断</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border-l-2 border-l-edge-hover/30">
 <div className="text-heading font-bold mb-2">🚫 Gemini 配额耗尽</div>
 <ul className="text-sm text-body space-y-1">
 <li>停止重试</li>
 <li>提示用户充值</li>
 <li>无法降级</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">🔄 限流 (429)</div>
 <ul className="text-sm text-body space-y-1">
 <li>可恢复错误</li>
 <li>指数退避重试</li>
 <li>保持当前模型</li>
 </ul>
 </div>
 </div>
 </Layer>

 <Layer title="错误类型守卫" icon="🛡️" defaultOpen={true}>
 <p className="text-body mb-4">
 使用 TypeScript 类型守卫精确识别错误类型：
 </p>

 <CodeBlock code={isApiErrorCode} language="typescript" title="类型定义与守卫" />
 </Layer>

 <Layer title="Pro 配额检测" icon="💎" defaultOpen={true}>
 <CodeBlock code={proQuotaCode} language="typescript" title="isProQuotaExceededError" />

 <HighlightBox title="安全设计" color="purple" className="mt-4">
 <p className="text-sm text-body">
 <strong className="text-heading">ReDoS 防护：</strong>
 使用 <code>String.includes()</code> 而非正则表达式，避免正则表达式拒绝服务攻击
 </p>
 </HighlightBox>
 </Layer>

 <Layer title="Gemini 错误检测" icon="🔮" defaultOpen={true}>
 <CodeBlock code={geminiQuotaCode} language="typescript" title="Gemini 配额与限流检测" />

 <div className="mt-4 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-dim">错误类型</th>
 <th className="text-left py-2 text-dim">关键词</th>
 <th className="text-left py-2 text-dim">状态码</th>
 <th className="text-left py-2 text-dim">处理策略</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/30">
 <td className="py-2 text-heading">配额耗尽</td>
 <td><code>insufficient_quota</code></td>
 <td>不限</td>
 <td>停止重试</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2 text-heading">免费配额用尽</td>
 <td><code>free allocated quota exceeded</code></td>
 <td>不限</td>
 <td>停止重试</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2 text-heading">限流</td>
 <td><code>throttling</code></td>
 <td>429</td>
 <td>重试</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2 text-heading">速率限制</td>
 <td><code>rate limit</code></td>
 <td>429</td>
 <td>重试</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>

 <Layer title="通用配额检测" icon="📈" defaultOpen={false}>
 <CodeBlock code={genericQuotaCode} language="typescript" title="isGenericQuotaExceededError" />

 <div className="mt-4 p-4 bg-base/50 rounded-lg border border-edge">
 <div className="text-sm">
 <strong className="text-heading">💡 使用场景：</strong>
 <ul className="mt-2 text-body space-y-1">
 <li>当 Pro 专用检测未匹配时</li>
 <li>作为通用 Fallback 触发条件</li>
 <li>适用于未来新增的模型类型</li>
 </ul>
 </div>
 </div>
 </Layer>

 <Layer title="集成示例" icon="🔌" defaultOpen={false}>
 <CodeBlock
 code={`// 在 contentGenerator 中的使用
async function handleApiError(error: unknown): Promise<void> {
 // 1. 检查 Pro 配额 → 触发 Fallback
 if (isProQuotaExceededError(error)) {
 await triggerFallback('pro-quota-exceeded');
 return;
 }

 // 2. 检查 Gemini 配额 → 停止重试
 if (isGeminiQuotaExceededError(error)) {
 throw new QuotaExhaustedError('Gemini quota exhausted');
 }

 // 3. 检查限流 → 指数退避重试
 if (isGeminiThrottlingError(error)) {
 await exponentialBackoff(retryCount);
 return retry();
 }

 // 4. 通用配额 → 尝试 Fallback
 if (isGenericQuotaExceededError(error)) {
 await triggerFallback('generic-quota');
 return;
 }

 // 5. 其他错误 → 透传
 throw error;
}`}
 language="typescript"
 title="错误处理集成"
 />
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
