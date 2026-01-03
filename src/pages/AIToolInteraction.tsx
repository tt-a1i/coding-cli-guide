import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { JsonBlock } from '../components/JsonBlock';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'tool-arch', label: '工具架构', description: 'ToolRegistry / ToolInvocation / Confirm flow' },
  { id: 'tool-ref', label: '工具参考', description: 'read_file/run_shell_command 等参数与语义' },
  { id: 'code', label: '核心代码导览', description: 'Turn.run → ToolCallRequest → CoreToolScheduler' },
  { id: 'function-response-anim', label: 'FunctionResponse 构建', description: 'convertToFunctionResponse 与历史注入' },
  { id: 'policy-engine', label: 'Policy 引擎', description: 'ASK_USER/ALLOW/DENY 与 redirection 降级' },
  { id: 'hook-system', label: 'Hook 系统', description: 'BeforeTool/AfterTool 修改输入与 stop_execution' },
];

export function AIToolInteraction() {
  const sequence = `sequenceDiagram
    participant U as 用户
    participant CLI as CLI
    participant Turn as Turn.run()
    participant S as CoreToolScheduler
    participant Tool as ToolInvocation
    participant API as Gemini API

    U->>CLI: 输入任务
    CLI->>API: sendMessageStream(contents + tools)
    API-->>Turn: GenerateContentResponse stream

    Note over Turn: 解析文本 + functionCalls
    Turn-->>CLI: Content / Thought / ToolCallRequest / Finished

    CLI->>S: enqueue ToolCallRequestInfo(callId,name,args)
    S->>Tool: tool.build(args)
    Tool-->>S: ToolInvocation(params)
    S->>Tool: shouldConfirmExecute()
    Tool-->>S: false | confirmationDetails
    S->>Tool: execute()
    Tool-->>S: ToolResult{llmContent,returnDisplay,error?}

    Note over CLI: 将 ToolResult 转成 functionResponse parts
    CLI->>API: continuation(contents + functionResponse)
    API-->>CLI: 最终自然语言回复 (finishReason=STOP)
`;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🔧</span>
          <h1 className="text-3xl font-bold text-white">AI 工具交互（Gemini CLI 主线）</h1>
        </div>
        <p className="text-gray-300 text-lg">
          从 <code>FunctionDeclaration</code> 到 <code>functionCall</code>/<code>functionResponse</code>，理解 Gemini CLI 如何把“模型的请求”变成“可审计、可确认、可执行”的本地操作。
        </p>
      </div>

      <HighlightBox title="术语对齐（非常重要）" icon="🧭" variant="yellow">
        <div className="space-y-2 text-sm text-gray-200">
          <p className="m-0">
            上游 Gemini CLI 主线使用 <code>tools: [&#123; functionDeclarations: FunctionDeclaration[] &#125;]</code> 声明工具，
            使用 <code>functionCall</code>/<code>functionResponse</code> 传递调用与结果（<code>args</code> 是对象，不是 JSON 字符串）。
          </p>
          <p className="m-0 text-gray-300">
            <code>tool_calls</code>/<code>role=tool</code>/<code>finish_reason</code> 属于 OpenAI-compatible 兼容层术语（fork-only）；在上游主线里只作为“对照参考”，不作为核心链路。
          </p>
        </div>
      </HighlightBox>

      <Layer title="端到端时序" icon="🗺️" defaultOpen>
        <MermaidDiagram chart={sequence} />
      </Layer>

      <Layer title="1) 工具声明（FunctionDeclaration）" icon="📋">
        <p className="text-gray-300 mb-4">
          CLI 每次向模型发起请求时，会把当前可用工具的 <code>FunctionDeclaration</code> 一并发送。上游实现来自：
          <code className="ml-2 text-cyan-300">packages/core/src/tools/tool-registry.ts</code> 与
          <code className="ml-2 text-cyan-300">packages/core/src/core/client.ts</code>。
        </p>

        <CodeBlock
          title="ToolRegistry.getFunctionDeclarations()（工具声明来源）"
          language="ts"
          code={`// packages/core/src/tools/tool-registry.ts
getFunctionDeclarations(): FunctionDeclaration[] {
  const declarations: FunctionDeclaration[] = [];
  this.getActiveTools().forEach((tool) => {
    declarations.push(tool.schema); // tool.schema: FunctionDeclaration
  });
  return declarations;
}`}
        />

        <JsonBlock
          code={`// 发送给 Gemini 的请求形态（概念化）
{
  "model": "gemini-1.5-pro",
  "contents": [
    { "role": "user", "parts": [{ "text": "帮我读取 package.json" }] }
  ],
  "tools": [
    {
      "functionDeclarations": [
        {
          "name": "read_file",
          "description": "Reads a file from the local filesystem.",
          "parametersJsonSchema": {
            "type": "object",
            "properties": {
              "file_path": { "type": "string" },
              "offset": { "type": "number" },
              "limit": { "type": "number" }
            },
            "required": ["file_path"]
          }
        }
      ]
    }
  ]
}`}
        />

        <HighlightBox title="要点" icon="💡" variant="blue">
          <ul className="pl-5 list-disc space-y-1 text-sm text-gray-200">
            <li><code>parametersJsonSchema</code> 是上游的字段名（不是 <code>parameters</code>）。</li>
            <li><code>read_file</code> 参数名是 <code>file_path</code>（不是 <code>absolute_path</code>）。</li>
          </ul>
        </HighlightBox>
      </Layer>

      <Layer title="2) 模型请求工具（functionCall / functionCalls）" icon="🤖">
        <p className="text-gray-300 mb-4">
          Gemini SDK 的响应 chunk 可以直接通过 <code>resp.functionCalls</code> 读取工具请求（SDK 从候选内容 parts 中推导得到）。上游核心处理在 <code>Turn.run()</code>：
        </p>

        <CodeBlock
          title="Turn.run() 提取 functionCalls 并产出 ToolCallRequest 事件"
          language="ts"
          code={`// packages/core/src/core/turn.ts (简化摘录)
const functionCalls = resp.functionCalls ?? [];
for (const fnCall of functionCalls) {
  const event = this.handlePendingFunctionCall(fnCall, traceId);
  if (event) yield event; // GeminiEventType.ToolCallRequest
}`}
        />

        <JsonBlock
          code={`// 模型请求调用工具（概念化）
{
  "functionCalls": [
    {
      "id": "call_abc123",           // 可能存在；Turn.run 会用它当 callId
      "name": "read_file",
      "args": { "file_path": "package.json" }
    }
  ],
  "finishReason": "TOOL_USE"
}`}
        />

        <HighlightBox title="args 是对象，不需要 JSON.parse" icon="✅" variant="green">
          <p className="m-0 text-sm text-gray-200">
            上游主线里 <code>fnCall.args</code> 已经是对象。只有在 OpenAI-compatible 兼容层里，才会遇到 <code>arguments</code> 为 JSON 字符串需要解析的情况。
          </p>
        </HighlightBox>
      </Layer>

      <Layer title="3) 调度与执行（CoreToolScheduler → ToolInvocation）" icon="⚙️">
        <p className="text-gray-300 mb-4">
          <code>ToolCallRequest</code> 事件到达后，CLI 把它交给 <code>CoreToolScheduler</code>：负责队列、确认、执行、以及把结果转换为 <code>functionResponse</code> parts。
        </p>

        <CodeBlock
          title="CoreToolScheduler 构建调用与错误响应"
          language="ts"
          code={`// packages/core/src/core/coreToolScheduler.ts (简化摘录)
const tool = toolRegistry.getTool(toolName);
const invocation = tool.build(args); // 参数校验 + 创建 ToolInvocation
const confirmation = await invocation.shouldConfirmExecute(signal);
// confirmation 为 false => 直接执行；否则进入 awaiting_approval

// 执行后返回 ToolResult{llmContent, returnDisplay, error?}
// error 存在则 createErrorResponse(request, new Error(...), error.type)
`}
        />

        <HighlightBox title="两个关键边界" icon="⚠️" variant="yellow">
          <ul className="pl-5 list-disc space-y-1 text-sm text-gray-200">
            <li><strong>参数非法</strong>：<code>tool.build(args)</code> 会直接抛错或返回 INVALID_TOOL_PARAMS 类错误。</li>
            <li><strong>需要确认</strong>：<code>shouldConfirmExecute()</code> 由 policy + messageBus 决策（ALLOW/DENY/ASK_USER）。</li>
          </ul>
        </HighlightBox>
      </Layer>

      <Layer title="4) 回传 functionResponse 并继续（Continuation）" icon="📤">
        <p className="text-gray-300 mb-4">
          工具执行结果会被转换为 Gemini 的 <code>functionResponse</code> part，并以 <code>role: 'user'</code> 的消息写回历史，
          然后再发起一次 continuation 请求，让模型基于结果继续完成任务。
        </p>

        <CodeBlock
          title="convertToFunctionResponse()（工具结果 → functionResponse parts）"
          language="ts"
          code={`// packages/core/src/utils/generateContentResponseUtilities.ts
export function convertToFunctionResponse(
  toolName: string,
  callId: string,
  response: PartListUnion,
  model: string,
): Part[] { /* ... */ }`}
        />

        <JsonBlock
          code={`// 历史注入形态（概念化）
[
  { "role": "user",  "parts": [{ "text": "帮我读取 package.json" }] },
  { "role": "model", "parts": [{ "functionCall": { "name": "read_file", "args": { "file_path": "package.json" } } }] },
  { "role": "user",  "parts": [{ "functionResponse": { "id": "call_abc123", "name": "read_file", "response": { "content": "..." } } }] }
]`}
        />
      </Layer>

      <Layer title="5) 多工具调用与 finishReason" icon="🧩">
        <HighlightBox title="一次响应里可能有多个 functionCalls" icon="📦" variant="blue">
          <p className="m-0 text-sm text-gray-200">
            <code>resp.functionCalls</code> 是数组：模型可能一次请求多个工具调用。CLI 的 scheduler 会把它们排队执行，并逐个回传对应的 functionResponse。
          </p>
        </HighlightBox>

        <HighlightBox title="finishReason 是状态信号" icon="🔄" variant="purple">
          <ul className="pl-5 list-disc space-y-1 text-sm text-gray-200">
            <li><code>TOOL_USE</code>：模型请求工具（本轮会出现 functionCalls）。</li>
            <li><code>STOP</code>：模型认为本轮已经完成自然语言回复。</li>
            <li><code>MAX_TOKENS</code>/<code>SAFETY</code> 等：需要按策略做错误提示或恢复。</li>
          </ul>
        </HighlightBox>
      </Layer>

      <Layer title="6) 错误与停止执行（含 stop_execution）" icon="🧨">
        <p className="text-gray-300 mb-4">
          工具执行失败也必须返回给模型（让它理解发生了什么并决定下一步）。上游用 <code>ToolResult.error</code> 携带机器可读的 <code>ToolErrorType</code>。
        </p>

        <CodeBlock
          title="ToolResult / ToolErrorType（关键字段）"
          language="ts"
          code={`// packages/core/src/tools/tools.ts
export interface ToolResult {
  llmContent: PartListUnion;
  returnDisplay: ToolResultDisplay;
  error?: { message: string; type?: ToolErrorType };
}

// packages/core/src/tools/tool-error.ts
export enum ToolErrorType {
  FILE_NOT_FOUND = 'file_not_found',
  INVALID_TOOL_PARAMS = 'invalid_tool_params',
  UNHANDLED_EXCEPTION = 'unhandled_exception',
  // Hook 可以触发“立刻停止整个 agent 执行”
  STOP_EXECUTION = 'stop_execution',
}`}
        />

        <CodeBlock
          title="Hook 停止执行：coreToolHookTriggers.ts（简化摘录）"
          language="ts"
          code={`// packages/core/src/core/coreToolHookTriggers.ts (简化摘录)
if (beforeOutput?.shouldStopExecution()) {
  return {
    llmContent: \`Agent execution stopped by hook: \${reason}\`,
    returnDisplay: \`Agent execution stopped by hook: \${reason}\`,
    error: { type: ToolErrorType.STOP_EXECUTION, message: reason },
  };
}`}
        />
      </Layer>

      <Layer title="Fork-only：OpenAI tool_calls 对照" icon="🧷">
        <div className="space-y-3 text-gray-300 text-sm">
          <p className="m-0">
            如果你的 fork 需要兼容 OpenAI 协议：<code>tool_calls[].function.arguments</code> 通常是 JSON 字符串，需要 <code>JSON.parse</code> 才能得到对象；
            且会引入 <code>role=tool</code>、<code>tool_call_id</code> 等配对规则。
          </p>
          <p className="m-0">
            上游 Gemini CLI 主线没有这层转换；相关内容更适合放在“多厂商/兼容层”章节里讲解。
          </p>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
