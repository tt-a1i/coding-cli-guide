import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';




const relatedPages: RelatedPage[] = [
 { id: 'tool-system', label: '工具系统架构', description: 'CRUD 工具注册' },
 { id: 'agent-framework', label: 'Agent 框架', description: 'Agent Loop 集成' },
 { id: 'context-system', label: '上下文系统', description: '任务上下文注入' },
 { id: 'session-persistence', label: '会话持久化', description: '任务数据存储' },
 { id: 'checkpointing', label: '检查点系统', description: '任务状态快照' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-lg border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
  <span className="text-xl font-bold text-heading">30秒快速理解</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-5">
 <div className="bg-base/50 rounded-lg p-4 ">
 <p className="text-heading font-medium">
 <span className="text-heading font-bold">一句话：</span>
 通过 CRUD 工具和可视化组件，将 AI 会话中的复杂工作分解为可追踪的任务列表，支持状态管理、依赖关系和持久化
 </p>
 </div>

 <div className="grid grid-cols-4 gap-3">
 {[
 { val: '4', label: 'CRUD 工具', color: 'var(--color-text)' },
 { val: '4', label: '任务状态', color: 'var(--color-text)' },
 { val: '3', label: '核心组件', color: 'var(--color-text)' },
 { val: 'JSON', label: '持久化格式', color: 'var(--color-warning)' },
 ].map(({ val, label, color }) => (
 <div key={label} className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold" style={{ color }}>{val}</div>
 <div className="text-xs text-dim">{label}</div>
 </div>
 ))}
 </div>

 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">任务生命周期</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 {[
 { text: 'createTask', color: 'var(--color-text)' },
 { text: 'pending', color: 'var(--color-warning)' },
 { text: 'in_progress', color: 'var(--color-text)' },
 { text: 'completed', color: 'var(--color-text)' },
 ].flatMap(({ text, color }, i) => [
 ...(i > 0 ? [<span key={`a${i}`} className="text-dim">→</span>] : []),
 <span key={text} className="px-3 py-1.5 rounded-lg border" style={{ background: `color-mix(in srgb, ${color} 20%, transparent)`, color, borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}>{text}</span>,
 ])}
 </div>
 </div>

 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">源码入口:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/core/src/tools/taskTracker.ts
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function TaskTracking() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const architectureChart = `flowchart TD
 User(["用户/AI Agent"])
 Tools["TaskTracker Tools<br/>CRUD 工具接口"]
 Tracker["TaskTracker<br/>核心协调器"]
 Store["(TaskStore<br/>数据存储)"]
 Viz["TaskVisualization<br/>可视化渲染"]
 Strategy["TaskTracker Strategy<br/>系统提示注入"]
 PlanMode["Plan Mode<br/>计划模式"]
 FS["(文件系统<br/>JSON 持久化)"]

 User --> Tools
 Tools --> Tracker
 Tracker --> Store
 Tracker --> Viz
 Store --> FS
 Strategy -->|注入任务上下文| Tracker
 PlanMode -->|步骤转任务| Tracker

 style User fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style Tracker fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style Store fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style Viz fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style Strategy fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style FS fill:${getThemeColor("--mermaid-muted-fill", "#f4f4f2")},color:${getThemeColor("--color-text", "#1c1917")}`;

 const stateMachineChart = `stateDiagram-v2
 [*] --> pending: createTask
 pending --> in_progress: updateTask(status)
 pending --> blocked: updateTask(status)
 in_progress --> completed: updateTask(status)
 in_progress --> blocked: updateTask(status)
 blocked --> in_progress: 依赖解除
 blocked --> pending: updateTask(status)
 completed --> [*]`;

 const taskInterfaceCode = `// packages/core/src/tools/taskTracker.ts
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string; // UUID 唯一标识
  title: string; // 任务标题
  description?: string; // 详细描述
  status: TaskStatus; // 当前状态
  priority: TaskPriority; // 优先级
  dependencies: string[]; // 依赖的任务 ID 列表
  parentId?: string; // 父任务 ID（子任务）
  tags: string[]; // 标签分类
  createdAt: string; // ISO 8601 创建时间
  updatedAt: string; // 最后更新时间
  completedAt?: string; // 完成时间
  metadata?: Record<string, unknown>;
}

export interface TaskCollection {
  version: string; projectId: string;
  tasks: Task[]; lastModified: string;
}`;

 const taskStoreCode = `export class TaskStore {
  private tasks: Map<string, Task> = new Map();
  private filePath: string;
  private dirty = false;

  constructor(projectRoot: string, storage: Storage) {
  this.filePath = path.join(storage.getProjectTempDir(), 'tasks', 'tasks.json');
  }

  async load(): Promise<void> {
  try {
  const collection: TaskCollection = JSON.parse(
  await fs.readFile(this.filePath, 'utf-8')
  );
  for (const task of collection.tasks) this.tasks.set(task.id, task);
  } catch { this.tasks.clear(); }
  }

  async save(): Promise<void> {
  if (!this.dirty) return;
  await fs.mkdir(path.dirname(this.filePath), { recursive: true });
  await fs.writeFile(this.filePath, JSON.stringify({
  version: '1.0', tasks: Array.from(this.tasks.values()),
  lastModified: new Date().toISOString(),
  }, null, 2));
  this.dirty = false;
  }

  add(task: Task): void { this.tasks.set(task.id, task); this.dirty = true; }
  get(id: string) { return this.tasks.get(id); }
  delete(id: string) { const r = this.tasks.delete(id); if (r) this.dirty = true; return r; }
  getAll(): Task[] { return Array.from(this.tasks.values()); }
  getByStatus(s: TaskStatus) { return this.getAll().filter(t => t.status === s); }
}`;

 const createTaskToolCode = `export const createTaskTool: ToolDefinition = {
  name: 'create_task',
  displayName: 'Create Task',
  description: '创建新的可追踪任务',
  parameters: {
  type: 'object',
  properties: {
  title: { type: 'string', description: '任务标题' },
  description: { type: 'string', description: '任务详细描述' },
  priority: { type: 'string', enum: ['low','medium','high','critical'] },
  dependencies: { type: 'array', items: { type: 'string' }, description: '依赖任务 ID' },
  parentId: { type: 'string', description: '父任务 ID' },
  tags: { type: 'array', items: { type: 'string' } },
  },
  required: ['title'],
  },
  async execute(args, context) {
  const tracker = context.getService<TaskTracker>('taskTracker');
  const task = tracker.createTask({ ...args, priority: args.priority ?? 'medium' });
  return { status: 'success', output: \`Task created: \${task.id} - \${task.title}\` };
  },
};`;

 const updateTaskToolCode = `export const updateTaskTool: ToolDefinition = {
  name: 'update_task',
  displayName: 'Update Task',
  parameters: {
  type: 'object',
  properties: {
  taskId: { type: 'string', description: '任务 ID' },
  status: { type: 'string', enum: ['pending','in_progress','completed','blocked'] },
  title: { type: 'string' },
  priority: { type: 'string', enum: ['low','medium','high','critical'] },
  },
  required: ['taskId'],
  },
  async execute(args, context) {
  const tracker = context.getService<TaskTracker>('taskTracker');
  // 状态转换验证：防止非法跳转
  if (args.status) {
  const v = tracker.validateTransition(args.taskId, args.status);
  if (!v.allowed) return { status: 'error', output: v.reason };
  }
  const updated = tracker.updateTask(args.taskId, args);
  if (!updated) return { status: 'error', output: 'Task not found' };
  return { status: 'success', output: \`\${updated.title} → \${updated.status}\` };
  },
};`;

 const listTasksResponse = `{
 "status": "success",
 "tasks": [
 { "id": "task-a1b2", "title": "实现用户认证", "status": "in_progress", "priority": "high",
 "subtasks": [
 { "id": "task-d4e5", "title": "设计 DB schema", "status": "completed" },
 { "id": "task-g7h8", "title": "实现 JWT 签发", "status": "in_progress" }
 ], "progress": "1/2 completed" },
 { "id": "task-j1k2", "title": "编写 API 文档", "status": "in_progress", "priority": "medium",
 "dependencies": ["task-a1b2"] }
 ],
 "summary": "2 in_progress, 1 blocked, 3 pending"
}`;

 const strategyCode = `export class TaskTrackerStrategy implements Strategy {
  name = 'task_tracker';

  /** 在系统提示中注入当前任务进度摘要 */
  getSystemPromptAddition(context: StrategyContext): string {
  const tasks = context.getService<TaskTracker>('taskTracker').getAllTasks();
  if (tasks.length === 0) return '';

  const count = (s: TaskStatus) => tasks.filter(t => t.status === s).length;
  let prompt = \`\\n## Tasks: \${count('completed')}/\${tasks.length} done, \`;
  prompt += \`\${count('in_progress')} active, \${count('blocked')} blocked\\n\`;

  // 列出进行中和 critical 任务
  for (const t of tasks.filter(t => t.status === 'in_progress' || t.priority === 'critical')) {
  prompt += \`- [\${t.status}] \${t.title}\\n\`;
  }
  return prompt;
  }

  /** 文件编辑成功后建议更新关联任务 */
  shouldAutoUpdate(result: ToolResult): boolean {
  return ['write_file', 'replace'].includes(result.toolName) && result.status === 'success';
  }
}`;

 const planModeCode = `export class PlanModeIntegration {
  /** 将计划步骤转化为可追踪任务，保留依赖关系 */
  async convertPlanToTasks(plan: PlanStep[], tracker: TaskTracker) {
  const stepToId = new Map<number, string>();

  return plan.map((step, i) => {
  const deps = step.dependsOn
  ?.map(idx => stepToId.get(idx))
  .filter((id): id is string => !!id) ?? [];
  const task = tracker.createTask({
  title: step.title, priority: step.critical ? 'critical' : 'medium',
  dependencies: deps, tags: ['plan-generated', \`step-\${i + 1}\`],
  });
  stepToId.set(i, task.id);
  return task;
  });
  }

  /** 返回所有依赖已满足的 pending 任务 ID */
  advancePlan(tracker: TaskTracker): string[] {
  return tracker.getAllTasks()
  .filter(t => t.status === 'pending'
  && t.dependencies.every(d => tracker.getTask(d)?.status === 'completed'))
  .map(t => t.id);
  }
}`;

 const persistenceCode = `// 存储路径: ~/.gemini/tmp/<project_hash>/tasks/
// ├── tasks.json # 主任务数据
// ├── tasks.json.backup # 自动备份
// └── history/ # 变更历史快照

export class TaskPersistence {
  private timer: NodeJS.Timer | null = null;

  startAutoSave(store: TaskStore, ms = 30_000) {
  this.timer = setInterval(() => store.save(), ms);
  }
  stopAutoSave() { if (this.timer) clearInterval(this.timer); }

  async backup(store: TaskStore) {
  await fs.copyFile(store.filePath, store.filePath + '.backup');
  }
  async restore(store: TaskStore): Promise<boolean> {
  try { await fs.copyFile(store.filePath + '.backup', store.filePath);
  await store.load(); return true;
  } catch { return false; }
  }
}`;

 const dependencyFlowChart = `flowchart LR
 A["Task A<br/>设计 Schema"] --> B["Task B<br/>实现 Model"]
 A --> C["Task C<br/>编写迁移脚本"]
 B --> D["Task D<br/>实现 API"]
 C --> D
 D --> E["Task E<br/>集成测试"]

 style A fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style B fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style C fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style D fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style E fill:${getThemeColor("--mermaid-muted-fill", "#f4f4f2")},color:${getThemeColor("--color-text", "#1c1917")}`;

 return (
 <div className="space-y-8">
 <QuickSummary
 isExpanded={isSummaryExpanded}
 onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
 />

 {/* 概述 */}
 <section id="overview">
 <h2 className="text-2xl font-bold text-heading mb-4">任务追踪系统</h2>
 <p className="text-body mb-4">
 TaskTracker 是 Gemini CLI 中用于管理复杂工作流的任务追踪系统。它通过一组 CRUD 工具让 AI
 能够将大型任务分解为可追踪的子任务，并管理任务之间的依赖关系、状态流转和进度可视化。
 </p>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <HighlightBox title="CRUD 工具" variant="blue">
 <p className="text-sm text-body">
 提供 createTask、listTasks、updateTask、deleteTask 四个工具，
 AI 可在对话中直接创建和管理任务。
 </p>
 </HighlightBox>
 <HighlightBox title="状态机管理" variant="green">
 <p className="text-sm text-body">
 任务在 pending、in_progress、completed、blocked 四种状态之间流转，
 支持依赖驱动的自动状态变更。
 </p>
 </HighlightBox>
 <HighlightBox title="可视化展示" variant="purple">
 <p className="text-sm text-body">
 在终端中以表格、进度条和依赖图的形式呈现任务状态，
 帮助用户直观了解工作进度。
 </p>
 </HighlightBox>
 </div>
 </section>

 {/* 架构设计 */}
 <section id="architecture">
 <h3 className="text-xl font-semibold text-heading mb-4">架构设计</h3>
 <MermaidDiagram chart={architectureChart} title="TaskTracker 系统架构" />

 <div className="mt-4 bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-3">核心组件</h4>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-body">
 <div>
 <p className="font-semibold text-heading mb-2">TaskTracker</p>
 <p>核心协调器，管理任务生命周期，处理状态转换验证和依赖关系检查。</p>
 </div>
 <div>
 <p className="font-semibold text-heading mb-2">TaskStore</p>
 <p>基于 Map 的内存存储加 JSON 文件持久化，提供高效的 CRUD 操作。</p>
 </div>
 <div>
 <p className="font-semibold text-heading mb-2">TaskVisualization</p>
 <p>将任务数据转换为终端友好的表格、进度条和依赖关系图。</p>
 </div>
 </div>
 </div>
 </section>

 {/* 状态机 */}
 <section id="state-machine">
 <h3 className="text-xl font-semibold text-heading mb-4">任务状态机</h3>
 <MermaidDiagram chart={stateMachineChart} title="任务状态流转" />

 <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { icon: '○', name: 'pending', desc: '等待开始', color: 'var(--color-warning)' },
 { icon: '◐', name: 'in_progress', desc: '执行中', color: 'var(--color-text)' },
 { icon: '●', name: 'completed', desc: '已完成', color: 'var(--color-text)' },
 { icon: '✕', name: 'blocked', desc: '被依赖阻塞', color: 'var(--color-danger)' },
 ].map(({ icon, name, desc, color }) => (
 <div key={name} className="bg-surface rounded-lg p-3 border" style={{ borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}>
 <div className="flex items-center gap-2 mb-1">
 <span style={{ color }}>{icon}</span>
 <span className="font-semibold" style={{ color }}>{name}</span>
 </div>
 <p className="text-xs text-dim">{desc}</p>
 </div>
 ))}
 </div>
 </section>

 {/* 数据模型 */}
 <Layer title="数据模型">
 <div className="space-y-4">
 <CodeBlock code={taskInterfaceCode} language="typescript" title="Task 接口定义" />
 <CodeBlock code={taskStoreCode} language="typescript" title="TaskStore 数据管理" />
 </div>
 </Layer>

 {/* 工具接口 */}
 <Layer title="工具接口">
 <div className="space-y-4">
 <CodeBlock code={createTaskToolCode} language="typescript" title="createTask 工具" />
 <CodeBlock code={updateTaskToolCode} language="typescript" title="updateTask 工具" />

 <h4 className="text-sm font-semibold text-dim">listTasks 响应示例</h4>
 <JsonBlock code={listTasksResponse} title="listTasks 返回结果" />

 <div className="overflow-x-auto">
 <table className="w-full text-sm border-collapse">
 <thead>
 <tr className="bg-surface">
 {['工具', '操作', '必需参数', '说明'].map(h => (
 <th key={h} className="border border-edge p-3 text-left text-body">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="text-body">
 {[
 ['create_task', 'Create', 'title', '创建新任务，返回任务 ID'],
 ['list_tasks', 'Read', '无', '列出任务，支持按状态/优先级过滤'],
 ['update_task', 'Update', 'taskId', '更新任务属性或状态'],
 ['delete_task', 'Delete', 'taskId', '删除任务，支持级联删除'],
 ].map(([tool, op, param, desc], i) => (
 <tr key={tool} className={i % 2 ? ' bg-surface/30' : ''}>
 <td className="border border-edge p-3"><code className="text-heading">{tool}</code></td>
 <td className="border border-edge p-3">{op}</td>
 <td className="border border-edge p-3"><code>{param}</code></td>
 <td className="border border-edge p-3">{desc}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </Layer>

 {/* 依赖关系 */}
 <Layer title="任务依赖关系">
 <div className="space-y-4">
 <MermaidDiagram chart={dependencyFlowChart} title="任务依赖关系示例" />
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="依赖检查规则" variant="blue">
 <div className="text-sm space-y-2 text-body">
 <ul className="list-disc pl-5 space-y-1">
 <li>不允许自依赖和循环依赖（A→B→C→A）</li>
 <li>依赖未完成时，任务自动进入 <code>blocked</code> 状态</li>
 <li>所有依赖完成后自动解除阻塞</li>
 </ul>
 </div>
 </HighlightBox>
 <HighlightBox title="依赖解除流程" variant="green">
 <div className="text-sm space-y-2 text-body">
 <ul className="list-disc pl-5 space-y-1">
 <li>任务完成时检查所有后续依赖任务</li>
 <li>后续任务的所有依赖都完成则解除阻塞</li>
 <li>支持链式触发和批量解除</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </div>
 </Layer>

 {/* 策略系统 */}
 <Layer title="Strategy 策略系统">
 <div className="space-y-4">
 <CodeBlock code={strategyCode} language="typescript" title="TaskTracker Strategy" />
 <HighlightBox title="策略工作原理" variant="purple">
 <div className="text-sm space-y-2 text-body">
 <p>AI 模型在多轮对话中可能丢失对整体任务进度的感知。Strategy 通过在每次请求的系统提示中注入当前任务状态摘要，确保 AI 始终了解哪些任务正在进行、哪些被阻塞、整体完成进度，以及下一步应关注什么。</p>
 <p>此外，当文件编辑工具成功执行后，Strategy 会自动建议 AI 更新相关任务的状态。</p>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 可视化 */}
 <Layer title="可视化展示">
 <div className="space-y-4">
 <div className="bg-base rounded-lg p-4 font-mono text-xs overflow-x-auto">
 <div className="text-dim mb-2"># 任务列表示例输出</div>
 <pre className="text-heading">{`┌──────────┬────────────────────────┬────────────┬────────┐
│ task-a1b2 │ ● 设计数据库 Schema │ completed │ HIGH │
│ task-d4e5 │ ◐ 实现用户 Model │ in_progress│ HIGH │
│ task-g7h8 │ ○ 编写 API 路由 │ pending │ MED │
│ task-j1k2 │ ✕ 集成测试 │ blocked │ MED │
└──────────┴────────────────────────┴────────────┴────────┘
Progress: [████████████████░░░░░░░░░░░░░░] 1/4 (25%)`}</pre>
 </div>
 <p className="text-sm text-body">
 TaskVisualization 提供 <code>renderTable()</code>、<code>renderProgress()</code> 和 <code>renderDependencyGraph()</code> 三个渲染方法。
 </p>
 </div>
 </Layer>

 {/* Plan Mode 协作 */}
 <section id="plan-mode-integration">
 <h3 className="text-xl font-semibold text-heading mb-4">与 Plan Mode 的协作</h3>
 <HighlightBox title="计划 → 任务转化" variant="purple">
 <div className="text-sm space-y-2 text-body">
 <p><strong>核心思想：</strong>Plan Mode 生成的执行计划可以自动转化为可追踪的任务列表。
 PlanModeIntegration 将每个计划步骤映射为一个 Task，保留步骤之间的依赖关系，使 AI 能够实时追踪执行进度、自动检测可执行步骤、在阻塞时跳转到其他可用步骤。</p>
 </div>
 </HighlightBox>
 <div className="mt-4">
 <CodeBlock code={planModeCode} language="typescript" title="Plan Mode 集成" />
 </div>
 </section>

 {/* 持久化 */}
 <Layer title="持久化机制">
 <div className="space-y-4">
 <CodeBlock code={persistenceCode} language="typescript" title="任务持久化" />
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="存储路径" variant="blue">
 <div className="text-sm space-y-2 text-body">
 <code className="block bg-base/30 px-2 py-1 rounded text-xs">
 ~/.gemini/tmp/&lt;project_hash&gt;/tasks/
 </code>
 <ul className="mt-2 space-y-1 text-xs">
 <li><code>tasks.json</code> - 主任务数据</li>
 <li><code>tasks.json.backup</code> - 自动备份</li>
 <li><code>history/</code> - 变更快照历史</li>
 </ul>
 </div>
 </HighlightBox>
 <HighlightBox title="自动保存策略" variant="green">
 <div className="text-sm space-y-2 text-body">
 <ul className="space-y-1">
 <li><strong>脏标记</strong>：仅在数据变化时写入磁盘</li>
 <li><strong>定时保存</strong>：每 30 秒自动检查并保存</li>
 <li><strong>即时保存</strong>：CRUD 操作后立即持久化</li>
 <li><strong>备份恢复</strong>：支持从 .backup 文件恢复</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </div>
 </Layer>

 {/* 设计决策 */}
 <Layer title="设计决策">
 <div className="space-y-4">
 {[
 { color: 'var(--color-text)', q: '为什么使用内存 Map + JSON 文件？',
 a: 'Map 作为内存结构，JSON 文件持久化。', points: [
 'Map O(1) 查找满足高频 CRUD 需求',
 '无需数据库依赖，JSON 人类可读便于调试',
 'CLI 场景任务数量有限，内存占用极小',
 ] },
 { color: 'var(--color-text)', q: '为什么通过 Strategy 注入任务上下文？',
 a: 'Strategy 模式在系统提示中注入任务状态。', points: [
 'AI 每轮对话都能看到最新任务进度',
 '与核心 Agent Loop 松耦合，可选启用',
 ] },
 { color: 'var(--color-warning)', q: '为什么不让 AI 直接管理状态？',
 a: '状态转换必须通过工具调用。', points: [
 '工具层强制执行状态转换规则，保证一致性',
 '所有变更通过工具调用记录，可追溯',
 '防止 AI 幻觉——声称完成了未完成的任务',
 ] },
 ].map(({ color, q, a, points }) => (
 <div key={q} className="bg-base/50 rounded-lg p-4 border-l-2" style={{ borderColor: color }}>
 <h4 className="font-bold mb-2" style={{ color }}>{q}</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策：</strong>{a}</p>
 <ul className="list-disc pl-5 space-y-1">
 {points.map(p => <li key={p}>{p}</li>)}
 </ul>
 </div>
 </div>
 ))}
 </div>
 </Layer>

 {/* 关键文件 */}
 <Layer title="关键文件与入口">
 <div className="grid grid-cols-1 gap-2 text-sm">
 {[
 ['packages/core/src/tools/taskTracker.ts', 'TaskTracker 核心实现'],
 ['packages/core/src/tools/taskStore.ts', 'TaskStore 数据存储层'],
 ['packages/core/src/tools/taskVisualization.ts', '任务可视化渲染'],
 ['packages/core/src/strategies/taskTrackerStrategy.ts', 'Strategy 策略注入'],
 ['packages/core/src/tools/taskPersistence.ts', '持久化与备份'],
 ].map(([path, desc]) => (
 <div key={path} className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">{path}</code>
 <span className="text-body">{desc}</span>
 </div>
 ))}
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
