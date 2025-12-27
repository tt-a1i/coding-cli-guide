import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';

// 学习路径类型
interface LearningPath {
  id: string;
  title: string;
  icon: string;
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
    <div className="mb-8 bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🗺️</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">
            学习路径指南
          </span>
        </div>
        <span
          className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">
              🎯 如何使用本指南
            </h4>
            <p className="text-[var(--text-secondary)] text-sm">
              本指南根据不同的学习目标提供了多条学习路径。每条路径都有清晰的里程碑和检查点，
              帮助你系统性地理解 Qwen CLI 的架构。<strong>选择一条路径，按顺序学习</strong>
              是最高效的方式。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">
              ⚡ 快速开始建议
            </h4>
            <ul className="text-[var(--text-secondary)] text-sm space-y-1">
              <li>• <strong>想快速了解全貌？</strong> 选择「快速概览路径」</li>
              <li>• <strong>想开发工具/扩展？</strong> 选择「扩展开发路径」</li>
              <li>• <strong>想深入源码？</strong> 选择「架构师路径」</li>
              <li>• <strong>想改造项目？</strong> 选择「核心机制路径」</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">
              📊 学习进度追踪
            </h4>
            <p className="text-[var(--text-secondary)] text-sm">
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
  const difficultyColors = {
    beginner: 'var(--terminal-green)',
    intermediate: 'var(--amber)',
    advanced: 'var(--purple)',
  };

  const difficultyLabels = {
    beginner: '入门',
    intermediate: '中级',
    advanced: '高级',
  };

  return (
    <button
      onClick={onSelect}
      className={`p-4 rounded-xl border text-left transition-all w-full ${
        isSelected
          ? 'bg-[var(--bg-terminal)] border-[var(--terminal-green)]'
          : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{path.icon}</span>
        <div>
          <h3
            className="font-bold"
            style={{
              color: isSelected ? 'var(--terminal-green)' : 'var(--text-primary)',
            }}
          >
            {path.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span
              className="px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${difficultyColors[path.difficulty]}20`,
                color: difficultyColors[path.difficulty],
              }}
            >
              {difficultyLabels[path.difficulty]}
            </span>
            <span>⏱ {path.duration}</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">{path.description}</p>
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
    <div
      className={`rounded-lg border overflow-hidden transition-all ${
        isActive
          ? 'border-[var(--terminal-green)] bg-[var(--bg-terminal)]/50'
          : 'border-[var(--border-subtle)] bg-[var(--bg-card)]'
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              isActive
                ? 'bg-[var(--terminal-green)] text-[var(--bg-void)]'
                : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
            }`}
          >
            {index + 1}
          </div>
          <div>
            <h4
              className="font-semibold"
              style={{
                color: isActive ? 'var(--terminal-green)' : 'var(--text-primary)',
              }}
            >
              {step.title}
            </h4>
            <span className="text-xs text-[var(--text-muted)]">
              ⏱ {step.estimatedTime}
            </span>
          </div>
        </div>
        <span
          className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* 阅读页面 */}
          <div>
            <h5 className="text-xs text-[var(--text-muted)] mb-2">📚 阅读内容</h5>
            <div className="flex flex-wrap gap-2">
              {step.pages.map((page) => (
                <span
                  key={page}
                  className="px-2 py-1 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded text-xs"
                >
                  {page}
                </span>
              ))}
            </div>
          </div>

          {/* 核心概念 */}
          <div>
            <h5 className="text-xs text-[var(--text-muted)] mb-2">
              🎯 需要掌握的概念
            </h5>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              {step.keyConceptsCn.map((concept) => (
                <li key={concept} className="flex items-center gap-2">
                  <span className="text-[var(--terminal-green)]">•</span>
                  {concept}
                </li>
              ))}
            </ul>
          </div>

          {/* 检查点 */}
          {step.checkpoint && (
            <div className="p-3 bg-[var(--amber)]/10 rounded-lg border border-[var(--amber)]/30">
              <h5 className="text-xs text-[var(--amber)] font-bold mb-1">
                ✓ 检查点
              </h5>
              <p className="text-sm text-[var(--text-secondary)]">
                {step.checkpoint}
              </p>
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
        checkpoint: '能描述从 qwen 命令到 interactionLoop 的启动过程吗？',
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
        pages: ['Token计费系统', 'Token 计数动画', 'Token 限制匹配动画', 'Token 共享机制'],
        keyConceptsCn: [
          '理解 tokenLimits 匹配机制',
          '掌握文本和图像 Token 计算',
          '了解模型名归一化',
          '理解 SharedTokenManager 并发控制',
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
        pages: ['多厂商架构', 'API调用层', 'Qwen OAuth 详解'],
        keyConceptsCn: [
          '理解 Provider 抽象',
          '掌握格式转换管道',
          '了解 API 兼容性处理',
          '认识 OAuth Device Flow 和 PKCE',
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

    style CLI fill:#22d3ee15,stroke:#22d3ee
    style CORE fill:#10b98115,stroke:#10b981
    style SERVICES fill:#f59e0b15,stroke:#f59e0b
    style EXTERNAL fill:#a855f715,stroke:#a855f7
`;

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
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <span>🗺️</span> 架构全景图
        </h2>
        <MermaidDiagram chart={architectureMap} title="Qwen CLI 架构层次" />
        <p className="text-sm text-[var(--text-muted)] mt-2 text-center">
          每条学习路径都会覆盖上图的不同部分
        </p>
      </div>

      {/* 路径选择 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <span>🛤️</span> 选择你的学习路径
        </h2>
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
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span>{activePath.icon}</span> {activePath.title} 详细步骤
          </h2>
          <div className="text-sm text-[var(--text-muted)]">
            共 {activePath.steps.length} 个阶段 | 预计 {activePath.duration}
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
      <HighlightBox title="📝 高效学习建议" icon="💡" variant="blue">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-bold text-[var(--terminal-green)] mb-2">
              ✓ 推荐做法
            </h4>
            <ul className="text-[var(--text-secondary)] space-y-1">
              <li>• 按顺序学习，不要跳跃</li>
              <li>• 结合动画演示加深理解</li>
              <li>• 回答每个检查点问题</li>
              <li>• 阅读相关源代码文件</li>
              <li>• 实际运行 CLI 体验功能</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[var(--amber)] mb-2">⚠️ 避免做法</h4>
            <ul className="text-[var(--text-secondary)] space-y-1">
              <li>• 一次学习过多内容</li>
              <li>• 跳过基础直接看高级内容</li>
              <li>• 只看文档不动手实践</li>
              <li>• 忽略设计原理章节</li>
              <li>• 不回答检查点问题</li>
            </ul>
          </div>
        </div>
      </HighlightBox>

      {/* 进阶资源 */}
      <div className="mt-8 p-6 bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)]">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <span>📚</span> 进阶资源
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
            <div className="text-[var(--terminal-green)] font-bold mb-2">
              源码阅读
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              packages/core/src/core/geminiChat.ts 是最重要的入口点
            </p>
          </div>
          <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
            <div className="text-[var(--cyber-blue)] font-bold mb-2">
              实践项目
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              尝试开发一个自定义工具或 MCP 服务器
            </p>
          </div>
          <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
            <div className="text-[var(--purple)] font-bold mb-2">
              动画演示
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              「动画演示」和「内部机制动画」是最直观的学习方式
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
