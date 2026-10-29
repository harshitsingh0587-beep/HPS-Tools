import React, { useState } from 'react';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell';
import { calculateLoan } from '../../utils/loan';
import { Icon } from '../../components/common/Icon';

interface LoanCalculatorToolProps {
  onNavigate: (path: string) => void;
}

export const LoanCalculatorTool: React.FC<LoanCalculatorToolProps> = ({ onNavigate }) => {
  const [loanAmount, setLoanAmount] = useState<number>(250000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [durationYears, setDurationYears] = useState<number>(30);
  const [extraPayment, setExtraPayment] = useState<number>(100);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const durationMonths = durationYears * 12;

  const result = calculateLoan({
    loanAmount,
    annualInterestRate: interestRate,
    loanDurationMonths: durationMonths,
    extraMonthlyPayment: extraPayment,
  });

  const handleReset = () => {
    setLoanAmount(100000);
    setInterestRate(5.0);
    setDurationYears(15);
    setExtraPayment(0);
  };

  const principalRatio = result.totalRepayment > 0
    ? (result.totalPrincipal / result.totalRepayment) * 100
    : 100;
  const interestRatio = result.totalRepayment > 0
    ? (result.totalInterest / result.totalRepayment) * 100
    : 0;

  return (
    <WorkspaceShell
      toolId="loan-calculator"
      title="Loan & Mortgage Calculator"
      description="Estimate monthly repayments, total interest costs, loan payoff timelines, and amortization schedules with optional extra monthly payments."
      category="Financial Calculators"
      iconName="DollarSign"
      onNavigate={onNavigate}
    >
      <div className="space-y-8">
        {/* Input & Key Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-hps-border">
              <h2 className="text-sm font-bold text-hps-text">Loan Parameters</h2>
              <button
                onClick={handleReset}
                className="text-xs text-hps-muted hover:text-hps-text flex items-center gap-1"
              >
                <Icon name="RotateCcw" size={13} />
                <span>Reset</span>
              </button>
            </div>

            {/* Loan Amount */}
            <div className="space-y-1.5">
              <label htmlFor="loan-amount-input" className="text-xs font-bold text-hps-text flex justify-between">
                <span>Loan Amount ($)</span>
                <span className="font-mono text-hps-primary font-bold">
                  ${loanAmount.toLocaleString()}
                </span>
              </label>
              <input
                id="loan-amount-input"
                type="number"
                min={1000}
                max={10000000}
                step={5000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full p-3 rounded-xl border border-hps-border bg-hps-bg text-sm font-semibold font-mono text-hps-text focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30"
              />
            </div>

            {/* Interest Rate */}
            <div className="space-y-1.5">
              <label htmlFor="interest-rate-input" className="text-xs font-bold text-hps-text flex justify-between">
                <span>Annual Interest Rate (%)</span>
                <span className="font-mono text-hps-primary font-bold">{interestRate}%</span>
              </label>
              <input
                id="interest-rate-input"
                type="number"
                min={0}
                max={30}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full p-3 rounded-xl border border-hps-border bg-hps-bg text-sm font-semibold font-mono text-hps-text focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30"
              />
              <span className="text-[11px] text-hps-muted">Supports 0% for zero-interest promotions.</span>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label htmlFor="duration-years-input" className="text-xs font-bold text-hps-text flex justify-between">
                <span>Loan Term (Years)</span>
                <span className="font-mono text-hps-primary font-bold">{durationYears} Years ({durationMonths} Mos)</span>
              </label>
              <input
                id="duration-years-input"
                type="number"
                min={1}
                max={50}
                value={durationYears}
                onChange={(e) => setDurationYears(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-3 rounded-xl border border-hps-border bg-hps-bg text-sm font-semibold font-mono text-hps-text focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30"
              />
              <div className="flex gap-2 pt-1">
                {[5, 10, 15, 20, 30].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setDurationYears(yr)}
                    className={`flex-1 py-1 text-xs rounded-lg border transition-colors ${
                      durationYears === yr
                        ? 'border-hps-primary bg-hps-primary text-white font-bold'
                        : 'border-hps-border hover:bg-hps-bg text-hps-muted'
                    }`}
                  >
                    {yr}y
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Monthly Repayment */}
            <div className="space-y-1.5 pt-2 border-t border-hps-border">
              <label htmlFor="extra-payment-input" className="text-xs font-bold text-hps-text flex justify-between">
                <span>Optional Extra Monthly Payment ($)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">+${extraPayment}/mo</span>
              </label>
              <input
                id="extra-payment-input"
                type="number"
                min={0}
                step={50}
                value={extraPayment}
                onChange={(e) => setExtraPayment(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full p-3 rounded-xl border border-hps-border bg-hps-bg text-sm font-semibold font-mono text-hps-text focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30"
              />
            </div>
          </div>

          {/* Results Summary Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl border border-hps-border bg-gradient-to-br from-hps-surface to-hps-bg shadow-xs space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-hps-muted">Monthly Repayment</span>
                <div className="text-3xl font-black text-hps-primary font-mono">
                  ${result.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {extraPayment > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                    +${extraPayment.toLocaleString()} extra = ${(result.monthlyPayment + extraPayment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total/mo
                  </p>
                )}
              </div>

              <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-hps-muted">Total Interest Paid</span>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  ${result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-hps-muted pt-1">
                  Total Repaid: ${result.totalRepayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Extra Savings Callout */}
            {extraPayment > 0 && result.interestSavedWithExtra > 0 && (
              <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-500 text-white shrink-0">
                  <Icon name="TrendingDown" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Extra Repayment Impact
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed">
                    By paying an extra <strong>${extraPayment}/month</strong>, you will save approximately{' '}
                    <strong>${result.interestSavedWithExtra.toLocaleString()}</strong> in interest and pay off your loan{' '}
                    <strong>{result.monthsSavedWithExtra} months ({Math.round(result.monthsSavedWithExtra / 12 * 10) / 10} years) earlier</strong>!
                  </p>
                </div>
              </div>
            )}

            {/* Principal vs Interest Ratio Visual Bar */}
            <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-hps-primary">Principal: {principalRatio.toFixed(1)}%</span>
                <span className="text-amber-600 dark:text-amber-400">Interest: {interestRatio.toFixed(1)}%</span>
              </div>
              <div className="w-full h-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                <div
                  style={{ width: `${principalRatio}%` }}
                  className="h-full bg-hps-primary transition-all duration-500"
                  title={`Principal: ${principalRatio.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${interestRatio}%` }}
                  className="h-full bg-amber-500 transition-all duration-500"
                  title={`Interest: ${interestRatio.toFixed(1)}%`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-hps-muted font-mono">
                <span>Principal: ${result.totalPrincipal.toLocaleString()}</span>
                <span>Interest: ${result.totalInterest.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[11px] text-hps-muted italic text-center">
              * Calculations are estimations based on standard monthly compounding amortization formulas. Taxes, insurance, and lender fees are not included.
            </p>
          </div>
        </div>

        {/* Amortization Schedule Table */}
        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-hps-border">
            <div>
              <h2 className="text-sm font-bold text-hps-text">Monthly Amortization Schedule</h2>
              <p className="text-xs text-hps-muted">Detailed principal and interest breakdown per month</p>
            </div>
            <button
              onClick={() => setShowFullSchedule(!showFullSchedule)}
              className="px-3.5 py-1.5 rounded-xl border border-hps-border bg-hps-bg hover:bg-hps-surface text-xs font-semibold text-hps-text transition-colors flex items-center gap-1.5"
            >
              <Icon name={showFullSchedule ? 'ChevronUp' : 'ChevronDown'} size={15} />
              <span>{showFullSchedule ? 'Collapse Schedule' : `View All ${result.amortizationSchedule.length} Months`}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-hps-border text-hps-muted uppercase font-mono text-[10px]">
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Principal</th>
                  <th className="py-2.5 px-3">Interest</th>
                  <th className="py-2.5 px-3">Remaining Balance</th>
                  <th className="py-2.5 px-3">Cumulative Interest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hps-border font-mono">
                {(showFullSchedule ? result.amortizationSchedule : result.amortizationSchedule.slice(0, 12)).map((row) => (
                  <tr key={row.month} className="hover:bg-hps-bg/50">
                    <td className="py-2.5 px-3 font-bold text-hps-text">Month {row.month}</td>
                    <td className="py-2.5 px-3">${row.payment.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-hps-primary font-semibold">${row.principalPaid.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400">${row.interestPaid.toFixed(2)}</td>
                    <td className="py-2.5 px-3">${row.remainingBalance.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-hps-muted">${row.totalInterestToDate.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!showFullSchedule && result.amortizationSchedule.length > 12 && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowFullSchedule(true)}
                className="text-xs font-semibold text-hps-primary hover:underline"
              >
                + Show {result.amortizationSchedule.length - 12} more months in amortization schedule
              </button>
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
};
