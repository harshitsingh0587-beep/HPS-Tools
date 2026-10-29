import React, { useState, useEffect } from 'react';
import { Logo } from '../components/common/Logo';
import { Icon } from '../components/common/Icon';
import { TOOLS_CATALOG } from '../data/toolsCatalog';
import { ToolCategory, ToolItem } from '../types';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenAppearance: () => void;
}

const CATEGORIES: ToolCategory[] = [
  'Everyday Tools',
  'Convert All',
  'PDF Tools',
  'Image Tools',
  'Document Tools',
  'PowerPoint Tools',
  'Photo Tools',
  'Financial Calculators',
  'Date and Time Tools',
];

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
    const updatedRecents = [tool.id, ...recentToolIds.filter((id) => id !== tool.id)].slice(0, 5);
    setRecentToolIds(updatedRecents);
    try {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updatedRecents));
    } catch (err) {
      console.error(err);
    }
    onNavigate(tool.path);
  };

  // Filter tools
  const filteredTools = TOOLS_CATALOG.filter((tool) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || tool.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const popularTools = TOOLS_CATALOG.filter((t) => t.popular);
  const favoriteTools = TOOLS_CATALOG.filter((t) => favorites.includes(t.id));
  const recentTools = recentToolIds
    .map((id) => TOOLS_CATALOG.find((t) => t.id === id))
    .filter((t): t is ToolItem => Boolean(t));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-5 pt-4 pb-2">
        <div className="flex justify-center">
          <Logo size="lg" showTagline={false} />
        </div>
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-hps-text tracking-tight">
            Simple Tools. <span className="text-hps-accent">One Place.</span>
          </h1>
          <p className="text-sm sm:text-base text-hps-muted max-w-2xl mx-auto mt-2 leading-relaxed">
            The ultra-fast, professional utility suite. Accurate calculators, genuine document converters, and precision photo tools engineered entirely for client-side privacy.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="max-w-xl mx-auto relative pt-2">
          <Icon
            name="Search"
            size={18}
            className="absolute left-4 top-5 text-hps-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search all tools by name, tag, or function (e.g., PDF to Word, Loan, DOB, Passport)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-hps-border bg-hps-surface text-sm text-hps-text shadow-sm focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30 focus:border-hps-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-4 p-1 text-hps-muted hover:text-hps-text"
              aria-label="Clear search query"
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>

        {/* Quick Highlights / Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-hps-muted pt-1">
          <span className="flex items-center gap-1.5">
            <Icon name="ShieldCheck" size={15} className="text-emerald-500" />
            100% Client-Side Privacy
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Icon name="Zap" size={15} className="text-hps-accent" />
            Instant Processing
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Icon name="CheckCircle" size={15} className="text-hps-primary" />
            Zero Server Uploads
          </span>
          <span>•</span>
          <button
            onClick={onOpenAppearance}
            className="flex items-center gap-1.5 text-hps-accent hover:underline"
          >
            <Icon name="Palette" size={14} />
            Customize Theme
          </button>
        </div>
      </section>

      {/* Pinned / Favorite Tools (If Any) */}
      {favoriteTools.length > 0 && searchQuery.trim() === '' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-hps-text flex items-center gap-2">
              <Icon name="Star" size={18} className="text-amber-500 fill-amber-500" />
              <span>Your Pinned & Favorite Tools</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favoriteTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorite={true}
                onToggleFavorite={(e) => toggleFavorite(tool.id, e)}
                onOpen={() => handleOpenTool(tool)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently Used Tools (If Any) */}
      {recentTools.length > 0 && searchQuery.trim() === '' && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-hps-primary flex items-center gap-2">
            <Icon name="Clock" size={15} />
            <span>Recently Used Tools</span>
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {recentTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleOpenTool(tool)}
                className="px-3 py-1.5 rounded-xl border border-hps-border bg-hps-surface hover:border-hps-primary/50 text-xs font-semibold text-hps-text flex items-center gap-2 shadow-2xs group transition-all"
              >
                <Icon name={tool.icon} size={14} className="text-hps-primary" />
                <span>{tool.name}</span>
                <Icon name="ArrowRight" size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Category Filter Tabs */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-hps-border flex-wrap gap-2">
          <h2 className="text-lg font-bold text-hps-text">Explore Tool Categories</h2>
          <span className="text-xs text-hps-muted">
            Showing {filteredTools.length} of {TOOLS_CATALOG.length} tools
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'All'
                ? 'bg-hps-primary text-white shadow-xs'
                : 'border border-hps-border bg-hps-surface text-hps-muted hover:text-hps-text hover:bg-hps-bg'
            }`}
          >
            All Tools ({TOOLS_CATALOG.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = TOOLS_CATALOG.filter((t) => t.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-hps-primary text-white font-bold shadow-xs'
                    : 'border border-hps-border bg-hps-surface text-hps-muted hover:text-hps-text hover:bg-hps-bg'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFavorite={favorites.includes(tool.id)}
              onToggleFavorite={(e) => toggleFavorite(tool.id, e)}
              onOpen={() => handleOpenTool(tool)}
            />
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-hps-border bg-hps-surface space-y-3">
            <Icon name="SearchX" size={36} className="mx-auto text-hps-muted" />
            <p className="text-sm font-bold text-hps-text">No tools match &quot;{searchQuery}&quot;</p>
            <p className="text-xs text-hps-muted">Try clearing the search or category filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-hps-primary text-white shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Popular Tools Highlights section */}
      {searchQuery.trim() === '' && selectedCategory === 'All' && (
        <section className="pt-8 border-t border-hps-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-hps-text flex items-center gap-2">
                <Icon name="Flame" size={18} className="text-amber-500" />
                <span>Popular Everyday Utilities</span>
              </h2>
              <p className="text-xs text-hps-muted">
                Quickly jump into the most frequently utilized calculators and photo tools
              </p>
            </div>
            <button
              onClick={() => onNavigate('/tools/convert-all')}
              className="text-xs font-semibold text-hps-primary hover:underline flex items-center gap-1"
            >
              <span>Convert All Hub</span>
              <Icon name="ArrowRight" size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularTools.slice(0, 4).map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorite={favorites.includes(tool.id)}
                onToggleFavorite={(e) => toggleFavorite(tool.id, e)}
                onOpen={() => handleOpenTool(tool)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

interface ToolCardProps {
  tool: ToolItem;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onOpen: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isFavorite,
  onToggleFavorite,
  onOpen,
}) => {
  return (
    <div
      onClick={onOpen}
      className="p-5 rounded-2xl border border-hps-border bg-hps-surface hover:border-hps-primary/50 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer relative"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      aria-label={`Open tool: ${tool.name}`}
    >
      <div className="space-y-3">
        {/* Top line with Icon, Category badge, and Favorite Star */}
        <div className="flex items-center justify-between gap-2">
          <div className="p-2.5 rounded-xl bg-hps-primary/10 text-hps-primary group-hover:bg-hps-primary group-hover:text-white transition-colors shrink-0">
            <Icon name={tool.icon} size={20} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-hps-border bg-hps-bg text-hps-muted">
              {tool.category}
            </span>
            <button
              onClick={onToggleFavorite}
              className="p-1 rounded-md text-hps-muted hover:text-amber-500 transition-colors"
              title={isFavorite ? 'Remove from favorites' : 'Pin to favorites'}
              aria-label={isFavorite ? `Unfavorite ${tool.name}` : `Favorite ${tool.name}`}
            >
              <Icon
                name="Star"
                size={16}
                className={isFavorite ? 'text-amber-500 fill-amber-500' : ''}
              />
            </button>
          </div>
        </div>

        {/* Title and Description */}
        <div>
          <h3 className="text-base font-bold text-hps-text group-hover:text-hps-primary transition-colors">
            {tool.name}
          </h3>
          <p className="text-xs text-hps-muted leading-relaxed mt-1.5 line-clamp-2">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="pt-4 mt-4 border-t border-hps-border flex items-center justify-between">
        <span className="text-[11px] text-hps-muted font-medium">Ready in browser</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-hps-border bg-hps-bg hover:bg-hps-primary hover:text-white text-hps-text transition-all flex items-center gap-1.5 shadow-2xs group-hover:border-hps-primary"
        >
          <span>Open Tool</span>
          <Icon name="ArrowRight" size={13} />
        </button>
      </div>
    </div>
  );
};
