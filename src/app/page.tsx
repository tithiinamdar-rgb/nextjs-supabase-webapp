'use client';

import React from 'react';
import { PartnerStoreProvider } from '@/lib/store/partnerStore';
import AppShell from '@/components/layout/AppShell';

export default function Home() {
  return (
    <PartnerStoreProvider>
      <AppShell />
    </PartnerStoreProvider>
  );
}
