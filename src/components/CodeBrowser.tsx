import React, { useState } from 'react';
import { Folder, FileCode, Copy, Check, FileJson, Info, BookOpen } from 'lucide-react';
import { CODE_FILES } from '../data/mockFiles';
import { CodeFile } from '../types';

export default function CodeBrowser() {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(CODE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Organize files conceptually into a folder tree
  const fileTree = [
    { name: 'Root Configuration', type: 'folder', files: CODE_FILES.filter(f => !f.path.includes('/')) },
    { name: 'src/context', type: 'folder', files: CODE_FILES.filter(f => f.path.includes('context/')) },
    { name: 'src/navigation', type: 'folder', files: CODE_FILES.filter(f => f.path.includes('navigation/')) },
    { name: 'src/screens/customer', type: 'folder', files: CODE_FILES.filter(f => f.path.includes('screens/customer/')) },
    { name: 'src/screens/worker', type: 'folder', files: CODE_FILES.filter(f => f.path.includes('screens/worker/')) }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row h-[560px]">
      
      {/* File Tree Left Navigation Rail */}
      <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between shrink-0 h-1/3 md:h-full overflow-y-auto no-scrollbar p-5 text-left">
        <div>
          <div className="flex items-center gap-1.5 mb-5 select-none">
            <BookOpen size={16} className="text-teal-600" />
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Project Workspace</h4>
          </div>
          
          <div className="space-y-4 select-none">
            {fileTree.map((folder, fIdx) => (
              <div key={fIdx}>
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-2.5">
                  <Folder size={12} className="text-slate-450" />
                  <span>{folder.name}</span>
                </div>
                
                <div className="pl-3.5 space-y-1">
                  {folder.files.map((file) => {
                    const isSelected = selectedFile.path === file.path;
                    const isJson = file.path.endsWith('.json');
                    
                    return (
                      <button
                        key={file.path}
                        onClick={() => {
                          setSelectedFile(file);
                          setCopied(false);
                        }}
                        className={`w-full text-left py-2 px-2.5 rounded-xl text-3xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-teal-650 bg-teal-600 text-white font-bold' 
                            : 'text-slate-650 hover:bg-slate-200/60 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isJson ? (
                            <FileJson size={11} className={isSelected ? 'text-teal-150' : 'text-slate-450'} />
                          ) : (
                            <FileCode size={11} className={isSelected ? 'text-teal-200' : 'text-slate-450'} />
                          )}
                          <span className="truncate">{file.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="hidden md:block mt-6 pt-4 border-t border-slate-200">
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 flex gap-2">
            <Info size={14} className="text-teal-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-teal-800 leading-normal font-medium">
              <strong>Expo Managed Pattern:</strong> This boilerplate features native bottom-tabs, contexts, and stylesheets tailored specifically for mobile phones.
            </p>
          </div>
        </div>
      </div>

      {/* Code Editor Space Panel */}
      <div className="flex-grow flex flex-col min-w-0 bg-neutral-950 text-neutral-300 h-2/3 md:h-full relative font-mono text-3xs lg:text-[11px] leading-relaxed">
        
        {/* Editor Top Bar */}
        <div className="bg-neutral-900 border-b border-neutral-800 py-3 px-5 flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-semibold text-neutral-400 ml-2 select-none">
              {selectedFile.path}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 py-1 px-3 bg-white/10 hover:bg-white/25 active:scale-95 text-white rounded-lg transition-all text-[10px] font-medium cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={11} className="text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic File Annotation Box */}
        <div className="bg-neutral-900 border-b border-neutral-800 p-4 font-sans text-neutral-450 select-none text-[11px] leading-relaxed shrink-0 flex items-start gap-2.5 text-left">
          <span className="px-2 py-0.5 bg-teal-600/20 text-teal-400 rounded-sm font-bold text-[9px] uppercase tracking-wider shrink-0 mt-0.5 font-mono">
            Details
          </span>
          <p className="flex-grow">{selectedFile.explanation}</p>
        </div>

        {/* Code Content text blocks */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar bg-neutral-950 font-mono text-zinc-300 antialiased whitespace-pre">
          {selectedFile.content.split('\n').map((line, idx) => (
            <div key={idx} className="flex group select-text hover:bg-white/2 cursor-text py-0.5 px-1 rounded">
              <span className="w-10 text-neutral-600 text-right pr-4 select-none self-start opacity-70">
                {idx + 1}
              </span>
              <span className="flex-grow text-left break-all select-all font-mono leading-relaxed" style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                {line}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
