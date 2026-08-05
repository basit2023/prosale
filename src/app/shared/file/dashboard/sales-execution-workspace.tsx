'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiArrowClockwise,
  PiChartLineUp,
  PiClockCountdown,
  PiPhoneCall,
  PiWarningCircle,
} from 'react-icons/pi';

import apiService from '@/utils/apiService';

type Stage = {
  code: string;
  name: string;
  lead_count: number;
  weighted_value: number;
  requires_next_action: number;
};

type QueueLead = {
  lead_id: number;
  customer_name?: string;
  mobile?: string;
  assigned_to?: string;
  project_name?: string;
  label?: string;
  stage_code: string;
  stage_name?: string;
  score: number;
  score_reasons: string[];
  sla_status: 'pending' | 'met' | 'breached';
  next_action_at?: string;
  next_action_type?: string;
  next_followup_name?: string;
};

const formatDate = (value?: string) => {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export default function SalesExecutionWorkspace() {
  const [queue, setQueue] = useState<QueueLead[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [summary, setSummary] = useState({ total: 0, sla_breached: 0, overdue_actions: 0, unread: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [queueResponse, pipelineResponse] = await Promise.all([
        apiService.get('/sales-execution/queue', { params: { limit: 50 } }),
        apiService.get('/sales-execution/pipeline'),
      ]);
      setQueue(queueResponse.data.queue || []);
      setSummary(queueResponse.data.summary || {});
      setStages(pipelineResponse.data.stages || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to load the priority workspace');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cards = [
    { label: 'Priority queue', value: summary.total, icon: PiChartLineUp, tone: 'text-violet-600 bg-violet-50' },
    { label: 'SLA breached', value: summary.sla_breached, icon: PiWarningCircle, tone: 'text-red-600 bg-red-50' },
    { label: 'Overdue actions', value: summary.overdue_actions, icon: PiClockCountdown, tone: 'text-amber-600 bg-amber-50' },
    { label: 'Unread', value: summary.unread, icon: PiPhoneCall, tone: 'text-blue-600 bg-blue-50' },
  ];

  return (
    <section className="col-span-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <header className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between dark:border-gray-800">
        <div>
          <p className="text-xs font-bold uppercase text-rose-600">Sales execution</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Work the next best lead</h2>
          <p className="mt-1 text-sm text-gray-500">Tracks existing categories and comment follow-ups. Update them from the lead edit page.</p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 px-3 text-sm font-semibold text-gray-700 disabled:opacity-50"
        >
          <PiArrowClockwise className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 p-5 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-lg border border-gray-100 p-4 text-left dark:border-gray-800">
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${tone}`}><Icon /></span>
            <strong className="mt-3 block text-2xl text-gray-900 dark:text-white">{loading ? '-' : value || 0}</strong>
            <span className="text-sm text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      <div className="border-y border-gray-100 px-5 py-4 dark:border-gray-800">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {stages.map((stage) => (
            <div key={stage.code} className="min-w-36 rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-800">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{stage.name}</span>
                <strong className="text-sm text-gray-900 dark:text-white">{stage.lead_count || 0}</strong>
              </div>
              <p className="mt-1 text-[11px] text-gray-400">Open leads in category</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-h-[520px] overflow-auto">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">Loading priority leads...</div>
        ) : queue.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">No open leads are available in your permission scope.</div>
        ) : (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800">
              <tr><th className="px-5 py-3">Lead</th><th>Owner</th><th>Category</th><th>Priority</th><th>SLA</th><th>Next follow-up</th><th className="px-5 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {queue.map((lead) => (
                <tr key={lead.lead_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                  <td className="px-5 py-3"><strong className="block text-gray-900 dark:text-white">{lead.customer_name || `Lead #${lead.lead_id}`}</strong><span className="text-xs text-gray-500">{lead.mobile || 'No mobile'} | {lead.project_name || 'No project'}</span></td>
                  <td>{lead.assigned_to || 'Unassigned'}</td>
                  <td><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{lead.label || lead.stage_name || 'Uncategorised'}</span></td>
                  <td><strong>{lead.score}</strong><span className="ml-2 text-xs text-gray-400">{lead.score_reasons?.[0]}</span></td>
                  <td className={lead.sla_status === 'breached' ? 'font-semibold text-red-600' : 'text-gray-600'}>{lead.sla_status}</td>
                  <td><span className="block">{lead.next_followup_name || lead.next_action_type || 'Not set'}</span><span className="text-xs text-gray-400">{formatDate(lead.next_action_at)}</span></td>
                  <td className="px-5 text-right"><Link href={`/leads/${lead.lead_id}/edit/`} className="inline-flex rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white">Work lead</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
