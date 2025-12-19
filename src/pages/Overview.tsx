import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { Module } from '../components/Module';
import { ComparisonTable } from '../components/ComparisonTable';

export function Overview() {
  return (
    <div>
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
            path="core/src/tools"
            description="ReadFile、Edit、Shell 等"
          />
          <Module
            icon="☁️"
            name="AI API"
            description="Qwen / OpenAI / Gemini"
          />
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
          ]}
        />
      </Layer>
    </div>
  );
}
