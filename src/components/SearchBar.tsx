
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { spoonacularApi, IngredientSuggestion } from '@/services/spoonacularApi';
import { correctSpelling } from '@/utils/spellChecker';

interface SearchBarProps {
  onSearch: (ingredients: string[]) => void;
  isLoading?: boolean;
}

const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<IngredientSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch ingredient suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.length > 2) {
        try {
          const suggestionData = await spoonacularApi.autocompleteIngredients(inputValue);
          setSuggestions(suggestionData);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddIngredient(inputValue);
      } else if (ingredients.length > 0) {
        handleSearch();
      }
    }
  };

  const handleSearch = async () => {
    if (ingredients.length === 0) return;
    
    try {
      // Apply spell checking
      const correctedIngredients = await correctSpelling(ingredients);
      onSearch(correctedIngredients);
    } catch (error) {
      console.error('Error during search:', error);
      onSearch(ingredients); // Fallback to original ingredients
    }
  };

  const handleSuggestionClick = (suggestion: IngredientSuggestion) => {
    handleAddIngredient(suggestion.name);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        {/* Main search container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-green-200 dark:border-gray-600 p-4">
          {/* Ingredient tags */}
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {ingredients.map((ingredient, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {ingredient}
                  <button
                    onClick={() => handleRemoveIngredient(index)}
                    className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Input and button row */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Add ingredients (e.g., chicken, tomatoes, onions)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full pl-4 pr-10 py-2 border-0 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-green-500"
              />
              {inputValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddIngredient(inputValue)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-6 w-6"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>

            <Button
              onClick={handleSearch}
              disabled={ingredients.length === 0 || isLoading}
              className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Search className="w-4 h-4" />
                </motion.div>
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-green-200 dark:border-gray-600 z-50 max-h-60 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-green-100 dark:border-gray-700 last:border-b-0 transition-colors"
                  >
                    <img
                      src={`https://spoonacular.com/cdn/ingredients_100x100/${suggestion.image}`}
                      alt={suggestion.name}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32x32/10b981/white?text=🥬';
                      }}
                    />
                    <span className="text-gray-700 dark:text-gray-300 capitalize">
                      {suggestion.name}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
