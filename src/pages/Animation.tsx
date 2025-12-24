import { useState, useEffect } from 'react';
import { JsonBlock } from '../components/JsonBlock';

interface AnimStepProps {
  visible: boolean;
  from: string;
  fromColor: string;
  to: string;
  message: string;
  messageColor: string;
  extra?: string;
}

function AnimStep({ visible, from, fromColor, to, message, messageColor, extra }: AnimStepProps) {
  if (!visible) return null;

  return (
    <div className="animate-fadeIn">
      <div className={`flex items-center p-4 ${messageColor} rounded-lg my-2 border border-[var(--border-subtle)]`}>
        <div className={`w-28 text-center font-mono text-sm ${fromColor}`}>{from}</div>
        <div className="flex-1 text-center">
          <div className="bg-[var(--bg-elevated)] text-[var(--text-primary)] px-5 py-2 rounded-full inline-block font-mono text-sm border border-[var(--border-subtle)]">
            {message}
          </div>
        </div>
        <div className="w-28 text-center font-mono text-sm text-[var(--text-secondary)]">{to}</div>
      </div>
      {extra && <div className="mx-12 text-sm"><JsonBlock code={extra} /></div>}
    </div>
  );
}

// 动画步骤数据 - 对应 innies-cli 实际流程
const animSteps = [
  {
    from: '👤 用户',
    fromColor: 'text-[var(--terminal-green)]',
    to: '→ CLI',
    message: '"帮我读取 package.json"',
    messageColor: 'bg-[var(--terminal-green)]/10',
  },
  {
    from: '🖥️ CLI',
    fromColor: 'text-[var(--cyber-blue)]',
    to: '→ AI',
    message: 'generateContentStream + tools',
    messageColor: 'bg-[var(--cyber-blue)]/10',
    extra: `{
  // Gemini SDK 格式 (内部会转换为 OpenAI 格式)
  contents: [{ role: "user", parts: [...] }],
  tools: [{ functionDeclarations: [read_file, edit, shell, ...] }]
}`,
  },
  {
    from: '← CLI',
    fromColor: 'text-[var(--text-muted)]',
    to: '☁️ AI',
    message: 'FunctionCall: read_file',
    messageColor: 'bg-[var(--purple)]/10',
    extra: `{
  // StreamingToolCallParser 解析流式 JSON
  functionCalls: [{
    name: "read_file",
    args: { absolute_path: "/path/to/package.json" }
  }],
  finishReason: "TOOL_USE"
}`,
  },
  {
    from: '🖥️ CLI',
    fromColor: 'text-[var(--amber)]',
    to: '👤 用户',
    message: '请求确认执行工具',
    messageColor: 'bg-[var(--amber)]/10',
    extra: `{
  // shouldConfirmExecute() 判断是否需要审批
  tool: "read_file",
  path: "package.json",
  status: "AWAITING_APPROVAL"
}`,
  },
  {
    from: '👤 用户',
    fromColor: 'text-[var(--terminal-green)]',
    to: '→ CLI',
    message: '✓ 批准执行',
    messageColor: 'bg-[var(--terminal-green)]/10',
  },
  {
    from: '🖥️ CLI',
    fromColor: 'text-[var(--cyber-blue)]',
    to: '🔧 工具',
    message: '执行 read_file 工具',
    messageColor: 'bg-[var(--amber)]/10',
    extra: `// ToolInvocation.execute()
ReadFileToolInvocation.execute({
  absolute_path: "/path/to/package.json"
})`,
  },
  {
    from: '← CLI',
    fromColor: 'text-[var(--text-muted)]',
    to: '🔧 工具',
    message: '返回 ToolResult',
    messageColor: 'bg-[var(--amber)]/10',
    extra: `{
  llmContent: "{\\"name\\": \\"@innies/innies-cli\\", ...}",
  returnDisplay: "package.json (1.2KB)"
}`,
  },
  {
    from: '🖥️ CLI',
    fromColor: 'text-[var(--cyber-blue)]',
    to: '→ AI',
    message: 'Continuation (含 FunctionResponse)',
    messageColor: 'bg-[var(--cyber-blue)]/10',
    extra: `{
  // isContinuation = true
  contents: [
    { role: "user", parts: [...] },
    { role: "model", parts: [{ functionCall: {...} }] },
    { role: "user", parts: [{ functionResponse: {...} }] }
  ]
}`,
  },
  {
    from: '← CLI',
    fromColor: 'text-[var(--text-muted)]',
    to: '☁️ AI',
    message: '最终回复 (finishReason: STOP)',
    messageColor: 'bg-[var(--purple)]/10',
    extra: `{
  content: "package.json 的 name 是 @innies/innies-cli",
  finishReason: "STOP"  // 无更多工具调用
}`,
  },
  {
    from: '👤 用户',
    fromColor: 'text-[var(--terminal-green)]',
    to: '← CLI',
    message: '看到回复，流程完成',
    messageColor: 'bg-[var(--terminal-green)]/10',
  },
];

const stepDescriptions = [
  '$ 点击播放开始演示',
  '> 用户输入问题：帮我读取 package.json',
  '> CLI 调用 generateContentStream，发送用户消息和工具定义',
  '< AI 返回 FunctionCall，StreamingToolCallParser 解析流式响应',
  '? CLI 检查 shouldConfirmExecute()，需要用户确认',
  '✓ 用户批准执行工具',
  '> CLI 调用 ReadFileToolInvocation.execute()',
  '< 工具返回 ToolResult，包含文件内容',
  '> CLI 发送 Continuation 请求，包含 FunctionResponse',
  '< AI 生成最终回复，finishReason=STOP',
  '✓ 用户看到回复，对话循环完成！',
];

export function Animation() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const maxSteps = animSteps.length;

  useEffect(() => {
    if (!isPlaying) return;
    if (step >= maxSteps) return;

    const timer = setTimeout(() => {
      setStep((currentStep) => {
        const nextStep = currentStep + 1;
        if (nextStep >= maxSteps) {
          setIsPlaying(false);
          return maxSteps;
        }
        return nextStep;
      });
    }, 1800);

    return () => clearTimeout(timer);
  }, [isPlaying, step, maxSteps]);

  const play = () => {
    setStep(0);
    setIsPlaying(true);
  };

  const stepOnce = () => {
    if (step >= maxSteps) {
      setStep(1);
    } else {
      setStep((s) => s + 1);
    }
  };

  const reset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl p-8 border border-[var(--border-subtle)] relative overflow-hidden">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--terminal-green)] via-[var(--amber)] to-[var(--cyber-blue)]" />

      <div className="flex items-center gap-3 mb-6">
        <span className="text-[var(--terminal-green)]">▶</span>
        <h2 className="text-2xl font-mono font-bold text-[var(--text-primary)]">完整流程动画演示</h2>
      </div>

      <p className="text-sm text-[var(--text-muted)] font-mono mb-6">
        // 展示 innies-cli 的核心交互循环：用户输入 → AI 思考 → 工具审批 → 执行 → Continuation
      </p>

      {/* Controls */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={play}
          className="px-5 py-2.5 bg-[var(--terminal-green)] text-[var(--bg-void)] rounded-md font-mono font-bold hover:shadow-[0_0_15px_var(--terminal-green-glow)] transition-all cursor-pointer"
        >
          ▶ 播放完整流程
        </button>
        <button
          onClick={stepOnce}
          className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-md font-mono font-bold border border-[var(--border-subtle)] hover:border-[var(--terminal-green-dim)] hover:text-[var(--terminal-green)] transition-all cursor-pointer"
        >
          ⏭ 单步执行
        </button>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--amber)] rounded-md font-mono font-bold border border-[var(--border-subtle)] hover:border-[var(--amber-dim)] hover:shadow-[0_0_10px_var(--amber-glow)] transition-all cursor-pointer"
        >
          ↺ 重置
        </button>
      </div>

      {/* Stage */}
      <div className="relative min-h-[700px] bg-[var(--bg-void)] rounded-xl overflow-hidden p-5 border border-[var(--border-subtle)]">
        {/* Participants header */}
        <div className="flex justify-around mb-5 pb-4 border-b border-[var(--border-subtle)]">
          <div className="text-center">
            <div className="text-3xl mb-1">👤</div>
            <div className="font-mono text-sm text-[var(--terminal-green)]">用户</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">🖥️</div>
            <div className="font-mono text-sm text-[var(--cyber-blue)]">CLI</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">☁️</div>
            <div className="font-mono text-sm text-[var(--purple)]">AI API</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">🔧</div>
            <div className="font-mono text-sm text-[var(--amber)]">工具</div>
          </div>
        </div>

        {/* Animation steps */}
        <div className="space-y-1">
          {animSteps.map((s, i) => (
            <AnimStep
              key={i}
              visible={step > i}
              from={s.from}
              fromColor={s.fromColor}
              to={s.to}
              message={s.message}
              messageColor={s.messageColor}
              extra={s.extra}
            />
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="mt-5 p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--border-subtle)]">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-[var(--terminal-green)] font-mono">$</span>
          <span className="text-[var(--text-secondary)] font-mono">
            当前步骤：<span className="text-[var(--terminal-green)] font-bold">{step}</span>/{maxSteps}
          </span>
          {isPlaying && (
            <span className="text-[var(--amber)] font-mono text-sm animate-pulse">
              ● 播放中...
            </span>
          )}
        </div>
        <div className="font-mono text-sm text-[var(--text-primary)] pl-6">
          {stepDescriptions[step]}
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--terminal-green)] to-[var(--cyber-blue)] transition-all duration-300"
            style={{ width: `${(step / maxSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
