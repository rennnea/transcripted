
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './common/icons/UploadIcon';
import { motion } from 'framer-motion';

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
    ${isDragging ? 'border-khaki-500 bg-khaki-50 ring-4 ring-khaki-500/20 scale-[1.02]' : 'border-beige-300 bg-beige-50 hover:border-brown-500 hover:bg-beige-200'}`;

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
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <motion.div 
            animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <UploadIcon className={`w-12 h-12 mb-4 transition-colors duration-300 ${isDragging ? 'text-khaki-600' : 'text-brown-400'}`} />
          </motion.div>
          <p className="mb-2 text-lg text-brown-600">
            <span className="font-semibold text-khaki-700">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-brown-400">MP3, WAV, M4A, OGG, etc.</p>
          {isDragging && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm font-semibold text-khaki-600"
            >
              Drop file to start processing
            </motion.p>
          )}
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
