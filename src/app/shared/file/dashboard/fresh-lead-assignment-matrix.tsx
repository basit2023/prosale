'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PiArrowClockwiseDuotone,
  PiDownloadSimpleDuotone,
  PiEyeDuotone,
  PiFilePdfDuotone,
  PiUsersThreeDuotone,
} from 'react-icons/pi';

import apiService from '@/utils/apiService';

type AssignmentUser = {
  assigned_to: string;
  assigned_to_full_name: string;
  projects: Record<string, number>;
  total: number;
};

type MatrixData = {
  projects: string[];
  users: AssignmentUser[];
  projectTotals: Record<string, number>;
  total: number;
  leads: FreshLead[];
};

type FreshLead = {
  lead_id: number;
  assigned_to: string;
  assigned_to_full_name?: string;
  project_name: string;
  customer_name?: string;
  mobile?: string;
  city?: string;
  assigned_on?: string;
  status?: string;
  label?: string;
};

type DetailFilter = {
  title: string;
  assignedTo?: string;
  project?: string;
} | null;

const localDateInput = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const emptyData: MatrixData = { projects: [], users: [], projectTotals: {}, total: 0, leads: [] };

const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const downloadText = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export default function FreshLeadAssignmentMatrix() {
  const [date, setDate] = useState(localDateInput());
  const [fromTime, setFromTime] = useState('06:00');
  const [toTime, setToTime] = useState('19:00');
  const [data, setData] = useState<MatrixData>(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailFilter, setDetailFilter] = useState<DetailFilter>(null);

  const params = useMemo(() => ({ date, fromTime, toTime }), [date, fromTime, toTime]);

  const loadMatrix = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.get('/dashboard/fresh-lead-assignment-matrix', { params });
      setData(response.data?.data || emptyData);
    } catch (requestError) {
      console.error('Error fetching fresh lead assignment matrix:', requestError);
      setError('Could not load fresh lead assignments.');
      setData(emptyData);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const visibleLeads = useMemo(() => {
    if (!detailFilter) return [];
    return data.leads.filter((lead) =>
      (!detailFilter.assignedTo || lead.assigned_to === detailFilter.assignedTo)
      && (!detailFilter.project || lead.project_name === detailFilter.project)
    );
  }, [data.leads, detailFilter]);

  const exportCsv = () => {
    const header = ['Assigned to', ...data.projects, 'Total'].map(csvCell).join(',');
    const rows = data.users.map((user) => [
      user.assigned_to_full_name || user.assigned_to,
      ...data.projects.map((project) => user.projects[project] || 0),
      user.total,
    ].map(csvCell).join(','));
    const totals = ['Total', ...data.projects.map((project) => data.projectTotals[project] || 0), data.total]
      .map(csvCell)
      .join(',');
    downloadText([header, ...rows, totals].join('\n'), `fresh-lead-assignments-${date}-${fromTime}-${toTime}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const headings = data.projects.map((project) => `<th>${escapeHtml(project)}</th>`).join('');
    const rows = data.users.map((user) => `
      <tr>
        <td>${escapeHtml(user.assigned_to_full_name || user.assigned_to)}</td>
        ${data.projects.map((project) => `<td>${user.projects[project] || 0}</td>`).join('')}
        <td><strong>${user.total}</strong></td>
      </tr>
    `).join('');
    const totals = data.projects.map((project) => `<td><strong>${data.projectTotals[project] || 0}</strong></td>`).join('');
    printWindow.document.write(`
      <html><head><title>Fresh Lead Assignments</title><style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
        h1 { margin: 0 0 6px; font-size: 22px; }
        p { margin: 0 0 18px; color: #4b5563; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: center; }
        th:first-child, td:first-child { text-align: left; }
        th { background: #fef08a; }
        tfoot { background: #f3f4f6; }
      </style></head><body>
        <h1>Daily Fresh Leads Assigned</h1>
        <p>${escapeHtml(dateLabel)} | ${escapeHtml(fromTime)} - ${escapeHtml(toTime)} | Total: ${data.total}</p>
        <table><thead><tr><th>Assigned to</th>${headings}<th>Total</th></tr></thead>
        <tbody>${rows}</tbody><tfoot><tr><td><strong>Total</strong></td>${totals}<td><strong>${data.total}</strong></td></tr></tfoot></table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const showDetails = (title: string, assignedTo?: string, project?: string) => {
    setDetailFilter({ title, assignedTo, project });
  };

  return (
    <section className="col-span-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-5 xl:flex-row xl:items-end xl:justify-between dark:border-gray-700">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
            <PiUsersThreeDuotone className="h-4 w-4" />
            Fresh lead allocation
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Daily fresh leads assigned</h2>
          <p className="mt-1 text-sm text-gray-500">Fresh leads grouped step by step by recipient and project.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="col-span-2 text-xs font-semibold text-gray-500 sm:col-span-1">
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            From
            <input
              type="time"
              value={fromTime}
              onChange={(event) => setFromTime(event.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            To
            <input
              type="time"
              value={toTime}
              onChange={(event) => setToTime(event.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </label>
          <button
            type="button"
            onClick={loadMatrix}
            disabled={loading}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <PiArrowClockwiseDuotone className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4 flex flex-col gap-3 rounded-xl bg-yellow-100 px-4 py-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <strong className="text-gray-900">Date {dateLabel}, {fromTime} - {toTime}</strong>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <button type="button" onClick={() => showDetails('All fresh leads')} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50">
              <PiEyeDuotone className="h-4 w-4" /> View {data.total}
            </button>
            <button type="button" onClick={exportCsv} disabled={!data.total} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
              <PiDownloadSimpleDuotone className="h-4 w-4" /> CSV
            </button>
            <button type="button" onClick={exportPdf} disabled={!data.total} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50">
              <PiFilePdfDuotone className="h-4 w-4" /> PDF
            </button>
            <span className="text-sm font-bold text-gray-700">Total fresh leads: {data.total}</span>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>
        ) : loading ? (
          <div className="h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        ) : data.users.length ? (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                <tr>
                  <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Assigned to</th>
                  {data.projects.map((project) => (
                    <th key={project} className="border-b border-r border-gray-200 px-4 py-3 text-center dark:border-gray-700">{project}</th>
                  ))}
                  <th className="border-b border-gray-200 px-4 py-3 text-center dark:border-gray-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.users.map((user) => (
                  <tr key={user.assigned_to} className="hover:bg-emerald-50/40 dark:hover:bg-gray-800">
                    <td className="border-r border-gray-100 px-4 py-3 dark:border-gray-700">
                      <button type="button" onClick={() => showDetails(`${user.assigned_to_full_name || user.assigned_to} fresh leads`, user.assigned_to)} className="text-left">
                        <span className="block font-bold text-gray-900 hover:text-emerald-600 dark:text-white">{user.assigned_to_full_name || user.assigned_to}</span>
                      </button>
                      <div className="text-xs text-gray-500">{user.assigned_to}</div>
                    </td>
                    {data.projects.map((project) => (
                      <td key={`${user.assigned_to}-${project}`} className="border-r border-gray-100 px-4 py-3 text-center font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        {user.projects[project] ? (
                          <button type="button" onClick={() => showDetails(`${user.assigned_to_full_name || user.assigned_to} - ${project}`, user.assigned_to, project)} className="rounded-md px-2 py-1 font-black text-emerald-600 hover:bg-emerald-50">
                            {user.projects[project]}
                          </button>
                        ) : '-'}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <button type="button" onClick={() => showDetails(`${user.assigned_to_full_name || user.assigned_to} fresh leads`, user.assigned_to)} className="rounded-md px-2 py-1 font-black text-emerald-600 hover:bg-emerald-50">
                        {user.total}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50 font-black text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <tr>
                  <td className="border-r border-gray-200 px-4 py-3 dark:border-gray-700">Total</td>
                  {data.projects.map((project) => (
                    <td key={`total-${project}`} className="border-r border-gray-200 px-4 py-3 text-center dark:border-gray-700">
                      <button type="button" onClick={() => showDetails(`${project} fresh leads`, undefined, project)} className="rounded-md px-2 py-1 font-black text-emerald-600 hover:bg-emerald-50">
                        {data.projectTotals[project] || 0}
                      </button>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center text-emerald-600">{data.total}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
            No fresh leads were assigned during this date and time range.
          </div>
        )}
      </div>

      {detailFilter && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-5 dark:border-gray-700">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-emerald-600">Fresh lead details</div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">{detailFilter.title}</h3>
                <p className="text-sm text-gray-500">{visibleLeads.length} leads | {dateLabel}, {fromTime} - {toTime}</p>
              </div>
              <button type="button" onClick={() => setDetailFilter(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-white">Close</button>
            </div>
            <div className="max-h-[calc(92vh-100px)] overflow-auto p-5">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800">
                  <tr><th className="px-4 py-3">Lead</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Project</th><th className="px-4 py-3">Assigned to</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Assigned at</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {visibleLeads.map((lead) => (
                    <tr key={lead.lead_id} onDoubleClick={() => { window.location.href = `/leads/${lead.lead_id}/edit/`; }} className="cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 font-black text-emerald-600">#{lead.lead_id}</td>
                      <td className="px-4 py-3"><div className="font-semibold text-gray-900 dark:text-white">{lead.customer_name || 'Customer'}</div><div className="text-xs text-gray-500">{lead.mobile || '-'} | {lead.city || '-'}</div></td>
                      <td className="px-4 py-3">{lead.project_name}</td>
                      <td className="px-4 py-3">{lead.assigned_to_full_name || lead.assigned_to}</td>
                      <td className="px-4 py-3">{lead.label || lead.status || '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{lead.assigned_on || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
