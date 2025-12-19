interface FlowNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

interface FlowDiagramProps {
  title: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const nodeStyles = {
  start: 'bg-green-500/20 border-green-500 rounded-full',
  process: 'bg-blue-500/20 border-blue-500 rounded-lg',
  decision: 'bg-yellow-500/20 border-yellow-500 rotate-45',
  end: 'bg-red-500/20 border-red-500 rounded-full',
};

const nodeTextColors = {
  start: 'text-green-400',
  process: 'text-blue-400',
  decision: 'text-yellow-400',
  end: 'text-red-400',
};

export function FlowDiagram({ title, nodes, edges }: FlowDiagramProps) {
  // Build adjacency list for layout
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();

  edges.forEach(edge => {
    if (!outgoing.has(edge.from)) outgoing.set(edge.from, []);
    if (!incoming.has(edge.to)) incoming.set(edge.to, []);
    outgoing.get(edge.from)!.push(edge.to);
    incoming.get(edge.to)!.push(edge.from);
  });

  // Simple topological sort for vertical layout
  const levels: string[][] = [];
  const visited = new Set<string>();
  const nodeLevel = new Map<string, number>();

  // Find start nodes (no incoming edges)
  const startNodes = nodes.filter(n => !incoming.has(n.id) || incoming.get(n.id)!.length === 0);

  // BFS to assign levels
  let currentLevel = 0;
  let queue = startNodes.map(n => n.id);

  while (queue.length > 0) {
    const nextQueue: string[] = [];
    levels[currentLevel] = [];

    queue.forEach(nodeId => {
      if (!visited.has(nodeId)) {
        visited.add(nodeId);
        levels[currentLevel].push(nodeId);
        nodeLevel.set(nodeId, currentLevel);

        const children = outgoing.get(nodeId) || [];
        children.forEach(child => {
          if (!visited.has(child)) {
            nextQueue.push(child);
          }
        });
      }
    });

    queue = nextQueue;
    currentLevel++;
  }

  // Add any remaining nodes not reachable from start
  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      if (!levels[currentLevel]) levels[currentLevel] = [];
      levels[currentLevel].push(n.id);
      nodeLevel.set(n.id, currentLevel);
    }
  });

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const edgeMap = new Map(edges.map(e => [`${e.from}->${e.to}`, e]));

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 my-4">
      <h4 className="text-lg font-semibold text-cyan-400 mb-4">{title}</h4>

      <div className="overflow-x-auto">
        <div className="flex flex-col items-center gap-2 min-w-fit">
          {levels.map((level, levelIdx) => (
            <div key={levelIdx}>
              {/* Nodes in this level */}
              <div className="flex justify-center gap-6 flex-wrap">
                {level.map(nodeId => {
                  const node = nodeMap.get(nodeId);
                  if (!node) return null;

                  const isDecision = node.type === 'decision';

                  return (
                    <div key={nodeId} className="flex flex-col items-center">
                      <div
                        className={`
                          border-2 p-3 min-w-[120px] text-center
                          ${nodeStyles[node.type]}
                          ${isDecision ? 'w-[100px] h-[100px] flex items-center justify-center' : ''}
                        `}
                      >
                        <span
                          className={`
                            text-sm font-medium whitespace-pre-line
                            ${nodeTextColors[node.type]}
                            ${isDecision ? '-rotate-45 block' : ''}
                          `}
                        >
                          {node.label}
                        </span>
                      </div>

                      {/* Edges going down from this node */}
                      {levelIdx < levels.length - 1 && (
                        <div className="flex gap-4 mt-1">
                          {(outgoing.get(nodeId) || []).map(targetId => {
                            const edge = edgeMap.get(`${nodeId}->${targetId}`);
                            return (
                              <div key={targetId} className="flex flex-col items-center">
                                <div className="w-0.5 h-4 bg-gray-500" />
                                {edge?.label && (
                                  <span className="text-xs text-gray-400 px-1 bg-gray-800 rounded">
                                    {edge.label}
                                  </span>
                                )}
                                <div className="text-gray-500">▼</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500" />
          <span className="text-xs text-gray-400">开始</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-lg bg-blue-500/20 border border-blue-500" />
          <span className="text-xs text-gray-400">处理</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rotate-45 bg-yellow-500/20 border border-yellow-500" />
          <span className="text-xs text-gray-400">判断</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500" />
          <span className="text-xs text-gray-400">结束</span>
        </div>
      </div>
    </div>
  );
}
