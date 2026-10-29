import React, { useState, useEffect, useCallback } from 'react';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell';
import { evaluateExpression } from '../../utils/calculator';
import { Icon } from '../../components/common/Icon';

interface CalculatorToolProps {
  onNavigate: (path: string) => void;
}

export const CalculatorTool: React.FC<CalculatorToolProps> = ({ onNavigate }) => {
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<{ expr: string; res: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAppend = useCallback((val: string) => {
    setError(null);
    setExpression((prev) => prev + val);
  }, []);

  const handleClear = () => {
    setExpression('');
    setError(null);
  };

  const handleDelete = () => {
    setError(null);
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleEvaluate = useCallback(() => {
    if (!expression.trim()) return;
    const { result, error: evalErr } = evaluateExpression(expression);
    if (evalErr) {
      setError(evalErr);
    } else {
      setError(null);
      setHistory((prev) => [{ expr: expression, res: result }, ...prev.slice(0, 7)]);
      setExpression(result.toString());
    }
  }, [expression]);

  const handleCopy = () => {
    if (expression) {
      navigator.clipboard.writeText(expression);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', '(', ')', '%'].includes(e.key)) {
        e.preventDefault();
        handleAppend(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEvaluate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAppend, handleEvaluate]);

  const buttons = [
    { label: 'C', onClick: handleClear, type: 'danger', ariaLabel: 'Clear all' },
    { label: '(', onClick: () => handleAppend('('), type: 'fn', ariaLabel: 'Open parenthesis' },
    { label: ')', onClick: () => handleAppend(')'), type: 'fn', ariaLabel: 'Close parenthesis' },
    { label: '÷', onClick: () => handleAppend('/'), type: 'op', ariaLabel: 'Divide' },

    { label: '7', onClick: () => handleAppend('7'), type: 'num', ariaLabel: 'Seven' },
    { label: '8', onClick: () => handleAppend('8'), type: 'num', ariaLabel: 'Eight' },
    { label: '9', onClick: () => handleAppend('9'), type: 'num', ariaLabel: 'Nine' },
    { label: '×', onClick: () => handleAppend('*'), type: 'op', ariaLabel: 'Multiply' },

    { label: '4', onClick: () => handleAppend('4'), type: 'num', ariaLabel: 'Four' },
    { label: '5', onClick: () => handleAppend('5'), type: 'num', ariaLabel: 'Five' },
    { label: '6', onClick: () => handleAppend('6'), type: 'num', ariaLabel: 'Six' },
    { label: '-', onClick: () => handleAppend('-'), type: 'op', ariaLabel: 'Minus' },

    { label: '1', onClick: () => handleAppend('1'), type: 'num', ariaLabel: 'One' },
    { label: '2', onClick: () => handleAppend('2'), type: 'num', ariaLabel: 'Two' },
    { label: '3', onClick: () => handleAppend('3'), type: 'num', ariaLabel: 'Three' },
    { label: '+', onClick: () => handleAppend('+'), type: 'op', ariaLabel: 'Plus' },

    { label: '0', onClick: () => handleAppend('0'), type: 'num', ariaLabel: 'Zero' },
    { label: '.', onClick: () => handleAppend('.'), type: 'num', ariaLabel: 'Decimal point' },
    { label: '%', onClick: () => handleAppend('%'), type: 'fn', ariaLabel: 'Percentage' },
    { label: '=', onClick: handleEvaluate, type: 'action', ariaLabel: 'Calculate equals' },
  ];

  return (
    <WorkspaceShell
      toolId="calculator"
      title="Smart Calculator"
      description="Standard and scientific calculations with parentheses, percentage, operator precedence, and keyboard integration."
      category="Everyday Tools"
      iconName="Calculator"
      onNavigate={onNavigate}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {/* Main Calculator */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
          {/* Display */}
          <div className="p-4 rounded-xl border border-hps-border bg-hps-bg text-right relative min-h-[100px] flex flex-col justify-end">
            <div className="flex items-center justify-between text-xs text-hps-muted mb-2">
              <span className="font-mono">Keyboard Supported</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  className="p-1 rounded hover:bg-hps-surface text-hps-muted hover:text-hps-text"
                  title="Backspace (Delete last character)"
                  aria-label="Delete last character"
                >
                  <Icon name="Delete" size={15} />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-hps-surface text-hps-muted hover:text-hps-text"
                  title="Copy current expression or result"
                  aria-label="Copy to clipboard"
                >
                  <Icon name={copied ? 'Check' : 'Copy'} size={15} />
                </button>
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-hps-text break-all">
              {expression || '0'}
            </div>

            {error && (
              <div className="text-xs font-semibold text-rose-500 mt-1 flex items-center justify-end gap-1">
                <Icon name="AlertCircle" size={12} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2.5">
            {buttons.map((btn, idx) => {
              let btnClass = 'border border-hps-border bg-hps-surface text-hps-text hover:bg-hps-bg';
              if (btn.type === 'action') {
                btnClass = 'bg-hps-primary text-white font-bold border-hps-primary hover:opacity-90';
              } else if (btn.type === 'op') {
                btnClass = 'bg-hps-primary/10 text-hps-primary font-bold border-hps-primary/20 hover:bg-hps-primary/20';
              } else if (btn.type === 'danger') {
                btnClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border-rose-500/20 hover:bg-rose-500/20';
              } else if (btn.type === 'fn') {
                btnClass = 'bg-hps-bg text-hps-text font-semibold border-hps-border hover:border-hps-primary/40';
              }

              return (
                <button
                  key={idx}
                  onClick={btn.onClick}
                  aria-label={btn.ariaLabel}
                  className={`h-14 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${btnClass}`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* History Tape & Tips */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-hps-border bg-hps-surface shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-hps-border">
              <h2 className="text-xs font-bold uppercase tracking-wider text-hps-primary flex items-center gap-1.5">
                <Icon name="History" size={14} />
                <span>Calculation History</span>
              </h2>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-[11px] text-hps-muted hover:text-rose-500 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-hps-muted py-6 text-center italic">
                Evaluated results will appear here for quick recall.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {history.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => setExpression(item.res.toString())}
                    className="p-2.5 rounded-lg border border-hps-border bg-hps-bg hover:border-hps-primary/50 text-right cursor-pointer transition-colors"
                    title="Click to load result"
                  >
                    <p className="text-[11px] text-hps-muted font-mono">{item.expr} =</p>
                    <p className="text-sm font-bold font-mono text-hps-text">{item.res}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-hps-border bg-hps-bg text-xs text-hps-muted space-y-1.5">
            <span className="font-bold text-hps-text block mb-1">Keyboard Shortcuts:</span>
            <p>• Numbers & operators: <kbd className="px-1 py-0.5 rounded border border-hps-border bg-hps-surface font-mono">0-9</kbd>, <kbd className="px-1 py-0.5 rounded border border-hps-border bg-hps-surface font-mono">+ - * / %</kbd></p>
            <p>• Calculate: <kbd className="px-1 py-0.5 rounded border border-hps-border bg-hps-surface font-mono">Enter</kbd> or <kbd className="px-1 py-0.5 rounded border border-hps-border bg-hps-surface font-mono">=</kbd></p>
            <p>• Delete / Clear: <kbd className="px-1 py-0.5 rounded border border-hps-border bg-hps-surface font-mono">Backspace</kbd> / <kbd className="px-1 py-0.5 rounded border border-hps-border bg-hps-surface font-mono">Esc</kbd></p>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
};
