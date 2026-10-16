/**
 * Omnilog Code Snippet Auto-Formatter
 * Automatically indents and beautifies code snippets across JavaScript, TypeScript,
 * JSON, HTML/XML, CSS, Python, SQL, and generic C-style brace languages.
 *
 * @param {string} rawCode - Unformatted raw code snippet string
 * @returns {string} - Cleanly indented and formatted code string
 */
export function formatCodeSnippet(rawCode) {
  if (!rawCode || typeof rawCode !== 'string') return rawCode;
  const trimmed = rawCode.trim();
  if (!trimmed) return rawCode;

  // 1. JSON Auto-Formatting
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      // Continue to generic formatter if invalid JSON
    }
  }

  // 2. HTML / XML Auto-Formatting
  const looksLikeHtml =
    /^<[a-zA-Z][\s\S]*>$/i.test(trimmed) &&
    !trimmed.includes('=>') &&
    !trimmed.includes('function ');

  if (looksLikeHtml) {
    let formatted = '';
    let indent = 0;
    const tokens = trimmed
      .replace(/>\s*</g, '><')
      .split(/(?=<)|(?<=>)/g)
      .filter((t) => t.trim());

    for (const token of tokens) {
      const t = token.trim();
      if (!t) continue;
      if (t.startsWith('</')) {
        indent = Math.max(0, indent - 1);
        formatted += '  '.repeat(indent) + t + '\n';
      } else if (
        t.startsWith('<') &&
        !t.endsWith('/>') &&
        !t.startsWith('<!') &&
        !/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/i.test(t)
      ) {
        formatted += '  '.repeat(indent) + t + '\n';
        indent++;
      } else {
        formatted += '  '.repeat(indent) + t + '\n';
      }
    }
    return formatted.trimEnd();
  }

  // 3. Multi-line code (JS, TS, C, Java, Go, Rust, Python, CSS, SQL, Bash)
  const lines = rawCode.replace(/\r\n/g, '\n').split('\n');
  let indentLevel = 0;
  const indentStr = '  '; // 2 spaces standard
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      result.push('');
      continue;
    }

    // Python / block branch adjustments
    if (/^(else:|elif |except:|finally:)/.test(line)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Check if line starts with closing tokens
    const startsWithClose = /^[\}\]\)]+/.test(line);
    const closeCountAtStart = (line.match(/^[\}\]\)]+/) || [''])[0].length;

    if (startsWithClose) {
      indentLevel = Math.max(0, indentLevel - closeCountAtStart);
    }

    // Add current line with calculated indent
    result.push(indentStr.repeat(indentLevel) + line);

    // Calculate delta for brackets on this line
    const lineAfterStart = startsWithClose ? line.slice(closeCountAtStart) : line;
    const opens = (lineAfterStart.match(/[\{\[\(]/g) || []).length;
    const closes = (lineAfterStart.match(/[\}\]\)]/g) || []).length;

    indentLevel += opens - closes;
    if (indentLevel < 0) indentLevel = 0;

    // Check for Python / YAML colons at end of line (def, if, class, etc.)
    if (line.endsWith(':') && !line.startsWith('//') && !line.startsWith('#')) {
      indentLevel += 1;
    }
  }

  return result.join('\n');
}
