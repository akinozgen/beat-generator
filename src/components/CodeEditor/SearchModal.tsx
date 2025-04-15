import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useEditorStore } from './store';
import { findEntryByPath, getFileLanguage } from './utils';
import { FileEntry } from './types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const { fileTree, addTab, setActiveTab } = useEditorStore();

  useEffect(() => {
    const searchFiles = (entries: FileEntry[], searchQuery: string): string[] => {
      let matches: string[] = [];
      
      for (const entry of entries) {
        if (!entry.isDirectory && entry.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          matches.push(entry.path);
        }
        if (entry.children) {
          matches = [...matches, ...searchFiles(entry.children, searchQuery)];
        }
      }
      
      return matches;
    };

    if (query) {
      setResults(searchFiles(fileTree, query));
    } else {
      setResults([]);
    }
  }, [query, fileTree]);

  const handleFileSelect = async (path: string) => {
    const entry = findEntryByPath(fileTree, path);
    if (!entry || !entry.handle || entry.isDirectory) return;

    const fileHandle = entry.handle as FileSystemFileHandle;
    const file = await fileHandle.getFile();
    const content = await file.text();

    addTab({
      path,
      content,
      handle: fileHandle,
      isModified: false,
      language: getFileLanguage(entry.name)
    });
    
    setActiveTab(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]">
      <div className="w-[500px] bg-zinc-900 rounded-lg shadow-xl border border-white/10">
        <div className="flex items-center gap-2 p-4 border-b border-white/10">
          <Search className="w-5 h-5 text-white/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files..."
            className="flex-1 bg-transparent border-none outline-none text-white/70"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {results.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto">
            {results.map((path) => (
              <button
                key={path}
                onClick={() => handleFileSelect(path)}
                className="w-full px-4 py-2 hover:bg-white/5 text-left text-white/70 text-sm"
              >
                {path}
              </button>
            ))}
          </div>
        ) : query && (
          <div className="p-4 text-sm text-white/50">
            No files found
          </div>
        )}
      </div>
    </div>
  );
}
