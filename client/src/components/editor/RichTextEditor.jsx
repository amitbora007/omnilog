import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Eye,
  Edit3,
  FileCode2,
  Clock,
} from 'lucide-react';
import { sanitizeHtml } from '../../utils/sanitize.js';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Draft your article, document architectures, paste snippets...',
}) {
  const [isPreview, setIsPreview] = useState(false);
  const editorRef = useRef(null);

  // Sync editor content with external initial value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (!editorRef.current.matches(':focus')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  // Syntax highlight code blocks when switching to preview
  useEffect(() => {
    if (isPreview) {
      document.querySelectorAll('.post-preview pre code').forEach((el) => {
        hljs.highlightElement(el);
      });
    }
  }, [isPreview, value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const insertCodeBlock = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString() || '// Enter code or script here';
    const codeHtml = `<pre><code>${selectedText}</code></pre><p><br></p>`;
    document.execCommand('insertHTML', false, codeHtml);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL (e.g. https://github.com):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  // Word count & Reading time estimate
  const plainText = (value || '').replace(/<[^>]+>/g, ' ').trim();
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-card focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50/80 border-b border-slate-200 text-slate-600">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Bold (Ctrl+B)"
            aria-label="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Italic (Ctrl+I)"
            aria-label="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1" aria-hidden="true" />

          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h2>')}
            className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 text-xs font-bold font-mono"
            title="Section Heading (H2)"
            aria-label="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h3>')}
            className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 text-xs font-bold font-mono"
            title="Subheading (H3)"
            aria-label="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1" aria-hidden="true" />

          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Bullet List"
            aria-label="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Numbered List"
            aria-label="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<blockquote>')}
            className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Blockquote"
            aria-label="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1" aria-hidden="true" />

          <button
            type="button"
            onClick={insertCodeBlock}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs font-mono transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 border border-indigo-200/60"
            title="Insert Pre-formatted Code Block"
            aria-label="Insert Code Block"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Snippet</span>
          </button>
          <button
            type="button"
            onClick={insertLink}
            className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Insert Hyperlink"
            aria-label="Insert Hyperlink"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              !isPreview ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              isPreview ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Body or Preview Pane */}
      {isPreview ? (
        <div
          className="p-6 sm:p-8 min-h-[360px] post-content post-preview bg-white"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(
              value ||
                '<p class="text-slate-400 italic">No content written yet. Switch back to Write mode to draft your article.</p>'
            ),
          }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="p-6 sm:p-8 min-h-[360px] post-content focus:outline-none text-slate-800"
          data-placeholder={placeholder}
        />
      )}

      {/* Editor Bottom Status Bar */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ~{readingTime} min read
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Markdown & HTML supported
        </div>
      </div>
    </div>
  );
}
