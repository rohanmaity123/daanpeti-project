export function markdownToHtml(md) {
    if (!md) return '';
    let html = md
        .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^### (.+)$/gm,  '<h3>$1</h3>')
        .replace(/^## (.+)$/gm,   '<h2>$1</h2>')
        .replace(/^# (.+)$/gm,    '<h1>$1</h1>')
        .replace(/^> (.+)$/gm,    '<blockquote>$1</blockquote>')
        .replace(/^---$/gm,       '<hr />')
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g,         '<em>$1</em>')
        .replace(/`([^`]+)`/g,         '<code>$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/^[-*] (.+)$/gm,  '<li>$1</li>')
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p>');
    html = html.replace(/((<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
    return `<p>${html}</p>`;
}
