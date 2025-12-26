import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';

/**
 * File Discovery & Ignore Pattern System
 *
 * 详细介绍 CLI 如何发现文件、处理 ignore 模式
 * Source: packages/core/src/utils/*, packages/core/src/services/fileDiscoveryService.ts
 */

function Introduction({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">
            文件发现系统导读
          </span>
        </div>
        <span
          className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">
              🎯 设计目标
            </h4>
            <p className="text-[var(--text-secondary)] text-sm">
              CLI 需要高效地搜索代码文件，同时尊重用户的 ignore 配置。
              系统实现了 <strong>多层 ignore 支持</strong>（.gitignore + .qwenignore）、
              <strong>BFS 并行遍历</strong>、<strong>智能缓存</strong>，在大型 monorepo 中也能快速响应。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">
              💡 为什么需要这个系统
            </h4>
            <div className="text-[var(--text-secondary)] text-sm space-y-2">
              <p><strong>问题 1：node_modules 太大</strong> - 不过滤的话，搜索一个文件可能要遍历几十万个文件</p>
              <p><strong>问题 2：用户隐私</strong> - .env、私钥等文件不应该被 AI 读取</p>
              <p><strong>问题 3：性能</strong> - 大型项目需要并行搜索 + 缓存策略</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">📊 关键数字</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--terminal-green)]">2</div>
                <div className="text-xs text-[var(--text-muted)]">Ignore 类型</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--cyber-blue)]">15</div>
                <div className="text-xs text-[var(--text-muted)]">并行批次</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--amber)]">O(1)</div>
                <div className="text-xs text-[var(--text-muted)]">查找复杂度</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--purple)]">✓</div>
                <div className="text-xs text-[var(--text-muted)]">结果缓存</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FileDiscovery() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  const discoveryFlowChart = `flowchart TD
    tool["工具调用<br/>Glob/Grep/ReadMany"]
    get_config["获取 FileExclusions<br/>& FileDiscoveryService"]
    apply_defaults["应用默认排除模式<br/>node_modules, .git..."]
    scan["扫描文件"]
    filter_git["检查 .gitignore"]
    filter_qwen["检查 .qwenignore"]
    collect["收集过滤统计"]
    result["返回过滤后的结果"]

    tool --> get_config
    get_config --> apply_defaults
    apply_defaults --> scan
    scan --> filter_git
    filter_git --> filter_qwen
    filter_qwen --> collect
    collect --> result

    style tool fill:#22d3ee,color:#000
    style result fill:#22c55e,color:#000
    style filter_git fill:#f59e0b,color:#000
    style filter_qwen fill:#a855f7,color:#fff`;

  const bfsAlgorithmChart = `flowchart TD
    start["开始 BFS 搜索"]
    init["初始化队列<br/>visited Set"]
    batch["取出批次<br/>15 个目录"]
    parallel["Promise.all<br/>并行读取"]
    process["处理每个条目"]
    check_dir{"是目录?"}
    check_ignore{"被 ignore?"}
    add_queue["加入队列"]
    check_file{"匹配目标?"}
    add_result["加入结果"]
    check_limit{"达到限制?"}
    endNode["返回结果"]

    start --> init
    init --> batch
    batch --> parallel
    parallel --> process
    process --> check_dir
    check_dir -->|Yes| check_ignore
    check_dir -->|No| check_file
    check_ignore -->|No| add_queue
    check_ignore -->|Yes| batch
    add_queue --> batch
    check_file -->|Yes| add_result
    check_file -->|No| batch
    add_result --> check_limit
    check_limit -->|No| batch
    check_limit -->|Yes| endNode

    style start fill:#22d3ee,color:#000
    style endNode fill:#22c55e,color:#000
    style parallel fill:#a855f7,color:#fff
    style check_ignore fill:#f59e0b,color:#000`;

  const ignorePatternCode = `// packages/core/src/utils/ignorePatterns.ts

// 默认排除模式 - 始终生效
const COMMON_IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/bower_components/**',
  '**/.svn/**',
  '**/.hg/**',
];

// 二进制文件 - 无法有意义地读取
const BINARY_FILE_PATTERNS = [
  '*.bin', '*.exe', '*.dll', '*.so', '*.dylib',
  '*.class', '*.jar', '*.war',
  '*.zip', '*.tar', '*.gz', '*.bz2', '*.rar', '*.7z',
  '*.doc', '*.docx', '*.xls', '*.xlsx', '*.ppt', '*.pptx',
];

// 媒体文件 - AI 无法处理（除非是 VLM）
const MEDIA_FILE_PATTERNS = [
  '*.pdf', '*.png', '*.jpg', '*.jpeg',
  '*.gif', '*.webp', '*.bmp', '*.svg',
];

// 常见需要忽略的目录
const COMMON_DIRECTORY_EXCLUDES = [
  '**/.vscode/**',
  '**/.idea/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/__pycache__/**',
];

// FileExclusions 类提供灵活的模式组合
export class FileExclusions {
  // 获取核心忽略模式（最小集合）
  getCoreIgnorePatterns(): string[] {
    return COMMON_IGNORE_PATTERNS;
  }

  // 获取 Glob 工具的完整排除列表
  getGlobExcludes(additionalExcludes?: string[]): string[] {
    return [
      ...COMMON_IGNORE_PATTERNS,
      ...COMMON_DIRECTORY_EXCLUDES,
      ...(additionalExcludes || []),
    ];
  }

  // 动态构建排除模式
  buildExcludePatterns(options: {
    includeBinary?: boolean;
    includeMedia?: boolean;
    additionalPatterns?: string[];
  }): string[] {
    const patterns = [...COMMON_IGNORE_PATTERNS];

    if (!options.includeBinary) {
      patterns.push(...BINARY_FILE_PATTERNS);
    }
    if (!options.includeMedia) {
      patterns.push(...MEDIA_FILE_PATTERNS);
    }
    if (options.additionalPatterns) {
      patterns.push(...options.additionalPatterns);
    }

    return patterns;
  }
}`;

  const gitignoreParserCode = `// packages/core/src/utils/gitIgnoreParser.ts

export class GitIgnoreParser implements GitIgnoreFilter {
  private patterns: Map<string, Ignore> = new Map();
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * 检查文件是否被 .gitignore 忽略
   *
   * 特点：
   * 1. 支持嵌套的 .gitignore 文件
   * 2. 缓存已解析的模式
   * 3. 正确处理锚定模式（/开头）
   */
  isIgnored(filePath: string): boolean {
    const relativePath = path.relative(this.projectRoot, filePath);

    // 遍历每一级目录，检查是否有 .gitignore
    const parts = relativePath.split(path.sep);
    let currentDir = this.projectRoot;

    for (let i = 0; i < parts.length; i++) {
      const gitignorePath = path.join(currentDir, '.gitignore');

      if (this.patterns.has(gitignorePath)) {
        const ignore = this.patterns.get(gitignorePath)!;
        // 计算相对于这个 .gitignore 的路径
        const subPath = parts.slice(i).join('/');
        if (ignore.ignores(subPath)) {
          return true;
        }
      } else if (fs.existsSync(gitignorePath)) {
        // 加载并缓存
        const ignore = this.loadPatternsForFile(gitignorePath, currentDir);
        this.patterns.set(gitignorePath, ignore);
        // 再次检查
        const subPath = parts.slice(i).join('/');
        if (ignore.ignores(subPath)) {
          return true;
        }
      }

      currentDir = path.join(currentDir, parts[i]);
    }

    return false;
  }

  /**
   * 模式转换：处理嵌套 .gitignore 的路径调整
   *
   * 例如：a/b/.gitignore 中的模式
   * - "/c" (锚定) → 只匹配 a/b/c
   * - "c" (未锚定) → 匹配 a/b/**/c
   */
  private loadPatternsForFile(
    gitignorePath: string,
    directory: string
  ): Ignore {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    const ignore = createIgnore();

    const relativeDirFromRoot = path.relative(
      this.projectRoot,
      directory
    );

    for (const line of content.split('\\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // 转换模式以适应嵌套位置
      const adjustedPattern = this.adjustPattern(
        trimmed,
        relativeDirFromRoot
      );
      ignore.add(adjustedPattern);
    }

    return ignore;
  }
}`;

  const fileDiscoveryServiceCode = `// packages/core/src/services/fileDiscoveryService.ts

export class FileDiscoveryService {
  private gitIgnoreFilter: GitIgnoreFilter | null = null;
  private qwenIgnoreFilter: QwenIgnoreFilter | null = null;
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * 过滤文件列表，返回过滤后的结果和统计
   */
  filterFilesWithReport(
    filePaths: string[],
    options: FilterFilesOptions = {}
  ): FilterReport {
    const {
      respectGitIgnore = true,
      respectQwenIgnore = true,
    } = options;

    let gitIgnoredCount = 0;
    let qwenIgnoredCount = 0;

    const filteredPaths = filePaths.filter((filePath) => {
      // 检查 .gitignore
      if (respectGitIgnore && this.shouldGitIgnoreFile(filePath)) {
        gitIgnoredCount++;
        return false;
      }

      // 检查 .qwenignore
      if (respectQwenIgnore && this.shouldQwenIgnoreFile(filePath)) {
        qwenIgnoredCount++;
        return false;
      }

      return true;
    });

    return {
      filteredPaths,
      gitIgnoredCount,
      qwenIgnoredCount,
    };
  }

  /**
   * 惰性加载 GitIgnoreParser
   */
  private shouldGitIgnoreFile(filePath: string): boolean {
    if (!this.gitIgnoreFilter) {
      this.gitIgnoreFilter = new GitIgnoreParser(this.projectRoot);
    }
    return this.gitIgnoreFilter.isIgnored(filePath);
  }

  /**
   * 惰性加载 QwenIgnoreParser
   *
   * 注意：.qwenignore 只在项目根目录查找，不支持嵌套
   */
  private shouldQwenIgnoreFile(filePath: string): boolean {
    if (!this.qwenIgnoreFilter) {
      this.qwenIgnoreFilter = new QwenIgnoreParser(this.projectRoot);
    }
    return this.qwenIgnoreFilter.isIgnored(filePath);
  }
}

interface FilterReport {
  filteredPaths: string[];
  gitIgnoredCount: number;
  qwenIgnoredCount: number;
}`;

  const bfsSearchCode = `// packages/core/src/utils/bfsFileSearch.ts

/**
 * BFS 文件搜索 - 高效的广度优先文件查找
 *
 * 设计特点：
 * 1. 队列指针优化：使用 queueHead 而非 splice，O(1) 出队
 * 2. 并行批处理：每次处理 15 个目录，充分利用异步 I/O
 * 3. 提前终止：找到目标后可立即返回
 * 4. 集成 ignore 过滤：在目录级别就过滤，减少无效遍历
 */
export async function bfsFileSearch(
  rootDir: string,
  options: BfsFileSearchOptions
): Promise<string[]> {
  const {
    fileName,
    ignoreDirs = [],
    maxDirs = 1000,
    fileService,
  } = options;

  const BATCH_SIZE = 15; // 并行批次大小
  const queue: string[] = [rootDir];
  const visited = new Set<string>();
  const foundFiles: string[] = [];
  const ignoreDirsSet = new Set(ignoreDirs);

  let queueHead = 0; // 队列头指针，避免 splice
  let scannedDirCount = 0;

  while (queueHead < queue.length && scannedDirCount < maxDirs) {
    // 收集一个批次的目录
    const batch: string[] = [];
    while (
      batch.length < BATCH_SIZE &&
      queueHead < queue.length
    ) {
      const dir = queue[queueHead++];
      if (!visited.has(dir)) {
        visited.add(dir);
        batch.push(dir);
        scannedDirCount++;
      }
    }

    if (batch.length === 0) break;

    // 并行读取所有目录
    const results = await Promise.all(
      batch.map(async (dir) => {
        try {
          const entries = await fs.readdir(dir, {
            withFileTypes: true,
          });
          return { dir, entries, error: null };
        } catch (error) {
          // 权限错误等，继续处理其他目录
          return { dir, entries: [], error };
        }
      })
    );

    // 处理所有条目
    for (const { dir, entries } of results) {
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // 检查是否应该忽略这个目录
          if (ignoreDirsSet.has(entry.name)) continue;
          if (fileService?.shouldIgnoreFile(fullPath)) continue;

          queue.push(fullPath);
        } else if (entry.name === fileName) {
          foundFiles.push(fullPath);
        }
      }
    }
  }

  return foundFiles;
}`;

  const qwenIgnoreCode = `// .qwenignore 文件示例

# 敏感文件 - 绝不发送给 AI
.env
.env.*
*.pem
*.key
credentials.json
secrets.yaml

# 大型生成文件
dist/
build/
*.bundle.js
*.min.js

# 依赖锁文件（通常无需分析）
package-lock.json
yarn.lock
pnpm-lock.yaml

# 测试快照（体积大且无意义）
__snapshots__/
*.snap

# 日志文件
*.log
logs/

# 项目特定排除
.claude/
.cursor/`;

  return (
    <div className="space-y-8 animate-fadeIn">
      <Introduction
        isExpanded={isIntroExpanded}
        onToggle={() => setIsIntroExpanded(!isIntroExpanded)}
      />

      {/* 概述 */}
      <section>
        <h2 className="text-2xl font-bold text-[var(--terminal-green)] mb-4">
          文件发现与 Ignore 模式
        </h2>
        <p className="text-[var(--text-secondary)] mb-4">
          文件发现系统是 Glob、Grep、ReadManyFiles 等工具的基础。它需要在毫秒级响应内
          搜索可能包含数万文件的代码库，同时尊重用户的 ignore 配置。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="两层 Ignore 机制" variant="blue">
            <ul className="text-sm space-y-2">
              <li>
                <strong className="text-[var(--terminal-green)]">.gitignore</strong>
                <span className="text-[var(--text-muted)]"> - 支持嵌套、多级目录</span>
              </li>
              <li>
                <strong className="text-[var(--amber)]">.qwenignore</strong>
                <span className="text-[var(--text-muted)]"> - 项目根目录、CLI 专用</span>
              </li>
              <li className="text-xs text-[var(--text-muted)]">
                优先级：.qwenignore &gt; .gitignore &gt; 内置默认
              </li>
            </ul>
          </HighlightBox>

          <HighlightBox title="搜索策略" variant="green">
            <ul className="text-sm space-y-2">
              <li>
                <strong>BFS 遍历</strong>
                <span className="text-[var(--text-muted)]"> - 广度优先，批量并行</span>
              </li>
              <li>
                <strong>Glob 匹配</strong>
                <span className="text-[var(--text-muted)]"> - 模式匹配，后过滤</span>
              </li>
              <li>
                <strong>fdir 爬取</strong>
                <span className="text-[var(--text-muted)]"> - 全量索引，带缓存</span>
              </li>
            </ul>
          </HighlightBox>
        </div>
      </section>

      {/* 发现流程 */}
      <section>
        <h3 className="text-xl font-semibold text-[var(--terminal-green)] mb-4">
          文件发现流程
        </h3>
        <MermaidDiagram chart={discoveryFlowChart} title="文件发现与过滤流程" />
      </section>

      {/* 默认排除模式 */}
      <section>
        <h3 className="text-xl font-semibold text-[var(--terminal-green)] mb-4">
          默认排除模式
        </h3>
        <CodeBlock code={ignorePatternCode} language="typescript" title="FileExclusions 类" />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--terminal-green)]/30">
            <h4 className="text-[var(--terminal-green)] font-semibold mb-2">🚫 始终忽略</h4>
            <ul className="text-xs text-[var(--text-muted)] space-y-1 font-mono">
              <li>node_modules/</li>
              <li>.git/</li>
              <li>bower_components/</li>
              <li>.svn/, .hg/</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--amber)]/30">
            <h4 className="text-[var(--amber)] font-semibold mb-2">📦 二进制文件</h4>
            <ul className="text-xs text-[var(--text-muted)] space-y-1 font-mono">
              <li>*.exe, *.dll, *.so</li>
              <li>*.zip, *.tar, *.gz</li>
              <li>*.doc, *.xlsx, *.pdf</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--cyber-blue)]/30">
            <h4 className="text-[var(--cyber-blue)] font-semibold mb-2">📁 常见目录</h4>
            <ul className="text-xs text-[var(--text-muted)] space-y-1 font-mono">
              <li>.vscode/, .idea/</li>
              <li>dist/, build/</li>
              <li>coverage/, __pycache__/</li>
            </ul>
          </div>
        </div>
      </section>

      {/* .gitignore 解析 */}
      <section>
        <h3 className="text-xl font-semibold text-[var(--terminal-green)] mb-4">
          .gitignore 解析器
        </h3>
        <CodeBlock code={gitignoreParserCode} language="typescript" title="GitIgnoreParser" />

        <HighlightBox title="嵌套 .gitignore 的处理" variant="yellow" className="mt-4">
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            Git 允许在子目录中放置 .gitignore 文件，模式的作用范围仅限于该目录及其子目录。
            解析器需要正确处理这种嵌套情况：
          </p>
          <div className="bg-[var(--bg-void)] rounded-lg p-3 font-mono text-xs">
            <div className="text-[var(--text-muted)]">例：a/b/.gitignore 中的模式</div>
            <div className="mt-2">
              <span className="text-[var(--terminal-green)]">/c</span>
              <span className="text-[var(--text-muted)]"> (锚定模式) → 只匹配 </span>
              <span className="text-[var(--amber)]">a/b/c</span>
            </div>
            <div>
              <span className="text-[var(--terminal-green)]">c</span>
              <span className="text-[var(--text-muted)]"> (未锚定) → 匹配 </span>
              <span className="text-[var(--amber)]">a/b/**/c</span>
            </div>
          </div>
        </HighlightBox>
      </section>

      {/* FileDiscoveryService */}
      <section>
        <h3 className="text-xl font-semibold text-[var(--terminal-green)] mb-4">
          FileDiscoveryService
        </h3>
        <CodeBlock
          code={fileDiscoveryServiceCode}
          language="typescript"
          title="文件发现服务"
        />
      </section>

      {/* BFS 算法 */}
      <section>
        <h3 className="text-xl font-semibold text-[var(--terminal-green)] mb-4">
          BFS 文件搜索算法
        </h3>
        <MermaidDiagram chart={bfsAlgorithmChart} title="BFS 搜索流程" />
        <CodeBlock code={bfsSearchCode} language="typescript" title="bfsFileSearch 实现" />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <HighlightBox title="性能优化技巧" variant="green">
            <ul className="text-sm space-y-1">
              <li>• <strong>队列指针</strong>：queueHead 代替 splice，O(1) 出队</li>
              <li>• <strong>Set 查找</strong>：visited 和 ignoreDirs 用 Set，O(1)</li>
              <li>• <strong>并行批处理</strong>：15 个目录同时读取</li>
              <li>• <strong>提前剪枝</strong>：目录级别就过滤，减少遍历</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="复杂度分析" variant="purple">
            <ul className="text-sm space-y-1">
              <li>• <strong>时间</strong>：O(n) 目录数</li>
              <li>• <strong>空间</strong>：O(n) 队列 + visited</li>
              <li>• <strong>I/O</strong>：并行化，最多 15 个并发</li>
              <li>• <strong>限制</strong>：maxDirs 防止无限遍历</li>
            </ul>
          </HighlightBox>
        </div>
      </section>

      {/* .qwenignore */}
      <section>
        <h3 className="text-xl font-semibold text-[var(--terminal-green)] mb-4">
          .qwenignore 配置
        </h3>
        <p className="text-[var(--text-secondary)] mb-4">
          <code className="text-[var(--amber)]">.qwenignore</code> 是 CLI 专用的忽略文件，
          语法与 .gitignore 相同，但只在项目根目录查找（不支持嵌套）。
          适合配置 AI 不应该读取的敏感文件。
        </p>
        <CodeBlock code={qwenIgnoreCode} language="bash" title=".qwenignore 示例" />

        <HighlightBox title=".gitignore vs .qwenignore" variant="blue" className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)]">
                <th className="py-2">特性</th>
                <th className="py-2">.gitignore</th>
                <th className="py-2">.qwenignore</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              <tr className="border-t border-[var(--border-subtle)]">
                <td className="py-2">位置</td>
                <td>任意目录（嵌套）</td>
                <td>仅项目根目录</td>
              </tr>
              <tr className="border-t border-[var(--border-subtle)]">
                <td className="py-2">影响范围</td>
                <td>Git 和 CLI</td>
                <td>仅 CLI</td>
              </tr>
              <tr className="border-t border-[var(--border-subtle)]">
                <td className="py-2">典型用途</td>
                <td>排除构建产物</td>
                <td>排除敏感文件</td>
              </tr>
              <tr className="border-t border-[var(--border-subtle)]">
                <td className="py-2">优先级</td>
                <td>较低</td>
                <td>较高</td>
              </tr>
            </tbody>
          </table>
        </HighlightBox>
      </section>

      {/* 缓存策略 */}
      <section>
        <h3 className="text-xl font-semibold text-[var(--terminal-green)] mb-4">
          缓存策略
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--border-subtle)]">
            <h4 className="font-semibold text-[var(--cyber-blue)] mb-2">爬取缓存</h4>
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              缓存目录扫描结果，使用指纹作为键：
            </p>
            <code className="text-xs bg-[var(--bg-void)] px-2 py-1 rounded block">
              key = hash(目录 + ignore模式 + 深度)
            </code>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              ignore 模式变化会自动失效缓存
            </p>
          </div>

          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--border-subtle)]">
            <h4 className="font-semibold text-[var(--amber)] mb-2">结果缓存</h4>
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              缓存搜索结果，支持 TTL：
            </p>
            <code className="text-xs bg-[var(--bg-void)] px-2 py-1 rounded block">
              ResultCache&lt;T&gt; + TTL 过期
            </code>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              重复搜索同一模式时直接返回
            </p>
          </div>
        </div>
      </section>

      {/* 工具集成 */}
      <section>
        <h3 className="text-xl font-semibold text-[var(--terminal-green)] mb-4">
          工具集成
        </h3>
        <div className="bg-[var(--bg-panel)] rounded-lg p-6 border border-[var(--border-subtle)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                <th className="py-2">工具</th>
                <th className="py-2">搜索方式</th>
                <th className="py-2">Ignore 处理</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              <tr className="border-b border-[var(--border-subtle)]">
                <td className="py-3">
                  <code className="text-[var(--terminal-green)]">Glob</code>
                </td>
                <td>glob 库 + 后过滤</td>
                <td>FileDiscoveryService.filterFilesWithReport()</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]">
                <td className="py-3">
                  <code className="text-[var(--cyber-blue)]">Grep</code>
                </td>
                <td>git grep → grep → JS 回退</td>
                <td>--exclude-dir 参数 + 后过滤</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]">
                <td className="py-3">
                  <code className="text-[var(--amber)]">ReadManyFiles</code>
                </td>
                <td>globStream / 直接读取</td>
                <td>getReadManyFilesExcludes()</td>
              </tr>
              <tr>
                <td className="py-3">
                  <code className="text-[var(--purple)]">BFS Search</code>
                </td>
                <td>广度优先遍历</td>
                <td>目录级别提前过滤</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 最佳实践 */}
      <section>
        <h3 className="text-xl font-semibold text-[var(--terminal-green)] mb-4">
          最佳实践
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">✓ 推荐做法</h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 使用 .qwenignore 排除敏感文件</li>
              <li>• 保持 .gitignore 更新，排除大型构建产物</li>
              <li>• 利用默认排除，无需手动配置 node_modules</li>
              <li>• 使用 BFS + maxDirs 限制防止超时</li>
            </ul>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2">✗ 避免做法</h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 在大型 monorepo 中不设置 ignore</li>
              <li>• 搜索整个 node_modules 目录</li>
              <li>• 忽略权限错误的目录而不告知用户</li>
              <li>• 在 .qwenignore 中放置运行时需要的文件</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
