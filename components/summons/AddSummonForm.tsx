"use client";

import React, { useState } from "react";
import EntityForm from "../ui/EntityForm";
import NumericInput from "../ui/NumericInput";
import Select from "../ui/Select";
import MultiSelect from "../ui/MultiSelect";
import ThemedAutocomplete from "../ui/ThemedAutocomplete";
import { Summon, AbilityScores, SummonTrait, Action } from "../../types/character";
import { Plus, Trash2, Pencil } from "lucide-react";
import ActionForm from "../actions/ActionForm";
import { 
  DAMAGE_TYPES, 
  CONDITION_TYPES, 
  SENSES_LIST, 
  LANGUAGES,
  SKILL_LIST 
} from "../../utils/constants";

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
  
  // New MM fields
  const [size, setSize] = useState(initialSummon?.size || "Medium");
  const [alignment, setAlignment] = useState(initialSummon?.alignment || "unaligned");
  const [cr, setCr] = useState(initialSummon?.cr || "0");
  const [xp, setXp] = useState(initialSummon?.xp || 0);
  const [senses, setSenses] = useState(initialSummon?.senses || "");
  const [languages, setLanguages] = useState(initialSummon?.languages || "");
  const [vulnerabilities, setVulnerabilities] = useState(initialSummon?.vulnerabilities || "");
  const [resistances, setResistances] = useState(initialSummon?.resistances || "");
  const [immunities, setImmunities] = useState(initialSummon?.immunities || "");
  const [conditionImmunities, setConditionImmunities] = useState(initialSummon?.conditionImmunities || "");
  const [savingThrows, setSavingThrows] = useState(initialSummon?.savingThrows || "");
  const [skills, setSkills] = useState(initialSummon?.skills || "");
  const [abilityScores, setAbilityScores] = useState<AbilityScores>(initialSummon?.abilityScores || {
    strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
  });
  const [traits, setTraits] = useState<SummonTrait[]>(initialSummon?.traits || []);
  const [actions, setActions] = useState<Action[]>(initialSummon?.actions || []);

  // Action Form state
  const [showActionForm, setShowActionForm] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);

  const handleAddTrait = () => {
    setTraits([...traits, { id: Date.now().toString(), name: "New Trait", description: "" }]);
  };

  const handleUpdateTrait = (id: string, field: keyof SummonTrait, value: string) => {
    setTraits(traits.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleRemoveTrait = (id: string) => {
    setTraits(traits.filter(t => t.id !== id));
  };

  const handleOpenActionForm = (actionId?: string) => {
    setEditingActionId(actionId || null);
    setShowActionForm(true);
  };

  const handleSaveAction = (actionData: Partial<Action>) => {
    if (editingActionId) {
      setActions(actions.map(a => a.id === editingActionId ? { ...a, ...actionData } as Action : a));
    } else {
      const newAction: Action = {
        id: Date.now().toString(),
        ...actionData
      } as Action;
      setActions([...actions, newAction]);
    }
    setShowActionForm(false);
    setEditingActionId(null);
  };

  const handleRemoveAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id));
  };

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
      abilityScores,
      size,
      alignment,
      cr,
      xp,
      senses,
      languages,
      vulnerabilities,
      resistances,
      immunities,
      conditionImmunities,
      savingThrows,
      skills,
      traits,
      actions,
    };

    onAdd(summon);
  };

  if (showActionForm) {
    return (
      <ActionForm 
        isEditing={!!editingActionId}
        initialData={actions.find(a => a.id === editingActionId)}
        onSave={handleSaveAction}
        onCancel={() => setShowActionForm(false)}
        abilityScores={abilityScores}
        proficiencyBonus={0}
        resources={[]}
      />
    );
  }

  const DAMAGE_OPTIONS = Array.from(DAMAGE_TYPES);

  return (
    <EntityForm
      title={initialSummon ? "Edit Summon" : "Add New Summon"}
      onSave={handleSubmit}
      onCancel={onCancel}
      saveLabel={initialSummon ? "Update" : "Add"}
    >
      <div className="space-y-6">
        {/* Basic Info */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-1">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-border bg-background rounded focus:ring-1 focus:ring-primary outline-none"
                placeholder="e.g. Wolf"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type/Race</label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 border border-border bg-background rounded focus:ring-1 focus:ring-primary outline-none"
                placeholder="e.g. Beast"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Size</label>
              <Select
                value={size}
                onValueChange={setSize}
                options={[
                  { label: "Tiny", value: "Tiny" },
                  { label: "Small", value: "Small" },
                  { label: "Medium", value: "Medium" },
                  { label: "Large", value: "Large" },
                  { label: "Huge", value: "Huge" },
                  { label: "Gargantuan", value: "Gargantuan" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alignment</label>
              <input
                type="text"
                value={alignment}
                onChange={(e) => setAlignment(e.target.value)}
                className="w-full p-2 border border-border bg-background rounded focus:ring-1 focus:ring-primary outline-none"
                placeholder="e.g. unaligned"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CR</label>
              <input
                type="text"
                value={cr}
                onChange={(e) => setCr(e.target.value)}
                className="w-full p-2 border border-border bg-background rounded focus:ring-1 focus:ring-primary outline-none"
                placeholder="e.g. 1/4"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">XP</label>
              <NumericInput value={xp} onChange={setXp} variant="horizontal" />
            </div>
          </div>
        </section>

        {/* Ability Scores */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-1">Ability Scores</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map(score => (
              <div key={score} className="space-y-1 text-center">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{score.substring(0, 3)}</label>
                <NumericInput 
                  value={abilityScores[score]} 
                  onChange={(val) => setAbilityScores({ ...abilityScores, [score]: val })}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Stats & Defenses */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-1">Stats & Defenses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current HP</label>
              <NumericInput value={hp.current} onChange={(val) => setHp({ ...hp, current: val })} variant="horizontal" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Max HP</label>
              <NumericInput value={hp.max} onChange={(val) => setHp({ ...hp, max: val })} variant="horizontal" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AC</label>
              <NumericInput value={ac} onChange={setAc} variant="horizontal" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Speed</label>
              <input type="text" value={speed} onChange={(e) => setSpeed(e.target.value)} className="w-full p-2 border border-border bg-background rounded focus:ring-1 focus:ring-primary outline-none h-9 text-sm" placeholder="30 ft" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Initiative</label>
              <NumericInput value={initiative} onChange={setInitiative} variant="horizontal" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Damage Vulnerabilities</label>
              <MultiSelect value={vulnerabilities} onChange={setVulnerabilities} options={DAMAGE_OPTIONS} placeholder="Add type..." />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Damage Resistances</label>
              <MultiSelect value={resistances} onChange={setResistances} options={DAMAGE_OPTIONS} placeholder="Add type..." />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Damage Immunities</label>
              <MultiSelect value={immunities} onChange={setImmunities} options={DAMAGE_OPTIONS} placeholder="Add type..." />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Condition Immunities</label>
              <MultiSelect value={conditionImmunities} onChange={setConditionImmunities} options={CONDITION_TYPES} placeholder="Add condition..." />
            </div>
          </div>
        </section>

        {/* Proficiencies & Senses */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-1">Proficiencies & Senses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Saving Throws</label>
              <input type="text" value={savingThrows} onChange={(e) => setSavingThrows(e.target.value)} className="w-full p-2 border border-border bg-background rounded focus:ring-1 focus:ring-primary outline-none text-sm" placeholder="e.g. Str +3, Con +4" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Skills</label>
              <MultiSelect value={skills} onChange={setSkills} options={SKILL_LIST.map(s => s.name)} placeholder="e.g. Perception +4" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Senses</label>
              <MultiSelect value={senses} onChange={setSenses} options={SENSES_LIST} placeholder="Add sense..." />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Languages</label>
              <MultiSelect value={languages} onChange={setLanguages} options={LANGUAGES} placeholder="Add language..." />
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-primary/20 pb-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Actions</h3>
            <button type="button" onClick={() => handleOpenActionForm()} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Action
            </button>
          </div>
          <div className="space-y-2">
            {actions.map(action => (
              <div key={action.id} className="flex justify-between items-center p-2 border border-border rounded bg-secondary/5 group">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm">{action.name}</span>
                  <span className="text-[10px] uppercase text-muted-foreground">{action.type}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => handleOpenActionForm(action.id)} className="p-1 hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => handleRemoveAction(action.id)} className="p-1 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
            {actions.length === 0 && (
              <div className="text-center py-4 text-xs text-muted-foreground italic border border-dashed border-border rounded">
                No actions added yet.
              </div>
            )}
          </div>
        </section>

        {/* Traits */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-primary/20 pb-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Special Traits</h3>
            <button type="button" onClick={handleAddTrait} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Trait
            </button>
          </div>
          <div className="space-y-4">
            {traits.map(trait => (
              <div key={trait.id} className="p-3 border border-border rounded-lg bg-secondary/5 space-y-2 relative group">
                <button type="button" onClick={() => handleRemoveTrait(trait.id)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-1 pr-8">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Trait Name</label>
                  <input type="text" value={trait.name} onChange={(e) => handleUpdateTrait(trait.id, 'name', e.target.value)} className="w-full p-1.5 border border-border bg-background rounded text-sm font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Description</label>
                  <textarea value={trait.description} onChange={(e) => handleUpdateTrait(trait.id, 'description', e.target.value)} className="w-full p-2 border border-border bg-background rounded text-sm min-h-[60px] outline-none" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-1">Additional Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-border bg-background rounded text-sm min-h-[100px] focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Other details..."
          />
        </section>
      </div>
    </EntityForm>
  );
};

export default AddSummonForm;
