interface ComparisonTableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}

export function ComparisonTable({ headers, rows }: ComparisonTableProps) {
  return (
    <table className="w-full border-collapse my-4">
      <thead>
        <tr>
          {headers.map((header, i) => (
            <th
              key={i}
              className="p-3 text-left border border-white/10 bg-cyan-400/20 text-cyan-400"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? '' : 'bg-white/[0.02]'}>
            {row.map((cell, j) => (
              <td key={j} className="p-3 text-left border border-white/10">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
