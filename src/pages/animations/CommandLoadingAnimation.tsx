import { useState, useEffect, useCallback } from 'react';
import { Layer } from '../../components/Layer';
import { MermaidDiagram } from '../../components/MermaidDiagram';
import { HighlightBox } from '../../components/HighlightBox';

interface Command {
  name: string;
  source: 'builtin' | 'user' | 'project' | 'extension';
  extensionName?: string;
  status: 'pending' | 'loading' | 'loaded' | 'conflict' | 'renamed';
  finalName?: string;
}

interface LoaderState {
  name: string;
  type: 'builtin' | 'user' | 'project' | 'extension';
  status: 'pending' | 'loading' | 'fulfilled' | 'rejected';
  commands: Command[];
}

interface ProcessingStep {
  id: number;
  phase: 'parallel-load' | 'aggregate' | 'conflict-detect' | 'rename' | 'complete';
  description: string;
  loaders: LoaderState[];
  commandMap: Map<string, Command>;
  currentAction?: string;
}

export function CommandLoadingAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500);

  const initialLoaders: LoaderState[] = [
    {
      name: 'BuiltinCommandLoader',
      type: 'builtin',
      status: 'pending',
      commands: [
        { name: 'help', source: 'builtin', status: 'pending' },
        { name: 'clear', source: 'builtin', status: 'pending' },
        { name: 'config', source: 'builtin', status: 'pending' },
        { name: 'compact', source: 'builtin', status: 'pending' },
      ],
    },
    {
      name: 'FileCommandLoader (user)',
      type: 'user',
      status: 'pending',
      commands: [
        { name: 'commit', source: 'user', status: 'pending' },
        { name: 'review', source: 'user', status: 'pending' },
      ],
    },
    {
      name: 'FileCommandLoader (project)',
      type: 'project',
      status: 'pending',
      commands: [
        { name: 'deploy', source: 'project', status: 'pending' },
        { name: 'test', source: 'project', status: 'pending' },
      ],
    },
    {
      name: 'ExtensionCommandLoader',
      type: 'extension',
      status: 'pending',
      commands: [
        { name: 'help', source: 'extension', extensionName: 'my-ext', status: 'pending' },
        { name: 'deploy', source: 'extension', extensionName: 'k8s', status: 'pending' },
        { name: 'deploy', source: 'extension', extensionName: 'docker', status: 'pending' },
        { name: 'lint', source: 'extension', extensionName: 'eslint', status: 'pending' },
      ],
    },
  ];

  const steps: ProcessingStep[] = [
    {
      id: 0,
      phase: 'parallel-load',
      description: '启动所有 Loaders 并行加载',
      loaders: initialLoaders.map(l => ({ ...l, status: 'loading' as const, commands: l.commands.map(c => ({ ...c, status: 'loading' as const })) })),
      commandMap: new Map(),
    },
    {
      id: 1,
      phase: 'parallel-load',
      description: 'Promise.allSettled() 等待所有 Loaders 完成',
      loaders: initialLoaders.map(l => ({ ...l, status: 'fulfilled' as const, commands: l.commands.map(c => ({ ...c, status: 'loaded' as const })) })),
      commandMap: new Map(),
      currentAction: 'await Promise.allSettled(loaders.map(l => l.loadCommands()))',
    },
    {
      id: 2,
      phase: 'aggregate',
      description: '聚合所有成功加载的命令',
      loaders: initialLoaders.map(l => ({ ...l, status: 'fulfilled' as const, commands: l.commands.map(c => ({ ...c, status: 'loaded' as const })) })),
      commandMap: new Map(),
      currentAction: 'allCommands.push(...result.value)',
    },
    {
      id: 3,
      phase: 'conflict-detect',
      description: '处理内置命令: help, clear, config, compact',
      loaders: initialLoaders.map(l => ({ ...l, status: 'fulfilled' as const, commands: l.commands.map(c => ({ ...c, status: 'loaded' as const })) })),
      commandMap: new Map([
        ['help', { name: 'help', source: 'builtin' as const, status: 'loaded' as const }],
        ['clear', { name: 'clear', source: 'builtin' as const, status: 'loaded' as const }],
        ['config', { name: 'config', source: 'builtin' as const, status: 'loaded' as const }],
        ['compact', { name: 'compact', source: 'builtin' as const, status: 'loaded' as const }],
      ]),
    },
    {
      id: 4,
      phase: 'conflict-detect',
      description: '处理用户命令: commit, review',
      loaders: initialLoaders.map(l => ({ ...l, status: 'fulfilled' as const, commands: l.commands.map(c => ({ ...c, status: 'loaded' as const })) })),
      commandMap: new Map([
        ['help', { name: 'help', source: 'builtin' as const, status: 'loaded' as const }],
        ['clear', { name: 'clear', source: 'builtin' as const, status: 'loaded' as const }],
        ['config', { name: 'config', source: 'builtin' as const, status: 'loaded' as const }],
        ['compact', { name: 'compact', source: 'builtin' as const, status: 'loaded' as const }],
        ['commit', { name: 'commit', source: 'user' as const, status: 'loaded' as const }],
        ['review', { name: 'review', source: 'user' as const, status: 'loaded' as const }],
      ]),
    },
    {
      id: 5,
      phase: 'conflict-detect',
      description: '处理项目命令: deploy, test',
      loaders: initialLoaders.map(l => ({ ...l, status: 'fulfilled' as const, commands: l.commands.map(c => ({ ...c, status: 'loaded' as const })) })),
      commandMap: new Map([
        ['help', { name: 'help', source: 'builtin' as const, status: 'loaded' as const }],
        ['clear', { name: 'clear', source: 'builtin' as const, status: 'loaded' as const }],
        ['config', { name: 'config', source: 'builtin' as const, status: 'loaded' as const }],
        ['compact', { name: 'compact', source: 'builtin' as const, status: 'loaded' as const }],
        ['commit', { name: 'commit', source: 'user' as const, status: 'loaded' as const }],
        ['review', { name: 'review', source: 'user' as const, status: 'loaded' as const }],
        ['deploy', { name: 'deploy', source: 'project' as const, status: 'loaded' as const }],
        ['test', { name: 'test', source: 'project' as const, status: 'loaded' as const }],
      ]),
    },
    {
      id: 6,
      phase: 'rename',
      description: '⚠️ 检测到冲突: 扩展命令 "help" 与内置命令冲突',
      loaders: initialLoaders.map(l => ({ ...l, status: 'fulfilled' as const, commands: l.commands.map(c => ({ ...c, status: c.name === 'help' && c.source === 'extension' ? 'conflict' as const : 'loaded' as const })) })),
      commandMap: new Map([
        ['help', { name: 'help', source: 'builtin' as const, status: 'loaded' as const }],
        ['clear', { name: 'clear', source: 'builtin' as const, status: 'loaded' as const }],
        ['config', { name: 'config', source: 'builtin' as const, status: 'loaded' as const }],
        ['compact', { name: 'compact', source: 'builtin' as const, status: 'loaded' as const }],
        ['commit', { name: 'commit', source: 'user' as const, status: 'loaded' as const }],
        ['review', { name: 'review', source: 'user' as const, status: 'loaded' as const }],
        ['deploy', { name: 'deploy', source: 'project' as const, status: 'loaded' as const }],
        ['test', { name: 'test', source: 'project' as const, status: 'loaded' as const }],
      ]),
      currentAction: 'if (cmd.extensionName && commandMap.has(cmd.name))',
    },
    {
      id: 7,
      phase: 'rename',
      description: '重命名: "help" → "my-ext.help"',
      loaders: initialLoaders.map(l => ({ ...l, status: 'fulfilled' as const, commands: l.commands.map(c => ({ ...c, status: c.name === 'help' && c.source === 'extension' ? 'renamed' as const : 'loaded' as const, finalName: c.name === 'help' && c.source === 'extension' ? 'my-ext.help' : undefined })) })),
      commandMap: new Map([
        ['help', { name: 'help', source: 'builtin' as const, status: 'loaded' as const }],
        ['clear', { name: 'clear', source: 'builtin' as const, status: 'loaded' as const }],
        ['config', { name: 'config', source: 'builtin' as const, status: 'loaded' as const }],
        ['compact', { name: 'compact', source: 'builtin' as const, status: 'loaded' as const }],
        ['commit', { name: 'commit', source: 'user' as const, status: 'loaded' as const }],
        ['review', { name: 'review', source: 'user' as const, status: 'loaded' as const }],
        ['deploy', { name: 'deploy', source: 'project' as const, status: 'loaded' as const }],
        ['test', { name: 'test', source: 'project' as const, status: 'loaded' as const }],
        ['my-ext.help', { name: 'my-ext.help', source: 'extension' as const, extensionName: 'my-ext', status: 'renamed' as const }],
      ]),
      currentAction: 'renamedName = `${cmd.extensionName}.${cmd.name}`',
    },
    {
      id: 8,
      phase: 'rename',
      description: '⚠️ 检测到冲突: k8s 扩展的 "deploy" 与项目命令冲突',
      loaders: initialLoaders.map(l => ({ ...l, status: 'fulfilled' as const, commands: l.commands.map(c => {
        if (c.name === 'deploy' && c.extensionName === 'k8s') return { ...c, status: 'conflict' as const };
        if (c.name === 'help' && c.source === 'extension') return { ...c, status: 'renamed' as const, finalName: 'my-ext.help' };
        return { ...c, status: 'loaded' as const };
      }) })),
      commandMap: new Map([
        ['help', { name: 'help', source: 'builtin' as const, status: 'loaded' as const }],
        ['clear', { name: 'clear', source: 'builtin' as const, status: 'loaded' as const }],
        ['config', { name: 'config', source: 'builtin' as const, status: 'loaded' as const }],
        ['compact', { name: 'compact', source: 'builtin' as const, status: 'loaded' as const }],
        ['commit', { name: 'commit', source: 'user' as const, status: 'loaded' as const }],
        ['review', { name: 'review', source: 'user' as const, status: 'loaded' as const }],
        ['deploy', { name: 'deploy', source: 'project' as const, status: 'loaded' as const }],
        ['test', { name: 'test', source: 'project' as const, status: 'loaded' as const }],
        ['my-ext.help', { name: 'my-ext.help', source: 'extension' as const, extensionName: 'my-ext', status: 'renamed' as const }],
      ]),
    },
    {
      id: 9,
      phase: 'rename',
      description: '重命名: k8s "deploy" → "k8s.deploy"',
      loaders: initialLoaders.map(l => ({ ...l, status: 'fulfilled' as const, commands: l.commands.map(c => {
        if (c.name === 'deploy' && c.extensionName === 'k8s') return { ...c, status: 'renamed' as const, finalName: 'k8s.deploy' };
        if (c.name === 'help' && c.source === 'extension') return { ...c, status: 'renamed' as const, finalName: 'my-ext.help' };
        return { ...c, status: 'loaded' as const };
      }) })),
      commandMap: new Map([
        ['help', { name: 'help', source: 'builtin' as const, status: 'loaded' as const }],
        ['clear', { name: 'clear', source: 'builtin' as const, status: 'loaded' as const }],
        ['config', { name: 'config', source: 'builtin' as const, status: 'loaded' as const }],
        ['compact', { name: 'compact', source: 'builtin' as const, status: 'loaded' as const }],
        ['commit', { name: 'commit', source: 'user' as const, status: 'loaded' as const }],
        ['review', { name: 'review', source: 'user' as const, status: 'loaded' as const }],
        ['deploy', { name: 'deploy', source: 'project' as const, status: 'loaded' as const }],
        ['test', { name: 'test', source: 'project' as const, status: 'loaded' as const }],
        ['my-ext.help', { name: 'my-ext.help', source: 'extension' as const, extensionName: 'my-ext', status: 'renamed' as const }],
        ['k8s.deploy', { name: 'k8s.deploy', source: 'extension' as const, extensionName: 'k8s', status: 'renamed' as const }],
      ]),
    },
    {
      id: 10,
      phase: 'rename',
      description: '⚠️ 检测到冲突: docker 扩展的 "deploy" 与项目命令冲突',
      loaders: initialLoaders.map(l => ({ ...l, status: 'fulfilled' as const, commands: l.commands.map(c => {
        if (c.name === 'deploy' && c.extensionName === 'docker') return { ...c, status: 'conflict' as const };
        if (c.name === 'deploy' && c.extensionName === 'k8s') return { ...c, status: 'renamed' as const, finalName: 'k8s.deploy' };
        if (c.name === 'help' && c.source === 'extension') return { ...c, status: 'renamed' as const, finalName: 'my-ext.help' };
        return { ...c, status: 'loaded' as const };
      }) })),
      commandMap: new Map([
        ['help', { name: 'help', source: 'builtin' as const, status: 'loaded' as const }],
        ['clear', { name: 'clear', source: 'builtin' as const, status: 'loaded' as const }],
        ['config', { name: 'config', source: 'builtin' as const, status: 'loaded' as const }],
        ['compact', { name: 'compact', source: 'builtin' as const, status: 'loaded' as const }],
        ['commit', { name: 'commit', source: 'user' as const, status: 'loaded' as const }],
        ['review', { name: 'review', source: 'user' as const, status: 'loaded' as const }],
        ['deploy', { name: 'deploy', source: 'project' as const, status: 'loaded' as const }],
        ['test', { name: 'test', source: 'project' as const, status: 'loaded' as const }],
        ['my-ext.help', { name: 'my-ext.help', source: 'extension' as const, extensionName: 'my-ext', status: 'renamed' as const }],
        ['k8s.deploy', { name: 'k8s.deploy', source: 'extension' as const, extensionName: 'k8s', status: 'renamed' as const }],
      ]),
    },
    {
      id: 11,
      phase: 'rename',
      description: '重命名: docker "deploy" → "docker.deploy"',
      loaders: initialLoaders.map(l => ({ ...l, status: 'fulfilled' as const, commands: l.commands.map(c => {
        if (c.name === 'deploy' && c.extensionName === 'docker') return { ...c, status: 'renamed' as const, finalName: 'docker.deploy' };
        if (c.name === 'deploy' && c.extensionName === 'k8s') return { ...c, status: 'renamed' as const, finalName: 'k8s.deploy' };
        if (c.name === 'help' && c.source === 'extension') return { ...c, status: 'renamed' as const, finalName: 'my-ext.help' };
        return { ...c, status: 'loaded' as const };
      }) })),
      commandMap: new Map([
        ['help', { name: 'help', source: 'builtin' as const, status: 'loaded' as const }],
        ['clear', { name: 'clear', source: 'builtin' as const, status: 'loaded' as const }],
        ['config', { name: 'config', source: 'builtin' as const, status: 'loaded' as const }],
        ['compact', { name: 'compact', source: 'builtin' as const, status: 'loaded' as const }],
        ['commit', { name: 'commit', source: 'user' as const, status: 'loaded' as const }],
        ['review', { name: 'review', source: 'user' as const, status: 'loaded' as const }],
        ['deploy', { name: 'deploy', source: 'project' as const, status: 'loaded' as const }],
        ['test', { name: 'test', source: 'project' as const, status: 'loaded' as const }],
        ['my-ext.help', { name: 'my-ext.help', source: 'extension' as const, extensionName: 'my-ext', status: 'renamed' as const }],
        ['k8s.deploy', { name: 'k8s.deploy', source: 'extension' as const, extensionName: 'k8s', status: 'renamed' as const }],
        ['docker.deploy', { name: 'docker.deploy', source: 'extension' as const, extensionName: 'docker', status: 'renamed' as const }],
      ]),
    },
    {
      id: 12,
      phase: 'complete',
      description: '添加无冲突的扩展命令: eslint.lint',
      loaders: initialLoaders.map(l => ({ ...l, status: 'fulfilled' as const, commands: l.commands.map(c => {
        if (c.name === 'deploy' && c.extensionName === 'docker') return { ...c, status: 'renamed' as const, finalName: 'docker.deploy' };
        if (c.name === 'deploy' && c.extensionName === 'k8s') return { ...c, status: 'renamed' as const, finalName: 'k8s.deploy' };
        if (c.name === 'help' && c.source === 'extension') return { ...c, status: 'renamed' as const, finalName: 'my-ext.help' };
        return { ...c, status: 'loaded' as const };
      }) })),
      commandMap: new Map([
        ['help', { name: 'help', source: 'builtin' as const, status: 'loaded' as const }],
        ['clear', { name: 'clear', source: 'builtin' as const, status: 'loaded' as const }],
        ['config', { name: 'config', source: 'builtin' as const, status: 'loaded' as const }],
        ['compact', { name: 'compact', source: 'builtin' as const, status: 'loaded' as const }],
        ['commit', { name: 'commit', source: 'user' as const, status: 'loaded' as const }],
        ['review', { name: 'review', source: 'user' as const, status: 'loaded' as const }],
        ['deploy', { name: 'deploy', source: 'project' as const, status: 'loaded' as const }],
        ['test', { name: 'test', source: 'project' as const, status: 'loaded' as const }],
        ['my-ext.help', { name: 'my-ext.help', source: 'extension' as const, extensionName: 'my-ext', status: 'renamed' as const }],
        ['k8s.deploy', { name: 'k8s.deploy', source: 'extension' as const, extensionName: 'k8s', status: 'renamed' as const }],
        ['docker.deploy', { name: 'docker.deploy', source: 'extension' as const, extensionName: 'docker', status: 'renamed' as const }],
        ['lint', { name: 'lint', source: 'extension' as const, extensionName: 'eslint', status: 'loaded' as const }],
      ]),
    },
    {
      id: 13,
      phase: 'complete',
      description: '✅ 命令加载完成! Object.freeze() 锁定命令列表',
      loaders: initialLoaders.map(l => ({ ...l, status: 'fulfilled' as const, commands: l.commands.map(c => {
        if (c.name === 'deploy' && c.extensionName === 'docker') return { ...c, status: 'renamed' as const, finalName: 'docker.deploy' };
        if (c.name === 'deploy' && c.extensionName === 'k8s') return { ...c, status: 'renamed' as const, finalName: 'k8s.deploy' };
        if (c.name === 'help' && c.source === 'extension') return { ...c, status: 'renamed' as const, finalName: 'my-ext.help' };
        return { ...c, status: 'loaded' as const };
      }) })),
      commandMap: new Map([
        ['help', { name: 'help', source: 'builtin' as const, status: 'loaded' as const }],
        ['clear', { name: 'clear', source: 'builtin' as const, status: 'loaded' as const }],
        ['config', { name: 'config', source: 'builtin' as const, status: 'loaded' as const }],
        ['compact', { name: 'compact', source: 'builtin' as const, status: 'loaded' as const }],
        ['commit', { name: 'commit', source: 'user' as const, status: 'loaded' as const }],
        ['review', { name: 'review', source: 'user' as const, status: 'loaded' as const }],
        ['deploy', { name: 'deploy', source: 'project' as const, status: 'loaded' as const }],
        ['test', { name: 'test', source: 'project' as const, status: 'loaded' as const }],
        ['my-ext.help', { name: 'my-ext.help', source: 'extension' as const, extensionName: 'my-ext', status: 'renamed' as const }],
        ['k8s.deploy', { name: 'k8s.deploy', source: 'extension' as const, extensionName: 'k8s', status: 'renamed' as const }],
        ['docker.deploy', { name: 'docker.deploy', source: 'extension' as const, extensionName: 'docker', status: 'renamed' as const }],
        ['lint', { name: 'lint', source: 'extension' as const, extensionName: 'eslint', status: 'loaded' as const }],
      ]),
      currentAction: 'Object.freeze(Array.from(commandMap.values()))',
    },
  ];

  const step = steps[currentStep];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, speed, steps.length]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'builtin': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'user': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'project': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'extension': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'loading': return '🔄';
      case 'fulfilled':
      case 'loaded': return '✅';
      case 'rejected': return '❌';
      case 'conflict': return '⚠️';
      case 'renamed': return '🔀';
      default: return '•';
    }
  };

  const loadingDiagram = `
sequenceDiagram
    participant CS as CommandService
    participant BL as BuiltinLoader
    participant FL as FileLoader
    participant EL as ExtensionLoader

    CS->>+BL: loadCommands()
    CS->>+FL: loadCommands()
    CS->>+EL: loadCommands()

    Note over CS,EL: Promise.allSettled() 并行执行

    BL-->>-CS: [help, clear, config...]
    FL-->>-CS: [commit, review, deploy...]
    EL-->>-CS: [ext.help, ext.deploy...]

    CS->>CS: 聚合所有命令
    CS->>CS: 检测冲突
    CS->>CS: 重命名扩展命令
    CS->>CS: Object.freeze()
`;

  const conflictResolutionDiagram = `
flowchart TD
    A["接收命令: cmd"] --> B{是扩展命令?}
    B -->|否| C{已存在同名?}
    B -->|是| D{已存在同名?}
    C -->|否| E["commandMap.set(name, cmd)"]
    C -->|是| F["覆盖: 后者优先"]
    D -->|否| E
    D -->|是| G["renamedName = ext.name"]
    G --> H{renamedName 存在?}
    H -->|是| I["renamedName = ext.name + suffix++"]
    I --> H
    H -->|否| J["commandMap.set(renamedName, cmd)"]

    style G fill:#f59e0b,color:#000
    style I fill:#ef4444,color:#fff
    style E fill:#22c55e,color:#000
`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📦</span>
        <div>
          <h1 className="text-2xl font-bold text-[var(--terminal-green)]">
            Command Loading & Conflict Resolution
          </h1>
          <p className="text-[var(--text-secondary)]">
            并行加载与命名冲突处理
          </p>
        </div>
      </div>

      {/* Introduction */}
      <HighlightBox title="📚 机制介绍" variant="blue">
        <p className="mb-3">
          CommandService 使用<strong>提供者模式</strong>从多个来源加载斜杠命令。
          它通过 <code>Promise.allSettled()</code> 并行执行所有 Loaders，
          然后聚合结果并解决命名冲突。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className={`p-3 rounded-lg border ${getSourceColor('builtin')}`}>
            <div className="font-bold mb-1">Builtin</div>
            <div className="text-xs opacity-80">内置命令 (最高优先)</div>
          </div>
          <div className={`p-3 rounded-lg border ${getSourceColor('user')}`}>
            <div className="font-bold mb-1">User</div>
            <div className="text-xs opacity-80">用户级 ~/.gemini/commands/</div>
          </div>
          <div className={`p-3 rounded-lg border ${getSourceColor('project')}`}>
            <div className="font-bold mb-1">Project</div>
            <div className="text-xs opacity-80">项目级 .gemini/commands/</div>
          </div>
          <div className={`p-3 rounded-lg border ${getSourceColor('extension')}`}>
            <div className="font-bold mb-1">Extension</div>
            <div className="text-xs opacity-80">扩展命令 (需要重命名)</div>
          </div>
        </div>
      </HighlightBox>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-[var(--terminal-green)] text-black font-bold rounded hover:opacity-80"
        >
          {isPlaying ? '⏸ 暂停' : '▶️ 播放'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded hover:opacity-80"
        >
          🔄 重置
        </button>
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-3 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded disabled:opacity-50"
        >
          ◀ 上一步
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="px-3 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded disabled:opacity-50"
        >
          下一步 ▶
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-secondary)]">速度:</span>
          <input
            type="range"
            min="500"
            max="3000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-[var(--text-secondary)]">{speed}ms</span>
        </div>
        <div className="ml-auto text-[var(--text-secondary)]">
          步骤: {currentStep + 1} / {steps.length}
        </div>
      </div>

      {/* Current Step */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Loaders Status */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-primary)]">
          <h3 className="text-lg font-bold text-[var(--terminal-green)] mb-4">
            🔌 命令加载器状态
          </h3>

          <div className="space-y-4">
            {step.loaders.map((loader, idx) => (
              <div key={idx} className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm">{loader.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    loader.status === 'fulfilled' ? 'bg-green-500/20 text-green-400' :
                    loader.status === 'loading' ? 'bg-blue-500/20 text-blue-400' :
                    loader.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {getStatusIcon(loader.status)} {loader.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {loader.commands.map((cmd, cidx) => (
                    <div
                      key={cidx}
                      className={`px-2 py-1 rounded text-xs border ${getSourceColor(cmd.source)} ${
                        cmd.status === 'conflict' ? 'ring-2 ring-yellow-500 animate-pulse' :
                        cmd.status === 'renamed' ? 'ring-2 ring-orange-500' : ''
                      }`}
                    >
                      {getStatusIcon(cmd.status)}{' '}
                      {cmd.finalName || cmd.name}
                      {cmd.extensionName && !cmd.finalName && <span className="opacity-60"> ({cmd.extensionName})</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Command Map */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-primary)]">
          <h3 className="text-lg font-bold text-purple-400 mb-4">
            🗺️ commandMap 最终结果
          </h3>

          <div className="bg-[var(--bg-terminal)] p-4 rounded-lg mb-4">
            <div className="text-sm text-[var(--text-secondary)] mb-2">当前阶段:</div>
            <div className={`font-bold ${
              step.phase === 'complete' ? 'text-green-400' :
              step.phase === 'rename' ? 'text-orange-400' :
              step.phase === 'conflict-detect' ? 'text-yellow-400' :
              'text-blue-400'
            }`}>
              {step.phase.toUpperCase()}
            </div>
            <div className="text-sm mt-2">{step.description}</div>
            {step.currentAction && (
              <div className="mt-2 font-mono text-xs text-cyan-400 bg-[var(--bg-secondary)] p-2 rounded">
                {step.currentAction}
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {Array.from(step.commandMap.entries()).map(([name, cmd]) => (
              <div
                key={name}
                className={`flex items-center gap-3 p-2 rounded-lg border ${getSourceColor(cmd.source)}`}
              >
                <span className="font-mono font-bold flex-1">{name}</span>
                <span className="text-xs opacity-60">{cmd.source}</span>
                {cmd.status === 'renamed' && (
                  <span className="text-xs bg-orange-500/30 px-2 py-0.5 rounded">重命名</span>
                )}
              </div>
            ))}
            {step.commandMap.size === 0 && (
              <div className="text-[var(--text-secondary)] italic p-4 text-center">
                Map 为空
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border-primary)] text-sm text-[var(--text-secondary)]">
            命令总数: <span className="text-[var(--terminal-green)] font-bold">{step.commandMap.size}</span>
          </div>
        </div>
      </div>

      {/* Sequence Diagram */}
      <Layer title="⏱️ 加载时序" icon="📊">
        <MermaidDiagram chart={loadingDiagram} />
      </Layer>

      {/* Conflict Resolution Flow */}
      <Layer title="🔀 冲突解决流程" icon="⚙️">
        <MermaidDiagram chart={conflictResolutionDiagram} />
      </Layer>

      {/* Code Explanation */}
      <Layer title="💡 核心实现" icon="📝">
        <div className="bg-[var(--bg-terminal)] p-4 rounded-lg">
          <pre className="text-sm overflow-x-auto">
{`// CommandService.create() 核心逻辑

// 1. 并行加载所有 Loaders
const results = await Promise.allSettled(
  loaders.map((loader) => loader.loadCommands(signal))
);

// 2. 聚合成功加载的命令
const allCommands: SlashCommand[] = [];
for (const result of results) {
  if (result.status === 'fulfilled') {
    allCommands.push(...result.value);
  }
}

// 3. 处理冲突
const commandMap = new Map<string, SlashCommand>();
for (const cmd of allCommands) {
  let finalName = cmd.name;

  // 扩展命令冲突时重命名
  if (cmd.extensionName && commandMap.has(cmd.name)) {
    let renamedName = \`\${cmd.extensionName}.\${cmd.name}\`;
    let suffix = 1;

    // 持续尝试直到找到不冲突的名称
    while (commandMap.has(renamedName)) {
      renamedName = \`\${cmd.extensionName}.\${cmd.name}\${suffix}\`;
      suffix++;
    }

    finalName = renamedName;
  }

  commandMap.set(finalName, { ...cmd, name: finalName });
}

// 4. 冻结并返回
const finalCommands = Object.freeze(Array.from(commandMap.values()));
return new CommandService(finalCommands);`}
          </pre>
        </div>
      </Layer>

      {/* Design Rationale */}
      <HighlightBox title="🧠 设计考量" variant="green">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-[var(--terminal-green)] mb-2">为什么用 Promise.allSettled?</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              不同于 <code>Promise.all</code>，<code>allSettled</code> 不会因为单个 Loader 失败而中断。
              这确保了即使某个扩展加载失败，其他命令仍然可用。
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[var(--terminal-green)] mb-2">为什么只重命名扩展命令?</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              内置、用户、项目命令优先级递增，后者可以覆盖前者。
              扩展命令优先级最低，需要通过重命名来保留所有功能。
            </p>
          </div>
        </div>
      </HighlightBox>
    </div>
  );
}
