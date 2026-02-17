'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface DashboardShellProps {
  children: React.ReactNode;
  userRole: 'admin' | 'mandant';
  userName?: string;
}

export function DashboardShell({ children, userRole, userName }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar
        userRole={userRole}
        userName={userName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
        <div className="md:ml-64 h-screen flex flex-col overflow-hidden bg-[#0F1A25]">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
}
