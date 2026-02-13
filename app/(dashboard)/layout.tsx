import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name, email')
    .eq('id', user.id)
    .single();

  const userRole = (profile?.role as 'admin' | 'mandant') || 'mandant';
  const userName = profile?.name || profile?.email || user.email;

  return (
    <div className="h-screen overflow-hidden dashboard-bg">
      <DashboardShell userRole={userRole} userName={userName ?? undefined}>
        {children}
      </DashboardShell>
    </div>
  );
}
