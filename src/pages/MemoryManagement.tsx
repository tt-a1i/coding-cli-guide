import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-600 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 flex items-center justify-between transition-colors"
      >
        <span className="flex items-center gap-2 font-semibold">
          <span>{icon}</span>
          <span>{title}</span>
        </span>
        <span className="text-gray-400">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && <div className="p-4 bg-gray-900/50">{children}</div>}
    </div>
  );
}

export function MemoryManagement() {
  const relatedPages: RelatedPage[] = [
    { id: 'memory', label: '上下文管理', description: '消息历史' },
    { id: 'token-accounting', label: 'Token计算', description: 'Token 预算' },
    { id: 'session-persistence', label: '会话持久化', description: '状态保存' },
    { id: 'gemini-chat', label: 'GeminiChatCore', description: 'AI 核心' },
    { id: 'checkpointing', label: '检查点', description: '状态快照' },
    { id: 'history-compression-anim', label: '压缩', description: '历史压缩' },
  ];

  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">内存与上下文管理</h2>

      {/* 30秒速览 */}
      <HighlightBox title="⏱️ 30秒速览" icon="🎯" variant="blue">
        <ul className="space-y-2 text-sm">
          <li>
            • <strong>压缩触发</strong>: Token 使用量超过模型上下文窗口 70% 时自动触发
          </li>
          <li>
            • <strong>分割算法</strong>: 基于字符数的 70/30 分割，只在用户消息边界切分
          </li>
          <li>
            • <strong>摘要生成</strong>: LLM 生成 {"<state_snapshot>"} 格式的上下文快照
          </li>
          <li>
            • <strong>Token 限制</strong>: 模型名称正则匹配，支持 32K~10M 多种窗口
          </li>
        </ul>
      </HighlightBox>

      {/* 概述 */}
      <Layer title="上下文管理概述" icon="🧠">
        <HighlightBox title="三大核心功能" icon="🎯" variant="blue">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="text-center">
              <div className="text-2xl mb-1">📝</div>
              <strong>记忆系统</strong>
              <p className="text-xs text-gray-400">GEMINI.md 持久化知识</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🗜️</div>
              <strong>聊天压缩</strong>
              <p className="text-xs text-gray-400">Token 使用优化</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">💾</div>
              <strong>会话持久化</strong>
              <p className="text-xs text-gray-400">聊天记录保存</p>
            </div>
          </div>
        </HighlightBox>
      </Layer>

      {/* 聊天压缩核心 */}
      <Layer title="聊天压缩 (Chat Compression)" icon="🗜️">
        <MermaidDiagram
          title="压缩决策流程"
          chart={`flowchart TB
    A[检查 Token 使用量] --> B{超过 70% 阈值?}
    B -->|否| C[不压缩 NOOP]
    B -->|是| D[计算分割点]
    D --> E[分割历史: 70% 压缩 / 30% 保留]
    E --> F[生成摘要 state_snapshot]
    F --> G{摘要有效?}
    G -->|空摘要| H[失败: EMPTY_SUMMARY]
    G -->|Token 膨胀| I[失败: INFLATED_TOKEN_COUNT]
    G -->|有效| J[替换历史: 摘要 + 保留部分]
    J --> K[成功: COMPRESSED]

    style C fill:#4a5568
    style H fill:#9b2c2c
    style I fill:#9b2c2c
    style K fill:#276749`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-bold mb-2">压缩阈值</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <code>COMPRESSION_TOKEN_THRESHOLD = 0.7</code></li>
              <li>• 当 Token 使用 &gt; 模型限制 × 70% 时触发</li>
              <li>• 可通过配置 <code>contextPercentageThreshold</code> 覆盖</li>
            </ul>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">保留比例</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <code>COMPRESSION_PRESERVE_THRESHOLD = 0.3</code></li>
              <li>• 保留最近 30% 的历史（按字符数）</li>
              <li>• 压缩前 70% 为摘要</li>
            </ul>
          </div>
        </div>
      </Layer>

      {/* 分割点算法 */}
      <CollapsibleSection title="分割点算法详解" icon="✂️" defaultOpen={true}>
        <HighlightBox title="核心约束" icon="⚠️" variant="yellow">
          <p className="text-sm">
            分割点<strong>必须</strong>在用户消息边界，且不能在 functionResponse 消息处分割。
            这确保工具调用的上下文完整性。
          </p>
        </HighlightBox>

        <MermaidDiagram
          title="分割点查找逻辑"
          chart={`flowchart LR
    subgraph History["历史消息"]
        M1[User: 问题1]
        M2[Model: 回答1]
        M3[User: 问题2]
        M4[Model: 工具调用]
        M5[User: functionResponse]
        M6[Model: 回答2]
        M7[User: 问题3]
        M8[Model: 回答3]
    end

    subgraph Candidates["候选分割点"]
        C1[✅ M1 之前]
        C2[✅ M3 之前]
        C3[❌ M5 之前 - functionResponse]
        C4[✅ M7 之前]
    end

    subgraph Target["目标: 保留 30%"]
        T1[从末尾累计字符数]
        T2[达到 30% 时选最近候选点]
    end

    M1 --> C1
    M3 --> C2
    M5 --> C3
    M7 --> C4
    C4 --> T2

    style C3 fill:#9b2c2c
    style C1 fill:#276749
    style C2 fill:#276749
    style C4 fill:#276749`}
        />

        <CodeBlock
          title="findCompressSplitPoint 实现"
          code={`// packages/core/src/services/chatCompressionService.ts:37-77

export function findCompressSplitPoint(
  contents: Content[],
  fraction: number,  // 1 - 0.3 = 0.7 (要压缩的比例)
): number {
  // 计算每条消息的字符数
  const charCounts = contents.map(c => JSON.stringify(c).length);
  const totalCharCount = charCounts.reduce((a, b) => a + b, 0);
  const targetCharCount = totalCharCount * fraction; // 目标: 压缩 70%

  let lastSplitPoint = 0;  // 0 始终有效（不压缩）
  let cumulativeCharCount = 0;

  for (let i = 0; i < contents.length; i++) {
    const content = contents[i];

    // 只在"用户消息"且"非 functionResponse"处记录候选点
    if (content.role === 'user' &&
        !content.parts?.some(part => !!part.functionResponse)) {

      // 如果已累计字符数达到目标，返回当前位置
      if (cumulativeCharCount >= targetCharCount) {
        return i;
      }
      lastSplitPoint = i;
    }
    cumulativeCharCount += charCounts[i];
  }

  // 特殊情况：检查是否可以压缩全部
  const lastContent = contents[contents.length - 1];
  if (lastContent?.role === 'model' &&
      !lastContent?.parts?.some(part => part.functionCall)) {
    return contents.length;  // 可以压缩全部
  }

  return lastSplitPoint;  // 返回最后一个有效候选点
}`}
        />

        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h4 className="text-cyan-400 font-semibold mb-3">分割边界条件</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-600">
                  <th className="py-2 px-3">场景</th>
                  <th className="py-2 px-3">处理</th>
                  <th className="py-2 px-3">原因</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">历史为空</td>
                  <td className="py-2 px-3 text-yellow-400">NOOP</td>
                  <td className="py-2 px-3">无内容可压缩</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">全是工具调用</td>
                  <td className="py-2 px-3 text-yellow-400">返回 0</td>
                  <td className="py-2 px-3">无有效分割点</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">最后是 functionCall</td>
                  <td className="py-2 px-3 text-orange-400">不压缩全部</td>
                  <td className="py-2 px-3">工具调用需保留上下文</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">最后是 model 回复</td>
                  <td className="py-2 px-3 text-green-400">可压缩全部</td>
                  <td className="py-2 px-3">对话完整，可安全压缩</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CollapsibleSection>

      {/* 压缩状态 */}
      <Layer title="压缩状态机" icon="📊">
        <MermaidDiagram
          title="CompressionStatus 状态"
          chart={`stateDiagram-v2
    [*] --> NOOP: Token < 70% 或历史为空

    [*] --> CHECKING: Token >= 70%
    CHECKING --> NOOP: 无有效分割点

    CHECKING --> COMPRESSING: 找到分割点
    COMPRESSING --> COMPRESSED: 摘要有效且 Token 减少
    COMPRESSING --> COMPRESSION_FAILED_EMPTY_SUMMARY: 摘要为空
    COMPRESSING --> COMPRESSION_FAILED_INFLATED_TOKEN_COUNT: Token 反而增加

    note right of NOOP: 不做任何改变
    note right of COMPRESSED: 历史已替换为摘要+保留部分
    note right of COMPRESSION_FAILED_EMPTY_SUMMARY: LLM 未生成有效摘要
    note right of COMPRESSION_FAILED_INFLATED_TOKEN_COUNT: 摘要比原文更长`}
        />

        <CodeBlock
          title="CompressionStatus 枚举"
          code={`// packages/core/src/core/turn.ts

export enum CompressionStatus {
  NOOP = 'NOOP',                                      // 不需要压缩
  COMPRESSED = 'COMPRESSED',                          // 压缩成功
  COMPRESSION_FAILED_EMPTY_SUMMARY = 'EMPTY_SUMMARY', // 摘要为空
  COMPRESSION_FAILED_INFLATED_TOKEN_COUNT = 'INFLATED', // Token 膨胀
}

export interface ChatCompressionInfo {
  originalTokenCount: number;  // 压缩前 Token 数
  newTokenCount: number;       // 压缩后 Token 数
  compressionStatus: CompressionStatus;
}`}
        />
      </Layer>

      {/* Token 限制系统 */}
      <Layer title="Token 限制匹配系统" icon="📏">
        <HighlightBox title="设计理念" icon="💡" variant="green">
          <p className="text-sm">
            上游 gemini-cli 使用 <strong>switch-case 映射</strong>确定模型的上下文窗口大小：不做 normalize，也没有 PATTERNS/OUTPUT_PATTERNS。
            未识别的模型返回默认值（<code>DEFAULT_TOKEN_LIMIT</code>）。
          </p>
        </HighlightBox>

        <CodeBlock
          title="tokenLimit(model)"
          code={`// packages/core/src/core/tokenLimits.ts (上游)
export const DEFAULT_TOKEN_LIMIT = 1_048_576;

export function tokenLimit(model: string): number {
  switch (model) {
    case 'gemini-1.5-pro':
      return 2_097_152;
    case 'gemini-1.5-flash':
    case 'gemini-2.5-pro':
    case 'gemini-2.5-flash':
    case 'gemini-2.0-flash':
      return 1_048_576;
    case 'gemini-2.0-flash-preview-image-generation':
      return 32_000;
    default:
      return DEFAULT_TOKEN_LIMIT;
  }
}`}
        />

        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h4 className="text-cyan-400 font-semibold mb-3">主要模型 Token 限制（上游 tokenLimit）</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-600">
                  <th className="py-2 px-3">模型系列</th>
                  <th className="py-2 px-3">上下文窗口</th>
                  <th className="py-2 px-3">输出限制</th>
                  <th className="py-2 px-3">case</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 text-purple-400">gemini-1.5-pro</td>
                  <td className="py-2 px-3">2,097,152</td>
                  <td className="py-2 px-3">（上游未定义）</td>
                  <td className="py-2 px-3"><code>case 'gemini-1.5-pro'</code></td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 text-blue-400">gemini-2.5-flash / gemini-2.5-pro / gemini-2.0-flash</td>
                  <td className="py-2 px-3">1,048,576</td>
                  <td className="py-2 px-3">（上游未定义）</td>
                  <td className="py-2 px-3"><code>case (1M group)</code></td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 text-amber-400">gemini-2.0-flash-preview-image-generation</td>
                  <td className="py-2 px-3">32,000</td>
                  <td className="py-2 px-3">（上游未定义）</td>
                  <td className="py-2 px-3"><code>case 'gemini-2.0-flash-preview-image-generation'</code></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-400">默认</td>
                  <td className="py-2 px-3">1,048,576</td>
                  <td className="py-2 px-3">（上游未定义）</td>
                  <td className="py-2 px-3">default</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <CodeBlock
          title="tokenLimit 函数"
          code={`// packages/core/src/core/tokenLimits.ts (上游)
export const DEFAULT_TOKEN_LIMIT = 1_048_576;

export function tokenLimit(model: string): number {
  switch (model) {
    case 'gemini-1.5-pro':
      return 2_097_152;
    case 'gemini-1.5-flash':
    case 'gemini-2.5-pro':
    case 'gemini-2.5-flash':
    case 'gemini-2.0-flash':
      return 1_048_576;
    case 'gemini-2.0-flash-preview-image-generation':
      return 32_000;
    default:
      return DEFAULT_TOKEN_LIMIT;
  }
}`}
        />
      </Layer>

      {/* 压缩摘要生成 */}
      <CollapsibleSection title="摘要生成机制" icon="📝">
        <MermaidDiagram
          title="摘要生成时序"
          chart={`sequenceDiagram
    autonumber
    participant Service as ChatCompressionService
    participant LLM as ContentGenerator
    participant History as 历史管理

    Service->>History: 获取待压缩历史 (前 70%)
    Service->>Service: 构建压缩 prompt

    Service->>LLM: generateContent()
    Note right of Service: systemInstruction: 压缩提示词
    Note right of Service: contents: 历史 + "生成 state_snapshot"
    LLM-->>Service: 摘要响应

    alt 摘要为空
        Service-->>Service: 返回 EMPTY_SUMMARY
    else Token 膨胀
        Service-->>Service: 返回 INFLATED_TOKEN_COUNT
    else 有效摘要
        Service->>History: 替换历史
        Note over History: [摘要消息, "Got it", ...保留部分]
        Service-->>Service: 返回 COMPRESSED
    end`}
        />

        <CodeBlock
          title="压缩提示词"
          code={`// packages/core/src/core/prompts.ts (getCompressionPrompt)

你是一个专门进行对话压缩的助手。你的任务是创建一个结构化的状态快照，
捕捉对话中的所有关键信息。

请生成一个 <state_snapshot> 标签包裹的摘要，包含：

1. **已完成的任务** - 用户请求并已完成的工作
2. **当前工作状态** - 正在进行中的任务
3. **关键决策和上下文** - 重要的技术决策、架构选择
4. **文件和代码变更** - 修改过的文件列表
5. **待处理事项** - 还未完成的请求

格式要求：
- 使用 Markdown 格式
- 保持简洁但信息完整
- 优先保留具体的代码路径和决策原因`}
        />

        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h4 className="text-cyan-400 font-semibold mb-2">生成的摘要结构</h4>
          <CodeBlock
            code={`<state_snapshot>
## 已完成任务
- 创建了 AuthenticationFlow.tsx 页面
- 添加了 OAuth2 设备授权流程文档

## 当前状态
正在扩展 MemoryManagement.tsx 文档

## 关键决策
- 使用 Mermaid 图表展示流程
- 采用折叠式章节组织长内容

## 文件变更
- src/pages/AuthenticationFlow.tsx (扩展)
- src/pages/MemoryManagement.tsx (进行中)

## 待处理
- 补充 TelemetrySystem 文档
- 添加 ConfigSystem 配置优先级说明
</state_snapshot>`}
          />
        </div>
      </CollapsibleSection>

      {/* 记忆系统 */}
      <Layer title="记忆系统 (Memory Tool)" icon="📝">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">🌍 全局记忆</h4>
            <code className="text-xs text-gray-400 block mb-2">~/.gemini/GEMINI.md</code>
            <p className="text-sm text-gray-300">
              跨所有项目共享的知识，如用户偏好、通用技术栈等
            </p>
          </div>

          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">📂 项目记忆</h4>
            <code className="text-xs text-gray-400 block mb-2">.gemini/GEMINI.md</code>
            <p className="text-sm text-gray-300">
              项目特定信息，如架构决策、API 约定等
            </p>
          </div>
        </div>

        <CodeBlock
          title="GEMINI.md 文件结构"
          code={`# 项目说明

这是一个 React + TypeScript 项目...

## 技术栈
- React 18
- TypeScript 5
- Tailwind CSS

## 架构决策
- 使用 Context 管理全局状态
- 组件按功能模块组织

## Gemini Added Memories
- 用户偏好使用函数式组件
- 测试框架是 Vitest
- 代码风格遵循 ESLint 配置`}
        />

        <CodeBlock
          title="Memory Tool 实现"
          code={`// packages/core/src/tools/memoryTool.ts

class MemoryTool extends BaseDeclarativeTool {
    readonly name = 'save_memory';
    readonly description = '保存重要信息到记忆文件';

    operations = {
        add: async (fact: string, level: 'user' | 'project') => {
            const filePath = level === 'user'
                ? '~/.gemini/GEMINI.md'
                : '.gemini/GEMINI.md';

            const content = await readFile(filePath);
            const updated = appendToMemorySection(content, fact);
            await writeFile(filePath, updated);
        },

        read: async (level?: 'user' | 'project') => {
            // 返回指定级别或合并的记忆
        },

        remove: async (factIndex: number, level: 'user' | 'project') => {
            // 删除指定记忆条目
        }
    };
}

function appendToMemorySection(content: string, fact: string): string {
    const MEMORY_HEADER = '## Gemini Added Memories';

    if (!content.includes(MEMORY_HEADER)) {
        return content + '\\n\\n' + MEMORY_HEADER + '\\n- ' + fact;
    }

    return content.replace(MEMORY_HEADER, MEMORY_HEADER + '\\n- ' + fact);
}`}
        />
      </Layer>

      {/* 会话持久化 */}
      <Layer title="会话持久化 (Session Persistence)" icon="💾">
        <CodeBlock
          title="会话存储位置"
          code={`~/.gemini/tmp/<project_hash>/chats/
└── session-2025-12-19-15-30-abc12345.json

命名格式：
session-<日期>-<时间>-<sessionId前8位>.json`}
        />

        <JsonBlock
          code={`// ConversationRecord 结构
{
    "sessionId": "abc12345-1234-5678-9abc-def012345678",
    "projectHash": "a1b2c3d4",
    "startTime": "2025-12-19T15:30:00.000Z",
    "lastUpdated": "2025-12-19T16:45:00.000Z",
    "messages": [
        {
            "id": "msg-001",
            "timestamp": "2025-12-19T15:30:05.000Z",
            "type": "user",
            "content": [{ "text": "帮我读取 package.json" }]
        },
        {
            "id": "msg-002",
            "timestamp": "2025-12-19T15:30:10.000Z",
            "type": "gemini",
            "content": [...],
            "toolCalls": [
                {
                    "name": "read_file",
                    "args": { "file_path": "package.json" },
                    "result": "..."
                }
            ],
            "tokens": {
                "input": 1234,
                "output": 567,
                "cached": 0,
                "total": 1801
            }
        }
    ]
}`}
        />
      </Layer>

      {/* 会话恢复 */}
      <Layer title="会话恢复 (Resume)" icon="🔄">
        <CodeBlock
          code={`# 恢复最近的会话
gemini --resume

# 恢复指定会话
gemini --resume abc12345

# 会话恢复流程
1. 查找匹配的会话文件
2. 加载 ConversationRecord
3. 恢复历史到 GeminiClient
4. 清理思考内容 (stripThoughtsFromHistory)
5. 继续对话`}
        />

        <HighlightBox title="恢复注意事项" icon="⚠️" variant="orange">
          <ul className="pl-5 list-disc space-y-1">
            <li>思考内容 (thoughts) 会被移除，减少 Token 使用</li>
            <li>工具调用结果会保留</li>
            <li>恢复后继续写入同一会话文件</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* Token 统计 */}
      <Layer title="Token 统计" icon="📊">
        <JsonBlock
          code={`// TokensSummary 结构
{
    "input": 1234,           // 输入 Token
    "output": 567,           // 输出 Token
    "cached": 100,           // 缓存的 Token
    "thoughts": 200,         // 思考过程 Token
    "tool": 300,             // 工具调用 Token
    "total": 2401            // 总计
}`}
        />

        <CodeBlock
          title="Token 统计来源"
          code={`// 从 API 响应中提取
const usageMetadata = response.usageMetadata;

const tokens: TokensSummary = {
    input: usageMetadata.promptTokenCount,
    output: usageMetadata.candidatesTokenCount,
    cached: usageMetadata.cachedContentTokenCount || 0,
    thoughts: usageMetadata.thoughtsTokenCount || 0,
    tool: usageMetadata.toolUsePromptTokenCount || 0,
    total: usageMetadata.totalTokenCount
};

// 记录到会话
await chatRecordingService.recordMessageTokens(messageId, tokens);

// 更新遥测
uiTelemetryService.updateTokenStats(tokens);`}
        />
      </Layer>

      {/* 源码导航 */}
      <Layer title="源码导航" icon="📂">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-600">
                <th className="py-2 px-3">功能</th>
                <th className="py-2 px-3">文件路径</th>
                <th className="py-2 px-3">关键函数/类</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">聊天压缩服务</td>
                <td className="py-2 px-3"><code>packages/core/src/services/chatCompressionService.ts</code></td>
                <td className="py-2 px-3">ChatCompressionService, findCompressSplitPoint</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">Token 限制</td>
                <td className="py-2 px-3"><code>packages/core/src/core/tokenLimits.ts</code></td>
                <td className="py-2 px-3">tokenLimit (switch-case)</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">压缩提示词</td>
                <td className="py-2 px-3"><code>packages/core/src/core/prompts.ts</code></td>
                <td className="py-2 px-3">getCompressionPrompt</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">会话录制</td>
                <td className="py-2 px-3"><code>packages/core/src/services/chatRecordingService.ts</code></td>
                <td className="py-2 px-3">ChatRecordingService</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">记忆工具</td>
                <td className="py-2 px-3"><code>packages/core/src/tools/memoryTool.ts</code></td>
                <td className="py-2 px-3">MemoryTool, appendToMemorySection</td>
              </tr>
              <tr>
                <td className="py-2 px-3">压缩状态</td>
                <td className="py-2 px-3"><code>packages/core/src/core/turn.ts</code></td>
                <td className="py-2 px-3">CompressionStatus, ChatCompressionInfo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* 为什么这样设计内存管理 */}
      <Layer title="为什么这样设计内存管理" icon="🤔" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 设计决策 1 */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-bold mb-2">为什么使用 Token 预算而非消息数量限制?</h4>
            <p className="text-sm text-gray-300">
              消息长度差异巨大：一条消息可能是 10 个字符的问候，也可能是 10,000 字符的代码。
              按消息数量限制会导致资源浪费或意外截断。Token 预算直接对应 LLM 的实际处理成本，
              能精确控制 API 费用和响应延迟。
            </p>
          </div>

          {/* 设计决策 2 */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">为什么压缩而非删除旧消息?</h4>
            <p className="text-sm text-gray-300">
              删除会丢失上下文，导致 AI "失忆"——忘记之前的决策、文件修改、用户偏好。
              压缩通过 LLM 生成摘要，保留关键信息（任务状态、决策理由、文件变更），
              用更少的 Token 维持对话连贯性。这是在成本和质量之间的最优权衡。
            </p>
          </div>

          {/* 设计决策 3 */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">为什么分离短期和长期记忆?</h4>
            <p className="text-sm text-gray-300">
              短期记忆（会话历史）处理当前对话流程，需要高精度但可以牺牲持久性。
              长期记忆（GEMINI.md）存储跨会话的知识，如项目架构、用户偏好。
              分离设计让各层专注优化：短期追求响应速度，长期追求知识积累和检索效率。
            </p>
          </div>

          {/* 设计决策 4 */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">为什么使用 LRU 缓存?</h4>
            <p className="text-sm text-gray-300">
              用户对话模式具有时间局部性：最近讨论的文件、概念更可能被再次引用。
              LRU（最近最少使用）缓存自动淘汰冷数据，保留热数据。
              相比固定窗口，LRU 能更智能地利用有限的上下文空间，减少重复加载成本。
            </p>
          </div>

          {/* 设计决策 5 */}
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 md:col-span-2">
            <h4 className="text-cyan-400 font-bold mb-2">为什么支持多级存储?</h4>
            <p className="text-sm text-gray-300">
              不同类型的信息有不同的生命周期和访问模式：(1) 实时对话需要毫秒级响应，存于内存；
              (2) 会话记录需要持久化但访问频率低，存于本地 JSON；(3) 项目知识需要跨设备共享，
              存于 GEMINI.md 可被 Git 管理。多级存储让每类数据都能获得最适合的存储介质和访问策略。
            </p>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
