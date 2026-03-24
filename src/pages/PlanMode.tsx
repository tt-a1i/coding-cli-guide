import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
 { id: 'task-tracking', label: '任务追踪', description: '计划中的步骤转化为可追踪任务' },
 { id: 'slash-cmd', label: '斜杠命令', description: '/plan 命令入口' },
 { id: 'subagent', label: '子代理系统', description: 'Research Subagent 支撑' },
 { id: 'chat-compression', label: '聊天压缩', description: '计划在压缩中被保留' },
 { id: 'non-interactive', label: '非交互模式', description: '计划驱动的自动化执行' },
 { id: 'interaction-loop', label: '交互主循环', description: '计划与主循环的协作' },
];

function Introduction({
 isExpanded,
 onToggle,
}: {
 isExpanded: boolean;
 onToggle: () => void;
}) {
 return (
 <div className="mb-8 bg-surface rounded-xl border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
  <span className="text-xl font-bold text-heading">
 Plan Mode 导读
 </span>
 </div>
 <span
 className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}
 >
 ▼
 </span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">
 Plan Mode 是什么？
 </h4>
 <p className="text-body text-sm">
 Plan Mode 是 Gemini CLI 的<strong>核心规划功能</strong>，提供一个只读分析环境，
 让 AI 在执行代码修改之前，先进行<strong>深度代码库分析</strong>和<strong>架构映射</strong>。
 这确保了修改方案经过充分思考和用户审核后才会执行。
 </p>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">
 核心特性
 </h4>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
 <div className="bg-surface p-2 rounded text-center">
 <div className="text-xs text-heading">只读分析</div>
 <div className="text-[10px] text-dim">安全探索代码库</div>
 </div>
 <div className="bg-surface p-2 rounded text-center">
 <div className="text-xs text-heading">Research Agent</div>
 <div className="text-[10px] text-dim">依赖深度分析</div>
 </div>
 <div className="bg-surface p-2 rounded text-center">
 <div className="text-xs text-heading">注释反馈</div>
 <div className="text-[10px] text-dim">迭代优化方案</div>
 </div>
 <div className="bg-surface p-2 rounded text-center">
 <div className="text-xs text-heading">压缩保留</div>
 <div className="text-[10px] text-dim">长对话不丢失</div>
 </div>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">
 与传统模式的区别
 </h4>
 <p className="text-body text-sm">
 传统模式下，AI 直接执行文件修改。Plan Mode 引入了<strong>"先规划、再执行"</strong>的范式：
 AI 先制定详细的修改计划，用户审核并批注后，再按计划逐步执行。
 这种方式特别适合<strong>大规模重构</strong>和<strong>复杂功能实现</strong>。
 </p>
 </div>
 </div>
 )}
 </div>
 );
}

export function PlanMode() {
 const [showIntro, setShowIntro] = useState(true);

 return (
 <div className="space-y-8">
 <Introduction isExpanded={showIntro} onToggle={() => setShowIntro(!showIntro)} />

 {/* 架构概览 */}
 <section id="architecture">
 <h2 className="text-2xl font-bold mb-4 text-heading">
 架构概览
 </h2>
 <p className="text-body mb-6">
 Plan Mode 的架构围绕 <code>PlanManager</code> 构建，协调规划生命周期中的各个阶段。
 核心设计理念是将<strong>分析、规划、审核、执行</strong>四个阶段清晰分离。
 </p>

 <MermaidDiagram chart={`
graph TB
 subgraph PlanMode["Plan Mode 架构"]
 UserInput["用户输入 /plan"]
 PM["PlanManager"]
 RA["Research Subagent"]
 PG["PlanGenerator"]
 PS["PlanStore"]
 AN["Annotation System"]
 PE["PlanExecutor"]
 end

 UserInput --> PM
 PM --> RA
 RA --> PG
 PG --> PS
 PS --> AN
 AN -->|"迭代优化"| PG
 PS -->|"用户批准"| PE

 subgraph ReadOnly["只读分析环境"]
 RA
 PG
 end

 subgraph Execution["执行环境"]
 PE
 end

 style PlanMode stroke-width:2px
 style ReadOnly stroke-width:1px
 style Execution stroke-width:1px
`} />
 </section>

 {/* 核心组件 */}
 <section id="components">
 <h2 className="text-2xl font-bold mb-4 text-heading">
 核心组件
 </h2>

 <Layer title="PlanManager — 规划协调器" color="green">
 <p className="text-body mb-4">
 <code>PlanManager</code> 是 Plan Mode 的中央控制器，负责管理计划的完整生命周期。
 它协调 Research Subagent、PlanGenerator 和 PlanStore 之间的交互。
 </p>

 <CodeBlock language="typescript" code={`interface PlanManager {
 // 创建新计划
 createPlan(request: PlanRequest): Promise<Plan>;

 // 展示当前计划
 showPlan(planId: string): Plan;

 // 执行已批准的计划
 executePlan(planId: string): Promise<ExecutionResult>;

 // 复制计划到新会话
 copyPlan(planId: string): Plan;

 // 列出所有计划
 listPlans(): Plan[];

 // 添加注释
 annotate(planId: string, stepId: string, comment: string): void;
}

interface Plan {
 id: string;
 title: string;
 status: 'draft' | 'reviewing' | 'approved' | 'executing' | 'completed';
 steps: PlanStep[];
 annotations: Annotation[];
 createdAt: number;
 approvedAt?: number;
 metadata: {
 filesAnalyzed: number;
 dependenciesFound: number;
 estimatedChanges: number;
 };
}`} />
 </Layer>

 <Layer title="Research Subagent — 研究子代理" color="cyan">
 <p className="text-body mb-4">
 Plan Mode 内置的研究子代理负责<strong>深度代码库分析</strong>。
 它在只读环境中运行，可以安全地遍历文件、分析依赖关系、理解代码结构，
 而不会对代码库产生任何修改。
 </p>

 <CodeBlock language="typescript" code={`interface ResearchSubagent {
 // 分析文件依赖关系
 analyzeDependencies(entryPoint: string): DependencyGraph;

 // 搜索相关代码模式
 searchPatterns(query: string): SearchResult[];

 // 生成架构映射
 mapArchitecture(scope: string[]): ArchitectureMap;

 // 评估变更影响
 assessImpact(proposedChanges: Change[]): ImpactReport;
}

// Research Subagent 运行在隔离的只读上下文中
const researchContext: SubagentContext = {
 mode: 'read-only',
 allowedTools: ['ReadFile', 'SearchFiles', 'ListDirectory'],
 blockedTools: ['WriteFile', 'EditFile', 'Shell'],
 timeoutMs: 30000,
};`} />

 <HighlightBox>
 Research Subagent 继承了子代理系统的架构（参见 <code>子代理系统</code> 页面），
 但被限制为只读操作。它可以同时启动多个分析任务，利用并发模式加速大型代码库的分析。
 </HighlightBox>
 </Layer>

 <Layer title="Annotation System — 注释反馈" color="amber">
 <p className="text-body mb-4">
 注释系统允许用户在审核计划时为每个步骤添加反馈。这些反馈会被传递给 PlanGenerator，
 用于迭代优化计划。
 </p>

 <CodeBlock language="typescript" code={`interface Annotation {
 id: string;
 stepId: string;
 content: string;
 type: 'suggestion' | 'rejection' | 'question' | 'approval';
 createdAt: number;
}

// 注释驱动的迭代流程
async function iteratePlan(plan: Plan, annotations: Annotation[]): Promise<Plan> {
 const rejections = annotations.filter(a => a.type === 'rejection');
 const suggestions = annotations.filter(a => a.type === 'suggestion');

 if (rejections.length > 0) {
 // 重新分析被拒绝的步骤
 const revisedSteps = await reanalyzeSteps(plan, rejections);
 plan.steps = mergeSteps(plan.steps, revisedSteps);
 }

 if (suggestions.length > 0) {
 // 整合用户建议
 plan.steps = await incorporateSuggestions(plan, suggestions);
 }

 return plan;
}`} />
 </Layer>

 <Layer title="PlanStore — 计划持久化" color="purple">
 <p className="text-body mb-4">
 PlanStore 负责计划的持久化存储。已批准的计划在聊天压缩期间会被特别保留，
 确保长时间对话中不会丢失重要的规划信息。
 </p>

 <CodeBlock language="typescript" code={`interface PlanStore {
 save(plan: Plan): void;
 load(planId: string): Plan | null;
 list(): PlanSummary[];
 delete(planId: string): void;

 // 标记计划为"压缩时保留"
 markForRetention(planId: string): void;
}

// 与聊天压缩的集成
function onChatCompression(context: CompressionContext): void {
 const approvedPlans = planStore.list()
 .filter(p => p.status === 'approved' || p.status === 'executing');

 // 已批准的计划被加入压缩豁免列表
 for (const plan of approvedPlans) {
 context.retainMessages.push({
 type: 'plan',
 content: serializePlan(plan),
 priority: 'high',
 });
 }
}`} />
 </Layer>
 </section>

 {/* 工作流程 */}
 <section id="workflow">
 <h2 className="text-2xl font-bold mb-4 text-heading">
 工作流程
 </h2>
 <p className="text-body mb-6">
 Plan Mode 遵循 <strong>"分析 → 规划 → 审核 → 执行"</strong> 的四阶段工作流程。
 每个阶段都有明确的入口和出口条件。
 </p>

 <MermaidDiagram chart={`
sequenceDiagram
 participant U as 用户
 participant PM as PlanManager
 participant RA as Research Agent
 participant PG as PlanGenerator
 participant PE as PlanExecutor

 U->>PM: /plan create "重构认证模块"
 PM->>RA: 启动代码分析

 Note over RA: 只读分析阶段
 RA->>RA: 遍历文件结构
 RA->>RA: 分析依赖关系
 RA->>RA: 识别影响范围

 RA->>PG: 分析报告
 PG->>PM: 生成初始计划
 PM->>U: 展示计划 (draft)

 U->>PM: 添加注释 "步骤3需要考虑向后兼容"
 PM->>PG: 传递注释
 PG->>PM: 更新计划
 PM->>U: 展示修订计划

 U->>PM: /plan approve
 PM->>PE: 执行已批准计划

 Note over PE: 执行阶段
 PE->>PE: 逐步执行修改
 PE->>U: 报告每步进度

 PE->>PM: 执行完成
 PM->>U: 计划完成报告
`} />
 </section>

 {/* 命令接口 */}
 <section id="commands">
 <h2 className="text-2xl font-bold mb-4 text-heading">
 命令接口
 </h2>
 <p className="text-body mb-6">
 Plan Mode 通过 <code>/plan</code> 斜杠命令及其子命令进行交互。
 </p>

 <div className="space-y-4">
 <div className="bg-surface rounded-lg p-4 border border-edge">
 <h4 className="text-heading font-bold font-mono text-sm mb-2">/plan create [description]</h4>
 <p className="text-body text-sm">
 创建新计划。description 描述要完成的目标。Plan Mode 会启动 Research Subagent 分析代码库，
 然后生成包含详细步骤的修改计划。
 </p>
 <CodeBlock language="bash" code={`# 示例
/plan create "将用户认证从 JWT 迁移到 OAuth2"
/plan create "优化数据库查询，减少 N+1 问题"
/plan create "添加单元测试覆盖所有 API 端点"`} />
 </div>

 <div className="bg-surface rounded-lg p-4 border border-edge">
 <h4 className="text-heading font-bold font-mono text-sm mb-2">/plan show [planId]</h4>
 <p className="text-body text-sm">
 展示指定计划的详细内容。省略 planId 则展示当前活动计划。
 </p>
 </div>

 <div className="bg-surface rounded-lg p-4 border border-edge">
 <h4 className="text-heading font-bold font-mono text-sm mb-2">/plan execute [planId]</h4>
 <p className="text-body text-sm">
 执行已批准的计划。只有状态为 <code>approved</code> 的计划可以执行。
 执行过程中会逐步报告进度。
 </p>
 </div>

 <div className="bg-surface rounded-lg p-4 border border-edge">
 <h4 className="text-heading font-bold font-mono text-sm mb-2">/plan copy [planId]</h4>
 <p className="text-body text-sm">
 复制计划。可用于在新会话中继续之前的计划，或创建变体方案。
 </p>
 </div>

 <div className="bg-surface rounded-lg p-4 border border-edge">
 <h4 className="text-heading font-bold font-mono text-sm mb-2">/plan list</h4>
 <p className="text-body text-sm">
 列出所有计划及其状态。
 </p>
 </div>
 </div>
 </section>

 {/* Plan 状态机 */}
 <section id="state-machine">
 <h2 className="text-2xl font-bold mb-4 text-heading">
 Plan 状态机
 </h2>
 <p className="text-body mb-6">
 每个 Plan 都有明确的状态流转，确保规划过程有序进行。
 </p>

 <MermaidDiagram chart={`
stateDiagram-v2
 [*] --> Draft: /plan create
 Draft --> Reviewing: 分析完成
 Reviewing --> Draft: 添加注释(迭代)
 Reviewing --> Approved: /plan approve
 Approved --> Executing: /plan execute
 Executing --> Completed: 全部步骤完成
 Executing --> Approved: 执行中断(可重试)
 Draft --> [*]: 用户取消
 Reviewing --> [*]: 用户取消
`} />
 </section>

 {/* 与聊天压缩的集成 */}
 <section id="compression-integration">
 <h2 className="text-2xl font-bold mb-4 text-heading">
 与聊天压缩的集成
 </h2>
 <p className="text-body mb-6">
 在长时间对话中，聊天压缩系统会自动压缩旧消息以释放上下文窗口。
 Plan Mode 与压缩系统进行了深度集成：已批准的计划会被特别标记，
 在压缩过程中被完整保留。
 </p>

 <HighlightBox>
 <strong>设计决策：</strong>为什么已批准的计划需要在压缩中保留？
 <br /><br />
 计划包含了代码分析的结论和详细的执行步骤。如果在压缩中丢失，
 AI 将无法继续按照约定的方案执行，可能导致不一致的修改。
 保留计划的成本（额外的 token 占用）远低于重新分析和规划的成本。
 </HighlightBox>

 <CodeBlock language="typescript" code={`// 压缩钩子注册
chatCompression.onCompress((context) => {
 const activePlans = planStore.getActivePlans();

 for (const plan of activePlans) {
 // 将计划序列化为精简格式
 const serialized = plan.serialize({
 includeAnnotations: true,
 includeMetadata: false, // 元数据可重建
 });

 context.protect(serialized, {
 priority: 'critical',
 label: \`Plan: \${plan.title}\`,
 });
 }
});`} />
 </section>

 {/* 设计决策 */}
 <section id="design-decisions">
 <h2 className="text-2xl font-bold mb-4 text-heading">
 设计决策
 </h2>

 <div className="space-y-4">
 <div className="bg-surface rounded-lg p-5 border border-edge">
 <h4 className="text-heading font-bold mb-2">为什么是只读环境？</h4>
 <p className="text-body text-sm">
 Plan Mode 的分析阶段运行在只读环境中。这是一个刻意的设计选择：
 分析阶段不应该对代码库产生任何副作用。这样用户可以放心地让 AI
 深度分析代码库，而不用担心意外修改。同时，只读约束也简化了
 Research Subagent 的安全模型。
 </p>
 </div>

 <div className="bg-surface rounded-lg p-5 border border-edge">
 <h4 className="text-heading font-bold mb-2">为什么集成 Research Subagent？</h4>
 <p className="text-body text-sm">
 复杂的重构任务需要对代码库进行深入理解。单纯依赖 LLM 的上下文窗口
 无法容纳大型项目的全部信息。Research Subagent 可以按需加载和分析文件，
 构建依赖图和影响分析，为计划生成提供高质量的输入。
 </p>
 </div>

 <div className="bg-surface rounded-lg p-5 border border-edge">
 <h4 className="text-heading font-bold mb-2">注释系统的价值</h4>
 <p className="text-body text-sm">
 注释系统是人机协作的关键接口。用户可以针对每个步骤提供反馈，
 而不是简单地接受或拒绝整个计划。这种粒度的反馈机制使得
 计划可以被逐步优化，而不是推倒重来。
 </p>
 </div>
 </div>
 </section>

 {/* 最佳实践 */}
 <section id="best-practices">
 <h2 className="text-2xl font-bold mb-4 text-heading">
 最佳实践
 </h2>

 <div className="space-y-3">
 <div className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-edge">
 <span className="text-heading mt-0.5">✓</span>
 <div>
 <div className="text-sm text-heading font-medium">大规模重构时优先使用 Plan Mode</div>
 <div className="text-xs text-body mt-1">
 涉及多个文件或模块的修改应先制定计划，确保变更的一致性和完整性
 </div>
 </div>
 </div>

 <div className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-edge">
 <span className="text-heading mt-0.5">✓</span>
 <div>
 <div className="text-sm text-heading font-medium">充分利用注释进行迭代</div>
 <div className="text-xs text-body mt-1">
 不要急于批准计划，通过注释完善每个步骤。高质量的注释能显著提升最终执行效果
 </div>
 </div>
 </div>

 <div className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-edge">
 <span className="text-heading mt-0.5">✓</span>
 <div>
 <div className="text-sm text-heading font-medium">复制计划创建变体方案</div>
 <div className="text-xs text-body mt-1">
 对于复杂决策，可以通过 <code>/plan copy</code> 创建多个方案进行比较
 </div>
 </div>
 </div>

 <div className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-edge">
 <span className="text-heading mt-0.5">!</span>
 <div>
 <div className="text-sm text-heading font-medium">避免在简单任务中使用 Plan Mode</div>
 <div className="text-xs text-body mt-1">
 对于简单的 bug 修复或小型修改，直接执行比先规划更高效
 </div>
 </div>
 </div>
 </div>
 </section>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
