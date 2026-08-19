'use client';
import dynamic from 'next/dynamic';
import { LAYOUT_OPTIONS } from '@/config/enums';
import { useLayout } from '@/hooks/use-layout';
import HydrogenLayout from '@/layouts/hydrogen/layout';
import { UserProvider } from '@/context/UserContext';

// Lazy-load alternative layouts — only the active one is ever used
const HeliumLayout = dynamic(() => import('@/layouts/helium/helium-layout'));
const LithiumLayout = dynamic(() => import('@/layouts/lithium/lithium-layout'));
const BerylLiumLayout = dynamic(() => import('@/layouts/beryllium/beryllium-layout'));

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { layout } = useLayout();

  let content;
  if (layout === LAYOUT_OPTIONS.HELIUM) {
    content = <HeliumLayout>{children}</HeliumLayout>;
  } else if (layout === LAYOUT_OPTIONS.LITHIUM) {
    content = <LithiumLayout>{children}</LithiumLayout>;
  } else if (layout === LAYOUT_OPTIONS.BERYLLIUM) {
    content = <BerylLiumLayout>{children}</BerylLiumLayout>;
  } else {
    content = <HydrogenLayout>{children}</HydrogenLayout>;
  }

  return <UserProvider>{content}</UserProvider>;
}
