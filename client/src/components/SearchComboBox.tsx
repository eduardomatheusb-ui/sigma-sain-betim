import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { debounce } from 'lodash-es';

interface SearchOption {
  id: number;
  name: string;
  [key: string]: any;
}

interface SearchComboBoxProps {
  placeholder?: string;
  onSearch: (query: string) => Promise<SearchOption[]>;
  onSelect: (option: SearchOption) => void;
  value?: SearchOption | null;
  onClear?: () => void;
  disabled?: boolean;
  label?: string;
}

export function SearchComboBox({
  placeholder = 'Buscar...',
  onSearch,
  onSelect,
  value,
  onClear,
  disabled = false,
  label,
}: SearchComboBoxProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<SearchOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const results = await onSearch(query);
        setSuggestions(results);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [onSearch]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    debouncedSearch(newValue);
  };

  const handleSelect = (option: SearchOption) => {
    onSelect(option);
    setInputValue(option.name);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Update input when value prop changes
  useEffect(() => {
    if (value) {
      setInputValue(value.name);
    }
  }, [value]);

  return (
    <div className="relative w-full">
      {label && <label className="text-sm font-medium block mb-1">{label}</label>}
      
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="pr-10"
          autoComplete="off"
        />

        {/* Loading or Clear Button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : inputValue && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
              Carregando...
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((option, index) => (
                <li key={option.id}>
                  <button
                    onClick={() => handleSelect(option)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                      index === selectedIndex ? 'bg-blue-100' : ''
                    }`}
                    type="button"
                  >
                    <div className="font-medium text-gray-900">{option.name}</div>
                    {option.code && (
                      <div className="text-xs text-gray-500">{option.code}</div>
                    )}
                    {option.enrollmentNumber && (
                      <div className="text-xs text-gray-500">
                        Matrícula: {option.enrollmentNumber}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-center text-gray-500 text-sm">
              Nenhum resultado encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
}
