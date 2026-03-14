'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Save, Send, Monitor, Code, FileText, Download, Upload, RefreshCw, Copy, CheckCircle, XCircle, Clock, Terminal, Settings, Globe, Smartphone, Plus } from 'lucide-react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';

interface File {
  id: string;
  name: string;
  content: string;
  language: string;
  isMain: boolean;
}

interface Homework {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  grade?: number;
  feedback?: string;
  requirements: {
    languages: string[];
    files: string[];
    description: string;
  };
}

interface PreviewData {
  html: string;
  css: string;
  js: string;
}

export default function CodingEnvironment() {
  const [files, setFiles] = useState<File[]>([
    {
      id: '1',
      name: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Hello World!</h1>
        <p>Welcome to the coding environment.</p>
        <button id="myButton">Click Me</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      language: 'html',
      isMain: true
    },
    {
      id: '2',
      name: 'style.css',
      content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    text-align: center;
    max-width: 500px;
}

h1 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 2.5rem;
}

p {
    color: #666;
    margin-bottom: 1.5rem;
}

button {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s ease;
}

button:hover {
    background: #5a6fd8;
}

button:active {
    transform: scale(0.98);
}`,
      language: 'css',
      isMain: false
    },
    {
      id: '3',
      name: 'script.js',
      content: `document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('myButton');
    const container = document.querySelector('.container');
    
    button.addEventListener('click', function() {
        // Create a new element
        const message = document.createElement('div');
        message.textContent = 'Button clicked! Great job!';
        message.style.cssText = \`
            margin-top: 20px;
            padding: 10px;
            background: #4CAF50;
            color: white;
            border-radius: 5px;
            animation: fadeIn 0.5s ease;
        \`;
        
        // Add fade-in animation
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        \`;
        document.head.appendChild(style);
        
        container.appendChild(message);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            message.remove();
        }, 3000);
    });
    
    // Add some interactivity
    console.log('Coding environment loaded successfully!');
});`,
      language: 'javascript',
      isMain: false
    }
  ]);
  
  const [activeFile, setActiveFile] = useState<File>(files[0]);
  const [previewData, setPreviewData] = useState<PreviewData>({
    html: files[0].content,
    css: files[1].content,
    js: files[2].content
  });
  const [homework, setHomework] = useState<Homework | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const editorRef = useRef<any | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorContainerRef.current && !editorRef.current) {
      // Initialize Monaco Editor
      const editor = (window as any).monaco?.editor?.create?.(editorContainerRef.current, {
        value: activeFile.content,
        language: activeFile.language,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: true },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        bracketPairColorization: { enabled: true },
        suggest: {
          showKeywords: true,
          showSnippets: true,
        }
      });

      editorRef.current = editor;

      // Handle content changes
      editor.onDidChangeModelContent(() => {
        const newContent = editor.getValue();
        updateFileContent(activeFile.id, newContent);
      });

      // Add custom keyboard shortcuts
      editor.addCommand((window as any).monaco?.KeyMod?.CtrlCmd | (window as any).monaco?.KeyCode?.KeyS, () => {
        handleSave();
      });

      editor.addCommand((window as any).monaco?.KeyMod?.CtrlCmd | (window as any).monaco?.KeyCode?.Enter, () => {
        handleRun();
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && activeFile) {
      const model = (window as any).monaco?.editor?.createModel?.(activeFile.content, activeFile.language);
      editorRef.current.setModel(model);
    }
  }, [activeFile]);

  useEffect(() => {
    updatePreview();
  }, [files]);

  const updateFileContent = (fileId: string, content: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, content } : file
    ));
    
    // Update preview data
    const htmlFile = files.find(f => f.name === 'index.html');
    const cssFile = files.find(f => f.name === 'style.css');
    const jsFile = files.find(f => f.name === 'script.js');
    
    setPreviewData({
      html: htmlFile?.content || '',
      css: cssFile?.content || '',
      js: jsFile?.content || ''
    });
  };

  const updatePreview = () => {
    if (previewFrameRef.current) {
      const htmlFile = files.find(f => f.name === 'index.html');
      const cssFile = files.find(f => f.name === 'style.css');
      const jsFile = files.find(f => f.name === 'script.js');
      
      const combinedHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Preview</title>
            <style>
                ${cssFile?.content || ''}
            </style>
        </head>
        <body>
            ${htmlFile?.content || ''}
            <script>
                // Override console.log to capture output
                const originalLog = console.log;
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.log = function(...args) {
                    originalLog.apply(console, args);
                    window.parent.postMessage({
                        type: 'console',
                        level: 'log',
                        message: args.join(' ')
                    }, '*');
                };
                
                console.error = function(...args) {
                    originalError.apply(console, args);
                    window.parent.postMessage({
                        type: 'console',
                        level: 'error',
                        message: args.join(' ')
                    }, '*');
                };
                
                console.warn = function(...args) {
                    originalWarn.apply(console, args);
                    window.parent.postMessage({
                        type: 'console',
                        level: 'warn',
                        message: args.join(' ')
                    }, '*');
                };
                
                // Capture unhandled errors
                window.addEventListener('error', function(e) {
                    window.parent.postMessage({
                        type: 'console',
                        level: 'error',
                        message: e.message + ' at ' + e.filename + ':' + e.lineno
                    }, '*');
                });
                
                ${jsFile?.content || ''}
            </script>
        </body>
        </html>
      `;
      
      previewFrameRef.current.srcdoc = combinedHtml;
    }
  };

  useEffect(() => {
    // Listen for console messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        setConsoleOutput(prev => [...prev, `[${event.data.level.toUpperCase()}] ${event.data.message}`]);
        if (consoleRef.current) {
          consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRun = () => {
    setIsRunning(true);
    setConsoleOutput([]);
    updatePreview();
    
    setTimeout(() => {
      setIsRunning(false);
      toast.success('Code executed successfully!');
    }, 1000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate saving to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Code saved successfully!');
    } catch (error) {
      toast.error('Failed to save code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!homework) {
      toast.error('No homework assigned');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate submission to backend
      const submissionData = {
        homeworkId: homework.id,
        files: files.map(f => ({
          name: f.name,
          content: f.content,
          language: f.language
        }))
      };

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setHomework(prev => prev ? { ...prev, status: 'SUBMITTED' } : null);
      toast.success('Homework submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit homework');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setActiveFile(file);
  };

  const handleNewFile = () => {
    const newFile: File = {
      id: Date.now().toString(),
      name: `file${files.length + 1}.html`,
      content: '',
      language: 'html',
      isMain: false
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFile(newFile);
  };

  const handleDeleteFile = (fileId: string) => {
    if (files.length <= 1) {
      toast.error('Cannot delete the last file');
      return;
    }
    
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFile.id === fileId) {
      setActiveFile(files.find(f => f.id !== fileId) || files[0]);
    }
  };

  const getLanguageIcon = (language: string) => {
    switch (language) {
      case 'html': return '🌐';
      case 'css': return '🎨';
      case 'javascript': return '⚡';
      default: return '📄';
    }
  };

  const getPreviewWidth = () => {
    return previewMode === 'desktop' ? '100%' : '375px';
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Code className="w-6 h-6" />
              Coding Environment
            </h1>
            {homework && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 rounded-full">
                <FileText className="w-4 h-4" />
                <span className="text-sm text-white">{homework.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  homework.status === 'PENDING' ? 'bg-yellow-500' :
                  homework.status === 'SUBMITTED' ? 'bg-blue-500' :
                  'bg-green-500'
                }`}>
                  {homework.status}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !homework}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">Files</h3>
              <button
                onClick={handleNewFile}
                className="text-gray-400 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleFileSelect(file)}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    activeFile.id === file.id ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{getLanguageIcon(file.language)}</span>
                    <span className="text-white text-sm">{file.name}</span>
                    {file.isMain && (
                      <span className="text-xs bg-blue-600 text-white px-1 rounded">Main</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.id);
                    }}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Homework Details */}
          {homework && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="text-white font-medium mb-3">Homework Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Due Date</p>
                  <p className="text-white">{new Date(homework.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Requirements</p>
                  <p className="text-white">{homework.requirements.description}</p>
                </div>
                <div>
                  <p className="text-gray-400">Languages</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {homework.requirements.languages.map((lang, index) => (
                      <span key={index} className="text-xs bg-gray-700 text-white px-2 py-1 rounded">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                {homework.grade && (
                  <div>
                    <p className="text-gray-400">Grade</p>
                    <p className="text-white">{homework.grade}%</p>
                  </div>
                )}
                {homework.feedback && (
                  <div>
                    <p className="text-gray-400">Feedback</p>
                    <p className="text-white">{homework.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Editor and Preview */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col">
              <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
                <span className="text-white text-sm">{activeFile.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowConsole(!showConsole)}
                    className={`px-2 py-1 rounded text-sm ${
                      showConsole ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <Terminal className="w-4 h-4" />
                    Console
                  </button>
                </div>
              </div>
              <div className="flex-1 relative">
                <div ref={editorContainerRef} className="w-full h-full" />
                {showConsole && (
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-black border-t border-gray-700">
                    <div ref={consoleRef} className="h-full overflow-y-auto p-2 font-mono text-xs">
                      {consoleOutput.length === 0 ? (
                        <div className="text-gray-500">Console output will appear here...</div>
                      ) : (
                        consoleOutput.map((output, index) => (
                          <div
                            key={index}
                            className={`mb-1 ${
                              output.includes('[ERROR]') ? 'text-red-400' :
                              output.includes('[WARN]') ? 'text-yellow-400' :
                              'text-green-400'
                            }`}
                          >
                            {output}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Preview */}
            <div className="w-1/2 border-l border-gray-700 flex flex-col bg-white">
              <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span className="text-sm font-medium">Live Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-1 rounded ${previewMode === 'desktop' ? 'bg-white shadow' : 'bg-gray-200'}`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-1 rounded ${previewMode === 'mobile' ? 'bg-white shadow' : 'bg-gray-200'}`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const previewWindow = window.open('', '_blank');
                      if (previewWindow) {
                        previewWindow.document.write(previewFrameRef.current?.srcdoc || '');
                        previewWindow.document.close();
                      }
                    }}
                    className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-gray-50 p-4 overflow-auto">
                <div
                  className="mx-auto bg-white shadow-lg"
                  style={{ width: getPreviewWidth() }}
                >
                  <iframe
                    ref={previewFrameRef}
                    className="w-full h-full min-h-[600px] border-0"
                    sandbox="allow-scripts allow-same-origin"
                    title="Live Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
