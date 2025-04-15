import { create } from 'zustand';
import type { EditorState, EditorTab, FileEntry } from './types';
import { buildFileTree } from './utils';

export const useEditorStore = create<EditorState>((set, get) => ({
  fileTree: [],
  openTabs: [],
  activeTab: null,
  rootHandle: null,
  openDirectories: new Set<string>(),

  toggleDirectory: (path: string) => {
    set((state) => {
      const newOpenDirectories = new Set(state.openDirectories);
      if (newOpenDirectories.has(path)) {
        newOpenDirectories.delete(path);
      } else {
        newOpenDirectories.add(path);
      }

      // Update file tree to reflect open state
      const updateFileTree = (entries: FileEntry[]): FileEntry[] => {
        return entries.map((entry) => {
          if (entry.path === path) {
            return { ...entry, isOpen: !entry.isOpen };
          }
          if (entry.children) {
            return { ...entry, children: updateFileTree(entry.children) };
          }
          return entry;
        });
      };

      return {
        openDirectories: newOpenDirectories,
        fileTree: updateFileTree(state.fileTree),
      };
    });
  },

  closeTab: (path: string) => {
    set((state) => {
      const newTabs = state.openTabs.filter((tab) => tab.path !== path);
      let newActiveTab = state.activeTab;

      if (state.activeTab === path) {
        const index = state.openTabs.findIndex((tab) => tab.path === path);
        if (newTabs.length > 0) {
          if (index === state.openTabs.length - 1) {
            newActiveTab = newTabs[newTabs.length - 1].path;
          } else {
            newActiveTab = newTabs[index].path;
          }
        } else {
          newActiveTab = null;
        }
      }

      return {
        openTabs: newTabs,
        activeTab: newActiveTab,
      };
    });
  },

  addTab: (tab: EditorTab) =>
    set((state) => ({
      openTabs: state.openTabs.some((t) => t.path === tab.path)
        ? state.openTabs.map((t) => (t.path === tab.path ? tab : t))
        : [...state.openTabs, tab],
    })),

  setActiveTab: (path) => set({ activeTab: path }),
  setFileTree: (tree) => set({ fileTree: tree }),
  setRootHandle: (handle) => set({ rootHandle: handle }),
  
  updateTabContent: (path: string, content: string) => 
    set((state) => ({
      openTabs: state.openTabs.map((tab) =>
        tab.path === path ? { ...tab, content } : tab
      ),
    })),

  setTabModified: (path: string, isModified: boolean) =>
    set((state) => ({
      openTabs: state.openTabs.map((tab) =>
        tab.path === path ? { ...tab, isModified } : tab
      ),
    })),

  refreshFileTree: async () => {
    const { rootHandle, openDirectories } = get();
    if (!rootHandle) return;
    
    const newTree = await buildFileTree(rootHandle);
    
    // Mark directories as open based on saved state
    const markOpenDirectories = (entries: FileEntry[]) => {
      for (const entry of entries) {
        if (entry.isDirectory) {
          entry.isOpen = openDirectories.has(entry.path);
          if (entry.children) {
            markOpenDirectories(entry.children);
          }
        }
      }
    };
    
    markOpenDirectories(newTree);
    set({ fileTree: newTree });
  },
}));
