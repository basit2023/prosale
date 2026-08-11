'use client';

import React, { useEffect, useMemo, useState } from 'react';
import apiService from '@/utils/apiService';

type CallLog = {
  id: number;
  phone?: string;
  customer_name?: string;
  project_name?: string;
  assigned_to?: string;
  employee_name?: string;
  user_email?: string;
  call_type?: string;
  call_status?: string;
  disposition?: string;
  duration_seconds?: number;
  start_time?: string;
  end_time?: string;
  lead_id?: string;
  source?: string;
};

const filters = [
  { label: 'All', value: '' },
  { label: 'Incoming', value: 'INCOMING' },
  { label: 'Outgoing', value: 'OUTGOING' },
  { label: 'Missed', value: 'MISSED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Connected', value: 'CONNECTED' },
];

function fmtDate(value?: string) {
  if (!value) return 'Not set';
  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function fmtDuration(seconds?: number) {
  const total = Number(seconds || 0);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}m ${sec}s`;
}

export default function CallHistoryPage() {
  const [active, setActive] = useState('');
  const [phone, setPhone] = useState('');
  const [rows, setRows] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const params = useMemo(() => {
    const query: Record<string, string> = { limit: '200' };
    if (phone.trim()) query.phone = phone.trim();
    if (active === 'CONNECTED') query.connected = 'true';
    else if (active) query.type = active;
    return query;
  }, [active, phone]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    apiService
      .get('/call-logs', { params })
      .then((response) => {
        if (!alive) return;
        setRows(response.data?.data || []);
        setTotal(Number(response.data?.total || 0));
      })
      .catch((error) => {
        console.error('Failed to fetch call logs:', error);
        if (alive) setRows([]);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [params]);

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-rose-600">Call analytics</div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">CRM call history</h1>
        <p className="text-sm text-gray-500">Synced Android call logs matched with leads and customers.</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setActive(item.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active === item.value ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Search phone number"
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-rose-400 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">Call records</h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">{loading ? 'Loading...' : `${total} calls`}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-gray-950">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Date/time</th>
                <th className="px-4 py-3">Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{row.customer_name || 'Unmatched'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.phone || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.employee_name || row.assigned_to || row.user_email || 'N/A'}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{row.call_type || row.source || 'UNKNOWN'}</span></td>
                  <td className="px-4 py-3"><span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">{row.call_status || row.disposition || 'PENDING'}</span></td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{fmtDuration(row.duration_seconds)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{fmtDate(row.start_time)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.lead_id || 'N/A'}</td>
                </tr>
              ))}
              {!rows.length && !loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">No call logs found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
