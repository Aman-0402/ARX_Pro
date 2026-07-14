import type { ReactNode } from "react";

function parseInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-navy-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export function renderMarkdown(content: string): ReactNode[] {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    elements.push(
      <p
        key={key++}
        className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
      >
        {parseInline(paragraphLines.join(" "))}
      </p>
    );
    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    const items = [...listItems];
    elements.push(
      <ul key={key++} className="space-y-2 mb-5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
            <span className="text-gold-400 mt-0.5 shrink-0">•</span>
            <span>{parseInline(item)}</span>
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      elements.push(
        <h3
          key={key++}
          className="font-poppins font-bold text-lg text-navy-900 dark:text-white mt-8 mb-3"
        >
          {trimmed.slice(4)}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      elements.push(
        <h2
          key={key++}
          className="font-poppins font-bold text-xl text-navy-900 dark:text-white mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700"
        >
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      listItems.push(trimmed.slice(2));
      continue;
    }

    flushList();
    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  return elements;
}
