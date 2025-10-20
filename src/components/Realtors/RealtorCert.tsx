// PersonalInfoView.js (RealtorCert) — print-ready overlay on ElaanCert
'use client';
import { logsCreate } from '@/app/shared/account-settings/logs';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Spinner from '@/components/ui/spinner';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
import {
  businessProfileDefaultValues,
  BusinessProfileFromType,
} from '@/utils/validators/business-profile.schema';
import { useRouter } from 'next/navigation';
import { decryptData } from '@/components/encriptdycriptdata';
import Image from 'next/image';

// Your certificate background image
import ElaanCert from '@public/sample_cert.jpg';

function fmt(v?: string | null) {
  return v && String(v).trim() ? String(v) : '—';
}

export default function RealtorCert({ id }: { id: string }) {
  const { data: session } = useSession();
  const { back } = useRouter();

  const [initialLoading, setInitialLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [businessProfile, setBusinessProfile] = useState<any>(null);

  // Load local user info (for logs)
  useEffect(() => {
    try {
      const encrypted = localStorage.getItem('uData');
      if (encrypted) setUserData(decryptData(encrypted));
    } catch (e) {
      console.error(e);
      toast.error('Error reading local user data.');
    }
  }, [session]);

  // Fetch record by ID
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
          dob: rec?.dob ? String(rec.dob).substring(0, 10) : businessProfileDefaultValues.dob,
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

  if (initialLoading || !businessProfile) return <Spinner />;

  const bp = businessProfile as BusinessProfileFromType;
  const fullName = fmt(bp.full_name);
  // Support either office_name or name_office (your PHP used name_office)
  const officeName = fmt((bp as any).office_name ?? (bp as any).name_office);

  return (
    <>
      {/* Print button (hidden on print) — optional */}
     

      {/* Certificate frame */}
      <div className="cert-wrap">
        {/* Background certificate image */}
        <Image
          src={ElaanCert}
          alt="Elaan Marketing Certificate"
          fill
          className="object-contain"
          priority
          sizes="100vw"
        />

        {/* Text overlay (name + office) */}
        <div className="overlay mt-2 font-boowie">
          <div className="name">
            {fullName}
            {officeName !== '—' && <span className="office">{officeName}</span>}
          </div>
        </div>
         {/* <div className="mb-3 flex items- j gap-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Print Certificate
        </button>
        <button
          onClick={() => back()}
          className="rounded border px-4 py-2 hover:bg-gray-50"
        >
          Back
        </button>
      </div> */}
      </div>

      {/* Styles — screen + print */}
      <style jsx>{`
        /* Keep colors in print */
        :global(body) {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* A4 landscape for print */
        @page {
          size: A4 landscape;
          margin: 0;
        }

        /* The certificate wrapper keeps the image ratio right.
           On screen: scales to viewport; On print: fills page. */
        .cert-wrap {
          position: relative;
          width: 100%;
          height: min(calc(100vw * 0.65), 100vh); /* ~A4 landscape ratio on screen */
          max-width: 1400px;
          margin: 0 auto;
          background: #fff;
        }

        /* Next/Image fill requires a positioned parent */
        .cert-wrap :global(img) {
          user-select: none;
          -webkit-user-drag: none;
        }

        /* Centered overlay block */
        .overlay {
          position: absolute;
          font-family: 'Boowie', sans-serif;
          top: 58%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          text-align: center;
          font-size:3rem
          pointer-events: none;
              line-height: 3.8rem;
        }

        /* Name styling (similar to PHP example).
           Adjust font-size if your design needs a different scale. */
        .name {
          color: #ffffff;
          font-weight: 600;
          font-size: clamp(1rem, 3vw, 2rem);
          line-height: 1.1;
          letter-spacing: 0.02em;
          text-shadow: rgba(0, 0, 0, 0.12) 0 1px 2px;
          filter: blur(0.2px);
          white-space: nowrap;
          overflow: hidden;
        }

        /* Office chip under the name */
        .office {
          display: block;
          margin: 0px auto 0;
          width: max-content;
          background: #ffffff;
          color: #cc1c24;
          padding: 4px 20px 2px;
          border-radius: 6px;
          font-size: clamp(1rem, 3vw, 2rem);
          font-weight: 700;
          line-height: 1.1;
        }

        /* Print rules: fill the page height */
        @media print {
          .cert-wrap {
            width: 100vw;
            height: 100vh;
            max-width: none;
          }
          /* Slightly bigger on print */
          .name {
            font-size: 2.3rem;
          }
          .office {
            font-size: 1.3rem;
            line-height: 1;
        
          }
        }
      `}</style>
    </>
  );
}
