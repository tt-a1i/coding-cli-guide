import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';

/**
 * VisionModelSwitch（上游 gemini-cli 对齐说明）
 *
 * 早期/部分 fork 可能会实现“检测图片 → 自动切换到 Vision 模型”的逻辑。
 * 但在上游 gemini-cli 主线中，更常见的做法是：
 * - 多模态输入通过 PartListUnion 的 inlineData/fileData 表达
 * - 模型能力由配置/路由决定（而不是由 authType 触发切换）
 */

export function VisionModelSwitch() {
  const multimodalFlow = `flowchart TD
    A[用户输入\n(文本 + @file/@dir 等)] --> B[解析为 PartListUnion]
    B --> C{Part 类型?}
    C -->|text| T[Part.text]
    C -->|inlineData| I[Part.inlineData\n(image/audio/pdf...)]
    C -->|fileData| F[Part.fileData\n(gs://... 等引用)]
    T --> D[contentGenerator.generateContentStream()]
    I --> D
    F --> D
    D --> E[Gemini API 返回流式 chunks]
    E --> G[Turn.run 归一为事件\nContent/Thought/ToolCallRequest/Finished]
`;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-cyan-400 mb-2">多模态输入（图片/文件）机制</h2>

      <HighlightBox title="先澄清：上游不靠 authType 自动切 VLM" icon="📌" variant="yellow">
        <ul className="pl-5 list-disc text-sm space-y-1">
          <li>上游 gemini-cli 的主线把图片/文件当作 <code>Part</code>（<code>inlineData</code>/<code>fileData</code>）随请求一起发送</li>
          <li>是否“能理解图片”取决于所选模型是否支持多模态；模型选择由 <code>model</code>/<code>routing</code> 决定</li>
          <li>自动切换 Vision 模型的策略更常见于 fork（请在对应页面标注 fork-only）</li>
        </ul>
      </HighlightBox>

      <MermaidDiagram title="多模态请求的真实数据形态" chart={multimodalFlow} />

      <LayeredSnippets />
    </div>
  );
}

function LayeredSnippets() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[var(--terminal-green)]">1) PartListUnion：文本 + inlineData/fileData</h3>
        <CodeBlock
          language="typescript"
          code={`// @google/genai: PartListUnion / Part (概念示意)
type Part = { text?: string } | { inlineData?: { mimeType: string; data: string } } | { fileData?: { mimeType: string; fileUri: string } };
type PartListUnion = string | Part | Array<string | Part>;
`}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-[var(--terminal-green)]">2) 文件读取：把图片/文件转成 llmContent</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-2">
          上游会把文件内容转换成可喂给模型的结构（文本 / inlineData），关键入口之一是：
          <code className="ml-1">gemini-cli/packages/core/src/utils/pathReader.ts</code>。
        </p>
        <CodeBlock
          language="typescript"
          code={`// gemini-cli/packages/core/src/utils/pathReader.ts (节选)
export async function readPathFromWorkspace(pathStr: string, config: Config): Promise<PartUnion[]> {
  // ... resolve path within workspace ...
  const result = await processSingleFileContent(absolutePath, config.getTargetDir(), config.getFileSystemService());
  return [result.llmContent];
}`}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-[var(--terminal-green)]">3) Token 预估：媒体 part 的特殊处理</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-2">
          token 预估会把 <code>inlineData</code>/<code>fileData</code> 当作“媒体 part”，走单独的估算/计费路径：
          <code className="ml-1">gemini-cli/packages/core/src/utils/tokenCalculation.ts</code>。
        </p>
        <CodeBlock
          language="typescript"
          code={`// gemini-cli/packages/core/src/utils/tokenCalculation.ts (节选)
const isMedia = 'inlineData' in p || 'fileData' in p;
// ... media 与纯文本 part 的 token 估算不同 ...
`}
        />
      </div>
    </div>
  );
}

