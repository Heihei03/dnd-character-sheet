import React, { useState } from "react";
import { Currency } from "../types/character";
import { Card, CardContent } from "./ui/card";
import { X, ArrowLeftRight } from "lucide-react";
import SettingsButton from "./ui/SettingsButton";

interface CurrencySectionProps {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
}

const CurrencySection: React.FC<CurrencySectionProps> = ({
    currency,
    setCurrency,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [convertAmount, setConvertAmount] = useState(0);
    const [convertFrom, setConvertFrom] = useState<keyof Currency>("gp");
    const [convertTo, setConvertTo] = useState<keyof Currency>("sp");

    const conversionRates: Record<keyof Currency, number> = {
        cp: 1,
        sp: 10,
        ep: 50,
        gp: 100,
        pp: 1000
    };

    const handleCurrencyChange = (field: keyof Currency, value: number) => {
        setCurrency({ ...currency, [field]: value });
    };

    const consolidateCurrencies = () => {
        // Only consolidate lower coins into gold; leave platinum alone
        let copperValueFromLower =
            currency.cp +
            currency.sp * 10 +
            currency.ep * 50;

        const newCurrency: Currency = {
            ...currency,
            gp: currency.gp + Math.floor(copperValueFromLower / 100),
            ep: 0,
            sp: Math.floor((copperValueFromLower % 100) / 10),
            cp: copperValueFromLower % 10
        };

        setCurrency(newCurrency);
        setIsModalOpen(false);
    };

    const manualConvert = () => {
        if (convertAmount <= 0) return;
        if (currency[convertFrom] < convertAmount) return;

        const totalCopper = convertAmount * conversionRates[convertFrom];
        const resultAmount = totalCopper / conversionRates[convertTo];

        if (!Number.isInteger(resultAmount) && resultAmount < 1) {
            // Can't convert less than 1 unit if it results in a fraction
            return;
        }

        const newCurrency = { ...currency };
        newCurrency[convertFrom] -= convertAmount;
        newCurrency[convertTo] += resultAmount;

        setCurrency(newCurrency);
        setConvertAmount(0);
    };

    return (
        <Card className="relative">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="w-8"></div> {/* Spacer */}
                    <h2 className="text-xl font-bold text-center">Currency</h2>
                    <SettingsButton
                        onClick={() => setIsModalOpen(true)}
                        className="hover:bg-gray-100"
                        title="Currency Converter"
                    />
                </div>
                <div className="grid grid-cols-5 gap-2 text-center">
                    {["cp", "sp", "ep", "gp", "pp"].map((key) => (
                        <div key={key} className="flex flex-col items-center">
                            <label className="text-[16px] font-bold uppercase text-gray-500 mb-1">{key}</label>
                            <input
                                type="number"
                                value={currency[key as keyof Currency]}
                                onChange={(e) => handleCurrencyChange(key as keyof Currency, Number(e.target.value))}
                                className="w-full p-1.5 border border-gray-200 rounded text-center text-sm font-medium focus:border-blue-300 outline-none"
                                min="0"
                            />
                        </div>
                    ))}
                </div>
            </CardContent>

            {/* Conversion Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden border border-gray-200 relative">
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800">Currency Tools</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-all shadow-inner group"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>

                            <div className="p-4 space-y-6">
                                {/* Current Balances */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Current Total Balance</label>
                                    <div className="grid grid-cols-5 gap-1">
                                        {["cp", "sp", "ep", "gp", "pp"].map(k => (
                                            <div key={k} className="text-center">
                                                <div className="text-[11px] font-bold text-gray-500 uppercase">{k}</div>
                                                <div className="text-xs font-black text-gray-800">{currency[k as keyof Currency]}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Auto Consolidation */}
                                <section className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Wealth Management</label>
                                    <button
                                        onClick={consolidateCurrencies}
                                        className="w-full py-3 bg-blue-600 text-white rounded-md font-bold text-sm shadow-md hover:bg-blue-700 transition-colors flex flex-col items-center group"
                                    >
                                        <span>Consolidate into Gold</span>
                                        <span className="text-[11px] font-normal opacity-70 group-hover:opacity-100 transition-opacity">Converts cp/sp/ep to gp • Leaves pp intact</span>
                                    </button>
                                </section>

                                <div className="border-t pt-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Manual Exchange</label>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <label className="block text-[11px] text-gray-400 uppercase font-bold mb-1">Exchange</label>
                                                <input
                                                    type="number"
                                                    value={convertAmount || ""}
                                                    onChange={(e) => setConvertAmount(Number(e.target.value))}
                                                    className="w-full p-2 border rounded text-center text-sm"
                                                    placeholder="Amount"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[11px] text-gray-400 uppercase font-bold mb-1">From</label>
                                                <select
                                                    value={convertFrom}
                                                    onChange={(e) => setConvertFrom(e.target.value as keyof Currency)}
                                                    className="w-full p-2 border rounded text-sm bg-white"
                                                >
                                                    {["cp", "sp", "ep", "gp", "pp"].map(k => (
                                                        <option key={k} value={k}>{k.toUpperCase()}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center">
                                            <div className="bg-gray-100 p-1.5 rounded-full text-gray-400">
                                                <ArrowLeftRight className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] text-gray-400 uppercase font-bold mb-1">Into</label>
                                            <select
                                                value={convertTo}
                                                onChange={(e) => setConvertTo(e.target.value as keyof Currency)}
                                                className="w-full p-2 border rounded text-sm bg-white"
                                            >
                                                {["cp", "sp", "ep", "gp", "pp"].map(k => (
                                                    <option key={k} value={k}>{k.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            onClick={manualConvert}
                                            disabled={convertAmount <= 0 || currency[convertFrom] < convertAmount}
                                            className="w-full py-2 border-2 border-blue-600 text-blue-600 rounded-md font-bold text-sm hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:border-gray-200 disabled:text-gray-400"
                                        >
                                            Exchange
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </Card >
    );
};

export default CurrencySection;
