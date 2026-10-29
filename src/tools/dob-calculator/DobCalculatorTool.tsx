import React, { useState } from 'react';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell';
import { calculateDob } from '../../utils/dob';
import { Icon } from '../../components/common/Icon';

interface DobCalculatorToolProps {
  onNavigate: (path: string) => void;
}

export const DobCalculatorTool: React.FC<DobCalculatorToolProps> = ({ onNavigate }) => {
  // Default to a realistic demo birth date e.g. 1998-06-15
  const [birthDate, setBirthDate] = useState('1998-06-15');

  const result = calculateDob(birthDate);

  return (
    <WorkspaceShell
      toolId="dob-calculator"
      title="Date of Birth & Age Calculator"
      description="Determine exact age in years, months, and days, total weeks and hours lived, next birthday countdown, and birth day of the week."
      category="Date and Time Tools"
      iconName="Calendar"
      onNavigate={onNavigate}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Date Selector Box */}
        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs">
          <div className="max-w-md mx-auto space-y-3">
            <label htmlFor="dob-input" className="text-xs font-bold uppercase tracking-wider text-hps-text block text-center">
              Select Your Date of Birth
            </label>
            <input
              id="dob-input"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-hps-border bg-hps-bg text-center text-lg font-bold font-mono text-hps-text focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30"
            />
            <p className="text-[11px] text-hps-muted text-center">
              Processed 100% locally in your browser. We never transmit or save your birth date.
            </p>
          </div>
        </div>

        {result.error ? (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2">
            <Icon name="AlertCircle" size={16} />
            <span>{result.error}</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Primary Age Hero */}
            <div className="p-8 rounded-2xl border border-hps-border bg-gradient-to-br from-hps-surface to-hps-bg text-center shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-hps-accent">
                Your Exact Chronological Age
              </span>
              <div className="text-3xl sm:text-5xl font-black text-hps-primary font-mono tracking-tight flex items-baseline justify-center gap-2 flex-wrap">
                <span>{result.years} <span className="text-base sm:text-xl font-bold text-hps-text">Years</span></span>
                <span>{result.months} <span className="text-base sm:text-xl font-bold text-hps-text">Months</span></span>
                <span>{result.days} <span className="text-base sm:text-xl font-bold text-hps-text">Days</span></span>
              </div>
              {result.isBirthdayToday && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold animate-bounce">
                  <Icon name="Sparkles" size={14} />
                  <span>Happy Birthday! Today is your special day!</span>
                </div>
              )}
            </div>

            {/* Next Birthday & Milestone Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Next Birthday */}
              <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-hps-accent">
                  <Icon name="Gift" size={20} />
                  <h2 className="text-sm font-bold text-hps-text">Next Birthday Countdown</h2>
                </div>
                <div className="p-4 rounded-xl bg-hps-bg border border-hps-border space-y-1">
                  <div className="text-2xl font-black font-mono text-hps-primary">
                    {result.daysUntilNextBirthday === 0 ? 'Today!' : `${result.daysUntilNextBirthday} Days Left`}
                  </div>
                  <p className="text-xs text-hps-muted">
                    Upcoming on <strong className="text-hps-text">{result.nextBirthdayDate}</strong> ({result.nextBirthdayDayOfWeek})
                  </p>
                </div>
              </div>

              {/* Day of birth details */}
              <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-hps-primary">
                  <Icon name="Clock" size={20} />
                  <h2 className="text-sm font-bold text-hps-text">Birth Day & Calendar Details</h2>
                </div>
                <div className="p-4 rounded-xl bg-hps-bg border border-hps-border space-y-1">
                  <div className="text-2xl font-black font-mono text-hps-text">
                    {result.dayOfWeek}
                  </div>
                  <p className="text-xs text-hps-muted">
                    Born on a {result.dayOfWeek} • {result.isLeapYearBirth ? 'Leap Year' : 'Regular Calendar Year'}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Life Units Lived */}
            <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-hps-primary">
                Total Life Units Lived to Date
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl border border-hps-border bg-hps-bg">
                  <span className="text-[11px] text-hps-muted font-medium">Total Months</span>
                  <div className="text-xl font-bold font-mono text-hps-text mt-0.5">
                    {result.totalMonths.toLocaleString()}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-hps-border bg-hps-bg">
                  <span className="text-[11px] text-hps-muted font-medium">Total Weeks</span>
                  <div className="text-xl font-bold font-mono text-hps-text mt-0.5">
                    {result.totalWeeks.toLocaleString()}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-hps-border bg-hps-bg">
                  <span className="text-[11px] text-hps-muted font-medium">Total Days</span>
                  <div className="text-xl font-bold font-mono text-hps-primary mt-0.5">
                    {result.totalDays.toLocaleString()}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-hps-border bg-hps-bg">
                  <span className="text-[11px] text-hps-muted font-medium">Total Hours</span>
                  <div className="text-xl font-bold font-mono text-hps-text mt-0.5">
                    {result.totalHours.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
};
