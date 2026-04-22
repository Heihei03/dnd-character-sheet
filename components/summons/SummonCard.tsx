"use client";

import React, { useState } from "react";
import { 
  ChevronDown, 
  Trash2, 
  Dices, 
  Heart, 
  Shield, 
  Zap, 
  Wind,
  Plus,
  Pencil
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import NumericInput from "../ui/NumericInput";
import { Summon, RollDiceFunc, RollDamageFunc } from "../../types/character";
import ActionCard from "../actions/ActionCard";

interface SummonCardProps {
  summon: Summon;
  onUpdate: (summon: Summon) => void;
  onEdit: () => void;
  onDelete: () => void;
  rollDice: RollDiceFunc;
  rollDamage: RollDamageFunc;
  character: any; // characterWithDefaults
}

const SummonCard: React.FC<SummonCardProps> = ({
  summon,
  onUpdate,
  onEdit,
  onDelete,
  rollDice,
  rollDamage,
  character
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);

  const handleUpdateHP = (val: number) => {
    onUpdate({ ...summon, hp: { ...summon.hp, current: val } });
  };

  const handleUpdateMaxHP = (val: number) => {
    onUpdate({ ...summon, hp: { ...summon.hp, max: val } });
  };

  const handleUpdateAC = (val: number) => {
    onUpdate({ ...summon, ac: val });
  };

  return (
    <Card className="group border-l-4 border-l-primary/50 overflow-hidden">
      <CardContent className="p-0">
        <div 
          className={`p-4 flex justify-between items-center cursor-pointer hover:bg-secondary/10 transition-colors ${isExpanded ? "border-b border-border bg-secondary/5" : ""}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{summon.name}</h3>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-black uppercase tracking-widest border border-primary/20">
                  {summon.type}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                   <Heart className="w-3 h-3 text-red-500" />
                   <span className="font-bold text-foreground">{summon.hp.current} / {summon.hp.max}</span> HP
                </div>
                <div className="flex items-center gap-1">
                   <Shield className="w-3 h-3 text-blue-500" />
                   <span className="font-bold text-foreground">{summon.ac}</span> AC
                </div>
                {summon.speed && (
                  <div className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-teal-500" />
                    <span className="font-bold text-foreground">{summon.speed}</span>
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
           <div className="p-4 space-y-6 bg-secondary/5 animate-in slide-in-from-top-2 duration-200">
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

             {summon.notes && (
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notes</label>
                 <p className="text-sm text-foreground/80 whitespace-pre-wrap bg-background/50 p-3 rounded border border-border">
                   {summon.notes}
                 </p>
               </div>
             )}

             <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</label>
                </div>
                
                {summon.actions && summon.actions.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {summon.actions.map(action => (
                      <ActionCard 
                        key={action.id}
                        action={action}
                        abilityScores={summon.abilityScores || character.abilityScores}
                        proficiencyBonus={character.proficiencyBonus || 0}
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
                    No actions defined. Add them via features or edit the character.
                  </div>
                )}
             </div>

             <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button 
                  onClick={onDelete}
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
