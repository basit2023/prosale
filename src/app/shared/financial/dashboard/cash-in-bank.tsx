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
    amount: 70,
  },
  {
    label: 'Tue',
    amount: 72,
  },
  {
    label: 'Thu',
    amount: 75,
  },
  {
    label: 'Wed',
    amount: 78,
  },
  {
    label: 'Fri',
    amount: 82,
  },
  {
    label: 'Sat',
    amount: 78,
  },
  {
    label: 'Sun',
    amount: 87,
  },
];

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

export default function CashInBank({ className }: { className?: string }) {
  const isTablet = useMedia('(max-width: 800px)', false);

  return (
    <WidgetCard
      title="Cash in Bank"
      titleClassName="text-gray-700 font-normal sm:text-base font-inter"
      headerClassName="items-center"
      action={
        <DropdownAction
          className="rounded-md border"
          options={viewOptions}
          onChange={() => null}
        />
      }
      className={cn('min-h-[28rem]', className)}
    >
      <div className="mb-4 mt-3 flex items-center gap-2">
        <span className="font-lexend text-[30px] font-bold text-gray-900">
          $750.45k
        </span>
        <span className="flex items-center gap-1 text-green-dark">
          <TrendingUpIcon className="h-auto w-5" />
          <span className="font-semibold"> +32.40%</span>
        </span>
      </div>
      <SimpleBar>
        <div className="h-[27.3rem] w-full pt-9 @lg:pt-8">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isTablet && { minWidth: '500px' })}
          >
            <ComposedChart
              data={data}
              margin={{
                left: -19,
                top: 27,
              }}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.xAxis]:translate-y-2 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_path.recharts-rectangle]:!stroke-none"
            >
              <defs>
                <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3CBA92" stopOpacity={1} />
                  <stop offset="95%" stopColor="#0BA360" stopOpacity={1} />
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
              <Tooltip
                content={
                  <CustomTooltip className="[&_.chart-tooltip-item:last-child]:hidden" />
                }
                cursor={false}
              />
              <Bar
                dataKey="amount"
                fill='url("#bar")'
                barSize={39}
                radius={10}
                stroke="#0BA360"
              />
              <Line
                dataKey="amount"
                className="-translate-y-3"
                stroke="#FFE38F"
                strokeWidth={3}
                activeDot={false}
                dot={<CustomizedDot />}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
}

function CustomizedDot(props: any) {
  const { cx, cy } = props;
  return (
    <svg
      x={cx - 10}
      y={cy - 7}
      width="15"
      height="14"
      viewBox="0 0 15 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="7.03906"
        cy="7"
        r="5.5"
        fill="#FF7B30"
        stroke="white"
        strokeWidth="3"
      />
    </svg>
  );
}
