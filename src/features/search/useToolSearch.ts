import { useState, useMemo } from 'react';
import { TOOLS_REGISTRY } from '../../constants/toolsRegistry';
import { ToolItem } from '../../types';

export function useToolSearch() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredTools = useMemo(() => {
    return TOOLS_REGISTRY.filter((tool: ToolItem) => {
      const q = query.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All' || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [query, selectedCategory]);

  return {
    query,
    setQuery,
    selectedCategory,
    setSelectedCategory,
    filteredTools,
    totalCount: TOOLS_REGISTRY.length,
    filteredCount: filteredTools.length,
  };
}
