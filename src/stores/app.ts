import { writable } from 'svelte/store';
import recipesData from '../lib/recipes.json';

export interface Step {
  name: string;
  duration: number;
  completed: boolean;
  initialAgitation?: number;
  agitationInterval?: number;
  agitationDuration?: number;
  dilution?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  steps: Step[];
}

// Load the single recipe from JSON file
const RECIPE_DATA: Recipe = recipesData;

export type Screen = 'timer' | 'calculator' | 'recipes';

export const currentScreen = writable<Screen>('timer');
export const recipe = writable<Recipe>(RECIPE_DATA);
export const selectedRecipe = writable<Recipe>(RECIPE_DATA);