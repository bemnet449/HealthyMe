
import { datamuseApi } from '@/services/datamuseApi';

export const correctSpelling = async (ingredients: string[]): Promise<string[]> => {
  const correctedIngredients = await Promise.all(
    ingredients.map(async (ingredient) => {
      const trimmed = ingredient.trim().toLowerCase();
      if (trimmed.length < 3) return trimmed;
      
      try {
        const suggestions = await datamuseApi.getSpellingSuggestions(trimmed);
        // If we have suggestions and the first one is significantly different, use it
        if (suggestions.length > 0 && suggestions[0] !== trimmed) {
          console.log(`Spell check suggestion: ${trimmed} -> ${suggestions[0]}`);
          return suggestions[0];
        }
        return trimmed;
      } catch (error) {
        console.error('Error checking spelling for:', ingredient, error);
        return trimmed;
      }
    })
  );
  
  return correctedIngredients;
};
