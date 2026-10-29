import React, { useState, useMemo } from 'react';
import { Icon } from '../common/Icon';

export interface GuideStep {
  stepNumber: number;
  title: string;
  instruction: string;
  tip?: string;
}

export interface KnowledgeGuide {
  id: string;
  title: string;
  toolPath: string;
  category: 'Conversions' | 'Photos & Media' | 'Calculators' | 'Security';
  summary: string;
  estimatedTime: string;
  icon: string;
  steps: GuideStep[];
  proTips: string[];
  commonMistakes: string[];
  aiPromptRecommendation: string;
}

const KNOWLEDGE_GUIDES: KnowledgeGuide[] = [
  {
    id: 'pdf-to-image',
    title: 'Convert PDF to High-Resolution Images',
    toolPath: '/tools/pdf-to-image',
    category: 'Conversions',
    summary: 'Extract individual PDF pages into crisp, print-ready PNG or JPG image files right in your browser.',
    estimatedTime: '30 seconds',
    icon: 'FileText',
    steps: [
      {
        stepNumber: 1,
        title: 'Select or Drag Your PDF Document',
        instruction: 'Click "Browse Files" or drag any standard PDF document into the upload dropzone.',
        tip: 'Works with scanned PDFs, contracts, invoices, and multi-page reports.',
      },
      {
        stepNumber: 2,
        title: 'Choose Output Format & Image Quality',
        instruction: 'Select PNG (for crisp text and sharp lines) or JPG (for smaller file sizes). Set resolution quality slider if needed.',
      },
      {
        stepNumber: 3,
        title: 'Convert Pages In-Browser',
        instruction: 'Click "Convert PDF". The client-side rasterizer renders each page into 300 DPI high-definition canvas elements.',
        tip: 'Zero remote server transmission — 100% private and offline capable.',
      },
      {
        stepNumber: 4,
        title: 'Preview and Download',
        instruction: 'Inspect visual thumbnails of each rendered page. Click "Download" on single pages or "Download All (ZIP)" to get the complete set.',
      },
    ],
    proTips: [
      'For official forms and receipts, PNG format prevents text pixelation and compression artifacts.',
      'You can also attach your PDF directly into the AI Chat tab to convert it without leaving the assistant.',
    ],
    commonMistakes: [
      'Do not close the browser tab during processing if converting documents over 50 pages.',
      'Ensure the PDF file is not password-protected before uploading.',
    ],
    aiPromptRecommendation: 'Convert this PDF to image for me',
  },
  {
    id: 'passport-photo-maker',
    title: 'Create Official Biometric Passport & Visa Photos',
    toolPath: '/tools/passport-photo-maker',
    category: 'Photos & Media',
    summary: 'Crop, align, and print compliant 2×2 inch or 35×45mm passport photos meeting government standards.',
    estimatedTime: '1 minute',
    icon: 'Camera',
    steps: [
      {
        stepNumber: 1,
        title: 'Upload a Clear Front-Facing Portrait',
        instruction: 'Select a photo taken at eye-level with both ears visible, neutral expression, and even lighting.',
        tip: 'Stand 4-5 feet away against a plain wall for minimal facial shadows.',
      },
      {
        stepNumber: 2,
        title: 'Align Facial Proportions with Biometric Guide',
        instruction: 'Use the interactive circular guideline and chin-to-crown ruler. Position your eyes on the horizontal guide and crown of head at the top arc.',
      },
      {
        stepNumber: 3,
        title: 'Choose Country Standard Dimension',
        instruction: 'Select "US / Global 2×2 inch (600×600 px at 300 DPI)" or "Schengen / UK 35×45 mm".',
      },
      {
        stepNumber: 4,
        title: 'Pick Single Photo or Multi-Photo Printable Grid',
        instruction: 'Choose whether you want a single digital crop or a 4×6 inch photo paper layout containing 2, 4, or 6 identical pictures.',
        tip: 'The 4×6" grid prints at standard photo kiosks (Walgreens, CVS, Tesco) for pennies.',
      },
      {
        stepNumber: 5,
        title: 'Export at High Resolution',
        instruction: 'Click "Download Compliant Photo" to save the uncompressed image ready for visa or passport applications.',
      },
    ],
    proTips: [
      'Remove eyeglasses to avoid lens reflection glare, which causes rejection by passport authorities.',
      'Maintain a neutral mouth closed expression; avoid extreme head tilts.',
    ],
    commonMistakes: [
      'Avoid selfies where the arm angle distorts nose and eye proportions.',
      'Do not apply heavy beauty filters or background blurs before processing.',
    ],
    aiPromptRecommendation: 'Help me make a passport photo',
  },
  {
    id: 'jpg-to-png',
    title: 'Transcode JPG to Lossless PNG / PNG to JPG',
    toolPath: '/tools/jpg-to-png',
    category: 'Conversions',
    summary: 'Switch image formats with proper alpha channel transparency and optimized background handling.',
    estimatedTime: '15 seconds',
    icon: 'Image',
    steps: [
      {
        stepNumber: 1,
        title: 'Upload Source Images',
        instruction: 'Drag one or more JPG, JPEG, or PNG images into the converter.',
      },
      {
        stepNumber: 2,
        title: 'Select Destination Format',
        instruction: 'Choose PNG for lossless quality, or JPG if converting transparent images with a solid white background fill.',
      },
      {
        stepNumber: 3,
        title: 'Instant Download',
        instruction: 'Click convert to generate clean blobs and download directly with original dimensions preserved.',
      },
    ],
    proTips: [
      'When converting PNG to JPG, HPS automatically replaces transparent pixels with solid white to prevent black background artifacts.',
    ],
    commonMistakes: [
      'Do not convert already compressed JPGs to PNG expecting higher original resolution; PNG prevents further loss.',
    ],
    aiPromptRecommendation: 'Transcode this JPG image to PNG format',
  },
  {
    id: 'image-resizer',
    title: 'Resize Images by Pixels or Percentage',
    toolPath: '/tools/image-resizer',
    category: 'Photos & Media',
    summary: 'Scale image dimensions up or down with exact pixel measurements while locking aspect ratio.',
    estimatedTime: '20 seconds',
    icon: 'Maximize2',
    steps: [
      {
        stepNumber: 1,
        title: 'Upload Image',
        instruction: 'Select your photo (PNG, JPG, or WebP). The original dimensions (width × height) will load immediately.',
      },
      {
        stepNumber: 2,
        title: 'Specify Dimensions or Preset Scale',
        instruction: 'Enter target width or height in pixels. Keep the "Lock Aspect Ratio" toggle checked to avoid distortion.',
        tip: 'Or select quick presets: 25%, 50%, 75%, 1080p, or 720p.',
      },
      {
        stepNumber: 3,
        title: 'Download Optimized Image',
        instruction: 'Preview the scaled output and download the resized file.',
      },
    ],
    proTips: [
      'For social media avatars and banners, locking aspect ratio ensures your image will not look squished or stretched.',
    ],
    commonMistakes: [
      'Scaling up small images beyond 200% will cause softness; use vectors (SVG) for limitless enlargement.',
    ],
    aiPromptRecommendation: 'How do I resize this picture to 800x600 pixels?',
  },
  {
    id: 'loan-calculator',
    title: 'Calculate Loan EMI, Interest & Amortization',
    toolPath: '/tools/loan-calculator',
    category: 'Calculators',
    summary: 'Accurately forecast monthly payments, total interest costs, and year-by-year payoff milestones.',
    estimatedTime: '45 seconds',
    icon: 'DollarSign',
    steps: [
      {
        stepNumber: 1,
        title: 'Enter Principal Loan Amount',
        instruction: 'Input the total borrowed sum (e.g. $250,000 for a mortgage or $25,000 for an auto loan).',
      },
      {
        stepNumber: 2,
        title: 'Enter Annual Interest Rate',
        instruction: 'Type the agreed APR percentage (e.g. 6.5%).',
      },
      {
        stepNumber: 3,
        title: 'Set Loan Term Length',
        instruction: 'Choose duration in years (e.g. 15, 20, or 30 years) or months.',
      },
      {
        stepNumber: 4,
        title: 'Analyze Breakdown & Amortization',
        instruction: 'Review the calculated monthly EMI, total interest, and examine the schedule showing principal vs interest progression.',
      },
    ],
    proTips: [
      'An extra $100 paid toward monthly principal can shave years and tens of thousands of dollars off a 30-year loan.',
    ],
    commonMistakes: [
      'Ensure you enter annual interest rate rather than monthly rate; the formula automatically handles monthly compounding.',
    ],
    aiPromptRecommendation: 'Calculate loan EMI for $200,000 at 5.5% for 30 years',
  },
  {
    id: 'dob-calculator',
    title: 'Date of Birth Age & Milestone Analysis',
    toolPath: '/tools/dob-calculator',
    category: 'Calculators',
    summary: 'Calculate exact chronological age in years, months, weeks, days, and see next birthday countdown.',
    estimatedTime: '20 seconds',
    icon: 'Calendar',
    steps: [
      {
        stepNumber: 1,
        title: 'Pick or Enter Birth Date',
        instruction: 'Select the exact date of birth from the calendar picker.',
      },
      {
        stepNumber: 2,
        title: 'View Instant Comprehensive Breakdown',
        instruction: 'Instantly see age down to days and hours, day of the week born on, leap year birth check, and days until next celebration.',
      },
    ],
    proTips: [
      'Useful for calculating school entry eligibility, retirement dates, and milestone celebrations.',
    ],
    commonMistakes: [
      'Check time zone differences if comparing births across international date boundaries.',
    ],
    aiPromptRecommendation: 'Calculate exact age for birth date 15 August 1995',
  },
  {
    id: 'password-generator',
    title: 'Generate Cryptographically Secure Passwords',
    toolPath: '/tools/password-generator',
    category: 'Security',
    summary: 'Produce high-entropy passwords with custom length, symbols, numbers, and avoid ambiguous characters.',
    estimatedTime: '15 seconds',
    icon: 'Key',
    steps: [
      {
        stepNumber: 1,
        title: 'Set Target Length',
        instruction: 'Slide between 8 and 64 characters (16+ recommended for critical accounts).',
      },
      {
        stepNumber: 2,
        title: 'Toggle Character Sets',
        instruction: 'Include Uppercase (A-Z), Lowercase (a-z), Numbers (0-9), and Symbols (!@#$%).',
        tip: 'Check "Exclude Ambiguous" to remove confusing characters like 0/O and 1/l.',
      },
      {
        stepNumber: 3,
        title: 'Copy with One Click',
        instruction: 'Click the copy icon to securely copy to your clipboard without leaving browser memory.',
      },
    ],
    proTips: [
      'Never reuse the same password across multiple online accounts; use a dedicated password manager.',
    ],
    commonMistakes: [
      'Do not use easily guessable dictionary words or pet names in critical credentials.',
    ],
    aiPromptRecommendation: 'Generate a 16-character secure random password',
  },
  {
    id: 'convert-all',
    title: 'Universal Multi-Format Document Conversion',
    toolPath: '/tools/convert-all',
    category: 'Conversions',
    summary: 'Centralized hub to cross-convert Word docs, PowerPoint presentations, PDFs, and images.',
    estimatedTime: '1 minute',
    icon: 'Layers',
    steps: [
      {
        stepNumber: 1,
        title: 'Select Input and Output Pair',
        instruction: 'Choose from 16 supported pairings like Word to PDF, Image to PowerPoint, or PDF to Word.',
      },
      {
        stepNumber: 2,
        title: 'Upload Documents',
        instruction: 'Attach files via file dialog or dropzone.',
      },
      {
        stepNumber: 3,
        title: 'Run In-Browser Conversion',
        instruction: 'Watch live progress as the document compiler renders your new file for immediate download.',
      },
    ],
    proTips: [
      'All conversions execute on your client device using HTML5 Canvas and blob synthesizers — maximum speed and privacy.',
    ],
    commonMistakes: [
      'Ensure source documents are not corrupted before uploading.',
    ],
    aiPromptRecommendation: 'How do I convert Word documents to PDF in HPS Tools?',
  },
];

interface HelpDeskKnowledgeBaseProps {
  onNavigate: (path: string) => void;
  onClose: () => void;
  onSelectGuideForChat?: (guidePrompt: string) => void;
}

export const HelpDeskKnowledgeBase: React.FC<HelpDeskKnowledgeBaseProps> = ({
  onNavigate,
  onClose,
  onSelectGuideForChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>('pdf-to-image');

  const categories = ['All', 'Conversions', 'Photos & Media', 'Calculators', 'Security'];

  const filteredGuides = useMemo(() => {
    return KNOWLEDGE_GUIDES.filter((guide) => {
      const matchesCategory =
        selectedCategory === 'All' || guide.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        guide.title.toLowerCase().includes(q) ||
        guide.summary.toLowerCase().includes(q) ||
        guide.steps.some(
          (s) =>
            s.title.toLowerCase().includes(q) || s.instruction.toLowerCase().includes(q)
        );
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col h-full bg-hps-surface text-hps-text">
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-hps-border bg-hps-bg/50 space-y-3 shrink-0">
        <div className="relative">
          <Icon
            name="Search"
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-hps-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides (e.g. PDF to image, passport photo, loan...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-hps-border bg-hps-surface text-xs text-hps-text placeholder-hps-muted focus:outline-none focus:border-hps-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-hps-muted hover:text-hps-text p-1"
            >
              <Icon name="X" size={14} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-hps-primary text-white shadow-2xs'
                  : 'bg-hps-surface border border-hps-border text-hps-muted hover:text-hps-text hover:border-hps-primary/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Guides List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredGuides.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-hps-border/40 flex items-center justify-center text-hps-muted">
              <Icon name="Search" size={20} />
            </div>
            <p className="text-sm font-bold text-hps-text">No matching guides found</p>
            <p className="text-xs text-hps-muted max-w-xs mx-auto">
              Try searching for &quot;passport&quot;, &quot;pdf&quot;, &quot;resizer&quot;, or &quot;loan&quot;.
            </p>
          </div>
        ) : (
          filteredGuides.map((guide) => {
            const isExpanded = expandedGuideId === guide.id;
            return (
              <div
                key={guide.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? 'border-hps-primary/60 bg-hps-bg shadow-sm'
                    : 'border-hps-border bg-hps-surface hover:border-hps-border/80'
                }`}
              >
                {/* Guide Title Bar */}
                <div
                  onClick={() =>
                    setExpandedGuideId(isExpanded ? null : guide.id)
                  }
                  className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setExpandedGuideId(isExpanded ? null : guide.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-hps-primary/10 text-hps-primary shrink-0">
                      <Icon name={guide.icon} size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-hps-text">
                        {guide.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-hps-muted mt-0.5">
                        <span className="font-semibold text-hps-accent">
                          {guide.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Icon name="Clock" size={10} />
                          {guide.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        onNavigate(guide.toolPath);
                      }}
                      className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-hps-border bg-hps-surface hover:border-hps-primary text-hps-text transition-colors"
                      title="Open full tool"
                    >
                      <span>Open Tool</span>
                      <Icon name="ExternalLink" size={11} />
                    </button>
                    <Icon
                      name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                      size={18}
                      className="text-hps-muted"
                    />
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-hps-border/60 space-y-4 animate-in fade-in duration-150">
                    <p className="text-xs text-hps-muted leading-relaxed">
                      {guide.summary}
                    </p>

                    {/* Step-by-Step Instructions */}
                    <div className="space-y-2.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-hps-primary">
                        Step-by-Step Walkthrough
                      </h4>
                      <div className="space-y-2">
                        {guide.steps.map((step) => (
                          <div
                            key={step.stepNumber}
                            className="p-3 rounded-xl border border-hps-border bg-hps-surface space-y-1"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-hps-primary text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                                {step.stepNumber}
                              </span>
                              <span className="text-xs font-bold text-hps-text">
                                {step.title}
                              </span>
                            </div>
                            <p className="text-xs text-hps-muted pl-7 leading-relaxed">
                              {step.instruction}
                            </p>
                            {step.tip && (
                              <div className="ml-7 mt-1 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 flex items-start gap-1.5">
                                <Icon name="Sparkles" size={12} className="shrink-0 mt-0.5" />
                                <span>{step.tip}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro Tips & Do's/Don'ts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-[11px]">
                          <Icon name="CheckCircle" size={13} />
                          <span>Pro Recommendations</span>
                        </span>
                        <ul className="space-y-1 text-[11px] text-hps-muted pl-4 list-disc">
                          {guide.proTips.map((tip, idx) => (
                            <li key={idx} className="leading-snug">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 space-y-1.5">
                        <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 text-[11px]">
                          <Icon name="AlertCircle" size={13} />
                          <span>Common Mistakes to Avoid</span>
                        </span>
                        <ul className="space-y-1 text-[11px] text-hps-muted pl-4 list-disc">
                          {guide.commonMistakes.map((mistake, idx) => (
                            <li key={idx} className="leading-snug">
                              {mistake}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Buttons Bar */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-hps-border/60">
                      {onSelectGuideForChat && (
                        <button
                          onClick={() =>
                            onSelectGuideForChat(guide.aiPromptRecommendation)
                          }
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-hps-accent/20 border border-hps-accent/30 text-hps-text text-xs font-bold hover:bg-hps-accent/30 transition-colors cursor-pointer"
                        >
                          <Icon name="Sparkles" size={13} className="text-hps-accent" />
                          <span>Fulfill with AI Assistant</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onClose();
                          onNavigate(guide.toolPath);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-hps-primary text-white text-xs font-bold hover:bg-hps-primary/90 transition-colors shadow-2xs cursor-pointer"
                      >
                        <span>Launch {guide.title.split(' ')[0]} Tool</span>
                        <Icon name="ArrowRight" size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-hps-border bg-hps-bg/50 text-[11px] text-hps-muted flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Icon name="BookOpen" size={12} className="text-hps-primary" />
          <span>{KNOWLEDGE_GUIDES.length} interactive tool guides available</span>
        </span>
        <span className="font-mono text-[10px]">Client-Side Processing</span>
      </div>
    </div>
  );
};
