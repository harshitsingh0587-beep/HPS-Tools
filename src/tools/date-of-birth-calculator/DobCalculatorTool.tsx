import React, { useState } from 'react';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell';
import { calculateDob } from '../../utils/dob';
import { Icon } from '../../components/common/Icon';

interface DobCalculatorToolProps {
  onNavigate: (path: string) => void;
}

export const DobCalculatorTool: React.FC<DobCalculatorToolProps> = ({ onNavigate }) => {
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

        {/* Milestone Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-hps-border bg-hps-surface shadow-xs text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-hps-muted">Exact Age</span>
            <div className="text-2xl sm:text-3xl font-black text-hps-primary">
              {result.years} <span className="text-sm font-medium text-hps-text">Years</span>
            </div>
            <p className="text-xs text-hps-muted">
              {result.months} months and {result.days} days
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-hps-border bg-hps-surface shadow-xs text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-hps-muted">Next Birthday</span>
            <div className="text-2xl sm:text-3xl font-black text-hps-accent">
              {result.daysUntilNextBirthday}{' '}
              <span className="text-sm font-medium text-hps-text">Days</span>
            </div>
            <p className="text-xs text-hps-muted">
              {result.isBirthdayToday ? '🎉 Happy Birthday!' : `Upcoming on ${result.nextBirthdayDate}`}
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-hps-border bg-hps-surface shadow-xs text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-hps-muted">Day of Birth</span>
            <div className="text-2xl sm:text-3xl font-black text-hps-text">
              {result.dayOfWeek}
            </div>
            <p className="text-xs text-hps-muted">
              Born on a {result.dayOfWeek} • {result.isLeapYearBirth ? 'Leap Year' : 'Regular Year'}
            </p>
          </div>
        </div>

        {/* Lifetime Units Lived Breakdown */}
        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-hps-text flex items-center gap-2">
            <Icon name="Activity" size={16} className="text-hps-primary" />
            <span>Lifetime Milestones & Units Lived</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-hps-border bg-hps-bg">
              <span className="text-[10px] uppercase font-bold text-hps-muted block mb-1">Total Days</span>
              <span className="text-xl font-bold font-mono text-hps-text">
                {result.totalDays.toLocaleString()}
              </span>
            </div>
            <div className="p-4 rounded-xl border border-hps-border bg-hps-bg">
              <span className="text-[10px] uppercase font-bold text-hps-muted block mb-1">Total Weeks</span>
              <span className="text-xl font-bold font-mono text-hps-text">
                {result.totalWeeks.toLocaleString()}
              </span>
            </div>
            <div className="p-4 rounded-xl border border-hps-border bg-hps-bg">
              <span className="text-[10px] uppercase font-bold text-hps-muted block mb-1">Total Months</span>
              <span className="text-xl font-bold font-mono text-hps-text">
                {result.totalMonths.toLocaleString()}
              </span>
            </div>
            <div className="p-4 rounded-xl border border-hps-border bg-hps-bg">
              <span className="text-[10px] uppercase font-bold text-hps-muted block mb-1">Total Hours</span>
              <span className="text-xl font-bold font-mono text-hps-text">
                {result.totalHours.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
};
