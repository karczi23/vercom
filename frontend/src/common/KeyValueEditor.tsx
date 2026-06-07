import React from 'react';

interface KeyValueEditorProps {
  label: string;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export function KeyValueEditor({ label, values, onChange }: KeyValueEditorProps) {
  const entries = Object.entries(values);

  function updateKey(index: number, key: string) {
    const nextEntries = entries.map<[string, string]>((entry, entryIndex) => entryIndex === index ? [key, entry[1]] : entry);
    onChange(Object.fromEntries(nextEntries.filter(([name]) => name.trim())));
  }

  function updateValue(index: number, value: string) {
    const nextEntries = entries.map<[string, string]>((entry, entryIndex) => entryIndex === index ? [entry[0], value] : entry);
    onChange(Object.fromEntries(nextEntries.filter(([name]) => name.trim())));
  }

  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      {entries.length === 0 ? <p className="text-sm text-slate-500">No variables configured.</p> : null}
      {entries.map(([key, value], index) => (
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]" key={`${key}-${index}`}>
          <input aria-label={`${label} name`} placeholder="Variable name" value={key} onChange={event => updateKey(index, event.target.value)} />
          <input aria-label={`${label} value`} placeholder="Value" value={value} onChange={event => updateValue(index, event.target.value)} />
          <button className="border border-slate-300 bg-white text-slate-800 hover:bg-slate-50" type="button" onClick={() => onChange(Object.fromEntries(entries.filter((_, entryIndex) => entryIndex !== index)))}>
            Remove
          </button>
        </div>
      ))}
      <div>
        <button className="border border-teal-700 bg-white text-teal-800 hover:bg-teal-50" type="button" onClick={() => onChange({ ...values, '': '' })}>
          Add variable
        </button>
      </div>
    </div>
  );
}
