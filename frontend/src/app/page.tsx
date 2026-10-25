'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HomePageView } from '@/features/home/HomePageView';

export default function ScoutForgeHomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const storedAuth = localStorage.getItem('scoutforge_authenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <HomePageView
      onGoToLogin={(mode) => {
        router.push(mode === 'signup' ? '/signup' : '/login');
      }}
      onGoToDashboard={() => {
        router.push('/dashboard');
      }}
      isAuthenticated={isAuthenticated}
    />
  );
}
