
import axios from 'axios';

const DATAMUSE_BASE_URL = 'https://api.datamuse.com';

export interface SpellingSuggestion {
  word: string;
  score: number;
}

export const datamuseApi = {
  // Get spelling suggestions
  getSpellingSuggestions: async (word: string): Promise<string[]> => {
    try {
      const response = await axios.get(`${DATAMUSE_BASE_URL}/sug`, {
        params: {
          s: word,
        },
      });
      return response.data.map((item: SpellingSuggestion) => item.word).slice(0, 5);
    } catch (error) {
      console.error('Error getting spelling suggestions:', error);
      return [];
    }
  },
};
