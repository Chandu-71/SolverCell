import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { ChevronDown, RotateCcw, Copy, Check, Maximize2 } from 'lucide-react';

// ─── language config ─────────────────────────────────────────
const LANGUAGES = [
  { id: 'python', label: 'Python 3.14', monaco: 'python' },
  { id: 'cpp', label: 'C++ (G++ 15)', monaco: 'cpp' },
  { id: 'c', label: 'C (GCC 15)', monaco: 'c' },
  { id: 'java', label: 'Java (OpenJDK 25)', monaco: 'java' },
  { id: 'javascript', label: 'JavaScript (Deno)', monaco: 'javascript' },

  { id: 'typescript', label: 'TypeScript (Deno)', monaco: 'typescript' },
  { id: 'csharp', label: 'C# (.NET 9)', monaco: 'csharp' },
  { id: 'php', label: 'PHP 8.5', monaco: 'php' },
  { id: 'ruby', label: 'Ruby 4.0', monaco: 'ruby' },
  { id: 'go', label: 'Go 1.26', monaco: 'go' },
  { id: 'rust', label: 'Rust 1.93', monaco: 'rust' },
];

// starter boilerplate per language
const BOILERPLATE = {
  python: `# Write your solution here
def solution():
    pass
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // write your solution here

    return 0;
}
`,
  c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // write your solution here

    return 0;
}
`,
  java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // write your solution here
    }
}
`,
  javascript: `/**
 * @param {*} input
 * @return {*}
 */
function solution(input) {
    // write your solution here
}
`,
  typescript: `function solution(input: string): void {
    // write your solution here
}
`,

  csharp: `using System;

class Program {
    static void Main() {
        // write your solution here
    }
}
`,

  php: `<?php

// write your solution here

?>
`,

  ruby: `# write your solution here
`,

  go: `package main

import "fmt"

func main() {
    // write your solution here
    fmt.Println()
}
`,

  rust: `fn main() {
    // write your solution here
}
`,
};

// Monaco editor theme
const EDITOR_THEME = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '4a5568', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'fc8181' },
    { token: 'string', foreground: '68d391' },
    { token: 'number', foreground: 'f6ad55' },
    { token: 'type', foreground: '76e4f7' },
    { token: 'function', foreground: 'b794f4' },
    { token: 'variable', foreground: 'e2e8f0' },
    { token: 'operator', foreground: 'fc8181' },
    { token: 'delimiter', foreground: 'a0aec0' },
  ],
  colors: {
    'editor.background': '#0b0b0b',
    'editor.foreground': '#e2e8f0',
    'editor.lineHighlightBackground': '#ffffff08',
    'editor.selectionBackground': '#dc262640',
    'editor.inactiveSelectionBackground': '#dc262620',
    'editorCursor.foreground': '#dc2626',
    'editorLineNumber.foreground': '#2d3748',
    'editorLineNumber.activeForeground': '#4a5568',
    'editorGutter.background': '#0b0b0b',
    'editor.selectionHighlightBackground': '#dc262618',
    'editorIndentGuide.background1': '#ffffff08',
    'editorIndentGuide.activeBackground1': '#ffffff18',
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#ffffff10',
    'scrollbarSlider.hoverBackground': '#ffffff18',
    'scrollbarSlider.activeBackground': '#ffffff25',
  },
};

// ─── LangDropdown ─────────────────────────────────────────────
const LangDropdown = ({ selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.id === selected);

  return (
    <div className='relative'>
      <button
        onClick={() => setOpen(v => !v)}
        className='flex items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-sm font-medium text-slate-300 cursor-pointer transition hover:border-white/15 hover:bg-white/8'
      >
        {current?.label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div className='fixed inset-0 z-10' onClick={() => setOpen(false)} />
          <div className='absolute left-0 top-full z-20 mt-1.5 max-h-64 w-52 overflow-y-auto overflow-x-hidden rounded-xl border border-white/10 bg-[#141414] shadow-xl shadow-black/60'>
            {LANGUAGES.map(lang => (
              <button
                key={lang.id}
                onClick={() => {
                  onChange(lang.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-2.5 text-sm transition-colors hover:bg-white/6 ${
                  selected === lang.id ? 'text-rose-400' : 'text-slate-300'
                }`}
              >
                {selected === lang.id && <span className='mr-2 h-1.5 w-1.5 rounded-full bg-rose-400' />}
                {selected !== lang.id && <span className='mr-2 h-1.5 w-1.5' />}
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const getDraftKey = (problemId, language) => `draft_code_${problemId}_${language}`;

const loadDraftCode = (problem, language) => {
  if (!problem?.id) return BOILERPLATE[language];

  const draft = localStorage.getItem(getDraftKey(problem.id, language));
  return draft !== null ? draft : BOILERPLATE[language];
};

// ─── CodeEditorPanel ─────────────────────────────────────────
const CodeEditorPanel = ({ problem, onCodeChange }) => {
  const [language, setLanguage] = useState('cpp');

  const [codeByLanguage, setCodeByLanguage] = useState(() => {
    const initial = {};

    LANGUAGES.forEach(lang => {
      initial[lang.id] = BOILERPLATE[lang.id];
    });

    return initial;
  });

  const code = codeByLanguage[language];

  const [copied, setCopied] = useState(false);
  const editorRef = useRef(null);

  const handleLangChange = newLang => {
    setLanguage(newLang);

    onCodeChange?.(codeByLanguage[newLang], newLang);
  };

  const handleCodeChange = value => {
    const updatedCode = value ?? '';

    setCodeByLanguage(prev => {
      const next = {
        ...prev,
        [language]: updatedCode,
      };

      if (problem?.id) {
        localStorage.setItem(getDraftKey(problem.id, language), updatedCode);
      }

      return next;
    });

    onCodeChange?.(updatedCode, language);
  };

  const handleReset = () => {
    const fresh = BOILERPLATE[language];

    setCodeByLanguage(prev => {
      const next = {
        ...prev,
        [language]: fresh,
      };

      if (problem?.id) {
        localStorage.setItem(getDraftKey(problem.id, language), fresh);
      }

      return next;
    });

    onCodeChange?.(fresh, language);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // register custom theme
    monaco.editor.defineTheme('platform-dark', EDITOR_THEME);
    monaco.editor.setTheme('platform-dark');

    // kill the default context menu
    editor.updateOptions({ contextmenu: false });
  };

  const monacoLang = LANGUAGES.find(l => l.id === language)?.monaco ?? 'python';

  useEffect(() => {
    if (!problem?.id) return;

    const updated = {};

    LANGUAGES.forEach(lang => {
      updated[lang.id] = loadDraftCode(problem, lang.id);
    });

    setCodeByLanguage(updated);

    onCodeChange?.(updated[language], language);
  }, [problem?.id]);

  return (
    <div className='flex h-full flex-col'>
      {/* ── TOOLBAR ── */}
      <div className='flex shrink-0 items-center justify-between border-b border-white/6 px-4 py-2.5'>
        <LangDropdown selected={language} onChange={handleLangChange} />

        <div className='flex items-center gap-1'>
          {/* copy */}
          <button
            onClick={handleCopy}
            title='Copy code'
            className='flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 transition hover:bg-white/6 hover:text-slate-300'
          >
            {copied ? <Check size={13} className='text-emerald-400' /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* reset */}
          <button
            onClick={handleReset}
            title='Reset to boilerplate'
            className='flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 transition hover:bg-white/6 hover:text-rose-400'
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ── EDITOR ── */}
      <div className='min-h-0 flex-1'>
        <Editor
          height='100%'
          language={monacoLang}
          value={code}
          onMount={handleEditorMount}
          onChange={handleCodeChange}
          theme='platform-dark'
          options={{
            fontSize: 14,
            fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Menlo, monospace',
            fontLigatures: true,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'off',
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 4,
            lineNumbersMinChars: 3,
            renderWhitespace: 'none',
            bracketPairColorization: { enabled: true },
            autoIndent: 'full',
            formatOnPaste: true,
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            padding: { top: 14, bottom: 14 },
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
              verticalSliderSize: 6,
              horizontalSliderSize: 6,

              // STOP MONACO FROM EATING ALL SCROLL EVENTS
              alwaysConsumeMouseWheel: false,
            },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditorPanel;
