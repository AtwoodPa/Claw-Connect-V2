import hljs from 'highlight.js';
import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: true
});

export interface RenderMarkdownOptions {
  highlight?: boolean;
}

function highlightCode(code: string, language: string | undefined): string {
  if (!language) {
    return hljs.highlightAuto(code).value;
  }

  if (!hljs.getLanguage(language)) {
    return hljs.highlightAuto(code).value;
  }

  return hljs.highlight(code, { language }).value;
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<(iframe|object|embed|style)[\s\S]*?>[\s\S]*?<\/\1>/gi, '')
    .replace(/\son\w+=['"][^'"]*['"]/gi, '')
    .replace(/javascript:/gi, '');
}

export function extractCodeBlocks(markdown: string): string[] {
  const matches = markdown.match(/```[\s\S]*?```/g);
  if (!matches) {
    return [];
  }

  return matches.map((block) => block.replace(/^```\w*\n?/, '').replace(/```$/, '').trim());
}

export function renderMarkdown(markdown: string, options: RenderMarkdownOptions = {}): string {
  const renderer = new marked.Renderer();
  const highlightEnabled = options.highlight ?? true;

  renderer.code = (code: string, infoString?: string) => {
    const language = infoString?.split(/\s+/)[0] ?? '';
    const highlighted = highlightEnabled ? highlightCode(code, language) : code;

    return `<pre class="oc-code-block"><code class="hljs language-${language}">${highlighted}</code></pre>`;
  };

  renderer.link = (href, title, text) => {
    const safeHref = href ?? '#';
    const safeTitle = title ? ` title="${title}"` : '';
    return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer"${safeTitle}>${text}</a>`;
  };

  const html = marked.parse(markdown, { renderer }) as string;
  return sanitizeHtml(html);
}
