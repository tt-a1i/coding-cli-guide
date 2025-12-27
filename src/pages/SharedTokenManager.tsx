import { useState } from 'react';
import { MermaidDiagram } from '../components/MermaidDiagram';

// ============================================================
// SharedTokenManager - 多进程 Token 共享机制深度解析
// ============================================================
// 本页面详细解释 Qwen CLI 中的多进程 Token 管理系统
// 涵盖：分布式锁、内存缓存、Token 刷新、错误处理

// 可折叠章节组件
function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  highlight = false
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  highlight?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`mb-6 rounded-xl border ${highlight ? 'border-cyan-500/50 bg-cyan-900/10' : 'border-gray-700/50 bg-gray-800/30'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700/20 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className={`text-lg font-semibold ${highlight ? 'text-cyan-300' : 'text-gray-200'}`}>{title}</span>
        </div>
        <span className={`text-xl transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-700/30">
          {children}
        </div>
      )}
    </div>
  );
}

// 代码块组件
function CodeBlock({ code, title }: { code: string; title?: string }) {
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-700/50">
      {title && (
        <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400 border-b border-gray-700/50">
          {title}
        </div>
      )}
      <pre className="bg-gray-900/80 p-4 overflow-x-auto">
        <code className="text-sm text-gray-300">{code}</code>
      </pre>
    </div>
  );
}

// 设计原理卡片
function DesignRationaleCard({ title, why, how, benefit }: {
  title: string;
  why: string;
  how: string;
  benefit: string;
}) {
  return (
    <div className="my-4 p-5 rounded-xl bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border border-cyan-500/30">
      <h4 className="text-lg font-semibold text-cyan-300 mb-3">{title}</h4>
      <div className="space-y-3 text-sm">
        <div>
          <span className="text-yellow-400 font-medium">为什么：</span>
          <span className="text-gray-300 ml-2">{why}</span>
        </div>
        <div>
          <span className="text-cyan-400 font-medium">如何实现：</span>
          <span className="text-gray-300 ml-2">{how}</span>
        </div>
        <div>
          <span className="text-green-400 font-medium">带来的好处：</span>
          <span className="text-gray-300 ml-2">{benefit}</span>
        </div>
      </div>
    </div>
  );
}

// 30秒快速理解
function QuickSummary() {
  return (
    <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-cyan-900/40 to-blue-900/30 border border-cyan-500/40">
      <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
        <span>⚡</span> 30 秒快速理解
      </h3>
      <div className="space-y-3 text-gray-300">
        <p className="text-sm leading-relaxed">
          <strong className="text-cyan-400">问题：</strong>同一台机器可能同时运行多个 CLI 实例（多终端、IDE 插件、后台任务），
          如果各自独立刷新 Token，会导致：
        </p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><span className="text-red-400">竞态条件</span> — 进程 A 刷新后，进程 B 用旧 Token 再刷新，覆盖 A 的新 Token</li>
          <li><span className="text-red-400">Token 失效</span> — refresh_token 可能被多次使用导致服务端拒绝</li>
          <li><span className="text-red-400">重复登录</span> — 用户被频繁要求重新授权</li>
        </ul>
        <p className="text-sm leading-relaxed mt-3">
          <strong className="text-green-400">解决方案：</strong>SharedTokenManager 通过
          <span className="text-cyan-400"> 文件锁 + 内存缓存 + mtime 检测 </span>
          实现跨进程 Token 共享，确保同一时刻只有一个进程刷新 Token，其他进程等待并复用结果。
        </p>
      </div>
    </div>
  );
}

// 架构图
function ArchitectureDiagram() {
  const diagram = `flowchart TB
    subgraph Processes["多进程环境"]
        P1["CLI 实例 1<br/>Terminal"]
        P2["CLI 实例 2<br/>VS Code"]
        P3["CLI 实例 3<br/>后台任务"]
    end

    subgraph SharedTokenManager["SharedTokenManager (单例)"]
        MC["内存缓存<br/>MemoryCache"]
        RP["刷新 Promise<br/>refreshPromise"]
    end

    subgraph FileSystem["文件系统 (~/.innies/)"]
        CF["innies_oauth_creds.json<br/>凭证文件"]
        LF["innies_oauth_creds.lock<br/>锁文件"]
    end

    subgraph OAuth["OAuth 服务"]
        TS["Token Endpoint<br/>/api/v1/authn/token"]
    end

    P1 --> MC
    P2 --> MC
    P3 --> MC
    MC <--> CF
    MC --> LF
    MC --> TS

    style SharedTokenManager fill:#0d4f4f,stroke:#00ffff,stroke-width:2px
    style FileSystem fill:#2d2d4f,stroke:#8888ff,stroke-width:1px
    style OAuth fill:#4f2d2d,stroke:#ff8888,stroke-width:1px`;

  return (
    <div className="my-6">
      <MermaidDiagram chart={diagram} />
      <p className="text-sm text-gray-500 mt-2 text-center">
        多个 CLI 实例通过 SharedTokenManager 单例共享 Token，避免并发刷新冲突
      </p>
    </div>
  );
}

// Token 刷新流程图
function RefreshFlowDiagram() {
  const diagram = `sequenceDiagram
    participant CLI as CLI 实例
    participant STM as SharedTokenManager
    participant FS as 文件系统
    participant OAuth as OAuth 服务

    CLI->>STM: getValidCredentials()
    STM->>STM: checkAndReloadIfNeeded()

    alt 缓存有效
        STM-->>CLI: 返回缓存凭证
    else Token 即将过期 (< 5分钟)
        STM->>FS: acquireLock() 获取文件锁

        alt 获取锁成功
            STM->>FS: 再次检查文件 mtime
            alt 其他进程已刷新
                STM->>FS: 读取新凭证
                STM-->>CLI: 返回新凭证
            else 需要刷新
                STM->>OAuth: refreshAccessToken()
                OAuth-->>STM: 新 Token
                STM->>FS: 原子写入凭证文件
            end
            STM->>FS: releaseLock()
        else 锁被占用
            STM->>STM: 等待 (指数退避)
            STM->>FS: 重试获取锁
        end

        STM-->>CLI: 返回有效凭证
    end`;

  return (
    <div className="my-6">
      <MermaidDiagram chart={diagram} />
    </div>
  );
}

// 文件锁机制
function FileLockMechanism() {
  const lockFlow = `stateDiagram-v2
    [*] --> Unlocked: 初始状态

    Unlocked --> TryLock: 进程请求锁
    TryLock --> Locked: writeFile(flag='wx') 成功
    TryLock --> WaitRetry: EEXIST (锁已存在)

    WaitRetry --> CheckStale: 检查锁是否过期
    CheckStale --> TryLock: 过期 (>10s), 删除旧锁
    CheckStale --> Backoff: 未过期, 等待
    Backoff --> TryLock: 指数退避后重试

    Locked --> DoRefresh: 执行 Token 刷新
    DoRefresh --> ReleaseLock: 刷新完成
    ReleaseLock --> Unlocked: unlink(lockPath)

    WaitRetry --> Timeout: 超过最大重试次数
    Timeout --> [*]: 抛出 LOCK_TIMEOUT 错误`;

  return (
    <div className="my-6">
      <MermaidDiagram chart={lockFlow} />
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h5 className="text-cyan-400 font-semibold mb-2">锁获取参数</h5>
          <ul className="text-sm text-gray-300 space-y-1">
            <li><code className="text-yellow-400">maxAttempts</code>: 20 次</li>
            <li><code className="text-yellow-400">attemptInterval</code>: 100ms 起始</li>
            <li><code className="text-yellow-400">maxInterval</code>: 2000ms 上限</li>
            <li><code className="text-yellow-400">LOCK_TIMEOUT_MS</code>: 10 秒过期</li>
          </ul>
        </div>
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h5 className="text-cyan-400 font-semibold mb-2">为什么用指数退避？</h5>
          <p className="text-sm text-gray-300">
            避免多进程同时高频轮询锁文件造成 I/O 压力。
            初始 100ms，每次 ×1.5，最大 2s，总等待时间约 20s。
          </p>
        </div>
      </div>
    </div>
  );
}

// 内存缓存设计
function MemoryCacheDesign() {
  return (
    <div className="space-y-4">
      <CodeBlock
        title="MemoryCache 接口定义 (sharedTokenManager.ts:73)"
        code={`interface MemoryCache {
  credentials: InniesCredentials | null;  // 缓存的凭证
  fileModTime: number;                    // 文件最后修改时间
  lastCheck: number;                      // 上次检查时间戳
}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
          <h5 className="text-blue-400 font-semibold mb-2">credentials</h5>
          <p className="text-sm text-gray-300">
            当前进程内存中的 Token 副本，避免每次都读文件
          </p>
        </div>
        <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/30">
          <h5 className="text-green-400 font-semibold mb-2">fileModTime</h5>
          <p className="text-sm text-gray-300">
            对比文件 mtime 判断是否被其他进程更新
          </p>
        </div>
        <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
          <h5 className="text-purple-400 font-semibold mb-2">lastCheck</h5>
          <p className="text-sm text-gray-300">
            限制检查频率（5秒间隔），减少 stat() 调用
          </p>
        </div>
      </div>

      <DesignRationaleCard
        title="为什么用 mtime 而非文件内容 hash？"
        why="每次读取文件并计算 hash 开销大，stat() 只需一次系统调用"
        how="stat(filePath).mtimeMs 获取文件修改时间，与缓存对比"
        benefit="高效检测变化，I/O 开销降至最低"
      />
    </div>
  );
}

// Token 刷新时机
function RefreshTiming() {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
        <h5 className="text-yellow-400 font-semibold mb-2">刷新缓冲区：5 分钟</h5>
        <p className="text-sm text-gray-300 mb-3">
          Token 在过期前 5 分钟即被视为"需要刷新"，而非等到真正过期。
        </p>
        <CodeBlock
          title="sharedTokenManager.ts:27"
          code={`const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

private isTokenValid(credentials: InniesCredentials): boolean {
  if (!credentials.expiry_date || !credentials.access_token) {
    return false;
  }
  return Date.now() < credentials.expiry_date - TOKEN_REFRESH_BUFFER_MS;
}`}
        />
      </div>

      <DesignRationaleCard
        title="为什么提前 5 分钟刷新？"
        why="网络延迟、锁等待、服务端处理都需要时间，若等到过期瞬间刷新可能来不及"
        how="在 expiry_date - 5min 时就判定为无效，触发刷新流程"
        benefit="给刷新操作预留充足时间窗口，避免 Token 过期导致请求失败"
      />
    </div>
  );
}

// 错误处理
function ErrorHandling() {
  const errors = [
    {
      type: 'REFRESH_FAILED',
      desc: 'Token 刷新失败',
      cause: '网络错误、服务端拒绝、无效 refresh_token',
      recovery: '抛出异常，由上层决定是否重新登录'
    },
    {
      type: 'NO_REFRESH_TOKEN',
      desc: '没有 refresh_token',
      cause: '首次使用、凭证文件损坏',
      recovery: '需要用户重新执行设备授权流程'
    },
    {
      type: 'LOCK_TIMEOUT',
      desc: '获取锁超时',
      cause: '其他进程持锁过久、进程崩溃未释放锁',
      recovery: '等待超过 10s 的过期锁会被强制删除'
    },
    {
      type: 'FILE_ACCESS_ERROR',
      desc: '文件访问错误',
      cause: '权限不足、磁盘满、目录不存在',
      recovery: '清除内存缓存，下次重新尝试'
    },
    {
      type: 'NETWORK_ERROR',
      desc: '网络错误',
      cause: 'fetch 失败、超时、DNS 解析失败',
      recovery: '抛出异常，可由上层重试'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-cyan-400">错误类型</th>
              <th className="text-left py-3 px-4 text-cyan-400">说明</th>
              <th className="text-left py-3 px-4 text-cyan-400">可能原因</th>
              <th className="text-left py-3 px-4 text-cyan-400">恢复策略</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((e, i) => (
              <tr key={i} className="border-b border-gray-800">
                <td className="py-3 px-4 font-mono text-yellow-400">{e.type}</td>
                <td className="py-3 px-4 text-gray-300">{e.desc}</td>
                <td className="py-3 px-4 text-gray-400">{e.cause}</td>
                <td className="py-3 px-4 text-gray-300">{e.recovery}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CodeBlock
        title="TokenManagerError 类定义 (sharedTokenManager.ts:59)"
        code={`export class TokenManagerError extends Error {
  constructor(
    public type: TokenError,      // 错误分类
    message: string,              // 人类可读消息
    public originalError?: unknown, // 原始异常
  ) {
    super(message);
    this.name = 'TokenManagerError';
  }
}`}
      />
    </div>
  );
}

// 原子写入
function AtomicWrite() {
  const diagram = `sequenceDiagram
    participant STM as SharedTokenManager
    participant TMP as 临时文件
    participant TARGET as 目标文件

    STM->>TMP: writeFile(path.tmp.{uuid}, creds)
    Note over TMP: 权限: 0o600 (仅所有者读写)

    alt 写入成功
        STM->>TARGET: rename(tmp, target)
        Note over TARGET: 原子操作，要么完整要么不变
        STM->>STM: stat() 更新缓存 mtime
    else 写入失败
        STM->>TMP: unlink(tmp) 清理
        STM-->>STM: 抛出 FILE_ACCESS_ERROR
    end`;

  return (
    <div className="space-y-4">
      <MermaidDiagram chart={diagram} />

      <DesignRationaleCard
        title="为什么用临时文件 + rename？"
        why="直接写入目标文件时，若进程崩溃会留下损坏的半成品文件"
        how="先写临时文件，成功后通过 rename() 原子替换"
        benefit="rename 在 POSIX 系统上是原子操作，保证文件要么完整要么不变"
      />

      <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
        <h5 className="text-red-400 font-semibold mb-2">安全考虑：文件权限</h5>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• 目录权限：<code className="text-yellow-400">0o700</code> (仅所有者可访问)</li>
          <li>• 文件权限：<code className="text-yellow-400">0o600</code> (仅所有者读写)</li>
          <li>• 敏感数据 (access_token, refresh_token) 不会泄露给其他用户</li>
        </ul>
      </div>
    </div>
  );
}

// 进程退出清理
function CleanupHandlers() {
  return (
    <div className="space-y-4">
      <CodeBlock
        title="注册清理处理器 (sharedTokenManager.ts:174)"
        code={`private registerCleanupHandlers(): void {
  this.cleanupFunction = () => {
    try {
      const lockPath = this.getLockFilePath();
      unlinkSync(lockPath);  // 同步删除，确保在退出前完成
    } catch (_error) {
      // 忽略清理错误
    }
  };

  // 注册多种退出事件
  process.on('exit', this.cleanupFunction);
  process.on('SIGINT', this.cleanupFunction);      // Ctrl+C
  process.on('SIGTERM', this.cleanupFunction);     // kill
  process.on('uncaughtException', this.cleanupFunction);
  process.on('unhandledRejection', this.cleanupFunction);
}`}
      />

      <DesignRationaleCard
        title="为什么要清理锁文件？"
        why="进程持锁期间崩溃，锁文件会遗留在磁盘上，阻塞其他进程"
        how="在各种退出事件上注册同步清理函数，确保锁被释放"
        benefit="即使异常退出，其他进程也能在 10s 后通过过期检测恢复"
      />
    </div>
  );
}

// 与 OAuth 客户端的协作
function OAuthIntegration() {
  const diagram = `classDiagram
    class SharedTokenManager {
        -memoryCache: MemoryCache
        -refreshPromise: Promise
        +getInstance(): SharedTokenManager
        +getValidCredentials(client): InniesCredentials
        -performTokenRefresh(client): InniesCredentials
        -acquireLock()
        -releaseLock()
    }

    class InniesOAuth2Client {
        -credentials: InniesCredentials
        -sharedManager: SharedTokenManager
        +getAccessToken(): token
        +refreshAccessToken(): TokenRefreshResponse
        +setCredentials(creds)
        +getCredentials(): InniesCredentials
    }

    class InniesCredentials {
        access_token: string
        refresh_token: string
        expiry_date: number
        token_type: string
    }

    SharedTokenManager --> InniesOAuth2Client : 调用 refreshAccessToken
    InniesOAuth2Client --> SharedTokenManager : 使用单例
    SharedTokenManager --> InniesCredentials : 管理
    InniesOAuth2Client --> InniesCredentials : 持有`;

  return (
    <div className="space-y-4">
      <MermaidDiagram chart={diagram} />

      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h5 className="text-cyan-400 font-semibold mb-2">协作关系</h5>
        <ol className="text-sm text-gray-300 space-y-2 list-decimal pl-5">
          <li><code>InniesOAuth2Client</code> 持有当前进程的凭证副本</li>
          <li>调用 <code>getAccessToken()</code> 时，委托给 SharedTokenManager</li>
          <li>SharedTokenManager 检查缓存有效性，必要时触发刷新</li>
          <li>刷新成功后，同步更新 OAuth 客户端的凭证 (<code>setCredentials</code>)</li>
        </ol>
      </div>
    </div>
  );
}

// 源码导航
function SourceNavigation() {
  const files = [
    {
      path: 'packages/core/src/innies/sharedTokenManager.ts',
      desc: 'SharedTokenManager 完整实现',
      lines: '883 行',
      key: 'getInstance, getValidCredentials, performTokenRefresh, acquireLock'
    },
    {
      path: 'packages/core/src/innies/inniesOAuth2.ts',
      desc: 'OAuth2 客户端，设备授权与 Token 刷新',
      lines: '~400 行',
      key: 'InniesOAuth2Client, requestDeviceAuthorization, refreshAccessToken'
    }
  ];

  return (
    <div className="space-y-3">
      {files.map((f, i) => (
        <div key={i} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <code className="text-cyan-400 text-sm">{f.path}</code>
            <span className="text-xs text-gray-500">{f.lines}</span>
          </div>
          <p className="text-sm text-gray-300 mb-2">{f.desc}</p>
          <p className="text-xs text-gray-500">关键符号: {f.key}</p>
        </div>
      ))}
    </div>
  );
}

// 主组件
export function SharedTokenManager() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">SharedTokenManager</h1>
        <p className="text-gray-400">多进程 Token 共享与并发刷新机制</p>
      </div>

      <QuickSummary />

      <CollapsibleSection title="架构概览" icon="🏗️" defaultOpen={true} highlight>
        <ArchitectureDiagram />
      </CollapsibleSection>

      <CollapsibleSection title="Token 刷新流程" icon="🔄" defaultOpen={true} highlight>
        <RefreshFlowDiagram />
      </CollapsibleSection>

      <CollapsibleSection title="文件锁机制" icon="🔐" defaultOpen={true}>
        <FileLockMechanism />
      </CollapsibleSection>

      <CollapsibleSection title="内存缓存设计" icon="💾" defaultOpen={false}>
        <MemoryCacheDesign />
      </CollapsibleSection>

      <CollapsibleSection title="刷新时机与缓冲区" icon="⏱️" defaultOpen={false}>
        <RefreshTiming />
      </CollapsibleSection>

      <CollapsibleSection title="原子写入与安全" icon="🛡️" defaultOpen={false}>
        <AtomicWrite />
      </CollapsibleSection>

      <CollapsibleSection title="错误分类与处理" icon="⚠️" defaultOpen={false}>
        <ErrorHandling />
      </CollapsibleSection>

      <CollapsibleSection title="进程退出清理" icon="🧹" defaultOpen={false}>
        <CleanupHandlers />
      </CollapsibleSection>

      <CollapsibleSection title="与 OAuth 客户端协作" icon="🤝" defaultOpen={false}>
        <OAuthIntegration />
      </CollapsibleSection>

      <CollapsibleSection title="源码导航" icon="📂" defaultOpen={false}>
        <SourceNavigation />
      </CollapsibleSection>

      {/* 设计要点总结 */}
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700">
        <h3 className="text-xl font-bold text-gray-200 mb-4">设计要点总结</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <strong className="text-gray-200">单例模式</strong>
              <p className="text-gray-400">每个进程内只有一个 SharedTokenManager 实例</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <strong className="text-gray-200">文件锁分布式协调</strong>
              <p className="text-gray-400">跨进程互斥，避免并发刷新</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <strong className="text-gray-200">mtime 增量检测</strong>
              <p className="text-gray-400">高效感知其他进程的更新</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <strong className="text-gray-200">双重检查锁</strong>
              <p className="text-gray-400">获取锁后再次检查，避免重复刷新</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <strong className="text-gray-200">原子文件写入</strong>
              <p className="text-gray-400">tmp + rename 保证数据完整性</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <strong className="text-gray-200">过期锁自动清理</strong>
              <p className="text-gray-400">10 秒超时 + 退出事件清理</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
