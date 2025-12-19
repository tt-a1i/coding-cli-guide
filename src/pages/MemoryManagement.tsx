import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';

export function MemoryManagement() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">内存与上下文管理</h2>

      {/* 概述 */}
      <Layer title="上下文管理概述" icon="🧠">
        <HighlightBox title="三大核心功能" icon="🎯" variant="blue">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="text-center">
              <div className="text-2xl mb-1">📝</div>
              <strong>记忆系统</strong>
              <p className="text-xs text-gray-400">INNIES.md 持久化知识</p>
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

      {/* 记忆系统 */}
      <Layer title="记忆系统 (Memory Tool)" icon="📝">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">🌍 全局记忆</h4>
            <code className="text-xs text-gray-400 block mb-2">~/.innies/INNIES.md</code>
            <p className="text-sm text-gray-300">
              跨所有项目共享的知识，如用户偏好、通用技术栈等
            </p>
          </div>

          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">📂 项目记忆</h4>
            <code className="text-xs text-gray-400 block mb-2">.innies/INNIES.md</code>
            <p className="text-sm text-gray-300">
              项目特定信息，如架构决策、API 约定等。<br/>
              *文件名可通过 <code>QWEN_CONFIG_DIR</code> 环境变量自定义。
            </p>
          </div>
        </div>

        <CodeBlock
          title="INNIES.md 文件结构"
          code={`# 项目说明

这是一个 React + TypeScript 项目...

## 技术栈
- React 18
- TypeScript 5
- Tailwind CSS

## 架构决策
- 使用 Context 管理全局状态
- 组件按功能模块组织

## Innies Added Memories
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

    // 支持的操作
    operations = {
        // 添加记忆
        add: async (fact: string, level: 'user' | 'project') => {
            const filePath = level === 'user'
                ? '~/.innies/INNIES.md'
                : '.innies/INNIES.md';

            const content = await readFile(filePath);
            const updated = appendToMemorySection(content, fact);
            await writeFile(filePath, updated);
        },

        // 读取记忆
        read: async (level?: 'user' | 'project') => {
            // 返回指定级别或合并的记忆
        },

        // 删除记忆
        remove: async (factIndex: number, level: 'user' | 'project') => {
            // 删除指定记忆条目
        }
    };
}

// 记忆分段
function appendToMemorySection(content: string, fact: string): string {
    const MEMORY_HEADER = '## Innies Added Memories';

    if (!content.includes(MEMORY_HEADER)) {
        return content + '\\n\\n' + MEMORY_HEADER + '\\n- ' + fact;
    }

    // 在 Memories 部分添加新条目
    return content.replace(
        MEMORY_HEADER,
        MEMORY_HEADER + '\\n- ' + fact
    );
}`}
        />
      </Layer>

      {/* 聊天压缩 */}
      <Layer title="聊天压缩 (Chat Compression)" icon="🗜️">
        <HighlightBox title="压缩触发条件" icon="⚠️" variant="orange">
          <p>
            当 Token 使用量超过模型上下文窗口的 <strong>70%</strong> 时，
            自动触发压缩，保留最近 <strong>30%</strong> 的历史。
          </p>
        </HighlightBox>

        <CodeBlock
          title="packages/core/src/services/chatCompressionService.ts"
          code={`// 压缩阈值
const COMPRESSION_TOKEN_THRESHOLD = 0.7;   // 70% 触发
const COMPRESSION_PRESERVE_THRESHOLD = 0.3; // 保留 30%

class ChatCompressionService {
    async compressIfNeeded(): Promise<boolean> {
        // 1. 检查 Token 使用量
        const tokenCount = this.telemetry.getLastPromptTokenCount();
        const maxTokens = this.config.getMaxContextTokens();

        if (tokenCount < maxTokens * COMPRESSION_TOKEN_THRESHOLD) {
            return false;  // 不需要压缩
        }

        // 2. 找到分割点（保留最近 30%）
        const history = this.geminiClient.getHistory();
        const splitIndex = this.findCompressSplitPoint(
            history,
            COMPRESSION_PRESERVE_THRESHOLD
        );

        // 3. 压缩历史前 70%
        const toCompress = history.slice(0, splitIndex);
        const summary = await this.generateSummary(toCompress);

        // 4. 构建新历史
        const newHistory = [
            // 摘要作为上下文
            {
                role: 'user',
                parts: [{ text: \`<state_snapshot>\${summary}</state_snapshot>\` }]
            },
            {
                role: 'model',
                parts: [{ text: 'Got it. Thanks for the additional context!' }]
            },
            // 保留最近的历史
            ...history.slice(splitIndex)
        ];

        // 5. 替换历史
        this.geminiClient.setHistory(newHistory);

        return true;
    }

    // 生成摘要
    private async generateSummary(messages: Content[]): Promise<string> {
        const prompt = \`
请总结以下对话的关键信息，包括：
1. 完成的任务
2. 重要的决策和上下文
3. 当前工作状态

对话内容：
\${formatMessages(messages)}
\`;

        return this.llm.generate(prompt);
    }
}`}
        />

        <div className="bg-black/30 rounded-xl p-6 mt-4">
          <h4 className="text-cyan-400 font-bold mb-4 text-center">压缩流程图</h4>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="bg-blue-400/20 border border-blue-400 rounded-lg px-3 py-2 text-center text-sm">
              <div>Token 使用</div>
              <div className="text-xs text-gray-400">&gt; 70%</div>
            </div>
            <div className="text-cyan-400">→</div>
            <div className="bg-purple-400/20 border border-purple-400 rounded-lg px-3 py-2 text-center text-sm">
              <div>找分割点</div>
              <div className="text-xs text-gray-400">保留 30%</div>
            </div>
            <div className="text-cyan-400">→</div>
            <div className="bg-orange-400/20 border border-orange-400 rounded-lg px-3 py-2 text-center text-sm">
              <div>生成摘要</div>
              <div className="text-xs text-gray-400">压缩 70%</div>
            </div>
            <div className="text-cyan-400">→</div>
            <div className="bg-green-400/20 border border-green-400 rounded-lg px-3 py-2 text-center text-sm">
              <div>替换历史</div>
              <div className="text-xs text-gray-400">摘要 + 近期</div>
            </div>
          </div>
        </div>
      </Layer>

      {/* 会话持久化 */}
      <Layer title="会话持久化 (Session Persistence)" icon="💾">
        <CodeBlock
          title="会话存储位置"
          code={`~/.innies/tmp/<project_hash>/chats/
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
            "type": "qwen",
            "content": [...],
            "toolCalls": [
                {
                    "name": "read_file",
                    "args": { "absolute_path": "/path/to/package.json" },
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

        <CodeBlock
          title="ChatRecordingService"
          code={`// packages/core/src/services/chatRecordingService.ts

class ChatRecordingService {
    private conversationFile: string;
    private cachedData: ConversationRecord | null = null;

    // 记录消息
    async recordMessage(message: MessageRecord): Promise<void> {
        await this.updateConversation(conv => {
            conv.messages.push(message);
            conv.lastUpdated = new Date().toISOString();
            return conv;
        });
    }

    // 记录工具调用
    async recordToolCalls(
        messageId: string,
        toolCalls: ToolCallRecord[]
    ): Promise<void> {
        await this.updateConversation(conv => {
            const msg = conv.messages.find(m => m.id === messageId);
            if (msg) {
                msg.toolCalls = toolCalls;
            }
            return conv;
        });
    }

    // 记录 Token 统计
    async recordMessageTokens(
        messageId: string,
        tokens: TokensSummary
    ): Promise<void> {
        await this.updateConversation(conv => {
            const msg = conv.messages.find(m => m.id === messageId);
            if (msg) {
                msg.tokens = tokens;
            }
            return conv;
        });
    }

    // 加载会话
    async loadSession(sessionId: string): Promise<ConversationRecord> {
        const files = await glob(\`session-*-\${sessionId.slice(0, 8)}.json\`);
        if (files.length === 0) {
            throw new Error('Session not found');
        }
        return JSON.parse(await readFile(files[0]));
    }
}`}
        />
      </Layer>

      {/* 会话恢复 */}
      <Layer title="会话恢复 (Resume)" icon="🔄">
        <CodeBlock
          code={`# 恢复最近的会话
innies --resume

# 恢复指定会话
innies --resume abc12345

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
    </div>
  );
}
