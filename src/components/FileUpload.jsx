import React, { useState, useCallback } from 'react';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from './ui/sonner';

const FileUpload = ({ onAnalysisComplete, className = "" }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [, setAnalyzing] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);

  const handleFile = useCallback(async (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error('File size must be less than 50MB');
      return;
    }

    setUploading(true);
    setAnalyzing(true);
    setFileInfo(null);

    try {
      // Upload and analyze in one step
      const formData = new FormData();
      formData.append('file', file);

      // Get file info first
      const uploadResponse = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      setFileInfo(uploadResult.file_info);
      toast.success('File uploaded successfully');

      // Immediately analyze the same file
      const analyzeResponse = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData, // Use the same formData
      });

      if (!analyzeResponse.ok) {
        throw new Error('Analysis failed');
      }

      const analysisResult = await analyzeResponse.json();
      toast.success('Analysis completed successfully');
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }

    } catch (error) {
      console.error('Upload/Analysis error:', error);
      toast.error('Failed to process file');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }, [onAnalysisComplete]);

  const resetUpload = () => {
    setFileInfo(null);
    setUploading(false);
    setAnalyzing(false);
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {!fileInfo ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-slate-600 hover:border-slate-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center space-y-4">
            {uploading ? (
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            ) : (
              <Upload className="w-12 h-12 text-slate-400" />
            )}
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">
                {uploading ? 'Uploading...' : 'Upload CSV File'}
              </h3>
              <p className="text-slate-400 text-sm">
                Drag and drop your CSV file here, or click to browse
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Supports: User activity data, logon records, email data, file access logs
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">{fileInfo.filename}</h3>
                <p className="text-slate-400 text-sm">
                  {fileInfo.rows.toLocaleString()} rows × {fileInfo.columns} columns
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetUpload}
              className="text-slate-400 hover:text-white"
            >
              ×
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Columns</h4>
              <div className="flex flex-wrap gap-1">
                {fileInfo.column_names.slice(0, 6).map((col, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded"
                  >
                    {col}
                  </span>
                ))}
                {fileInfo.column_names.length > 6 && (
                  <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded">
                    +{fileInfo.column_names.length - 6} more
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Data Quality</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Missing Values:</span>
                  <span className="text-slate-300">
                    {Object.values(fileInfo.missing_values).reduce((a, b) => a + b, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Data Types:</span>
                  <span className="text-slate-300">
                    {Object.keys(fileInfo.data_types).length} types
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={resetUpload}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Upload Different File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
