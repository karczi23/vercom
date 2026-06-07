import React, { useEffect, useRef } from 'react';
import pell from 'pell';
import 'pell/dist/pell.css';

interface PellEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PellEditor({ value, onChange }: PellEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement | undefined>(undefined);
  const lastValueRef = useRef(value);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }
    ensureExecCommand();
    const editor = pell.init({
      element: containerRef.current,
      actions: [],
      defaultParagraphSeparator: 'p',
      onChange
    });
    contentRef.current = editor.content;
    editor.content.classList.add('campaign-rich-text-content');
    editor.content.innerHTML = value;

    const handlePaste = (event: ClipboardEvent) => {
      event.preventDefault();
      const text = event.clipboardData?.getData('text/plain') ?? '';
      document.execCommand('insertText', false, text);
      onChange(editor.content.innerHTML);
    };
    editor.content.addEventListener('paste', handlePaste);

    return () => {
      editor.content.removeEventListener('paste', handlePaste);
      containerRef.current?.replaceChildren();
    };
  }, []);

  useEffect(() => {
    if (contentRef.current && value !== lastValueRef.current && contentRef.current.innerHTML !== value) {
      contentRef.current.innerHTML = value;
    }
    lastValueRef.current = value;
  }, [value]);

  return <div className="min-h-[260px] bg-white text-slate-950" ref={containerRef} />;
}

function ensureExecCommand(): void {
  const doc = document as Document & { execCommand?: (command: string, showUi?: boolean, value?: string) => boolean };
  if (typeof doc.execCommand !== 'function') {
    doc.execCommand = () => false;
  }
}
