<script lang="ts">
  import '../styles/app.css';
  import '../globals.css';
  import { onMount } from 'svelte';
  
  // Import the app stores
  import { selectedRecipe, recipes } from '../stores/app';
  import { timer } from '../stores/timer';

  // Load saved selected recipe on mount
  onMount(() => {
    const savedSelectedRecipeId = localStorage.getItem('darkroom-selected-recipe');
    
    if (savedSelectedRecipeId) {
      const foundRecipe = $recipes.find(r => r.id === savedSelectedRecipeId);
      if (foundRecipe) {
        selectedRecipe.set(foundRecipe);
        timer.loadRecipe(foundRecipe);
      }
    }
  });
</script>

<slot />
