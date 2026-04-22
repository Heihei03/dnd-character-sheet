import React, { useState } from "react";
import { Currency } from "../types/character";
import { Card, CardContent } from "./ui/card";
import { X, ArrowLeftRight } from "lucide-react";
import SettingsButton from "./ui/SettingsButton";
import Select from "./ui/Select";
import ModalScrollLock from "./ui/ModalScrollLock";
import NumericInput from "./ui/NumericInput";

const CURRENCY_OPTIONS = ["cp", "sp", "ep", "gp", "pp"].map(k => ({
    label: k.toUpperCase(),
    value: k
}));

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
        setCurrency({ ...currency, [field]: Math.round(value) });
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
        const resultAmountWhole = Math.floor(totalCopper / conversionRates[convertTo]);

        if (resultAmountWhole <= 0) return;

        // Calculate how much of the source currency we actually used to get those whole units
        const usedCopper = resultAmountWhole * conversionRates[convertTo];
        const usedAmountFromSource = usedCopper / conversionRates[convertFrom];

        const newCurrency = { ...currency };
        newCurrency[convertFrom] -= usedAmountFromSource;
        newCurrency[convertTo] += resultAmountWhole;

        setCurrency(newCurrency);
        setConvertAmount(0);
    };

    return (
        <Card className="relative overflow-hidden group">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-5">
                    <div className="w-10"></div> {/* Spacer for symmetry */}
                    <h2 className="text-xl font-black uppercase tracking-widest text-primary">Currency</h2>
                    <SettingsButton
                        onClick={() => setIsModalOpen(true)}
                        className="hover:bg-secondary transition-colors"
                        title="Currency Converter"
                    />
                </div>
                <div className="grid grid-cols-5 gap-3">
                    {["cp", "sp", "ep", "gp", "pp"].map((key) => (
                        <div key={key} className="flex flex-col items-center">
                            <label className="text-sm font-black uppercase text-muted-foreground mb-1.5 tracking-tight">{key}</label>
                             <NumericInput
                                value={currency[key as keyof Currency]}
                                onChange={(val) => handleCurrencyChange(key as keyof Currency, val)}
                                min={0}
                                className="w-full"
                                inputClassName="text-center text-base font-bold px-1 py-1.5 pr-6"
                                showArrows="hover"
                            />
                        </div>
                    ))}
                </div>
            </CardContent>

            {/* Conversion Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                        <ModalScrollLock isOpen={isModalOpen} />
                        <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-border relative animate-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
                                <h3 className="font-black text-sm uppercase tracking-[0.2em] text-foreground">Currency Tools</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground rounded-full transition-all group"
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>

                            <div className="p-5 space-y-6">
                                {/* Current Balances */}
                                <div className="bg-secondary/20 p-4 rounded-xl border border-border/50 shadow-inner">
                                    <label className="block text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 text-center">Your Vault</label>
                                    <div className="grid grid-cols-5 gap-1">
                                        {["cp", "sp", "ep", "gp", "pp"].map(k => (
                                            <div key={k} className="text-center group/coin">
                                                <div className="text-xs font-bold text-muted-foreground uppercase mb-1 group-hover/coin:text-primary transition-colors">{k}</div>
                                                 <NumericInput
                                                    value={currency[k as keyof Currency]}
                                                    onChange={(val) => handleCurrencyChange(k as keyof Currency, val)}
                                                    min={0}
                                                    className="w-full border-none bg-transparent"
                                                    inputClassName="text-center text-base font-black p-1"
                                                    showArrows="none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Auto Consolidation */}
                                <section className="space-y-3">
                                    <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest">Management</label>
                                    <button
                                        onClick={consolidateCurrencies}
                                        className="w-full py-5 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center group overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        <span className="relative z-10">Consolidate into Gold</span>
                                        <span className="relative z-10 text-xs font-bold opacity-60 mt-1 uppercase tracking-tighter">cp/sp/ep → gp • pp intact</span>
                                    </button>
                                </section>

                                <div className="border-t border-border pt-5">
                                    <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Manual Exchange</label>
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <label className="block text-xs text-muted-foreground uppercase font-black tracking-tighter mb-2 ml-1">Exchange</label>
                                                 <NumericInput
                                                    value={convertAmount || ""}
                                                    onChange={(val) => setConvertAmount(val)}
                                                    variant="horizontal"
                                                    min={0}
                                                    className="w-full"
                                                    inputClassName="text-center text-base font-bold p-3"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs text-muted-foreground uppercase font-black tracking-tighter mb-2 ml-1">From</label>
                                                <Select
                                                    value={convertFrom}
                                                    onValueChange={(val) => setConvertFrom(val as keyof Currency)}
                                                    options={CURRENCY_OPTIONS}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center relative py-1">
                                            <div className="absolute inset-x-0 top-1/2 h-px bg-border/50" />
                                            <div className="bg-secondary p-2 rounded-full text-primary border border-border relative z-10 animate-pulse">
                                                <ArrowLeftRight className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <label className="block text-xs text-muted-foreground uppercase font-black tracking-tighter mb-2 ml-1">Into</label>
                                            <Select
                                                value={convertTo}
                                                onValueChange={(val) => setConvertTo(val as keyof Currency)}
                                                options={CURRENCY_OPTIONS}
                                            />
                                        </div>

                                        <button
                                            onClick={manualConvert}
                                            disabled={convertAmount <= 0 || currency[convertFrom] < convertAmount}
                                            className="w-full py-4 border-2 border-primary text-primary rounded-xl font-black text-sm uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
                                        >
                                            Execute Exchange
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
