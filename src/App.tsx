import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { PageLayout } from './components/PageLayout';
import { StartHere } from './pages/StartHere';
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
import { ToolSchedulerDetails } from './pages/ToolSchedulerDetails';
import './index.css';
import { flatNavItems } from './nav';

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
              {renderContent()}
            </PageLayout>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
