import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
 { id: 'session-persistence', label: '会话持久化', description: '会话数据存储' },
 { id: 'welcome-back', label: '会话恢复', description: '恢复历史会话' },
 { id: 'memory', label: '上下文管理', description: '历史消息管理' },
 { id: 'telemetry', label: '遥测系统', description: '指标收集' },
 { id: 'token-accounting', label: 'Token计费', description: 'Token 统计' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-lg border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">📝</span>
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
 自动将对话历史（消息、工具调用、Token 统计、思考过程）持久化到 JSON 文件，支持会话恢复和分析
 </p>
 </div>

 {/* 关键数字 */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">2</div>
 <div className="text-xs text-dim">消息类型</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">6</div>
 <div className="text-xs text-dim">Token 指标</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">5</div>
 <div className="text-xs text-dim">工具调用字段</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-amber-500">JSON</div>
 <div className="text-xs text-dim">存储格式</div>
 </div>
 </div>

 {/* 核心流程 */}
 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">录制流程</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 消息/思考
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 队列缓冲
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 合并写入
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-amber-500/20 text-amber-500 rounded-lg border border-amber-500/30">
 JSON 文件
 </span>
 </div>
 </div>

 {/* 源码入口 */}
 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">📍 源码入口:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/core/src/services/chatRecordingService.ts
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function ChatRecording() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const recordingFlowChart = `flowchart TD
 init([initialize])
 resume{恢复会话?}
 create[创建新会话文件]
 load[加载已有文件]
 msg([recordMessage])
 thought([recordThought])
 tokens([recordMessageTokens])
 tools([recordToolCalls])
 queue[(队列缓冲)]
 update[updateConversation]
 write[writeConversation]
 file[(JSON 文件)]

 init --> resume
 resume -->|是| load
 resume -->|否| create
 create --> file
 load --> file

 msg --> update
 thought --> queue
 tokens --> update
 tools --> update

 queue --> update
 update --> write
 write --> file

 style init fill:#22d3ee,color:#000
 style queue fill:#a855f7,color:#fff
 style update fill:#22c55e,color:#000
 style file fill:#f59e0b,color:#000`;

 const dataTypesCode = `// packages/core/src/services/chatRecordingService.ts

/** Token 使用摘要 */
export interface TokensSummary {
 input: number; // promptTokenCount
 output: number; // candidatesTokenCount
 cached: number; // cachedContentTokenCount
 thoughts?: number; // thoughtsTokenCount
 tool?: number; // toolUsePromptTokenCount
 total: number; // totalTokenCount
}

/** 消息基础字段 */
export interface BaseMessageRecord {
 id: string;
 timestamp: string;
 content: PartListUnion;
}

/** 工具调用记录 */
export interface ToolCallRecord {
 id: string;
 name: string;
 args: Record<string, unknown>;
 result?: PartListUnion | null;
 status: Status;
 timestamp: string;
 // UI 显示字段
 displayName?: string;
 description?: string;
 resultDisplay?: string;
 renderOutputAsMarkdown?: boolean;
}`;

 const messageTypeCode = `/** 消息类型 */
export type ConversationRecordExtra =
 | { type: 'user' }
 | {
 type: 'model'; // AI 助手消息
 toolCalls?: ToolCallRecord[];
 thoughts?: Array<ThoughtSummary & { timestamp: string }>;
 tokens?: TokensSummary | null;
 model?: string;
 };

/** 完整消息记录 */
export type MessageRecord = BaseMessageRecord & ConversationRecordExtra;

/** 会话记录 */
export interface ConversationRecord {
 sessionId: string;
 projectHash: string;
 startTime: string;
 lastUpdated: string;
 messages: MessageRecord[];
}`;

 const serviceCode = `export class ChatRecordingService {
 private conversationFile: string | null = null;
 private cachedLastConvData: string | null = null;
 private sessionId: string;
 private projectHash: string;
 private queuedThoughts: Array<ThoughtSummary & { timestamp: string }> = [];
 private queuedTokens: TokensSummary | null = null;
 private config: Config;

 constructor(config: Config) {
 this.config = config;
 this.sessionId = config.getSessionId();
 this.projectHash = getProjectHash(config.getProjectRoot());
 }

 /** 初始化服务 */
 initialize(resumedSessionData?: ResumedSessionData): void {
 if (resumedSessionData) {
 // 恢复已有会话
 this.conversationFile = resumedSessionData.filePath;
 this.sessionId = resumedSessionData.conversation.sessionId;
 this.updateConversation((conv) => {
 conv.sessionId = this.sessionId;
 });
 } else {
 // 创建新会话
 const chatsDir = path.join(
 this.config.storage.getProjectTempDir(),
 'chats',
 );
 fs.mkdirSync(chatsDir, { recursive: true });

 const timestamp = new Date().toISOString()
 .slice(0, 16).replace(/:/g, '-');
 const filename = \`session-\${timestamp}-\${this.sessionId.slice(0, 8)}.json\`;
 this.conversationFile = path.join(chatsDir, filename);

 this.writeConversation({
 sessionId: this.sessionId,
 projectHash: this.projectHash,
 startTime: new Date().toISOString(),
 lastUpdated: new Date().toISOString(),
 messages: [],
 });
 }
 }
}`;

 const recordMethodsCode = `/** 记录消息 */
recordMessage(message: {
 model: string;
 type: 'user' | 'model';
 content: PartListUnion;
}): void {
 this.updateConversation((conversation) => {
 const msg = this.newMessage(message.type, message.content);
 if (msg.type === 'model') {
 // 合并队列中的 thoughts 和 tokens
 conversation.messages.push({
 ...msg,
 thoughts: this.queuedThoughts,
 tokens: this.queuedTokens,
 model: message.model,
 });
 this.queuedThoughts = [];
 this.queuedTokens = null;
 } else {
 conversation.messages.push(msg);
 }
 });
}

/** 记录思考过程（先入队列） */
recordThought(thought: ThoughtSummary): void {
 this.queuedThoughts.push({
 ...thought,
 timestamp: new Date().toISOString(),
 });
}

/** 记录 Token 统计 */
recordMessageTokens(respUsageMetadata: GenerateContentResponseUsageMetadata): void {
 const tokens = {
 input: respUsageMetadata.promptTokenCount ?? 0,
 output: respUsageMetadata.candidatesTokenCount ?? 0,
 cached: respUsageMetadata.cachedContentTokenCount ?? 0,
 thoughts: respUsageMetadata.thoughtsTokenCount ?? 0,
 tool: respUsageMetadata.toolUsePromptTokenCount ?? 0,
 total: respUsageMetadata.totalTokenCount ?? 0,
 };
 // 尝试附加到最后一条消息，否则入队列
 this.updateConversation((conversation) => {
 const lastMsg = conversation.messages.at(-1);
 if (lastMsg?.type === 'model' && !lastMsg.tokens) {
 lastMsg.tokens = tokens;
 } else {
 this.queuedTokens = tokens;
 }
 });
}`;

 const toolCallsCode = `/** 记录工具调用 */
recordToolCalls(model: string, toolCalls: ToolCallRecord[]): void {
 // 从 ToolRegistry 获取元数据
 const toolRegistry = this.config.getToolRegistry();
 const enrichedToolCalls = toolCalls.map((tc) => {
 const tool = toolRegistry.getTool(tc.name);
 return {
 ...tc,
 displayName: tool?.displayName || tc.name,
 description: tool?.description || '',
 renderOutputAsMarkdown: tool?.isOutputMarkdown || false,
 };
 });

 this.updateConversation((conversation) => {
 const lastMsg = conversation.messages.at(-1);

 // 如果没有 AI 消息或有新思考，创建新消息
 if (!lastMsg || lastMsg.type !== 'model' || this.queuedThoughts.length > 0) {
 const newMsg: MessageRecord = {
 ...this.newMessage('model', ''),
 type: 'model',
 toolCalls: enrichedToolCalls,
 thoughts: this.queuedThoughts,
 model,
 };
 if (this.queuedTokens) {
 newMsg.tokens = this.queuedTokens;
 this.queuedTokens = null;
 }
 this.queuedThoughts = [];
 conversation.messages.push(newMsg);
 } else {
 // 更新已有消息的工具调用
 if (!lastMsg.toolCalls) lastMsg.toolCalls = [];
 // 合并更新...
 }
 });
}`;

 const fileOpsCode = `/** 文件操作 */
private readConversation(): ConversationRecord {
 try {
 this.cachedLastConvData = fs.readFileSync(this.conversationFile!, 'utf8');
 return JSON.parse(this.cachedLastConvData);
 } catch (error) {
 // 文件不存在时返回空会话
 return {
 sessionId: this.sessionId,
 projectHash: this.projectHash,
 startTime: new Date().toISOString(),
 lastUpdated: new Date().toISOString(),
 messages: [],
 };
 }
}

private writeConversation(conversation: ConversationRecord): void {
 if (!this.conversationFile) return;
 if (conversation.messages.length === 0) return; // 无消息不写

 // 仅在内容变化时写入
 if (this.cachedLastConvData !== JSON.stringify(conversation, null, 2)) {
 conversation.lastUpdated = new Date().toISOString();
 const newContent = JSON.stringify(conversation, null, 2);
 this.cachedLastConvData = newContent;
 fs.writeFileSync(this.conversationFile, newContent);
 }
}

private updateConversation(updateFn: (conv: ConversationRecord) => void) {
 const conversation = this.readConversation();
 updateFn(conversation);
 this.writeConversation(conversation);
}`;

 return (
 <div className="space-y-8">
 <QuickSummary
 isExpanded={isSummaryExpanded}
 onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
 />

 {/* 页面标题 */}
 <section>
 <h2 className="text-2xl font-bold text-heading mb-4">会话录制服务</h2>
 <p className="text-body mb-4">
 ChatRecordingService 自动将对话历史持久化到 JSON 文件，包括用户消息、AI 响应、工具调用、
 Token 使用统计和 AI 思考过程。支持会话恢复和历史分析功能。
 </p>
 </section>

 {/* 1. 数据结构 */}
 <Layer title="数据结构" icon="📊">
 <div className="space-y-4">
 <CodeBlock code={dataTypesCode} language="typescript" title="核心类型定义" />
 <CodeBlock code={messageTypeCode} language="typescript" title="消息类型" />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="用户消息 (user)" variant="blue">
 <div className="text-sm space-y-2">
 <ul className="text-body space-y-1">
 <li>• <code>id</code>: UUID</li>
 <li>• <code>timestamp</code>: ISO 时间戳</li>
 <li>• <code>content</code>: 消息内容</li>
 <li>• <code>type</code>: "user"</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="AI 消息 (model)" variant="purple">
 <div className="text-sm space-y-2">
 <ul className="text-body space-y-1">
 <li>• <code>toolCalls</code>: 工具调用列表</li>
 <li>• <code>thoughts</code>: 思考过程</li>
 <li>• <code>tokens</code>: Token 统计</li>
 <li>• <code>model</code>: 使用的模型</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </div>
 </Layer>

 {/* 2. 录制流程 */}
 <Layer title="录制流程" icon="🔄">
 <div className="space-y-4">
 <MermaidDiagram chart={recordingFlowChart} title="录制数据流" />
 <CodeBlock code={serviceCode} language="typescript" title="ChatRecordingService 初始化" />
 </div>
 </Layer>

 {/* 3. 录制方法 */}
 <Layer title="录制方法" icon="📝">
 <div className="space-y-4">
 <CodeBlock code={recordMethodsCode} language="typescript" title="消息和思考录制" />

 <HighlightBox title="队列缓冲机制" variant="yellow">
 <div className="text-sm space-y-2 text-body">
 <p><strong>为什么需要队列？</strong></p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>思考先于消息</strong>：AI 可能先产生思考，后输出文本</li>
 <li><strong>Token 异步</strong>：Token 统计可能在消息之后到达</li>
 <li><strong>原子性</strong>：队列确保关联数据一起写入</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 4. 工具调用录制 */}
 <Layer title="工具调用录制" icon="🔧">
 <div className="space-y-4">
 <CodeBlock code={toolCallsCode} language="typescript" title="recordToolCalls" />

 <div className="overflow-x-auto">
 <table className="w-full text-sm border-collapse">
 <thead>
 <tr className="bg-surface">
 <th className="border border-edge p-3 text-left text-body">字段</th>
 <th className="border border-edge p-3 text-left text-body">来源</th>
 <th className="border border-edge p-3 text-left text-body">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr>
 <td className="border border-edge p-3"><code className="text-heading">id</code></td>
 <td className="border border-edge p-3">AI 响应</td>
 <td className="border border-edge p-3">工具调用唯一标识</td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-3"><code className="text-heading">name</code></td>
 <td className="border border-edge p-3">AI 响应</td>
 <td className="border border-edge p-3">工具名称</td>
 </tr>
 <tr>
 <td className="border border-edge p-3"><code className="text-heading">displayName</code></td>
 <td className="border border-edge p-3">ToolRegistry</td>
 <td className="border border-edge p-3">UI 显示名称</td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-3"><code className="text-heading">description</code></td>
 <td className="border border-edge p-3">ToolRegistry</td>
 <td className="border border-edge p-3">工具描述</td>
 </tr>
 <tr>
 <td className="border border-edge p-3"><code className="text-heading">status</code></td>
 <td className="border border-edge p-3">执行结果</td>
 <td className="border border-edge p-3">执行状态</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </Layer>

 {/* 5. 文件操作 */}
 <Layer title="文件操作" icon="💾">
 <div className="space-y-4">
 <CodeBlock code={fileOpsCode} language="typescript" title="读写优化" />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="存储路径" variant="blue">
 <div className="text-sm space-y-2 text-body">
 <code className="block bg-base/30 px-2 py-1 rounded text-xs">
 ~/.gemini/tmp/&lt;project_hash&gt;/chats/
 </code>
 <p className="mt-2">文件名格式：</p>
 <code className="block bg-base/30 px-2 py-1 rounded text-xs">
 session-2024-01-15T10-30-&lt;sessionId&gt;.json
 </code>
 </div>
 </HighlightBox>

 <HighlightBox title="写入优化" variant="green">
 <div className="text-sm space-y-2 text-body">
 <ul className="space-y-1">
 <li>• <strong>缓存比较</strong>：仅在内容变化时写入</li>
 <li>• <strong>延迟写入</strong>：无消息时不创建文件</li>
 <li>• <strong>时间戳更新</strong>：每次写入更新 lastUpdated</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </div>
 </Layer>

 {/* 6. 会话恢复 */}
 <Layer title="会话恢复" icon="🔙">
 <div className="space-y-4">
 <MermaidDiagram chart={`sequenceDiagram
 participant App as Application
 participant CRS as ChatRecordingService
 participant FS as FileSystem

 App->>CRS: initialize(resumedSessionData)
 alt 恢复会话
 CRS->>CRS: set conversationFile = resumedData.filePath
 CRS->>CRS: set sessionId = resumedData.sessionId
 CRS->>FS: updateConversation()
 else 新会话
 CRS->>FS: mkdirSync(chatsDir)
 CRS->>CRS: generate filename
 CRS->>FS: writeConversation(empty)
 end
 CRS->>CRS: clear queued data`} title="初始化流程" />

 <HighlightBox title="ResumedSessionData" variant="purple">
 <div className="text-sm space-y-2 text-body">
 <CodeBlock code={`export interface ResumedSessionData {
 conversation: ConversationRecord;
 filePath: string;
}`} language="typescript" title="" />
 <p className="mt-2">恢复会话时：</p>
 <ul className="list-disc pl-5 space-y-1">
 <li>继续使用原有文件</li>
 <li>更新 sessionId</li>
 <li>保留所有历史消息</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 7. 设计决策 */}
 <Layer title="设计决策" icon="💡">
 <div className="space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">为什么使用 JSON 而非数据库？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策：</strong>使用 JSON 文件存储会话记录。</p>
 <p><strong>原因：</strong></p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>简单性</strong>：无需数据库依赖</li>
 <li><strong>可读性</strong>：人类可读的格式便于调试</li>
 <li><strong>可移植</strong>：文件易于复制和分享</li>
 <li><strong>工具兼容</strong>：可用 jq 等工具分析</li>
 </ul>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-amber-500 font-bold mb-2">为什么需要队列缓冲？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策：</strong>思考和 Token 先入队列，消息写入时合并。</p>
 <p><strong>原因：</strong></p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>时序问题</strong>：思考产生在消息之前</li>
 <li><strong>数据关联</strong>：确保 thoughts 与消息绑定</li>
 <li><strong>减少 IO</strong>：批量写入减少磁盘操作</li>
 </ul>
 </div>
 </div>
 </div>
 </Layer>

 {/* 8. 关键文件 */}
 <Layer title="关键文件与入口" icon="📁">
 <div className="grid grid-cols-1 gap-2 text-sm">
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/services/chatRecordingService.ts
 </code>
 <span className="text-body">ChatRecordingService 完整实现</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/utils/paths.ts
 </code>
 <span className="text-body">getProjectHash 路径工具</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/utils/thoughtUtils.ts
 </code>
 <span className="text-body">ThoughtSummary 类型</span>
 </div>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
