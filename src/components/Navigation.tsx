import { ArrowLeft, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();
  const showBack = location.pathname !== "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0f172a]/80 border-b border-cyan-500/10">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text"
            >
              <Sparkles className="w-5 h-5 text-cyan-400" />
              uselessfun
            </Link>
            <span className="hidden sm:block text-sm text-cyan-400/50">
              A collection of oddly satisfying experiments
            </span>
          </div>

          {showBack && (
            <Link
              to="/"
              className="flex items-center gap-1 text-sm text-cyan-400/60 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
