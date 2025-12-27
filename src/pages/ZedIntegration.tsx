/**
 * ZedIntegration.tsx - Zed 编辑器集成深度解析
 *
 * 详解 ACP (Agent Connection Protocol) 协议实现
 * 以及 Innies CLI 如何作为 Zed 的 AI 代理后端运行
 */

import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';

export function ZedIntegration() {
  const [activeTab, setActiveTab] = useState<'overview' | 'protocol' | 'classes' | 'permission' | 'fs'>('overview');

  return (
    <div className="page-container">
      <h1>🔌 Zed 编辑器集成</h1>

      <div className="info-box" style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
        borderLeft: '4px solid #8b5cf6',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#a78bfa' }}>ACP 协议概述</h3>
        <p style={{ margin: 0, color: '#d1d5db' }}>
          <strong>Agent Connection Protocol</strong> 是一个基于 JSON-RPC 2.0 的实验性协议，
          允许 GUI 应用（如 Zed 编辑器）与 AI 代理进行双向通信。CLI 作为独立进程运行，
          通过 stdin/stdout 与 Zed 交换消息。
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation" style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'overview', label: '🏗️ 架构概览' },
          { id: 'protocol', label: '📡 协议交互' },
          { id: 'classes', label: '🧩 核心类' },
          { id: 'permission', label: '🛡️ 权限机制' },
          { id: 'fs', label: '📁 文件代理' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: activeTab === tab.id ? '#8b5cf6' : '#374151',
              color: activeTab === tab.id ? 'white' : '#9ca3af',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="content-section">
          <h2>集成架构</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div className="feature-card" style={{ background: '#1f2937', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ color: '#a78bfa', marginTop: 0 }}>什么是 ACP？</h3>
              <ul style={{ color: '#9ca3af', paddingLeft: '1.2rem' }}>
                <li>双向请求/响应模型</li>
                <li>支持通知和流式更新</li>
                <li>标准化的权限请求机制</li>
                <li>文件系统代理能力</li>
              </ul>
            </div>

            <div className="feature-card" style={{ background: '#1f2937', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ color: '#60a5fa', marginTop: 0 }}>集成模式</h3>
              <ul style={{ color: '#9ca3af', paddingLeft: '1.2rem' }}>
                <li>CLI 作为独立进程运行</li>
                <li>stdin/stdout 双向通信</li>
                <li>Zed 控制 UI 和权限决策</li>
                <li>会话级隔离和管理</li>
              </ul>
            </div>
          </div>

          <h3>入口流程</h3>
          <MermaidDiagram chart={`
sequenceDiagram
    participant Z as Zed Editor
    participant A as Innies Agent
    participant M as Model API

    rect rgb(60, 60, 80)
        Note over Z,A: 初始化阶段
        Z->>A: initialize(protocolVersion, capabilities)
        A->>Z: InitializeResponse(authMethods, agentCapabilities)
        Z->>A: authenticate(methodId: "qwen_oauth")
        A->>Z: AuthenticateResponse(success)
    end

    rect rgb(60, 80, 60)
        Note over Z,A: 会话创建
        Z->>A: session/new(cwd, mcpServers[])
        A->>A: 创建 Config
        A->>A: 启动 GeminiChat
        A->>Z: NewSessionResponse(sessionId)
    end

    rect rgb(80, 60, 60)
        Note over Z,M: 对话循环
        Z->>A: session/prompt(sessionId, contentBlocks[])
        A->>A: 解析 @命令
        A->>M: sendMessageStream()
        M-->>A: 流式响应 chunks
        A->>Z: session/update(agent_message_chunk)

        alt 需要执行工具
            A->>Z: session/request_permission(options)
            Z->>A: PermissionResponse(optionId)
            A->>A: 执行工具
            A->>Z: session/update(tool_call_update)
        end

        A->>Z: PromptResponse(stopReason)
    end
`} />
        </div>
      )}

      {/* Protocol Tab */}
      {activeTab === 'protocol' && (
        <div className="content-section">
          <h2>协议消息定义</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {/* Agent Methods */}
            <div style={{ background: '#1f2937', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ color: '#fcd34d', marginTop: 0 }}>Agent 方法 (Zed → CLI)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { method: 'initialize', desc: '协商协议版本和能力' },
                  { method: 'authenticate', desc: '执行身份验证' },
                  { method: 'session/new', desc: '创建新会话' },
                  { method: 'session/prompt', desc: '发送用户消息' },
                  { method: 'session/cancel', desc: '取消正在进行的请求' },
                ].map(item => (
                  <div key={item.method} style={{
                    background: '#111827',
                    padding: '0.75rem',
                    borderRadius: '0.375rem'
                  }}>
                    <code style={{ color: '#22d3ee' }}>{item.method}</code>
                    <p style={{ margin: '0.25rem 0 0', color: '#9ca3af', fontSize: '0.875rem' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Methods */}
            <div style={{ background: '#1f2937', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ color: '#4ade80', marginTop: 0 }}>Client 方法 (CLI → Zed)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { method: 'session/update', desc: '流式推送内容更新' },
                  { method: 'session/request_permission', desc: '请求工具执行权限' },
                  { method: 'fs/read_text_file', desc: '通过 Zed 读取文件' },
                  { method: 'fs/write_text_file', desc: '通过 Zed 写入文件' },
                ].map(item => (
                  <div key={item.method} style={{
                    background: '#111827',
                    padding: '0.75rem',
                    borderRadius: '0.375rem'
                  }}>
                    <code style={{ color: '#a78bfa' }}>{item.method}</code>
                    <p style={{ margin: '0.25rem 0 0', color: '#9ca3af', fontSize: '0.875rem' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <h3>Session Update 类型</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #374151' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9ca3af' }}>类型</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9ca3af' }}>用途</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9ca3af' }}>负载</th>
              </tr>
            </thead>
            <tbody style={{ color: '#d1d5db' }}>
              {[
                { type: 'agent_message_chunk', desc: 'AI 回复文本块', payload: 'ContentBlock (text)' },
                { type: 'agent_thought_chunk', desc: '思考过程 (思维链)', payload: 'ContentBlock (thought=true)' },
                { type: 'tool_call', desc: '工具调用开始', payload: 'ToolCall (status: pending/in_progress)' },
                { type: 'tool_call_update', desc: '工具执行结果', payload: 'ToolCall (status: completed/failed)' },
                { type: 'plan', desc: '计划条目列表', payload: 'PlanEntry[]' },
              ].map(row => (
                <tr key={row.type} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <code style={{ color: '#22d3ee' }}>{row.type}</code>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{row.desc}</td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>{row.payload}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="content-section">
          <h2>核心类结构</h2>

          <h3>AgentSideConnection</h3>
          <p style={{ color: '#9ca3af' }}>JSON-RPC 连接管理器，负责消息路由和双向通信</p>
          <CodeBlock
            code={`class AgentSideConnection implements Client {
  #connection: Connection;

  constructor(
    toAgent: (conn: Client) => Agent,  // Agent 工厂函数
    input: WritableStream<Uint8Array>, // stdout → 发送到 Zed
    output: ReadableStream<Uint8Array> // stdin ← 接收自 Zed
  ) {
    const agent = toAgent(this);

    // 注册方法处理器
    const handler = async (method: string, params: unknown) => {
      switch (method) {
        case 'initialize':
          return agent.initialize(params);
        case 'session/new':
          return agent.newSession(params);
        case 'session/prompt':
          return agent.prompt(params);
        case 'session/cancel':
          return agent.cancel(params);
        // ...
      }
    };

    this.#connection = new Connection(handler, input, output);
  }

  // Client 接口：向 Zed 发送请求
  async sessionUpdate(params: SessionNotification): Promise<void>;
  async requestPermission(params): Promise<PermissionResponse>;
  async readTextFile(params): Promise<FileContent>;
  async writeTextFile(params): Promise<void>;
}`}
            language="typescript"
          />

          <h3>GeminiAgent</h3>
          <p style={{ color: '#9ca3af' }}>Agent 接口实现，管理会话生命周期</p>
          <CodeBlock
            code={`class GeminiAgent {
  private sessions: Map<string, Session> = new Map();

  constructor(
    private config: Config,
    private settings: LoadedSettings,
    private extensions: Extension[],
    private argv: CliArgs,
    private client: acp.Client  // 用于回调 Zed
  ) {}

  async initialize(args: InitializeRequest): Promise<InitializeResponse> {
    return {
      protocolVersion: 1,
      authMethods: [
        { id: 'use_openai', name: 'Use OpenAI API' },
        { id: 'qwen_oauth', name: 'Qwen OAuth' },
      ],
      agentCapabilities: {
        loadSession: false,
        promptCapabilities: { image: true, audio: true }
      }
    };
  }

  async newSession({ cwd, mcpServers }): Promise<NewSessionResponse> {
    const sessionId = randomUUID();
    const config = await this.newSessionConfig(sessionId, cwd, mcpServers);

    // 设置文件系统代理
    if (this.clientCapabilities?.fs) {
      const acpFS = new AcpFileSystemService(this.client, sessionId, ...);
      config.setFileSystemService(acpFS);
    }

    const chat = await config.getGeminiClient().startChat();
    const session = new Session(sessionId, chat, config, this.client);
    this.sessions.set(sessionId, session);

    return { sessionId };
  }
}`}
            language="typescript"
          />

          <h3>Session</h3>
          <p style={{ color: '#9ca3af' }}>会话实例，处理单个对话上下文</p>
          <CodeBlock
            code={`class Session {
  private pendingPrompt: AbortController | null = null;

  async prompt(params: PromptRequest): Promise<PromptResponse> {
    this.pendingPrompt?.abort();  // 取消之前的请求
    const pendingSend = new AbortController();
    this.pendingPrompt = pendingSend;

    // 解析 @命令和嵌入资源
    const parts = await this.#resolvePrompt(params.prompt, signal);
    let nextMessage: Content | null = { role: 'user', parts };

    while (nextMessage !== null) {
      const stream = await chat.sendMessageStream(model, {
        message: nextMessage.parts
      });

      for await (const resp of stream) {
        // 流式发送文本块
        if (resp.type === StreamEventType.CHUNK) {
          await this.sendUpdate({
            sessionUpdate: 'agent_message_chunk',
            content: { type: 'text', text: part.text }
          });
        }

        // 收集工具调用
        if (resp.value.functionCalls) {
          functionCalls.push(...resp.value.functionCalls);
        }
      }

      // 执行工具调用
      if (functionCalls.length > 0) {
        const toolResponses = await this.runTools(functionCalls);
        nextMessage = { role: 'user', parts: toolResponses };
      } else {
        nextMessage = null;
      }
    }

    return { stopReason: 'end_turn' };
  }
}`}
            language="typescript"
          />
        </div>
      )}

      {/* Permission Tab */}
      {activeTab === 'permission' && (
        <div className="content-section">
          <h2>权限请求机制</h2>

          <p style={{ color: '#d1d5db', marginBottom: '1.5rem' }}>
            工具执行前，CLI 通过 <code style={{ color: '#22d3ee' }}>request_permission</code> 向 Zed 请求用户授权。
            用户可选择一次性允许或永久允许特定操作。
          </p>

          <MermaidDiagram chart={`
flowchart LR
    subgraph CLI["Innies CLI"]
        TC[Tool 需要确认] --> SP[shouldConfirmExecute]
        SP --> RQ[requestPermission]
    end

    subgraph Zed["Zed Editor"]
        RQ --> UI[显示权限对话框]
        UI --> US[用户选择]
        US --> RS[返回 optionId]
    end

    subgraph Execution["执行"]
        RS --> |proceed_once| EX[执行一次]
        RS --> |proceed_always| RM[记住+执行]
        RS --> |cancel| CN[取消]
    end

    style TC fill:#4a5568
    style UI fill:#553c9a
    style EX fill:#276749
`} />

          <h3>权限选项类型</h3>
          <CodeBlock
            code={`function toPermissionOptions(confirmation: ToolCallConfirmationDetails) {
  switch (confirmation.type) {
    case 'edit':
      return [
        { optionId: 'proceed_always', name: 'Allow All Edits', kind: 'allow_always' },
        { optionId: 'proceed_once', name: 'Allow', kind: 'allow_once' },
        { optionId: 'cancel', name: 'Reject', kind: 'reject_once' }
      ];

    case 'exec':
      return [
        {
          optionId: 'proceed_always',
          name: \`Always Allow \${rootCommand}\`,
          kind: 'allow_always'
        },
        ...basicOptions
      ];

    case 'mcp':
      return [
        {
          optionId: 'proceed_always_server',
          name: \`Always Allow \${serverName}\`,
          kind: 'allow_always'
        },
        {
          optionId: 'proceed_always_tool',
          name: \`Always Allow \${toolName}\`,
          kind: 'allow_always'
        },
        ...basicOptions
      ];
  }
}`}
            language="typescript"
          />

          <h3>错误处理</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            {[
              { code: -32700, msg: 'Parse error' },
              { code: -32600, msg: 'Invalid request' },
              { code: -32601, msg: 'Method not found' },
              { code: -32602, msg: 'Invalid params' },
              { code: -32603, msg: 'Internal error' },
              { code: -32000, msg: 'Auth required' },
            ].map(err => (
              <div key={err.code} style={{
                background: '#1f2937',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <code style={{ color: '#f87171' }}>{err.code}</code>
                <span style={{ color: '#9ca3af' }}>{err.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FileSystem Tab */}
      {activeTab === 'fs' && (
        <div className="content-section">
          <h2>文件系统代理</h2>

          <p style={{ color: '#d1d5db', marginBottom: '1.5rem' }}>
            Zed 可以声明文件系统能力，CLI 将文件操作代理回 IDE，
            使 Zed 可以控制文件访问和显示 diff。
          </p>

          <CodeBlock
            code={`// AcpFileSystemService - 文件操作代理
class AcpFileSystemService implements FileSystemService {
  constructor(
    private readonly client: acp.Client,
    private readonly sessionId: string,
    private readonly capabilities: FileSystemCapability,
    private readonly fallback: FileSystemService  // 本地 fallback
  ) {}

  async readTextFile(filePath: string): Promise<string> {
    // 优先通过 Zed 读取
    if (this.capabilities.readTextFile) {
      const response = await this.client.readTextFile({
        path: filePath,
        sessionId: this.sessionId,
      });
      return response.content;
    }
    // 降级到本地文件系统
    return this.fallback.readTextFile(filePath);
  }

  async writeTextFile(filePath: string, content: string): Promise<void> {
    if (this.capabilities.writeTextFile) {
      await this.client.writeTextFile({
        path: filePath,
        content,
        sessionId: this.sessionId,
      });
      return;
    }
    return this.fallback.writeTextFile(filePath, content);
  }

  // findFiles 始终使用本地实现
  findFiles(fileName: string, searchPaths: readonly string[]): string[] {
    return this.fallback.findFiles(fileName, searchPaths);
  }
}`}
            language="typescript"
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <h4 style={{ color: '#4ade80', marginTop: 0 }}>优势</h4>
              <ul style={{ color: '#9ca3af', paddingLeft: '1.2rem', marginBottom: 0 }}>
                <li>Zed 可以显示原生 diff 视图</li>
                <li>统一的撤销/重做支持</li>
                <li>文件监视和同步</li>
                <li>权限控制更精细</li>
              </ul>
            </div>

            <div style={{
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <h4 style={{ color: '#fcd34d', marginTop: 0 }}>降级策略</h4>
              <ul style={{ color: '#9ca3af', paddingLeft: '1.2rem', marginBottom: 0 }}>
                <li>findFiles 始终使用本地实现</li>
                <li>能力不支持时 fallback</li>
                <li>保持功能完整性</li>
              </ul>
            </div>
          </div>

          <h3>@命令解析</h3>
          <p style={{ color: '#9ca3af' }}>Zed 发送的 prompt 可能包含文件引用，CLI 负责解析和读取：</p>

          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}>
            {[
              { type: 'text', desc: '纯文本内容', color: '#22d3ee' },
              { type: 'image', desc: 'Base64 图像', color: '#4ade80' },
              { type: 'audio', desc: 'Base64 音频', color: '#fcd34d' },
              { type: 'resource_link', desc: '文件 URI 引用', color: '#a78bfa' },
              { type: 'resource', desc: '嵌入的文件内容', color: '#fb923c' },
            ].map(item => (
              <div key={item.type} style={{
                background: '#1f2937',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem'
              }}>
                <code style={{ color: item.color }}>{item.type}</code>
                <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>- {item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Design Insights */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginTop: '2rem'
      }}>
        <h2 style={{ color: '#a78bfa', marginTop: 0 }}>设计洞察</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ background: '#1f2937', padding: '1rem', borderRadius: '0.5rem' }}>
            <h4 style={{ color: '#a78bfa', marginTop: 0 }}>协议解耦</h4>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: 0 }}>
              ACP 协议将 AI 能力与 UI 完全分离。CLI 专注于 AI 交互，
              Zed 专注于用户体验。
            </p>
          </div>

          <div style={{ background: '#1f2937', padding: '1rem', borderRadius: '0.5rem' }}>
            <h4 style={{ color: '#60a5fa', marginTop: 0 }}>能力协商</h4>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: 0 }}>
              初始化时双方交换能力声明，支持渐进式功能增强。
            </p>
          </div>

          <div style={{ background: '#1f2937', padding: '1rem', borderRadius: '0.5rem' }}>
            <h4 style={{ color: '#4ade80', marginTop: 0 }}>用户控制</h4>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: 0 }}>
              权限请求机制确保用户对敏感操作有最终决定权。
            </p>
          </div>
        </div>
      </div>

      {/* Source Files */}
      <div className="source-files" style={{ marginTop: '2rem' }}>
        <h3>源文件索引</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.5rem'
        }}>
          {[
            'packages/cli/src/zed-integration/zedIntegration.ts',
            'packages/cli/src/zed-integration/acp.ts',
            'packages/cli/src/zed-integration/schema.ts',
            'packages/cli/src/zed-integration/fileSystemService.ts',
          ].map(file => (
            <code key={file} style={{
              background: '#1f2937',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              color: '#22d3ee',
              fontSize: '0.875rem'
            }}>
              {file}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ZedIntegration;
