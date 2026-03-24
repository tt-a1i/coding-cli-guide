import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



// 快速摘要组件
function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-xl border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-elevated/50 transition-colors"
 >
 <div className="flex items-center gap-3">
  <span className="text-xl font-bold text-heading">30秒快速理解</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-5">
 {/* 一句话总结 */}
 <div className="p-4 bg-base rounded-lg ">
 <p className="text-heading font-medium">
 请求生命周期是 CLI 的核心循环：<span className="text-heading">用户输入 → 预处理 → API调用 → 流式响应 → 工具执行 → 继续循环直到完成</span>
 </p>
 </div>

 {/* 关键数字 */}
 <div className="grid grid-cols-4 gap-3">
 <div className="text-center p-3 bg-base rounded-lg">
 <div className="text-2xl font-bold text-heading">6</div>
 <div className="text-xs text-dim">核心阶段</div>
 </div>
 <div className="text-center p-3 bg-base rounded-lg">
 <div className="text-2xl font-bold text-heading">N</div>
 <div className="text-xs text-dim">多轮交互</div>
 </div>
 <div className="text-center p-3 bg-base rounded-lg">
 <div className="text-2xl font-bold text-heading">3</div>
 <div className="text-xs text-dim">终止条件</div>
 </div>
 <div className="text-center p-3 bg-base rounded-lg">
 <div className="text-2xl font-bold text-heading">∞</div>
 <div className="text-xs text-dim">流式chunk</div>
 </div>
 </div>

 {/* 核心流程 */}
 <div>
 <h4 className="text-sm font-semibold text-dim mb-3">核心流程</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-full">用户输入</span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-full">@预处理</span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-full">API请求</span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated text-heading rounded-full">工具调用?</span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-full">完成/继续</span>
 </div>
 </div>

 {/* 何时终止 */}
 <div>
 <h4 className="text-sm font-semibold text-dim mb-3">何时终止循环？</h4>
 <div className="grid grid-cols-3 gap-2 text-xs">
 <div className="p-2 bg-base rounded border border-edge/30">
 <div className="text-heading font-medium">Finished: finishReason=STOP</div>
 <div className="text-dim">AI 完成回答</div>
 </div>
 <div className="p-2 bg-base rounded border-l-2 border-l-edge-hover">
 <div className="text-heading font-medium">用户取消</div>
 <div className="text-dim">Ctrl+C 中断</div>
 </div>
 <div className="p-2 bg-base rounded border-l-2 border-l-edge-hover">
 <div className="text-heading font-medium">错误发生</div>
 <div className="text-dim">API/工具失败</div>
 </div>
 </div>
 </div>

 {/* 源码入口 */}
 <div className="flex items-center gap-4 text-xs">
 <span className="text-dim">核心源码:</span>
 <code className="px-2 py-1 bg-base rounded text-heading">
 packages/core/src/core/geminiChat.ts → chat()
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function RequestLifecycle() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const relatedPages: RelatedPage[] = [
 { id: 'interaction-loop', label: '交互循环', description: '请求处理的主循环' },
 { id: 'gemini-chat', label: 'GeminiChatCore', description: 'AI 请求核心' },
 { id: 'tool-arch', label: '工具系统', description: '工具调用处理' },
 { id: 'streaming-response-processing', label: '流式处理', description: '响应流处理机制' },
 { id: 'memory', label: '上下文管理', description: '消息历史与压缩' },
 { id: 'loop-detect', label: '循环检测', description: '异常请求检测' },
 ];

 // 完整请求生命周期流程图
 const requestLifecycleFlowChart = `flowchart TD
 node_start(["用户输入请求"])
 node_preprocess["消息预处理<br/>@file, @memory, @url"]
 node_add_hist["添加到历史记录"]
 node_api_req["API 请求<br/>generateContentStream"]
 node_stream_resp["流式响应处理"]
 node_check_finish{"包含 functionCall?"}
 node_schedule_tools["工具调度<br/>CoreToolScheduler"]
 node_exec_tools["工具执行"]
 node_tool_result["结果入历史"]
 node_next_round["下一轮 API 请求"]
 node_final_resp["最终响应"]
 node_persist["持久化<br/>聊天日志 + 统计"]
 node_end(["请求完成"])

 node_start --> node_preprocess
 node_preprocess --> node_add_hist
 node_add_hist --> node_api_req
 node_api_req --> node_stream_resp
 node_stream_resp --> node_check_finish
 node_check_finish -->|Yes| node_schedule_tools
 node_check_finish -->|No| node_final_resp
 node_schedule_tools --> node_exec_tools
 node_exec_tools --> node_tool_result
 node_tool_result --> node_next_round
 node_next_round --> node_api_req
 node_final_resp --> node_persist
 node_persist --> node_end

 classDef startClass fill:#00d4ff,color:#000;
 classDef endClass fill:#00ff41,color:#000;
 classDef decisionClass fill:#a855f7,color:#fff;
 classDef toolSchedClass fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:#000;
 classDef toolExecClass fill:${getThemeColor("--color-info", "#2457a6")},color:#fff;
 classDef finalClass fill:#00ff41,color:#000;

 class node_start startClass
 class node_end endClass
 class node_check_finish decisionClass
 class node_schedule_tools toolSchedClass
 class node_exec_tools toolExecClass
 class node_final_resp finalClass`;

 // 多轮交互序列图
 const multiRoundSequenceChart = `sequenceDiagram
 participant User as 用户
 participant CLI as CLI UI
 participant Preprocessor as 消息预处理器
 participant History as 历史记录
 participant API as AI API
 participant Scheduler as CoreToolScheduler
 participant Tool as 工具

 Note over User,Tool: 第 1 轮：用户请求

 User->>CLI: 输入请求
 CLI->>Preprocessor: 处理 @file/@memory/@url
 Preprocessor-->>CLI: Content 对象
 CLI->>History: push(userMessage)
 CLI->>API: generateContentStream(history)

 API-->>CLI: 流式响应 (tool_call)
 CLI->>Scheduler: schedule(tool_call)
 Scheduler->>Scheduler: 验证参数
 Scheduler->>Scheduler: 等待用户批准
 User->>Scheduler: 批准工具
 Scheduler->>Tool: execute()
 Tool-->>Scheduler: result
 Scheduler-->>CLI: functionResponse
 CLI->>History: push(functionResponse)

 Note over User,Tool: 第 2 轮：包含工具结果

 CLI->>API: generateContentStream(history + result)
 API-->>CLI: 流式响应 (文本)
 CLI->>User: 显示最终回复
 CLI->>History: push(modelMessage)
 CLI->>CLI: 持久化聊天日志`;

 // 状态机流程图
 const stateFlowChart = `stateDiagram-v2
 [*] --> Idle: 等待输入
 Idle --> Processing: 用户输入
 Processing --> APIRequest: 消息预处理完成
 APIRequest --> Streaming: 开始流式响应

 Streaming --> ToolScheduling: functionCall detected
 Streaming --> Complete: no functionCall

 ToolScheduling --> ToolValidating: 验证参数
 ToolValidating --> ToolAwaiting: 需要用户确认
 ToolValidating --> ToolExecuting: 自动批准

 ToolAwaiting --> ToolExecuting: 用户批准
 ToolAwaiting --> ToolCancelled: 用户拒绝

 ToolExecuting --> ToolCompleted: 执行成功
 ToolExecuting --> ToolError: 执行失败

 ToolCompleted --> APIRequest: 结果入历史
 ToolError --> APIRequest: 错误入历史
 ToolCancelled --> Idle: 取消操作

 Complete --> Persisting: 持久化
 Persisting --> Idle: 准备下次请求

 Idle --> [*]: 会话结束`;

 const messagePreprocessCode = `// 源码: packages/cli/src/ui/hooks/useGeminiStream.ts:520
// 消息预处理器处理 @ 引用

/**
  * 处理用户输入中的 @ 命令
  * @file - 读取文件内容并注入
  * @memory - 获取记忆内容
  * @url - 获取网页内容
  */
async function processAtCommands(input: string): Promise<Content> {
  const parts: Part[] = [];

  // 解析 @file 引用
  const fileMatches = input.matchAll(/@([\\w\\/.-]+)/g);
  for (const match of fileMatches) {
  const filePath = match[1];
  const content = await readFile(filePath);
  parts.push({
  text: \`File: \${filePath}\\n\${content}\`
  });
  }

  // 解析 @memory 引用
  if (input.includes('@memory')) {
  const memories = await memoryService.getRelevantMemories(input);
  parts.push({
  text: \`Memories:\\n\${memories.join('\\n')}\`
  });
  }

  // 解析 @url 引用
  const urlMatches = input.matchAll(/@(https?:\\/\\/[^\\s]+)/g);
  for (const match of urlMatches) {
  const url = match[1];
  const content = await fetchUrl(url);
  parts.push({
  text: \`URL: \${url}\\n\${content}\`
  });
  }

  // 添加用户原始输入
  parts.push({ text: input });

  return {
  role: 'user',
  parts
  };
}`;

 const apiRequestCode = `// 源码: packages/core/src/core/contentGenerator.ts:145

/**
  * 发送流式 API 请求
  */
async *generateContentStream(
  request: GenerateContentRequest
): AsyncGenerator<ContentChunk> {
  const response = await fetch(API_ENDPOINT, {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
  'Authorization': \`Bearer \${apiKey}\`
  },
  body: JSON.stringify({
  model: request.model || 'gemini-1.5-pro',
  contents: request.contents, // 完整历史
  tools: request.tools, // 工具定义
  generationConfig: request.generationConfig
  })
  });

  // 处理流式响应
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\\n');

  for (const line of lines) {
  if (line.startsWith('data: ')) {
  const data = JSON.parse(line.slice(6));

  // 文本内容
  if (data.candidates[0].content.parts[0].text) {
  yield {
  type: 'text',
  content: data.candidates[0].content.parts[0].text
  };
  }

  // 工具调用
  if (data.candidates[0].content.parts[0].functionCall) {
  yield {
  type: 'tool_call',
  call: data.candidates[0].content.parts[0].functionCall
  };
  }

  // 完成原因
  if (data.candidates[0].finishReason) {
  yield {
  type: 'finish',
  reason: data.candidates[0].finishReason
  };
  }
  }
  }
  }
}`;

 const parallelToolCallsCode = `// 源码: packages/core/src/core/coreToolScheduler.ts:625

/**
  * 并行工具调用处理
  */
async schedule(
  request: ToolCallRequestInfo | ToolCallRequestInfo[],
  signal: AbortSignal
): Promise<void> {
  const requests = Array.isArray(request) ? request : [request];

  // 并行验证所有工具调用
  const validationPromises = requests.map(async (req) => {
  const tool = toolRegistry.getTool(req.name);
  const invocation = await tool.build(req.args);
  return { req, tool, invocation };
  });

  const validated = await Promise.all(validationPromises);

  // 并行执行所有工具（如果都自动批准）
  const autoApproved = validated.filter(v =>
  !v.invocation.shouldConfirmExecute()
  );

  if (autoApproved.length > 0) {
  await Promise.all(
  autoApproved.map(v => v.invocation.execute())
  );
  }

  // 等待用户批准的工具
  const needApproval = validated.filter(v =>
  v.invocation.shouldConfirmExecute()
  );

  for (const { invocation } of needApproval) {
  await waitForUserApproval(invocation);
  await invocation.execute();
  }
}`;

 const errorHandlingCode = `// 错误处理机制

/**
  * 工具执行失败处理
  */
async handleToolError(
  error: Error,
  toolCall: ToolCallRequestInfo
): Promise<Content> {
  // 将错误作为 functionResponse 发送给 AI
  return {
  role: 'user',
  parts: [{
  functionResponse: {
  name: toolCall.name,
  response: {
  error: error.message,
  stack: error.stack
  }
  }
  }]
  };
}

/**
  * API 调用失败重试
  */
async retryApiCall(
  request: GenerateContentRequest,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
  try {
  return await fetch(API_ENDPOINT, requestOptions);
  } catch (error) {
  lastError = error;

  // 指数退避
  const delay = Math.pow(2, i) * 1000;
  await sleep(delay);
  }
  }

  throw lastError;
}

/**
  * 用户取消处理
  */
function setupAbortController(): AbortController {
  const controller = new AbortController();

  // Ctrl+C 触发取消
  process.on('SIGINT', () => {
  controller.abort();
  });

  return controller;
}`;

 return (
 <div className="space-y-8 animate-fadeIn">
 {/* 快速摘要 */}
 <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

 {/* 目标 */}
 <section>
 <Layer title="目标">
 <HighlightBox title="请求生命周期核心目标" variant="blue">
 <p className="text-body mb-2">
 管理从用户输入到 AI 响应的完整流程，包括：
 </p>
 <ul className="text-sm text-body space-y-1">
 <li>预处理用户输入（@file、@memory、@url 等引用）</li>
 <li>维护完整的对话历史记录</li>
 <li>处理流式 API 响应和工具调用</li>
 <li>协调多轮交互（工具调用 → 结果 → 下一轮）</li>
 <li>持久化聊天记录和统计信息</li>
 </ul>
 </HighlightBox>
 </Layer>
 </section>

 {/* 输入 */}
 <section>
 <Layer title="输入">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="用户输入" variant="green">
 <ul className="text-sm text-body space-y-1">
 <li>纯文本请求</li>
 <li>@file 文件引用</li>
 <li>@memory 记忆引用</li>
 <li>@url 网页引用</li>
 <li>斜杠命令（/help、/clear 等）</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="上下文依赖" variant="purple">
 <ul className="text-sm text-body space-y-1">
 <li>完整对话历史（history 数组）</li>
 <li>工具定义列表（tools）</li>
 <li>系统提示词配置</li>
 <li>模型配置参数</li>
 <li>AbortSignal 取消信号</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>
 </section>

 {/* 输出 */}
 <section>
 <Layer title="输出">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <HighlightBox title="AI 响应" variant="blue">
 <ul className="text-sm text-body space-y-1">
 <li>流式文本内容</li>
 <li>工具调用请求</li>
 <li>Finished/finishReason 标记</li>
 <li>错误信息</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="状态变化" variant="yellow">
 <ul className="text-sm text-body space-y-1">
 <li>历史记录更新</li>
 <li>工具调用状态转换</li>
 <li>UI 渲染更新</li>
 <li>Token 统计累计</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="副作用" variant="green">
 <ul className="text-sm text-body space-y-1">
 <li>聊天日志文件写入</li>
 <li>工具执行（文件修改等）</li>
 <li>遥测数据上报</li>
 <li>检查点创建</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>
 </section>

 {/* 关键文件与入口 */}
 <section>
 <Layer title="关键文件与入口">
 <div className="space-y-3 text-sm">
 <div className="flex items-center gap-2">
 <code className="bg-base px-2 py-1 rounded text-heading border border-edge">
 packages/cli/src/ui/hooks/useGeminiStream.ts:520
 </code>
 <span className="text-dim">消息预处理和 @ 命令解析</span>
 </div>
 <div className="flex items-center gap-2">
 <code className="bg-base px-2 py-1 rounded text-heading border border-edge">
 packages/cli/src/ui/hooks/useGeminiStream.ts:800
 </code>
 <span className="text-dim">主循环 - processStream 流式响应处理</span>
 </div>
 <div className="flex items-center gap-2">
 <code className="bg-base px-2 py-1 rounded text-heading border border-edge">
 packages/core/src/core/contentGenerator.ts:145
 </code>
 <span className="text-dim">generateContentStream API 调用</span>
 </div>
 <div className="flex items-center gap-2">
 <code className="bg-base px-2 py-1 rounded text-heading border border-edge">
 packages/core/src/core/coreToolScheduler.ts:625
 </code>
 <span className="text-dim">工具调度主入口 schedule()</span>
 </div>
 <div className="flex items-center gap-2">
 <code className="bg-base px-2 py-1 rounded text-heading border border-edge">
 packages/cli/src/services/chatRecordingService.ts
 </code>
 <span className="text-dim">聊天日志持久化</span>
 </div>
 </div>
 </Layer>
 </section>

 {/* 流程图 */}
 <section>
 <Layer title="流程图">
 <h3 className="text-xl font-semibold font-mono text-heading mb-4">完整请求生命周期</h3>
 <MermaidDiagram chart={requestLifecycleFlowChart} title="请求生命周期流程" />

 <h3 className="text-xl font-semibold font-mono text-heading mb-4 mt-8">多轮交互序列</h3>
 <MermaidDiagram chart={multiRoundSequenceChart} title="多轮交互序列图" />

 <h3 className="text-xl font-semibold font-mono text-heading mb-4 mt-8">请求状态机</h3>
 <MermaidDiagram chart={stateFlowChart} title="请求处理状态转换" />
 </Layer>
 </section>

 {/* 关键分支与边界条件 */}
 <section>
 <Layer title="关键分支与边界条件">
 <div className="space-y-4">
 <HighlightBox title="Continuation 判断" variant="purple">
 <div className="text-sm space-y-2">
 <p className="text-body">
 <strong className="text-heading">parts[].functionCall</strong>: 需要执行工具，执行后继续下一轮
 </p>
 <p className="text-body">
 <strong className="text-heading">无 functionCall 且有文本</strong>: 结束当前轮次
 </p>
 <p className="text-body">
 <strong className="text-heading">finishReason=MAX_TOKENS</strong>: 达到 token 上限，可能需要续写
 </p>
 <p className="text-body">
 <strong className="text-heading">finishReason=SAFETY</strong>: 内容安全拦截，终止响应
 </p>
 </div>
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="工具调用分支" variant="blue">
 <ul className="text-sm text-body space-y-1">
 <li>单个工具 vs 多个工具（并行执行）</li>
 <li>自动批准 vs 需要用户确认</li>
 <li>只读工具 vs 修改类工具</li>
 <li>工具执行成功 vs 失败</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="边界条件" variant="yellow">
 <ul className="text-sm text-body space-y-1">
 <li>空输入：拒绝或提示</li>
 <li>超长输入：截断或分段处理</li>
 <li>网络中断：重试机制</li>
 <li>用户取消：AbortController</li>
 <li>API 限流：退避重试</li>
 </ul>
 </HighlightBox>
 </div>

 <CodeBlock
 code={`// 关键分支示例

// 1. Continuation 分支（Gemini：由 functionCall 决定是否继续）
const functionCalls = extractFunctionCallsFromParts(consolidatedParts);
if (functionCalls.length === 0) {
 // 结束循环，持久化记录
 await persistChatLog();
 return;
}

// 执行工具，继续下一轮
await scheduleTools(functionCalls);
continue;

// 2. 工具调用分支
if (functionCalls.length === 1) {
 // 单个工具调用
 await scheduleToolCall(functionCalls[0]);
} else {
 // 多个工具调用 - 并行执行
 await Promise.all(
 functionCalls.map(call => scheduleToolCall(call))
 );
}

// 3. 边界条件检查
if (!input.trim()) {
 throw new Error('Empty input not allowed');
}

if (input.length > MAX_INPUT_LENGTH) {
 input = truncateInput(input, MAX_INPUT_LENGTH);
}`}
 language="typescript"
 title="关键分支逻辑"
 />
 </div>
 </Layer>
 </section>

 {/* 失败与恢复 */}
 <section>
 <Layer title="失败与恢复">
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-bold font-mono mb-2">工具执行失败</h4>
 <p className="text-sm text-body mb-2">
 工具返回错误时，错误信息作为 functionResponse 发送给 AI
 </p>
 <code className="text-xs text-dim">
 AI 可能会尝试其他方法或报告错误
 </code>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-bold font-mono mb-2">API 调用失败</h4>
 <p className="text-sm text-body mb-2">
 网络错误或 API 错误触发重试机制
 </p>
 <code className="text-xs text-dim">
 最多重试 3 次，使用指数退避
 </code>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-bold font-mono mb-2">用户取消</h4>
 <p className="text-sm text-body mb-2">
 Ctrl+C 触发 AbortController，优雅终止当前操作
 </p>
 <code className="text-xs text-dim">
 保留历史记录，可以继续对话
 </code>
 </div>
 </div>

 <CodeBlock
 code={errorHandlingCode}
 language="typescript"
 title="错误处理机制"
 />

 <HighlightBox title="降级策略" variant="green">
 <div className="text-sm space-y-2">
 <p className="text-body">
 <strong className="text-heading">工具不可用</strong>: 禁用该工具，通知 AI 使用其他方法
 </p>
 <p className="text-body">
 <strong className="text-heading">API 不可用</strong>: 切换到备用模型或离线模式
 </p>
 <p className="text-body">
 <strong className="text-heading">存储失败</strong>: 内存缓存，稍后重试持久化
 </p>
 </div>
 </HighlightBox>
 </div>
 </Layer>
 </section>

 {/* 相关配置项 */}
 <section>
 <Layer title="相关配置项">
 <div className="space-y-4">
 <div className="bg-base rounded-lg p-4 border border-edge">
 <h4 className="font-semibold font-mono text-heading mb-3">模型配置</h4>
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <code className="text-heading">OPENAI_MODEL</code>
 <p className="text-dim">使用的 AI 模型名称</p>
 </div>
 <div>
 <code className="text-heading">OPENAI_API_KEY</code>
 <p className="text-dim">API 认证密钥</p>
 </div>
 <div>
 <code className="text-heading">OPENAI_BASE_URL</code>
 <p className="text-dim">API 端点地址</p>
 </div>
 <div>
 <code className="text-heading">temperature</code>
 <p className="text-dim">生成随机性（0.0-1.0）</p>
 </div>
 </div>
 </div>

 <div className="bg-base rounded-lg p-4 border border-edge">
 <h4 className="font-semibold font-mono text-heading mb-3">工具配置</h4>
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <code className="text-heading">approvalMode</code>
 <p className="text-dim">工具批准模式（YOLO/DEFAULT/AUTO_EDIT）</p>
 </div>
 <div>
 <code className="text-heading">allowedTools</code>
 <p className="text-dim">白名单工具列表</p>
 </div>
 <div>
 <code className="text-heading">checkpointing</code>
 <p className="text-dim">是否启用检查点</p>
 </div>
 <div>
 <code className="text-heading">maxToolOutputLength</code>
 <p className="text-dim">工具输出截断阈值</p>
 </div>
 </div>
 </div>

 <div className="bg-base rounded-lg p-4 border border-edge">
 <h4 className="font-semibold font-mono text-heading mb-3">流式响应配置</h4>
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <code className="text-heading">maxOutputTokens</code>
 <p className="text-dim">单次响应最大 token 数</p>
 </div>
 <div>
 <code className="text-heading">streamTimeout</code>
 <p className="text-dim">流式响应超时时间</p>
 </div>
 <div>
 <code className="text-heading">retryAttempts</code>
 <p className="text-dim">API 重试次数</p>
 </div>
 <div>
 <code className="text-heading">retryDelay</code>
 <p className="text-dim">重试延迟（指数退避）</p>
 </div>
 </div>
 </div>
 </div>
 </Layer>
 </section>

 {/* 详细步骤展开 */}
 <section>
 <Layer title="详细实现步骤">
 <h3 className="text-xl font-semibold font-mono text-heading mb-4">1. 消息预处理</h3>
 <CodeBlock
 code={messagePreprocessCode}
 language="typescript"
 title="@ 命令预处理实现"
 />

 <h3 className="text-xl font-semibold font-mono text-heading mb-4 mt-8">2. API 请求</h3>
 <CodeBlock
 code={apiRequestCode}
 language="typescript"
 title="流式 API 请求实现"
 />

 <h3 className="text-xl font-semibold font-mono text-heading mb-4 mt-8">3. 并行工具调用</h3>
 <HighlightBox title="AI 可以并行请求多个工具" variant="green">
 <p className="text-body mb-2">
 在一次响应中，AI 可以同时请求多个独立的工具调用，CLI 会并行执行它们以提高效率。
 </p>
 </HighlightBox>
 <CodeBlock
 code={parallelToolCallsCode}
 language="typescript"
 title="并行工具调用处理"
 />

 <div className="mt-4">
 <CodeBlock
 code={`// AI 返回多个 functionCall 示例（同一轮并行工具调用）
{
 "role": "model",
 "parts": [
 {
 "functionCall": {
 "id": "call_1",
 "name": "read_file",
 "args": { "file_path": "src/a.ts" }
 }
 },
 {
 "functionCall": {
 "id": "call_2",
 "name": "read_file",
 "args": { "file_path": "src/b.ts" }
 }
 },
 {
 "functionCall": {
 "id": "call_3",
 "name": "read_file",
 "args": { "file_path": "src/c.ts" }
 }
 }
 ]
}

// CLI 并行执行
await Promise.all([
 executeToolCall(call_1),
 executeToolCall(call_2),
 executeToolCall(call_3)
]);`}
 language="json"
 title="并行工具调用示例"
 />
 </div>
 </Layer>
 </section>

 {/* 多工具调用场景 */}
 <section>
 <Layer title="复杂场景示例">
 <h3 className="text-xl font-semibold font-mono text-heading mb-4">多工具调用任务</h3>
 <CodeBlock
 code={`用户: "读取 package.json 并更新版本号为 2.0.0"

第 1 轮:
├─ AI: ToolCallRequest { name: "read_file", args: { file_path: "package.json" } }
├─ CLI: 执行 ReadFileTool
└─ 结果: { content: "{\\"version\\": \\"1.0.0\\"...}" }

第 2 轮:
├─ AI: ToolCallRequest { name: "replace", args: {
│ file_path: "package.json",
│ old_string: "\\"version\\": \\"1.0.0\\"",
│ new_string: "\\"version\\": \\"2.0.0\\""
│ }}
├─ CLI: 执行 EditTool (tool name: replace)
└─ 结果: { success: true, diff: "..." }

第 3 轮:
├─ AI: "已将 package.json 的版本号从 1.0.0 更新为 2.0.0"
└─ Finished: finishReason="STOP"`}
 language="text"
 title="多轮工具调用示例"
 />
 </Layer>
 </section>

 {/* 性能优化提示 */}
 <section>
 <Layer title="性能优化">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="流式响应优化" variant="blue">
 <ul className="text-sm text-body space-y-1">
 <li>实时渲染文本，不等完整响应</li>
 <li>使用 ReadableStream 降低内存占用</li>
 <li>分块处理，避免阻塞 UI</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="工具调用优化" variant="green">
 <ul className="text-sm text-body space-y-1">
 <li>并行执行独立工具调用</li>
 <li>缓存工具验证结果</li>
 <li>截断大输出，保存到文件</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="历史记录优化" variant="purple">
 <ul className="text-sm text-body space-y-1">
 <li>定期压缩旧消息</li>
 <li>移除重复的系统提示</li>
 <li>限制历史长度（token 预算）</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="网络优化" variant="yellow">
 <ul className="text-sm text-body space-y-1">
 <li>复用 HTTP 连接</li>
 <li>启用压缩（gzip）</li>
 <li>智能重试（指数退避）</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>
 </section>

 {/* 为什么这样设计 */}
 <Layer title="为什么这样设计请求生命周期" defaultOpen={false}>
 <div className="space-y-6">
 <HighlightBox title="设计决策解析" variant="blue">
 <p className="text-sm text-body">
 请求生命周期的设计目标是<strong>可靠、高效、可恢复</strong>，
 确保每个请求都能被正确处理，即使遇到错误也能优雅恢复。
 </p>
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge">
 <h4 className="text-heading font-bold mb-2">1. 为什么使用流式响应？</h4>
 <p className="text-sm text-body mb-2">
 AI 响应使用 <code>generateContentStream</code> 而非一次性返回。
 </p>
 <ul className="text-xs text-dim space-y-1">
 <li><strong>原因</strong>: 用户可以实时看到生成过程</li>
 <li><strong>好处</strong>: 更好的交互体验，可提前取消</li>
 <li><strong>权衡</strong>: 处理逻辑更复杂</li>
 </ul>
 </div>

 <div className="bg-surface p-4 rounded-lg border border-edge">
 <h4 className="text-heading font-bold mb-2">2. 为什么预处理在请求前？</h4>
 <p className="text-sm text-body mb-2">
 <code>@file</code>、<code>@url</code> 等指令在发送 API 请求前处理。
 </p>
 <ul className="text-xs text-dim space-y-1">
 <li><strong>原因</strong>: 内容需要嵌入到请求消息中</li>
 <li><strong>好处</strong>: AI 可以看到完整上下文</li>
 <li><strong>权衡</strong>: 大文件会增加请求延迟</li>
 </ul>
 </div>

 <div className="bg-surface p-4 rounded-lg border border-edge">
 <h4 className="text-heading font-bold mb-2">3. 为什么工具调用后继续循环？</h4>
 <p className="text-sm text-body mb-2">
 工具结果返回后，<strong>再次调用 AI</strong> 继续处理。
 </p>
 <ul className="text-xs text-dim space-y-1">
 <li><strong>原因</strong>: AI 需要根据工具结果决定下一步</li>
 <li><strong>好处</strong>: 支持多步骤复杂任务</li>
 <li><strong>权衡</strong>: 可能产生循环，需要检测</li>
 </ul>
 </div>

 <div className="bg-surface p-4 rounded-lg border border-edge">
 <h4 className="text-heading font-bold mb-2">4. 为什么分离消息历史管理？</h4>
 <p className="text-sm text-body mb-2">
 消息历史由独立的 <code>MessageHistory</code> 管理。
 </p>
 <ul className="text-xs text-dim space-y-1">
 <li><strong>原因</strong>: 历史需要持久化和压缩</li>
 <li><strong>好处</strong>: 解耦请求处理与状态管理</li>
 <li><strong>权衡</strong>: 需要同步状态</li>
 </ul>
 </div>

 <div className="bg-surface p-4 rounded-lg border border-edge md:col-span-2">
 <h4 className="text-heading font-bold mb-2">5. 为什么使用指数退避重试？</h4>
 <p className="text-sm text-body mb-2">
 网络错误时使用 <code>1s → 2s → 4s → 8s</code> 递增间隔重试。
 </p>
 <ul className="text-xs text-dim space-y-1">
 <li><strong>原因</strong>: 避免对服务器造成压力，同时提高成功率</li>
 <li><strong>好处</strong>: 平衡可靠性与效率</li>
 <li><strong>权衡</strong>: 最坏情况下等待时间较长</li>
 </ul>
 </div>
 </div>

 {/* 请求状态参考表 */}
 <div className="bg-base/50 rounded-lg p-4 border border-edge">
 <h4 className="text-heading font-bold mb-3">请求状态转换参考</h4>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 px-3 text-dim">状态</th>
 <th className="text-left py-2 px-3 text-dim">触发条件</th>
 <th className="text-left py-2 px-3 text-dim">可能转换</th>
 <th className="text-left py-2 px-3 text-dim">超时处理</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">PENDING</td>
 <td className="py-2 px-3">用户提交</td>
 <td className="py-2 px-3">PROCESSING</td>
 <td className="py-2 px-3">-</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">PROCESSING</td>
 <td className="py-2 px-3">API 调用开始</td>
 <td className="py-2 px-3">STREAMING / ERROR</td>
 <td className="py-2 px-3">60s 超时取消</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">STREAMING</td>
 <td className="py-2 px-3">收到首个 chunk</td>
 <td className="py-2 px-3">TOOL_CALL / COMPLETE</td>
 <td className="py-2 px-3">30s 无响应取消</td>
 </tr>
 <tr>
 <td className="py-2 px-3 font-mono text-heading">TOOL_CALL</td>
 <td className="py-2 px-3">AI 请求工具</td>
 <td className="py-2 px-3">PROCESSING (循环)</td>
 <td className="py-2 px-3">工具自身超时</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
