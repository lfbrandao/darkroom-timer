<script lang="ts">
  import { currentScreen } from '../stores/app';
  import { Timer, Beaker, BookOpen } from 'lucide-svelte';
</script>

<nav class="tab-bar">
  <button 
    class="tab {$currentScreen === 'timer' ? 'active' : ''}"
    on:click={() => currentScreen.set('timer')}
  >
    <Timer size={24} />
    <span>Timer</span>
  </button>
  
  <button 
    class="tab {$currentScreen === 'calculator' ? 'active' : ''}"
    on:click={() => currentScreen.set('calculator')}
  >
    <Beaker size={24} />
    <span>Calculator</span>
  </button>
  
  <button 
    class="tab {$currentScreen === 'recipes' ? 'active' : ''}"
    on:click={() => currentScreen.set('recipes')}
  >
    <BookOpen size={24} />
    <span>Recipes</span>
  </button>
</nav>

<style>
  .tab-bar {
    display: flex;
    background: var(--card);
    border-top: 1px solid var(--border);
    padding: 0.5rem 0;
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  }

  .tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    background: transparent;
    border: none;
    color: var(--muted-foreground);
    cursor: pointer;
    transition: color 0.2s;
  }

  .tab.active {
    color: var(--primary);
  }

  .tab span {
    font-size: 0.8rem;
    font-weight: 500;
  }
</style>