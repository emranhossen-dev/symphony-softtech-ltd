'use client';

import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Copy, Download, Settings, Fullscreen, Maximize2 } from 'lucide-react';

interface CodePlaygroundProps {
  initialCode?: string;
  language?: string;
  theme?: 'vs-dark' | 'vs-light';
  onCodeChange?: (code: string) => void;
  onRun?: (code: string) => void;
  onSave?: (code: string) => void;
  homeworkTitle?: string;
  moduleId?: string;
  courseId?: string;
}

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'json', label: 'JSON' },
];

const DEFAULT_TEMPLATES = {
  javascript: `// JavaScript Code
function helloWorld() {
  console.log("Hello, World!");
  return "Hello, World!";
}

// Call the function
const result = helloWorld();
console.log(result);`,
  
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
    </style>
</head>
<body>
    <h1>Welcome to My Web Page</h1>
    <p>This is a simple HTML template.</p>
    <script>
        console.log("Page loaded successfully!");
    </script>
</body>
</html>`,

  css: `/* CSS Styles */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.button {
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button:hover {
  background: #0056b3;
}`,

  python: `# Python Code
def hello_world():
    """A simple function that returns a greeting."""
    return "Hello, World!"

# Main execution
if __name__ == "__main__":
    result = hello_world()
    print(result)
    
    # Example of a simple calculation
    numbers = [1, 2, 3, 4, 5]
    total = sum(numbers)
    print(f"Sum of numbers: {total}")`
};

export default function CodePlayground({
  initialCode = '',
  language = 'javascript',
  theme = 'vs-dark',
  onCodeChange,
  onRun,
  onSave,
  homeworkTitle,
  moduleId,
  courseId
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode || DEFAULT_TEMPLATES[language as keyof typeof DEFAULT_TEMPLATES] || '');
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    } else {
      setCode(DEFAULT_TEMPLATES[selectedLanguage as keyof typeof DEFAULT_TEMPLATES] || '');
    }
  }, [selectedLanguage, initialCode]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      wordWrap: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
    });
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      // For JavaScript, we can try to execute it
      if (selectedLanguage === 'javascript') {
        const result = await executeJavaScript(code);
        setOutput(result);
      } else {
        setOutput(`Code execution for ${selectedLanguage} is not supported in this demo.\n\nYour code:\n${code}`);
      }
      
      onRun?.(code);
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const executeJavaScript = async (jsCode: string): Promise<string> => {
    return new Promise((resolve) => {
      // Capture console.log output
      const originalLog = console.log;
      const logs: string[] = [];
      
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      try {
        // Create a function from the code and execute it
        const func = new Function(jsCode);
        const result = func();
        
        // Restore console.log
        console.log = originalLog;
        
        let output = '';
        if (logs.length > 0) {
          output += 'Console Output:\n' + logs.join('\n') + '\n\n';
        }
        if (result !== undefined) {
          output += 'Return Value:\n' + JSON.stringify(result, null, 2);
        }
        
        resolve(output || 'Code executed successfully (no output)');
      } catch (error) {
        console.log = originalLog;
        resolve(`Execution Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await onSave?.(code);
      setOutput('Code saved successfully!');
    } catch (error) {
      setOutput(`Save Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setOutput('Code copied to clipboard!');
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      html: 'html',
      css: 'css',
      python: 'py',
      json: 'json'
    };

    const extension = extensions[selectedLanguage] || 'txt';
    const filename = `${homeworkTitle || 'code'}.${extension}`;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    setOutput(`Code downloaded as ${filename}`);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-96'}`}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {homeworkTitle && (
              <span className="text-white text-sm font-medium">{homeworkTitle}</span>
            )}
            
            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-gray-700 text-white text-sm px-3 py-1 rounded border border-gray-600"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Action Buttons */}
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run'}
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
            >
              {isFullscreen ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Fullscreen className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t border-gray-700 px-4 py-2">
            <div className="flex items-center gap-4">
              <label className="text-white text-sm">Theme:</label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value as 'vs-dark' | 'vs-light')}
                className="bg-gray-700 text-white text-sm px-3 py-1 rounded border border-gray-600"
              >
                <option value="vs-dark">Dark</option>
                <option value="vs-light">Light</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Editor and Output */}
      <div className="flex h-full">
        {/* Code Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={selectedLanguage}
            theme={selectedTheme}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              wordWrap: 'on',
              minimap: { enabled: !isFullscreen },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              bracketPairColorization: { enabled: true },
              guides: {
                indentation: true,
                bracketPairs: true
              }
            }}
          />
        </div>

        {/* Output Panel (shown when there's output) */}
        {output && (
          <div className="w-1/3 bg-gray-800 border-l border-gray-700">
            <div className="p-4 h-full overflow-auto">
              <h3 className="text-white font-medium mb-2">Output</h3>
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                {output}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
