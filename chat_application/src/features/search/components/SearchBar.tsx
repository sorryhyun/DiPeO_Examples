import React, { useState, useEffect, useRef } from 'react';
import Input from '../../../shared/components/atoms/Input';
import Icon from '../../../shared/components/atoms/Icon';
import useDebounce from '../../../shared/hooks/useDebounce';

interface SearchResult {
  id: string;
  type: 'message' | 'file';
  title: string;
  preview: string;
  channelName?: string;
  timestamp: Date;
}

interface SearchBarProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search messages and files...",
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await onSearch(debouncedQuery);
        setResults(searchResults.slice(0, 8)); // Show top 8 results
        setIsOpen(searchResults.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, onSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    // This would typically navigate to the result or trigger a callback
    console.log('Selected result:', result);
    setIsOpen(false);
    setSelectedIndex(-1);
    setQuery('');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-4"
          aria-label="Search messages and files"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="animate-spin">
              <Icon name="search" size="sm" className="text-gray-400" />
            </div>
          ) : (
            <Icon name="search" size="sm" className="text-gray-400" />
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          role="listbox"
          aria-label="Search results"
        >
          {results.map((result, index) => (
            <div
              key={result.id}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                index === selectedIndex 
                  ? 'bg-blue-50 dark:bg-blue-900/20' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleResultSelect(result)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <Icon 
                    name={result.type === 'message' ? 'message' : 'file'} 
                    size="sm" 
                    className="text-gray-500 dark:text-gray-400" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {result.title}
                    </span>
                    {result.channelName && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        #{result.channelName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                    {result.preview}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(result.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
