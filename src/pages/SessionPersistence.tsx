import { useState } from 'react';
import { RelatedPages } from '../components/RelatedPages';

// ============================================================
// Session 持久化与上下文压缩 - 深度解析页面
// ============================================================
// 涵盖：会话记录、上下文压缩、检查点恢复、设计原理

// 可折叠章节组件
function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  highlight = false
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  highlight?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`mb-6 rounded-xl border ${highlight ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-gray-700/50 bg-gray-800/30'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700/20 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className={`text-lg font-semibold ${highlight ? 'text-emerald-300' : 'text-gray-200'}`}>{title}</span>
        </div>
        <span className={`text-xl transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-700/30">
          {children}
        </div>
      )}
    </div>
  );
}

// 代码块组件
function CodeBlock({ code, language = 'typescript', title }: { code: string; language?: string; title?: string }) {
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-700/50">
      {title && (
        <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400 border-b border-gray-700/50">
          {title}
        </div>
      )}
      <pre className={`bg-gray-900/80 p-4 overflow-x-auto language-${language}`}>
        <code className="text-sm text-gray-300">{code}</code>
      </pre>
    </div>
  );
}

// 设计原理卡片
function DesignRationaleCard({ title, why, how, benefit }: {
  title: string;
  why: string;
  how: string;
  benefit: string;
}) {
  return (
    <div className="my-4 p-5 rounded-xl bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-500/30">
      <h4 className="text-lg font-semibold text-emerald-300 mb-3">💡 {title}</h4>
      <div className="space-y-3 text-sm">
        <div>
          <span className="text-yellow-400 font-medium">为什么：</span>
          <span className="text-gray-300 ml-2">{why}</span>
        </div>
        <div>
          <span className="text-cyan-400 font-medium">如何实现：</span>
          <span className="text-gray-300 ml-2">{how}</span>
        </div>
        <div>
          <span className="text-green-400 font-medium">带来的好处：</span>
          <span className="text-gray-300 ml-2">{benefit}</span>
        </div>
      </div>
    </div>
  );
}

// 会话文件结构可视化
function SessionFileVisualization() {
  return (
    <div className="my-6 p-6 bg-gray-900/50 rounded-xl border border-gray-700/50">
      <h4 className="text-lg font-semibold text-gray-200 mb-4">📁 会话存储结构</h4>
      <div className="font-mono text-sm space-y-1">
        <div className="text-gray-400">~/.gemini/</div>
        <div className="pl-4 text-gray-400">└── tmp/</div>
        <div className="pl-8 text-cyan-400">└── {'<project_hash>'}/ <span className="text-gray-500">← 项目唯一标识</span></div>
        <div className="pl-12 text-emerald-400">└── chats/</div>
        <div className="pl-16 text-yellow-400">├── session-2024-12-26T10-30-abc12345.json</div>
        <div className="pl-16 text-yellow-400">├── session-2024-12-26T14-15-def67890.json</div>
        <div className="pl-16 text-gray-500">└── ...</div>
      </div>
      <div className="mt-4 text-xs text-gray-500">
        文件名格式: session-{'{timestamp}'}-{'{sessionId_prefix}'}.json
      </div>
    </div>
  );
}

// 会话记录数据流
function SessionRecordFlow() {
  const steps = [
    { icon: '👤', label: '用户输入', color: 'text-blue-400', desc: 'recordMessage(user)' },
    { icon: '🤔', label: 'AI思考', color: 'text-purple-400', desc: 'recordThought()' },
    { icon: '🔧', label: '工具调用', color: 'text-yellow-400', desc: 'recordToolCalls()' },
    { icon: '🤖', label: 'AI响应', color: 'text-green-400', desc: 'recordMessage(gemini)' },
    { icon: '📊', label: 'Token统计', color: 'text-cyan-400', desc: 'recordMessageTokens()' },
    { icon: '💾', label: '写入磁盘', color: 'text-pink-400', desc: 'writeConversation()' },
  ];

  return (
    <div className="my-6 p-6 bg-gray-900/50 rounded-xl border border-emerald-700/50">
      <h4 className="text-lg font-semibold text-emerald-300 mb-4">📝 会话记录数据流</h4>
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center min-w-[100px]">
            <div className="text-center">
              <div className="text-2xl mb-1">{step.icon}</div>
              <div className={`text-xs font-medium ${step.color}`}>{step.label}</div>
              <div className="text-[10px] text-gray-500 mt-1">{step.desc}</div>
            </div>
            {i < steps.length - 1 && <span className="mx-2 text-gray-600">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// 压缩阈值可视化
function CompressionThresholdVisualization() {
  const [tokenUsage, setTokenUsage] = useState(75);
  const threshold = 70;

  const needsCompression = tokenUsage >= threshold;

  return (
    <div className="my-6 p-6 bg-gray-900/50 rounded-xl border border-orange-700/50">
      <h4 className="text-lg font-semibold text-orange-300 mb-4">📊 压缩阈值判断</h4>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">
          当前 Token 使用率: <span className="text-white font-mono">{tokenUsage}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={tokenUsage}
          onChange={(e) => setTokenUsage(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${needsCompression ? 'bg-red-500' : 'bg-green-500'}`}
          style={{ width: `${tokenUsage}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-yellow-400"
          style={{ left: `${threshold}%` }}
        />
        <div
          className="absolute -top-6 text-xs text-yellow-400 font-mono"
          style={{ left: `${threshold}%`, transform: 'translateX(-50%)' }}
        >
          70% 阈值
        </div>
      </div>

      <div className={`mt-4 p-3 rounded-lg ${needsCompression ? 'bg-red-900/30 border border-red-700/50' : 'bg-green-900/30 border border-green-700/50'}`}>
        <span className={needsCompression ? 'text-red-400' : 'text-green-400'}>
          {needsCompression
            ? '⚠️ 超过阈值，需要触发压缩'
            : '✓ 未超过阈值，无需压缩'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="text-gray-400">压缩触发阈值</div>
          <div className="text-xl font-mono text-orange-400">70%</div>
          <div className="text-xs text-gray-500">COMPRESSION_TOKEN_THRESHOLD</div>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="text-gray-400">保留历史比例</div>
          <div className="text-xl font-mono text-cyan-400">30%</div>
          <div className="text-xs text-gray-500">COMPRESSION_PRESERVE_THRESHOLD</div>
        </div>
      </div>
    </div>
  );
}

// 压缩分割点算法可视化
function CompressionSplitPointVisualization() {
  const messages = [
    { role: 'user', content: '帮我分析这个代码...', chars: 200 },
    { role: 'model', content: '好的，我来看看...', chars: 500 },
    { role: 'user', content: '还有这个函数...', chars: 150 },
    { role: 'model', content: '这个函数的作用是...', chars: 800 },
    { role: 'user', content: '能优化一下吗？', chars: 100 },
    { role: 'model', content: '可以这样优化...', chars: 600, hasFunctionCall: true },
    { role: 'user', content: '函数返回结果', chars: 300, hasFunctionResponse: true },
    { role: 'model', content: '执行成功...', chars: 400 },
    { role: 'user', content: '谢谢！', chars: 50 },
    { role: 'model', content: '不客气！', chars: 100 },
  ];

  const totalChars = messages.reduce((sum, m) => sum + m.chars, 0);
  const targetChars = totalChars * 0.7; // 压缩70%，保留30%

  let cumulative = 0;
  let splitPoint = 0;
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === 'user' && !msg.hasFunctionResponse) {
      if (cumulative >= targetChars) {
        splitPoint = i;
        break;
      }
    }
    cumulative += msg.chars;
    if (i === messages.length - 1) splitPoint = i + 1;
  }

  return (
    <div className="my-6 p-6 bg-gray-900/50 rounded-xl border border-purple-700/50">
      <h4 className="text-lg font-semibold text-purple-300 mb-4">✂️ 压缩分割点算法</h4>

      <div className="space-y-2">
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const isSplitPoint = i === splitPoint;
          const willCompress = i < splitPoint;

          return (
            <div key={i} className="flex items-center gap-2">
              {isSplitPoint && (
                <div className="absolute -ml-6 text-yellow-400 animate-pulse">✂️</div>
              )}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isUser ? 'bg-blue-600' : 'bg-green-600'}`}>
                {isUser ? 'U' : 'M'}
              </div>
              <div
                className={`flex-1 p-2 rounded-lg text-sm ${willCompress ? 'bg-red-900/30 border border-red-700/30' : 'bg-green-900/30 border border-green-700/30'}`}
              >
                <span className="text-gray-300">{msg.content}</span>
                <span className="text-xs text-gray-500 ml-2">({msg.chars} chars)</span>
                {msg.hasFunctionCall && <span className="text-xs text-yellow-400 ml-2">[函数调用]</span>}
                {msg.hasFunctionResponse && <span className="text-xs text-purple-400 ml-2">[函数响应]</span>}
              </div>
              <div className={`text-xs ${willCompress ? 'text-red-400' : 'text-green-400'}`}>
                {willCompress ? '压缩' : '保留'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-sm">
        <div className="text-gray-400">分割点选择规则：</div>
        <ul className="mt-2 space-y-1 text-gray-300 text-xs">
          <li>• 只能在 <code className="text-blue-400">user</code> 消息处分割（保持对话完整性）</li>
          <li>• 不能在 <code className="text-purple-400">functionResponse</code> 处分割（保持工具调用完整性）</li>
          <li>• 不能在 <code className="text-yellow-400">functionCall</code> 后面分割（等待函数执行完成）</li>
        </ul>
      </div>
    </div>
  );
}

// Introduction 组件
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8">
      <button
        onClick={onToggle}
        className="w-full text-left group"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4 flex items-center gap-3">
          💾 Session 持久化与上下文压缩
          <span className={`text-lg text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </h1>
      </button>

      {isExpanded && (
        <div className="space-y-4 text-gray-300 animate-fadeIn">
          <p className="text-lg">
            Gemini CLI 实现了完整的会话持久化系统，用于<strong className="text-emerald-300">记录对话历史</strong>、
            <strong className="text-cyan-300">恢复中断会话</strong>、以及<strong className="text-orange-300">智能压缩上下文</strong>。
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-emerald-900/30 rounded-xl border border-emerald-600/30">
              <div className="text-3xl mb-2">💾</div>
              <h3 className="font-semibold text-emerald-300">会话记录</h3>
              <p className="text-sm text-gray-400 mt-1">自动保存对话、工具调用、Token统计</p>
            </div>
            <div className="p-4 bg-cyan-900/30 rounded-xl border border-cyan-600/30">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-semibold text-cyan-300">会话恢复</h3>
              <p className="text-sm text-gray-400 mt-1">支持从历史记录恢复会话</p>
            </div>
            <div className="p-4 bg-orange-900/30 rounded-xl border border-orange-600/30">
              <div className="text-3xl mb-2">📦</div>
              <h3 className="font-semibold text-orange-300">上下文压缩</h3>
              <p className="text-sm text-gray-400 mt-1">智能压缩防止 Token 溢出</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 会话记录服务章节
function ChatRecordingSection() {
  return (
    <div className="pt-6 space-y-4">
      <p className="text-gray-300">
        <code className="text-emerald-400">ChatRecordingService</code> 负责将对话实时记录到磁盘，
        包括用户消息、AI响应、工具调用和Token使用统计。
      </p>

      <SessionFileVisualization />

      <DesignRationaleCard
        title="为什么按项目隔离存储"
        why="不同项目有不同的上下文和对话历史，混在一起会造成混乱"
        how="使用项目根目录的哈希值作为唯一标识，创建独立的存储目录"
        benefit="多项目并行开发时互不干扰，历史记录清晰可追溯"
      />

      <SessionRecordFlow />

      <CodeBlock
        title="packages/core/src/services/chatRecordingService.ts - 核心数据结构"
        code={`// Token 使用摘要
interface TokensSummary {
  input: number;   // 输入 Token (promptTokenCount)
  output: number;  // 输出 Token (candidatesTokenCount)
  cached: number;  // 缓存 Token (cachedContentTokenCount)
  thoughts?: number; // 思考 Token
  tool?: number;   // 工具调用 Token
  total: number;   // 总计
}

// 工具调用记录
interface ToolCallRecord {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: PartListUnion | null;
  status: Status;  // 'ok' | 'error' | ...
  timestamp: string;
  displayName?: string;
  description?: string;
}

// 消息记录（用户 or AI）
type MessageRecord = BaseMessageRecord & ConversationRecordExtra;

// 完整会话记录
interface ConversationRecord {
  sessionId: string;
  projectHash: string;
  startTime: string;
  lastUpdated: string;
  messages: MessageRecord[];
}`}
      />

      <h4 className="text-lg font-semibold text-gray-200 mt-6">增量写入优化</h4>
      <p className="text-gray-400 text-sm mb-4">
        为了避免频繁的磁盘 I/O，系统使用缓存比对策略：
      </p>

      <CodeBlock
        title="写入优化策略"
        code={`private writeConversation(conversation: ConversationRecord): void {
  // 1. 空会话不写入
  if (conversation.messages.length === 0) return;

  // 2. 内容无变化不写入（使用缓存比对）
  const newContent = JSON.stringify(conversation, null, 2);
  if (this.cachedLastConvData === newContent) return;

  // 3. 更新时间戳并写入
  conversation.lastUpdated = new Date().toISOString();
  this.cachedLastConvData = newContent;
  fs.writeFileSync(this.conversationFile, newContent);
}`}
      />

      <DesignRationaleCard
        title="为什么使用队列机制处理 Thoughts 和 Tokens"
        why="AI 的思考和 Token 统计可能在消息创建之前就产生"
        how="使用 queuedThoughts 和 queuedTokens 暂存，创建新消息时合并"
        benefit="保证数据完整性，不会丢失任何思考过程和计费信息"
      />
    </div>
  );
}

// 上下文压缩章节
function CompressionSection() {
  return (
    <div className="pt-6 space-y-4">
      <p className="text-gray-300">
        当对话历史接近模型的 Token 限制时，<code className="text-orange-400">ChatCompressionService</code>
        会自动压缩历史对话，生成摘要替换旧内容。
      </p>

      <CompressionThresholdVisualization />

      <DesignRationaleCard
        title="为什么选择 70% 作为阈值"
        why="留出 30% 的缓冲空间，确保当前对话有足够的输入输出空间"
        how="超过 70% 时触发压缩，压缩后保留最近 30% 的对话"
        benefit="在保持上下文连贯性的同时，避免 Token 溢出导致请求失败"
      />

      <CompressionSplitPointVisualization />

      <CodeBlock
        title="packages/core/src/services/chatCompressionService.ts - 分割点算法"
        code={`export function findCompressSplitPoint(
  contents: Content[],
  fraction: number,  // 1 - 0.3 = 0.7 (压缩70%)
): number {
  const charCounts = contents.map(c => JSON.stringify(c).length);
  const totalCharCount = charCounts.reduce((a, b) => a + b, 0);
  const targetCharCount = totalCharCount * fraction;

  let lastSplitPoint = 0;
  let cumulativeCharCount = 0;

  for (let i = 0; i < contents.length; i++) {
    const content = contents[i];

    // 只能在 user 消息处分割（排除 functionResponse）
    if (content.role === 'user' &&
        !content.parts?.some(part => !!part.functionResponse)) {
      if (cumulativeCharCount >= targetCharCount) {
        return i;  // 找到分割点
      }
      lastSplitPoint = i;
    }
    cumulativeCharCount += charCounts[i];
  }

  // 检查是否可以压缩全部（最后一条不能是 functionCall）
  const lastContent = contents[contents.length - 1];
  if (lastContent?.role === 'model' &&
      !lastContent?.parts?.some(part => part.functionCall)) {
    return contents.length;
  }

  return lastSplitPoint;  // 回退到最后一个有效分割点
}`}
      />

      <h4 className="text-lg font-semibold text-gray-200 mt-6">压缩流程</h4>
      <div className="my-4 p-6 bg-gray-900/50 rounded-xl border border-orange-700/50">
        <div className="space-y-4">
          {[
            { step: 1, action: '判断是否需要压缩', desc: 'tokenCount > 70% × tokenLimit(model)' },
            { step: 2, action: '找到分割点', desc: 'findCompressSplitPoint(history, 0.7)' },
            { step: 3, action: '调用模型生成摘要', desc: '使用压缩专用 prompt 生成 <state_snapshot>' },
            { step: 4, action: '构建新历史', desc: '[摘要消息, AI确认, ...保留的历史]' },
            { step: 5, action: '验证压缩结果', desc: '新 Token 数 < 原 Token 数？' },
          ].map(({ step, action, desc }) => (
            <div key={step} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-600/30 text-orange-400 flex items-center justify-center font-bold">
                {step}
              </div>
              <div>
                <div className="text-gray-200 font-medium">{action}</div>
                <div className="text-sm text-gray-500">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CodeBlock
        title="压缩后的历史结构"
        code={`// 压缩后的新历史
const newHistory = [
  {
    role: 'user',
    parts: [{ text: summary }],  // AI 生成的摘要
  },
  {
    role: 'model',
    parts: [{ text: 'Got it. Thanks for the additional context!' }],
  },
  ...historyToKeep,  // 保留的最近 30% 对话
];`}
      />

      <h4 className="text-lg font-semibold text-gray-200 mt-6">压缩状态</h4>
      <div className="grid grid-cols-2 gap-3 mt-3">
        {[
          { status: 'NOOP', desc: '无需压缩', color: 'text-gray-400' },
          { status: 'COMPRESSED', desc: '压缩成功', color: 'text-green-400' },
          { status: 'COMPRESSION_FAILED_EMPTY_SUMMARY', desc: '摘要为空', color: 'text-red-400' },
          { status: 'COMPRESSION_FAILED_INFLATED_TOKEN_COUNT', desc: '压缩后反而更大', color: 'text-red-400' },
        ].map(({ status, desc, color }) => (
          <div key={status} className="p-3 bg-gray-800/50 rounded-lg">
            <code className={`text-sm ${color}`}>{status}</code>
            <div className="text-xs text-gray-500 mt-1">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 会话恢复章节
function SessionResumeSection() {
  return (
    <div className="pt-6 space-y-4">
      <p className="text-gray-300">
        Gemini CLI 支持从历史会话恢复，让用户可以继续之前中断的对话。
      </p>

      <DesignRationaleCard
        title="为什么需要会话恢复"
        why="长对话可能被意外中断（网络问题、程序崩溃），用户不希望丢失上下文"
        how="使用 resumedSessionData 参数初始化，加载历史文件并更新 sessionId"
        benefit="用户可以无缝继续之前的工作，不需要重新解释上下文"
      />

      <CodeBlock
        title="会话恢复流程"
        code={`// 恢复会话数据结构
interface ResumedSessionData {
  conversation: ConversationRecord;  // 历史对话内容
  filePath: string;                  // 会话文件路径
}

// 初始化时恢复
initialize(resumedSessionData?: ResumedSessionData): void {
  if (resumedSessionData) {
    // 使用现有会话文件
    this.conversationFile = resumedSessionData.filePath;
    this.sessionId = resumedSessionData.conversation.sessionId;

    // 更新 sessionId（可能是新的 session）
    this.updateConversation((conversation) => {
      conversation.sessionId = this.sessionId;
    });

    // 清除缓存强制重新读取
    this.cachedLastConvData = null;
  } else {
    // 创建新会话...
  }
}`}
      />

      <h4 className="text-lg font-semibold text-gray-200 mt-6">Welcome Back 流程</h4>
      <div className="my-4 p-4 bg-cyan-900/20 rounded-xl border border-cyan-700/50">
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl">🔍</div>
            <div className="text-gray-400">扫描历史会话</div>
          </div>
          <span className="text-gray-600">→</span>
          <div className="text-center">
            <div className="text-2xl">📋</div>
            <div className="text-gray-400">展示会话列表</div>
          </div>
          <span className="text-gray-600">→</span>
          <div className="text-center">
            <div className="text-2xl">👆</div>
            <div className="text-gray-400">用户选择</div>
          </div>
          <span className="text-gray-600">→</span>
          <div className="text-center">
            <div className="text-2xl">📂</div>
            <div className="text-gray-400">加载历史</div>
          </div>
          <span className="text-gray-600">→</span>
          <div className="text-center">
            <div className="text-2xl">✨</div>
            <div className="text-gray-400">继续对话</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 最佳实践章节
function BestPracticesSection() {
  return (
    <div className="pt-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-900/20 rounded-xl border border-green-700/50">
          <h4 className="text-green-400 font-semibold mb-2">✓ 推荐做法</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• 定期让 AI 生成阶段性总结</li>
            <li>• 使用 CLAUDE.md 记录关键决策</li>
            <li>• 对长对话主动触发压缩</li>
            <li>• 保存重要会话到 checkpoints</li>
          </ul>
        </div>
        <div className="p-4 bg-red-900/20 rounded-xl border border-red-700/50">
          <h4 className="text-red-400 font-semibold mb-2">✗ 避免做法</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• 在一个会话中处理过多不相关任务</li>
            <li>• 忽略 Token 使用量警告</li>
            <li>• 手动编辑会话 JSON 文件</li>
            <li>• 删除 tmp 目录中的会话文件</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// 边界情况与故障恢复章节
function EdgeCasesSection() {
  return (
    <div className="pt-6 space-y-6">
      <p className="text-gray-300">
        以下是会话持久化系统可能遇到的边界情况及其处理方式：
      </p>

      {/* 边界情况表格 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-left text-gray-400">
              <th className="py-2 px-2">场景</th>
              <th className="py-2 px-2">触发条件</th>
              <th className="py-2 px-2">系统行为</th>
              <th className="py-2 px-2">用户影响</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-gray-800">
              <td className="py-2 px-2 text-red-400">会话文件损坏</td>
              <td className="py-2 px-2 text-xs">JSON 解析失败</td>
              <td className="py-2 px-2 text-xs">跳过该文件，不显示在列表</td>
              <td className="py-2 px-2 text-xs">该会话无法恢复</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-2 px-2 text-amber-400">压缩摘要为空</td>
              <td className="py-2 px-2 text-xs">模型返回空响应</td>
              <td className="py-2 px-2 text-xs">返回 COMPRESSION_FAILED_EMPTY_SUMMARY</td>
              <td className="py-2 px-2 text-xs">保持原有历史不变</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-2 px-2 text-amber-400">压缩后膨胀</td>
              <td className="py-2 px-2 text-xs">新 Token 数 {'>'} 原 Token 数</td>
              <td className="py-2 px-2 text-xs">返回 COMPRESSION_FAILED_INFLATED_TOKEN_COUNT</td>
              <td className="py-2 px-2 text-xs">保持原有历史不变</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-2 px-2 text-cyan-400">项目哈希变化</td>
              <td className="py-2 px-2 text-xs">项目目录移动或重命名</td>
              <td className="py-2 px-2 text-xs">生成新的项目哈希</td>
              <td className="py-2 px-2 text-xs">旧会话不再关联</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-2 px-2 text-purple-400">磁盘空间不足</td>
              <td className="py-2 px-2 text-xs">写入会话文件失败</td>
              <td className="py-2 px-2 text-xs">静默失败，继续运行</td>
              <td className="py-2 px-2 text-xs">当前会话不会持久化</td>
            </tr>
            <tr>
              <td className="py-2 px-2 text-gray-400">找不到分割点</td>
              <td className="py-2 px-2 text-xs">最后消息是 functionCall</td>
              <td className="py-2 px-2 text-xs">回退到 lastSplitPoint</td>
              <td className="py-2 px-2 text-xs">可能压缩更多或更少</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 故障恢复指南 */}
      <div className="bg-gray-800/50 rounded-xl p-5">
        <h4 className="text-lg font-semibold text-gray-200 mb-4">🔧 常见问题排查</h4>
        <div className="space-y-4">
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-amber-400 font-medium mb-2">问题: Welcome Back 列表为空</div>
            <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
              <li>检查 <code>ui.enableWelcomeBack</code> 是否为 true</li>
              <li>确认当前目录与之前会话的目录一致</li>
              <li>检查 <code>~/.gemini/tmp/*/chats/</code> 目录是否存在会话文件</li>
            </ul>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-amber-400 font-medium mb-2">问题: 会话恢复后内容不完整</div>
            <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
              <li>可能会话在压缩后中断，部分历史已被摘要替换</li>
              <li>检查会话 JSON 中是否有 <code>state_snapshot</code> 标记</li>
              <li>考虑从 Git checkpoint 恢复更完整的状态</li>
            </ul>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-amber-400 font-medium mb-2">问题: 手动编辑后无法加载</div>
            <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
              <li>使用 <code>jq . session.json</code> 验证 JSON 格式</li>
              <li>确保必须字段存在: sessionId, projectHash, messages</li>
              <li>删除损坏的文件，从备份恢复</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// 为什么这样设计章节
function DesignDecisionsSection() {
  return (
    <div className="pt-6 space-y-6">
      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 rounded-xl p-5 border border-blue-500/30">
        <h4 className="text-lg font-semibold text-blue-300 mb-3">1. 为什么按项目哈希隔离会话？</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400 mb-1">问题</div>
            <p className="text-gray-300">如果所有会话存储在同一目录，用户在多项目间切换时会混淆上下文</p>
          </div>
          <div>
            <div className="text-gray-400 mb-1">解决方案</div>
            <p className="text-gray-300">使用项目根目录的哈希值创建隔离的存储空间，确保每个项目的会话独立</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 rounded-xl p-5 border border-purple-500/30">
        <h4 className="text-lg font-semibold text-purple-300 mb-3">2. 为什么选择 70% 作为压缩阈值？</h4>
        <div className="text-sm text-gray-300 space-y-2">
          <p>这是在<strong className="text-white">上下文连贯性</strong>和<strong className="text-white">可用空间</strong>之间的平衡：</p>
          <ul className="text-gray-400 space-y-1 list-disc list-inside text-xs">
            <li><strong>太高 (如 90%)</strong>: 留给新对话的空间太少，可能很快再次触发压缩</li>
            <li><strong>太低 (如 50%)</strong>: 频繁压缩导致上下文丢失过多</li>
            <li><strong>70% 的平衡</strong>: 保留 30% 空间约可支持 2-3 轮深度对话</li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 rounded-xl p-5 border border-green-500/30">
        <h4 className="text-lg font-semibold text-green-300 mb-3">3. 为什么只能在 user 消息处分割？</h4>
        <div className="text-sm text-gray-300 space-y-2">
          <p>保证对话的<strong className="text-white">语义完整性</strong>：</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-black/30 rounded p-3">
              <div className="text-red-400 mb-1">如果在 model 消息处分割</div>
              <p className="text-gray-400">AI 的回复可能被截断，失去上下文</p>
            </div>
            <div className="bg-black/30 rounded p-3">
              <div className="text-red-400 mb-1">如果在 functionResponse 处分割</div>
              <p className="text-gray-400">工具调用和结果被分离，AI 无法理解</p>
            </div>
          </div>
          <p className="text-cyan-400 mt-2">user 消息是自然的对话边界，分割后仍保持语义完整</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 rounded-xl p-5 border border-amber-500/30">
        <h4 className="text-lg font-semibold text-amber-300 mb-3">4. 为什么使用队列缓存 Thoughts 和 Tokens？</h4>
        <div className="text-sm text-gray-300 space-y-2">
          <p><strong className="text-white">时序问题</strong>：AI 的思考过程和 Token 统计可能在消息对象创建之前就产生。</p>
          <div className="bg-black/30 rounded p-3 mt-2">
            <CodeBlock code={`// 时序示例
1. API 返回 thinking 数据 → queuedThoughts.push(thought)
2. API 返回 token 统计 → queuedTokens.push(tokens)
3. 用户消息创建 → message.thoughts = queuedThoughts.splice()
                  message.tokens = queuedTokens.splice()

// 如果不用队列，这些数据会丢失`} language="typescript" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-900/30 to-rose-900/20 rounded-xl p-5 border border-red-500/30">
        <h4 className="text-lg font-semibold text-red-300 mb-3">5. 为什么使用增量写入优化？</h4>
        <div className="text-sm text-gray-300 space-y-2">
          <p><strong className="text-white">性能考量</strong>：每次消息都写入磁盘会造成：</p>
          <ul className="text-gray-400 space-y-1 list-disc list-inside text-xs">
            <li>大量磁盘 I/O 操作</li>
            <li>SSD 磨损增加</li>
            <li>潜在的 I/O 阻塞</li>
          </ul>
          <p className="text-cyan-400 mt-2">
            通过 <code>cachedLastConvData</code> 比对内容，只有真正变化时才写入。
          </p>
        </div>
      </div>
    </div>
  );
}

// 关联页面配置
const sessionRelatedPages = [
  { id: 'turn-state-machine', label: 'Turn 状态机', description: '了解 CompressionStatus 的来源' },
  { id: 'token-accounting', label: 'Token 计费系统', description: '了解 Token 计数机制' },
  { id: 'memory', label: '上下文管理', description: '了解整体内存管理策略' },
  { id: 'checkpointing', label: '检查点恢复', description: '了解 Git 级别的恢复机制' },
  { id: 'history-compression-anim', label: '历史压缩动画', description: '可视化压缩过程' },
  { id: 'chat-compression-anim', label: '聊天压缩动画', description: '分割点选择可视化' },
];

// 主组件
export function SessionPersistence() {
  const [introExpanded, setIntroExpanded] = useState(true);

  return (
    <div className="max-w-4xl mx-auto">
      <Introduction isExpanded={introExpanded} onToggle={() => setIntroExpanded(!introExpanded)} />

      <CollapsibleSection
        title="会话记录服务 (ChatRecordingService)"
        icon="💾"
        defaultOpen={true}
        highlight
      >
        <ChatRecordingSection />
      </CollapsibleSection>

      <CollapsibleSection
        title="上下文压缩 (ChatCompressionService)"
        icon="📦"
        defaultOpen={true}
        highlight
      >
        <CompressionSection />
      </CollapsibleSection>

      <CollapsibleSection
        title="会话恢复 (Welcome Back)"
        icon="🔄"
        defaultOpen={false}
      >
        <SessionResumeSection />
      </CollapsibleSection>

      <CollapsibleSection
        title="最佳实践"
        icon="📋"
        defaultOpen={false}
      >
        <BestPracticesSection />
      </CollapsibleSection>

      <CollapsibleSection
        title="边界情况与故障恢复"
        icon="⚠️"
        defaultOpen={false}
      >
        <EdgeCasesSection />
      </CollapsibleSection>

      <CollapsibleSection
        title="为什么这样设计？"
        icon="💡"
        defaultOpen={false}
      >
        <DesignDecisionsSection />
      </CollapsibleSection>

      <RelatedPages title="📚 相关页面" pages={sessionRelatedPages} />
    </div>
  );
}
