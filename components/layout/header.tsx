import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] flex items-center px-4 sm:px-6 sticky top-0 z-30">
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 -ml-1 mr-2 text-[#1D1D1F] hover:bg-black/05 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
        aria-label="Menü öffnen"
      >
        <Menu className="w-5 h-5" />
      </button>
      <h2 className="text-[15px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">
        Imperoyal Immobilien
      </h2>
    </header>
  );
}
