import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const renderLine = (line: string, index: number) => {
    // Escape HTML first
    const escapedLine = escapeHtml(line);
    
    // Bold text: **text** (safe replacement after escaping)
    const processedLine = escapedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // List items: * item or - item
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const listContent = escapeHtml(line.trim().substring(2)).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <li key={index} dangerouslySetInnerHTML={{ __html: listContent }} />
      );
    }

    return <p key={index} dangerouslySetInnerHTML={{ __html: processedLine }} />;
  };
  
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  lines.forEach((line, index) => {
      const isListItem = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      
      if (isListItem) {
          currentList.push(line);
      } else {
          if (currentList.length > 0) {
              elements.push(
                  <ul key={`ul-${index}`} className="list-disc list-outside pl-5 space-y-1 my-2">
                      {currentList.map(renderLine)}
                  </ul>
              );
              currentList = [];
          }
          if (line.trim()) {
            elements.push(renderLine(line, index));
          }
      }
  });

  if (currentList.length > 0) {
      elements.push(
          <ul key={`ul-end`} className="list-disc list-outside pl-5 space-y-1 my-2">
              {currentList.map(renderLine)}
          </ul>
      );
  }

  return <div className="space-y-2 text-gray-700 dark:text-gray-300">{elements}</div>;
};

export default MarkdownRenderer;