// PersonalInfoView.js (Print layout like screenshot, no person image)
'use client';
import { logsCreate } from '@/app/shared/account-settings/logs';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { Form } from '@/components/ui/form';
import Spinner from '@/components/ui/spinner';
import FormFooter from '@/components/form-footer';
import { useEffect, useMemo, useState } from 'react';
import apiService from '@/utils/apiService';
import {
  businessProfileDefaultValues,
  BusinessProfileSchema,
  BusinessProfileFromType,
} from '@/utils/validators/business-profile.schema';
import { useRouter } from 'next/navigation';
import { decryptData } from '@/components/encriptdycriptdata';
import Image from 'next/image';
import ElaanImage from '@public/app_logo.png';


interface SelectOption {
  label: string;
  value: string;
}

function fmt(v?: string | null) {
  return v && String(v).trim() ? String(v) : '—';
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return fmt(iso);
  }
}

export default function PrintRealtorsForm({ id }: { id: string }) {
  const { data: session } = useSession();
  const { back } = useRouter();

  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [businessProfile, setBusinessProfile] = useState<any>(null);

  // --- Load local user info (for logs) ---
  useEffect(() => {
    try {
      const encrypted = localStorage.getItem('uData');
      if (encrypted) setUserData(decryptData(encrypted));
    } catch (e) {
      console.error(e);
      toast.error('Error reading local user data.');
    }
  }, [session]);

  // --- Fetch record by ID then store it ---
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setInitialLoading(true);
        const res = await apiService.get(`/business-profiles-id/${id}`);
        const rec = res?.data?.data ?? res?.data;

        const mergedData = {
          ...businessProfileDefaultValues,
          ...rec,
          dob: rec?.dob ? rec.dob.substring(0, 10) : businessProfileDefaultValues.dob,
          dt: rec?.dt || businessProfileDefaultValues.dt,
        };
        if (mounted) setBusinessProfile(mergedData);
      } catch (e: any) {
        console.error(e);
        toast.error(e?.response?.data?.message || 'Could not load profile.');
      } finally {
        if (mounted) setInitialLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Re-mount the form so RHF re-reads defaults once
  const formKey = businessProfile ? `bp-${businessProfile.id ?? '1'}` : 'loading';

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    // Print view has no updates; keep the footer “Cancel/Update” hidden for print.
    window.print();
  };

  if (initialLoading || !businessProfile) return <Spinner />;

  const bp = businessProfile as BusinessProfileFromType;

  return (
    <>
    
      <div className="mx-auto my-6 w-[900px] max-w-full bg-white p-6 shadow print:shadow-none print:m-0 print:w-full print:p-0">
        {/* Header bar + logo */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-24 bg-red-600" />
          <div className="relative h-16 w-40 print:h-14 print:w-36">
            <Image src={ElaanImage} alt="Company Logo" fill className="object-contain" priority />
          </div>
        </div>

        <h1 className="mt-3 text-xl font-semibold tracking-wide">REALTOR REGISTRATION FORM</h1>

        {/* Registration Number (Office use only) */}
        {/* <div className="mt-4 border border-gray-300">
          <div className="flex items-stretch">
            <div className="w-64 border-r border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium">
              REGISTRATION NUMBER: <span className="text-xs font-normal">(Office Use Only)</span>
            </div>
            <div className="flex-1 px-3 py-2 text-sm">
              {fmt(bp?.reg_no || bp?.registration_number || bp?.nbk_no)}
            </div>
          </div>
        </div> */}

        {/* BUSINESS INFORMATION */}
        <SectionTitle text="BUSINESS INFORMATION" />
        <div className="border border-gray-300">
          <Row>
            <Cell label="Name of Applicant" value={fmt(bp.full_name)} grow />
            <Cell
              label="S/O, D/O, W/O"
              value={fmt(bp.relation_type)}
              className="w-40"
            />
            <Cell label="Name" value={fmt(bp.guardian_name)} className="w-64" />
          </Row>

          <Row>
            <Cell label="CNIC" value={fmt(bp.cnic)} />
            <Cell label="NTN Number" value={fmt(bp.ntn)} />
          </Row>

          <Row>
            <Cell label="Mailing Permanent Address" value={fmt(bp.address)} grow />
          </Row>

          <Row>
            <Cell label="Date of Birth" value={fmtDate(bp.dob)} />
            <Cell label="Filer Status" value={fmt(bp.filer_status)} />
            <Cell label="Nationality" value={fmt(bp.nationality)} />
          </Row>

          <Row>
            <Cell label="Email" value={fmt(bp.email)} />
            <Cell label="Mobile No" value={fmt(bp.mobile)} />
          </Row>

          <Row>
            <Cell label="Reference (if any)" value={fmt(bp.reference)} />
          </Row>

          <Row>
            <Cell label="Authorized Partner (if any)" value={fmt(bp.authorized_partner)} />
            <Cell label="CNIC" value={fmt(bp.partner_cnic)} />
          </Row>
        </div>

        {/* REGISTERED OFFICE DETAILS */}
        <SectionTitle text="REGISTERED OFFICE DETAILS" />
        <div className="border border-gray-300">
          <Row>
            <Cell label="Office Name" value={fmt(bp.office_name)} />
            <Cell label="Office Mobile Number" value={fmt(bp.office_mobile)} />
            <Cell label="Office Landline Number" value={fmt(bp.office_landline)} />
          </Row>
          <Row>
            <Cell label="Office Address" value={fmt(bp.office_address)} grow />
          </Row>
          <Row>
            <Cell label="City" value={fmt(bp.office_city || bp.city)} />
          </Row>
        </div>

        {/* BANK DETAILS */}
        <SectionTitle text="BANK DETAILS" />
        <div className="border border-gray-300">
          <Row>
            <Cell label="Account Title" value={fmt(bp.account_title)} />
            <Cell label="Account Number" value={fmt(bp.account_number)} />
            <Cell label="IBAN Number" value={fmt(bp.iban_number)} />
          </Row>
          <Row>
            <Cell label="Branch Code" value={fmt(bp.branch_code)} />
            <Cell label="Branch Name" value={fmt(bp.branch_name)} />
            <Cell label="Bank Name" value={fmt(bp.bank_name)} />
          </Row>
        </div>

        {/* FOR OFFICE USE ONLY */}
        {/* <div className="mt-6 border border-red-500">
          <div className="bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
            FOR OFFICE USE ONLY
          </div>
          <div className="divide-y divide-gray-200">
            <Row>
              <Cell label="Registration Date" value={fmtDate(bp.dt)} />
              <Cell label="Commission Percentage" value={fmt(bp.commission_percentage ? `${bp.commission_percentage}%` : '')} />
            </Row>
            <Row>
              <Cell label="Registered By (Elaan Employee)" value={fmt(bp.registered_by)} />
              <Cell label="Authorized By (Elaan Employee)" value={fmt(bp.authorized_by)} />
            </Row>
          </div>
        </div> */}

        {/* Terms */}
        <div className="mt-4 text-[11px] leading-5 text-gray-700">
          <ol className="list-decimal pl-4">
            <li>Tax shall be deducted as per applicable government policy.</li>
            <li>Registration fee of Rs 50,000/- shall be charged at the time of registration.</li>
            <li>
              In case of return of any sale commission paid on the same shall be returned by realtor.
            </li>
            <li>
              Profit per Sqft shall be given to realtors only against minimum of 10% deposit.
            </li>
          </ol>
          <p className="mt-2 text-[10px] text-gray-500">
            Note: This form is system generated. No signature required.
          </p>
        </div>

        {/* Actions (hidden on print) */}
        <div className="mt-6 flex gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Print
          </button>
          <button
            type="button"
            onClick={() => back()}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Back
          </button>
        </div>
      </div>
    </>
  );
}

/** --- Small presentational helpers --- */

function SectionTitle({ text }: { text: string }) {
  return (
    <div className="mt-6 mb-2 text-[13px] font-semibold tracking-wide">{text}</div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap divide-x divide-gray-200 border-t border-gray-200">
      {children}
    </div>
  );
}

function Cell({
  label,
  value,
  className = '',
  grow = false,
}: {
  label: string;
  value: string;
  className?: string;
  grow?: boolean;
}) {
  return (
    <div
      className={[
        'flex min-h-[44px] items-center',
        grow ? 'flex-1' : 'w-[33.333%]',
        'px-3',
        className,
      ].join(' ')}
    >
      <span className="mr-2 whitespace-nowrap text-[12px] font-medium text-gray-700">
        {label}:
      </span>
      <span className="text-[12px]">{value}</span>
    </div>
  );
}
