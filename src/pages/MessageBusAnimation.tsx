// @ts-nocheck - visualData uses Record<string, unknown>
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-lg border border-edge overflow-hidden">
 <button onClick={onToggle} className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors">
 <div className="flex items-center gap-3">
  <span className="text-xl font-bold text-heading">核心概念介绍</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
 </button>
 {isExpanded && (
 <div className="px-6 pb-6 space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">核心概念</h4>
 <p className="text-body text-sm">
 MessageBus 是 Gemini CLI 的异步事件协调系统：表面是发布/订阅（EventEmitter），但对关键消息会<strong>内置“中间件”逻辑</strong>。
 例如工具审批会先由 PolicyEngine 判定（ALLOW / DENY / ASK_USER），仅在 ASK_USER 时才“放行”到 UI/调度器。
 </p>
 </div>
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">9 种消息类型</h4>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-xs">
 <div className="bg-surface p-2 rounded text-center text-heading">TOOL_CONFIRMATION_REQUEST</div>
 <div className="bg-surface p-2 rounded text-center text-heading">TOOL_CONFIRMATION_RESPONSE</div>
 <div className="bg-surface p-2 rounded text-center text-heading">TOOL_POLICY_REJECTION</div>
 <div className="bg-surface p-2 rounded text-center text-heading">TOOL_EXECUTION_SUCCESS</div>
 <div className="bg-surface p-2 rounded text-center text-heading">TOOL_EXECUTION_FAILURE</div>
 <div className="bg-surface p-2 rounded text-center text-heading">HOOK_EXECUTION_REQUEST</div>
 <div className="bg-surface p-2 rounded text-center text-heading">HOOK_EXECUTION_RESPONSE</div>
 <div className="bg-surface p-2 rounded text-center text-heading">UPDATE_POLICY</div>
 <div className="bg-surface p-2 rounded text-center text-heading">HOOK_POLICY_DECISION</div>
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
 description: 'ToolInvocation 通过 MessageBus 发起“是否允许执行工具”的请求',
 codeSnippet: `// packages/core/src/tools/tools.ts (BaseToolInvocation.getMessageBusDecision)
const correlationId = randomUUID();
const toolCall = {
 name: 'run_shell_command',
 args: { command: 'rm -rf node_modules' },
};

// 1) 订阅响应（同 correlationId）
messageBus.subscribe(MessageBusType.TOOL_CONFIRMATION_RESPONSE, onResponse);

// 2) 发布请求（MessageBus 内部会先跑 PolicyEngine.check）
await messageBus.publish({
 type: MessageBusType.TOOL_CONFIRMATION_REQUEST,
 toolCall,
 correlationId,
});`,
 visualData: {
 message: {
 type: 'tool-confirmation-request',
 correlationId: 'req_12345',
 toolCall: { name: 'run_shell_command', args: { command: 'rm -rf node_modules' } },
 }
 },
 highlight: 'TOOL_CONFIRMATION_REQUEST',
 },
 {
 phase: 'route',
 group: 'bus',
 title: 'Policy 判定',
 description: 'MessageBus 内部调用 PolicyEngine.check() 并决定“直接响应”或“放行到 UI/调度器”',
 codeSnippet: `// packages/core/src/confirmation-bus/message-bus.ts
if (message.type === MessageBusType.TOOL_CONFIRMATION_REQUEST) {
 const { decision } = await policyEngine.check(message.toolCall, message.serverName);

 switch (decision) {
 case PolicyDecision.ALLOW:
 emit({ type: MessageBusType.TOOL_CONFIRMATION_RESPONSE, correlationId, confirmed: true });
 break;
 case PolicyDecision.DENY:
 emit({ type: MessageBusType.TOOL_POLICY_REJECTION, toolCall: message.toolCall });
 emit({ type: MessageBusType.TOOL_CONFIRMATION_RESPONSE, correlationId, confirmed: false });
 break;
 case PolicyDecision.ASK_USER:
 // 只有 ASK_USER 才会把 request 传给订阅者
 emit(message);
 break;
 }
}`,
 visualData: {
 routing: {
 type: 'tool-confirmation-request',
 subscribers: ['CoreToolScheduler (ASK_USER handler)', 'UI (render confirmation details)']
 }
 },
 highlight: 'ASK_USER 才会下发',
 },
 {
 phase: 'subscribe',
 group: 'receiver',
 title: 'ASK_USER 触发',
 description: '当 PolicyDecision=ASK_USER 时，CoreToolScheduler 会“快速回应”让 Tool 返回 confirmationDetails',
 codeSnippet: `// packages/core/src/core/coreToolScheduler.ts (constructor)
messageBus.subscribe(
 MessageBusType.TOOL_CONFIRMATION_REQUEST,
 (request) => {
 // 只会收到 policy=ASK_USER 的请求
 messageBus.publish({
 type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
 correlationId: request.correlationId,
 confirmed: false,
 requiresUserConfirmation: true,
 });
 },
);`,
 visualData: {
 routing: {
 type: 'tool-confirmation-request',
 subscribers: ['CoreToolScheduler → TOOL_CONFIRMATION_RESPONSE(requiresUserConfirmation=true)'],
 },
 },
 highlight: 'requiresUserConfirmation=true',
 },
 {
 phase: 'handle',
 group: 'receiver',
 title: '生成确认详情',
 description: 'ToolInvocation 收到 requiresUserConfirmation 后返回 ToolCallConfirmationDetails 给调度器',
 codeSnippet: `// packages/core/src/tools/tools.ts (BaseToolInvocation.shouldConfirmExecute)
const decision = await this.getMessageBusDecision(signal);
if (decision === 'ALLOW') return false;
if (decision === 'DENY') throw new Error('...denied by policy');

// ASK_USER → 由工具自己提供确认 UI 的结构化数据（edit/exec/mcp/info）
return this.getConfirmationDetails(signal);`,
 visualData: {
 message: {
 type: 'tool-confirmation-response',
 correlationId: 'req_12345',
 confirmed: false,
 requiresUserConfirmation: true,
 },
 },
 highlight: 'ToolCallConfirmationDetails',
 },
 {
 phase: 'respond',
 group: 'response',
 title: '用户确认并保存',
 description: '用户在确认框选择“Always allow (+ save)”后，工具会发布 UPDATE_POLICY',
 codeSnippet: `// packages/core/src/tools/tools.ts (BaseToolInvocation.publishPolicyUpdate)
onConfirm: async (outcome) => {
 // proceed_always / proceed_always_and_save 会触发策略更新
 if (outcome === ToolConfirmationOutcome.ProceedAlwaysAndSave) {
 await messageBus.publish({
 type: MessageBusType.UPDATE_POLICY,
 toolName: 'run_shell_command',
 persist: true,
 // shell 可能带 commandPrefix/commandRegex 等附加信息
 });
 }
}`,
 visualData: {
 response: {
 type: 'update-policy',
 toolName: 'run_shell_command',
 persist: true,
 }
 },
 highlight: 'UPDATE_POLICY',
 },
 {
 phase: 'complete',
 group: 'response',
 title: '落盘 au',
 description: 'PolicyUpdater 监听 UPDATE_POLICY，将规则写入 ~/.gemini/policies/au（原子写入）',
 codeSnippet: `// packages/core/src/policy/policy-updater.ts (createPolicyUpdater)
messageBus.subscribe(MessageBusType.UPDATE_POLICY, async (update) => {
 const rules = policyEngine.createDynamicRule(update);
 policyEngine.addRules(rules);

 if (update.persist) {
 await writeFile('~/.gemini/policies/au', tomlString, { atomic: true });
 }
});`,
 visualData: {
 completed: true,
 decision: '下次同类调用直接 ALLOW',
 },
 highlight: '~/.gemini/policies/au',
 },
];

const groupColors: Record<PhaseGroup, string> = {
 sender: 'var(--color-info)',
 bus: '#8b5cf6',
 receiver: 'var(--color-success)',
 response: 'var(--color-warning)',
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
 <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="max-w-6xl mx-auto">
 <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />
 </div>

 <div className="max-w-6xl mx-auto mb-8">
 <h1 className="text-3xl font-bold text-heading mb-2 font-mono">消息总线流程</h1>
 <p className="text-body">发布/订阅模式的异步消息传递</p>
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
 <div className="flex justify-between mt-2 text-xs text-dim">
 <span>步骤 {currentStep + 1} / {busSequence.length}</span>
 <span className="px-2 py-0.5 rounded" style={{ backgroundColor: `${groupColors[step.group]}20`, color: groupColors[step.group] }}>{groupNames[step.group]}</span>
 </div>
 </div>

 <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
 <div className="space-y-6">
 <div className="rounded-lg p-6 border" style={{ borderColor: `${groupColors[step.group]}50`, background: `linear-gradient(135deg, ${groupColors[step.group]}10, var(--color-bg))` }}>
 <div className="flex items-center gap-3 mb-4">
 <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold" style={{ backgroundColor: groupColors[step.group], color: 'white' }}>{currentStep + 1}</div>
 <div>
 <h2 className="text-xl font-bold text-heading">{step.title}</h2>
 <p className="text-sm text-body">{step.description}</p>
 </div>
 </div>
 {step.highlight && (
 <div className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${groupColors[step.group]}20`, color: groupColors[step.group] }}>{step.highlight}</div>
 )}
 </div>

 {step.visualData?.message && (
 <div className="p-4 rounded-lg" className="bg-surface">
 <div className="text-xs text-dim mb-2 font-mono">发布消息</div>
 <pre className="text-sm text-heading">{JSON.stringify(step.visualData.message, null, 2)}</pre>
 </div>
 )}

 {step.visualData?.routing && (
 <div className="p-4 rounded-lg" className="bg-surface">
 <div className="text-xs text-dim mb-3 font-mono">消息路由</div>
 <div className="flex items-center gap-4">
 <div className="px-3 py-2 rounded bg-elevated/20 text-heading text-sm">{(step.visualData.routing as { type: string }).type}</div>
 <span className="text-dim">→</span>
 <div className="flex-1 space-y-1">
 {((step.visualData.routing as { subscribers: string[] }).subscribers).map((s: string, i: number) => (
 <div key={i} className="px-2 py-1 rounded bg-elevated text-heading text-xs">{s}</div>
 ))}
 </div>
 </div>
 </div>
 )}

 {step.visualData?.completed && (
 <div className="p-4 rounded-lg border-2 border-edge bg-elevated">
 <div className="flex items-center gap-2">
 <span className="text-heading text-lg">✓</span>
 <span className="font-bold text-heading">消息循环完成</span>
 </div>
 <div className="text-heading text-sm mt-1">决策: {step.visualData.decision as string}</div>
 </div>
 )}
 </div>

 <div>
 <JsonBlock code={step.codeSnippet} title="message-bus.ts" />
 </div>
 </div>

 <div className="max-w-6xl mx-auto mt-8 flex items-center justify-center gap-4">
 <button onClick={handleReset} className="px-4 py-2 rounded-lg bg-surface text-body hover:bg-elevated transition-colors">重置</button>
 <button onClick={handlePrev} disabled={currentStep === 0} className="px-4 py-2 rounded-lg bg-surface text-body hover:bg-elevated transition-colors disabled:opacity-50">上一步</button>
 <button onClick={() => setIsPlaying(!isPlaying)} className={`px-6 py-2 rounded-lg font-medium transition-colors ${isPlaying ? 'bg-[var(--color-warning)] text-heading' : ' bg-elevated text-heading'}`}>{isPlaying ? '暂停' : '自动播放'}</button>
 <button onClick={handleNext} disabled={currentStep === busSequence.length - 1} className="px-4 py-2 rounded-lg bg-surface text-body hover:bg-elevated transition-colors disabled:opacity-50">下一步</button>
 </div>
 </div>
 );
}
