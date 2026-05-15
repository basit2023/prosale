'use client';

import React from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { Title, Text } from '@/components/ui/text';
import Link from 'next/link';
import { PiPlusCircle, PiUsers, PiPhoneCall, PiCalendarPlus } from 'react-icons/pi';

const actions = [
  {
    title: 'Add New Lead',
    icon: <PiPlusCircle className="h-6 w-6 text-primary" />,
    href: '/leads/new-lead',
    bgColor: 'bg-primary/10',
    description: 'Create a new lead entry manually'
  },
  {
    title: 'My Leads',
    icon: <PiUsers className="h-6 w-6 text-green-600" />,
    href: '/leads/management',
    bgColor: 'bg-green-100',
    description: 'View your active pipeline'
  },
  {
    title: 'Log Call',
    icon: <PiPhoneCall className="h-6 w-6 text-orange-600" />,
    href: '/activitylogs',
    bgColor: 'bg-orange-100',
    description: 'Record a recent client interaction'
  },
  {
    title: 'Schedule',
    icon: <PiCalendarPlus className="h-6 w-6 text-blue-600" />,
    href: '/leads/followup',
    bgColor: 'bg-blue-100',
    description: 'Plan a meeting or follow-up'
  }
];

export default function QuickActions({ className }: { className?: string }) {
  return (
    <WidgetCard
      title="Quick Actions"
      titleClassName="font-semibold text-gray-800 text-lg"
      className={className}
    >
      <div className="mt-4 grid grid-cols-2 gap-4 h-72">
        {actions.map((action, index) => (
          <Link
            href={action.href}
            key={index}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all group bg-white"
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${action.bgColor} group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <Title as="h6" className="mt-3 text-sm font-semibold text-gray-800 text-center">
              {action.title}
            </Title>
            <Text className="mt-1 text-xs text-gray-500 text-center px-2 line-clamp-2">
              {action.description}
            </Text>
          </Link>
        ))}
      </div>
    </WidgetCard>
  );
}
