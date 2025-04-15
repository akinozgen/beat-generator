export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileEntry[];
  handle: FileSystemHandle;
  isOpen?: boolean;
}

export interface Tab {
  path: string;
  content: string;
  handle: FileSystemFileHandle;
  isModified: boolean;
  language: string;
  file?: File;
}

export interface EditorState {
  fileTree: FileEntry[];
  openTabs: Tab[];
  activeTab: string | null;
  rootHandle: FileSystemDirectoryHandle | null;
  openDirectories: Set<string>;
  toggleDirectory: (path: string) => void;
  closeTab: (path: string) => void;
  addTab: (tab: Tab) => void;
  setActiveTab: (path: string | null) => void;
  setFileTree: (tree: FileEntry[]) => void;
  setRootHandle: (handle: FileSystemDirectoryHandle | null) => void;
  updateTabContent: (path: string, content: string) => void;
  setTabModified: (path: string, isModified: boolean) => void;
  refreshFileTree: () => Promise<void>;
}
