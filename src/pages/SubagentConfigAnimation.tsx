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
  | 'parse_frontmatter'
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
      tools: ['read_file', 'search_code'],
      level: 'project',
      filePath: '.gemini/agents/api-reviewer.md',
    },
  ],
  user: [
    {
      name: 'code-explainer',
      description: '解释代码逻辑',
      tools: ['read_file', 'web_search'],
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
      name: 'Explore',
      description: '快速探索代码库',
      tools: ['glob', 'grep', 'read_file'],
      level: 'builtin',
      filePath: 'builtin://explore',
    },
    {
      name: 'Plan',
      description: '设计实现方案',
      tools: ['read_file', 'search_code', 'web_search'],
      level: 'builtin',
      filePath: 'builtin://plan',
    },
  ],
};

// 解析流程
const parseSequence: ParseStep[] = [
  {
    phase: 'init',
    title: '初始化 SubagentManager',
    description: '创建缓存结构，设置目录路径',
    stateChange: {
      cacheStatus: 'empty',
      projectAgents: [],
      userAgents: [],
      builtinAgents: [],
    },
    codeSnippet: `// subagent-manager.ts:40-60
class SubagentManager {
  private subagentsCache: Map<SubagentLevel, SubagentConfig[]>;
  private changeListeners: Set<() => void>;
  private projectDir: string;
  private userDir: string;

  constructor(workspaceDir: string) {
    this.subagentsCache = new Map();
    this.changeListeners = new Set();
    this.projectDir = path.join(workspaceDir, '.gemini/agents');
    this.userDir = path.join(os.homedir(), '.gemini/agents');
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
    codeSnippet: `// subagent-manager.ts:200-230
async listSubagentsAtLevel(level: SubagentLevel): Promise<SubagentConfig[]> {
  if (level === 'project') {
    const agentDir = path.join(this.workspaceDir, '.gemini/agents');

    if (!fs.existsSync(agentDir)) {
      return [];
    }

    const files = await fs.readdir(agentDir);
    const mdFiles = files.filter((f) => f.endsWith('.md'));

    const agents: SubagentConfig[] = [];
    for (const file of mdFiles) {
      const filePath = path.join(agentDir, file);
      const config = await this.parseSubagentFile(filePath, 'project');
      if (config) agents.push(config);
    }

    return agents;
  }
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
    codeSnippet: `// subagent-manager.ts:232-260
if (level === 'user') {
  const userAgentDir = path.join(os.homedir(), '.gemini/agents');

  if (!fs.existsSync(userAgentDir)) {
    return [];
  }

  const files = await fs.readdir(userAgentDir);
  const mdFiles = files.filter((f) => f.endsWith('.md'));

  const agents: SubagentConfig[] = [];
  for (const file of mdFiles) {
    const filePath = path.join(userAgentDir, file);
    const config = await this.parseSubagentFile(filePath, 'user');
    if (config) agents.push(config);
  }

  return agents;
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
    codeSnippet: `// subagent-manager.ts:262-280
if (level === 'builtin') {
  return BuiltinAgentRegistry.getAllBuiltinAgents();
}

// builtin-agents.ts
const BuiltinAgentRegistry = {
  agents: new Map<string, SubagentConfig>([
    ['Explore', { name: 'Explore', description: '...', tools: [...] }],
    ['Plan', { name: 'Plan', description: '...', tools: [...] }],
    ['general-purpose', { ... }],
    // ... 更多内置 agent
  ]),

  getAllBuiltinAgents(): SubagentConfig[] {
    return Array.from(this.agents.values());
  },
};`,
  },
  {
    phase: 'parse_frontmatter',
    title: '解析 YAML Frontmatter',
    description: '从 Markdown 文件提取配置和 System Prompt',
    stateChange: {
      activeAgent: sampleAgents.project[0],
    },
    codeSnippet: `// subagent-manager.ts:412-450
async parseSubagentFile(
  filePath: string,
  level: SubagentLevel
): Promise<SubagentConfig | null> {
  const content = await fs.readFile(filePath, 'utf-8');

  // 匹配 YAML frontmatter
  const frontmatterRegex = /^---\\n([\\s\\S]*?)\\n---\\n([\\s\\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    console.warn(\`Invalid subagent file: \${filePath}\`);
    return null;
  }

  const [, frontmatterYaml, systemPrompt] = match;

  // 解析 YAML
  const frontmatter = parseYaml(frontmatterYaml);

  return {
    name: frontmatter.name,
    description: frontmatter.description,
    tools: frontmatter.tools || [],
    systemPrompt: systemPrompt.trim(),
    filePath,
    level,
  };
}

// 示例 Markdown 文件:
// ---
// name: api-reviewer
// description: 审查 API 设计规范
// tools:
//   - read_file
//   - search_code
// ---
// You are an API design reviewer...`,
  },
  {
    phase: 'validate_schema',
    title: '验证配置 Schema',
    description: '检查必填字段和类型',
    stateChange: {},
    codeSnippet: `// subagent-manager.ts:452-480
function validateSubagentConfig(config: unknown): config is SubagentConfig {
  if (typeof config !== 'object' || config === null) {
    return false;
  }

  const c = config as Record<string, unknown>;

  // 必填字段
  if (typeof c.name !== 'string' || c.name.length === 0) {
    throw new Error('Subagent name is required');
  }

  if (typeof c.description !== 'string') {
    throw new Error('Subagent description is required');
  }

  // 可选字段类型检查
  if (c.tools !== undefined && !Array.isArray(c.tools)) {
    throw new Error('tools must be an array');
  }

  if (c.modelConfig !== undefined && typeof c.modelConfig !== 'object') {
    throw new Error('modelConfig must be an object');
  }

  return true;
}`,
  },
  {
    phase: 'resolve_tools',
    title: '解析工具名称',
    description: '将显示名映射到实际工具 ID',
    stateChange: {},
    codeSnippet: `// subagent-manager.ts:614-651
function resolveToolNames(
  toolNames: string[],
  toolRegistry: ToolRegistry
): string[] {
  const resolvedTools: string[] = [];

  for (const name of toolNames) {
    // 尝试精确匹配
    const exactMatch = toolRegistry.getToolByName(name);
    if (exactMatch) {
      resolvedTools.push(exactMatch.name);
      continue;
    }

    // 尝试显示名匹配
    const displayMatch = toolRegistry.getToolByDisplayName(name);
    if (displayMatch) {
      resolvedTools.push(displayMatch.name);
      continue;
    }

    // 保留原始名称 (允许前向引用)
    console.warn(\`Tool not found: \${name}, keeping as-is\`);
    resolvedTools.push(name);
  }

  return resolvedTools;
}

// 示例:
// "Read File" -> "read_file"
// "Search Code" -> "grep"`,
  },
  {
    phase: 'build_cache',
    title: '构建缓存',
    description: '按层级存储解析后的配置',
    stateChange: {
      cacheStatus: 'building',
    },
    codeSnippet: `// subagent-manager.ts:347-359
async refreshCache(): Promise<void> {
  const levels: SubagentLevel[] = ['project', 'user', 'builtin'];

  for (const level of levels) {
    const levelSubagents = await this.listSubagentsAtLevel(level);
    this.subagentsCache.set(level, levelSubagents);
  }

  // 缓存构建完成后通知监听器
  this.notifyChangeListeners();
}

// 缓存结构:
// Map {
//   'project' => [{ name: 'api-reviewer', ... }],
//   'user' => [{ name: 'code-explainer', ... }],
//   'builtin' => [{ name: 'Explore', ... }],
// }`,
  },
  {
    phase: 'notify_listeners',
    title: '通知变更监听器',
    description: '触发 UI 更新和缓存失效',
    stateChange: {
      cacheStatus: 'ready',
    },
    codeSnippet: `// subagent-manager.ts:57-62
private notifyChangeListeners(): void {
  for (const listener of this.changeListeners) {
    try {
      listener();
    } catch (error) {
      console.error('Error in subagent change listener:', error);
    }
  }
}

// 使用示例:
manager.addChangeListener(() => {
  // 刷新 UI 中的 subagent 列表
  refreshSubagentDropdown();
});`,
  },
  {
    phase: 'complete',
    title: '配置解析完成',
    description: '层级查找可用，支持名称遮蔽',
    stateChange: {
      currentLevel: null,
      activeAgent: null,
    },
    codeSnippet: `// subagent-manager.ts:134-161
async loadSubagent(
  name: string,
  level?: SubagentLevel
): Promise<SubagentConfig | null> {
  if (level) {
    // 指定层级查找
    return this.findSubagentByNameAtLevel(name, level);
  }

  // 层级优先级: project > user > builtin
  // (项目级配置遮蔽用户级和内置)

  const projectConfig = await this.findSubagentByNameAtLevel(name, 'project');
  if (projectConfig) return projectConfig;

  const userConfig = await this.findSubagentByNameAtLevel(name, 'user');
  if (userConfig) return userConfig;

  return BuiltinAgentRegistry.getBuiltinAgent(name);
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

// Frontmatter 解析可视化
function FrontmatterParser({ agent }: { agent: SubagentConfig | null }) {
  if (!agent) {
    return (
      <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)] text-center text-[var(--text-muted)]">
        选择一个 Agent 查看配置详情
      </div>
    );
  }

  const frontmatterYaml = `---
name: ${agent.name}
description: ${agent.description}
tools:
${agent.tools.map((t) => `  - ${t}`).join('\n')}
---`;

  return (
    <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--purple)]">📄</span>
        <span className="text-sm font-mono font-bold text-[var(--text-primary)]">YAML Frontmatter</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 原始文件 */}
        <div>
          <div className="text-xs text-[var(--text-muted)] mb-1">原始文件:</div>
          <pre className="p-2 rounded bg-black/30 text-xs font-mono text-[var(--text-secondary)] overflow-auto">
            {frontmatterYaml}
{'\n'}You are a specialized agent for reviewing API design...
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
          展示 Subagent 配置的三层解析流程：Project → User → Builtin，以及 YAML Frontmatter 解析
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-2 font-mono">
          核心代码: packages/core/src/subagents/subagent-manager.ts:40-799
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
        <FrontmatterParser agent={parseState.activeAgent} />
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
