interface ComparisonTableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}

export function ComparisonTable({ headers, rows }: ComparisonTableProps) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-edge">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left bg-surface text-heading font-semibold text-xs uppercase tracking-wider border-b border-edge"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-edge/50 last:border-b-0 transition-colors hover:bg-surface/50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-left text-body">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
