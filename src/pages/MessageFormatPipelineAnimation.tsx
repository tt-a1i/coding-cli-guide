// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

/**
 * 消息格式转换管道动画
 *
 * 可视化 OpenAI ↔ Gemini ↔ OpenAI 格式互转流程
 * 源码: packages/core/src/core/openaiContentGenerator/converter.ts
 *
 * 核心转换:
 * - convertGeminiRequestToOpenAI() - Gemini → OpenAI
 * - convertOpenAIResponseToGemini() - OpenAI → Gemini
 * - convertGeminiToolsToOpenAI() - 工具 schema 转换
 */

type FormatType = 'gemini' | 'openai' | 'gemini';
type ConversionPhase =
  | 'idle'
  | 'input-parse'     // 解析输入格式
  | 'role-map'        // 角色映射
  | 'content-convert' // 内容转换
  | 'tool-convert'    // 工具转换
  | 'output-build';   // 构建输出

interface MessagePart {
  type: 'text' | 'function_call' | 'function_response' | 'image';
  content: string;
  converted: boolean;
}

interface Message {
  role: string;
  parts: MessagePart[];
  format: FormatType;
}

const ROLE_MAPPINGS = {
  'gemini→openai': {
    'user': 'user',
    'model': 'assistant',
    'function': 'tool',
  },
  'openai→gemini': {
    'user': 'user',
    'assistant': 'model',
    'tool': 'function',
    'system': 'user', // System prompt merged
  },
};

const SAMPLE_MESSAGES: Message[] = [
  {
    role: 'user',
    parts: [
      { type: 'text', content: '帮我分析这个文件', converted: false },
      { type: 'image', content: '[inline_data: image/png]', converted: false },
    ],
    format: 'gemini',
  },
  {
    role: 'model',
    parts: [
      { type: 'text', content: '我来读取文件内容...', converted: false },
      { type: 'function_call', content: 'Read({file_path: "/src/app.ts"})', converted: false },
    ],
    format: 'gemini',
  },
  {
    role: 'function',
    parts: [
      { type: 'function_response', content: 'export default function App() {...}', converted: false },
    ],
    format: 'gemini',
  },
];

export default function MessageFormatPipelineAnimation() {
  const [phase, setPhase] = useState<ConversionPhase>('idle');
  const [sourceFormat, setSourceFormat] = useState<FormatType>('gemini');
  const [targetFormat, setTargetFormat] = useState<FormatType>('openai');
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES);
  const [convertedMessages, setConvertedMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-12), `[${new Date().toISOString().slice(11, 19)}] ${message}`]);
  }, []);

  const resetAnimation = useCallback(() => {
    setPhase('idle');
    setMessages(SAMPLE_MESSAGES);
    setConvertedMessages([]);
    setCurrentStep(0);
    setLogs([]);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timers: NodeJS.Timeout[] = [];
    const phases: ConversionPhase[] = ['input-parse', 'role-map', 'content-convert', 'tool-convert', 'output-build'];

    if (phase === 'idle') {
      setPhase('input-parse');
      return;
    }

    const phaseIndex = phases.indexOf(phase);

    switch (phase) {
      case 'input-parse':
        addLog(`📥 convertGeminiRequestToOpenAI() 开始`);
        addLog(`  输入: ${messages.length} 条 ${sourceFormat.toUpperCase()} 消息`);
        timers.push(setTimeout(() => {
          addLog(`  ✓ 解析消息结构完成`);
          setPhase('role-map');
        }, 800));
        break;

      case 'role-map':
        addLog(`🔄 角色映射 ${sourceFormat} → ${targetFormat}`);
        const roleMap = ROLE_MAPPINGS[`${sourceFormat}→${targetFormat}`] || {};

        messages.forEach((msg, i) => {
          timers.push(setTimeout(() => {
            const newRole = roleMap[msg.role] || msg.role;
            addLog(`  ${msg.role} → ${newRole}`);
            setConvertedMessages(prev => {
              const updated = [...prev];
              updated[i] = { ...msg, role: newRole, format: targetFormat };
              return updated;
            });
          }, 300 * (i + 1)));
        });

        timers.push(setTimeout(() => {
          setPhase('content-convert');
        }, 300 * messages.length + 500));
        break;

      case 'content-convert':
        addLog(`📝 内容部件转换`);
        let partDelay = 0;

        messages.forEach((msg, msgIdx) => {
          msg.parts.forEach((part, partIdx) => {
            timers.push(setTimeout(() => {
              let convertedType = part.type;
              let convertedContent = part.content;

              if (part.type === 'image' && targetFormat === 'openai') {
                convertedType = 'image';
                convertedContent = '[image_url: {url: data:image/png;base64,...}]';
                addLog(`  🖼️ inline_data → image_url`);
              } else if (part.type === 'text') {
                addLog(`  📄 text part preserved`);
              }

              setConvertedMessages(prev => {
                const updated = [...prev];
                if (updated[msgIdx]) {
                  updated[msgIdx] = {
                    ...updated[msgIdx],
                    parts: updated[msgIdx].parts.map((p, i) =>
                      i === partIdx ? { ...p, converted: true, content: convertedContent } : p
                    ),
                  };
                }
                return updated;
              });
            }, partDelay));
            partDelay += 250;
          });
        });

        timers.push(setTimeout(() => {
          setPhase('tool-convert');
        }, partDelay + 400));
        break;

      case 'tool-convert':
        addLog(`🔧 工具调用转换`);

        const hasToolCalls = messages.some(m =>
          m.parts.some(p => p.type === 'function_call' || p.type === 'function_response')
        );

        if (hasToolCalls) {
          timers.push(setTimeout(() => {
            addLog(`  functionCall → tool_calls[]`);
          }, 300));

          timers.push(setTimeout(() => {
            addLog(`  functionResponse → tool message`);
          }, 600));

          timers.push(setTimeout(() => {
            addLog(`  ✓ mergeConsecutiveAssistantMessages()`);
          }, 900));
        } else {
          timers.push(setTimeout(() => {
            addLog(`  (无工具调用)`);
          }, 300));
        }

        timers.push(setTimeout(() => {
          setPhase('output-build');
        }, 1200));
        break;

      case 'output-build':
        addLog(`📤 构建 ${targetFormat.toUpperCase()} 输出`);

        timers.push(setTimeout(() => {
          addLog(`  ✅ 转换完成: ${convertedMessages.length} 条消息`);
          setIsPlaying(false);
        }, 500));
        break;
    }

    return () => timers.forEach(t => clearTimeout(t));
  }, [phase, isPlaying, messages, sourceFormat, targetFormat, addLog, convertedMessages.length]);

  const getFormatColor = (format: FormatType) => {
    switch (format) {
      case 'gemini': return '#4285f4';
      case 'openai': return '#10a37f';
      case 'gemini': return '#ff6b35';
    }
  };

  const getPartIcon = (type: string) => {
    switch (type) {
      case 'text': return '📄';
      case 'function_call': return '⚡';
      case 'function_response': return '📥';
      case 'image': return '🖼️';
      default: return '📦';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--terminal-green)] font-mono">
            消息格式转换管道
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            OpenAIContentConverter - Gemini ↔ OpenAI ↔ Gemini 格式互转
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <select
              value={sourceFormat}
              onChange={(e) => setSourceFormat(e.target.value as FormatType)}
              disabled={isPlaying}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1 text-sm font-mono"
              style={{ color: getFormatColor(sourceFormat) }}
            >
              <option value="gemini">Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
            </select>
            <span className="text-[var(--muted)]">→</span>
            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value as FormatType)}
              disabled={isPlaying}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1 text-sm font-mono"
              style={{ color: getFormatColor(targetFormat) }}
            >
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>
          <button
            onClick={() => isPlaying ? resetAnimation() : (resetAnimation(), setTimeout(() => setIsPlaying(true), 100))}
            className={`px-4 py-2 rounded font-mono text-sm transition-all ${
              isPlaying
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] border border-[var(--terminal-green)]/30'
            }`}
          >
            {isPlaying ? '⏹ 停止' : '▶ 开始'}
          </button>
        </div>
      </div>

      {/* 阶段进度 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          {['input-parse', 'role-map', 'content-convert', 'tool-convert', 'output-build'].map((p, i) => {
            const phases = ['input-parse', 'role-map', 'content-convert', 'tool-convert', 'output-build'];
            const isActive = phases.indexOf(phase) >= i;
            const isCurrent = phase === p;
            return (
              <div
                key={p}
                className={`flex items-center gap-1 transition-all ${
                  isCurrent ? 'text-[var(--terminal-green)]' :
                  isActive ? 'text-[var(--text-secondary)]' : 'text-[var(--muted)]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  isCurrent ? 'bg-[var(--terminal-green)] animate-pulse' :
                  isActive ? 'bg-[var(--terminal-green)]/60' : 'bg-[var(--muted)]/30'
                }`} />
                {p.replace('-', ' ')}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 输入消息 */}
        <div className="col-span-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)] h-full">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getFormatColor(sourceFormat) }}
              />
              <h3 className="text-sm font-semibold font-mono" style={{ color: getFormatColor(sourceFormat) }}>
                {sourceFormat.toUpperCase()} Messages
              </h3>
            </div>
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className="p-3 rounded border bg-[var(--bg-tertiary)] border-[var(--border)]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-secondary)]">
                      {msg.role}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {msg.parts.map((part, j) => (
                      <div key={j} className="text-xs text-[var(--muted)] font-mono flex items-start gap-1">
                        <span>{getPartIcon(part.type)}</span>
                        <span className="truncate">{part.content.slice(0, 40)}...</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 转换管道 */}
        <div className="col-span-4">
          <div className="bg-black/60 rounded-lg p-4 border border-[var(--border)] h-full">
            <h3 className="text-sm font-semibold text-[var(--cyber-blue)] mb-3 font-mono">
              🔄 Conversion Pipeline
            </h3>
            <div className="space-y-3">
              {/* 角色映射 */}
              <div className={`p-3 rounded border transition-all ${
                phase === 'role-map' ? 'bg-[var(--cyber-blue)]/10 border-[var(--cyber-blue)]/30' : 'bg-[var(--bg-tertiary)] border-[var(--border)]'
              }`}>
                <div className="text-xs font-mono text-[var(--cyber-blue)] mb-2">Role Mapping</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>user → user</div>
                  <div>model → assistant</div>
                  <div>function → tool</div>
                </div>
              </div>

              {/* 内容转换 */}
              <div className={`p-3 rounded border transition-all ${
                phase === 'content-convert' ? 'bg-[var(--amber)]/10 border-[var(--amber)]/30' : 'bg-[var(--bg-tertiary)] border-[var(--border)]'
              }`}>
                <div className="text-xs font-mono text-[var(--amber)] mb-2">Content Parts</div>
                <div className="text-xs font-mono text-[var(--muted)] space-y-1">
                  <div>• text → content.text</div>
                  <div>• inline_data → image_url</div>
                  <div>• functionCall → tool_calls</div>
                </div>
              </div>

              {/* 消息合并 */}
              <div className={`p-3 rounded border transition-all ${
                phase === 'tool-convert' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-[var(--bg-tertiary)] border-[var(--border)]'
              }`}>
                <div className="text-xs font-mono text-purple-400 mb-2">Message Merge</div>
                <div className="text-xs font-mono text-[var(--muted)]">
                  mergeConsecutiveAssistantMessages()
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 输出消息 */}
        <div className="col-span-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)] h-full">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getFormatColor(targetFormat) }}
              />
              <h3 className="text-sm font-semibold font-mono" style={{ color: getFormatColor(targetFormat) }}>
                {targetFormat.toUpperCase()} Messages
              </h3>
            </div>
            <div className="space-y-3">
              {convertedMessages.length === 0 ? (
                <div className="text-xs text-[var(--muted)] text-center py-8 font-mono">
                  等待转换...
                </div>
              ) : (
                convertedMessages.map((msg, i) => (
                  <div
                    key={i}
                    className="p-3 rounded border transition-all bg-[var(--bg-tertiary)] border-[var(--terminal-green)]/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--terminal-green)]/20 text-[var(--terminal-green)]">
                        {msg.role}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {msg.parts.map((part, j) => (
                        <div
                          key={j}
                          className={`text-xs font-mono flex items-start gap-1 transition-all ${
                            part.converted ? 'text-[var(--terminal-green)]' : 'text-[var(--muted)]'
                          }`}
                        >
                          <span>{getPartIcon(part.type)}</span>
                          <span className="truncate">{part.content.slice(0, 40)}...</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 日志 */}
      <div className="bg-black/80 rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-xs font-semibold text-[var(--muted)] mb-2 font-mono">Conversion Log</h3>
        <div className="space-y-1 text-xs font-mono h-32 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-[var(--muted)]">等待开始...</div>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className={`${
                  log.includes('✓') || log.includes('✅') ? 'text-[var(--terminal-green)]' :
                  log.includes('📥') || log.includes('📤') ? 'text-[var(--cyber-blue)]' :
                  log.includes('🔄') ? 'text-[var(--amber)]' :
                  log.includes('🔧') ? 'text-purple-400' :
                  'text-[var(--muted)]'
                }`}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 源码说明 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          源码: openaiContentGenerator/converter.ts
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <pre className="text-[var(--text-secondary)] bg-black/30 p-2 rounded overflow-x-auto">
{`class OpenAIContentConverter {
  // Gemini → OpenAI
  convertGeminiRequestToOpenAI(
    request: GenerateContentParameters
  ): ChatCompletionMessageParam[]

  // OpenAI → Gemini
  convertOpenAIResponseToGemini(
    response: ChatCompletion
  ): GenerateContentResponse
}`}
          </pre>
          <pre className="text-[var(--text-secondary)] bg-black/30 p-2 rounded overflow-x-auto">
{`// 内容部件映射
Gemini          →  OpenAI
─────────────────────────────
text            →  content
inline_data     →  image_url
functionCall    →  tool_calls[]
functionResponse→  tool message`}
          </pre>
        </div>
      </div>
    </div>
  );
}
