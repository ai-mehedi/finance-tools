// Download a table of calculator results as a CSV file, client-side (no server
// round-trip). "Export to CSV / spreadsheet" is a real high-intent query
// modifier for finance tools and a genuine reason for users to return.

export type CsvColumn = { key: string; label: string };
export type CsvRow = Record<string, string | number>;

/** RFC-4180-ish escaping: quote any field containing a comma, quote or newline. */
function escapeCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(columns: CsvColumn[], rows: CsvRow[]): string {
  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const body = rows.map((r) => columns.map((c) => escapeCell(r[c.key])).join(",")).join("\n");
  return `${header}\n${body}`;
}

export function downloadCsv(filename: string, columns: CsvColumn[], rows: CsvRow[]): void {
  const csv = toCsv(columns, rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
