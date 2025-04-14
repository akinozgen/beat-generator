import { useEffect, useRef, useState, useCallback } from "react";

interface Key {
  key: string;
  note: string;
  freq: number;
}

interface OscillatorRefs {
  [key: string]: OscillatorNode;
}

interface GainRefs {
  [key: string]: GainNode;
}

const keys: Key[] = [
  { key: "A", note: "C", freq: 261.63 },
  { key: "S", note: "D", freq: 293.66 },
  { key: "D", note: "E", freq: 329.63 },
  { key: "F", note: "F", freq: 349.23 },
  { key: "G", note: "G", freq: 392.0 },
  { key: "H", note: "A", freq: 440.0 },
  { key: "J", note: "B", freq: 493.88 },
  { key: "K", note: "C+", freq: 523.25 },
  { key: "L", note: "D+", freq: 587.33 },
];

export default function VirtualPiano() {
  const audioCtx = useRef<AudioContext | null>(null);
  const oscRefs = useRef<OscillatorRefs>({});
  const gainRefs = useRef<GainRefs>({});
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [oscType, setOscType] = useState<OscillatorType>("sine");
  const [volume, setVolume] = useState(0.3);

  const playNote = useCallback(({ freq, key }: Key) => {
    if (!audioCtx.current)
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();

    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    osc.type = oscType;
    osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.current.currentTime);

    osc.connect(gain).connect(audioCtx.current.destination);
    osc.start();

    oscRefs.current[key] = osc;
    gainRefs.current[key] = gain;
    setActiveKey(key);
  }, [oscType, volume]);

  const stopNote = useCallback((key: string) => {
    const osc = oscRefs.current[key];
    const gain = gainRefs.current[key];
    if (osc && gain && audioCtx.current) {
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + 0.5);
      osc.stop(audioCtx.current.currentTime + 0.5);
      delete oscRefs.current[key];
      delete gainRefs.current[key];
      setActiveKey(null);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const upper = e.key.toUpperCase();
      const key = keys.find((k) => k.key === upper);
      if (key && !oscRefs.current[key.key]) {
        playNote(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const upper = e.key.toUpperCase();
      stopNote(upper);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [playNote, stopNote]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-8 space-y-8">
      <div className="grid grid-cols-9 gap-2">
        {keys.map(({ key, note, freq }) => (
          <button
            key={key}
            onMouseDown={() => playNote({ freq, key, note })}
            onMouseUp={() => stopNote(key)}
            onMouseLeave={() => stopNote(key)}
            className={`h-40 w-16 rounded-md text-sm font-bold transition-all duration-150 border border-cyan-500/20 ${
              activeKey === key 
                ? "bg-cyan-400 text-[#0f172a] scale-105 shadow-lg shadow-cyan-400/20" 
                : "bg-white/90 text-[#0f172a] hover:bg-cyan-100"
            }`}
          >
            <div>{note}</div>
            <div className="text-xs opacity-60">{key}</div>
          </button>
        ))}
      </div>

      <div className="w-full max-w-xl space-y-4 bg-cyan-500/5 p-4 rounded-xl text-white border border-cyan-500/10">
        <div>
          <label className="block text-sm mb-1 text-cyan-400/70">Oscillator Type</label>
          <select
            value={oscType}
            onChange={(e) => setOscType(e.target.value as OscillatorType)}
            className="w-full bg-[#0f172a] rounded p-2 text-white border border-cyan-500/20 focus:border-cyan-500/40 focus:outline-none"
          >
            <option value="sine">Sine</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
            <option value="sawtooth">Sawtooth</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1 text-cyan-400/70">Volume: {(volume * 100).toFixed(0)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
      </div>
    </div>
  );
}
