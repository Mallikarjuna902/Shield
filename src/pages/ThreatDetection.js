import React, { useState } from 'react';
import { Shield, Brain, Upload, BarChart3 } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import ThreatAnalytics from '../components/ThreatAnalytics';
import { Card } from '../components/ui/card';
import { useThreat } from '../contexts/ThreatContext';

export default function ThreatDetection() {
  const { threatData, updateThreatData, clearThreatData, hasData } = useThreat();
  const [activeTab, setActiveTab] = useState(hasData ? 'analytics' : 'upload');

  const handleAnalysisComplete = (data) => {
    updateThreatData(data);
    setActiveTab('analytics');
  };

  const resetAnalysis = () => {
    clearThreatData();
    setActiveTab('upload');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mr-4">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white">Threat Detection</h1>
            <p className="text-slate-400 text-lg">AI-Powered Insider Threat Analysis</p>
          </div>
        </div>
        
        <p className="text-slate-300 max-w-2xl mx-auto">
          Upload your user activity data to detect anomalous behavior patterns using advanced machine learning algorithms.
          Our system analyzes logon patterns, email behavior, file access, and device usage to identify potential insider threats.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-800/50 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-colors ${
              activeTab === 'upload'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Data</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            disabled={!hasData}
            className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-colors ${
              activeTab === 'analytics' && hasData
                ? 'bg-cyan-500/20 text-cyan-400'
                : hasData
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {activeTab === 'upload' && (
          <div className="space-y-8">
            {/* Model Information */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Isolation Forest Model
                  </h3>
                  <p className="text-slate-300 mb-4">
                    Our system uses an Isolation Forest algorithm trained on behavioral features to detect anomalous user activities.
                    The model analyzes 21 different behavioral indicators across logon patterns, email usage, file access, and device interactions.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-cyan-400 mb-1">Logon Behavior</h4>
                      <p className="text-xs text-slate-400">6 features including device usage, timing patterns</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-green-400 mb-1">Email Analysis</h4>
                      <p className="text-xs text-slate-400">6 features covering volume, size, recipients</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-yellow-400 mb-1">File Access</h4>
                      <p className="text-xs text-slate-400">6 features including removable media usage</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-red-400 mb-1">Security Indicators</h4>
                      <p className="text-xs text-slate-400">Decoy file access detection</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* File Upload */}
            <FileUpload onAnalysisComplete={handleAnalysisComplete} />

            {/* Supported Formats */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Supported Data Formats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-cyan-400">User Activity Logs</h4>
                  <p className="text-xs text-slate-400">Logon records, device usage, session data</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-green-400">Email Data</h4>
                  <p className="text-xs text-slate-400">Email metadata, recipients, sizes, timestamps</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-yellow-400">File Access Logs</h4>
                  <p className="text-xs text-slate-400">File operations, removable media, access patterns</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-purple-400">Device Events</h4>
                  <p className="text-xs text-slate-400">Hardware interactions, USB usage, network access</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-400">Decoy Files</h4>
                  <p className="text-xs text-slate-400">Honeypot file access indicators</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-400">Pre-computed Features</h4>
                  <p className="text-xs text-slate-400">Already extracted behavioral features</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {threatData ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
                    <p className="text-slate-400">
                      File Type: {threatData.file_type} | 
                      Analyzed: {new Date(threatData.analysis_time).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={resetAnalysis}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    New Analysis
                  </button>
                </div>
                
                <ThreatAnalytics analysisData={threatData} />
              </>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">No Analysis Available</h3>
                <p className="text-slate-500 mb-4">Upload and analyze a file to view the results here</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                >
                  Upload File
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
