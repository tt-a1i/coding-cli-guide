import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { ComparisonTable } from '../components/ComparisonTable';
import { CodeBlock } from '../components/CodeBlock';

interface LoopNodeProps {
  icon: string;
  title: string;
  description: string;
  active?: boolean;
  variant?: 'default' | 'success';
}

function LoopNode({ icon, title, description, variant = 'default' }: LoopNodeProps) {
  const baseClass = variant === 'success'
    ? 'bg-green-500/20 border-green-500'
    : 'bg-cyan-400/10 border-cyan-400';

  return (
    <div
      className={`
        ${baseClass} border-2 rounded-xl p-5 text-center min-w-[150px]
        transition-all hover:scale-105
      `}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-bold mb-1">{title}</div>
      <div className="text-sm text-gray-400">{description}</div>
    </div>
  );
}

export function LoopMechanism() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">
        为什么能持续工作？循环机制详解
      </h2>

      {/* 核心概念 */}
      <Layer title="核心概念" icon="💡">
        <HighlightBox title="关键理解" icon="🔑" variant="blue">
          <p className="text-lg">
            CLI 中有一个 <strong>while 循环</strong>，不断地：
            <br />
            请求 AI → 检查是否需要工具 → 执行工具 → 再请求 AI → ...
          </p>
          <p className="mt-2">
            直到 AI 的{' '}
            <code className="bg-black/30 px-1 rounded">finish_reason</code> 是
            "stop"（表示完成），循环才结束。
          </p>
        </HighlightBox>
      </Layer>

      {/* 循环图 */}
      <Layer title="循环流程图" icon="🔄">
        <div className="flex justify-center items-center gap-5 flex-wrap p-8 bg-black/20 rounded-xl my-5">
          <LoopNode icon="📤" title="发送请求" description="用户消息 + 工具定义" />
          <div className="text-3xl text-cyan-400">→</div>
          <LoopNode icon="🤖" title="AI 处理" description="分析并响应" />
          <div className="text-3xl text-cyan-400">→</div>
          <LoopNode icon="❓" title="检查响应" description="有 tool_calls 吗？" />
          <div className="text-3xl text-cyan-400">→</div>
          <LoopNode icon="🔧" title="执行工具" description="CLI 本地执行" />
        </div>

        <div className="text-center my-5">
          <div className="text-3xl text-cyan-400">↩️ 继续循环，直到没有 tool_calls</div>
        </div>

        <div className="text-center">
          <LoopNode
            icon="✅"
            title="完成"
            description='finish_reason = "stop"'
            variant="success"
          />
        </div>
      </Layer>

      {/* 核心代码 */}
      <Layer title="核心代码解析" icon="📝">
        <CodeBlock title="packages/core/src/core/client.ts - 简化版" code={`// packages/core/src/core/client.ts - 简化版

async *sendMessageStream(request, signal, promptId, turns = 100) {
    // 最多循环 100 轮（防止无限循环）
    while (turns > 0) {
        turns--;

        // 1. 发送请求给 AI
        const stream = this.contentGenerator.generateContentStream(request);

        // 2. 处理流式响应
        for await (const event of stream) {
            yield event;  // 传给 UI 显示

            // 3. 检查是否有工具调用
            if (event.type === 'tool_call') {
                // 4. 执行工具
                const result = await this.toolScheduler.execute(event);

                // 5. 把工具结果加入消息历史
                this.conversationHistory.push({
                    role: 'tool',
                    tool_call_id: event.id,
                    content: result
                });

                // 6. 继续循环，发送下一轮请求
                continue;
            }
        }

        // 7. 如果没有工具调用，检查是否完成
        if (finishReason === 'stop') {
            break;  // 退出循环
        }
    }
}`} />
      </Layer>

      {/* 多工具调用示例 */}
      <Layer title="复杂场景：多工具链式调用" icon="🔗">
        <p className="mb-4">
          用户请求："帮我在 src 目录下找所有 .ts 文件，然后统计总行数"
        </p>

        <ComparisonTable
          headers={['轮次', 'AI 决定', 'CLI 执行']}
          rows={[
            [
              '第 1 轮',
              <span key="1">
                调用 <code className="bg-black/30 px-1 rounded">glob</code>{' '}
                工具，pattern: "src/**/*.ts"
              </span>,
              '返回文件列表：[src/a.ts, src/b.ts, ...]',
            ],
            [
              '第 2 轮',
              <span key="2">
                调用 <code className="bg-black/30 px-1 rounded">shell</code>{' '}
                工具，command: "wc -l src/*.ts"
              </span>,
              '返回行数统计',
            ],
            [
              '第 3 轮',
              '生成最终回复："共找到 15 个文件，总计 2,345 行"',
              '显示给用户',
            ],
          ]}
        />

        <HighlightBox title="AI 可以并行调用多个工具" icon="💡">
          <p>
            一次响应中可以包含多个{' '}
            <code className="bg-black/30 px-1 rounded">tool_calls</code>，CLI
            会并行执行它们。
          </p>
        </HighlightBox>
      </Layer>

      {/* 最大轮次限制 */}
      <Layer title="安全机制：最大轮次限制" icon="🛡️">
        <CodeBlock code={`// 默认最大 100 轮
const MAX_TURNS = 100;

// 为什么需要这个限制？
// 1. 防止 AI "陷入循环"，不断调用工具
// 2. 控制 API 调用成本
// 3. 防止意外的无限执行`} />

        <p className="mt-4">
          如果 AI 连续调用工具 100 次还没完成，CLI 会强制停止并提示用户。
        </p>
      </Layer>
    </div>
  );
}
