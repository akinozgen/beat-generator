import { FileX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFileType } from './utils';

interface FilePreviewProps {
  file: File;
  fileName: string;
}

export default function FilePreview({ file, fileName }: FilePreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string>('');
  const fileType = getFileType(fileName);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!objectUrl) {
    return (
      <div className="h-full flex items-center justify-center text-white/30">
        Loading preview...
      </div>
    );
  }

  switch (fileType) {
    case 'image':
      return (
        <div className="h-full flex items-center justify-center p-8 bg-black/20">
          <img 
            src={objectUrl} 
            alt={fileName}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );

    case 'audio':
      return (
        <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
          <div className="text-white/50 text-sm">{fileName}</div>
          <audio controls className="w-full max-w-lg">
            <source src={objectUrl} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );

    case 'video':
      return (
        <div className="h-full flex items-center justify-center p-8 bg-black/20">
          <video controls className="max-w-full max-h-full">
            <source src={objectUrl} />
            Your browser does not support the video element.
          </video>
        </div>
      );

    case 'pdf':
      return (
        <div className="h-full">
          <iframe
            src={objectUrl}
            className="w-full h-full"
            title={fileName}
          />
        </div>
      );

    default:
      return (
        <div className="h-full flex flex-col items-center justify-center gap-4 text-white/30">
          <FileX className="w-16 h-16" />
          <div className="text-center">
            <div>Preview not available</div>
            <div className="text-sm mt-1">This file type cannot be previewed</div>
          </div>
        </div>
      );
  }
}
