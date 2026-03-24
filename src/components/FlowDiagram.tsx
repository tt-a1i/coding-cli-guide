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
  start: 'rounded-full',
  process: 'rounded-lg',
  decision: 'rotate-45',
  end: 'rounded-full',
};

const nodeColors = {
  start: {
    backgroundColor: 'var(--color-bg-elevated)',
    borderColor: 'var(--color-border-hover)',
    color: 'var(--color-text)',
  },
  process: {
    backgroundColor: 'var(--color-bg-surface)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text)',
  },
  decision: {
    backgroundColor: 'var(--color-bg-elevated)',
    borderColor: 'var(--color-border-hover)',
    color: 'var(--color-text-secondary)',
  },
  end: {
    backgroundColor: 'var(--color-bg-elevated)',
    borderColor: 'var(--color-border-hover)',
    color: 'var(--color-text)',
  },
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
    <div className="bg-surface/50 rounded-xl border border-edge p-4 my-4">
      <h4 className="text-sm font-semibold text-heading mb-4">{title}</h4>

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
                        style={{
                          ...nodeColors[node.type],
                        }}
                      >
                        <span
                          className={`
                            text-sm font-medium whitespace-pre-line
                            ${isDecision ? '-rotate-45 block' : ''}
                          `}
                          style={{ color: nodeColors[node.type].color }}
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
                                <div className="w-0.5 h-4 bg-edge-hover" />
                                {edge?.label && (
                                  <span className="text-xs text-body px-1.5 py-0.5 bg-base border border-edge/60 rounded-full">
                                    {edge.label}
                                  </span>
                                )}
                                <div className="text-body">▼</div>
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
      <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-edge">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border" style={nodeColors.start} />
          <span className="text-xs text-dim">开始</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-lg border" style={nodeColors.process} />
          <span className="text-xs text-dim">处理</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rotate-45 border" style={nodeColors.decision} />
          <span className="text-xs text-dim">判断</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border" style={nodeColors.end} />
          <span className="text-xs text-dim">结束</span>
        </div>
      </div>
    </div>
  );
}
