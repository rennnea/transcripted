import React from 'react';
import { AudioFileIcon } from './common/icons/AudioFileIcon';
import { formatFileSize } from '../utils/fileUtils';

interface FileInfoProps {
  file: File | null;
}

export const FileInfo: React.FC<FileInfoProps> = ({ file }) => {
    if (!file) return null;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-khaki-600">Selected File</h2>
            <div className="flex items-center p-4 bg-beige-50 rounded-xl border border-beige-200/80 space-x-4">
                <AudioFileIcon className="w-10 h-10 text-khaki-500 flex-shrink-0" />
                <div className="overflow-hidden">
                    <p className="text-brown-800 font-medium truncate" title={file.name}>{file.name}</p>
                    <p className="text-sm text-brown-500">{formatFileSize(file.size)} · {file.type}</p>
                </div>
            </div>
        </div>
    )
}
