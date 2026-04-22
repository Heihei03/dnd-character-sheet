"use client";

import React, { useState } from "react";
import { Plus, Users } from "lucide-react";
import Button from "../ui/button";
import { Summon, RollDiceFunc, RollDamageFunc } from "../../types/character";
import SummonCard from "./SummonCard";
import AddSummonForm from "./AddSummonForm";

interface SummonsSectionProps {
  summons: Summon[];
  onUpdateSummons: (summons: Summon[]) => void;
  rollDice: RollDiceFunc;
  rollDamage: RollDamageFunc;
  character: any;
}

const SummonsSection: React.FC<SummonsSectionProps> = ({
  summons,
  onUpdateSummons,
  rollDice,
  rollDamage,
  character
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddSummon = (newSummon: Summon) => {
    onUpdateSummons([...summons, newSummon]);
    setShowAddForm(false);
  };

  const handleUpdateSummon = (updatedSummon: Summon) => {
    onUpdateSummons(summons.map(s => s.id === updatedSummon.id ? updatedSummon : s));
  };

  const handleDeleteSummon = (id: string) => {
    onUpdateSummons(summons.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-black uppercase tracking-tight">Summons & Companions</h2>
        </div>
        {!showAddForm && (
          <Button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
            variant="primary"
            size="sm"
          >
            <Plus className="w-4 h-4" /> Add Summon
          </Button>
        )}
      </div>

      {showAddForm && (
        <AddSummonForm 
          onAdd={handleAddSummon}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {summons.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {summons.map(summon => (
            <SummonCard 
              key={summon.id}
              summon={summon}
              onUpdate={handleUpdateSummon}
              onDelete={() => handleDeleteSummon(summon.id)}
              rollDice={rollDice}
              rollDamage={rollDamage}
              character={character}
            />
          ))}
        </div>
      ) : (
        !showAddForm && (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-border rounded-2xl bg-secondary/5 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-primary opacity-50" />
            </div>
            <h3 className="text-lg font-bold mb-1">No summons or companions</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Add mounts, familiars, summoned creatures, or any other companions here to track their stats.
            </p>
            <Button 
              onClick={() => setShowAddForm(true)}
              variant="outline"
              size="sm"
              className="mt-6"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Your First Summon
            </Button>
          </div>
        )
      )}
    </div>
  );
};

export default SummonsSection;
