import { create } from 'zustand';
import { Alarm, AlarmSound } from './types';

const STORAGE_KEY = 'alarm_state';

interface AlarmState {
  alarms: Alarm[];
  availableSounds: AlarmSound[];
  recentAlarms: Alarm[];
  activeAlarmId: string | null;
  addAlarm: (alarm: Alarm) => void;
  removeAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  setAvailableSounds: (sounds: AlarmSound[]) => void;
  setActiveAlarmId: (id: string | null) => void;
  removeRecentAlarm: (id: string) => void;
  clearRecentAlarms: () => void;
}

// Load initial state from localStorage
const loadInitialState = () => {
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (savedState) {
    const { alarms, recentAlarms, activeAlarmId } = JSON.parse(savedState);
    return {
      alarms: alarms || [],
      recentAlarms: recentAlarms || [],
      activeAlarmId: activeAlarmId || null
    };
  }
  return { alarms: [], recentAlarms: [], activeAlarmId: null };
};

// Save state to localStorage
const saveState = (state: Pick<AlarmState, 'alarms' | 'recentAlarms' | 'activeAlarmId'>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const { alarms: initialAlarms, recentAlarms: initialRecentAlarms, activeAlarmId: initialActiveAlarmId } = loadInitialState();

export const useAlarmStore = create<AlarmState>((set) => ({
  alarms: initialAlarms,
  availableSounds: [],
  recentAlarms: initialRecentAlarms,
  activeAlarmId: initialActiveAlarmId,
  
  addAlarm: (alarm) => set((state) => {
    const newState = {
      alarms: [...state.alarms, alarm],
      recentAlarms: [alarm, ...state.recentAlarms].slice(0, 5) // Keep last 5 alarms
    };
    saveState({ ...newState, activeAlarmId: state.activeAlarmId });
    return newState;
  }),
  
  removeAlarm: (id) => set((state) => {
    const newState = {
      alarms: state.alarms.filter(alarm => alarm.id !== id),
      activeAlarmId: state.activeAlarmId === id ? null : state.activeAlarmId
    };
    saveState({ ...newState, recentAlarms: state.recentAlarms });
    return newState;
  }),
  
  toggleAlarm: (id) => set((state) => {
    const newState = {
      alarms: state.alarms.map(alarm =>
        alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
      )
    };
    saveState({ ...newState, recentAlarms: state.recentAlarms, activeAlarmId: state.activeAlarmId });
    return newState;
  }),
  
  updateAlarm: (id, updates) => set((state) => {
    const newState = {
      alarms: state.alarms.map(alarm =>
        alarm.id === id ? { ...alarm, ...updates } : alarm
      )
    };
    saveState({ ...newState, recentAlarms: state.recentAlarms, activeAlarmId: state.activeAlarmId });
    return newState;
  }),
  
  setAvailableSounds: (sounds) => set({ availableSounds: sounds }),

  setActiveAlarmId: (id) => set((state) => {
    const newState = { activeAlarmId: id };
    saveState({ ...state, ...newState });
    return newState;
  }),

  removeRecentAlarm: (id) => set((state) => {
    const newState = {
      recentAlarms: state.recentAlarms.filter(alarm => alarm.id !== id)
    };
    saveState({ ...state, ...newState });
    return newState;
  }),

  clearRecentAlarms: () => set((state) => {
    const newState = {
      recentAlarms: []
    };
    saveState({ ...state, ...newState });
    return newState;
  })
}));
