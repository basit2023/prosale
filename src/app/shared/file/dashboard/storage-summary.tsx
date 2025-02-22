'use client';

import { Title, Text } from '@/components/ui/text';
import WidgetCard from '@/components/cards/widget-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import apiService from '@/utils/apiService';
import React, { useEffect, useState } from 'react';
import { decryptData } from '@/components/encriptdycriptdata';

const COLORS = ['#BFDBFE', '#0070F3'];

function CustomLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, value } = props;
  const RADIAN = Math.PI / 180;
  const radius = 25 + innerRadius + (outerRadius - innerRadius);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <>
      <text
        x={cx}
        y={cy - 5}
        fill="#111111"
        className="recharts-text recharts-label"
        textAnchor="middle"
        dominantBaseline="central"
      >
        <tspan alignmentBaseline="middle" fontSize="36px">
          {value}
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 20}
        fill="#666666"
        className="recharts-text recharts-label"
        textAnchor="middle"
        dominantBaseline="central"
      >
        <tspan fontSize="14px">Used of 100</tspan>
      </text>
    </>
  );
}

export default function StorageSummary({ className }: { className?: string }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [userValue, setUserData] = useState<any>();
  const [data, setData] = useState([
    { name: 'Available storage', value: 22 },
    { name: 'Used storage', value: 78 },
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const encryptedData = localStorage.getItem('uData');
        if (encryptedData) {
          const data: any = decryptData(encryptedData);
          setUserData(data);
        }
      } catch (error: any) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!userValue) return;

    const fetchProjectData = async () => {
      try {
        const response = await apiService.get(`/projects/?company_id=${userValue.user.company_id}`);
        setProjects(response.data.data);
        // Assuming response.data is the correct format for the chart
        setData(response.data.data); // Update the data state here
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectData();
  }, [userValue]);

  return (
    <WidgetCard
      title={'Used Storage'}
      // headerClassName="hidden"
      className={className}
    >
      <div className="h-[373px] w-full @sm:py-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart className="[&_.recharts-layer:focus]:outline-none [&_.recharts-sector:focus]:outline-none dark:[&_.recharts-text.recharts-label]:first-of-type:fill-white">
            <Pie
              data={data}
              cornerRadius={40}
              innerRadius={100}
              outerRadius={120}
              paddingAngle={10}
              fill="#BFDBFE"
              stroke="rgba(0,0,0,0)"
              dataKey={data[1]?.value}
            >
              <Label
                width={30}
                position="center"
                content={<CustomLabel value={data[1]?.value} />}
              />
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="  ">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4 last:mb-0 last:border-0 last:pb-0"
          >
            <div className="flex items-center justify-start">
              <span
                className="me-2 h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <Text
                as="span"
                className="font-lexend text-sm font-medium text-gray-900 dark:text-gray-700"
              >
                {item.name}
              </Text>
            </div>
            <Text as="span">{item.value}%</Text>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
