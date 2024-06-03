'use client';

import { useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Line,
} from 'recharts';
import { useMedia } from '@/hooks/use-media';
import SimpleBar from '@/components/ui/simplebar';
import DropdownAction from '@/components/charts/dropdown-action';
import cn from '@/utils/class-names';
import TrendingUpIcon from '@/components/icons/trending-up';

const data = [
  {
    label: 'Mon',
    revenue: 98,
    expenses: 80,
  },
  {
    label: 'Tue',
    revenue: 87,
    expenses: 49,
  },
  {
    label: 'Thu',
    revenue: 50,
    expenses: 86,
  },
  {
    label: 'Wed',
    revenue: 45,
    expenses: 68,
  },
  {
    label: 'Fri',
    revenue: 25,
    expenses: 38,
  },
  {
    label: 'Sat',
    revenue: 80,
    expenses: 59,
  },
  {
    label: 'Sun',
    revenue: 87,
    expenses: 48,
  },
];

const transactionLegend = [{ name: 'Revenue' }, { name: 'Expenses' }];
const COLORS = ['#0BA360', '#FF7A2F'];

const viewOptions = [
  {
    value: 'Daily',
    name: 'Daily',
  },
  {
    value: 'Monthly',
    name: 'Monthly',
  },
];

export default function TotalStatistics({ className }: { className?: string }) {
  const isTablet = useMedia('(max-width: 800px)', false);

  return (
    <WidgetCard
      title="Total Statistics"
      titleClassName="text-gray-700 font-normal sm:text-base font-inter"
      headerClassName="items-center"
      action={
        <div className="flex gap-5">
          <CustomLegend className="hidden @[28rem]:inline-flex" />
          <DropdownAction
            className="rounded-md border"
            options={viewOptions}
            onChange={() => null}
          />
        </div>
      }
      className={cn('min-h-[28rem] @container', className)}
    >
      <div className="mb-4 mt-3 flex items-center gap-2">
        <span className="font-lexend text-[30px] font-bold text-gray-900">
          $83.45k
        </span>
        <span className="flex items-center gap-1 text-green-dark">
          <TrendingUpIcon className="h-auto w-5" />
          <span className="font-semibold"> +32.40%</span>
        </span>
      </div>
      <SimpleBar>
        <div className="h-[24rem] w-full pt-6 @lg:pt-8">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isTablet && { minWidth: '1100px' })}
          >
            <ComposedChart
              barGap={8}
              data={data}
              margin={{
                left: -20,
                top: 20,
              }}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500  [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-xAxis.xAxis]:translate-y-2.5 [&_path.recharts-rectangle]:!stroke-none"
            >
              <defs>
                <linearGradient id="bar1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3CBA92" stopOpacity={1} />
                  <stop offset="95%" stopColor="#0BA360" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="bar2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F09819" stopOpacity={1} />
                  <stop offset="50%" stopColor="#FF7A2F" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeOpacity={0.435}
                strokeDasharray="8 10"
              />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(label) => `$${label}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar
                dataKey="revenue"
                fill='url("#bar1")'
                barSize={38}
                radius={10}
                stroke="#0BA360"
              />
              <Bar
                type="natural"
                dataKey="expenses"
                fill='url("#bar2")'
                barSize={38}
                radius={10}
                stroke="#F5A343"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
}

function CustomLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'mt-1.5 flex flex-wrap items-start gap-3 lg:gap-7',
        className
      )}
    >
      {transactionLegend.map((item, index) => (
        <div key={item.name} className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: COLORS[index] }}
          />
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
}
