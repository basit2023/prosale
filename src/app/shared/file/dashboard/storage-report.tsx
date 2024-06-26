import React, { useEffect, useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { Title } from '@/components/ui/text';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useMedia } from '@/hooks/use-media';
import SimpleBar from '@/components/ui/simplebar';
import apiService from '@/utils/apiService';

// Define the type/interface for the fetched data
interface LeadData {
  month: string;
  employee1?: { name: string; lead_count: number };
  employee2?: { name: string; lead_count: number };
  employee3?: { name: string; lead_count: number };
  employee4?: { name: string; lead_count: number };
}

// Initial data for development or default display
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

// Custom Tooltip Component
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

export default function LeadReport({ className }: { className?: string }) {
  const isMobile = useMedia('(max-width: 768px)', false);
  const isDesktop = useMedia('(max-width: 1440px)', false);
  const is2xl = useMedia('(max-width: 1780px)', false);

  const [leadData, setLeadData] = useState<LeadData[]>(initialData);

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const response = await apiService.get('/top-leads'); // Replace with actual API endpoint
        const transformedData = transformData(response.data); // Transform fetched data
        
        setLeadData(transformedData);
      } catch (error) {
        console.error('Error fetching lead data:', error);
      }
    };

    fetchLeadData();
  }, []);

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

    for (const key in groupedByMonth) {
      transformed.push(groupedByMonth[key]);
    }

    return transformed;
  };

  return (
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
      action={
        <div className="hidden @2xl:block">
          {/* Action buttons or elements */}
        </div>
      }
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
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={<CustomYAxisTick />}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Bar dataKey="employee1.lead_count" name={"Top Employee"} fill="#8884d8" />
              <Bar dataKey="employee2.lead_count" name={"2nd Employee"} fill="#82ca9d" />
              <Bar dataKey="employee3.lead_count" name={"3rd Employee"} fill="#ffc658" />
              <Bar dataKey="employee4.lead_count" name={"4th Employee"} fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
}
