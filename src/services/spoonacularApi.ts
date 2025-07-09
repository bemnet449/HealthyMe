
import axios from 'axios';

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY; // Replace with actual API key

export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  usedIngredients: Array<{
    id: number;
    name: string;
    image: string;
  }>;
  missedIngredients: Array<{
    id: number;
    name: string;
    image: string;
  }>;
}

export interface RecipeDetails {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  instructions: string;
  extendedIngredients: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
  }>;
  nutrition: {
    calories: number;
    carbs: string;
    fat: string;
    protein: string;
  };
}

export interface IngredientSuggestion {
  name: string;
  image: string;
}

export const spoonacularApi = {
  // Search recipes by ingredients
  searchByIngredients: async (ingredients: string[]): Promise<SpoonacularRecipe[]> => {
    try {
      const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/findByIngredients`, {
        params: {
          apiKey: API_KEY,
          ingredients: ingredients.join(','),
          number: 12,
          ranking: 2,
          ignorePantry: true,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching recipes by ingredients:', error);
      throw error;
    }
  },

  // Get recipe details
  getRecipeDetails: async (id: number): Promise<RecipeDetails> => {
    try {
      const [detailsResponse, nutritionResponse] = await Promise.all([
        axios.get(`${SPOONACULAR_BASE_URL}/recipes/${id}/information`, {
          params: {
            apiKey: API_KEY,
            includeNutrition: false,
          },
        }),
        axios.get(`${SPOONACULAR_BASE_URL}/recipes/${id}/nutritionWidget.json`, {
          params: {
            apiKey: API_KEY,
          },
        }),
      ]);

      return {
        ...detailsResponse.data,
        nutrition: nutritionResponse.data,
      };
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      throw error;
    }
  },

  // Get ingredient autocomplete suggestions
  autocompleteIngredients: async (query: string): Promise<IngredientSuggestion[]> => {
    try {
      const response = await axios.get(`${SPOONACULAR_BASE_URL}/food/ingredients/autocomplete`, {
        params: {
          apiKey: API_KEY,
          query,
          number: 8,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting ingredient suggestions:', error);
      return [];
    }
  },

  // Get random recipe
  getRandomRecipe: async (): Promise<RecipeDetails> => {
    try {
      const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/random`, {
        params: {
          apiKey: API_KEY,
          number: 1,
          includeNutrition: true,
        },
      });
      return response.data.recipes[0];
    } catch (error) {
      console.error('Error fetching random recipe:', error);
      throw error;
    }
  },
};
