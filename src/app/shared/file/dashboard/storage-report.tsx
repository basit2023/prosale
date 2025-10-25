'use client';

import React, { useEffect, useMemo, useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { Title } from '@/components/ui/text';
import { decryptData } from '@/components/encriptdycriptdata';
import QuickAccess from '@/app/shared/file/dashboard/quick-access';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RPieChart,
  Pie,
  Cell,
} from 'recharts';
import { useMedia } from '@/hooks/use-media';
import SimpleBar from '@/components/ui/simplebar';
import apiService from '@/utils/apiService';

// types
interface LeadData {
  month: string;
  employee1?: { name: string; lead_count: number };
  employee2?: { name: string; lead_count: number };
  employee3?: { name: string; lead_count: number };
  employee4?: { name: string; lead_count: number };
}

interface Summary {
  targetRevenue: number;
  achievedRevenue: number;
  _usersArray?: Array<{
    name?: string;
    full_name?: string;
    username?: string;
    employee?: string;
    email?: string;
    achievedRevenue?: number | string;
    targetRevenue?: number | string;
    achieved_revenue?: number | string;
    target_revenue?: number | string;
    achieved?: number | string;
    target?: number | string;
    [k: string]: any;
  }> | null;
}

const initialData: LeadData[] = [
  {
    month: 'Jan',
    employee1: { name: 'Tanzeel', lead_count: 7 },
    employee2: { name: 'hasratjabeen', lead_count: 6 },
    employee3: { name: 'zainabaziz', lead_count: 5 },
    employee4: { name: 'muhammadrafi', lead_count: 2 },
  },
];

function CustomYAxisTick({ x, y, payload }: any) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" className="fill-gray-500">
        {`${payload.value.toLocaleString()}`}
      </text>
    </g>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded shadow-lg">
        <p className="label">{`Month: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="intro">
            {`${entry.payload[`employee${index + 1}`]?.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Safely parse numbers from varied keys / formats
const readNum = (obj: any, keys: string[]) => {
  for (const k of keys) {
    const v = obj?.[k] ?? obj?.data?.[k];
    if (v !== undefined && v !== null) {
      const raw = Array.isArray(v) ? v[0] : v;
      const n = Number.parseFloat(typeof raw === 'string' ? raw.replace(/,/g, '') : raw);
      if (Number.isFinite(n)) return n;
    }
  }
  return 0;
};

// NEW: unwrap axios responses that look like { success, data }
const unwrap = (resp: any) => resp?.data?.data ?? resp?.data ?? resp;

export default function LeadReport({ className }: { className?: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isMobile = useMedia('(max-width: 768px)', false);
  const isDesktop = useMedia('(max-width: 1440px)', false);
  const is2xl = useMedia('(max-width: 1780px)', false);

  const [leadData, setLeadData] = useState<LeadData[]>(initialData);
  const [projects, setProjects] = useState<any[]>([]);
  const [userValue, setUserData] = useState<any>();

  const [summary, setSummary] = useState<Summary>({
    targetRevenue: 0,
    achievedRevenue: 0,
    _usersArray: null,
  });

  // redirect if not signed in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/signin');
    }
  }, [status, router]);

  // load local user data
  useEffect(() => {
    try {
      const encryptedData = localStorage.getItem('uData');
      if (encryptedData) {
        const data: any = decryptData(encryptedData);
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  useEffect(() => {
    if (!userValue || status !== 'authenticated') return;

    const fetchAll = async () => {
      try {
        // bar chart data
        const resLeads = await apiService.get(
          `/top-leads/?company_id=${userValue.user.company_id}`
        );
        setLeadData(transformData(resLeads.data));
      } catch (error) {
        console.error('Error fetching lead data:', error);
      }

      try {
        const resProjects = await apiService.get(
          `/projects/?company_id=${userValue.user.company_id}`
        );
        setProjects(resProjects.data);
      } catch (error) {
        console.error('Error fetching project data:', error);
      }

      try {
        // Role / permission
        const perm = Number((session?.user as any)?.permission ?? 0);
        const roleRaw =
          (session?.user as any)?.role ||
          (session?.user as any)?.user_type ||
          '';
        const role = String(roleRaw).toLowerCase();
        const id = encodeURIComponent((session?.user as any)?.id || '');

        let resSummary;
        if (perm >= 9) {
          // Admin: Fetch all users' data
          resSummary = await apiService.get(`/revenue-targets-dashbrod/?permission=${perm}`);
        } else if (perm >= 4 || role === 'manager') {
          // Manager: Fetch team members' data (includes self on backend as per your API)
          resSummary = await apiService.get(
            `/revenue-targets-dashbrod/?id=${id}&permission=${perm}&role=${role}`
          );
        } else {
          // Simple user: Fetch only their own data
          resSummary = await apiService.get(
            `/revenue-targets-dashbrod/?id=${id}&permission=${perm}&role=${role}`
          );
        }

        // >>> FIX: correctly unwrap payload for admin/manager/user
        const payload = unwrap(resSummary);

        // Accept either an array, {users: [...]}, or a single object
        const usersArray =
          Array.isArray(payload) ? payload :
          Array.isArray(payload?.users) ? payload.users :
          null;

        let target = 0;
        let achieved = 0;

        if (usersArray) {
          // Admin/Manager arrays
          for (const u of usersArray) {
            target += readNum(u, [
              'targetRevenue', 'target_revenue', 'total_target', 'revenue_target', 'target',
            ]);
            achieved += readNum(u, [
              'achievedRevenue', 'achieved_revenue', 'achieved_total', 'revenue_achieved', 'achieved',
            ]);
          }
        } else {
          // Single-user object
          target = readNum(payload, [
            'targetRevenue', 'target_revenue', 'total_target', 'revenue_target', 'target',
          ]);
          achieved = readNum(payload, [
            'achievedRevenue', 'achieved_revenue', 'achieved_total', 'revenue_achieved', 'achieved',
          ]);
        }

        setSummary({
          targetRevenue: target,
          achievedRevenue: achieved,
          _usersArray: usersArray ?? null,
        });
      } catch (error) {
        console.error('Error fetching targets summary:', error);
        setSummary({ targetRevenue: 0, achievedRevenue: 0, _usersArray: null });
      }
    };

    fetchAll();
  }, [userValue, status, session?.user]);

  const transformData = (data: any[]) => {
    const transformed: LeadData[] = [];
    const groupedByMonth: { [key: string]: LeadData } = {};

    data.forEach((item) => {
      const { month, employee, lead_count } = item;
      if (!groupedByMonth[month]) {
        groupedByMonth[month] = { month };
      }
      if (!groupedByMonth[month].employee1) {
        groupedByMonth[month].employee1 = { name: employee, lead_count };
      } else if (!groupedByMonth[month].employee2) {
        groupedByMonth[month].employee2 = { name: employee, lead_count };
      } else if (!groupedByMonth[month].employee3) {
        groupedByMonth[month].employee3 = { name: employee, lead_count };
      } else if (!groupedByMonth[month].employee4) {
        groupedByMonth[month].employee4 = { name: employee, lead_count };
      }
    });

    for (const key in groupedByMonth) transformed.push(groupedByMonth[key]);
    return transformed;
  };

  // =========================
  // === Pie chart updates ===
  // =========================

  const perm = Number((session?.user as any)?.permission ?? 0);
  const roleRaw =
    (session?.user as any)?.role ||
    (session?.user as any)?.user_type ||
    '';
  const role = String(roleRaw).toLowerCase();

  const isAdmin = perm >= 9;
  const isManager = (perm >= 4 || role === 'manager') && !isAdmin;
  const currentEmail = (session?.user as any)?.email || '';

  const usersArray = summary._usersArray;

  const toNum = (v: any) => {
    const n = Number.parseFloat(
      typeof v === 'string' ? v.replace(/,/g, '') : v ?? '0'
    );
    return Number.isFinite(n) ? n : 0;
  };

  const perUser = useMemo(() => {
    if (!usersArray) return null;
    return usersArray.map((u: any, i: number) => {
      const name =
        u?.name || u?.full_name || u?.username || u?.employee || u?.email || `User ${i + 1}`;
      const email = u?.email || '';
      const achieved =
        toNum(u?.achievedRevenue ?? u?.achieved ?? u?.achieved_revenue ?? u?.revenue_achieved);
      const target =
        toNum(u?.targetRevenue ?? u?.target ?? u?.target_revenue ?? u?.revenue_target);
      return { name, email, achieved, target };
    });
  }, [usersArray]);

  const percentage = useMemo(() => {
    const { targetRevenue, achievedRevenue } = summary;
    if (!targetRevenue) return 0;
    return Math.min(100, Math.max(0, (achievedRevenue / targetRevenue) * 100));
  }, [summary]);

  const palette = [
    '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7',
    '#84cc16', '#eab308', '#fb7185', '#10b981', '#f97316', '#60a5fa'
  ];
  const remainingColor = '#e5e7eb';

  const pieDataUser = useMemo(() => {
    const target = Math.max(0, summary.targetRevenue);
    const achieved = Math.max(0, Math.min(summary.achievedRevenue, target));
    const remaining = Math.max(0, target - achieved);

    if (target === 0 && achieved === 0) {
      return [{ name: 'No Data', value: 1, color: remainingColor }];
    }

    const pct = target ? (achieved / target) * 100 : 0;
    const achievedColor = pct >= 100 ? '#16a34a' : pct >= 50 ? '#f59e0b' : '#ef4444';

    return [
      { name: 'Achieved', value: achieved, color: achievedColor },
      { name: 'Remaining', value: remaining, color: remainingColor },
    ];
  }, [summary]);

  const pieDataManager = useMemo(() => {
    if (!perUser) return [{ name: 'No Data', value: 1, color: remainingColor }];

    let mine = 0;
    const teamData = [];

    for (const u of perUser) {
      if (u.email && currentEmail && u.email.toLowerCase() === currentEmail.toLowerCase()) {
        mine += u.achieved;
      } else {
        teamData.push({
          name: u.name,
          value: u.achieved,
          color: palette[teamData.length % palette.length], // Assign colors dynamically
        });
      }
    }

    if (mine === 0 && teamData.length === 0) {
      return [{ name: 'No Data', value: 1, color: remainingColor }];
    }

    return [
      { name: 'You (Manager)', value: mine, color: '#16a34a' },
      ...teamData, // Add individual team members' data
    ];
  }, [perUser, currentEmail]);

  const pieDataAdmin = useMemo(() => {
    if (!perUser) return [{ name: 'No Data', value: 1, color: remainingColor }];

    const data = perUser
      .map((u, i) => ({
        name: u.name,
        value: Math.max(0, u.achieved),
        color: palette[i % palette.length],
      }))
      .filter((d) => d.value > 0);

    if (data.length === 0) {
      return [{ name: 'No Data', value: 1, color: remainingColor }];
    }

    return data;
  }, [perUser]);

  const pieData = isAdmin ? pieDataAdmin : isManager ? pieDataManager : pieDataUser;

  if (status === 'loading') return null;

  const displayName =
    userValue?.user ? `${userValue.user.first_name} ${userValue.user.last_name}` : 'User';

  const handleEditProfileClick = () => {
    if (perm >= 9) {
      console.log('Admin view');
    } else if (isManager) {
      console.log('Manager view');
    } else {
      console.log('User view');
    }
  };

  return (
    <>
     
      <div className="flex">
        <WidgetCard
          title="Target vs Achieved"
          titleClassName="font-normal text-gray-700 sm:text-base font-inter"
          description={
            <div className="flex items-center justify-start">
              <Title as="h2" className="me-2 font-semibold">
                {percentage.toFixed(1)}% Achieved
              </Title>
            </div>
          }
          descriptionClassName="text-gray-500 mt-1.5"
          className={className}
        >
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs text-gray-500">Target</div>
                <div className="font-semibold">
                  {summary.targetRevenue.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Achieved</div>
                <div className="font-semibold">
                  {summary.achievedRevenue.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Progress</div>
                <div className="font-semibold">{percentage.toFixed(1)}%</div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {pieData.map((slice: any, idx: number) => (
                      <Cell key={`cell-${idx}`} fill={slice.color} />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value: any, _name: any, entry: any) => {
                      const v = Number(value) || 0;
                      return [v.toLocaleString(), entry?.payload?.name || ''];
                    }}
                  />
                  <Legend verticalAlign="bottom" height={24} />
                </RPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </WidgetCard>
      </div>
       {/* Lead Report (Bar) */}
       <div className='flex mt-5'>
      <WidgetCard
        title={'Lead Report'}
        titleClassName="font-normal text-gray-700 sm:text-base font-inter"
        description={
          <div className="flex items-center justify-start">
            <Title as="h2" className="me-2 font-semibold">
              Lead Count by Month
            </Title>
          </div>
        }
        descriptionClassName="text-gray-500 mt-1.5"
        action={<div className="hidden @2xl:block" />}
        className={className}
      >
        <SimpleBar>
          <div className="h-96 w-full pt-9">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={leadData}
                barSize={isMobile ? 16 : isDesktop ? 28 : is2xl ? 32 : 46}
                margin={{ left: 16 }}
                className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
              >
                <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tick={<CustomYAxisTick />} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="employee1.lead_count" name="Top Employee" fill="#8884d8" />
                <Bar dataKey="employee2.lead_count" name="2nd Employee" fill="#82ca9d" />
                <Bar dataKey="employee3.lead_count" name="3rd Employee" fill="#ffc658" />
                <Bar dataKey="employee4.lead_count" name="4th Employee" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SimpleBar>
      </WidgetCard>
       </div>
      {/* Target vs Achieved (Pie) */}
      <QuickAccess />
    </>
  );
}
