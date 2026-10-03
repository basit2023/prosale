'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import apiService from '@/utils/apiService';

type ActivityUser = {
  id: number;
  name: string;
  full_name: string;
  team_name?: string;
  assigned_leads: number;
  comments_added: number;
  matched_calls: number;
  dialed_calls: number;
  connected_calls: number;
  verified_calls: number;
  qualified_calls: number;
};

type ActivityData = {
  date: string;
  users: ActivityUser[];
  totals: Record<string, number>;
  leads: any[];
  comments: any[];
  calls: any[];
};

type DetailSelection = { username?: string; type: 'leads' | 'comments' | 'calls'; title: string } | null;

const localDateInput = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const emptyData: ActivityData = { date: '', users: [], totals: {}, leads: [], comments: [], calls: [] };
const number = (value: unknown) => Number(value || 0);
const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const escapeHtml = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const downloadCsv = (rows: unknown[][], filename: string) => {
  const blob = new Blob([rows.map((row) => row.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export default function DailyTeamActivity() {
  const [date, setDate] = useState(localDateInput());
  const [data, setData] = useState<ActivityData>(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState<DetailSelection>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.get('/dashboard/daily-team-activity', { params: { date } });
      setData(response.data?.data || emptyData);
    } catch (requestError) {
      console.error('Error fetching daily team activity:', requestError);
      setError('Could not load daily team activity.');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const details = useMemo(() => {
    if (!selection) return [];
    const rows = data[selection.type] || [];
    return selection.username ? rows.filter((row: any) => row.username === selection.username) : rows;
  }, [data, selection]);

  const exportSummary = () => downloadCsv([
    ['User', 'Username', 'Team', 'Assigned Leads', 'Comments', 'Matched Calls', 'Dialed', 'Connected', 'Verified', 'Qualified'],
    ...data.users.map((user) => [user.full_name, user.name, user.team_name || '', user.assigned_leads, user.comments_added, user.matched_calls, user.dialed_calls, user.connected_calls, user.verified_calls, user.qualified_calls]),
    ['Total', '', '', data.totals.assigned_leads, data.totals.comments_added, data.totals.matched_calls, data.totals.dialed_calls, data.totals.connected_calls, data.totals.verified_calls, data.totals.qualified_calls],
  ], `daily-team-activity-${date}.csv`);

  const exportLeadsAndComments = () => downloadCsv([
    ['Record Type', 'User', 'Lead ID', 'Customer', 'Mobile', 'Project', 'Details', 'Date'],
    ...data.leads.map((lead) => ['Lead', lead.username, lead.lead_id, lead.customer_name, lead.mobile, lead.project_name, lead.label || lead.status, lead.assigned_on]),
    ...data.comments.map((comment) => ['Comment', comment.username, comment.lead_id, comment.customer_name, '', comment.project_name, comment.comments || comment.followup, comment.dt]),
  ], `daily-leads-comments-${date}.csv`);

  const exportPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const summaryRows = data.users.map((user) => `<tr><td>${escapeHtml(user.full_name)}</td><td>${escapeHtml(user.team_name || '-')}</td><td>${user.assigned_leads}</td><td>${user.comments_added}</td><td>${user.matched_calls}</td><td>${user.dialed_calls}</td><td>${user.connected_calls}</td><td>${user.verified_calls}</td><td>${user.qualified_calls}</td></tr>`).join('');
    const workRows = [
      ...data.leads.map((lead) => `<tr><td>Lead</td><td>${escapeHtml(lead.username)}</td><td>#${lead.lead_id}</td><td>${escapeHtml(lead.customer_name)}</td><td>${escapeHtml(lead.project_name)}</td><td>${escapeHtml(lead.label || lead.status || '-')}</td><td>${escapeHtml(lead.assigned_on)}</td></tr>`),
      ...data.comments.map((comment) => `<tr><td>Comment</td><td>${escapeHtml(comment.username)}</td><td>#${comment.lead_id}</td><td>${escapeHtml(comment.customer_name)}</td><td>${escapeHtml(comment.project_name)}</td><td>${escapeHtml(comment.comments || comment.followup || '-')}</td><td>${escapeHtml(comment.dt)}</td></tr>`),
    ].join('');
    printWindow.document.write(`<html><head><title>Daily Team Activity</title><style>body{font-family:Arial;padding:24px;color:#111827}h1{margin-bottom:4px}h2{margin-top:28px}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #d1d5db;padding:7px;text-align:left}th{background:#f3f4f6}</style></head><body><h1>Daily Team Activity</h1><p>${escapeHtml(date)} | Matched calls only</p><table><thead><tr><th>User</th><th>Team</th><th>Leads</th><th>Comments</th><th>Matched</th><th>Dialed</th><th>Connected</th><th>Verified</th><th>Qualified</th></tr></thead><tbody>${summaryRows}</tbody></table><h2>Leads and comments</h2><table><thead><tr><th>Type</th><th>User</th><th>Lead</th><th>Customer</th><th>Project</th><th>Details</th><th>Date</th></tr></thead><tbody>${workRows}</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const metricButton = (value: unknown, selectionValue: NonNullable<DetailSelection>) => (
    <button type="button" onClick={() => setSelection(selectionValue)} className="rounded-md px-2 py-1 font-bold text-blue-600 hover:bg-blue-50">{number(value)}</button>
  );

  return (
    <section className="col-span-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-end lg:justify-between dark:border-gray-700">
        <div><div className="text-xs font-bold uppercase tracking-wide text-blue-600">Daily team work</div><h2 className="mt-1 text-xl font-black text-gray-900 dark:text-white">Leads, comments and matched calls</h2><p className="text-sm text-gray-500">Admins see all users; zone managers and managers see only their assigned teams.</p></div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-semibold text-gray-500">Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 block h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
          <button type="button" onClick={load} className="h-10 rounded-lg border border-gray-200 px-3 text-sm font-bold">Refresh</button>
          <button type="button" onClick={exportSummary} disabled={!data.users.length} className="h-10 rounded-lg bg-blue-600 px-3 text-sm font-bold text-white disabled:opacity-50">Summary CSV</button>
          <button type="button" onClick={exportLeadsAndComments} disabled={!data.leads.length && !data.comments.length} className="h-10 rounded-lg bg-emerald-600 px-3 text-sm font-bold text-white disabled:opacity-50">Leads & Comments CSV</button>
          <button type="button" onClick={exportPdf} disabled={!data.users.length} className="h-10 rounded-lg bg-rose-600 px-3 text-sm font-bold text-white disabled:opacity-50">PDF</button>
        </div>
      </div>

      <div className="p-5">
        {error ? <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div> : loading ? <div className="h-52 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" /> : data.users.length ? (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700"><table className="w-full min-w-[1120px] text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left">User</th><th className="px-3 py-3">Assigned leads</th><th className="px-3 py-3">Comments</th><th className="px-3 py-3">Matched calls</th><th className="px-3 py-3">Dialed</th><th className="px-3 py-3">Connected</th><th className="px-3 py-3">Verified</th><th className="px-3 py-3">Qualified</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-700">{data.users.map((user) => <tr key={user.id} className="text-center hover:bg-gray-50 dark:hover:bg-gray-800"><td className="px-4 py-3 text-left"><div className="font-bold text-gray-900 dark:text-white">{user.full_name}</div><div className="text-xs text-gray-500">{user.name} | {user.team_name || 'No team'}</div></td><td>{metricButton(user.assigned_leads, { username: user.name, type: 'leads', title: `${user.full_name} assigned leads` })}</td><td>{metricButton(user.comments_added, { username: user.name, type: 'comments', title: `${user.full_name} comments` })}</td><td>{metricButton(user.matched_calls, { username: user.name, type: 'calls', title: `${user.full_name} matched calls` })}</td><td className="font-semibold">{user.dialed_calls}</td><td className="font-semibold text-orange-600">{user.connected_calls}</td><td className="font-semibold text-teal-600">{user.verified_calls}</td><td className="font-semibold text-blue-600">{user.qualified_calls}</td></tr>)}</tbody><tfoot className="border-t-2 bg-gray-50 font-black dark:bg-gray-800"><tr className="text-center"><td className="px-4 py-3 text-left">Total</td><td>{data.totals.assigned_leads || 0}</td><td>{data.totals.comments_added || 0}</td><td>{data.totals.matched_calls || 0}</td><td>{data.totals.dialed_calls || 0}</td><td>{data.totals.connected_calls || 0}</td><td>{data.totals.verified_calls || 0}</td><td>{data.totals.qualified_calls || 0}</td></tr></tfoot></table></div>
        ) : <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">No team activity found for this date.</div>}
      </div>

      {selection && <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4"><div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"><div className="flex items-center justify-between border-b p-5 dark:border-gray-700"><div><h3 className="text-xl font-black dark:text-white">{selection.title}</h3><p className="text-sm text-gray-500">{details.length} records on {date}</p></div><button type="button" onClick={() => setSelection(null)} className="rounded-lg border px-4 py-2 text-sm font-bold dark:border-gray-700">Close</button></div><div className="max-h-[calc(92vh-90px)] overflow-auto p-5"><table className="w-full min-w-[850px] text-left text-sm"><thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800"><tr><th className="px-3 py-3">Lead</th><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Project / Direction</th><th className="px-3 py-3">Details</th><th className="px-3 py-3">Date</th></tr></thead><tbody className="divide-y dark:divide-gray-700">{details.map((row: any) => <tr key={`${selection.type}-${row.id || row.lead_id}`} onDoubleClick={() => row.lead_id && (window.location.href = `/leads/${row.lead_id}/edit/`)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"><td className="px-3 py-3 font-bold text-blue-600">#{row.lead_id || '-'}</td><td className="px-3 py-3">{row.customer_name || '-'}</td><td className="px-3 py-3">{row.project_name || row.direction || '-'}</td><td className="max-w-md px-3 py-3">{row.comments || row.followup || row.label || row.status || row.disposition || row.call_status || '-'}</td><td className="px-3 py-3 text-xs text-gray-500">{row.dt || row.assigned_on || row.start_time || '-'}</td></tr>)}</tbody></table></div></div></div>}
    </section>
  );
}
