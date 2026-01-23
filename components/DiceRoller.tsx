// components/DiceRoller.tsx
"use client";

import Button from "./ui/button";

interface DiceRollerProps {
  rollResult: string | null;
  rollDice: (sides: number) => void;
}

const DiceRoller = ({ rollResult, rollDice }: DiceRollerProps) => (
  <div className="fixed left-0 top-1/5 p-4 w-48 bg-gray-800 text-white shadow-xl rounded-r-lg space-y-4">
    <h2 className="text-xl font-bold">Dice Roller</h2>
    <div className="flex flex-col gap-2">
      <Button onClick={() => rollDice(4)}>Roll d4</Button>
      <Button onClick={() => rollDice(6)}>Roll d6</Button>
      <Button onClick={() => rollDice(8)}>Roll d8</Button>
      <Button onClick={() => rollDice(10)}>Roll d10</Button>
      <Button onClick={() => rollDice(12)}>Roll d12</Button>
      <Button onClick={() => rollDice(20)}>Roll d20</Button>
    </div>
    {rollResult && (
      <p className="mt-4 text-center text-lg">{rollResult}</p>
    )}
  </div>
);


export default DiceRoller;
