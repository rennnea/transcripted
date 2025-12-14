
import React from 'react';
import { AudioFileIcon } from './icons/AudioFileIcon';

interface FileInfoProps {
  file: File | null;
}

export const FileInfo: React.FC<FileInfoProps> = ({ file }) => {
    if (!file) return null;

    const fileSize = (file.size / (1024 * 1024)).toFixed(2); // in MB

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-khaki-600 dark:text-khaki-400">Selected File</h2>
            <div className="flex items-center p-4 bg-beige-50 dark:bg-gray-900 rounded-xl border border-beige-200/80 dark:border-gray-700 space-x-4">
                <AudioFileIcon className="w-10 h-10 text-khaki-500 dark:text-khaki-400 flex-shrink-0" />
                <div className="overflow-hidden">
                    <p className="text-brown-800 dark:text-gray-200 font-medium truncate" title={file.name}>{file.name}</p>
                    <p className="text-sm text-brown-500 dark:text-gray-400">{fileSize} MB · {file.type}</p>
                </div>
            </div>
        </div>
    )
}