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
import { routes } from '@/config/routes';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import apiService from '@/utils/apiService';
import toast from 'react-hot-toast';

type FileStatsType = {
  className?: string;
};

export function FileStatGrid({ className }: { className?: string }) {
  const { data: session } = useSession();
  const [count, setCount] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get(`/total-items`);
        const userData = response.data.data;
        setCount(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const filesStatData = [
    {
      id: 1,
      title: 'Total Leads',
      metric: count?.Total_Leads,
      fill: '#32CD32',
      slightfill:'#d9f99d',
      percentage: count?.LastMonthLeadsPercentage,
      increased: true,
      decreased: false,
      value: `+${count?.LastMonthLeadsPercentage}`,
    },
    {
      id: 2,
      title: 'Closed Leads',
      metric: count?.Close_Leads,
      fill: '#FBBF24',
      slightfill:'#fef08a',
      percentage: count?.LastMonthCloseLeadsPercentage,
      increased: false,
      decreased: true,
      value: `-${count?.LastMonthCloseLeadsPercentage}`,
    },
    {
      id: 3,
      title: 'Total Employees',
      metric: count?.Total_Employee,
      fill: '#EE0000',
      slightfill:'#fca5a5',
      percentage: count?.TotalNewEmployeesPercentage,
      increased: true,
      decreased: false,
      value: `+${count?.TotalNewEmployeesPercentage}`,
    },
    {
      id: 4,
      title: 'Active Projects',
      metric: count?.Total_Projects,
      fill: '#3872FA',
      slightfill:'#93c5fd',
      percentage: 54,
      increased: true,
      decreased: false,
      value: '+14.45',
    },
  ];

  const router = useRouter();
  if (!session) {
    router.push(routes.signIn);
    return null;
  }

  return (
    <>
      {filesStatData.map((stat: any) => {
        const actualPercentage = stat.percentage ?? 0;
        const displayPercentage = actualPercentage > 0 ? actualPercentage : 1;
        const progressColor = stat.fill;
        const progressColor2=stat.slightfill;

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
              last month
            </Text>
          </MetricCard>
        );
      })}
    </>
  );
}

export default function FileStats({ className }: FileStatsType) {
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

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
          <FileStatGrid className="min-w-[292px]" />
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
