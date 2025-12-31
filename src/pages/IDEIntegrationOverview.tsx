import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages } from '../components/RelatedPages';

export function IDEIntegrationOverview() {
  const ideArchitecture = `
flowchart TB
    subgraph IDEs["IDE 客户端"]
        VSCode["VS Code"]
        Zed["Zed Editor"]
        JetBrains["JetBrains (计划中)"]
    end

    subgraph Protocols["通信协议"]
        MCP["MCP Protocol"]
        ACP["ACP Protocol (Zed)"]
        LSP["LSP-like Protocol"]
    end

    subgraph CLI["Innies CLI"]
        MCPServer["MCP Server"]
        IDEBridge["IDE Bridge"]
        DiffEngine["Diff Engine"]
    end

    subgraph Features["功能特性"]
        FileOps["文件操作"]
        Diagnostics["诊断信息"]
        Symbols["符号信息"]
        Workspace["工作区访问"]
    end

    VSCode <-->|MCP| MCPServer
    Zed <-->|ACP| IDEBridge
    JetBrains <-.->|计划中| IDEBridge

    MCPServer --> FileOps
    MCPServer --> Diagnostics
    IDEBridge --> Symbols
    IDEBridge --> Workspace

    style VSCode fill:#007acc,color:#fff
    style Zed fill:#f59e0b,color:#000
    style MCPServer fill:#22d3ee,color:#000
`;

  const mcpFlow = `
sequenceDiagram
    participant VSC as VS Code
    participant Ext as Companion Extension
    participant MCP as MCP Server
    participant CLI as CLI Core

    VSC->>Ext: 安装/启动扩展
    Ext->>MCP: 启动 MCP Server
    MCP-->>Ext: Server Ready

    Note over VSC,CLI: 工具调用流程

    CLI->>MCP: 请求文件内容
    MCP->>Ext: workspace.fs.readFile
    Ext->>VSC: 读取编辑器缓冲区
    VSC-->>Ext: 文件内容
    Ext-->>MCP: 文件内容
    MCP-->>CLI: 返回结果

    Note over VSC,CLI: Diff 应用流程

    CLI->>MCP: 应用 Diff
    MCP->>Ext: workspace.applyEdit
    Ext->>VSC: 打开 Diff 视图
    VSC-->>Ext: 用户确认
    Ext-->>MCP: 应用结果
    MCP-->>CLI: 成功
`;

  const acpFlow = `
sequenceDiagram
    participant Zed as Zed Editor
    participant ACP as ACP Server
    participant CLI as CLI Core

    Zed->>ACP: 建立连接
    ACP-->>Zed: 协议握手

    Note over Zed,CLI: Context 获取

    CLI->>ACP: 请求工作区上下文
    ACP->>Zed: 获取打开文件列表
    Zed-->>ACP: 文件列表 + 光标位置
    ACP-->>CLI: 上下文信息

    Note over Zed,CLI: 编辑应用

    CLI->>ACP: 发送编辑请求
    ACP->>Zed: 应用增量编辑
    Zed-->>ACP: 编辑确认
    ACP-->>CLI: 完成
`;

  return (
    <div className="space-y-8">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🔌</span>
          <h1 className="text-3xl font-bold text-white">IDE 集成统一概览</h1>
        </div>
        <p className="text-gray-300 text-lg">
          VS Code、Zed 等 IDE 的集成架构、协议和功能特性总览
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-500/30 rounded-full text-sm text-blue-300">VS Code</span>
          <span className="px-3 py-1 bg-orange-500/30 rounded-full text-sm text-orange-300">Zed</span>
          <span className="px-3 py-1 bg-purple-500/30 rounded-full text-sm text-purple-300">MCP</span>
          <span className="px-3 py-1 bg-green-500/30 rounded-full text-sm text-green-300">ACP</span>
        </div>
      </div>

      {/* 架构总览 */}
      <Layer title="集成架构总览" icon="🏗️">
        <MermaidDiagram chart={ideArchitecture} title="IDE 集成架构" />
      </Layer>

      {/* IDE 对比 */}
      <Layer title="IDE 集成对比" icon="⚖️">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-2 px-3">特性</th>
                <th className="text-left py-2 px-3">VS Code</th>
                <th className="text-left py-2 px-3">Zed</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">集成方式</td>
                <td className="py-2 px-3">Companion Extension + MCP</td>
                <td className="py-2 px-3">原生 ACP 协议</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">文件读取</td>
                <td className="py-2 px-3 text-green-400">✓ 编辑器缓冲区</td>
                <td className="py-2 px-3 text-green-400">✓ 编辑器缓冲区</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">Diff 视图</td>
                <td className="py-2 px-3 text-green-400">✓ 内置 Diff Editor</td>
                <td className="py-2 px-3 text-green-400">✓ 原生支持</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">诊断信息</td>
                <td className="py-2 px-3 text-green-400">✓ Problems Panel</td>
                <td className="py-2 px-3 text-green-400">✓ 诊断面板</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">终端集成</td>
                <td className="py-2 px-3 text-green-400">✓ 集成终端</td>
                <td className="py-2 px-3 text-green-400">✓ 集成终端</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">符号跳转</td>
                <td className="py-2 px-3 text-yellow-400">△ 通过 LSP</td>
                <td className="py-2 px-3 text-green-400">✓ 原生支持</td>
              </tr>
              <tr>
                <td className="py-2 px-3">成熟度</td>
                <td className="py-2 px-3 text-green-400">稳定</td>
                <td className="py-2 px-3 text-yellow-400">积极开发中</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* VS Code 集成 */}
      <Layer title="VS Code 集成详解" icon="💙">
        <div className="space-y-4">
          <MermaidDiagram chart={mcpFlow} title="VS Code MCP 通信流程" />

          <HighlightBox title="Companion Extension 功能" icon="🧩" variant="blue">
            <ul className="space-y-2 text-sm">
              <li><strong>MCP Server</strong>：提供工作区访问能力</li>
              <li><strong>文件操作</strong>：读取编辑器缓冲区（未保存内容）</li>
              <li><strong>Diff 应用</strong>：打开 VS Code Diff 视图供用户审核</li>
              <li><strong>诊断读取</strong>：获取 ESLint、TypeScript 等诊断信息</li>
            </ul>
          </HighlightBox>

          <CodeBlock
            title="VS Code 扩展配置"
            language="json"
            code={`{
  "gemini.mcp.enabled": true,
  "gemini.mcp.port": 3000,
  "gemini.diffView.enabled": true,
  "gemini.autoApply": false,
  "gemini.diagnostics.include": ["error", "warning"]
}`}
          />
        </div>
      </Layer>

      {/* Zed 集成 */}
      <Layer title="Zed 集成详解" icon="🟠">
        <div className="space-y-4">
          <MermaidDiagram chart={acpFlow} title="Zed ACP 通信流程" />

          <HighlightBox title="ACP 协议特性" icon="🔧" variant="orange">
            <ul className="space-y-2 text-sm">
              <li><strong>原生集成</strong>：Zed 内置 ACP 支持，无需扩展</li>
              <li><strong>Context Provider</strong>：提供工作区上下文给 CLI</li>
              <li><strong>增量编辑</strong>：高效的增量编辑应用</li>
              <li><strong>符号索引</strong>：利用 Zed 的符号索引能力</li>
            </ul>
          </HighlightBox>

          <CodeBlock
            title="Zed 配置"
            language="json"
            code={`{
  "assistant": {
    "enabled": true,
    "provider": "gemini",
    "gemini": {
      "binary": "gemini",
      "args": ["--ide-mode", "zed"]
    }
  }
}`}
          />
        </div>
      </Layer>

      {/* 通用功能 */}
      <Layer title="通用集成功能" icon="🔧">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="文件操作" icon="📄" variant="green">
            <ul className="space-y-1 text-sm">
              <li>读取编辑器缓冲区（包含未保存内容）</li>
              <li>创建新文件</li>
              <li>应用编辑（通过 Diff 视图）</li>
              <li>删除文件</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="工作区访问" icon="📁" variant="blue">
            <ul className="space-y-1 text-sm">
              <li>列出工作区文件</li>
              <li>搜索文件内容</li>
              <li>获取项目结构</li>
              <li>访问 .gitignore 规则</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="诊断信息" icon="🔍" variant="purple">
            <ul className="space-y-1 text-sm">
              <li>获取 ESLint/TSLint 错误</li>
              <li>TypeScript 类型错误</li>
              <li>编译器警告</li>
              <li>自定义诊断</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="上下文感知" icon="🎯" variant="orange">
            <ul className="space-y-1 text-sm">
              <li>当前打开文件</li>
              <li>光标位置</li>
              <li>选中内容</li>
              <li>可见范围</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      {/* Diff 协议 */}
      <Layer title="IDE Diff 协议" icon="📝">
        <CodeBlock
          title="Diff 请求格式"
          code={`interface IDEDiffRequest {
  // 目标文件路径
  filePath: string;

  // Diff 类型
  diffType: 'unified' | 'inline';

  // 变更内容
  changes: {
    oldContent: string;
    newContent: string;
  };

  // 元信息
  metadata: {
    description: string;
    toolName: string;
    timestamp: number;
  };
}

// VS Code 会打开 Diff 视图
// 用户可以：接受全部、拒绝全部、逐行选择`}
        />
      </Layer>

      {/* 快速开始 */}
      <Layer title="快速开始" icon="🚀">
        <div className="space-y-4">
          <HighlightBox title="VS Code 设置" icon="💙" variant="blue">
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>安装 "Innies IDE Companion" 扩展</li>
              <li>扩展自动启动 MCP Server</li>
              <li>在终端运行 <code className="text-cyan-400">gemini</code></li>
              <li>CLI 自动检测并连接 MCP Server</li>
            </ol>
          </HighlightBox>

          <HighlightBox title="Zed 设置" icon="🟠" variant="orange">
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>确保 Zed 版本 &gt;= 0.140</li>
              <li>在 settings.json 中配置 assistant</li>
              <li>使用 <code className="text-cyan-400">Cmd+Shift+P</code> 打开命令面板</li>
              <li>选择 "Innies: Start Session"</li>
            </ol>
          </HighlightBox>
        </div>
      </Layer>

      {/* 连接状态机 */}
      <Layer title="连接状态机与故障排查" icon="🔗">
        <div className="space-y-4">
          <MermaidDiagram
            title="IDE 连接状态机"
            chart={`
stateDiagram-v2
    [*] --> Disconnected

    Disconnected --> Connecting: CLI启动/用户触发
    Connecting --> Connected: 握手成功
    Connecting --> ConnectionFailed: 超时/拒绝

    Connected --> Active: 收到首条消息
    Connected --> Disconnected: 连接断开

    Active --> Reconnecting: 连接中断
    Active --> Disconnected: 用户断开

    Reconnecting --> Connected: 重连成功
    Reconnecting --> ConnectionFailed: 重连失败(3次)

    ConnectionFailed --> Connecting: 用户重试
    ConnectionFailed --> Disconnected: 放弃

    note right of Connecting: 默认超时 5s
    note right of Reconnecting: 指数退避重试
`}
          />

          <HighlightBox title="断线重连机制" icon="🔄" variant="blue">
            <CodeBlock
              title="重连策略"
              code={`interface ReconnectionConfig {
  maxRetries: 3;
  baseDelay: 1000;      // 1s
  maxDelay: 10000;      // 10s
  backoffFactor: 2;
}

// 重连时序: 1s → 2s → 4s → 放弃
async function reconnect(config: ReconnectionConfig) {
  for (let i = 0; i < config.maxRetries; i++) {
    const delay = Math.min(
      config.baseDelay * Math.pow(config.backoffFactor, i),
      config.maxDelay
    );
    await sleep(delay);

    try {
      await connect();
      return; // 成功
    } catch (e) {
      console.log(\`重连尝试 \${i + 1} 失败\`);
    }
  }
  throw new Error('重连失败');
}`}
            />
          </HighlightBox>

          <HighlightBox title="多 IDE 冲突处理" icon="⚠️" variant="orange">
            <div className="space-y-4">
              <p className="text-sm">
                当多个 IDE 实例同时尝试连接时，可能发生端口或工作区锁冲突：
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-2 px-3">冲突类型</th>
                      <th className="text-left py-2 px-3">症状</th>
                      <th className="text-left py-2 px-3">解决方案</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 px-3 font-mono text-red-400">端口冲突</td>
                      <td className="py-2 px-3">EADDRINUSE: 3000</td>
                      <td className="py-2 px-3">配置不同端口或关闭其他实例</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 px-3 font-mono text-red-400">工作区锁</td>
                      <td className="py-2 px-3">Workspace locked</td>
                      <td className="py-2 px-3">每个工作区只允许一个连接</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-red-400">会话冲突</td>
                      <td className="py-2 px-3">Session already exists</td>
                      <td className="py-2 px-3">终止旧会话或使用新会话 ID</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <CodeBlock
                title="冲突检测与处理"
                code={`// 启动前检查端口
async function checkPortAvailability(port: number): Promise<boolean> {
  try {
    const server = net.createServer();
    await new Promise((resolve, reject) => {
      server.listen(port, () => resolve(true));
      server.on('error', reject);
    });
    server.close();
    return true;
  } catch (e) {
    if (e.code === 'EADDRINUSE') {
      // 检查是否是我们自己的进程
      const owner = await findProcessOnPort(port);
      if (owner?.includes('gemini')) {
        return 'already_running';
      }
      return false;
    }
    throw e;
  }
}`}
              />
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 版本兼容性 */}
      <Layer title="版本兼容性 Checklist" icon="✅">
        <div className="space-y-4">
          <p className="text-gray-300">
            确保 CLI、扩展、IDE 版本兼容，避免连接或功能问题：
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 px-3">组件</th>
                  <th className="text-left py-2 px-3">最低版本</th>
                  <th className="text-left py-2 px-3">推荐版本</th>
                  <th className="text-left py-2 px-3">检查命令</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-cyan-400">Innies CLI</td>
                  <td className="py-2 px-3">1.0.0</td>
                  <td className="py-2 px-3 text-green-400">latest</td>
                  <td className="py-2 px-3 font-mono text-gray-400">gemini --version</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-cyan-400">VS Code</td>
                  <td className="py-2 px-3">1.80.0</td>
                  <td className="py-2 px-3 text-green-400">1.90+</td>
                  <td className="py-2 px-3 font-mono text-gray-400">code --version</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-cyan-400">Companion Ext</td>
                  <td className="py-2 px-3">0.5.0</td>
                  <td className="py-2 px-3 text-green-400">与 CLI 同版本</td>
                  <td className="py-2 px-3 font-mono text-gray-400">扩展面板查看</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-cyan-400">Zed</td>
                  <td className="py-2 px-3">0.140.0</td>
                  <td className="py-2 px-3 text-green-400">0.150+</td>
                  <td className="py-2 px-3 font-mono text-gray-400">Zed &gt; About</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-cyan-400">Node.js</td>
                  <td className="py-2 px-3">20.0.0</td>
                  <td className="py-2 px-3 text-green-400">20.19+</td>
                  <td className="py-2 px-3 font-mono text-gray-400">node --version</td>
                </tr>
              </tbody>
            </table>
          </div>

          <HighlightBox title="自动更新机制" icon="🔄" variant="green">
            <ul className="space-y-2 text-sm">
              <li><strong>CLI</strong>：运行 <code className="text-cyan-400">npm update -g @anthropic-ai/claude-code</code> 或使用包管理器更新</li>
              <li><strong>VS Code 扩展</strong>：自动更新，或手动在扩展面板更新</li>
              <li><strong>Zed</strong>：自动更新，或通过 About 菜单检查</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="版本不兼容症状" icon="🔍" variant="red">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 px-3">症状</th>
                    <th className="text-left py-2 px-3">可能原因</th>
                    <th className="text-left py-2 px-3">解决方案</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-3">"Protocol version mismatch"</td>
                    <td className="py-2 px-3">CLI 与扩展版本不匹配</td>
                    <td className="py-2 px-3">同时更新 CLI 和扩展</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-3">"Tool not found: xxx"</td>
                    <td className="py-2 px-3">旧扩展缺少新工具</td>
                    <td className="py-2 px-3">更新扩展到最新版</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-3">"ACP handshake failed"</td>
                    <td className="py-2 px-3">Zed 版本过低</td>
                    <td className="py-2 px-3">更新 Zed 到 0.140+</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">"Diff view not opening"</td>
                    <td className="py-2 px-3">VS Code 版本过低</td>
                    <td className="py-2 px-3">更新 VS Code 到 1.80+</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </HighlightBox>

          <CodeBlock
            title="版本检查脚本"
            language="bash"
            code={`#!/bin/bash
# 快速版本检查脚本

echo "=== Innies CLI 环境检查 ==="

# CLI 版本
echo -n "CLI: "
gemini --version 2>/dev/null || echo "未安装"

# Node.js 版本
echo -n "Node.js: "
node --version

# VS Code 版本
echo -n "VS Code: "
code --version 2>/dev/null | head -1 || echo "未安装"

# Zed 版本 (macOS)
echo -n "Zed: "
if [ -d "/Applications/Zed.app" ]; then
  defaults read /Applications/Zed.app/Contents/Info.plist CFBundleShortVersionString
else
  echo "未安装"
fi

# 检查 MCP 端口
echo -n "MCP 端口 3000: "
lsof -i :3000 >/dev/null 2>&1 && echo "已占用" || echo "可用"`}
          />
        </div>
      </Layer>

      {/* 相关页面 */}
      <RelatedPages
        pages={[
          { id: 'ide-integration', label: 'IDE 集成详情', description: 'VS Code 深度集成' },
          { id: 'ide-diff', label: 'IDE Diff 协议', description: 'Diff 视图实现' },
          { id: 'zed-integration', label: 'Zed ACP 协议', description: 'Zed 原生集成' },
          { id: 'mcp', label: 'MCP 集成', description: '工具扩展协议' },
          { id: 'tool-arch', label: '工具架构', description: '文件操作工具' },
          { id: 'config', label: '配置系统', description: 'IDE 配置选项' },
        ]}
      />
    </div>
  );
}
