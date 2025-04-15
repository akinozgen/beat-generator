import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flag, Save, Clock, Trash2 } from 'lucide-react';
import { Dialog } from '@headlessui/react';

interface SavedSession {
  id: string;
  title: string;
  totalTime: number;
  checkpoints: { time: number; label: string }[];
  savedAt: string;
}

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [checkpoints, setCheckpoints] = useState<{ time: number; label: string }[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SavedSession | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Load saved sessions on mount
  useEffect(() => {
    const saved = localStorage.getItem('stopwatch_sessions');
    if (saved) {
      setSavedSessions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime(t => t + 10);
      }, 10);
    } else if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handleCheckpoint = () => {
    setCheckpoints(prev => [...prev, { time, label: `Checkpoint ${prev.length + 1}` }]);
  };

  const handleReset = () => {
    setTime(0);
    setIsRunning(false);
    setCheckpoints([]);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
  };

  const handleSave = () => {
    if (!sessionTitle.trim()) return;

    const newSession: SavedSession = {
      id: Date.now().toString(),
      title: sessionTitle,
      totalTime: time,
      checkpoints,
      savedAt: new Date().toISOString()
    };

    const updatedSessions = [...savedSessions, newSession];
    localStorage.setItem('stopwatch_sessions', JSON.stringify(updatedSessions));
    setSavedSessions(updatedSessions);
    setIsSaveModalOpen(false);
    setSessionTitle('');
  };

  const handleViewSession = (session: SavedSession) => {
    setSelectedSession(session);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Timer Display */}
      <div className="text-center">
        <div className="text-5xl font-mono text-cyan-400 mb-4">
          {formatTime(time)}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400"
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={handleCheckpoint}
            disabled={!isRunning}
            className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 disabled:opacity-50"
          >
            <Flag className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Current Checkpoints */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-cyan-400/70">Current Session</h3>
          {checkpoints.length > 0 && (
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="p-1.5 rounded-lg text-cyan-400/70 hover:text-cyan-400 hover:bg-white/5"
              title="Save session"
            >
              <Save className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {checkpoints.map((checkpoint, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-cyan-500/10"
            >
              <div className="text-sm text-cyan-400/70">{checkpoint.label}</div>
              <div className="font-mono text-cyan-400">{formatTime(checkpoint.time)}</div>
            </div>
          ))}
          {checkpoints.length === 0 && (
            <div className="text-center py-8 text-cyan-400/30">
              No checkpoints yet
            </div>
          )}
        </div>
      </div>

      {/* Saved Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400/70">
            <Clock className="w-4 h-4" />
            <h3 className="text-sm font-medium">Saved Sessions</h3>
          </div>
          {savedSessions.length > 0 && (
            <button
              onClick={() => {
                localStorage.removeItem('stopwatch_sessions');
                setSavedSessions([]);
              }}
              className="p-1.5 rounded-lg text-cyan-400/70 hover:text-red-400 hover:bg-white/5"
              title="Clear all sessions"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {savedSessions.map(session => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-cyan-500/10 hover:bg-white/10 group"
            >
              <button
                onClick={() => handleViewSession(session)}
                className="flex-1 flex items-center justify-between"
              >
                <div className="text-left">
                  <div className="text-cyan-400">{session.title}</div>
                  <div className="text-sm text-cyan-400/50">
                    {new Date(session.savedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-mono text-cyan-400">{formatTime(session.totalTime)}</div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const updatedSessions = savedSessions.filter(s => s.id !== session.id);
                  localStorage.setItem('stopwatch_sessions', JSON.stringify(updatedSessions));
                  setSavedSessions(updatedSessions);
                }}
                className="ml-4 p-1.5 rounded-lg text-cyan-400/30 hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete session"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {savedSessions.length === 0 && (
            <div className="text-center py-8 text-cyan-400/30">
              No saved sessions
            </div>
          )}
        </div>
      </div>

      {/* Save Modal */}
      <Dialog
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm bg-[#0f172a] rounded-lg shadow-lg p-6">
            <Dialog.Title className="text-lg font-medium text-cyan-400 mb-4">
              Save Session
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-cyan-400/70 mb-2">Session Title</label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-cyan-500/5 border border-cyan-500/10 rounded-lg text-cyan-400 focus:outline-none focus:border-cyan-500/20"
                  placeholder="Enter a title for this session"
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSaveModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-cyan-500/10 rounded-lg text-cyan-400/70 hover:bg-cyan-500/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg text-cyan-400"
                >
                  Save
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* View Session Modal */}
      <Dialog
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-[#0f172a] rounded-lg shadow-lg p-6">
            <Dialog.Title className="text-lg font-medium text-cyan-400 mb-1">
              {selectedSession?.title}
            </Dialog.Title>
            <div className="text-sm text-cyan-400/50 mb-4">
              Total Time: {selectedSession ? formatTime(selectedSession.totalTime) : ''}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedSession?.checkpoints.map((checkpoint, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-cyan-500/10"
                >
                  <div className="text-sm text-cyan-400/70">{checkpoint.label}</div>
                  <div className="font-mono text-cyan-400">{formatTime(checkpoint.time)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="w-full px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg text-cyan-400"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
