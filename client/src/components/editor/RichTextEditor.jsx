import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Code,
  Sparkles,
  Link as LinkIcon,
  Eye,
  Edit3,
  Clock,
} from 'lucide-react';
import { sanitizeHtml } from '../../utils/sanitize.js';
import { formatCodeSnippet } from '../../utils/codeFormatter.js';
import { useToast } from '../common/Toast.jsx';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Draft your article, document architectures, paste snippets...',
}) {
  const [isPreview, setIsPreview] = useState(false);
  const [activePrePosition, setActivePrePosition] = useState(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    h2: false,
    h3: false,
    quote: false,
    ul: false,
    ol: false,
  });
  const editorRef = useRef(null);
  const { showToast } = useToast();

  // Sync editor content with external initial value & ensure content is preserved when toggling Write mode
  useEffect(() => {
    if (!isPreview && editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        if (!editorRef.current.matches(':focus')) {
          editorRef.current.innerHTML = value || '';
        }
      }
    }
  }, [value, isPreview]);

  // Set defaultParagraphSeparator to 'p' on mount
  useEffect(() => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch (e) {}
  }, []);

  const handleToggleMode = (previewMode) => {
    if (!previewMode && editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setIsPreview(previewMode);
  };

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
      updateActivePre();
      checkActiveFormats();
    }
  };

  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
      checkActiveFormats();
    }
  };

  const isInsideCodeBlock = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    let node = selection.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeName === 'PRE') return node;
      node = node.parentNode;
    }
    return null;
  };

  const updateActivePre = () => {
    if (!editorRef.current) return;
    const foundPre = isInsideCodeBlock();

    if (foundPre) {
      const editorRect = editorRef.current.getBoundingClientRect();
      const preRect = foundPre.getBoundingClientRect();
      setActivePrePosition({
        top: Math.max(8, preRect.top - editorRect.top + 8),
        right: 24,
        preEl: foundPre,
      });
    } else {
      setActivePrePosition(null);
    }
  };

  const getSelectedTagElements = (tagName) => {
    if (!editorRef.current) return [];
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return [];
    const range = selection.getRangeAt(0);
    const tagLower = tagName.replace(/[<>]/g, '').toLowerCase();
    const matching = [];

    let node = range.commonAncestorContainer;
    while (node && node !== editorRef.current) {
      if (node.nodeName?.toLowerCase() === tagLower) {
        matching.push(node);
        break;
      }
      node = node.parentNode;
    }

    [selection.anchorNode, selection.focusNode].forEach((selNode) => {
      let n = selNode;
      while (n && n !== editorRef.current) {
        if (n.nodeName?.toLowerCase() === tagLower && !matching.includes(n)) {
          matching.push(n);
        }
        n = n.parentNode;
      }
    });

    const allOfTag = editorRef.current.querySelectorAll(tagLower);
    allOfTag.forEach((el) => {
      if (range.intersectsNode(el) && !matching.includes(el)) {
        matching.push(el);
      }
    });

    return matching;
  };

  const getCurrentBlock = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    let node = selection.anchorNode;
    while (node && node !== editorRef.current) {
      const tag = node.nodeName?.toLowerCase();
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'li', 'pre'].includes(tag)) {
        return { tag, node };
      }
      node = node.parentNode;
    }
    return null;
  };

  const isCurrentTag = (tagName) => {
    const tagClean = tagName.replace(/[<>]/g, '').toLowerCase();
    const matching = getSelectedTagElements(tagClean);
    if (matching.length > 0) return true;
    const current = getCurrentBlock();
    if (current && current.tag === tagClean) return true;
    try {
      const cmdVal = document.queryCommandValue('formatBlock');
      if (cmdVal && cmdVal.toLowerCase().includes(tagClean)) return true;
    } catch (e) {}
    return false;
  };

  const checkActiveFormats = () => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    let isBold = false;
    let isItalic = false;
    let isUl = false;
    let isOl = false;

    try {
      isBold = document.queryCommandState('bold');
    } catch (e) {}

    try {
      isItalic = document.queryCommandState('italic');
    } catch (e) {}

    try {
      isUl = document.queryCommandState('insertUnorderedList');
    } catch (e) {}

    try {
      isOl = document.queryCommandState('insertOrderedList');
    } catch (e) {}

    let node = selection.anchorNode;
    while (node && node !== editorRef.current) {
      const tag = node.nodeName?.toLowerCase();
      if (tag === 'b' || tag === 'strong') isBold = true;
      if (tag === 'i' || tag === 'em') isItalic = true;
      if (tag === 'ul') isUl = true;
      if (tag === 'ol') isOl = true;
      if (node.nodeType === 1) {
        const computed = window.getComputedStyle(node);
        if (computed.fontWeight === 'bold' || parseInt(computed.fontWeight, 10) >= 700) {
          isBold = true;
        }
        if (computed.fontStyle === 'italic') {
          isItalic = true;
        }
      }
      node = node.parentNode;
    }

    const isH2 = isCurrentTag('h2');
    const isH3 = isCurrentTag('h3');
    const isQuote = isCurrentTag('blockquote');

    setActiveFormats((prev) => {
      if (
        prev.bold === isBold &&
        prev.italic === isItalic &&
        prev.h2 === isH2 &&
        prev.h3 === isH3 &&
        prev.quote === isQuote &&
        prev.ul === isUl &&
        prev.ol === isOl
      ) {
        return prev;
      }
      return {
        bold: isBold,
        italic: isItalic,
        h2: isH2,
        h3: isH3,
        quote: isQuote,
        ul: isUl,
        ol: isOl,
      };
    });
  };

  // Track selection changes inside editor to dynamically highlight active formatting tools
  useEffect(() => {
    const handleSelectionChange = () => {
      if (!editorRef.current) return;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const anchor = sel.anchorNode;
        if (anchor && editorRef.current.contains(anchor)) {
          checkActiveFormats();
          updateActivePre();
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const toggleFormatBlock = (targetTag) => {
    const tagClean = targetTag.replace(/[<>]/g, '').toLowerCase();
    const matchingElements = getSelectedTagElements(tagClean);
    const isTargetActive = matchingElements.length > 0 || isCurrentTag(tagClean);

    if (isTargetActive) {
      let hasLists = false;

      if (matchingElements.length > 0) {
        matchingElements.forEach((el) => {
          if (el.querySelector('ol, ul')) {
            hasLists = true;
            const parent = el.parentNode;
            if (parent) {
              while (el.firstChild) {
                parent.insertBefore(el.firstChild, el);
              }
              parent.removeChild(el);
            }
          } else if (tagClean === 'blockquote') {
            const parent = el.parentNode;
            if (parent) {
              while (el.firstChild) {
                parent.insertBefore(el.firstChild, el);
              }
              parent.removeChild(el);
            }
          } else {
            const p = document.createElement('p');
            p.innerHTML = el.innerHTML || '<br>';
            if (el.style.marginLeft) p.style.marginLeft = el.style.marginLeft;
            el.parentNode?.replaceChild(p, el);
          }
        });
      }

      if (!hasLists) {
        try {
          document.execCommand('formatBlock', false, '<p>');
        } catch (e) {}
      }

      // Cleanup any stray matching headings in selection
      if (editorRef.current) {
        editorRef.current.querySelectorAll(tagClean).forEach((stray) => {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0 && selection.getRangeAt(0).intersectsNode(stray)) {
            const p = document.createElement('p');
            p.innerHTML = stray.innerHTML || '<br>';
            if (stray.style.marginLeft) p.style.marginLeft = stray.style.marginLeft;
            stray.parentNode?.replaceChild(p, stray);
          }
        });
      }
    } else {
      const selection = window.getSelection();
      let insideLi = false;
      if (selection && selection.rangeCount > 0) {
        let node = selection.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeName?.toLowerCase() === 'li') {
            insideLi = true;
            break;
          }
          node = node.parentNode;
        }
      }

      if (insideLi) {
        const li = (() => {
          let n = selection.anchorNode;
          while (n && n !== editorRef.current) {
            if (n.nodeName?.toLowerCase() === 'li') return n;
            n = n.parentNode;
          }
          return null;
        })();

        if (li && li.parentNode) {
          const list = li.parentNode;
          const heading = document.createElement(tagClean);
          heading.innerHTML = li.innerHTML || '<br>';

          if (list.children.length === 1) {
            list.parentNode?.replaceChild(heading, list);
          } else if (li === list.firstElementChild) {
            list.parentNode?.insertBefore(heading, list);
            list.removeChild(li);
          } else if (li === list.lastElementChild) {
            list.parentNode?.insertBefore(heading, list.nextSibling);
            list.removeChild(li);
          } else {
            const secondList = list.cloneNode(false);
            let next = li.nextElementSibling;
            while (next) {
              const toMove = next;
              next = next.nextElementSibling;
              secondList.appendChild(toMove);
            }
            list.removeChild(li);
            list.parentNode?.insertBefore(heading, list.nextSibling);
            list.parentNode?.insertBefore(secondList, heading.nextSibling);
          }

          const newRange = document.createRange();
          newRange.selectNodeContents(heading);
          newRange.collapse(false);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } else {
        document.execCommand('formatBlock', false, `<${tagClean}>`);
      }
    }

    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleIndent = (e) => {
    if (e) e.preventDefault();
    const inCode = isInsideCodeBlock();
    if (inCode) {
      document.execCommand('insertText', false, '  ');
      handleInput();
      return;
    }

    const current = getCurrentBlock();
    // If inside a list item, use native execCommand for list nesting
    if (current && current.tag === 'li') {
      document.execCommand('indent');
      handleInput();
      return;
    }

    // For paragraphs or headings, apply margin-left directly so text never becomes italic
    if (current && current.node && current.node !== editorRef.current) {
      const currentMargin = parseInt(current.node.style.marginLeft || '0', 10);
      current.node.style.marginLeft = `${currentMargin + 32}px`;
      current.node.style.fontStyle = 'normal'; // Always preserve normal font
      handleInput();
      return;
    }

    // Fallback: execCommand indent and strip any italic
    document.execCommand('indent');
    if (editorRef.current) {
      editorRef.current.querySelectorAll('blockquote[style*="margin"], blockquote[style*="border"]').forEach((b) => {
        b.style.fontStyle = 'normal';
      });
    }
    handleInput();
  };

  const handleOutdent = (e) => {
    if (e) e.preventDefault();
    const inCode = isInsideCodeBlock();
    if (inCode) {
      handleInput();
      return;
    }

    const current = getCurrentBlock();
    // If inside a list item, use native execCommand for list outdent
    if (current && current.tag === 'li') {
      document.execCommand('outdent');
      handleInput();
      return;
    }

    // For paragraphs or headings, decrease margin-left
    if (current && current.node && current.node !== editorRef.current) {
      const currentMargin = parseInt(current.node.style.marginLeft || '0', 10);
      if (currentMargin > 0) {
        const newMargin = Math.max(0, currentMargin - 32);
        if (newMargin === 0) {
          current.node.style.removeProperty('margin-left');
        } else {
          current.node.style.marginLeft = `${newMargin}px`;
        }
        current.node.style.fontStyle = 'normal';
        handleInput();
        return;
      }
    }

    document.execCommand('outdent');
    handleInput();
  };

  const insertCodeBlock = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString() || '// Enter code or script here';
    const codeHtml = `<pre><code>${selectedText}</code></pre><p><br></p>`;
    document.execCommand('insertHTML', false, codeHtml);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
      setTimeout(updateActivePre, 50);
    }
  };

  const formatCurrentSnippet = (e) => {
    if (e) e.preventDefault();
    if (!editorRef.current) return;

    let targetPre = activePrePosition?.preEl || isInsideCodeBlock();

    // If not currently focused inside a pre, search for pre elements in the editor
    if (!targetPre) {
      const allPres = editorRef.current.querySelectorAll('pre');
      if (allPres.length === 1) {
        targetPre = allPres[0];
      } else if (allPres.length > 1) {
        let count = 0;
        allPres.forEach((pre) => {
          const codeEl = pre.querySelector('code') || pre;
          const raw = codeEl.innerText || codeEl.textContent;
          codeEl.textContent = formatCodeSnippet(raw);
          count++;
        });
        handleInput();
        updateActivePre();
        showToast(`Formatted ${count} code snippets`, 'success');
        return;
      }
    }

    if (targetPre) {
      const codeEl = targetPre.querySelector('code') || targetPre;
      const raw = codeEl.innerText || codeEl.textContent;
      const formatted = formatCodeSnippet(raw);
      codeEl.textContent = formatted;
      handleInput();
      updateActivePre();
      showToast('Code snippet formatted', 'success');
    } else {
      showToast('No code snippet found. Click Snippet to insert one.', 'info');
    }
  };

  const handleKeyDown = (e) => {
    // Tab / Shift+Tab for Indent & Outdent
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        handleOutdent();
      } else {
        handleIndent();
      }
      return;
    }

    // Alt+Shift+F or Ctrl+Shift+F for Format Code Snippet
    if ((e.altKey && e.shiftKey && e.key === 'F') || (e.ctrlKey && e.shiftKey && e.key === 'F')) {
      e.preventDefault();
      formatCurrentSnippet();
      return;
    }

    // Enter key handling
    if (e.key === 'Enter') {
      const inCode = isInsideCodeBlock();
      if (inCode) {
        e.preventDefault();
        document.execCommand('insertText', false, '\n');
        handleInput();
        return;
      }
      setTimeout(checkActiveFormats, 10);
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
    <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/90 backdrop-blur-xl shadow-glass focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-950/70 border-b border-slate-800/80 text-slate-400">
        <div className="flex flex-wrap items-center gap-1">
          {/* Bold & Italic */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('bold');
            }}
            onClick={(e) => {
              if (e.detail === 0) {
                executeCommand('bold');
              }
            }}
            className={`p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              activeFormats.bold
                ? 'bg-indigo-600 text-white shadow-glow-indigo font-bold'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Bold (Ctrl+B)"
            aria-label="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('italic');
            }}
            onClick={(e) => {
              if (e.detail === 0) {
                executeCommand('italic');
              }
            }}
            className={`p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              activeFormats.italic
                ? 'bg-indigo-600 text-white shadow-glow-indigo font-bold'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Italic (Ctrl+I)"
            aria-label="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1" aria-hidden="true" />

          {/* Headings */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleFormatBlock('h2');
            }}
            onClick={(e) => {
              if (e.detail === 0) {
                toggleFormatBlock('h2');
              }
            }}
            className={`p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 text-xs font-bold font-mono ${
              activeFormats.h2
                ? 'bg-indigo-600 text-white shadow-glow-indigo'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Toggle Section Heading (H2 - click again to undo)"
            aria-label="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleFormatBlock('h3');
            }}
            onClick={(e) => {
              if (e.detail === 0) {
                toggleFormatBlock('h3');
              }
            }}
            className={`p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 text-xs font-bold font-mono ${
              activeFormats.h3
                ? 'bg-indigo-600 text-white shadow-glow-indigo'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Toggle Subheading (H3 - click again to undo)"
            aria-label="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1" aria-hidden="true" />

          {/* Lists & Blockquote */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('insertUnorderedList');
            }}
            onClick={(e) => {
              if (e.detail === 0) {
                executeCommand('insertUnorderedList');
              }
            }}
            className={`p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              activeFormats.ul
                ? 'bg-indigo-600 text-white shadow-glow-indigo font-bold'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Bullet List"
            aria-label="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('insertOrderedList');
            }}
            onClick={(e) => {
              if (e.detail === 0) {
                executeCommand('insertOrderedList');
              }
            }}
            className={`p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              activeFormats.ol
                ? 'bg-indigo-600 text-white shadow-glow-indigo font-bold'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Numbered List"
            aria-label="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleFormatBlock('blockquote');
            }}
            onClick={(e) => {
              if (e.detail === 0) {
                toggleFormatBlock('blockquote');
              }
            }}
            className={`p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              activeFormats.quote
                ? 'bg-indigo-600 text-white shadow-glow-indigo font-bold'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Toggle Blockquote (click again to undo)"
            aria-label="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1" aria-hidden="true" />

          {/* Indent & Outdent Tools (Requirement 1) */}
          <button
            type="button"
            onMouseDown={handleOutdent}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Outdent Content (Shift+Tab)"
            aria-label="Outdent Content"
          >
            <Outdent className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={handleIndent}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Indent Content (Tab)"
            aria-label="Indent Content"
          >
            <Indent className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1" aria-hidden="true" />

          {/* Snippet & Code Format Section (Requirement 2) */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-indigo-500/30 p-0.5 shadow-xs">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                insertCodeBlock();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-indigo-500/20 text-indigo-300 hover:text-white font-bold text-xs font-mono transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Insert Pre-formatted Code Block"
              aria-label="Insert Code Block"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Snippet</span>
            </button>
          </div>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              insertLink();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Insert Hyperlink"
            aria-label="Insert Hyperlink"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 p-0.5 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleToggleMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              !isPreview ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              isPreview ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Body & Preview Pane */}
      <div className="relative">
        {activePrePosition && !isPreview && (
          <div
            className="absolute z-10 flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/95 border border-indigo-500/50 shadow-glow-indigo text-xs font-mono backdrop-blur-md pointer-events-auto transition-all animate-in fade-in"
            style={{
              top: activePrePosition.top,
              right: activePrePosition.right,
            }}
          >
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
              <Code className="w-3 h-3 text-indigo-400" />
              Snippet
            </span>
            <button
              type="button"
              onMouseDown={formatCurrentSnippet}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all shadow-xs active:scale-95"
              title="Automatically format this code snippet"
            >
              <Sparkles className="w-3 h-3 text-cyan-300" />
              <span>Format Code</span>
            </button>
          </div>
        )}

        {/* Live Preview Pane */}
        {isPreview && (
          <div
            className="p-6 sm:p-8 min-h-[380px] post-content post-preview bg-slate-950/40 text-slate-200"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(
                value ||
                  '<p class="text-slate-500 italic">No content written yet. Switch back to Write mode to draft your article.</p>'
              ),
            }}
          />
        )}

        {/* Contenteditable Canvas (Always preserved in DOM to protect undo history & prevent clearing) */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onKeyUp={() => {
            updateActivePre();
            checkActiveFormats();
          }}
          onMouseUp={() => {
            updateActivePre();
            checkActiveFormats();
          }}
          onFocus={() => {
            updateActivePre();
            checkActiveFormats();
          }}
          style={{ display: isPreview ? 'none' : 'block' }}
          className="p-6 sm:p-8 min-h-[380px] post-content focus:outline-none text-slate-100"
          data-placeholder={placeholder}
        />
      </div>

      {/* Editor Bottom Status Bar */}
      <div className="px-5 py-2.5 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="text-slate-300 font-medium">{wordCount} words</span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            ~{readingTime} min read
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          Tab / Shift+Tab to Indent • Alt+Shift+F to Format Code
        </div>
      </div>
    </div>
  );
}
