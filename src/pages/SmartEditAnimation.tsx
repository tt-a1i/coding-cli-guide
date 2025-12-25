// @ts-nocheck - visualData uses Record<string, unknown> which causes strict type issues
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 替换策略
type ReplacementStrategy = 'exact' | 'flexible' | 'regex' | 'llm_fix' | 'failed';

// 处理阶段
type EditPhase =
  | 'init'
  | 'read_file'
  | 'exact_match'
  | 'flexible_match'
  | 'regex_match'
  | 'llm_fix'
  | 'apply_edit'
  | 'complete';

interface EditStep {
  id: string;
  phase: EditPhase;
  title: string;
  description: string;
  strategy?: ReplacementStrategy;
  codeSnippet: string;
  highlight?: string;
  visualData?: Record<string, unknown>;
}

// 步骤序列
const editStepSequence: EditStep[] = [
  {
    id: 'init',
    phase: 'init',
    title: '1. 初始化编辑请求',
    description: '接收编辑参数：file_path, old_string, new_string, instruction',
    codeSnippet: `// smart-edit.ts - 编辑请求初始化
interface EditToolParams {
  file_path: string;      // 目标文件路径
  old_string: string;     // 要替换的文本
  new_string: string;     // 替换后的文本
  instruction: string;    // 编辑说明
  modified_by_user?: boolean;
}

// 创建替换上下文
const context: ReplacementContext = {
  params,
  currentContent,
  abortSignal
};`,
    highlight: '多策略替换引擎',
    visualData: {
      params: {
        file_path: '/src/utils/helper.ts',
        old_string: 'const x = 1;',
        new_string: 'const x = 2;',
        instruction: '更新变量值'
      }
    }
  },
  {
    id: 'read_file',
    phase: 'read_file',
    title: '2. 读取文件内容',
    description: '读取目标文件，检测行尾格式，规范化换行符',
    codeSnippet: `// smart-edit.ts:446 - 读取并规范化文件
let currentContent = await this.config
  .getFileSystemService()
  .readTextFile(params.file_path);

// 检测原始行尾格式 (CRLF or LF)
originalLineEnding = detectLineEnding(currentContent);

// 统一转换为 LF 进行处理
currentContent = currentContent.replace(/\\r\\n/g, '\\n');

function detectLineEnding(content: string): '\\r\\n' | '\\n' {
  return content.includes('\\r\\n') ? '\\r\\n' : '\\n';
}`,
    highlight: '行尾格式检测',
    visualData: {
      originalEnding: 'CRLF (Windows)',
      normalizedEnding: 'LF (Unix)',
      fileSize: '2.4 KB'
    }
  },
  {
    id: 'exact_match',
    phase: 'exact_match',
    title: '3. 策略一：精确匹配',
    description: '尝试精确字符串匹配，最快但最严格',
    strategy: 'exact',
    codeSnippet: `// smart-edit.ts:72 - 精确匹配策略
async function calculateExactReplacement(
  context: ReplacementContext
): Promise<ReplacementResult | null> {
  const { currentContent, params } = context;
  const { old_string, new_string } = params;

  // 规范化换行符
  const normalizedSearch = old_string.replace(/\\r\\n/g, '\\n');
  const normalizedReplace = new_string.replace(/\\r\\n/g, '\\n');

  // 计算精确出现次数
  const exactOccurrences =
    normalizedCode.split(normalizedSearch).length - 1;

  if (exactOccurrences > 0) {
    // 使用安全的字面量替换
    let modifiedCode = safeLiteralReplace(
      normalizedCode,
      normalizedSearch,
      normalizedReplace,
    );
    return { newContent: modifiedCode, occurrences: exactOccurrences };
  }

  return null; // 精确匹配失败，尝试下一策略
}`,
    highlight: 'O(n) 字符串匹配',
    visualData: {
      searchString: 'const x = 1;',
      occurrences: 0,
      result: 'FAIL → 尝试灵活匹配'
    }
  },
  {
    id: 'flexible_match',
    phase: 'flexible_match',
    title: '4. 策略二：灵活空白匹配',
    description: '逐行比较，忽略前导/尾随空白，保留缩进',
    strategy: 'flexible',
    codeSnippet: `// smart-edit.ts:101 - 灵活匹配策略
async function calculateFlexibleReplacement(
  context: ReplacementContext
): Promise<ReplacementResult | null> {
  // 分割为行
  const sourceLines = normalizedCode.match(/.*(?:\\n|$)/g)?.slice(0, -1) ?? [];
  const searchLinesStripped = normalizedSearch
    .split('\\n')
    .map((line: string) => line.trim());  // 去除空白

  let i = 0;
  while (i <= sourceLines.length - searchLinesStripped.length) {
    const window = sourceLines.slice(i, i + searchLinesStripped.length);
    const windowStripped = window.map((line: string) => line.trim());

    // 逐行比较（忽略空白）
    const isMatch = windowStripped.every(
      (line, index) => line === searchLinesStripped[index]
    );

    if (isMatch) {
      // 提取原始缩进
      const indentation = window[0].match(/^(\\s*)/)?.[1] ?? '';
      // 应用缩进到新内容
      const newBlockWithIndent = replaceLines.map(
        (line) => \`\${indentation}\${line}\`
      );
      // 执行替换...
    }
  }
}`,
    highlight: '空白无关匹配',
    visualData: {
      sourceLines: ['  const x = 1;', '  const y = 2;'],
      searchLines: ['const x = 1;'],
      indentPreserved: '2 spaces',
      result: 'FAIL → 尝试正则匹配'
    }
  },
  {
    id: 'regex_match',
    phase: 'regex_match',
    title: '5. 策略三：正则表达式匹配',
    description: '将搜索字符串转换为灵活的正则模式',
    strategy: 'regex',
    codeSnippet: `// smart-edit.ts:159 - 正则匹配策略
async function calculateRegexReplacement(
  context: ReplacementContext
): Promise<ReplacementResult | null> {
  // 定义分隔符（用于切分 token）
  const delimiters = ['(', ')', ':', '[', ']', '{', '}', '>', '<', '='];

  // 在分隔符周围添加空格
  let processedString = normalizedSearch;
  for (const delim of delimiters) {
    processedString = processedString.split(delim).join(\` \${delim} \`);
  }

  // 分割为 token 并转义
  const tokens = processedString.split(/\\s+/).filter(Boolean);
  const escapedTokens = tokens.map(escapeRegex);

  // 用 \\s* 连接（允许灵活空白）
  const pattern = escapedTokens.join('\\\\s*');

  // 最终模式：捕获缩进 + 匹配内容
  const finalPattern = \`^(\\\\s*)\${pattern}\`;
  const flexibleRegex = new RegExp(finalPattern, 'm');

  const match = flexibleRegex.exec(currentContent);
  if (match) {
    const indentation = match[1] || '';
    // 应用缩进并替换...
  }
}`,
    highlight: 'Token 化正则',
    visualData: {
      originalSearch: 'const x = 1;',
      tokenized: ['const', 'x', '=', '1', ';'],
      pattern: '^(\\s*)const\\s*x\\s*=\\s*1\\s*;',
      result: 'FAIL → 尝试 LLM 修复'
    }
  },
  {
    id: 'llm_fix',
    phase: 'llm_fix',
    title: '6. 策略四：LLM 智能修复',
    description: '使用 LLM 分析错误并生成正确的搜索/替换对',
    strategy: 'llm_fix',
    codeSnippet: `// smart-edit.ts:360 - LLM 修复策略
private async attemptSelfCorrection(
  params: EditToolParams,
  currentContent: string,
  initialError: { display: string; raw: string; type: ToolErrorType },
  abortSignal: AbortSignal,
): Promise<CalculatedEdit> {
  // 调用 LLM 修复器
  const fixedEdit = await FixLLMEditWithInstruction(
    params.instruction,      // 原始指令
    params.old_string,       // 失败的搜索字符串
    params.new_string,       // 期望的替换
    initialError.raw,        // 错误详情
    currentContent,          // 文件当前内容
    this.config.getBaseLlmClient(),
    abortSignal,
  );

  if (fixedEdit.noChangesRequired) {
    // LLM 判定无需修改
    return { error: { type: EDIT_NO_CHANGE_LLM_JUDGEMENT } };
  }

  // 使用 LLM 建议的搜索/替换重试
  const secondAttemptResult = await calculateReplacement({
    params: {
      ...params,
      old_string: fixedEdit.search,   // LLM 修正后的搜索
      new_string: fixedEdit.replace,  // LLM 修正后的替换
    },
    currentContent,
    abortSignal,
  });
}`,
    highlight: 'LLM 辅助修复',
    visualData: {
      originalError: '0 occurrences found',
      llmSuggestion: {
        search: '  const x = 1;  // old value',
        replace: '  const x = 2;  // updated'
      },
      result: 'SUCCESS'
    }
  },
  {
    id: 'apply_edit',
    phase: 'apply_edit',
    title: '7. 应用编辑',
    description: '写入修改后的内容，恢复原始行尾格式',
    codeSnippet: `// smart-edit.ts:683 - 应用编辑
try {
  // 确保父目录存在
  this.ensureParentDirectoriesExist(this.params.file_path);

  let finalContent = editData.newContent;

  // 恢复原始行尾格式（如果是 CRLF）
  if (!editData.isNewFile && editData.originalLineEnding === '\\r\\n') {
    finalContent = finalContent.replace(/\\n/g, '\\r\\n');
  }

  // 写入文件
  await this.config
    .getFileSystemService()
    .writeTextFile(this.params.file_path, finalContent);

  // 生成 diff 用于显示
  const fileDiff = Diff.createPatch(
    fileName,
    editData.currentContent ?? '',
    editData.newContent,
    'Current',
    'Proposed',
    DEFAULT_DIFF_OPTIONS,
  );

  // 计算 diff 统计
  const diffStat = getDiffStat(fileName, originalContent, proposed, final);
}`,
    highlight: '行尾格式恢复',
    visualData: {
      diffStat: { added: 1, removed: 1, unchanged: 45 },
      finalEnding: 'CRLF (preserved)',
      bytesWritten: 2456
    }
  },
  {
    id: 'complete',
    phase: 'complete',
    title: '8. 编辑完成',
    description: '返回成功结果，包含 diff 和统计信息',
    codeSnippet: `// 成功响应结构
return {
  llmContent: \`Successfully modified file: \${file_path} (1 replacement).\`,
  returnDisplay: {
    fileDiff,           // 统一 diff 格式
    fileName,           // 文件名
    originalContent,    // 原始内容
    newContent,         // 新内容
    diffStat: {
      added: 1,         // 新增行数
      removed: 1,       // 删除行数
      unchanged: 45,    // 未变行数
      userModified: 0,  // 用户修改行数
      aiProposed: 1,    // AI 提议行数
    }
  },
};`,
    highlight: '编辑成功',
    visualData: {
      totalStrategiesAttempted: 4,
      successfulStrategy: 'llm_fix',
      executionTime: '1.2s'
    }
  }
];

// 策略流水线可视化
function StrategyPipelineVisualizer({
  currentStrategy,
  strategies
}: {
  currentStrategy: ReplacementStrategy | undefined;
  strategies: Array<{ name: string; key: ReplacementStrategy; status: 'pending' | 'trying' | 'failed' | 'success' }>;
}) {
  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3">策略降级链</div>
      <div className="flex items-center gap-2">
        {strategies.map((strategy, i) => (
          <div key={strategy.key} className="flex items-center">
            <div
              className={`px-3 py-2 rounded text-xs font-mono transition-all duration-300 ${
                strategy.status === 'trying'
                  ? 'bg-amber-500/30 border border-amber-500 text-amber-400 animate-pulse'
                  : strategy.status === 'success'
                  ? 'bg-green-500/30 border border-green-500 text-green-400'
                  : strategy.status === 'failed'
                  ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-500'
              }`}
            >
              {strategy.name}
            </div>
            {i < strategies.length - 1 && (
              <div className={`mx-1 text-lg ${strategy.status === 'failed' ? 'text-red-400' : 'text-gray-600'}`}>
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Diff 可视化
function DiffVisualizer({
  before,
  after,
  indentation
}: {
  before: string;
  after: string;
  indentation: string;
}) {
  return (
    <div className="mb-6 p-4 rounded-lg font-mono text-sm" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3">Diff 预览</div>
      <div className="space-y-1">
        <div className="flex">
          <span className="text-red-400 mr-2">-</span>
          <span className="text-gray-600">{indentation}</span>
          <span className="text-red-400 bg-red-500/10 px-1">{before}</span>
        </div>
        <div className="flex">
          <span className="text-green-400 mr-2">+</span>
          <span className="text-gray-600">{indentation}</span>
          <span className="text-green-400 bg-green-500/10 px-1">{after}</span>
        </div>
      </div>
    </div>
  );
}

// 匹配结果可视化
function MatchResultVisualizer({
  strategy,
  status,
  details
}: {
  strategy: string;
  status: 'success' | 'failed';
  details: string;
}) {
  return (
    <div
      className={`mb-4 p-3 rounded-lg border ${
        status === 'success'
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-red-500/10 border-red-500/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-mono text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {strategy}
        </span>
        <span className={`text-xs ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
          {status === 'success' ? '✓ 匹配成功' : '✗ 匹配失败'}
        </span>
      </div>
      <div className="text-xs text-gray-400 mt-1">{details}</div>
    </div>
  );
}

// 参数可视化
function ParamsVisualizer({ params }: { params: Record<string, unknown> }) {
  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3">编辑参数</div>
      <div className="space-y-2 font-mono text-xs">
        {Object.entries(params).map(([key, value]) => (
          <div key={key} className="flex">
            <span className="text-purple-400 w-28">{key}:</span>
            <span className="text-gray-300 truncate">{JSON.stringify(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SmartEditAnimation() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [strategyStatuses, setStrategyStatuses] = useState<Record<ReplacementStrategy, 'pending' | 'trying' | 'failed' | 'success'>>({
    exact: 'pending',
    flexible: 'pending',
    regex: 'pending',
    llm_fix: 'pending',
    failed: 'pending'
  });

  const step = editStepSequence[currentStepIndex];

  // 更新策略状态
  useEffect(() => {
    const newStatuses = { ...strategyStatuses };

    if (step.phase === 'exact_match') {
      newStatuses.exact = 'trying';
    } else if (step.phase === 'flexible_match') {
      newStatuses.exact = 'failed';
      newStatuses.flexible = 'trying';
    } else if (step.phase === 'regex_match') {
      newStatuses.flexible = 'failed';
      newStatuses.regex = 'trying';
    } else if (step.phase === 'llm_fix') {
      newStatuses.regex = 'failed';
      newStatuses.llm_fix = 'trying';
    } else if (step.phase === 'apply_edit' || step.phase === 'complete') {
      newStatuses.llm_fix = 'success';
    }

    setStrategyStatuses(newStatuses);
  }, [step.phase]);

  // 自动播放
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStepIndex < editStepSequence.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex]);

  const handlePrev = useCallback(() => {
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStepIndex(prev => Math.min(editStepSequence.length - 1, prev + 1));
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setStrategyStatuses({
      exact: 'pending',
      flexible: 'pending',
      regex: 'pending',
      llm_fix: 'pending',
      failed: 'pending'
    });
  }, []);

  const strategies = [
    { name: '精确匹配', key: 'exact' as ReplacementStrategy, status: strategyStatuses.exact },
    { name: '灵活匹配', key: 'flexible' as ReplacementStrategy, status: strategyStatuses.flexible },
    { name: '正则匹配', key: 'regex' as ReplacementStrategy, status: strategyStatuses.regex },
    { name: 'LLM 修复', key: 'llm_fix' as ReplacementStrategy, status: strategyStatuses.llm_fix },
  ];

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--terminal-green)' }}>
          Smart Edit 替换引擎
        </h1>
        <p className="text-gray-400">
          多策略替换引擎：精确匹配 → 灵活匹配 → 正则匹配 → LLM 修复
        </p>
        <div className="mt-2 text-sm text-gray-500">
          源码: packages/core/src/tools/smart-edit.ts
        </div>
      </div>

      {/* 控制栏 */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 rounded text-sm font-medium transition-colors"
          style={{
            backgroundColor: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
            color: isPlaying ? '#ef4444' : '#22c55e',
            border: `1px solid ${isPlaying ? '#ef4444' : '#22c55e'}`
          }}
        >
          {isPlaying ? '⏸ 暂停' : '▶ 播放'}
        </button>
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="px-3 py-2 rounded text-sm disabled:opacity-30"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
        >
          ← 上一步
        </button>
        <button
          onClick={handleNext}
          disabled={currentStepIndex === editStepSequence.length - 1}
          className="px-3 py-2 rounded text-sm disabled:opacity-30"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
        >
          下一步 →
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-2 rounded text-sm"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#888' }}
        >
          ↺ 重置
        </button>
        <span className="text-gray-500 text-sm ml-auto">
          步骤 {currentStepIndex + 1} / {editStepSequence.length}
        </span>
      </div>

      {/* 策略流水线 */}
      <StrategyPipelineVisualizer currentStrategy={step.strategy} strategies={strategies} />

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：步骤信息 */}
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {/* 步骤标题 */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--terminal-green)' }}>
              {step.title}
            </h2>
            {step.highlight && (
              <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-[var(--terminal-green)]/20 text-[var(--terminal-green)]">
                {step.highlight}
              </div>
            )}
          </div>

          {/* 描述 */}
          <p className="text-gray-400 mb-4">{step.description}</p>

          {/* 参数可视化 */}
          {step.visualData?.params && (
            <ParamsVisualizer params={step.visualData.params as Record<string, unknown>} />
          )}

          {/* 匹配结果 */}
          {step.strategy && step.visualData?.result && (
            <MatchResultVisualizer
              strategy={
                step.strategy === 'exact' ? '精确匹配' :
                step.strategy === 'flexible' ? '灵活匹配' :
                step.strategy === 'regex' ? '正则匹配' :
                'LLM 修复'
              }
              status={String(step.visualData.result).includes('SUCCESS') ? 'success' : 'failed'}
              details={String(step.visualData.result)}
            />
          )}

          {/* Diff 预览 */}
          {step.phase === 'apply_edit' && (
            <DiffVisualizer
              before="const x = 1;  // old value"
              after="const x = 2;  // updated"
              indentation="  "
            />
          )}

          {/* 执行统计 */}
          {step.phase === 'complete' && step.visualData && (
            <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="text-green-400 font-medium mb-2">编辑完成</div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{String(step.visualData.totalStrategiesAttempted)}</div>
                  <div className="text-xs text-gray-400">尝试策略数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{String(step.visualData.successfulStrategy)}</div>
                  <div className="text-xs text-gray-400">成功策略</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-400">{String(step.visualData.executionTime)}</div>
                  <div className="text-xs text-gray-400">执行时间</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：代码片段 */}
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <h3 className="text-sm font-medium text-gray-400 mb-4">源码实现</h3>
          <JsonBlock code={step.codeSnippet} />
        </div>
      </div>

      {/* 步骤进度条 */}
      <div className="mt-8">
        <div className="flex gap-1">
          {editStepSequence.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentStepIndex(i)}
              className={`flex-1 h-2 rounded-full transition-all ${
                i === currentStepIndex
                  ? 'bg-[var(--terminal-green)]'
                  : i < currentStepIndex
                  ? 'bg-[var(--terminal-green)]/50'
                  : 'bg-gray-700'
              }`}
              title={s.title}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>初始化</span>
          <span>策略执行</span>
          <span>应用编辑</span>
        </div>
      </div>
    </div>
  );
}
