'use client';

import { useMemo } from 'react';

type ReassignmentRow = {
  assigned_by: string;
  assigned_by_full_name: string;
  assigned_to: string;
  assigned_to_full_name: string;
  assigned_count: number | string;
  latest_assigned_day?: string | null;
};

type ReassignmentGroup = {
  assigned_by: string;
  assigned_by_full_name: string;
  total_assigned: number;
  recipients: ReassignmentRow[];
};

const number = (value: unknown) => Number(value || 0);

export default function AdminReassignmentHandoff({
  data,
  loading,
}: {
  data?: any;
  loading?: boolean;
}) {
  const groups = useMemo(() => {
    const grouped = new Map<string, ReassignmentGroup>();

    (data?.ReassignmentBreakdown || []).forEach((row: ReassignmentRow) => {
      const key = row.assigned_by || 'Unknown';
      const current = grouped.get(key) || {
        assigned_by: key,
        assigned_by_full_name: row.assigned_by_full_name || key,
        total_assigned: 0,
        recipients: [],
      };

      current.total_assigned += number(row.assigned_count);
      current.recipients.push(row);
      grouped.set(key, current);
    });

    return Array.from(grouped.values()).sort((a, b) => b.total_assigned - a.total_assigned);
  }, [data?.ReassignmentBreakdown]);

  return (
    <section className="col-span-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Reassigned lead handoff</h3>
          <p className="text-sm text-gray-500">Who reassigned leads today, how many they assigned, and which user received them.</p>
        </div>
        <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40">
          {loading ? 'Loading...' : `${number(data?.Reassignments_Made)} assigned by users`}
        </div>
      </div>

      {groups.length ? (
        <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={group.assigned_by} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-indigo-600">Assigned by</div>
                  <div className="font-bold text-gray-900 dark:text-white">{group.assigned_by_full_name}</div>
                  <div className="text-xs text-gray-500">{group.assigned_by}</div>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-sm font-black text-indigo-600 dark:bg-gray-900">
                  {group.total_assigned} leads
                </div>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {[...group.recipients]
                  .sort((a, b) => number(b.assigned_count) - number(a.assigned_count))
                  .map((recipient) => (
                    <div
                      key={`${group.assigned_by}-${recipient.assigned_to}`}
                      className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 dark:bg-gray-900"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                          To {recipient.assigned_to_full_name || recipient.assigned_to}
                        </span>
                        <span className="text-xs text-gray-500">
                          {recipient.assigned_to} | Latest {recipient.latest_assigned_day || '-'}
                        </span>
                      </span>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950/50">
                        {number(recipient.assigned_count)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-gray-700">
          No reassigned leads found today.
        </div>
      )}
    </section>
  );
}
