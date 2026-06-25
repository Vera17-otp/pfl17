import { useState, useEffect } from "react";

/**
 * useSearch Hook
 * Provides a debounced search term to avoid firing too many API requests while typing.
 */
export function useSearch(initialValue = "", delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedTerm, setDebouncedTerm] = useState(initialValue);

  useEffect(() => {
    // Update debounced term after the specified delay
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    // Cancel the timeout if searchTerm changes (user keeps typing)
    // or if the component unmounts
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm
  };
}
