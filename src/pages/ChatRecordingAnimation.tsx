import { useState, useCallback } from 'react';
import { CodeBlock } from '../components/CodeBlock';

interface ThoughtSummary {
 id: string;
 content: string;
 timestamp: string;
}

interface TokensSummary {
 input: number;
 output: number;
 cached: number;
 total: number;
}

interface ToolCallRecord {
 id: string;
 name: string;
 status: 'pending' | 'running' | 'completed';
}

interface MessageRecord {
 id: string;
 type: 'user' | 'gemini';
 content: string;
 timestamp: string;
 thoughts?: ThoughtSummary[];
 tokens?: TokensSummary;
 toolCalls?: ToolCallRecord[];
 model?: string;
}

interface ConversationRecord {
 sessionId: string;
 messages: MessageRecord[];
}

export default function ChatRecordingAnimation() {
 const [conversation, setConversation] = useState<ConversationRecord>({
 sessionId: 'session-' + Date.now().toString(36),
 messages: [],
 });
 const [queuedThoughts, setQueuedThoughts] = useState<ThoughtSummary[]>([]);
 const [queuedTokens, setQueuedTokens] = useState<TokensSummary | null>(null);
 const [operationLog, setOperationLog] = useState<string[]>([]);
 const [isSimulating, setIsSimulating] = useState(false);

 const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

 const addLog = useCallback((message: string) => {
 setOperationLog(prev => [message, ...prev].slice(0, 20));
 }, []);

 const generateId = () => Math.random().toString(36).substring(2, 10);

 // Record a thought (queued until next message)
 const recordThought = useCallback((content: string) => {
 const thought: ThoughtSummary = {
 id: generateId(),
 content,
 timestamp: new Date().toISOString(),
 };
 setQueuedThoughts(prev => [...prev, thought]);
 addLog(`💭 recordThought() → 队列: "${content.substring(0, 30)}..."`);
 }, [addLog]);

 // Record tokens (attached to last message or queued)
 const recordTokens = useCallback((tokens: TokensSummary) => {
 setConversation(prev => {
 const lastMsg = prev.messages[prev.messages.length - 1];
 if (lastMsg && lastMsg.type === 'gemini' && !lastMsg.tokens) {
 // Attach to last gemini message
 addLog(`📊 recordTokens() → 附加到消息 #${prev.messages.length}`);
 return {
 ...prev,
 messages: prev.messages.map((m, i) =>
 i === prev.messages.length - 1 ? { ...m, tokens } : m
 ),
 };
 }
 // Queue for next message
 addLog('📊 recordTokens() → 排队等待');
 setQueuedTokens(tokens);
 return prev;
 });
 }, [addLog]);

 // Record user message
 const recordUserMessage = useCallback((content: string) => {
 const msg: MessageRecord = {
 id: generateId(),
 type: 'user',
 content,
 timestamp: new Date().toISOString(),
 };
 setConversation(prev => ({
 ...prev,
 messages: [...prev.messages, msg],
 }));
 addLog(`👤 recordMessage(user) → "${content.substring(0, 30)}..."`);
 }, [addLog]);

 // Record gemini message (includes queued thoughts and tokens)
 const recordGeminiMessage = useCallback((content: string, model: string = 'gemini-1.5-pro') => {
 setConversation(prev => {
 const msg: MessageRecord = {
 id: generateId(),
 type: 'gemini',
 content,
 timestamp: new Date().toISOString(),
 thoughts: queuedThoughts.length > 0 ? [...queuedThoughts] : undefined,
 tokens: queuedTokens || undefined,
 model,
 };
 addLog(`🤖 recordMessage(gemini) → 包含 ${queuedThoughts.length} 个思考`);
 return {
 ...prev,
 messages: [...prev.messages, msg],
 };
 });
 setQueuedThoughts([]);
 setQueuedTokens(null);
 }, [queuedThoughts, queuedTokens, addLog]);

 // Record tool calls
 const recordToolCalls = useCallback((toolCalls: ToolCallRecord[]) => {
 setConversation(prev => {
 const lastMsg = prev.messages[prev.messages.length - 1];

 if (!lastMsg || lastMsg.type !== 'gemini' || queuedThoughts.length > 0) {
 // Create new gemini message for tool calls
 const msg: MessageRecord = {
 id: generateId(),
 type: 'gemini',
 content: '',
 timestamp: new Date().toISOString(),
 toolCalls,
 thoughts: queuedThoughts.length > 0 ? [...queuedThoughts] : undefined,
 tokens: queuedTokens || undefined,
 model: 'gemini-1.5-pro',
 };
 addLog(`🔧 recordToolCalls() → 新消息 (${toolCalls.length} 工具)`);
 setQueuedThoughts([]);
 setQueuedTokens(null);
 return {
 ...prev,
 messages: [...prev.messages, msg],
 };
 }

 // Add to existing gemini message
 addLog(`🔧 recordToolCalls() → 添加到现有消息`);
 return {
 ...prev,
 messages: prev.messages.map((m, i) =>
 i === prev.messages.length - 1
 ? {
 ...m,
 toolCalls: [...(m.toolCalls || []), ...toolCalls],
 }
 : m
 ),
 };
 });
 }, [queuedThoughts, queuedTokens, addLog]);

 // Simulate a full conversation turn
 const simulateConversation = useCallback(async () => {
 setIsSimulating(true);

 // User sends message
 recordUserMessage('帮我读取 package.json 文件');
 await sleep(500);

 // AI starts thinking
 recordThought('用户想要读取一个 JSON 配置文件');
 await sleep(300);
 recordThought('我需要使用 read_file 工具来读取文件内容');
 await sleep(300);

 // AI calls tool
 recordToolCalls([{
 id: 'call_' + generateId(),
 name: 'read_file',
 status: 'completed',
 }]);
 await sleep(500);

 // Token usage arrives
 recordTokens({
 input: 150,
 output: 45,
 cached: 50,
 total: 245,
 });
 await sleep(300);

 // AI responds
 recordGeminiMessage('这是 package.json 的内容...');

 setIsSimulating(false);
 }, [recordUserMessage, recordThought, recordToolCalls, recordTokens, recordGeminiMessage]);

 const clearAll = useCallback(() => {
 setConversation({ sessionId: 'session-' + Date.now().toString(36), messages: [] });
 setQueuedThoughts([]);
 setQueuedTokens(null);
 setOperationLog([]);
 }, []);

 return (
 <div className="min-h-screen bg-surface p-6">
 <div className="max-w-6xl mx-auto">
 <h1 className="text-3xl font-bold text-heading bg-surface mb-2">
 ChatRecordingService 消息记录
 </h1>
 <p className="text-body mb-6">
 演示会话记录服务如何队列化思考、Token 和工具调用
 </p>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Queue State */}
 <div className="space-y-4">
 <div className="bg-base/40 border-l-2 border-l-edge-hover rounded-lg p-4">
 <h3 className="text-heading font-bold mb-3 flex items-center gap-2">
 <span className="text-xl">💭</span> 思考队列
 <span className="text-xs bg-elevated px-2 py-0.5 rounded-full">
 {queuedThoughts.length}
 </span>
 </h3>
 {queuedThoughts.length === 0 ? (
 <div className="text-dim text-center py-4 border border-dashed border-edge rounded-lg">
 队列为空
 </div>
 ) : (
 <div className="space-y-2">
 {queuedThoughts.map((thought, index) => (
 <div
 key={thought.id}
 className="p-2 bg-elevated border-l-2 border-l-edge-hover rounded-lg text-sm"
 >
 <div className="text-heading text-xs">思考 #{index + 1}</div>
 <div className="text-body truncate">{thought.content}</div>
 </div>
 ))}
 </div>
 )}
 </div>

 <div className="bg-base/40 border border-edge rounded-lg p-4">
 <h3 className="text-heading font-bold mb-3 flex items-center gap-2">
 <span className="text-xl">📊</span> Token 队列
 </h3>
 {queuedTokens ? (
 <div className="grid grid-cols-2 gap-2 text-sm">
 <div className="p-2 bg-elevated rounded text-center">
 <div className="text-heading font-bold">{queuedTokens.input}</div>
 <div className="text-xs text-dim">Input</div>
 </div>
 <div className="p-2 bg-elevated rounded text-center">
 <div className="text-heading font-bold">{queuedTokens.output}</div>
 <div className="text-xs text-dim">Output</div>
 </div>
 <div className="p-2 bg-elevated rounded text-center">
 <div className="text-heading font-bold">{queuedTokens.cached}</div>
 <div className="text-xs text-dim">Cached</div>
 </div>
 <div className="p-2 bg-elevated rounded text-center">
 <div className="text-heading font-bold">{queuedTokens.total}</div>
 <div className="text-xs text-dim">Total</div>
 </div>
 </div>
 ) : (
 <div className="text-dim text-center py-4 border border-dashed border-edge rounded-lg">
 无排队 Token
 </div>
 )}
 </div>

 {/* Controls */}
 <div className="bg-base/40 border border-edge rounded-lg p-4">
 <h3 className="text-heading font-bold mb-3 flex items-center gap-2">
 <span className="text-xl">🎮</span> 操作控制
 </h3>
 <div className="space-y-2">
 <button
 onClick={simulateConversation}
 disabled={isSimulating}
 className="w-full px-4 py-2 bg-surface text-heading rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
 >
 {isSimulating ? '🔄 模拟中...' : '▶️ 模拟完整对话轮次'}
 </button>
 <div className="grid grid-cols-2 gap-2">
 <button
 onClick={() => recordUserMessage('测试用户消息')}
 disabled={isSimulating}
 className="px-3 py-2 bg-elevated/20 text-heading border border-edge rounded-lg text-sm hover:bg-elevated/30 disabled:opacity-50"
 >
 👤 用户消息
 </button>
 <button
 onClick={() => recordThought('这是一个测试思考')}
 disabled={isSimulating}
 className="px-3 py-2 bg-elevated text-heading border-l-2 border-l-edge-hover rounded-lg text-sm hover:bg-elevated disabled:opacity-50"
 >
 💭 添加思考
 </button>
 <button
 onClick={() => recordToolCalls([{ id: 'call_' + generateId(), name: 'read_file', status: 'completed' }])}
 disabled={isSimulating}
 className="px-3 py-2 bg-elevated text-heading border-l-2 border-l-edge-hover rounded-lg text-sm hover:bg-elevated disabled:opacity-50"
 >
 🔧 工具调用
 </button>
 <button
 onClick={() => recordGeminiMessage('AI 响应内容')}
 disabled={isSimulating}
 className="px-3 py-2 bg-elevated text-heading border border-edge rounded-lg text-sm hover:bg-elevated disabled:opacity-50"
 >
 🤖 AI 消息
 </button>
 </div>
 <button
 onClick={clearAll}
 className="w-full px-4 py-2 bg-elevated text-heading border-l-2 border-l-edge-hover rounded-lg hover:bg-elevated"
 >
 🗑️ 清空全部
 </button>
 </div>
 </div>
 </div>

 {/* Conversation Record */}
 <div className="bg-base/40 border border-edge rounded-lg p-4">
 <h3 className="text-heading font-bold mb-3 flex items-center gap-2">
 <span className="text-xl">💬</span> 会话记录
 <span className="text-xs bg-elevated/20 px-2 py-0.5 rounded-full">
 {conversation.messages.length} 条
 </span>
 </h3>
 <div className="text-xs text-dim font-mono mb-3">
 {conversation.sessionId}
 </div>
 <div className="space-y-3 max-h-96 overflow-y-auto">
 {conversation.messages.length === 0 ? (
 <div className="text-dim text-center py-8 border border-dashed border-edge rounded-lg">
 暂无消息
 </div>
 ) : (
 conversation.messages.map((msg, index) => (
 <div
 key={msg.id}
 className={`p-3 rounded-lg border ${
 msg.type === 'user'
 ? ' border-edge bg-elevated/10'
 : ' border-edge bg-elevated'
 }`}
 >
 <div className="flex justify-between items-start mb-2">
 <span className={`text-xs font-bold ${
 msg.type === 'user' ? 'text-heading' : 'text-heading'
 }`}>
 {msg.type === 'user' ? '👤 User' : '🤖 Gemini'}
 {msg.model && <span className="text-dim ml-2">({msg.model})</span>}
 </span>
 <span className="text-xs text-dim">#{index + 1}</span>
 </div>

 {msg.content && (
 <div className="text-sm text-body mb-2">{msg.content}</div>
 )}

 {msg.thoughts && msg.thoughts.length > 0 && (
 <div className="mb-2 p-2 bg-elevated rounded border-l-2 border-l-edge-hover/20">
 <div className="text-xs text-heading mb-1">💭 思考 ({msg.thoughts.length})</div>
 {msg.thoughts.map((t, i) => (
 <div key={i} className="text-xs text-body truncate">• {t.content}</div>
 ))}
 </div>
 )}

 {msg.toolCalls && msg.toolCalls.length > 0 && (
 <div className="mb-2 p-2 bg-elevated rounded border-l-2 border-l-edge-hover">
 <div className="text-xs text-heading mb-1">🔧 工具 ({msg.toolCalls.length})</div>
 {msg.toolCalls.map((tc, i) => (
 <div key={i} className="text-xs text-body">• {tc.name} ({tc.status})</div>
 ))}
 </div>
 )}

 {msg.tokens && (
 <div className="flex gap-2 text-xs">
 <span className="text-dim">Token:</span>
 <span className="text-heading">in:{msg.tokens.input}</span>
 <span className="text-heading">out:{msg.tokens.output}</span>
 <span className="text-heading">total:{msg.tokens.total}</span>
 </div>
 )}
 </div>
 ))
 )}
 </div>
 </div>

 {/* Operation Log */}
 <div className="bg-base/40 border border-edge-hover/30 rounded-lg p-4">
 <h3 className="text-body font-bold mb-3 flex items-center gap-2">
 <span className="text-xl">📝</span> 操作日志
 </h3>
 <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-xs">
 {operationLog.length === 0 ? (
 <div className="text-dim text-center py-4">暂无操作</div>
 ) : (
 operationLog.map((log, index) => (
 <div
 key={index}
 className={`p-2 rounded ${
 log.includes('recordMessage(user)') ? ' bg-elevated/10 text-heading' :
 log.includes('recordMessage(gemini)') ? ' bg-elevated text-heading' :
 log.includes('recordThought') ? 'bg-elevated text-heading' :
 log.includes('recordToolCalls') ? 'bg-elevated text-heading' :
 log.includes('recordTokens') ? ' bg-elevated/10 text-heading' :
 ' bg-surface text-body'
 }`}
 >
 {log}
 </div>
 ))
 )}
 </div>
 </div>
 </div>

 {/* Queue Flow Diagram */}
 <div className="mt-6 bg-base/40 border border-edge rounded-lg p-4">
 <h3 className="text-heading font-bold mb-3">🔄 队列流程</h3>
 <div className="flex flex-wrap justify-center items-center gap-3 text-sm">
 <div className="p-3 bg-elevated border-l-2 border-l-edge-hover rounded-lg text-center">
 <div className="text-heading font-bold">recordThought()</div>
 <div className="text-xs text-body">→ queuedThoughts[]</div>
 </div>
 <div className="text-dim text-2xl">+</div>
 <div className="p-3 bg-elevated border border-edge rounded-lg text-center">
 <div className="text-heading font-bold">recordTokens()</div>
 <div className="text-xs text-body">→ queuedTokens</div>
 </div>
 <div className="text-dim text-2xl">→</div>
 <div className="p-3 bg-elevated/20 border border-edge rounded-lg text-center">
 <div className="text-heading font-bold">recordMessage()</div>
 <div className="text-xs text-body">合并队列到消息</div>
 </div>
 <div className="text-dim text-2xl">→</div>
 <div className="p-3 bg-elevated border-l-2 border-l-edge-hover rounded-lg text-center">
 <div className="text-heading font-bold">写入文件</div>
 <div className="text-xs text-body">session-*.json</div>
 </div>
 </div>
 </div>

 {/* Code Reference */}
 <div className="mt-6">
 <CodeBlock
 title="chatRecordingService.ts — 源码参考"
 language="typescript"
 code={`// packages/core/src/services/chatRecordingService.ts

export class ChatRecordingService {
  private queuedThoughts: Array<ThoughtSummary & { timestamp: string }> = [];
  private queuedTokens: TokensSummary | null = null;

  recordThought(thought: ThoughtSummary): void {
    this.queuedThoughts.push({
      ...thought,
      timestamp: new Date().toISOString(),
    });
  }

  recordMessage(message: { type: 'user' | 'gemini'; content: string; model: string }): void {
    this.updateConversation((conversation) => {
      const msg = this.newMessage(message.type, message.content);
      if (msg.type === 'gemini') {
        // 合并排队的思考和 Token 到新消息
        conversation.messages.push({
          ...msg,
          thoughts: this.queuedThoughts,
          tokens: this.queuedTokens,
          model: message.model,
        });
        this.queuedThoughts = []; // 清空队列
        this.queuedTokens = null;
      } else {
        conversation.messages.push(msg);
      }
    });
  }
}`}
 />
 </div>
 </div>
 </div>
 );
}
