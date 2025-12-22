import { useEffect, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
  title?: string;
}

// 懒加载 mermaid 模块
let mermaidModule: typeof import('mermaid') | null = null;
let mermaidPromise: Promise<typeof import('mermaid')> | null = null;
let initialized = false;

async function loadMermaid() {
  if (mermaidModule) return mermaidModule;
  if (mermaidPromise) return mermaidPromise;

  mermaidPromise = import('mermaid');
  mermaidModule = await mermaidPromise;

  if (!initialized) {
    mermaidModule.default.initialize({
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

  return mermaidModule;
}

// 全局计数器生成唯一 ID
let idCounter = 0;

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const renderDiagram = async () => {
      setLoading(true);
      const uniqueId = `mermaid-${Date.now()}-${++idCounter}`;

      try {
        const mermaid = await loadMermaid();
        const { svg } = await mermaid.default.render(uniqueId, chart);
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
      } finally {
        if (!cancelled) {
          setLoading(false);
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
      ) : loading ? (
        <div className="flex justify-center items-center min-h-[100px] text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>加载图表...</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
