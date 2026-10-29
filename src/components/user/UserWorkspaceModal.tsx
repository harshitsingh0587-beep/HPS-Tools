import React, { useState } from 'react';
import { Icon } from '../common/Icon';
import { UserProfile, saveUserWork, deleteUserWork, UserWorkItem } from '../../services/auth/authService';

interface UserWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onRefreshUser: () => void;
}

export const UserWorkspaceModal: React.FC<UserWorkspaceModalProps> = ({
  isOpen,
  onClose,
  user,
  onRefreshUser,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!isOpen) return null;

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    saveUserWork({
      type: 'note',
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
    });

    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
    onRefreshUser();
  };

  const handleDelete = (id: string) => {
    deleteUserWork(id);
    onRefreshUser();
  };

  const filteredItems = user.savedWork.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-hps-surface rounded-2xl shadow-2xl border border-hps-border overflow-hidden text-hps-text flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-modal-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-hps-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-hps-primary/10 text-hps-primary">
              <Icon name="FolderHeart" size={22} />
            </div>
            <div>
              <h2 id="workspace-modal-title" className="text-base font-bold">
                My Saved Work & History
              </h2>
              <p className="text-xs text-hps-muted">
                {user.name} ({user.email}) • {user.savedWork.length} saved records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-hps-muted hover:bg-hps-bg"
            aria-label="Close modal"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Filter bar and Add Note Button */}
        <div className="px-6 py-3 border-b border-hps-border flex items-center justify-between gap-2 shrink-0 bg-hps-bg/50">
          <div className="flex gap-1.5 overflow-x-auto text-xs">
            {['all', 'loan', 'calculation', 'password', 'text', 'note'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[10px] tracking-wider transition-colors ${
                  filterType === t
                    ? 'bg-hps-primary text-white'
                    : 'border border-hps-border bg-hps-surface text-hps-muted hover:text-hps-text'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddingNote(!isAddingNote)}
            className="px-3 py-1 text-xs font-semibold rounded-lg border border-hps-border bg-hps-surface hover:bg-hps-bg text-hps-primary flex items-center gap-1.5 shrink-0"
          >
            <Icon name={isAddingNote ? 'Minus' : 'Plus'} size={14} />
            <span>{isAddingNote ? 'Cancel' : 'Save Custom Work'}</span>
          </button>
        </div>

        {/* Form to add custom note/work */}
        {isAddingNote && (
          <form onSubmit={handleCreateNote} className="p-4 border-b border-hps-border bg-hps-bg space-y-2 shrink-0">
            <input
              type="text"
              required
              placeholder="Title of your work (e.g., Client Loan Scenario, Draft Note)..."
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              className="w-full p-2 rounded-lg border border-hps-border bg-hps-surface text-xs text-hps-text"
            />
            <textarea
              rows={2}
              placeholder="Content details or calculation numbers..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="w-full p-2 rounded-lg border border-hps-border bg-hps-surface text-xs text-hps-text"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: 'var(--hps-primary)' }}
              >
                Save to My Account
              </button>
            </div>
          </form>
        )}

        {/* Saved List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-hps-muted space-y-2">
              <Icon name="FolderOpen" size={32} className="mx-auto text-hps-muted opacity-50" />
              <p>No saved work items found for &quot;{filterType}&quot;.</p>
              <p>Items you save across any calculator, generator, or converter appear here.</p>
            </div>
          ) : (
            filteredItems.map((item: UserWorkItem) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-hps-border bg-hps-surface hover:border-hps-primary/40 transition-colors flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-hps-bg border border-hps-border text-hps-primary">
                      {item.type}
                    </span>
                    <h3 className="text-xs font-bold text-hps-text">{item.title}</h3>
                  </div>
                  <p className="text-xs text-hps-muted font-mono break-all leading-relaxed">
                    {item.content}
                  </p>
                  <p className="text-[10px] text-hps-muted">
                    Saved on {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-hps-muted hover:text-rose-600 transition-colors shrink-0"
                  title="Delete item"
                >
                  <Icon name="Trash2" size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
