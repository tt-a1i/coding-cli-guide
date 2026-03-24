import { useEffect, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
  title?: string;
}

// 懒加载 mermaid 模块
let mermaidModule: typeof import('mermaid') | null = null;
let mermaidPromise: Promise<typeof import('mermaid')> | null = null;

function getThemeValue(name: string, fallback: string) {
  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue(name).trim();
  return value || fallback;
}

function getMermaidThemeConfig() {
  const isDark = document.documentElement.classList.contains('dark');
  const base = getThemeValue('--color-bg', isDark ? '#111110' : '#fafaf9');
  const surface = getThemeValue('--color-bg-surface', isDark ? '#1c1c1a' : '#f4f4f2');
  const elevated = getThemeValue('--color-bg-elevated', isDark ? '#282826' : '#eceae6');
  const text = getThemeValue('--color-text', isDark ? '#f5f5f4' : '#1c1917');
  const textSecondary = getThemeValue('--color-text-secondary', isDark ? '#a8a29e' : '#57534e');
  const muted = getThemeValue('--color-text-muted', isDark ? '#78716c' : '#a8a29e');
  const border = getThemeValue('--color-border', isDark ? '#2e2e2c' : '#e7e5e4');
  const borderHover = getThemeValue('--color-border-hover', isDark ? '#3f3f3c' : '#d6d3d1');

  return {
    startOnLoad: false,
    theme: 'base' as const,
    themeVariables: {
      fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
      primaryColor: surface,
      primaryTextColor: text,
      primaryBorderColor: borderHover,
      lineColor: muted,
      secondaryColor: elevated,
      tertiaryColor: base,
      background: base,
      mainBkg: surface,
      secondBkg: elevated,
      tertiaryBkg: base,
      nodeBorder: borderHover,
      clusterBkg: base,
      clusterBorder: border,
      titleColor: text,
      edgeLabelBackground: base,
      textColor: text,
      actorBkg: surface,
      actorBorder: borderHover,
      actorTextColor: text,
      labelBoxBkgColor: base,
      labelBoxBorderColor: border,
      labelTextColor: textSecondary,
      signalColor: textSecondary,
      signalTextColor: text,
      activationBorderColor: borderHover,
      activationBkgColor: elevated,
      sequenceNumberColor: text,
    },
    flowchart: {
      curve: 'basis' as const,
      padding: 20,
    },
    sequence: {
      actorMargin: 50,
      boxMargin: 10,
      boxTextMargin: 5,
    },
  };
}

async function loadMermaid() {
  if (mermaidModule) return mermaidModule;
  if (mermaidPromise) return mermaidPromise;

  mermaidPromise = import('mermaid');
  mermaidModule = await mermaidPromise;

  return mermaidModule;
}

// 全局计数器生成唯一 ID
let idCounter = 0;

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeVersion((version) => version + 1);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const renderDiagram = async () => {
      setLoading(true);
      const uniqueId = `mermaid-${Date.now()}-${++idCounter}`;

      try {
        const mermaid = await loadMermaid();
        mermaid.default.initialize(getMermaidThemeConfig());
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
  }, [chart, themeVersion]);

  return (
    <div className="bg-surface/50 rounded-xl p-4 my-4 overflow-x-auto border border-edge">
      {title && (
        <h4 className="text-heading font-semibold mb-3 text-sm">{title}</h4>
      )}
      {error ? (
        <pre className="text-[var(--color-danger)] text-sm whitespace-pre-wrap">{chart}</pre>
      ) : svgContent ? (
        <div
          className="flex justify-center min-h-[100px]"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : loading ? (
        <div className="flex justify-center items-center min-h-[100px] text-body">
          <div className="flex items-center gap-2 rounded-full border border-edge bg-base px-3 py-1.5">
            <div className="w-4 h-4 border-2 border-edge-hover border-t-base rounded-full animate-spin" />
            <span>加载图表...</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
