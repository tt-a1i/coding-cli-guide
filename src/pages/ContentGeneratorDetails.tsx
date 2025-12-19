import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';

export function ContentGeneratorDetails() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">ContentGenerator API 调用层详解</h2>

      {/* 概述 */}
      <Layer title="架构概述" icon="🏗️">
        <HighlightBox title="ContentGenerator 的作用" icon="📡" variant="blue">
          <p>
            <code className="bg-black/30 px-1 rounded">ContentGenerator</code> 是 API 调用的抽象层，
            负责与不同的 AI 提供商通信。它将内部格式转换为 API 格式，并处理流式响应。
          </p>
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white/5 rounded-lg p-4 border border-cyan-400/30">
            <h4 className="text-cyan-400 font-bold mb-2">OpenAI 兼容</h4>
            <code className="text-xs text-gray-400 block mb-2">
              packages/core/src/core/openaiContentGenerator/
            </code>
            <p className="text-sm text-gray-300">
              支持 OpenAI API 格式的所有提供商（OpenAI、Azure、本地模型等）
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-purple-400/30">
            <h4 className="text-purple-400 font-bold mb-2">Qwen OAuth</h4>
            <code className="text-xs text-gray-400 block mb-2">
              packages/core/src/qwen/qwenContentGenerator.ts
            </code>
            <p className="text-sm text-gray-300">
              Qwen 特定实现，免费 2000 请求/天
            </p>
          </div>
        </div>
      </Layer>

      {/* OpenAI ContentGenerator */}
      <Layer title="OpenAI ContentGenerator 架构" icon="🔧">
        <CodeBlock
          title="类结构"
          code={`class OpenAIContentGenerator implements ContentGenerator {
    private client: OpenAI;           // OpenAI SDK 客户端
    private converter: OpenAIContentConverter;  // 格式转换器
    private telemetry: TelemetryService;        // 遥测服务

    constructor(config: ContentGeneratorConfig) {
        this.client = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseUrl,  // 支持自定义端点
            timeout: config.timeout,
            maxRetries: config.maxRetries
        });

        this.converter = new OpenAIContentConverter();
    }
}`}
        />
      </Layer>

      {/* generateContentStream */}
      <Layer title="generateContentStream() 方法" icon="📤">
        <CodeBlock
          title="核心生成方法"
          code={`async *generateContentStream(
    request: GenerateContentRequest
): AsyncGenerator<GenerateContentResponse> {

    // Stage 1: 转换请求格式
    const openaiRequest = this.converter.convertGeminiToOpenAI(request);

    // Stage 2: 调用 API
    const stream = await this.client.chat.completions.create({
        ...openaiRequest,
        stream: true  // 启用流式
    });

    // Stage 3: 处理并转换响应
    for await (const chunk of stream) {
        // 转换 OpenAI 格式 → Gemini 格式
        const geminiChunk = this.converter
            .convertOpenAIResponseToGemini(chunk);

        yield geminiChunk;
    }
}`}
        />
      </Layer>

      {/* 格式转换 */}
      <Layer title="请求格式转换" icon="🔄">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="text-cyan-400 font-bold mb-2">Gemini 格式 (内部)</h4>
            <JsonBlock
              code={`{
    "model": "qwen-coder-plus",
    "contents": [
        {
            "role": "user",
            "parts": [
                { "text": "帮我读取文件" }
            ]
        }
    ],
    "tools": [
        {
            "functionDeclarations": [
                {
                    "name": "read_file",
                    "description": "读取文件内容",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "absolute_path": { "type": "string" }
                        }
                    }
                }
            ]
        }
    ],
    "generationConfig": {
        "temperature": 0.7,
        "maxOutputTokens": 8192
    }
}`}
            />
          </div>
          <div>
            <h4 className="text-purple-400 font-bold mb-2">OpenAI 格式 (API)</h4>
            <JsonBlock
              code={`{
    "model": "qwen-coder-plus",
    "messages": [
        {
            "role": "user",
            "content": "帮我读取文件"
        }
    ],
    "tools": [
        {
            "type": "function",
            "function": {
                "name": "read_file",
                "description": "读取文件内容",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "absolute_path": { "type": "string" }
                    }
                }
            }
        }
    ],
    "temperature": 0.7,
    "max_tokens": 8192,
    "stream": true
}`}
            />
          </div>
        </div>
      </Layer>

      {/* 响应转换 */}
      <Layer title="响应格式转换" icon="📥">
        <CodeBlock
          title="OpenAIContentConverter.convertOpenAIResponseToGemini()"
          code={`convertOpenAIResponseToGemini(chunk: ChatCompletionChunk) {
    const choice = chunk.choices[0];
    const delta = choice.delta;

    const parts = [];

    // 1. 文本内容
    if (delta.content) {
        parts.push({ text: delta.content });
    }

    // 2. 工具调用
    if (delta.tool_calls) {
        for (const toolCall of delta.tool_calls) {
            parts.push({
                functionCall: {
                    name: toolCall.function.name,
                    args: JSON.parse(toolCall.function.arguments)
                }
            });
        }
    }

    // 3. 构建 Gemini 格式响应
    return {
        candidates: [{
            content: {
                role: 'model',
                parts: parts
            },
            finishReason: this.mapFinishReason(choice.finish_reason)
        }],
        usageMetadata: this.convertUsage(chunk.usage)
    };
}`}
        />
      </Layer>

      {/* 工具定义转换 */}
      <Layer title="工具定义转换" icon="🔧">
        <CodeBlock
          title="convertToolsToOpenAI()"
          code={`convertToolsToOpenAI(tools: Tool[]): OpenAITool[] {
    return tools.map(tool => {
        // Gemini FunctionDeclaration → OpenAI Function
        const funcDecl = tool.functionDeclarations[0];

        return {
            type: 'function',
            function: {
                name: funcDecl.name,
                description: funcDecl.description,
                parameters: {
                    type: 'object',
                    properties: funcDecl.parameters.properties,
                    required: funcDecl.parameters.required || []
                }
            }
        };
    });
}`}
        />

        <HighlightBox title="工具定义结构" icon="📋" variant="green">
          <p className="mb-2">每个工具定义包含：</p>
          <ul className="pl-5 list-disc space-y-1">
            <li><strong>name</strong>: 工具名称（如 read_file, edit, bash）</li>
            <li><strong>description</strong>: 工具描述，帮助 AI 理解何时使用</li>
            <li><strong>parameters</strong>: JSON Schema 定义的参数结构</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* 配置选项 */}
      <Layer title="ContentGenerator 配置" icon="⚙️">
        <CodeBlock
          code={`interface ContentGeneratorConfig {
    // 模型配置
    model: string;              // 模型名称

    // 认证
    apiKey?: string;            // API 密钥
    baseUrl?: string;           // 基础 URL（自定义端点）
    authType: AuthType;         // 认证类型

    // 请求配置
    timeout?: number;           // 超时时间（毫秒）
    maxRetries?: number;        // 最大重试次数

    // 采样参数
    samplingParams?: {
        temperature?: number;   // 温度 (0-2)
        top_p?: number;         // Top-p 采样
        top_k?: number;         // Top-k 采样
        max_tokens?: number;    // 最大输出 token
    };

    // 高级选项
    disableCacheControl?: boolean;  // 禁用缓存
    enableThinking?: boolean;       // 启用思考模式
}`}
        />
      </Layer>

      {/* 错误处理 */}
      <Layer title="错误处理" icon="⚠️">
        <div className="space-y-3">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2">429 Rate Limit</h4>
            <p className="text-sm text-gray-300 mb-2">请求过多，需要等待</p>
            <code className="text-xs text-gray-400">
              处理：读取 Retry-After 头，等待后重试
            </code>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">401 Unauthorized</h4>
            <p className="text-sm text-gray-300 mb-2">认证失败</p>
            <code className="text-xs text-gray-400">
              处理：提示用户检查 API 密钥
            </code>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-400 font-bold mb-2">500 Server Error</h4>
            <p className="text-sm text-gray-300 mb-2">服务器错误</p>
            <code className="text-xs text-gray-400">
              处理：指数退避重试，最多 3 次
            </code>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">Timeout</h4>
            <p className="text-sm text-gray-300 mb-2">请求超时</p>
            <code className="text-xs text-gray-400">
              处理：重试或提示用户网络问题
            </code>
          </div>
        </div>
      </Layer>

      {/* 流式处理管道 */}
      <Layer title="流式处理管道" icon="🌊">
        <div className="bg-black/30 rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="bg-blue-400/20 border border-blue-400 rounded-lg px-4 py-2 text-center">
              <div className="text-sm text-blue-400">Raw API Stream</div>
              <div className="text-xs text-gray-400">ChatCompletionChunk</div>
            </div>
            <div className="text-cyan-400">→</div>
            <div className="bg-purple-400/20 border border-purple-400 rounded-lg px-4 py-2 text-center">
              <div className="text-sm text-purple-400">转换器</div>
              <div className="text-xs text-gray-400">OpenAI → Gemini</div>
            </div>
            <div className="text-cyan-400">→</div>
            <div className="bg-green-400/20 border border-green-400 rounded-lg px-4 py-2 text-center">
              <div className="text-sm text-green-400">标准化 Stream</div>
              <div className="text-xs text-gray-400">GenerateContentResponse</div>
            </div>
            <div className="text-cyan-400">→</div>
            <div className="bg-orange-400/20 border border-orange-400 rounded-lg px-4 py-2 text-center">
              <div className="text-sm text-orange-400">GeminiChat</div>
              <div className="text-xs text-gray-400">历史更新</div>
            </div>
            <div className="text-cyan-400">→</div>
            <div className="bg-pink-400/20 border border-pink-400 rounded-lg px-4 py-2 text-center">
              <div className="text-sm text-pink-400">UI 渲染</div>
              <div className="text-xs text-gray-400">实时显示</div>
            </div>
          </div>
        </div>
      </Layer>
    </div>
  );
}
