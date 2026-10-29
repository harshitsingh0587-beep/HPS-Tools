import React, { useState } from 'react';
import { Icon } from '../common/Icon';
import { submitFeedback, FeedbackItem } from '../../services/feedback/feedbackService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUserName?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultUserName = 'harshit.hub',
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userName, setUserName] = useState<string>(defaultUserName || 'harshit.hub');
  const [userEmail, setUserEmail] = useState<string>('');
  const [category, setCategory] = useState<FeedbackItem['category']>('General');
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    submitFeedback({
      userName: userName.trim() || 'harshit.hub User',
      userEmail: userEmail.trim() || 'guest@harshit.hub',
      rating,
      category,
      comment: comment.trim(),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-hps-surface rounded-2xl shadow-2xl border border-hps-border overflow-hidden text-hps-text"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-hps-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Icon name="Star" size={22} className="fill-amber-500" />
            </div>
            <div>
              <h2 id="feedback-modal-title" className="text-base font-bold">
                Share Your Feedback & Rating
              </h2>
              <p className="text-xs text-hps-muted">
                Help Harshit & the harshit.hub team improve HPS Tools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-hps-muted hover:bg-hps-bg"
            aria-label="Close feedback modal"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Icon name="CheckCircle2" size={32} />
              </div>
              <h3 className="text-base font-bold text-hps-text">Thank You for Your Feedback!</h3>
              <p className="text-xs text-hps-muted">
                Your rating and suggestions have been logged for the admin team at harshit.hub.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Selector */}
              <div className="text-center space-y-1.5 p-3 rounded-xl bg-hps-bg border border-hps-border">
                <span className="text-xs font-bold text-hps-text block">Overall Rating</span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-2xl transition-transform hover:scale-110 cursor-pointer"
                        aria-label={`${star} star rating`}
                      >
                        <Icon
                          name="Star"
                          size={28}
                          className={
                            isFilled
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300 dark:text-slate-600'
                          }
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {rating === 5 && 'Outstanding! 5 Stars'}
                  {rating === 4 && 'Great Experience! 4 Stars'}
                  {rating === 3 && 'Average / Good 3 Stars'}
                  {rating === 2 && 'Needs Improvement 2 Stars'}
                  {rating === 1 && 'Unsatisfied 1 Star'}
                </span>
              </div>

              {/* Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-hps-text block">Your Name / Sign Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. harshit.hub or your name"
                    className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-xs text-hps-text focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-hps-text block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-xs text-hps-text"
                  >
                    <option value="General">General Suite</option>
                    <option value="Calculators">Calculators</option>
                    <option value="Document Converters">Document Converters</option>
                    <option value="Passport & Photo">Passport & Photo Maker</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-hps-text block">Your Feedback</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you love or what new tools you would like added to HPS Tools..."
                  className="w-full p-3 rounded-xl border border-hps-border bg-hps-bg text-xs text-hps-text focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-hps-border hover:bg-hps-bg text-hps-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl text-white shadow-xs cursor-pointer hover:opacity-95"
                  style={{ backgroundColor: 'var(--hps-primary)' }}
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
