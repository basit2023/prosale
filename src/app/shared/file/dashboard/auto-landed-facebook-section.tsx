'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PiEnvelopeOpenDuotone } from 'react-icons/pi';

import apiService from '@/utils/apiService';
import cn from '@/utils/class-names';

type AutoLead = {
  lead_id: number;
  customer_name?: string;
  mobile?: string;
  email?: string;
  city?: string;
  project_name?: string;
  assigned_to?: string;
  assigned_through?: string;
  landed_at?: string;
  lead_created_at?: string;
  campaign_name?: string;
  campaign_type?: string;
  investment_time?: string;
  investment_budget?: string | number;
  source_name?: string;
  status?: string;
  label?: string;
};

type ProjectSummary = {
  project_id?: number | null;
  project_name: string;
  total: number;
};

type AutoLeadResponse = {
  total: number;
  byProject: ProjectSummary[];
  leads: AutoLead[];
};

const localDateInput = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const csvCell = (value: unknown) => {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
};

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const exportColumns: Array<[string, keyof AutoLead]> = [
  ['Lead ID', 'lead_id'],
  ['Customer', 'customer_name'],
  ['Mobile', 'mobile'],
  ['Email', 'email'],
  ['City', 'city'],
  ['Project', 'project_name'],
  ['Assigned To', 'assigned_to'],
  ['Landed At', 'landed_at'],
  ['Campaign Name', 'campaign_name'],
  ['Campaign Type', 'campaign_type'],
  ['Investment Time', 'investment_time'],
  ['Investment Budget', 'investment_budget'],
  ['Source', 'source_name'],
  ['Status', 'status'],
];

export default function AutoLandedFacebookSection({ className }: { className?: string }) {
  const [from, setFrom] = useState(localDateInput());
  const [to, setTo] = useState(localDateInput());
  const [fromTime, setFromTime] = useState('06:00');
  const [toTime, setToTime] = useState('19:00');
  const [data, setData] = useState<AutoLeadResponse>({ total: 0, byProject: [], leads: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const params = useMemo(() => ({ from, to, fromTime, toTime }), [from, to, fromTime, toTime]);

  const fetchAutoLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.get('/dashboard/auto-landed-facebook-leads', { params });
      setData(response.data?.data || { total: 0, byProject: [], leads: [] });
    } catch (err) {
      console.error('Error fetching Facebook auto-landed leads:', err);
      setError('Could not load Facebook auto-landed leads.');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchAutoLeads();
  }, [fetchAutoLeads]);

  const exportCsv = () => {
    const header = exportColumns.map(([label]) => csvCell(label)).join(',');
    const rows = data.leads.map((lead) =>
      exportColumns.map(([, key]) => csvCell(key === 'landed_at' ? formatDateTime(lead[key]) : lead[key])).join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facebook-auto-leads-${from}-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const rows = data.leads
      .map(
        (lead) => `
          <tr>
            ${exportColumns
              .map(([, key]) => `<td>${escapeHtml(key === 'landed_at' ? formatDateTime(lead[key]) : lead[key] ?? '-')}</td>`)
              .join('')}
          </tr>
        `
      )
      .join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Facebook Auto-Landed Leads</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { font-size: 22px; margin: 0 0 6px; }
            p { color: #4b5563; margin: 0 0 18px; }
            table { border-collapse: collapse; width: 100%; font-size: 11px; }
            th, td { border: 1px solid #e5e7eb; padding: 7px; text-align: left; vertical-align: top; }
            th { background: #f9fafb; }
          </style>
        </head>
        <body>
          <h1>Facebook Auto-Landed Leads</h1>
          <p>${escapeHtml(from)} ${escapeHtml(fromTime)} to ${escapeHtml(to)} ${escapeHtml(toTime)} | Total: ${data.total}</p>
          <table>
            <thead>
              <tr>${exportColumns.map(([label]) => `<th>${escapeHtml(label)}</th>`).join('')}</tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="14">No leads found.</td></tr>'}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const openLead = (leadId: number) => {
    window.location.href = `/leads/${leadId}/edit/`;
  };

  return (
    <section className={cn('rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900', className)}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-700">
            <PiEnvelopeOpenDuotone className="h-4 w-4" />
            Facebook auto leads
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Auto-landed Facebook leads</h2>
          <p className="mt-1 text-sm text-gray-500">
            Filter landed leads by date and time, review project assignment, then export the same result.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <label className="text-xs font-semibold text-gray-500">
            From
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900"
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            To
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900"
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            Start time
            <input
              type="time"
              value={fromTime}
              onChange={(event) => setFromTime(event.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900"
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            End time
            <input
              type="time"
              value={toTime}
              onChange={(event) => setToTime(event.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900"
            />
          </label>
          <button
            type="button"
            onClick={fetchAutoLeads}
            className="mt-5 h-10 rounded-lg border border-gray-200 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="h-10 rounded-lg border border-emerald-200 px-4 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={exportPdf}
              className="h-10 rounded-lg border border-rose-200 px-4 text-sm font-bold text-rose-700 hover:bg-rose-50"
            >
              PDF
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-semibold uppercase text-gray-500">Total landed</p>
          <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{loading ? '-' : data.total}</p>
        </div>
        {data.byProject.slice(0, 3).map((project) => (
          <div key={project.project_name} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="truncate text-xs font-semibold uppercase text-gray-500">{project.project_name}</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{project.total}</p>
          </div>
        ))}
      </div>

      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}

      <div className="mt-5 overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Assigned To</th>
              <th className="px-4 py-3">Landed At</th>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Best Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  Loading auto-landed leads...
                </td>
              </tr>
            ) : data.leads.length ? (
              data.leads.map((lead) => (
                <tr
                  key={lead.lead_id}
                  onDoubleClick={() => openLead(lead.lead_id)}
                  className="cursor-pointer hover:bg-sky-50/60 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900 dark:text-white">{lead.customer_name || `Lead #${lead.lead_id}`}</div>
                    <div className="text-xs text-gray-500">{lead.mobile || '-'} | #{lead.lead_id}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">{lead.project_name || '-'}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{lead.assigned_to || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDateTime(lead.landed_at || lead.lead_created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700 dark:text-gray-200">{lead.campaign_name || '-'}</div>
                    <div className="text-xs text-gray-500">{lead.campaign_type || '-'}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.city || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.investment_time || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  No Facebook auto-landed leads found for this date and time.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-400">Double-click a row to open the lead.</p>
    </section>
  );
}
