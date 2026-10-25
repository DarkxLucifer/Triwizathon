'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleLoginView, UserRole } from '@/features/auth/RoleLoginView';

export default function SignupPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedAuth = localStorage.getItem('scoutforge_authenticated');
    if (storedAuth === 'true') {
      router.replace('/dashboard');
      return;
    }
    const storedTheme = localStorage.getItem('scoutforge_theme') as 'dark' | 'light' | null;
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
    }
  }, [router]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('scoutforge_theme', next);
      return next;
    });
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLogin = (role: UserRole) => {
    localStorage.setItem('scoutforge_authenticated', 'true');
    localStorage.setItem('scoutforge_auth_role', role);
    router.push('/dashboard');
  };

  const handleBack = () => {
    router.push('/');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <RoleLoginView
      onLogin={handleLogin}
      theme={theme}
      onToggleTheme={toggleTheme}
      initialRole="player"
      initialRegisterMode={true}
      onBack={handleBack}
    />
  );
}
