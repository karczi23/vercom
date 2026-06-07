import React from 'react';
import { sanitizePreviewHtml } from './sanitizePreview.js';

interface CampaignPreviewProps {
  html: string;
  placeholders?: string[];
}

export function CampaignPreview({ html, placeholders = [] }: CampaignPreviewProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-950">Preview</h3>
        <div className="text-xs text-slate-500">{placeholders.length} placeholders</div>
      </div>
      <div className="prose prose-sm mt-3 max-w-none text-slate-800" dangerouslySetInnerHTML={{ __html: sanitizePreviewHtml(html) }} />
      {placeholders.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {placeholders.map(name => <span className="rounded bg-teal-50 px-2 py-1 text-xs text-teal-800" key={name}>{`{{ ${name} }}`}</span>)}
        </div>
      ) : null}
    </section>
  );
}
