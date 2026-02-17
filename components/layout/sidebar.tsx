'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  mandantOnly?: boolean;
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
    label: 'Meine Anfragen',
    href: '/meine-anfragen',
    icon: <MessageSquare className="w-5 h-5" />,
    mandantOnly: true,
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
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ userRole, userName, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose?.();
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly && userRole !== 'admin') return false;
    if (item.mandantOnly && userRole !== 'mandant') return false;
    return true;
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`glass-sidebar w-64 h-screen flex flex-col text-white fixed top-0 left-0 z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0`}
      >
        {/* Logo + Mobile Close */}
        <div className="px-5 py-5 flex items-center justify-between border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center flex-1">
            <Image
              src="/logo_imperoyal.png"
              alt="Imperoyal Immobilien"
              width={160}
              height={44}
              className="h-10 w-auto brightness-0 invert opacity-90"
              priority
            />
          </Link>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-white/50 hover:text-white/90 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Menü schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 min-h-[44px] ${
                  isActive
                    ? 'bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                    : 'text-white/55 hover:bg-white/07 hover:text-white/90'
                }`}
              >
                <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-white/50'}`}>{item.icon}</span>
                <span className="text-sm font-medium tracking-[-0.01em]">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/40" />}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="px-3 pb-4 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white/90">{userName || 'Benutzer'}</p>
              <p className="text-xs text-white/40 capitalize">{userRole}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-white/50 hover:bg-white/07 hover:text-white/90 rounded-xl transition-all duration-150 min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Abmelden</span>
          </button>
        </div>
      </aside>
    </>
  );
}
