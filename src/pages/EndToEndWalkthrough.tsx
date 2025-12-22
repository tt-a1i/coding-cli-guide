import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';

export function EndToEndWalkthrough() {
  const e2eFlow = `flowchart TD
    start(["用户输入"])
    preprocess["消息预处理<br/>@file/@memory/@url"]
    buildReq["构建请求<br/>history + tools + system prompt"]
    stream["流式响应<br/>token/parts"]
    finish{"finish_reason?"}
    toolCalls["tool_calls<br/>解析 + 校验"]
    approval["审批/沙箱/可信文件夹"]
    exec["执行工具"]
    addResult["结果入历史"]
    nextRound["下一轮请求"]
    final["最终输出"]
    persist["持久化<br/>日志/统计/记忆"]

    start --> preprocess --> buildReq --> stream --> finish
    finish -->|tool_calls| toolCalls --> approval --> exec --> addResult --> nextRound --> buildReq
    finish -->|stop| final --> persist`;

  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">端到端走读</h2>

      <Layer title="快速理解（建议先看这里）" icon="🧭">
        <HighlightBox title="一句话主线" variant="blue">
          <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-300">
            <li>CLI 接收用户输入，先做 @ 引用等预处理。</li>
            <li>把历史对话 + 系统提示词 + 工具定义组装成一次 API 请求，走流式输出。</li>
            <li>如果模型返回 tool_calls，CLI 解析并进入工具调度：校验参数、走审批/沙箱、执行工具。</li>
            <li>工具结果写回历史，再发起下一轮请求，直到 finish_reason=stop 输出最终答案。</li>
          </ol>
        </HighlightBox>
      </Layer>

      <Layer title="端到端流程图" icon="🗺️">
        <MermaidDiagram chart={e2eFlow} />
        <div className="text-sm text-gray-400 mt-2">
          细节页建议配合阅读：请求生命周期、交互主循环、工具调度、审批模式、沙箱系统、可信文件夹。
        </div>
      </Layer>

      <Layer title="关键入口（建议打开的源码点）" icon="🔍">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="CLI 交互主循环" variant="green">
            <div className="text-sm text-gray-300">
              关注：输入 → 流式输出 → tool_calls → 下一轮
              <div className="mt-2 text-xs text-gray-500">参考页：交互主循环 / 核心循环</div>
            </div>
          </HighlightBox>
          <HighlightBox title="工具调度与执行" variant="purple">
            <div className="text-sm text-gray-300">
              关注：并发、依赖、审批、安全边界
              <div className="mt-2 text-xs text-gray-500">参考页：工具调度详解 / 工具架构 / 工具执行</div>
            </div>
          </HighlightBox>
        </div>

        <CodeBlock
          title="建议你打开的 3 个文件（示意）"
          code={[
            'packages/cli/src/ui/hooks/useGeminiStream.ts',
            'packages/core/src/tools/coreToolScheduler.ts',
            'packages/core/src/.../approval|sandbox|trustedFolders',
          ].join('\n')}
        />
      </Layer>

      <Layer title="常见问题" icon="💬">
        <div className="space-y-3 text-sm text-gray-300">
          <div>
            <div className="text-cyan-300 font-semibold">Q：为什么需要“审批/沙箱”？</div>
            <div className="text-gray-400">
              A：模型不可信，工具具备副作用；审批/沙箱/信任边界是防止越权与误操作的关键门禁。
            </div>
          </div>
          <div>
            <div className="text-cyan-300 font-semibold">Q：tool_calls 出错怎么兜底？</div>
            <div className="text-gray-400">
              A：参数校验 + 重试/回退策略 + 将错误结果入历史，让模型可自我修正下一轮调用。
            </div>
          </div>
          <div>
            <div className="text-cyan-300 font-semibold">Q：上下文窗口怎么处理？</div>
            <div className="text-gray-400">
              A：通过裁剪/摘要/记忆检索等手段控制 token，占位符与文件引用要可追踪、可回溯。
            </div>
          </div>
        </div>
      </Layer>
    </div>
  );
}
