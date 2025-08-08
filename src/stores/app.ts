import { writable } from 'svelte/store';
import recipesData from '../data/recipes.json';

export interface Step {
  name: string;
  duration: number;
  completed: boolean;
  initialAgitation?: number;
  agitationInterval?: number;
  agitationDuration?: number;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  steps: Step[];
  createdAt: number;
}

// Load recipes from JSON file
const RECIPES: Recipe[] = recipesData;

export type Screen = 'timer' | 'calculator' | 'recipes';

export const currentScreen = writable<Screen>('timer');
export const recipes = writable<Recipe[]>(RECIPES);
export const selectedRecipe = writable<Recipe>(RECIPES[0]);