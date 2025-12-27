import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';

type TabType = 'overview' | 'safety' | 'performance' | 'correctness' | 'state';

export function DesignTradeoffs() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: '设计哲学', icon: '🎯' },
    { id: 'safety', label: '安全 vs 便捷', icon: '🛡️' },
    { id: 'performance', label: '性能 vs 简洁', icon: '⚡' },
    { id: 'correctness', label: '正确性 vs 吞吐', icon: '✅' },
    { id: 'state', label: '状态管理', icon: '📦' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">
        🎭 设计权衡与架构决策
      </h1>
      <p className="text-[var(--text-secondary)] mb-6 text-sm">
        深入分析 Innies CLI 的关键架构决策及其背后的权衡考量
      </p>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg border-none cursor-pointer text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--cyber-blue)] text-white'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'safety' && <SafetyTab />}
      {activeTab === 'performance' && <PerformanceTab />}
      {activeTab === 'correctness' && <CorrectnessTab />}
      {activeTab === 'state' && <StateTab />}
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="flex flex-col gap-6">
      <Layer title="📐 设计哲学总览">
        <p className="text-[var(--text-secondary)] mb-4">
          Innies CLI 的架构遵循以下核心原则，每个原则背后都有明确的权衡决策：
        </p>

        <MermaidDiagram chart={`
mindmap
  root((设计哲学))
    安全优先
      信任边界
      审批模式
      语义分割
    健壮性
      多层检测
      优雅降级
      回退策略
    性能感知
      并行发现
      智能缓存
      批处理
    状态管理
      队列模式
      单例遥测
      顺序执行
`} />
      </Layer>

      {/* Key Tradeoff Matrix */}
      <Layer title="⚖️ 核心权衡矩阵">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/20">
                <th className="p-3 text-left text-[var(--text-primary)]">决策领域</th>
                <th className="p-3 text-left text-[var(--text-primary)]">选择</th>
                <th className="p-3 text-left text-[var(--text-primary)]">取舍</th>
                <th className="p-3 text-left text-[var(--text-primary)]">原因</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="p-3 text-[var(--text-secondary)]">工具执行</td>
                <td className="p-3 text-[var(--terminal-green)]">顺序队列</td>
                <td className="p-3 text-[var(--amber)]">牺牲并发吞吐</td>
                <td className="p-3 text-[var(--text-secondary)]">确保状态一致性</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3 text-[var(--text-secondary)]">循环检测</td>
                <td className="p-3 text-[var(--terminal-green)]">三层检测</td>
                <td className="p-3 text-[var(--amber)]">增加复杂度</td>
                <td className="p-3 text-[var(--text-secondary)]">避免漏检误判</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3 text-[var(--text-secondary)]">编码检测</td>
                <td className="p-3 text-[var(--terminal-green)]">非对称缓存</td>
                <td className="p-3 text-[var(--amber)]">逻辑不一致</td>
                <td className="p-3 text-[var(--text-secondary)]">平衡性能与准确</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3 text-[var(--text-secondary)]">遥测收集</td>
                <td className="p-3 text-[var(--terminal-green)]">单例模式</td>
                <td className="p-3 text-[var(--amber)]">测试困难</td>
                <td className="p-3 text-[var(--text-secondary)]">确保数据一致</td>
              </tr>
              <tr>
                <td className="p-3 text-[var(--text-secondary)]">Shell 执行</td>
                <td className="p-3 text-[var(--terminal-green)]">多层回退</td>
                <td className="p-3 text-[var(--amber)]">维护成本高</td>
                <td className="p-3 text-[var(--text-secondary)]">环境兼容性</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* Core Insight */}
      <HighlightBox title="💡 核心洞察：拒绝纯并行" variant="blue">
        <p className="text-[var(--text-secondary)] text-sm">
          Innies CLI 最显著的战略选择是<strong className="text-[var(--text-primary)]">拒绝纯并行</strong>，
          转而采用<strong className="text-[var(--text-primary)]">顺序请求队列</strong>。
          这看似反直觉，但实际上是正确的——工具输出必须在下一批次执行前被纳入上下文，
          并行执行会导致状态竞争条件。
        </p>
      </HighlightBox>
    </div>
  );
}

function SafetyTab() {
  return (
    <div className="flex flex-col gap-6">
      <Layer title="🛡️ 审批模式分层">
        <p className="text-[var(--text-secondary)] mb-4">
          四层审批模式体现了<strong className="text-[var(--text-primary)]">安全优先</strong>与<strong className="text-[var(--text-primary)]">效率需求</strong>的平衡：
        </p>

        <MermaidDiagram chart={`
graph TD
    subgraph "信任边界"
        TF[受信任文件夹<br/>Trusted Folders]
        UF[非信任文件夹<br/>Untrusted Folders]
    end

    subgraph "审批模式"
        PLAN[PLAN<br/>仅规划]
        DEFAULT[DEFAULT<br/>需确认]
        AUTOEDIT[AUTO_EDIT<br/>自动编辑]
        YOLO[YOLO<br/>全自动]
    end

    TF --> PLAN
    TF --> DEFAULT
    TF --> AUTOEDIT
    TF --> YOLO

    UF --> PLAN
    UF --> DEFAULT
    UF -.->|❌ 禁止| AUTOEDIT
    UF -.->|❌ 禁止| YOLO

    style PLAN fill:#22c55e,stroke:#16a34a,color:#fff
    style DEFAULT fill:#3b82f6,stroke:#2563eb,color:#fff
    style AUTOEDIT fill:#f59e0b,stroke:#d97706,color:#fff
    style YOLO fill:#ef4444,stroke:#dc2626,color:#fff
`} />
      </Layer>

      {/* Code Example */}
      <Layer title="📝 信任边界实现">
        <CodeBlock language="typescript" code={`// packages/core/src/config/config.ts

export enum ApprovalMode {
  PLAN = 'plan',          // 安全：仅生成计划
  DEFAULT = 'default',    // 标准：每个操作需确认
  AUTO_EDIT = 'auto-edit',// 特权：自动批准编辑
  YOLO = 'yolo',          // 最高：无需任何确认
}

// 信任检查：阻止在非信任目录使用危险模式
function validateApprovalMode(mode: ApprovalMode, cwd: string): ApprovalMode {
  const isTrusted = isTrustedFolder(cwd);

  if (!isTrusted && (mode === 'yolo' || mode === 'auto-edit')) {
    console.warn(\`⚠️ 非信任目录，降级为 DEFAULT 模式\`);
    return ApprovalMode.DEFAULT;
  }

  return mode;
}`} />

        <HighlightBox title="权衡" variant="yellow">
          <p className="text-sm">
            增加了代码复杂度，但<strong className="text-[var(--terminal-green)]">显著提升安全性</strong>。
            在不同信任上下文中提供差异化的用户体验。
          </p>
        </HighlightBox>
      </Layer>

      {/* Context Compression */}
      <Layer title="🗜️ 智能压缩分割点">
        <p className="text-[var(--text-secondary)] mb-4">
          上下文压缩需要选择<strong className="text-[var(--text-primary)]">语义安全</strong>的分割点：
        </p>

        <CodeBlock language="typescript" code={`// packages/core/src/services/chatCompressionService.ts

const COMPRESSION_TOKEN_THRESHOLD = 0.7; // 70% 触发压缩
const COMPRESSION_PRESERVE_THRESHOLD = 0.3; // 保留最近 30%

function findSafeSplitPoint(messages: Message[]): number {
  // 策略：在用户消息之间分割，而非工具调用中间
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];

    // 安全分割点：用户消息的边界
    if (msg.role === 'user' && !isPartOfToolCallChain(msg)) {
      return i;
    }
  }

  return 0; // 回退：保留所有
}

// 为什么不在工具调用中间分割？
// 1. 工具输入和输出必须成对保留
// 2. 中间分割会丢失执行上下文
// 3. LLM 需要完整的工具调用链来理解状态`} />

        <MermaidDiagram chart={`
sequenceDiagram
    participant H as 历史消息
    participant C as 压缩服务
    participant S as 摘要

    Note over H: 消息序列
    H->>C: 检测到超过 70% 阈值
    C->>C: 寻找安全分割点
    Note over C: 在用户消息边界分割
    C->>S: 压缩旧消息为摘要
    C->>H: 保留最近 30% 消息
    Note over H: [摘要] + [近期消息]
`} />
      </Layer>
    </div>
  );
}

function PerformanceTab() {
  return (
    <div className="flex flex-col gap-6">
      <Layer title="⚡ 并行文件发现">
        <p className="text-[var(--text-secondary)] mb-4">
          BFS 文件搜索采用<strong className="text-[var(--text-primary)]">批量并行</strong>策略：
        </p>

        <CodeBlock language="typescript" code={`// packages/core/src/utils/bfsFileSearch.ts

const PARALLEL_BATCH_SIZE = 15; // 并行批次大小

async function bfsFileSearch(startDir: string): Promise<string[]> {
  const queue: string[] = [startDir];
  let queueHead = 0; // O(1) 指针，避免 splice O(n)

  while (queueHead < queue.length) {
    // 取出当前批次
    const currentBatch = queue.slice(queueHead, queueHead + PARALLEL_BATCH_SIZE);
    queueHead += currentBatch.length;

    // 并行读取目录
    const readPromises = currentBatch.map(async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      return { dir, entries };
    });

    const results = await Promise.all(readPromises);

    // 处理结果
    for (const { dir, entries } of results) {
      for (const entry of entries) {
        if (entry.isDirectory()) {
          queue.push(path.join(dir, entry.name));
        }
      }
    }
  }
}`} />

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg">
            <div className="text-[var(--terminal-green)] font-semibold mb-1">✅ 选择</div>
            <div className="text-[var(--text-secondary)] text-sm">指针式队列 + 并行批读</div>
          </div>
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg">
            <div className="text-[var(--amber)] font-semibold mb-1">⚠️ 取舍</div>
            <div className="text-[var(--text-secondary)] text-sm">更复杂的队列管理逻辑</div>
          </div>
        </div>
      </Layer>

      {/* Encoding Cache Strategy */}
      <Layer title="🔤 非对称缓存策略">
        <CodeBlock language="typescript" code={`// packages/core/src/utils/systemEncoding.ts

// 系统编码：稳定，缓存永久
let cachedSystemEncoding: string | null | undefined = undefined;

// undefined = 未检测, null = 检测失败, string = 有效值
function getEncodingForBuffer(buffer: Buffer): string {
  // 首次检测系统编码
  if (cachedSystemEncoding === undefined) {
    // Windows: execSync('chcp') 开销大
    // Unix: 环境变量解析
    cachedSystemEncoding = detectSystemEncoding();
  }

  // 系统编码有效，直接使用（性能优先）
  if (cachedSystemEncoding) {
    return cachedSystemEncoding;
  }

  // 系统编码无效，逐个 buffer 检测（准确性优先）
  return detectBufferEncoding(buffer);
}`} />

        <MermaidDiagram chart={`
flowchart TD
    A[getEncodingForBuffer] --> B{系统编码已缓存?}
    B -->|undefined| C[检测系统编码]
    C --> D{检测成功?}
    D -->|是| E[缓存并返回]
    D -->|否| F[缓存 null]

    B -->|string| E
    B -->|null| G[检测 Buffer 编码]
    F --> G

    style E fill:#22c55e,stroke:#16a34a,color:#fff
    style G fill:#f59e0b,stroke:#d97706,color:#fff
`} />

        <HighlightBox title="设计洞察" variant="green">
          <p className="text-sm">
            系统编码稳定但检测昂贵 → 永久缓存；Buffer 编码可能变化 → 每次检测。
            非对称缓存正确平衡了性能与准确性。
          </p>
        </HighlightBox>
      </Layer>

      {/* Model Config Cache */}
      <Layer title="⏱️ 模型配置缓存 TTL">
        <CodeBlock language="typescript" code={`// packages/core/src/innies/modelConfigCache.ts

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 分钟 TTL

class ModelConfigCache {
  private static instance: ModelConfigCache;
  private cache: Map<string, { config: ModelConfig; timestamp: number }>;

  async getConfig(model: string): Promise<ModelConfig> {
    const cached = this.cache.get(model);

    // 缓存有效且未过期
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.config;
    }

    // 重新获取配置
    const config = await fetchModelConfig(model);
    this.cache.set(model, { config, timestamp: Date.now() });

    return config;
  }
}`} />

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg text-center">
            <div className="text-[var(--cyber-blue)] text-xl font-bold">5 min</div>
            <div className="text-[var(--text-muted)] text-xs">TTL 时长</div>
          </div>
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg text-center">
            <div className="text-[var(--terminal-green)] text-xl font-bold">单例</div>
            <div className="text-[var(--text-muted)] text-xs">全局共享</div>
          </div>
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg text-center">
            <div className="text-[var(--amber)] text-xl font-bold">惰性</div>
            <div className="text-[var(--text-muted)] text-xs">按需加载</div>
          </div>
        </div>
      </Layer>
    </div>
  );
}

function CorrectnessTab() {
  return (
    <div className="flex flex-col gap-6">
      <Layer title="🔄 工具执行队列">
        <p className="text-[var(--text-secondary)] mb-4">
          <strong className="text-[var(--error)]">拒绝并行</strong>是 Innies CLI 最重要的架构决策之一：
        </p>

        <CodeBlock language="typescript" code={`// packages/core/src/core/coreToolScheduler.ts

class CoreToolScheduler {
  private requestQueue: Array<{
    request: ToolRequest;
    signal: AbortSignal;
    resolve: (result: ToolResult) => void;
    reject: (error: Error) => void;
  }> = [];

  private isExecuting = false;

  async schedule(request: ToolRequest, signal: AbortSignal): Promise<ToolResult> {
    // 如果正在执行，加入队列等待
    if (this.isExecuting) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ request, signal, resolve, reject });
      });
    }

    return this._execute(request, signal);
  }

  private async _execute(request: ToolRequest, signal: AbortSignal): Promise<ToolResult> {
    this.isExecuting = true;

    try {
      const result = await this.runTools(request);
      return result;
    } finally {
      this.isExecuting = false;

      // 处理队列中的下一个请求
      if (this.requestQueue.length > 0) {
        const next = this.requestQueue.shift()!;
        this._execute(next.request, next.signal)
          .then(next.resolve)
          .catch(next.reject);
      }
    }
  }
}`} />

        <MermaidDiagram chart={`
sequenceDiagram
    participant R1 as 请求 1
    participant R2 as 请求 2
    participant Q as 执行队列
    participant E as 执行器
    participant C as 上下文

    R1->>Q: 入队
    Q->>E: 立即执行
    R2->>Q: 入队（等待）
    Note over Q: isExecuting = true

    E->>C: 工具结果写入上下文
    E->>Q: 完成，释放锁
    Q->>E: 执行 R2
    Note over C: R2 能看到 R1 的结果
`} />

        <HighlightBox title="为什么不并行？" variant="blue">
          <p className="text-sm">
            工具结果必须在下一批次执行前被 LLM 纳入上下文。
            并行执行会导致竞态条件：后续工具可能基于过时的状态做决策。
          </p>
        </HighlightBox>
      </Layer>

      {/* Loop Detection */}
      <Layer title="🔁 三层循环检测">
        <CodeBlock language="typescript" code={`// packages/core/src/services/loopDetectionService.ts

const TOOL_CALL_LOOP_THRESHOLD = 5;    // 工具调用重复阈值
const CONTENT_LOOP_THRESHOLD = 10;      // 内容重复阈值
const LLM_CHECK_TURN_THRESHOLD = 30;    // LLM 检测触发轮次

class LoopDetectionService {
  // 第一层：精确匹配（快速）
  private checkToolCallLoop(calls: ToolCall[]): boolean {
    const recent = calls.slice(-TOOL_CALL_LOOP_THRESHOLD);
    if (recent.length < TOOL_CALL_LOOP_THRESHOLD) return false;

    const hashes = recent.map(c => hashToolCall(c));
    return new Set(hashes).size === 1; // 全部相同
  }

  // 第二层：内容哈希（中速）
  private checkContentLoop(contents: string[]): boolean {
    const chunks = extractChunks(contents);
    const counts = new Map<string, number>();

    for (const chunk of chunks) {
      const hash = hashContent(chunk);
      counts.set(hash, (counts.get(hash) || 0) + 1);

      if (counts.get(hash)! >= CONTENT_LOOP_THRESHOLD) {
        return true;
      }
    }
    return false;
  }

  // 第三层：LLM 判断（最准确但最慢）
  private async checkWithLLM(history: Message[]): Promise<boolean> {
    if (history.length < LLM_CHECK_TURN_THRESHOLD) return false;

    // 动态间隔：MIN=5, MAX=15 轮
    if (!this.shouldCheckNow()) return false;

    return await askLLMForLoopDetection(history);
  }
}`} />

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-4 bg-[var(--bg-elevated)] rounded-lg">
            <div className="text-[var(--terminal-green)] font-semibold mb-2">Layer 1: 工具重复</div>
            <ul className="text-[var(--text-secondary)] text-sm space-y-1 list-disc list-inside">
              <li>阈值：5 次</li>
              <li>速度：O(1) 哈希</li>
              <li>精度：高（精确匹配）</li>
            </ul>
          </div>
          <div className="p-4 bg-[var(--bg-elevated)] rounded-lg">
            <div className="text-[var(--amber)] font-semibold mb-2">Layer 2: 内容吟唱</div>
            <ul className="text-[var(--text-secondary)] text-sm space-y-1 list-disc list-inside">
              <li>阈值：10 次</li>
              <li>速度：O(n) 扫描</li>
              <li>精度：中（模糊匹配）</li>
            </ul>
          </div>
          <div className="p-4 bg-[var(--bg-elevated)] rounded-lg">
            <div className="text-[var(--error)] font-semibold mb-2">Layer 3: LLM 检测</div>
            <ul className="text-[var(--text-secondary)] text-sm space-y-1 list-disc list-inside">
              <li>触发：30 轮后</li>
              <li>速度：慢（API 调用）</li>
              <li>精度：最高（语义理解）</li>
            </ul>
          </div>
        </div>
      </Layer>
    </div>
  );
}

function StateTab() {
  return (
    <div className="flex flex-col gap-6">
      <Layer title="📦 延迟应用模式">
        <p className="text-[var(--text-secondary)] mb-4">
          元数据（thoughts、tokens）与消息异步到达，需要队列缓冲：
        </p>

        <CodeBlock language="typescript" code={`// packages/core/src/services/chatRecordingService.ts

class ChatRecordingService {
  // 队列缓冲区
  private queuedThoughts: Array<ThoughtSummary & { timestamp: string }> = [];
  private queuedTokens: TokensSummary | null = null;

  // 元数据入队（异步到达）
  queueThought(thought: ThoughtSummary): void {
    this.queuedThoughts.push({
      ...thought,
      timestamp: new Date().toISOString(),
    });
  }

  // 工具调用时出队（关联到正确的消息）
  recordToolCall(toolCall: ToolCall): RecordedMessage {
    const message = createToolCallMessage(toolCall);

    // 出队并附加到消息
    if (this.queuedThoughts.length > 0) {
      message.thoughts = this.queuedThoughts.splice(0);
    }
    if (this.queuedTokens) {
      message.tokens = this.queuedTokens;
      this.queuedTokens = null;
    }

    return message;
  }
}`} />

        <MermaidDiagram chart={`
sequenceDiagram
    participant T as Thoughts 流
    participant K as Tokens 流
    participant Q as 队列
    participant M as 消息创建

    T->>Q: queueThought()
    K->>Q: queueTokens()
    T->>Q: queueThought()

    Note over Q: 缓冲等待

    M->>Q: recordToolCall()
    Q->>M: 出队 thoughts[]
    Q->>M: 出队 tokens

    Note over M: 消息 + 元数据
`} />
      </Layer>

      {/* Singleton Pattern */}
      <Layer title="🏛️ 单例遥测">
        <CodeBlock language="typescript" code={`// packages/core/src/telemetry/qwen-logger/qwen-logger.ts

export class QwenLogger {
  private static instance: QwenLogger;

  private constructor() {
    // 私有构造函数，强制使用单例
  }

  static getInstance(): QwenLogger {
    if (!QwenLogger.instance) {
      QwenLogger.instance = new QwenLogger();
    }
    return QwenLogger.instance;
  }

  // 测试时需要重置
  // (QwenLogger as any).instance = undefined;
}`} />

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg">
            <div className="text-[var(--terminal-green)] font-semibold mb-1">✅ 优点</div>
            <ul className="text-[var(--text-secondary)] text-sm space-y-1 list-disc list-inside">
              <li>全局唯一收集点</li>
              <li>防止重复日志</li>
              <li>状态一致性保证</li>
            </ul>
          </div>
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg">
            <div className="text-[var(--amber)] font-semibold mb-1">⚠️ 缺点</div>
            <ul className="text-[var(--text-secondary)] text-sm space-y-1 list-disc list-inside">
              <li>测试隔离困难</li>
              <li>需要显式重置</li>
              <li>模块耦合度高</li>
            </ul>
          </div>
        </div>
      </Layer>

      {/* Shell Fallback */}
      <Layer title="🐚 Shell 执行回退链">
        <MermaidDiagram chart={`
flowchart TD
    A[Shell 执行请求] --> B{lydell-node-pty<br/>可用?}
    B -->|是| C[使用现代 PTY]
    B -->|否| D{node-pty<br/>可用?}
    D -->|是| E[使用标准 PTY]
    D -->|否| F{child_process<br/>可用?}
    F -->|是| G[使用进程模式]
    F -->|否| H[无法执行]

    C --> I((成功))
    E --> I
    G --> I
    H --> J((失败))

    style C fill:#22c55e,stroke:#16a34a,color:#fff
    style E fill:#3b82f6,stroke:#2563eb,color:#fff
    style G fill:#f59e0b,stroke:#d97706,color:#fff
    style H fill:#ef4444,stroke:#dc2626,color:#fff
`} />

        <HighlightBox title="设计原因" variant="green">
          <p className="text-sm">
            PTY 提供交互式 shell 体验，但某些环境（容器、CI/CD）不支持。
            多层回退确保在任何环境下都能执行命令，代价是更多的实现逻辑需要维护。
          </p>
        </HighlightBox>
      </Layer>

      {/* Summary */}
      <HighlightBox title="📋 状态管理总结" variant="blue">
        <ul className="text-[var(--text-secondary)] text-sm space-y-1 list-disc list-inside">
          <li><strong className="text-[var(--text-primary)]">队列模式</strong>：处理异步到达的数据流</li>
          <li><strong className="text-[var(--text-primary)]">单例遥测</strong>：确保全局数据一致性</li>
          <li><strong className="text-[var(--text-primary)]">顺序执行</strong>：避免状态竞争条件</li>
          <li><strong className="text-[var(--text-primary)]">优雅降级</strong>：多层回退保证可用性</li>
        </ul>
      </HighlightBox>
    </div>
  );
}
