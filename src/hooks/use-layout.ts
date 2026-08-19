'use client';

import { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { LAYOUT_OPTIONS } from '@/config/enums';

// Keep the server and first client render identical. The saved preference is
// restored after hydration so the application can paint instead of returning
// a blank screen while waiting for useEffect.
const isomorphicLayoutAtom = atom<string>(LAYOUT_OPTIONS.HYDROGEN);

const isomorphicLayoutAtomWithPersistence = atom(
  (get) => get(isomorphicLayoutAtom),
  (get, set, newStorage: any) => {
    set(isomorphicLayoutAtom, newStorage);
    localStorage.setItem('isomorphic-layout', newStorage);
  }
);

// 2. useLayout hook to check which layout is available
export function useLayout() {
  const [layout, setLayout] = useAtom(isomorphicLayoutAtomWithPersistence);

  useEffect(() => {
    const savedLayout = localStorage.getItem('isomorphic-layout');
    if (savedLayout && savedLayout !== layout) {
      setLayout(savedLayout);
    }
  }, [layout, setLayout]);

  return {
    layout: layout === null ? LAYOUT_OPTIONS.HYDROGEN : layout,
    setLayout,
  };
}
