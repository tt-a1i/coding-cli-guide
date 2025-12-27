/**
 * ModelConfiguration.tsx - 模型配置系统详解
 *
 * 涵盖 Token 限制匹配、模型服务发现、配置缓存等核心机制
 */

import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';

export function ModelConfiguration() {
  const [activeTab, setActiveTab] = useState<'limits' | 'cache' | 'service' | 'normalize'>('limits');

  return (
    <div className="page-container">
      <h1>🎛️ 模型配置系统</h1>

      <div className="info-box" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
        borderLeft: '4px solid #10b981',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#34d399' }}>核心职责</h3>
        <p style={{ margin: 0, color: '#d1d5db' }}>
          模型配置系统负责管理 Token 限制匹配、模型元信息缓存、多厂商模型发现，
          确保 CLI 能够正确地与不同模型交互并优化上下文使用。
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation" style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'limits', label: '📏 Token 限制' },
          { id: 'cache', label: '💾 配置缓存' },
          { id: 'service', label: '🔍 模型服务' },
          { id: 'normalize', label: '🔧 名称标准化' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: activeTab === tab.id ? '#10b981' : '#374151',
              color: activeTab === tab.id ? 'white' : '#9ca3af',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Token Limits Tab */}
      {activeTab === 'limits' && (
        <div className="content-section">
          <h2>Token 限制匹配系统</h2>

          <p style={{ color: '#d1d5db', marginBottom: '1.5rem' }}>
            通过正则模式匹配确定模型的上下文窗口大小和最大输出长度。
            模型名称先标准化（去除前缀、版本后缀），然后按"最具体→最通用"顺序匹配。
          </p>

          <MermaidDiagram chart={`
flowchart LR
    subgraph Input["输入"]
        M[模型名称<br/>"openai/gpt-4.1-20250219"]
    end

    subgraph Normalize["标准化"]
        N1[移除前缀<br/>"gpt-4.1-20250219"]
        N2[移除版本后缀<br/>"gpt-4.1"]
    end

    subgraph Match["模式匹配"]
        P1["^gpt-4.1.*$ → 1M"]
        P2["^gpt-4o.*$ → 128K"]
        P3["默认 → 128K"]
    end

    subgraph Result["结果"]
        R[1,048,576 tokens]
    end

    M --> N1 --> N2 --> P1
    P1 --> R

    style P1 fill:#276749
    style R fill:#1e3a5f
`} />

          <h3>输入上下文限制 (PATTERNS)</h3>
          <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9ca3af' }}>模型系列</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9ca3af' }}>输入上下文</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9ca3af' }}>匹配模式</th>
                </tr>
              </thead>
              <tbody style={{ color: '#d1d5db' }}>
                {[
                  { model: 'Gemini 2.5 Pro', limit: '1M (1,048,576)', pattern: '^gemini-2\\.5-pro.*$' },
                  { model: 'Gemini 2.0 Flash', limit: '1M (1,048,576)', pattern: '^gemini-2\\.0-flash.*$' },
                  { model: 'GPT-4.1', limit: '1M (1,048,576)', pattern: '^gpt-4\\.1.*$' },
                  { model: 'GPT-4o', limit: '128K (131,072)', pattern: '^gpt-4o.*$' },
                  { model: 'Claude Sonnet 4', limit: '1M (1,048,576)', pattern: '^claude-sonnet-4.*$' },
                  { model: 'Claude 3.5 Sonnet', limit: '200K (200,000)', pattern: '^claude-3\\.5-sonnet.*$' },
                  { model: 'Qwen3-Coder-Plus', limit: '1M (1,048,576)', pattern: '^qwen3-coder-plus(-.*)?$' },
                  { model: 'Qwen3-Max', limit: '256K (262,144)', pattern: '^qwen3-max(-preview)?(-.*)?$' },
                  { model: 'Qwen2.5', limit: '128K (131,072)', pattern: '^qwen2\\.5.*$' },
                  { model: 'DeepSeek R1', limit: '128K (131,072)', pattern: '^deepseek-r1(?:-.*)?$' },
                  { model: 'Kimi K2-0905', limit: '256K (262,144)', pattern: '^kimi-k2-0905$' },
                  { model: 'Llama 4 Scout', limit: '10M (10,485,760)', pattern: '^llama-4-scout.*$' },
                  { model: '默认', limit: '128K (131,072)', pattern: '(无匹配时)' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '0.75rem', color: row.model === '默认' ? '#9ca3af' : '#22d3ee' }}>{row.model}</td>
                    <td style={{ padding: '0.75rem' }}>{row.limit}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <code style={{ color: '#a78bfa', fontSize: '0.8rem' }}>{row.pattern}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>输出 Token 限制 (OUTPUT_PATTERNS)</h3>
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9ca3af' }}>模型</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9ca3af' }}>最大输出</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9ca3af' }}>匹配模式</th>
                </tr>
              </thead>
              <tbody style={{ color: '#d1d5db' }}>
                {[
                  { model: 'Qwen3-Coder-Plus', limit: '64K (65,536)', pattern: '^qwen3-coder-plus(-.*)?$' },
                  { model: 'Qwen3-Max', limit: '64K (65,536)', pattern: '^qwen3-max(-preview)?(-.*)?$' },
                  { model: 'Qwen3-VL-Plus', limit: '32K (32,768)', pattern: '^qwen3-vl-plus$' },
                  { model: 'Qwen-VL-Max-Latest', limit: '8K (8,192)', pattern: '^qwen-vl-max-latest$' },
                  { model: '默认', limit: '4K (4,096)', pattern: '(无匹配时)' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '0.75rem', color: row.model === '默认' ? '#9ca3af' : '#fb923c' }}>{row.model}</td>
                    <td style={{ padding: '0.75rem' }}>{row.limit}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <code style={{ color: '#a78bfa', fontSize: '0.8rem' }}>{row.pattern}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CodeBlock
            code={`// packages/core/src/core/tokenLimits.ts

export function tokenLimit(
  model: Model,
  type: TokenLimitType = 'input',
): TokenCount {
  const norm = normalize(model);

  // 根据类型选择模式表
  const patterns = type === 'output' ? OUTPUT_PATTERNS : PATTERNS;

  // 按顺序匹配（最具体 → 最通用）
  for (const [regex, limit] of patterns) {
    if (regex.test(norm)) {
      return limit;
    }
  }

  // 返回默认值
  return type === 'output'
    ? DEFAULT_OUTPUT_TOKEN_LIMIT   // 4,096
    : DEFAULT_TOKEN_LIMIT;         // 131,072
}

// 使用示例
tokenLimit('gpt-4.1-20250219');           // 1,048,576 (1M)
tokenLimit('qwen3-coder-plus', 'output'); // 65,536 (64K)`}
            language="typescript"
          />
        </div>
      )}

      {/* Cache Tab */}
      {activeTab === 'cache' && (
        <div className="content-section">
          <h2>模型配置缓存</h2>

          <p style={{ color: '#d1d5db', marginBottom: '1.5rem' }}>
            <code style={{ color: '#22d3ee' }}>ModelConfigCache</code> 是一个单例类，
            缓存从后端获取的模型配置（baseURL 和 apiKey），TTL 为 5 分钟。
          </p>

          <MermaidDiagram chart={`
sequenceDiagram
    participant App as 应用层
    participant Cache as ModelConfigCache
    participant API as Innies API

    App->>Cache: getModelConfig(modelId)

    alt 缓存有效
        Cache-->>App: 返回缓存配置
    else 缓存过期或为空
        Cache->>API: fetchInniesModels()
        API-->>Cache: 模型列表 + baseURL + apiKey
        Cache->>Cache: 更新缓存 + lastFetchTime
        Cache-->>App: 返回新配置
    end
`} />

          <CodeBlock
            code={`// packages/core/src/innies/modelConfigCache.ts

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
    const models = await fetchInniesModels({ modelType: 4 });

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

  getCacheStats(): { size: number; lastFetchTime: number; isExpired: boolean } {
    return {
      size: this.cache.size,
      lastFetchTime: this.lastFetchTime,
      isExpired: Date.now() - this.lastFetchTime > this.CACHE_TTL,
    };
  }
}`}
            language="typescript"
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <h4 style={{ color: '#34d399', marginTop: 0 }}>缓存优势</h4>
              <ul style={{ color: '#9ca3af', paddingLeft: '1.2rem', marginBottom: 0 }}>
                <li>减少 API 调用次数</li>
                <li>加快模型切换速度</li>
                <li>单例模式确保全局一致性</li>
              </ul>
            </div>

            <div style={{
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <h4 style={{ color: '#fcd34d', marginTop: 0 }}>TTL 设计</h4>
              <ul style={{ color: '#9ca3af', paddingLeft: '1.2rem', marginBottom: 0 }}>
                <li>5 分钟过期保证新鲜度</li>
                <li>支持强制刷新 forceRefresh</li>
                <li>clearCache() 可手动清除</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Service Tab */}
      {activeTab === 'service' && (
        <div className="content-section">
          <h2>模型服务发现</h2>

          <p style={{ color: '#d1d5db', marginBottom: '1.5rem' }}>
            <code style={{ color: '#22d3ee' }}>fetchInniesModels</code> 从 Innies 后端获取可用模型列表，
            支持按 modelType 过滤，返回标准化的模型摘要信息。
          </p>

          <CodeBlock
            code={`// packages/core/src/innies/inniesModelService.ts

export interface InniesModelSummary {
  id: string;           // 模型标识符
  label: string;        // 显示名称
  description?: string; // 描述
  provider?: string;    // 提供商
  modelType?: number;   // 模型类型
  baseURL?: string;     // API 端点
  apiKey?: string;      // API 密钥
  raw: Record<string, unknown>; // 原始数据
}

export async function fetchInniesModels(
  options?: InniesModelSearchOptions,
): Promise<InniesModelSummary[]> {
  const sharedManager = SharedTokenManager.getInstance();
  const inniesClient = new InniesOAuth2Client();
  const credentials = await sharedManager.getValidCredentials(inniesClient);

  const accessToken = credentials.access_token;
  if (!accessToken) {
    throw new Error('No Innies access token available for model search.');
  }

  const url = new URL(INNIES_MODEL_SEARCH_ENDPOINT);
  url.searchParams.set('modelType', (options?.modelType ?? 4).toString());
  url.searchParams.set('query', '');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: \`Bearer \${accessToken}\`,
      'x-request-id': randomUUID(),
    },
    signal: options?.signal,
  });

  const payload = await response.json();
  const records = normalizeModelRecords(payload);
  return records
    .map(mapRecordToSummary)
    .filter((entry): entry is InniesModelSummary => entry !== null);
}`}
            language="typescript"
          />

          <h3>字段映射策略</h3>
          <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
            由于不同后端返回的字段名不一致，使用灵活的字段解析策略：
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            {[
              { field: 'id', aliases: 'modelCode, modelKey, modelId, code, id, name' },
              { field: 'label', aliases: 'displayName, modelDisplayName, title' },
              { field: 'baseURL', aliases: 'baseUrl, endpoint, url, inferenceUrl' },
              { field: 'apiKey', aliases: 'api_key, key, token, accessKey' },
            ].map(item => (
              <div key={item.field} style={{
                background: '#1f2937',
                padding: '0.75rem',
                borderRadius: '0.375rem'
              }}>
                <code style={{ color: '#22d3ee' }}>{item.field}</code>
                <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
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
        </div>
      )}

      {/* Normalize Tab */}
      {activeTab === 'normalize' && (
        <div className="content-section">
          <h2>模型名称标准化</h2>

          <p style={{ color: '#d1d5db', marginBottom: '1.5rem' }}>
            <code style={{ color: '#22d3ee' }}>normalize()</code> 函数将各种格式的模型名称转换为标准形式，
            以便正则匹配能够正确工作。
          </p>

          <MermaidDiagram chart={`
flowchart TD
    subgraph Input["输入示例"]
        I1["openai/gpt-4.1-20250219"]
        I2["qwen-plus-latest"]
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
        O2["qwen-plus-latest<br/>(保留 - 特殊情况)"]
        O3["llama-7b"]
    end

    I1 --> S1 --> S2 --> S3 --> O1
    I2 --> S3 --> O2
    I3 --> S4 --> O3
`} />

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
  // - qwen-plus-latest, qwen-flash-latest, qwen-vl-max-latest
  // - kimi-k2-0905, kimi-k2-0711 (保留日期区分版本)
  if (
    !s.match(/^qwen-(?:plus|flash|vl-max)-latest$/) &&
    !s.match(/^kimi-k2-\\d{4}$/)
  ) {
    // 移除版本/日期后缀:
    // - \\d{4,}      : 4位以上数字 (日期 20250219)
    // - \\d+x\\d+b    : 参数量 4x8b, 70b
    // - v\\d+(?:\\.\\d+)* : 版本号 v1, v1.2
    // - latest|exp   : 字面量
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
normalize('openai/gpt-4.1-20250219');  // "gpt-4.1"
normalize('qwen-plus-latest');          // "qwen-plus-latest" (保留)
normalize('llama-3-70b-int4');          // "llama-3-70b"
normalize('Claude:sonnet-4');           // "sonnet-4"`}
            language="typescript"
          />

          <h3>特殊处理规则</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <h4 style={{ color: '#a78bfa', marginTop: 0 }}>保留版本标识</h4>
              <ul style={{ color: '#9ca3af', paddingLeft: '1.2rem', marginBottom: 0, fontSize: '0.875rem' }}>
                <li><code>qwen-plus-latest</code> - latest 是模型标识的一部分</li>
                <li><code>kimi-k2-0905</code> - 日期区分不同版本</li>
              </ul>
            </div>

            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <h4 style={{ color: '#f87171', marginTop: 0 }}>移除的后缀</h4>
              <ul style={{ color: '#9ca3af', paddingLeft: '1.2rem', marginBottom: 0, fontSize: '0.875rem' }}>
                <li>日期: <code>-20250219</code>, <code>-0528</code></li>
                <li>版本: <code>-v1</code>, <code>-v2.1.3</code></li>
                <li>量化: <code>-int4</code>, <code>-bf16</code>, <code>-q5</code></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Architecture Overview */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginTop: '2rem'
      }}>
        <h2 style={{ color: '#34d399', marginTop: 0 }}>系统架构</h2>

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
        MS[InniesModelService<br/>模型发现]
    end

    subgraph Backend["后端"]
        API[Innies API<br/>/api/v1/model-management]
    end

    C --> TL
    T --> TL
    S --> TL
    C --> MC
    MC --> MS
    MS --> API

    style TL fill:#276749
    style MC fill:#1e3a5f
    style MS fill:#553c9a
`} />
      </div>

      {/* Source Files */}
      <div className="source-files" style={{ marginTop: '2rem' }}>
        <h3>源文件索引</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.5rem'
        }}>
          {[
            'packages/core/src/core/tokenLimits.ts',
            'packages/core/src/innies/modelConfigCache.ts',
            'packages/core/src/innies/inniesModelService.ts',
            'packages/core/src/config/config.ts',
          ].map(file => (
            <code key={file} style={{
              background: '#1f2937',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              color: '#22d3ee',
              fontSize: '0.875rem'
            }}>
              {file}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ModelConfiguration;
