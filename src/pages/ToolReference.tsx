import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';

/**
 * Authoritative Tool Reference Page
 *
 * Source of truth: packages/core/src/tools/tool-names.ts
 * All tool names and parameters are derived from actual source code.
 */
export function ToolReference() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-cyan-400">工具参考 (对齐源码)</h2>
        <p className="text-gray-400 mt-2">
          工具名称和 Kind 分类以代码为准 - 来源: <code>packages/core/src/tools/*.ts</code>
        </p>
      </div>

      {/* 重要警告 */}
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
        <h3 className="text-yellow-400 font-bold mb-2">对齐说明</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>工具名称来自 <code>tool-names.ts</code>，Kind 分类来自各工具实现文件</li>
          <li>参数 Schema 来自各工具的 <code>*ToolParams</code> 接口定义</li>
          <li>工具名称区分大小写，配置中必须完全匹配</li>
        </ul>
      </div>

      {/* 工具名称常量表 */}
      <Layer title="工具名称常量表 (ToolNames)" icon="🏷️">
        <p className="text-gray-300 mb-4">
          来源: <code className="text-cyan-400">packages/core/src/tools/tool-names.ts</code>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="py-2 px-3">常量</th>
                <th className="py-2 px-3">工具名称 (API)</th>
                <th className="py-2 px-3">类名</th>
                <th className="py-2 px-3">类型</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 font-mono">
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">EDIT</td>
                <td className="py-2 px-3 text-cyan-400">'edit'</td>
                <td className="py-2 px-3">EditTool</td>
                <td className="py-2 px-3 text-yellow-400">Edit</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">WRITE_FILE</td>
                <td className="py-2 px-3 text-cyan-400">'write_file'</td>
                <td className="py-2 px-3">WriteFileTool</td>
                <td className="py-2 px-3 text-yellow-400">Edit</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">READ_FILE</td>
                <td className="py-2 px-3 text-cyan-400">'read_file'</td>
                <td className="py-2 px-3">ReadFileTool</td>
                <td className="py-2 px-3 text-blue-400">Read</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">READ_MANY_FILES</td>
                <td className="py-2 px-3 text-cyan-400">'read_many_files'</td>
                <td className="py-2 px-3">ReadManyFilesTool</td>
                <td className="py-2 px-3 text-blue-400">Read</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">GREP</td>
                <td className="py-2 px-3 text-cyan-400">'grep_search'</td>
                <td className="py-2 px-3">GrepTool</td>
                <td className="py-2 px-3 text-green-400">Search</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">GLOB</td>
                <td className="py-2 px-3 text-cyan-400">'glob'</td>
                <td className="py-2 px-3">GlobTool</td>
                <td className="py-2 px-3 text-green-400">Search</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">SHELL</td>
                <td className="py-2 px-3 text-cyan-400">'run_shell_command'</td>
                <td className="py-2 px-3">ShellTool</td>
                <td className="py-2 px-3 text-orange-400">Execute</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">TODO_WRITE</td>
                <td className="py-2 px-3 text-cyan-400">'todo_write'</td>
                <td className="py-2 px-3">TodoWriteTool</td>
                <td className="py-2 px-3 text-blue-400">Think</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">MEMORY</td>
                <td className="py-2 px-3 text-cyan-400">'save_memory'</td>
                <td className="py-2 px-3">MemoryTool</td>
                <td className="py-2 px-3 text-blue-400">Think</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">TASK</td>
                <td className="py-2 px-3 text-cyan-400">'task'</td>
                <td className="py-2 px-3">TaskTool</td>
                <td className="py-2 px-3 text-gray-400">Other</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-purple-400">EXIT_PLAN_MODE</td>
                <td className="py-2 px-3 text-cyan-400">'exit_plan_mode'</td>
                <td className="py-2 px-3">ExitPlanModeTool</td>
                <td className="py-2 px-3 text-blue-400">Think</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock
          title="tool-names.ts - 源码"
          code={`export const ToolNames = {
  EDIT: 'edit',
  WRITE_FILE: 'write_file',
  READ_FILE: 'read_file',
  READ_MANY_FILES: 'read_many_files',
  GREP: 'grep_search',        // 注意: 不是 'grep'
  GLOB: 'glob',
  SHELL: 'run_shell_command', // 注意: 不是 'bash' 或 'shell'
  TODO_WRITE: 'todo_write',
  MEMORY: 'save_memory',      // 注意: 不是 'memory'
  TASK: 'task',
  EXIT_PLAN_MODE: 'exit_plan_mode',
} as const;`}
        />
      </Layer>

      {/* 常见错误对照 */}
      <Layer title="常见错误对照" icon="⚠️">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="py-2 px-3">错误写法</th>
                <th className="py-2 px-3">正确写法</th>
                <th className="py-2 px-3">说明</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 font-mono">
              <tr className="border-b border-gray-800 bg-red-900/10">
                <td className="py-2 px-3 text-red-400 line-through">'bash'</td>
                <td className="py-2 px-3 text-green-400">'run_shell_command'</td>
                <td className="py-2 px-3 text-gray-400 font-sans">Shell 工具的正确名称</td>
              </tr>
              <tr className="border-b border-gray-800 bg-red-900/10">
                <td className="py-2 px-3 text-red-400 line-through">'shell'</td>
                <td className="py-2 px-3 text-green-400">'run_shell_command'</td>
                <td className="py-2 px-3 text-gray-400 font-sans">Shell 工具的正确名称</td>
              </tr>
              <tr className="border-b border-gray-800 bg-red-900/10">
                <td className="py-2 px-3 text-red-400 line-through">'grep'</td>
                <td className="py-2 px-3 text-green-400">'grep_search'</td>
                <td className="py-2 px-3 text-gray-400 font-sans">Grep 工具的正确名称</td>
              </tr>
              <tr className="border-b border-gray-800 bg-red-900/10">
                <td className="py-2 px-3 text-red-400 line-through">'memory'</td>
                <td className="py-2 px-3 text-green-400">'save_memory'</td>
                <td className="py-2 px-3 text-gray-400 font-sans">Memory 工具的正确名称</td>
              </tr>
              <tr className="border-b border-gray-800 bg-red-900/10">
                <td className="py-2 px-3 text-red-400 line-through">'read'</td>
                <td className="py-2 px-3 text-green-400">'read_file'</td>
                <td className="py-2 px-3 text-gray-400 font-sans">Read 工具的正确名称</td>
              </tr>
              <tr className="bg-red-900/10">
                <td className="py-2 px-3 text-red-400 line-through">'write'</td>
                <td className="py-2 px-3 text-green-400">'write_file'</td>
                <td className="py-2 px-3 text-gray-400 font-sans">Write 工具的正确名称</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* 各工具参数详解 */}
      <Layer title="工具参数 Schema (详解)" icon="📋">

        {/* edit */}
        <HighlightBox title="edit - 文件编辑" icon="✏️" variant="yellow">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/edit.ts</code>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">file_path</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">绝对路径</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">old_string</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">要替换的文本</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">new_string</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">替换后的文本</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">expected_replacements</td>
                  <td className="py-1 px-2">number</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">预期替换次数 (默认1)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>

        {/* write_file */}
        <HighlightBox title="write_file - 文件写入" icon="📝" variant="yellow">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/write-file.ts</code>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">file_path</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">绝对路径</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">content</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">文件内容</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>

        {/* read_file */}
        <HighlightBox title="read_file - 文件读取" icon="📖" variant="blue">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/read-file.ts</code> | Kind: <span className="text-blue-400">Read</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">absolute_path</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">绝对路径</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">offset</td>
                  <td className="py-1 px-2">number</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">起始行号</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">limit</td>
                  <td className="py-1 px-2">number</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">读取行数</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>

        {/* grep_search */}
        <HighlightBox title="grep_search - 内容搜索" icon="🔍" variant="green">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/grep.ts</code>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">pattern</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">正则表达式</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">path</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">搜索目录</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">include</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">文件过滤 (如 "*.js")</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">maxResults</td>
                  <td className="py-1 px-2">number</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">最大结果数 (默认20, 最大100)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>

        {/* glob */}
        <HighlightBox title="glob - 文件查找" icon="📁" variant="green">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/glob.ts</code>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">pattern</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">Glob 模式 (如 "**/*.ts")</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">path</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">搜索目录</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">case_sensitive</td>
                  <td className="py-1 px-2">boolean</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">大小写敏感 (默认 false)</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">respect_git_ignore</td>
                  <td className="py-1 px-2">boolean</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">尊重 .gitignore (默认 true)</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">respect_innies_ignore</td>
                  <td className="py-1 px-2">boolean</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">尊重 .inniesignore (默认 true)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>

        {/* run_shell_command */}
        <HighlightBox title="run_shell_command - Shell 执行" icon="💻" variant="orange">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/shell.ts</code>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">command</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">要执行的命令</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">is_background</td>
                  <td className="py-1 px-2">boolean</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">是否后台执行</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">description</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">命令简述</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">directory</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">工作目录 (绝对路径)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>

        {/* save_memory */}
        <HighlightBox title="save_memory - 记忆保存" icon="🧠" variant="blue">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/memoryTool.ts</code>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">fact</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">要记住的事实</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">scope</td>
                  <td className="py-1 px-2">'global' | 'project'</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">保存范围</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>

        {/* todo_write */}
        <HighlightBox title="todo_write - 任务管理" icon="✅" variant="blue">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/todoWrite.ts</code>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr>
                  <td className="py-1 px-2 text-cyan-400">todos</td>
                  <td className="py-1 px-2">TodoItem[]</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">任务列表</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            <p>TodoItem 结构:</p>
            <pre className="mt-1 text-cyan-400">{`{ id: string, content: string, status: 'pending' | 'in_progress' | 'completed' }`}</pre>
          </div>
        </HighlightBox>

        {/* task */}
        <HighlightBox title="task - 子代理调度" icon="🤖" variant="purple">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/task.ts</code>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">description</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">任务简述 (3-5 词)</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">prompt</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">任务指令</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">subagent_type</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">子代理类型</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>
      </Layer>

      {/* 工具结果格式 */}
      <Layer title="工具结果格式说明" icon="📤">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="内部格式 (Innies)" icon="🔧" variant="blue">
            <p className="text-sm text-gray-300 mb-2">
              工具结果在内部使用 Gemini 风格:
            </p>
            <CodeBlock
              code={`{
  role: 'user',
  parts: [{
    functionResponse: {
      id: 'call_xxx',
      name: 'read_file',
      response: {
        output: '...',
        error: null
      }
    }
  }]
}`}
            />
          </HighlightBox>

          <HighlightBox title="OpenAI 兼容格式" icon="🔌" variant="green">
            <p className="text-sm text-gray-300 mb-2">
              发送到 OpenAI 兼容 API 时转换为:
            </p>
            <CodeBlock
              code={`{
  role: 'tool',
  tool_call_id: 'call_xxx',
  content: '...'
}`}
            />
          </HighlightBox>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mt-4">
          <p className="text-sm text-yellow-300">
            <strong>注意:</strong> 本项目内部统一使用 Gemini 风格 (<code>role: 'user'</code> + <code>functionResponse</code>)，
            仅在发送到 OpenAI 兼容 API 时才转换为 <code>role: 'tool'</code> 格式。
          </p>
        </div>
      </Layer>

      {/* 源码文件参考 */}
      <Layer title="源码文件参考" icon="📁">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">工具定义</h4>
            <div className="text-xs font-mono space-y-1 text-gray-400">
              <div>packages/core/src/tools/tool-names.ts</div>
              <div>packages/core/src/tools/tools.ts</div>
              <div>packages/core/src/tools/edit.ts</div>
              <div>packages/core/src/tools/write-file.ts</div>
              <div>packages/core/src/tools/read-file.ts</div>
              <div>packages/core/src/tools/grep.ts</div>
              <div>packages/core/src/tools/glob.ts</div>
              <div>packages/core/src/tools/shell.ts</div>
              <div>packages/core/src/tools/memoryTool.ts</div>
              <div>packages/core/src/tools/todoWrite.ts</div>
              <div>packages/core/src/tools/task.ts</div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">工具注册</h4>
            <div className="text-xs font-mono space-y-1 text-gray-400">
              <div>packages/core/src/config/config.ts:1092</div>
              <div className="text-gray-500 mt-2">工具实例化和注册位置</div>
            </div>
          </div>
        </div>
      </Layer>
    </div>
  );
}
