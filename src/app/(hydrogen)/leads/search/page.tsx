'use client';

import { useState, useEffect } from 'react';
import { Title, Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Select from '@/components/ui/select';
import { DatePicker } from '@/components/ui/datepicker';
import { Empty } from 'rizzui';
import Spinner from '@/components/ui/spinner';
import TableLayout from '../labels/[id]/table-layout';
import InvoiceTable from '@/components/LeadManagement/employee-data/Highly_Interested/table';
import { useAdvancedSearchLeads } from '@/hooks/use-advanced-search';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';

export default function SearchLeadsPage() {
  const { data: session } = useSession();
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [targetUser, setTargetUser] = useState<any>(null);
  const [users, setUsers] = useState<{ label: string; value: string }[]>([]);

  const { data, loading, search, loadMore, total } = useAdvancedSearchLeads(50);

  const permission = Number((session as any)?.user?.permission || 0);

  // Fetch users for the dropdown (Admin/Manager only)
  useEffect(() => {
    if (permission >= 4 && session?.user?.email) {
      apiService.get(`/all-members/?email=${session.user.email}&table=footer`).then(res => {
        const rawData = res.data.data || [];
        const formatted = rawData.map((u: any) => ({
          label: u.name,
          value: u.secondvalue || u.value || u.name,
        }));
        setUsers(formatted);
      });
    }
  }, [permission, session]);

  const formatDate = (date: Date | null) => {
    if (!date) return undefined;
    // Fix for timezone offset to get local YYYY-MM-DD
    const z = date.getTimezoneOffset() * 60 * 1000;
    const local = new Date(date.getTime() - z);
    return local.toISOString().split('T')[0];
  };

  const onSearch = () => {
    const params = {
      fromDate: formatDate(fromDate),
      toDate: formatDate(toDate),
      searchTerm,
      targetUser: targetUser?.value,
    };
    console.log("search params : ",params);
    search(params);
  };

  const onLoadMore = () => {
    const params = {
      fromDate: formatDate(fromDate),
      toDate: formatDate(toDate),
      searchTerm,
      targetUser: targetUser?.value,
    };
    loadMore(params);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-100/50">
        <Title as="h3" className="text-lg font-semibold">Advanced Lead Search</Title>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <Text className="text-xs font-medium text-gray-500">From Date</Text>
            <DatePicker
              selected={fromDate}
              onChange={(date: Date) => setFromDate(date)}
              placeholderText="Select start date"
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Text className="text-xs font-medium text-gray-500">To Date</Text>
            <DatePicker
              selected={toDate}
              onChange={(date: Date) => setToDate(date)}
              placeholderText="Select end date"
              className="w-full"
            />
          </div>
          {permission >= 4 && (
            <div className="flex flex-col gap-1">
              <Text className="text-xs font-medium text-gray-500">Search by User</Text>
              <Select
                options={users}
                value={targetUser}
                onChange={setTargetUser}
                placeholder="Select a user"
                isSearchable
                className="w-full"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <Text className="text-xs font-medium text-gray-500">Keyword Search</Text>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, Mobile, ID..."
              className="w-full"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onSearch} isLoading={loading} className="px-8">
            Search Leads
          </Button>
        </div>
      </div>

      <TableLayout
        title="Search Results"
        breadcrumb={[{ name: 'Leads', href: '#' }, { name: 'Search' }]}
        data={data}
        fileName="search_results"
        header="ID,Customer,Mobile,Project,Status,Assigned To,Date"
      >
        {data.length === 0 && !loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Empty text="Apply filters and click Search to see leads" />
          </div>
        ) : (
          <InvoiceTable
            data={data}
            loadMore={onLoadMore}
            totalLeads={total}
            isLoading={loading}
          />
        )}
      </TableLayout>
    </div>
  );
}
