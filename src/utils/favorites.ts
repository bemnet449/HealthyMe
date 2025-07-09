
export interface FavoriteRecipe {
  id: string;
  title: string;
  image: string;
  source: 'spoonacular' | 'mealdb';
  savedAt: string;
}

const FAVORITES_KEY = 'healthyme-favorites';

export const favoritesManager = {
  // Get all favorites
  getFavorites: (): FavoriteRecipe[] => {
    try {
      const favorites = localStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },

  // Add to favorites
  addToFavorites: (recipe: Omit<FavoriteRecipe, 'savedAt'>): void => {
    try {
      const favorites = favoritesManager.getFavorites();
      const newFavorite: FavoriteRecipe = {
        ...recipe,
        savedAt: new Date().toISOString(),
      };
      
      // Check if already exists
      const exists = favorites.some(fav => fav.id === recipe.id && fav.source === recipe.source);
      if (!exists) {
        favorites.push(newFavorite);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  },

  // Remove from favorites
  removeFromFavorites: (id: string, source: 'spoonacular' | 'mealdb'): void => {
    try {
      const favorites = favoritesManager.getFavorites();
      const filtered = favorites.filter(fav => !(fav.id === id && fav.source === source));
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  },

  // Check if recipe is favorite
  isFavorite: (id: string, source: 'spoonacular' | 'mealdb'): boolean => {
    try {
      const favorites = favoritesManager.getFavorites();
      return favorites.some(fav => fav.id === id && fav.source === source);
    } catch (error) {
      console.error('Error checking if favorite:', error);
      return false;
    }
  },
};
