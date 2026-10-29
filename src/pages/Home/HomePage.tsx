import React, { useState, useEffect } from 'react';
import { Logo } from '../../components/common/Logo';
import { Icon } from '../../components/common/Icon';
import { ToolCard } from '../../components/common/ToolCard';
import { TOOLS_REGISTRY, TOOL_CATEGORIES } from '../../constants/toolsRegistry';
import { ToolCategory, ToolItem } from '../../types';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenAppearance: () => void;
}

const FAVORITES_STORAGE_KEY = 'hps_favorite_tools';
const RECENT_STORAGE_KEY = 'hps_recent_tools';

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAppearance }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentToolIds, setRecentToolIds] = useState<string[]>([]);

  // Load favorites & recent from local storage
  useEffect(() => {
    try {
      const favs = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (favs) setFavorites(JSON.parse(favs));

      const recents = localStorage.getItem(RECENT_STORAGE_KEY);
      if (recents) setRecentToolIds(JSON.parse(recents));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleFavorite = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.includes(toolId)
      ? favorites.filter((id) => id !== toolId)
      : [...favorites, toolId];
    setFavorites(updated);
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenTool = (tool: ToolItem) => {
    // Record into recent
    const filtered = recentToolIds.filter((id) => id !== tool.id);
    const updated = [tool.id, ...filtered].slice(0, 5);
    setRecentToolIds(updated);
    try {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    onNavigate(tool.path);
  };

  // Filter tools
  const filteredTools = TOOLS_REGISTRY.filter((tool) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Favorites' && favorites.includes(tool.id)) ||
      tool.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const favoriteTools = TOOLS_REGISTRY.filter((t) => favorites.includes(t.id));
  const recentTools = recentToolIds
    .map((id) => TOOLS_REGISTRY.find((t) => t.id === id))
    .filter(Boolean) as ToolItem[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-5 max-w-3xl mx-auto pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hps-border bg-hps-surface text-xs font-semibold text-hps-muted">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Client-Side Speed • 100% In-Browser Privacy</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-hps-text tracking-tight">
          Simple Tools.{' '}
          <span className="text-hps-primary underline decoration-hps-accent decoration-4 underline-offset-8">
            One Place.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-hps-muted leading-relaxed max-w-2xl mx-auto">
          Everyday utilities, precision calculators, and client-side format converters for PDF, Word, PowerPoint, and images. Zero file uploads to remote servers.
        </p>

        {/* Global Live Search Bar */}
        <div className="relative max-w-xl mx-auto pt-2">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-hps-muted pointer-events-none">
              <Icon name="Search" size={18} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by name, keyword, or format (e.g. 'pdf to docx', 'bmi', 'loan')..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-hps-border bg-hps-surface text-hps-text placeholder-hps-muted/60 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30 focus:border-hps-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-hps-muted hover:text-hps-text p-1"
                aria-label="Clear search"
              >
                <Icon name="X" size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Recent & Pinned Strip */}
      {(recentTools.length > 0 || favoriteTools.length > 0) && (
        <section className="bg-hps-surface/50 border border-hps-border rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-hps-muted">
            <span className="flex items-center gap-1.5">
              <Icon name="Clock" size={14} className="text-hps-primary" />
              <span>Quick Access ({recentTools.length} recent • {favoriteTools.length} pinned)</span>
            </span>
            {favoriteTools.length > 0 && (
              <button
                onClick={() => setSelectedCategory('Favorites')}
                className="text-hps-primary hover:underline lowercase font-semibold"
              >
                view all pinned
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {recentTools.slice(0, 4).map((tool) => (
              <button
                key={`recent-${tool.id}`}
                onClick={() => handleOpenTool(tool)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-hps-border bg-hps-surface hover:border-hps-primary/50 text-xs font-semibold text-hps-text transition-all group"
              >
                <Icon name={tool.icon} size={14} className="text-hps-primary" />
                <span>{tool.name}</span>
                <span className="text-[10px] text-hps-muted font-normal">({tool.category})</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Category Pills Filter */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-hps-text flex items-center gap-2">
            <Icon name="Grid" size={18} className="text-hps-primary" />
            <span>Browse by Category</span>
          </h2>
          <span className="text-xs text-hps-muted font-medium">
            Showing {filteredTools.length} of {TOOLS_REGISTRY.length} tools
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-hps-primary text-white shadow-xs'
                : 'bg-hps-surface border border-hps-border text-hps-muted hover:text-hps-text'
            }`}
          >
            All Tools ({TOOLS_REGISTRY.length})
          </button>
          {favorites.length > 0 && (
            <button
              onClick={() => setSelectedCategory('Favorites')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'Favorites'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-hps-surface border border-hps-border text-hps-muted hover:text-amber-500'
              }`}
            >
              <Icon name="Star" size={12} className="fill-current" />
              <span>Pinned ({favorites.length})</span>
            </button>
          )}
          {TOOL_CATEGORIES.map((cat) => {
            const count = TOOLS_REGISTRY.filter((t) => t.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-hps-primary text-white shadow-xs'
                    : 'bg-hps-surface border border-hps-border text-hps-muted hover:text-hps-text'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Tools Cards Grid */}
      <section className="space-y-4">
        {filteredTools.length === 0 ? (
          <div className="text-center py-16 bg-hps-surface border border-hps-border rounded-2xl space-y-3">
            <Icon name="Search" size={32} className="text-hps-muted mx-auto" />
            <h3 className="text-base font-bold text-hps-text">No matching tools found</h3>
            <p className="text-xs text-hps-muted max-w-sm mx-auto">
              We couldn&apos;t find any tool matching &quot;{searchQuery}&quot;. Try checking for spelling or clear filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-xs font-bold text-hps-primary hover:underline pt-2 inline-block cursor-pointer"
            >
              Reset filters & search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorite={favorites.includes(tool.id)}
                onToggleFavorite={toggleFavorite}
                onClick={handleOpenTool}
              />
            ))}
          </div>
        )}
      </section>

      {/* Featured Feature Callouts Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface space-y-2">
          <div className="p-2.5 rounded-xl bg-hps-primary/10 text-hps-primary w-fit">
            <Icon name="ShieldCheck" size={20} />
          </div>
          <h3 className="font-bold text-sm text-hps-text">Zero File Tracking</h3>
          <p className="text-xs text-hps-muted leading-relaxed">
            All conversions, password generations, and computations happen in your browser&apos;s isolated RAM. No third-party uploads.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface space-y-2">
          <div className="p-2.5 rounded-xl bg-hps-primary/10 text-hps-primary w-fit">
            <Icon name="Palette" size={20} />
          </div>
          <h3 className="font-bold text-sm text-hps-text">Custom Appearance</h3>
          <p className="text-xs text-hps-muted leading-relaxed">
            Switch between Classic Navy, Ocean Blue, Forest Green, Royal Purple, Sunset, or full Dark Mode at any time.
          </p>
          <button
            onClick={onOpenAppearance}
            className="text-xs font-bold text-hps-primary hover:underline inline-flex items-center gap-1 pt-1 cursor-pointer"
          >
            <span>Customize theme</span>
            <Icon name="ChevronRight" size={12} />
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface space-y-2">
          <div className="p-2.5 rounded-xl bg-hps-primary/10 text-hps-primary w-fit">
            <Icon name="FileCheck" size={20} />
          </div>
          <h3 className="font-bold text-sm text-hps-text">21 Verified Utilities</h3>
          <p className="text-xs text-hps-muted leading-relaxed">
            From financial amortizations to DOCX, PPTX, and PDF generators. Every calculation is rigorously tested.
          </p>
        </div>
      </section>
    </div>
  );
};
