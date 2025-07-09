
import axios from 'axios';

const MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export interface MealDbRecipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  [key: string]: string;
}

export const mealDbApi = {
  // Search recipes by ingredient
  searchByIngredient: async (ingredient: string): Promise<MealDbRecipe[]> => {
    try {
      const response = await axios.get(`${MEALDB_BASE_URL}/filter.php`, {
        params: {
          i: ingredient,
        },
      });
      return response.data.meals || [];
    } catch (error) {
      console.error('Error searching recipes by ingredient:', error);
      return [];
    }
  },

  // Get random recipe
  getRandomRecipe: async (): Promise<MealDbRecipe> => {
    try {
      const response = await axios.get(`${MEALDB_BASE_URL}/random.php`);
      return response.data.meals[0];
    } catch (error) {
      console.error('Error fetching random recipe:', error);
      throw error;
    }
  },

  // Get recipe details by ID
  getRecipeById: async (id: string): Promise<MealDbRecipe> => {
    try {
      const response = await axios.get(`${MEALDB_BASE_URL}/lookup.php`, {
        params: {
          i: id,
        },
      });
      return response.data.meals[0];
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      throw error;
    }
  },
};
