import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

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
 <div className="mb-8 bg-surface rounded-xl border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">🔍</span>
 <span className="text-xl font-bold text-heading">
 文件发现系统导读
 </span>
 </div>
 <span
 className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}
 >
 ▼
 </span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">
 🎯 设计目标
 </h4>
 <p className="text-body text-sm">
 CLI 需要高效地搜索代码文件，同时尊重用户的 ignore 配置。
 系统实现了 <strong>多层 ignore 支持</strong>（.gitignore + .geminiignore）、
 <strong>BFS 并行遍历</strong>、<strong>智能缓存</strong>，在大型 monorepo 中也能快速响应。
 </p>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-amber-500 font-bold mb-2">
 💡 为什么需要这个系统
 </h4>
 <div className="text-body text-sm space-y-2">
 <p><strong>问题 1：node_modules 太大</strong> - 不过滤的话，搜索一个文件可能要遍历几十万个文件</p>
 <p><strong>问题 2：用户隐私</strong> - .env、私钥等文件不应该被 AI 读取</p>
 <p><strong>问题 3：性能</strong> - 大型项目需要并行搜索 + 缓存策略</p>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">📊 关键数字</h4>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="text-center">
 <div className="text-xl font-bold text-heading">2</div>
 <div className="text-xs text-dim">Ignore 类型</div>
 </div>
 <div className="text-center">
 <div className="text-xl font-bold text-heading">15</div>
 <div className="text-xs text-dim">并行批次</div>
 </div>
 <div className="text-center">
 <div className="text-xl font-bold text-amber-500">O(1)</div>
 <div className="text-xs text-dim">查找复杂度</div>
 </div>
 <div className="text-center">
 <div className="text-xl font-bold text-heading">✓</div>
 <div className="text-xs text-dim">结果缓存</div>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

const relatedPages: RelatedPage[] = [
 { id: 'tool-ref', label: '工具参考', description: 'glob、search_file_content 等工具的详细文档' },
 { id: 'tool-arch', label: '工具系统架构', description: '工具如何与文件发现系统协作' },
 { id: 'bfs-file-search-anim', label: 'BFS 文件搜索动画', description: '广度优先搜索算法可视化' },
 { id: 'sandbox', label: '沙箱系统', description: '文件访问权限与安全机制' },
 { id: 'memory', label: '内存管理', description: '文件内容如何进入上下文' },
 { id: 'config', label: '配置系统', description: 'CLI 配置与 .geminiignore 的关系' },
];

export function FileDiscovery() {
 const [isIntroExpanded, setIsIntroExpanded] = useState(true);

 const discoveryFlowChart = `flowchart TD
 tool["工具调用<br/>glob/search_file_content/read_many_files"]
 get_config["获取 FileExclusions<br/>& FileDiscoveryService"]
 apply_defaults["应用默认排除模式<br/>node_modules, .git..."]
 scan["扫描文件"]
 filter_git["检查 .gitignore"]
 filter_gemini["检查 .geminiignore"]
 collect["收集过滤统计"]
 result["返回过滤后的结果"]

 tool --> get_config
 get_config --> apply_defaults
 apply_defaults --> scan
 scan --> filter_git
 filter_git --> filter_gemini
 filter_gemini --> collect
 collect --> result

 style tool fill:#22d3ee,color:#000
 style result fill:#22c55e,color:#000
 style filter_git fill:#f59e0b,color:#000
 style filter_gemini fill:#a855f7,color:#fff`;

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

 // 获取 glob 工具的完整排除列表
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
 private geminiIgnoreFilter: GeminiIgnoreFilter | null = null;
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
 respectGeminiIgnore = true,
 } = options;

 let gitIgnoredCount = 0;
 let geminiIgnoredCount = 0;

 const filteredPaths = filePaths.filter((filePath) => {
 // 检查 .gitignore
 if (respectGitIgnore && this.shouldGitIgnoreFile(filePath)) {
 gitIgnoredCount++;
 return false;
 }

 // 检查 .geminiignore
 if (respectGeminiIgnore && this.shouldGeminiIgnoreFile(filePath)) {
 geminiIgnoredCount++;
 return false;
 }

 return true;
 });

 return {
 filteredPaths,
 gitIgnoredCount,
 geminiIgnoredCount,
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
 * 惰性加载 GeminiIgnoreParser
 *
 * 注意：.geminiignore 只在项目根目录查找，不支持嵌套
 */
 private shouldGeminiIgnoreFile(filePath: string): boolean {
 if (!this.geminiIgnoreFilter) {
 this.geminiIgnoreFilter = new GeminiIgnoreParser(this.projectRoot);
 }
 return this.geminiIgnoreFilter.isIgnored(filePath);
 }
}

interface FilterReport {
 filteredPaths: string[];
 gitIgnoredCount: number;
 geminiIgnoredCount: number;
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

 const geminiIgnoreCode = `// .geminiignore 文件示例

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
 <h2 className="text-2xl font-bold text-heading mb-4">
 文件发现与 Ignore 模式
 </h2>
 <p className="text-body mb-4">
 文件发现系统是 glob、search_file_content、read_many_files 等工具的基础。它需要在毫秒级响应内
 搜索可能包含数万文件的代码库，同时尊重用户的 ignore 配置。
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="两层 Ignore 机制" variant="blue">
 <ul className="text-sm space-y-2">
 <li>
 <strong className="text-heading">.gitignore</strong>
 <span className="text-dim"> - 支持嵌套、多级目录</span>
 </li>
 <li>
 <strong className="text-amber-500">.geminiignore</strong>
 <span className="text-dim"> - 项目根目录、CLI 专用</span>
 </li>
 <li className="text-xs text-dim">
 优先级：.geminiignore &gt; .gitignore &gt; 内置默认
 </li>
 </ul>
 </HighlightBox>

 <HighlightBox title="搜索策略" variant="green">
 <ul className="text-sm space-y-2">
 <li>
 <strong>BFS 遍历</strong>
 <span className="text-dim"> - 广度优先，批量并行</span>
 </li>
 <li>
 <strong>glob 匹配</strong>
 <span className="text-dim"> - 模式匹配，后过滤</span>
 </li>
 <li>
 <strong>fdir 爬取</strong>
 <span className="text-dim"> - 全量索引，带缓存</span>
 </li>
 </ul>
 </HighlightBox>
 </div>
 </section>

 {/* 决策树：文件是否包含 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">
 核心决策树：这个文件应该被包含吗？
 </h3>
 <p className="text-body mb-4 text-sm">
 当 CLI 执行 glob/search_file_content/read_file 等操作时，每个文件都会经过以下决策流程：
 </p>
 <MermaidDiagram
 chart={`flowchart TD
 start["📁 发现文件"]

 q1{"在内置排除列表？<br/>.git/, node_modules/"}
 q2{"匹配工具排除参数？<br/>--exclude, ignore 选项"}
 q3{"被 .gitignore 忽略？<br/>任意层级的 .gitignore"}
 q4{"被 .geminiignore 忽略？<br/>仅项目根目录"}
 q5{"是二进制/媒体文件？<br/>*.exe, *.png..."}
 q6{"文件可读？<br/>权限检查"}

 include["✅ 包含"]
 exclude1["❌ 排除<br/><small>原因: 内置规则</small>"]
 exclude2["❌ 排除<br/><small>原因: 工具参数</small>"]
 exclude3["❌ 排除<br/><small>原因: .gitignore</small>"]
 exclude4["❌ 排除<br/><small>原因: .geminiignore</small>"]
 exclude5["❌ 排除<br/><small>原因: 不可处理</small>"]
 exclude6["❌ 排除<br/><small>原因: 无权限</small>"]

 start --> q1
 q1 -->|Yes| exclude1
 q1 -->|No| q2
 q2 -->|Yes| exclude2
 q2 -->|No| q3
 q3 -->|Yes| exclude3
 q3 -->|No| q4
 q4 -->|Yes| exclude4
 q4 -->|No| q5
 q5 -->|Yes| exclude5
 q5 -->|No| q6
 q6 -->|No| exclude6
 q6 -->|Yes| include

 style start fill:#22d3ee,color:#000
 style include fill:#22c55e,color:#000
 style exclude1 fill:#ef4444,color:#fff
 style exclude2 fill:#ef4444,color:#fff
 style exclude3 fill:#f59e0b,color:#000
 style exclude4 fill:#a855f7,color:#fff
 style exclude5 fill:#6b7280,color:#fff
 style exclude6 fill:#6b7280,color:#fff
 style q3 fill:#f59e0b33,stroke:#f59e0b
 style q4 fill:#a855f733,stroke:#a855f7`}
 title="文件包含/排除决策树"
 />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
 <h4 className="text-red-400 font-semibold text-sm mb-2">🔴 硬性排除</h4>
 <p className="text-xs text-dim">
 内置规则 + 工具参数。无法覆盖，始终生效。
 </p>
 </div>
 <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-3">
 <h4 className="text-amber-400 font-semibold text-sm mb-2">🟡 Git 排除</h4>
 <p className="text-xs text-dim">
 支持多级嵌套。可通过 respectGitIgnore=false 禁用。
 </p>
 </div>
 <div className="bg-elevated border border-edge rounded-lg p-3">
 <h4 className="text-heading font-semibold text-sm mb-2">🟣 CLI 排除</h4>
 <p className="text-xs text-dim">
 .geminiignore 专属。适合敏感文件，优先级最高。
 </p>
 </div>
 </div>
 </section>

 {/* 设计哲学 */}
 <section className="bg-surface/50 rounded-xl border border-edge p-6">
 <h3 className="text-xl font-semibold text-heading mb-4">
 设计哲学：为什么这样设计
 </h3>

 <div className="space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🎯 为什么需要两层 Ignore？</h4>
 <p className="text-body text-sm mb-2">
 <strong>核心矛盾</strong>：.gitignore 设计目的是排除版本控制，但 AI 需要排除的文件集合不同。
 </p>
 <ul className="text-xs text-dim space-y-1 ml-4">
 <li>• <code>.env</code> 通常在 .gitignore 中，但 AI 确实不应该读取</li>
 <li>• <code>dist/</code> 在 .gitignore 中，但 AI 有时需要分析构建产物</li>
 <li>• <code>package-lock.json</code> 在 Git 中，但 AI 分析它浪费 token</li>
 </ul>
 <p className="text-xs text-amber-500 mt-2">
 → .geminiignore 给用户一个专门控制 AI 可见性的旋钮
 </p>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🎯 为什么 BFS 而不是 DFS？</h4>
 <p className="text-body text-sm mb-2">
 <strong>核心问题</strong>：用户通常关心的文件在项目浅层，深层目录往往是依赖/缓存。
 </p>
 <ul className="text-xs text-dim space-y-1 ml-4">
 <li>• BFS 先遍历浅层 → 更快找到用户关心的文件</li>
 <li>• DFS 可能先钻进 node_modules 的深渊 → 浪费时间</li>
 <li>• BFS + maxDirs 限制 → 可预测的最大遍历范围</li>
 </ul>
 <p className="text-xs text-amber-500 mt-2">
 → 广度优先 + 批量并行 = 最快响应用户
 </p>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🎯 为什么目录级别提前过滤？</h4>
 <p className="text-body text-sm mb-2">
 <strong>性能关键</strong>：node_modules 可能包含 50,000+ 文件，逐个检查太慢。
 </p>
 <ul className="text-xs text-dim space-y-1 ml-4">
 <li>• 在目录级别就跳过 → 完全不进入 node_modules</li>
 <li>• 文件级别过滤 → 已经遍历完目录才过滤，浪费 I/O</li>
 <li>• 代价：无法在 node_modules 内部精细控制</li>
 </ul>
 <p className="text-xs text-amber-500 mt-2">
 → 目录剪枝 = O(1) 跳过百万文件
 </p>
 </div>
 </div>

 <div className="mt-6 bg-base/50 rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-3">设计权衡总结</h4>
 <table className="w-full text-sm">
 <thead>
 <tr className="text-left text-dim border- border-edge">
 <th className="py-2">决策</th>
 <th className="py-2">选择</th>
 <th className="py-2">代价</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2">Ignore 粒度</td>
 <td className="text-heading">两层（Git + CLI）</td>
 <td className="text-dim">配置复杂度增加</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2">遍历策略</td>
 <td className="text-heading">BFS + 批量并行</td>
 <td className="text-dim">内存占用略高</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2">过滤时机</td>
 <td className="text-heading">目录级别提前</td>
 <td className="text-dim">无法精细到文件</td>
 </tr>
 <tr>
 <td className="py-2">.geminiignore 位置</td>
 <td className="text-heading">仅项目根目录</td>
 <td className="text-dim">不支持嵌套</td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>

 {/* 发现流程 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">
 文件发现流程
 </h3>
 <MermaidDiagram chart={discoveryFlowChart} title="文件发现与过滤流程" />
 </section>

 {/* 默认排除模式 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">
 默认排除模式
 </h3>
 <CodeBlock code={ignorePatternCode} language="typescript" title="FileExclusions 类" />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-surface rounded-lg p-4 border border-edge/30">
 <h4 className="text-heading font-semibold mb-2">🚫 始终忽略</h4>
 <ul className="text-xs text-dim space-y-1 font-mono">
 <li>node_modules/</li>
 <li>.git/</li>
 <li>bower_components/</li>
 <li>.svn/, .hg/</li>
 </ul>
 </div>

 <div className="bg-surface rounded-lg p-4 border border-amber-500/30">
 <h4 className="text-amber-500 font-semibold mb-2">📦 二进制文件</h4>
 <ul className="text-xs text-dim space-y-1 font-mono">
 <li>*.exe, *.dll, *.so</li>
 <li>*.zip, *.tar, *.gz</li>
 <li>*.doc, *.xlsx, *.pdf</li>
 </ul>
 </div>

 <div className="bg-surface rounded-lg p-4 border border-edge/30">
 <h4 className="text-heading font-semibold mb-2">📁 常见目录</h4>
 <ul className="text-xs text-dim space-y-1 font-mono">
 <li>.vscode/, .idea/</li>
 <li>dist/, build/</li>
 <li>coverage/, __pycache__/</li>
 </ul>
 </div>
 </div>
 </section>

 {/* .gitignore 解析 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">
 .gitignore 解析器
 </h3>
 <CodeBlock code={gitignoreParserCode} language="typescript" title="GitIgnoreParser" />

 <HighlightBox title="嵌套 .gitignore 的处理" variant="yellow" className="mt-4">
 <p className="text-sm text-body mb-2">
 Git 允许在子目录中放置 .gitignore 文件，模式的作用范围仅限于该目录及其子目录。
 解析器需要正确处理这种嵌套情况：
 </p>
 <div className="bg-base rounded-lg p-3 font-mono text-xs">
 <div className="text-dim">例：a/b/.gitignore 中的模式</div>
 <div className="mt-2">
 <span className="text-heading">/c</span>
 <span className="text-dim"> (锚定模式) → 只匹配 </span>
 <span className="text-amber-500">a/b/c</span>
 </div>
 <div>
 <span className="text-heading">c</span>
 <span className="text-dim"> (未锚定) → 匹配 </span>
 <span className="text-amber-500">a/b/**/c</span>
 </div>
 </div>
 </HighlightBox>
 </section>

 {/* FileDiscoveryService */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">
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
 <h3 className="text-xl font-semibold text-heading mb-4">
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

 {/* .geminiignore */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">
 .geminiignore 配置
 </h3>
 <p className="text-body mb-4">
 <code className="text-amber-500">.geminiignore</code> 是 CLI 专用的忽略文件，
 语法与 .gitignore 相同，但只在项目根目录查找（不支持嵌套）。
 适合配置 AI 不应该读取的敏感文件。
 </p>
 <CodeBlock code={geminiIgnoreCode} language="bash" title=".geminiignore 示例" />

 <HighlightBox title=".gitignore vs .geminiignore" variant="blue" className="mt-4">
 <table className="w-full text-sm">
 <thead>
 <tr className="text-left text-dim">
 <th className="py-2">特性</th>
 <th className="py-2">.gitignore</th>
 <th className="py-2">.geminiignore</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border-t border-edge">
 <td className="py-2">位置</td>
 <td>任意目录（嵌套）</td>
 <td>仅项目根目录</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="py-2">影响范围</td>
 <td>Git 和 CLI</td>
 <td>仅 CLI</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="py-2">典型用途</td>
 <td>排除构建产物</td>
 <td>排除敏感文件</td>
 </tr>
 <tr className="border-t border-edge">
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
 <h3 className="text-xl font-semibold text-heading mb-4">
 缓存策略
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface rounded-lg p-4 border border-edge">
 <h4 className="font-semibold text-heading mb-2">爬取缓存</h4>
 <p className="text-sm text-body mb-2">
 缓存目录扫描结果，使用指纹作为键：
 </p>
 <code className="text-xs bg-base px-2 py-1 rounded block">
 key = hash(目录 + ignore模式 + 深度)
 </code>
 <p className="text-xs text-dim mt-2">
 ignore 模式变化会自动失效缓存
 </p>
 </div>

 <div className="bg-surface rounded-lg p-4 border border-edge">
 <h4 className="font-semibold text-amber-500 mb-2">结果缓存</h4>
 <p className="text-sm text-body mb-2">
 缓存搜索结果，支持 TTL：
 </p>
 <code className="text-xs bg-base px-2 py-1 rounded block">
 ResultCache&lt;T&gt; + TTL 过期
 </code>
 <p className="text-xs text-dim mt-2">
 重复搜索同一模式时直接返回
 </p>
 </div>
 </div>
 </section>

 {/* 工具集成 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">
 工具集成
 </h3>
 <div className="bg-surface rounded-lg p-6 border border-edge">
 <table className="w-full text-sm">
 <thead>
 <tr className="text-left text-dim border- border-edge">
 <th className="py-2">工具</th>
 <th className="py-2">搜索方式</th>
 <th className="py-2">Ignore 处理</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-3">
 <code className="text-heading">glob</code>
 </td>
 <td>glob 库 + 后过滤</td>
 <td>FileDiscoveryService.filterFilesWithReport()</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-3">
 <code className="text-heading">search_file_content</code>
 </td>
 <td>git grep → grep → JS 回退</td>
 <td>--exclude-dir 参数 + 后过滤</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-3">
 <code className="text-amber-500">read_many_files</code>
 </td>
 <td>globStream / 直接读取</td>
 <td>getReadManyFilesExcludes()</td>
 </tr>
 <tr>
 <td className="py-3">
 <code className="text-heading">BFS Search</code>
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
 <h3 className="text-xl font-semibold text-heading mb-4">
 最佳实践
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
 <h4 className="text-green-400 font-semibold mb-2">✓ 推荐做法</h4>
 <ul className="text-sm text-body space-y-1">
 <li>• 使用 .geminiignore 排除敏感文件</li>
 <li>• 保持 .gitignore 更新，排除大型构建产物</li>
 <li>• 利用默认排除，无需手动配置 node_modules</li>
 <li>• 使用 BFS + maxDirs 限制防止超时</li>
 </ul>
 </div>
 <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
 <h4 className="text-red-400 font-semibold mb-2">✗ 避免做法</h4>
 <ul className="text-sm text-body space-y-1">
 <li>• 在大型 monorepo 中不设置 ignore</li>
 <li>• 搜索整个 node_modules 目录</li>
 <li>• 忽略权限错误的目录而不告知用户</li>
 <li>• 在 .geminiignore 中放置运行时需要的文件</li>
 </ul>
 </div>
 </div>
 </section>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
