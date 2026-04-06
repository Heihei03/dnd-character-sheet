import React, { useState, useEffect } from "react";
import { Edit2, Trash2, Zap, ChevronDown } from "lucide-react";
import { Spell, AbilityScores, CharacterClass } from "../../types/character";
import { calculateUpcastedValue, calculateScaledCantripValue } from "../../utils/dice-utils";
import ConfirmationModal from "../ui/ConfirmationModal";
import FeatureNavigationBadge from "../features/FeatureNavigationBadge";

interface SpellCardProps {
    spell: Spell;
    level: number;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    totalLevel: number;
    onEdit?: () => void;
    onDelete?: () => void;
    handleUpdateSpell: (id: string, field: keyof Spell, value: any) => void;
    onNavigateToFeature?: (featureId: string) => void;
}

const SpellCard: React.FC<SpellCardProps> = ({
    spell,
    level,
    abilityScores,
    proficiencyBonus,
    totalLevel,
    onEdit,
    onDelete,
    handleUpdateSpell,
    onNavigateToFeature
}) => {
    const [castLevel, setCastLevel] = useState(spell.level);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Reset cast level if spell base level changes
    useEffect(() => {
        setCastLevel(spell.level);
    }, [spell.level]);

    const upcastedDamage = spell.damage
        ? (spell.level === 0 && spell.scalesWithCharacterLevel
            ? calculateScaledCantripValue(spell.damage, totalLevel)
            : calculateUpcastedValue(spell.damage, spell.higherLevelDamage || "", castLevel, spell.level))
        : "";

    const upcastedHealing = spell.healing
        ? (spell.level === 0 && spell.scalesWithCharacterLevel
            ? calculateScaledCantripValue(spell.healing, totalLevel)
            : calculateUpcastedValue(spell.healing, spell.higherLevelHealing || "", castLevel, spell.level))
        : "";

    return (
        <div className="p-4 hover:bg-secondary/20 transition-colors">
            <div
                className="flex justify-between items-start cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            {level > 0 && (
                                <div className="flex items-center gap-2 mr-4 group/prepared">
                                    <input
                                        type="checkbox"
                                        checked={spell.prepared}
                                        onChange={(e) => handleUpdateSpell(spell.id, "prepared", e.target.checked)}
                                        onClick={(e) => e.stopPropagation()}
                                        title={spell.prepared ? "Unprepare spell" : "Prepare spell for combat"}
                                        className="w-4 h-4 cursor-pointer accent-primary"
                                    />
                                    {spell.prepared && (
                                        <span className="flex items-center gap-1 text-xs font-black uppercase tracking-tighter text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                                            Prepared
                                        </span>
                                    )}
                                </div>
                            )}
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{spell.name}</h3>
                            {spell.classSource && (
                                <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full border border-border font-bold uppercase tracking-tight">
                                    {spell.classSource}
                                </span>
                            )}
                            {spell.fromFeature && (
                                <FeatureNavigationBadge
                                    featureId={spell.fromFeatureId}
                                    onNavigateToFeature={onNavigateToFeature}
                                    variant="badge"
                                />
                            )}
                            {spell.isRitual && <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 font-bold uppercase tracking-tight">Ritual</span>}
                            {spell.requiresConcentration && <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 font-bold uppercase tracking-tight">Concentration</span>}
                            {spell.hasAttack && <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800 font-bold uppercase tracking-tight">Attack</span>}
                            {spell.hasSave && <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800 font-bold uppercase tracking-tight">Save</span>}
                            {spell.hasHeal && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800 font-bold uppercase tracking-tight">Heal</span>}
                            <span className="text-sm text-muted-foreground italic ml-1">{spell.school}</span>

                            {/* Upcasting Selector */}
                            {spell.level > 0 && (
                                <div
                                    className="ml-auto flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-lg border border-primary/20"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Zap className="w-3.5 h-3.5 text-primary" />
                                    <label className="text-xs font-bold uppercase text-primary opacity-80">Cast At:</label>
                                    <select
                                        value={castLevel}
                                        onChange={(e) => setCastLevel(parseInt(e.target.value))}
                                        className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
                                    >
                                        {Array.from({ length: 10 - spell.level }, (_, i) => spell.level + i).map(l => (
                                            <option key={l} value={l} className="bg-background">Level {l}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-foreground/80">
                            <div className="flex flex-col"><span className="text-xs uppercase font-bold text-muted-foreground leading-tight">Casting Time</span>{spell.castingTime}</div>
                            <div className="flex flex-col"><span className="text-xs uppercase font-bold text-muted-foreground leading-tight">Range</span>{spell.range}</div>
                            <div className="flex flex-col"><span className="text-xs uppercase font-bold text-muted-foreground leading-tight">Duration</span>{spell.duration}</div>
                            <div className="flex flex-col col-span-1 lg:col-span-1">
                                <span className="text-xs uppercase font-bold text-muted-foreground leading-tight">Components</span>
                                <span>
                                    {Array.isArray(spell.components as any)
                                        ? (spell.components as any).join(", ")
                                        : [
                                            (spell.components as any)?.v ? 'V' : null,
                                            (spell.components as any)?.s ? 'S' : null,
                                            (spell.components as any)?.m ? 'M' : null
                                        ].filter(Boolean).join(", ")
                                    } {(!Array.isArray(spell.components as any) && (spell.components as any)?.m || Array.isArray(spell.components as any) && (spell.components as any).includes("M")) && spell.material ? `(${spell.material})` : ""}
                                </span>
                            </div>
                            {spell.hasAoe && (
                                <div className="flex flex-col"><span className="text-xs uppercase font-bold text-primary opacity-60 leading-tight">AoE</span>{spell.aoeSize} {spell.aoeShape}</div>
                            )}
                            {spell.spellcastingAbility && (
                                <>
                                    {(() => {
                                        const abilityScore = abilityScores[spell.spellcastingAbility!] || 10;
                                        const abilityModifier = Math.floor((abilityScore - 10) / 2);
                                        const attackBonus = abilityModifier + proficiencyBonus;
                                        const saveDC = 8 + abilityModifier + proficiencyBonus;
                                        return (
                                            <>
                                                {spell.hasAttack && <div className="flex flex-col"><span className="text-xs uppercase font-bold text-red-400 leading-tight">Attack</span>+{attackBonus}</div>}
                                                {spell.hasSave && <div className="flex flex-col"><span className="text-xs uppercase font-bold text-orange-400 leading-tight">Save DC</span>{saveDC} {spell.saveType ? `(${spell.saveType.slice(0, 3).toUpperCase()})` : ''}</div>}
                                            </>
                                        )
                                    })()}
                                </>
                            )}
                            {(spell.hasAttack || spell.hasSave || spell.damageOnly) && spell.damage && (
                                <div className="flex flex-col col-span-2">
                                    <span className="text-xs uppercase font-bold text-red-500 leading-tight">
                                        Damage {spell.level === 0 && spell.scalesWithCharacterLevel ? `(Scaled to Lvl ${totalLevel})` : (castLevel > spell.level ? `(Upcasted to Lvl ${castLevel})` : "")}
                                    </span>
                                    <span className={`font-mono font-bold ${(spell.level === 0 && spell.scalesWithCharacterLevel && totalLevel >= 5) || castLevel > spell.level ? "text-primary" : ""}`}>
                                        {upcastedDamage} {spell.damageType}
                                    </span>
                                </div>
                            )}
                            {spell.hasHeal && spell.healing && (
                                <div className="flex flex-col col-span-2">
                                    <span className="text-xs uppercase font-bold text-green-500 leading-tight">
                                        Healing {spell.level === 0 && spell.scalesWithCharacterLevel ? `(Scaled to Lvl ${totalLevel})` : (castLevel > spell.level ? `(Upcasted to Lvl ${castLevel})` : "")}
                                    </span>
                                    <span className={`font-mono font-bold ${(spell.level === 0 && spell.scalesWithCharacterLevel && totalLevel >= 5) || castLevel > spell.level ? "text-primary" : ""}`}>
                                        {upcastedHealing}
                                    </span>
                                </div>
                            )}
                        </div>

                        {isExpanded && (
                            <>
                                <p className="text-sm text-foreground/90 leading-relaxed font-serif whitespace-pre-wrap mt-2">{spell.description}</p>

                                {spell.atHigherLevels && (
                                    <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10 italic text-sm text-muted-foreground">
                                        <strong className="text-primary text-xs uppercase not-italic">At Higher Levels: </strong>
                                        {spell.atHigherLevels}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0 items-center">
                    {onEdit && (
                        <button
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                    )}
                    {!spell.fromFeature && onDelete && (
                        <>
                            <button
                                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <ConfirmationModal
                                isOpen={showDeleteConfirm}
                                onClose={() => setShowDeleteConfirm(false)}
                                onConfirm={() => { setShowDeleteConfirm(false); onDelete(); }}
                                title="Delete Spell"
                                message={`Are you sure you want to delete "${spell.name}"? This action cannot be undone.`}
                                confirmText="Delete"
                            />
                        </>
                    )}
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </div>
            </div>
        </div>
    );
};

export default SpellCard;
