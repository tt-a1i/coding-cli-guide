import { useEffect, useState } from 'react';
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

// 全局计数器生成唯一 ID
let idCounter = 0;

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initMermaid();
    let cancelled = false;

    const renderDiagram = async () => {
      // 每次渲染使用新的唯一 ID，避免 Strict Mode 冲突
      const uniqueId = `mermaid-${Date.now()}-${++idCounter}`;

      try {
        const { svg } = await mermaid.render(uniqueId, chart);
        if (!cancelled) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        if (!cancelled) {
          setError(String(err));
          setSvgContent('');
        }
      }
    };

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 my-4 overflow-x-auto border border-gray-700/50">
      {title && (
        <h4 className="text-cyan-400 font-bold mb-3 text-sm">{title}</h4>
      )}
      {error ? (
        <pre className="text-red-400 text-sm whitespace-pre-wrap">{chart}</pre>
      ) : svgContent ? (
        <div
          className="flex justify-center min-h-[100px]"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        <div className="flex justify-center items-center min-h-[100px] text-gray-500">
          加载中...
        </div>
      )}
    </div>
  );
}
