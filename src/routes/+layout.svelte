<script lang="ts">
  import '../styles/app.css';
  import '../globals.css';
  import { onMount } from 'svelte';
  
  // Import the app stores
  import { recipe } from '../stores/app';
  import { timer } from '../stores/timer';

  // Load the recipe on mount
  onMount(() => {
    // Get the current value from the recipe store
    const unsubscribe = recipe.subscribe((recipeValue) => {
      timer.loadRecipe(recipeValue);
    });
    
    // Clean up subscription
    return unsubscribe;
  });
</script>

<slot />
