import { writable } from 'svelte/store';

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

// Embedded recipes data
const RECIPES: Recipe[] = [
  {
    "id": "rodinal-1-25",
    "name": "Rodinal 1:25",
    "description": "Standard Rodinal development for normal contrast",
    "createdAt": 1675000000000,
    "steps": [
      {
        "name": "Developer (Rodinal 1:25)",
        "duration": 480,
        "completed": false,
        "initialAgitation": 30,
        "agitationInterval": 30,
        "agitationDuration": 5
      },
      {
        "name": "Stop Bath",
        "duration": 60,
        "completed": false,
        "initialAgitation": 10,
        "agitationInterval": 15,
        "agitationDuration": 3
      },
      {
        "name": "Fixer",
        "duration": 300,
        "completed": false,
        "initialAgitation": 15,
        "agitationInterval": 60,
        "agitationDuration": 10
      },
      {
        "name": "Hypo Clear",
        "duration": 120,
        "completed": false,
        "initialAgitation": 10,
        "agitationInterval": 30,
        "agitationDuration": 5
      },
      {
        "name": "Final Wash",
        "duration": 600,
        "completed": false
      }
    ]
  },
  {
    "id": "rodinal-1-50",
    "name": "Rodinal 1:50",
    "description": "Rodinal development for softer contrast and finer grain",
    "createdAt": 1675000000000,
    "steps": [
      {
        "name": "Developer (Rodinal 1:50)",
        "duration": 720,
        "completed": false,
        "initialAgitation": 30,
        "agitationInterval": 60,
        "agitationDuration": 5
      },
      {
        "name": "Stop Bath",
        "duration": 60,
        "completed": false,
        "initialAgitation": 10,
        "agitationInterval": 15,
        "agitationDuration": 3
      },
      {
        "name": "Fixer",
        "duration": 300,
        "completed": false,
        "initialAgitation": 15,
        "agitationInterval": 60,
        "agitationDuration": 10
      },
      {
        "name": "Hypo Clear",
        "duration": 120,
        "completed": false,
        "initialAgitation": 10,
        "agitationInterval": 30,
        "agitationDuration": 5
      },
      {
        "name": "Final Wash",
        "duration": 600,
        "completed": false
      }
    ]
  },
  {
    "id": "d76-stock",
    "name": "D-76 Stock",
    "description": "D-76 full strength for maximum sharpness",
    "createdAt": 1675000000000,
    "steps": [
      {
        "name": "Developer (D-76 Stock)",
        "duration": 600,
        "completed": false,
        "initialAgitation": 15,
        "agitationInterval": 60,
        "agitationDuration": 5
      },
      {
        "name": "Stop Bath",
        "duration": 60,
        "completed": false,
        "initialAgitation": 10,
        "agitationInterval": 15,
        "agitationDuration": 3
      },
      {
        "name": "Fixer",
        "duration": 300,
        "completed": false,
        "initialAgitation": 15,
        "agitationInterval": 60,
        "agitationDuration": 10
      },
      {
        "name": "Hypo Clear",
        "duration": 120,
        "completed": false,
        "initialAgitation": 10,
        "agitationInterval": 30,
        "agitationDuration": 5
      },
      {
        "name": "Final Wash",
        "duration": 600,
        "completed": false
      }
    ]
  },
  {
    "id": "d76-1-1",
    "name": "D-76 1:1",
    "description": "D-76 diluted 1:1 for extended development time",
    "createdAt": 1675000000000,
    "steps": [
      {
        "name": "Developer (D-76 1:1)",
        "duration": 900,
        "completed": false,
        "initialAgitation": 15,
        "agitationInterval": 60,
        "agitationDuration": 5
      },
      {
        "name": "Stop Bath",
        "duration": 60,
        "completed": false,
        "initialAgitation": 10,
        "agitationInterval": 15,
        "agitationDuration": 3
      },
      {
        "name": "Fixer",
        "duration": 300,
        "completed": false,
        "initialAgitation": 15,
        "agitationInterval": 60,
        "agitationDuration": 10
      },
      {
        "name": "Hypo Clear",
        "duration": 120,
        "completed": false,
        "initialAgitation": 10,
        "agitationInterval": 30,
        "agitationDuration": 5
      },
      {
        "name": "Final Wash",
        "duration": 600,
        "completed": false
      }
    ]
  },
  {
    "id": "hc110-b",
    "name": "HC-110 Dilution B",
    "description": "HC-110 1:31 dilution for normal development",
    "createdAt": 1675000000000,
    "steps": [
      {
        "name": "Developer (HC-110 B)",
        "duration": 420,
        "completed": false,
        "initialAgitation": 15,
        "agitationInterval": 30,
        "agitationDuration": 5
      },
      {
        "name": "Stop Bath",
        "duration": 60,
        "completed": false,
        "initialAgitation": 10,
        "agitationInterval": 15,
        "agitationDuration": 3
      },
      {
        "name": "Fixer",
        "duration": 300,
        "completed": false,
        "initialAgitation": 15,
        "agitationInterval": 60,
        "agitationDuration": 10
      },
      {
        "name": "Hypo Clear",
        "duration": 120,
        "completed": false,
        "initialAgitation": 10,
        "agitationInterval": 30,
        "agitationDuration": 5
      },
      {
        "name": "Final Wash",
        "duration": 600,
        "completed": false
      }
    ]
  },
  {
    "id": "hc110-h",
    "name": "HC-110 Dilution H",
    "description": "HC-110 1:63 dilution for soft contrast and fine grain",
    "createdAt": 1675000000000,
    "steps": [
      {
        "name": "Developer (HC-110 H)",
        "duration": 600,
        "completed": false,
        "initialAgitation": 15,
        "agitationInterval": 60,
        "agitationDuration": 5
      },
      {
        "name": "Stop Bath",
        "duration": 60,
        "completed": false,
        "initialAgitation": 10,
        "agitationInterval": 15,
        "agitationDuration": 3
      },
      {
        "name": "Fixer",
        "duration": 300,
        "completed": false,
        "initialAgitation": 15,
        "agitationInterval": 60,
        "agitationDuration": 10
      },
      {
        "name": "Hypo Clear",
        "duration": 120,
        "completed": false,
        "initialAgitation": 10,
        "agitationInterval": 30,
        "agitationDuration": 5
      },
      {
        "name": "Final Wash",
        "duration": 600,
        "completed": false
      }
    ]
  }
];

export type Screen = 'timer' | 'calculator' | 'recipes';

export const currentScreen = writable<Screen>('timer');
export const recipes = writable<Recipe[]>(RECIPES);
export const selectedRecipe = writable<Recipe>(RECIPES[0]);