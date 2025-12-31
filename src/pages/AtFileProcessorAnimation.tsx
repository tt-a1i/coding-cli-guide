import { useState, useCallback } from 'react';

/**
 * AtFileProcessor 动画
 *
 * 可视化 atFileProcessor.ts 的核心逻辑：
 * 1. @{...} 文件引用语法解析
 * 2. 文件路径提取与验证
 * 3. 文件内容读取
 * 4. 忽略规则检查 (.gitignore, .geminiignore)
 * 5. 内容注入到 Prompt
 *
 * 源码位置:
 * - packages/cli/src/services/prompt-processors/atFileProcessor.ts
 */

interface FileInjection {
  startIndex: number;
  endIndex: number;
  path: string;
  status: 'pending' | 'loading' | 'loaded' | 'ignored' | 'error';
  content?: string;
  error?: string;
}

interface ProcessStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
  detail?: string;
}

interface AnimationState {
  rawPrompt: string;
  injections: FileInjection[];
  currentStep: number;
  steps: ProcessStep[];
  finalPrompt: string;
  message: string;
}

const EXAMPLES = [
  {
    name: '单文件引用',
    prompt: '请分析这个文件:\n@{src/index.ts}',
  },
  {
    name: '多文件引用',
    prompt: '对比这两个文件的实现:\n\n文件1:\n@{src/utils/parser.ts}\n\n文件2:\n@{src/utils/formatter.ts}',
  },
  {
    name: '包含被忽略文件',
    prompt: '查看配置和环境变量:\n@{config.json}\n@{.env}',
  },
  {
    name: '文件不存在',
    prompt: '读取这个文件:\n@{src/nonexistent.ts}',
  },
];

// 模拟文件系统
const MOCK_FILES: Record<string, { content: string; ignored: boolean; ignoreReason?: string }> = {
  'src/index.ts': {
    content: `import { App } from './app';
import { config } from './config';

const app = new App(config);
app.start();

console.log('Application started');`,
    ignored: false,
  },
  'src/utils/parser.ts': {
    content: `export function parseJSON(input: string) {
  try {
    return JSON.parse(input);
  } catch (e) {
    return null;
  }
}`,
    ignored: false,
  },
  'src/utils/formatter.ts': {
    content: `export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}`,
    ignored: false,
  },
  'config.json': {
    content: `{
  "port": 3000,
  "debug": true,
  "logLevel": "info"
}`,
    ignored: false,
  },
  '.env': {
    content: 'API_KEY=xxx\nDATABASE_URL=xxx',
    ignored: true,
    ignoreReason: '.gitignore',
  },
};

export default function AtFileProcessorAnimation() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [state, setState] = useState<AnimationState>({
    rawPrompt: EXAMPLES[0].prompt,
    injections: [],
    currentStep: -1,
    steps: [
      { id: 'detect', label: '检测 @{} 语法', status: 'pending' },
      { id: 'extract', label: '提取文件路径', status: 'pending' },
      { id: 'check', label: '检查忽略规则', status: 'pending' },
      { id: 'read', label: '读取文件内容', status: 'pending' },
      { id: 'inject', label: '注入到 Prompt', status: 'pending' },
    ],
    finalPrompt: '',
    message: '选择示例后点击开始',
  });

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const extractFileInjections = (text: string): FileInjection[] => {
    const results: FileInjection[] = [];
    const regex = /@\{([^}]+)\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      results.push({
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        path: match[1],
        status: 'pending',
      });
    }

    return results;
  };

  const runAnimation = useCallback(async () => {
    setIsRunning(true);
    const example = EXAMPLES[selectedExample];

    // 重置状态
    setState(s => ({
      ...s,
      rawPrompt: example.prompt,
      injections: [],
      currentStep: 0,
      steps: s.steps.map(step => ({ ...step, status: 'pending', detail: undefined })),
      finalPrompt: '',
      message: '开始处理...',
    }));
    await sleep(500);

    // 步骤1: 检测语法
    setState(s => ({
      ...s,
      steps: s.steps.map((step, i) => i === 0 ? { ...step, status: 'active' } : step),
      message: '扫描 Prompt 中的 @{...} 语法',
    }));
    await sleep(800);

    const injections = extractFileInjections(example.prompt);

    if (injections.length === 0) {
      setState(s => ({
        ...s,
        steps: s.steps.map((step, i) => i === 0 ? { ...step, status: 'done', detail: '无文件引用' } : step),
        finalPrompt: example.prompt,
        currentStep: 4,
        message: '未找到 @{} 文件引用，返回原始 Prompt',
      }));
      setIsRunning(false);
      return;
    }

    setState(s => ({
      ...s,
      injections,
      steps: s.steps.map((step, i) => i === 0 ? { ...step, status: 'done', detail: `发现 ${injections.length} 个引用` } : step),
      message: `发现 ${injections.length} 个文件引用`,
    }));
    await sleep(600);

    // 步骤2: 提取文件路径
    setState(s => ({
      ...s,
      currentStep: 1,
      steps: s.steps.map((step, i) => i === 1 ? { ...step, status: 'active' } : step),
      message: '提取文件路径...',
    }));
    await sleep(600);

    setState(s => ({
      ...s,
      steps: s.steps.map((step, i) => i === 1 ? { ...step, status: 'done' } : step),
      message: '文件路径提取完成',
    }));
    await sleep(400);

    // 步骤3: 检查忽略规则
    setState(s => ({
      ...s,
      currentStep: 2,
      steps: s.steps.map((step, i) => i === 2 ? { ...step, status: 'active' } : step),
      message: '检查 .gitignore 和 .geminiignore 规则...',
    }));
    await sleep(800);

    // 更新每个注入的忽略状态
    const updatedInjections = injections.map(inj => {
      const file = MOCK_FILES[inj.path];
      if (file?.ignored) {
        return { ...inj, status: 'ignored' as const, error: `被 ${file.ignoreReason} 忽略` };
      }
      return inj;
    });

    const ignoredCount = updatedInjections.filter(i => i.status === 'ignored').length;
    setState(s => ({
      ...s,
      injections: updatedInjections,
      steps: s.steps.map((step, i) => i === 2 ? {
        ...step,
        status: 'done',
        detail: ignoredCount > 0 ? `${ignoredCount} 个文件被忽略` : '全部通过'
      } : step),
      message: ignoredCount > 0 ? `⚠️ ${ignoredCount} 个文件被忽略规则过滤` : '忽略规则检查通过',
    }));
    await sleep(600);

    // 步骤4: 读取文件内容
    setState(s => ({
      ...s,
      currentStep: 3,
      steps: s.steps.map((step, i) => i === 3 ? { ...step, status: 'active' } : step),
      message: '读取文件内容...',
    }));

    // 逐个读取文件
    for (let i = 0; i < updatedInjections.length; i++) {
      const inj = updatedInjections[i];
      if (inj.status === 'ignored') continue;

      setState(s => ({
        ...s,
        injections: s.injections.map((item, idx) =>
          idx === i ? { ...item, status: 'loading' } : item
        ),
        message: `读取: ${inj.path}`,
      }));
      await sleep(500);

      const file = MOCK_FILES[inj.path];
      if (file && !file.ignored) {
        updatedInjections[i] = { ...inj, status: 'loaded', content: file.content };
      } else {
        updatedInjections[i] = { ...inj, status: 'error', error: '文件不存在' };
      }

      setState(s => ({
        ...s,
        injections: updatedInjections.map((item) => ({ ...item })),
      }));
      await sleep(300);
    }

    const errorCount = updatedInjections.filter(i => i.status === 'error').length;
    const loadedCount = updatedInjections.filter(i => i.status === 'loaded').length;

    setState(s => ({
      ...s,
      steps: s.steps.map((step, i) => i === 3 ? {
        ...step,
        status: errorCount > 0 ? 'error' : 'done',
        detail: `${loadedCount} 成功${errorCount > 0 ? `, ${errorCount} 失败` : ''}`
      } : step),
      message: `文件读取完成: ${loadedCount} 成功, ${errorCount} 失败`,
    }));
    await sleep(600);

    // 步骤5: 注入到 Prompt
    setState(s => ({
      ...s,
      currentStep: 4,
      steps: s.steps.map((step, i) => i === 4 ? { ...step, status: 'active' } : step),
      message: '组装最终 Prompt...',
    }));
    await sleep(600);

    // 构建最终 Prompt
    let finalPrompt = '';
    let lastIndex = 0;

    for (const inj of updatedInjections) {
      // 添加注入点之前的文本
      finalPrompt += example.prompt.substring(lastIndex, inj.startIndex);

      if (inj.status === 'loaded' && inj.content) {
        // 添加文件内容
        finalPrompt += `\n\`\`\`${inj.path.split('.').pop()}\n// File: ${inj.path}\n${inj.content}\n\`\`\`\n`;
      } else if (inj.status === 'ignored') {
        // 保留原始占位符
        finalPrompt += example.prompt.substring(inj.startIndex, inj.endIndex);
      } else if (inj.status === 'error') {
        // 显示错误信息
        finalPrompt += `[错误: 无法读取 ${inj.path} - ${inj.error}]`;
      }

      lastIndex = inj.endIndex;
    }

    // 添加剩余文本
    finalPrompt += example.prompt.substring(lastIndex);

    setState(s => ({
      ...s,
      finalPrompt,
      steps: s.steps.map((step, i) => i === 4 ? { ...step, status: 'done' } : step),
      message: '✅ 处理完成！',
    }));

    setIsRunning(false);
  }, [selectedExample]);

  const handleExampleChange = (index: number) => {
    setSelectedExample(index);
    const example = EXAMPLES[index];
    setState(s => ({
      ...s,
      rawPrompt: example.prompt,
      injections: [],
      currentStep: -1,
      steps: s.steps.map(step => ({ ...step, status: 'pending', detail: undefined })),
      finalPrompt: '',
      message: '选择示例后点击开始',
    }));
  };

  const getStatusIcon = (status: FileInjection['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'loading': return '🔄';
      case 'loaded': return '✅';
      case 'ignored': return '🚫';
      case 'error': return '❌';
    }
  };

  const getStatusColor = (status: FileInjection['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-400';
      case 'loading': return 'text-cyan-400';
      case 'loaded': return 'text-green-400';
      case 'ignored': return 'text-yellow-400';
      case 'error': return 'text-red-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-white mb-2">@File 处理器动画</h1>
        <p className="text-gray-400 text-sm">
          可视化 AtFileProcessor: @&#123;path&#125; 语法解析、忽略规则检查、文件内容注入
        </p>
        <p className="text-gray-500 text-xs mt-1">
          源码: packages/cli/src/services/prompt-processors/atFileProcessor.ts
        </p>
      </div>

      {/* 控制面板 */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">示例:</span>
          <select
            value={selectedExample}
            onChange={(e) => handleExampleChange(Number(e.target.value))}
            disabled={isRunning}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white"
          >
            {EXAMPLES.map((ex, i) => (
              <option key={i} value={i}>{ex.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={runAnimation}
          disabled={isRunning}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            isRunning
              ? 'bg-gray-600 cursor-not-allowed text-gray-400'
              : 'bg-cyan-600 hover:bg-cyan-700 text-white'
          }`}
        >
          {isRunning ? '处理中...' : '开始演示'}
        </button>
      </div>

      {/* 处理步骤 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <h3 className="text-white font-semibold mb-4">处理流程</h3>
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {state.steps.map((step, i, arr) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-300 min-w-[100px] ${
                step.status === 'active'
                  ? 'bg-cyan-600/30 border-2 border-cyan-500'
                  : step.status === 'done'
                  ? 'bg-green-600/20 border border-green-600'
                  : step.status === 'error'
                  ? 'bg-red-600/20 border border-red-600'
                  : 'bg-gray-800 border border-gray-700'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                  step.status === 'active' ? 'bg-cyan-500 text-black' :
                  step.status === 'done' ? 'bg-green-500 text-black' :
                  step.status === 'error' ? 'bg-red-500 text-white' :
                  'bg-gray-700 text-gray-400'
                }`}>{i + 1}</span>
                <span className="text-xs text-white text-center">{step.label}</span>
                {step.detail && (
                  <span className="text-xs text-gray-400 mt-1">{step.detail}</span>
                )}
              </div>
              {i < arr.length - 1 && (
                <div className={`w-6 h-0.5 mx-1 ${
                  step.status === 'done' || step.status === 'error' ? 'bg-gray-600' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-cyan-300 text-sm font-mono">{state.message}</div>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧: 原始 Prompt 和文件列表 */}
        <div className="space-y-4">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              原始 Prompt
            </h3>
            <pre className="text-sm bg-gray-800 p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {state.rawPrompt.split(/(@\{[^}]+\})/g).map((part, i) => {
                if (part.match(/^@\{.+\}$/)) {
                  return <span key={i} className="text-cyan-400 bg-cyan-900/30 px-1 rounded">{part}</span>;
                }
                return <span key={i} className="text-gray-300">{part}</span>;
              })}
            </pre>
          </div>

          {/* 文件引用列表 */}
          {state.injections.length > 0 && (
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                文件引用 ({state.injections.length})
              </h3>
              <div className="space-y-2">
                {state.injections.map((inj, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded border transition-all duration-300 ${
                      inj.status === 'loading'
                        ? 'border-cyan-500 bg-cyan-900/20'
                        : inj.status === 'loaded'
                        ? 'border-green-600 bg-green-900/20'
                        : inj.status === 'ignored'
                        ? 'border-yellow-600 bg-yellow-900/20'
                        : inj.status === 'error'
                        ? 'border-red-600 bg-red-900/20'
                        : 'border-gray-700 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={getStatusColor(inj.status)}>{getStatusIcon(inj.status)}</span>
                        <span className="text-white font-mono text-sm">{inj.path}</span>
                      </div>
                      <span className={`text-xs ${getStatusColor(inj.status)}`}>
                        {inj.status === 'loading' ? '加载中...' :
                         inj.status === 'loaded' ? `${inj.content?.split('\n').length} 行` :
                         inj.status === 'ignored' ? inj.error :
                         inj.status === 'error' ? inj.error : '待处理'}
                      </span>
                    </div>
                    {inj.status === 'loaded' && inj.content && (
                      <pre className="mt-2 text-xs bg-gray-800 p-2 rounded text-gray-400 max-h-24 overflow-y-auto">
                        {inj.content.substring(0, 200)}
                        {inj.content.length > 200 && '...'}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧: 最终 Prompt */}
        <div className="space-y-4">
          {state.finalPrompt && (
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                最终 Prompt
              </h3>
              <pre className="text-sm bg-gray-800 p-3 rounded overflow-x-auto text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {state.finalPrompt}
              </pre>
            </div>
          )}

          {/* 模拟文件系统 */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              模拟文件系统
            </h3>
            <div className="space-y-1 text-sm font-mono">
              {Object.entries(MOCK_FILES).map(([path, file]) => (
                <div key={path} className="flex items-center gap-2 p-1">
                  <span className={file.ignored ? 'text-gray-500' : 'text-gray-400'}>
                    {file.ignored ? '🚫' : '📄'}
                  </span>
                  <span className={file.ignored ? 'text-gray-500 line-through' : 'text-gray-300'}>
                    {path}
                  </span>
                  {file.ignored && (
                    <span className="text-xs text-yellow-500">({file.ignoreReason})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 语法和规则说明 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <h3 className="text-white font-semibold mb-3">语法说明</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-gray-800 rounded">
              <div className="text-cyan-400 font-mono mb-2">@&#123;path/to/file&#125;</div>
              <div className="text-gray-400">
                文件注入触发器。花括号内指定相对于项目根目录的文件路径。
              </div>
            </div>
            <div className="text-gray-400 text-xs">
              支持的文件类型: 所有文本文件 (代码、配置、文档等)
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <h3 className="text-white font-semibold mb-3">忽略规则</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">⚠️</span>
              <span className="text-gray-300">.gitignore 匹配的文件会被跳过</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">⚠️</span>
              <span className="text-gray-300">.geminiignore 匹配的文件会被跳过</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">ℹ️</span>
              <span className="text-gray-300">被忽略的文件会在 UI 中显示提示信息</span>
            </div>
          </div>
        </div>
      </div>

      {/* 核心代码 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <h3 className="text-white font-semibold mb-3">核心处理逻辑</h3>
        <pre className="text-xs text-gray-300 overflow-x-auto bg-gray-800 p-3 rounded">
{`async process(input, context) {
  return flatMapTextParts(input, async (text) => {
    // 检查是否包含触发器
    if (!text.includes(AT_FILE_INJECTION_TRIGGER)) {
      return [{ text }];
    }

    // 提取注入点
    const injections = extractInjections(text, AT_FILE_INJECTION_TRIGGER);

    const output = [];
    for (const injection of injections) {
      try {
        // 读取文件内容 (遵循忽略规则)
        const fileContentParts = await readPathFromWorkspace(pathStr, config);

        if (fileContentParts.length === 0) {
          // 文件被忽略
          context.ui.addItem({ type: MessageType.INFO, text: uiMessage });
        }

        output.push(...fileContentParts);
      } catch (error) {
        // 读取失败
        context.ui.addItem({ type: MessageType.ERROR, text: errorMessage });
        output.push({ text: placeholder });
      }
    }

    return output;
  });
}`}
        </pre>
      </div>
    </div>
  );
}
