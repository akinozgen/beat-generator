import { X } from 'lucide-react';
import { useEditorStore } from './store';

export default function TabBar() {
  const { openTabs, activeTab, setActiveTab, closeTab } = useEditorStore();

  const handleTabClick = (path: string) => {
    setActiveTab(path);
  };

  const handleMiddleClick = (e: React.MouseEvent, path: string) => {
    if (e.button === 1) {
      e.preventDefault();
      closeTab(path);
    }
  };

  return (
    <div className="h-10 flex items-center gap-1 px-2 bg-black/20 border-b border-white/10 overflow-x-auto">
      {openTabs.map((tab) => (
        <button
          key={tab.path}
          onClick={() => handleTabClick(tab.path)}
          onMouseDown={(e) => handleMiddleClick(e, tab.path)}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
            activeTab === tab.path
              ? 'bg-white/10 text-white'
              : 'text-white/50 hover:bg-white/5'
          }`}
        >
          <span className="truncate max-w-[12rem]">
            {tab.path.split('/').pop()}
          </span>
          {tab.isModified && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.path);
            }}
            className="p-0.5 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </button>
      ))}
    </div>
  );
}
