interface CodeBlockProps {
  code: string;
  title?: string;
  language?: string; // Optional language hint for styling
}

export function CodeBlock({ code, title }: CodeBlockProps) {
  return (
    <div className="my-4">
      {title && (
        <div className="text-sm text-gray-400 mb-2 font-mono">{title}</div>
      )}
      <pre className="code-block">{code}</pre>
    </div>
  );
}
