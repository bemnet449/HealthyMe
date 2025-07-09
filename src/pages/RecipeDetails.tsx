
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, Heart, ExternalLink, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NutritionChart from '@/components/NutritionChart';
import { spoonacularApi, RecipeDetails as SpoonacularRecipeDetails } from '@/services/spoonacularApi';
import { mealDbApi, MealDbRecipe } from '@/services/mealDbApi';
import { favoritesManager } from '@/utils/favorites';
import { useToast } from '@/hooks/use-toast';

const RecipeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') as 'spoonacular' | 'mealdb' || 'spoonacular';
  
  const [recipe, setRecipe] = useState<SpoonacularRecipeDetails | MealDbRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [nutritionChartType, setNutritionChartType] = useState<'doughnut' | 'bar'>('doughnut');
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        let recipeData;
        
        if (source === 'spoonacular') {
          recipeData = await spoonacularApi.getRecipeDetails(parseInt(id));
        } else {
          recipeData = await mealDbApi.getRecipeById(id);
        }
        
        setRecipe(recipeData);
        setIsFavorite(favoritesManager.isFavorite(id, source));
      } catch (error) {
        console.error('Error fetching recipe details:', error);
        toast({
          title: "Failed to load recipe",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id, source, toast]);

  const handleToggleFavorite = () => {
    if (!recipe || !id) return;
    
    const title = source === 'spoonacular' 
      ? (recipe as SpoonacularRecipeDetails).title 
      : (recipe as MealDbRecipe).strMeal;
    const image = source === 'spoonacular' 
      ? (recipe as SpoonacularRecipeDetails).image 
      : (recipe as MealDbRecipe).strMealThumb;
    
    if (isFavorite) {
      favoritesManager.removeFromFavorites(id, source);
      toast({
        title: "Removed from favorites",
        description: "Recipe removed from your favorites.",
      });
    } else {
      favoritesManager.addToFavorites({
        id,
        title,
        image,
        source,
      });
      toast({
        title: "Added to favorites",
        description: "Recipe saved to your favorites.",
      });
    }
    setIsFavorite(!isFavorite);
  };

  const parseInstructions = (instructions: string) => {
    // Remove HTML tags and split by sentence or number
    const cleanInstructions = instructions.replace(/<[^>]*>/g, '');
    const steps = cleanInstructions
      .split(/(?:\d+\.|\n)/)
      .filter(step => step.trim().length > 10)
      .map(step => step.trim());
    
    return steps;
  };

  const getMealDbIngredients = (recipe: MealDbRecipe) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient,
          measure: measure || '',
          original: `${measure} ${ingredient}`.trim(),
        });
      }
    }
    return ingredients;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Recipe not found
          </h1>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isSpoonacular = source === 'spoonacular';
  const title = isSpoonacular ? (recipe as SpoonacularRecipeDetails).title : (recipe as MealDbRecipe).strMeal;
  const image = isSpoonacular ? (recipe as SpoonacularRecipeDetails).image : (recipe as MealDbRecipe).strMealThumb;
  const instructions = isSpoonacular 
    ? (recipe as SpoonacularRecipeDetails).instructions 
    : (recipe as MealDbRecipe).strInstructions;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Recipes
            </Button>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400/10b981/white?text=🍽️';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {title}
                  </h1>
                  <div className="flex items-center gap-4 text-white/90">
                    {isSpoonacular && (
                      <>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{(recipe as SpoonacularRecipeDetails).readyInMinutes} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{(recipe as SpoonacularRecipeDetails).servings} servings</span>
                        </div>
                      </>
                    )}
                    <div className="bg-white/20 px-2 py-1 rounded-full text-sm">
                      {source === 'spoonacular' ? 'Spoonacular' : 'MealDB'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-4 mb-6">
                <Button
                  onClick={handleToggleFavorite}
                  variant={isFavorite ? "default" : "outline"}
                  className={isFavorite ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
                {!isSpoonacular && (
                  <Button variant="outline" asChild>
                    <a
                      href={`https://www.themealdb.com/meal/${id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on MealDB
                    </a>
                  </Button>
                )}
              </div>

              {/* Summary (Spoonacular only) */}
              {isSpoonacular && (recipe as SpoonacularRecipeDetails).summary && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-green-100 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    About This Recipe
                  </h2>
                  <div
                    className="text-gray-600 dark:text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: (recipe as SpoonacularRecipeDetails).summary
                    }}
                  />
                </div>
              )}
            </motion.div>

            {/* Ingredients */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-green-100 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-green-500" />
                Ingredients
              </h2>
              <ul className="space-y-2">
                {isSpoonacular
                  ? (recipe as SpoonacularRecipeDetails).extendedIngredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                        <span>{ingredient.original}</span>
                      </li>
                    ))
                  : getMealDbIngredients(recipe as MealDbRecipe).map((ingredient, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                        <span>{ingredient.original}</span>
                      </li>
                    ))
                }
              </ul>
            </motion.div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-green-100 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Instructions
              </h2>
              <div className="space-y-4">
                {parseInstructions(instructions).map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Nutrition Chart (Spoonacular only) */}
              {isSpoonacular && (recipe as SpoonacularRecipeDetails).nutrition && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Nutrition Facts
                    </h3>
                    <div className="flex gap-1">
                      <Button
                        variant={nutritionChartType === 'doughnut' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setNutritionChartType('doughnut')}
                      >
                        Pie
                      </Button>
                      <Button
                        variant={nutritionChartType === 'bar' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setNutritionChartType('bar')}
                      >
                        Bar
                      </Button>
                    </div>
                  </div>
                  <NutritionChart
                    nutrition={(recipe as SpoonacularRecipeDetails).nutrition}
                    type={nutritionChartType}
                  />
                </motion.div>
              )}

              {/* Recipe Info */}
              {!isSpoonacular && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-green-100 dark:border-gray-700"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recipe Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(recipe as MealDbRecipe).strCategory}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Cuisine:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(recipe as MealDbRecipe).strArea}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
