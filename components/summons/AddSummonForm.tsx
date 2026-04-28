"use client";

import React, { useState, useEffect, useRef } from "react";
import EntityForm from "../ui/EntityForm";
import NumericInput from "../ui/NumericInput";
import Select from "../ui/Select";
import MultiSelect from "../ui/MultiSelect";
import ThemedAutocomplete from "../ui/ThemedAutocomplete";
import { Summon, AbilityScores, SummonTrait, Action, Sense, Speed } from "../../types/character";
import { Plus, Trash2, Pencil, Link } from "lucide-react";
import ActionForm from "../actions/ActionForm";
import ConfirmationModal from "../ui/ConfirmationModal";
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
  isStatblock?: boolean;
}

const AddSummonForm: React.FC<AddSummonFormProps> = ({ 
  onAdd, 
  onCancel, 
  initialSummon,
  isStatblock = false
}) => {
  const [name, setName] = useState(initialSummon?.name || "");
  const [type, setType] = useState(initialSummon?.type || "Summon");
  const [hp, setHp] = useState(initialSummon?.hp || { current: 10, max: 10, temp: 0 });
  const [ac, setAc] = useState(initialSummon?.ac || 10);
  const [walkSpeed, setWalkSpeed] = useState<number>(() => {
    const rawSpeed = initialSummon?.speed as unknown;
    if (typeof rawSpeed === 'object' && rawSpeed !== null && 'walk' in rawSpeed) {
      return (rawSpeed as any).walk?.value || 30;
    }
    if (typeof rawSpeed === 'string') {
      const match = rawSpeed.match(/(\d+)/);
      if (match) return parseInt(match[1]);
    }
    return 30;
  });
  const [flySpeed, setFlySpeed] = useState<number | "">(() => {
    const rawSpeed = initialSummon?.speed as unknown;
    if (typeof rawSpeed === 'object' && rawSpeed !== null && 'fly' in rawSpeed) {
      return (rawSpeed as any).fly?.value || "";
    }
    return "";
  });
  const [swimSpeed, setSwimSpeed] = useState<number | "">(() => {
    const rawSpeed = initialSummon?.speed as unknown;
    if (typeof rawSpeed === 'object' && rawSpeed !== null && 'swim' in rawSpeed) {
      return (rawSpeed as any).swim?.value || "";
    }
    return "";
  });
  const [climbSpeed, setClimbSpeed] = useState<number | "">(() => {
    const rawSpeed = initialSummon?.speed as unknown;
    if (typeof rawSpeed === 'object' && rawSpeed !== null && 'climb' in rawSpeed) {
      return (rawSpeed as any).climb?.value || "";
    }
    return "";
  });
  const [burrowSpeed, setBurrowSpeed] = useState<number | "">(() => {
    const rawSpeed = initialSummon?.speed as unknown;
    if (typeof rawSpeed === 'object' && rawSpeed !== null && 'burrow' in rawSpeed) {
      return (rawSpeed as any).burrow?.value || "";
    }
    return "";
  });
  const [abilityScores, setAbilityScores] = useState<AbilityScores>(initialSummon?.abilityScores || {
    strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
  });
  
  const [initiative, setInitiative] = useState(initialSummon?.initiative || 0);
  const [overrideInitiative, setOverrideInitiative] = useState(initialSummon?.overrideInitiative || false);
  const [notes, setNotes] = useState(initialSummon?.notes || "");
  
  // MM fields
  const [size, setSize] = useState(initialSummon?.size || "Medium");
  const [alignment, setAlignment] = useState(initialSummon?.alignment || "unaligned");
  const [cr, setCr] = useState(initialSummon?.cr || "0");
  const [xp, setXp] = useState(initialSummon?.xp || 0);
  const [pb, setPb] = useState(initialSummon?.pb || 2);
  const [useCharacterPB, setUseCharacterPB] = useState(initialSummon?.useCharacterPB || false);
  const [senses, setSenses] = useState<Sense[]>(() => {
    if (Array.isArray(initialSummon?.senses)) {
      return initialSummon.senses;
    }
    const rawSenses = initialSummon?.senses as unknown;
    if (typeof rawSenses === 'string' && rawSenses.trim()) {
      return rawSenses.split(',').map(s => {
        const trimmed = s.trim();
        const match = trimmed.match(/^(.*?)\s+(\d+\s*ft|\d+\s*feet|\d+)$/i);
        if (match) {
          return { name: match[1].trim(), value: match[2].trim() };
        }
        return { name: trimmed, value: "" };
      });
    }
    return [];
  });
  const [newSense, setNewSense] = useState({ name: "", value: "" });
  const [languages, setLanguages] = useState(initialSummon?.languages || "");
  const [vulnerabilities, setVulnerabilities] = useState(initialSummon?.vulnerabilities || "");
  const [resistances, setResistances] = useState(initialSummon?.resistances || "");
  const [immunities, setImmunities] = useState(initialSummon?.immunities || "");
  const [conditionImmunities, setConditionImmunities] = useState(initialSummon?.conditionImmunities || "");
  const [savingThrows, setSavingThrows] = useState(initialSummon?.savingThrows || "");
  const [skills, setSkills] = useState(initialSummon?.skills || "");
  const [traits, setTraits] = useState<SummonTrait[]>(initialSummon?.traits || []);
  const [actions, setActions] = useState<Action[]>(initialSummon?.actions || []);

  // Action Form state
  const [showActionForm, setShowActionForm] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  
  // Delete confirmation state
  const [actionToDelete, setActionToDelete] = useState<string | null>(null);
  const [traitToDelete, setTraitToDelete] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleAddTrait = () => {
    setTraits([...traits, { id: Date.now().toString(), name: "New Trait", description: "" }]);
  };

  const handleUpdateTrait = (id: string, field: keyof SummonTrait, value: string) => {
    setTraits(traits.map(t => t.id === id ? { ...t, [field]: value } : t));
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

  const confirmRemoveAction = () => {
    if (actionToDelete) {
      setActions(actions.filter(a => a.id !== actionToDelete));
      setActionToDelete(null);
    }
  };

  const confirmRemoveTrait = () => {
    if (traitToDelete) {
      setTraits(traits.filter(t => t.id !== traitToDelete));
      setTraitToDelete(null);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    const speedObj: Speed = {
      walk: { value: walkSpeed },
      ...(flySpeed !== "" && { fly: { value: flySpeed } }),
      ...(swimSpeed !== "" && { swim: { value: swimSpeed } }),
      ...(climbSpeed !== "" && { climb: { value: climbSpeed } }),
      ...(burrowSpeed !== "" && { burrow: { value: burrowSpeed } }),
    };

    const summon: Summon = {
      id: initialSummon?.id || Date.now().toString(),
      name,
      type,
      hp,
      ac,
      speed: speedObj,
      initiative,
      notes,
      abilityScores,
      size,
      alignment,
      cr,
      xp,
      pb,
      useCharacterPB,
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
      overrideInitiative,
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
        proficiencyBonus={useCharacterPB ? 0 : pb} // Pass PB to form for calculations
        resources={[]}
      />
    );
  }

  const DAMAGE_OPTIONS = Array.from(DAMAGE_TYPES);

  return (
    <div ref={containerRef} className="scroll-mt-24">
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex justify-between items-center">
                  Prof Bonus
                  <label className="flex items-center gap-1 cursor-pointer lowercase font-normal normal-case text-primary hover:opacity-80 transition-opacity">
                    <input 
                      type="checkbox" 
                      checked={useCharacterPB} 
                      onChange={(e) => setUseCharacterPB(e.target.checked)}
                      className="w-3 h-3 accent-primary"
                    />
                    <Link className={`w-2.5 h-2.5 ${useCharacterPB ? "text-primary" : "text-muted-foreground/30"}`} />
                    <span>link to char?</span>
                  </label>
                </label>
                <NumericInput 
                  value={pb} 
                  onChange={setPb} 
                  variant="horizontal" 
                  disabled={useCharacterPB}
                  className={useCharacterPB ? "opacity-50" : ""}
                />
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
              {!isStatblock && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current HP</label>
                  <NumericInput value={hp.current} onChange={(val) => setHp({ ...hp, current: val })} variant="horizontal" />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{isStatblock ? "HP" : "Max HP"}</label>
                <NumericInput value={hp.max} onChange={(val) => setHp({ ...hp, max: val })} variant="horizontal" />
              </div>
              {!isStatblock && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Temp HP</label>
                  <NumericInput value={hp.temp} onChange={(val) => setHp({ ...hp, temp: val })} variant="horizontal" />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AC</label>
                <NumericInput value={ac} onChange={setAc} variant="horizontal" />
              </div>
              <div className="col-span-1 sm:col-span-3 lg:col-span-5 grid grid-cols-2 sm:grid-cols-5 gap-2 border-t border-border/20 pt-2 mt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Walk (ft)</label>
                  <NumericInput value={walkSpeed} onChange={setWalkSpeed} variant="horizontal" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Fly (ft)</label>
                  <NumericInput 
                    value={flySpeed} 
                    onChange={setFlySpeed as any}
                    onInputChange={(e) => setFlySpeed(e.target.value === "" ? "" : parseInt(e.target.value))}
                    variant="horizontal"
                    placeholder="—"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Swim (ft)</label>
                  <NumericInput 
                    value={swimSpeed} 
                    onChange={setSwimSpeed as any}
                    onInputChange={(e) => setSwimSpeed(e.target.value === "" ? "" : parseInt(e.target.value))}
                    variant="horizontal"
                    placeholder="—"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Climb (ft)</label>
                  <NumericInput 
                    value={climbSpeed} 
                    onChange={setClimbSpeed as any}
                    onInputChange={(e) => setClimbSpeed(e.target.value === "" ? "" : parseInt(e.target.value))}
                    variant="horizontal"
                    placeholder="—"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Burrow (ft)</label>
                  <NumericInput 
                    value={burrowSpeed} 
                    onChange={setBurrowSpeed as any}
                    onInputChange={(e) => setBurrowSpeed(e.target.value === "" ? "" : parseInt(e.target.value))}
                    variant="horizontal"
                    placeholder="—"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex justify-between items-center">
                  <span>Initiative ({Math.floor((abilityScores.dexterity - 10) / 2) >= 0 ? `+${Math.floor((abilityScores.dexterity - 10) / 2)}` : Math.floor((abilityScores.dexterity - 10) / 2)})</span>
                  <label className="flex items-center gap-1 cursor-pointer lowercase font-normal normal-case text-primary hover:opacity-80 transition-opacity">
                    <input 
                      type="checkbox" 
                      checked={overrideInitiative} 
                      onChange={(e) => setOverrideInitiative(e.target.checked)}
                      className="w-3 h-3 accent-primary"
                    />
                    <span>override?</span>
                  </label>
                </label>
                <NumericInput 
                  value={overrideInitiative ? initiative : Math.floor((abilityScores.dexterity - 10) / 2)} 
                  onChange={setInitiative} 
                  variant="horizontal" 
                  disabled={!overrideInitiative}
                  className={!overrideInitiative ? "opacity-50" : ""}
                />
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
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Senses</label>
                
                {senses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {senses.map((sense, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-secondary text-foreground text-xs px-2 py-1 rounded-md border border-border font-medium">
                        <strong className="text-primary">{sense.name}</strong> {sense.value}
                        <button 
                          type="button" 
                          onClick={() => setSenses(senses.filter((_, i) => i !== idx))}
                          className="text-muted-foreground hover:text-red-500 ml-1 font-bold text-sm"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 items-center">
                  <div className="flex-1 relative">
                    <ThemedAutocomplete
                      value={newSense.name}
                      onChange={(val) => setNewSense({ ...newSense, name: val })}
                      options={SENSES_LIST}
                      placeholder="Sense..."
                    />
                  </div>
                  <input
                    type="text"
                    value={newSense.value}
                    onChange={(e) => setNewSense({ ...newSense, value: e.target.value })}
                    placeholder="Range (e.g. 60 ft)"
                    className="w-32 text-xs p-2 bg-background border border-border rounded focus:ring-1 focus:ring-primary outline-none h-9"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSense.name && newSense.value) {
                        setSenses([...senses, { name: newSense.name, value: newSense.value }]);
                        setNewSense({ name: "", value: "" });
                      }
                    }}
                    className="px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded font-bold text-xs h-9 transition-colors"
                  >
                    Add
                  </button>
                </div>
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
                    <button type="button" onClick={() => setActionToDelete(action.id)} className="p-1 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
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
                  <button type="button" onClick={() => setTraitToDelete(trait.id)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
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

      <ConfirmationModal
        isOpen={!!actionToDelete}
        onClose={() => setActionToDelete(null)}
        onConfirm={confirmRemoveAction}
        title="Delete Action"
        message={`Are you sure you want to delete ${actions.find(a => a.id === actionToDelete)?.name || "this action"}? This cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      <ConfirmationModal
        isOpen={!!traitToDelete}
        onClose={() => setTraitToDelete(null)}
        onConfirm={confirmRemoveTrait}
        title="Delete Trait"
        message={`Are you sure you want to delete ${traits.find(t => t.id === traitToDelete)?.name || "this trait"}? This cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default AddSummonForm;
