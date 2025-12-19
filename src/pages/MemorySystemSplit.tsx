import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';

export function MemorySystemSplit() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">记忆系统：命令 vs 工具</h2>

      {/* 核心区分 */}
      <Layer title="两套机制的本质区别" icon="🎯">
        <HighlightBox title="⚠️ 常见混淆" icon="❌" variant="red">
          <p className="text-sm">
            很多人混淆 <code>/memory</code> 命令和 <code>save_memory</code> 工具。
            它们<strong>完全不同</strong>：一个是用户管理指令上下文，另一个是 AI 保存事实。
          </p>
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">📋 /memory 命令</h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• <strong>调用者</strong>：用户手动输入</li>
              <li>• <strong>功能</strong>：管理 INNIES.md 层级上下文</li>
              <li>• <strong>子命令</strong>：add, show, refresh</li>
              <li>• <strong>作用</strong>：修改注入到 System Prompt 的指令</li>
            </ul>
          </div>

          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">🔧 save_memory 工具</h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• <strong>调用者</strong>：AI 自动调用</li>
              <li>• <strong>功能</strong>：保存单条事实到记忆文件</li>
              <li>• <strong>参数</strong>：fact, scope (global/project)</li>
              <li>• <strong>作用</strong>：AI 记住用户偏好或重要信息</li>
            </ul>
          </div>
        </div>
      </Layer>

      {/* /memory 命令详解 */}
      <Layer title="/memory 命令：用户管理指令上下文" icon="📋">
        <CodeBlock
          title="命令语法"
          code={`# 添加文本到记忆
/memory add <text to remember>

# 显示当前加载的所有上下文
/memory show

# 刷新层级记忆（重新读取所有 INNIES.md）
/memory refresh`}
        />

        <HighlightBox title="层级发现机制" icon="🔍" variant="blue">
          <p className="text-sm mb-2">
            <code>/memory</code> 命令管理的是<strong>层级化指令上下文</strong>，
            由 <code>memoryDiscovery.ts</code> 自动发现并加载。
          </p>
        </HighlightBox>

        <div className="bg-black/30 rounded-lg p-4 mt-4">
          <h5 className="text-cyan-400 font-bold mb-3">文件发现顺序</h5>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500/20 px-2 py-1 rounded text-cyan-400">1</span>
              <code className="text-gray-300">~/.innies/INNIES.md</code>
              <span className="text-gray-500">全局记忆</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500/20 px-2 py-1 rounded text-cyan-400">2</span>
              <code className="text-gray-300">/path/to/project-root/INNIES.md</code>
              <span className="text-gray-500">项目根目录（向上搜索到 .git）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500/20 px-2 py-1 rounded text-cyan-400">3</span>
              <code className="text-gray-300">./INNIES.md</code>
              <span className="text-gray-500">当前工作目录</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500/20 px-2 py-1 rounded text-cyan-400">4</span>
              <code className="text-gray-300">./子目录/INNIES.md</code>
              <span className="text-gray-500">BFS 向下搜索（最多 maxDirs=200）</span>
            </div>
          </div>
        </div>

        <CodeBlock
          title="memoryDiscovery.ts - 核心逻辑"
          code={`// packages/core/src/utils/memoryDiscovery.ts

export async function loadServerHierarchicalMemory(
    currentWorkingDirectory: string,
    includeDirectoriesToReadGemini: readonly string[],
    debugMode: boolean,
    fileService: FileDiscoveryService,
    extensionContextFilePaths: string[] = [],
    folderTrust: boolean,
    importFormat: 'flat' | 'tree' = 'tree',
    fileFilteringOptions?: FileFilteringOptions,
    maxDirs: number = 200,
): Promise<LoadServerHierarchicalMemoryResponse> {
    // 1. 发现所有 INNIES.md 文件路径
    const filePaths = await getGeminiMdFilePathsInternal(...);

    // 2. 读取文件内容并处理 @import
    const contentsWithPaths = await readGeminiMdFiles(filePaths, debugMode, importFormat);

    // 3. 拼接所有内容
    const combinedInstructions = concatenateInstructions(contentsWithPaths, cwd);

    return { memoryContent: combinedInstructions, fileCount: contentsWithPaths.length };
}

// 拼接格式
function concatenateInstructions(contents: GeminiFileContent[], cwd: string): string {
    return contents
        .filter(item => item.content)
        .map(item => {
            const displayPath = path.relative(cwd, item.filePath);
            return \`--- Context from: \${displayPath} ---
\${item.content.trim()}
--- End of Context from: \${displayPath} ---\`;
        })
        .join('\\n\\n');
}`}
        />

        <HighlightBox title="信任限制" icon="🔒" variant="orange">
          <p className="text-sm">
            当 <code>folderTrust: false</code> 时，只加载全局记忆，
            <strong>不会搜索项目目录</strong>。这是安全机制，防止恶意项目注入指令。
          </p>
        </HighlightBox>
      </Layer>

      {/* save_memory 工具详解 */}
      <Layer title="save_memory 工具：AI 主动保存事实" icon="🔧">
        <HighlightBox title="工具定义" icon="📄" variant="blue">
          <p className="text-sm">
            <code>save_memory</code> 是一个 AI 可调用的工具，当用户说"记住这个"或陈述重要事实时触发。
            它不会直接修改 System Prompt，而是写入文件的特定区段。
          </p>
        </HighlightBox>

        <JsonBlock
          code={`// 工具 Schema
{
    "name": "save_memory",
    "description": "Saves a specific piece of information or fact to your long-term memory...",
    "parametersJsonSchema": {
        "type": "object",
        "properties": {
            "fact": {
                "type": "string",
                "description": "The specific fact or piece of information to remember."
            },
            "scope": {
                "type": "string",
                "description": "Where to save: 'global' or 'project'",
                "enum": ["global", "project"]
            }
        },
        "required": ["fact"]
    }
}`}
        />

        <CodeBlock
          title="保存逻辑 - memoryTool.ts"
          code={`// packages/core/src/tools/memoryTool.ts

export const MEMORY_SECTION_HEADER = '## Innies Added Memories';

function computeNewContent(currentContent: string, fact: string): string {
    const newMemoryItem = \`- \${fact.trim()}\`;

    const headerIndex = currentContent.indexOf(MEMORY_SECTION_HEADER);

    if (headerIndex === -1) {
        // 如果没有 Memories 区段，在文件末尾添加
        return currentContent + \`\\n\\n\${MEMORY_SECTION_HEADER}\\n\${newMemoryItem}\\n\`;
    } else {
        // 在现有区段中追加
        const beforeHeader = currentContent.substring(0, headerIndex + MEMORY_SECTION_HEADER.length);
        const afterHeader = currentContent.substring(headerIndex + MEMORY_SECTION_HEADER.length);

        // 找到区段结束位置（下一个 ## 或文件末尾）
        let endOfSection = afterHeader.indexOf('\\n## ');
        if (endOfSection === -1) endOfSection = afterHeader.length;

        const sectionContent = afterHeader.substring(0, endOfSection).trimEnd();
        const remaining = afterHeader.substring(endOfSection);

        return beforeHeader + sectionContent + \`\\n\${newMemoryItem}\` + remaining;
    }
}`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h5 className="text-green-400 font-bold mb-2">✅ 适合使用 save_memory</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• "记住我喜欢用 TypeScript"</li>
              <li>• "我的猫叫 Whiskers"</li>
              <li>• "这个项目使用 pnpm"</li>
            </ul>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h5 className="text-red-400 font-bold mb-2">❌ 不适合使用</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 只对当前会话有用的信息</li>
              <li>• 长篇复杂的文本</li>
              <li>• 不确定是否值得长期记住的信息</li>
            </ul>
          </div>
        </div>

        <CodeBlock
          title="确认对话框流程"
          code={`// MemoryToolInvocation.shouldConfirmExecute()

// 1. 如果未指定 scope，显示选择对话框
if (!this.params.scope) {
    // 显示 GLOBAL vs PROJECT 选择
    // 用户可以在外部编辑器中修改 "scope: global" 为 "scope: project"
}

// 2. 显示差异预览
const fileDiff = Diff.createPatch(
    fileName,
    currentContent,
    newContent,
    'Current',
    'Proposed',
    DEFAULT_DIFF_OPTIONS
);

// 3. 用户确认后执行
// 如果选择 "Proceed Always"，后续同文件操作自动批准`}
        />
      </Layer>

      {/* 两者的交互关系 */}
      <Layer title="两套系统的交互关系" icon="🔄">
        <div className="bg-black/30 rounded-xl p-6">
          <h4 className="text-cyan-400 font-bold mb-4 text-center">数据流向</h4>
          <div className="flex flex-col gap-4">
            {/* save_memory 写入 */}
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 border border-purple-500 rounded-lg px-3 py-2 text-sm text-center">
                <div className="text-purple-400 font-bold">AI 调用</div>
                <div className="text-xs text-gray-400">save_memory</div>
              </div>
              <div className="text-cyan-400">→</div>
              <div className="bg-gray-700/50 border border-gray-500 rounded-lg px-3 py-2 text-sm text-center flex-1">
                <code className="text-yellow-400">INNIES.md</code>
                <div className="text-xs text-gray-400">## Innies Added Memories 区段</div>
              </div>
            </div>

            {/* /memory 读取 */}
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500/20 border border-cyan-500 rounded-lg px-3 py-2 text-sm text-center">
                <div className="text-cyan-400 font-bold">用户调用</div>
                <div className="text-xs text-gray-400">/memory refresh</div>
              </div>
              <div className="text-cyan-400">→</div>
              <div className="bg-gray-700/50 border border-gray-500 rounded-lg px-3 py-2 text-sm text-center flex-1">
                <code className="text-yellow-400">INNIES.md</code>
                <div className="text-xs text-gray-400">整个文件（包括 Added Memories）</div>
              </div>
              <div className="text-cyan-400">→</div>
              <div className="bg-green-500/20 border border-green-500 rounded-lg px-3 py-2 text-sm text-center">
                <div className="text-green-400 font-bold">System Prompt</div>
                <div className="text-xs text-gray-400">注入到上下文</div>
              </div>
            </div>
          </div>
        </div>

        <HighlightBox title="关键理解" icon="💡" variant="green">
          <p className="text-sm">
            <code>save_memory</code> 写入的内容最终会通过 <code>/memory</code> 系统
            被读取并注入到 System Prompt。两者是<strong>写入 vs 读取</strong>的关系，
            而不是独立的两套记忆系统。
          </p>
        </HighlightBox>
      </Layer>

      {/* INNIES.md 文件结构 */}
      <Layer title="INNIES.md 文件结构" icon="📄">
        <CodeBlock
          title="典型文件结构"
          code={`# Project Context

这是一个 React + TypeScript 项目...

## 技术栈
- React 18
- TypeScript 5
- Tailwind CSS

## 架构决策
- 使用 Context 管理全局状态
- 组件按功能模块组织

## 编码规范
- 使用函数式组件
- 优先使用 hooks

## Innies Added Memories
- 用户偏好使用 pnpm 而不是 npm
- 测试框架是 Vitest
- 部署平台是 Vercel`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h5 className="text-cyan-400 font-bold mb-2">手动编写区域</h5>
            <p className="text-sm text-gray-300">
              # Project Context, ## 技术栈, ## 架构决策 等区段是用户手动编写的项目说明
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h5 className="text-purple-400 font-bold mb-2">AI 自动添加区域</h5>
            <p className="text-sm text-gray-300">
              <code>## Innies Added Memories</code> 区段由 <code>save_memory</code> 工具自动管理
            </p>
          </div>
        </div>
      </Layer>

      {/* 文件名配置 */}
      <Layer title="文件名配置" icon="⚙️">
        <CodeBlock
          title="自定义记忆文件名"
          code={`// settings.json
{
    "context": {
        "contextFileName": "INNIES.md"  // 默认值
    }
}

// 可以配置为数组，同时读取多个文件
{
    "context": {
        "contextFileName": ["INNIES.md", "CLAUDE.md", "CURSOR.md"]
    }
}

// 代码中的处理
export function getAllGeminiMdFilenames(): string[] {
    if (Array.isArray(currentGeminiMdFilename)) {
        return currentGeminiMdFilename;
    }
    return [currentGeminiMdFilename];
}`}
        />
      </Layer>

      {/* 源码位置 */}
      <Layer title="源码位置" icon="📍">
        <div className="text-sm space-y-2">
          <SourceLink path="packages/core/src/tools/memoryTool.ts" desc="save_memory 工具实现" />
          <SourceLink path="packages/core/src/utils/memoryDiscovery.ts" desc="层级记忆发现" />
          <SourceLink path="packages/core/src/utils/memoryImportProcessor.ts" desc="@import 处理" />
          <SourceLink path="packages/cli/src/commands/memoryCommand.ts" desc="/memory 命令处理 (if exists)" />
          <SourceLink path="docs/cli/commands.md#memory" desc="/memory 命令文档" />
        </div>
      </Layer>
    </div>
  );
}

function SourceLink({ path, desc }: { path: string; desc: string }) {
  return (
    <div className="flex items-center gap-2">
      <code className="bg-black/30 px-2 py-1 rounded">{path}</code>
      <span className="text-gray-400">{desc}</span>
    </div>
  );
}
