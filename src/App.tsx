import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { PageLayout } from './components/PageLayout';
import './index.css';
import { flatNavItems } from './nav';

// 首屏直接加载的页面
import { StartHere } from './pages/StartHere';
import { Overview } from './pages/Overview';

// 懒加载的页面
const Glossary = lazy(() => import('./pages/Glossary'));
const LearningPathGuide = lazy(() => import('./pages/LearningPathGuide').then(m => ({ default: m.LearningPathGuide })));
const EndToEndWalkthrough = lazy(() => import('./pages/EndToEndWalkthrough').then(m => ({ default: m.EndToEndWalkthrough })));
const StartupFlow = lazy(() => import('./pages/StartupFlow').then(m => ({ default: m.StartupFlow })));
const StartupChain = lazy(() => import('./pages/StartupChain').then(m => ({ default: m.StartupChain })));
const ConfigSystem = lazy(() => import('./pages/ConfigSystem').then(m => ({ default: m.ConfigSystem })));
const AuthenticationFlow = lazy(() => import('./pages/AuthenticationFlow').then(m => ({ default: m.AuthenticationFlow })));
const RequestLifecycle = lazy(() => import('./pages/RequestLifecycle').then(m => ({ default: m.RequestLifecycle })));
const InteractionLoop = lazy(() => import('./pages/InteractionLoop').then(m => ({ default: m.InteractionLoop })));
const GeminiChatCore = lazy(() => import('./pages/GeminiChatCore').then(m => ({ default: m.GeminiChatCore })));
const ServicesArchitecture = lazy(() => import('./pages/ServicesArchitecture').then(m => ({ default: m.ServicesArchitecture })));
const SystemPromptArch = lazy(() => import('./pages/SystemPromptArch').then(m => ({ default: m.SystemPromptArch })));
const ContentGeneratorDetails = lazy(() => import('./pages/ContentGeneratorDetails').then(m => ({ default: m.ContentGeneratorDetails })));
const MultiProviderArchitecture = lazy(() => import('./pages/MultiProviderArchitecture').then(m => ({ default: m.MultiProviderArchitecture })));
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
const AgentSkills = lazy(() => import('./pages/AgentSkills').then(m => ({ default: m.AgentSkills })));
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
const MCPHandshakeAnimation = lazy(() => import('./pages/MCPHandshakeAnimation').then(m => ({ default: m.MCPHandshakeAnimation })));
const PermissionApprovalAnimation = lazy(() => import('./pages/PermissionApprovalAnimation').then(m => ({ default: m.PermissionApprovalAnimation })));
const SubagentConfigAnimation = lazy(() => import('./pages/SubagentConfigAnimation').then(m => ({ default: m.SubagentConfigAnimation })));
const HistoryCompressionAnimation = lazy(() => import('./pages/HistoryCompressionAnimation').then(m => ({ default: m.HistoryCompressionAnimation })));
const StreamingToolCallParserAnimation = lazy(() => import('./pages/StreamingToolCallParserAnimation').then(m => ({ default: m.StreamingToolCallParserAnimation })));
const LoopDetectionAnimation = lazy(() => import('./pages/LoopDetectionAnimation').then(m => ({ default: m.LoopDetectionAnimation })));
const HookEventAnimation = lazy(() => import('./pages/HookEventAnimation').then(m => ({ default: m.HookEventAnimation })));
const PolicyDecisionAnimation = lazy(() => import('./pages/PolicyDecisionAnimation').then(m => ({ default: m.PolicyDecisionAnimation })));
const MessageBusAnimation = lazy(() => import('./pages/MessageBusAnimation').then(m => ({ default: m.MessageBusAnimation })));
const RoutingChainAnimation = lazy(() => import('./pages/RoutingChainAnimation').then(m => ({ default: m.RoutingChainAnimation })));
const AgentLoopAnimation = lazy(() => import('./pages/AgentLoopAnimation').then(m => ({ default: m.AgentLoopAnimation })));
const RequestTokenizerAnimation = lazy(() => import('./pages/RequestTokenizerAnimation').then(m => ({ default: m.RequestTokenizerAnimation })));
const ResultCacheAnimation = lazy(() => import('./pages/ResultCacheAnimation').then(m => ({ default: m.ResultCacheAnimation })));
const TerminalSerializerAnimation = lazy(() => import('./pages/TerminalSerializerAnimation').then(m => ({ default: m.TerminalSerializerAnimation })));
const ContentConverterAnimation = lazy(() => import('./pages/ContentConverterAnimation').then(m => ({ default: m.ContentConverterAnimation })));
const MultiProviderPipelineAnimation = lazy(() => import('./pages/MultiProviderPipelineAnimation'));
const SmartEditAnimation = lazy(() => import('./pages/SmartEditAnimation').then(m => ({ default: m.SmartEditAnimation })));
const VimBufferAnimation = lazy(() => import('./pages/VimBufferAnimation').then(m => ({ default: m.VimBufferAnimation })));
const ChatCompressionAnimation = lazy(() => import('./pages/ChatCompressionAnimation').then(m => ({ default: m.ChatCompressionAnimation })));
const PromptTemplateAnimation = lazy(() => import('./pages/PromptTemplateAnimation'));
const MessageFormatPipelineAnimation = lazy(() => import('./pages/MessageFormatPipelineAnimation'));
const StreamingDecoderAnimation = lazy(() => import('./pages/StreamingDecoderAnimation'));
const ToolSchedulerQueueAnimation = lazy(() => import('./pages/ToolSchedulerQueueAnimation'));
const SessionStateMachineAnimation = lazy(() => import('./pages/SessionStateMachineAnimation'));
const SandboxPolicyAnimation = lazy(() => import('./pages/SandboxPolicyAnimation'));
const CommandInjectionDetectionAnimation = lazy(() => import('./pages/CommandInjectionDetectionAnimation'));
const LoopDetectionEngineAnimation = lazy(() => import('./pages/LoopDetectionEngineAnimation'));
const ContentGenerationPipelineAnimation = lazy(() => import('./pages/ContentGenerationPipelineAnimation'));
const StreamingResponseAnimation = lazy(() => import('./pages/StreamingResponseAnimation'));
const OAuthDeviceFlowAnimation = lazy(() => import('./pages/OAuthDeviceFlowAnimation'));
const MCPClientConnectionAnimation = lazy(() => import('./pages/MCPClientConnectionAnimation'));
const ReactToolSchedulerAnimation = lazy(() => import('./pages/ReactToolSchedulerAnimation'));
const SessionMetricsAnimation = lazy(() => import('./pages/SessionMetricsAnimation'));
const GeminiChatFlowAnimation = lazy(() => import('./pages/GeminiChatFlowAnimation'));
const TokenLimitMatcherAnimation = lazy(() => import('./pages/TokenLimitMatcherAnimation'));
const ShellInjectionProcessorAnimation = lazy(() => import('./pages/ShellInjectionProcessorAnimation'));
const AtFileProcessorAnimation = lazy(() => import('./pages/AtFileProcessorAnimation'));
const ImageTokenizerAnimation = lazy(() => import('./pages/ImageTokenizerAnimation'));
const ExponentialBackoffAnimation = lazy(() => import('./pages/ExponentialBackoffAnimation'));
const BfsFileSearchAnimation = lazy(() => import('./pages/BfsFileSearchAnimation'));
const InjectionParserAnimation = lazy(() => import('./pages/InjectionParserAnimation'));
const LruCacheAnimation = lazy(() => import('./pages/LruCacheAnimation'));
const PtyLifecycleAnimation = lazy(() => import('./pages/PtyLifecycleAnimation'));
const StreamingJsonParserAnimation = lazy(() => import('./pages/StreamingJsonParserAnimation'));
const VimCompositeActionsAnimation = lazy(() => import('./pages/VimCompositeActionsAnimation'));
const PromptProcessingPipelineAnimation = lazy(() => import('./pages/PromptProcessingPipelineAnimation'));
const SlashCommandExecutionAnimation = lazy(() => import('./pages/SlashCommandExecutionAnimation'));
const MemoryImportProcessorAnimation = lazy(() => import('./pages/animations/MemoryImportProcessorAnimation').then(m => ({ default: m.MemoryImportProcessorAnimation })));
const CommandLoadingAnimation = lazy(() => import('./pages/animations/CommandLoadingAnimation').then(m => ({ default: m.CommandLoadingAnimation })));
const ToolConfirmationFlowAnimation = lazy(() => import('./pages/animations/ToolConfirmationFlowAnimation').then(m => ({ default: m.ToolConfirmationFlowAnimation })));
const TurnStateMachine = lazy(() => import('./pages/TurnStateMachine').then(m => ({ default: m.TurnStateMachine })));
const TokenAccountingSystem = lazy(() => import('./pages/TokenAccountingSystem').then(m => ({ default: m.TokenAccountingSystem })));
const SessionPersistence = lazy(() => import('./pages/SessionPersistence').then(m => ({ default: m.SessionPersistence })));
const ToolDeveloperGuide = lazy(() => import('./pages/ToolDeveloperGuide').then(m => ({ default: m.ToolDeveloperGuide })));
const FileDiscovery = lazy(() => import('./pages/FileDiscovery').then(m => ({ default: m.FileDiscovery })));
const CoreCode = lazy(() => import('./pages/CoreCode').then(m => ({ default: m.CoreCode })));
const LoopMechanism = lazy(() => import('./pages/LoopMechanism').then(m => ({ default: m.LoopMechanism })));
const EnterpriseDeployment = lazy(() => import('./pages/EnterpriseDeployment').then(m => ({ default: m.EnterpriseDeployment })));
const ModelConfigCacheAnimation = lazy(() => import('./pages/ModelConfigCacheAnimation'));
const SubagentResolutionAnimation = lazy(() => import('./pages/SubagentResolutionAnimation'));
const ShadowGitCheckpointAnimation = lazy(() => import('./pages/ShadowGitCheckpointAnimation'));
const ChatRecordingAnimation = lazy(() => import('./pages/ChatRecordingAnimation'));
const SubagentArchitecture = lazy(() => import('./pages/SubagentArchitecture').then(m => ({ default: m.SubagentArchitecture })));
const TokenManagementStrategy = lazy(() => import('./pages/TokenManagementStrategy').then(m => ({ default: m.TokenManagementStrategy })));
const HookSystem = lazy(() => import('./pages/HookSystem').then(m => ({ default: m.HookSystem })));
const PolicyEngine = lazy(() => import('./pages/PolicyEngine').then(m => ({ default: m.PolicyEngine })));
const MessageBus = lazy(() => import('./pages/MessageBus').then(m => ({ default: m.MessageBus })));
const ModelRouting = lazy(() => import('./pages/ModelRouting').then(m => ({ default: m.ModelRouting })));
const ModelAvailability = lazy(() => import('./pages/ModelAvailability').then(m => ({ default: m.ModelAvailability })));
const AgentFramework = lazy(() => import('./pages/AgentFramework').then(m => ({ default: m.AgentFramework })));
const ContentFormatConversion = lazy(() => import('./pages/ContentFormatConversion').then(m => ({ default: m.ContentFormatConversion })));
const CommandExecutionContext = lazy(() => import('./pages/CommandExecutionContext').then(m => ({ default: m.CommandExecutionContext })));
const GoogleAuthentication = lazy(() => import('./pages/GoogleAuthentication').then(m => ({ default: m.GoogleAuthentication })));
const StreamingResponseProcessing = lazy(() => import('./pages/StreamingResponseProcessing').then(m => ({ default: m.StreamingResponseProcessing })));
const ZedIntegration = lazy(() => import('./pages/ZedIntegration').then(m => ({ default: m.ZedIntegration })));
const ModelConfiguration = lazy(() => import('./pages/ModelConfiguration').then(m => ({ default: m.ModelConfiguration })));
const DesignTradeoffs = lazy(() => import('./pages/DesignTradeoffs').then(m => ({ default: m.DesignTradeoffs })));
const ErrorRecoveryPatterns = lazy(() => import('./pages/ErrorRecoveryPatterns').then(m => ({ default: m.ErrorRecoveryPatterns })));
const ConcurrencyPatterns = lazy(() => import('./pages/ConcurrencyPatterns').then(m => ({ default: m.ConcurrencyPatterns })));
const GitServiceDeep = lazy(() => import('./pages/GitServiceDeep').then(m => ({ default: m.GitServiceDeep })));
const ShellExecutionServiceDeep = lazy(() => import('./pages/ShellExecutionServiceDeep').then(m => ({ default: m.ShellExecutionServiceDeep })));
const TokenLifecycleOverview = lazy(() => import('./pages/TokenLifecycleOverview').then(m => ({ default: m.TokenLifecycleOverview })));
const ErrorRecoveryDecisionTree = lazy(() => import('./pages/ErrorRecoveryDecisionTree').then(m => ({ default: m.ErrorRecoveryDecisionTree })));
const IDEIntegrationOverview = lazy(() => import('./pages/IDEIntegrationOverview').then(m => ({ default: m.IDEIntegrationOverview })));
const FallbackSystem = lazy(() => import('./pages/FallbackSystem').then(m => ({ default: m.FallbackSystem })));
const ChatRecording = lazy(() => import('./pages/ChatRecording').then(m => ({ default: m.ChatRecording })));
const PromptRegistry = lazy(() => import('./pages/PromptRegistry').then(m => ({ default: m.PromptRegistry })));
const CommandLoading = lazy(() => import('./pages/CommandLoading').then(m => ({ default: m.CommandLoading })));
const PromptProcessors = lazy(() => import('./pages/PromptProcessors').then(m => ({ default: m.PromptProcessors })));
const UIStateManagement = lazy(() => import('./pages/UIStateManagement').then(m => ({ default: m.UIStateManagement })));
const KeyBindings = lazy(() => import('./pages/KeyBindings').then(m => ({ default: m.KeyBindings })));
const SettingsManager = lazy(() => import('./pages/SettingsManager').then(m => ({ default: m.SettingsManager })));
const QuotaDetection = lazy(() => import('./pages/QuotaDetection').then(m => ({ default: m.QuotaDetection })));
const SummarizerSystem = lazy(() => import('./pages/SummarizerSystem').then(m => ({ default: m.SummarizerSystem })));
const OutputFormatter = lazy(() => import('./pages/OutputFormatter').then(m => ({ default: m.OutputFormatter })));
const CodeAssist = lazy(() => import('./pages/CodeAssist').then(m => ({ default: m.CodeAssist })));
const ReactHooksOverview = lazy(() => import('./pages/ReactHooksOverview').then(m => ({ default: m.ReactHooksOverview })));
const UIComponents = lazy(() => import('./pages/UIComponents').then(m => ({ default: m.UIComponents })));
const TextBuffer = lazy(() => import('./pages/TextBuffer').then(m => ({ default: m.TextBuffer })));
const ChatCompression = lazy(() => import('./pages/ChatCompression').then(m => ({ default: m.ChatCompression })));
const NonInteractiveDeep = lazy(() => import('./pages/NonInteractiveDeep').then(m => ({ default: m.NonInteractiveDeep })));
const IDEClient = lazy(() => import('./pages/IDEClient').then(m => ({ default: m.IDEClient })));
const MessageRendering = lazy(() => import('./pages/MessageRendering').then(m => ({ default: m.MessageRendering })));
const ContextSystem = lazy(() => import('./pages/ContextSystem').then(m => ({ default: m.ContextSystem })));

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
    return item?.label ?? 'Gemini CLI';
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
      case 'overview':
        return <Overview />;
      case 'learning-path':
        return <LearningPathGuide />;
      case 'glossary':
        return <Glossary onNavigate={(tab) => navigateToTab(tab)} />;
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
      case 'turn-state-machine':
        return <TurnStateMachine />;
      case 'token-accounting':
        return <TokenAccountingSystem />;
      case 'token-lifecycle-overview':
        return <TokenLifecycleOverview />;
      case 'session-persistence':
        return <SessionPersistence />;
      case 'services-arch':
        return <ServicesArchitecture />;
      case 'git-service-deep':
        return <GitServiceDeep />;
      case 'shell-execution-service-deep':
        return <ShellExecutionServiceDeep />;
      case 'system-prompt':
        return <SystemPromptArch />;
      case 'content-gen':
        return <ContentGeneratorDetails />;
      case 'multi-provider':
        return <MultiProviderArchitecture />;
      case 'vlm-switch':
        return <VisionModelSwitch />;
      case 'memory':
        return <MemoryManagement />;
      case 'tool-ref':
        return <ToolReference />;
      case 'tool-dev-guide':
        return <ToolDeveloperGuide />;
      case 'file-discovery':
        return <FileDiscovery />;
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
      case 'agent-framework':
        return <AgentFramework />;
      case 'agent-skills':
        return <AgentSkills />;
      case 'subagent':
        return <SubagentSystem />;
      case 'mcp':
        return <MCPIntegration />;
      case 'extension':
        return <ExtensionSystem />;
      case 'ide-integration':
        return <IDEIntegration />;
      case 'ide-integration-overview':
        return <IDEIntegrationOverview />;
      case 'ide-diff':
        return <IDEDiffProtocol />;
      case 'hook-system':
        return <HookSystem />;
      case 'policy-engine':
        return <PolicyEngine />;
      case 'message-bus':
        return <MessageBus />;
      case 'model-routing':
        return <ModelRouting />;
      case 'model-availability':
        return <ModelAvailability />;
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
      case 'error-recovery-decision-tree':
        return <ErrorRecoveryDecisionTree />;
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
      case 'slash-cmd-exec-anim':
        return <SlashCommandExecutionAnimation />;
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
      case 'mcp-handshake-anim':
        return <MCPHandshakeAnimation />;
      case 'permission-approval-anim':
        return <PermissionApprovalAnimation />;
      case 'subagent-config-anim':
        return <SubagentConfigAnimation />;
      case 'history-compression-anim':
        return <HistoryCompressionAnimation />;
      case 'streaming-tool-parser-anim':
        return <StreamingToolCallParserAnimation />;
      case 'loop-detection-anim':
        return <LoopDetectionAnimation />;
      case 'hook-event-anim':
        return <HookEventAnimation />;
      case 'policy-decision-anim':
        return <PolicyDecisionAnimation />;
      case 'message-bus-anim':
        return <MessageBusAnimation />;
      case 'routing-chain-anim':
        return <RoutingChainAnimation />;
      case 'agent-loop-anim':
        return <AgentLoopAnimation />;
      case 'request-tokenizer-anim':
        return <RequestTokenizerAnimation />;
      case 'result-cache-anim':
        return <ResultCacheAnimation />;
      case 'terminal-serializer-anim':
        return <TerminalSerializerAnimation />;
      case 'content-converter-anim':
        return <ContentConverterAnimation />;
      case 'multi-provider-pipeline-anim':
        return <MultiProviderPipelineAnimation />;
      case 'smart-edit-anim':
        return <SmartEditAnimation />;
      case 'vim-buffer-anim':
        return <VimBufferAnimation />;
      case 'chat-compression-anim':
        return <ChatCompressionAnimation />;
      case 'prompt-template-anim':
        return <PromptTemplateAnimation />;
      case 'message-format-anim':
        return <MessageFormatPipelineAnimation />;
      case 'streaming-decoder-anim':
        return <StreamingDecoderAnimation />;
      case 'tool-scheduler-queue-anim':
        return <ToolSchedulerQueueAnimation />;
      case 'session-state-anim':
        return <SessionStateMachineAnimation />;
      case 'sandbox-policy-anim':
        return <SandboxPolicyAnimation />;
      case 'command-injection-anim':
        return <CommandInjectionDetectionAnimation />;
      case 'loop-detection-engine-anim':
        return <LoopDetectionEngineAnimation />;
      case 'content-pipeline-anim':
        return <ContentGenerationPipelineAnimation />;
      case 'streaming-response-anim':
        return <StreamingResponseAnimation />;
      case 'oauth-device-flow-anim':
        return <OAuthDeviceFlowAnimation />;
      case 'mcp-client-connection-anim':
        return <MCPClientConnectionAnimation />;
      case 'react-tool-scheduler-anim':
        return <ReactToolSchedulerAnimation />;
      case 'session-metrics-anim':
        return <SessionMetricsAnimation />;
      case 'gemini-chat-flow-anim':
        return <GeminiChatFlowAnimation />;
      case 'token-limit-matcher-anim':
        return <TokenLimitMatcherAnimation />;
      case 'shell-injection-anim':
        return <ShellInjectionProcessorAnimation />;
      case 'at-file-processor-anim':
        return <AtFileProcessorAnimation />;
      case 'image-tokenizer-anim':
        return <ImageTokenizerAnimation />;
      case 'exponential-backoff-anim':
        return <ExponentialBackoffAnimation />;
      case 'bfs-file-search-anim':
        return <BfsFileSearchAnimation />;
      case 'injection-parser-anim':
        return <InjectionParserAnimation />;
      case 'lru-cache-anim':
        return <LruCacheAnimation />;
      case 'pty-lifecycle-anim':
        return <PtyLifecycleAnimation />;
      case 'streaming-json-parser-anim':
        return <StreamingJsonParserAnimation />;
      case 'vim-composite-actions-anim':
        return <VimCompositeActionsAnimation />;
      case 'prompt-pipeline-anim':
        return <PromptProcessingPipelineAnimation />;
      case 'memory-import-anim':
        return <MemoryImportProcessorAnimation />;
      case 'command-loading-anim':
        return <CommandLoadingAnimation />;
      case 'tool-confirmation-anim':
        return <ToolConfirmationFlowAnimation />;
      case 'model-config-cache-anim':
        return <ModelConfigCacheAnimation />;
      case 'subagent-resolution-anim':
        return <SubagentResolutionAnimation />;
      case 'shadow-git-checkpoint-anim':
        return <ShadowGitCheckpointAnimation />;
      case 'chat-recording-anim':
        return <ChatRecordingAnimation />;
      case 'code':
        return <CoreCode />;
      case 'loop':
        return <LoopMechanism />;
      case 'enterprise-deployment':
        return <EnterpriseDeployment />;
      case 'subagent-architecture':
        return <SubagentArchitecture />;
      case 'token-management-strategy':
        return <TokenManagementStrategy />;
      case 'content-format-conversion':
        return <ContentFormatConversion />;
      case 'command-execution-context':
        return <CommandExecutionContext />;
      case 'google-authentication':
        return <GoogleAuthentication />;
      case 'streaming-response-processing':
        return <StreamingResponseProcessing />;
      case 'zed-integration':
        return <ZedIntegration />;
      case 'model-configuration':
        return <ModelConfiguration />;
      case 'design-tradeoffs':
        return <DesignTradeoffs />;
      case 'error-recovery-patterns':
        return <ErrorRecoveryPatterns />;
      case 'concurrency-patterns':
        return <ConcurrencyPatterns />;
      case 'fallback-system':
        return <FallbackSystem />;
      case 'chat-recording':
        return <ChatRecording />;
      case 'prompt-registry':
        return <PromptRegistry />;
      case 'command-loading':
        return <CommandLoading />;
      case 'prompt-processors':
        return <PromptProcessors />;
      case 'ui-state-management':
        return <UIStateManagement />;
      case 'key-bindings':
        return <KeyBindings />;
      case 'settings-manager':
        return <SettingsManager />;
      case 'quota-detection':
        return <QuotaDetection />;
      case 'summarizer-system':
        return <SummarizerSystem />;
      case 'output-formatter':
        return <OutputFormatter />;
      case 'code-assist':
        return <CodeAssist />;
      case 'react-hooks':
        return <ReactHooksOverview />;
      case 'ui-components':
        return <UIComponents />;
      case 'text-buffer':
        return <TextBuffer />;
      case 'chat-compression':
        return <ChatCompression />;
      case 'non-interactive-deep':
        return <NonInteractiveDeep />;
      case 'ide-client':
        return <IDEClient />;
      case 'message-rendering':
        return <MessageRendering />;
      case 'context-system':
        return <ContextSystem />;
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
