import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



// 学习路径类型
interface LearningPath {
 id: string;
 title: string;
 icon?: string;
 description: string;
 duration: string;
 difficulty: 'beginner' | 'intermediate' | 'advanced';
 steps: LearningStep[];
}

interface LearningStep {
 title: string;
 pages: string[];
 keyConceptsCn: string[];
 estimatedTime: string;
 checkpoint?: string;
}

// 介绍组件
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
 <span className="text-2xl">🗺️</span>
 <span className="text-xl font-bold text-heading">
 学习路径指南
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
 <h4 className="text-heading font-bold mb-2">如何使用本指南
 </h4>
 <p className="text-body text-sm">
 本指南根据不同的学习目标提供了多条学习路径。每条路径都有清晰的里程碑和检查点，
 帮助你系统性地理解 Gemini CLI 的架构。<strong>选择一条路径，按顺序学习</strong>
 是最高效的方式。
 </p>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">快速开始建议
 </h4>
 <ul className="text-body text-sm space-y-1">
 <li><strong>想快速了解全貌？</strong> 选择「快速概览路径」</li>
 <li><strong>想开发工具/扩展？</strong> 选择「扩展开发路径」</li>
 <li><strong>想深入源码？</strong> 选择「架构师路径」</li>
 <li><strong>想改造项目？</strong> 选择「核心机制路径」</li>
 </ul>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">学习进度追踪
 </h4>
 <p className="text-body text-sm">
 每个步骤都有估算时间和检查点问题。当你能回答检查点问题时，
 说明你已经掌握了该阶段的核心概念，可以进入下一阶段。
 </p>
 </div>
 </div>
 )}
 </div>
 );
}

// 学习路径卡片
function PathCard({
 path,
 isSelected,
 onSelect,
}: {
 path: LearningPath;
 isSelected: boolean;
 onSelect: () => void;
}) {
 return (
 <button
 onClick={onSelect}
 className={`p-4 rounded-xl border text-left transition-all w-full ${
 isSelected
 ? 'bg-base border-edge'
 : ' bg-surface border-edge hover:border-edge-hover'
 }`}
 >
 <h3
 className="font-semibold mb-1"
 style={{
 color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
 }}
 >
 {path.title}
 </h3>
 <p className="text-sm text-body">{path.description}</p>
 </button>
 );
}

// 学习步骤详情
function StepDetail({
 step,
 index,
 isActive,
}: {
 step: LearningStep;
 index: number;
 isActive: boolean;
}) {
 const [isExpanded, setIsExpanded] = useState(isActive);

 return (
 <div className="border-b border-edge last:border-b-0">
 <button
 onClick={() => setIsExpanded(!isExpanded)}
 className="w-full py-3 flex items-center gap-3 text-left group"
 >
 <span className={`text-xs font-mono w-5 text-center shrink-0 ${isActive ? 'text-accent' : 'text-dim'}`}>
 {index + 1}
 </span>
 <span className={`flex-1 font-medium text-sm ${isActive ? 'text-accent' : 'text-heading'}`}>
 {step.title}
 </span>
 <svg
 className={`w-3 h-3 text-dim transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
 fill="none" stroke="currentColor" viewBox="0 0 24 24"
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </button>

 {isExpanded && (
 <div className="pl-8 pb-4 space-y-3">
 <div className="flex flex-wrap gap-1.5">
 {step.pages.map((page) => (
 <span key={page} className="px-2 py-0.5 bg-surface text-body rounded text-xs border border-edge">
 {page}
 </span>
 ))}
 </div>

 <ul className="text-sm text-body space-y-1">
 {step.keyConceptsCn.map((concept) => (
 <li key={concept}>{concept}</li>
 ))}
 </ul>

 {step.checkpoint && (
 <div className="text-sm text-dim border-l-2 border-edge pl-3">
 {step.checkpoint}
 </div>
 )}
 </div>
 )}
 </div>
 );
}

// 学习路径数据
const learningPaths: LearningPath[] = [
 {
 id: 'quick-overview',
 title: '快速概览路径',
 icon: '🚀',
 description: '用最少时间了解 CLI 全貌，适合快速入门',
 duration: '2-3 小时',
 difficulty: 'beginner',
 steps: [
 {
 title: '整体架构认知',
 pages: ['Start Here', '架构概览', '术语表'],
 keyConceptsCn: [
 '理解 CLI 层和 Core 层的分工',
 '认识核心组件：GeminiChat、Turn、Tool',
 '掌握基础术语：Turn、Chunk、Continuation',
 ],
 estimatedTime: '30 分钟',
 checkpoint: '能画出 CLI 的三层架构图吗？',
 },
 {
 title: '核心循环理解',
 pages: ['请求生命周期', '核心循环'],
 keyConceptsCn: [
 '理解用户输入到 AI 响应的完整流程',
 '认识 interactionLoop 的作用',
 '了解 Turn 执行的基本步骤',
 ],
 estimatedTime: '45 分钟',
 checkpoint: '能解释一次完整的用户交互包含哪些步骤吗？',
 },
 {
 title: '工具系统入门',
 pages: ['工具参考'],
 keyConceptsCn: [
 '了解内置工具的分类和作用',
 '理解工具调用的基本流程',
 '认识 ReadOnlyTool 和 EditTool 的区别',
 ],
 estimatedTime: '30 分钟',
 checkpoint: '能列举 5 个常用工具并说明用途吗？',
 },
 {
 title: '格式转换与流式',
 pages: ['格式转换详解', '流式响应处理'],
 keyConceptsCn: [
 '理解 Gemini/OpenAI 消息格式差异',
 '认识流式 Chunk 的解析过程',
 '了解 Tool Call 的流式组装',
 ],
 estimatedTime: '40 分钟',
 checkpoint: '能解释 AI 响应如何从流式变成完整消息吗？',
 },
 {
 title: '动画演示观看',
 pages: ['完整流程动画', '工具调度状态机动画'],
 keyConceptsCn: [
 '通过动画直观理解数据流',
 '观察状态机的状态转换',
 '理解异步事件的时序关系',
 ],
 estimatedTime: '45 分钟',
 checkpoint: '能描述工具调度经历哪几个状态吗？',
 },
 ],
 },
 {
 id: 'extension-dev',
 title: '扩展开发路径',
 icon: '🔧',
 description: '学习如何开发自定义工具、命令和扩展',
 duration: '4-6 小时',
 difficulty: 'intermediate',
 steps: [
 {
 title: '基础知识准备',
 pages: ['Start Here', '架构概览', '工具参考'],
 keyConceptsCn: [
 '理解 CLI 整体架构',
 '了解工具的分类和特点',
 '认识扩展点的位置',
 ],
 estimatedTime: '1 小时',
 checkpoint: '知道工具、命令、扩展三者的区别吗？',
 },
 {
 title: '工具开发学习',
 pages: ['工具开发指南', '工具架构', '工具执行'],
 keyConceptsCn: [
 '掌握 ToolBuilder 和 DeclarativeTool',
 '理解工具的 Kind 分类',
 '学会实现自定义工具',
 ],
 estimatedTime: '2 小时',
 checkpoint: '能实现一个简单的自定义工具吗？',
 },
 {
 title: '命令系统学习',
 pages: ['斜杠命令', '自定义命令'],
 keyConceptsCn: [
 '理解命令加载机制',
 '学习 .toml 配置格式',
 '掌握命令参数处理',
 ],
 estimatedTime: '1 小时',
 checkpoint: '能创建一个自定义斜杠命令吗？',
 },
 {
 title: 'MCP 集成学习',
 pages: ['MCP集成', 'MCP服务发现动画'],
 keyConceptsCn: [
 '理解 MCP 协议基础',
 '学习 MCP 服务器配置',
 '掌握工具/Prompt/资源暴露',
 ],
 estimatedTime: '1 小时',
 checkpoint: '知道如何配置一个 MCP 服务器吗？',
 },
 {
 title: 'IDE 集成',
 pages: ['Zed ACP协议', 'IDE集成', 'IDE Diff协议'],
 keyConceptsCn: [
 '理解 ACP 协议双向通信',
 '掌握文件系统代理机制',
 '了解 IDE 权限请求流程',
 ],
 estimatedTime: '1 小时',
 checkpoint: '能解释 CLI 如何作为 Zed 代理后端运行吗？',
 },
 ],
 },
 {
 id: 'core-mechanism',
 title: '核心机制路径',
 icon: '⚙️',
 description: '深入理解 CLI 的核心实现机制',
 duration: '8-12 小时',
 difficulty: 'advanced',
 steps: [
 {
 title: '启动与初始化',
 pages: ['启动链路', '启动流程', '配置系统'],
 keyConceptsCn: [
 '理解 CLI 启动的完整链路',
 '掌握配置层级和优先级',
 '了解依赖注入模式',
 ],
 estimatedTime: '1.5 小时',
 checkpoint: '能描述从 gemini 命令到 interactionLoop 的启动过程吗？',
 },
 {
 title: 'Turn 状态机',
 pages: ['Turn状态机', 'Turn 状态流转动画'],
 keyConceptsCn: [
 '理解 Turn 的生命周期',
 '掌握事件驱动架构',
 '了解 finishReason 的作用',
 ],
 estimatedTime: '2 小时',
 checkpoint: '能解释 Turn 中的事件流和状态变化吗？',
 },
 {
 title: 'Token 计费系统',
 pages: ['Token计费系统', 'Token 计数动画', 'Token 限制匹配动画'],
 keyConceptsCn: [
 '理解 tokenLimits 匹配机制',
 '掌握文本和图像 Token 计算',
 '了解模型名归一化',
 ],
 estimatedTime: '2 小时',
 checkpoint: '知道如何计算一次请求的 Token 数吗？',
 },
 {
 title: '会话持久化',
 pages: ['会话持久化', '上下文管理', '上下文压缩动画'],
 keyConceptsCn: [
 '理解会话记录机制',
 '掌握压缩触发和分割点算法',
 '了解 LLM 摘要生成',
 ],
 estimatedTime: '1.5 小时',
 checkpoint: '能解释 70% 压缩阈值的设计原因吗？',
 },
 {
 title: '服务层架构',
 pages: ['服务层架构'],
 keyConceptsCn: [
 '理解各服务的职责划分',
 '掌握设计模式的应用',
 '了解依赖注入实现',
 ],
 estimatedTime: '2 小时',
 checkpoint: '能说出 6 个核心服务及其作用吗？',
 },
 {
 title: '安全机制',
 pages: ['审批模式', '沙箱系统', '循环检测'],
 keyConceptsCn: [
 '理解权限审批流程',
 '掌握沙箱隔离机制',
 '了解循环检测策略',
 ],
 estimatedTime: '1.5 小时',
 checkpoint: '能解释三层循环检测的阈值设计吗？',
 },
 {
 title: '流式与配置',
 pages: ['流式响应处理', '模型配置机制'],
 keyConceptsCn: [
 '理解流式 Chunk 解析与合并',
 '掌握 StreamingToolCallParser 状态追踪',
 '了解模型配置的分层与缓存机制',
 ],
 estimatedTime: '1.5 小时',
 checkpoint: '能解释流式 JSON 修复策略和模型配置优先级吗？',
 },
 ],
 },
 {
 id: 'architect',
 title: '架构师路径',
 icon: '🏗️',
 description: '从架构角度全面理解设计决策和权衡',
 duration: '15-20 小时',
 difficulty: 'advanced',
 steps: [
 {
 title: '架构全景',
 pages: ['架构概览', '术语表', '服务层架构'],
 keyConceptsCn: [
 '建立完整的架构心智模型',
 '理解分层设计的意图',
 '认识核心抽象和边界',
 ],
 estimatedTime: '2 小时',
 checkpoint: '能画出完整的系统架构图并解释各层职责吗？',
 },
 {
 title: '多厂商架构',
 pages: ['多厂商架构', 'API调用层', 'Google OAuth 详解'],
 keyConceptsCn: [
 '理解 Provider 抽象',
 '掌握格式转换管道',
 '了解 API 兼容性处理',
 '认识 OAuth（loopback）登录与 PKCE',
 ],
 estimatedTime: '2.5 小时',
 checkpoint: '能解释如何添加新的 AI 厂商支持吗？',
 },
 {
 title: '工具系统深入',
 pages: ['工具调度详解', '工具开发指南', '工具架构'],
 keyConceptsCn: [
 '理解调度器状态机',
 '掌握工具生命周期',
 '了解并发控制策略',
 ],
 estimatedTime: '3 小时',
 checkpoint: '能设计一个新的工具类别并说明注册流程吗？',
 },
 {
 title: '扩展系统深入',
 pages: ['MCP集成', '扩展系统', '子代理系统'],
 keyConceptsCn: [
 '理解 MCP 协议实现',
 '掌握扩展发现机制',
 '了解子代理隔离设计',
 ],
 estimatedTime: '3 小时',
 checkpoint: '能设计一个完整的扩展包并说明配置方式吗？',
 },
 {
 title: '可靠性设计',
 pages: ['错误处理', '重试回退', '检查点恢复'],
 keyConceptsCn: [
 '理解错误分类和恢复策略',
 '掌握指数退避算法',
 '了解快照和回滚机制',
 ],
 estimatedTime: '2 小时',
 checkpoint: '能设计一个新功能的容错方案吗？',
 },
 {
 title: '性能与观测',
 pages: ['遥测系统', 'UI渲染层'],
 keyConceptsCn: [
 '理解 OpenTelemetry 集成',
 '掌握性能指标采集',
 '了解 React/Ink 渲染优化',
 ],
 estimatedTime: '2 小时',
 checkpoint: '能解释如何追踪一次请求的完整链路吗？',
 },
 {
 title: '设计权衡分析',
 pages: ['设计权衡分析', '错误恢复模式', '并发模式详解'],
 keyConceptsCn: [
 '理解架构决策的 Why/How/Trade-off',
 '掌握错误恢复策略和重试模式',
 '了解并发控制与资源管理',
 ],
 estimatedTime: '3 小时',
 checkpoint: '能评审新功能设计并指出潜在问题吗？',
 },
 ],
 },
];

// 架构地图
const architectureMap = `flowchart TB
 subgraph CLI["CLI 层"]
 UI["UI 渲染<br/>React + Ink"]
 CMD["命令系统<br/>斜杠命令"]
 CFG["配置系统<br/>多层配置"]
 end

 subgraph CORE["Core 层"]
 GC["GeminiChat<br/>主循环"]
 TURN["Turn<br/>响应周期"]
 SCHED["ToolScheduler<br/>工具调度"]
 end

 subgraph SERVICES["服务层"]
 FS["文件服务"]
 SHELL["Shell 服务"]
 GIT["Git 服务"]
 LOOP["循环检测"]
 end

 subgraph EXTERNAL["外部接口"]
 API["AI API"]
 MCP["MCP 服务"]
 IDE["IDE 集成"]
 end

 UI --> CMD
 CMD --> CFG
 CFG --> GC
 GC --> TURN
 TURN --> SCHED
 SCHED --> FS
 SCHED --> SHELL
 SCHED --> GIT
 TURN --> LOOP
 GC --> API
 GC --> MCP
 UI --> IDE

 style CLI stroke:#22d3ee
 style CORE stroke:#10b981
 style SERVICES stroke:${getThemeColor("--color-warning", "#b45309")}
 style EXTERNAL stroke:#a855f7
`;

const relatedPages: RelatedPage[] = [
 { id: 'start', label: 'Start Here', description: '快速入门起点' },
 { id: 'overview', label: '架构概览', description: '系统全景图' },
 { id: 'glossary', label: '术语表', description: '核心术语索引' },
 { id: 'tool-ref', label: '工具参考', description: '内置工具手册' },
 { id: 'gemini-chat', label: 'GeminiChat', description: '核心引擎详解' },
 { id: 'design-tradeoffs', label: '设计权衡', description: '架构决策分析' },
];

export function LearningPathGuide() {
 const [isIntroExpanded, setIsIntroExpanded] = useState(true);
 const [selectedPath, setSelectedPath] = useState<string>('quick-overview');
 const [currentStep, setCurrentStep] = useState(0);

 const activePath = learningPaths.find((p) => p.id === selectedPath)!;

 return (
 <div className="max-w-5xl mx-auto">
 <Introduction
 isExpanded={isIntroExpanded}
 onToggle={() => setIsIntroExpanded(!isIntroExpanded)}
 />

 {/* 架构概览地图 */}
 <div className="mb-8">
 <h2 className="text-xl font-bold text-heading mb-4 flex items-center gap-2">
 <span>🗺️</span> 架构全景图
 </h2>
 <MermaidDiagram chart={architectureMap} title="Gemini CLI 架构层次" />
 <p className="text-sm text-dim mt-2 text-center">
 每条学习路径都会覆盖上图的不同部分
 </p>
 </div>

 {/* 路径选择 */}
 <div className="mb-8">
 <h2 className="text-xl font-bold text-heading mb-4">选择你的学习路径</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {learningPaths.map((path) => (
 <PathCard
 key={path.id}
 path={path}
 isSelected={selectedPath === path.id}
 onSelect={() => {
 setSelectedPath(path.id);
 setCurrentStep(0);
 }}
 />
 ))}
 </div>
 </div>

 {/* 选中路径详情 */}
 <div className="mb-8">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-bold text-heading">
 {activePath.title} — 详细步骤
 </h2>
 <div className="text-sm text-dim">
 共 {activePath.steps.length} 个阶段
 </div>
 </div>

 <div className="space-y-4">
 {activePath.steps.map((step, index) => (
 <StepDetail
 key={index}
 step={step}
 index={index}
 isActive={index === currentStep}
 />
 ))}
 </div>
 </div>

 {/* 学习建议 */}
 <HighlightBox title="📝 高效学习建议" variant="blue">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div>
 <h4 className="font-bold text-heading mb-2">推荐做法
 </h4>
 <ul className="text-body space-y-1">
 <li>按顺序学习，不要跳跃</li>
 <li>结合动画演示加深理解</li>
 <li>回答每个检查点问题</li>
 <li>阅读相关源代码文件</li>
 <li>实际运行 CLI 体验功能</li>
 </ul>
 </div>
 <div>
 <h4 className="font-bold text-heading mb-2">避免做法</h4>
 <ul className="text-body space-y-1">
 <li>一次学习过多内容</li>
 <li>跳过基础直接看高级内容</li>
 <li>只看文档不动手实践</li>
 <li>忽略设计原理章节</li>
 <li>不回答检查点问题</li>
 </ul>
 </div>
 </div>
 </HighlightBox>

 {/* 进阶资源 */}
 <div className="mt-12">
 <h3 className="text-lg font-semibold text-heading mb-4">进阶资源</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div>
 <div className="text-heading font-medium mb-1">源码阅读</div>
 <p className="text-sm text-dim">
 <code>geminiChat.ts</code> 是最重要的入口点
 </p>
 </div>
 <div>
 <div className="text-heading font-medium mb-1">实践项目</div>
 <p className="text-sm text-dim">尝试开发一个自定义工具或 MCP 服务器</p>
 </div>
 <div>
 <div className="text-heading font-medium mb-1">动画演示</div>
 <p className="text-sm text-dim">动画演示页面是最直观的学习方式</p>
 </div>
 </div>
 </div>

 {/* 为什么这样设计 */}
 <div className="mt-12" />
 <Layer title="为什么这样设计">
 <div className="space-y-4">
 <div className="bg-surface rounded-lg p-5 border border-edge/30">
 <h4 className="text-heading font-bold font-mono mb-3">渐进式学习路径</h4>
 <p className="text-body text-sm leading-relaxed">
 不同读者有不同的学习目标和时间预算。快速概览路径让人在 2-3 小时内建立全局认知，
 而架构师路径则提供 15-20 小时的深度学习。每条路径都有明确的检查点，
 确保学习者真正理解了当前阶段的内容再继续。
 </p>
 </div>

 <div className="pl-5 border-l-2 border-l-edge-hover border-l-edge-hover/30">
 <h4 className="text-heading font-bold font-mono mb-3">目标导向设计</h4>
 <p className="text-body text-sm leading-relaxed">
 每条路径针对特定目标：想开发扩展的选扩展开发路径，想理解核心机制的选核心机制路径。
 这种设计避免了读者在不相关的内容上浪费时间，同时保证覆盖达到目标所需的全部知识点。
 </p>
 </div>

 <div className="bg-surface rounded-lg p-5 border border-edge/30">
 <h4 className="text-heading font-bold font-mono mb-3">可验证的学习成果</h4>
 <p className="text-body text-sm leading-relaxed">
 每个步骤都有检查点问题，这不仅帮助读者自我评估，也提供了学习的里程碑感。
 能回答检查点问题说明真正掌握了该阶段内容，而不是走马观花地浏览。
 </p>
 </div>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
