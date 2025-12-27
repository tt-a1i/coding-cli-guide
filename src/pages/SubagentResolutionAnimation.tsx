import { useState, useCallback } from 'react';

type SubagentLevel = 'project' | 'user' | 'builtin';

interface SubagentConfig {
  name: string;
  level: SubagentLevel;
  description: string;
  tools?: string[];
  systemPrompt: string;
  isBuiltin?: boolean;
}

interface ResolutionStep {
  level: SubagentLevel;
  found: boolean;
  config?: SubagentConfig;
  message: string;
}

// Sample subagent configurations at different levels
const PROJECT_AGENTS: SubagentConfig[] = [
  { name: 'code-reviewer', level: 'project', description: '项目级代码审查专家', tools: ['Read', 'Grep'], systemPrompt: '你是项目专属的代码审查专家...' },
  { name: 'test-runner', level: 'project', description: '项目测试运行器', tools: ['Bash'], systemPrompt: '你是测试执行专家...' },
];

const USER_AGENTS: SubagentConfig[] = [
  { name: 'code-reviewer', level: 'user', description: '用户级代码审查', tools: ['Read'], systemPrompt: '你是用户自定义的代码审查助手...' },
  { name: 'doc-writer', level: 'user', description: '文档编写助手', tools: ['Write', 'Read'], systemPrompt: '你是技术文档专家...' },
  { name: 'git-helper', level: 'user', description: 'Git 操作助手', tools: ['Bash'], systemPrompt: '你是 Git 工作流专家...' },
];

const BUILTIN_AGENTS: SubagentConfig[] = [
  { name: 'code-reviewer', level: 'builtin', description: '内置代码审查', tools: ['Read', 'Grep', 'Glob'], systemPrompt: '你是 Claude 的代码审查专家...', isBuiltin: true },
  { name: 'explorer', level: 'builtin', description: '代码库探索器', tools: ['Read', 'Grep', 'Glob', 'Bash'], systemPrompt: '你是代码库探索专家...', isBuiltin: true },
  { name: 'doc-writer', level: 'builtin', description: '内置文档助手', tools: ['Write', 'Read'], systemPrompt: '你是文档编写专家...', isBuiltin: true },
];

const LEVEL_CONFIG = {
  project: { color: 'cyan', icon: '📁', label: 'Project Level', path: '.innies/agents/' },
  user: { color: 'purple', icon: '👤', label: 'User Level', path: '~/.innies/agents/' },
  builtin: { color: 'green', icon: '⚙️', label: 'Builtin', path: '<builtin>' },
};

export default function SubagentResolutionAnimation() {
  const [searchName, setSearchName] = useState('code-reviewer');
  const [searchLevel, setSearchLevel] = useState<SubagentLevel | 'auto'>('auto');
  const [isResolving, setIsResolving] = useState(false);
  const [steps, setSteps] = useState<ResolutionStep[]>([]);
  const [result, setResult] = useState<SubagentConfig | null>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [allAgents, setAllAgents] = useState<{ project: SubagentConfig[]; user: SubagentConfig[]; builtin: SubagentConfig[] }>({
    project: PROJECT_AGENTS,
    user: USER_AGENTS,
    builtin: BUILTIN_AGENTS,
  });

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const resolveSubagent = useCallback(async () => {
    setIsResolving(true);
    setSteps([]);
    setResult(null);
    setCurrentStep(-1);

    const newSteps: ResolutionStep[] = [];
    let found: SubagentConfig | null = null;

    const levels: SubagentLevel[] = searchLevel === 'auto'
      ? ['project', 'user', 'builtin']
      : [searchLevel];

    for (let i = 0; i < levels.length && !found; i++) {
      const level = levels[i];
      setCurrentStep(i);
      await sleep(800);

      let agents: SubagentConfig[] = [];
      if (level === 'project') agents = allAgents.project;
      else if (level === 'user') agents = allAgents.user;
      else agents = allAgents.builtin;

      const agent = agents.find(a => a.name === searchName);

      if (agent) {
        newSteps.push({
          level,
          found: true,
          config: agent,
          message: `✓ 在 ${LEVEL_CONFIG[level].label} 找到 "${searchName}"`,
        });
        found = agent;
      } else {
        newSteps.push({
          level,
          found: false,
          message: `✗ ${LEVEL_CONFIG[level].label} 未找到 "${searchName}"`,
        });
      }

      setSteps([...newSteps]);
    }

    if (!found && searchLevel === 'auto') {
      newSteps.push({
        level: 'builtin',
        found: false,
        message: `✗ 所有级别都未找到 "${searchName}"`,
      });
      setSteps([...newSteps]);
    }

    setResult(found);
    setCurrentStep(-1);
    setIsResolving(false);
  }, [searchName, searchLevel, allAgents]);

  const toggleAgent = (level: SubagentLevel, name: string) => {
    setAllAgents(prev => {
      const agents = [...prev[level]];
      const index = agents.findIndex(a => a.name === name);
      if (index !== -1) {
        agents.splice(index, 1);
      } else {
        // Add back the original
        const original = level === 'project' ? PROJECT_AGENTS :
                         level === 'user' ? USER_AGENTS : BUILTIN_AGENTS;
        const agent = original.find(a => a.name === name);
        if (agent) agents.push(agent);
      }
      return { ...prev, [level]: agents };
    });
  };

  const renderAgentCard = (agent: SubagentConfig, highlighted: boolean = false) => (
    <div
      key={`${agent.level}-${agent.name}`}
      className={`p-3 rounded-lg border transition-all duration-300 ${
        highlighted
          ? 'border-yellow-400 bg-yellow-500/20 scale-105 shadow-lg shadow-yellow-500/20'
          : `border-${LEVEL_CONFIG[agent.level].color}-500/30 bg-${LEVEL_CONFIG[agent.level].color}-500/10`
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-mono text-sm text-white flex items-center gap-2">
            <span>{agent.name}</span>
            {agent.isBuiltin && <span className="text-xs bg-green-500/30 px-1 rounded">内置</span>}
          </div>
          <div className="text-xs text-gray-400 mt-1">{agent.description}</div>
        </div>
        {agent.tools && (
          <div className="flex gap-1 flex-wrap justify-end">
            {agent.tools.map(tool => (
              <span key={tool} className="text-xs bg-gray-700 px-1 rounded">{tool}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
          SubagentManager 优先级解析
        </h1>
        <p className="text-gray-400 mb-6">
          演示 Subagent 配置的三级优先级解析: Project → User → Builtin
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level Columns */}
          {(['project', 'user', 'builtin'] as SubagentLevel[]).map((level, levelIndex) => {
            const config = LEVEL_CONFIG[level];
            const agents = allAgents[level];
            const isCurrentStep = currentStep === levelIndex && searchLevel === 'auto';
            const originalAgents = level === 'project' ? PROJECT_AGENTS :
                                   level === 'user' ? USER_AGENTS : BUILTIN_AGENTS;

            return (
              <div
                key={level}
                className={`bg-black/40 backdrop-blur border rounded-xl p-4 transition-all duration-500 ${
                  isCurrentStep
                    ? `border-${config.color}-400 ring-2 ring-${config.color}-400/50`
                    : `border-${config.color}-500/30`
                }`}
                style={{
                  borderColor: isCurrentStep ?
                    (level === 'project' ? '#22d3ee' : level === 'user' ? '#a855f7' : '#22c55e') :
                    undefined,
                  boxShadow: isCurrentStep ?
                    `0 0 20px ${level === 'project' ? '#22d3ee33' : level === 'user' ? '#a855f733' : '#22c55e33'}` :
                    undefined
                }}
              >
                <h3 className={`font-bold mb-3 flex items-center gap-2`}
                    style={{ color: level === 'project' ? '#22d3ee' : level === 'user' ? '#a855f7' : '#22c55e' }}>
                  <span className="text-xl">{config.icon}</span>
                  <span>{config.label}</span>
                  {isCurrentStep && <span className="animate-pulse">🔍</span>}
                </h3>
                <div className="text-xs text-gray-500 mb-3 font-mono">{config.path}</div>

                <div className="space-y-2 mb-4">
                  {agents.length === 0 ? (
                    <div className="text-gray-600 text-center py-4 border border-dashed border-gray-700 rounded-lg">
                      无 Agent
                    </div>
                  ) : (
                    agents.map(agent => renderAgentCard(
                      agent,
                      result?.level === level && result?.name === agent.name
                    ))
                  )}
                </div>

                {/* Toggle Agents */}
                <div className="border-t border-gray-700 pt-3">
                  <div className="text-xs text-gray-500 mb-2">切换 Agent:</div>
                  <div className="flex flex-wrap gap-1">
                    {originalAgents.map(agent => {
                      const exists = agents.some(a => a.name === agent.name);
                      return (
                        <button
                          key={agent.name}
                          onClick={() => toggleAgent(level, agent.name)}
                          className={`text-xs px-2 py-1 rounded transition-all ${
                            exists
                              ? 'bg-gray-600 text-white'
                              : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                          }`}
                        >
                          {exists ? '✓' : '+'} {agent.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resolution Control */}
        <div className="mt-6 bg-black/40 backdrop-blur border border-orange-500/30 rounded-xl p-4">
          <h3 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
            <span className="text-xl">🔍</span> 解析 Subagent
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Agent 名称</label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                placeholder="agent name"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">搜索级别</label>
              <select
                value={searchLevel}
                onChange={(e) => setSearchLevel(e.target.value as SubagentLevel | 'auto')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="auto">自动 (Project → User → Builtin)</option>
                <option value="project">仅 Project</option>
                <option value="user">仅 User</option>
                <option value="builtin">仅 Builtin</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={resolveSubagent}
                disabled={isResolving || !searchName}
                className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isResolving ? '🔄 解析中...' : '🚀 loadSubagent()'}
              </button>
            </div>
          </div>
        </div>

        {/* Resolution Steps */}
        {steps.length > 0 && (
          <div className="mt-6 bg-black/40 backdrop-blur border border-blue-500/30 rounded-xl p-4">
            <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">📋</span> 解析步骤
            </h3>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    step.found
                      ? 'border-green-500/30 bg-green-500/10'
                      : 'border-gray-700 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={step.found ? 'text-green-400' : 'text-gray-500'}>
                      {step.found ? '✓' : '✗'}
                    </span>
                    <span className="text-sm">{step.message}</span>
                  </div>
                  {step.config && (
                    <div className="mt-2 p-2 bg-black/30 rounded text-xs">
                      <pre className="text-gray-400 overflow-x-auto">
{JSON.stringify({
  name: step.config.name,
  level: step.config.level,
  description: step.config.description,
  tools: step.config.tools,
}, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 bg-black/40 backdrop-blur border border-green-500/30 rounded-xl p-4">
            <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">✅</span> 解析结果
            </h3>
            <pre className="text-sm text-gray-300 overflow-x-auto">
{JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Code Reference */}
        <div className="mt-6 bg-black/40 backdrop-blur border border-purple-500/30 rounded-xl p-4">
          <h3 className="text-purple-400 font-bold mb-3">📄 源码参考</h3>
          <pre className="text-xs text-gray-400 overflow-x-auto">
{`// packages/core/src/subagents/subagent-manager.ts

async loadSubagent(name: string, level?: SubagentLevel): Promise<SubagentConfig | null> {
  if (level) {
    // 指定级别时只搜索该级别
    return this.findSubagentByNameAtLevel(name, level);
  }

  // 按优先级搜索: project → user → builtin
  const projectConfig = await this.findSubagentByNameAtLevel(name, 'project');
  if (projectConfig) return projectConfig;

  const userConfig = await this.findSubagentByNameAtLevel(name, 'user');
  if (userConfig) return userConfig;

  return BuiltinAgentRegistry.getBuiltinAgent(name);
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
