import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';

export function RequestLifecycle() {
  // 完整请求生命周期流程图
  const requestLifecycleFlowChart = `flowchart TD
    node_start(["用户输入请求"])
    node_preprocess["消息预处理<br/>@file, @memory, @url"]
    node_add_hist["添加到历史记录"]
    node_api_req["API 请求<br/>generateContentStream"]
    node_stream_resp["流式响应处理"]
    node_check_finish{"Finish Reason?"}
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
    node_check_finish -->|tool_calls| node_schedule_tools
    node_check_finish -->|stop| node_final_resp
    node_schedule_tools --> node_exec_tools
    node_exec_tools --> node_tool_result
    node_tool_result --> node_next_round
    node_next_round --> node_api_req
    node_final_resp --> node_persist
    node_persist --> node_end

    classDef startClass fill:#00d4ff,color:#000;
    classDef endClass fill:#00ff41,color:#000;
    classDef decisionClass fill:#a855f7,color:#fff;
    classDef toolSchedClass fill:#f59e0b,color:#000;
    classDef toolExecClass fill:#3b82f6,color:#fff;
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

    Streaming --> ToolScheduling: finish_reason=tool_calls
    Streaming --> Complete: finish_reason=stop

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
      model: request.model || 'qwen-coder-plus',
      contents: request.contents,  // 完整历史
      tools: request.tools,         // 工具定义
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
      {/* 目标 */}
      <section>
        <Layer title="目标" icon="🎯">
          <HighlightBox title="请求生命周期核心目标" variant="blue">
            <p className="text-[var(--text-secondary)] mb-2">
              管理从用户输入到 AI 响应的完整流程，包括：
            </p>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 预处理用户输入（@file、@memory、@url 等引用）</li>
              <li>• 维护完整的对话历史记录</li>
              <li>• 处理流式 API 响应和工具调用</li>
              <li>• 协调多轮交互（工具调用 → 结果 → 下一轮）</li>
              <li>• 持久化聊天记录和统计信息</li>
            </ul>
          </HighlightBox>
        </Layer>
      </section>

      {/* 输入 */}
      <section>
        <Layer title="输入" icon="📥">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HighlightBox title="用户输入" variant="green">
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                <li>• 纯文本请求</li>
                <li>• @file 文件引用</li>
                <li>• @memory 记忆引用</li>
                <li>• @url 网页引用</li>
                <li>• 斜杠命令（/help、/clear 等）</li>
              </ul>
            </HighlightBox>

            <HighlightBox title="上下文依赖" variant="purple">
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                <li>• 完整对话历史（history 数组）</li>
                <li>• 工具定义列表（tools）</li>
                <li>• 系统提示词配置</li>
                <li>• 模型配置参数</li>
                <li>• AbortSignal 取消信号</li>
              </ul>
            </HighlightBox>
          </div>
        </Layer>
      </section>

      {/* 输出 */}
      <section>
        <Layer title="输出" icon="📤">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HighlightBox title="AI 响应" variant="blue">
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                <li>• 流式文本内容</li>
                <li>• 工具调用请求</li>
                <li>• finish_reason 标记</li>
                <li>• 错误信息</li>
              </ul>
            </HighlightBox>

            <HighlightBox title="状态变化" variant="yellow">
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                <li>• 历史记录更新</li>
                <li>• 工具调用状态转换</li>
                <li>• UI 渲染更新</li>
                <li>• Token 统计累计</li>
              </ul>
            </HighlightBox>

            <HighlightBox title="副作用" variant="green">
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                <li>• 聊天日志文件写入</li>
                <li>• 工具执行（文件修改等）</li>
                <li>• 遥测数据上报</li>
                <li>• 检查点创建</li>
              </ul>
            </HighlightBox>
          </div>
        </Layer>
      </section>

      {/* 关键文件与入口 */}
      <section>
        <Layer title="关键文件与入口" icon="📁">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <code className="bg-[var(--bg-terminal)] px-2 py-1 rounded text-[var(--cyber-blue)] border border-[var(--border-subtle)]">
                packages/cli/src/ui/hooks/useGeminiStream.ts:520
              </code>
              <span className="text-[var(--text-muted)]">消息预处理和 @ 命令解析</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-[var(--bg-terminal)] px-2 py-1 rounded text-[var(--cyber-blue)] border border-[var(--border-subtle)]">
                packages/cli/src/ui/hooks/useGeminiStream.ts:800
              </code>
              <span className="text-[var(--text-muted)]">主循环 - processStream 流式响应处理</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-[var(--bg-terminal)] px-2 py-1 rounded text-[var(--cyber-blue)] border border-[var(--border-subtle)]">
                packages/core/src/core/contentGenerator.ts:145
              </code>
              <span className="text-[var(--text-muted)]">generateContentStream API 调用</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-[var(--bg-terminal)] px-2 py-1 rounded text-[var(--cyber-blue)] border border-[var(--border-subtle)]">
                packages/core/src/core/coreToolScheduler.ts:625
              </code>
              <span className="text-[var(--text-muted)]">工具调度主入口 schedule()</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-[var(--bg-terminal)] px-2 py-1 rounded text-[var(--cyber-blue)] border border-[var(--border-subtle)]">
                packages/cli/src/services/chatRecordingService.ts
              </code>
              <span className="text-[var(--text-muted)]">聊天日志持久化</span>
            </div>
          </div>
        </Layer>
      </section>

      {/* 流程图 */}
      <section>
        <Layer title="流程图" icon="📊">
          <h3 className="text-xl font-semibold font-mono text-[var(--terminal-green)] mb-4">完整请求生命周期</h3>
          <MermaidDiagram chart={requestLifecycleFlowChart} title="请求生命周期流程" />

          <h3 className="text-xl font-semibold font-mono text-[var(--terminal-green)] mb-4 mt-8">多轮交互序列</h3>
          <MermaidDiagram chart={multiRoundSequenceChart} title="多轮交互序列图" />

          <h3 className="text-xl font-semibold font-mono text-[var(--terminal-green)] mb-4 mt-8">请求状态机</h3>
          <MermaidDiagram chart={stateFlowChart} title="请求处理状态转换" />
        </Layer>
      </section>

      {/* 关键分支与边界条件 */}
      <section>
        <Layer title="关键分支与边界条件" icon="⚡">
          <div className="space-y-4">
            <HighlightBox title="finish_reason 判断" variant="purple">
              <div className="text-sm space-y-2">
                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--terminal-green)]">stop</strong>: AI 完成响应，结束当前轮次
                </p>
                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--amber)]">tool_calls</strong>: 需要执行工具，继续下一轮
                </p>
                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--cyber-blue)]">length</strong>: 达到 token 上限，可能需要续写
                </p>
                <p className="text-[var(--text-secondary)]">
                  <strong className="text-red-400">safety</strong>: 内容安全拦截，终止响应
                </p>
              </div>
            </HighlightBox>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HighlightBox title="工具调用分支" variant="blue">
                <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                  <li>• 单个工具 vs 多个工具（并行执行）</li>
                  <li>• 自动批准 vs 需要用户确认</li>
                  <li>• 只读工具 vs 修改类工具</li>
                  <li>• 工具执行成功 vs 失败</li>
                </ul>
              </HighlightBox>

              <HighlightBox title="边界条件" variant="yellow">
                <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                  <li>• 空输入：拒绝或提示</li>
                  <li>• 超长输入：截断或分段处理</li>
                  <li>• 网络中断：重试机制</li>
                  <li>• 用户取消：AbortController</li>
                  <li>• API 限流：退避重试</li>
                </ul>
              </HighlightBox>
            </div>

            <CodeBlock
              code={`// 关键分支示例

// 1. finish_reason 分支
if (finishReason === 'stop') {
  // 结束循环，持久化记录
  await persistChatLog();
  return;
} else if (finishReason === 'tool_calls') {
  // 执行工具，继续下一轮
  await scheduleTools(toolCalls);
  continue;
}

// 2. 工具调用分支
if (toolCalls.length === 1) {
  // 单个工具调用
  await scheduleToolCall(toolCalls[0]);
} else {
  // 多个工具调用 - 并行执行
  await Promise.all(
    toolCalls.map(call => scheduleToolCall(call))
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
        <Layer title="失败与恢复" icon="🔧">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-red-400 font-bold font-mono mb-2">工具执行失败</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  工具返回错误时，错误信息作为 functionResponse 发送给 AI
                </p>
                <code className="text-xs text-[var(--text-muted)]">
                  AI 可能会尝试其他方法或报告错误
                </code>
              </div>

              <div className="bg-[var(--amber)]/10 border border-[var(--amber)]/30 rounded-lg p-4">
                <h4 className="text-[var(--amber)] font-bold font-mono mb-2">API 调用失败</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  网络错误或 API 错误触发重试机制
                </p>
                <code className="text-xs text-[var(--text-muted)]">
                  最多重试 3 次，使用指数退避
                </code>
              </div>

              <div className="bg-[var(--amber)]/10 border border-[var(--amber)]/30 rounded-lg p-4">
                <h4 className="text-[var(--amber)] font-bold font-mono mb-2">用户取消</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  Ctrl+C 触发 AbortController，优雅终止当前操作
                </p>
                <code className="text-xs text-[var(--text-muted)]">
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
                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--terminal-green)]">工具不可用</strong>: 禁用该工具，通知 AI 使用其他方法
                </p>
                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--terminal-green)]">API 不可用</strong>: 切换到备用模型或离线模式
                </p>
                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--terminal-green)]">存储失败</strong>: 内存缓存，稍后重试持久化
                </p>
              </div>
            </HighlightBox>
          </div>
        </Layer>
      </section>

      {/* 相关配置项 */}
      <section>
        <Layer title="相关配置项" icon="⚙️">
          <div className="space-y-4">
            <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
              <h4 className="font-semibold font-mono text-[var(--terminal-green)] mb-3">模型配置</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <code className="text-[var(--amber)]">OPENAI_MODEL</code>
                  <p className="text-[var(--text-muted)]">使用的 AI 模型名称</p>
                </div>
                <div>
                  <code className="text-[var(--amber)]">OPENAI_API_KEY</code>
                  <p className="text-[var(--text-muted)]">API 认证密钥</p>
                </div>
                <div>
                  <code className="text-[var(--amber)]">OPENAI_BASE_URL</code>
                  <p className="text-[var(--text-muted)]">API 端点地址</p>
                </div>
                <div>
                  <code className="text-[var(--amber)]">temperature</code>
                  <p className="text-[var(--text-muted)]">生成随机性（0.0-1.0）</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
              <h4 className="font-semibold font-mono text-[var(--terminal-green)] mb-3">工具配置</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <code className="text-[var(--amber)]">approvalMode</code>
                  <p className="text-[var(--text-muted)]">工具批准模式（YOLO/STANDARD/PLAN）</p>
                </div>
                <div>
                  <code className="text-[var(--amber)]">allowedTools</code>
                  <p className="text-[var(--text-muted)]">白名单工具列表</p>
                </div>
                <div>
                  <code className="text-[var(--amber)]">checkpointing</code>
                  <p className="text-[var(--text-muted)]">是否启用检查点</p>
                </div>
                <div>
                  <code className="text-[var(--amber)]">maxToolOutputLength</code>
                  <p className="text-[var(--text-muted)]">工具输出截断阈值</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
              <h4 className="font-semibold font-mono text-[var(--terminal-green)] mb-3">流式响应配置</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <code className="text-[var(--amber)]">maxOutputTokens</code>
                  <p className="text-[var(--text-muted)]">单次响应最大 token 数</p>
                </div>
                <div>
                  <code className="text-[var(--amber)]">streamTimeout</code>
                  <p className="text-[var(--text-muted)]">流式响应超时时间</p>
                </div>
                <div>
                  <code className="text-[var(--amber)]">retryAttempts</code>
                  <p className="text-[var(--text-muted)]">API 重试次数</p>
                </div>
                <div>
                  <code className="text-[var(--amber)]">retryDelay</code>
                  <p className="text-[var(--text-muted)]">重试延迟（指数退避）</p>
                </div>
              </div>
            </div>
          </div>
        </Layer>
      </section>

      {/* 详细步骤展开 */}
      <section>
        <Layer title="详细实现步骤" icon="📋">
          <h3 className="text-xl font-semibold font-mono text-[var(--terminal-green)] mb-4">1. 消息预处理</h3>
          <CodeBlock
            code={messagePreprocessCode}
            language="typescript"
            title="@ 命令预处理实现"
          />

          <h3 className="text-xl font-semibold font-mono text-[var(--terminal-green)] mb-4 mt-8">2. API 请求</h3>
          <CodeBlock
            code={apiRequestCode}
            language="typescript"
            title="流式 API 请求实现"
          />

          <h3 className="text-xl font-semibold font-mono text-[var(--terminal-green)] mb-4 mt-8">3. 并行工具调用</h3>
          <HighlightBox title="AI 可以并行请求多个工具" variant="green">
            <p className="text-[var(--text-secondary)] mb-2">
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
              code={`// AI 返回多个 tool_calls 示例
{
  "tool_calls": [
    {
      "id": "call_1",
      "name": "read_file",
      "args": { "path": "src/a.ts" }
    },
    {
      "id": "call_2",
      "name": "read_file",
      "args": { "path": "src/b.ts" }
    },
    {
      "id": "call_3",
      "name": "read_file",
      "args": { "path": "src/c.ts" }
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
        <Layer title="复杂场景示例" icon="🔗">
          <h3 className="text-xl font-semibold font-mono text-[var(--terminal-green)] mb-4">多工具调用任务</h3>
          <CodeBlock
            code={`用户: "读取 package.json 并更新版本号为 2.0.0"

第 1 轮:
├─ AI: tool_call { name: "read_file", args: { path: "package.json" } }
├─ CLI: 执行 ReadFileTool
└─ 结果: { content: "{\\"version\\": \\"1.0.0\\"...}" }

第 2 轮:
├─ AI: tool_call { name: "edit", args: {
│      path: "package.json",
│      old_str: "\\"version\\": \\"1.0.0\\"",
│      new_str: "\\"version\\": \\"2.0.0\\""
│  }}
├─ CLI: 执行 EditTool
└─ 结果: { success: true, diff: "..." }

第 3 轮:
├─ AI: "已将 package.json 的版本号从 1.0.0 更新为 2.0.0"
└─ finish_reason: "stop"`}
            language="text"
            title="多轮工具调用示例"
          />
        </Layer>
      </section>

      {/* 性能优化提示 */}
      <section>
        <Layer title="性能优化" icon="🚀">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HighlightBox title="流式响应优化" variant="blue">
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                <li>• 实时渲染文本，不等完整响应</li>
                <li>• 使用 ReadableStream 降低内存占用</li>
                <li>• 分块处理，避免阻塞 UI</li>
              </ul>
            </HighlightBox>

            <HighlightBox title="工具调用优化" variant="green">
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                <li>• 并行执行独立工具调用</li>
                <li>• 缓存工具验证结果</li>
                <li>• 截断大输出，保存到文件</li>
              </ul>
            </HighlightBox>

            <HighlightBox title="历史记录优化" variant="purple">
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                <li>• 定期压缩旧消息</li>
                <li>• 移除重复的系统提示</li>
                <li>• 限制历史长度（token 预算）</li>
              </ul>
            </HighlightBox>

            <HighlightBox title="网络优化" variant="yellow">
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                <li>• 复用 HTTP 连接</li>
                <li>• 启用压缩（gzip）</li>
                <li>• 智能重试（指数退避）</li>
              </ul>
            </HighlightBox>
          </div>
        </Layer>
      </section>
    </div>
  );
}
