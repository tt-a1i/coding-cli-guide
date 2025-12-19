import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';

export function SystemPromptArch() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-cyan-400">System Prompt 动态构建机制</h2>
        <p className="text-gray-400 mt-2">
          Innise CLI 的"灵魂"不仅仅是一段静态文本，而是根据环境动态组装的指令集。
        </p>
      </div>

      <Layer title="构建流水线 (Pipeline)" icon="🏭">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <div className="flex flex-col gap-2 w-full md:w-1/3">
            <HighlightBox title="1. 基础指令" icon="📜" variant="blue">
              <p className="text-sm">定义核心角色、Mandates (规范)、工具使用规则。</p>
            </HighlightBox>
            <HighlightBox title="2. 环境感知" icon="🌍" variant="orange">
              <p className="text-sm">
                检测是否在 <strong>Git 仓库</strong>? <br/>
                检测是否在 <strong>Sandbox</strong>?
              </p>
            </HighlightBox>
            <HighlightBox title="3. 记忆注入" icon="🧠" variant="purple">
              <p className="text-sm">读取 <code>INNIES.md</code> 和用户偏好。</p>
            </HighlightBox>
          </div>
          
          <div className="hidden md:flex flex-col items-center justify-center text-cyan-400 text-3xl">
            ➜ 
            <span className="text-sm text-gray-500 my-2">Concatenation</span>
            ➜
          </div>

          <div className="w-full md:w-2/3">
             <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-4 font-mono text-xs text-gray-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <div className="text-cyan-400 mb-2">FINAL SYSTEM PROMPT</div>
                <div className="space-y-2">
                  <div className="p-2 bg-blue-500/10 rounded border-l-2 border-blue-500">
                    <span className="text-blue-300"># Core Mandates</span><br/>
                    You are Innies CLI... adhering strictly to project conventions...
                  </div>
                  <div className="p-2 bg-orange-500/10 rounded border-l-2 border-orange-500">
                    <span className="text-orange-300"># Git Context</span><br/>
                    Current directory is a git repo. Always check `git status` before...
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded border-l-2 border-purple-500">
                    <span className="text-purple-300"># Memory</span><br/>
                    User prefers TypeScript over JavaScript...
                  </div>
                  <div className="p-2 bg-green-500/10 rounded border-l-2 border-green-500">
                    <span className="text-green-300"># Tool Definitions</span><br/>
                    Available tools: read_file, write_file, todo_write...
                  </div>
                </div>
             </div>
          </div>
        </div>
      </Layer>

      <Layer title="关键代码解析" icon="💻">
        <p className="text-gray-300 mb-4">
          位于 <code>packages/core/src/core/prompts.ts</code> 的 <code>getCoreSystemPrompt</code> 函数负责这一过程。
        </p>
        <CodeBlock 
          title="prompts.ts (Simplified Logic)"
          code={`export function getCoreSystemPrompt(userMemory?: string, model?: string): string {
  // 1. Load Base Prompt (or override from file)
  let basePrompt = loadBasePrompt(); 

  // 2. Inject Sandbox Instructions
  if (process.env['SANDBOX']) {
    basePrompt += "\n# Sandbox Mode\nYou are running in a restricted container...";
  }

  // 3. Inject Git Instructions
  if (isGitRepository(process.cwd())) {
    basePrompt += "\n# Git Repository\nAlways propose draft commit messages...";
  }

  // 4. Inject User Memory (INNIES.md)
  if (userMemory) {
    basePrompt += \`\\n\\n---\\n\\n\${userMemory.trim()}\`;
  }

  // 5. Inject Model-Specific Tool Examples
  basePrompt += getToolCallExamples(model);

  return basePrompt;
}`}
        />
      </Layer>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Layer title="特殊机制：Plan Mode" icon="🛡️">
          <p className="text-gray-300 text-sm mb-3">
            当用户暂不希望执行修改时，系统会注入一段特殊的 <code>&lt;system-reminder&gt;</code>，强制 AI 进入"只读计划模式"。
          </p>
          <div className="bg-red-900/20 border border-red-500/30 p-3 rounded text-xs font-mono text-red-200">
            &lt;system-reminder&gt;<br/>
            Plan mode is active. You MUST NOT make any edits...
            Instead, present your plan using <code>exit_plan_mode</code> tool.
            &lt;/system-reminder&gt;
          </div>
        </Layer>

        <Layer title="特殊机制：Task Management" icon="✅">
          <p className="text-gray-300 text-sm mb-3">
            System Prompt 强制 AI 频繁使用 <code>todo_write</code> 工具来管理任务，防止 AI 在长任务中"迷路"。
          </p>
          <div className="bg-green-900/20 border border-green-500/30 p-3 rounded text-xs font-mono text-green-200">
            # Task Management<br/>
            You have access to <code>todo_write</code>...<br/>
            If you do not use this tool when planning, you may forget important tasks - and that is unacceptable.
          </div>
        </Layer>
      </div>
    </div>
  );
}
