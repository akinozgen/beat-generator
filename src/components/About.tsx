import { Info } from 'lucide-react';

export default function About() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0f172a] h-[calc(100vh-4rem)] p-8">
      <div className="w-full max-w-2xl space-y-12 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
            uselessfun
          </h1>
          <p className="text-lg text-cyan-400/70">
            A quiet collection of tools, experiments, and digital curiosities.
          </p>
        </div>

        <div className="space-y-6 text-white/70">
          <p className="text-xl">
            Nothing here is essential. But everything here invites exploration.
          </p>
          <p className="text-xl">
            No goals, no pressure — just space to tinker, play, and wonder.
          </p>
          <p className="text-xl">
            Built slowly, with curiosity. Updated whenever inspiration strikes.
          </p>
        </div>

        <div className="pt-8 flex justify-center">
          <Info className="w-12 h-12 text-cyan-400/30" />
        </div>
      </div>
    </div>
  );
}
