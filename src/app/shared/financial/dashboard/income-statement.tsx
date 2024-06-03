'use client';

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
import SimpleBar from '@/components/ui/simplebar';
import DropdownAction from '@/components/charts/dropdown-action';
import cn from '@/utils/class-names';
import TrendingUpIcon from '@/components/icons/trending-up';
import { Text } from '@/components/ui/text';

const data = [
  {
    label: 'Jan',
    revenue: 400,
    expense: 300,
    grossMargin: 280,
    netProfit: 300,
  },
  {
    label: 'Feb',
    revenue: 500,
    expense: 400,
    grossMargin: 300,
    netProfit: 350,
  },
  {
    label: 'Mar',
    revenue: 510,
    expense: 355,
    grossMargin: 410,
    netProfit: 210,
  },
  {
    label: 'Apr',
    revenue: 600,
    expense: 400,
    grossMargin: 550,
    netProfit: 450,
  },
  {
    label: 'May',
    revenue: 570,
    expense: 450,
    grossMargin: 350,
    netProfit: 400,
  },
  {
    label: 'Jun',
    revenue: 600,
    expense: 355,
    grossMargin: 480,
    netProfit: 455,
  },
  {
    label: 'Jul',
    revenue: 510,
    expense: 225,
    grossMargin: 410,
    netProfit: 350,
  },
  {
    label: 'Aug',
    revenue: 530,
    expense: 275,
    grossMargin: 330,
    netProfit: 370,
  },
  {
    label: 'Sep',
    revenue: 600,
    expense: 325,
    grossMargin: 370,
    netProfit: 490,
  },
  {
    label: 'Oct',
    revenue: 660,
    expense: 495,
    grossMargin: 400,
    netProfit: 365,
  },
  {
    label: 'Nov',
    revenue: 500,
    expense: 395,
    grossMargin: 300,
    netProfit: 450,
  },
  {
    label: 'Dec',
    revenue: 480,
    expense: 305,
    grossMargin: 400,
    netProfit: 300,
  },
];

const ticketStatus = [
  { name: 'Revenue' },
  { name: 'Expenses' },
  { name: 'Gross margin' },
  { name: 'Net Profit' },
];
const COLORS = ['#33933E', '#f03554', '#477DFF', '#FE9D00'];

const viewOptions = [
  {
    value: 'Yearly',
    name: 'Yearly',
  },
  {
    value: 'Daily',
    name: 'Daily',
  },
];

export default function IncomeStatement({ className }: { className?: string }) {
  return (
    <WidgetCard
      title="Income Statement"
      titleClassName="text-gray-700 font-normal sm:text-base font-inter"
      headerClassName="items-center"
      className={cn('min-h-[28rem]', className)}
      action={
        <div className="flex gap-5">
          <div className="hidden flex-wrap items-center gap-3 @[46rem]:inline-flex lg:gap-4">
            {ticketStatus.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <Text as="span">{item.name}</Text>
              </div>
            ))}
          </div>
          <DropdownAction
            className="rounded-md border"
            options={viewOptions}
            onChange={() => null}
          />
        </div>
      }
    >
      <div className="mb-4 mt-3 flex items-center gap-2">
        <Text
          as="span"
          className="font-lexend text-[30px] font-bold text-gray-900"
        >
          $800k
        </Text>
        <Text as="span" className="flex items-center gap-1 text-green-dark">
          <TrendingUpIcon className="h-auto w-5" />
          <Text as="span" className="font-semibold">
            {' '}
            +42.40%
          </Text>
        </Text>
      </div>
      <SimpleBar>
        <div className="h-[32rem] w-full pt-6 @lg:pt-8">
          <ResponsiveContainer width="100%" height="100%" minWidth="1800px">
            <ComposedChart
              data={data}
              barGap={10}
              margin={{
                left: 0,
                top: 20,
              }}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500  [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-xAxis.xAxis]:translate-y-2.5 [&_path.recharts-rectangle]:!stroke-none"
            >
              <CartesianGrid
                vertical={false}
                strokeOpacity={0.435}
                strokeDasharray="8 10"
              />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                // tick={<CustomYAxisTick />}
                tickFormatter={(label) => `$${label}k`}
              />
              <Tooltip
                content={
                  <CustomTooltip className="[&_.chart-tooltip-item:last-child]:hidden" />
                }
                cursor={false}
              />
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="100%"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="5%" stopColor="#3CBA92" stopOpacity={1} />
                  <stop offset="95%" stopColor="#0BA360" stopOpacity={1} />
                </linearGradient>
              </defs>
              <defs>
                <linearGradient
                  id="expenseGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="100%"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="5%" stopColor="#f3506b" stopOpacity={1} />
                  <stop offset="95%" stopColor="#b31f37" stopOpacity={1} />
                </linearGradient>
              </defs>
              <defs>
                <linearGradient
                  id="grossMarginGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="100%"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="5%" stopColor="#96C5FC" stopOpacity={1} />
                  <stop offset="95%" stopColor="#3b6ee6" stopOpacity={1} />
                </linearGradient>
              </defs>

              <Bar
                dataKey="revenue"
                stroke="#0BA360"
                fill="url(#revenueGradient)"
                barSize={28}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                type="natural"
                dataKey="expense"
                stroke="#cf233f"
                fill="url(#expenseGradient)"
                barSize={28}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                type="natural"
                dataKey="grossMargin"
                fill="url(#grossMarginGradient)"
                barSize={28}
                stroke="#477DFF"
                radius={[6, 6, 0, 0]}
              />
              <Line
                dataKey="netProfit"
                className="-translate-x-3 -translate-y-3"
                stroke="#FF7A2F"
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
        r="4.5"
        fill="#FF7A2F"
        stroke="#fff"
        strokeWidth="3"
      />
    </svg>
  );
}
