
import React from "react";
import { Currency } from "../types/character";
import { Card, CardContent } from "./ui/card";

interface CurrencySectionProps {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
}

const CurrencySection: React.FC<CurrencySectionProps> = ({
    currency,
    setCurrency,
}) => {
    const handleCurrencyChange = (field: keyof Currency, value: number) => {
        setCurrency({ ...currency, [field]: value });
    };

    return (
        <Card>
            <CardContent className="p-4">
                <h2 className="text-xl font-bold text-center mb-4">Currency</h2>
                <div className="grid grid-cols-5 gap-2 text-center">
                    {Object.keys(currency).map((key) => (
                        <div key={key} className="flex flex-col items-center">
                            <label className="text-sm font-semibold uppercase text-gray-600">{key}</label>
                            <input
                                type="number"
                                value={currency[key as keyof Currency]}
                                onChange={(e) => handleCurrencyChange(key as keyof Currency, Number(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded text-center"
                                min="0"
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default CurrencySection;
