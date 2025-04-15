export interface Alarm {
  id: string;
  time: string; // HH:mm format
  title: string;
  soundUrl: string;
  enabled: boolean;
  customSound?: File;
  lastTriggeredTime?: string;
}

export interface AlarmSound {
  id: string;
  name: string;
  url: string;
}
