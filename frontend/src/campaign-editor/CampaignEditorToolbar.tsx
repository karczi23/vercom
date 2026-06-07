import React from 'react';

interface CampaignEditorToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onHeading: (level: 1 | 2 | 3 | 4 | 5 | 6) => void;
  onParagraph: () => void;
  onFont: (font: string) => void;
}

const fonts = ['Arial', 'Georgia', 'Times New Roman', 'Verdana'];
const headingLevels = [1, 2, 3, 4, 5, 6] as const;

export function CampaignEditorToolbar({ onBold, onItalic, onHeading, onParagraph, onFont }: CampaignEditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 p-2" aria-label="Campaign editor toolbar">
      <button className="h-9 w-9 rounded-md border border-slate-300 bg-white font-bold text-slate-900" type="button" onClick={onBold} title="Bold">B</button>
      <button className="h-9 w-9 rounded-md border border-slate-300 bg-white italic text-slate-900" type="button" onClick={onItalic} title="Italic">I</button>
      <select className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900" aria-label="Text style" onChange={event => {
        if (event.target.value === 'p') {
          onParagraph();
        } else {
          onHeading(Number(event.target.value) as 1 | 2 | 3 | 4 | 5 | 6);
        }
      }} defaultValue="">
        <option value="" disabled>Text style</option>
        <option value="p">Paragraph</option>
        {headingLevels.map(level => <option key={level} value={level}>Heading {level}</option>)}
      </select>
      <select className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900" aria-label="Font family" onChange={event => onFont(event.target.value)} defaultValue="">
        <option value="" disabled>Font</option>
        {fonts.map(font => <option key={font} value={font}>{font}</option>)}
      </select>
    </div>
  );
}
