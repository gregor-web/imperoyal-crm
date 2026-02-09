'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileBarChart,
  ShoppingCart,
  MessageSquare,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Mandanten',
    href: '/mandanten',
    icon: <Users className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    label: 'Objekte',
    href: '/objekte',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    label: 'Auswertungen',
    href: '/auswertungen',
    icon: <FileBarChart className="w-5 h-5" />,
  },
  {
    label: 'Ankaufsprofile',
    href: '/ankaufsprofile',
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    label: 'Anfragen',
    href: '/anfragen',
    icon: <MessageSquare className="w-5 h-5" />,
    adminOnly: true,
  },
];

interface SidebarProps {
  userRole: 'admin' | 'mandant';
  userName?: string;
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || userRole === 'admin'
  );

  return (
    <aside className="glass-sidebar w-64 min-h-screen flex flex-col text-white">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center justify-center">
          <Image
            src="/logo_imperoyal.png"
            alt="Imperoyal Immobilien"
            width={180}
            height={50}
            className="h-12 w-auto brightness-0 invert"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-medium">
            {userName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName || 'Benutzer'}</p>
            <p className="text-xs text-white/60 capitalize">{userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Abmelden</span>
        </button>
      </div>
    </aside>
  );
}
