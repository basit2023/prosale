'use client';

import cn from '@/utils/class-names';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useScrollableSlider } from '@/hooks/use-scrollable-slider';
import { PiCaretLeftBold, PiCaretRightBold } from 'react-icons/pi';
import MetricCard from '@/components/cards/metric-card';
import CircleProgressBar from '@/components/charts/circle-progressbar';
import TrendingUpIcon from '@/components/icons/trending-up';
import TrendingDownIcon from '@/components/icons/trending-down';

type FileStatsType = {
  className?: string;
  data?: any;
  loading?: boolean;
};

const getProgressColor = (percentage: number) => {
  if (percentage < 33) return '#EE0000';
  if (percentage < 67) return '#FBBF24';
  return '#32CD32';
};

const getSlightFill = (percentage: number) => {
  if (percentage < 33) return '#fca5a5';
  if (percentage < 67) return '#fef08a';
  return '#d9f99d';
};

export function FileStatGrid({ className, data }: { className?: string; data?: any }) {
  const count = data;

  const filesStatData = [
    {
      id: 6,
      title: "Today's Leads",
      metric: count?.Today_Leads ?? 0,
      fill: '#3b82f6',
      slightfill: '#dbeafe',
      percentage: 100,
      increased: true,
      decreased: false,
      value: '100',
      timePeriod: 'today'
    },
    {
      id: 7,
      title: 'Unread Leads',
      metric: count?.Unread_Leads ?? 0,
      fill: '#ef4444',
      slightfill: '#fee2e2',
      percentage: 100,
      increased: false,
      decreased: true,
      value: '0',
      timePeriod: 'total'
    },
    {
      id: 8,
      title: 'Follow-ups (C/A)',
      metric: `${count?.FollowUps_Created ?? 0} / ${count?.FollowUps_Attended ?? 0}`,
      fill: '#f59e0b',
      slightfill: '#fef3c7',
      percentage: count?.FollowUps_Created ? Math.round((count.FollowUps_Attended / count.FollowUps_Created) * 100) : 0,
      increased: true,
      decreased: false,
      value: count?.FollowUps_Created ? Math.round((count.FollowUps_Attended / count.FollowUps_Created) * 100) : '0',
      timePeriod: 'today'
    },
    {
      id: 1,
      title: 'Connected Calls',
      metric: count?.Total_Connected_Calls ?? count?.Total_Calls ?? 0,
      fill: getProgressColor(count?.TotalCallsPercentage ?? 0),
      slightfill: getSlightFill(count?.TotalCallsPercentage ?? 0),
      percentage: count?.TotalCallsPercentage ?? 0,
      increased: true,
      decreased: false,
      value: count?.TotalCallsPercentage ?? '0.00',
      timePeriod: 'today'
    },
    {
      id: 10,
      title: 'Dialed Calls',
      metric: count?.Total_Dialed_Calls ?? 0,
      fill: '#fb923c',
      slightfill: '#ffedd5',
      percentage: 100,
      increased: true,
      decreased: false,
      value: '100',
      timePeriod: 'today'
    },
    {
      id: 2,
      title: 'Total Leads',
      metric: count?.Total_Leads,
      fill: '#32CD32',
      slightfill: '#d9f99d',
      percentage: count?.LastMonthLeadsPercentage,
      increased: true,
      decreased: false,
      value: count?.LastMonthLeadsPercentage ?? '0.00',
      timePeriod: 'last month'
    },
    {
      id: 3,
      title: 'Closed Leads',
      metric: count?.Close_Leads,
      fill: '#FBBF24',
      slightfill: '#fef08a',
      percentage: count?.LastMonthCloseLeadsPercentage,
      increased: false,
      decreased: true,
      value: count?.LastMonthCloseLeadsPercentage ?? '0.00',
      timePeriod: 'last month'
    },
  ];

  return (
    <>
      {filesStatData.map((stat: any) => {
        const actualPercentage = stat.percentage ?? 0;
        const displayPercentage = actualPercentage > 0 ? actualPercentage : 1;
        const progressColor = stat.fill;
        const progressColor2 = stat.slightfill;

        return (
          <MetricCard
            key={stat.id}
            title={stat.title}
            metric={stat.metric}
            metricClassName="3xl:text-[22px]"
            className={cn('w-full max-w-full justify-between', className)}
            chart={
              <CircleProgressBar
                percentage={displayPercentage}
                size={80}
                stroke={progressColor2}
                strokeWidth={7}
                progressColor={progressColor}
                useParentResponsive={true}
                label={
                  <Text
                    as="span"
                    className="font-lexend text-base font-medium text-gray-700"
                  >
                    {actualPercentage}%
                  </Text>
                }
                strokeClassName="dark:stroke-gray-300"
              />
            }
          >
            <Text className="mt-3 flex items-center leading-none text-gray-500">
              <Text
                as="span"
                className={cn(
                  'me-2 inline-flex items-center font-medium',
                  stat.increased ? 'text-green' : 'text-red'
                )}
              >
                {stat.increased ? (
                  <TrendingUpIcon className="me-1 h-4 w-4" />
                ) : (
                  <TrendingDownIcon className="me-1 h-4 w-4" />
                )}
                {stat.value}%
              </Text>
              {stat.timePeriod}
            </Text>
          </MetricCard>
        );
      })}
    </>
  );
}

export default function FileStats({ className, data, loading }: FileStatsType) {
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  if (loading) {
    return (
      <div className={cn('relative flex w-auto items-center overflow-hidden', className)}>
        <div className="w-full overflow-hidden">
          <div className="grid grid-flow-col gap-5 overflow-x-auto 2xl:gap-6 3xl:gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="min-w-[292px] h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex w-auto items-center overflow-hidden',
        className
      )}
    >
      <Button
        title="Prev"
        variant="text"
        ref={sliderPrevBtn}
        onClick={() => scrollToTheLeft()}
        className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-black 3xl:hidden"
      >
        <PiCaretLeftBold className="h-5 w-5" />
      </Button>
      <div className="w-full overflow-hidden">
        <div
          ref={sliderEl}
          className="custom-scrollbar-x grid grid-flow-col gap-5 overflow-x-auto scroll-smooth 2xl:gap-6 3xl:gap-8"
        >
          <FileStatGrid className="min-w-[292px]" data={data} />
        </div>
      </div>
      <Button
        title="Next"
        variant="text"
        ref={sliderNextBtn}
        onClick={() => scrollToTheRight()}
        className="!absolute -right-0 top-0 z-10 !h-full w-20 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-black 3xl:hidden"
      >
        <PiCaretRightBold className="h-5 w-5" />
      </Button>
    </div>
  );
}
