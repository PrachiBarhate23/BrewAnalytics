import React, { useState } from 'react';
import { UploadCloud, X, CheckCircle, AlertCircle } from 'lucide-react';

export function DataUploadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("idle");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Upload failed");
      }

      const data = await response.json();
      setUploadStatus("success");
      setMessage(data.message || `Successfully processed ${data.processed_records || ''} records.`);
    } catch (error: any) {
      setUploadStatus("error");
      setMessage(error.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Data</h2>
        <p className="text-sm text-gray-600 mb-6">
          Upload reviews (.csv or .xlsx) to instantly update sentiment and aspect models. 
          Only new records will be processed.
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative cursor-pointer mb-6">
          <input 
            type="file" 
            accept=".csv, .xlsx" 
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <UploadCloud className="w-10 h-10 text-[#1ABC9C] mx-auto mb-3" />
          {file ? (
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
          ) : (
            <p className="text-sm text-gray-600">
              <span className="text-[#1ABC9C] font-semibold">Click to upload</span> or drag and drop
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">Excel or CSV up to 10MB</p>
        </div>

        {uploadStatus === "success" && (
          <div className="flex items-start gap-2 p-3 bg-green-50 text-green-700 rounded-lg mb-6">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{message}</p>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1ABC9C] rounded-lg hover:bg-[#16a085] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isUploading ? "Processing..." : "Upload & Analyze"}
          </button>
        </div>
      </div>
    </div>
  );
}
