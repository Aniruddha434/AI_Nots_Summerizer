import React from 'react';
import { AlertCircle, CheckCircle, Clock, FileText, Star } from 'lucide-react';

/**
 * Enhanced summary renderer with markdown-style formatting support
 * Handles headers, bold text, italic text, bullet points, and highlighting
 */
function SummaryRenderer({ content, metadata, className = '' }) {
  // Parse and render markdown-style content
  const renderContent = (text) => {
    if (!text) return null;

    // Split content into lines for processing
    const lines = text.split('\n');
    const elements = [];
    let currentList = [];
    let listKey = 0;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="list-disc list-inside space-y-1 my-3 ml-4">
            {currentList.map((item, index) => (
              <li key={index} className="text-gray-700 leading-relaxed">
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        flushList();
        return;
      }

      // Handle headers
      if (trimmedLine.startsWith('## ')) {
        flushList();
        const headerText = trimmedLine.substring(3);
        elements.push(
          <h3 key={`header-${index}`} className="text-lg font-semibold text-gray-900 mt-6 mb-3 border-b border-gray-200 pb-1">
            {renderInlineFormatting(headerText)}
          </h3>
        );
      } else if (trimmedLine.startsWith('# ')) {
        flushList();
        const headerText = trimmedLine.substring(2);
        elements.push(
          <h2 key={`header-${index}`} className="text-xl font-bold text-gray-900 mt-6 mb-4">
            {renderInlineFormatting(headerText)}
          </h2>
        );
      }
      // Handle bullet points
      else if (trimmedLine.startsWith('- ')) {
        const listItem = trimmedLine.substring(2);
        currentList.push(listItem);
      }
      // Handle regular paragraphs
      else {
        flushList();
        elements.push(
          <p key={`para-${index}`} className="text-gray-700 leading-relaxed mb-3">
            {renderInlineFormatting(trimmedLine)}
          </p>
        );
      }
    });

    // Flush any remaining list items
    flushList();

    return elements;
  };

  // Render inline formatting (bold, italic, highlighting)
  const renderInlineFormatting = (text) => {
    if (!text) return '';

    // Split text by formatting markers and process each part
    const parts = [];
    let currentText = text;
    let key = 0;

    // Process bold text (**text**)
    currentText = currentText.replace(/\*\*([^*]+)\*\*/g, (match, content) => {
      const placeholder = `__BOLD_${key++}__`;
      parts.push({
        type: 'bold',
        content,
        placeholder
      });
      return placeholder;
    });

    // Process italic text (*text*)
    currentText = currentText.replace(/\*([^*]+)\*/g, (match, content) => {
      const placeholder = `__ITALIC_${key++}__`;
      parts.push({
        type: 'italic',
        content,
        placeholder
      });
      return placeholder;
    });

    // Process dates and deadlines for highlighting
    currentText = currentText.replace(/\(([^)]*(?:deadline|due|by).*?)\)/gi, (match, content) => {
      const placeholder = `__DEADLINE_${key++}__`;
      parts.push({
        type: 'deadline',
        content: content,
        placeholder
      });
      return placeholder;
    });

    // Process monetary amounts
    currentText = currentText.replace(/\$[\d,]+(?:\.\d{2})?/g, (match) => {
      const placeholder = `__MONEY_${key++}__`;
      parts.push({
        type: 'money',
        content: match,
        placeholder
      });
      return placeholder;
    });

    // Process percentages
    currentText = currentText.replace(/\b\d+%/g, (match) => {
      const placeholder = `__PERCENT_${key++}__`;
      parts.push({
        type: 'percent',
        content: match,
        placeholder
      });
      return placeholder;
    });

    // Split by placeholders and render
    let result = [currentText];
    
    parts.forEach(part => {
      const newResult = [];
      result.forEach(item => {
        if (typeof item === 'string' && item.includes(part.placeholder)) {
          const splitParts = item.split(part.placeholder);
          splitParts.forEach((splitPart, index) => {
            if (index > 0) {
              // Add the formatted element
              if (part.type === 'bold') {
                newResult.push(
                  <strong key={`bold-${part.placeholder}`} className="font-semibold text-gray-900">
                    {part.content}
                  </strong>
                );
              } else if (part.type === 'italic') {
                newResult.push(
                  <em key={`italic-${part.placeholder}`} className="italic text-blue-700">
                    {part.content}
                  </em>
                );
              } else if (part.type === 'deadline') {
                newResult.push(
                  <span key={`deadline-${part.placeholder}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mx-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {part.content}
                  </span>
                );
              } else if (part.type === 'money') {
                newResult.push(
                  <span key={`money-${part.placeholder}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mx-1">
                    {part.content}
                  </span>
                );
              } else if (part.type === 'percent') {
                newResult.push(
                  <span key={`percent-${part.placeholder}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mx-1">
                    {part.content}
                  </span>
                );
              }
            }
            if (splitPart) {
              newResult.push(splitPart);
            }
          });
        } else {
          newResult.push(item);
        }
      });
      result = newResult;
    });

    return result;
  };

  // Render quality indicator
  const renderQualityIndicator = () => {
    if (!metadata?.qualityScore) return null;

    const score = metadata.qualityScore;
    let color = 'gray';
    let icon = AlertCircle;

    if (score >= 80) {
      color = 'green';
      icon = CheckCircle;
    } else if (score >= 60) {
      color = 'yellow';
      icon = Star;
    }

    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
        {React.createElement(icon, { className: 'h-3 w-3 mr-1' })}
        Quality: {score}/100
      </div>
    );
  };

  // Render validation issues if any
  const renderValidationIssues = () => {
    if (!metadata?.validation?.issues?.length) return null;

    return (
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Content Suggestions</h4>
            <ul className="mt-1 text-sm text-yellow-700 space-y-1">
              {metadata.validation.suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`summary-renderer ${className}`}>
      {/* Quality indicator */}
      {metadata && (
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-3">
            {renderQualityIndicator()}
            {metadata.wordCount && (
              <div className="flex items-center">
                <FileText className="h-3 w-3 mr-1" />
                {metadata.wordCount} words
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="prose prose-sm max-w-none">
        {renderContent(content)}
      </div>

      {/* Validation issues */}
      {renderValidationIssues()}
    </div>
  );
}

export default SummaryRenderer;
