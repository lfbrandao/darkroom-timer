<script lang="ts">
  import { recipes, selectedRecipe, currentScreen } from '../stores/app';
  import { timer } from '../stores/timer';
  import type { Recipe } from '../stores/app';
  import { BookOpen } from 'lucide-svelte';

  function selectRecipe(recipe: Recipe) {
    selectedRecipe.set(recipe);
    timer.loadRecipe(recipe);
    localStorage.setItem('darkroom-selected-recipe', recipe.id);
    currentScreen.set('timer');
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function getTotalTime(steps: any[]): string {
    const total = steps.reduce((sum, step) => sum + step.duration, 0);
    return formatTime(total);
  }
</script>

<div class="recipes-screen">
  <header class="header">
    <h1>Development Recipes</h1>
  </header>

  <div class="content">
    <div class="intro">
      <BookOpen size={40} color="var(--primary)" />
      <h2>Choose Your Recipe</h2>
      <p>Select from professional film development workflows</p>
    </div>

    <div class="recipes-list">
      {#each $recipes as recipe}
        <button 
          class="recipe-card" 
          class:selected={$selectedRecipe.id === recipe.id}
          on:click={() => selectRecipe(recipe)}
        >
          <div class="recipe-content">
            <div class="recipe-header">
              <span class="recipe-name">{recipe.name}</span>
              <span class="recipe-time">{getTotalTime(recipe.steps)}</span>
            </div>
            {#if recipe.description}
              <div class="recipe-description">
                {recipe.description}
              </div>
            {/if}
            <div class="recipe-details">
              <span>{recipe.steps.length} steps</span>
              <span>•</span>
              <span>{recipe.steps[0]?.name || 'No steps'}</span>
            </div>
          </div>
        </button>
      {/each}
    </div>

    <div class="recipe-count">
      {$recipes.length} recipes available
    </div>
  </div>
</div>

<style>
  .recipes-screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .header {
    padding: 1rem;
    background: var(--background);
    border-bottom: 1px solid var(--border);
    text-align: center;
  }

  .header h1 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .content {
    flex: 1;
    padding: 1.5rem 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .intro {
    text-align: center;
  }

  .intro h2 {
    margin: 0.75rem 0 0.25rem;
    font-size: 1.25rem;
  }

  .intro p {
    color: var(--muted-foreground);
    margin: 0;
    font-size: 0.9rem;
  }

  .recipes-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .recipe-card {
    width: 100%;
    padding: 1.25rem;
    background: var(--card);
    border: 2px solid var(--border);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .recipe-card:hover {
    border-color: var(--primary);
    transform: translateY(-1px);
  }

  .recipe-card.selected {
    border-color: var(--primary);
    background: var(--primary);
    color: var(--primary-foreground);
  }

  .recipe-card.selected .recipe-name,
  .recipe-card.selected .recipe-time,
  .recipe-card.selected .recipe-description,
  .recipe-card.selected .recipe-details {
    color: var(--primary-foreground);
  }

  .recipe-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .recipe-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .recipe-name {
    font-weight: 600;
    color: var(--foreground);
    font-size: 1rem;
  }

  .recipe-time {
    font-weight: 700;
    color: var(--primary);
    font-size: 1rem;
  }

  .recipe-description {
    font-size: 0.85rem;
    color: var(--muted-foreground);
    line-height: 1.3;
  }

  .recipe-details {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--muted-foreground);
  }

  .recipe-count {
    text-align: center;
    font-size: 0.8rem;
    color: var(--muted-foreground);
    padding: 1rem;
    border-top: 1px solid var(--border);
  }
</style>