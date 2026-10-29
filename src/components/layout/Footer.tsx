import React from 'react';
import { Logo } from '../common/Logo';
import { Icon } from '../common/Icon';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenAppearance: () => void;
  onOpenFeedback: () => void;
  onOpenAiAssistant?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenAppearance,
  onOpenFeedback,
  onOpenAiAssistant,
}) => {
  return (
    <footer className="w-full border-t border-hps-border bg-hps-surface text-hps-text transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <Logo size="md" showTagline={true} />
            <p className="text-xs text-hps-muted leading-relaxed">
              Fast, client-side utilities engineered with zero tracking, high-precision algorithms, and instant conversions. No file uploads to remote servers.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={onOpenFeedback}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hps-border bg-hps-bg hover:bg-hps-surface text-xs font-semibold text-hps-text transition-colors"
              >
                <Icon name="MessageSquare" size={14} className="text-hps-primary" />
                <span>Feedback & Suggestions</span>
              </button>
            </div>
          </div>

          {/* Everyday & Financial */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-hps-primary mb-3">
              Everyday & Finance
            </h3>
            <ul className="space-y-2 text-xs text-hps-muted">
              <li>
                <button onClick={() => onNavigate('/tools/calculator')} className="hover:text-hps-text transition-colors">
                  Smart Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/password-generator')} className="hover:text-hps-text transition-colors">
                  Password Generator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/word-counter')} className="hover:text-hps-text transition-colors">
                  Live Word Counter
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/unit-converter')} className="hover:text-hps-text transition-colors">
                  Unit Converter
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/loan-calculator')} className="hover:text-hps-text transition-colors">
                  Loan & Mortgage Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/dob-calculator')} className="hover:text-hps-text transition-colors">
                  Date of Birth Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Conversion & Media */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-hps-primary mb-3">
              Media & Documents
            </h3>
            <ul className="space-y-2 text-xs text-hps-muted">
              <li>
                <button onClick={() => onNavigate('/tools/convert-all')} className="hover:text-hps-text transition-colors">
                  Convert All Centre
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/passport-photo-maker')} className="hover:text-hps-text transition-colors">
                  Passport Photo Maker
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/image-resizer')} className="hover:text-hps-text transition-colors">
                  Image Resizer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/image-to-pdf')} className="hover:text-hps-text transition-colors">
                  Image to PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/pdf-to-image')} className="hover:text-hps-text transition-colors">
                  PDF to Image
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/jpg-to-png')} className="hover:text-hps-text transition-colors">
                  JPG to PNG / PNG to JPG
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Useful Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-hps-primary mb-3">
              Platform & Info
            </h3>
            <ul className="space-y-2 text-xs text-hps-muted">
              {onOpenAiAssistant && (
                <li>
                  <button onClick={onOpenAiAssistant} className="font-semibold text-hps-primary hover:underline flex items-center gap-1.5 transition-colors">
                    <Icon name="Sparkles" size={13} className="text-hps-accent" />
                    <span>HPS AI Assistant</span>
                  </button>
                </li>
              )}
              <li>
                <button onClick={onOpenAppearance} className="hover:text-hps-text transition-colors">
                  Customize Appearance
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-hps-text transition-colors">
                  About HPS Tools
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/privacy')} className="hover:text-hps-text transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li className="pt-2 text-[11px] text-hps-muted leading-tight border-t border-hps-border">
                Client-side processing: Calculations and conversions run in your browser.
              </li>
            </ul>
          </div>
        </div>

        {/* PROMINENT CREATOR CREDIT: "Made by Harshit" */}
        <div className="pt-6 pb-4 border-t border-hps-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-hps-accent/15 text-hps-accent font-bold">
              <Icon name="Sparkles" size={16} />
            </span>
            <div className="text-sm font-extrabold text-hps-text tracking-wide">
              Made by <span className="text-hps-accent underline decoration-hps-accent/50 underline-offset-4">Harshit</span>
              <span className="ml-2 text-xs font-mono font-bold text-hps-primary px-2 py-0.5 rounded-full border border-hps-primary/30 bg-hps-primary/10">
                harshit.hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-hps-muted">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Client-Side Processing
            </span>
            <span>•</span>
            <button onClick={() => onNavigate('/privacy')} className="hover:underline">
              Privacy Policy
            </button>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-3 border-t border-hps-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-hps-muted">
          <p>© {new Date().getFullYear()} HPS Tools • Simple Tools. One Place. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('/about')} className="hover:underline">
              About & Setup
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
