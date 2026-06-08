import React, { useMemo } from 'react';
import type { Campaign } from '@vercom/common/types/mailing-campaigns';

interface AssignedCampaignSelectorProps {
  campaigns: Campaign[];
  selectedEditorId?: string | undefined;
  visibleCampaignCount: number;
  onSelectEditor: (editorId: string) => void;
}

export function AssignedCampaignSelector({ campaigns, selectedEditorId, visibleCampaignCount, onSelectEditor }: AssignedCampaignSelectorProps) {
  const editorIds = useMemo(() => {
    const ids = new Set(campaigns.map(campaign => campaign.assignedOperatorId));
    if (selectedEditorId) {
      ids.add(selectedEditorId);
    }
    return [...ids].sort();
  }, [campaigns, selectedEditorId]);

  return (
    <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3">
      <label className="grid gap-1 text-sm font-medium text-slate-800">
        Show campaigns assigned to
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-950"
          disabled={editorIds.length === 0}
          value={selectedEditorId ?? ''}
          onChange={event => onSelectEditor(event.target.value)}
        >
          {editorIds.length === 0 ? <option value="">No assigned editors</option> : null}
          {editorIds.map(editorId => (
            <option key={editorId} value={editorId}>{editorId}</option>
          ))}
        </select>
      </label>
      <p className="text-sm text-slate-600">
        {visibleCampaignCount === 1 ? '1 campaign assigned' : `${visibleCampaignCount} campaigns assigned`}
      </p>
      {selectedEditorId && visibleCampaignCount === 0 ? (
        <p className="rounded-md bg-white px-3 py-2 text-sm text-slate-600">No campaigns assigned to this editor.</p>
      ) : null}
    </div>
  );
}
