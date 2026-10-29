import React, { useState } from 'react';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell';
import { analyzeText } from '../../utils/text';
import { Icon } from '../../components/common/Icon';

interface WordCounterToolProps {
  onNavigate: (path: string) => void;
}

export const WordCounterTool: React.FC<WordCounterToolProps> = ({ onNavigate }) => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const stats = analyzeText(text);

  const handleClear = () => {
    setText('');
  };

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <WorkspaceShell
      toolId="word-counter"
      title="Live Word & Text Counter"
      description="Real-time statistical breakdown of your writing including characters, words, sentences, reading duration, and speaking pace."
      category="Everyday Tools"
      iconName="FileText"
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl border border-hps-border bg-hps-surface shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-hps-muted">Words</span>
            <div className="text-2xl font-black text-hps-primary mt-1 font-mono">{stats.words}</div>
          </div>
          <div className="p-4 rounded-xl border border-hps-border bg-hps-surface shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-hps-muted">Chars (w/ spaces)</span>
            <div className="text-2xl font-black text-hps-text mt-1 font-mono">{stats.charactersWithSpaces}</div>
          </div>
          <div className="p-4 rounded-xl border border-hps-border bg-hps-surface shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-hps-muted">Chars (no spaces)</span>
            <div className="text-2xl font-black text-hps-text mt-1 font-mono">{stats.charactersWithoutSpaces}</div>
          </div>
          <div className="p-4 rounded-xl border border-hps-border bg-hps-surface shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-hps-muted">Sentences</span>
            <div className="text-2xl font-black text-hps-text mt-1 font-mono">{stats.sentences}</div>
          </div>
          <div className="p-4 rounded-xl border border-hps-border bg-hps-surface shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-hps-muted">Paragraphs</span>
            <div className="text-2xl font-black text-hps-text mt-1 font-mono">{stats.paragraphs}</div>
          </div>
          <div className="p-4 rounded-xl border border-hps-border bg-hps-surface shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-hps-accent">Read Time</span>
            <div className="text-xl font-black text-hps-accent mt-1 font-mono">
              ~{stats.readingTimeMinutes} {stats.readingTimeMinutes === 1 ? 'min' : 'mins'}
            </div>
          </div>
        </div>

        {/* Text Input Area */}
        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-hps-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-hps-text">Editor & Analyzer</span>
              <span className="text-[11px] text-hps-muted">• Speaking pace: ~{stats.speakingTimeMinutes} min</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!text}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-hps-border bg-hps-bg hover:bg-hps-surface text-hps-text disabled:opacity-40 transition-colors"
                title="Copy all text"
              >
                <Icon name={copied ? 'Check' : 'Copy'} size={14} />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleClear}
                disabled={!text}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-40 transition-colors"
                title="Clear editor"
              >
                <Icon name="Trash2" size={14} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here to view instant statistics..."
            rows={12}
            className="w-full p-4 rounded-xl border border-hps-border bg-hps-bg text-hps-text font-sans text-sm focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30 leading-relaxed resize-y"
          />
        </div>
      </div>
    </WorkspaceShell>
  );
};
