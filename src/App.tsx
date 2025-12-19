import { useState } from 'react';
import { Tabs } from './components/Tabs';
import { Overview } from './pages/Overview';
import { StartupFlow } from './pages/StartupFlow';
import { AIToolInteraction } from './pages/AIToolInteraction';
import { LoopMechanism } from './pages/LoopMechanism';
import { GeminiChatCore } from './pages/GeminiChatCore';
import { ContentGeneratorDetails } from './pages/ContentGeneratorDetails';
import { ToolDetails } from './pages/ToolDetails';
import { ToolSystemArchitecture } from './pages/ToolSystemArchitecture';
import { MCPIntegration } from './pages/MCPIntegration';
import { UIRenderingLayer } from './pages/UIRenderingLayer';
import { RequestLifecycle } from './pages/RequestLifecycle';
import { Animation } from './pages/Animation';
import { CoreCode } from './pages/CoreCode';
import { ConfigSystem } from './pages/ConfigSystem';
import { AuthenticationFlow } from './pages/AuthenticationFlow';
import { MemoryManagement } from './pages/MemoryManagement';
import { SubagentSystem } from './pages/SubagentSystem';
import { SlashCommands } from './pages/SlashCommands';
import { CustomCommands } from './pages/CustomCommands';
import { ShellModes } from './pages/ShellModes';
import { AtCommands } from './pages/AtCommands';
import { MemorySystemSplit } from './pages/MemorySystemSplit';
import { SystemPromptArch } from './pages/SystemPromptArch';
import { SandboxSystem } from './pages/SandboxSystem';
import { LoopDetection } from './pages/LoopDetection';
import { RetryFallback } from './pages/RetryFallback';
import { ErrorHandling } from './pages/ErrorHandling';
import { NonInteractiveMode } from './pages/NonInteractiveMode';
import { ExtensionSystem } from './pages/ExtensionSystem';
import { TelemetrySystem } from './pages/TelemetrySystem';
import { ThemeSystem } from './pages/ThemeSystem';
import { ApprovalModeSystem } from './pages/ApprovalModeSystem';
import { TrustedFolders } from './pages/TrustedFolders';
import { Checkpointing } from './pages/Checkpointing';
import { WelcomeBack } from './pages/WelcomeBack';
import { VisionModelSwitch } from './pages/VisionModelSwitch';
import { IDEIntegration } from './pages/IDEIntegration';
import { IDEDiffProtocol } from './pages/IDEDiffProtocol';
import { StartupChain } from './pages/StartupChain';
import { InteractionLoop } from './pages/InteractionLoop';
import { ToolReference } from './pages/ToolReference';
import './index.css';

const tabs = [
  // 基础
  { id: 'overview', label: '概览' },
  { id: 'startup', label: '启动流程' },
  { id: 'startup-chain', label: '启动链路', highlight: true },
  { id: 'config', label: '配置系统' },
  { id: 'auth', label: '认证流程' },
  // 核心机制
  { id: 'lifecycle', label: '请求生命周期', highlight: true },
  { id: 'interaction-loop', label: '交互主循环', highlight: true },
  { id: 'gemini-chat', label: '核心循环' },
  { id: 'system-prompt', label: 'Prompt构建' },
  { id: 'content-gen', label: 'API调用层' },
  { id: 'vlm-switch', label: 'VLM切换' },
  { id: 'memory', label: '上下文管理' },
  // 工具系统
  { id: 'tool-ref', label: '工具参考', highlight: true },
  { id: 'tool-arch', label: '工具架构' },
  { id: 'tool-detail', label: '工具执行' },
  { id: 'ai-tool', label: 'AI工具交互' },
  // 命令系统
  { id: 'slash-cmd', label: '斜杠命令' },
  { id: 'custom-cmd', label: '自定义命令', highlight: true },
  { id: 'shell-modes', label: 'Shell模式', highlight: true },
  { id: 'at-cmd', label: '@命令' },
  { id: 'memory-split', label: '记忆系统', highlight: true },
  // 扩展
  { id: 'subagent', label: '子代理系统' },
  { id: 'mcp', label: 'MCP集成' },
  { id: 'extension', label: '扩展系统' },
  { id: 'ide-integration', label: 'IDE集成' },
  { id: 'ide-diff', label: 'IDE Diff协议', highlight: true },
  // 安全与可靠性
  { id: 'approval-mode', label: '审批模式', highlight: true },
  { id: 'trusted-folders', label: '信任机制' },
  { id: 'checkpointing', label: '检查点恢复' },
  { id: 'sandbox', label: '沙箱系统' },
  { id: 'loop-detect', label: '循环检测' },
  { id: 'retry', label: '重试回退' },
  { id: 'error', label: '错误处理' },
  // 运行模式
  { id: 'non-interactive', label: '非交互模式' },
  { id: 'welcome-back', label: '会话恢复' },
  // UI与观测
  { id: 'ui', label: 'UI渲染层' },
  { id: 'theme', label: '主题系统' },
  { id: 'telemetry', label: '遥测系统' },
  // 演示
  { id: 'animation', label: '动画演示', highlight: true },
  { id: 'code', label: '核心代码' },
];

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'startup':
        return <StartupFlow />;
      case 'startup-chain':
        return <StartupChain />;
      case 'config':
        return <ConfigSystem />;
      case 'auth':
        return <AuthenticationFlow />;
      case 'lifecycle':
        return <RequestLifecycle />;
      case 'interaction-loop':
        return <InteractionLoop />;
      case 'gemini-chat':
        return <GeminiChatCore />;
      case 'system-prompt':
        return <SystemPromptArch />;
      case 'content-gen':
        return <ContentGeneratorDetails />;
      case 'vlm-switch':
        return <VisionModelSwitch />;
      case 'memory':
        return <MemoryManagement />;
      case 'tool-ref':
        return <ToolReference />;
      case 'tool-arch':
        return <ToolSystemArchitecture />;
      case 'tool-detail':
        return <ToolDetails />;
      case 'ai-tool':
        return <AIToolInteraction />;
      case 'slash-cmd':
        return <SlashCommands />;
      case 'custom-cmd':
        return <CustomCommands />;
      case 'shell-modes':
        return <ShellModes />;
      case 'at-cmd':
        return <AtCommands />;
      case 'memory-split':
        return <MemorySystemSplit />;
      case 'subagent':
        return <SubagentSystem />;
      case 'mcp':
        return <MCPIntegration />;
      case 'extension':
        return <ExtensionSystem />;
      case 'ide-integration':
        return <IDEIntegration />;
      case 'ide-diff':
        return <IDEDiffProtocol />;
      case 'approval-mode':
        return <ApprovalModeSystem />;
      case 'trusted-folders':
        return <TrustedFolders />;
      case 'checkpointing':
        return <Checkpointing />;
      case 'sandbox':
        return <SandboxSystem />;
      case 'loop-detect':
        return <LoopDetection />;
      case 'retry':
        return <RetryFallback />;
      case 'error':
        return <ErrorHandling />;
      case 'non-interactive':
        return <NonInteractiveMode />;
      case 'welcome-back':
        return <WelcomeBack />;
      case 'ui':
        return <UIRenderingLayer />;
      case 'theme':
        return <ThemeSystem />;
      case 'telemetry':
        return <TelemetrySystem />;
      case 'animation':
        return <Animation />;
      case 'code':
        return <CoreCode />;
      case 'loop':
        return <LoopMechanism />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen p-5">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-center text-4xl font-bold text-cyan-400 mb-2">
          Coding CLI 架构学习指南
        </h1>
        <p className="text-center text-gray-500 mb-8">
          深入理解 AI Coding CLI 的完整架构和工作原理
        </p>

        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="animate-fadeIn">{renderContent()}</div>
      </div>
    </div>
  );
}

export default App;
