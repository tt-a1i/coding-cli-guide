import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'custom-cmd', label: '自定义命令', description: '@ 语法在自定义命令中的使用' },
  { id: 'slash-cmd', label: '斜杠命令', description: '命令系统的基础入口' },
  { id: 'tool-ref', label: '工具参考', description: 'read_many_files 工具详解' },
  { id: 'at-file-processor-anim', label: '@File 处理器', description: '@ 命令处理动画演示' },
  { id: 'file-discovery', label: '文件发现系统', description: '文件忽略规则的底层实现' },
  { id: 'trusted-folders', label: '信任机制', description: '工作区安全与文件访问' },
];

export function AtCommands() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">@ 命令处理 (At Commands)</h2>

      {/* 概述 */}
      <Layer title="什么是 @ 命令？" icon="@">
        <HighlightBox title="@ 文件引用" icon="📁" variant="blue">
          <p className="mb-2">
            <code>@path</code> 语法允许用户在提示中引用文件或目录，
            CLI 会自动读取这些文件的内容并附加到发送给 AI 的消息中。
          </p>
          <p>
            例如：<code>@src/utils.ts 请帮我优化这个文件</code>
          </p>
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">📄</div>
            <h4 className="text-cyan-400 font-bold">单文件</h4>
            <p className="text-sm text-gray-400">@path/to/file.ts</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">📂</div>
            <h4 className="text-cyan-400 font-bold">目录</h4>
            <p className="text-sm text-gray-400">@src/ (自动展开为 @src/**)</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">🔍</div>
            <h4 className="text-cyan-400 font-bold">模糊搜索</h4>
            <p className="text-sm text-gray-400">@utils (搜索 **/\*utils\*)</p>
          </div>
        </div>
      </Layer>

      {/* 解析流程 */}
      <Layer title="@ 命令解析" icon="🔍">
        <CodeBlock
          title="parseAllAtCommands()"
          code={`// packages/cli/src/ui/hooks/atCommandProcessor.ts

function parseAllAtCommands(query: string): AtCommandPart[] {
    const parts: AtCommandPart[] = [];
    let currentIndex = 0;

    while (currentIndex < query.length) {
        // 查找下一个未转义的 @
        let atIndex = -1;
        let nextSearchIndex = currentIndex;

        while (nextSearchIndex < query.length) {
            if (query[nextSearchIndex] === '@' &&
                (nextSearchIndex === 0 || query[nextSearchIndex - 1] !== '\\\\')) {
                atIndex = nextSearchIndex;
                break;
            }
            nextSearchIndex++;
        }

        if (atIndex === -1) {
            // 没有更多 @，添加剩余文本
            if (currentIndex < query.length) {
                parts.push({ type: 'text', content: query.substring(currentIndex) });
            }
            break;
        }

        // 添加 @ 前的文本
        if (atIndex > currentIndex) {
            parts.push({ type: 'text', content: query.substring(currentIndex, atIndex) });
        }

        // 解析 @path
        let pathEndIndex = atIndex + 1;
        let inEscape = false;

        while (pathEndIndex < query.length) {
            const char = query[pathEndIndex];
            if (inEscape) {
                inEscape = false;
            } else if (char === '\\\\') {
                inEscape = true;
            } else if (/[,\\s;!?()\\[\\]{}]/.test(char)) {
                // 路径在空白或标点处结束
                break;
            }
            pathEndIndex++;
        }

        const rawAtPath = query.substring(atIndex, pathEndIndex);
        parts.push({ type: 'atPath', content: unescapePath(rawAtPath) });
        currentIndex = pathEndIndex;
    }

    return parts;
}

// 返回结构示例
// 输入: "@src/utils.ts 请优化 @config.json"
// 输出: [
//   { type: 'atPath', content: '@src/utils.ts' },
//   { type: 'text', content: ' 请优化 ' },
//   { type: 'atPath', content: '@config.json' }
// ]`}
        />
      </Layer>

      {/* 处理流程 */}
      <Layer title="@ 命令处理流程" icon="⚡">
        <div className="bg-black/30 rounded-xl p-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-blue-400/20 border border-blue-400 rounded-lg px-4 py-2 text-center w-full max-w-md">
              <strong>1. 解析 @ 命令</strong>
              <div className="text-xs text-gray-400">parseAllAtCommands()</div>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-purple-400/20 border border-purple-400 rounded-lg px-4 py-2 text-center w-full max-w-md">
              <strong>2. 检查忽略规则</strong>
              <div className="text-xs text-gray-400">.gitignore / .geminiignore</div>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-green-400/20 border border-green-400 rounded-lg px-4 py-2 text-center w-full max-w-md">
              <strong>3. 解析路径</strong>
              <div className="text-xs text-gray-400">文件 / 目录 / glob 搜索</div>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-orange-400/20 border border-orange-400 rounded-lg px-4 py-2 text-center w-full max-w-md">
              <strong>4. 读取文件</strong>
              <div className="text-xs text-gray-400">read_many_files 工具</div>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-cyan-400/20 border border-cyan-400 rounded-lg px-4 py-2 text-center w-full max-w-md">
              <strong>5. 构建消息</strong>
              <div className="text-xs text-gray-400">原始文本 + 文件内容</div>
            </div>
          </div>
        </div>

        <CodeBlock
          title="handleAtCommand()"
          code={`// packages/cli/src/ui/hooks/atCommandProcessor.ts

async function handleAtCommand({
    query,
    config,
    addItem,
    signal
}: HandleAtCommandParams): Promise<HandleAtCommandResult> {
    // 1. 解析所有 @ 命令
    const commandParts = parseAllAtCommands(query);
    const atPathParts = commandParts.filter(p => p.type === 'atPath');

    if (atPathParts.length === 0) {
        // 没有 @ 命令，直接返回原始查询
        return { processedQuery: [{ text: query }], shouldProceed: true };
    }

    // 2. 检查忽略规则
    const fileDiscovery = config.getFileService();
    const respectFileIgnore = config.getFileFilteringOptions();

    for (const atPathPart of atPathParts) {
        const pathName = atPathPart.content.substring(1);

        // 检查 .gitignore
        const gitIgnored = respectFileIgnore.respectGitIgnore &&
            fileDiscovery.shouldIgnoreFile(pathName, { respectGitIgnore: true });

        // 检查 .geminiignore
        const geminiIgnored = respectFileIgnore.respectGeminiIgnore &&
            fileDiscovery.shouldIgnoreFile(pathName, { respectGeminiIgnore: true });

        if (gitIgnored || geminiIgnored) {
            continue;  // 跳过被忽略的文件
        }

        // 3. 解析路径
        const absolutePath = path.resolve(dir, pathName);
        const stats = await fs.stat(absolutePath);

        if (stats.isDirectory()) {
            // 目录展开为 glob 模式
            currentPathSpec = pathName + '/**';
        }

        pathSpecsToRead.push(currentPathSpec);
    }

    // 4. 读取文件
    const readManyFilesTool = toolRegistry.getTool('read_many_files');
    const result = await readManyFilesTool.buildAndExecute({
        paths: pathSpecsToRead,
        file_filtering_options: { ... }
    }, signal);

    // 5. 构建处理后的消息
    const processedQueryParts = [
        { text: initialQueryText },
        { text: '\\n--- Content from referenced files ---' },
        ...fileContentParts
    ];

    return { processedQuery: processedQueryParts, shouldProceed: true };
}`}
        />
      </Layer>

      {/* 路径解析策略 */}
      <Layer title="路径解析策略" icon="🗂️">
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-bold mb-2">直接文件路径</h4>
            <p className="text-sm text-gray-300 mb-2">
              <code>@src/utils.ts</code> → 直接读取该文件
            </p>
            <code className="text-xs text-gray-400 block">
              fs.stat() 检查文件存在 → 添加到读取列表
            </code>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">目录路径</h4>
            <p className="text-sm text-gray-300 mb-2">
              <code>@src/</code> → 展开为 <code>src/**</code> glob 模式
            </p>
            <code className="text-xs text-gray-400 block">
              stats.isDirectory() → 自动添加 /** 后缀
            </code>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">模糊搜索（ENOENT）</h4>
            <p className="text-sm text-gray-300 mb-2">
              <code>@utils</code> → 搜索 <code>**/*utils*</code>
            </p>
            <code className="text-xs text-gray-400 block">
              当文件不存在时，使用 glob 工具搜索匹配的文件
            </code>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">转义空格</h4>
            <p className="text-sm text-gray-300 mb-2">
              <code>@path\ with\ spaces/file.ts</code> → 使用反斜杠转义空格
            </p>
            <code className="text-xs text-gray-400 block">
              unescapePath() 处理转义序列
            </code>
          </div>
        </div>
      </Layer>

      {/* 忽略规则 */}
      <Layer title="文件忽略规则" icon="🚫">
        <HighlightBox title="忽略文件来源" icon="📋" variant="orange">
          <ul className="pl-5 list-disc space-y-1">
            <li><strong>.gitignore</strong> - Git 忽略的文件</li>
            <li><strong>.geminiignore</strong> - CLI 特定忽略规则</li>
          </ul>
        </HighlightBox>

        <CodeBlock
          title="忽略检查逻辑"
          code={`// 检查文件是否应该被忽略
const gitIgnored = respectFileIgnore.respectGitIgnore &&
    fileDiscovery.shouldIgnoreFile(pathName, {
        respectGitIgnore: true,
        respectGeminiIgnore: false
    });

const geminiIgnored = respectFileIgnore.respectGeminiIgnore &&
    fileDiscovery.shouldIgnoreFile(pathName, {
        respectGitIgnore: false,
        respectGeminiIgnore: true
    });

if (gitIgnored || geminiIgnored) {
    const reason = gitIgnored && geminiIgnored ? 'both'
                 : gitIgnored ? 'git'
                 : 'gemini';

    ignoredByReason[reason].push(pathName);
    onDebugMessage(\`Path \${pathName} is \${reasonText} and will be skipped.\`);
    continue;
}

// 向用户报告被忽略的文件
if (totalIgnored > 0) {
    const message = \`Ignored \${totalIgnored} files:\\n\${messages.join('\\n')}\`;
    console.log(message);
}`}
        />
      </Layer>

      {/* 返回结果结构 */}
      <Layer title="处理结果结构" icon="📦">
        <CodeBlock
          title="HandleAtCommandResult"
          code={`interface HandleAtCommandResult {
    processedQuery: PartListUnion | null;  // 处理后的消息部分
    shouldProceed: boolean;                 // 是否继续发送给 AI
}

// 成功时返回
{
    processedQuery: [
        { text: "请帮我优化 @src/utils.ts" },
        { text: "\\n--- Content from referenced files ---" },
        { text: "\\nContent from @src/utils.ts:\\n" },
        { text: "export function helper() { ... }" }
    ],
    shouldProceed: true
}

// 错误时返回
{
    processedQuery: null,
    shouldProceed: false
}

// 无 @ 命令时返回
{
    processedQuery: [{ text: "原始查询文本" }],
    shouldProceed: true
}`}
        />
      </Layer>

      {/* 使用示例 */}
      <Layer title="使用示例" icon="💡">
        <CodeBlock
          code={`# 单文件引用
@src/components/Button.tsx 请添加 loading 状态

# 多文件引用
@src/api/user.ts @src/types/user.ts 请检查类型是否一致

# 目录引用
@src/components/ 请分析这些组件的设计模式

# 模糊搜索
@package.json 显示项目依赖

# 带空格的路径
@my\\ project/file.ts 读取这个文件

# 与其他命令组合
@README.md 根据这个文档生成 API 说明

# 错误处理
@不存在的文件.ts  # 将尝试 glob 搜索，找不到则跳过`}
        />

        <HighlightBox title="注意事项" icon="⚠️" variant="orange">
          <ul className="pl-5 list-disc space-y-1">
            <li>被 .gitignore 或 .geminiignore 忽略的文件不会被读取</li>
            <li>目录会自动展开为 ** glob 模式</li>
            <li>找不到的文件会尝试模糊搜索</li>
            <li>大文件可能会被截断以避免超出 Token 限制</li>
            <li>工作区外的文件不会被读取</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* 集成点 */}
      <Layer title="与其他系统集成" icon="🔗">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">read_many_files 工具</h4>
            <p className="text-sm text-gray-300">
              @ 命令使用 read_many_files 工具读取文件内容，
              支持批量读取和 glob 模式。
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">FileDiscoveryService</h4>
            <p className="text-sm text-gray-300">
              用于检查文件是否应该被忽略，
              统一管理 .gitignore 和 .geminiignore 规则。
            </p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">glob 工具</h4>
            <p className="text-sm text-gray-300">
              当直接路径不存在时，使用 glob 工具进行模糊搜索。
            </p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">WorkspaceContext</h4>
            <p className="text-sm text-gray-300">
              验证路径是否在工作区内，防止读取工作区外的敏感文件。
            </p>
          </div>
        </div>
      </Layer>

      {/* 为什么这样设计 */}
      <Layer title="为什么这样设计？" icon="💡">
        <div className="space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">为什么使用 @ 符号作为文件引用语法？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：选择 @ 符号作为文件引用的前缀标记。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>直觉性</strong>：@ 在很多上下文中表示"引用"（如邮件地址、社交媒体提及）</li>
                <li><strong>低冲突</strong>：@ 在命令行和代码中很少作为路径开头使用</li>
                <li><strong>易输入</strong>：所有键盘布局都能方便输入 @ 符号</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">为什么目录会自动展开为 ** glob 模式？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：<code>@src/</code> 自动转换为 <code>src/**</code> 递归匹配。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>用户意图</strong>：引用目录时，用户通常期望包含所有子文件</li>
                <li><strong>减少输入</strong>：避免用户每次都要手动输入 <code>**</code></li>
                <li><strong>与 gitignore 一致</strong>：遵循现有工具的目录处理惯例</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">为什么找不到文件时尝试 glob 搜索？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：当 <code>@utils</code> 不是有效路径时，自动搜索 <code>**/*utils*</code>。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>模糊查找</strong>：用户可能不记得完整路径，模糊匹配提升体验</li>
                <li><strong>容错设计</strong>：不因为小错误中断工作流，而是尝试智能推断</li>
                <li><strong>明确反馈</strong>：如果找到多个匹配，会列出供用户选择</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">为什么要尊重 .gitignore 和 .geminiignore？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：被忽略的文件不会被 @ 命令读取。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>安全性</strong>：避免读取敏感配置文件（如 .env、密钥文件）</li>
                <li><strong>Token 节省</strong>：排除 node_modules 等大型依赖目录</li>
                <li><strong>意图一致</strong>：用户已通过 ignore 文件表明这些文件不重要</li>
              </ul>
            </div>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
