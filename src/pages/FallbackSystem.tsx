import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'retry', label: '重试回退', description: '错误重试机制' },
  { id: 'error', label: '错误处理', description: '错误处理体系' },
  { id: 'model-routing', label: '模型路由', description: '模型选择策略' },
  { id: 'auth', label: '认证流程', description: '认证与授权' },
  { id: 'multi-provider', label: '多厂商架构', description: '多提供商支持' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--amber)]/10 to-[var(--terminal-green)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔄</span>
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
              模型调用失败时的智能降级机制，自动从 Pro 模型回退到 Flash 模型，保证服务可用性
            </p>
          </div>

          {/* 关键数字 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">3</div>
              <div className="text-xs text-[var(--text-muted)]">决策类型</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">2</div>
              <div className="text-xs text-[var(--text-muted)]">认证类型</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">1</div>
              <div className="text-xs text-[var(--text-muted)]">回退模型</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">∞</div>
              <div className="text-xs text-[var(--text-muted)]">会话持续</div>
            </div>
          </div>

          {/* 核心流程 */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">Fallback 决策流程</h4>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
                模型调用失败
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--amber)]/20 text-[var(--amber)] rounded-lg border border-[var(--amber)]/30">
                UI Handler 询问
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                激活回退模式
              </span>
            </div>
          </div>

          {/* 源码入口 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码入口:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
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
    check{检查认证类型}
    qwen[Qwen OAuth 错误处理]
    google[Google Auth 回退]
    handler{UI Handler<br/>用户决策}
    retry[retry: 激活回退<br/>继续重试]
    stop[stop: 激活回退<br/>停止当前请求]
    auth[auth: 用户重新认证]
    activate[activateFallbackMode]
    done([完成])

    fail --> check
    check -->|QWEN_OAUTH| qwen
    check -->|LOGIN_WITH_GOOGLE| google
    qwen --> done
    google --> handler
    handler -->|retry| retry
    handler -->|stop| stop
    handler -->|auth| auth
    retry --> activate
    stop --> activate
    activate --> done
    auth --> done

    style fail fill:#ef4444,color:#fff
    style check fill:#f59e0b,color:#000
    style handler fill:#a855f7,color:#fff
    style retry fill:#22c55e,color:#000
    style stop fill:#22c55e,color:#000
    style activate fill:#3b82f6,color:#fff
    style done fill:#6366f1,color:#fff`;

  const fallbackTypesCode = `// packages/core/src/fallback/types.ts

/**
 * Fallback 决策类型
 */
export type FallbackIntent =
  | 'retry'  // 立即用回退模型重试当前请求
  | 'stop'   // 切换到回退模型，但停止当前请求
  | 'auth';  // 停止当前请求，用户需要更换认证方式

/**
 * UI 层提供的 Fallback Handler 接口
 */
export type FallbackModelHandler = (
  failedModel: string,      // 失败的模型名
  fallbackModel: string,    // 建议的回退模型
  error?: unknown,          // 原始错误
) => Promise<FallbackIntent | null>;`;

  const handleFallbackCode = `// packages/core/src/fallback/handler.ts

export async function handleFallback(
  config: Config,
  failedModel: string,
  authType?: string,
  error?: unknown,
): Promise<string | boolean | null> {
  // 处理不同认证类型
  if (authType === AuthType.QWEN_OAUTH) {
    return handleQwenOAuthError(error);
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
      return true;  // 信号 retryWithBackoff 继续

    case 'stop':
      activateFallbackMode(config, authType);
      return false; // 停止当前请求

    case 'auth':
      return false; // 用户要更换认证

    default:
      throw new Error(\`Unexpected fallback intent: "\${intent}"\`);
  }
}`;

  const qwenErrorHandlerCode = `// Qwen OAuth 错误处理

async function handleQwenOAuthError(error?: unknown): Promise<string | null> {
  if (!error) return null;

  const errorMessage = error instanceof Error
    ? error.message.toLowerCase()
    : String(error).toLowerCase();
  const errorCode = (error as { status?: number })?.status;

  // 认证错误检测
  const isAuthError =
    errorCode === 401 ||
    errorCode === 403 ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('invalid api key') ||
    (errorMessage.includes('token') && errorMessage.includes('expired'));

  // 限流错误检测
  const isRateLimitError =
    errorCode === 429 ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests');

  if (isAuthError) {
    console.warn('Qwen OAuth authentication error detected');
    console.log('Note: You may need to re-authenticate with Qwen OAuth');
    return null;
  }

  if (isRateLimitError) {
    console.warn('Qwen API rate limit encountered');
    // 重试机制会处理 backoff
    return null;
  }

  return null;
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
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Fallback 回退系统</h2>
        <p className="text-gray-300 mb-4">
          Fallback 系统是 Gemini CLI 的智能降级机制，当主模型（如 Gemini Pro）调用失败时，
          自动引导用户决定是否切换到备用模型（如 Gemini Flash），确保服务的连续性和可用性。
        </p>
      </section>

      {/* 1. Fallback 决策类型 */}
      <Layer title="Fallback 决策类型" icon="⚖️">
        <div className="space-y-4">
          <CodeBlock code={fallbackTypesCode} language="typescript" title="FallbackIntent 类型定义" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HighlightBox title="retry" variant="green">
              <div className="text-sm space-y-2">
                <p className="text-gray-300">立即重试当前请求</p>
                <ul className="text-gray-400 space-y-1">
                  <li>• 激活回退模式</li>
                  <li>• 使用 Flash 模型重试</li>
                  <li>• 返回 true 继续 backoff</li>
                </ul>
              </div>
            </HighlightBox>

            <HighlightBox title="stop" variant="yellow">
              <div className="text-sm space-y-2">
                <p className="text-gray-300">切换模型但停止当前请求</p>
                <ul className="text-gray-400 space-y-1">
                  <li>• 激活回退模式</li>
                  <li>• 后续请求使用 Flash</li>
                  <li>• 返回 false 停止当前</li>
                </ul>
              </div>
            </HighlightBox>

            <HighlightBox title="auth" variant="purple">
              <div className="text-sm space-y-2">
                <p className="text-gray-300">用户选择更换认证</p>
                <ul className="text-gray-400 space-y-1">
                  <li>• 不激活回退模式</li>
                  <li>• 返回 false 停止</li>
                  <li>• 引导用户重新认证</li>
                </ul>
              </div>
            </HighlightBox>
          </div>
        </div>
      </Layer>

      {/* 2. 执行流程 */}
      <Layer title="Fallback 执行流程" icon="🔄">
        <div className="space-y-4">
          <MermaidDiagram chart={fallbackFlowChart} title="Fallback 决策流程" />
          <CodeBlock code={handleFallbackCode} language="typescript" title="handleFallback 核心逻辑" />
        </div>
      </Layer>

      {/* 3. Qwen OAuth 错误处理 */}
      <Layer title="Qwen OAuth 错误处理" icon="🔐">
        <div className="space-y-4">
          <CodeBlock code={qwenErrorHandlerCode} language="typescript" title="Qwen OAuth 错误检测" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HighlightBox title="认证错误 (Auth Error)" variant="red">
              <div className="text-sm space-y-2 text-gray-300">
                <p><strong>触发条件：</strong></p>
                <ul className="text-gray-400 space-y-1">
                  <li>• HTTP 401 / 403</li>
                  <li>• "unauthorized" / "forbidden"</li>
                  <li>• "invalid api key"</li>
                  <li>• "token expired"</li>
                </ul>
                <p className="mt-2"><strong>处理：</strong>提示用户重新认证</p>
              </div>
            </HighlightBox>

            <HighlightBox title="限流错误 (Rate Limit)" variant="yellow">
              <div className="text-sm space-y-2 text-gray-300">
                <p><strong>触发条件：</strong></p>
                <ul className="text-gray-400 space-y-1">
                  <li>• HTTP 429</li>
                  <li>• "rate limit"</li>
                  <li>• "too many requests"</li>
                </ul>
                <p className="mt-2"><strong>处理：</strong>交由重试机制 backoff</p>
              </div>
            </HighlightBox>
          </div>
        </div>
      </Layer>

      {/* 4. 回退模式激活 */}
      <Layer title="回退模式激活" icon="⚡">
        <div className="space-y-4">
          <CodeBlock code={activateFallbackCode} language="typescript" title="activateFallbackMode" />

          <HighlightBox title="回退模式状态" variant="blue">
            <div className="text-sm space-y-2 text-gray-300">
              <p><strong>状态管理：</strong></p>
              <ul className="text-gray-400 space-y-1">
                <li>• <code className="bg-black/30 px-1 rounded">isInFallbackMode()</code> 检查当前是否处于回退模式</li>
                <li>• <code className="bg-black/30 px-1 rounded">setFallbackMode(true)</code> 激活回退模式</li>
                <li>• 一旦激活，整个会话期间保持</li>
              </ul>
              <p className="mt-2"><strong>遥测记录：</strong></p>
              <ul className="text-gray-400 space-y-1">
                <li>• 记录 FlashFallbackEvent</li>
                <li>• 包含认证类型信息</li>
                <li>• 用于分析回退频率</li>
              </ul>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 5. UI Handler 集成 */}
      <Layer title="UI Handler 集成" icon="🖥️">
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

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">FallbackModelHandler 接口</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p>UI 层需要实现 <code className="bg-black/30 px-1 rounded">FallbackModelHandler</code> 接口：</p>
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
      <Layer title="设计决策" icon="💡">
        <div className="space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">为什么需要用户确认？</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p><strong>决策：</strong>回退到 Flash 模型需要用户明确确认。</p>
              <p><strong>原因：</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>透明性</strong>：用户知道正在使用哪个模型</li>
                <li><strong>能力差异</strong>：Flash 模型能力可能较弱</li>
                <li><strong>成本考量</strong>：不同模型定价不同</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">为什么回退模式是会话级？</h4>
            <div className="text-sm text-gray-300 space-y-2">
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
      <Layer title="关键文件与入口" icon="📁">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/fallback/types.ts
            </code>
            <span className="text-gray-400">FallbackIntent、FallbackModelHandler 类型定义</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/fallback/handler.ts
            </code>
            <span className="text-gray-400">handleFallback 核心逻辑</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/config/models.ts
            </code>
            <span className="text-gray-400">DEFAULT_GEMINI_FLASH_MODEL 定义</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/telemetry/index.ts
            </code>
            <span className="text-gray-400">FlashFallbackEvent 遥测</span>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
