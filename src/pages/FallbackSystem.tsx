import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';




const relatedPages: RelatedPage[] = [
 { id: 'retry', label: '重试回退', description: '错误重试机制' },
 { id: 'error', label: '错误处理', description: '错误处理体系' },
 { id: 'model-routing', label: '模型路由', description: '模型选择策略' },
 { id: 'auth', label: '认证流程', description: '认证与授权' },
 { id: 'multi-provider', label: '多厂商架构', description: '多提供商支持' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-lg border border-edge overflow-hidden">
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
 {/* 一句话总结 */}
 <div className="bg-base/50 rounded-lg p-4 ">
 <p className="text-heading font-medium">
 <span className="text-heading font-bold">一句话：</span>
 模型调用失败时的智能降级机制，自动从 Pro 模型回退到 Flash 模型，保证服务可用性
 </p>
 </div>

 {/* 关键数字 */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">3</div>
 <div className="text-xs text-dim">决策类型</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">2</div>
 <div className="text-xs text-dim">认证类型</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">1</div>
 <div className="text-xs text-dim">回退模型</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">∞</div>
 <div className="text-xs text-dim">会话持续</div>
 </div>
 </div>

 {/* 核心流程 */}
 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">Fallback 决策流程</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 模型调用失败
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 UI Handler 询问
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 激活回退模式
 </span>
 </div>
 </div>

 {/* 源码入口 */}
 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">源码入口:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/core/src/fallback/handler.ts
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function FallbackSystem() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const fallbackFlowChart = `flowchart TD
 fail([模型调用失败])
 handler{"UI Handler<br/>用户决策"}
 retry["retry: 激活回退<br/>继续重试"]
 stop["stop: 激活回退<br/>停止当前请求"]
 auth["auth: 用户重新认证"]
 activate[activateFallbackMode]
 done([完成])

 fail --> handler
 handler -->|retry| retry
 handler -->|stop| stop
 handler -->|auth| auth
 retry --> activate
 stop --> activate
 activate --> done
 auth --> done

 style fail fill:${getThemeColor("--mermaid-danger-fill", "#fee2e2")},color:${getThemeColor("--color-text", "#1c1917")}
 style handler fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style retry fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style stop fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style activate fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style done fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}`;

 const fallbackTypesCode = `// packages/core/src/fallback/types.ts

/**
  * Fallback 决策类型
  */
export type FallbackIntent =
  | 'retry' // 立即用回退模型重试当前请求
  | 'stop' // 切换到回退模型，但停止当前请求
  | 'auth'; // 停止当前请求，用户需要更换认证方式

/**
  * UI 层提供的 Fallback Handler 接口
  */
export type FallbackModelHandler = (
  failedModel: string, // 失败的模型名
  fallbackModel: string, // 建议的回退模型
  error?: unknown, // 原始错误
) => Promise<FallbackIntent | null>;`;

 const handleFallbackCode = `// packages/core/src/fallback/handler.ts

export async function handleFallback(
  config: Config,
  failedModel: string,
  authType?: string,
  error?: unknown,
): Promise<string | boolean | null> {
  // 处理不同认证类型
  if (authType === AuthType.GOOGLE_OAUTH) {
  return handleGoogleOAuthError(error);
  }

  // 仅 Google 认证支持模型回退
  if (authType !== AuthType.LOGIN_WITH_GOOGLE) return null;

  const fallbackModel = DEFAULT_GEMINI_FLASH_MODEL;
  if (failedModel === fallbackModel) return null; // 已是回退模型

  // 咨询 UI Handler 获取用户意图
  const fallbackModelHandler = config.fallbackModelHandler;
  if (typeof fallbackModelHandler !== 'function') return null;

  const intent = await fallbackModelHandler(
  failedModel,
  fallbackModel,
  error,
  );

  // 根据用户决策处理
  switch (intent) {
  case 'retry':
  activateFallbackMode(config, authType);
  return true; // 信号 retryWithBackoff 继续

  case 'stop':
  activateFallbackMode(config, authType);
  return false; // 停止当前请求

  case 'auth':
  return false; // 用户要更换认证

  default:
  throw new Error(\`Unexpected fallback intent: "\${intent}"\`);
  }
}`;

 const activateFallbackCode = `// 激活回退模式

function activateFallbackMode(config: Config, authType: string | undefined) {
  if (!config.isInFallbackMode()) {
  config.setFallbackMode(true);

  // 记录遥测事件
  if (authType) {
  logFlashFallback(config, new FlashFallbackEvent(authType));
  }
  }
}

// Config 接口
interface Config {
  isInFallbackMode(): boolean;
  setFallbackMode(enabled: boolean): void;
  fallbackModelHandler?: FallbackModelHandler;
  // ...
}`;

 return (
 <div className="space-y-8">
 <QuickSummary
 isExpanded={isSummaryExpanded}
 onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
 />

 {/* 页面标题 */}
 <section>
 <h2 className="text-2xl font-bold text-heading mb-4">Fallback 回退系统</h2>
 <p className="text-body mb-4">
 Fallback 系统是 Gemini CLI 的智能降级机制，当主模型（如 Gemini Pro）调用失败时，
 自动引导用户决定是否切换到备用模型（如 Gemini Flash），确保服务的连续性和可用性。
 </p>
 </section>

 {/* 1. Fallback 决策类型 */}
 <Layer title="Fallback 决策类型">
 <div className="space-y-4">
 <CodeBlock code={fallbackTypesCode} language="typescript" title="FallbackIntent 类型定义" />

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <HighlightBox title="retry" variant="green">
 <div className="text-sm space-y-2">
 <p className="text-body">立即重试当前请求</p>
 <ul className="text-body space-y-1">
 <li>激活回退模式</li>
 <li>使用 Flash 模型重试</li>
 <li>返回 true 继续 backoff</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="stop" variant="yellow">
 <div className="text-sm space-y-2">
 <p className="text-body">切换模型但停止当前请求</p>
 <ul className="text-body space-y-1">
 <li>激活回退模式</li>
 <li>后续请求使用 Flash</li>
 <li>返回 false 停止当前</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="auth" variant="purple">
 <div className="text-sm space-y-2">
 <p className="text-body">用户选择更换认证</p>
 <ul className="text-body space-y-1">
 <li>不激活回退模式</li>
 <li>返回 false 停止</li>
 <li>引导用户重新认证</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </div>
 </Layer>

 {/* 2. 执行流程 */}
 <Layer title="Fallback 执行流程">
 <div className="space-y-4">
 <MermaidDiagram chart={fallbackFlowChart} title="Fallback 决策流程" />
 <CodeBlock code={handleFallbackCode} language="typescript" title="handleFallback 核心逻辑" />
 </div>
 </Layer>

 {/* 3. 回退模式激活 */}
 <Layer title="回退模式激活">
 <div className="space-y-4">
 <CodeBlock code={activateFallbackCode} language="typescript" title="activateFallbackMode" />

 <HighlightBox title="回退模式状态" variant="blue">
 <div className="text-sm space-y-2 text-body">
 <p><strong>状态管理：</strong></p>
 <ul className="text-body space-y-1">
 <li><code className="bg-base/30 px-1 rounded">isInFallbackMode()</code> 检查当前是否处于回退模式</li>
 <li><code className="bg-base/30 px-1 rounded">setFallbackMode(true)</code> 激活回退模式</li>
 <li>一旦激活，整个会话期间保持</li>
 </ul>
 <p className="mt-2"><strong>遥测记录：</strong></p>
 <ul className="text-body space-y-1">
 <li>记录 FlashFallbackEvent</li>
 <li>包含认证类型信息</li>
 <li>用于分析回退频率</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 5. UI Handler 集成 */}
 <Layer title="UI Handler 集成">
 <div className="space-y-4">
 <MermaidDiagram chart={`sequenceDiagram
 participant CG as ContentGenerator
 participant FH as FallbackHandler
 participant Config as Config
 participant UI as UI Handler
 participant User as 用户

 CG->>FH: handleFallback(config, failedModel, authType, error)
 FH->>Config: get fallbackModelHandler
 FH->>UI: fallbackModelHandler(failed, fallback, error)
 UI->>User: 显示对话框询问
 User-->>UI: 选择 retry/stop/auth
 UI-->>FH: FallbackIntent
 FH->>Config: activateFallbackMode()
 FH-->>CG: true/false/null`} title="UI Handler 交互流程" />

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">FallbackModelHandler 接口</h4>
 <div className="text-sm text-body space-y-2">
 <p>UI 层需要实现 <code className="bg-base/30 px-1 rounded">FallbackModelHandler</code> 接口：</p>
 <ul className="list-disc pl-5 space-y-1">
 <li>接收失败模型名、建议回退模型、原始错误</li>
 <li>向用户展示选择对话框</li>
 <li>返回用户决策（retry/stop/auth）</li>
 <li>返回 null 表示不处理</li>
 </ul>
 </div>
 </div>
 </div>
 </Layer>

 {/* 6. 设计决策 */}
 <Layer title="设计决策">
 <div className="space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">为什么需要用户确认？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策：</strong>回退到 Flash 模型需要用户明确确认。</p>
 <p><strong>原因：</strong></p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>透明性</strong>：用户知道正在使用哪个模型</li>
 <li><strong>能力差异</strong>：Flash 模型能力可能较弱</li>
 <li><strong>成本考量</strong>：不同模型定价不同</li>
 </ul>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">为什么回退模式是会话级？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策：</strong>一旦激活回退模式，整个会话期间保持。</p>
 <p><strong>原因：</strong></p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>一致性</strong>：避免中途切换模型导致上下文不一致</li>
 <li><strong>稳定性</strong>：避免频繁切换带来的不确定性</li>
 <li><strong>简化</strong>：减少用户多次确认的干扰</li>
 </ul>
 </div>
 </div>
 </div>
 </Layer>

 {/* 7. 关键文件 */}
 <Layer title="关键文件与入口">
 <div className="grid grid-cols-1 gap-2 text-sm">
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/fallback/types.ts
 </code>
 <span className="text-body">FallbackIntent、FallbackModelHandler 类型定义</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/fallback/handler.ts
 </code>
 <span className="text-body">handleFallback 核心逻辑</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/config/models.ts
 </code>
 <span className="text-body">DEFAULT_GEMINI_FLASH_MODEL 定义</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/telemetry/index.ts
 </code>
 <span className="text-body">FlashFallbackEvent 遥测</span>
 </div>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
