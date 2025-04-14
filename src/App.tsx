import { Routes, Route, useNavigate } from "react-router-dom";
import BinauralBeatGenerator from "./components/BeatGenerator";
import VirtualPiano from "./components/Piano";
import Navigation from "./components/Navigation";
import { Music, Waves, Sparkles } from "lucide-react";

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navigation />
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen flex flex-col pt-24">
              <main className="flex-1">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl mx-auto space-y-8">
                    {/* Audio Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-yellow-400/70">
                        <Music className="w-4 h-4" />
                        <h2 className="text-xs font-medium uppercase tracking-wider">Audio</h2>
                      </div>
                      <div className="space-y-1.5">
                        <button
                          onClick={() => navigate("/piano")}
                          className="w-full group flex items-center justify-between px-4 py-2.5 bg-cyan-500/5 hover:bg-cyan-500/10 rounded-lg transition-colors border border-cyan-500/10 hover:border-cyan-500/20"
                        >
                          <div className="flex items-center gap-3">
                            <Music className="w-5 h-5 text-yellow-400" />
                            <span className="font-medium">Virtual Piano</span>
                          </div>
                          <span className="text-sm text-cyan-400/40 group-hover:text-cyan-400/60 transition-colors">
                            Play →
                          </span>
                        </button>

                        <button
                          onClick={() => navigate("/beats")}
                          className="w-full group flex items-center justify-between px-4 py-2.5 bg-cyan-500/5 hover:bg-cyan-500/10 rounded-lg transition-colors border border-cyan-500/10 hover:border-cyan-500/20"
                        >
                          <div className="flex items-center gap-3">
                            <Waves className="w-5 h-5 text-cyan-400" />
                            <span className="font-medium">Binaural Beats</span>
                          </div>
                          <span className="text-sm text-cyan-400/40 group-hover:text-cyan-400/60 transition-colors">
                            Generate →
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Coming Soon Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-cyan-400/50">
                        <Sparkles className="w-4 h-4" />
                        <h2 className="text-xs font-medium uppercase tracking-wider">Coming Soon</h2>
                      </div>
                      <div className="space-y-1.5">
                        <div className="px-4 py-2.5 bg-cyan-500/5 rounded-lg opacity-50 cursor-not-allowed border border-cyan-500/5">
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-cyan-500/10"></span>
                            <span className="font-medium">Visual Experiments</span>
                          </div>
                        </div>
                        <div className="px-4 py-2.5 bg-cyan-500/5 rounded-lg opacity-50 cursor-not-allowed border border-cyan-500/5">
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-cyan-500/10"></span>
                            <span className="font-medium">Interactive Art</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>

              <footer className="border-t border-cyan-500/10 py-6">
                <div className="container mx-auto px-4 text-center text-sm text-cyan-400/30">
                  <p>Made with 💙 by uselessfun</p>
                </div>
              </footer>
            </div>
          }
        />
        <Route 
          path="/piano" 
          element={
            <div className="pt-16">
              <VirtualPiano />
            </div>
          } 
        />
        <Route 
          path="/beats" 
          element={
            <div className="pt-16">
              <BinauralBeatGenerator />
            </div>
          } 
        />
      </Routes>
    </div>
  );
}
