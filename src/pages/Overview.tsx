import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { Module } from '../components/Module';
import { ComparisonTable } from '../components/ComparisonTable';

function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏗️</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">架构设计理念</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">🎯 核心设计原则</h4>
            <ul className="text-[var(--text-secondary)] text-sm space-y-2">
              <li>• <strong>请求-响应模式</strong>：AI 不是持续运行的服务，每次交互都是独立的 API 调用</li>
              <li>• <strong>CLI 为中心</strong>：所有工具执行发生在本地，AI 只负责决策</li>
              <li>• <strong>流式处理</strong>：实时处理 AI 响应，提供即时反馈</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">🔧 为什么这样设计</h4>
            <div className="text-[var(--text-secondary)] text-sm space-y-2">
              <p><strong>安全性</strong>：工具在本地执行意味着用户完全控制权限，不需要将敏感数据发送到云端</p>
              <p><strong>灵活性</strong>：CLI 层和 Core 层分离，便于适配不同 AI 提供商（Qwen/OpenAI/Gemini）</p>
              <p><strong>可扩展性</strong>：通过 MCP 协议支持动态工具注册，无需修改核心代码</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">🏗️ 分层架构</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--terminal-green)]/30 text-center">
                <div className="text-[var(--terminal-green)] font-semibold text-sm">UI Layer</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">React/Ink<br/>用户交互</div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--cyber-blue)]/30 text-center">
                <div className="text-[var(--cyber-blue)] font-semibold text-sm">Core Layer</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">GeminiChat<br/>核心循环</div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--amber)]/30 text-center">
                <div className="text-[var(--amber)] font-semibold text-sm">Tool Layer</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">20+ 工具<br/>本地执行</div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--purple)]/30 text-center">
                <div className="text-[var(--purple)] font-semibold text-sm">API Layer</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">多厂商<br/>统一抽象</div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">⚖️ 设计权衡</h4>
            <div className="text-[var(--text-secondary)] text-sm space-y-2">
              <p><strong>复杂性 vs 灵活性</strong>：多层架构增加了代码复杂度，但提供了极大的扩展能力</p>
              <p><strong>安全 vs 便利</strong>：审批机制可能降低效率，但保护了用户免受误操作</p>
              <p><strong>通用 vs 专用</strong>：支持多 AI 厂商需要抽象层，但增加了维护成本</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Overview() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  return (
    <div>
      <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

      <Layer title="整体架构" icon="🏗️">
        <HighlightBox title="核心理解" icon="💡" variant="blue">
          <p>
            <strong>AI 不是一直运行的！</strong> 每次 AI
            请求都是独立的 HTTP 调用。CLI 负责：
          </p>
          <ul className="mt-2 pl-5 list-disc">
            <li>发送请求给 AI</li>
            <li>接收 AI 的响应</li>
            <li>如果 AI 说"我要调用工具"，CLI 执行工具</li>
            <li>把工具结果发给 AI，继续下一轮</li>
          </ul>
        </HighlightBox>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-5">
          <Module icon="👤" name="用户" description="在终端输入问题" />
          <Module
            icon="🖥️"
            name="CLI 层"
            path="packages/cli"
            description="UI 渲染、用户交互"
          />
          <Module
            icon="⚙️"
            name="Core 层"
            path="packages/core"
            description="AI 客户端、工具调度"
          />
          <Module
            icon="🔧"
            name="工具层"
            path="packages/core/src/tools"
            description="ReadFile、Edit、Shell 等"
          />
          <Module
            icon="☁️"
            name="AI API"
            description="Qwen / OpenAI / Gemini"
          />
        </div>
      </Layer>

      {/* 核心流程 */}
      <Layer title="核心交互流程" icon="🔄">
        <div className="bg-[var(--bg-panel)] rounded-xl p-6 border border-[var(--border-subtle)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--terminal-green)]/20 flex items-center justify-center text-2xl border-2 border-[var(--terminal-green)]">
                👤
              </div>
              <div className="mt-2 text-sm font-mono text-[var(--terminal-green)]">用户输入</div>
            </div>
            <div className="text-[var(--text-muted)] text-2xl">→</div>
            <div className="flex-1 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--cyber-blue)]/20 flex items-center justify-center text-2xl border-2 border-[var(--cyber-blue)]">
                🤖
              </div>
              <div className="mt-2 text-sm font-mono text-[var(--cyber-blue)]">AI 思考</div>
            </div>
            <div className="text-[var(--text-muted)] text-2xl">→</div>
            <div className="flex-1 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--amber)]/20 flex items-center justify-center text-2xl border-2 border-[var(--amber)]">
                🔧
              </div>
              <div className="mt-2 text-sm font-mono text-[var(--amber)]">工具执行</div>
            </div>
            <div className="text-[var(--text-muted)] text-2xl">→</div>
            <div className="flex-1 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--purple)]/20 flex items-center justify-center text-2xl border-2 border-[var(--purple)]">
                📝
              </div>
              <div className="mt-2 text-sm font-mono text-[var(--purple)]">结果反馈</div>
            </div>
            <div className="text-[var(--text-muted)] text-2xl hidden md:block">↻</div>
          </div>
          <p className="text-center text-sm text-[var(--text-muted)] mt-4 font-mono">
            这个循环持续进行，直到 AI 返回 finish_reason: STOP
          </p>
        </div>
      </Layer>

      <Layer title="常见问题" icon="❓">
        <ComparisonTable
          headers={['问题', '答案']}
          rows={[
            [
              'AI 是一直运行的吗？',
              <span key="1">
                <strong>不是！</strong> AI 是云端服务，每次对话都是独立的 HTTP 请求
              </span>,
            ],
            [
              'AI 怎么知道有哪些工具？',
              <span key="2">
                CLI 在每次请求时，把<strong>工具定义</strong>
                （名称、描述、参数）发给 AI
              </span>,
            ],
            [
              'AI 怎么调用工具？',
              <span key="3">
                AI 在响应中返回<strong>特殊格式</strong>，说"我要调用 xxx 工具"
              </span>,
            ],
            [
              '谁执行工具？',
              <span key="4">
                <strong>CLI 执行！</strong> 不是 AI。AI 只是告诉 CLI 要调用什么
              </span>,
            ],
            [
              '为什么能持续工作？',
              <span key="5">
                CLI 有一个<strong>循环</strong>：请求 → 响应 → 执行工具 →
                再请求...
              </span>,
            ],
            [
              '什么是 Continuation？',
              <span key="6">
                当 AI 返回 <code className="bg-black/30 px-1 rounded">finish_reason != STOP</code> 时，
                CLI 自动将工具结果反馈给 AI <strong>继续对话</strong>
              </span>,
            ],
          ]}
        />
      </Layer>

      {/* 关键数字 */}
      <Layer title="关键数字" icon="📊">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--border-subtle)] text-center">
            <div className="text-2xl font-bold text-[var(--terminal-green)]">20+</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">内置工具</div>
          </div>
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--border-subtle)] text-center">
            <div className="text-2xl font-bold text-[var(--cyber-blue)]">100</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">最大轮次</div>
          </div>
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--border-subtle)] text-center">
            <div className="text-2xl font-bold text-[var(--amber)]">4</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">审批模式</div>
          </div>
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--border-subtle)] text-center">
            <div className="text-2xl font-bold text-[var(--purple)]">3</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">AI 厂商</div>
          </div>
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--border-subtle)] text-center">
            <div className="text-2xl font-bold text-red-400">2M</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">最大 Token</div>
          </div>
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--border-subtle)] text-center">
            <div className="text-2xl font-bold text-pink-400">∞</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">MCP 扩展</div>
          </div>
        </div>
      </Layer>
    </div>
  );
}
