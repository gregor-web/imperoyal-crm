import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="h-16 glass-card border-b border-white/20 flex items-center px-4 sm:px-6">
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 -ml-1 mr-2 text-[#1E2A3A] hover:bg-slate-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Menü öffnen"
      >
        <Menu className="w-6 h-6" />
      </button>
      <h2 className="text-lg font-semibold text-[#1E2A3A]">
        Imperoyal Immobilien
      </h2>
    </header>
  );
}
