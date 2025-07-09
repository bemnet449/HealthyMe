
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import RecipeCard from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { spoonacularApi, SpoonacularRecipe } from '@/services/spoonacularApi';
import { mealDbApi, MealDbRecipe } from '@/services/mealDbApi';
import { useToast } from '@/hooks/use-toast';

const Home = () => {
  const [recipes, setRecipes] = useState<(SpoonacularRecipe | MealDbRecipe)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (ingredients: string[]) => {
    setIsLoading(true);
    setSearchPerformed(true);
    
    try {
      console.log('Searching for recipes with ingredients:', ingredients);
      
      // Search using Spoonacular API
      const spoonacularRecipes = await spoonacularApi.searchByIngredients(ingredients);
      console.log('Spoonacular recipes found:', spoonacularRecipes.length);
      
      // Also search MealDB for additional recipes using the first ingredient
      let mealDbRecipes: MealDbRecipe[] = [];
      if (ingredients.length > 0) {
        mealDbRecipes = await mealDbApi.searchByIngredient(ingredients[0]);
        console.log('MealDB recipes found:', mealDbRecipes.length);
      }
      
      // Combine and limit results
      const allRecipes = [
        ...spoonacularRecipes.slice(0, 8),
        ...mealDbRecipes.slice(0, 4)
      ];
      
      setRecipes(allRecipes);
      
      if (allRecipes.length === 0) {
        toast({
          title: "No recipes found",
          description: "Try different ingredients or check your spelling.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Recipes found!",
          description: `Found ${allRecipes.length} delicious recipes for you.`,
        });
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
      toast({
        title: "Search failed",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSurpriseMe = async () => {
    setIsLoading(true);
    
    try {
      // Get random recipes from both APIs
      const [spoonacularRandom, mealDbRandom] = await Promise.all([
        spoonacularApi.getRandomRecipe().catch(() => null),
        mealDbApi.getRandomRecipe().catch(() => null),
      ]);
      
      const randomRecipes = [
        ...(spoonacularRandom ? [spoonacularRandom] : []),
        ...(mealDbRandom ? [mealDbRandom] : []),
      ];
      
      if (randomRecipes.length > 0) {
        setRecipes(randomRecipes);
        setSearchPerformed(true);
        toast({
          title: "Surprise recipe!",
          description: "Here's something delicious to try.",
        });
      } else {
        toast({
          title: "Surprise failed",
          description: "Unable to fetch random recipes. Try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching random recipe:', error);
      toast({
        title: "Surprise failed",
        description: "Unable to fetch random recipes. Try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 via-orange-500 to-green-600 bg-clip-text text-transparent">
                Find Healthy Recipes
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                with Your Ingredients
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Transform your available ingredients into delicious, nutritious meals. 
              Get detailed nutrition facts and save your favorite recipes.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </motion.div>

          {/* Surprise Me Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button
              onClick={handleSurpriseMe}
              disabled={isLoading}
              variant="outline"
              className="border-2 border-orange-400 text-orange-600 hover:bg-orange-50 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-900/20 px-6 py-3 rounded-xl font-medium transition-all duration-200"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Surprise Me!
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      {searchPerformed && (
        <section className="pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 dark:text-gray-400">Finding delicious recipes...</p>
              </div>
            ) : recipes.length > 0 ? (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Recipe Results
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} for you
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {recipes.map((recipe, index) => {
                    const isSpoonacular = 'title' in recipe;
                    const source = isSpoonacular ? 'spoonacular' : 'mealdb';
                    
                    return (
                      <motion.div
                        key={`${source}-${isSpoonacular ? recipe.id : (recipe as MealDbRecipe).idMeal}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <RecipeCard
                          recipe={recipe}
                          source={source}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  🔍
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No recipes found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try different ingredients or check your spelling
                </p>
                <Button
                  onClick={handleSurpriseMe}
                  className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Random Recipe
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section (shown when no search performed) */}
      {!searchPerformed && (
        <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose HealthyMe?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Discover the easiest way to find recipes and track nutrition with ingredients you already have
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Smart Ingredient Search
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Find recipes using ingredients you have at home. Our AI suggests corrections for misspellings.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Detailed Nutrition
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get comprehensive nutrition facts with beautiful charts showing calories, carbs, protein, and fats.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Save Favorites
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Keep track of your favorite recipes and access them anytime, even offline.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
