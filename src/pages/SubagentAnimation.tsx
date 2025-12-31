import { useState, useEffect, useCallback, useMemo } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 介绍内容组件
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-6 bg-[var(--bg-elevated)] rounded-lg overflow-hidden border border-[var(--border-subtle)]">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[var(--bg-panel)] transition-colors"
      >
        <span className="text-lg font-semibold text-[var(--text-primary)]">📖 什么是子代理系统？</span>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 text-sm">
          {/* 核心概念 */}
          <div>
            <h3 className="text-[var(--terminal-green)] font-semibold mb-2">🎯 核心概念</h3>
            <p className="text-[var(--text-secondary)]">
              <strong>子代理 (Subagent)</strong> 是主 AI 可以委派任务的专家助手。当主 AI 需要执行特定领域任务
              （如代码审查、安全扫描）时，会启动对应的子代理，让它们并行处理任务，最后汇总结果。
            </p>
          </div>

          {/* 为什么需要 */}
          <div>
            <h3 className="text-[var(--terminal-green)] font-semibold mb-2">❓ 为什么需要子代理？</h3>
            <ul className="text-[var(--text-secondary)] space-y-1 list-disc list-inside">
              <li><strong>专业化</strong>：每个子代理专注于特定领域，效果更好</li>
              <li><strong>并行处理</strong>：多个子代理同时工作，提高效率</li>
              <li><strong>上下文隔离</strong>：子代理有独立上下文，不污染主对话</li>
              <li><strong>可扩展</strong>：用户可以添加自定义子代理</li>
            </ul>
          </div>

          {/* 子代理类型 */}
          <div>
            <h3 className="text-[var(--terminal-green)] font-semibold mb-2">📊 子代理类型</h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-[var(--bg-void)] p-2 rounded border border-[var(--border-subtle)]">
                <div className="text-[var(--cyber-blue)]">内置代理</div>
                <div className="text-[var(--text-muted)]">CodeReview, Security...</div>
              </div>
              <div className="bg-[var(--bg-void)] p-2 rounded border border-[var(--border-subtle)]">
                <div className="text-[var(--purple)]">用户代理</div>
                <div className="text-[var(--text-muted)]">~/.gemini/agents/</div>
              </div>
              <div className="bg-[var(--bg-void)] p-2 rounded border border-[var(--border-subtle)]">
                <div className="text-[var(--terminal-green)]">项目代理</div>
                <div className="text-[var(--text-muted)]">.gemini/agents/</div>
              </div>
            </div>
          </div>

          {/* 源码位置 */}
          <div>
            <h3 className="text-[var(--terminal-green)] font-semibold mb-2">📁 源码位置</h3>
            <code className="text-xs bg-[var(--bg-void)] p-2 rounded block border border-[var(--border-subtle)]">
              packages/core/src/subagents/subagentManager.ts
            </code>
          </div>

          {/* 相关机制 */}
          <div>
            <h3 className="text-[var(--terminal-green)] font-semibold mb-2">🔗 相关机制</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded text-xs">工具调度</span>
              <span className="px-2 py-1 bg-[var(--purple)]/20 text-[var(--purple)] rounded text-xs">Token 管理</span>
              <span className="px-2 py-1 bg-[var(--amber)]/20 text-[var(--amber)] rounded text-xs">配置系统</span>
              <span className="px-2 py-1 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded text-xs">进程隔离</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 子代理类型
type SubagentType = 'builtin' | 'user' | 'project';
type SubagentStatus = 'idle' | 'spawning' | 'running' | 'thinking' | 'completed' | 'error';

interface Subagent {
  id: string;
  name: string;
  type: SubagentType;
  description: string;
  status: SubagentStatus;
  task?: string;
  result?: string;
  tokens?: number;
}

// 初始子代理配置
const subagentDefinitions: Omit<Subagent, 'status' | 'task' | 'result' | 'tokens'>[] = [
  {
    id: 'code-review',
    name: 'CodeReview',
    type: 'builtin',
    description: '代码审查专家，检查代码质量和最佳实践',
  },
  {
    id: 'security',
    name: 'SecurityScanner',
    type: 'builtin',
    description: '安全扫描，检测潜在漏洞和安全问题',
  },
  {
    id: 'test-gen',
    name: 'TestGenerator',
    type: 'user',
    description: '自动生成单元测试用例',
  },
  {
    id: 'docs',
    name: 'DocWriter',
    type: 'user',
    description: '生成文档和 API 说明',
  },
  {
    id: 'refactor',
    name: 'Refactorer',
    type: 'project',
    description: '项目特定的重构建议',
  },
];

// 层级颜色
const typeConfig = {
  builtin: {
    color: 'var(--terminal-green)',
    bgColor: 'var(--terminal-green)',
    label: '内置',
    icon: '📦',
  },
  user: {
    color: 'var(--cyber-blue)',
    bgColor: 'var(--cyber-blue)',
    label: '用户',
    icon: '👤',
  },
  project: {
    color: 'var(--amber)',
    bgColor: 'var(--amber)',
    label: '项目',
    icon: '📁',
  },
};

// 子代理卡片
function SubagentCard({
  agent,
  isActive,
}: {
  agent: Subagent;
  isActive: boolean;
}) {
  const config = typeConfig[agent.type];

  const statusIcons: Record<SubagentStatus, string> = {
    idle: '○',
    spawning: '◐',
    running: '◑',
    thinking: '◓',
    completed: '●',
    error: '✕',
  };

  const statusColors: Record<SubagentStatus, string> = {
    idle: 'var(--text-muted)',
    spawning: 'var(--cyber-blue)',
    running: 'var(--amber)',
    thinking: 'var(--purple)',
    completed: 'var(--terminal-green)',
    error: 'var(--error)',
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-300 ${
        isActive
          ? `bg-[var(--bg-elevated)] border-[${config.color}] shadow-[0_0_15px_${config.color}40]`
          : agent.status === 'completed'
          ? 'bg-[var(--bg-void)] border-[var(--terminal-green-dim)]'
          : 'bg-[var(--bg-void)] border-[var(--border-subtle)]'
      }`}
      style={isActive ? { borderColor: config.color, boxShadow: `0 0 15px ${config.color}40` } : {}}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-lg">{config.icon}</span>
        <div className="flex-1">
          <div className="font-mono font-bold text-[var(--text-primary)] text-sm">
            {agent.name}
          </div>
          <div className="text-xs font-mono" style={{ color: config.color }}>
            {config.label}
          </div>
        </div>
        <span
          className={`text-lg ${isActive || agent.status === 'running' ? 'animate-spin' : ''}`}
          style={{ color: statusColors[agent.status] }}
        >
          {statusIcons[agent.status]}
        </span>
      </div>

      {/* Description */}
      <div className="text-xs font-mono text-[var(--text-muted)] mb-2">
        {agent.description}
      </div>

      {/* Task */}
      {agent.task && (
        <div className="text-xs font-mono p-2 bg-[var(--bg-terminal)] rounded mb-2">
          <span className="text-[var(--amber)]">任务: </span>
          <span className="text-[var(--text-secondary)]">{agent.task}</span>
        </div>
      )}

      {/* Result */}
      {agent.result && (
        <div className="text-xs font-mono p-2 bg-[var(--terminal-green)]/10 rounded border border-[var(--terminal-green-dim)]">
          <span className="text-[var(--terminal-green)]">结果: </span>
          <span className="text-[var(--text-primary)]">{agent.result}</span>
        </div>
      )}

      {/* Tokens used */}
      {agent.tokens && (
        <div className="mt-2 text-xs font-mono text-[var(--text-muted)]">
          消耗: {agent.tokens} tokens
        </div>
      )}
    </div>
  );
}

// 层级可视化
function HierarchyDiagram({ activeType }: { activeType: SubagentType | null }) {
  return (
    <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[var(--purple)]">🏗️</span>
        <span className="text-sm font-mono font-bold text-[var(--text-primary)]">
          三层查找层级
        </span>
      </div>

      <div className="flex items-center justify-center gap-4">
        {(['project', 'user', 'builtin'] as SubagentType[]).map((type, i) => {
          const config = typeConfig[type];
          const isActive = activeType === type;

          return (
            <div key={type} className="flex items-center gap-4">
              <div
                className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                  isActive ? 'scale-110' : ''
                }`}
                style={{
                  backgroundColor: isActive ? `${config.color}20` : 'var(--bg-void)',
                  borderColor: isActive ? config.color : 'var(--border-subtle)',
                  boxShadow: isActive ? `0 0 20px ${config.color}40` : 'none',
                }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{config.icon}</div>
                  <div className="text-xs font-mono font-bold" style={{ color: config.color }}>
                    {config.label}
                  </div>
                  <div className="text-xs font-mono text-[var(--text-muted)]">
                    {type === 'project' && '.gemini/agents/'}
                    {type === 'user' && '~/.gemini/agents/'}
                    {type === 'builtin' && '内置定义'}
                  </div>
                </div>
                {isActive && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-[var(--terminal-green)] rounded-full flex items-center justify-center text-xs text-[var(--bg-void)]">
                    ✓
                  </div>
                )}
              </div>
              {i < 2 && (
                <span className="text-[var(--text-muted)] text-xl">→</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center mt-4 text-xs font-mono text-[var(--text-muted)]">
        查找顺序: project → user → builtin (优先使用更近层级的定义)
      </div>
    </div>
  );
}

// 动画阶段
type AnimationPhase =
  | 'idle'
  | 'receive_task'
  | 'lookup_hierarchy'
  | 'spawn_agents'
  | 'parallel_execution'
  | 'collect_results'
  | 'synthesize'
  | 'completed';

const phaseDescriptions: Record<AnimationPhase, string> = {
  idle: '等待任务分发...',
  receive_task: '接收到复杂任务，需要分解为子任务',
  lookup_hierarchy: '按层级查找可用的子代理定义',
  spawn_agents: '创建并初始化子代理实例',
  parallel_execution: '并行执行多个子代理任务',
  collect_results: '收集各子代理的执行结果',
  synthesize: '合成最终结果并返回给主代理',
  completed: '所有子代理任务完成',
};

const phaseCode: Record<AnimationPhase, string> = {
  idle: `// subagent-manager.ts - 子代理管理器
class SubagentManager {
  private builtinAgents: Map<string, SubagentDef>;
  private userAgents: Map<string, SubagentDef>;
  private projectAgents: Map<string, SubagentDef>;

  constructor() {
    this.loadBuiltinAgents();
    this.loadUserAgents();
    this.loadProjectAgents();
  }
}`,
  receive_task: `// subagent-manager.ts - 接收任务
async handleComplexTask(task: Task): Promise<Result> {
  // 分析任务复杂度
  const subtasks = this.decomposeTask(task);

  console.log(\`任务分解为 \${subtasks.length} 个子任务\`);

  // 为每个子任务分配合适的代理
  const assignments = subtasks.map(subtask => ({
    subtask,
    agent: this.findBestAgent(subtask.type),
  }));

  return this.executeAssignments(assignments);
}`,
  lookup_hierarchy: `// subagent-manager.ts - 层级查找
findAgent(name: string): SubagentDef | null {
  // 1. 优先查找项目级定义
  if (this.projectAgents.has(name)) {
    console.log(\`在 project 层找到: \${name}\`);
    return this.projectAgents.get(name)!;
  }

  // 2. 其次查找用户级定义
  if (this.userAgents.has(name)) {
    console.log(\`在 user 层找到: \${name}\`);
    return this.userAgents.get(name)!;
  }

  // 3. 最后查找内置定义
  if (this.builtinAgents.has(name)) {
    console.log(\`在 builtin 层找到: \${name}\`);
    return this.builtinAgents.get(name)!;
  }

  return null;
}`,
  spawn_agents: `// subagent.ts - 创建子代理实例
async spawnAgent(def: SubagentDef, task: string): Promise<Subagent> {
  const agent: Subagent = {
    id: generateId(),
    definition: def,
    status: 'spawning',
    task,
    context: this.createContext(def),
  };

  // 初始化代理
  await agent.initialize();

  // 设置资源限制
  agent.setTokenLimit(def.maxTokens || 4000);
  agent.setTimeout(def.timeout || 60000);

  this.activeAgents.set(agent.id, agent);

  return agent;
}`,
  parallel_execution: `// subagent-manager.ts - 并行执行
async executeParallel(agents: Subagent[]): Promise<Result[]> {
  // 使用 Promise.allSettled 确保所有代理都完成
  const results = await Promise.allSettled(
    agents.map(async (agent) => {
      agent.status = 'running';

      try {
        const result = await agent.execute();
        agent.status = 'completed';
        return result;
      } catch (error) {
        agent.status = 'error';
        throw error;
      }
    })
  );

  return results.map((r, i) => ({
    agent: agents[i].id,
    success: r.status === 'fulfilled',
    result: r.status === 'fulfilled' ? r.value : r.reason,
  }));
}`,
  collect_results: `// subagent-manager.ts - 收集结果
collectResults(execResults: ExecutionResult[]): CollectedResults {
  const successful = execResults.filter(r => r.success);
  const failed = execResults.filter(r => !r.success);

  return {
    successful: successful.map(r => ({
      agentId: r.agent,
      result: r.result,
      tokens: r.tokensUsed,
    })),
    failed: failed.map(r => ({
      agentId: r.agent,
      error: r.result,
    })),
    totalTokens: execResults.reduce((sum, r) => sum + (r.tokensUsed || 0), 0),
  };
}`,
  synthesize: `// subagent-manager.ts - 合成结果
async synthesizeResults(collected: CollectedResults): Promise<FinalResult> {
  // 使用主模型合成各子代理的结果
  const prompt = \`
请合成以下子代理的执行结果：

\${collected.successful.map(r => \`
## \${r.agentId}
\${r.result}
\`).join('\\n')}

请提供一个综合性的总结。
\`;

  const synthesis = await this.mainModel.generate(prompt);

  return {
    summary: synthesis,
    details: collected,
    totalTokens: collected.totalTokens,
  };
}`,
  completed: `// 执行完成后的结果结构
{
  summary: "代码审查通过，发现2个潜在问题已修复...",
  subagentResults: [
    { agent: "CodeReview", status: "completed", tokens: 1200 },
    { agent: "SecurityScanner", status: "completed", tokens: 850 },
    { agent: "TestGenerator", status: "completed", tokens: 1500 },
    { agent: "DocWriter", status: "completed", tokens: 980 },
    { agent: "Refactorer", status: "completed", tokens: 1100 },
  ],
  metrics: {
    totalAgents: 5,
    successRate: "100%",
    totalTokens: 5630,
    executionTime: "12.3s"
  }
}`,
};

export function SubagentAnimation() {
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [agents, setAgents] = useState<Subagent[]>(
    subagentDefinitions.map((def) => ({ ...def, status: 'idle' as SubagentStatus }))
  );
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<SubagentType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  const phases: AnimationPhase[] = [
    'idle',
    'receive_task',
    'lookup_hierarchy',
    'spawn_agents',
    'parallel_execution',
    'collect_results',
    'synthesize',
    'completed',
  ];

  const updateAgentsForPhase = useCallback((newPhase: AnimationPhase) => {
    switch (newPhase) {
      case 'receive_task':
        // Reset agents
        setAgents(subagentDefinitions.map((def) => ({ ...def, status: 'idle' as SubagentStatus })));
        break;
      case 'lookup_hierarchy':
        // Show hierarchy lookup animation
        setActiveType('project');
        setTimeout(() => setActiveType('user'), 600);
        setTimeout(() => setActiveType('builtin'), 1200);
        setTimeout(() => setActiveType(null), 1800);
        break;
      case 'spawn_agents':
        setAgents((prev) =>
          prev.map((a) => ({
            ...a,
            status: 'spawning' as SubagentStatus,
            task: '分析代码并提供建议',
          }))
        );
        break;
      case 'parallel_execution':
        setAgents((prev) =>
          prev.map((a) => ({
            ...a,
            status: 'running' as SubagentStatus,
          }))
        );
        // Simulate thinking
        setTimeout(() => {
          setAgents((prev) =>
            prev.map((a) => ({
              ...a,
              status: 'thinking' as SubagentStatus,
            }))
          );
        }, 800);
        break;
      case 'collect_results':
        setAgents((prev) =>
          prev.map((a) => ({
            ...a,
            status: 'completed' as SubagentStatus,
            result: getResultForAgent(a.id),
            tokens: getTokensForAgent(a.id),
          }))
        );
        break;
      case 'completed':
        // Already have results
        break;
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= phases.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const nextPhase = phases[nextStep];
      setPhase(nextPhase);
      updateAgentsForPhase(nextPhase);
    }, 2200);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, phases, updateAgentsForPhase]);

  const play = useCallback(() => {
    setPhase('idle');
    setCurrentStep(0);
    setAgents(subagentDefinitions.map((def) => ({ ...def, status: 'idle' as SubagentStatus })));
    setActiveAgentId(null);
    setActiveType(null);
    setIsPlaying(true);
  }, []);

  const stepForward = useCallback(() => {
    if (currentStep < phases.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const nextPhase = phases[nextStep];
      setPhase(nextPhase);
      updateAgentsForPhase(nextPhase);
    } else {
      setPhase('idle');
      setCurrentStep(0);
      setAgents(subagentDefinitions.map((def) => ({ ...def, status: 'idle' as SubagentStatus })));
    }
  }, [currentStep, phases, updateAgentsForPhase]);

  const reset = useCallback(() => {
    setPhase('idle');
    setCurrentStep(0);
    setAgents(subagentDefinitions.map((def) => ({ ...def, status: 'idle' as SubagentStatus })));
    setActiveAgentId(null);
    setActiveType(null);
    setIsPlaying(false);
  }, []);

  const totalTokens = useMemo(
    () => agents.reduce((sum, a) => sum + (a.tokens || 0), 0),
    [agents]
  );

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl p-8 border border-[var(--border-subtle)] relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--terminal-green)] via-[var(--cyber-blue)] to-[var(--amber)]" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[var(--purple)]">🤖</span>
        <h2 className="text-2xl font-mono font-bold text-[var(--text-primary)]">
          子代理系统
        </h2>
      </div>

      <p className="text-sm text-[var(--text-muted)] font-mono mb-6">
        // 复杂任务分解与并行子代理执行机制
      </p>

      {/* 介绍部分 */}
      <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

      {/* Controls */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={play}
          className="px-5 py-2.5 bg-[var(--terminal-green)] text-[var(--bg-void)] rounded-md font-mono font-bold hover:shadow-[0_0_15px_var(--terminal-green-glow)] transition-all cursor-pointer"
        >
          ▶ 播放执行流程
        </button>
        <button
          onClick={stepForward}
          className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-md font-mono font-bold border border-[var(--border-subtle)] hover:border-[var(--terminal-green-dim)] hover:text-[var(--terminal-green)] transition-all cursor-pointer"
        >
          ⏭ 下一步
        </button>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--amber)] rounded-md font-mono font-bold border border-[var(--border-subtle)] hover:border-[var(--amber-dim)] transition-all cursor-pointer"
        >
          ↺ 重置
        </button>
        {phase !== 'idle' && totalTokens > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-void)] rounded-md border border-[var(--border-subtle)]">
            <span className="text-xs font-mono text-[var(--text-muted)]">总消耗:</span>
            <span className="text-sm font-mono font-bold text-[var(--terminal-green)]">
              {totalTokens.toLocaleString()} tokens
            </span>
          </div>
        )}
      </div>

      {/* Hierarchy diagram */}
      <div className="mb-6">
        <HierarchyDiagram activeType={activeType} />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Agent cards */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--cyber-blue)]">🤖</span>
            <span className="text-sm font-mono font-bold text-[var(--text-primary)]">
              子代理列表
            </span>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {agents.map((agent) => (
              <SubagentCard
                key={agent.id}
                agent={agent}
                isActive={activeAgentId === agent.id}
              />
            ))}
          </div>
        </div>

        {/* Code panel */}
        <div className="bg-[var(--bg-void)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-2 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] flex items-center gap-2">
            <span className="text-[var(--terminal-green)]">$</span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {phase === 'idle' ? '子代理管理器' : phaseDescriptions[phase]}
            </span>
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto">
            <JsonBlock code={phaseCode[phase]} />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--border-subtle)]">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-[var(--terminal-green)] font-mono">$</span>
          <span className="text-[var(--text-secondary)] font-mono">
            阶段：
            <span className="text-[var(--terminal-green)] font-bold">{currentStep + 1}</span>
            /{phases.length}
          </span>
          {isPlaying && (
            <span className="text-[var(--amber)] font-mono text-sm animate-pulse">
              ● 执行中...
            </span>
          )}
        </div>
        <div className="font-mono text-sm text-[var(--text-primary)] pl-6">
          {phaseDescriptions[phase]}
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--terminal-green)] via-[var(--cyber-blue)] to-[var(--amber)] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / phases.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Key features */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--terminal-green-dim)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--terminal-green)]">⚡</span>
            <span className="text-sm font-mono font-bold text-[var(--terminal-green)]">并行执行</span>
          </div>
          <p className="text-xs font-mono text-[var(--text-muted)]">
            使用 Promise.allSettled 并行执行多个子代理
          </p>
        </div>
        <div className="p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--cyber-blue-dim)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--cyber-blue)]">🔒</span>
            <span className="text-sm font-mono font-bold text-[var(--cyber-blue)]">资源隔离</span>
          </div>
          <p className="text-xs font-mono text-[var(--text-muted)]">
            每个子代理有独立的 token 限制和超时设置
          </p>
        </div>
        <div className="p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--amber-dim)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--amber)]">🎯</span>
            <span className="text-sm font-mono font-bold text-[var(--amber)]">层级覆盖</span>
          </div>
          <p className="text-xs font-mono text-[var(--text-muted)]">
            项目级定义可覆盖用户级和内置定义
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getResultForAgent(id: string): string {
  const results: Record<string, string> = {
    'code-review': '代码质量良好，建议添加更多注释',
    'security': '未发现安全漏洞，建议启用 CSP',
    'test-gen': '已生成 15 个测试用例，覆盖率 85%',
    'docs': 'API 文档已生成，包含 23 个端点说明',
    'refactor': '建议提取 3 个公共组件，减少重复代码',
  };
  return results[id] || '执行完成';
}

function getTokensForAgent(id: string): number {
  const tokens: Record<string, number> = {
    'code-review': 1200,
    'security': 850,
    'test-gen': 1500,
    'docs': 980,
    'refactor': 1100,
  };
  return tokens[id] || 500;
}
