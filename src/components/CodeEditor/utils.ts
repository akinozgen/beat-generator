import { FileEntry } from './types';

export const getFileLanguage = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const languageMap: { [key: string]: string } = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'css': 'css',
    'scss': 'scss',
    'html': 'html',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'go': 'go',
    'rs': 'rust',
    'cpp': 'cpp',
    'c': 'c',
    'java': 'java',
    'kt': 'kotlin',
    'rb': 'ruby',
    'php': 'php',
    'swift': 'swift',
    'sh': 'shell',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'sql': 'sql',
  };
  return languageMap[ext || ''] || 'plaintext';
};

export const buildFileTree = async (
  handle: FileSystemDirectoryHandle,
  path = ''
): Promise<FileEntry[]> => {
  const entries: FileEntry[] = [];
  
  for await (const [name, childHandle] of handle.entries()) {
    const childPath = path ? `${path}/${name}` : name;
    
    if (childHandle.kind === 'file') {
      entries.push({
        name,
        path: childPath,
        isDirectory: false,
        handle: childHandle as FileSystemFileHandle,
      });
    } else {
      const children = await buildFileTree(childHandle as FileSystemDirectoryHandle, childPath);
      entries.push({
        name,
        path: childPath,
        isDirectory: true,
        isOpen: false,
        children,
        handle: childHandle as FileSystemDirectoryHandle,
      });
    }
  }
  
  return entries.sort((a, b) => {
    if (a.isDirectory === b.isDirectory) {
      return a.name.localeCompare(b.name);
    }
    return a.isDirectory ? -1 : 1;
  });
};

export const readFileContent = async (handle: FileSystemFileHandle): Promise<string> => {
  const file = await handle.getFile();
  return await file.text();
};

export const writeFileContent = async (
  handle: FileSystemFileHandle,
  content: string
): Promise<void> => {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
};

export const filterFileTree = (
  tree: FileEntry[],
  searchQuery: string
): FileEntry[] => {
  if (!searchQuery) return tree;
  
  return tree.reduce<FileEntry[]>((acc, entry) => {
    if (entry.isDirectory) {
      const filteredChildren = filterFileTree(entry.children || [], searchQuery);
      if (filteredChildren.length > 0 || entry.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        acc.push({ ...entry, children: filteredChildren });
      }
    } else if (entry.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      acc.push(entry);
    }
    return acc;
  }, []);
};

export const isBinaryFile = (fileName: string): boolean => {
  const binaryExtensions = [
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'ico', 'svg',
    // Audio
    'mp3', 'wav', 'ogg', 'flac', 'm4a',
    // Video
    'mp4', 'webm', 'avi', 'mov', 'wmv',
    // Documents
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    // Archives
    'zip', 'rar', '7z', 'tar', 'gz',
    // Other binary
    'exe', 'dll', 'so', 'class'
  ];
  
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return binaryExtensions.includes(ext);
};

export const getFileType = (fileName: string): 'image' | 'audio' | 'video' | 'pdf' | 'other' => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'ico', 'svg'];
  const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'm4a'];
  const videoExts = ['mp4', 'webm', 'avi', 'mov', 'wmv'];
  
  if (imageExts.includes(ext)) return 'image';
  if (audioExts.includes(ext)) return 'audio';
  if (videoExts.includes(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';
  return 'other';
};

export const createNewFile = async (
  parentHandle: FileSystemDirectoryHandle,
  fileName: string
): Promise<FileSystemFileHandle> => {
  return await parentHandle.getFileHandle(fileName, { create: true });
};

export const createNewDirectory = async (
  parentHandle: FileSystemDirectoryHandle,
  dirName: string
): Promise<FileSystemDirectoryHandle> => {
  return await parentHandle.getDirectoryHandle(dirName, { create: true });
};

export const deleteFileOrDirectory = async (
  handle: FileSystemHandle,
  parentHandle: FileSystemDirectoryHandle
) => {
  await parentHandle.removeEntry(handle.name, { recursive: true });
};

export const renameFileOrDirectory = async (
  handle: FileSystemHandle,
  parentHandle: FileSystemDirectoryHandle,
  newName: string
) => {
  // Since the File System Access API doesn't have direct rename,
  // we need to copy for files or recreate for directories
  if (handle.kind === 'file') {
    const fileHandle = handle as FileSystemFileHandle;
    const file = await fileHandle.getFile();
    const newHandle = await parentHandle.getFileHandle(newName, { create: true });
    const writable = await newHandle.createWritable();
    await writable.write(file);
    await writable.close();
    await parentHandle.removeEntry(handle.name);
  } else {
    const dirHandle = handle as FileSystemDirectoryHandle;
    const newDirHandle = await parentHandle.getDirectoryHandle(newName, { create: true });
    
    // Copy all contents
    for await (const [name, childHandle] of dirHandle.entries()) {
      if (childHandle.kind === 'file') {
        const file = await (childHandle as FileSystemFileHandle).getFile();
        const newFileHandle = await newDirHandle.getFileHandle(name, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(file);
        await writable.close();
      } else {
        await renameFileOrDirectory(childHandle, newDirHandle, name);
      }
    }
    
    await parentHandle.removeEntry(handle.name, { recursive: true });
  }
};

export const findEntryByPath = (entries: FileEntry[], path: string): FileEntry | null => {
  if (!path) return null;
  
  const parts = path.split('/');
  let current: FileEntry | undefined;
  
  for (const entry of entries) {
    if (entry.name === parts[0]) {
      current = entry;
      break;
    }
  }
  
  if (!current) return null;
  
  if (parts.length === 1) return current;
  
  if (current.children) {
    return findEntryByPath(current.children, parts.slice(1).join('/'));
  }
  
  return null;
};
