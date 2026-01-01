import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { Module } from '../components/Module';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

// ===== Introduction Component =====
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
          <span className="text-2xl">🌐</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">
            多厂商架构导读
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
              🎯 核心问题
            </h4>
            <p className="text-[var(--text-secondary)] text-sm">
              如何让 CLI 支持<strong>多个 AI 厂商</strong>（OpenAI、Gemini、DeepSeek）
              而不需要为每个厂商写完全不同的代码？
              <br />
              答案是：<strong>统一接口 + 适配器模式 + 格式转换器</strong>
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">
              🔧 核心抽象层
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-xs text-[var(--terminal-green)]">
                  ContentGenerator
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  统一接口
                </div>
              </div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-xs text-[var(--cyber-blue)]">Provider</div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  厂商适配
                </div>
              </div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-xs text-[var(--amber)]">Converter</div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  格式转换
                </div>
              </div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-xs text-[var(--purple)]">TokenLimits</div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  模型限制
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">
              🏗️ 架构层次
            </h4>
            <div className="text-[var(--text-secondary)] text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[var(--terminal-green)]">1.</span>
                <span>
                  <strong>ContentGenerator 接口</strong> - 定义统一的 AI
                  交互协议
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--cyber-blue)]">2.</span>
                <span>
                  <strong>Provider 适配器</strong> - 处理厂商特定的请求/响应格式
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--amber)]">3.</span>
                <span>
                  <strong>ContentConverter</strong> - Gemini ↔ OpenAI 格式互转
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">📊 关键数字</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--terminal-green)]">
                  7
                </div>
                <div className="text-xs text-[var(--text-muted)]">认证类型</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--cyber-blue)]">
                  4+
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  Provider 适配
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--amber)]">1M</div>
                <div className="text-xs text-[var(--text-muted)]">
                  最大上下文
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--purple)]">
                  64K
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  最大输出
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Provider Routing Animation =====
function ProviderRoutingAnimation() {
  const [selectedAuth, setSelectedAuth] = useState<string>('google-oauth');

  const authTypes = [
    {
      id: 'google-oauth',
      name: 'Google OAuth',
      provider: 'GeminiContentGenerator',
      color: 'var(--terminal-green)',
      icon: '🐧',
    },
    {
      id: 'google-oauth',
      name: 'Google OAuth',
      provider: 'GeminiContentGenerator',
      color: 'var(--cyber-blue)',
      icon: '🏠',
    },
    {
      id: 'openai',
      name: 'OpenAI API',
      provider: 'OpenAIContentGenerator',
      color: 'var(--amber)',
      icon: '🤖',
    },
    {
      id: 'gemini-api-key',
      name: 'Gemini API',
      provider: 'Google GenAI SDK',
      color: 'var(--purple)',
      icon: '💎',
    },
    {
      id: 'oauth-personal',
      name: 'Google OAuth',
      provider: 'CodeAssistContentGenerator',
      color: 'pink',
      icon: '🔐',
    },
  ];

  const selected = authTypes.find((a) => a.id === selectedAuth) || authTypes[0];

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl p-6 border border-[var(--border-subtle)]">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span>🔀</span> Provider 路由
      </h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {authTypes.map((auth) => (
          <button
            key={auth.id}
            onClick={() => setSelectedAuth(auth.id)}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              selectedAuth === auth.id
                ? 'border-2'
                : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
            }`}
            style={{
              borderColor:
                selectedAuth === auth.id ? auth.color : 'var(--border-subtle)',
              color: selectedAuth === auth.id ? auth.color : 'var(--text-muted)',
              backgroundColor:
                selectedAuth === auth.id
                  ? 'var(--bg-terminal)'
                  : 'var(--bg-card)',
            }}
          >
            <span className="mr-1">{auth.icon}</span>
            {auth.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Auth Type */}
        <div
          className="flex-1 p-4 rounded-lg border-2 text-center"
          style={{ borderColor: selected.color }}
        >
          <div className="text-3xl mb-2">{selected.icon}</div>
          <div className="font-bold" style={{ color: selected.color }}>
            {selected.name}
          </div>
          <div className="text-xs text-[var(--text-muted)]">AuthType</div>
        </div>

        {/* Arrow */}
        <div className="text-2xl text-[var(--text-muted)]">→</div>

        {/* Factory */}
        <div className="flex-1 p-4 rounded-lg bg-[var(--bg-terminal)] border border-[var(--border-subtle)] text-center">
          <div className="text-2xl mb-2">🏭</div>
          <div className="font-mono text-sm text-[var(--text-primary)]">
            createContentGenerator()
          </div>
          <div className="text-xs text-[var(--text-muted)]">工厂路由</div>
        </div>

        {/* Arrow */}
        <div className="text-2xl text-[var(--text-muted)]">→</div>

        {/* Provider */}
        <div
          className="flex-1 p-4 rounded-lg border-2 text-center"
          style={{
            borderColor: selected.color,
            backgroundColor: `color-mix(in srgb, ${selected.color} 10%, transparent)`,
          }}
        >
          <div className="text-2xl mb-2">⚙️</div>
          <div className="font-mono text-sm" style={{ color: selected.color }}>
            {selected.provider}
          </div>
          <div className="text-xs text-[var(--text-muted)]">具体实现</div>
        </div>
      </div>
    </div>
  );
}

// ===== Content Converter Flow =====
function ContentConverterFlow() {
  const [direction, setDirection] = useState<'request' | 'response'>('request');

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl p-6 border border-[var(--border-subtle)]">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span>🔄</span> 格式转换器
      </h3>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setDirection('request')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            direction === 'request'
              ? 'bg-[var(--terminal-green)] text-black'
              : 'bg-[var(--bg-card)] text-[var(--text-muted)]'
          }`}
        >
          请求转换 (Gemini → OpenAI)
        </button>
        <button
          onClick={() => setDirection('response')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            direction === 'response'
              ? 'bg-[var(--cyber-blue)] text-black'
              : 'bg-[var(--bg-card)] text-[var(--text-muted)]'
          }`}
        >
          响应转换 (OpenAI → Gemini)
        </button>
      </div>

      {direction === 'request' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--terminal-green)]/30">
            <div className="text-[var(--terminal-green)] font-bold mb-2 text-sm">
              Gemini 格式
            </div>
            <pre className="text-xs text-[var(--text-secondary)] overflow-auto">
              {`{
  contents: [
    {
      role: "user",
      parts: [
        { text: "Hello" }
      ]
    }
  ],
  tools: [{
    functionDeclarations: [...]
  }]
}`}
            </pre>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="text-sm text-[var(--amber)] font-mono">
                OpenAIContentConverter
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                convertGeminiRequestToOpenAI()
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--cyber-blue)]/30">
            <div className="text-[var(--cyber-blue)] font-bold mb-2 text-sm">
              OpenAI 格式
            </div>
            <pre className="text-xs text-[var(--text-secondary)] overflow-auto">
              {`{
  messages: [
    {
      role: "user",
      content: "Hello"
    }
  ],
  tools: [{
    type: "function",
    function: {...}
  }]
}`}
            </pre>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--cyber-blue)]/30">
            <div className="text-[var(--cyber-blue)] font-bold mb-2 text-sm">
              OpenAI 响应
            </div>
            <pre className="text-xs text-[var(--text-secondary)] overflow-auto">
              {`{
  choices: [{
    message: {
      content: "Hi!",
      tool_calls: [...]
    },
    finish_reason: "stop"
  }],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 5
  }
}`}
            </pre>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="text-sm text-[var(--amber)] font-mono">
                OpenAIContentConverter
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                convertOpenAIResponseToGemini()
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--terminal-green)]/30">
            <div className="text-[var(--terminal-green)] font-bold mb-2 text-sm">
              Gemini 格式
            </div>
            <pre className="text-xs text-[var(--text-secondary)] overflow-auto">
              {`{
  candidates: [{
    content: {
      parts: [{ text: "Hi!" }]
    },
    finishReason: "STOP"
  }],
  usageMetadata: {
    promptTokenCount: 10,
    candidatesTokenCount: 5
  }
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Token Limits Visualization =====
function TokenLimitsVisualization() {
  const models = [
    {
      name: 'Gemini-1.5-Pro',
      input: 1000000,
      output: 64000,
      color: 'var(--terminal-green)',
    },
    {
      name: 'Gemini-1.5-Flash',
      input: 1000000,
      output: 32000,
      color: 'var(--cyber-blue)',
    },
    {
      name: 'Gemini-2.5-Pro',
      input: 1000000,
      output: 65536,
      color: 'var(--purple)',
    },
    {
      name: 'Claude-3.5-Sonnet',
      input: 200000,
      output: 8192,
      color: 'var(--amber)',
    },
    {
      name: 'GPT-4o',
      input: 128000,
      output: 16384,
      color: 'pink',
    },
    {
      name: 'DeepSeek-V3',
      input: 128000,
      output: 8192,
      color: 'cyan',
    },
  ];

  const maxInput = Math.max(...models.map((m) => m.input));

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl p-6 border border-[var(--border-subtle)]">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span>📊</span> 模型 Token 限制对比
      </h3>

      <div className="space-y-4">
        {models.map((model) => (
          <div key={model.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span style={{ color: model.color }} className="font-mono">
                {model.name}
              </span>
              <span className="text-[var(--text-muted)]">
                {(model.input / 1000).toFixed(0)}K /{' '}
                {(model.output / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="relative h-6 bg-[var(--bg-terminal)] rounded overflow-hidden">
              {/* Input bar */}
              <div
                className="absolute inset-y-0 left-0 opacity-30"
                style={{
                  width: `${(model.input / maxInput) * 100}%`,
                  backgroundColor: model.color,
                }}
              />
              {/* Output bar */}
              <div
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${(model.output / maxInput) * 100}%`,
                  backgroundColor: model.color,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-2 text-xs">
                <span className="text-white/80">输入上下文</span>
                <span className="text-white/80">输出限制</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-4 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 bg-white/30 rounded"></div>
          <span>输入上下文窗口</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 bg-white rounded"></div>
          <span>最大输出 Token</span>
        </div>
      </div>
    </div>
  );
}

// ===== Provider Features Comparison =====
function ProviderFeaturesComparison() {
  const providers = [
    {
      name: 'DashScope',
      features: [
        '缓存控制 (ephemeral)',
        '视觉模型支持',
        '输出 Token 限制',
        '请求元数据',
      ],
      color: 'var(--terminal-green)',
    },
    {
      name: 'DeepSeek',
      features: ['数组内容转字符串', '标准 OpenAI 兼容'],
      color: 'var(--cyber-blue)',
    },
    {
      name: 'OpenRouter',
      features: ['HTTP-Referer 头', 'X-Title 头', '多模型路由'],
      color: 'var(--amber)',
    },
    {
      name: 'Default',
      features: ['标准 OpenAI 协议', 'User-Agent 头'],
      color: 'var(--purple)',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {providers.map((provider) => (
        <div
          key={provider.name}
          className="bg-[var(--bg-panel)] rounded-lg p-4 border"
          style={{ borderColor: `color-mix(in srgb, ${provider.color} 30%, transparent)` }}
        >
          <div className="font-bold mb-3" style={{ color: provider.color }}>
            {provider.name}Provider
          </div>
          <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
            {provider.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-1">
                <span style={{ color: provider.color }}>•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ===== Main Export =====
export function MultiProviderArchitecture() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  const relatedPages: RelatedPage[] = [
    { id: 'gemini-chat', label: 'GeminiChatCore', description: 'AI 核心' },
    { id: 'config', label: '配置系统', description: '提供商配置' },
    { id: 'auth', label: '认证流程', description: 'API 认证' },
    { id: 'streaming-response-processing', label: '流式处理', description: '响应流' },
    { id: 'error', label: '错误处理', description: '提供商错误' },
    { id: 'retry', label: '重试回退', description: '故障恢复' },
  ];

  return (
    <div>
      <Introduction
        isExpanded={isIntroExpanded}
        onToggle={() => setIsIntroExpanded(!isIntroExpanded)}
      />

      {/* Core Interface */}
      <Layer title="ContentGenerator 接口" icon="📋">
        <HighlightBox title="统一抽象" icon="💡" variant="green">
          <p className="mb-2">
            <code>ContentGenerator</code> 是所有 AI 厂商的
            <strong>统一接口</strong>，定义了 4 个核心方法：
          </p>
        </HighlightBox>

        <div className="mt-4">
          <CodeBlock
            title="ContentGenerator 接口定义"
            language="typescript"
            code={`export interface ContentGenerator {
  // 同步生成内容
  generateContent(
    request: GenerateContentParameters,
    userPromptId: string
  ): Promise<GenerateContentResponse>;

  // 流式生成内容
  generateContentStream(
    request: GenerateContentParameters,
    userPromptId: string
  ): Promise<AsyncGenerator<GenerateContentResponse>>;

  // Token 计数
  countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;

  // 嵌入生成
  embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;

  userTier?: UserTierId;
}`}
          />
        </div>
      </Layer>

      {/* Provider Routing */}
      <Layer title="认证类型与路由" icon="🔀">
        <ProviderRoutingAnimation />

        <div className="mt-4">
          <CodeBlock
            title="AuthType 枚举"
            language="typescript"
            code={`export enum AuthType {
  LOGIN_WITH_GOOGLE = 'oauth-personal',   // Gemini via Google OAuth
  USE_GEMINI = 'gemini-api-key',          // Direct Gemini API key
  USE_VERTEX_AI = 'vertex-ai',            // Google Vertex AI
  CLOUD_SHELL = 'cloud-shell',            // Google Cloud Shell
  USE_OPENAI = 'openai',                  // OpenAI-compatible
  QWEN_OAUTH = 'google-oauth',              // Google OAuth (推荐)
  QWEN_OAUTH = 'google-oauth',          // Google OAuth
}`}
          />
        </div>
      </Layer>

      {/* Implementation Hierarchy */}
      <Layer title="实现类层次" icon="🏗️">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Module
            icon="🐧"
            name="GeminiContentGenerator"
            path="packages/core/src/gemini"
            description="继承 OpenAI，动态 Token 管理"
          />
          <Module
            icon="🏠"
            name="GeminiContentGenerator"
            path="packages/core/src/gemini"
            description="继承 OpenAI，模型配置缓存"
          />
          <Module
            icon="🤖"
            name="OpenAIContentGenerator"
            path="packages/core/src/core/openaiContentGenerator"
            description="OpenAI 兼容基类"
          />
          <Module
            icon="💎"
            name="CodeAssistContentGenerator"
            path="packages/core/src/code_assist"
            description="Google CodeAssist 服务器"
          />
          <Module
            icon="📝"
            name="LoggingContentGenerator"
            path="packages/core/src/core"
            description="装饰器，添加日志记录"
          />
          <Module
            icon="🔄"
            name="OpenAIContentConverter"
            path="packages/core/src/core/openaiContentGenerator"
            description="Gemini ↔ OpenAI 格式转换"
          />
        </div>

        <HighlightBox title="继承关系" icon="📊" variant="blue" className="mt-4">
          <div className="font-mono text-sm space-y-1">
            <div className="text-[var(--text-muted)]">
              ContentGenerator (接口)
            </div>
            <div className="ml-4 text-[var(--amber)]">
              └─ OpenAIContentGenerator
            </div>
            <div className="ml-8 text-[var(--terminal-green)]">
              ├─ GeminiContentGenerator
            </div>
            <div className="ml-8 text-[var(--cyber-blue)]">
              └─ GeminiContentGenerator
            </div>
          </div>
        </HighlightBox>
      </Layer>

      {/* Provider Abstraction */}
      <Layer title="Provider 适配器" icon="🔌">
        <ProviderFeaturesComparison />

        <div className="mt-4">
          <CodeBlock
            title="OpenAICompatibleProvider 接口"
            language="typescript"
            code={`export interface OpenAICompatibleProvider {
  // 构建请求头
  buildHeaders(): Record<string, string | undefined>;

  // 构建 OpenAI 客户端
  buildClient(): OpenAI;

  // 自定义请求参数
  buildRequest(
    request: OpenAI.Chat.ChatCompletionCreateParams,
    userPromptId: string,
  ): OpenAI.Chat.ChatCompletionCreateParams;
}

// Provider 检测逻辑
function determineProvider(config): OpenAICompatibleProvider {
  if (DashScopeProvider.isDashScopeProvider(config))
    return new DashScopeOpenAICompatibleProvider(config);
  if (DeepSeekProvider.isDeepSeekProvider(config))
    return new DeepSeekOpenAICompatibleProvider(config);
  if (OpenRouterProvider.isOpenRouterProvider(config))
    return new OpenRouterOpenAICompatibleProvider(config);
  return new DefaultOpenAICompatibleProvider(config);
}`}
          />
        </div>
      </Layer>

      {/* Format Converter */}
      <Layer title="格式转换器" icon="🔄">
        <ContentConverterFlow />

        <HighlightBox title="转换职责" icon="⚙️" variant="purple" className="mt-4">
          <ul className="space-y-1 text-sm">
            <li>
              • <strong>请求转换</strong>：Gemini content/parts → OpenAI
              messages
            </li>
            <li>
              • <strong>工具转换</strong>：Gemini functionDeclarations → OpenAI
              tools
            </li>
            <li>
              • <strong>响应转换</strong>：OpenAI ChatCompletion → Gemini
              GenerateContentResponse
            </li>
            <li>
              • <strong>finish_reason 映射</strong>：stop → STOP, tool_calls →
              TOOL_CALL
            </li>
            <li>
              • <strong>用量统计</strong>：prompt_tokens → promptTokenCount
            </li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* Token Limits */}
      <Layer title="Token 限制管理" icon="📊">
        <TokenLimitsVisualization />

        <div className="mt-4">
          <CodeBlock
            title="模型名称标准化"
            language="typescript"
            code={`// 标准化逻辑：去除日期后缀、版本号、厂商前缀
function normalize(model: string): string {
  return model
    .replace(/-(\\d{8}|latest|v\\d+.*|preview.*)$/i, '')
    .replace(/^(org\\/project\\/)?/, '')
    .replace(/\\s+/g, '-')
    .toLowerCase();
}

// 示例
normalize("gemini-1.5-pro-20250219") → "gemini-1.5-pro"
normalize("gpt-4o-2024-08-06") → "gpt-4o"
normalize("gemini-2.5-pro-preview") → "gemini-2.5-pro"`}
          />
        </div>
      </Layer>

      {/* Token Management */}
      <Layer title="Token 刷新机制" icon="🔐">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--terminal-green)]/30">
            <div className="text-[var(--terminal-green)] font-bold mb-2">
              Gemini Token 管理
            </div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 单例模式，线程安全</li>
              <li>• 401/403 自动刷新</li>
              <li>• 缓存凭证检查过期</li>
              <li>
                • 持久化到 <code>oauth_creds.json</code>
              </li>
            </ul>
          </div>

          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--cyber-blue)]/30">
            <div className="text-[var(--cyber-blue)] font-bold mb-2">
              Gemini 双重回退
            </div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 模型特定配置优先</li>
              <li>• OAuth 凭证回退</li>
              <li>• ModelConfigCache 缓存</li>
              <li>• 用户信息注入头</li>
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <CodeBlock
            title="错误处理与刷新"
            language="typescript"
            code={`// GeminiContentGenerator 重写错误处理
protected shouldSuppressErrorLogging(error: unknown): boolean {
  // 401/403 期间正在刷新 token，抑制错误日志
  if (this.refreshingToken && isAuthError(error)) {
    return true;
  }
  return false;
}

// 自动刷新流程
async generateContent(request, promptId) {
  try {
    return await super.generateContent(request, promptId);
  } catch (error) {
    if (isAuthError(error)) {
      this.refreshingToken = true;
      await this.tokenManager.refresh();
      this.refreshingToken = false;
      // 重试
      return await super.generateContent(request, promptId);
    }
    throw error;
  }
}`}
          />
        </div>
      </Layer>

      {/* Request Pipeline */}
      <Layer title="请求管道" icon="⛓️">
        <div className="bg-[var(--bg-panel)] rounded-xl p-6 border border-[var(--border-subtle)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {[
              { icon: '📥', name: '接收请求', desc: 'Gemini 格式' },
              { icon: '🔄', name: 'Provider 处理', desc: '厂商特定变换' },
              { icon: '📡', name: 'API 调用', desc: 'OpenAI Client' },
              { icon: '🔄', name: '响应转换', desc: 'Gemini 格式' },
              { icon: '📝', name: '日志记录', desc: 'Telemetry' },
            ].map((step, i) => (
              <div key={step.name} className="flex items-center gap-2">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-terminal)] flex items-center justify-center text-xl border border-[var(--border-subtle)]">
                    {step.icon}
                  </div>
                  <div className="mt-1 text-xs text-[var(--text-primary)]">
                    {step.name}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {step.desc}
                  </div>
                </div>
                {i < 4 && (
                  <span className="text-[var(--text-muted)] hidden md:block">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Layer>

      {/* Design Patterns */}
      <Layer title="设计模式" icon="🎨">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--terminal-green)]/30">
            <div className="text-[var(--terminal-green)] font-bold mb-2">
              策略模式
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              不同 AuthType 创建不同的
              <br />
              ContentGenerator 实现
            </div>
          </div>
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--cyber-blue)]/30">
            <div className="text-[var(--cyber-blue)] font-bold mb-2">
              适配器模式
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              OpenAIContentConverter
              <br />
              Gemini ↔ OpenAI 格式互转
            </div>
          </div>
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--amber)]/30">
            <div className="text-[var(--amber)] font-bold mb-2">Provider 模式</div>
            <div className="text-sm text-[var(--text-muted)]">
              动态检测厂商
              <br />
              应用特定配置
            </div>
          </div>
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--purple)]/30">
            <div className="text-[var(--purple)] font-bold mb-2">装饰器模式</div>
            <div className="text-sm text-[var(--text-muted)]">
              LoggingContentGenerator
              <br />
              包装任意实现添加日志
            </div>
          </div>
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-pink-400/30">
            <div className="text-pink-400 font-bold mb-2">模板方法</div>
            <div className="text-sm text-[var(--text-muted)]">
              OpenAIContentGenerator 定义管道
              <br />
              子类定制特定行为
            </div>
          </div>
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-cyan-400/30">
            <div className="text-cyan-400 font-bold mb-2">工厂模式</div>
            <div className="text-sm text-[var(--text-muted)]">
              createContentGenerator()
              <br />
              根据配置创建正确实例
            </div>
          </div>
        </div>
      </Layer>

      {/* Key Files */}
      <Layer title="关键文件" icon="📁">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Module
            icon="📋"
            name="contentGenerator.ts"
            path="packages/core/src/core"
            description="接口定义 + 工厂方法"
          />
          <Module
            icon="🔄"
            name="converter.ts"
            path="packages/core/src/core/openaiContentGenerator"
            description="Gemini ↔ OpenAI 格式转换"
          />
          <Module
            icon="🔌"
            name="provider/*.ts"
            path="packages/core/src/core/openaiContentGenerator"
            description="厂商适配器实现"
          />
          <Module
            icon="📊"
            name="tokenLimits.ts"
            path="packages/core/src/core"
            description="模型 Token 限制表"
          />
          <Module
            icon="🐧"
            name="geminiContentGenerator.ts"
            path="packages/core/src/gemini"
            description="Gemini 实现 + Token 管理"
          />
          <Module
            icon="🔐"
            name="sharedTokenManager.ts"
            path="packages/core/src/gemini"
            description="Token 刷新单例"
          />
        </div>
      </Layer>

      {/* Design Decisions */}
      <Layer title="为什么这样设计多提供商架构" icon="🤔" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--terminal-green)]/30">
            <div className="text-[var(--terminal-green)] font-bold mb-2">
              为什么使用适配器模式？
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              不同 AI 厂商使用不同的 API 格式（Gemini 用 parts/contents，OpenAI 用 messages）。
              适配器模式让我们可以<strong>统一内部表示</strong>，只在边界处转换格式。
              这样核心逻辑完全不需要关心具体是哪个厂商，降低了耦合度。
            </div>
          </div>

          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--cyber-blue)]/30">
            <div className="text-[var(--cyber-blue)] font-bold mb-2">
              为什么支持多个 API 提供商？
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              单一提供商有风险：<strong>API 可能宕机、价格可能调整、模型可能下线</strong>。
              支持多提供商让用户可以根据成本、性能、可用性自由选择，
              也让产品不会被某个厂商锁定，增强了系统弹性。
            </div>
          </div>

          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--amber)]/30">
            <div className="text-[var(--amber)] font-bold mb-2">
              为什么统一响应格式？
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              上层业务代码（工具调用、流式渲染、Token 计数）需要一致的数据结构。
              选择 Gemini 格式作为内部标准是因为它<strong>语义更丰富</strong>（parts 数组支持多模态），
              而 OpenAI 格式更简单可以无损转换。
            </div>
          </div>

          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--purple)]/30">
            <div className="text-[var(--purple)] font-bold mb-2">
              为什么使用工厂模式创建客户端？
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              创建 ContentGenerator 涉及复杂逻辑：读取配置、选择认证方式、初始化 Provider。
              工厂模式将这些<strong>创建细节封装</strong>起来，调用方只需说"给我一个 generator"，
              不需要知道 Gemini 和 OpenAI 的创建过程有何不同。
            </div>
          </div>

          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-pink-400/30">
            <div className="text-pink-400 font-bold mb-2">
              为什么流式响应是默认行为？
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              AI 生成可能需要 10-30 秒，用户盯着空白屏幕体验很差。
              流式响应让用户<strong>立即看到输出开始</strong>，感知延迟大幅降低。
              同时流式也支持提前取消、进度显示、实时 Token 计数等功能。
            </div>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
