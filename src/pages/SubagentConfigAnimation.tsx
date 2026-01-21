import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// Subagent 层级
type SubagentLevel = 'project' | 'user' | 'builtin';

// 解析阶段
type ParsePhase =
  | 'init'
  | 'scan_project'
  | 'scan_user'
  | 'scan_builtin'
  | 'parse_markdown'
  | 'validate_schema'
  | 'resolve_tools'
  | 'build_cache'
  | 'notify_listeners'
  | 'complete';

// Subagent 配置
interface SubagentConfig {
  name: string;
  description: string;
  tools: string[];
  level: SubagentLevel;
  filePath: string;
}

// 解析状态
interface ParseState {
  phase: ParsePhase;
  currentLevel: SubagentLevel | null;
  projectAgents: SubagentConfig[];
  userAgents: SubagentConfig[];
  builtinAgents: SubagentConfig[];
  activeAgent: SubagentConfig | null;
  cacheStatus: 'empty' | 'building' | 'ready';
}

// 解析步骤
interface ParseStep {
  phase: ParsePhase;
  title: string;
  description: string;
  stateChange: Partial<ParseState>;
  codeSnippet: string;
}

// 示例 Subagent 配置
const sampleAgents: Record<SubagentLevel, SubagentConfig[]> = {
  project: [
    {
      name: 'api-reviewer',
      description: '审查 API 设计规范',
      tools: ['read_file', 'search_file_content'],
      level: 'project',
      filePath: '.gemini/agents/api-reviewer.md',
    },
  ],
  user: [
    {
      name: 'code-explainer',
      description: '解释代码逻辑',
      tools: ['read_file', 'google_web_search'],
      level: 'user',
      filePath: '~/.gemini/agents/code-explainer.md',
    },
    {
      name: 'api-reviewer',
      description: '用户级 API 审查器',
      tools: ['read_file'],
      level: 'user',
      filePath: '~/.gemini/agents/api-reviewer.md',
    },
  ],
  builtin: [
    {
      name: 'codebase_investigator',
      description: '深度理解代码库结构与依赖',
      tools: ['list_directory', 'read_file', 'glob', 'search_file_content'],
      level: 'builtin',
      filePath: 'builtin://codebase_investigator',
    },
    {
      name: 'cli_help',
      description: '回答关于 Gemini CLI 本身的问题（基于内部文档）',
      tools: ['get_internal_docs'],
      level: 'builtin',
      filePath: 'builtin://cli_help',
    },
    {
      name: 'generalist',
      description: '通用代理，继承主系统提示词并开放全部工具',
      tools: ['*'],
      level: 'builtin',
      filePath: 'builtin://generalist',
    },
  ],
};

// 解析流程
const parseSequence: ParseStep[] = [
  {
    phase: 'init',
    title: '初始化 AgentRegistry',
    description: '创建缓存结构，设置目录路径',
    stateChange: {
      cacheStatus: 'empty',
      projectAgents: [],
      userAgents: [],
      builtinAgents: [],
    },
    codeSnippet: `// registry.ts - AgentRegistry
class AgentRegistry {
  private readonly agents = new Map<string, AgentDefinition>();

  constructor(private readonly config: Config) {}

  async initialize(): Promise<void> {
    this.loadBuiltInAgents();

    // Load user-level agents: ~/.gemini/agents/
    const userAgentsDir = Storage.getUserAgentsDir();
    const userAgents = await loadAgentsFromDirectory(userAgentsDir);

    // Load project-level agents: .gemini/agents/
    const projectAgentsDir = this.config.storage.getProjectAgentsDir();
    const projectAgents = await loadAgentsFromDirectory(projectAgentsDir);
  }
}`,
  },
  {
    phase: 'scan_project',
    title: '扫描项目级配置',
    description: '读取 .gemini/agents/*.md 文件',
    stateChange: {
      currentLevel: 'project',
      projectAgents: sampleAgents.project,
    },
    codeSnippet: `// agentLoader.ts - loadAgentsFromDirectory
async function loadAgentsFromDirectory(dir: string): Promise<AgentLoadResult> {
  const result: AgentLoadResult = { agents: [], errors: [] };

  const dirEntries = await fs.readdir(dir, { withFileTypes: true });
  const mdFiles = dirEntries.filter(
    entry => entry.isFile() &&
    entry.name.endsWith('.md') &&
    !entry.name.startsWith('_')
  );

  for (const file of mdFiles) {
    const filePath = path.join(dir, file.name);
    const definitions = await parseAgentMarkdown(filePath);
    for (const def of definitions) {
      result.agents.push(markdownToAgentDefinition(def));
    }
  }

  return result;
}`,
  },
  {
    phase: 'scan_user',
    title: '扫描用户级配置',
    description: '读取 ~/.gemini/agents/*.md 文件',
    stateChange: {
      currentLevel: 'user',
      userAgents: sampleAgents.user,
    },
    codeSnippet: `// registry.ts - AgentRegistry.loadAgentsFromUserDir
async loadAgentsFromUserDir(): Promise<void> {
  const userAgentDir = Storage.getGlobalAgentsPath();

  const result = await loadAgentsFromDirectory(userAgentDir);

  // 注册用户级 Agent
  for (const agent of result.agents) {
    this.registerAgent(agent, 'user');
  }

  // 报告加载错误
  for (const error of result.errors) {
    coreEvents.emitFeedback('warning', error.message);
  }
}`,
  },
  {
    phase: 'scan_builtin',
    title: '加载内置 Agent',
    description: '从 BuiltinAgentRegistry 获取预定义 Agent',
    stateChange: {
      currentLevel: 'builtin',
      builtinAgents: sampleAgents.builtin,
    },
    codeSnippet: `// registry.ts - loadBuiltInAgents
private loadBuiltInAgents(): void {
  // CodebaseInvestigatorAgent - 用于代码库探索
  this.registerAgent(
    CodebaseInvestigatorAgent.getDefinition(this.config)
  );

  // CliHelpAgent - CLI 文档问答
  this.registerAgent(
    CliHelpAgent(this.config)
  );

  // GeneralistAgent - 通用代理（实验）
  this.registerAgent(
    GeneralistAgent(this.config)
  );
}

// codebase-investigator.ts
export class CodebaseInvestigatorAgent {
  static readonly agentName = 'CodebaseInvestigator';
  static getDefinition(config: Config): AgentDefinition {
    return {
      kind: 'local',
      name: this.agentName,
      description: 'Investigates the codebase...',
  },
};`,
  },
  {
    phase: 'parse_markdown',
    title: '解析 Markdown frontmatter',
    description: '解析 YAML frontmatter 并将正文作为 system_prompt',
    stateChange: {
      activeAgent: sampleAgents.project[0],
    },
    codeSnippet: `// agentLoader.ts - parseAgentMarkdown
async function parseAgentMarkdown(filePath: string): Promise<FrontmatterAgentDefinition[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const match = content.match(FRONTMATTER_REGEX);
  if (!match) {
    throw new AgentLoadError(filePath, 'Missing YAML frontmatter');
  }

  const rawFrontmatter = yaml.load(match[1]);
  const body = match[2] || '';

  const result = localAgentSchema.safeParse(rawFrontmatter);
  if (!result.success) {
    throw new AgentLoadError(filePath, formatZodError(result.error));
  }

  return [{ ...result.data, kind: 'local', system_prompt: body.trim() }];
}

// 转换为内部 AgentDefinition
function markdownToAgentDefinition(markdown: FrontmatterLocalAgentDefinition): AgentDefinition {
  return {
    kind: 'local',
    name: markdown.name,
    description: markdown.description,
    displayName: markdown.display_name,
    promptConfig: {
      systemPrompt: markdown.system_prompt,
      query: '\${query}',
    },
    modelConfig: {
      model: markdown.model || 'inherit',
      temp: markdown.temperature ?? 1,
    },
    runConfig: {
      max_turns: markdown.max_turns,
      max_time_minutes: markdown.timeout_mins || 5,
    },
    toolConfig: markdown.tools ? { tools: markdown.tools } : undefined,
  };
}`,
  },
  {
    phase: 'validate_schema',
    title: '验证配置 Schema',
    description: '检查必填字段和类型',
    stateChange: {},
    codeSnippet: `// agentLoader.ts - Zod Schema 验证
const localAgentSchema = z.object({
  kind: z.literal('local').optional().default('local'),
  name: z.string().regex(/^[a-z0-9-_]+$/),
  description: z.string().min(1),
  display_name: z.string().optional(),
  tools: z.array(z.string()).optional(),
  model: z.string().optional(),
  temperature: z.number().optional(),
  max_turns: z.number().optional(),
  timeout_mins: z.number().optional(),
}).strict();

// 验证并解析
const result = localAgentSchema.safeParse(rawFrontmatter);
if (!result.success) {
  throw new AgentLoadError(filePath, formatZodError(result.error));
}`,
  },
  {
    phase: 'resolve_tools',
    title: '解析工具名称',
    description: '将显示名映射到实际工具 ID',
    stateChange: {},
    codeSnippet: `// local-executor.ts - 工具解析
class LocalAgentExecutor {
  async execute(
    invocation: LocalAgentInvocation
  ): Promise<AgentExecutionResult> {
    // 获取 Agent 定义中的工具配置
    const toolConfig = invocation.definition.toolConfig;

    // 解析工具列表
    const resolvedTools = toolConfig?.tools?.map(toolName => {
      // 从 ToolRegistry 获取实际工具
      const tool = this.toolRegistry.getTool(toolName);
      if (!tool) {
        throw new Error(\`Tool not found: \${toolName}\`);
      }
      return tool;
    });

    // 构建工具声明发送给模型
    const declarations = resolvedTools?.map(
      tool => tool.schema
    );
  }
}

// 示例:
// "read_file" -> ReadFileTool
// "replace" -> EditTool`,
  },
  {
    phase: 'build_cache',
    title: '构建缓存',
    description: '按层级存储解析后的配置',
    stateChange: {
      cacheStatus: 'building',
    },
    codeSnippet: `// registry.ts - Agent 注册
async registerAgent<T extends z.ZodTypeAny>(
  definition: AgentDefinition<T>
): Promise<void> {
  // 检查名称冲突
  if (this.agents.has(definition.name)) {
    debugLogger.warn(
      \`Agent '\${definition.name}' already registered, overwriting\`
    );
  }

  // 注册到 Map
  this.agents.set(definition.name, definition);

  // 注册模型配置
  this.registerModelConfig(definition);
}

// 注册表结构:
// Map {
//   'api-reviewer' => { kind: 'local', name: 'api-reviewer', ... },
//   'CodebaseInvestigator' => { kind: 'local', ... },
// }`,
  },
  {
    phase: 'notify_listeners',
    title: '通知变更监听器',
    description: '触发 UI 更新和缓存失效',
    stateChange: {
      cacheStatus: 'ready',
    },
    codeSnippet: `// events.ts - CoreEvents 通知
coreEvents.on(CoreEvent.ModelChanged, () => {
  // 模型变更时刷新 Agent
  this.refreshAgents().catch((e) => {
    debugLogger.error(
      '[AgentRegistry] Failed to refresh agents:',
      e
    );
  });
});

// registry.ts - refreshAgents
async refreshAgents(): Promise<void> {
  // 清除并重新加载所有 Agent
  this.agents.clear();
  await this.initialize();
}`,
  },
  {
    phase: 'complete',
    title: '配置解析完成',
    description: '层级查找可用，支持名称遮蔽',
    stateChange: {
      currentLevel: null,
      activeAgent: null,
    },
    codeSnippet: `// registry.ts - getAgent
getAgent<T extends z.ZodTypeAny>(
  name: string
): AgentDefinition<T> | undefined {
  return this.agents.get(name) as AgentDefinition<T> | undefined;
}

// registry.ts - getAllAgents
getAllAgents(): AgentDefinition<z.ZodTypeAny>[] {
  return Array.from(this.agents.values());
}

// 层级优先级通过加载顺序实现:
// 1. 先加载 builtin (loadBuiltInAgents)
// 2. 再加载 user (会覆盖同名 builtin)
// 3. 最后加载 project (会覆盖同名 user 和 builtin)
}

// 遮蔽示例:
// loadSubagent('api-reviewer')
// → 返回 project 级别的配置 (遮蔽 user 级别)`,
  },
];

// 层级颜色
const levelColors: Record<SubagentLevel, string> = {
  project: 'var(--terminal-green)',
  user: 'var(--cyber-blue)',
  builtin: 'var(--purple)',
};

// 层级可视化
function LevelHierarchy({
  currentLevel,
  projectAgents,
  userAgents,
  builtinAgents,
}: {
  currentLevel: SubagentLevel | null;
  projectAgents: SubagentConfig[];
  userAgents: SubagentConfig[];
  builtinAgents: SubagentConfig[];
}) {
  const levels: { level: SubagentLevel; label: string; path: string; agents: SubagentConfig[] }[] = [
    { level: 'project', label: 'Project', path: '.gemini/agents/', agents: projectAgents },
    { level: 'user', label: 'User', path: '~/.gemini/agents/', agents: userAgents },
    { level: 'builtin', label: 'Builtin', path: 'builtin://', agents: builtinAgents },
  ];

  return (
    <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[var(--amber)]">📁</span>
        <span className="text-sm font-mono font-bold text-[var(--text-primary)]">层级结构</span>
      </div>

      <div className="space-y-4">
        {levels.map(({ level, label, path, agents }, i) => {
          const isActive = currentLevel === level;
          const color = levelColors[level];

          return (
            <div
              key={level}
              className={`
                p-3 rounded-lg border transition-all duration-300
                ${isActive ? 'ring-2 ring-offset-1 ring-offset-[var(--bg-terminal)]' : ''}
              `}
              style={{
                borderColor: isActive ? color : 'var(--border-subtle)',
                backgroundColor: isActive ? `${color}10` : 'transparent',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {i + 1}
                  </span>
                  <span className="font-bold text-sm" style={{ color }}>
                    {label}
                  </span>
                </div>
                <code className="text-xs text-[var(--text-muted)]">{path}</code>
              </div>

              {agents.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {agents.map((agent) => (
                    <span
                      key={agent.name}
                      className="px-2 py-0.5 rounded text-xs font-mono"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {agent.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-[var(--text-muted)]">(无配置)</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 遮蔽说明 */}
      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
        <div className="text-xs text-[var(--text-muted)]">
          <span className="text-[var(--amber)]">⚠</span> 同名 Agent 遵循遮蔽规则: Project &gt; User &gt; Builtin
        </div>
      </div>
    </div>
  );
}

// Markdown 配置解析可视化
function MarkdownConfigParser({ agent }: { agent: SubagentConfig | null }) {
  if (!agent) {
    return (
      <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)] text-center text-[var(--text-muted)]">
        选择一个 Agent 查看配置详情
      </div>
    );
  }

  const markdownConfig = `---
kind: local
name: ${agent.name}
description: ${agent.description}
tools:
${agent.tools.map((tool) => `  - ${tool}`).join('\n')}
---
You are a specialized agent...`;

  return (
    <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--purple)]">📄</span>
        <span className="text-sm font-mono font-bold text-[var(--text-primary)]">Markdown Configuration</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 原始文件 */}
        <div>
          <div className="text-xs text-[var(--text-muted)] mb-1">原始文件:</div>
          <pre className="p-2 rounded bg-black/30 text-xs font-mono text-[var(--text-secondary)] overflow-auto">
            {markdownConfig}
          </pre>
        </div>

        {/* 解析结果 */}
        <div>
          <div className="text-xs text-[var(--text-muted)] mb-1">解析结果:</div>
          <div className="p-2 rounded bg-black/30 text-xs font-mono space-y-1">
            <div>
              <span className="text-[var(--text-muted)]">name: </span>
              <span className="text-[var(--terminal-green)]">{agent.name}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">description: </span>
              <span className="text-[var(--cyber-blue)]">{agent.description}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">tools: </span>
              <span className="text-[var(--amber)]">[{agent.tools.join(', ')}]</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">level: </span>
              <span style={{ color: levelColors[agent.level] }}>{agent.level}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 主组件
export function SubagentConfigAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [parseState, setParseState] = useState<ParseState>({
    phase: 'init',
    currentLevel: null,
    projectAgents: [],
    userAgents: [],
    builtinAgents: [],
    activeAgent: null,
    cacheStatus: 'empty',
  });

  const currentStepData = parseSequence[currentStep];

  // 应用状态变化
  useEffect(() => {
    if (currentStepData) {
      setParseState((prev) => ({
        ...prev,
        phase: currentStepData.phase,
        ...currentStepData.stateChange,
      }));
    }
  }, [currentStep, currentStepData]);

  // 自动播放
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < parseSequence.length - 1) {
        setCurrentStep((s) => s + 1);
      } else {
        setIsPlaying(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePrev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
    setIsPlaying(false);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep((s) => Math.min(parseSequence.length - 1, s + 1));
    setIsPlaying(false);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setParseState({
      phase: 'init',
      currentLevel: null,
      projectAgents: [],
      userAgents: [],
      builtinAgents: [],
      activeAgent: null,
      cacheStatus: 'empty',
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Subagent 配置解析动画
        </h1>
        <p className="text-[var(--text-secondary)]">
          展示 Subagent 配置的三层解析流程：Project → User → Builtin，以及 Markdown frontmatter 配置解析
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-2 font-mono">
          核心代码: packages/core/src/agents/agentLoader.ts
        </p>
      </div>

      {/* 控制栏 */}
      <div className="flex items-center justify-between bg-[var(--bg-elevated)] rounded-lg p-3 border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded bg-[var(--bg-terminal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-sm"
          >
            ↺ 重置
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-3 py-1.5 rounded bg-[var(--bg-terminal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-sm disabled:opacity-50"
          >
            ← 上一步
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-1.5 rounded text-sm font-medium ${
              isPlaying
                ? 'bg-[var(--amber)]/20 text-[var(--amber)] border border-[var(--amber)]/50'
                : 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] border border-[var(--terminal-green)]/50'
            }`}
          >
            {isPlaying ? '⏸ 暂停' : '▶ 播放'}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === parseSequence.length - 1}
            className="px-3 py-1.5 rounded bg-[var(--bg-terminal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-sm disabled:opacity-50"
          >
            下一步 →
          </button>
        </div>

        {/* 缓存状态 */}
        <div
          className={`
            px-3 py-1.5 rounded text-xs font-mono
            ${parseState.cacheStatus === 'empty' ? 'bg-[var(--bg-terminal)] text-[var(--text-muted)]' : ''}
            ${parseState.cacheStatus === 'building' ? 'bg-[var(--amber)]/20 text-[var(--amber)]' : ''}
            ${parseState.cacheStatus === 'ready' ? 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)]' : ''}
          `}
        >
          Cache: {parseState.cacheStatus}
        </div>
      </div>

      {/* 当前步骤 */}
      <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--cyber-blue)]/20 flex items-center justify-center text-[var(--cyber-blue)] font-bold">
            {currentStep + 1}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {currentStepData?.title}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {currentStepData?.description}
            </p>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LevelHierarchy
          currentLevel={parseState.currentLevel}
          projectAgents={parseState.projectAgents}
          userAgents={parseState.userAgents}
          builtinAgents={parseState.builtinAgents}
        />
        <MarkdownConfigParser agent={parseState.activeAgent} />
      </div>

      {/* 代码 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[var(--purple)]">📄</span>
          <span className="text-sm font-mono font-bold text-[var(--text-primary)]">源码实现</span>
        </div>
        <JsonBlock code={currentStepData?.codeSnippet || ''} />
      </div>

      {/* 进度条 */}
      <div className="flex gap-1">
        {parseSequence.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= currentStep ? 'var(--cyber-blue)' : 'var(--bg-terminal)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
