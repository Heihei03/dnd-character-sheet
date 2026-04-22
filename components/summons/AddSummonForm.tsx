"use client";

import React, { useState } from "react";
import EntityForm from "../ui/EntityForm";
import NumericInput from "../ui/NumericInput";
import Select from "../ui/Select";
import { Summon } from "../../types/character";

interface AddSummonFormProps {
  onAdd: (summon: Summon) => void;
  onCancel: () => void;
  initialSummon?: Summon;
}

const AddSummonForm: React.FC<AddSummonFormProps> = ({ onAdd, onCancel, initialSummon }) => {
  const [name, setName] = useState(initialSummon?.name || "");
  const [type, setType] = useState(initialSummon?.type || "Summon");
  const [hp, setHp] = useState(initialSummon?.hp || { current: 10, max: 10, temp: 0 });
  const [ac, setAc] = useState(initialSummon?.ac || 10);
  const [speed, setSpeed] = useState(initialSummon?.speed || "30 ft");
  const [initiative, setInitiative] = useState(initialSummon?.initiative || 0);
  const [notes, setNotes] = useState(initialSummon?.notes || "");

  const handleSubmit = () => {
    if (!name.trim()) return;

    const summon: Summon = {
      id: initialSummon?.id || Date.now().toString(),
      name,
      type,
      hp,
      ac,
      speed,
      initiative,
      notes,
      actions: initialSummon?.actions || [],
    };

    onAdd(summon);
  };

  return (
    <EntityForm
      title={initialSummon ? "Edit Summon" : "Add New Summon"}
      onSave={handleSubmit}
      onCancel={onCancel}
      saveLabel={initialSummon ? "Update" : "Add"}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-border bg-background rounded focus:ring-1 focus:ring-primary outline-none"
              placeholder="e.g. Wolf, Phantom Steed..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</label>
            <Select
              value={type}
              onValueChange={setType}
              options={[
                { label: "Summon", value: "Summon" },
                { label: "Mount", value: "Mount" },
                { label: "Companion", value: "Companion" },
                { label: "Other", value: "Other" },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current HP</label>
            <NumericInput
              value={hp.current}
              onChange={(val) => setHp({ ...hp, current: val })}
              variant="horizontal"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Max HP</label>
            <NumericInput
              value={hp.max}
              onChange={(val) => setHp({ ...hp, max: val })}
              variant="horizontal"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AC</label>
            <NumericInput
              value={ac}
              onChange={setAc}
              variant="horizontal"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Speed</label>
            <input
              type="text"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              className="w-full p-2 border border-border bg-background rounded focus:ring-1 focus:ring-primary outline-none h-9 text-sm"
              placeholder="30 ft"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Initiative</label>
            <NumericInput
              value={initiative}
              onChange={setInitiative}
              variant="horizontal"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-border bg-background rounded text-sm min-h-[100px] focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Special abilities, traits, etc..."
          />
        </div>
      </div>
    </EntityForm>
  );
};

export default AddSummonForm;
