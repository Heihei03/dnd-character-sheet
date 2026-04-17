import React, { useEffect, useRef } from 'react';
import { RollEntry, CritRule } from '../types/character';
import { X, Trash2, History, Dices } from 'lucide-react';
import { getDisplayFormula } from '../utils/character-utils';
import Button from './ui/button';
import { Card, CardContent } from './ui/card';

interface RollHistoryProps {
  history: RollEntry[];
  onClear: () => void;
  onClose: () => void;
  onRollDamage: (formula: string, label: string, type?: string, isCritical?: boolean, critExtraDamage?: string, ruleOverride?: CritRule) => void;
}

const RollHistory: React.FC<RollHistoryProps> = ({ history, onClear, onClose, onRollDamage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-background/95 backdrop-blur-md border-l border-border shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out animate-in slide-in-from-right">
      <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/20">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <History className="w-5 h-5 text-primary" /> Roll History
        </h2>
        <div className="flex gap-2">
          {history.length > 0 && (
            <button 
              onClick={onClear}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Clear History"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-0 p-4 flex flex-col gap-4 scroll-smooth custom-scrollbar"
      >
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
            <History className="w-12 h-12 opacity-20" />
            <p>No rolls yet</p>
          </div>
        ) : (
          history.map((roll) => (
            <Card key={roll.id} className={`shrink-0 border-l-4 ${
              roll.isCritical ? 'border-l-yellow-400' : 
              roll.isFumble ? 'border-l-red-500' : 
              roll.type === 'damage' ? 'border-l-orange-500' : 'border-l-primary'
            } bg-secondary/10 hover:bg-secondary/20 transition-colors border-y-0 border-r-0 rounded-none shadow-none`}>
              <CardContent className="p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {roll.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(roll.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-sm font-mono text-foreground/80">
                      {roll.formula}{roll.bonusModifier !== 0 && <span className="text-[10px] text-primary ml-1 font-bold opacity-80">(+bonuses)</span>}
                    </span>
                    {(() => {
                      const diceSum = roll.rolls.length > 1 ? `(${roll.rolls.join(' + ')})` : roll.rolls[0];
                      const modStr = roll.modifier !== 0 ? ` ${roll.modifier > 0 ? '+' : '-'} ${Math.abs(roll.modifier)}` : '';
                      const isDoubleTotal = roll.isCritical && roll.critRule === 'double-total';
                      return (
                        <span className="text-xs text-gray-500">
                          ({isDoubleTotal ? `${diceSum} × 2` : roll.rolls.join(' + ')}{modStr}{roll.bonusBreakdown})
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-2xl font-bold ${
                      roll.isCritical ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' : 
                      roll.isFumble ? 'text-red-500' : 'text-foreground'
                    }`}>
                      {roll.total}
                    </span>
                    {roll.type === 'damage' && roll.damageType && (
                      <span className="text-xs font-bold uppercase text-orange-400">
                        {roll.damageType}
                      </span>
                    )}
                  </div>
                </div>

                {roll.damageFormula && (
                  <div className="pt-2 border-t border-border flex justify-end">
                    <button
                      onClick={() => onRollDamage(roll.damageFormula!, roll.label.replace(" Attack", ""), roll.damageType, roll.isCritical, roll.critExtraDamage, roll.critRule)}
                      className="text-xs font-bold uppercase flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors"
                    >
                      <Dices className="w-3.5 h-3.5" /> Roll Damage ({getDisplayFormula(roll.damageFormula!, roll.isCritical || false, roll.critRule || 'double-dice', roll.critExtraDamage)})
                    </button>
                  </div>
                )}
                
                {roll.isCritical && (
                  <div className="text-xs font-bold text-yellow-500 uppercase tracking-tighter">
                    Critical Hit!
                  </div>
                )}
                {roll.isFumble && (
                  <div className="text-xs font-bold text-red-500 uppercase tracking-tighter">
                    Critical Failure!
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default RollHistory;
