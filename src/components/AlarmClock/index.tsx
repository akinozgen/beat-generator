import { useState } from 'react';
import { AlarmCheck, Timer, Globe } from 'lucide-react';
import { Tab } from '@headlessui/react';
import AlarmTab from './components/AlarmTab';
import Stopwatch from './components/Stopwatch';
import WorldTime from './components/WorldTime';

const TABS = [
  { id: 'alarm', name: 'Alarm', icon: AlarmCheck, component: AlarmTab },
  { id: 'stopwatch', name: 'Stopwatch', icon: Timer, component: Stopwatch },
  { id: 'worldtime', name: 'World Time', icon: Globe, component: WorldTime },
] as const;

export default function AlarmClock() {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0f172a] h-[calc(100vh-4rem)] p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="max-w-4xl mx-auto bg-[#1a2234] rounded-lg shadow-lg">
          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <Tab.List className="flex border-b border-cyan-500/10">
              {TABS.map(({ id, name, icon: Icon }) => (
                <Tab
                  key={id}
                  className={({ selected }) => `
                    flex-1 flex items-center justify-center gap-2 px-4 py-3
                    text-sm font-medium outline-none
                    ${selected 
                      ? 'text-cyan-400 border-b-2 border-cyan-400' 
                      : 'text-cyan-400/50 hover:text-cyan-400/70'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {name}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels className="p-6">
              {TABS.map(({ id, component: Component }) => (
                <Tab.Panel key={id}>
                  <Component />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
}
