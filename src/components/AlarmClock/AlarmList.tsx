import { useAlarmStore } from './store';
import { Switch } from '@headlessui/react';
import { Trash2 } from 'lucide-react';

export default function AlarmList() {
  const { alarms, toggleAlarm, removeAlarm } = useAlarmStore();

  return (
    <div className="w-full max-w-md mt-8">
      <h2 className="text-xl mb-4">Kurulu Alarmlar</h2>
      
      <div className="space-y-3">
        {alarms.map(alarm => (
          <div 
            key={alarm.id}
            className="flex items-center justify-between bg-gray-800 p-4 rounded-lg"
          >
            <div>
              <div className="text-lg font-mono">{alarm.time}</div>
              <div className="text-sm text-gray-400">{alarm.title}</div>
            </div>
            
            <div className="flex items-center gap-4">
              <Switch
                checked={alarm.enabled}
                onChange={() => toggleAlarm(alarm.id)}
                className={`${
                  alarm.enabled ? 'bg-blue-600' : 'bg-gray-600'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
              >
                <span
                  className={`${
                    alarm.enabled ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              
              <button
                onClick={() => removeAlarm(alarm.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
