
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Clock, Users, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { favoritesManager } from '@/utils/favorites';
import { useState, useEffect } from 'react';
import { SpoonacularRecipe } from '@/services/spoonacularApi';
import { MealDbRecipe } from '@/services/mealDbApi';

interface RecipeCardProps {
  recipe: SpoonacularRecipe | MealDbRecipe;
  source: 'spoonacular' | 'mealdb';
}

const RecipeCard = ({ recipe, source }: RecipeCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Extract common properties based on source
  const id = source === 'spoonacular' ? recipe.id.toString() : (recipe as MealDbRecipe).idMeal;
  const title = source === 'spoonacular' ? recipe.title : (recipe as MealDbRecipe).strMeal;
  const image = source === 'spoonacular' ? recipe.image : (recipe as MealDbRecipe).strMealThumb;

  useEffect(() => {
    setIsFavorite(favoritesManager.isFavorite(id, source));
  }, [id, source]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite) {
      favoritesManager.removeFromFavorites(id, source);
    } else {
      favoritesManager.addToFavorites({
        id,
        title,
        image,
        source,
      });
    }
    setIsFavorite(!isFavorite);
  };

  const getUsedIngredients = () => {
    if (source === 'spoonacular') {
      return (recipe as SpoonacularRecipe).usedIngredients || [];
    }
    return [];
  };

  const getMissedIngredients = () => {
    if (source === 'spoonacular') {
      return (recipe as SpoonacularRecipe).missedIngredients || [];
    }
    return [];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link to={`/recipe/${id}?source=${source}`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-green-100 dark:border-gray-700 overflow-hidden transition-all duration-300">
          {/* Image */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/10b981/white?text=🍽️';
              }}
            />
            
            {/* Favorite button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className={`absolute top-3 right-3 rounded-full backdrop-blur-sm transition-all duration-200 ${
                isFavorite
                  ? 'bg-red-500/90 text-white hover:bg-red-600/90'
                  : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>

            {/* Source label */}
            <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
              {source === 'spoonacular' ? 'Spoonacular' : 'MealDB'}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2 mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              {title}
            </h3>

            {/* Ingredients info for Spoonacular recipes */}
            {source === 'spoonacular' && (
              <div className="space-y-2 mb-4">
                {getUsedIngredients().length > 0 && (
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Uses: {getUsedIngredients().slice(0, 3).map(ing => ing.name).join(', ')}
                      {getUsedIngredients().length > 3 && '...'}
                    </span>
                  </div>
                )}
                {getMissedIngredients().length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 text-orange-500 text-center">+</span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      Need: {getMissedIngredients().length} more ingredient{getMissedIngredients().length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* MealDB specific info */}
            {source === 'mealdb' && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                    {(recipe as MealDbRecipe).strCategory}
                  </span>
                  <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                    {(recipe as MealDbRecipe).strArea}
                  </span>
                </div>
              </div>
            )}

            {/* View Details button */}
            <div className="flex items-center justify-between">
              <span className="text-green-600 dark:text-green-400 font-medium text-sm group-hover:underline">
                View Recipe →
              </span>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>30 min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>4 srv</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RecipeCard;
