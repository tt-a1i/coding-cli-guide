import { useState, useCallback } from 'react';

interface Checkpoint {
 hash: string;
 message: string;
 timestamp: number;
 files: string[];
}

interface FileState {
 path: string;
 content: string;
 status: 'unchanged' | 'modified' | 'added' | 'deleted';
}

const INITIAL_FILES: FileState[] = [
 { path: 'src/app.ts', content: 'console.log("Hello");', status: 'unchanged' },
 { path: 'src/utils.ts', content: 'export function add(a, b) { return a + b; }', status: 'unchanged' },
 { path: 'package.json', content: '{ "name": "demo" }', status: 'unchanged' },
];

export default function ShadowGitCheckpointAnimation() {
 const [files, setFiles] = useState<FileState[]>(INITIAL_FILES);
 const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([
 { hash: 'abc1234', message: 'Initial commit', timestamp: Date.now() - 100000, files: ['src/app.ts', 'src/utils.ts', 'package.json'] },
 ]);
 const [currentHash, setCurrentHash] = useState('abc1234');
 const [isOperating, setIsOperating] = useState(false);
 const [operationLog, setOperationLog] = useState<string[]>([]);
 const [highlightedFile, setHighlightedFile] = useState<string | null>(null);
 const [restoreTarget, setRestoreTarget] = useState<string | null>(null);

 const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

 const addLog = useCallback((message: string) => {
 setOperationLog(prev => [message, ...prev].slice(0, 15));
 }, []);

 const generateHash = () => {
 return Math.random().toString(16).substring(2, 9);
 };

 const modifyFile = useCallback((path: string) => {
 setFiles(prev => prev.map(f =>
 f.path === path
 ? { ...f, content: f.content + '\n// Modified at ' + new Date().toLocaleTimeString(), status: 'modified' as const }
 : f
 ));
 setHighlightedFile(path);
 setTimeout(() => setHighlightedFile(null), 1000);
 addLog(`📝 Modified: ${path}`);
 }, [addLog]);

 const addFile = useCallback(() => {
 const newPath = `src/new-${Date.now() % 1000}.ts`;
 setFiles(prev => [...prev, {
 path: newPath,
 content: '// New file',
 status: 'added',
 }]);
 setHighlightedFile(newPath);
 setTimeout(() => setHighlightedFile(null), 1000);
 addLog(`➕ Added: ${newPath}`);
 }, [addLog]);

 const deleteFile = useCallback((path: string) => {
 setFiles(prev => prev.map(f =>
 f.path === path ? { ...f, status: 'deleted' as const } : f
 ));
 addLog(`🗑️ Deleted: ${path}`);
 }, [addLog]);

 const createCheckpoint = useCallback(async (message: string) => {
 setIsOperating(true);
 addLog('🔄 git add .');
 await sleep(500);

 addLog(`💾 git commit -m "${message}"`);
 await sleep(800);

 const newHash = generateHash();
 const changedFiles = files.filter(f => f.status !== 'unchanged').map(f => f.path);

 setCheckpoints(prev => [...prev, {
 hash: newHash,
 message,
 timestamp: Date.now(),
 files: changedFiles,
 }]);

 // Reset file states
 setFiles(prev => prev.filter(f => f.status !== 'deleted').map(f => ({
 ...f,
 status: 'unchanged' as const,
 })));

 setCurrentHash(newHash);
 addLog(`✅ Checkpoint created: ${newHash.substring(0, 7)}`);
 setIsOperating(false);
 }, [files, addLog]);

 const restoreFromCheckpoint = useCallback(async (hash: string) => {
 setIsOperating(true);
 setRestoreTarget(hash);
 addLog(`🔄 git restore --source ${hash.substring(0, 7)} .`);
 await sleep(800);

 addLog('🧹 git clean -fd');
 await sleep(500);

 // Find the checkpoint and restore to that state
 const checkpoint = checkpoints.find(c => c.hash === hash);
 if (checkpoint) {
 // Reset to initial files (simplified simulation)
 setFiles(INITIAL_FILES.map(f => ({ ...f, status: 'unchanged' as const })));
 setCurrentHash(hash);
 addLog(`✅ Restored to: ${hash.substring(0, 7)}`);
 }

 setRestoreTarget(null);
 setIsOperating(false);
 }, [checkpoints, addLog]);

 const getStatusColor = (status: FileState['status']) => {
 switch (status) {
 case 'modified': return 'text-[var(--color-warning)] bg-[var(--color-warning-soft)] border-[var(--color-warning)]';
 case 'added': return 'text-[var(--color-success)] bg-[var(--color-success-soft)] border-[var(--color-success)]';
 case 'deleted': return 'text-[var(--color-danger)] bg-[var(--color-danger-soft)] border-[var(--color-danger)] opacity-50';
 default: return 'text-body bg-surface border-edge';
 }
 };

 const getStatusIcon = (status: FileState['status']) => {
 switch (status) {
 case 'modified': return 'M';
 case 'added': return 'A';
 case 'deleted': return 'D';
 default: return '';
 }
 };

 return (
 <div className="min-h-screen bg-surface p-6">
 <div className="max-w-6xl mx-auto">
 <h1 className="text-3xl font-bold text-heading bg-surface mb-2">
 GitService 影子仓库检查点
 </h1>
 <p className="text-body mb-6">
 演示 Checkpointing 系统如何使用隐藏 Git 仓库进行文件快照和恢复
 </p>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Project Files */}
 <div className="bg-base/40 border border-edge rounded-lg p-4">
 <h3 className="text-heading font-bold mb-3 flex items-center gap-2">
 <span className="text-xl">📁</span> 项目文件
 </h3>
 <div className="space-y-2">
 {files.map(file => (
 <div
 key={file.path}
 className={`p-3 rounded-lg border transition-all duration-300 ${getStatusColor(file.status)} ${
 highlightedFile === file.path ? 'ring-2 ring-white/50 scale-105' : ''
 }`}
 >
 <div className="flex justify-between items-start">
 <div className="font-mono text-sm flex items-center gap-2">
 {getStatusIcon(file.status) && (
 <span className="text-xs font-bold">[{getStatusIcon(file.status)}]</span>
 )}
 {file.path}
 </div>
 <div className="flex gap-1">
 {file.status !== 'deleted' && (
 <>
 <button
 onClick={() => modifyFile(file.path)}
 disabled={isOperating}
 className="text-xs px-2 py-1 bg-[var(--color-warning-soft)] text-[var(--color-warning)] rounded hover:bg-yellow-500/30 disabled:opacity-50"
 >
 修改
 </button>
 <button
 onClick={() => deleteFile(file.path)}
 disabled={isOperating}
 className="text-xs px-2 py-1 bg-[var(--color-danger-soft)] text-[var(--color-danger)] rounded hover:bg-red-500/30 disabled:opacity-50"
 >
 删除
 </button>
 </>
 )}
 </div>
 </div>
 <div className="text-xs text-dim mt-1 font-mono truncate">{file.content}</div>
 </div>
 ))}
 </div>
 <button
 onClick={addFile}
 disabled={isOperating}
 className="mt-3 w-full px-4 py-2 bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)] rounded-lg hover:bg-green-500/30 disabled:opacity-50"
 >
 ➕ 添加新文件
 </button>
 </div>

 {/* Shadow Git Repository */}
 <div className="bg-base/40 border border-edge rounded-lg p-4">
 <h3 className="text-heading font-bold mb-3 flex items-center gap-2">
 <span className="text-xl">👻</span> 影子 Git 仓库
 </h3>
 <div className="text-xs text-dim font-mono mb-3">
 .gemini/tmp/[project_hash]/history/.git/
 </div>

 <div className="space-y-3">
 <div className="p-3 bg-elevated border border-edge rounded-lg">
 <div className="text-xs text-body">当前 HEAD</div>
 <div className="font-mono text-heading">{currentHash.substring(0, 7)}</div>
 </div>

 <div className="p-3 bg-surface border border-edge rounded-lg">
 <div className="text-xs text-body mb-2">提交历史</div>
 <div className="space-y-2 max-h-48 overflow-y-auto">
 {checkpoints.slice().reverse().map((cp, index) => (
 <div
 key={cp.hash}
 className={`p-2 rounded border transition-all ${
 cp.hash === currentHash
 ? ' border-edge bg-elevated'
 : restoreTarget === cp.hash
 ? 'border-yellow-400 bg-[var(--color-warning-soft)] animate-pulse'
 : ' border-edge bg-surface'
 }`}
 >
 <div className="flex justify-between items-start">
 <div>
 <span className="font-mono text-xs text-heading">{cp.hash.substring(0, 7)}</span>
 <span className="text-xs text-dim ml-2">{cp.message}</span>
 </div>
 {cp.hash !== currentHash && index < checkpoints.length - 1 && (
 <button
 onClick={() => restoreFromCheckpoint(cp.hash)}
 disabled={isOperating}
 className="text-xs px-2 py-1 bg-orange-500/20 text-heading rounded hover:bg-orange-500/30 disabled:opacity-50"
 >
 恢复
 </button>
 )}
 </div>
 {cp.files.length > 0 && (
 <div className="text-xs text-dim mt-1">
 {cp.files.join(', ')}
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 </div>

 <button
 onClick={() => createCheckpoint(`Checkpoint ${checkpoints.length}`)}
 disabled={isOperating || !files.some(f => f.status !== 'unchanged')}
 className="mt-3 w-full px-4 py-2 bg-surface text-heading rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
 >
 {isOperating ? '🔄 处理中...' : '💾 创建检查点'}
 </button>
 </div>

 {/* Operation Log */}
 <div className="bg-base/40 border border-edge-hover/30 rounded-lg p-4">
 <h3 className="text-body font-bold mb-3 flex items-center gap-2">
 <span className="text-xl">📋</span> Git 操作日志
 </h3>
 <div className="space-y-1 max-h-80 overflow-y-auto font-mono text-xs">
 {operationLog.length === 0 ? (
 <div className="text-dim text-center py-4">暂无操作</div>
 ) : (
 operationLog.map((log, index) => (
 <div
 key={index}
 className={`p-2 rounded ${
 log.includes('✅') ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' :
 log.includes('🔄') ? ' bg-elevated/10 text-heading' :
 log.includes('📝') ? 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]' :
 log.includes('➕') ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' :
 log.includes('🗑️') ? 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]' :
 ' bg-surface text-body'
 }`}
 >
 {log}
 </div>
 ))
 )}
 </div>
 </div>
 </div>

 {/* Architecture Diagram */}
 <div className="mt-6 bg-base/40 border border-emerald-500/30 rounded-lg p-4">
 <h3 className="text-emerald-400 font-bold mb-3">🏗️ 影子仓库架构</h3>
 <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
 <div className="p-3 bg-elevated/20 border border-edge rounded-lg text-center">
 <div className="text-heading font-bold">项目目录</div>
 <div className="text-xs text-body">/path/to/project/</div>
 </div>
 <div className="text-dim">→</div>
 <div className="p-3 bg-elevated border border-edge rounded-lg text-center">
 <div className="text-heading font-bold">影子 Git</div>
 <div className="text-xs text-body">GIT_WORK_TREE=project</div>
 <div className="text-xs text-body">GIT_DIR=.gemini/.git</div>
 </div>
 <div className="text-dim">→</div>
 <div className="p-3 bg-[var(--color-success-soft)] border border-[var(--color-success)] rounded-lg text-center">
 <div className="text-[var(--color-success)] font-bold">检查点</div>
 <div className="text-xs text-body">git add . && git commit</div>
 </div>
 <div className="text-dim">→</div>
 <div className="p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg text-center">
 <div className="text-heading font-bold">恢复</div>
 <div className="text-xs text-body">git restore --source</div>
 <div className="text-xs text-body">git clean -fd</div>
 </div>
 </div>
 </div>

 {/* Code Reference */}
 <div className="mt-6 bg-base/40 border border-edge rounded-lg p-4">
 <h3 className="text-heading font-bold mb-3">📄 源码参考</h3>
 <pre className="text-xs text-body overflow-x-auto">
{`// packages/core/src/services/gitService.ts

private get shadowGitRepository(): SimpleGit {
 const repoDir = this.getHistoryDir();
 return simpleGit(this.projectRoot).env({
 GIT_DIR: path.join(repoDir, '.git'), // 隐藏的 .git 目录
 GIT_WORK_TREE: this.projectRoot, // 工作目录指向项目根目录
 HOME: repoDir, // 隔离 gitconfig
 XDG_CONFIG_HOME: repoDir,
 });
}

async createFileSnapshot(message: string): Promise<string> {
 const repo = this.shadowGitRepository;
 await repo.add('.'); // 暂存所有文件
 const commitResult = await repo.commit(message);
 return commitResult.commit;
}

async restoreProjectFromSnapshot(commitHash: string): Promise<void> {
 const repo = this.shadowGitRepository;
 await repo.raw(['restore', '--source', commitHash, '.']);
 await repo.clean('f', ['-d']); // 清理未跟踪文件
}`}
 </pre>
 </div>
 </div>
 </div>
 );
}
