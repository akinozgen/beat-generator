import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

interface TimeZone {
  city: string;
  timezone: string;
  country: string;
  offset: string;
}

const TIMEZONES: TimeZone[] = [
  { city: 'London', timezone: 'Europe/London', country: 'UK', offset: '+0' },
  { city: 'New York', timezone: 'America/New_York', country: 'USA', offset: '-4' },
  { city: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Japan', offset: '+9' },
  { city: 'Sydney', timezone: 'Australia/Sydney', country: 'Australia', offset: '+10' },
  { city: 'Dubai', timezone: 'Asia/Dubai', country: 'UAE', offset: '+4' },
  { city: 'Paris', timezone: 'Europe/Paris', country: 'France', offset: '+2' },
  { city: 'Singapore', timezone: 'Asia/Singapore', country: 'Singapore', offset: '+8' },
  { city: 'Istanbul', timezone: 'Europe/Istanbul', country: 'Turkey', offset: '+3' },
];

export default function WorldTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeInTimezone = (timezone: string) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: timezone,
    };
    return new Intl.DateTimeFormat('en-US', options).format(currentTime);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {TIMEZONES.map((tz) => (
          <div
            key={tz.timezone}
            className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/10"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-cyan-400">{tz.city}</h3>
                <p className="text-sm text-cyan-400/50">{tz.country}</p>
              </div>
              <div className="flex items-center gap-1 text-cyan-400/50">
                <Globe className="w-4 h-4" />
                <span className="text-xs">UTC{tz.offset}</span>
              </div>
            </div>
            <div className="mt-2 font-mono text-2xl text-cyan-400">
              {getTimeInTimezone(tz.timezone)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
