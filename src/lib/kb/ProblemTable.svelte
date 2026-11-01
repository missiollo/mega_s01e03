<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemsOf, type Problem } from '#lib/kb/problems';

  // Per problem: where it is tracked and where it stands, as engineering reported it.
  type Track = { issue: string; state: string };
  let { ticket, tracks = {} }: { ticket: number; tracks?: Partial<Record<Problem, Track>> } = $props();

  const view = $derived(problemsOf(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const filed = $derived(view.rows.filter((r) => !r.filedUnder));
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([ch, n]) => `${ch} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{view.merged}</strong> reports merged into #{ticket} · <strong>{view.rows.length}</strong> problems ·
  {filed.map((r) => r.reports.length).join(' + ')} = {filed.reduce((n, r) => n + r.reports.length, 0)}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>channels</th><th>tenants</th><th>seen</th><th>ticket</th><th>state</th></tr>
  </thead>
  <tbody>
    {#each view.rows as r (r.problem)}
      {@const track = tracks[r.problem]}
      <tr class:open={track?.state === 'open'}>
        <td><code>{r.problem}</code></td>
        <td>{r.reports.length}</td>
        <td class="tags">{channels(r.channels)}</td>
        <td>{r.tenants}</td>
        <td>{r.firstSeen} → {r.lastSeen}</td>
        <td>{#if track}<a href={track.issue}>#{track.issue.split('/').pop()}</a>{:else}<span class="none">none</span>{/if}</td>
        <td>{track?.state ?? '—'}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each view.rows.filter((r) => r.filedUnder) as r (r.problem)}
  <p class="note">The {r.reports.length} <code>{r.problem}</code> reports are also counted under <code>{r.filedUnder}</code>, where the desk files them by tenant.</p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .tags, .note { color: var(--muted); font-size: 0.85em; }
  .none, .open td:last-child { color: var(--warn); font-weight: 600; }
</style>
