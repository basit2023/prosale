

'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import Spinner from '@/components/ui/spinner';
import apiService from '@/utils/apiService';
import { decryptData } from '@/components/encriptdycriptdata';

// Dynamic imports for SelectBox and QuillEditor
const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});
const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,
});

interface SelectOption {
  label: string;
  value: string;
}

interface Unitspr {
  allocation_pr: string;
  booking_pr?: string;
  confirmation_Pr?: string;
  monthly_Installments?: number;
  monthly_Installmentspr?: string;
  yearly_Installments?: number;
  yearly_Installmentspr?: string;
  half_yearly_Installments?: number;
  half_yearly_Installmentspr?: string;
  possessionpr?: string;
  transferpr?: string;
  extrainstall1?: string;
  extraname1?: string;
  extrapr1?: string;
  extrainstall2?: string;
  extraname2?: string;
  extrapr2?: string;
  extrainstall3?: string;
  extraname3?: string;
  extrapr3?: string;
  extrainstall4?: string;
  extraname4?: string;
  extrapr4?: string;
  extrainstall5?: string;
  extraname5?: string;
  extrapr5?: string;
}

interface DataItem {
  Category: string;
  Unit_Grouped: string;
  SqFtRate: string;
  Size: string;
  project_floor_id: string;
  // ... other fields
}

interface TemplateData {
  Unitspr: Unitspr[];
  data: DataItem[];
}

export default function PaymentTamplate({
  id = 1,
  slug,
  pyamentplain_id = 3,
  templete_id=2
}: any) {
  // console.log("the slug is at the templete is:",)
  const slug_data:any=JSON.parse(decodeURIComponent(slug))
  const { data: session } = useSession();
  const [templateData, setTemplatedata] = useState<TemplateData | null>(null);
  // const [company, setCompany] = useState<any>(null);
  const { back } = useRouter();
  const [userData, setUserData] = useState<any>(null);
  // const [id1, setId]=useState()
  const formattedTitle:any= slug_data?.slug?.replace(/_/g, ' ');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const encryptedData = localStorage.getItem('uData');
        if (encryptedData) {
          const data = decryptData(encryptedData);
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
    };
  
    fetchUserData();
  }, []); // Only runs once on mount (empty dependency array)
  
  // Memoizing slug data to avoid unnecessary recalculation
  const slugDataMemoized = useMemo(() => {
    return {
      floor_id: slug_data?.floor_id,
      paymentplanid: slug_data?.paymentplanid,
    };
  }, [slug_data?.floor_id, slug_data?.paymentplanid]);
  
  const fetchData = useCallback(async () => {
    if (!session) return;
  
    // try {
    //   // Fetch company data
    //   const responseCompany = await apiService.get(`/supper-admin/${session.user.email}`);
    //   setCompany(prev => (prev !== responseCompany.data ? responseCompany.data : prev));
    // } catch (error) {
    //   console.error('Error fetching company data:', error);
    //   toast.error('Error fetching company data. Please try again.');
    // }
  
    
  
    try {
      // Fetch template units data
      const responseTemplate = await apiService.get(
        `/templete-units-data?id=${slugDataMemoized.floor_id}&slug=${slug}&pyamentplain_id=${slugDataMemoized.paymentplanid}`
      );
      setTemplatedata(prev => (prev !== responseTemplate.data ? responseTemplate.data : prev));
      console.log('the template data is:', responseTemplate.data);
    } catch (error) {
      console.error('Error fetching template units data:', error);
      toast.error('Error fetching template units data. Please try again.');
    }
  }, [session, id, slug, slugDataMemoized]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  

  // Helper function to safely access Unitspr
  const unitspr = useMemo((): Unitspr | null => {
    return templateData?.Unitspr && templateData.Unitspr.length > 0 ? templateData.Unitspr[0] : null;
  }, [templateData]);

  

  // Process data to determine rowSpan for Category
  const processedData = useMemo(() => {
    if (!templateData?.data) return [];

    const data = templateData.data;
    const categoryCount: { [key: string]: number } = {};

    // Count occurrences of each Category
    data.forEach(item => {
      const category = item.Category;
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    // Mark first occurrence and assign rowSpan
    const processed = data.map((item, index) => {
      const category = item.Category;
      const firstIndex = data.findIndex(i => i.Category === category);
      return {
        ...item,
        isFirst: index === firstIndex,
        rowSpan: categoryCount[category],
      };
    });

    return processed;
  }, [templateData]);

  
 return (
  
 <>
  {slug_data.templateid==1 &&(<>
  <h1 className="text-3xl font-bold mb-4 uppercase">{formattedTitle} - {slug_data?.floor}- Payment Plan</h1>
  {/* {department.length > 0 && (
    <div className="mb-6">
      <h2
        dangerouslySetInnerHTML={{ __html: renderTemplateContent(department[0].template_content) }}
        className="text-xl"
      />
    </div>
  )} */}

  <div className="container mx-auto p-4">

    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-blue-500 text-white">
            <th className="p-3 border border-gray-300">Category</th>
            <th className="p-3 border border-gray-300">Unit Numbers</th>
            <th className="p-3 border border-gray-300">Size Sq.Ft</th>

            {/* Booking Header */}
            {unitspr?.booking_pr && (
              <th className="p-3 border border-gray-300">
                Booking {unitspr.booking_pr ? `${unitspr.booking_pr}%` : ''}
              </th>
            )}

            {/* Allocation Header */}
            {unitspr?.allocation_pr && (
              <th className="p-3 border border-gray-300">
                Allocation {unitspr.allocation_pr ? `${unitspr.allocation_pr}%` : ''}
              </th>
            )}

            {/* Confirmation Header */}
            {unitspr?.confirmation_Pr && (
              <th className="p-3 border border-gray-300">
                Confirmation {unitspr.confirmation_Pr ? `${unitspr.confirmation_Pr}%` : ''}
              </th>
            )}

            {/* Conditional Headers */}
            {unitspr?.monthly_Installments && (
              <th className="p-3 border border-gray-300">
                {`${unitspr.monthly_Installmentspr}% X ${unitspr.monthly_Installments} Monthly`}
              </th>
            )}

            {unitspr?.yearly_Installments && (
              <th className="p-3 border border-gray-300">
                {`${unitspr.yearly_Installmentspr}% X ${unitspr.yearly_Installments} Yearly`}
              </th>
            )}

            {unitspr?.half_yearly_Installments && (
              <th className="p-3 border border-gray-300">
                {`${unitspr.half_yearly_Installmentspr}% X ${unitspr.half_yearly_Installments} Half-Yearly`}
              </th>
            )}

            {/* Extra Installments Headers */}
            {Array.from({ length: 5 }, (_, i) => i + 1).map((num) =>
              unitspr?.[`extrainstall${num}`] && unitspr?.[`extrapr${num}`] && unitspr?.[`extraname${num}`] ? (
                <th key={num} className="p-3 border border-gray-300">
                  {`${unitspr[`extrapr${num}`]}% X ${unitspr[`extrainstall${num}`]} ${unitspr[`extraname${num}`]}`}
                </th>
              ) : null
            )}

            {/* Possession and Transfer Headers */}
            {unitspr?.possessionpr && (
              <th className="p-3 border border-gray-300">
                Possession {unitspr.possessionpr ? `${unitspr.possessionpr}%` : ''}
              </th>
            )}
            {unitspr?.transferpr && (
              <th className="p-3 border border-gray-300">
                Transfer {unitspr.transferpr ? `${unitspr.transferpr}%` : ''}
              </th>
            )}
            <th className="p-3 border border-gray-300">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {processedData.length > 0 ? (
            processedData.map((item, index) => (
              <tr key={index} className="bg-white dark:bg-gray-800">
                {/* Category Cell with Row Span */}
                {item.isFirst && (
                  <td className="p-3 border border-gray-300 text-center" rowSpan={item.rowSpan}>
                    {item.Category}
                  </td>
                )}

                {/* Unit Numbers */}
                <td className="p-3 border border-gray-300">{item.Unit_Grouped}</td>

                {/* Size Sq.Ft */}
                <td className=" p-3 border border-gray-300">{item.Size}</td>

                {/* Booking Calculation */}
                {unitspr?.booking_pr && (
                  <td className="p-3 border border-gray-300">
                    {unitspr.booking_pr
                      ? ((parseFloat(unitspr.booking_pr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                      : 'N/A'}
                  </td>
                )}

                {/* Allocation Calculation */}
                {unitspr?.allocation_pr && (
                  <td className="p-3 border border-gray-300">
                    {unitspr.allocation_pr
                      ? ((parseFloat(unitspr.allocation_pr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                      : 'N/A'}
                  </td>
                )}

                {/* Confirmation Calculation */}
                {unitspr?.confirmation_Pr && (
                  <td className="p-3 border border-gray-300">
                    {unitspr.confirmation_Pr
                      ? ((parseFloat(unitspr.confirmation_Pr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                      : 'N/A'}
                  </td>
                )}

                {/* Monthly Calculation */}
                {unitspr?.monthly_Installments && (
                  <td className="p-3 border border-gray-300">
                    {unitspr.monthly_Installmentspr && unitspr.monthly_Installments
                      ? (
                          (parseFloat(unitspr.monthly_Installmentspr) / 100) *
                          (parseFloat(unitspr.monthly_Installments) * parseFloat(item.Size) * parseFloat(item.SqFtRate))
                        ).toFixed(2)
                      : 'N/A'}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {`${unitspr.monthly_Installments}% = ${(unitspr.monthly_Installments * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100} x ${unitspr.monthly_Installmentspr}`}
                    </p>
                  </td>
                )}

                {/* Yearly Calculation */}
                {unitspr?.yearly_Installments && (
                  <td className="p-3 border border-gray-300">
                    {unitspr.yearly_Installmentspr && unitspr.yearly_Installments
                      ? (
                          (parseFloat(unitspr.yearly_Installmentspr) / 100) *
                          (parseFloat(unitspr.yearly_Installments) * parseFloat(item.Size) * parseFloat(item.SqFtRate))
                        ).toFixed(2)
                      : 'N/A'}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {`${unitspr.yearly_Installments}% = ${(unitspr.yearly_Installments * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100} x ${unitspr.yearly_Installmentspr}`}
                    </p>
                  </td>
                )}

                {/* Half-Yearly Calculation with Dual Calculations */}
                {unitspr?.half_yearly_Installments && (
                  <td className="p-3 border border-gray-300">
                    {unitspr.half_yearly_Installmentspr && unitspr.half_yearly_Installments
                      ? (
                          (parseFloat(unitspr.half_yearly_Installments) * parseFloat(item.Size) * parseFloat(item.SqFtRate) / 100) *
                          parseFloat(unitspr.half_yearly_Installmentspr)
                        ).toFixed(2)
                      : 'N/A'}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {`${unitspr.half_yearly_Installments}% = ${(unitspr.half_yearly_Installments * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100} x ${unitspr.half_yearly_Installmentspr}`}
                    </p>
                  </td>
                )}

                {/* Extra Installments Calculations */}
                {Array.from({ length: 5 }, (_, i) => i + 1).map((num) =>
                  unitspr?.[`extrainstall${num}`] && unitspr?.[`extrapr${num}`] && unitspr?.[`extraname${num}`] ? (
                    <td key={num} className="p-3 border border-gray-300">
                      {(
                        (parseFloat(unitspr[`extrapr${num}`]) / 100) *
                        (parseFloat(unitspr[`extrainstall${num}`]) * parseFloat(item.Size) * parseFloat(item.SqFtRate))
                      ).toFixed(2)}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {`${unitspr[`extrainstall${num}`]}% = ${(parseFloat(unitspr[`extrainstall${num}`]) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100} x ${unitspr[`extrapr${num}`]}`}
                      </p>
                    </td>
                  ) : null
                )}

                {/* Possession Calculation */}
                {unitspr?.possessionpr && (
                  <td className="p-3 border border-gray-300">
                    {unitspr.possessionpr
                      ? ((parseFloat(unitspr.possessionpr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                      : 'N/A'}
                  </td>
                )}

                {/* Transfer Calculation */}
                {unitspr?.transferpr && (
                  <td className="p-3 border border-gray-300">
                    {unitspr.transferpr
                      ? ((parseFloat(unitspr.transferpr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                      : 'N/A'}
                  </td>
                )}

                {/* Total Amount */}
                <td className="p-3 border border-gray-300">
                  {(parseFloat(item.Size) * parseFloat(item.SqFtRate)).toFixed(2)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="text-center p-4 border border-gray-300">
                Loading data...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</>)}
   {slug_data.templateid==2 && (
    <>
    <h1 className="text-3xl font-bold mb-4 md:text-center uppercase">{formattedTitle} - {slug_data?.floor}- Payment Plan</h1>
    {/* {department.length > 0 && (
      <div className="mb-6">
        <h2
          dangerouslySetInnerHTML={{ __html: renderTemplateContent(department[0].template_content) }}
          className="text-xl"
        />
      </div>
    )} */}

    <div className="container mx-auto p-4">

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-[#bef264] text-white">
              <th className="p-3 border border-gray-300">Category</th>
              <th className="p-3 border border-gray-300">Unit Numbers</th>
              <th className="p-3 border border-gray-300">Size Sq.Ft</th>

              {/* Booking Header */}
              {unitspr?.booking_pr && (
                <th className="p-3 border border-gray-300">
                  Booking {unitspr.booking_pr ? `${unitspr.booking_pr}%` : ''}
                </th>
              )}

              {/* Allocation Header */}
              {unitspr?.allocation_pr && (
                <th className="p-3 border border-gray-300">
                  Allocation {unitspr.allocation_pr ? `${unitspr.allocation_pr}%` : ''}
                </th>
              )}

              {/* Confirmation Header */}
              {unitspr?.confirmation_Pr && (
                <th className="p-3 border border-gray-300">
                  Confirmation {unitspr.confirmation_Pr ? `${unitspr.confirmation_Pr}%` : ''}
                </th>
              )}

              {/* Conditional Headers */}
              {unitspr?.monthly_Installments && (
                <th className="p-3 border border-gray-300">
                  {`Monthly(${unitspr.monthly_Installments})`}
                </th>
              )}

              {unitspr?.yearly_Installments && (
                <th className="p-3 border border-gray-300">
                  {`Yearly(${unitspr.yearly_Installments})`}
                </th>
              )}

              {unitspr?.half_yearly_Installments && (
                <th className="p-3 border border-gray-300">
                  {`Half-Yearly (${unitspr.half_yearly_Installments})`}
                </th>
              )}

              {/* Extra Installments Headers */}
              {Array.from({ length: 5 }, (_, i) => i + 1).map((num) =>
                unitspr?.[`extrainstall${num}`] && unitspr?.[`extrapr${num}`] && unitspr?.[`extraname${num}`] ? (
                  <th key={num} className="p-3 border border-gray-300">
                    {`${unitspr[`extraname${num}`]} (${unitspr[`extrapr${num}`]})`}
                  </th>
                ) : null
              )}

              {/* Possession and Transfer Headers */}
              {unitspr?.possessionpr && (
                <th className="p-3 border border-gray-300">
                  Possession {unitspr.possessionpr ? `${unitspr.possessionpr}%` : ''}
                </th>
              )}
              {unitspr?.transferpr && (
                <th className="p-3 border border-gray-300">
                  Transfer {unitspr.transferpr ? `${unitspr.transferpr}%` : ''}
                </th>
              )}
              <th className="p-3 border border-gray-300">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {processedData.length > 0 ? (
              processedData.map((item, index) => (
                <tr key={index} className="bg- dark:bg-gray-800">
                  {/* Category Cell with Row Span */}
                  {item.isFirst && (
                    <td className="bg-blue-100 p-3 border border-gray-300 text-center" rowSpan={item.rowSpan}>
                      {item.Category}
                    </td>
                  )}

                  {/* Unit Numbers */}
                  <td className="bg-lime-100 p-3 border border-gray-300">{item.Unit_Grouped}</td>

                  {/* Size Sq.Ft */}
                  <td className="bg-orange-100 p-3 border border-gray-300">{item.Size}</td>

                  {/* Booking Calculation */}
                  {unitspr?.booking_pr && (
                    <td className="bg-purple-100 p-3 border border-gray-300">
                      {unitspr.booking_pr
                        ? ((parseFloat(unitspr.booking_pr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                        : 'N/A'}
                    </td>
                  )}

                  {/* Allocation Calculation */}
                  {unitspr?.allocation_pr && (
                    <td className="bg-fuchsia-100 p-3 border border-gray-300">
                      {unitspr.allocation_pr
                        ? ((parseFloat(unitspr.allocation_pr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                        : 'N/A'}
                    </td>
                  )}

                  {/* Confirmation Calculation */}
                  {unitspr?.confirmation_Pr && (
                    <td className="bg-indigo-100 p-3 border border-gray-300">
                      {unitspr.confirmation_Pr
                        ? ((parseFloat(unitspr.confirmation_Pr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                        : 'N/A'}
                    </td>
                  )}

                  {/* Monthly Calculation */}
                  {unitspr?.monthly_Installments && (
                    <td className="bg-sky-100 p-3 border border-gray-300">
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 bold">
                        {`${(unitspr.monthly_Installments * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100}`}
                      </p>
                    </td>
                  )}

                  {/* Yearly Calculation */}
                  {unitspr?.yearly_Installments && (
                    <td className="bg-emerald-100 p-3 border border-gray-300">
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {`${(unitspr.yearly_Installments * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100} `}
                      </p>
                    </td>
                  )}

                  {/* Half-Yearly Calculation with Dual Calculations */}
                  {unitspr?.half_yearly_Installments && (
                    <td className="bg-amber-100 p-3 border border-gray-300">
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {` ${(unitspr.half_yearly_Installments * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100}`}
                      </p>
                    </td>
                  )}

                  {/* Extra Installments Calculations */}
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((num) =>
                    unitspr?.[`extrainstall${num}`] && unitspr?.[`extrapr${num}`] && unitspr?.[`extraname${num}`] ? (
                      <td key={num} className="bg-red-100 p-3 border border-gray-300">
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {`${(parseFloat(unitspr[`extrainstall${num}`]) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100}`}
                        </p>
                      </td>
                    ) : null
                  )}

                  {/* Possession Calculation */}
                  {unitspr?.possessionpr && (
                    <td className="bg-orange-100 p-3 border border-gray-300">
                      {unitspr.possessionpr
                        ? ((parseFloat(unitspr.possessionpr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                        : 'N/A'}
                    </td>
                  )}

                  {/* Transfer Calculation */}
                  {unitspr?.transferpr && (
                    <td className="bg-gray-100 p-3 border border-gray-300">
                      {unitspr.transferpr
                        ? ((parseFloat(unitspr.transferpr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                        : 'N/A'}
                    </td>
                  )}

                  {/* Total Amount */}
                  <td className="bg-blue-100 p-3 border border-gray-300">
                    {(parseFloat(item.Size) * parseFloat(item.SqFtRate)).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4 border border-gray-300">
                  Loading data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </>

   )}

   {slug_data.templateid==3 && (
    <>
    <h1 className="text-3xl font-bold mb-4 uppercase">{formattedTitle} - {slug_data?.floor}- Payment Plan</h1>
    {/* {department.length > 0 && (
      <div className="mb-6">
        <h2
          dangerouslySetInnerHTML={{ __html: renderTemplateContent(department[0].template_content) }}
          className="text-xl"
        />
      </div>
    )} */}

    <div className="container mx-auto p-4">

      <div className="overflow-x-auto rounded">
        <table className="w-full border-separate [border-spacing:8px] rounded">
          <thead>
            <tr className="bg-gray-500 text-white">
              <th className="p-3 border border-gray-300">Category</th>
              <th className="p-3 border border-gray-300">Unit Numbers</th>
              <th className="p-3 border border-gray-300">Size Sq.Ft</th>

              {/* Booking Header */}
              {unitspr?.booking_pr && (
                <th className="p-3 border border-gray-300">
                  Booking {unitspr.booking_pr ? `${unitspr.booking_pr}%` : ''}
                </th>
              )}

              {/* Allocation Header */}
              {unitspr?.allocation_pr && (
                <th className="p-3 border border-gray-300">
                  Allocation {unitspr.allocation_pr ? `${unitspr.allocation_pr}%` : ''}
                </th>
              )}

              {/* Confirmation Header */}
              {unitspr?.confirmation_Pr && (
                <th className="p-3 border border-gray-300">
                  Confirmation {unitspr.confirmation_Pr ? `${unitspr.confirmation_Pr}%` : ''}
                </th>
              )}

              {/* Conditional Headers */}
              {unitspr?.monthly_Installments && (
                <th className="p-3 border border-gray-300">
                  {`Monthly(${unitspr.monthly_Installments})`}
                </th>
              )}

              {unitspr?.yearly_Installments && (
                <th className="p-3 border border-gray-300">
                  {`Yearly(${unitspr.yearly_Installments})`}
                </th>
              )}

              {unitspr?.half_yearly_Installments && (
                <th className="p-3 border border-gray-300">
                  {`Half-Yearly (${unitspr.half_yearly_Installments})`}
                </th>
              )}

              {/* Extra Installments Headers */}
              {Array.from({ length: 5 }, (_, i) => i + 1).map((num) =>
                unitspr?.[`extrainstall${num}`] && unitspr?.[`extrapr${num}`] && unitspr?.[`extraname${num}`] ? (
                  <th key={num} className="p-3 border border-gray-300">
                    {`${unitspr[`extraname${num}`]} (${unitspr[`extrapr${num}`]})`}
                  </th>
                ) : null
              )}

              {/* Possession and Transfer Headers */}
              {unitspr?.possessionpr && (
                <th className="p-3 border border-gray-300">
                  Possession {unitspr.possessionpr ? `${unitspr.possessionpr}%` : ''}
                </th>
              )}
              {unitspr?.transferpr && (
                <th className="p-3 border border-gray-300">
                  Transfer {unitspr.transferpr ? `${unitspr.transferpr}%` : ''}
                </th>
              )}
              <th className="p-3 border border-gray-300">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {processedData.length > 0 ? (
              processedData.map((item, index) => (
                <tr key={index} className="bg- dark:bg-gray-800">
                  {/* Category Cell with Row Span */}
                  {item.isFirst && (
                    <td className="bg-blue-100 p-3 border border-gray-300 text-center" rowSpan={item.rowSpan}>
                      {item.Category}
                    </td>
                  )}

                  {/* Unit Numbers */}
                  <td className="bg-lime-100 p-3 border border-gray-300">{item.Unit_Grouped}</td>

                  {/* Size Sq.Ft */}
                  <td className="bg-orange-100 p-3 border border-gray-300">{item.Size}</td>

                  {/* Booking Calculation */}
                  {unitspr?.booking_pr && (
                    <td className="bg-purple-100 p-3 border border-gray-300">
                      {unitspr.booking_pr
                        ? ((parseFloat(unitspr.booking_pr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                        : 'N/A'}
                    </td>
                  )}

                  {/* Allocation Calculation */}
                  {unitspr?.allocation_pr && (
                    <td className="bg-fuchsia-100 p-3 border border-gray-300">
                      {unitspr.allocation_pr
                        ? ((parseFloat(unitspr.allocation_pr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                        : 'N/A'}
                    </td>
                  )}

                  {/* Confirmation Calculation */}
                  {unitspr?.confirmation_Pr && (
                    <td className="bg-indigo-100 p-3 border border-gray-300">
                      {unitspr.confirmation_Pr
                        ? ((parseFloat(unitspr.confirmation_Pr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                        : 'N/A'}
                    </td>
                  )}

                  {/* Monthly Calculation */}
                  {unitspr?.monthly_Installments && (
                    <td className="bg-sky-100 p-3 border border-gray-300">
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 bold">
                        ${(unitspr.monthly_Installments * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100}`}
                      </p>
                    </td>
                  )}

                  {/* Yearly Calculation */}
                  {unitspr?.yearly_Installments && (
                    <td className="bg-emerald-100 p-3 border border-gray-300">
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {`${(unitspr.yearly_Installments * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100} `}
                      </p>
                    </td>
                  )}

                  {/* Half-Yearly Calculation with Dual Calculations */}
                  {unitspr?.half_yearly_Installments && (
                    <td className="bg-amber-100 p-3 border border-gray-300">
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {` ${(unitspr.half_yearly_Installments * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100}`}
                      </p>
                    </td>
                  )}

                  {/* Extra Installments Calculations */}
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((num) =>
                    unitspr?.[`extrainstall${num}`] && unitspr?.[`extrapr${num}`] && unitspr?.[`extraname${num}`] ? (
                      <td key={num} className="bg-red-100 p-3 border border-gray-300">
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {`${(parseFloat(unitspr[`extrainstall${num}`]) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100}`}
                        </p>
                      </td>
                    ) : null
                  )}

                  {/* Possession Calculation */}
                  {unitspr?.possessionpr && (
                    <td className="bg-orange-100 p-3 border border-gray-300">
                      {unitspr.possessionpr
                        ? ((parseFloat(unitspr.possessionpr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                        : 'N/A'}
                    </td>
                  )}

                  {/* Transfer Calculation */}
                  {unitspr?.transferpr && (
                    <td className="bg-gray-100 p-3 border border-gray-300">
                      {unitspr.transferpr
                        ? ((parseFloat(unitspr.transferpr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                        : 'N/A'}
                    </td>
                  )}

                  {/* Total Amount */}
                  <td className="bg-blue-100 p-3 border border-gray-300">
                    {(parseFloat(item.Size) * parseFloat(item.SqFtRate)).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center p-4 border border-gray-300">
                  Loading data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </>
   )}
   {slug_data.templateid==4 && (
    <>
    <h1 className="text-3xl font-bold mb-4 uppercase">{formattedTitle} - {slug_data?.floor}- Payment Plan</h1>
    {/* {department.length > 0 && (
      <div className="mb-6">
        <h2
          dangerouslySetInnerHTML={{ __html: renderTemplateContent(department[0].template_content) }}
          className="text-xl"
        />
      </div>
    )} */}

    <div className="container mx-auto p-4">

      <div className="overflow-x-auto rounded">
        <table className="w-full border-separate [border-spacing:8px] rounded">
          <thead>
            <tr className="bg-[#ebdd96] text-black">
              <th className="p-3 border border-gray-300">Category</th>
              <th className="p-3 border border-gray-300">Unit Numbers</th>
              <th className="p-3 border border-gray-300">Size Sq.Ft</th>

              {/* Booking Header */}
              {unitspr?.booking_pr && (
                <th className="p-3 border border-gray-300">
                  Booking {unitspr.booking_pr ? `${unitspr.booking_pr}%` : ''}
                </th>
              )}

              {/* Allocation Header */}
              {unitspr?.allocation_pr && (
                <th className="p-3 border border-gray-300">
                  Allocation {unitspr.allocation_pr ? `${unitspr.allocation_pr}%` : ''}
                </th>
              )}

              {/* Confirmation Header */}
              {unitspr?.confirmation_Pr && (
                <th className="p-3 border border-gray-300">
                  Confirmation {unitspr.confirmation_Pr ? `${unitspr.confirmation_Pr}%` : ''}
                </th>
              )}

              {/* Conditional Headers */}
              {unitspr?.monthly_Installments && (
                <th className="p-3 border border-gray-300">
                  {`Monthly(${unitspr.monthly_Installments})`}
                </th>
              )}

              {unitspr?.yearly_Installments && (
                <th className="p-3 border border-gray-300">
                  {`Yearly(${unitspr.yearly_Installments})`}
                </th>
              )}

              {unitspr?.half_yearly_Installments && (
                <th className="p-3 border border-gray-300">
                  {`Half-Yearly (${unitspr.half_yearly_Installments})`}
                </th>
              )}

              {/* Extra Installments Headers */}
              {Array.from({ length: 5 }, (_, i) => i + 1).map((num) =>
                unitspr?.[`extrainstall${num}`] && unitspr?.[`extrapr${num}`] && unitspr?.[`extraname${num}`] ? (
                  <th key={num} className="p-3 border border-gray-300">
                    {`${unitspr[`extraname${num}`]} (${unitspr[`extrapr${num}`]})`}
                  </th>
                ) : null
              )}

              {/* Possession and Transfer Headers */}
              {unitspr?.poss essionpr && (
                <th className="p-3 border border-gray-300">
                  Possession {unitspr.possessionpr ? `${unitspr.possessionpr}%` : ''}
                </th>
              )}
              {unitspr?.transferpr && (
                <th className="p-3 border border-gray-300">
                  Transfer {unitspr.transferpr ? `${unitspr.transferpr}%` : ''}
                </th>
              )}
              <th className="p-3 border border-gray-300">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {processedData.length > 0? (
              processedData.map((item, index) => (
                <tr key={index} className="bg-[#253F4B] dark:bg-gray-800">
                  {/* Category Cell with Row Span */}
                  {item.isFirst && (
                    <td className="bg-[#253F4B] p-3 text-white border border-gray-300 text-center" rowSpan={item.rowSpan}>
                      {item.Category}
                    </td>
                  )}

                  {/* Unit Numbers */}
                  <td className="bg-[#253F4B] p-3 text-white border border-gray-300">{item.Unit_Grouped}</td>

                  {/* Size Sq.Ft */}
                  <td className="bg-[#253F4B] text-white p-3 border border-gray-300">{item.Size}</td>

                  {/* Booking Calculation */}
                  {unitspr?.booking_pr && (
                    <td className="bg-purple-100 p-3 border border-gray-300">
                      {unitspr.booking_pr
                        ? ((parseFloat(unitspr.booking_pr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                        : 'N/A'}
                    </td>
                  )}

                  {/* Allocation Calculation */}
                  {unitspr?.allocation_pr && (
                    <td className="bg-purple-100 p-3 border border-gray-300">
                      {unitspr.allocation_pr
                        ? ((parseFloat(unitspr.allocation_pr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                        : 'N/A'}
                    </td>
                  )}

                  {/* Confirmation Calculation */}
                  {unitspr?.confirmation_Pr && (
                    <td className="bg-purple-100 p-3 border border-gray-300">
                      {unitspr.confirmation_Pr
                        ? ((parseFloat(unitspr.confirmation_Pr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                        : 'N/A'}
                    </td>
                  )}

                  {/* Monthly Calculation */}
                  {unitspr?.monthly_Installments && (
                    <td className="bg-purple-100 p-3 border border-gray-300">
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 bold">
                        ${(unitspr.monthly_Installments * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100}`}
                      </p>
                    </td>
                  )}

                  {/* Yearly Calculation */}
                  {unitspr?.yearly_Installments && (
                    <td className="bg-purple-100 p-3 border border-gray-300">
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {`${(unitspr.yearly_Installments * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100} `}
                      </p>
                    </td>
                  )}

                  {/* Half-Yearly Calculation with Dual Calculations */}
                  {unitspr?.half_yearly_Installments && (
                    <td className="bg-purple-100 p-3 border border-gray-300">
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {` ${(unitspr.half_yearly_Installments * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100}`}
                      </p>
                    </td>
                  )}

                  {/* Extra Installments Calculations */}
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((num) =>
                    unitspr?.[`extrainstall${num}`] && unitspr?.[`extrapr${num}`] && unitspr?.[`extraname${num}`] ? (
                      <td key={num} className="bg-purple-100 p-3 border border-gray-300">
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {`${(parseFloat(unitspr[`extrainstall${num}`]) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100}`}
                        </p>
                      </td>
                    ) : null
                  )}

                  {/* Possession Calculation */}
                  {unitspr?.possessionpr && (
                    <td className="bg-purple-100 p-3 border border-gray-300">
                      {unitspr.possessionpr
                        ? ((parseFloat(unitspr.possessionpr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                        : 'N/A'}
                    </td>
                  )}

                  {/* Transfer Calculation */}
                  {unitspr?.transferpr && (
                    <td className="bg-purple-100 p-3 border border-gray-300">
                      {unitspr.transferpr
                        ? ((parseFloat(unitspr.transferpr) * parseFloat(item.Size) * parseFloat(item.SqFtRate)) / 100).toFixed(2)
                        : 'N/A'}
                    </td>
                  )}

                  {/* Total Amount */}
                  <td className="bg-[#253F4B] text-white p-3 border border-gray-300">
                    {(parseFloat(item.Size) * parseFloat(item.SqFtRate)).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center p-4 border border-gray-300">
                  Loading data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </>
   )}
   
</>
    
  )
  
  
}

