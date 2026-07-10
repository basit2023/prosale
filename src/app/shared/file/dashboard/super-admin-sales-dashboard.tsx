'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import {
  PiCalendarCheckDuotone,
  PiChatCircleTextDuotone,
  PiEnvelopeOpenDuotone,
  PiEyeDuotone,
  PiPhoneCallDuotone,
  PiUsersThreeDuotone,
} from 'react-icons/pi';

import apiService from '@/utils/apiService';
import cn from '@/utils/class-names';
import { useUser } from '@/context/UserContext';

const BarChart = dynamic<any>(() => import('recharts').then((mod) => mod.BarChart as any), { ssr: false });
const Bar = dynamic<any>(() => import('recharts').then((mod) => mod.Bar as any), { ssr: false });
const LineChart = dynamic<any>(() => import('recharts').then((mod) => mod.LineChart as any), { ssr: false });
const Line = dynamic<any>(() => import('recharts').then((mod) => mod.Line as any), { ssr: false });
const XAxis = dynamic<any>(() => import('recharts').then((mod) => mod.XAxis as any), { ssr: false });
const YAxis = dynamic<any>(() => import('recharts').then((mod) => mod.YAxis as any), { ssr: false });
const CartesianGrid = dynamic<any>(() => import('recharts').then((mod) => mod.CartesianGrid as any), { ssr: false });
const Tooltip = dynamic<any>(() => import('recharts').then((mod) => mod.Tooltip as any), { ssr: false });
const Legend = dynamic<any>(() => import('recharts').then((mod) => mod.Legend as any), { ssr: false });
const ResponsiveContainer = dynamic<any>(() => import('recharts').then((mod) => mod.ResponsiveContainer as any), { ssr: false });

type DetailType = 'leads' | 'comments' | 'calls' | 'opens' | 'followups';

type SuperAdminUser = {
  user_id: number;
  username: string;
  full_name: string;
  email?: string;
  user_type?: string;
  permission_level?: number;
  leads_assigned: number;
  fresh_leads: number;
  cool_leads: number;
  reassigned_leads: number;
  reassignments_made: number;
  unread_leads: number;
  total_unread_leads: number;
  read_leads: number;
  comments_added: number;
  followups_created: number;
  followups_attended: number;
  followups_due: number;
  overdue_followups: number;
  calls_started: number;
  whatsapp_opened: number;
  unique_leads_opened: number;
  lead_open_events: number;
  work_score: number;
  last_activity_date?: string | null;
  inactive_days?: number | null;
  is_inactive_attention?: boolean;
  inactive_reason?: string;
  status: 'active' | 'low_activity' | 'no_activity';
};

type ReassignmentBreakdown = {
  assigned_by: string;
  assigned_by_full_name: string;
  assigned_to: string;
  assigned_to_full_name: string;
  assigned_count: number;
  latest_assigned_day?: string | null;
};

type ReassignmentGroup = {
  assigned_by: string;
  assigned_by_full_name: string;
  total_assigned: number;
  recipients: ReassignmentBreakdown[];
};

type SuperAdminData = {
  range?: { from: string; to: string };
  summary?: Record<string, number>;
  users?: SuperAdminUser[];
  trends?: any[];
  topCommenters?: SuperAdminUser[];
  attentionUsers?: SuperAdminUser[];
  inactiveThresholdDays?: number;
  inactiveUsers?: SuperAdminUser[];
  reassignmentBreakdown?: ReassignmentBreakdown[];
  reassignmentByUser?: Record<string, any>;
  details?: Record<DetailType, any[]>;
  detailsByUser?: Record<DetailType, Record<string, any[]>>;
  limits?: Record<string, any>;
};

const localDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const number = (value: any) => Number(value || 0).toLocaleString();

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

const detailLabels: Record<DetailType, string> = {
  leads: 'Leads',
  comments: 'Comments',
  calls: 'Calls',
  opens: 'Lead opens',
  followups: 'Follow-ups',
};

const summaryCards = [
  {
    key: 'fresh_leads',
    label: 'Fresh Leads',
    hint: 'Customer and lead dates match',
    icon: PiUsersThreeDuotone,
    tone: 'bg-emerald-50 text-emerald-600',
  },
  {
    key: 'cool_leads',
    label: 'Cool Data',
    hint: 'Older or date-mismatched leads',
    icon: PiUsersThreeDuotone,
    tone: 'bg-amber-50 text-amber-600',
  },
 
  {
    key: 'comments_added',
    label: 'Comments',
    hint: 'Notes added by users',
    icon: PiChatCircleTextDuotone,
    tone: 'bg-emerald-50 text-emerald-600',
  },
  {
    key: 'calls_started',
    label: 'Calls',
    hint: 'Phone attempts in selected date',
    icon: PiPhoneCallDuotone,
    tone: 'bg-amber-50 text-amber-600',
  },
  {
    key: 'unique_leads_opened',
    label: 'Unique Opens',
    hint: 'Same lead counted once per user',
    icon: PiEyeDuotone,
    tone: 'bg-violet-50 text-violet-600',
  },
  {
    key: 'unread_leads',
    label: 'Unread in Range',
    hint: 'Assigned in range and not opened',
    icon: PiEnvelopeOpenDuotone,
    tone: 'bg-rose-50 text-rose-600',
  },
  {
    key: 'followups_attended',
    label: 'Follow-ups Done',
    hint: 'Completed reminders',
    icon: PiCalendarCheckDuotone,
    tone: 'bg-green-50 text-green-600',
  },
  {
    key: 'followups_created',
    label: 'Follow-ups Created',
    hint: 'Follow-ups made from From/To',
    icon: PiCalendarCheckDuotone,
    tone: 'bg-orange-50 text-orange-600',
  },
   {
    key: 'leads_assigned',
    label: 'Assigned in Range',
    hint: 'Leads assigned from From/To',
    icon: PiUsersThreeDuotone,
    tone: 'bg-blue-50 text-blue-600',
  },
  
  {
    key: 'reassigned_leads',
    label: 'Reassigned',
    hint: 'Leads reassigned in range',
    icon: PiUsersThreeDuotone,
    tone: 'bg-indigo-50 text-indigo-600',
  },
] as const;

type SummaryCardKey = (typeof summaryCards)[number]['key'];
type SummarySelection = { key: SummaryCardKey; label: string; hint: string };

const summaryRowsFor = (data: SuperAdminData | null, key: SummaryCardKey): any[] => {
  const details = (data?.details || {}) as Partial<Record<DetailType, any[]>>;
  const leads = details.leads || [];

  if (key === 'leads_assigned') return leads;
  if (key === 'fresh_leads') return leads.filter((row: any) => row.data_temperature === 'fresh');
  if (key === 'cool_leads') return leads.filter((row: any) => row.data_temperature !== 'fresh');
  if (key === 'reassigned_leads') return leads.filter((row: any) => row.assigned_through);
  if (key === 'unread_leads') return leads.filter((row: any) => row.view_dt === 'new_lead');
  if (key === 'comments_added') return details.comments || [];
  if (key === 'calls_started') {
    return (details.calls || []).filter((row: any) => String(row.phone || '').toUpperCase() === 'Y');
  }
  if (key === 'unique_leads_opened') return details.opens || [];
  if (key === 'followups_attended') return (details.followups || []).filter((row: any) => Number(row.nextfollowup) === 0);
  if (key === 'followups_created') return details.followups || [];
  return [];
};

const summaryRowUser = (key: SummaryCardKey, row: any) => {
  if (key === 'leads_assigned' || key === 'fresh_leads' || key === 'cool_leads' || key === 'reassigned_leads' || key === 'unread_leads') {
    return row.assigned_to || row.username || '-';
  }
  return row.username || row.assigned_to || '-';
};

const summaryRowDetails = (key: SummaryCardKey, row: any) => {
  if (key === 'leads_assigned') return `Assigned to ${row.assigned_to || '-'} | ${row.data_temperature || 'cool'} data | By ${row.assigned_through || row.created_by || '-'}`;
  if (key === 'fresh_leads') return `Fresh lead | Lead ${row.lead_created_day || '-'} | Customer ${row.customer_created_day || '-'} | Assigned to ${row.assigned_to || '-'}`;
  if (key === 'cool_leads') return `Cool data | Lead ${row.lead_created_day || '-'} | Customer ${row.customer_created_day || '-'} | Assigned to ${row.assigned_to || '-'}`;
  if (key === 'reassigned_leads') return `Reassigned by ${row.assigned_through || '-'} to ${row.assigned_to || '-'} | ${row.data_temperature || 'cool'} data`;
  if (key === 'unread_leads') return `${row.status || '-'} | ${row.label || 'No label'} | ${row.data_temperature || 'cool'} data | Not opened yet`;
  if (key === 'comments_added') return row.comments || '-';
  if (key === 'calls_started') return `Phone: ${row.phone || 'N'} | WhatsApp: ${row.whatsapp || 'N'} | Duration: ${row.totaltime || '-'}`;
  if (key === 'unique_leads_opened') return `Opened ${row.event_count || 1} time(s), counted as 1 unique lead.`;
  if (key === 'followups_attended') return `${row.followup || 'Follow-up'} | Done`;
  if (key === 'followups_created') return `${row.followup || 'Follow-up'} | ${Number(row.nextfollowup) === 0 ? 'Done' : 'Pending'}`;
  return '-';
};

const summaryRowTime = (key: SummaryCardKey, row: any) => {
  if (key === 'leads_assigned' || key === 'fresh_leads' || key === 'cool_leads' || key === 'reassigned_leads' || key === 'unread_leads') return row.assigned_on;
  if (key === 'unique_leads_opened') return row.last_opened_at;
  if (key === 'followups_attended') return row.attended_at || row.followupdate || row.dt;
  if (key === 'followups_created') return row.dt || row.followupdate || row.attended_at;
  return row.dt || row.opentime || row.attended_at || row.followupdate;
};

const safeExportValue = (value: any) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
};

const csvCell = (value: any) => {
  const text = safeExportValue(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const htmlCell = (value: any) => {
  return safeExportValue(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const downloadTextFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const rowsToCsv = (rows: Array<Record<string, any>>) => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  return [
    headers.map(csvCell).join(','),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(',')),
  ].join('\n');
};

const rowsToHtmlTable = (title: string, rows: Array<Record<string, any>>) => {
  if (!rows.length) {
    return `<h2>${htmlCell(title)}</h2><p>No rows found.</p>`;
  }

  const headers = Object.keys(rows[0]);
  return `
    <h2>${htmlCell(title)}</h2>
    <table>
      <thead><tr>${headers.map((header) => `<th>${htmlCell(header)}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.map((row) => `<tr>${headers.map((header) => `<td>${htmlCell(row[header])}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;
};

function DetailPanel({
  data,
  selected,
  onClose,
  onLeadOpen,
}: {
  data: SuperAdminData | null;
  selected: { type: DetailType; username: string; fullName: string } | null;
  onClose: () => void;
  onLeadOpen: (lead: any) => void;
}) {
  if (!selected) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800">
        Click any comments, calls, lead opens, or follow-up number to review the exact rows for that user.
      </div>
    );
  }

  const rows = data?.detailsByUser?.[selected.type]?.[selected.username] || [];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-rose-600">{detailLabels[selected.type]}</div>
          <h4 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{selected.fullName}</h4>
          <p className="text-sm text-gray-500">{rows.length} tracked rows for the selected date/range.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700"
        >
          Clear
        </button>
      </div>

      <div className="max-h-[420px] overflow-auto rounded-xl border border-gray-100 dark:border-gray-700">
        {rows.length ? (
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Customer / Project</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {rows.map((row, index) => (
                <tr
                  key={`${selected.type}-${row.id || row.lead_id || index}`}
                  onClick={() => onLeadOpen(row)}
                  className="cursor-pointer hover:bg-gray-50/70 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">#{row.lead_id || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{row.customer_name || 'Customer'}</div>
                    {row.mobile ? (
                      <a href={`tel:${row.mobile}`} className="text-xs font-semibold text-amber-600 hover:underline">
                        {row.mobile}
                      </a>
                    ) : null}
                    <div className="text-xs text-gray-500">{row.project_name || 'No project'}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {selected.type === 'leads' ? `${row.assigned_to || '-'} | ${row.status || '-'} | ${row.label || 'No label'}` : null}
                    {selected.type === 'comments' ? row.comments || '-' : null}
                    {selected.type === 'calls' ? `Mobile: ${row.mobile || '-'} | Phone: ${row.phone || 'N'} | WhatsApp: ${row.whatsapp || 'N'} | Duration: ${row.totaltime || '-'}` : null}
                    {selected.type === 'opens' ? `Opened ${row.event_count || 1} time(s), counted as 1 unique lead.` : null}
                    {selected.type === 'followups' ? `${row.followup || 'Follow-up'} | ${row.nextfollowup === 0 ? 'Done' : 'Pending'}` : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {selected.type === 'opens'
                      ? formatDateTime(row.last_opened_at)
                      : formatDateTime(row.dt || row.attended_at || row.followupdate || row.opentime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-sm text-gray-500">No detail rows found for this user and metric.</div>
        )}
      </div>
    </div>
  );
}

function SummaryDetailModal({
  data,
  selected,
  onClose,
  onLeadOpen,
}: {
  data: SuperAdminData | null;
  selected: SummarySelection | null;
  onClose: () => void;
  onLeadOpen: (lead: any) => void;
}) {
  if (!selected) return null;

  const rows = summaryRowsFor(data, selected.key);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-rose-600">Dashboard details</div>
            <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-white">{selected.label}</h3>
            <p className="text-sm text-gray-500">
              {selected.hint}. Showing {number(rows.length)} rows for the selected date/range.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(92vh-96px)] overflow-auto p-5">
          {rows.length ? (
            <div className="overflow-auto rounded-xl border border-gray-100 dark:border-gray-700">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3">Lead</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Customer / Project</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {rows.map((row, index) => (
                    <tr
                      key={`${selected.key}-${row.id || row.lead_id || index}`}
                      onClick={() => onLeadOpen(row)}
                      className="cursor-pointer hover:bg-gray-50/70 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">#{row.lead_id || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900 dark:text-white">{summaryRowUser(selected.key, row)}</div>
                        {row.assigned_through ? (
                          <div className="text-xs font-semibold text-indigo-600">By {row.assigned_through}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900 dark:text-white">{row.customer_name || 'Customer'}</div>
                        <div className="text-xs text-amber-600">{row.mobile || '-'}</div>
                        <div className="text-xs text-gray-500">{row.project_name || 'No project'}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{summaryRowDetails(selected.key, row)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(summaryRowTime(selected.key, row))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
              No rows found for this metric in the selected date/range.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserActivityModal({
  data,
  user,
  onClose,
  onLeadOpen,
}: {
  data: SuperAdminData | null;
  user: SuperAdminUser | null;
  onClose: () => void;
  onLeadOpen: (lead: any) => void;
}) {
  if (!user) return null;

  const rowsFor = (type: DetailType) => data?.detailsByUser?.[type]?.[user.username] || [];
  const leadRows = rowsFor('leads');
  const unreadLeadRows = leadRows.filter((row) => row.view_dt === 'new_lead');
  const reassignedLeadRows = leadRows.filter((row) => row.assigned_through);
  const sections: Array<{ type: DetailType; title: string; rows: any[] }> = [
    { type: 'leads', title: 'Unread leads in range', rows: unreadLeadRows },
    { type: 'leads', title: 'Reassigned leads in range', rows: reassignedLeadRows },
    { type: 'leads', title: 'Assigned leads in range', rows: leadRows },
    { type: 'comments', title: 'Comments', rows: rowsFor('comments') },
    { type: 'calls', title: 'Call history', rows: rowsFor('calls') },
    { type: 'followups', title: 'Follow-ups', rows: rowsFor('followups') },
    { type: 'opens', title: 'Unique lead opens', rows: rowsFor('opens') },
  ];

  const describeRow = (type: DetailType, row: any) => {
    if (type === 'leads') return `${row.status || '-'} | ${row.label || 'No label'} | ${row.data_temperature || 'cool'} data | Assigned by ${row.assigned_through || '-'}`;
    if (type === 'comments') return row.comments || '-';
    if (type === 'calls') return `Mobile: ${row.mobile || '-'} | Phone: ${row.phone || 'N'} | WhatsApp: ${row.whatsapp || 'N'} | Duration: ${row.totaltime || '-'}`;
    if (type === 'followups') return `${row.followup || 'Follow-up'} | ${row.nextfollowup === 0 ? 'Done' : 'Pending'}`;
    return `Opened ${row.event_count || 1} time(s), counted once in unique opens.`;
  };

  const rowTime = (type: DetailType, row: any) => {
    if (type === 'leads') return row.assigned_on;
    if (type === 'opens') return row.last_opened_at;
    return row.dt || row.attended_at || row.followupdate || row.opentime;
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-rose-600">User activity</div>
            <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-white">{user.full_name}</h3>
            <p className="text-sm text-gray-500">
              {user.username} | Assigned {number(user.leads_assigned)} | Comments {number(user.comments_added)} | Calls {number(user.calls_started)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(92vh-96px)] overflow-auto p-5">
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
            {[
              ['Assigned', user.leads_assigned],
              ['Fresh', user.fresh_leads],
              ['Cool', user.cool_leads],
              ['Reassigned', user.reassigned_leads],
              ['Assigned by them', user.reassignments_made],
              ['Read', user.read_leads],
              ['Unread', user.unread_leads],
              ['Comments', user.comments_added],
              ['Calls', user.calls_started],
              ['Follow-ups', `${user.followups_created} / ${user.followups_attended}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                <div className="text-xs font-semibold text-gray-500">{label}</div>
                <div className="mt-1 text-xl font-black text-gray-900 dark:text-white">{typeof value === 'number' ? number(value) : value}</div>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            {sections.map((section) => (
              <div key={`${section.type}-${section.title}`} className="rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-white">{section.title}</h4>
                  <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-600 dark:bg-gray-800">
                    {number(section.rows.length)}
                  </span>
                </div>
                {section.rows.length ? (
                  <div className="max-h-72 overflow-auto">
                    <table className="w-full min-w-[860px] text-left text-sm">
                      <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3">Lead</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Project / Assigned</th>
                          <th className="px-4 py-3">Details</th>
                          <th className="px-4 py-3">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {section.rows.map((row, index) => (
                          <tr
                            key={`${section.type}-${row.id || row.lead_id || index}`}
                            onClick={() => onLeadOpen(row)}
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">#{row.lead_id || '-'}</td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900 dark:text-white">{row.customer_name || 'Customer'}</div>
                              <div className="text-xs text-amber-600">{row.mobile || '-'}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-gray-700 dark:text-gray-200">{row.project_name || 'No project'}</div>
                              <div className="text-xs text-gray-500">To {row.assigned_to || user.username}</div>
                              {row.assigned_through ? (
                                <div className="text-xs font-semibold text-indigo-600">By {row.assigned_through}</div>
                              ) : null}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{describeRow(section.type, row)}</td>
                            <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(rowTime(section.type, row))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-5 text-sm text-gray-500">No rows found in the selected date range.</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadDetailModal({
  data,
  lead,
  onClose,
}: {
  data: SuperAdminData | null;
  lead: any | null;
  onClose: () => void;
}) {
  if (!lead) return null;

  const leadId = String(lead.lead_id || lead.id || '');
  const allDetails = (data?.details || {}) as Partial<Record<DetailType, any[]>>;
  const leadBase = (allDetails.leads || []).find((row) => String(row.lead_id) === leadId) || lead;
  const detailRows = (type: DetailType) => (allDetails[type] || []).filter((row) => String(row.lead_id) === leadId);
  const timeline = [
    ...detailRows('leads').map((row) => ({
      time: row.assigned_on,
      title: 'Lead assigned',
      user: row.assigned_to,
      details: `Assigned to ${row.assigned_to || '-'} by ${row.assigned_through || '-'}`,
    })),
    ...detailRows('opens').map((row) => ({
      time: row.last_opened_at,
      title: 'Lead opened',
      user: row.username,
      details: `Opened ${row.event_count || 1} time(s), counted once for the day/range.`,
    })),
    ...detailRows('calls').map((row) => ({
      time: row.dt,
      title: 'Call or WhatsApp',
      user: row.username,
      details: `Phone ${row.phone || 'N'} | WhatsApp ${row.whatsapp || 'N'} | Duration ${row.totaltime || '-'}`,
    })),
    ...detailRows('comments').map((row) => ({
      time: row.dt,
      title: 'Comment added',
      user: row.username,
      details: row.comments || '-',
    })),
    ...detailRows('followups').map((row) => ({
      time: row.attended_at || row.followupdate || row.dt,
      title: row.nextfollowup === 0 ? 'Follow-up attended' : 'Follow-up scheduled',
      user: row.username,
      details: `${row.followup || 'Follow-up'} | ${row.nextfollowup === 0 ? 'Done' : 'Pending'}`,
    })),
  ].sort((a, b) => new Date(a.time || 0).getTime() - new Date(b.time || 0).getTime());

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 dark:border-gray-700">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-rose-600">Lead details</div>
            <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-white">Lead #{leadId || '-'}</h3>
            <p className="text-sm text-gray-500">{leadBase.customer_name || 'Customer'} | {leadBase.mobile || '-'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(90vh-96px)] overflow-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Customer', leadBase.customer_name || '-'],
              ['Mobile', leadBase.mobile || '-'],
              ['Project', leadBase.project_name || '-'],
              ['Assigned to', leadBase.assigned_to || leadBase.username || '-'],
              ['Assigned through', leadBase.assigned_through || '-'],
              ['Data type', `${leadBase.data_temperature || 'cool'} data`],
              ['Lead / Customer date', `${leadBase.lead_created_day || '-'} / ${leadBase.customer_created_day || '-'}`],
              ['Status', leadBase.status || '-'],
              ['Label', leadBase.label || '-'],
              ['Assigned on', formatDateTime(leadBase.assigned_on)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                <div className="text-xs font-semibold text-gray-500">{label}</div>
                <div className="mt-1 font-bold text-gray-900 dark:text-white">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <h4 className="mb-3 font-bold text-gray-900 dark:text-white">Step by step activity</h4>
            {timeline.length ? (
              <div className="space-y-3">
                {timeline.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="font-bold text-gray-900 dark:text-white">{item.title}</div>
                      <div className="text-xs text-gray-500">{formatDateTime(item.time)}</div>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">User: {item.user || '-'}</div>
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">{item.details}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 p-5 text-sm text-gray-500 dark:border-gray-700">
                No activity rows found for this lead in the selected date range.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminSalesDashboard({ className = '' }: { className?: string }) {
  const { userData } = useUser() as { userData?: any };
  const user = userData?.user;
  const permission = Number(user?.permissions?.permission_level || user?.permission || 0);
  const [from, setFrom] = useState(localDate());
  const [to, setTo] = useState(localDate());
  const [data, setData] = useState<SuperAdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<{ type: DetailType; username: string; fullName: string } | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<SummarySelection | null>(null);
  const [selectedUser, setSelectedUser] = useState<SuperAdminUser | null>(null);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const params = useMemo(() => {
    if (!user || permission < 20) return null;
    return {
      permission,
      id: user.id || '',
      email: user.email || '',
      from,
      to,
    };
  }, [from, permission, to, user]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!params) return;
      try {
        setLoading(true);
        const response = await apiService.get('/super-admin-dashboard', { params });
        setData(response.data?.data || null);
      } catch (error) {
        console.error('Error fetching super admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [params]);

  const summary = data?.summary || {};
  const users = data?.users || [];
  const reassignmentGroups = useMemo<ReassignmentGroup[]>(() => {
    const groups = new Map<string, ReassignmentGroup>();

    (data?.reassignmentBreakdown || []).forEach((row) => {
      const key = row.assigned_by || 'Unknown';
      if (!groups.has(key)) {
        groups.set(key, {
          assigned_by: key,
          assigned_by_full_name: row.assigned_by_full_name || key,
          total_assigned: 0,
          recipients: [],
        });
      }

      const group = groups.get(key);
      if (!group) return;
      group.total_assigned += Number(row.assigned_count || 0);
      group.recipients.push(row);
    });

    return Array.from(groups.values()).sort((a: ReassignmentGroup, b: ReassignmentGroup) => b.total_assigned - a.total_assigned);
  }, [data?.reassignmentBreakdown]);

  if (permission < 20) return null;

  const visibleUsers = users.filter((item) => Number(item.permission_level || 0) < 9);
  const visibleTopCommenters = (data?.topCommenters || []).filter((item) => Number(item.permission_level || 0) < 9);
  const visibleAttentionUsers = (data?.attentionUsers || []).filter((item) => Number(item.permission_level || 0) < 9);
  const visibleInactiveUsers = (data?.inactiveUsers || []).filter((item) => Number(item.permission_level || 0) < 9);
  const topUsers = visibleUsers.slice(0, 10).map((item) => ({
    name: item.full_name,
    Comments: item.comments_added,
    Calls: item.calls_started,
    Opens: item.unique_leads_opened,
  }));
  const trendRows = data?.trends || [];
  const hasDailyMovement = trendRows.some((row) =>
    Number(row.leads_assigned || 0) > 0 ||
    Number(row.comments_added || 0) > 0 ||
    Number(row.calls_started || 0) > 0 ||
    Number(row.followups_created || 0) > 0 ||
    Number(row.followups_attended || 0) > 0 ||
    Number(row.unique_leads_opened || 0) > 0
  );
  const hasTopUsersData = topUsers.some((row) =>
    Number(row.Comments || 0) > 0 ||
    Number(row.Calls || 0) > 0 ||
    Number(row.Opens || 0) > 0
  );
  const tableTotals = visibleUsers.reduce(
    (acc, item) => {
      acc.leads_assigned += Number(item.leads_assigned || 0);
      acc.fresh_leads += Number(item.fresh_leads || 0);
      acc.cool_leads += Number(item.cool_leads || 0);
      acc.reassigned_leads += Number(item.reassigned_leads || 0);
      acc.reassignments_made += Number(item.reassignments_made || 0);
      acc.read_leads += Number(item.read_leads || 0);
      acc.unread_leads += Number(item.unread_leads || 0);
      acc.total_unread_leads += Number(item.total_unread_leads || 0);
      acc.comments_added += Number(item.comments_added || 0);
      acc.calls_started += Number(item.calls_started || 0);
      acc.unique_leads_opened += Number(item.unique_leads_opened || 0);
      acc.lead_open_events += Number(item.lead_open_events || 0);
      acc.followups_created += Number(item.followups_created || 0);
      acc.followups_attended += Number(item.followups_attended || 0);
      acc.overdue_followups += Number(item.overdue_followups || 0);
      acc.work_score += Number(item.work_score || 0);
      return acc;
    },
    {
      leads_assigned: 0,
      fresh_leads: 0,
      cool_leads: 0,
      reassigned_leads: 0,
      reassignments_made: 0,
      read_leads: 0,
      unread_leads: 0,
      total_unread_leads: 0,
      comments_added: 0,
      calls_started: 0,
      unique_leads_opened: 0,
      lead_open_events: 0,
      followups_created: 0,
      followups_attended: 0,
      overdue_followups: 0,
      work_score: 0,
    }
  );

  const selectMetric = (type: DetailType, item: SuperAdminUser) => {
    setSelected({ type, username: item.username, fullName: item.full_name });
    setSelectedUser(item);
  };

  const openUserDetails = (item: SuperAdminUser) => {
    setSelectedUser(item);
  };

  const updateFrom = (date: string) => {
    setFrom(date);
    setSelected(null);
    setSelectedSummary(null);
    setSelectedUser(null);
    setSelectedLead(null);
  };

  const updateTo = (date: string) => {
    setTo(date);
    setSelected(null);
    setSelectedSummary(null);
    setSelectedUser(null);
    setSelectedLead(null);
  };

  const buildActiveUserExportRows = () => [
    ...visibleUsers.map((item) => ({
      User: item.full_name,
      Username: item.username,
      Assigned: item.leads_assigned,
      Fresh: item.fresh_leads,
      Cool: item.cool_leads,
      Reassigned: item.reassigned_leads,
      'Assigned By Them': item.reassignments_made,
      Read: item.read_leads,
      Unread: item.unread_leads,
      'Total Unread': item.total_unread_leads,
      Comments: item.comments_added,
      Calls: item.calls_started,
      'Unique Opens': item.unique_leads_opened,
      'Raw Opens': item.lead_open_events,
      'Follow-ups Created': item.followups_created,
      'Follow-ups Attended': item.followups_attended,
      'Follow-ups Due': item.followups_due,
      Overdue: item.overdue_followups,
      Score: item.work_score,
      Status: item.status,
      'Last Activity': item.last_activity_date || '',
      'Inactive Days': item.inactive_days ?? '',
      'Inactive Reason': item.inactive_reason || '',
    })),
    {
      User: 'Total',
      Username: '',
      Assigned: tableTotals.leads_assigned,
      Fresh: tableTotals.fresh_leads,
      Cool: tableTotals.cool_leads,
      Reassigned: tableTotals.reassigned_leads,
      'Assigned By Them': tableTotals.reassignments_made,
      Read: tableTotals.read_leads,
      Unread: tableTotals.unread_leads,
      'Total Unread': tableTotals.total_unread_leads,
      Comments: tableTotals.comments_added,
      Calls: tableTotals.calls_started,
      'Unique Opens': tableTotals.unique_leads_opened,
      'Raw Opens': tableTotals.lead_open_events,
      'Follow-ups Created': tableTotals.followups_created,
      'Follow-ups Attended': tableTotals.followups_attended,
      'Follow-ups Due': '',
      Overdue: tableTotals.overdue_followups,
      Score: tableTotals.work_score,
      Status: '',
      'Last Activity': '',
      'Inactive Days': '',
      'Inactive Reason': '',
    },
  ];

  const buildReassignmentExportRows = () => reassignmentGroups.flatMap((group) =>
    group.recipients.map((recipient) => ({
      'Assigned By': group.assigned_by_full_name,
      'Assigned By Username': group.assigned_by,
      'Assigned To': recipient.assigned_to_full_name,
      'Assigned To Username': recipient.assigned_to,
      'Lead Count': recipient.assigned_count,
      'Latest Assigned Day': recipient.latest_assigned_day || '',
    }))
  );

  const exportFilename = (extension: string) => `super-admin-dashboard-${from}-to-${to}.${extension}`;

  const downloadCsv = () => {
    const activeRows = buildActiveUserExportRows();
    const reassignmentRows = buildReassignmentExportRows();
    const content = [
      ['ProSale Super Admin Dashboard'].map(csvCell).join(','),
      ['From', from, 'To', to, 'Exported At', new Date().toLocaleString()].map(csvCell).join(','),
      '',
      ['Every active user'].map(csvCell).join(','),
      rowsToCsv(activeRows),
      '',
      ['Reassigned lead handoff'].map(csvCell).join(','),
      rowsToCsv(reassignmentRows),
    ].join('\n');

    downloadTextFile(content, exportFilename('csv'), 'text/csv;charset=utf-8');
  };

  const downloadExcel = () => {
    const activeRows = buildActiveUserExportRows();
    const reassignmentRows = buildReassignmentExportRows();
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { font-size: 20px; }
            h2 { margin-top: 24px; font-size: 16px; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 18px; }
            th, td { border: 1px solid #d9d9d9; padding: 8px; font-size: 12px; }
            th { background: #f3f4f6; font-weight: 700; }
          </style>
        </head>
        <body>
          <h1>ProSale Super Admin Dashboard</h1>
          <p>From: ${htmlCell(from)} | To: ${htmlCell(to)} | Exported At: ${htmlCell(new Date().toLocaleString())}</p>
          ${rowsToHtmlTable('Every active user', activeRows)}
          ${rowsToHtmlTable('Reassigned lead handoff', reassignmentRows)}
        </body>
      </html>
    `;

    downloadTextFile(html, exportFilename('xls'), 'application/vnd.ms-excel;charset=utf-8');
  };

  const downloadPdf = () => {
    const activeRows = buildActiveUserExportRows();
    const reassignmentRows = buildReassignmentExportRows();
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    reportWindow.document.write(`
      <html>
        <head>
          <title>ProSale Super Admin Dashboard</title>
          <style>
            @page { size: landscape; margin: 12mm; }
            body { font-family: Arial, sans-serif; color: #111827; }
            h1 { font-size: 22px; margin: 0 0 6px; }
            h2 { margin-top: 22px; font-size: 15px; }
            p { color: #4b5563; font-size: 12px; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 16px; page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            th, td { border: 1px solid #d1d5db; padding: 6px; font-size: 10px; text-align: left; }
            th { background: #f3f4f6; font-weight: 700; }
          </style>
        </head>
        <body>
          <h1>ProSale Super Admin Dashboard</h1>
          <p>From: ${htmlCell(from)} | To: ${htmlCell(to)} | Exported At: ${htmlCell(new Date().toLocaleString())}</p>
          ${rowsToHtmlTable('Every active user', activeRows)}
          ${rowsToHtmlTable('Reassigned lead handoff', reassignmentRows)}
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  return (
    <section className={cn('col-span-full space-y-5', className)}>
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-rose-600">Super admin control</div>
            <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Daily sales command dashboard</h2>
            <p className="mt-1 text-sm text-gray-500">
              Every active user, every lead movement, comments, calls, follow-ups, and unique lead opens.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:items-end">
            <label className="text-xs font-semibold text-gray-500">
              From
              <input
                type="date"
                value={from}
                onChange={(event) => updateFrom(event.target.value)}
                className="mt-1 block rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </label>
            <label className="text-xs font-semibold text-gray-500">
              To
              <input
                type="date"
                value={to}
                onChange={(event) => updateTo(event.target.value)}
                className="mt-1 block rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </label>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setSelectedSummary({ key: card.key, label: card.label, hint: card.hint })}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-white hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-900"
              >
                <span className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${card.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="text-2xl font-black text-gray-900 dark:text-white">
                  {loading ? '-' : number(summary[card.key])}
                </div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{card.label}</div>
                <div className="text-xs text-gray-500">{card.hint}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Daily movement</h3>
            <p className="text-sm text-gray-500">Leads, comments, calls, follow-ups, and unique opens by date.</p>
          </div>
          <div className="h-[320px]">
            {hasDailyMovement ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendRows}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="leads_assigned" name="Leads" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="comments_added" name="Comments" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="calls_started" name="Calls" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="unique_leads_opened" name="Unique opens" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800">
                No lead movement, comments, calls, follow-ups, or opens found for this date range.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Top active users</h3>
            <p className="text-sm text-gray-500">Click the table below for exact user details.</p>
          </div>
          <div className="h-[320px]">
            {hasTopUsersData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topUsers}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={70} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Comments" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Calls" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Opens" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800">
                No active-user activity found for this date range.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-3 font-bold text-gray-900 dark:text-white">Most comments</h3>
            <div className="space-y-3">
              {visibleTopCommenters.slice(0, 6).map((item) => (
                <button
                  key={item.username}
                  type="button"
                  onClick={() => selectMetric('comments', item)}
                  className="flex w-full items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-left hover:bg-emerald-50 dark:bg-gray-800"
                >
                  <span>
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">{item.full_name}</span>
                    <span className="text-xs text-gray-500">Score {item.work_score}</span>
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    {number(item.comments_added)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-3 font-bold text-gray-900 dark:text-white">Needs attention</h3>
            <div className="space-y-3">
              {visibleAttentionUsers.slice(0, 6).map((item) => (
                <div key={item.username} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800">
                  <span>
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">{item.full_name}</span>
                    <span className="text-xs text-gray-500">
                      {item.total_unread_leads} unread | {item.overdue_followups} overdue
                    </span>
                  </span>
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
                    {item.status === 'active' ? 'Review' : 'Low'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm dark:border-rose-900/40 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-rose-600">Not working</div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  No activity {data?.inactiveThresholdDays || 2}+ days
                </h3>
              </div>
              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
                {number(visibleInactiveUsers.length)}
              </span>
            </div>
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {visibleInactiveUsers.map((item) => (
                <button
                  key={item.username}
                  type="button"
                  onClick={() => openUserDetails(item)}
                  className="flex w-full items-center justify-between rounded-xl bg-rose-50 px-3 py-2 text-left hover:bg-rose-100 dark:bg-rose-950/30"
                >
                  <span>
                    <span className="block text-sm font-semibold text-rose-900 dark:text-rose-100">{item.full_name}</span>
                    <span className="text-xs text-rose-600">
                      {item.inactive_reason || 'No tracked activity'}
                    </span>
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-gray-900">
                    {item.inactive_days === null || item.inactive_days === undefined ? 'No data' : `${item.inactive_days}d`}
                  </span>
                </button>
              ))}
              {!visibleInactiveUsers.length ? (
                <div className="rounded-xl bg-gray-50 px-3 py-3 text-sm text-gray-500 dark:bg-gray-800">
                  No inactive users found.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <DetailPanel
          data={data}
          selected={selected}
          onClose={() => setSelected(null)}
          onLeadOpen={(lead) => setSelectedLead(lead)}
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Every active user</h3>
            <p className="text-sm text-gray-500">
              Read/unread leads, fresh/cool data, comments, calls, opens, and follow-ups for the selected day/range.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={downloadCsv}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-100"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={downloadExcel}
              disabled={loading}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Excel
            </button>
            <button
              type="button"
              onClick={downloadPdf}
              disabled={loading}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              PDF
            </button>
            <div className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800">
              {loading ? 'Loading...' : `${visibleUsers.length} users`}
            </div>
          </div>
        </div>

        <div className="overflow-auto rounded-xl border border-gray-100 dark:border-gray-700">
          <table className="w-full min-w-[1380px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 text-center">Assigned</th>
                <th className="px-4 py-3 text-center">Fresh</th>
                <th className="px-4 py-3 text-center">Cool</th>
                <th className="px-4 py-3 text-center">Reassigned</th>
                <th className="px-4 py-3 text-center">Read</th>
                <th className="px-4 py-3 text-center">Unread</th>
                <th className="px-4 py-3 text-center">Comments</th>
                <th className="px-4 py-3 text-center">Calls</th>
                <th className="px-4 py-3 text-center">Unique Opens</th>
                <th className="px-4 py-3 text-center">Follow-ups C/A</th>
                <th className="px-4 py-3 text-center">Overdue</th>
                <th className="px-4 py-3 text-center">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {visibleUsers.map((item) => (
                <tr
                  key={item.user_id || item.username}
                  onClick={() => openUserDetails(item)}
                  className={cn(
                    'cursor-pointer hover:bg-gray-50/70 dark:hover:bg-gray-800',
                    item.is_inactive_attention && 'bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/20'
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{item.full_name}</span>
                      {item.is_inactive_attention ? (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700">
                          Not working
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-gray-500">{item.username}</div>
                    {item.is_inactive_attention ? (
                      <div className="text-xs font-semibold text-rose-600">
                        {item.inactive_reason || 'No tracked activity'}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">{number(item.leads_assigned)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', item.fresh_leads ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500')}>
                      {number(item.fresh_leads)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', item.cool_leads ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500')}>
                      {number(item.cool_leads)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', item.reassigned_leads ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-500')}>
                      {number(item.reassigned_leads)}
                    </span>
                    <div className="text-[10px] text-gray-400">{number(item.reassignments_made)} by them</div>
                  </td>
                  <td className="px-4 py-3 text-center text-blue-600">{number(item.read_leads)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', item.unread_leads ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-500')}>
                      {number(item.unread_leads)}
                    </span>
                    <div className="text-[10px] text-gray-400">{number(item.total_unread_leads)} total</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        selectMetric('comments', item);
                      }}
                      className="font-bold text-emerald-600 hover:underline"
                    >
                      {number(item.comments_added)}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        selectMetric('calls', item);
                      }}
                      className="font-bold text-amber-600 hover:underline"
                    >
                      {number(item.calls_started)}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        selectMetric('opens', item);
                      }}
                      className="font-bold text-violet-600 hover:underline"
                    >
                      {number(item.unique_leads_opened)}
                    </button>
                    <div className="text-[10px] text-gray-400">{number(item.lead_open_events)} raw</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        selectMetric('followups', item);
                      }}
                      className="font-bold text-gray-900 hover:underline dark:text-white"
                    >
                      {number(item.followups_created)} / {number(item.followups_attended)}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', item.overdue_followups ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-500')}>
                      {number(item.overdue_followups)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-black">{number(item.work_score)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-gray-200 bg-gray-50 text-sm font-black text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <tr>
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-center">{number(tableTotals.leads_assigned)}</td>
                <td className="px-4 py-3 text-center text-emerald-600">{number(tableTotals.fresh_leads)}</td>
                <td className="px-4 py-3 text-center text-amber-600">{number(tableTotals.cool_leads)}</td>
                <td className="px-4 py-3 text-center">
                  {number(tableTotals.reassigned_leads)}
                  <div className="text-[10px] font-semibold text-gray-500">{number(tableTotals.reassignments_made)} by them</div>
                </td>
                <td className="px-4 py-3 text-center text-blue-600">{number(tableTotals.read_leads)}</td>
                <td className="px-4 py-3 text-center text-rose-600">
                  {number(tableTotals.unread_leads)}
                  <div className="text-[10px] font-semibold text-gray-500">{number(tableTotals.total_unread_leads)} total</div>
                </td>
                <td className="px-4 py-3 text-center text-emerald-600">{number(tableTotals.comments_added)}</td>
                <td className="px-4 py-3 text-center text-amber-600">{number(tableTotals.calls_started)}</td>
                <td className="px-4 py-3 text-center text-violet-600">
                  {number(tableTotals.unique_leads_opened)}
                  <div className="text-[10px] font-semibold text-gray-500">{number(tableTotals.lead_open_events)} raw</div>
                </td>
                <td className="px-4 py-3 text-center">{number(tableTotals.followups_created)} / {number(tableTotals.followups_attended)}</td>
                <td className="px-4 py-3 text-center text-rose-600">{number(tableTotals.overdue_followups)}</td>
                <td className="px-4 py-3 text-center">{number(tableTotals.work_score)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Reassigned lead handoff</h3>
            <p className="text-sm text-gray-500">Who reassigned leads, how many they assigned, and which user received them.</p>
          </div>
          <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40">
            {loading ? 'Loading...' : `${number(data?.summary?.reassignments_made)} assigned by users`}
          </div>
        </div>

        {reassignmentGroups.length ? (
          <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
            {reassignmentGroups.map((group) => (
              <div key={group.assigned_by} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-indigo-600">Assigned by</div>
                    <div className="font-bold text-gray-900 dark:text-white">{group.assigned_by_full_name}</div>
                    <div className="text-xs text-gray-500">{group.assigned_by}</div>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-sm font-black text-indigo-600 dark:bg-gray-900">
                    {number(group.total_assigned)} leads
                  </div>
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {[...group.recipients]
                    .sort((a: ReassignmentBreakdown, b: ReassignmentBreakdown) => Number(b.assigned_count || 0) - Number(a.assigned_count || 0))
                    .map((recipient: ReassignmentBreakdown) => {
                      const recipientUser = visibleUsers.find((item) => item.username === recipient.assigned_to);
                      const content = (
                        <>
                          <span>
                            <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                              To {recipient.assigned_to_full_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {recipient.assigned_to} | Latest {recipient.latest_assigned_day || '-'}
                            </span>
                          </span>
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950/50">
                            {number(recipient.assigned_count)}
                          </span>
                        </>
                      );

                      return recipientUser ? (
                        <button
                          key={`${group.assigned_by}-${recipient.assigned_to}`}
                          type="button"
                          onClick={() => openUserDetails(recipientUser)}
                          className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-left hover:bg-indigo-50 dark:bg-gray-900 dark:hover:bg-gray-950"
                        >
                          {content}
                        </button>
                      ) : (
                        <div
                          key={`${group.assigned_by}-${recipient.assigned_to}`}
                          className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 dark:bg-gray-900"
                        >
                          {content}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-gray-700">
            No reassigned leads found for the selected date/range.
          </div>
        )}
      </div>

      <SummaryDetailModal
        data={data}
        selected={selectedSummary}
        onClose={() => setSelectedSummary(null)}
        onLeadOpen={(lead) => setSelectedLead(lead)}
      />
      <UserActivityModal
        data={data}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onLeadOpen={(lead) => setSelectedLead(lead)}
      />
      <LeadDetailModal data={data} lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </section>
  );
}
