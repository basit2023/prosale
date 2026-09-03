'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { logsCreate } from '@/app/shared/account-settings/logs';
import apiService from '@/utils/apiService';
import { routes } from '@/config/routes';

const TEMPLATE_COLUMNS = [
  'project',
  'full_name',
  'mobile',
  'city',
  'investment_budget',
  'interested_in',
  'type',
  'source',
  'email',
];

type LeadImportRow = Record<string, string>;

const normalizeImportRow = (item: Record<string, any>): LeadImportRow => {
  const obj: LeadImportRow = {};
  Object.entries(item || {}).forEach(([key, value]) => {
    const trimmedKey = String(key || '').trim().toLowerCase();
    if (!trimmedKey) return;
    obj[trimmedKey] = value === null || value === undefined ? '' : String(value).trim();
  });
  return obj;
};

const hasUsableMobile = (item: LeadImportRow) => {
  return String(item.mobile || '').replace(/\D/g, '').length >= 7;
};

const cleanParsedRows = (rows: LeadImportRow[]) => rows
  .map(normalizeImportRow)
  .filter((row) => Object.values(row).some(Boolean))
  .filter(hasUsableMobile);

const getColumnIndex = (cellRef: string) => {
  const letters = String(cellRef || '').replace(/[0-9]/g, '').toUpperCase();
  return letters.split('').reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
};

const getTextContent = (node: Element) => {
  return Array.from(node.getElementsByTagName('t')).map((item) => item.textContent || '').join('');
};

const inflateRaw = async (bytes: Uint8Array) => {
  const StreamCtor = (globalThis as any).DecompressionStream;
  if (!StreamCtor) {
    throw new Error('This browser cannot read XLSX files. Please upload CSV or use a modern Chrome/Edge browser.');
  }

  const stream = new Blob([bytes]).stream().pipeThrough(new StreamCtor('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

const readZipEntries = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let eocdOffset = -1;

  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 66000); offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      eocdOffset = offset;
      break;
    }
  }

  if (eocdOffset < 0) throw new Error('Invalid XLSX file.');

  const totalEntries = view.getUint16(eocdOffset + 10, true);
  const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);
  const decoder = new TextDecoder();
  const entries = new Map<string, Uint8Array>();
  let pointer = centralDirectoryOffset;

  for (let index = 0; index < totalEntries; index += 1) {
    if (view.getUint32(pointer, true) !== 0x02014b50) break;

    const method = view.getUint16(pointer + 10, true);
    const compressedSize = view.getUint32(pointer + 20, true);
    const fileNameLength = view.getUint16(pointer + 28, true);
    const extraLength = view.getUint16(pointer + 30, true);
    const commentLength = view.getUint16(pointer + 32, true);
    const localHeaderOffset = view.getUint32(pointer + 42, true);
    const fileName = decoder.decode(bytes.slice(pointer + 46, pointer + 46 + fileNameLength));

    const localNameLength = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
    const dataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(dataOffset, dataOffset + compressedSize);
    const content = method === 0 ? compressed : method === 8 ? await inflateRaw(compressed) : null;
    if (content) entries.set(fileName, content);

    pointer += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
};

const parseSharedStrings = (xmlText: string) => {
  if (!xmlText) return [];
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  return Array.from(xml.getElementsByTagName('si')).map(getTextContent);
};

const parseSheetRows = (xmlText: string, sharedStrings: string[]) => {
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  return Array.from(xml.getElementsByTagName('row')).map((row) => {
    const values: string[] = [];
    Array.from(row.getElementsByTagName('c')).forEach((cell) => {
      const index = getColumnIndex(cell.getAttribute('r') || '');
      const type = cell.getAttribute('t');
      const valueNode = cell.getElementsByTagName('v')[0];
      let value = '';

      if (type === 's') {
        value = sharedStrings[Number(valueNode?.textContent || 0)] || '';
      } else if (type === 'inlineStr') {
        value = getTextContent(cell);
      } else {
        value = valueNode?.textContent || '';
        if (/^[0-9]+(\.[0-9]+)?E\+[0-9]+$/i.test(value)) {
          value = Number(value).toFixed(0);
        }
      }

      values[index] = value;
    });
    return values;
  });
};

const parseXlsxFile = async (file: File) => {
  const entries = await readZipEntries(file);
  const decoder = new TextDecoder();
  const sharedStrings = parseSharedStrings(decoder.decode(entries.get('xl/sharedStrings.xml') || new Uint8Array()));
  const sheetXml = entries.get('xl/worksheets/sheet1.xml');
  if (!sheetXml) throw new Error('No worksheet found in XLSX file.');

  const rows = parseSheetRows(decoder.decode(sheetXml), sharedStrings);
  const headers = (rows[0] || []).map((header) => String(header || '').trim().toLowerCase());

  return rows.slice(1).map((row) => {
    const item: LeadImportRow = {};
    headers.forEach((header, index) => {
      if (header) item[header] = String(row[index] || '').trim();
    });
    return item;
  });
};

const downloadCsvTemplate = () => {
  const sample = [
    TEMPLATE_COLUMNS,
    ['Swiss Suites Grand Burbhan', 'Qamar Zaman', '923146610733', 'Multan', 'after_4_pm', 'Flat', 'yes', 'Facebook', ''],
  ];
  const csv = sample.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leads-format-for-web.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function CSVLeadUploader() {
  const { data: session } = useSession();
  const { push } = useRouter();

  const [parsedData, setParsedData] = useState<LeadImportRow[]>([]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const permission = Number((session?.user as any)?.permission || (session?.user as any)?.permissions?.permission_level || 0);
  const canUpload = permission >= 4;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setParsedData([]);
    setSelectedFileName(file?.name || '');
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    setIsParsing(true);

    try {
      let rows: LeadImportRow[] = [];

      if (extension === 'csv') {
        rows = await new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data as LeadImportRow[]),
            error: reject,
          });
        });
      } else if (extension === 'xlsx') {
        rows = await parseXlsxFile(file);
      } else {
        toast.error('Please upload a CSV or XLSX file.');
        return;
      }

      const cleanedData = cleanParsedRows(rows);
      if (!cleanedData.length) {
        toast.error('No valid lead rows found. Please check the format and mobile column.');
        return;
      }

      setParsedData(cleanedData);
      toast.success(`${cleanedData.length} lead row(s) parsed. Ready to upload.`);
    } catch (error: any) {
      console.error('Error parsing lead file:', error);
      toast.error(error?.message || 'Failed to parse file.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (!canUpload) {
      toast.error('Permission level 4 or greater is required to upload leads.');
      return;
    }

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
        city: item.city || '',
        company_id,
        user,
      }));

      const response = await apiService.post(`/create-new-lead/?csv=csv&&user=${session?.user?.username}`, formattedData);

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
    <div className="mx-auto max-w-3xl space-y-5 p-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Upload CSV/XLSX to Create Leads</h2>
        <p className="text-sm text-gray-500">
          Managers and above can upload leads using the format below.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/leads-format-for-web.xlsx"
            download
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Download XLSX Format
          </a>
          <button
            type="button"
            onClick={downloadCsvTemplate}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Download CSV Format
          </button>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Required columns: {TEMPLATE_COLUMNS.join(', ')}
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-gray-700">Select CSV or XLSX file</span>
        <input
          type="file"
          accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          onChange={handleFileUpload}
          className="w-full rounded-lg border border-gray-200 p-2"
          disabled={isParsing || isLoading}
        />
      </label>

      {selectedFileName ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Selected file: <span className="font-semibold">{selectedFileName}</span>
        </div>
      ) : null}

      {parsedData.length > 0 ? (
        <div className="rounded-xl border border-gray-200">
          <div className="border-b border-gray-200 px-4 py-3 text-sm font-semibold">
            Preview: {parsedData.length} valid lead row(s)
          </div>
          <div className="max-h-72 overflow-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  {TEMPLATE_COLUMNS.map((column) => (
                    <th key={column} className="px-3 py-2">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsedData.slice(0, 8).map((row, index) => (
                  <tr key={`${row.mobile}-${index}`}>
                    {TEMPLATE_COLUMNS.map((column) => (
                      <td key={column} className="px-3 py-2">{row[column] || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {parsedData.length > 0 ? (
        <button
          type="button"
          onClick={handleBulkSubmit}
          className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading || isParsing || !canUpload}
        >
          {isLoading ? 'Uploading...' : 'Submit Leads'}
        </button>
      ) : null}

      {!canUpload ? (
        <p className="text-sm text-red-600">Permission level 4 or greater is required to upload leads.</p>
      ) : null}

      {isParsing ? <p className="text-sm text-gray-500">Reading file, please wait...</p> : null}
      {isLoading ? <p className="text-sm text-gray-500">Uploading leads, please wait...</p> : null}
    </div>
  );
}
