// @ts-nocheck - visualData uses Record<string, unknown> which causes strict type issues
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 转换方向
type ConversionDirection = 'gemini_to_openai' | 'openai_to_gemini';

// 转换阶段
type ConverterPhase =
  | 'init'
  | 'tool_param_convert'
  | 'tool_def_convert'
  | 'message_convert'
  | 'function_call_convert'
  | 'function_response_convert'
  | 'orphan_cleanup'
  | 'message_merge'
  | 'response_convert'
  | 'complete';

// 转换步骤
interface ConverterStep {
  phase: ConverterPhase;
  title: string;
  description: string;
  direction: ConversionDirection;
  codeSnippet: string;
  visualData?: Record<string, unknown>;
  highlight?: string;
}

// 转换流程
const converterSequence: ConverterStep[] = [
  {
    phase: 'init',
    title: '初始化 OpenAI Content Converter',
    description: '创建双向格式转换器，处理 Gemini ⇄ OpenAI 格式互转',
    direction: 'gemini_to_openai',
    codeSnippet: `// converter.ts:15-40
class OpenAIContentConverter {
  // 双向转换管道

  // Gemini → OpenAI
  convertGeminiToolsToOpenAI(tools: Tool[]): ChatCompletionTool[];
  convertGeminiRequestToOpenAI(request: GenerateContentRequest): ChatCompletionCreateParams;

  // OpenAI → Gemini
  convertOpenAIResponseToGemini(response: ChatCompletionChunk): GenerateContentResponse;

  // 辅助方法
  private convertGeminiToolParametersToOpenAI(params: any): any;
  private cleanupOrphanToolCalls(messages: ChatCompletionMessageParam[]): void;
  private mergeConsecutiveAssistantMessages(messages: ChatCompletionMessageParam[]): void;
}`,
    visualData: {
      directions: [
        { from: 'Gemini', to: 'OpenAI', arrow: '→' },
        { from: 'OpenAI', to: 'Gemini', arrow: '←' },
      ]
    },
  },
  {
    phase: 'tool_param_convert',
    title: '工具参数类型转换',
    description: '转换 Gemini 参数类型到 OpenAI 兼容格式',
    direction: 'gemini_to_openai',
    codeSnippet: `// converter.ts:50-85
private convertGeminiToolParametersToOpenAI(params: any): any {
  if (!params) return params;

  const converted = { ...params };

  // 类型转换
  if (converted.type === 'integer') {
    // Gemini 使用 integer，OpenAI 也支持
    converted.type = 'integer';
  }

  // 字符串约束转换
  if (converted.minLength !== undefined) {
    // 确保是整数
    converted.minLength = parseInt(converted.minLength, 10);
  }

  // 递归处理对象属性
  if (converted.properties) {
    for (const key of Object.keys(converted.properties)) {
      converted.properties[key] = this.convertGeminiToolParametersToOpenAI(
        converted.properties[key]
      );
    }
  }

  // 递归处理数组项
  if (converted.items) {
    converted.items = this.convertGeminiToolParametersToOpenAI(converted.items);
  }

  return converted;
}`,
    visualData: {
      gemini: {
        type: 'object',
        properties: {
          count: { type: 'integer', minimum: 1 },
          name: { type: 'string', minLength: '3' },
        }
      },
      openai: {
        type: 'object',
        properties: {
          count: { type: 'integer', minimum: 1 },
          name: { type: 'string', minLength: 3 },
        }
      }
    },
    highlight: 'minLength: "3" → 3',
  },
  {
    phase: 'tool_def_convert',
    title: '工具定义转换',
    description: '将 Gemini Tool 转换为 OpenAI ChatCompletionTool',
    direction: 'gemini_to_openai',
    codeSnippet: `// converter.ts:95-130
convertGeminiToolsToOpenAI(tools: Tool[]): ChatCompletionTool[] {
  return tools.flatMap((tool) => {
    // 获取函数声明
    const declarations = tool.functionDeclarations || [];

    return declarations.map((func) => {
      // 判断参数来源
      const parameters = func.parameters
        ? this.convertGeminiToolParametersToOpenAI(func.parameters)
        : func.parametersJsonSchema  // MCP 格式
          ? func.parametersJsonSchema
          : undefined;

      return {
        type: 'function' as const,
        function: {
          name: func.name,
          description: func.description,
          parameters: parameters,
        },
      };
    });
  });
}

// 支持两种参数格式:
// 1. func.parameters (Gemini 原生)
// 2. func.parametersJsonSchema (MCP 服务器)`,
    visualData: {
      geminiTool: {
        functionDeclarations: [{
          name: 'read_file',
          description: '读取文件内容',
          parameters: { type: 'object', properties: { path: { type: 'string' } } }
        }]
      },
      openaiTool: {
        type: 'function',
        function: {
          name: 'read_file',
          description: '读取文件内容',
          parameters: { type: 'object', properties: { path: { type: 'string' } } }
        }
      }
    },
    highlight: 'functionDeclarations → function',
  },
  {
    phase: 'message_convert',
    title: '消息内容转换',
    description: '将 Gemini Content 转换为 OpenAI Message',
    direction: 'gemini_to_openai',
    codeSnippet: `// converter.ts:140-180
private convertContent(content: Content): ChatCompletionMessageParam {
  const role = content.role === 'model' ? 'assistant' : 'user';
  const parts = content.parts || [];

  // 处理文本内容
  const textParts = parts
    .filter((p) => 'text' in p)
    .map((p) => p.text);

  // 处理函数调用
  const functionCalls = parts
    .filter((p) => 'functionCall' in p)
    .map((p) => p.functionCall);

  // 处理函数响应
  const functionResponses = parts
    .filter((p) => 'functionResponse' in p)
    .map((p) => p.functionResponse);

  if (functionCalls.length > 0) {
    return this.buildToolCallMessage(textParts, functionCalls);
  }

  if (functionResponses.length > 0) {
    return this.buildToolResultMessage(functionResponses);
  }

  return {
    role,
    content: textParts.join('\\n'),
  };
}`,
    visualData: {
      geminiContent: {
        role: 'model',
        parts: [
          { text: '我来读取这个文件' },
          { functionCall: { name: 'read_file', args: { path: 'index.ts' } } }
        ]
      },
      openaiMessage: {
        role: 'assistant',
        content: '我来读取这个文件',
        tool_calls: [{
          id: 'call_xxx',
          type: 'function',
          function: { name: 'read_file', arguments: '{"path":"index.ts"}' }
        }]
      }
    },
    highlight: 'role: model → assistant',
  },
  {
    phase: 'function_call_convert',
    title: '函数调用格式转换',
    description: '将 Gemini functionCall 转换为 OpenAI tool_calls',
    direction: 'gemini_to_openai',
    codeSnippet: `// converter.ts:190-220
private buildToolCallMessage(
  textParts: string[],
  functionCalls: FunctionCall[]
): ChatCompletionAssistantMessageParam {
  return {
    role: 'assistant',
    content: textParts.length > 0 ? textParts.join('\\n') : null,
    tool_calls: functionCalls.map((fc, index) => ({
      id: \`call_\${Date.now()}_\${index}\`,  // 生成唯一 ID
      type: 'function' as const,
      function: {
        name: fc.name,
        // Gemini args 是对象，OpenAI 需要字符串
        arguments: JSON.stringify(fc.args || {}),
      },
    })),
  };
}

// 关键转换:
// Gemini: { name: "read", args: { path: "x.ts" } }
// OpenAI: { name: "read", arguments: '{"path":"x.ts"}' }
//                         ^^^^^^^^^ 字符串化！`,
    visualData: {
      gemini: {
        functionCall: {
          name: 'read_file',
          args: { path: 'index.ts', encoding: 'utf-8' }
        }
      },
      openai: {
        tool_calls: [{
          id: 'call_1703123456_0',
          type: 'function',
          function: {
            name: 'read_file',
            arguments: '{"path":"index.ts","encoding":"utf-8"}'
          }
        }]
      }
    },
    highlight: 'args → JSON.stringify',
  },
  {
    phase: 'function_response_convert',
    title: '函数响应格式转换',
    description: '将 Gemini functionResponse 转换为 OpenAI tool message',
    direction: 'gemini_to_openai',
    codeSnippet: `// converter.ts:230-260
private buildToolResultMessage(
  functionResponses: FunctionResponse[]
): ChatCompletionToolMessageParam[] {
  return functionResponses.map((fr) => ({
    role: 'tool' as const,
    tool_call_id: this.findToolCallId(fr.name),  // 匹配对应的调用 ID
    content: typeof fr.response === 'string'
      ? fr.response
      : JSON.stringify(fr.response),
  }));
}

// Gemini FunctionResponse
{
  name: 'read_file',
  response: { content: 'file contents...' }
}

// OpenAI Tool Message
{
  role: 'tool',
  tool_call_id: 'call_xxx',
  content: '{"content":"file contents..."}'
}`,
    visualData: {
      gemini: {
        functionResponse: {
          name: 'read_file',
          response: { content: 'console.log("hello")' }
        }
      },
      openai: {
        role: 'tool',
        tool_call_id: 'call_1703123456_0',
        content: '{"content":"console.log(\\"hello\\")"}'
      }
    },
    highlight: 'role: tool + tool_call_id',
  },
  {
    phase: 'orphan_cleanup',
    title: '孤立工具调用清理',
    description: '移除没有对应响应的 tool_calls',
    direction: 'gemini_to_openai',
    codeSnippet: `// converter.ts:270-305
private cleanupOrphanToolCalls(
  messages: ChatCompletionMessageParam[]
): void {
  // 收集所有 tool message 的 tool_call_id
  const respondedIds = new Set<string>();
  for (const msg of messages) {
    if (msg.role === 'tool' && msg.tool_call_id) {
      respondedIds.add(msg.tool_call_id);
    }
  }

  // 清理未响应的 tool_calls
  for (const msg of messages) {
    if (msg.role === 'assistant' && msg.tool_calls) {
      msg.tool_calls = msg.tool_calls.filter(
        (tc) => respondedIds.has(tc.id)
      );

      // 如果所有 tool_calls 都被移除，删除该字段
      if (msg.tool_calls.length === 0) {
        delete msg.tool_calls;
      }
    }
  }
}

// 场景: 流式中断导致 tool_call 有但 response 没有
// 必须清理，否则 OpenAI API 会报错`,
    visualData: {
      before: [
        { role: 'assistant', tool_calls: [{ id: 'a' }, { id: 'b' }] },
        { role: 'tool', tool_call_id: 'a' },
        // id: 'b' 没有响应！
      ],
      after: [
        { role: 'assistant', tool_calls: [{ id: 'a' }] },
        { role: 'tool', tool_call_id: 'a' },
      ],
      removed: 'id: b (无响应)'
    },
    highlight: '移除孤立 tool_call',
  },
  {
    phase: 'message_merge',
    title: '连续消息合并',
    description: '合并连续的 assistant 消息',
    direction: 'gemini_to_openai',
    codeSnippet: `// converter.ts:315-350
private mergeConsecutiveAssistantMessages(
  messages: ChatCompletionMessageParam[]
): ChatCompletionMessageParam[] {
  const merged: ChatCompletionMessageParam[] = [];

  for (const msg of messages) {
    const last = merged[merged.length - 1];

    // 检查是否可以合并
    if (
      last &&
      last.role === 'assistant' &&
      msg.role === 'assistant' &&
      !last.tool_calls &&
      !msg.tool_calls
    ) {
      // 合并文本内容
      last.content = [last.content, msg.content]
        .filter(Boolean)
        .join('\\n');
    } else {
      merged.push(msg);
    }
  }

  return merged;
}

// OpenAI 不允许连续的 assistant 消息
// 必须合并为一个`,
    visualData: {
      before: [
        { role: 'assistant', content: '让我分析一下...' },
        { role: 'assistant', content: '这个文件包含...' },
      ],
      after: [
        { role: 'assistant', content: '让我分析一下...\n这个文件包含...' },
      ]
    },
    highlight: '2 条 → 1 条',
  },
  {
    phase: 'response_convert',
    title: '响应格式反向转换',
    description: '将 OpenAI 流式响应转换回 Gemini 格式',
    direction: 'openai_to_gemini',
    codeSnippet: `// converter.ts:360-400
convertOpenAIResponseToGemini(
  chunk: ChatCompletionChunk
): GenerateContentResponse {
  const choice = chunk.choices[0];
  if (!choice) return { candidates: [] };

  const parts: Part[] = [];

  // 转换文本
  if (choice.delta?.content) {
    parts.push({ text: choice.delta.content });
  }

  // 转换工具调用（使用 StreamingToolCallParser）
  if (choice.delta?.tool_calls) {
    for (const tc of choice.delta.tool_calls) {
      const parsed = this.toolCallParser.handleChunk(tc);
      if (parsed) {
        parts.push({
          functionCall: {
            name: parsed.name,
            args: parsed.arguments,  // 已解析为对象
          },
        });
      }
    }
  }

  return {
    candidates: [{
      content: { role: 'model', parts },
      finishReason: choice.finish_reason,
    }],
  };
}`,
    visualData: {
      openaiChunk: {
        choices: [{
          delta: {
            content: '分析结果...',
            tool_calls: [{ function: { name: 'write', arguments: '{"x":1}' } }]
          }
        }]
      },
      geminiResponse: {
        candidates: [{
          content: {
            role: 'model',
            parts: [
              { text: '分析结果...' },
              { functionCall: { name: 'write', args: { x: 1 } } }
            ]
          }
        }]
      }
    },
    highlight: 'OpenAI → Gemini',
  },
  {
    phase: 'complete',
    title: '转换完成',
    description: '双向格式转换确保 API 兼容性',
    direction: 'gemini_to_openai',
    codeSnippet: `// 转换器核心价值

1. API 互操作性
   - Gemini 格式 → OpenAI 兼容 API
   - OpenAI 响应 → Gemini 内部格式

2. 数据完整性
   - 工具参数类型精确转换
   - 函数调用/响应正确关联
   - 孤立数据自动清理

3. 流式处理支持
   - StreamingToolCallParser 处理碎片化 JSON
   - 增量转换减少延迟

4. 边界情况处理
   - 连续 assistant 消息合并
   - 空内容处理
   - 类型安全保证

// 使用场景
// - 使用 OpenAI SDK 调用非 OpenAI 模型
// - 统一多模型接口
// - 格式标准化`,
    visualData: {
      features: [
        { name: 'API 互操作', desc: 'Gemini ⇄ OpenAI' },
        { name: '数据完整性', desc: '类型 + 关联' },
        { name: '流式支持', desc: '增量转换' },
        { name: '边界处理', desc: '清理 + 合并' },
      ]
    },
    highlight: '双向转换完成',
  },
];

// 格式对比可视化
function FormatComparisonVisualizer({
  gemini,
  openai,
  direction,
}: {
  gemini: Record<string, unknown>;
  openai: Record<string, unknown>;
  direction: ConversionDirection;
}) {
  const isGeminiToOpenai = direction === 'gemini_to_openai';

  return (
    <div className="mb-6 grid grid-cols-2 gap-4">
      <div
        className={`p-4 rounded-lg border ${
          isGeminiToOpenai ? 'border-[var(--terminal-green)]' : 'border-gray-700'
        }`}
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-[var(--terminal-green)]">Gemini</span>
          {isGeminiToOpenai && (
            <span className="px-1.5 py-0.5 rounded text-xs bg-[var(--terminal-green)]/20 text-[var(--terminal-green)]">
              源
            </span>
          )}
        </div>
        <pre className="text-xs text-gray-300 overflow-x-auto">
          {JSON.stringify(gemini, null, 2)}
        </pre>
      </div>
      <div
        className={`p-4 rounded-lg border ${
          !isGeminiToOpenai ? 'border-[var(--cyber-blue)]' : 'border-gray-700'
        }`}
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-[var(--cyber-blue)]">OpenAI</span>
          {!isGeminiToOpenai && (
            <span className="px-1.5 py-0.5 rounded text-xs bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)]">
              源
            </span>
          )}
        </div>
        <pre className="text-xs text-gray-300 overflow-x-auto">
          {JSON.stringify(openai, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// 清理可视化
function CleanupVisualizer({
  before,
  after,
  removed,
}: {
  before: Array<{ role: string; tool_calls?: Array<{ id: string }>; tool_call_id?: string }>;
  after: Array<{ role: string; tool_calls?: Array<{ id: string }>; tool_call_id?: string }>;
  removed: string;
}) {
  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-2">清理前</div>
          <div className="space-y-1">
            {before.map((msg, i) => (
              <div
                key={i}
                className="p-2 rounded bg-black/30 text-xs font-mono"
              >
                <span className="text-gray-400">{msg.role}</span>
                {msg.tool_calls && (
                  <span className="text-amber-400 ml-2">
                    tool_calls: [{msg.tool_calls.map(t => t.id).join(', ')}]
                  </span>
                )}
                {msg.tool_call_id && (
                  <span className="text-green-400 ml-2">
                    id: {msg.tool_call_id}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-2">清理后</div>
          <div className="space-y-1">
            {after.map((msg, i) => (
              <div
                key={i}
                className="p-2 rounded bg-black/30 text-xs font-mono"
              >
                <span className="text-gray-400">{msg.role}</span>
                {msg.tool_calls && (
                  <span className="text-green-400 ml-2">
                    tool_calls: [{msg.tool_calls.map(t => t.id).join(', ')}]
                  </span>
                )}
                {msg.tool_call_id && (
                  <span className="text-green-400 ml-2">
                    id: {msg.tool_call_id}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">
        已移除: {removed}
      </div>
    </div>
  );
}

// 合并可视化
function MergeVisualizer({
  before,
  after,
}: {
  before: Array<{ role: string; content: string }>;
  after: Array<{ role: string; content: string }>;
}) {
  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-500 mb-2">合并前 ({before.length} 条)</div>
          <div className="space-y-1">
            {before.map((msg, i) => (
              <div
                key={i}
                className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-xs"
              >
                <span className="text-amber-400">{msg.role}:</span>
                <span className="text-gray-300 ml-2">{msg.content}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-2">合并后 ({after.length} 条)</div>
          <div className="space-y-1">
            {after.map((msg, i) => (
              <div
                key={i}
                className="p-2 rounded bg-green-500/10 border border-green-500/30 text-xs"
              >
                <span className="text-green-400">{msg.role}:</span>
                <pre className="text-gray-300 ml-2 whitespace-pre-wrap">{msg.content}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContentConverterAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = converterSequence[currentStep];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < converterSequence.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(converterSequence.length - 1, prev + 1));
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 标题 */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-[var(--terminal-green)] mb-2 font-mono">
          OpenAI 内容转换器
        </h1>
        <p className="text-gray-400">
          ContentConverter - Gemini ⇄ OpenAI 双向格式转换
        </p>
        <div className="text-xs text-gray-600 mt-1 font-mono">
          核心文件: packages/core/src/core/openaiContentGenerator/converter.ts
        </div>
      </div>

      {/* 进度条 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-1">
          {converterSequence.map((s, i) => (
            <button
              key={s.phase}
              onClick={() => setCurrentStep(i)}
              className={`
                flex-1 h-2 rounded-full transition-all cursor-pointer
                ${
                  i === currentStep
                    ? s.direction === 'gemini_to_openai'
                      ? 'bg-[var(--terminal-green)]'
                      : 'bg-[var(--cyber-blue)]'
                    : i < currentStep
                      ? 'bg-gray-500'
                      : 'bg-gray-700'
                }
              `}
              title={s.title}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>
            步骤 {currentStep + 1} / {converterSequence.length}
          </span>
          <span
            className={
              step.direction === 'gemini_to_openai'
                ? 'text-[var(--terminal-green)]'
                : 'text-[var(--cyber-blue)]'
            }
          >
            {step.direction === 'gemini_to_openai' ? 'Gemini → OpenAI' : 'OpenAI → Gemini'}
          </span>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：可视化 */}
        <div className="space-y-6">
          {/* 当前步骤 */}
          <div
            className="rounded-xl p-6 border"
            style={{
              borderColor:
                step.direction === 'gemini_to_openai'
                  ? 'rgba(16,185,129,0.3)'
                  : 'rgba(59,130,246,0.3)',
              background:
                step.direction === 'gemini_to_openai'
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,0,0,0.8))'
                  : 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(0,0,0,0.8))',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                style={{
                  backgroundColor:
                    step.direction === 'gemini_to_openai'
                      ? 'var(--terminal-green)'
                      : 'var(--cyber-blue)',
                  color: 'white',
                }}
              >
                {currentStep + 1}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{step.title}</h2>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            </div>

            {step.highlight && (
              <div
                className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor:
                    step.direction === 'gemini_to_openai'
                      ? 'rgba(16,185,129,0.2)'
                      : 'rgba(59,130,246,0.2)',
                  color:
                    step.direction === 'gemini_to_openai'
                      ? 'var(--terminal-green)'
                      : 'var(--cyber-blue)',
                }}
              >
                {step.highlight}
              </div>
            )}
          </div>

          {/* 格式对比 */}
          {step.visualData?.gemini !== undefined && step.visualData?.openai !== undefined && (
            <FormatComparisonVisualizer
              gemini={step.visualData.gemini as Record<string, unknown>}
              openai={step.visualData.openai as Record<string, unknown>}
              direction={step.direction}
            />
          )}

          {/* 另一组格式对比 */}
          {step.visualData?.geminiTool !== undefined && step.visualData?.openaiTool !== undefined && (
            <FormatComparisonVisualizer
              gemini={step.visualData.geminiTool as Record<string, unknown>}
              openai={step.visualData.openaiTool as Record<string, unknown>}
              direction={step.direction}
            />
          )}
          {Boolean(step.visualData && step.visualData.geminiContent !== undefined && step.visualData.openaiMessage !== undefined) && (
            <FormatComparisonVisualizer
              gemini={step.visualData!.geminiContent as Record<string, unknown>}
              openai={step.visualData!.openaiMessage as Record<string, unknown>}
              direction={step.direction}
            />
          )}
          {Boolean(step.visualData && step.visualData.geminiChunk !== undefined && step.visualData.geminiResponse !== undefined) && (
            <FormatComparisonVisualizer
              gemini={step.visualData!.openaiChunk as Record<string, unknown>}
              openai={step.visualData!.geminiResponse as Record<string, unknown>}
              direction={step.direction}
            />
          )}

          {/* 清理可视化 */}
          {step.visualData?.before !== undefined && step.visualData?.after !== undefined && step.visualData?.removed !== undefined && (
            <CleanupVisualizer
              before={step.visualData.before as Array<{ role: string; tool_calls?: { id: string; }[] | undefined; tool_call_id?: string | undefined }>}
              after={step.visualData.after as Array<{ role: string; tool_calls?: { id: string; }[] | undefined; tool_call_id?: string | undefined }>}
              removed={step.visualData.removed as string}
            />
          )}

          {/* 合并可视化 */}
          {step.visualData?.before &&
            step.visualData?.after &&
            !step.visualData?.removed &&
            (step.visualData.before as Array<{ role: string }>)[0]?.role && (
              <MergeVisualizer
                before={step.visualData.before as Array<{ role: string; content: string }>}
                after={step.visualData.after as Array<{ role: string; content: string }>}
              />
            )}

          {/* 功能列表 */}
          {step.visualData?.features && (
            <div className="grid grid-cols-2 gap-3">
              {(step.visualData.features as Array<{ name: string; desc: string }>).map((f, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-black/30 border border-gray-700"
                >
                  <div className="font-medium text-white text-sm">{f.name}</div>
                  <div className="text-xs text-gray-400">{f.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右侧：代码 */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-3 font-mono">源码实现</h3>
          <div
            className="rounded-xl overflow-hidden border border-gray-800"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            <div className="p-1 border-b border-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-gray-500 ml-2 font-mono">converter.ts</span>
            </div>
            <JsonBlock code={step.codeSnippet} />
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="max-w-6xl mx-auto mt-8 flex items-center justify-center gap-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          重置
        </button>
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          上一步
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${
              isPlaying
                ? 'bg-amber-600 text-white hover:bg-amber-500'
                : 'bg-[var(--terminal-green)] text-black hover:opacity-90'
            }
          `}
        >
          {isPlaying ? '暂停' : '自动播放'}
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === converterSequence.length - 1}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          下一步
        </button>
      </div>
    </div>
  );
}
