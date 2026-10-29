import React, { useState } from 'react';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell';
import { UNIT_CATEGORIES, convertUnits, UnitCategory } from '../../utils/converter';
import { Icon } from '../../components/common/Icon';

interface UnitConverterToolProps {
  onNavigate: (path: string) => void;
}

export const UnitConverterTool: React.FC<UnitConverterToolProps> = ({ onNavigate }) => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [inputValue, setInputValue] = useState<string>('1');

  const currentCategoryUnits = UNIT_CATEGORIES[category].units;

  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const newUnits = UNIT_CATEGORIES[newCat].units;
    setFromUnit(newUnits[0].id);
    setToUnit(newUnits[1] ? newUnits[1].id : newUnits[0].id);
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const numVal = parseFloat(inputValue);
  const conversion = isNaN(numVal)
    ? { result: 0, error: 'Enter a valid number', formula: '' }
    : convertUnits(numVal, category, fromUnit, toUnit);

  return (
    <WorkspaceShell
      toolId="unit-converter"
      title="Universal Unit Converter"
      description="Quickly convert values between metric, imperial, and international units across length, area, weight, temperature, volume, and velocity."
      category="Everyday Tools"
      iconName="ArrowLeftRight"
      onNavigate={onNavigate}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl border border-hps-border bg-hps-surface shadow-xs">
          {(Object.keys(UNIT_CATEGORIES) as UnitCategory[]).map((catKey) => {
            const isSelected = category === catKey;
            return (
              <button
                key={catKey}
                onClick={() => handleCategoryChange(catKey)}
                className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-hps-primary text-white shadow-xs'
                    : 'text-hps-muted hover:text-hps-text hover:bg-hps-bg'
                }`}
              >
                {UNIT_CATEGORIES[catKey].label}
              </button>
            );
          })}
        </div>

        {/* Converter Card */}
        <div className="p-6 sm:p-8 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* From Box */}
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="from-value-input" className="text-xs font-bold uppercase tracking-wider text-hps-muted block">
                From
              </label>
              <input
                id="from-value-input"
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0"
                className="w-full p-3.5 rounded-xl border border-hps-border bg-hps-bg text-lg font-bold font-mono text-hps-text focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30"
              />
              <select
                aria-label="From unit"
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-surface text-xs font-semibold text-hps-text"
              >
                {currentCategoryUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center md:col-span-1 py-2">
              <button
                onClick={handleSwap}
                className="p-3 rounded-2xl border border-hps-border bg-hps-bg hover:bg-hps-surface text-hps-primary hover:border-hps-primary transition-all active:scale-95 shadow-xs"
                title="Swap units"
                aria-label="Swap from and to units"
              >
                <Icon name="ArrowLeftRight" size={20} />
              </button>
            </div>

            {/* To Box */}
            <div className="md:col-span-2 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-hps-muted block">
                To (Result)
              </span>
              <div className="w-full p-3.5 rounded-xl border border-hps-border bg-hps-bg text-lg font-bold font-mono text-hps-primary min-h-[54px] flex items-center overflow-x-auto">
                {conversion.error ? (
                  <span className="text-xs text-rose-500 font-normal">{conversion.error}</span>
                ) : (
                  conversion.result
                )}
              </div>
              <select
                aria-label="To unit"
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-surface text-xs font-semibold text-hps-text"
              >
                {currentCategoryUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Formula pill */}
          {conversion.formula && !conversion.error && (
            <div className="p-3 rounded-xl border border-hps-border bg-hps-bg text-xs text-hps-muted flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Info" size={14} className="text-hps-accent shrink-0" />
                <span>Conversion formula: <strong className="text-hps-text">{conversion.formula}</strong></span>
              </div>
              <span className="font-mono text-[11px] text-hps-primary font-bold">
                1 {fromUnit} = {convertUnits(1, category, fromUnit, toUnit).result} {toUnit}
              </span>
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
};
