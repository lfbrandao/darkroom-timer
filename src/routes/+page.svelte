<script lang="ts">
  import { currentScreen } from '../stores/app';
  import Timer from '../components/Timer.svelte';
  import Calculator from '../components/Calculator.svelte';
  import Recipes from '../components/Recipes.svelte';
  import TabBar from '../components/TabBar.svelte';
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
