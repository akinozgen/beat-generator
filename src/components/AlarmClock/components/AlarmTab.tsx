import { useState, useEffect, useRef, useCallback } from 'react';
import { useAlarmStore } from '../store';
import { format, parseISO, isSameMinute } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { loadAlarmSounds } from '../utils';
import { Clock, Bell, Plus, Volume2, Trash2, X } from 'lucide-react';
import { Dialog } from '@headlessui/react';

export default function AlarmTab() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isNewAlarmModalOpen, setIsNewAlarmModalOpen] = useState(false);
  const [hour, setHour] = useState(format(new Date(), 'HH'));
  const [minute, setMinute] = useState(format(new Date(), 'mm'));
  const [title, setTitle] = useState('Alarm');
  const [selectedSound, setSelectedSound] = useState('');
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { 
    alarms, 
    availableSounds, 
    recentAlarms,
    activeAlarmId,
    addAlarm, 
    setAvailableSounds, 
    toggleAlarm, 
    removeAlarm,
    setActiveAlarmId,
    updateAlarm,
    removeRecentAlarm,
    clearRecentAlarms
  } = useAlarmStore();

  // Load available sounds on mount
  useEffect(() => {
    loadAlarmSounds().then(setAvailableSounds);
  }, [setAvailableSounds]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const playAlarm = useCallback((id: string, soundUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = soundUrl;
      audioRef.current.volume = volume;
      audioRef.current.play();
      setActiveAlarmId(id);
    }
  }, [volume, setActiveAlarmId]);

  // Check for alarms every second
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const currentISOTime = now.toISOString();
      
      alarms.forEach(alarm => {
        if (alarm.enabled && 
            alarm.time === currentTime && 
            !activeAlarmId &&
            (!alarm.lastTriggeredTime || !isSameMinute(parseISO(alarm.lastTriggeredTime), now))) {
          updateAlarm(alarm.id, { lastTriggeredTime: currentISOTime });
          playAlarm(alarm.id, alarm.soundUrl);
        }
      });
    };

    const timer = setInterval(checkAlarms, 1000);
    return () => clearInterval(timer);
  }, [alarms, activeAlarmId, playAlarm, updateAlarm]);

  const handleNewAlarm = () => {
    setHour(format(new Date(), 'HH'));
    setMinute(format(new Date(), 'mm'));
    setTitle('Alarm');
    setSelectedSound('');
    setIsNewAlarmModalOpen(true);
  };

  const handleSaveAlarm = () => {
    const newAlarm = {
      id: uuidv4(),
      time: `${hour}:${minute}`,
      title,
      enabled: true,
      soundUrl: selectedSound || availableSounds[0]?.url
    };
    
    addAlarm(newAlarm);
    setIsNewAlarmModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-5xl font-mono text-cyan-400">
          {format(currentTime, 'HH:mm:ss')}
        </div>
        <div className="text-sm text-cyan-400/50 mt-2">
          {format(currentTime, 'EEEE, MMMM d')}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Active Alarms */}
        <div className="space-y-4 bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10 h-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400/70">
              <Bell className="w-4 h-4" />
              <h2 className="text-xs font-medium uppercase tracking-wider">Active Alarms</h2>
            </div>
            <button
              onClick={handleNewAlarm}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5 text-cyan-400/70 hover:text-cyan-400"
              title="Add new alarm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {alarms.length === 0 ? (
            <div className="text-center py-8 text-cyan-400/30">
              No alarms set
            </div>
          ) : (
            <div className="space-y-2">
              {alarms.map(alarm => (
                <div
                  key={alarm.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-cyan-500/10"
                >
                  <div>
                    <div className="font-mono text-lg text-cyan-400">{alarm.time}</div>
                    <div className="text-sm text-cyan-400/50">{alarm.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlarm(alarm.id)}
                      className={`p-1.5 rounded-lg transition-colors hover:bg-white/5 
                        ${alarm.enabled ? 'text-cyan-400' : 'text-cyan-400/30'}`}
                      title={alarm.enabled ? 'Disable alarm' : 'Enable alarm'}
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeAlarm(alarm.id)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-white/5 text-cyan-400/70 hover:text-red-400"
                      title="Remove alarm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Alarms */}
        <div className="space-y-4 bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10 h-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400/70">
              <Clock className="w-4 h-4" />
              <h2 className="text-xs font-medium uppercase tracking-wider">Recent Alarms</h2>
            </div>
            <button
              onClick={clearRecentAlarms}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5 text-cyan-400/70 hover:text-cyan-400"
              title="Clear all recent alarms"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {recentAlarms.length === 0 ? (
            <div className="text-center py-8 text-cyan-400/30">
              No recent alarms
            </div>
          ) : (
            <div className="space-y-2">
              {recentAlarms.map(alarm => (
                <div
                  key={alarm.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-cyan-500/10"
                >
                  <div>
                    <div className="font-mono text-lg text-cyan-400">{alarm.time}</div>
                    <div className="text-sm text-cyan-400/50">{alarm.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setHour(alarm.time.split(':')[0]);
                        setMinute(alarm.time.split(':')[1]);
                        setTitle(alarm.title);
                        setSelectedSound(alarm.soundUrl);
                        setIsNewAlarmModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg transition-colors hover:bg-white/5 text-cyan-400/70 hover:text-cyan-400"
                      title="Use this alarm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeRecentAlarm(alarm.id)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-white/5 text-cyan-400/70 hover:text-red-400"
                      title="Remove from recent"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4 bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400/70">
            <Volume2 className="w-4 h-4" />
            <h2 className="text-xs font-medium uppercase tracking-wider">Settings</h2>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white/5 border border-cyan-500/10">
          <label className="block text-sm text-cyan-400/70 mb-2">Volume</label>
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-cyan-400/70" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 accent-cyan-400"
            />
            <span className="text-sm text-cyan-400/70 w-12 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* New Alarm Modal */}
      <Dialog
        open={isNewAlarmModalOpen}
        onClose={() => setIsNewAlarmModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm bg-[#0f172a] rounded-lg shadow-lg p-6">
            <Dialog.Title className="text-lg font-medium text-cyan-400 mb-4">
              Set New Alarm
            </Dialog.Title>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-cyan-400/70 mb-2">Hour</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={hour}
                    onChange={(e) => setHour(e.target.value.padStart(2, '0'))}
                    className="w-full px-3 py-2 bg-cyan-500/5 border border-cyan-500/10 rounded-lg text-cyan-400 focus:outline-none focus:border-cyan-500/20"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-cyan-400/70 mb-2">Minute</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minute}
                    onChange={(e) => setMinute(e.target.value.padStart(2, '0'))}
                    className="w-full px-3 py-2 bg-cyan-500/5 border border-cyan-500/10 rounded-lg text-cyan-400 focus:outline-none focus:border-cyan-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-cyan-400/70 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-cyan-500/5 border border-cyan-500/10 rounded-lg text-cyan-400 focus:outline-none focus:border-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-sm text-cyan-400/70 mb-2">Sound</label>
                <select
                  value={selectedSound}
                  onChange={(e) => setSelectedSound(e.target.value)}
                  className="w-full px-3 py-2 bg-cyan-500/5 border border-cyan-500/10 rounded-lg text-cyan-400 focus:outline-none focus:border-cyan-500/20"
                >
                  {availableSounds.map(sound => (
                    <option key={sound.id} value={sound.url}>
                      {sound.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsNewAlarmModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-cyan-500/10 rounded-lg text-cyan-400/70 hover:bg-cyan-500/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAlarm}
                  className="flex-1 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg text-cyan-400"
                >
                  Save Alarm
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <audio ref={audioRef} loop />
    </div>
  );
}
