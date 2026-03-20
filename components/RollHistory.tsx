import React from 'react';
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
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-md border-l border-gray-800 shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out animate-in slide-in-from-right">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
          <History className="w-5 h-5 text-blue-400" /> Roll History
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
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
            <History className="w-12 h-12 opacity-20" />
            <p>No rolls yet</p>
          </div>
        ) : (
          history.map((roll) => (
            <Card key={roll.id} className={`border-l-4 ${
              roll.isCritical ? 'border-l-yellow-400' : 
              roll.isFumble ? 'border-l-red-500' : 
              roll.type === 'damage' ? 'border-l-orange-500' : 'border-l-blue-500'
            } bg-gray-800/50 hover:bg-gray-800 transition-colors`}>
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
                    <span className="text-sm font-mono text-gray-300">
                      {roll.formula}
                    </span>
                    {(() => {
                      const diceSum = roll.rolls.length > 1 ? `(${roll.rolls.join(' + ')})` : roll.rolls[0];
                      const modStr = roll.modifier !== 0 ? ` ${roll.modifier > 0 ? '+' : '-'} ${Math.abs(roll.modifier)}` : '';
                      const isDoubleTotal = roll.isCritical && roll.critRule === 'double-total';
                      return (
                        <span className="text-xs text-gray-500">
                          ({isDoubleTotal ? `${diceSum} × 2` : roll.rolls.join(' + ')}{modStr})
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-2xl font-bold ${
                      roll.isCritical ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' : 
                      roll.isFumble ? 'text-red-500' : 'text-white'
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
                  <div className="pt-2 border-t border-gray-700/50 flex justify-end">
                    <button
                      onClick={() => onRollDamage(roll.damageFormula!, roll.label.replace(" Attack", ""), roll.damageType, roll.isCritical, roll.critExtraDamage, roll.critRule)}
                      className="text-xs font-bold uppercase flex items-center gap-1.5 px-2 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded transition-colors"
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
