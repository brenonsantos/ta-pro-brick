import React, { useState } from 'react';
import { formatBRL, parseBRLInput } from '../utils/currency';
import { Send, Plus } from 'lucide-react';

interface GuessInputProps {
  onConfirmGuess: (value: number) => void;
  disabled: boolean;
  minAmount?: number;
}

export const GuessInput: React.FC<GuessInputProps> = ({
  onConfirmGuess,
  disabled,
  minAmount = 1000,
}) => {
  const [numericValue, setNumericValue] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseBRLInput(e.target.value);
    setNumericValue(parsed);
    if (errorMsg) setErrorMsg(null);
  };

  const handleAddAmount = (delta: number) => {
    if (disabled) return;
    setNumericValue((prev) => Math.max(0, prev + delta));
    if (errorMsg) setErrorMsg(null);
  };

  const handleClear = () => {
    setNumericValue(0);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    if (numericValue < minAmount) {
      setErrorMsg(`O palpite mínimo é ${formatBRL(minAmount)}.`);
      return;
    }

    onConfirmGuess(numericValue);
    setNumericValue(0);
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-900/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="price-input" className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400">
            Quanto o vendedor pediu?
          </label>
          {numericValue > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs sm:text-sm font-semibold text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Currency Input Field */}
        <div className="relative">
          <input
            id="price-input"
            type="text"
            inputMode="numeric"
            value={numericValue > 0 ? formatBRL(numericValue) : ''}
            onChange={handleInputChange}
            placeholder="R$ 0"
            disabled={disabled}
            className={`w-full rounded-xl sm:rounded-2xl border bg-zinc-950 px-4 py-3.5 sm:py-4 text-center text-2xl sm:text-3xl font-black tracking-tight text-white transition-all placeholder:text-zinc-700 focus:outline-none focus:ring-2 ${
              errorMsg
                ? 'border-rose-500/80 focus:ring-rose-500/30'
                : 'border-zinc-800 focus:border-amber-500 focus:ring-amber-500/20'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        </div>

        {errorMsg && (
          <p className="text-center text-xs sm:text-sm font-semibold text-rose-400 animate-in fade-in-50">
            {errorMsg}
          </p>
        )}

        {/* Quick increment pills */}
        {!disabled && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleAddAmount(1000)}
              className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs sm:text-sm font-bold text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" /> 1 mil
            </button>
            <button
              type="button"
              onClick={() => handleAddAmount(5000)}
              className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs sm:text-sm font-bold text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" /> 5 mil
            </button>
            <button
              type="button"
              onClick={() => handleAddAmount(10000)}
              className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs sm:text-sm font-bold text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" /> 10 mil
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={disabled || numericValue <= 0}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl sm:rounded-2xl bg-amber-500 py-3.5 sm:py-4 text-sm sm:text-base font-black uppercase tracking-wide text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none cursor-pointer"
        >
          <Send className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
          Confirmar Palpite
        </button>
      </form>
    </div>
  );
};
