'use client';

import React, { useEffect, useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { Title, Text } from '@/components/ui/text';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
import { PiBuildingsDuotone, PiMapPinDuotone, PiArrowRightBold } from 'react-icons/pi';
import Link from 'next/link';

export default function HotInventory({ className }: { className?: string }) {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await apiService.get('/projects');
        let data = res.data?.projects || res.data?.data || res.data || [];
        
        if (Array.isArray(data)) {
          // Take top 4 active projects
          setProjects(data.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching project inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProjects();
    }
  }, [session]);

  return (
    <WidgetCard
      title="Hot Project Inventory"
      titleClassName="font-semibold text-gray-800 text-lg"
      className={className}
      action={
        <div className="rounded-full bg-orange-100 p-2 text-orange-600">
          <PiBuildingsDuotone className="h-5 w-5" />
        </div>
      }
    >
      <div className="mt-4 h-72 flex flex-col justify-between">
        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-500">Loading inventory...</div>
        ) : projects.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <PiBuildingsDuotone className="h-10 w-10 text-gray-300 mb-2" />
            <Text>No active projects found.</Text>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {projects.map((project: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-orange-50/50 transition-colors">
                  <div>
                    <Title as="h6" className="text-sm font-semibold text-gray-900">
                      {project.name}
                    </Title>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <PiMapPinDuotone className="h-3 w-3" />
                      <span>{project.Location || 'Not specified'}</span>
                      {project.category && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="capitalize">{project.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0">
                     <span className={`px-2 py-1 text-[10px] font-semibold rounded-full uppercase ${
                        project.status === 'Active' || project.status === 'Y' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-200 text-gray-700'
                     }`}>
                        {project.status === 'Y' ? 'Active' : project.status}
                     </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-2 pt-3 border-t border-gray-100">
               <Link href="/project" className="flex w-full items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                  View All Projects <PiArrowRightBold />
               </Link>
            </div>
          </>
        )}
      </div>
    </WidgetCard>
  );
}
