'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { logsCreate } from '@/app/shared/account-settings/logs';
import apiService from '@/utils/apiService';
import { routes } from '@/config/routes';

export default function CSVLeadUploader() {
  const { data: session } = useSession();
  const { push } = useRouter();

  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle CSV Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const data = results.data as any[];

        if (!data.length) {
          toast.error('No data found in file.');
          return;
        }

        // Trim and normalize keys and values
        const cleanedData = data.map((item) => {
          const obj: any = {};
          for (const key in item) {
            const trimmedKey = key.trim().toLowerCase();
            obj[trimmedKey] = (item[key] || '').toString().trim();
          }
          return obj;
        });

        setParsedData(cleanedData);
        toast.success('File parsed successfully. Ready to upload.');
      },
    });
  };

  // Handle Bulk Submit
  const handleBulkSubmit = async () => {
    if (!parsedData.length) {
      toast.error('No data to upload.');
      return;
    }

    setIsLoading(true);

    try {
      const company_id = session?.user?.company_id;
      const user = session?.user?.username;
   
      const formattedData = parsedData.map((item) => ({
        full_name: item.full_name || '',
        mobile: item.mobile || '',
        email: item.email || '',
        investment_budget: item.investment_budget || '',
        type: item.type || '',
        source: item.source || '',
        interested_in: item.interested_in || '',
        project: item.project || '',
        company_id,
        user,
      }));

      const response = await apiService.post(`/create-new-lead/?csv=csv`, formattedData);

      if (response.data.success) {
        logsCreate({ user: session?.user?.name, desc: 'Bulk Lead Upload' });
        toast.success(response.data.message || 'Leads created successfully');
        push(routes.leads.management);
      } else {
        toast.error(response.data.message || 'Something went wrong');
      }
    } catch (error: any) {
      console.error('Error uploading leads:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold">Upload CSV to Create Leads</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="border p-2 w-full"
      />

      {parsedData.length > 0 && (
        <button
          onClick={handleBulkSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          disabled={isLoading}
        >
          {isLoading ? 'Uploading...' : 'Submit Leads'}
        </button>
      )}

      {isLoading && <p className="text-sm text-gray-500">Uploading leads, please wait...</p>}
    </div>
  );
}
