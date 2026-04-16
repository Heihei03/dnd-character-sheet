import React, { useState } from "react";
import { 
  Plus, Trash2, CheckCircle2, Circle, Edit2, X,
  Swords, Flame, ShieldCheck, GraduationCap, Dices, Zap, Ban, ShieldAlert, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ActiveBonus, BonusTarget } from "../types/character";
import Button from "./ui/button";
import { Card } from "./ui/card";

interface ActiveBonusesListProps {
  bonuses: ActiveBonus[];
  onUpdateBonuses: (bonuses: ActiveBonus[]) => void;
  target: BonusTarget;
  title?: string;
  compact?: boolean;
}

const TARGET_LABELS: Record<BonusTarget, string> = {
  attack: "Attacks",
  damage: "Damage",
  save: "Saves",
  skill: "Skills",
  ability: "Ability Checks",
  initiative: "Initiative",
  ac: "Armor Class",
};

const TARGET_ICONS: Record<BonusTarget, React.ElementType> = {
  attack: Swords,
  damage: Flame,
  save: ShieldCheck,
  skill: GraduationCap,
  ability: Activity,
  initiative: Zap,
  ac: ShieldAlert,
};

const ActiveBonusesList: React.FC<ActiveBonusesListProps> = ({
  bonuses,
  onUpdateBonuses,
  target,
  title,
  compact = false,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newName, setNewName] = useState("");
  const [newBonus, setNewBonus] = useState("");

  const filteredBonuses = bonuses.filter((b) => b.targets.includes(target));
  const activeBonusesCount = filteredBonuses.filter(b => b.active).length;
  const TargetIcon = TARGET_ICONS[target] || Dices;

  const handleToggle = (id: string, active: boolean) => {
    const nextBonuses = bonuses.map((b) =>
      b.id === id ? { ...b, active: !active } : b
    );
    onUpdateBonuses(nextBonuses);
  };

  const handleAdd = () => {
    if (!newName || !newBonus) return;

    const newEntry: ActiveBonus = {
      id: Math.random().toString(36).substring(2, 9),
      name: newName,
      bonus: newBonus,
      targets: [target],
      active: true,
    };

    onUpdateBonuses([...bonuses, newEntry]);
    setNewName("");
    setNewBonus("");
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    onUpdateBonuses(bonuses.filter((b) => b.id !== id));
  };

  const startEditing = (bonus: ActiveBonus) => {
    setEditingId(bonus.id);
    setNewName(bonus.name);
    setNewBonus(bonus.bonus);
  };

  const handleSave = () => {
    if (!editingId) return;
    const nextBonuses = bonuses.map((b) =>
      b.id === editingId ? { ...b, name: newName, bonus: newBonus } : b
    );
    onUpdateBonuses(nextBonuses);
    setEditingId(null);
    setNewName("");
    setNewBonus("");
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className={cn(
          "font-black uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2 min-w-0 flex-1",
          compact ? "text-xs" : "text-sm"
        )}>
          <TargetIcon className={cn("flex-shrink-0", compact ? "w-3.5 h-3.5" : "w-4.5 h-4.5")} />
          <span className="truncate">
            {title || `${TARGET_LABELS[target]}${compact ? "" : " Bonuses"}`}
          </span>
          {activeBonusesCount > 0 && (
            <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-[8px] font-black flex-shrink-0">
              {activeBonusesCount}
            </span>
          )}
        </h3>
        {!isAdding && !editingId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className={cn(
              "font-black uppercase tracking-wider gap-1 hover:bg-primary/5 hover:text-primary transition-all",
              compact ? "h-6 text-[9px] px-2" : "h-7 text-[10px]"
            )}
          >
            <Plus className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
            Add
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {filteredBonuses.map((bonus) => {
          const isEditing = editingId === bonus.id;

          if (isEditing) {
            return (
              <Card key={bonus.id} className={cn(
                "border-primary/30 shadow-md bg-primary/5 animate-in fade-in zoom-in-95 duration-200",
                compact ? "p-2" : "p-3"
              )}>
                <div className={cn("flex flex-col", compact ? "gap-2" : "gap-3")}>
                  <div className={cn("flex", compact ? "flex-col gap-2" : "gap-2")}>
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-black uppercase text-primary/70 ml-1">Label</label>
                      <input
                        className="w-full bg-background border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="e.g. Bless"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className={cn("space-y-1", compact ? "w-full" : "w-24")}>
                      <label className="text-[9px] font-black uppercase text-primary/70 ml-1">Value</label>
                      <input
                        className="w-full bg-background border rounded-lg px-2 py-1 text-sm font-black font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="1d4"
                        value={newBonus}
                        onChange={(e) => setNewBonus(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={cn("flex justify-end gap-2 border-t border-primary/10", compact ? "pt-1.5" : "pt-2")}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditingId(null); setNewName(""); setNewBonus(""); }}
                      className={cn("font-bold", compact ? "h-7 text-[10px]" : "h-8 text-xs")}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className={cn("font-black uppercase", compact ? "h-7 text-[10px] px-3" : "h-8 text-xs px-6")}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </Card>
            );
          }

          return (
            <div
              key={bonus.id}
              className={cn(
                "rounded-xl border transition-all duration-200",
                compact ? "p-1.5 flex flex-col gap-1" : "flex items-center justify-between p-2",
                bonus.active 
                  ? "bg-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/5" 
                  : "bg-muted/10 border-transparent opacity-50 hover:opacity-100 grayscale-[0.5]"
              )}
            >
              <div className={cn("flex items-center overflow-hidden", compact ? "gap-2 w-full" : "gap-3")}>
                <button
                  onClick={() => handleToggle(bonus.id, bonus.active)}
                  className={cn(
                    "transition-all rounded-lg flex-shrink-0",
                    compact ? "p-1" : "p-1.5",
                    bonus.active ? "text-primary bg-primary/10 shadow-inner scale-110" : "text-muted-foreground bg-secondary/30"
                  )}
                >
                  {bonus.active ? (
                    <CheckCircle2 className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
                  ) : (
                    <Circle className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
                  )}
                </button>
                <div 
                  className="flex flex-col min-w-0 flex-1 cursor-pointer group"
                  onClick={() => handleToggle(bonus.id, bonus.active)}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={cn(
                      "font-black truncate uppercase tracking-tight",
                      compact ? "text-[11px]" : "text-xs",
                      bonus.active ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {bonus.name}
                    </span>
                    {!compact && (
                       <span className="text-[10px] font-mono font-black text-primary px-1.5 py-0.5 rounded bg-primary/5 border border-primary/10">
                        {bonus.bonus >= 0 && !bonus.bonus.includes('d') ? `+${bonus.bonus}` : bonus.bonus}
                      </span>
                    )}
                  </div>
                  {!compact && !bonus.active && (
                    <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest px-1.5 py-0.5 rounded bg-secondary/50 w-fit">Inactive</span>
                  )}
                </div>

                {!compact && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(bonus)}
                      className="w-8 h-8 hover:bg-primary/10 hover:text-primary transition-all rounded-lg"
                      title="Edit Bonus"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost-danger"
                      size="icon"
                      onClick={() => handleDelete(bonus.id)}
                      className="w-8 h-8 transition-all rounded-lg"
                      title="Delete Bonus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {compact && (
                <div className="flex items-center justify-between pl-7 w-full leading-none">
                  <span className="text-[10px] font-mono font-black text-primary px-1 rounded bg-primary/5 border border-primary/10 flex-shrink-0">
                    {bonus.bonus >= 0 && !bonus.bonus.includes('d') ? `+${bonus.bonus}` : bonus.bonus}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(bonus)}
                      className="w-6 h-6 hover:bg-primary/10 hover:text-primary transition-all rounded-lg"
                      title="Edit Bonus"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </Button>
                    <Button
                      variant="ghost-danger"
                      size="icon"
                      onClick={() => handleDelete(bonus.id)}
                      className="w-6 h-6 transition-all rounded-lg"
                      title="Delete Bonus"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {isAdding && (
          <Card className={cn(
            "border-dashed border-primary/50 bg-primary/5 animate-in slide-in-from-top-2 duration-300 shadow-lg",
            compact ? "p-2" : "p-4"
          )}>
            <div className={cn("flex flex-col", compact ? "gap-2" : "gap-4")}>
              <div className="flex items-center gap-2 mb-1">
                <div className={cn("rounded-lg bg-primary/20 flex items-center justify-center", compact ? "w-6 h-6" : "w-8 h-8")}>
                  <TargetIcon className={compact ? "w-3 h-3 text-primary" : "w-4 h-4 text-primary"} />
                </div>
                <div>
                  <h4 className={cn("font-black uppercase tracking-tight", compact ? "text-[10px]" : "text-xs")}>Add {TARGET_LABELS[target]} Bonus</h4>
                  {!compact && <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Global Modifier</p>}
                </div>
              </div>

              <div className={cn("flex", compact ? "flex-col gap-2" : "gap-3")}>
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground/80 ml-1">Effect Name</label>
                  <input
                    className={cn(
                      "w-full bg-background border border-border/60 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm",
                      compact ? "px-2 py-1 text-xs font-bold" : "px-3 py-2 text-sm"
                    )}
                    placeholder="Bless..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className={cn("space-y-1.5", compact ? "w-full" : "w-28")}>
                  <label className="text-[10px] font-black uppercase text-muted-foreground/80 ml-1">Value</label>
                  <input
                    className={cn(
                      "w-full bg-background border border-border/60 rounded-lg  font-black font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm",
                      compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
                    )}
                    placeholder="1d4"
                    value={newBonus}
                    onChange={(e) => setNewBonus(e.target.value)}
                  />
                </div>
              </div>
              <div className={cn("flex justify-end gap-2 border-t border-primary/10", compact ? "pt-2" : "pt-3")}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAdding(false)}
                  className={cn("font-bold uppercase tracking-wider", compact ? "h-7 text-[10px]" : "h-9 text-xs")}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={!newName || !newBonus}
                  className={cn("font-black uppercase tracking-[0.1em] shadow-md shadow-primary/20", compact ? "h-7 text-[10px] px-3" : "h-9 text-xs px-6")}
                >
                  Add Bonus
                </Button>
              </div>
            </div>
          </Card>
        )}

        {filteredBonuses.length === 0 && !isAdding && (
          <div className={cn(
            "text-center border border-dashed border-border rounded-xl bg-muted/5 group hover:bg-muted/10 transition-colors",
            compact ? "py-4 px-2" : "py-8 px-4"
          )}>
            <div className={cn(
              "rounded-full bg-muted/20 flex items-center justify-center mx-auto text-muted-foreground/50 group-hover:bg-primary/5 group-hover:text-primary/50 transition-all",
              compact ? "w-7 h-7 mb-2" : "w-10 h-10 mb-3"
            )}>
              <TargetIcon className={compact ? "w-3.5 h-3.5" : "w-5 h-5"} />
            </div>
            <p className={cn(
              "text-muted-foreground font-medium italic mb-4 mx-auto max-w-[90%]",
              compact ? "text-[9px] leading-tight" : "text-[11px]"
            )}>
              {compact ? `No ${TARGET_LABELS[target]} bonuses` : `No active bonuses for ${TARGET_LABELS[target]}`}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              className={cn(
                "uppercase font-black tracking-wider border-dashed mx-auto",
                compact ? "h-7 text-[8px] px-2" : "h-8 text-[10px] px-4"
              )}
            >
              <Plus className={compact ? "w-2 h-2 mr-1" : "w-3 h-3 mr-1"} />
              Add
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveBonusesList;
