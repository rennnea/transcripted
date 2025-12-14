
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const dropzoneClasses = `flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
    ${isDragging ? 'border-khaki-500 bg-khaki-100 dark:bg-khaki-900/20 ring-4 ring-khaki-500/20' : 'border-beige-300 dark:border-gray-600 bg-beige-50 dark:bg-gray-800 hover:border-brown-500 dark:hover:border-khaki-500 hover:bg-beige-200 dark:hover:bg-gray-700'}`;

  return (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className={dropzoneClasses}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon className={`w-12 h-12 mb-4 text-brown-500 dark:text-gray-400 transition-transform duration-300 ${isDragging ? 'scale-110 text-khaki-500 dark:text-khaki-400' : ''}`} />
          <p className="mb-2 text-lg text-brown-500 dark:text-gray-300">
            <span className="font-semibold text-khaki-600 dark:text-khaki-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-brown-500 dark:text-gray-400">MP3, WAV, M4A, OGG, etc.</p>
        </div>
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="audio/*"
        />
      </label>
    </div>
  );
};

export default FileUploader;