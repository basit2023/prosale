'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import apiService from '@/utils/apiService';
import PageHeader from '@/app/shared/page-header';
import FollowUpStatsTable from './follow-up-stats-table';
import { Title, Text } from '@/components/ui/text';
import { Loader } from '@/components/ui/loader';
import { Empty } from '@/components/ui/empty';
import { Modal } from '@/components/ui/modal';
import { ActionIcon } from '@/components/ui/action-icon';
import { PiXBold } from 'react-icons/pi';
import { format } from 'date-fns';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';

import { DatePicker } from '@/components/ui/datepicker';
import { PiCalendarBlank } from 'react-icons/pi';

const pageHeader = {
    title: 'Follow-up Information',
    breadcrumb: [
        {
            href: '/',
            name: 'Home',
        },
        {
            href: '/leads',
            name: 'Leads',
        },
        {
            name: 'Follow-up Info',
        },
    ],
};

export default function FollowUpInfoPage() {
    const { data: session } = useSession<any>();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ users: any[]; leads_per_day: any[] }>({ users: [], leads_per_day: [] });
    const [selectedUser, setSelectedUser] = useState<{ username: string; fullName: string } | null>(null);
    const [userComments, setUserComments] = useState<any[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user) return;
            try {
                setLoading(true);
                const response = await apiService.get('/follow-up-stats', {
                    params: {
                        email: session.user.email,
                        permission: session.user.permission,
                        user: session?.user?.username,
                        id: session.user.id,
                        date: format(selectedDate, 'yyyy-MM-dd'),
                    },
                });
                setData(response.data.data);
            } catch (error) {
                console.error('Error fetching follow-up stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session, selectedDate]);

    const handleUserClick = async (username: string, fullName: string) => {
        setSelectedUser({ username, fullName });
        try {
            setLoadingComments(true);
            const response = await apiService.get(`/user-comments-detail/${username}`);
         
            setUserComments(response.data.data);
        } catch (error) {
            console.error('Error fetching user comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center">
                <Loader variant="threeDot" />
                <Text className="mt-4 font-medium text-gray-500">Loading statistics...</Text>
            </div>
        );
    }

    const chartData = data.leads_per_day.map((item) => ({
        date: format(new Date(item.date), 'MMM dd'),
        count: item.count,
    })).reverse();

    return (
        <>
            <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
                <div className="flex items-center gap-3">
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date) => setSelectedDate(date)}
                        dateFormat="MMMM d, yyyy"
                        placeholderText="Select Date"
                        maxDate={new Date()}
                        inputProps={{
                            prefix: <PiCalendarBlank className="h-4 w-4" />,
                        }}
                        className="w-44"
                    />
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 gap-6 @container lg:gap-8">
                {/* Chart Section */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-50/50">
                    <Title as="h3" className="mb-6 text-lg font-semibold">
                        Leads Received Over Time (Last 30 Days)
                    </Title>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3872FA" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3872FA" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3872FA"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stats Table */}
                <FollowUpStatsTable users={data.users} onUserClick={handleUserClick} />
            </div>

            <Modal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                containerClassName="max-w-[800px] p-0"
            >
                <div className="flex flex-col">
                    <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-800">
                        <div>
                            <Title as="h4" className="text-xl font-bold">
                                Comments for {selectedUser?.fullName}
                            </Title>
                            <Text className="text-sm text-gray-500">
                                Detailed list of all engagement activities
                            </Text>
                        </div>
                        <ActionIcon
                            size="sm"
                            variant="text"
                            onClick={() => setSelectedUser(null)}
                            className="p-0 text-gray-500 hover:text-gray-900"
                        >
                            <PiXBold className="h-5 w-5" />
                        </ActionIcon>
                    </div>

                    <div className="p-6">
                        {loadingComments ? (
                            <div className="flex h-40 flex-col items-center justify-center">
                                <Loader variant="threeDot" />
                            </div>
                        ) : userComments.length > 0 ? (
                            <div className="max-h-[500px] overflow-y-auto">
                                <div className="space-y-4">
                                    {userComments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/50"
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <Text className="font-semibold text-primary">
                                                    {comment.customer_name || 'Quick Lead'}
                                                </Text>
                                                <Text className="text-xs text-gray-500">
                                                    {format(new Date(comment.dt), 'MMM dd, yyyy hh:mm a')}
                                                </Text>
                                            </div>
                                            <Text className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                                {comment.comments}
                                            </Text>
                                            {comment.followup && (
                                                <div className="mt-3 flex items-center gap-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Follow-up:</span>
                                                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400">{comment.followup}</span>
                                                    {comment.followupdate && (
                                                        <span className="text-xs text-gray-500">
                                                            on {format(new Date(comment.followupdate), 'MMM dd')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <Empty text="No comments found for this user." />
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
}
