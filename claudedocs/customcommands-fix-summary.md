# CustomCommands.tsx 文档修复总结

## 修复日期
2025-12-20

## 修复内容

### 问题描述
`src/pages/CustomCommands.tsx` 中关于 Shell 命令注入权限检查机制的描述与实际代码实现不一致。

### 错误描述（修复前）
- 全局允许列表来自 `tools.allowed` 配置
- 阻止列表来自 `blockedCommands` 配置
- 缺少会话级允许列表的说明

### 正确实现（修复后）
根据 `packages/core/src/utils/shell-utils.ts:312` 中的 `checkCommandPermissions()` 函数：

1. **全局阻止列表**: `tools.exclude`
   - 包含 `run_shell_command(pattern)` 形式的规则
   - 最高优先级，硬拒绝，无法绕过

2. **全局允许列表**: `tools.core`
   - 包含 `Bash` 通配符或 `run_shell_command(pattern)` 形式的规则
   - `Bash` 通配符允许所有 Shell 命令
   - 具体模式如 `run_shell_command(git *)` 允许特定命令

3. **会话允许列表**: `sessionShellAllowlist`
   - 运行时动态维护
   - 用户通过确认对话框批准的命令会添加到此列表
   - 会话期间无需重复确认

## 修改的文件位置

### 1. Shell 注入安全流程图（第82-133行）
- 更新流程图，添加三层权限检查：
  - `tools.exclude` 检查
  - `tools.core` 通配符检查
  - `tools.core` 具体规则检查
  - `sessionShellAllowlist` 检查
  - 用户确认后添加到会话允许列表

### 2. 失败与恢复章节（第434行）
- 将 "Shell 命令匹配 blockedCommands 列表" 改为 "Shell 命令匹配 `tools.exclude` 列表"

### 3. 相关配置项章节（第467-523行）
- 添加完整的权限检查机制说明
- 更新配置示例：
  - `tools.allowed` → `tools.core`
  - `blockedCommands` → `tools.exclude`
  - 添加 `sessionShellAllowlist` 说明

### 4. Shell 注入执行流程（第569行）
- 将 "安全检查：对比 allowlist/blocklist" 改为更详细的描述
- 明确列出三层安全机制

## 验证方法

```bash
# 搜索所有相关配置项引用
grep -n "tools\.(exclude|core|allowed)|blockedCommands|sessionShellAllowlist" \
  src/pages/CustomCommands.tsx

# 确认没有旧的配置项引用
grep -n "tools\.allowed\|blockedCommands" src/pages/CustomCommands.tsx
# 预期：仅在代码注释或历史说明中出现
```

## 相关代码引用

- **权限检查实现**: `packages/core/src/utils/shell-utils.ts:312`
  - `checkCommandPermissions()` 函数
  - 实现了三层安全检查逻辑

## 影响范围

- 仅文档更新，不影响代码实现
- 确保文档与代码实现一致
- 提高开发者对权限检查机制的理解准确性
