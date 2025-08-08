<script lang="ts">
  import { onMount } from 'svelte';
  import { currentScreen, selectedRecipe, recipes } from './stores/app';
  import { timer } from './stores/timer';
  import Timer from './components/Timer.svelte';
  import Calculator from './components/Calculator.svelte';
  import Recipes from './components/Recipes.svelte';
  import TabBar from './components/TabBar.svelte';

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

<main class="app">
  <div class="content">
    {#if $currentScreen === 'timer'}
      <Timer />
    {:else if $currentScreen === 'calculator'}
      <Calculator />
    {:else if $currentScreen === 'recipes'}
      <Recipes />
    {/if}
  </div>
  
  <div class="bottom-bar">
    <TabBar />
  </div>
</main>

<style>
  .app {
    height: 100vh;
    background: var(--background);
    color: var(--foreground);
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Prevent any overflow on the app container */
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0; /* Important for flex children */
  }

  .bottom-bar {
    flex-shrink: 0;
  }
</style>