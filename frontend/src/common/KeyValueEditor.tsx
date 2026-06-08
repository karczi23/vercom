import React, { useEffect, useState } from 'react';

interface KeyValueEditorProps {
  label: string;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export function KeyValueEditor({ label, values, onChange }: KeyValueEditorProps) {
  const [entries, setEntries] = useState<[string, string][]>(() => Object.entries(values));

  useEffect(() => {
    const incomingJson = JSON.stringify(Object.entries(values).sort());
    const currentJson = JSON.stringify(Object.entries(Object.fromEntries(entries)).sort());
    if (incomingJson !== currentJson) {
      setEntries(Object.entries(values));
    }
  }, [values]);

  function updateKey(index: number, key: string) {
    const nextEntries = entries.map<[string, string]>((entry, i) => i === index ? [key, entry[1]] : entry);
    setEntries(nextEntries);
    onChange(Object.fromEntries(nextEntries));
  }

  function updateValue(index: number, value: string) {
    const nextEntries = entries.map<[string, string]>((entry, i) => i === index ? [entry[0], value] : entry);
    setEntries(nextEntries);
    onChange(Object.fromEntries(nextEntries.filter(([name]) => name.trim())));
  }

  function removeEntry(index: number) {
    const nextEntries = entries.filter((_, i) => i !== index);
    setEntries(nextEntries);
    onChange(Object.fromEntries(nextEntries.filter(([name]) => name.trim())));
  }

  function addEntry() {
    const nextEntries: [string, string][] = [...entries, ['', '']];
    setEntries(nextEntries);
  }

  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      {entries.length === 0 ? <p className="text-sm text-slate-500">No variables configured.</p> : null}
      {entries.map(([key, value], index) => (
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]" key={index}>
          <input aria-label={`${label} name`} placeholder="Variable name" value={key} onChange={event => updateKey(index, event.target.value)} />
          <input aria-label={`${label} value`} placeholder="Value" value={value} onChange={event => updateValue(index, event.target.value)} />
          <button className="border border-slate-300 bg-white text-slate-800 hover:bg-slate-50" type="button" onClick={() => removeEntry(index)}>
            Remove
          </button>
        </div>
      ))}
      <div>
        <button className="border border-teal-700 bg-white text-teal-800 hover:bg-teal-50" type="button" onClick={addEntry}>
          Add variable
        </button>
      </div>
    </div>
  );
}
