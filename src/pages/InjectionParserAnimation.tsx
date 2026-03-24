import { useState, useCallback, useRef } from 'react';

type ParserPhase = 'idle' | 'scanning' | 'found-marker' | 'parsing-brace' | 'found-content' | 'complete';

interface ParsedInjection {
 marker: string;
 content: string;
 startIndex: number;
 endIndex: number;
}

interface ParserState {
 currentIndex: number;
 braceCount: number;
 currentMarker: string;
 contentStart: number;
 phase: ParserPhase;
}

// Sample prompts with various injection patterns
const SAMPLE_PROMPTS = {
 simple: {
 name: '简单注入',
 text: '请阅读 {{file:src/index.ts}} 文件',
 },
 nested: {
 name: '嵌套大括号',
 text: '分析这段代码 {{code:function test() { return { a: 1 }; }}} 的结构',
 },
 multiple: {
 name: '多个注入',
 text: '比较 {{file:a.ts}} 和 {{file:b.ts}} 的差异',
 },
 complex: {
 name: '复杂嵌套',
 text: '执行 {{shell:echo "{{nested}}" && cat {{file:x.txt}}}}',
 },
 deepNested: {
 name: '深层嵌套',
 text: '处理 {{json:{"a":{"b":{"c":"value"}}}}} 数据',
 },
};

const INJECTION_MARKERS = ['file', 'code', 'shell', 'url', 'json', 'env'];

export default function InjectionParserAnimation() {
 const [phase, setPhase] = useState<ParserPhase>('idle');
 const [selectedPrompt, setSelectedPrompt] = useState<keyof typeof SAMPLE_PROMPTS>('simple');
 const [promptText, setPromptText] = useState(SAMPLE_PROMPTS.simple.text);
 const [state, setState] = useState<ParserState>({
 currentIndex: 0,
 braceCount: 0,
 currentMarker: '',
 contentStart: 0,
 phase: 'idle',
 });
 const [parsedInjections, setParsedInjections] = useState<ParsedInjection[]>([]);
 const [highlightRange, setHighlightRange] = useState<[number, number] | null>(null);
 const [logs, setLogs] = useState<string[]>([]);
 const [speed, setSpeed] = useState(1);
 const [isRunning, setIsRunning] = useState(false);

 const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

 const sleep = (ms: number) => new Promise(resolve => {
 timeoutRef.current = setTimeout(resolve, ms / speed);
 });

 const addLog = (message: string) => {
 setLogs(prev => [...prev.slice(-14), message]);
 };

 const runParser = useCallback(async () => {
 if (isRunning) return;

 setIsRunning(true);
 setPhase('scanning');
 setParsedInjections([]);
 setLogs([]);
 setHighlightRange(null);

 const prompt = promptText;
 let currentIndex = 0;
 const injections: ParsedInjection[] = [];

 addLog(`开始解析，总长度: ${prompt.length} 字符`);
 await sleep(500);

 while (currentIndex < prompt.length) {
 // Look for {{ marker
 const markerStart = prompt.indexOf('{{', currentIndex);

 if (markerStart === -1) {
 addLog('未找到更多注入标记，解析完成');
 break;
 }

 // Move to marker position
 setState(prev => ({ ...prev, currentIndex: markerStart, phase: 'scanning' }));
 setHighlightRange([markerStart, markerStart + 2]);
 addLog(`在位置 ${markerStart} 发现 "{{" 标记`);
 await sleep(400);

 // Find the marker type (e.g., "file:", "code:")
 const colonIndex = prompt.indexOf(':', markerStart);
 if (colonIndex === -1 || colonIndex > markerStart + 20) {
 addLog(`位置 ${markerStart}: 未找到有效标记类型，跳过`);
 currentIndex = markerStart + 2;
 continue;
 }

 const marker = prompt.slice(markerStart + 2, colonIndex);
 if (!INJECTION_MARKERS.includes(marker)) {
 addLog(`位置 ${markerStart}: 未知标记类型 "${marker}"，跳过`);
 currentIndex = markerStart + 2;
 continue;
 }

 setPhase('found-marker');
 setHighlightRange([markerStart, colonIndex + 1]);
 setState(prev => ({ ...prev, currentMarker: marker, phase: 'found-marker' }));
 addLog(`识别到注入类型: ${marker}`);
 await sleep(400);

 // Start brace counting from after the colon
 let braceCount = 1; // We already have one opening {{
 let parseIndex = colonIndex + 1;
 const contentStart = parseIndex;
 let foundEnd = false;

 setPhase('parsing-brace');
 setState(prev => ({
 ...prev,
 contentStart,
 braceCount: 1,
 phase: 'parsing-brace',
 }));
 addLog(`开始大括号计数，初始深度: 1`);
 await sleep(300);

 // Parse character by character
 while (parseIndex < prompt.length) {
 const char = prompt[parseIndex];

 // Update visualization
 setHighlightRange([contentStart, parseIndex + 1]);
 setState(prev => ({ ...prev, currentIndex: parseIndex }));

 if (char === '{') {
 braceCount++;
 setState(prev => ({ ...prev, braceCount }));
 addLog(`位置 ${parseIndex}: 发现 '{', 深度 → ${braceCount}`);
 await sleep(200);
 } else if (char === '}') {
 braceCount--;
 setState(prev => ({ ...prev, braceCount }));

 if (braceCount === 0) {
 // Check for closing }}
 if (parseIndex + 1 < prompt.length && prompt[parseIndex + 1] === '}') {
 addLog(`位置 ${parseIndex}: 发现 '}}', 深度 → 0, 注入结束!`);
 foundEnd = true;

 const content = prompt.slice(contentStart, parseIndex - 1);
 const injection: ParsedInjection = {
 marker,
 content,
 startIndex: markerStart,
 endIndex: parseIndex + 2,
 };
 injections.push(injection);
 setParsedInjections([...injections]);

 setPhase('found-content');
 setHighlightRange([markerStart, parseIndex + 2]);
 await sleep(600);

 currentIndex = parseIndex + 2;
 break;
 }
 } else {
 addLog(`位置 ${parseIndex}: 发现 '}', 深度 → ${braceCount}`);
 await sleep(200);
 }
 }

 parseIndex++;
 }

 if (!foundEnd) {
 addLog(`警告: 未找到匹配的闭合 "}}", 注入不完整`);
 currentIndex = markerStart + 2;
 }
 }

 setPhase('complete');
 setHighlightRange(null);
 addLog(`解析完成! 共找到 ${injections.length} 个注入`);
 setIsRunning(false);
 }, [isRunning, promptText, speed]);

 const reset = () => {
 if (timeoutRef.current) clearTimeout(timeoutRef.current);
 setPhase('idle');
 setState({
 currentIndex: 0,
 braceCount: 0,
 currentMarker: '',
 contentStart: 0,
 phase: 'idle',
 });
 setParsedInjections([]);
 setHighlightRange(null);
 setLogs([]);
 setIsRunning(false);
 };

 const handlePromptChange = (key: keyof typeof SAMPLE_PROMPTS) => {
 setSelectedPrompt(key);
 setPromptText(SAMPLE_PROMPTS[key].text);
 reset();
 };

 // Render prompt with highlighting
 const renderHighlightedPrompt = () => {
 const chars = promptText.split('');

 return (
 <div className="font-mono text-sm leading-relaxed">
 {chars.map((char, idx) => {
 const isHighlighted = highlightRange && idx >= highlightRange[0] && idx < highlightRange[1];
 const isCurrent = idx === state.currentIndex && phase === 'parsing-brace';
 const isInParsed = parsedInjections.some(
 inj => idx >= inj.startIndex && idx < inj.endIndex
 );

 let className = 'transition-all duration-100 ';
 if (isCurrent) {
 className += 'bg-[var(--color-warning)] text-heading';
 } else if (isHighlighted) {
 className += ' bg-elevated/70 text-heading';
 } else if (isInParsed) {
 className += 'bg-elevated text-heading';
 } else {
 className += 'text-body';
 }

 return (
 <span key={idx} className={className}>
 {char === ' ' ? '\u00A0' : char}
 </span>
 );
 })}
 </div>
 );
 };

 // Brace depth visualization
 const renderBraceStack = () => {
 const depth = state.braceCount;
 return (
 <div className="flex items-end gap-1 h-16">
 {Array.from({ length: Math.max(depth, 0) }).map((_, i) => (
 <div
 key={i}
 className="w-6 bg-surface rounded-t transition-all duration-200"
 style={{ height: `${(i + 1) * 15}px` }}
 />
 ))}
 {depth === 0 && <span className="text-dim text-xs">深度: 0</span>}
 </div>
 );
 };

 return (
 <div className="p-6 max-w-6xl mx-auto">
 <h1 className="text-2xl font-bold mb-2 text-heading">Injection Parser 嵌套解析</h1>
 <p className="text-body mb-6">
 展示字符级大括号计数和嵌套内容提取算法
 </p>

 {/* Markers Reference */}
 <div className="mb-6 p-4 bg-surface rounded-lg border border-edge">
 <h3 className="text-sm font-semibold text-body mb-3">支持的注入标记</h3>
 <div className="flex flex-wrap gap-2">
 {INJECTION_MARKERS.map(marker => (
 <code key={marker} className="px-2 py-1 bg-base rounded text-heading text-xs">
 {`{{${marker}:...}}`}
 </code>
 ))}
 </div>
 </div>

 {/* Controls */}
 <div className="flex flex-wrap gap-3 mb-6">
 <select
 value={selectedPrompt}
 onChange={(e) => handlePromptChange(e.target.value as keyof typeof SAMPLE_PROMPTS)}
 disabled={isRunning}
 className="px-3 py-2 bg-surface border border-edge rounded text-heading text-sm"
 >
 {Object.entries(SAMPLE_PROMPTS).map(([key, value]) => (
 <option key={key} value={key}>{value.name}</option>
 ))}
 </select>
 <select
 value={speed}
 onChange={(e) => setSpeed(Number(e.target.value))}
 disabled={isRunning}
 className="px-3 py-2 bg-surface border border-edge rounded text-heading text-sm"
 >
 <option value={0.5}>0.5x 速度</option>
 <option value={1}>1x 速度</option>
 <option value={2}>2x 速度</option>
 <option value={4}>4x 速度</option>
 </select>
 <button
 onClick={runParser}
 disabled={isRunning}
 className="px-4 py-2 bg-elevated hover:bg-elevated disabled:bg-elevated disabled:cursor-not-allowed rounded text-heading text-sm font-medium transition-colors"
 >
 {isRunning ? '解析中...' : '开始解析'}
 </button>
 <button
 onClick={reset}
 className="px-4 py-2 bg-elevated hover:bg-elevated rounded text-heading text-sm transition-colors"
 >
 重置
 </button>
 </div>

 {/* Status */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim">当前阶段</div>
 <div className={`text-sm font-medium ${
 phase === 'complete' ? 'text-heading' :
 phase === 'parsing-brace' ? 'text-heading' :
 phase === 'found-marker' ? 'text-heading' :
 'text-body'
 }`}>
 {phase === 'idle' ? '待命' :
 phase === 'scanning' ? '扫描中' :
 phase === 'found-marker' ? '发现标记' :
 phase === 'parsing-brace' ? '解析大括号' :
 phase === 'found-content' ? '提取内容' :
 phase === 'complete' ? '完成' : phase}
 </div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim">当前位置</div>
 <div className="text-xl font-bold text-heading">{state.currentIndex}</div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim">大括号深度</div>
 <div className={`text-xl font-bold ${state.braceCount > 1 ? 'text-heading' : 'text-heading'}`}>
 {state.braceCount}
 </div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim">当前标记</div>
 <div className="text-sm font-medium text-heading">
 {state.currentMarker || '-'}
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Prompt Display */}
 <div className="lg:col-span-2 p-4 bg-base rounded-lg border border-edge">
 <h3 className="text-sm font-semibold text-body mb-3 flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-elevated" />
 输入 Prompt
 </h3>
 <div className="p-4 bg-base/50 rounded min-h-24">
 {renderHighlightedPrompt()}
 </div>

 {/* Character Index Ruler */}
 <div className="mt-2 overflow-x-auto">
 <div className="font-mono text-xs text-dim flex">
 {promptText.split('').map((_, idx) => (
 <span key={idx} className="w-2 text-center">
 {idx % 10 === 0 ? Math.floor(idx / 10) : ''}
 </span>
 ))}
 </div>
 </div>

 {/* Legend */}
 <div className="mt-3 flex flex-wrap gap-3 text-xs">
 <div className="flex items-center gap-1">
 <span className="w-3 h-3 rounded bg-[var(--color-warning)]" />
 <span className="text-body">当前字符</span>
 </div>
 <div className="flex items-center gap-1">
 <span className="w-3 h-3 rounded bg-elevated/70" />
 <span className="text-body">扫描范围</span>
 </div>
 <div className="flex items-center gap-1">
 <span className="w-3 h-3 rounded bg-elevated" />
 <span className="text-body">已解析</span>
 </div>
 </div>
 </div>

 {/* Brace Stack & Logs */}
 <div className="space-y-4">
 {/* Brace Depth Visualization */}
 <div className="p-4 bg-base rounded-lg border border-edge">
 <h3 className="text-sm font-semibold text-body mb-3">大括号堆栈</h3>
 {renderBraceStack()}
 </div>

 {/* Logs */}
 <div className="p-4 bg-base rounded-lg border border-edge">
 <h3 className="text-sm font-semibold text-body mb-3 flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
 解析日志
 </h3>
 <div className="h-40 overflow-y-auto font-mono text-xs space-y-1">
 {logs.map((log, idx) => (
 <div key={idx} className="text-body">{log}</div>
 ))}
 {logs.length === 0 && <span className="text-dim">等待开始...</span>}
 </div>
 </div>
 </div>
 </div>

 {/* Parsed Results */}
 {parsedInjections.length > 0 && (
 <div className="mt-6 p-4 bg-elevated border-l-2 border-l-edge-hover/40 rounded-lg">
 <h3 className="text-sm font-semibold text-heading mb-3">
 已解析的注入 ({parsedInjections.length})
 </h3>
 <div className="space-y-2">
 {parsedInjections.map((inj, idx) => (
 <div key={idx} className="p-3 bg-base/30 rounded">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-2 py-0.5 bg-elevated/50 text-heading rounded text-xs">
 {inj.marker}
 </span>
 <span className="text-xs text-dim">
 位置: {inj.startIndex} - {inj.endIndex}
 </span>
 </div>
 <code className="text-xs text-heading block overflow-x-auto">
 {inj.content}
 </code>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Algorithm Reference */}
 <div className="mt-6 p-4 bg-surface rounded-lg">
 <h4 className="text-sm font-semibold text-body mb-3">核心算法</h4>
 <pre className="text-xs text-body font-mono overflow-x-auto">
{`let braceCount = 1; // 初始 {{ 计为 1

while (currentIndex < prompt.length) {
 const char = prompt[currentIndex];

 if (char === '{') {
 braceCount++;
 } else if (char === '}') {
 braceCount--;

 if (braceCount === 0) {
 // 检查是否为 }}
 if (prompt[currentIndex + 1] === '}') {
 // 找到闭合标记!
 content = prompt.slice(contentStart, currentIndex - 1);
 foundEnd = true;
 break;
 }
 }
 }
 currentIndex++;
}`}
 </pre>
 </div>

 {/* Custom Input */}
 <div className="mt-6 p-4 bg-surface rounded-lg border border-edge">
 <h4 className="text-sm font-semibold text-body mb-3">自定义输入</h4>
 <textarea
 value={promptText}
 onChange={(e) => {
 setPromptText(e.target.value);
 reset();
 }}
 disabled={isRunning}
 className="w-full h-24 px-3 py-2 bg-surface border border-edge rounded text-heading text-sm font-mono resize-none"
 placeholder="输入包含 {{marker:content}} 格式的文本..."
 />
 </div>
 </div>
 );
}
