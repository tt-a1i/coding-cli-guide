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
      <div className={`flex items-center p-4 ${messageColor} rounded-lg my-2`}>
        <div className={`w-24 text-center ${fromColor}`}>{from}</div>
        <div className="flex-1 text-center">
          <div className="bg-white/20 text-white px-5 py-2 rounded-full inline-block">
            {message}
          </div>
        </div>
        <div className="w-24 text-center">{to}</div>
      </div>
      {extra && <div className="mx-12 text-sm"><JsonBlock code={extra} /></div>}
    </div>
  );
}

const animSteps = [
  {
    from: '👤 用户',
    fromColor: 'text-green-500',
    to: '→ CLI',
    message: '"帮我读取 package.json"',
    messageColor: 'bg-green-500/10',
  },
  {
    from: '🖥️ CLI',
    fromColor: 'text-blue-500',
    to: '→ AI',
    message: '发送请求 + 工具定义',
    messageColor: 'bg-blue-500/10',
    extra: `{
    messages: [{ role: "user", content: "..." }],
    tools: [read_file, edit, shell, ...]
}`,
  },
  {
    from: '← CLI',
    fromColor: '',
    to: '☁️ AI',
    message: '返回: tool_calls: [read_file]',
    messageColor: 'bg-pink-500/10',
    extra: `{
    tool_calls: [
        { name: "read_file", arguments: { path: "package.json" } }
    ]
}`,
  },
  {
    from: '🖥️ CLI',
    fromColor: 'text-blue-500',
    to: '🔧 工具',
    message: '执行 ReadFileTool',
    messageColor: 'bg-orange-500/10',
  },
  {
    from: '← CLI',
    fromColor: '',
    to: '🔧 工具',
    message: '返回文件内容',
    messageColor: 'bg-orange-500/10',
    extra: `{ llmContent: "{\\"name\\": \\"@innies/innies-cli\\", ...}" }`,
  },
  {
    from: '🖥️ CLI',
    fromColor: 'text-blue-500',
    to: '→ AI',
    message: '第二轮请求 (含工具结果)',
    messageColor: 'bg-blue-500/10',
    extra: `{
    messages: [
        { role: "user", ... },
        { role: "assistant", tool_calls: [...] },
        { role: "tool", content: "..." }  // <-- 新增
    ]
}`,
  },
  {
    from: '← CLI',
    fromColor: '',
    to: '☁️ AI',
    message: '最终回复 (finish_reason: stop)',
    messageColor: 'bg-pink-500/10',
    extra: `{
    content: "package.json 的 name 是 @innies/innies-cli",
    finish_reason: "stop"
}`,
  },
  {
    from: '👤 用户',
    fromColor: 'text-green-500',
    to: '← CLI',
    message: '看到回复: "name 是 @innies/innies-cli"',
    messageColor: 'bg-green-500/10',
  },
];

const stepDescriptions = [
  '点击播放开始演示',
  '用户输入问题：帮我读取 package.json',
  'CLI 发送第一轮请求给 AI，包含用户消息和工具定义',
  'AI 分析后返回：我需要调用 read_file 工具',
  'CLI 执行 ReadFileTool，读取本地文件',
  '工具返回文件内容给 CLI',
  'CLI 发送第二轮请求，包含工具执行结果',
  'AI 看到文件内容后，生成最终回复',
  '用户看到 AI 的回复，流程完成！',
];

export function Animation() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    if (step >= 8) return;

    const timer = setTimeout(() => {
      setStep((currentStep) => {
        const nextStep = currentStep + 1;
        if (nextStep >= 8) {
          setIsPlaying(false);
          return 8;
        }
        return nextStep;
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [isPlaying, step]);

  const play = () => {
    setStep(0);
    setIsPlaying(true);
  };

  const stepOnce = () => {
    if (step >= 8) {
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
    <div className="bg-white/5 rounded-xl p-8 border border-white/10">
      <h2 className="text-2xl text-cyan-400 mb-5">完整流程动画演示</h2>

      {/* Controls */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button
          onClick={play}
          className="px-5 py-2 bg-cyan-400 text-gray-900 rounded-md font-bold hover:bg-cyan-300 transition-colors cursor-pointer"
        >
          ▶ 播放完整流程
        </button>
        <button
          onClick={stepOnce}
          className="px-5 py-2 bg-cyan-400 text-gray-900 rounded-md font-bold hover:bg-cyan-300 transition-colors cursor-pointer"
        >
          ⏭ 单步执行
        </button>
        <button
          onClick={reset}
          className="px-5 py-2 bg-orange-500 text-white rounded-md font-bold hover:bg-orange-400 transition-colors cursor-pointer"
        >
          🔄 重置
        </button>
      </div>

      {/* Stage */}
      <div className="relative min-h-[600px] bg-black/30 rounded-xl overflow-hidden p-5">
        {/* Participants header */}
        <div className="flex justify-around mb-5 pb-4 border-b border-white/10">
          <div className="text-center text-green-500">
            <div className="text-3xl">👤</div>
            <div>用户</div>
          </div>
          <div className="text-center text-blue-500">
            <div className="text-3xl">🖥️</div>
            <div>CLI</div>
          </div>
          <div className="text-center text-pink-500">
            <div className="text-3xl">☁️</div>
            <div>AI API</div>
          </div>
          <div className="text-center text-orange-500">
            <div className="text-3xl">🔧</div>
            <div>工具</div>
          </div>
        </div>

        {/* Animation steps */}
        <div>
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
      <div className="mt-5 p-4 bg-black/30 rounded-lg">
        <div className="text-cyan-400 mb-2">
          当前步骤：<span className="font-bold">{step}</span>/8
        </div>
        <div>{stepDescriptions[step]}</div>
      </div>
    </div>
  );
}
