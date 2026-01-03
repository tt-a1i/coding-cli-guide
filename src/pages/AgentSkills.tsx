import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'system-prompt', label: 'Prompt构建', description: 'System Prompt 如何注入 skills 列表' },
  { id: 'tool-ref', label: '工具参考', description: 'activate_skill 工具细节' },
  { id: 'policy-engine', label: 'Policy 策略引擎', description: 'activate_skill 默认 ask_user' },
  { id: 'slash-cmd', label: '斜杠命令', description: '/skills 命令与 UI 展示' },
];

export function AgentSkills() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">Agent Skills（技能系统）</h2>
        <p className="text-gray-300">
          Skills 是一套“可发现 + 可激活”的专家指令包：CLI 启动时从固定目录扫描 <code>SKILL.md</code>，模型在合适时机通过
          <code className="text-cyan-300"> activate_skill</code> 取回指令，并把其作为本次任务的优先执行规范。
        </p>
      </section>

      <Layer title="目标" icon="🎯">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightBox title="可复用工作流" variant="blue">
            <p className="text-sm text-gray-300">
              将“我团队的标准流程”沉淀为 SKILL.md，减少每次重复解释。
            </p>
          </HighlightBox>
          <HighlightBox title="任务自适配" variant="green">
            <p className="text-sm text-gray-300">
              模型先看到可用 skills 列表，再按任务匹配主动激活（而不是靠用户记住命令名）。
            </p>
          </HighlightBox>
          <HighlightBox title="可控注入" variant="purple">
            <p className="text-sm text-gray-300">
              激活默认需要用户确认（ask_user），避免把本地内容静默注入到对话上下文。
            </p>
          </HighlightBox>
        </div>
      </Layer>

      <Layer title="技能发现（Discovery）" icon="🗂️">
        <p className="text-gray-300 mb-4">
          skills 启用后，<code>SkillManager</code> 会从用户目录和项目目录扫描 <code>*/SKILL.md</code>：
          项目级 skill 会覆盖同名用户级 skill（同名以 YAML frontmatter 的 <code>name</code> 为准）。
        </p>

        <CodeBlock
          title="目录约定（storage.ts）"
          code={`// packages/core/src/config/storage.ts
static getUserSkillsDir(): string {
  return path.join(Storage.getGlobalGeminiDir(), 'skills'); // ~/.gemini/skills
}

getProjectSkillsDir(): string {
  return path.join(this.getGeminiDir(), 'skills'); // <project>/.gemini/skills
}`}
        />

        <CodeBlock
          title="发现顺序与覆盖（skillManager.ts）"
          code={`// packages/core/src/services/skillManager.ts
// 1) User skills first
const userSkills = await this.discoverSkillsInternal([Storage.getUserSkillsDir()]);
this.addSkillsWithPrecedence(userSkills);

// 2) Project skills second (overwrites user skills with same name)
const projectSkills = await this.discoverSkillsInternal([storage.getProjectSkillsDir()]);
this.addSkillsWithPrecedence(projectSkills);`}
        />

        <CodeBlock
          title="SKILL.md 结构（YAML frontmatter + body）"
          code={`---
name: confidence-check
description: Pre-implementation confidence assessment (≥90% required).
---

# What to do
- ...skill instructions...`}
        />
      </Layer>

      <Layer title="激活机制（activate_skill）" icon="🧩">
        <p className="text-gray-300 mb-4">
          模型激活 skill 时调用 <code className="text-cyan-300">activate_skill</code>，工具会返回一个带标签的片段：
          <code className="text-purple-300"> &lt;ACTIVATED_SKILL&gt;</code> 中包含 <code>&lt;INSTRUCTIONS&gt;</code> 与
          <code>&lt;AVAILABLE_RESOURCES&gt;</code>（技能目录的文件结构）。
        </p>

        <CodeBlock
          title="返回格式（activate-skill.ts）"
          code={`// packages/core/src/tools/activate-skill.ts
return {
  llmContent: \`<ACTIVATED_SKILL name="\${skillName}">
  <INSTRUCTIONS>
    \${skill.body}
  </INSTRUCTIONS>

  <AVAILABLE_RESOURCES>
    \${folderStructure}
  </AVAILABLE_RESOURCES>
</ACTIVATED_SKILL>\`,
};`}
        />

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="text-amber-400 font-semibold mb-2">为什么默认 ask_user？</div>
          <p className="text-sm text-gray-300">
            激活 skill 的本质是“把本地文件中的指令注入到对话上下文”，属于高影响操作；默认策略要求用户确认以明确知情与授权。
          </p>
        </div>
      </Layer>

      <Layer title="System Prompt 注入" icon="🧱">
        <p className="text-gray-300 mb-4">
          当存在可用 skills 时，System Prompt 会追加一个 <code>Available Agent Skills</code> 段落，列出技能元信息，并要求模型：
          一旦拿到 <code>&lt;ACTIVATED_SKILL&gt;</code>，必须把 <code>&lt;INSTRUCTIONS&gt;</code> 当作本任务的专家流程规范。
        </p>
        <CodeBlock
          title="prompts.ts 片段（skillsPrompt）"
          code={`// packages/core/src/core/prompts.ts
const skills = config.getSkillManager().getSkills();
if (skills.length > 0) {
  skillsPrompt = \`
# Available Agent Skills
You have access to the following specialized skills...
<available_skills>...</available_skills>\`;
}
`}
        />
      </Layer>

      <Layer title="用户侧管理（/skills + settings）" icon="🧰">
        <p className="text-gray-300 mb-4">
          Skills 目前属于实验特性：通过 <code>experimental.skills</code> 开启；通过 <code>skills.disabled</code> 禁用特定技能。
          CLI 也提供 <code>/skills</code> 命令用于列出与启用/禁用（修改配置后需要重启生效）。
        </p>
        <CodeBlock
          title="配置项（docs/get-started/configuration.md）"
          code={`experimental.skills: boolean  # Enable Agent Skills (experimental)
skills.disabled: string[]      # List of disabled skills (restart required)`}
        />
        <CodeBlock
          title="/skills 命令（skillsCommand.ts）"
          code={`/skills list [nodesc]
/skills disable <name>
/skills enable <name>`}
        />
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}

