import { AlarmSound } from './types';

export const loadAlarmSounds = async (): Promise<AlarmSound[]> => {
  // This would typically load from your assets directory
  // For now, returning a mock list
  return [
    {
      id: 'default',
      name: 'Default Alarm',
      url: '/src/assets/alarms/default.mp3'
    },
    {
      id: 'classic',
      name: 'Classic Bell',
      url: '/src/assets/alarms/classic.mp3'
    },
    {
      id: 'chiptune',
      name: 'Chiptune',
      url: '/src/assets/alarms/chiptune.mp3'
    }
  ];
};
