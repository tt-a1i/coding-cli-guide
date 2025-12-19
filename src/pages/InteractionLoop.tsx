import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';

export function InteractionLoop() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-cyan-400">交互主循环</h2>
        <p className="text-gray-400 mt-2">
          用户输入 → AI 响应 → 工具执行 → 继续循环的完整流程
        </p>
      </div>

      {/* 核心流程总览 */}
      <Layer title="交互循环总览" icon="🔄">
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <pre className="text-gray-300 whitespace-pre">{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTERACTIVE MAIN LOOP                                │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐
  │ User Input   │  用户在终端输入消息
  │ (TextInput)  │
  └──────┬───────┘
         │
         ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  submitQuery (useGeminiStream.ts:786)                                    │
  │  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐   │
  │  │ Context Collect │→ │ Message Prepare  │→ │ Stream Start            │   │
  │  │ (IDE, Memory)   │  │ (System Prompt)  │  │ sendMessageStream()     │   │
  │  └────────────────┘  └──────────────────┘  └─────────────────────────┘   │
  └──────────────────────────────────────────────────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  Core Stream (client.ts:396)                                             │
  │  ┌────────────────────────────────────────────────────────────────────┐  │
  │  │  API Call → Chunks Received → Event Emission → UI Update           │  │
  │  │                                                                     │  │
  │  │  Events: Content | ToolCallRequest | Finished | Error | ...        │  │
  │  └────────────────────────────────────────────────────────────────────┘  │
  └──────────────────────────────────────────────────────────────────────────┘
         │
         ▼ (收集 ToolCallRequest 事件)
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  Tool Scheduling (coreToolScheduler.ts:625)                              │
  │  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐   │
  │  │ Queue Tools    │→ │ Validate/Approve │→ │ Execute in Parallel    │   │
  │  │ (requestQueue) │  │ (ApprovalMode)   │  │ (Promise.then chains)  │   │
  │  └────────────────┘  └──────────────────┘  └─────────────────────────┘   │
  └──────────────────────────────────────────────────────────────────────────┘
         │
         ▼ (工具执行完成)
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  Continuation (useGeminiStream.ts:994)                                   │
  │  ┌────────────────────────────────────────────────────────────────────┐  │
  │  │  Tool Results → Convert to functionResponse → Re-enter submitQuery │  │
  │  │                                                                     │  │
  │  │  Same prompt_id | isContinuation: true | Max 100 turns             │  │
  │  └────────────────────────────────────────────────────────────────────┘  │
  └──────────────────────────────────────────────────────────────────────────┘
         │
         ▼ (无更多工具调用)
  ┌──────────────┐
  │ Conversation │  对话完成，等待下一次用户输入
  │   Complete   │
  └──────────────┘
`}</pre>
        </div>
      </Layer>

      {/* submitQuery 入口 */}
      <Layer title="submitQuery 入口点" icon="1️⃣">
        <p className="text-gray-300 mb-4">
          <code>submitQuery</code> 是用户输入进入系统的主入口，位于 <code>useGeminiStream.ts:786</code>。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <HighlightBox title="上下文收集" icon="📋" variant="blue">
            <div className="text-sm text-gray-300 space-y-1">
              <div>• IDE 打开的文件</div>
              <div>• 剪贴板内容</div>
              <div>• 文件 @ 引用</div>
              <div>• 历史消息</div>
            </div>
          </HighlightBox>

          <HighlightBox title="消息准备" icon="📝" variant="green">
            <div className="text-sm text-gray-300 space-y-1">
              <div>• System Prompt 注入</div>
              <div>• Token 计数与截断</div>
              <div>• 上下文窗口管理</div>
              <div>• 历史压缩</div>
            </div>
          </HighlightBox>

          <HighlightBox title="防重提交" icon="🔒" variant="purple">
            <div className="text-sm text-gray-300 space-y-1">
              <div>• isSubmittingQueryRef</div>
              <div>• 防止并发提交</div>
              <div>• 队列串行化</div>
            </div>
          </HighlightBox>
        </div>

        <CodeBlock
          title="useGeminiStream.ts:786 - submitQuery 简化逻辑"
          code={`const submitQuery = async (
  userParts: Part[],
  options: { isContinuation?: boolean; prompt_id?: string } = {}
) => {
  // 1. 防止并发提交
  if (isSubmittingQueryRef.current) return;
  isSubmittingQueryRef.current = true;

  // 2. 收集上下文 (IDE 文件增量)
  const ideContextDelta = await getIdeContextDelta();

  // 3. 准备请求 (包含历史、系统提示等)
  const request = await prepareRequest(userParts, ideContextDelta);

  // 4. 发起流式请求
  const stream = geminiClient.sendMessageStream(request);

  // 5. 处理流事件
  for await (const event of stream) {
    handleStreamEvent(event);
  }

  // 6. 流结束后调度工具
  await scheduleTools();
};`}
        />
      </Layer>

      {/* Stream 处理 */}
      <Layer title="Stream 事件处理" icon="2️⃣">
        <p className="text-gray-300 mb-4">
          API 返回的是一个事件流，包含 13 种不同类型的事件。
        </p>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="py-2 px-3">事件类型</th>
                <th className="py-2 px-3">触发时机</th>
                <th className="py-2 px-3">处理方式</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-cyan-400">Content</td>
                <td className="py-2 px-3">模型生成文本</td>
                <td className="py-2 px-3">追加到 UI 显示</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-yellow-400">ToolCallRequest</td>
                <td className="py-2 px-3">模型请求工具</td>
                <td className="py-2 px-3">收集到队列，流结束后调度</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-green-400">Finished</td>
                <td className="py-2 px-3">响应完成</td>
                <td className="py-2 px-3">触发工具调度</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-red-400">Error</td>
                <td className="py-2 px-3">API 错误</td>
                <td className="py-2 px-3">重试或显示错误</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-purple-400">Thought</td>
                <td className="py-2 px-3">思考过程 (think mode)</td>
                <td className="py-2 px-3">记录但不加入历史</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-orange-400">TokenUsage</td>
                <td className="py-2 px-3">Token 使用统计</td>
                <td className="py-2 px-3">更新计数器</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-gray-400">InputTokenCount</td>
                <td className="py-2 px-3">输入 token 数</td>
                <td className="py-2 px-3">缓存用于截断</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock
          title="useGeminiStream.ts:702 - 流事件处理循环"
          code={`for await (const event of stream) {
  switch (event.type) {
    case 'Content':
      // 追加内容到 UI
      appendContent(event.content);
      break;

    case 'ToolCallRequest':
      // 收集工具调用请求
      pendingToolCalls.push(event.toolCall);
      break;

    case 'Thought':
      // 记录思考过程 (不加入历史)
      recordThought(event.thought);
      break;

    case 'Finished':
      // 流结束，准备调度工具
      streamFinished = true;
      break;

    case 'Error':
      // 处理错误 (重试或显示)
      handleError(event.error);
      break;
  }
}`}
        />
      </Layer>

      {/* 工具调度 */}
      <Layer title="Tool Scheduling (CoreToolScheduler)" icon="3️⃣">
        <p className="text-gray-300 mb-4">
          <code>CoreToolScheduler</code> 负责工具调用的验证、审批和并行执行。
        </p>

        <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs mb-4">
          <pre className="text-gray-300 whitespace-pre">{`
工具调用状态机:
─────────────────────────────────────────────────────

  ┌─────────────┐
  │  VALIDATING │  验证工具参数
  └──────┬──────┘
         │
    ┌────┴────┐
    │ 验证成功? │
    └────┬────┘
         │
    ┌────┼────────────────┐
    │ YES               │ NO
    ▼                   ▼
┌─────────────────┐  ┌─────────┐
│ AWAITING_APPROVAL│  │  ERROR  │
│ 或 SCHEDULED     │  └─────────┘
└────────┬────────┘
         │
    ┌────┴────┐
    │ 用户批准? │
    └────┬────┘
         │
    ┌────┼─────────────────┐
    │ YES                │ NO
    ▼                    ▼
┌───────────┐      ┌───────────┐
│ EXECUTING │      │ CANCELLED │
└─────┬─────┘      └───────────┘
      │
 ┌────┴────┐
 │ 执行结果 │
 └────┬────┘
      │
 ┌────┼────┐
 │ OK     │ ERR
 ▼        ▼
┌───────┐ ┌───────┐
│SUCCESS│ │ ERROR │
└───────┘ └───────┘
`}</pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <HighlightBox title="审批模式对照" icon="🔐" variant="blue">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <code className="text-green-400">YOLO</code>
                <span className="text-gray-400">全部自动批准</span>
              </div>
              <div className="flex justify-between">
                <code className="text-yellow-400">AUTO_EDIT</code>
                <span className="text-gray-400">仅自动批准编辑工具</span>
              </div>
              <div className="flex justify-between">
                <code className="text-orange-400">DEFAULT</code>
                <span className="text-gray-400">需用户确认</span>
              </div>
              <div className="flex justify-between">
                <code className="text-red-400">PLAN</code>
                <span className="text-gray-400">阻止非只读工具</span>
              </div>
            </div>
          </HighlightBox>

          <HighlightBox title="并行执行策略" icon="⚡" variant="green">
            <div className="text-sm text-gray-300 space-y-1">
              <p>所有来自同一响应的工具调用<strong className="text-cyan-400">同时执行</strong>：</p>
              <ul className="list-disc list-inside text-gray-400 text-xs mt-2">
                <li>使用 Promise.then() 链</li>
                <li>不逐个 await</li>
                <li>checkAndNotifyCompletion() 检测全部完成</li>
                <li>多个 API 调用通过 sendPromise 串行化</li>
              </ul>
            </div>
          </HighlightBox>
        </div>

        <CodeBlock
          title="coreToolScheduler.ts:970 - 并行工具执行"
          code={`// 所有工具同时启动执行
for (const toolCall of toolCalls) {
  // 不 await，允许并行
  executeToolCall(toolCall)
    .then((result) => {
      toolCall.status = 'success';
      toolCall.result = result;
      checkAndNotifyCompletion();  // 检查是否全部完成
    })
    .catch((error) => {
      toolCall.status = 'error';
      toolCall.error = error;
      checkAndNotifyCompletion();
    });
}

function checkAndNotifyCompletion() {
  const allTerminal = toolCalls.every(
    tc => ['success', 'error', 'cancelled'].includes(tc.status)
  );
  if (allTerminal) {
    onAllToolsComplete(toolCalls);
  }
}`}
        />
      </Layer>

      {/* Continuation 机制 */}
      <Layer title="Continuation 机制 (核心创新)" icon="4️⃣">
        <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 rounded-lg p-4 mb-4">
          <h4 className="text-cyan-400 font-bold mb-2">关键洞察</h4>
          <p className="text-gray-300 text-sm">
            工具执行结果会被转换为 <code>functionResponse</code>，作为<strong className="text-yellow-400">下一条用户消息</strong>
            重新进入 <code>submitQuery</code>，创造出"单次请求即可使用工具"的错觉。
            实际上是多次 API 调用，由相同的 <code>prompt_id</code> 关联。
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs mb-4">
          <pre className="text-gray-300 whitespace-pre">{`
Continuation 流程:
─────────────────────────────────────────────────────────────────────

  工具执行完成
       │
       ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ handleCompletedTools()                                          │
  │                                                                 │
  │  for (result of toolResults) {                                  │
  │    parts.push({                                                 │
  │      functionResponse: {                                        │
  │        id: result.toolCallId,                                   │
  │        name: result.toolName,                                   │
  │        response: { output: result.output }                      │
  │      }                                                          │
  │    });                                                          │
  │  }                                                              │
  └───────────────────────────────────┬─────────────────────────────┘
                                      │
                                      ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ submitQuery(parts, { isContinuation: true, prompt_id })         │
  │                                                                 │
  │  history[N] = { role: 'user', parts: [functionResponse...] }    │
  │  history[N+1] = { role: 'model', parts: [response/tools] }      │
  └───────────────────────────────────┬─────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
                    ▼                                   ▼
            有更多工具调用?                        无工具调用
                    │                                   │
                    ▼                                   ▼
              再次循环                            对话完成
`}</pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <HighlightBox title="循环保护" icon="🛡️" variant="red">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">最大轮次</span>
                <code className="text-cyan-400">100 turns</code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">循环检测</span>
                <code className="text-cyan-400">模式匹配</code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">prompt_id</span>
                <code className="text-cyan-400">相同值关联</code>
              </div>
            </div>
          </HighlightBox>

          <HighlightBox title="Token 管理" icon="📊" variant="purple">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">上下文窗口</span>
                <code className="text-cyan-400">动态截断</code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">历史压缩</span>
                <code className="text-cyan-400">摘要替换</code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">思考记录</span>
                <code className="text-cyan-400">不计入历史</code>
              </div>
            </div>
          </HighlightBox>
        </div>

        <CodeBlock
          title="useGeminiStream.ts:994 - Continuation 触发"
          code={`function handleCompletedTools(completedTools: ToolCallResult[]) {
  // 转换工具结果为 functionResponse Parts
  const responseParts: Part[] = completedTools.map(result => ({
    functionResponse: {
      id: result.toolCallId,
      name: result.toolName,
      response: {
        output: result.output,
        error: result.error,
      }
    }
  }));

  // 重新进入 submitQuery，保持相同的 prompt_id
  submitQuery(responseParts, {
    isContinuation: true,
    prompt_id: currentPromptId,  // 关联同一次用户输入
  });
}`}
        />
      </Layer>

      {/* 状态管理 */}
      <Layer title="关键状态变量" icon="📦">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="py-2 px-3">变量</th>
                <th className="py-2 px-3">位置</th>
                <th className="py-2 px-3">用途</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-cyan-400">isSubmittingQueryRef</td>
                <td className="py-2 px-3 text-gray-500">useGeminiStream</td>
                <td className="py-2 px-3">防止并发提交</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-cyan-400">sendPromise</td>
                <td className="py-2 px-3 text-gray-500">geminiChat.ts</td>
                <td className="py-2 px-3">串行化多个 API 调用</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-cyan-400">requestQueue</td>
                <td className="py-2 px-3 text-gray-500">coreToolScheduler</td>
                <td className="py-2 px-3">缓冲工具调用</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-cyan-400">conversationHistory</td>
                <td className="py-2 px-3 text-gray-500">geminiChat.ts</td>
                <td className="py-2 px-3">对话历史记录</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-cyan-400">turnCount</td>
                <td className="py-2 px-3 text-gray-500">client.ts</td>
                <td className="py-2 px-3">当前轮次计数</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-cyan-400">currentPromptId</td>
                <td className="py-2 px-3 text-gray-500">useGeminiStream</td>
                <td className="py-2 px-3">关联同一用户输入的所有轮次</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* 数据流图 */}
      <Layer title="数据流转换" icon="🔀">
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <pre className="text-gray-300 whitespace-pre">{`
用户输入                                                    最终输出
   │                                                           ▲
   ▼                                                           │
┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐
│ TextInput    │ →  │ Part[]       │ →  │ GenerateContentReq   │
│ "read foo"   │    │ [{text:...}] │    │ {contents, tools...} │
└──────────────┘    └──────────────┘    └──────────────────────┘
                                                │
                                                ▼ API Call
                                        ┌──────────────────────┐
                                        │ AsyncGenerator       │
                                        │ <TurnEvent>          │
                                        └──────────────────────┘
                                                │
          ┌─────────────────────────────────────┼─────────────────┐
          │                                     │                 │
          ▼                                     ▼                 ▼
   ┌──────────────┐                     ┌──────────────┐   ┌──────────────┐
   │ Content      │                     │ ToolCall     │   │ Thought      │
   │ (text chunks)│                     │ Requests     │   │ (logged only)│
   └──────────────┘                     └──────────────┘   └──────────────┘
          │                                     │
          ▼                                     ▼
   ┌──────────────┐                     ┌──────────────┐
   │ UI Display   │                     │ Tool Exec    │
   │ (streaming)  │                     │ (parallel)   │
   └──────────────┘                     └──────────────┘
                                                │
                                                ▼
                                        ┌──────────────┐
                                        │ Function     │
                                        │ Response[]   │
                                        └──────────────┘
                                                │
                                                ▼ (re-enter loop)
                                        ┌──────────────┐
                                        │ submitQuery  │
                                        │ (continuation)│
                                        └──────────────┘
`}</pre>
        </div>
      </Layer>

      {/* IDE 上下文增量 */}
      <Layer title="IDE 上下文增量 (Delta)" icon="💻">
        <p className="text-gray-300 mb-4">
          为避免重复发送大量上下文，系统使用增量机制只发送变化的部分。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <HighlightBox title="首次请求" icon="1️⃣" variant="blue">
            <div className="text-sm text-gray-300">
              发送完整 IDE 上下文：
              <ul className="list-disc list-inside text-gray-400 text-xs mt-2">
                <li>所有打开的文件 (最多 10 个)</li>
                <li>每个文件最多 16KB</li>
                <li>当前活动文件</li>
              </ul>
            </div>
          </HighlightBox>

          <HighlightBox title="后续请求" icon="2️⃣" variant="green">
            <div className="text-sm text-gray-300">
              只发送变化的增量：
              <ul className="list-disc list-inside text-gray-400 text-xs mt-2">
                <li>新打开的文件</li>
                <li>内容变化的文件</li>
                <li>50ms 去抖动</li>
              </ul>
            </div>
          </HighlightBox>
        </div>

        <CodeBlock
          title="client.ts:488 - IDE 上下文增量计算"
          code={`async function getIdeContextDelta(): Promise<IdeContextDelta | null> {
  const currentContext = await ideClient.getOpenFiles();

  if (!lastIdeContext) {
    // 首次请求，发送完整上下文
    lastIdeContext = currentContext;
    return { type: 'full', files: currentContext };
  }

  // 计算增量
  const delta: FileChange[] = [];
  for (const file of currentContext) {
    const lastFile = lastIdeContext.find(f => f.path === file.path);
    if (!lastFile || lastFile.content !== file.content) {
      delta.push(file);
    }
  }

  lastIdeContext = currentContext;
  return delta.length > 0 ? { type: 'delta', files: delta } : null;
}`}
        />
      </Layer>

      {/* 错误处理与重试 */}
      <Layer title="错误处理与重试" icon="⚠️">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightBox title="API 错误重试" icon="🔄" variant="blue">
            <div className="text-sm text-gray-300 space-y-1">
              <div>• 指数退避</div>
              <div>• 最大 3 次重试</div>
              <div>• 429 配额错误特殊处理</div>
              <div>• 自动切换备用模型</div>
            </div>
          </HighlightBox>

          <HighlightBox title="工具执行错误" icon="🔧" variant="orange">
            <div className="text-sm text-gray-300 space-y-1">
              <div>• 错误结果返回给模型</div>
              <div>• 模型可选择重试或放弃</div>
              <div>• 错误不中断对话</div>
            </div>
          </HighlightBox>

          <HighlightBox title="用户中断" icon="🛑" variant="red">
            <div className="text-sm text-gray-300 space-y-1">
              <div>• Ctrl+C 处理</div>
              <div>• AbortController 传播</div>
              <div>• 清理进行中的工具</div>
              <div>• 保留对话历史</div>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 执行时间线示例 */}
      <Layer title="执行时间线示例" icon="⏱️">
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <pre className="text-gray-300 whitespace-pre">{`
典型交互时间线 (用户请求: "读取 package.json 并分析依赖"):
────────────────────────────────────────────────────────────────────

T+0ms     用户按 Enter 提交
T+5ms     submitQuery 开始
T+10ms    收集 IDE 上下文增量
T+15ms    准备请求 (token 计数)
T+20ms    发起 API 流式请求
          ├── T+50ms   收到首个 Content chunk ("我来读取...")
          ├── T+100ms  收到更多 Content chunks
          ├── T+200ms  收到 ToolCallRequest (Read: package.json)
          └── T+250ms  收到 Finished 事件

T+255ms   流结束，开始工具调度
T+260ms   Read 工具验证通过
T+265ms   自动批准 (Read 是只读工具)
T+270ms   执行 Read 工具
T+280ms   文件读取完成

T+285ms   Continuation: 发送 functionResponse
T+290ms   发起第二次 API 请求
          ├── T+350ms  收到 Content ("这个项目使用了...")
          ├── T+500ms  收到更多分析内容
          └── T+600ms  收到 Finished (无更多工具)

T+605ms   对话完成
T+610ms   UI 更新，等待下一次输入

总耗时: ~610ms (包含 2 次 API 调用 + 1 次文件读取)
`}</pre>
        </div>
      </Layer>

      {/* 关键文件参考 */}
      <Layer title="关键文件参考" icon="📁">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">packages/cli/</h4>
            <div className="text-xs font-mono space-y-1 text-gray-400">
              <div>src/ui/hooks/useGeminiStream.ts <span className="text-gray-600">- 主循环入口</span></div>
              <div className="pl-4">:786 submitQuery()</div>
              <div className="pl-4">:702 流事件处理</div>
              <div className="pl-4">:994 Continuation 触发</div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">packages/core/</h4>
            <div className="text-xs font-mono space-y-1 text-gray-400">
              <div>src/core/client.ts <span className="text-gray-600">- API 客户端</span></div>
              <div className="pl-4">:396 sendMessageStream()</div>
              <div>src/core/coreToolScheduler.ts <span className="text-gray-600">- 工具调度</span></div>
              <div className="pl-4">:625 scheduleTools()</div>
              <div className="pl-4">:970 并行执行</div>
              <div>src/core/turn.ts <span className="text-gray-600">- 事件发射</span></div>
              <div>src/core/geminiChat.ts <span className="text-gray-600">- 历史管理</span></div>
            </div>
          </div>
        </div>
      </Layer>
    </div>
  );
}
