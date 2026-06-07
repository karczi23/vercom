import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export function useRichTextCommands(
  editorRootRef: RefObject<HTMLDivElement | null>,
  fallbackValue: string,
  onChange: (value: string) => void
) {
  const savedRangeRef = useRef<Range | undefined>(undefined);

  useEffect(() => {
    function saveSelection() {
      const content = getContent(editorRootRef);
      const selection = window.getSelection();
      if (!content || !selection || selection.rangeCount === 0) {
        return;
      }
      const range = selection.getRangeAt(0);
      if (content.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }

    document.addEventListener('selectionchange', saveSelection);
    return () => document.removeEventListener('selectionchange', saveSelection);
  }, [editorRootRef]);

  function command(name: string, value?: string) {
    const content = getContent(editorRootRef);
    if (!content) {
      onChange(fallbackValue);
      return;
    }

    content.focus();
    const selection = window.getSelection();
    if (selection && savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }

    document.execCommand(name, false, value);
    onChange(content.innerHTML);

    const nextSelection = window.getSelection();
    if (nextSelection && nextSelection.rangeCount > 0) {
      savedRangeRef.current = nextSelection.getRangeAt(0).cloneRange();
    }
  }

  return {
    command,
    setHeading: (level: 1 | 2 | 3 | 4 | 5 | 6) => command('formatBlock', `H${level}`),
    setParagraph: () => command('formatBlock', 'P')
  };
}

function getContent(editorRootRef: RefObject<HTMLDivElement | null>): HTMLElement | undefined {
  return editorRootRef.current?.querySelector<HTMLElement>('.pell-content') ?? undefined;
}
