'use client';

import WidgetCard from '@/components/cards/widget-card';
import cn from '@/utils/class-names';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import SimpleBar from '@/components/ui/simplebar';
import DropdownAction from '@/components/charts/dropdown-action';
import TrendingUpIcon from '@/components/icons/trending-up';

type Props = {
  className?: string;
};

const data = [
  {
    label: 'Jan',
    income: 665,
    outgoing: 454,
  },
  {
    label: 'Feb',
    income: 589,
    outgoing: 351,
  },
  {
    label: 'Mar',
    income: 470,
    outgoing: -100,
  },
  {
    label: 'Apr',
    income: 571,
    outgoing: -283,
  },
  {
    label: 'May',
    income: 1050,
    outgoing: 850,
  },
  {
    label: 'Jun',
    income: 750,
    outgoing: -190,
  },
  {
    label: 'Jul',
    income: 875,
    outgoing: 700,
  },
  {
    label: 'Aug',
    income: 568,
    outgoing: 410,
  },
  {
    label: 'Sep',
    income: 775,
    outgoing: 550,
  },
  {
    label: 'Oct',
    income: 680,
    outgoing: 488,
  },
  {
    label: 'Nov',
    income: 580,
    outgoing: 390,
  },
  {
    label: 'Dec',
    income: 438,
    outgoing: 250,
  },
];

const legend = [{ name: 'Income' }, { name: 'Outgoings' }];
const COLORS = ['#0BA360', '#cf233f'];
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

function CustomLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'mt-1.5 flex flex-wrap items-start gap-3 lg:gap-7',
        className
      )}
    >
      {legend.map((item, index) => (
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

export default function CashFlow({ className }: Props) {
  return (
    <WidgetCard
      title="Cash Flow"
      titleClassName="text-gray-700 font-normal sm:text-base font-inter"
      headerClassName="items-center"
      className={cn('min-h-[28rem]', className)}
      action={
        <div className="flex gap-5">
          <CustomLegend className="hidden @[28rem]:inline-flex" />
          <DropdownAction
            onChange={() => null}
            className="rounded-md border"
            options={viewOptions}
          />
        </div>
      }
    >
      <div className="mb-4 mt-3 flex items-center gap-2">
        <span className="font-lexend text-[30px] font-bold text-gray-900">
          $78.45k
        </span>
        <span className="flex items-center gap-1 text-green-dark">
          <TrendingUpIcon className="h-auto w-5" />
          <span className="font-semibold"> +52.40%</span>
        </span>
      </div>
      <div className="w-full lg:mt-7">
        <SimpleBar>
          <div className="h-[24rem] w-full pt-6 @lg:pt-8">
            <ResponsiveContainer width="100%" height="100%" minWidth={1450}>
              <ComposedChart
                barGap={8}
                data={data}
                margin={{
                  left: -20,
                  top: 20,
                }}
                className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-bar]:translate-x-4 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 [&_.recharts-cartesian-axis.yAxis]:translate-x-2.5 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-xAxis.xAxis]:translate-x-[14px] [&_.recharts-xAxis.xAxis]:translate-y-2.5 [&_path.recharts-rectangle]:!stroke-none"
              >
                <defs>
                  <linearGradient id="cashFlowBar1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3CBA92" stopOpacity={1} />
                    <stop offset="50%" stopColor="#0BA360" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="cashFlowBar2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f03554" stopOpacity={1} />
                    <stop offset="50%" stopColor="#cf233f" stopOpacity={1} />
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
                  dataKey="income"
                  fill='url("#cashFlowBar1")'
                  barSize={34}
                  radius={[10, 10, 0, 0]}
                  stroke="#0BA360"
                />
                <Bar
                  type="natural"
                  dataKey="outgoing"
                  fill='url("#cashFlowBar2")'
                  barSize={34}
                  radius={[10, 10, 0, 0]}
                  stroke="#cf233f"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SimpleBar>
      </div>
    </WidgetCard>
  );
}
