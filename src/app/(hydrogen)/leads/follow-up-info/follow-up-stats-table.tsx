'use client';

import React from 'react';
import { Title, Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { PiChatCenteredDots, PiPhone, PiUserCircle } from 'react-icons/pi';

type UserStat = {
    id: number;
    name: string;
    full_name: string;
    total_comments: number;
    total_followups: number;
    leads_on_date: number;
    total_calls: number;
    total_talk_time: number;
};

const formatTalkTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
};

type FollowUpStatsTableProps = {
    users: UserStat[];
    onUserClick: (username: string, fullName: string) => void;
};

export default function FollowUpStatsTable({ users, onUserClick }: FollowUpStatsTableProps) {
    // console.log("total Active users",users);
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-50/50">
            <div className="mb-6 flex items-center justify-between">
                <Title as="h3" className="text-lg font-semibold">
                    Employee Follow-up Statistics
                </Title>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                            <th className="pb-4 pt-0 font-medium text-gray-500">Employee</th>
                            <th className="pb-4 pt-0 font-medium text-gray-500 text-center">Comments (Day)</th>
                            <th className="pb-4 pt-0 font-medium text-gray-500 text-center">Follow-ups (Day)</th>
                            <th className="pb-4 pt-0 font-medium text-gray-500 text-center">Leads Received</th>
                            <th className="pb-4 pt-0 font-medium text-gray-500 text-center">Total Calls</th>
                            <th className="pb-4 pt-0 font-medium text-gray-500 text-center">Talk Time</th>
                            <th className="pb-4 pt-0 font-medium text-gray-500 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="group border-b border-gray-50 last:border-0 hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                            >
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <PiUserCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <Text className="font-medium text-gray-900 dark:text-gray-100">
                                                {user.full_name}
                                            </Text>
                                            <Text className="text-xs text-gray-500">@{user.name}</Text>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        <PiChatCenteredDots className="h-4 w-4" />
                                        <span className="text-sm font-semibold">{user.total_comments}</span>
                                    </div>
                                </td>
                                <td className="py-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                        <PiPhone className="h-4 w-4" />
                                        <span className="text-sm font-semibold">{user.total_followups}</span>
                                    </div>
                                </td>
                                <td className="py-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                                        <PiPhone className="h-4 w-4 rotate-90" />
                                        <span className="text-sm font-semibold">{user.leads_on_date}</span>
                                    </div>
                                </td>
                                <td className="py-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                                        <PiPhone className="h-4 w-4" />
                                        <span className="text-sm font-semibold">{user.total_calls}</span>
                                    </div>
                                </td>
                                <td className="py-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                        <span className="text-sm font-semibold">{formatTalkTime(user.total_talk_time)}</span>
                                    </div>
                                </td>
                                <td className="py-4 text-right">
                                    <Button
                                        variant="text"
                                        size="sm"
                                        className="font-semibold text-primary underline hover:text-primary/80"
                                        onClick={() => onUserClick(user.name, user.full_name)}
                                    >
                                        View Info
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
