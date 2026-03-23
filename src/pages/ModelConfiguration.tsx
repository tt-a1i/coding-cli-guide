/**
 * ModelConfiguration.tsx - 模型配置系统详解
 *
 * 涵盖 Token 限制匹配、模型服务发现、配置缓存等核心机制
 */

import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';

export function ModelConfiguration() {
 const [activeTab, setActiveTab] = useState<'limits' | 'cache' | 'service' | 'normalize'>('limits');

 return (
 <div className="max-w-4xl mx-auto">
 <h1 className="text-3xl font-bold text-heading mb-2">
 <span className="mr-2">🎛️</span>模型配置系统
 </h1>

 <HighlightBox title="核心职责" icon="📋" variant="green">
 <p className="text-body">
 模型配置系统负责管理 Token 限制匹配、模型元信息缓存、多厂商模型发现，
 确保 CLI 能够正确地与不同模型交互并优化上下文使用。
 </p>
 </HighlightBox>

 {/* Tab Navigation */}
 <div className="flex gap-2 mb-6 flex-wrap">
 {[
 { id: 'limits', label: '📏 Token 限制' },
 { id: 'cache', label: '💾 配置缓存' },
 { id: 'service', label: '🔍 模型服务' },
 { id: 'normalize', label: '🔧 名称标准化' },
 ].map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id as typeof activeTab)}
 className={`px-4 py-2 rounded-lg border-none cursor-pointer font-medium transition-all duration-200 ${
 activeTab === tab.id
 ? ' bg-elevated text-heading'
 : ' bg-elevated text-dim hover:bg-surface'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 {/* Token Limits Tab */}
 {activeTab === 'limits' && (
 <div className="space-y-6">
 <Layer title="Token 限制（上游 tokenLimit）" icon="📏">
 <p className="text-body mb-4">
 上游 gemini-cli 的 <code className="text-heading">tokenLimit(model)</code> 是一个{' '}
 <strong>switch-case</strong> 映射：它只返回“上下文窗口上限”，没有 output token limit，也没有 PATTERNS/normalize 正则匹配。
 </p>

 <MermaidDiagram
 chart={`
flowchart LR
 M[model string] --> S[tokenLimit(model)<br/>switch-case]
 S --> R[token limit]

 style S stroke:#276749
 style R stroke:#1e3a5f
`}
 />
 </Layer>

 <Layer title="映射表（上游 tokenLimits.ts）" icon="📊">
 <div className="overflow-x-auto mb-4">
 <table className="w-full border-collapse text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left p-3 text-dim">case</th>
 <th className="text-left p-3 text-dim">token limit</th>
 <th className="text-left p-3 text-dim">models</th>
 </tr>
 </thead>
 <tbody className="text-body">
 {[
 {
 c: "case 'gemini-1.5-pro'",
 limit: '2,097,152',
 models: 'gemini-1.5-pro',
 },
 {
 c: 'case (1M group)',
 limit: '1,048,576',
 models:
 'gemini-1.5-flash / gemini-2.5-pro-preview-* / gemini-2.5-pro / gemini-2.5-flash-preview-* / gemini-2.5-flash / gemini-2.5-flash-lite / gemini-2.0-flash',
 },
 {
 c: "case 'gemini-2.0-flash-preview-image-generation'",
 limit: '32,000',
 models: 'gemini-2.0-flash-preview-image-generation',
 },
 { c: 'default', limit: '1,048,576', models: 'fallback' },
 ].map((row, i) => (
 <tr key={i} className="border- border-edge/50">
 <td className="p-3 text-heading">{row.c}</td>
 <td className="p-3">{row.limit}</td>
 <td className="p-3 text-dim">{row.models}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <CodeBlock
 code={`// packages/core/src/core/tokenLimits.ts
export const DEFAULT_TOKEN_LIMIT = 1_048_576;

export function tokenLimit(model: string): number {
 switch (model) {
 case 'gemini-1.5-pro':
 return 2_097_152;
 case 'gemini-1.5-flash':
 case 'gemini-2.5-pro-preview-05-06':
 case 'gemini-2.5-pro-preview-06-05':
 case 'gemini-2.5-pro':
 case 'gemini-2.5-flash-preview-05-20':
 case 'gemini-2.5-flash':
 case 'gemini-2.5-flash-lite':
 case 'gemini-2.0-flash':
 return 1_048_576;
 case 'gemini-2.0-flash-preview-image-generation':
 return 32_000;
 default:
 return DEFAULT_TOKEN_LIMIT;
 }
}`}
 language="typescript"
 />

 <p className="text-body mt-4">
 注意：这个 limit 会与 <code>lastPromptTokenCount</code>（来自上一次 <code>usageMetadata</code>）一起用于计算 remaining tokens，并决定是否触发{' '}
 <code>ContextWindowWillOverflow</code> 预警。
 </p>
 </Layer>
 </div>
 )}

 {/* Cache Tab */}
 {activeTab === 'cache' && (
 <div className="space-y-6">
 <Layer title="模型配置缓存" icon="💾">
 <p className="text-body mb-4">
 <code className="text-heading">ModelConfigCache</code> 是一个单例类，
 缓存从后端获取的模型配置（baseURL 和 apiKey），TTL 为 5 分钟。
 </p>

 <MermaidDiagram chart={`
sequenceDiagram
 participant App as 应用层
 participant Cache as ModelConfigCache
 participant API as Gemini API

 App->>Cache: getModelConfig(modelId)

 alt 缓存有效
 Cache-->>App: 返回缓存配置
 else 缓存过期或为空
 Cache->>API: fetchGeminiModels()
 API-->>Cache: 模型列表 + baseURL + apiKey
 Cache->>Cache: 更新缓存 + lastFetchTime
 Cache-->>App: 返回新配置
 end
`} />
 </Layer>

 <Layer title="缓存实现" icon="📦">
 <CodeBlock
 code={`// packages/core/src/gemini/modelConfigCache.ts

export class ModelConfigCache {
 private static instance: ModelConfigCache;
 private cache: Map<string, { baseURL: string; apiKey: string }> = new Map();
 private lastFetchTime: number = 0;
 private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

 private constructor() {}

 static getInstance(): ModelConfigCache {
 if (!ModelConfigCache.instance) {
 ModelConfigCache.instance = new ModelConfigCache();
 }
 return ModelConfigCache.instance;
 }

 async getModelConfig(
 modelId: string,
 forceRefresh: boolean = false,
 ): Promise<{ baseURL: string; apiKey: string } | null> {
 const now = Date.now();
 const isCacheExpired = now - this.lastFetchTime > this.CACHE_TTL;

 // 缓存过期或强制刷新时重新获取
 if (forceRefresh || isCacheExpired || this.cache.size === 0) {
 await this.refreshCache();
 }

 return this.cache.get(modelId) || null;
 }

 private async refreshCache(): Promise<void> {
 const models = await fetchGeminiModels({ modelType: 4 });

 this.cache.clear();
 for (const model of models) {
 if (model.baseURL) {
 this.cache.set(model.id, {
 baseURL: model.baseURL,
 apiKey: model.apiKey || '',
 });
 }
 }

 this.lastFetchTime = Date.now();
 }
}`}
 language="typescript"
 />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
 <HighlightBox title="缓存优势" icon="✅" variant="green">
 <ul className="text-body pl-5 mb-0 space-y-1 text-sm">
 <li>减少 API 调用次数</li>
 <li>加快模型切换速度</li>
 <li>单例模式确保全局一致性</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="TTL 设计" icon="⏱️" variant="yellow">
 <ul className="text-body pl-5 mb-0 space-y-1 text-sm">
 <li>5 分钟过期保证新鲜度</li>
 <li>支持强制刷新 forceRefresh</li>
 <li>clearCache() 可手动清除</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>
 </div>
 )}

 {/* Service Tab */}
 {activeTab === 'service' && (
 <div className="space-y-6">
 <Layer title="字段映射策略" icon="🔗">
 <p className="text-dim mb-4">
 由于不同后端返回的字段名不一致，使用灵活的字段解析策略：
 </p>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
 {[
 { field: 'id', aliases: 'modelCode, modelKey, modelId, code, id, name' },
 { field: 'label', aliases: 'displayName, modelDisplayName, title' },
 { field: 'baseURL', aliases: 'baseUrl, endpoint, url, inferenceUrl' },
 { field: 'apiKey', aliases: 'api_key, key, token, accessKey' },
 ].map(item => (
 <div key={item.field} className="bg-elevated p-3 rounded-md">
 <code className="text-heading">{item.field}</code>
 <p className="text-dim text-xs mt-1 mb-0">
 {item.aliases}
 </p>
 </div>
 ))}
 </div>

 <CodeBlock
 code={`// 字段解析辅助函数
function resolveStringField(
 record: RawModelRecord,
 keys: string[],
): string | undefined {
 for (const key of keys) {
 if (!(key in record)) continue;
 const value = record[key];
 if (typeof value === 'string' && value.trim().length > 0) {
 return value.trim();
 }
 }
 return undefined;
}

// 示例：解析模型 ID
const id = resolveStringField(record, [
 'modelCode', 'modelKey', 'modelName',
 'modelId', 'code', 'id', 'name',
]);`}
 language="typescript"
 />
 </Layer>
 </div>
 )}

 {/* Normalize Tab */}
 {activeTab === 'normalize' && (
 <div className="space-y-6">
 <Layer title="模型名称标准化" icon="🔧">
 <p className="text-body mb-4">
 <code className="text-heading">normalize()</code> 函数将各种格式的模型名称转换为标准形式，
 以便正则匹配能够正确工作。
 </p>

 <MermaidDiagram chart={`
flowchart TD
 subgraph Input["输入示例"]
 I1["openai/gpt-4.1-20250219"]
 I2["gemini-2.0-flash"]
 I3["llama-7b-int4"]
 end

 subgraph Steps["处理步骤"]
 S1["1. 移除 provider 前缀<br/>openai/ → ''"]
 S2["2. 处理 pipe/colon 分隔<br/>model:tag → tag"]
 S3["3. 移除版本/日期后缀<br/>-20250219, -v1, -latest"]
 S4["4. 移除量化后缀<br/>-int4, -bf16, -q5"]
 end

 subgraph Output["输出"]
 O1["gpt-4.1"]
 O2["gemini-2.0-flash<br/>(保留 - 特殊情况)"]
 O3["llama-7b"]
 end

 I1 --> S1 --> S2 --> S3 --> O1
 I2 --> S3 --> O2
 I3 --> S4 --> O3
`} />
 </Layer>

 <Layer title="标准化实现" icon="📝">
 <CodeBlock
 code={`// packages/core/src/core/tokenLimits.ts

export function normalize(model: string): string {
 let s = (model ?? '').toLowerCase().trim();

 // 1. 移除 provider 前缀: "openai/gpt-4" → "gpt-4"
 s = s.replace(/^.*\\//, '');
 s = s.split('|').pop() ?? s;
 s = s.split(':').pop() ?? s;

 // 2. 折叠空白为连字符
 s = s.replace(/\\s+/g, '-');

 // 3. 移除 -preview 后缀
 s = s.replace(/-preview/g, '');

 // 4. 特殊情况：保留某些模型的版本标识
 // - gemini-2.0-flash, gemini-1.5-flash, gemini-1.5-pro-vision-latest
 // - kimi-k2-0905, kimi-k2-0711 (保留日期区分版本)
 if (
 !s.match(/^gemini-(?:plus|flash|vl-max)-latest$/) &&
 !s.match(/^kimi-k2-\\d{4}$/)
 ) {
 // 移除版本/日期后缀
 s = s.replace(
 /-(?:\\d{4,}|\\d+x\\d+b|v\\d+(?:\\.\\d+)*|(?<=-[^-]+-)\d+(?:\\.\\d+)+|latest|exp)$/g,
 '',
 );
 }

 // 5. 移除量化后缀
 s = s.replace(/-(?:\\d?bit|int[48]|bf16|fp16|q[45]|quantized)$/g, '');

 return s;
}

// 示例
normalize('openai/gpt-4.1-20250219'); // "gpt-4.1"
normalize('gemini-2.0-flash'); // "gemini-2.0-flash" (保留)
normalize('llama-3-70b-int4'); // "llama-3-70b"
normalize('Claude:sonnet-4'); // "sonnet-4"`}
 language="typescript"
 />
 </Layer>

 <Layer title="特殊处理规则" icon="⚡">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="保留版本标识" icon="✅" variant="purple">
 <ul className="text-body pl-5 mb-0 space-y-1 text-sm">
 <li><code>gemini-2.0-flash</code> - latest 是模型标识的一部分</li>
 <li><code>kimi-k2-0905</code> - 日期区分不同版本</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="移除的后缀" icon="🗑️" variant="red">
 <ul className="text-body pl-5 mb-0 space-y-1 text-sm">
 <li>日期: <code>-20250219</code>, <code>-0528</code></li>
 <li>版本: <code>-v1</code>, <code>-v2.1.3</code></li>
 <li>量化: <code>-int4</code>, <code>-bf16</code>, <code>-q5</code></li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>
 </div>
 )}

 {/* Architecture Overview */}
 <Layer title="系统架构" icon="🏗️">
 <MermaidDiagram chart={`
graph TB
 subgraph Usage["使用层"]
 C[ContentGenerator]
 T[TokenLimit Check]
 S[Subagent Manager]
 end

 subgraph Config["配置层"]
 TL[tokenLimits.ts<br/>Token 限制匹配]
 MC[ModelConfigCache<br/>5分钟 TTL]
 MS[GeminiModelService<br/>模型发现]
 end

 subgraph Backend["后端"]
 API[Gemini API<br/>/api/v1/model-management]
 end

 C --> TL
 T --> TL
 S --> TL
 C --> MC
 MC --> MS
 MS --> API

 style TL stroke:#276749
 style MC stroke:#1e3a5f
 style MS stroke:#553c9a
`} />
 </Layer>

 {/* Source Files */}
 <Layer title="源文件索引" icon="📁">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
 {[
 'packages/core/src/core/tokenLimits.ts',
 'packages/core/src/gemini/modelConfigCache.ts',
 'packages/core/src/gemini/geminiModelService.ts',
 'packages/core/src/config/config.ts',
 ].map(file => (
 <code key={file} className="bg-elevated px-3 py-2 rounded-md text-heading text-sm block">
 {file}
 </code>
 ))}
 </div>
 </Layer>
 </div>
 );
}

export default ModelConfiguration;
