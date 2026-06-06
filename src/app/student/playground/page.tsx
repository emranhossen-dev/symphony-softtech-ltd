"use client";

import { useState, useEffect, use } from 'react';
import { Play, Save, ChevronLeft, Download, Maximize2, Minimize2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PlaygroundPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');
  const [code, setCode] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    h1 {
      color: #333;
    }
    button {
      padding: 10px 20px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #4f46e5;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello, World!</h1>
    <p>This is a live preview of your HTML code.</p>
    <button onclick="console.log('Button clicked!')">Click Me</button>
  </div>
  <script>
    console.log('Page loaded!');
  </script>
</body>
</html>`);
  const [output, setOutput] = useState('');
  const [outputMode, setOutputMode] = useState<'live' | 'console'>('live');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRun = () => {
    setOutputMode('console');

    try {
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      // Extract and run JavaScript from the code
      const scriptMatch = code.match(/<script>([\s\S]*?)<\/script>/);
      if (scriptMatch) {
        const jsCode = scriptMatch[1];
        eval(jsCode);
      }

      console.log = originalLog;
      setOutput(logs.length > 0 ? logs.join('\n') : 'No console output');
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleSave = () => {
    // In a real app, save the code to the database
    console.log('Saving code for module:', moduleId);
    alert('Code saved successfully!');
  };

  const handleSubmit = async () => {
    if (!moduleId || !courseId) {
      alert('Module ID and Course ID are required');
      console.error('Missing IDs:', { moduleId, courseId });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('moduleId', moduleId);
      formData.append('courseId', courseId);
      formData.append('code', code);

      console.log('Submitting homework:', { moduleId, courseId });

      const response = await fetch('/api/student/homework/submission', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      console.log('Submission response:', data);

      if (data.success) {
        alert('Homework submitted successfully!');
        router.back();
      } else {
        alert(data.error || 'Failed to submit homework');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
      alert('Failed to submit homework');
      setIsSubmitting(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f4c] to-[#0d1b3e] ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      {!isFullScreen && (
        <div className="glass-nav border-b border-purple-500/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-purple-600/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-white">Code Playground</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm font-medium">Save</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">{isSubmitting ? 'Submitting...' : 'Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex ${isFullScreen ? 'h-screen' : 'h-[calc(100vh-73px)]'}`}>
        {/* Code Editor */}
        <div className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Code Editor</h2>
            <button
              onClick={handleRun}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">Run Code</span>
            </button>
          </div>
          <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden border border-purple-500/30">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-green-400 font-mono p-4 focus:outline-none resize-none"
              spellCheck={false}
              style={{ tabSize: 2 }}
            />
          </div>
        </div>

        {/* Output */}
        <div className="w-96 bg-gray-900/50 border-l border-purple-500/30 flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Output</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setOutputMode('live')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  outputMode === 'live'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Live
              </button>
              <button
                onClick={() => setOutputMode('console')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  outputMode === 'console'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Console
              </button>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-xl overflow-hidden border border-purple-500/30">
            {outputMode === 'live' ? (
              <iframe
                srcDoc={code}
                title="Live Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="w-full h-full bg-gray-900 p-4 overflow-auto">
                <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                  {output || 'Run your code to see console output...'}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={toggleFullScreen}
          className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        >
          {isFullScreen ? (
            <>
              <Minimize2 className="w-5 h-5" />
              <span className="text-sm font-medium">Exit Full Screen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-5 h-5" />
              <span className="text-sm font-medium">Full Screen</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
