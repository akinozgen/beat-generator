import { useEffect, useRef, useCallback } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { FolderOpen, Save } from 'lucide-react';
import { useEditorStore } from './store';
import { buildFileTree, writeFileContent } from './utils';
import Sidebar from './Sidebar';
import TabBar from './TabBar';
import FilePreview from './FilePreview';

loader.config({ 
  paths: { 
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
  }
});

export default function CodeEditor() {
  const {
    setRootHandle,
    setFileTree,
    openTabs,
    activeTab,
    updateTabContent,
    setTabModified
  } = useEditorStore();
  
  const activeTabData = openTabs.find(tab => tab.path === activeTab);
  const saveTimeoutRef = useRef<number | undefined>(undefined);

  const handleOpenDirectory = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setRootHandle(handle);
      const tree = await buildFileTree(handle);
      setFileTree(tree);
    } catch (error) {
      console.error('Error opening directory:', error);
    }
  };

  const handleSaveFile = useCallback(async () => {
    if (!activeTabData) return;
    
    try {
      await writeFileContent(activeTabData.handle, activeTabData.content);
      setTabModified(activeTabData.path, false);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }, [activeTabData, setTabModified]);

  const handleEditorChange = (value: string = '') => {
    if (!activeTab) return;
    
    updateTabContent(activeTab, value);
    
    // Debounced modification flag
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = window.setTimeout(() => {
      setTabModified(activeTab, true);
    }, 500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSaveFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveFile]);

  return (
    <div className="flex-1 flex flex-col bg-[#0f172a] text-white h-[calc(100vh-4rem)]">
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenDirectory}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="text-sm">Open Folder</span>
          </button>
          
          {activeTabData?.isModified && (
            <button
              onClick={handleSaveFile}
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm">Save</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <TabBar />
          
          <div className="flex-1 min-h-0 relative">
            {activeTabData ? (
              activeTabData.file ? (
                <FilePreview 
                  file={activeTabData.file}
                  fileName={activeTabData.path.split('/').pop() || ''}
                />
              ) : (
                <Editor
                  height="100%"
                  theme="vs-dark"
                  path={activeTabData.path}
                  defaultLanguage={activeTabData.language}
                  value={activeTabData.content}
                  onChange={handleEditorChange}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    renderWhitespace: 'selection',
                    fontFamily: 'monospace',
                    tabSize: 2,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                  }}
                />
              )
            ) : (
              <div className="h-full flex items-center justify-center text-white/30">
                Open a folder to start editing
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
