// The problems inside a merged ticket, counted the desk's way: every report under the cause it is
// filed under (causes.ts), and the desk's one-day reads (desk-notes.json) as a problem of their own,
// still counted where they are filed. A one-day move is not a day/month swap, so a parser fix
// does not close it.
import { groupByCause, readAs, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';

export type ProblemRow = {
  problem: Problem;
  reports: Report[];
  // For one-day: the cause these reports are counted under.
  filedUnder?: string;
  tenants: number;
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

function row(problem: Problem, rs: Report[], filedUnder?: string): ProblemRow {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    filedUnder,
    tenants: new Set(rs.map((r) => r.tenant)).size,
    channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function problemsOf(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDay: readonly string[],
): { merged: number; rows: ProblemRow[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const rows = groups.map((g) => row(g.cause, g.reports));
  for (const g of groups) {
    if (readAs(g, oneDay)) rows.push(row('one-day', g.reports.filter((r) => oneDay.includes(r.id)), g.cause));
  }
  return { merged: merged.length, rows };
}
