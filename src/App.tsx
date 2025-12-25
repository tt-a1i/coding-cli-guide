import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { PageLayout } from './components/PageLayout';
import './index.css';
import { flatNavItems } from './nav';

// 首屏直接加载的页面
import { StartHere } from './pages/StartHere';
import { Overview } from './pages/Overview';

// 懒加载的页面
const EndToEndWalkthrough = lazy(() => import('./pages/EndToEndWalkthrough').then(m => ({ default: m.EndToEndWalkthrough })));
const UpstreamDiffOverview = lazy(() => import('./pages/UpstreamDiffOverview').then(m => ({ default: m.UpstreamDiffOverview })));
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
const ToolSchedulerAnimation = lazy(() => import('./pages/ToolSchedulerAnimation').then(m => ({ default: m.ToolSchedulerAnimation })));
const StreamingParserAnimation = lazy(() => import('./pages/StreamingParserAnimation').then(m => ({ default: m.StreamingParserAnimation })));
const MCPDiscoveryAnimation = lazy(() => import('./pages/MCPDiscoveryAnimation').then(m => ({ default: m.MCPDiscoveryAnimation })));
const ContextCompressionAnimation = lazy(() => import('./pages/ContextCompressionAnimation').then(m => ({ default: m.ContextCompressionAnimation })));
const SubagentAnimation = lazy(() => import('./pages/SubagentAnimation').then(m => ({ default: m.SubagentAnimation })));
const TurnInternalAnimation = lazy(() => import('./pages/TurnInternalAnimation').then(m => ({ default: m.TurnInternalAnimation })));
const FormatConverterAnimation = lazy(() => import('./pages/FormatConverterAnimation').then(m => ({ default: m.FormatConverterAnimation })));
const ChunkAssemblyAnimation = lazy(() => import('./pages/ChunkAssemblyAnimation').then(m => ({ default: m.ChunkAssemblyAnimation })));
const TokenCountingAnimation = lazy(() => import('./pages/TokenCountingAnimation').then(m => ({ default: m.TokenCountingAnimation })));
const FunctionResponseAnimation = lazy(() => import('./pages/FunctionResponseAnimation').then(m => ({ default: m.FunctionResponseAnimation })));
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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

  const activeTabLabel = useMemo(() => {
    const item = flatNavItems.find((i) => i.id === activeTab);
    return item?.label ?? 'Qwen CLI';
  }, [activeTab]);

  useEffect(() => {
    if (!isMobileSidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    if (!isMobileSidebarOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobileSidebarOpen]);

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
      case 'e2e':
        return <EndToEndWalkthrough />;
      case 'upstream-diff':
        return <UpstreamDiffOverview />;
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
      case 'tool-scheduler-anim':
        return <ToolSchedulerAnimation />;
      case 'streaming-parser-anim':
        return <StreamingParserAnimation />;
      case 'mcp-discovery-anim':
        return <MCPDiscoveryAnimation />;
      case 'context-compression-anim':
        return <ContextCompressionAnimation />;
      case 'subagent-anim':
        return <SubagentAnimation />;
      case 'turn-internal-anim':
        return <TurnInternalAnimation />;
      case 'format-converter-anim':
        return <FormatConverterAnimation />;
      case 'chunk-assembly-anim':
        return <ChunkAssemblyAnimation />;
      case 'token-counting-anim':
        return <TokenCountingAnimation />;
      case 'function-response-anim':
        return <FunctionResponseAnimation />;
      case 'code':
        return <CoreCode />;
      case 'loop':
        return <LoopMechanism />;
      default:
        return <StartHere onNavigate={(tab) => navigateToTab(tab)} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar activeTab={activeTab} onTabChange={(tab) => navigateToTab(tab)} />
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            aria-label="Close sidebar overlay"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            <Sidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                navigateToTab(tab);
                setIsMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Top Bar */}
        <div className="md:hidden sticky top-0 z-20 bg-gray-950/80 backdrop-blur border-b border-gray-800">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="px-3 py-2 rounded-lg bg-gray-900/30 border border-gray-800 text-gray-200 hover:bg-gray-800/40"
              aria-label="Open sidebar"
            >
              ☰
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-200 truncate">{activeTabLabel}</div>
              <div className="text-xs text-gray-500 truncate">
                搜索页面：Ctrl/⌘ + K
              </div>
            </div>
            <button
              onClick={() => navigateToTab('start-here')}
              className="px-3 py-2 rounded-lg bg-gray-900/30 border border-gray-800 text-gray-200 hover:bg-gray-800/40"
              aria-label="Go to start"
            >
              ⌂
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-4 md:p-8">
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
