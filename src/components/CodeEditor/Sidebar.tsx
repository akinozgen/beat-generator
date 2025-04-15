import { useState } from 'react';
import { useEditorStore } from './store';
import { FileEntry } from './types';
import { ChevronDown, ChevronRight, File, Folder, FolderOpen, Edit3, Trash2, Search, Plus, Minus, PlusSquare } from 'lucide-react';
import { isBinaryFile, readFileContent, getFileLanguage } from './utils';
import SearchModal from './SearchModal';

interface FileTreeItemProps {
  entry: FileEntry;
  depth: number;
}

function FileTreeItem({ entry, depth }: FileTreeItemProps) {
  const { addTab, setActiveTab, toggleDirectory, closeTab, refreshFileTree, rootHandle } = useEditorStore();
  const [showActions, setShowActions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');

  const handleFileClick = async (entry: FileEntry) => {
    if (!entry.isDirectory && entry.handle) {
      const fileHandle = entry.handle as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      
      if (isBinaryFile(entry.name)) {
        addTab({
          path: entry.path,
          content: '',
          handle: fileHandle,
          isModified: false,
          language: 'plaintext',
          file
        });
      } else {
        const content = await readFileContent(fileHandle);
        addTab({
          path: entry.path,
          content,
          handle: fileHandle,
          isModified: false,
          language: getFileLanguage(entry.name)
        });
      }
      
      setActiveTab(entry.path);
    }
  };

  const handleRename = async () => {
    if (!entry.handle || !newName.trim() || !rootHandle) return;
    
    try {
      const parts = entry.path.split('/');
      let currentHandle = rootHandle;
      
      // Navigate to parent directory
      for (const part of parts.slice(0, -1)) {
        currentHandle = await currentHandle.getDirectoryHandle(part);
      }

      // Create new handle with new name
      if (entry.isDirectory) {
        const newDirHandle = await currentHandle.getDirectoryHandle(newName, { create: true });
        const dirHandle = entry.handle as FileSystemDirectoryHandle;
        
        // Copy all contents
        for await (const [name, handle] of dirHandle.entries()) {
          if (handle.kind === 'file') {
            const file = await (handle as FileSystemFileHandle).getFile();
            const newFileHandle = await newDirHandle.getFileHandle(name, { create: true });
            const writable = await newFileHandle.createWritable();
            await writable.write(file);
            await writable.close();
          } else {
            const subDirHandle = await newDirHandle.getDirectoryHandle(name, { create: true });
            const oldSubDirHandle = handle as FileSystemDirectoryHandle;
            for await (const [subName, subHandle] of oldSubDirHandle.entries()) {
              if (subHandle.kind === 'file') {
                const file = await (subHandle as FileSystemFileHandle).getFile();
                const newSubFileHandle = await subDirHandle.getFileHandle(subName, { create: true });
                const writable = await newSubFileHandle.createWritable();
                await writable.write(file);
                await writable.close();
              }
            }
          }
        }
        await currentHandle.removeEntry(entry.name, { recursive: true });
      } else {
        const file = await (entry.handle as FileSystemFileHandle).getFile();
        const newFileHandle = await currentHandle.getFileHandle(newName, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(file);
        await writable.close();
        await currentHandle.removeEntry(entry.name);
        closeTab(entry.path);
      }
      
      setIsRenaming(false);
      setNewName('');
      await refreshFileTree();
    } catch (error) {
      console.error('Failed to rename:', error);
    }
  };

  const handleDelete = async () => {
    if (!entry.handle || !rootHandle) return;
    
    if (!confirm(`Are you sure you want to delete ${entry.name}?`)) return;
    
    try {
      const parts = entry.path.split('/');
      let currentHandle = rootHandle;
      
      // Navigate to parent directory
      for (const part of parts.slice(0, -1)) {
        currentHandle = await currentHandle.getDirectoryHandle(part);
      }
      
      await currentHandle.removeEntry(entry.name, { recursive: true });
      
      if (!entry.isDirectory) {
        closeTab(entry.path);
      }
      
      await refreshFileTree();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div 
        className="flex items-center group px-2 py-1 rounded-lg hover:bg-white/5 cursor-pointer select-none"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={(e) => {
          e.stopPropagation();
          if (entry.isDirectory) {
            toggleDirectory(entry.path);
          } else {
            handleFileClick(entry);
          }
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {entry.isDirectory ? (
            <>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDirectory(entry.path);
                }}
                className="p-0.5 hover:bg-white/10 rounded cursor-pointer"
              >
                {entry.isOpen ? (
                  <ChevronDown className="w-4 h-4 text-white/50" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white/50" />
                )}
              </div>
              {entry.isOpen ? (
                <FolderOpen className="w-4 h-4 text-yellow-400/70" />
              ) : (
                <Folder className="w-4 h-4 text-yellow-400/70" />
              )}
            </>
          ) : (
            <File className="w-4 h-4 text-cyan-400/70" />
          )}
          
          {isRenaming ? (
            <form
              className="flex-1"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRename();
              }}
            >
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => {
                  if (newName.trim()) {
                    handleRename();
                  } else {
                    setIsRenaming(false);
                    setNewName('');
                  }
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Escape') {
                    setIsRenaming(false);
                    setNewName('');
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-black/30 px-1 rounded border border-white/20 text-white/70 text-sm"
                autoFocus
              />
            </form>
          ) : (
            <span className="truncate text-white/70">{entry.name}</span>
          )}
        </div>

        {showActions && !isRenaming && (
          <div className="flex items-center gap-1 z-10">
            <div 
              className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setNewName(entry.name);
                setIsRenaming(true);
              }}
            >
              <Edit3 className="w-3.5 h-3.5 text-white/50" />
            </div>
            <div 
              className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              <Trash2 className="w-3.5 h-3.5 text-white/50" />
            </div>
          </div>
        )}
      </div>

      {entry.isDirectory && entry.isOpen && entry.children && (
        <div>
          {entry.children.map((child) => (
            <FileTreeItem key={child.path} entry={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { fileTree, toggleDirectory, rootHandle, refreshFileTree } = useEditorStore();
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingDirectory, setIsCreatingDirectory] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const handleCreateNewItem = async (isDirectory: boolean) => {
    if (!rootHandle || !newItemName.trim()) return;

    try {
      if (isDirectory) {
        await rootHandle.getDirectoryHandle(newItemName, { create: true });
      } else {
        await rootHandle.getFileHandle(newItemName, { create: true });
      }
      
      setNewItemName('');
      setIsCreatingFile(false);
      setIsCreatingDirectory(false);
      await refreshFileTree();
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  const handleExpandAll = () => {
    const expandAll = (entries: FileEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isDirectory) {
          toggleDirectory(entry.path);
          if (entry.children) {
            expandAll(entry.children);
          }
        }
      });
    };
    expandAll(fileTree);
  };

  const handleCollapseAll = () => {
    const collapseAll = (entries: FileEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isDirectory && entry.isOpen) {
          toggleDirectory(entry.path);
          if (entry.children) {
            collapseAll(entry.children);
          }
        }
      });
    };
    collapseAll(fileTree);
  };

  return (
    <div className="w-64 flex flex-col border-r border-white/10">
      <div className="flex flex-col gap-2 p-2">
        <div 
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 text-sm cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Search files...</span>
        </div>

        <div className="flex items-center gap-1 px-1">
          <div 
            onClick={handleExpandAll}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 cursor-pointer"
            title="Expand all"
          >
            <Plus className="w-4 h-4" />
          </div>
          <div 
            onClick={handleCollapseAll}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 cursor-pointer"
            title="Collapse all"
          >
            <Minus className="w-4 h-4" />
          </div>
          <div className="flex-1" />
          <div 
            onClick={() => setIsCreatingFile(true)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 cursor-pointer"
            title="New file"
          >
            <File className="w-4 h-4" />
          </div>
          <div 
            onClick={() => setIsCreatingDirectory(true)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 cursor-pointer"
            title="New folder"
          >
            <PlusSquare className="w-4 h-4" />
          </div>
        </div>

        {(isCreatingFile || isCreatingDirectory) && (
          <form
            className="px-1"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateNewItem(isCreatingDirectory);
            }}
          >
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onBlur={() => {
                if (newItemName.trim()) {
                  handleCreateNewItem(isCreatingDirectory);
                } else {
                  setIsCreatingFile(false);
                  setIsCreatingDirectory(false);
                  setNewItemName('');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsCreatingFile(false);
                  setIsCreatingDirectory(false);
                  setNewItemName('');
                }
              }}
              className="w-full bg-black/30 px-2 py-1 rounded border border-white/20 text-white/70 text-sm"
              placeholder={isCreatingDirectory ? 'Folder name...' : 'File name...'}
              autoFocus
            />
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {fileTree.map((entry) => (
          <FileTreeItem key={entry.path} entry={entry} depth={0} />
        ))}
      </div>

      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
