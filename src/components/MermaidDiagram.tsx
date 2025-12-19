import { useEffect, useRef, useId } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  title?: string;
}

// 初始化 mermaid 配置（只执行一次）
let initialized = false;
function initMermaid() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
      primaryColor: '#22d3ee',
      primaryTextColor: '#fff',
      primaryBorderColor: '#0891b2',
      lineColor: '#6b7280',
      secondaryColor: '#4f46e5',
      tertiaryColor: '#1f2937',
      background: '#1f2937',
      mainBkg: '#374151',
      nodeBorder: '#0891b2',
      clusterBkg: '#1f2937',
      clusterBorder: '#4f46e5',
      titleColor: '#22d3ee',
      edgeLabelBackground: '#374151',
    },
    flowchart: {
      curve: 'basis',
      padding: 20,
    },
    sequence: {
      actorMargin: 50,
      boxMargin: 10,
      boxTextMargin: 5,
    },
  });
  initialized = true;
}

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId().replace(/:/g, '-'); // React 18+ useId, 移除冒号避免 selector 问题

  useEffect(() => {
    initMermaid();

    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        const { svg } = await mermaid.render(`mermaid-${uniqueId}`, chart);
        containerRef.current.innerHTML = svg;
      } catch (error) {
        console.error('Mermaid render error:', error);
        containerRef.current.innerHTML = `<pre class="text-red-400 text-sm">${chart}</pre>`;
      }
    };

    renderDiagram();
  }, [chart, uniqueId]);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 my-4 overflow-x-auto border border-gray-700/50">
      {title && (
        <h4 className="text-cyan-400 font-bold mb-3 text-sm">{title}</h4>
      )}
      <div ref={containerRef} className="flex justify-center min-h-[100px]" />
    </div>
  );
}
