import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'mcp', label: 'MCP集成', description: 'MCP 服务器协议' },
  { id: 'slash-cmd', label: '斜杠命令', description: '命令系统' },
  { id: 'custom-cmd', label: '自定义命令', description: 'TOML 命令定义' },
  { id: 'extension', label: '扩展系统', description: '扩展管理' },
  { id: 'system-prompt', label: 'Prompt构建', description: '系统提示词' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">30秒快速理解</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-5">
          {/* 一句话总结 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <p className="text-[var(--text-primary)] font-medium">
              <span className="text-[var(--terminal-green)] font-bold">一句话：</span>
              MCP Prompt 模板的中央注册表，管理从 MCP 服务器发现的所有 Prompt 定义，支持按名称/服务器查询
            </p>
          </div>

          {/* 关键数字 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">5</div>
              <div className="text-xs text-[var(--text-muted)]">核心方法</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">Map</div>
              <div className="text-xs text-[var(--text-muted)]">存储结构</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">MCP</div>
              <div className="text-xs text-[var(--text-muted)]">Prompt 来源</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">自动</div>
              <div className="text-xs text-[var(--text-muted)]">冲突重命名</div>
            </div>
          </div>

          {/* 核心流程 */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">Prompt 注册流程</h4>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-3 py-1.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded-lg border border-[var(--cyber-blue)]/30">
                MCP 发现
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                注册 Prompt
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--amber)]/20 text-[var(--amber)] rounded-lg border border-[var(--amber)]/30">
                冲突检测
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--purple)]/20 text-[var(--purple)] rounded-lg border border-[var(--purple)]/30">
                可用查询
              </span>
            </div>
          </div>

          {/* 源码入口 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码入口:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/core/src/prompts/prompt-registry.ts
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

export function PromptRegistry() {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  const registryFlowChart = `flowchart TD
    mcp([MCP Server])
    discover[发现 Prompts]
    register[registerPrompt]
    check{名称冲突?}
    rename[重命名:<br/>serverName_promptName]
    store[(Map 存储)]
    query[查询接口]
    output([Prompt 定义])

    mcp --> discover
    discover --> register
    register --> check
    check -->|是| rename
    check -->|否| store
    rename --> store
    store --> query
    query --> output

    style mcp fill:#22d3ee,color:#000
    style register fill:#22c55e,color:#000
    style check fill:#f59e0b,color:#000
    style rename fill:#a855f7,color:#fff
    style store fill:#6366f1,color:#fff
    style query fill:#ec4899,color:#fff`;

  const promptTypeCode = `// packages/core/src/tools/mcp-client.ts

/** MCP 发现的 Prompt 定义 */
export interface DiscoveredMCPPrompt {
  name: string;           // Prompt 名称
  serverName: string;     // 来源 MCP 服务器
  description?: string;   // 描述
  arguments?: Array<{     // 参数定义
    name: string;
    description?: string;
    required?: boolean;
  }>;
  // 执行函数
  getMessages: (args: Record<string, string>) => Promise<PromptMessage[]>;
}

/** Prompt 消息 */
export interface PromptMessage {
  role: 'user' | 'assistant';
  content: TextContent | ImageContent | EmbeddedResource;
}`;

  const registryCode = `// packages/core/src/prompts/prompt-registry.ts

export class PromptRegistry {
  private prompts: Map<string, DiscoveredMCPPrompt> = new Map();

  /**
   * 注册 Prompt 定义
   * 名称冲突时自动重命名为 serverName_promptName
   */
  registerPrompt(prompt: DiscoveredMCPPrompt): void {
    if (this.prompts.has(prompt.name)) {
      const newName = \`\${prompt.serverName}_\${prompt.name}\`;
      console.warn(
        \`Prompt with name "\${prompt.name}" is already registered. \` +
        \`Renaming to "\${newName}".\`
      );
      this.prompts.set(newName, { ...prompt, name: newName });
    } else {
      this.prompts.set(prompt.name, prompt);
    }
  }

  /**
   * 获取所有已注册的 Prompt（按名称排序）
   */
  getAllPrompts(): DiscoveredMCPPrompt[] {
    return Array.from(this.prompts.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * 按名称获取 Prompt
   */
  getPrompt(name: string): DiscoveredMCPPrompt | undefined {
    return this.prompts.get(name);
  }
}`;

  const serverMethodsCode = `/**
 * 获取特定 MCP 服务器的所有 Prompts
 */
getPromptsByServer(serverName: string): DiscoveredMCPPrompt[] {
  const serverPrompts: DiscoveredMCPPrompt[] = [];
  for (const prompt of this.prompts.values()) {
    if (prompt.serverName === serverName) {
      serverPrompts.push(prompt);
    }
  }
  return serverPrompts.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * 移除特定服务器的所有 Prompts
 * 用于服务器断开连接时清理
 */
removePromptsByServer(serverName: string): void {
  for (const [name, prompt] of this.prompts.entries()) {
    if (prompt.serverName === serverName) {
      this.prompts.delete(name);
    }
  }
}

/**
 * 清空所有 Prompts
 */
clear(): void {
  this.prompts.clear();
}`;

  const usageCode = `// 使用示例

// 1. 创建注册表
const registry = new PromptRegistry();

// 2. 从 MCP 服务器发现并注册
const mcpPrompts = await mcpClient.listPrompts();
for (const prompt of mcpPrompts) {
  registry.registerPrompt({
    name: prompt.name,
    serverName: mcpClient.serverName,
    description: prompt.description,
    arguments: prompt.arguments,
    getMessages: async (args) => mcpClient.getPrompt(prompt.name, args),
  });
}

// 3. 查询和使用
const allPrompts = registry.getAllPrompts();
console.log(\`Available prompts: \${allPrompts.map(p => p.name).join(', ')}\`);

const codeReview = registry.getPrompt('code-review');
if (codeReview) {
  const messages = await codeReview.getMessages({ file: 'main.ts' });
  // 使用 messages...
}

// 4. 服务器断开时清理
registry.removePromptsByServer('my-mcp-server');`;

  return (
    <div className="space-y-8">
      <QuickSummary
        isExpanded={isSummaryExpanded}
        onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
      />

      {/* 页面标题 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Prompt 注册表</h2>
        <p className="text-gray-300 mb-4">
          PromptRegistry 是 MCP Prompt 模板的中央注册表，管理从各个 MCP 服务器发现的 Prompt 定义。
          它提供统一的查询接口，并自动处理名称冲突。
        </p>
      </section>

      {/* 1. 数据结构 */}
      <Layer title="数据结构" icon="📊">
        <div className="space-y-4">
          <CodeBlock code={promptTypeCode} language="typescript" title="DiscoveredMCPPrompt 类型" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HighlightBox title="Prompt 元数据" variant="blue">
              <div className="text-sm space-y-2">
                <ul className="text-gray-400 space-y-1">
                  <li>• <code>name</code>: Prompt 唯一标识</li>
                  <li>• <code>serverName</code>: 来源服务器</li>
                  <li>• <code>description</code>: 描述说明</li>
                  <li>• <code>arguments</code>: 参数定义列表</li>
                </ul>
              </div>
            </HighlightBox>

            <HighlightBox title="执行函数" variant="green">
              <div className="text-sm space-y-2">
                <p className="text-gray-300">getMessages 函数：</p>
                <ul className="text-gray-400 space-y-1">
                  <li>• 接收参数对象</li>
                  <li>• 调用 MCP 服务器</li>
                  <li>• 返回 PromptMessage 数组</li>
                </ul>
              </div>
            </HighlightBox>
          </div>
        </div>
      </Layer>

      {/* 2. 注册流程 */}
      <Layer title="注册流程" icon="🔄">
        <div className="space-y-4">
          <MermaidDiagram chart={registryFlowChart} title="Prompt 注册流程" />
          <CodeBlock code={registryCode} language="typescript" title="PromptRegistry 核心实现" />
        </div>
      </Layer>

      {/* 3. 冲突处理 */}
      <Layer title="名称冲突处理" icon="⚠️">
        <div className="space-y-4">
          <MermaidDiagram chart={`sequenceDiagram
    participant S1 as MCP Server A
    participant S2 as MCP Server B
    participant R as PromptRegistry

    S1->>R: registerPrompt({name: "code-review", serverName: "A"})
    R->>R: prompts.set("code-review", ...)
    Note over R: 首次注册，直接存储

    S2->>R: registerPrompt({name: "code-review", serverName: "B"})
    R->>R: 检测到名称冲突
    R->>R: 重命名为 "B_code-review"
    R->>R: prompts.set("B_code-review", ...)
    Note over R: 冲突时自动重命名`} title="冲突处理时序" />

          <HighlightBox title="重命名策略" variant="yellow">
            <div className="text-sm space-y-2 text-gray-300">
              <p><strong>冲突检测：</strong>使用 <code className="bg-black/30 px-1 rounded">Map.has()</code> 检查名称是否已存在</p>
              <p><strong>重命名格式：</strong><code className="bg-black/30 px-1 rounded">{`\${serverName}_\${promptName}`}</code></p>
              <p><strong>警告日志：</strong>输出 console.warn 提醒用户</p>
              <p className="mt-2 text-amber-400">
                注意：先注册的 Prompt 保留原名，后注册的被重命名
              </p>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 4. 服务器管理 */}
      <Layer title="服务器级管理" icon="🖥️">
        <div className="space-y-4">
          <CodeBlock code={serverMethodsCode} language="typescript" title="服务器级方法" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HighlightBox title="getPromptsByServer" variant="blue">
              <div className="text-sm space-y-2">
                <p className="text-gray-300">按服务器查询</p>
                <ul className="text-gray-400 space-y-1">
                  <li>• 遍历所有 Prompt</li>
                  <li>• 过滤 serverName</li>
                  <li>• 按名称排序返回</li>
                </ul>
              </div>
            </HighlightBox>

            <HighlightBox title="removePromptsByServer" variant="red">
              <div className="text-sm space-y-2">
                <p className="text-gray-300">服务器断开清理</p>
                <ul className="text-gray-400 space-y-1">
                  <li>• 遍历所有 Prompt</li>
                  <li>• 匹配 serverName</li>
                  <li>• 从 Map 删除</li>
                </ul>
              </div>
            </HighlightBox>

            <HighlightBox title="clear" variant="purple">
              <div className="text-sm space-y-2">
                <p className="text-gray-300">清空所有</p>
                <ul className="text-gray-400 space-y-1">
                  <li>• 调用 Map.clear()</li>
                  <li>• 用于重置状态</li>
                  <li>• 重新发现时使用</li>
                </ul>
              </div>
            </HighlightBox>
          </div>
        </div>
      </Layer>

      {/* 5. 使用示例 */}
      <Layer title="使用示例" icon="💡">
        <div className="space-y-4">
          <CodeBlock code={usageCode} language="typescript" title="完整使用流程" />
        </div>
      </Layer>

      {/* 6. 与 MCP 集成 */}
      <Layer title="与 MCP 系统集成" icon="🔗">
        <div className="space-y-4">
          <MermaidDiagram chart={`flowchart LR
    subgraph MCP["MCP 服务器"]
        S1[Server A]
        S2[Server B]
        S3[Server C]
    end

    subgraph Discovery["发现层"]
        MCPClient[MCP Client]
        Loader[McpPromptLoader]
    end

    subgraph Registry["注册表"]
        PR[(PromptRegistry)]
    end

    subgraph Usage["使用层"]
        Slash[/斜杠命令/]
        UI[UI 列表]
    end

    S1 --> MCPClient
    S2 --> MCPClient
    S3 --> MCPClient
    MCPClient --> Loader
    Loader --> PR
    PR --> Slash
    PR --> UI

    style PR fill:#22c55e,color:#000`} title="MCP Prompt 集成架构" />

          <HighlightBox title="集成点" variant="blue">
            <div className="text-sm space-y-2 text-gray-300">
              <ul className="space-y-2">
                <li>
                  <strong>McpPromptLoader：</strong>
                  <span className="text-gray-400">从 MCP 服务器发现 Prompt 并注册</span>
                </li>
                <li>
                  <strong>斜杠命令：</strong>
                  <span className="text-gray-400">/prompt 命令可以列出和执行已注册的 Prompt</span>
                </li>
                <li>
                  <strong>UI 列表：</strong>
                  <span className="text-gray-400">在命令面板中显示可用 Prompt</span>
                </li>
              </ul>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 7. 设计决策 */}
      <Layer title="设计决策" icon="💭">
        <div className="space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">为什么使用 Map 而非 Array？</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p><strong>决策：</strong>使用 Map&lt;string, Prompt&gt; 存储。</p>
              <p><strong>原因：</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>O(1) 查找</strong>：按名称快速获取</li>
                <li><strong>唯一性保证</strong>：名称作为 key 自动唯一</li>
                <li><strong>高效删除</strong>：Map.delete() 比 Array.filter() 快</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">为什么自动重命名而非报错？</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p><strong>决策：</strong>名称冲突时自动重命名，而非抛出错误。</p>
              <p><strong>原因：</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>用户无感</strong>：不中断启动流程</li>
                <li><strong>两者可用</strong>：两个 Prompt 都能使用</li>
                <li><strong>可追溯</strong>：重命名后仍包含服务器信息</li>
              </ul>
            </div>
          </div>
        </div>
      </Layer>

      {/* 8. 关键文件 */}
      <Layer title="关键文件与入口" icon="📁">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/prompts/prompt-registry.ts
            </code>
            <span className="text-gray-400">PromptRegistry 实现</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/prompts/mcp-prompts.ts
            </code>
            <span className="text-gray-400">MCP Prompt 工具函数</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/cli/src/services/McpPromptLoader.ts
            </code>
            <span className="text-gray-400">MCP Prompt 加载器</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/tools/mcp-client.ts
            </code>
            <span className="text-gray-400">DiscoveredMCPPrompt 类型</span>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
