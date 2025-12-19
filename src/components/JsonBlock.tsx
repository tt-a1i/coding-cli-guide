interface JsonBlockProps {
  code: string;
}

export function JsonBlock({ code }: JsonBlockProps) {
  return <pre className="json-block">{code}</pre>;
}
