"use client";

import React, { useState } from "react";
import { 
  ChevronDown, 
  Trash2, 
  Dices, 
  Heart, 
  Shield, 
  Wind,
  Pencil,
  Power
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import NumericInput from "../ui/NumericInput";
import { Summon, RollDiceFunc, RollDamageFunc, AbilityScores } from "../../types/character";
import ActionCard from "../actions/ActionCard";
import { getAbilityModifier } from "../../utils/character-utils";

interface SummonCardProps {
  summon: Summon;
  onUpdate: (summon: Summon) => void;
  onEdit: () => void;
  onDelete: () => void;
  rollDice: RollDiceFunc;
  rollDamage: RollDamageFunc;
  character: any; // characterWithDefaults
  proficiencyBonus: number;
  onAdjustHP: (amount: number, isDamage: boolean) => void;
}

const SummonCard: React.FC<SummonCardProps> = ({
  summon,
  onUpdate,
  onEdit,
  onDelete,
  rollDice,
  rollDamage,
  character,
  proficiencyBonus,
  onAdjustHP
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);

  const handleUpdateHP = (val: number) => {
    const diff = val - summon.hp.current;
    if (diff === 0) return;
    onAdjustHP(Math.abs(diff), diff < 0);
  };

  const handleUpdateTempHP = (val: number) => {
    onUpdate({ ...summon, hp: { ...summon.hp, temp: val } });
  };

  const handleUpdateMaxHP = (val: number) => {
    onUpdate({ ...summon, hp: { ...summon.hp, max: val } });
  };

  const handleUpdateAC = (val: number) => {
    onUpdate({ ...summon, ac: val });
  };

  const formatModifier = (mod: number) => (mod >= 0 ? `+${mod}` : mod);

  const effectivePB = summon.useCharacterPB ? (proficiencyBonus || 2) : (summon.pb || 2);

  const handleAbilityRoll = (abilityName: string, score: number) => {
    const mod = getAbilityModifier(score);
    rollDice(20, mod, `${summon.name}: ${abilityName} Check`);
  };

  const renderRollableList = (text: string | undefined, title: string, suffix: string = "Check") => {
    if (!text) return null;
    
    const parts = text.split(',').map(p => p.trim());
    
    return (
      <div className="flex flex-wrap gap-x-1 gap-y-0.5 items-center">
        <strong className="text-primary uppercase text-[10px] tracking-widest mr-1">{title}</strong>
        {parts.map((part, i) => {
          const match = part.match(/(.+?)\s*([+-]\s*\d+)/);
          if (match) {
            const name = match[1].trim();
            const mod = parseInt(match[2].replace(/\s+/g, ''));
            return (
              <button 
                key={i} 
                onClick={(e) => {
                  e.stopPropagation();
                  rollDice(20, mod, `${summon.name}: ${name} ${suffix}`);
                }}
                className="text-foreground hover:text-primary transition-colors hover:underline decoration-primary/30"
              >
                {name} {formatModifier(mod)}{i < parts.length - 1 ? "," : ""}
              </button>
            );
          }
          return <span key={i} className="text-foreground/80">{part}{i < parts.length - 1 ? "," : ""}</span>;
        })}
      </div>
    );
  };

  const renderSavingThrows = () => {
    const abbreviations = ['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha'] as const;
    const abilityMap: Record<string, keyof AbilityScores> = {
      'Str': 'strength', 'Dex': 'dexterity', 'Con': 'constitution',
      'Int': 'intelligence', 'Wis': 'wisdom', 'Cha': 'charisma'
    };

    return (
      <div className="flex flex-wrap gap-x-1 gap-y-0.5 items-center">
        <strong className="text-primary uppercase text-[10px] tracking-widest mr-1">Saving Throws</strong>
        {abbreviations.map((abbr, i) => {
          const abilityKey = abilityMap[abbr];
          const baseMod = getAbilityModifier(summon.abilityScores?.[abilityKey] || 10);
          
          // Check if overridden in savingThrows string
          const match = summon.savingThrows?.match(new RegExp(`${abbr}\\s*([+-]\\s*\\d+)`, 'i'));
          const displayMod = match ? parseInt(match[1].replace(/\s+/g, '')) : baseMod;
          const isOverridden = !!match;
          
          return (
            <button 
              key={abbr} 
              onClick={(e) => {
                e.stopPropagation();
                rollDice(20, displayMod, `${summon.name}: ${abbr} Saving Throw`);
              }}
              className={`hover:text-primary transition-colors hover:underline decoration-primary/30 ${isOverridden ? "font-bold text-foreground" : "text-foreground/60"}`}
            >
              {abbr} {formatModifier(displayMod)}{i < abbreviations.length - 1 ? "," : ""}
            </button>
          );
        })}
      </div>
    );
  };

  const isActive = summon.active !== false;

  return (
    <Card className={`group border-l-4 transition-all duration-300 ${isActive ? "border-l-primary shadow-md" : "border-l-muted-foreground/30 opacity-60 grayscale-[0.5] shadow-none"}`}>
      <CardContent className="p-0">
        <div 
          className={`p-4 flex justify-between items-center cursor-pointer hover:bg-secondary/10 transition-colors ${isExpanded ? "border-b border-border bg-secondary/5" : ""}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate({ ...summon, active: !isActive });
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isActive ? 'bg-primary' : 'bg-secondary-foreground/20'
              }`}
              title={isActive ? "Dismiss Summon" : "Activate Summon"}
            >
              <span
                className={`pointer-events-none block h-3.5 w-3.5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
                  isActive ? 'translate-x-4.5' : 'translate-x-1'
                }`}
              />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-bold text-lg transition-all ${isActive ? "" : "text-muted-foreground"}`}>{summon.name}</h3>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest border transition-all ${
                  isActive ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-muted-foreground border-border"
                }`}>
                  {summon.type}
                </span>
                {summon.cr && (
                  <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded font-bold border border-border">
                    CR {summon.cr}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                   <Heart className={`w-3 h-3 ${isActive ? "text-red-500" : "text-muted-foreground"}`} />
                   <span className={`font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                     {summon.hp.current} / {summon.hp.max}
                     {summon.hp.temp > 0 && <span className="text-primary ml-1"> (+{summon.hp.temp})</span>}
                   </span> HP
                </div>
                <div className="flex items-center gap-1">
                   <Shield className={`w-3 h-3 ${isActive ? "text-blue-500" : "text-muted-foreground"}`} />
                   <span className={`font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{summon.ac}</span> AC
                </div>
                {summon.speed && (
                  <div className="flex items-center gap-1">
                    <Wind className={`w-3 h-3 ${isActive ? "text-teal-500" : "text-muted-foreground"}`} />
                    <span className={`font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{summon.speed}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 rounded-full hover:bg-secondary/20 text-muted-foreground hover:text-primary transition-all opacity-0 group-hover:opacity-100"
              title="Edit Summon"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className={`p-1.5 rounded-full hover:bg-secondary/20 transition-all ${isExpanded ? "rotate-180" : ""}`}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {isExpanded && (
           <div className={`p-4 space-y-6 bg-secondary/5 animate-in slide-in-from-top-2 duration-200 ${isActive ? "" : "opacity-70"}`}>
             {/* NPC Style Header Info */}
             <div className="border-b-2 border-primary/30 pb-1 mb-4 italic text-sm text-muted-foreground">
                {summon.size} {summon.type}, {summon.alignment}
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Current HP</label>
                  <NumericInput 
                    value={summon.hp.current} 
                    onChange={handleUpdateHP}
                    className="h-8 min-w-0"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Max HP</label>
                  <NumericInput 
                    value={summon.hp.max} 
                    onChange={handleUpdateMaxHP}
                    className="h-8 min-w-0"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Temp HP</label>
                  <NumericInput 
                    value={summon.hp.temp || 0} 
                    onChange={handleUpdateTempHP}
                    className="h-8 min-w-0 text-primary"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">AC</label>
                  <NumericInput 
                    value={summon.ac} 
                    onChange={handleUpdateAC}
                    className="h-8 min-w-0"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Initiative</label>
                  <div className="flex items-center gap-2">
                    <NumericInput 
                      value={summon.initiative || 0} 
                      onChange={(val) => onUpdate({ ...summon, initiative: val })}
                      className="h-8 flex-1 min-w-0"
                    />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        rollDice(20, summon.initiative || 0, `${summon.name} Initiative`);
                      }}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      title="Roll Initiative"
                    >
                      <Dices className="w-4 h-4" />
                    </button>
                  </div>
               </div>
             </div>

             {/* Ability Scores Table */}
             {summon.abilityScores && (
               <div className="py-3 border-y-2 border-primary/20">
                 <div className="grid grid-cols-6 gap-1 text-center">
                   {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map(score => {
                     const val = summon.abilityScores![score];
                     const mod = getAbilityModifier(val);
                     const label = score.substring(0, 3).toUpperCase();
                     return (
                       <button 
                        key={score} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAbilityRoll(label, val);
                        }}
                        className="group/stat space-y-0.5 hover:bg-primary/5 rounded py-1 transition-colors"
                       >
                         <div className="text-[10px] font-black uppercase text-primary leading-tight group-hover/stat:scale-110 transition-transform">{label}</div>
                         <div className="font-bold text-sm leading-tight">{val} ({formatModifier(mod)})</div>
                       </button>
                     );
                   })}
                 </div>
               </div>
             )}

             {/* MM Style Stats */}
             <div className="space-y-1 text-sm leading-snug">
                {renderSavingThrows()}
                {renderRollableList(summon.skills, "Skills")}
                {summon.vulnerabilities && (
                  <div><strong className="text-primary uppercase text-[10px] tracking-widest mr-2">Damage Vulnerabilities</strong> {summon.vulnerabilities}</div>
                )}
                {summon.resistances && (
                  <div><strong className="text-primary uppercase text-[10px] tracking-widest mr-2">Damage Resistances</strong> {summon.resistances}</div>
                )}
                {summon.immunities && (
                  <div><strong className="text-primary uppercase text-[10px] tracking-widest mr-2">Damage Immunities</strong> {summon.immunities}</div>
                )}
                {summon.conditionImmunities && (
                  <div><strong className="text-primary uppercase text-[10px] tracking-widest mr-2">Condition Immunities</strong> {summon.conditionImmunities}</div>
                )}
                {summon.senses && (
                  <div><strong className="text-primary uppercase text-[10px] tracking-widest mr-2">Senses</strong> {summon.senses}</div>
                )}
                {summon.languages && (
                  <div><strong className="text-primary uppercase text-[10px] tracking-widest mr-2">Languages</strong> {summon.languages}</div>
                )}
                {summon.cr && (
                  <div><strong className="text-primary uppercase text-[10px] tracking-widest mr-2">Challenge</strong> {summon.cr} ({summon.xp || 0} XP)</div>
                )}
                <div><strong className="text-primary uppercase text-[10px] tracking-widest mr-2">Proficiency Bonus</strong> {formatModifier(effectivePB)} {summon.useCharacterPB && <span className="text-[10px] text-muted-foreground ml-1 italic">(linked to character)</span>}</div>
             </div>

             {/* Traits */}
             {summon.traits && summon.traits.length > 0 && (
               <div className="space-y-3 pt-2 border-t border-primary/10">
                 {summon.traits.map(trait => (
                   <div key={trait.id} className="text-sm">
                     <strong className="italic font-bold">{trait.name}.</strong> {trait.description}
                   </div>
                 ))}
               </div>
             )}

             {summon.notes && (
               <div className="space-y-1 pt-2 border-t border-border/50">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notes</label>
                 <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                   {summon.notes}
                 </p>
               </div>
             )}

             <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-primary/20 pb-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</label>
                </div>
                
                {summon.actions && summon.actions.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {summon.actions.map(action => (
                      <ActionCard 
                        key={action.id}
                        action={action}
                        abilityScores={summon.abilityScores || character.abilityScores}
                        proficiencyBonus={effectivePB}
                        totalLevel={character.totalLevel || 0}
                        isExpanded={expandedActionId === action.id}
                        onToggleExpand={() => setExpandedActionId(expandedActionId === action.id ? null : action.id)}
                        rollDice={rollDice}
                        rollDamage={rollDamage}
                        character={character}
                        onUpdateActiveBonuses={() => {}}
                        currentCastLevel={action.baseLevel || 0}
                        onCastLevelChange={() => {}}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-background/30 rounded border border-dashed border-border text-xs text-muted-foreground italic">
                    No actions defined.
                  </div>
                )}
             </div>

             <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Summon
                </button>
             </div>
           </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SummonCard;
