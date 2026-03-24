import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
 { id: 'memory', label: '上下文管理', description: 'Token 预算管理' },
 { id: 'token-accounting', label: 'Token 计费', description: 'Token 计数' },
 { id: 'tool-detail', label: '工具执行', description: '工具输出处理' },
 { id: 'content-gen', label: 'API 调用层', description: '内容生成' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-xl border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
  <span className="text-xl font-bold text-heading">30秒快速理解</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-5">
 <div className="bg-base/50 rounded-lg p-4 ">
 <p className="text-heading font-medium">
 <span className="text-heading font-bold">一句话：</span>
 LLM 驱动的工具输出摘要系统，使用 Flash-Lite 模型将超长输出压缩到指定 Token 预算内
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">2000</div>
 <div className="text-xs text-dim">默认 Token 预算</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">Flash</div>
 <div className="text-xs text-dim">摘要模型</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">3</div>
 <div className="text-xs text-dim">摘要规则</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">2</div>
 <div className="text-xs text-dim">Summarizer 类型</div>
 </div>
 </div>

 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">摘要决策流程</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 工具输出
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 长度检查
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 LLM 摘要
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 压缩输出
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">源码入口:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/core/src/utils/summarizer.ts
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function SummarizerSystem() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const summarizerFlowChart = `flowchart TD
 subgraph Input["工具执行"]
 TOOL[Tool Execution]
 RESULT[ToolResult]
 CONTENT[llmContent]
 end

 subgraph Check["长度检查"]
 LEN{"length < maxTokens?"}
 SKIP["跳过摘要<br/>返回原文"]
 end

 subgraph Summarize["LLM 摘要"]
 PROMPT[构建摘要 Prompt]
 FLASH[Flash-Lite 模型]
 RULES[摘要规则应用]
 end

 subgraph Output["输出"]
 SUMMARY[摘要文本]
 ERR["错误回退<br/>返回原文"]
 end

 TOOL --> RESULT
 RESULT --> CONTENT
 CONTENT --> LEN
 LEN -->|是| SKIP
 LEN -->|否| PROMPT
 PROMPT --> FLASH
 FLASH --> RULES
 RULES --> SUMMARY
 FLASH -.->|异常| ERR

 style FLASH stroke:#00ff88
 style SUMMARY stroke:#00d4ff
 style SKIP stroke:#666`;

 const summarizerTypeCode = `import type { ToolResult } from '../tools/tools.js';
import type { GeminiClient } from '../core/client.js';

/**
  * Summarizer 函数类型定义
  * @param result - 工具执行结果
  * @param geminiClient - Gemini 客户端
  * @param abortSignal - 中断信号
  * @returns 摘要文本
  */
export type Summarizer = (
  result: ToolResult,
  geminiClient: GeminiClient,
  abortSignal: AbortSignal,
) => Promise<string>;

/**
  * 默认 Summarizer - 直接 JSON 序列化
  * 不调用 LLM，仅序列化输出
  */
export const defaultSummarizer: Summarizer = (
  result: ToolResult,
  _geminiClient: GeminiClient,
  _abortSignal: AbortSignal,
) => Promise.resolve(JSON.stringify(result.llmContent));

/**
  * LLM Summarizer - 使用 Flash-Lite 模型摘要
  * 智能压缩超长工具输出
  */
export const llmSummarizer: Summarizer = (
  result,
  geminiClient,
  abortSignal
) => summarizeToolOutput(
  partToString(result.llmContent),
  geminiClient,
  abortSignal,
);`;

 const summaryPromptCode = `// 摘要 Prompt 模板
const SUMMARIZE_TOOL_OUTPUT_PROMPT = \`
Summarize the following tool output to be a maximum of {maxOutputTokens} tokens.
The summary should be concise and capture the main points of the tool output.

The summarization should be done based on the content that is provided.
Here are the basic rules to follow:

1. If the text is a directory listing or any output that is structural,
  use the history of the conversation to understand the context.
  Using this context try to understand what information we need from
  the tool output and return that as a response.

2. If the text is text content and there is nothing structural that we need,
  summarize the text.

3. If the text is the output of a shell command, use the history of the
  conversation to understand the context. Using this context try to
  understand what information we need from the tool output and return
  a summarization along with the stack trace of any error within the
  <error></error> tags. The stack trace should be complete and not truncated.
  If there are warnings, you should include them in the summary within
  <warning></warning> tags.

Text to summarize:
"{textToSummarize}"

Return the summary string which should first contain an overall summarization
of text followed by the full stack trace of errors and warnings in the tool output.
\`;`;

 const summarizeToolOutputCode = `import { DEFAULT_GEMINI_FLASH_LITE_MODEL } from '../config/models.js';

export async function summarizeToolOutput(
  textToSummarize: string,
  geminiClient: GeminiClient,
  abortSignal: AbortSignal,
  maxOutputTokens: number = 2000, // 默认 Token 预算
): Promise<string> {
  // 短文本直接返回，无需摘要
  // 注意：这里比较的是字符长度，作为 Token 数的近似估算
  if (!textToSummarize || textToSummarize.length < maxOutputTokens) {
  return textToSummarize;
  }

  // 构建摘要 Prompt
  const prompt = SUMMARIZE_TOOL_OUTPUT_PROMPT
  .replace('{maxOutputTokens}', String(maxOutputTokens))
  .replace('{textToSummarize}', textToSummarize);

  const contents: Content[] = [
  { role: 'user', parts: [{ text: prompt }] }
  ];

  const toolOutputSummarizerConfig: GenerateContentConfig = {
  maxOutputTokens,
  };

  try {
  // 使用 Flash-Lite 模型进行摘要
  const parsedResponse = await geminiClient.generateContent(
  contents,
  toolOutputSummarizerConfig,
  abortSignal,
  DEFAULT_GEMINI_FLASH_LITE_MODEL, // 轻量级模型
  );

  return getResponseText(parsedResponse) || textToSummarize;
  } catch (error) {
  // 摘要失败时回退到原文
  console.error('Failed to summarize tool output.', error);
  return textToSummarize;
  }
}`;

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-3xl font-bold text-heading mb-2">Summarizer 摘要系统</h1>
 <p className="text-body text-lg">
 LLM 驱动的工具输出摘要系统，智能压缩超长输出以节省 Token 预算
 </p>
 </div>

 <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

 <Layer title="摘要流程" defaultOpen={true}>
 <HighlightBox title="工具输出摘要决策流程" color="blue" className="mb-6">
 <MermaidDiagram chart={summarizerFlowChart} />
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge">
 <div className="text-heading font-bold mb-2">触发条件</div>
 <ul className="text-sm text-body space-y-1">
 <li>输出长度 &gt; maxOutputTokens (默认 2000)</li>
 <li>使用字符长度作为 Token 近似</li>
 <li>短文本直接跳过摘要</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge">
 <div className="text-heading font-bold mb-2">摘要模型</div>
 <ul className="text-sm text-body space-y-1">
 <li>使用 Flash-Lite 轻量级模型</li>
 <li>低延迟、低成本</li>
 <li>专门用于摘要任务</li>
 </ul>
 </div>
 </div>
 </Layer>

 <Layer title="Summarizer 类型" defaultOpen={true}>
 <CodeBlock code={summarizerTypeCode} language="typescript" title="Summarizer 类型定义" />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="defaultSummarizer" color="orange">
 <ul className="text-sm text-body space-y-1">
 <li>不调用 LLM</li>
 <li>直接 JSON.stringify</li>
 <li>零延迟、零成本</li>
 <li>适合短输出</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="llmSummarizer" color="green">
 <ul className="text-sm text-body space-y-1">
 <li>调用 Flash-Lite</li>
 <li>智能内容压缩</li>
 <li>保留关键信息</li>
 <li>适合长输出</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 <Layer title="摘要 Prompt" defaultOpen={true}>
 <CodeBlock code={summaryPromptCode} language="typescript" title="SUMMARIZE_TOOL_OUTPUT_PROMPT" />

 <div className="mt-4 p-4 bg-base/50 rounded-lg border border-edge">
 <div className="text-sm">
 <strong className="text-heading">三种摘要规则：</strong>
 <div className="mt-2 space-y-3">
 <div className="flex items-start gap-2">
 <span className="text-heading">1.</span>
 <div>
 <span className="text-heading">目录/结构化输出：</span>
 <span className="text-dim">根据对话上下文提取需要的信息</span>
 </div>
 </div>
 <div className="flex items-start gap-2">
 <span className="text-heading">2.</span>
 <div>
 <span className="text-heading">文本内容：</span>
 <span className="text-dim">直接摘要核心内容</span>
 </div>
 </div>
 <div className="flex items-start gap-2">
 <span className="text-heading">3.</span>
 <div>
 <span className="text-heading">Shell 命令输出：</span>
 <span className="text-dim">保留完整错误堆栈 (&lt;error&gt;) 和警告 (&lt;warning&gt;)</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </Layer>

 <Layer title="核心实现" defaultOpen={false}>
 <CodeBlock code={summarizeToolOutputCode} language="typescript" title="summarizeToolOutput 函数" />
 </Layer>

 <Layer title="使用场景" defaultOpen={false}>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge">
 <div className="text-heading font-bold mb-2">文件读取</div>
 <p className="text-sm text-body">
 读取大文件时，摘要提取关键代码片段和结构信息
 </p>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge">
 <div className="text-heading font-bold mb-2">搜索结果</div>
 <p className="text-sm text-body">
 Grep 返回大量匹配时，摘要为最相关的结果列表
 </p>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge">
 <div className="text-heading font-bold mb-2">Shell 输出</div>
 <p className="text-sm text-body">
 npm install 等长输出，摘要结果但保留错误堆栈
 </p>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge">
 <div className="text-heading font-bold mb-2">目录列表</div>
 <p className="text-sm text-body">
 大型目录树，智能提取用户关心的文件/目录
 </p>
 </div>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
