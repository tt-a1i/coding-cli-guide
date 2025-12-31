// @ts-nocheck - visualData uses Record<string, unknown>
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--purple)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button onClick={onToggle} className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📡</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">核心概念介绍</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">🎯 核心概念</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              MessageBus 是 Gemini CLI 的异步事件协调系统。采用发布/订阅模式，解耦 Policy Engine、Hook System 和 UI 层之间的通信。
            </p>
          </div>
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">📨 8 种消息类型</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-amber-400">TOOL_CONFIRM_REQ</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-green-400">TOOL_CONFIRM_RES</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-cyan-400">HOOK_EXEC_REQ</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-purple-400">HOOK_EXEC_RES</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type BusPhase = 'publish' | 'route' | 'subscribe' | 'handle' | 'respond' | 'complete';
type PhaseGroup = 'sender' | 'bus' | 'receiver' | 'response';

interface BusStep {
  phase: BusPhase;
  group: PhaseGroup;
  title: string;
  description: string;
  codeSnippet: string;
  visualData?: Record<string, unknown>;
  highlight?: string;
}

const busSequence: BusStep[] = [
  {
    phase: 'publish',
    group: 'sender',
    title: '发布消息',
    description: 'Policy Engine 发布工具确认请求消息',
    codeSnippet: `// message-bus.ts:40-70
class MessageBus {
  private subscribers = new Map<MessageType, Set<Handler>>();

  publish<T extends Message>(message: T): void {
    const handlers = this.subscribers.get(message.type);
    if (!handlers) return;

    for (const handler of handlers) {
      handler(message);
    }
  }
}

// Policy Engine 发布确认请求
messageBus.publish({
  type: 'TOOL_CONFIRMATION_REQUEST',
  toolName: 'Bash',
  toolInput: { command: 'rm -rf node_modules' },
  requestId: 'req_12345',
  timestamp: Date.now()
});`,
    visualData: {
      message: {
        type: 'TOOL_CONFIRMATION_REQUEST',
        toolName: 'Bash',
        requestId: 'req_12345'
      }
    },
    highlight: 'TOOL_CONFIRMATION_REQUEST',
  },
  {
    phase: 'route',
    group: 'bus',
    title: '消息路由',
    description: 'MessageBus 根据消息类型路由到订阅者',
    codeSnippet: `// message-bus.ts:80-110
private route(message: Message): Handler[] {
  const type = message.type;
  const handlers = this.subscribers.get(type) || new Set();

  console.debug(
    '[MessageBus] Routing', type,
    'to', handlers.size, 'subscribers'
  );

  return Array.from(handlers);
}

// 路由结果
// TOOL_CONFIRMATION_REQUEST → 2 subscribers
// - UIConfirmationDialog
// - TelemetryLogger`,
    visualData: {
      routing: {
        type: 'TOOL_CONFIRMATION_REQUEST',
        subscribers: ['UIConfirmationDialog', 'TelemetryLogger']
      }
    },
    highlight: '2 订阅者',
  },
  {
    phase: 'subscribe',
    group: 'receiver',
    title: 'UI 接收消息',
    description: 'UI 层订阅并接收确认请求',
    codeSnippet: `// ui/ConfirmationDialog.tsx:20-50
useEffect(() => {
  const unsubscribe = messageBus.subscribe(
    'TOOL_CONFIRMATION_REQUEST',
    (message) => {
      setConfirmRequest(message);
      setIsOpen(true);
    }
  );

  return () => unsubscribe();
}, []);

// 显示确认对话框
// ┌─────────────────────────────┐
// │ Bash: rm -rf node_modules  │
// │ [Allow] [Deny]             │
// └─────────────────────────────┘`,
    visualData: {
      dialog: { isOpen: true, tool: 'Bash' }
    },
    highlight: '显示对话框',
  },
  {
    phase: 'handle',
    group: 'receiver',
    title: '用户交互',
    description: '用户点击 Allow 按钮确认操作',
    codeSnippet: `// ui/ConfirmationDialog.tsx:60-90
const handleAllow = () => {
  // 用户点击 Allow
  const response: ToolConfirmationResponse = {
    type: 'TOOL_CONFIRMATION_RESPONSE',
    requestId: confirmRequest.requestId,
    decision: 'allow',
    timestamp: Date.now()
  };

  messageBus.publish(response);
  setIsOpen(false);
};

// 用户选择: Allow`,
    visualData: {
      userAction: 'allow'
    },
    highlight: '用户选择 Allow',
  },
  {
    phase: 'respond',
    group: 'response',
    title: '发布响应',
    description: 'UI 发布确认响应消息',
    codeSnippet: `// UI 发布响应
messageBus.publish({
  type: 'TOOL_CONFIRMATION_RESPONSE',
  requestId: 'req_12345',
  decision: 'allow',
  timestamp: Date.now()
});

// MessageBus 路由响应
// TOOL_CONFIRMATION_RESPONSE → 1 subscriber
// - PolicyEngine`,
    visualData: {
      response: {
        type: 'TOOL_CONFIRMATION_RESPONSE',
        decision: 'allow',
        requestId: 'req_12345'
      }
    },
    highlight: 'TOOL_CONFIRMATION_RESPONSE',
  },
  {
    phase: 'complete',
    group: 'response',
    title: 'Policy 接收响应',
    description: 'Policy Engine 接收响应并完成决策',
    codeSnippet: `// policy-engine.ts:150-180
messageBus.subscribe(
  'TOOL_CONFIRMATION_RESPONSE',
  (response) => {
    const pending = this.pendingRequests.get(response.requestId);
    if (!pending) return;

    pending.resolve({
      action: response.decision === 'allow' ? 'ALLOW' : 'DENY',
      source: 'user_confirmation'
    });

    this.pendingRequests.delete(response.requestId);
  }
);

// 工具 Bash 继续执行`,
    visualData: {
      completed: true,
      decision: 'ALLOW'
    },
    highlight: '工具执行',
  },
];

const groupColors: Record<PhaseGroup, string> = {
  sender: '#3b82f6',
  bus: '#8b5cf6',
  receiver: '#22c55e',
  response: '#f59e0b',
};

const groupNames: Record<PhaseGroup, string> = {
  sender: '发送方',
  bus: '消息总线',
  receiver: '接收方',
  response: '响应',
};

export function MessageBusAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  const step = busSequence[currentStep];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      if (currentStep < busSequence.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePrev = useCallback(() => setCurrentStep(prev => Math.max(0, prev - 1)), []);
  const handleNext = useCallback(() => setCurrentStep(prev => Math.min(busSequence.length - 1, prev + 1)), []);
  const handleReset = useCallback(() => { setCurrentStep(0); setIsPlaying(false); }, []);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />
      </div>

      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-[var(--cyber-blue)] mb-2 font-mono">消息总线流程</h1>
        <p className="text-gray-400">发布/订阅模式的异步消息传递</p>
      </div>

      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(groupNames) as PhaseGroup[]).map((group) => (
            <div key={group} className={`px-3 py-1 rounded-full text-xs font-medium ${step.group === group ? 'shadow-lg' : 'opacity-50'}`}
              style={{ backgroundColor: step.group === group ? `${groupColors[group]}20` : 'transparent', color: groupColors[group], border: `1px solid ${step.group === group ? groupColors[group] : 'transparent'}` }}>
              {groupNames[group]}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-1">
          {busSequence.map((s, i) => (
            <button key={i} onClick={() => setCurrentStep(i)} className="flex-1 h-2 rounded-full transition-all cursor-pointer"
              style={{ backgroundColor: i === currentStep ? groupColors[s.group] : i < currentStep ? `${groupColors[s.group]}80` : '#374151' }} title={s.title} />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>步骤 {currentStep + 1} / {busSequence.length}</span>
          <span className="px-2 py-0.5 rounded" style={{ backgroundColor: `${groupColors[step.group]}20`, color: groupColors[step.group] }}>{groupNames[step.group]}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="rounded-xl p-6 border" style={{ borderColor: `${groupColors[step.group]}50`, background: `linear-gradient(135deg, ${groupColors[step.group]}10, rgba(0,0,0,0.8))` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold" style={{ backgroundColor: groupColors[step.group], color: 'white' }}>{currentStep + 1}</div>
              <div>
                <h2 className="text-xl font-bold text-white">{step.title}</h2>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            </div>
            {step.highlight && (
              <div className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${groupColors[step.group]}20`, color: groupColors[step.group] }}>{step.highlight}</div>
            )}
          </div>

          {step.visualData?.message && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <div className="text-xs text-gray-500 mb-2 font-mono">发布消息</div>
              <pre className="text-sm text-[var(--terminal-green)]">{JSON.stringify(step.visualData.message, null, 2)}</pre>
            </div>
          )}

          {step.visualData?.routing && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <div className="text-xs text-gray-500 mb-3 font-mono">消息路由</div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-2 rounded bg-blue-500/20 text-blue-400 text-sm">{(step.visualData.routing as { type: string }).type}</div>
                <span className="text-gray-500">→</span>
                <div className="flex-1 space-y-1">
                  {((step.visualData.routing as { subscribers: string[] }).subscribers).map((s: string, i: number) => (
                    <div key={i} className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">{s}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step.visualData?.completed && (
            <div className="p-4 rounded-lg border-2 border-green-500 bg-green-500/10">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-lg">✓</span>
                <span className="font-bold text-white">消息循环完成</span>
              </div>
              <div className="text-green-400 text-sm mt-1">决策: {step.visualData.decision as string}</div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-3 font-mono">源码实现</h3>
          <div className="rounded-xl overflow-hidden border border-gray-800" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="p-1 border-b border-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-gray-500 ml-2 font-mono">message-bus.ts</span>
            </div>
            <JsonBlock code={step.codeSnippet} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 flex items-center justify-center gap-4">
        <button onClick={handleReset} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors">重置</button>
        <button onClick={handlePrev} disabled={currentStep === 0} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50">上一步</button>
        <button onClick={() => setIsPlaying(!isPlaying)} className={`px-6 py-2 rounded-lg font-medium transition-colors ${isPlaying ? 'bg-amber-600 text-white' : 'bg-[var(--cyber-blue)] text-white'}`}>{isPlaying ? '暂停' : '自动播放'}</button>
        <button onClick={handleNext} disabled={currentStep === busSequence.length - 1} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50">下一步</button>
      </div>
    </div>
  );
}
