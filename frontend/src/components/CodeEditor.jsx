import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Code, Clock, Cpu, Terminal, RefreshCw } from 'lucide-react';
import api from '../services/api';

const DEFAULT_TEMPLATES = {
  java: `public class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello, ProctorPro Coding Test!");\n    }\n}`,
  python: `def solution():\n    # Write your solution here\n    print("Hello, ProctorPro Coding Test!")\n\nif __name__ == "__main__":\n    solution()`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, ProctorPro Coding Test!" << endl;\n    return 0;\n}`,
  javascript: `function solution() {\n  console.log("Hello, ProctorPro Coding Test!");\n}\n\nsolution();`
};

const CodeEditor = ({ value, onChange, onSave }) => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(value || DEFAULT_TEMPLATES['python']);
  const [running, setRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    const newTemplate = DEFAULT_TEMPLATES[lang] || '';
    setCode(newTemplate);
    if (onChange) onChange(newTemplate);
  };

  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCode(val);
    if (onChange) onChange(val);
  };

  const handleRunCode = async () => {
    try {
      setRunning(true);
      setExecutionResult(null);
      const res = await api.post('/sessions/run-code', { language, code });
      setExecutionResult(res.data);
      if (onSave) onSave(code);
    } catch (err) {
      console.error("Code execution error:", err);
      setExecutionResult({
        passed: false,
        status: 'ERROR',
        output: 'Failed to communicate with code evaluation service.'
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-brand-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Language:</span>
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            <option value="python">Python 3</option>
            <option value="java">Java 21</option>
            <option value="cpp">C++ 20</option>
            <option value="javascript">JavaScript (Node.js)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCode}
            disabled={running}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            {running ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-white" />}
            <span>{running ? 'Running Code...' : 'Run Test Cases'}</span>
          </button>
        </div>
      </div>

      {/* Code Textarea with Line Numbers */}
      <div className="relative flex-1 flex bg-slate-900 text-xs font-mono min-h-[300px]">
        <textarea
          value={code}
          onChange={handleCodeChange}
          spellCheck="false"
          placeholder="Write your code here..."
          className="w-full h-full p-5 bg-transparent text-slate-100 font-mono text-xs focus:outline-none resize-none leading-relaxed border-none"
        />
      </div>

      {/* Execution Results Console */}
      {executionResult && (
        <div className="border-t border-slate-800 bg-slate-950 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Terminal className="h-4 w-4 text-brand-500" />
              <span>Execution Output & Test Results</span>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              executionResult.passed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {executionResult.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 font-mono">
            {executionResult.testCasesPassed !== undefined && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Test Cases: {executionResult.testCasesPassed} / {executionResult.totalTestCases} Passed
              </span>
            )}
            {executionResult.executionTimeMs !== undefined && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                Execution Time: {executionResult.executionTimeMs} ms
              </span>
            )}
            {executionResult.memoryUsedMb !== undefined && (
              <span className="flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-purple-400" />
                Memory: {executionResult.memoryUsedMb} MB
              </span>
            )}
          </div>

          <pre className="text-xs font-mono bg-slate-900 p-3 rounded-xl text-slate-300 border border-slate-800 overflow-x-auto whitespace-pre-wrap">
            {executionResult.output}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
