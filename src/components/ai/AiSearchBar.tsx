"use client";
import { useState, useCallback } from "react";
import { Search, Loader as Loader2, Sparkles, X } from "lucide-react";
import type { SearchFilters } from "@/lib/search/searchService";
import { parseSearchQuery, getSearchSuggestions } from "@/lib/ai/searchAssistant";
import { cn } from "@/lib/cn";

interface AiSearchBarProps {
  onFiltersParsed: (filters: SearchFilters) => void;
  className?: string;
}

export function AiSearchBar({ onFiltersParsed, className }: AiSearchBarProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions] = useState(() => getSearchSuggestions(""));

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setExplanation(null);
    try {
      const result = parseSearchQuery(query);
      onFiltersParsed(result.filters);
      setExplanation(result.explanation);
      setShowSuggestions(false);
    } catch {
      setExplanation("Could not parse your query. Try different keywords.");
    } finally {
      setLoading(false);
    }
  }, [query, onFiltersParsed]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSuggestion = (s: string) => {
    setQuery(s);
    setLoading(true);
    try {
      const result = parseSearchQuery(s);
      onFiltersParsed(result.filters);
      setExplanation(result.explanation);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Ask AI: 'Show software engineers in Chennai' or 'மதுரை ஆசிரியர்களை காட்டு'"
            className="w-full rounded-xl border border-primary-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setExplanation(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          AI Search
        </button>
      </div>

      {showSuggestions && !query && suggestions.length > 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-primary-100 bg-white p-2 shadow-lg">
          <p className="px-2 py-1 text-xs font-medium text-gray-400">Try these:</p>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => handleSuggestion(s)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-gray-700 hover:bg-primary-50"
            >
              <Sparkles className="h-3 w-3 flex-none text-primary-400" />
              {s}
            </button>
          ))}
        </div>
      )}

      {explanation && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-700">
          <Sparkles className="h-3 w-3 flex-none" />
          {explanation}
        </div>
      )}
    </div>
  );
}
