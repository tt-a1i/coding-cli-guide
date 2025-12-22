import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { PageLayout } from './components/PageLayout';
import './index.css';
import { flatNavItems } from './nav';

// 首屏直接加载的页面
import { StartHere } from './pages/StartHere';
import { Overview } from './pages/Overview';

// 懒加载的页面
const StartupFlow = lazy(() => import('./pages/StartupFlow').then(m => ({ default: m.StartupFlow })));
const StartupChain = lazy(() => import('./pages/StartupChain').then(m => ({ default: m.StartupChain })));
const ConfigSystem = lazy(() => import('./pages/ConfigSystem').then(m => ({ default: m.ConfigSystem })));
const AuthenticationFlow = lazy(() => import('./pages/AuthenticationFlow').then(m => ({ default: m.AuthenticationFlow })));
const RequestLifecycle = lazy(() => import('./pages/RequestLifecycle').then(m => ({ default: m.RequestLifecycle })));
const InteractionLoop = lazy(() => import('./pages/InteractionLoop').then(m => ({ default: m.InteractionLoop })));
const GeminiChatCore = lazy(() => import('./pages/GeminiChatCore').then(m => ({ default: m.GeminiChatCore })));
const SystemPromptArch = lazy(() => import('./pages/SystemPromptArch').then(m => ({ default: m.SystemPromptArch })));
const ContentGeneratorDetails = lazy(() => import('./pages/ContentGeneratorDetails').then(m => ({ default: m.ContentGeneratorDetails })));
const VisionModelSwitch = lazy(() => import('./pages/VisionModelSwitch').then(m => ({ default: m.VisionModelSwitch })));
const MemoryManagement = lazy(() => import('./pages/MemoryManagement').then(m => ({ default: m.MemoryManagement })));
const ToolReference = lazy(() => import('./pages/ToolReference').then(m => ({ default: m.ToolReference })));
const ToolSchedulerDetails = lazy(() => import('./pages/ToolSchedulerDetails').then(m => ({ default: m.ToolSchedulerDetails })));
const ToolSystemArchitecture = lazy(() => import('./pages/ToolSystemArchitecture').then(m => ({ default: m.ToolSystemArchitecture })));
const ToolDetails = lazy(() => import('./pages/ToolDetails').then(m => ({ default: m.ToolDetails })));
const AIToolInteraction = lazy(() => import('./pages/AIToolInteraction').then(m => ({ default: m.AIToolInteraction })));
const SlashCommands = lazy(() => import('./pages/SlashCommands').then(m => ({ default: m.SlashCommands })));
const CustomCommands = lazy(() => import('./pages/CustomCommands').then(m => ({ default: m.CustomCommands })));
const ShellModes = lazy(() => import('./pages/ShellModes').then(m => ({ default: m.ShellModes })));
const AtCommands = lazy(() => import('./pages/AtCommands').then(m => ({ default: m.AtCommands })));
const MemorySystemSplit = lazy(() => import('./pages/MemorySystemSplit').then(m => ({ default: m.MemorySystemSplit })));
const SubagentSystem = lazy(() => import('./pages/SubagentSystem').then(m => ({ default: m.SubagentSystem })));
const MCPIntegration = lazy(() => import('./pages/MCPIntegration').then(m => ({ default: m.MCPIntegration })));
const ExtensionSystem = lazy(() => import('./pages/ExtensionSystem').then(m => ({ default: m.ExtensionSystem })));
const IDEIntegration = lazy(() => import('./pages/IDEIntegration').then(m => ({ default: m.IDEIntegration })));
const IDEDiffProtocol = lazy(() => import('./pages/IDEDiffProtocol').then(m => ({ default: m.IDEDiffProtocol })));
const ApprovalModeSystem = lazy(() => import('./pages/ApprovalModeSystem').then(m => ({ default: m.ApprovalModeSystem })));
const TrustedFolders = lazy(() => import('./pages/TrustedFolders').then(m => ({ default: m.TrustedFolders })));
const Checkpointing = lazy(() => import('./pages/Checkpointing').then(m => ({ default: m.Checkpointing })));
const SandboxSystem = lazy(() => import('./pages/SandboxSystem').then(m => ({ default: m.SandboxSystem })));
const LoopDetection = lazy(() => import('./pages/LoopDetection').then(m => ({ default: m.LoopDetection })));
const RetryFallback = lazy(() => import('./pages/RetryFallback').then(m => ({ default: m.RetryFallback })));
const ErrorHandling = lazy(() => import('./pages/ErrorHandling').then(m => ({ default: m.ErrorHandling })));
const NonInteractiveMode = lazy(() => import('./pages/NonInteractiveMode').then(m => ({ default: m.NonInteractiveMode })));
const WelcomeBack = lazy(() => import('./pages/WelcomeBack').then(m => ({ default: m.WelcomeBack })));
const UIRenderingLayer = lazy(() => import('./pages/UIRenderingLayer').then(m => ({ default: m.UIRenderingLayer })));
const ThemeSystem = lazy(() => import('./pages/ThemeSystem').then(m => ({ default: m.ThemeSystem })));
const TelemetrySystem = lazy(() => import('./pages/TelemetrySystem').then(m => ({ default: m.TelemetrySystem })));
const Animation = lazy(() => import('./pages/Animation').then(m => ({ default: m.Animation })));
const CoreCode = lazy(() => import('./pages/CoreCode').then(m => ({ default: m.CoreCode })));
const LoopMechanism = lazy(() => import('./pages/LoopMechanism').then(m => ({ default: m.LoopMechanism })));

// 页面加载 fallback
function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-3 text-gray-400">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>加载页面...</span>
      </div>
    </div>
  );
}

function App() {
  const validTabIds = useMemo(() => new Set(flatNavItems.map((i) => i.id)), []);

  const getTabFromUrl = useCallback(() => {
    const url = new URL(window.location.href);
    const tab = url.searchParams.get('tab') ?? 'start-here';
    return validTabIds.has(tab) ? tab : 'start-here';
  }, [validTabIds]);

  const [activeTab, setActiveTab] = useState(getTabFromUrl);

  const navigateToTab = useCallback(
    (tab: string, opts?: { replace?: boolean; preserveHash?: boolean }) => {
      const nextTab = validTabIds.has(tab) ? tab : 'start-here';
      const url = new URL(window.location.href);
      url.searchParams.set('tab', nextTab);
      if (!opts?.preserveHash) {
        url.hash = '';
      }
      if (opts?.replace) {
        window.history.replaceState({}, '', url);
      } else {
        window.history.pushState({}, '', url);
      }
      setActiveTab(nextTab);
    },
    [validTabIds]
  );

  useEffect(() => {
    const onPopState = () => {
      setActiveTab(getTabFromUrl());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [getTabFromUrl]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('tab')) {
      url.searchParams.set('tab', 'start-here');
      window.history.replaceState({}, '', url);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'start-here':
        return <StartHere onNavigate={(tab) => navigateToTab(tab)} />;
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
      case 'tool-scheduler':
        return <ToolSchedulerDetails />;
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
        return <StartHere onNavigate={(tab) => navigateToTab(tab)} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={(tab) => navigateToTab(tab)} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          <div className="animate-fadeIn">
            <PageLayout activeTab={activeTab} onNavigate={navigateToTab}>
              <Suspense fallback={<PageLoading />}>
                {renderContent()}
              </Suspense>
            </PageLayout>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
