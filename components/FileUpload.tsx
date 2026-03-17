"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [dragError, setDragError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setDragError(null);

      if ((rejectedFiles as { file: File }[]).length > 0) {
        setDragError("Only PDF files are accepted.");
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.size > 10 * 1024 * 1024) {
          setDragError("File must be under 10MB.");
          return;
        }
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: { "application/pdf": [".pdf"] },
      maxFiles: 1,
      disabled,
    });

  const selectedFile = acceptedFiles[0];

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          <div className="text-5xl">📄</div>

          {selectedFile ? (
            <div>
              <p className="font-medium text-gray-800">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : isDragActive ? (
            <p className="text-blue-600 font-medium">Drop your PDF here…</p>
          ) : (
            <div>
              <p className="font-medium text-gray-700">
                Drag & drop a PDF, or click to browse
              </p>
              <p className="text-sm text-gray-400 mt-1">Max 10MB</p>
            </div>
          )}
        </div>
      </div>

      {dragError && (
        <p className="mt-2 text-sm text-red-600">{dragError}</p>
      )}
    </div>
  );
}
