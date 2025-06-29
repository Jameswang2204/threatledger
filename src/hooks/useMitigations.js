// src/hooks/useMitigations.js
import { useState, useEffect } from 'react';
import { fetchMitigationSuggestions } from '../utils/aiService';

/**
 * Hook to fetch AI-powered mitigation suggestions based on risk title & category.
 * Returns { suggestions: string[], loading: boolean }.
 */
export function useMitigations(title, category) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    // if no title, clear out
    if (!title) {
      setSuggestions([]);
      return;
    }

    let active = true;
    setLoading(true);

    fetchMitigationSuggestions({ title, category })
      .then(list => {
        if (active) setSuggestions(list);
      })
      .catch(err => {
        console.error('Mitigation fetch error:', err);
        if (active) setSuggestions([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [title, category]);

  return { suggestions, loading };
}