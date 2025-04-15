import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, Download } from "lucide-react";

interface Preset {
  name: string;
  freq: number;
  description: string;
}

const PRESETS: Preset[] = [
  { name: "Focus", freq: 13, description: "Enhance concentration and alertness" },
  { name: "Deep Focus", freq: 15, description: "Improve memory and problem solving" },
  { name: "Meditation", freq: 7, description: "Deep relaxation and meditation" },
  { name: "Sleep", freq: 4, description: "Aid sleep and deep relaxation" },
  { name: "Creativity", freq: 10, description: "Enhance creativity and imagination" },
];

interface WindowWithWebkit extends Window {
  webkitAudioContext: typeof AudioContext;
}

export default function BinauralBeatGenerator() {
  const audioCtx = useRef<AudioContext | null>(null);
  const leftOsc = useRef<OscillatorNode | null>(null);
  const rightOsc = useRef<OscillatorNode | null>(null);
  const leftGain = useRef<GainNode | null>(null);
  const rightGain = useRef<GainNode | null>(null);
  const merger = useRef<ChannelMergerNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [baseFreq, setBaseFreq] = useState(200);
  const [beatFreq, setBeatFreq] = useState(10);
  const [selectedPreset, setSelectedPreset] = useState<string>("Focus");

  useEffect(() => {
    const preset = PRESETS.find(p => p.name === selectedPreset);
    if (preset) {
      setBeatFreq(preset.freq);
    }
  }, [selectedPreset]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const startTime = Date.now();
    const amplitude = 0.15;

    const draw = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);

      if (isPlaying) {
        const currentTime = (Date.now() - startTime) / 1000;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);

        // Draw two waves - one for each ear
        for (let x = 0; x < width; x++) {
          const t = x / width;
          const leftWave = Math.sin(2 * Math.PI * (baseFreq * t + currentTime));
          const rightWave = Math.sin(2 * Math.PI * ((baseFreq + beatFreq) * t + currentTime));
          
          // Combine the waves with a beating effect
          const combinedWave = (leftWave + rightWave) / 2;
          const y = height / 2 + combinedWave * height * amplitude;
          
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, baseFreq, beatFreq]);

  const togglePlay = () => {
    if (!isPlaying) {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || (window as unknown as WindowWithWebkit).webkitAudioContext)();
        merger.current = audioCtx.current.createChannelMerger(2);
        merger.current.connect(audioCtx.current.destination);
      }

      leftOsc.current = audioCtx.current.createOscillator();
      rightOsc.current = audioCtx.current.createOscillator();
      leftGain.current = audioCtx.current.createGain();
      rightGain.current = audioCtx.current.createGain();

      leftOsc.current.frequency.value = baseFreq;
      rightOsc.current.frequency.value = baseFreq + beatFreq;

      leftGain.current.gain.value = volume;
      rightGain.current.gain.value = volume;

      if (merger.current) {
        leftOsc.current.connect(leftGain.current);
        rightOsc.current.connect(rightGain.current);
        leftGain.current.connect(merger.current, 0, 0);
        rightGain.current.connect(merger.current, 0, 1);

        leftOsc.current.start();
        rightOsc.current.start();
      }
    } else {
      leftOsc.current?.stop();
      rightOsc.current?.stop();
      leftOsc.current = null;
      rightOsc.current = null;
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying && leftGain.current && rightGain.current) {
      leftGain.current.gain.value = volume;
      rightGain.current.gain.value = volume;
    }
  }, [volume, isPlaying]);

  useEffect(() => {
    if (isPlaying && leftOsc.current && rightOsc.current) {
      leftOsc.current.frequency.value = baseFreq;
      rightOsc.current.frequency.value = baseFreq + beatFreq;
    }
  }, [baseFreq, beatFreq, isPlaying]);

  const downloadWave = () => {
    if (!canvasRef.current) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = `wave-${baseFreq}-${beatFreq}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0f172a] h-[calc(100vh-4rem)] p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="aspect-[2/1] w-full bg-cyan-500/5 rounded-xl border border-cyan-500/10 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full h-full"
          />
          <button
            onClick={downloadWave}
            className="absolute top-3 right-3 p-2 rounded-lg transition-colors hover:bg-white/5 text-white/50 hover:text-white/90"
            title="Download wave screenshot"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4 bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10">
            <div>
              <label className="block text-sm mb-1 text-cyan-400/70">Base Frequency: {baseFreq}Hz</label>
              <input
                type="range"
                min="20"
                max="500"
                value={baseFreq}
                onChange={(e) => setBaseFreq(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-cyan-400/70">Beat Frequency: {beatFreq}Hz</label>
              <input
                type="range"
                min="1"
                max="30"
                value={beatFreq}
                onChange={(e) => setBeatFreq(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-cyan-400/70">Volume: {(volume * 100).toFixed(0)}%</label>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400/70" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10">
            <div>
              <label className="block text-sm mb-1 text-cyan-400/70">Presets</label>
              <div className="space-y-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setSelectedPreset(preset.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedPreset === preset.name
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "hover:bg-cyan-500/10 text-white"
                    }`}
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs opacity-60">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={togglePlay}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              isPlaying
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
            }`}
          >
            <div className="flex items-center gap-2">
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Generate
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
