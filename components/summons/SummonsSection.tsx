"use client";

import React, { useState } from "react";
import { Plus, Users, ShieldAlert } from "lucide-react";
import Button from "../ui/button";
import { Summon, RollDiceFunc, RollDamageFunc } from "../../types/character";
import SummonCard from "./SummonCard";
import AddSummonForm from "./AddSummonForm";
import ConfirmationModal from "../ui/ConfirmationModal";

interface SummonsSectionProps {
  summons: Summon[];
  onUpdateSummons: (summons: Summon[]) => void;
  summonStatblocks: Summon[];
  onUpdateSummonStatblocks: (statblocks: Summon[]) => void;
  rollDice: RollDiceFunc;
  rollDamage: RollDamageFunc;
  character: any;
  proficiencyBonus: number;
  handleAdjustSummonHP: (summonId: string, amount: number, isDamage: boolean) => void;
}

const SummonsSection: React.FC<SummonsSectionProps> = ({
  summons,
  onUpdateSummons,
  summonStatblocks,
  onUpdateSummonStatblocks,
  rollDice,
  rollDamage,
  character,
  proficiencyBonus,
  handleAdjustSummonHP
}) => {
  // Statblock State
  const [showAddStatblockForm, setShowAddStatblockForm] = useState(false);
  const [editingStatblockId, setEditingStatblockId] = useState<string | null>(null);
  const [statblockToDelete, setStatblockToDelete] = useState<string | null>(null);

  // Instance State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSummonId, setEditingSummonId] = useState<string | null>(null);
  const [summonToDelete, setSummonToDelete] = useState<string | null>(null);

  // Statblock Handlers
  const handleAddStatblock = (newStatblock: Summon) => {
    if (editingStatblockId) {
      onUpdateSummonStatblocks(summonStatblocks.map(s => s.id === editingStatblockId ? newStatblock : s));
      setEditingStatblockId(null);
    } else {
      onUpdateSummonStatblocks([...summonStatblocks, newStatblock]);
    }
    setShowAddStatblockForm(false);
  };

  const handleDeleteStatblock = (id: string) => {
    setStatblockToDelete(id);
  };

  const confirmDeleteStatblock = () => {
    if (statblockToDelete) {
      onUpdateSummonStatblocks(summonStatblocks.filter(s => s.id !== statblockToDelete));
      setStatblockToDelete(null);
    }
  };

  const handleEditStatblock = (id: string) => {
    setEditingStatblockId(id);
    setShowAddStatblockForm(true);
  };

  // Instance Handlers
  const handleAddSummon = (newSummon: Summon) => {
    if (editingSummonId) {
      onUpdateSummons(summons.map(s => s.id === editingSummonId ? newSummon : s));
      setEditingSummonId(null);
    } else {
      onUpdateSummons([...summons, newSummon]);
    }
    setShowAddForm(false);
  };

  const handleUpdateSummon = (updatedSummon: Summon) => {
    onUpdateSummons(summons.map(s => s.id === updatedSummon.id ? updatedSummon : s));
  };

  const handleDeleteSummon = (id: string) => {
    setSummonToDelete(id);
  };

  const confirmDeleteSummon = () => {
    if (summonToDelete) {
      onUpdateSummons(summons.filter(s => s.id !== summonToDelete));
      setSummonToDelete(null);
    }
  };

  const handleEditSummon = (id: string) => {
    setEditingSummonId(id);
    setShowAddForm(true);
  };

  const handleSummon = (statblock: Summon) => {
    const newInstance: Summon = {
      ...statblock,
      id: Date.now().toString(),
      hp: {
        current: statblock.hp.max,
        max: statblock.hp.max,
        temp: 0
      },
      active: true
    };
    onUpdateSummons([...summons, newInstance]);
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: STATBLOCKS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black uppercase tracking-tight">Statblock Templates</h2>
          </div>
          {!showAddStatblockForm && (
            <Button 
              onClick={() => {
                setEditingStatblockId(null);
                setShowAddStatblockForm(true);
              }}
              className="flex items-center gap-2"
              variant="primary"
              size="sm"
            >
              <Plus className="w-4 h-4" /> Add Statblock
            </Button>
          )}
        </div>

        {showAddStatblockForm && (
          <div className="animate-in fade-in-50 duration-200">
            <AddSummonForm 
              onAdd={handleAddStatblock}
              onCancel={() => {
                setShowAddStatblockForm(false);
                setEditingStatblockId(null);
              }}
              initialSummon={summonStatblocks.find(s => s.id === editingStatblockId)}
              isStatblock={true}
            />
          </div>
        )}

        {summonStatblocks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {summonStatblocks.map(statblock => (
              editingStatblockId !== statblock.id && (
                <SummonCard 
                  key={statblock.id}
                  summon={statblock}
                  onUpdate={() => {}} // Statblock updates handled via edit form
                  onEdit={() => handleEditStatblock(statblock.id)}
                  onDelete={() => handleDeleteStatblock(statblock.id)}
                  rollDice={rollDice}
                  rollDamage={rollDamage}
                  character={character}
                  proficiencyBonus={proficiencyBonus}
                  isStatblock={true}
                  onSummon={() => handleSummon(statblock)}
                />
              )
            ))}
          </div>
        ) : (
          !showAddStatblockForm && (
            <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-border rounded-2xl bg-secondary/5 text-center">
              <h3 className="text-sm font-bold mb-1">No statblocks defined</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Define creature templates here first, then click "Summon" to track them.
              </p>
            </div>
          )
        )}
      </div>

      {/* SECTION 2: TRACKED SUMMONS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black uppercase tracking-tight">Active Summons</h2>
          </div>
          {!showAddForm && (
            <Button 
              onClick={() => {
                setEditingSummonId(null);
                setShowAddForm(true);
              }}
              className="flex items-center gap-2"
              variant="secondary"
              size="sm"
            >
              <Plus className="w-4 h-4" /> Add Custom Summon
            </Button>
          )}
        </div>

        {showAddForm && (
          <div className="animate-in fade-in-50 duration-200">
            <AddSummonForm 
              onAdd={handleAddSummon}
              onCancel={() => {
                setShowAddForm(false);
                setEditingSummonId(null);
              }}
              initialSummon={summons.find(s => s.id === editingSummonId)}
            />
          </div>
        )}

        {summons.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {summons.map(summon => (
              editingSummonId === summon.id ? (
                <div key={summon.id} className="animate-in fade-in zoom-in-95 duration-200">
                  <AddSummonForm 
                    onAdd={handleAddSummon}
                    onCancel={() => {
                      setShowAddForm(false);
                      setEditingSummonId(null);
                    }}
                    initialSummon={summon}
                  />
                </div>
              ) : (
                <SummonCard 
                  key={summon.id}
                  summon={summon}
                  onUpdate={handleUpdateSummon}
                  onEdit={() => handleEditSummon(summon.id)}
                  onDelete={() => handleDeleteSummon(summon.id)}
                  rollDice={rollDice}
                  rollDamage={rollDamage}
                  character={character}
                  proficiencyBonus={proficiencyBonus}
                  onAdjustHP={(amount, isDamage) => handleAdjustSummonHP(summon.id, amount, isDamage)}
                />
              )
            ))}
          </div>
        ) : (
          !showAddForm && (
            <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-border rounded-2xl bg-secondary/5 text-center">
              <h3 className="text-sm font-bold mb-1">No active summons</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Click "Summon" on a statblock template above to track an instance here.
              </p>
            </div>
          )
        )}
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={!!statblockToDelete}
        onClose={() => setStatblockToDelete(null)}
        onConfirm={confirmDeleteStatblock}
        title="Delete Statblock"
        message={`Are you sure you want to delete this statblock? This will not remove existing active summons of this type.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      <ConfirmationModal
        isOpen={!!summonToDelete}
        onClose={() => setSummonToDelete(null)}
        onConfirm={confirmDeleteSummon}
        title="Delete Summon"
        message={`Are you sure you want to delete this active summon? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default SummonsSection;
