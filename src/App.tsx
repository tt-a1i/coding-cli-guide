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
import { AtCommands } from './pages/AtCommands';
import './index.css';

const tabs = [
  // 基础
  { id: 'overview', label: '概览' },
  { id: 'startup', label: '启动流程' },
  { id: 'config', label: '配置系统' },
  { id: 'auth', label: '认证流程' },
  // 核心机制
  { id: 'lifecycle', label: '请求生命周期', highlight: true },
  { id: 'gemini-chat', label: '核心循环' },
  { id: 'content-gen', label: 'API调用层' },
  { id: 'memory', label: '上下文管理' },
  // 工具系统
  { id: 'tool-arch', label: '工具架构' },
  { id: 'tool-detail', label: '工具执行' },
  { id: 'ai-tool', label: 'AI工具交互' },
  // 命令系统
  { id: 'slash-cmd', label: '斜杠命令' },
  { id: 'at-cmd', label: '@命令' },
  // 扩展
  { id: 'subagent', label: '子代理系统' },
  { id: 'mcp', label: 'MCP集成' },
  { id: 'ui', label: 'UI渲染层' },
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
      case 'config':
        return <ConfigSystem />;
      case 'auth':
        return <AuthenticationFlow />;
      case 'lifecycle':
        return <RequestLifecycle />;
      case 'gemini-chat':
        return <GeminiChatCore />;
      case 'content-gen':
        return <ContentGeneratorDetails />;
      case 'memory':
        return <MemoryManagement />;
      case 'tool-arch':
        return <ToolSystemArchitecture />;
      case 'tool-detail':
        return <ToolDetails />;
      case 'ai-tool':
        return <AIToolInteraction />;
      case 'slash-cmd':
        return <SlashCommands />;
      case 'at-cmd':
        return <AtCommands />;
      case 'subagent':
        return <SubagentSystem />;
      case 'mcp':
        return <MCPIntegration />;
      case 'ui':
        return <UIRenderingLayer />;
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
