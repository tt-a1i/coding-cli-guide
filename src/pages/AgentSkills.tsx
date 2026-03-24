import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
 {
 id: 'system-prompt',
 label: 'Prompt构建',
 description: 'System Prompt 如何注入 skills 列表',
 },
 { id: 'tool-ref', label: '工具参考', description: 'activate_skill 工具细节' },
 {
 id: 'policy-engine',
 label: 'Policy 策略引擎',
 description: 'activate_skill 默认 ask_user',
 },
 { id: 'slash-cmd', label: '斜杠命令', description: '/skills 命令与 UI 展示' },
];

export function AgentSkills() {
 return (
 <div className="space-y-8">
 <section>
 <h2 className="text-2xl font-bold text-heading mb-2">
 Agent Skills（技能系统）
 </h2>
 <p className="text-body">
 Skills 是一套“可发现 + 可激活”的专家指令包：CLI 启动时从固定目录扫描{' '}
 <code>SKILL.md</code>，模型在合适时机通过
 <code className="text-heading"> activate_skill</code>{' '}
 取回指令，并把其作为本次任务的优先执行规范。
 </p>
 </section>

 <Layer title="目标" icon="🎯">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <HighlightBox title="可复用工作流" variant="blue">
 <p className="text-sm text-body">
 将“我团队的标准流程”沉淀为 SKILL.md，减少每次重复解释。
 </p>
 </HighlightBox>
 <HighlightBox title="任务自适配" variant="green">
 <p className="text-sm text-body">
 模型先看到可用 skills
 列表，再按任务匹配主动激活（而不是靠用户记住命令名）。
 </p>
 </HighlightBox>
 <HighlightBox title="可控注入" variant="purple">
 <p className="text-sm text-body">
 激活默认需要用户确认（ask_user），避免把本地内容静默注入到对话上下文。
 </p>
 </HighlightBox>
 </div>
 </Layer>

 <Layer title="技能发现（Discovery）" icon="🗂️">
 <p className="text-body mb-4">
 skills 启用后，<code>SkillManager</code> 会扫描{' '}
 <code>*/SKILL.md</code> 并汇总为“可用技能清单”。 覆盖优先级为：
 <strong>
 Built-in（最低） → Extension → User → Workspace（最高）
 </strong>
 （同名以 YAML frontmatter 的 <code>name</code> 为准）。
 </p>

 <CodeBlock
 title="目录约定（storage.ts）"
 code={`// gemini-cli/packages/core/src/config/storage.ts
static getUserSkillsDir(): string {
 return path.join(Storage.getGlobalGeminiDir(), 'skills'); // ~/.gemini/skills
}

getProjectSkillsDir(): string {
 return path.join(this.getGeminiDir(), 'skills'); // <project>/.gemini/skills
}`}
 />

 <CodeBlock
 title="发现顺序与覆盖（skillManager.ts）"
 code={`// gemini-cli/packages/core/src/skills/skillManager.ts
// Precedence: Built-in (lowest) -> Extensions -> User -> Workspace (highest).
async discoverSkills(storage: Storage, extensions: GeminiCLIExtension[] = []) {
 this.clearSkills();

 // 1) Built-in skills (lowest)
 await this.discoverBuiltinSkills();

 // 2) Extension skills
 for (const extension of extensions) {
 if (extension.isActive && extension.skills) {
 this.addSkillsWithPrecedence(extension.skills);
 }
 }

 // 3) User skills
 const userSkills = await loadSkillsFromDir(Storage.getUserSkillsDir());
 this.addSkillsWithPrecedence(userSkills);

 // 4) Workspace skills (highest, overrides)
 const projectSkills = await loadSkillsFromDir(storage.getProjectSkillsDir());
 this.addSkillsWithPrecedence(projectSkills);
}`}
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
 <p className="text-body mb-4">
 模型激活 skill 时调用{' '}
 <code className="text-heading">activate_skill</code>
 ，工具会返回一个带标签的片段：
 <code className="text-heading"> &lt;ACTIVATED_SKILL&gt;</code>{' '}
 中包含 <code>&lt;INSTRUCTIONS&gt;</code> 与
 <code>&lt;AVAILABLE_RESOURCES&gt;</code>（技能目录的文件结构）。
 </p>

 <CodeBlock
 title="返回格式（activate-skill.ts）"
 code={`// gemini-cli/packages/core/src/tools/activate-skill.ts
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

 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <div className="text-heading font-semibold mb-2">
 为什么默认 ask_user？
 </div>
 <p className="text-sm text-body">
 激活 skill
 的本质是“把本地文件中的指令注入到对话上下文”，属于高影响操作；默认策略要求用户确认以明确知情与授权。
 </p>
 </div>
 </Layer>

 <Layer title="Schema 收敛：把 name 变成 enum" icon="🧷">
 <p className="text-body mb-4">
 技能列表发现完成后，CLI 会<strong>重新注册一次</strong>{' '}
 <code>ActivateSkillTool</code>，让参数 <code>name</code>从{' '}
 <code>string</code> 收敛为 <code>enum(availableSkillNames)</code>
 ，从而减少模型“瞎猜技能名”的概率。
 </p>
 <CodeBlock
 title="config.ts：发现技能后重注册工具"
 code={`// gemini-cli/packages/core/src/config/config.ts (节选)
if (this.skillsSupport) {
 await this.getSkillManager().discoverSkills(this.storage, this.getExtensions());
 this.getSkillManager().setDisabledSkills(this.disabledSkills);

 // Re-register ActivateSkillTool to update its schema with discovered skill enums
 if (this.getSkillManager().getSkills().length > 0) {
 this.getToolRegistry().registerTool(new ActivateSkillTool(this, this.messageBus));
 }
}`}
 />
 </Layer>

 <Layer title="System Prompt 注入" icon="🧱">
 <p className="text-body mb-4">
 当存在可用 skills 时，System Prompt 会追加一个{' '}
 <code>Available Agent Skills</code> 段落，列出技能元信息，并要求模型：
 一旦拿到 <code>&lt;ACTIVATED_SKILL&gt;</code>，必须把{' '}
 <code>&lt;INSTRUCTIONS&gt;</code> 当作本任务的专家流程规范。
 </p>
 <CodeBlock
 title="prompts.ts 片段（skillsPrompt）"
 code={`// gemini-cli/packages/core/src/core/prompts.ts
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
 <p className="text-body mb-4">
 Skills 目前属于实验特性：通过 <code>experimental.skills</code>{' '}
 开启；通过 <code>skills.disabled</code> 禁用特定技能。 CLI 也提供{' '}
 <code>/skills</code> 命令用于列出与启用/禁用/刷新（禁用/启用后建议{' '}
 <code>/skills reload</code> 让本会话生效）。
 </p>
 <CodeBlock
 title="配置项（gemini-cli/docs/cli/settings.md）"
 code={`experimental.skills: boolean # Enable Agent Skills (experimental)
skills.disabled: string[] # List of disabled skills (restart required)`}
 />
 <CodeBlock
 title="/skills 命令（skillsCommand.ts）"
 code={`/skills list [nodesc]
/skills list [nodesc] [all]
/skills disable <name>
/skills enable <name>
/skills reload`}
 />
 <p className="text-xs text-body mt-2">
 说明：<code>/skills list --all</code> 会展示内建 skills（例如{' '}
 <code>skill-creator</code>），否则默认隐藏。
 </p>
 </Layer>

 <Layer title="终端命令（gemini skills）" icon="🧪">
 <p className="text-body mb-4">
 除了 Slash Commands，CLI 还提供 <code>gemini skills</code>{' '}
 子命令用于安装/卸载技能包（默认 user scope）。
 </p>
 <CodeBlock
 title="gemini skills 管理"
 code={`# 列出所有技能
gemini skills list

# 安装（Git / 本地 / .skill）
gemini skills install https://github.com/my-org/my-skills.git
gemini skills install /path/to/skill --scope workspace

# 卸载/启用/禁用
gemini skills uninstall my-skill
gemini skills enable my-skill
gemini skills disable my-skill --scope workspace`}
 />
 </Layer>

 <Layer title="扩展技能与安全披露" icon="🛡️">
 <p className="text-body mb-4">
 Extension 可以携带 <code>skills/</code> 目录（例如{' '}
 <code>skills/my-skill/SKILL.md</code>）。在安装/更新扩展时，CLI 会在
 consent 文本中明确提示：
 <strong>Agent skills 会把指令注入 system prompt</strong>，并展示每个
 skill 的名称、描述与文件位置，要求用户确认后才继续安装。
 </p>
 <CodeBlock
 title="extensions/consent.ts：skills 风险提示（节选）"
 code={`// gemini-cli/packages/cli/src/config/extensions/consent.ts
export const SKILLS_WARNING_MESSAGE = chalk.yellow(
 "Agent skills inject specialized instructions and domain-specific knowledge into the agent's system prompt..."
);

if (skills.length > 0) {
 output.push("Agent Skills:");
 output.push(SKILLS_WARNING_MESSAGE);
 output.push("This extension will install the following agent skills:");
 for (const skill of skills) {
 output.push(\` * \${skill.name}: \${skill.description}\`);
 output.push(\` (Location: \${skill.location})\`);
 }
}`}
 />
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
