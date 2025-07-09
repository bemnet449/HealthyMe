
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { favoritesManager, FavoriteRecipe } from '@/utils/favorites';
import RecipeCard from '@/components/RecipeCard';
import { useToast } from '@/hooks/use-toast';

const Favorites = () => {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadFavorites = () => {
      const favoriteRecipes = favoritesManager.getFavorites();
      setFavorites(favoriteRecipes.sort((a, b) => 
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      ));
    };

    loadFavorites();
    
    // Listen for storage changes (in case favorites are updated in another tab)
    const handleStorageChange = () => {
      loadFavorites();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleClearAll = () => {
    if (favorites.length === 0) return;
    
    // Clear all favorites
    favorites.forEach(fav => {
      favoritesManager.removeFromFavorites(fav.id, fav.source);
    });
    
    setFavorites([]);
    toast({
      title: "Favorites cleared",
      description: "All favorite recipes have been removed.",
    });
  };

  const refreshFavorites = () => {
    const favoriteRecipes = favoritesManager.getFavorites();
    setFavorites(favoriteRecipes.sort((a, b) => 
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    ));
  };

  // Convert FavoriteRecipe to the format expected by RecipeCard
  const convertToRecipeCardFormat = (favorite: FavoriteRecipe) => {
    if (favorite.source === 'spoonacular') {
      return {
        id: parseInt(favorite.id),
        title: favorite.title,
        image: favorite.image,
        usedIngredients: [],
        missedIngredients: [],
      };
    } else {
      return {
        idMeal: favorite.id,
        strMeal: favorite.title,
        strMealThumb: favorite.image,
        strCategory: 'Favorite',
        strArea: 'International',
        strInstructions: '',
      };
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500 fill-current" />
                My Favorite Recipes
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {favorites.length} saved recipe{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {favorites.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </motion.div>

        {/* Favorites Grid */}
        {favorites.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {favorites.map((favorite, index) => (
              <motion.div
                key={`${favorite.source}-${favorite.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <RecipeCard
                  recipe={convertToRecipeCardFormat(favorite)}
                  source={favorite.source}
                />
                
                {/* Saved date indicator */}
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  Saved {new Date(favorite.savedAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Heart className="w-16 h-16 text-gray-400" />
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              No favorite recipes yet
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Start exploring recipes and click the heart icon to save your favorites here.
            </p>
            
            <Link to="/">
              <Button className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Find Recipes
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Tips section */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 bg-gradient-to-r from-green-50 to-orange-50 dark:from-green-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-green-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              💡 Pro Tip
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your favorite recipes are saved locally on your device. They'll be available even when you're offline!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
