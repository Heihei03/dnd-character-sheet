export const calculateUpcastedValue = (baseValue: string, higherLevelValue: string, currentLevel: number, baseLevel: number) => {
    if (currentLevel <= baseLevel || !higherLevelValue) return baseValue;

    const diff = currentLevel - baseLevel;

    // Simple dice notation parser: (num)d(sides) + (mod)
    const diceRegex = /(\d+)?d(\d+)(\s*[\+\-]\s*\d+)?/i;
    const baseMatch = baseValue.match(diceRegex);
    const higherMatch = higherLevelValue.match(diceRegex);

    if (baseMatch && higherMatch) {
        const baseNum = parseInt(baseMatch[1] || "1");
        const baseSides = baseMatch[2];
        const baseMod = baseMatch[3] || "";

        const higherNum = parseInt(higherMatch[1] || "1");
        const higherSides = higherMatch[2];

        // Only combine if dice sides match
        if (baseSides === higherSides) {
            const totalNum = baseNum + (higherNum * diff);
            return `${totalNum}d${baseSides}${baseMod}`;
        }
    }

    // If not dice or sides don't match, just show the addition textually
    return `${baseValue} (+${diff}x ${higherLevelValue})`;
};

export const calculateScaledCantripValue = (baseValue: string, currentLevel: number) => {
    if (!baseValue) return "";

    // 5e Cantrip scaling: 2 dice at 5th, 3 at 11th, 4 at 17th
    let multiplier = 1;
    if (currentLevel >= 17) multiplier = 4;
    else if (currentLevel >= 11) multiplier = 3;
    else if (currentLevel >= 5) multiplier = 2;

    if (multiplier === 1) return baseValue;

    const diceRegex = /(\d+)?d(\d+)(\s*[\+\-]\s*\d+)?/i;
    const match = baseValue.match(diceRegex);

    if (match) {
        const numDice = parseInt(match[1] || "1");
        const sides = match[2];
        const mod = match[3] || "";
        return `${numDice * multiplier}d${sides}${mod}`;
    }

    return `${baseValue} (x${multiplier})`;
};
