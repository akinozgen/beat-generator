import { Sparkles, Info } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0f172a] border-b border-cyan-500/10 z-10">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text"
          >
            <Sparkles className="w-5 h-5 text-cyan-400" />
            uselessfun
          </Link>
          <span className="hidden sm:block text-sm text-cyan-400/50">
            Experiments in digital curiosity
          </span>
        </div>
        
        <Link
          to="/about"
          className={`p-2 rounded-lg transition-colors hover:bg-white/5 ${
            pathname === '/about' ? 'text-cyan-400' : 'text-white/50'
          }`}
          title="About"
        >
          <Info className="w-5 h-5" />
        </Link>
      </div>
    </nav>
  );
}
