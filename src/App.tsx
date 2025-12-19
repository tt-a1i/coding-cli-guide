import { useState } from 'react';
import { Tabs } from './components/Tabs';
import { Overview } from './pages/Overview';
import { AIToolInteraction } from './pages/AIToolInteraction';
import { LoopMechanism } from './pages/LoopMechanism';
import { ToolDetails } from './pages/ToolDetails';
import { Animation } from './pages/Animation';
import { CoreCode } from './pages/CoreCode';
import './index.css';

const tabs = [
  { id: 'overview', label: '项目概览' },
  { id: 'ai-tool', label: 'AI 工具交互', highlight: true },
  { id: 'loop', label: '循环机制', highlight: true },
  { id: 'tool-detail', label: '工具执行细节' },
  { id: 'animation', label: '完整动画' },
  { id: 'code', label: '核心代码' },
];

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'ai-tool':
        return <AIToolInteraction />;
      case 'loop':
        return <LoopMechanism />;
      case 'tool-detail':
        return <ToolDetails />;
      case 'animation':
        return <Animation />;
      case 'code':
        return <CoreCode />;
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
          深入理解 AI 工具交互机制
        </p>

        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="animate-fadeIn">{renderContent()}</div>
      </div>
    </div>
  );
}

export default App;
