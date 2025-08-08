<script lang="ts">
  import { timer, currentStep, totalTime, elapsedTime, isCompleted } from '../stores/timer';
  import { selectedRecipe, recipes } from '../stores/app';
  import { Play, Pause, RotateCcw, SkipBack, SkipForward, ChevronDown } from 'lucide-svelte';
  import CircularTimer from './CircularTimer.svelte';
  import StepsList from './StepsList.svelte';

  $: canSkipForward = $timer.currentStepIndex < $timer.steps.length - 1 && !$isCompleted;
  $: canSkipBackward = $timer.currentStepIndex > 0;

  const handleRecipeSelect = (event: Event) => {
    if ($timer.isRunning) return;
    
    const target = event.target as HTMLSelectElement;
    const recipe = $recipes.find(r => r.id === target.value);
    if (recipe) {
      selectedRecipe.set(recipe);
      timer.loadRecipe(recipe);
      localStorage.setItem('darkroom-selected-recipe', recipe.id);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAgitationInfo = (): string => {
    if (!$currentStep || (!$currentStep.initialAgitation && !$currentStep.agitationInterval)) {
      return 'No agitation needed';
    }
    
    if ($timer.showAgitation) {
      return `Agitating for ${$timer.agitationTimeRemaining}s`;
    }
    
    const elapsed = $elapsedTime;
    
    if ($currentStep.initialAgitation && elapsed === 0) {
      return `Initial agitation: ${$currentStep.initialAgitation}s`;
    }
    
    if ($currentStep.agitationInterval && $currentStep.agitationDuration && $currentStep.initialAgitation) {
      const firstIntervalStart = $currentStep.initialAgitation + $currentStep.agitationInterval;
      
      if (elapsed < $currentStep.initialAgitation) {
        return `Initial agitation in progress`;
      } else if (elapsed < firstIntervalStart) {
        const timeToFirstInterval = firstIntervalStart - elapsed;
        return `Next agitation in ${timeToFirstInterval}s`;
      } else {
        const timeFromFirstInterval = elapsed - firstIntervalStart;
        const intervalPosition = timeFromFirstInterval % $currentStep.agitationInterval;
        
        if (intervalPosition < $currentStep.agitationDuration) {
          return `Agitating for ${$timer.agitationTimeRemaining}s`;
        } else {
          const timeToNextAgitation = $currentStep.agitationInterval - intervalPosition;
          return `Next agitation in ${timeToNextAgitation}s`;
        }
      }
    }
    
    return '';
  };
</script>

<div class="timer-screen">
  <!-- Header with Recipe Name Only -->
  <header class="timer-header">
    <h1 class="recipe-title">{$selectedRecipe.name}</h1>
  </header>

  <!-- Timer Display -->
  <div class="timer-section">
    <CircularTimer 
      totalTime={$totalTime}
      currentTime={$timer.timeRemaining}
      showAgitation={$timer.showAgitation}
    />

    <!-- Controls -->
    <div class="controls">
      <button 
        class="control-btn secondary"
        disabled={!canSkipBackward}
        on:click={() => timer.skipToPrevious()}
      >
        <SkipBack size={20} />
      </button>

      <button 
        class="play-btn {$timer.showAgitation ? 'agitating' : ''}"
        disabled={$isCompleted}
        on:click={() => $timer.isRunning ? timer.pause() : timer.start()}
      >
        {#if $timer.isRunning}
          <Pause size={24} />
        {:else}
          <Play size={24} />
        {/if}
      </button>

      <button 
        class="control-btn secondary"
        disabled={!canSkipForward}
        on:click={() => timer.skipToNext()}
      >
        <SkipForward size={20} />
      </button>

      <button 
        class="control-btn reset"
        on:click={() => timer.reset()}
      >
        <RotateCcw size={20} />
      </button>
    </div>

    <!-- Agitation Info -->
    {#if $timer.isRunning && $currentStep}
      <div class="agitation-info">
        {getAgitationInfo()}
      </div>
    {/if}

    <!-- Recipe Selector -->
    <div class="recipe-selector">
      <label for="recipe-select" class="recipe-label">Change Recipe</label>
      <div class="select-wrapper">
        <select 
          id="recipe-select"
          class="recipe-select" 
          value={$selectedRecipe.id} 
          on:change={handleRecipeSelect}
          disabled={$timer.isRunning}
        >
          {#each $recipes as recipe}
            <option value={recipe.id}>{recipe.name}</option>
          {/each}
        </select>
        <ChevronDown class="select-icon" size={16} />
      </div>
    </div>
  </div>

  <!-- Steps -->
  <div class="steps-section">
    {#if $isCompleted}
      <div class="completion">
        <div class="completion-icon">✅</div>
        <h2>Development Complete!</h2>
        <p>All development steps have been completed successfully.</p>
        <button class="btn primary" on:click={() => timer.reset()}>
          Start New Development
        </button>
      </div>
    {:else}
      <StepsList steps={$timer.steps} currentStepIndex={$timer.currentStepIndex} />
    {/if}
  </div>
</div>

<style>
  .timer-screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .timer-header {
    padding: 1rem;
    background: var(--background);
    border-bottom: 1px solid var(--border);
    text-align: center;
  }

  .recipe-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--foreground);
  }

  .timer-section {
    padding: 2rem 1rem;
    background: var(--background);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    flex-shrink: 0; /* Prevent this section from shrinking */
  }

  .recipe-selector {
    margin-top: 24px;
    padding: 16px;
    background: var(--card-bg);
    border-radius: 12px;
    border: 1px solid var(--border);
  }

  .recipe-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .recipe-select {
    flex: 1;
    padding: 12px 40px 12px 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text-primary);
    font-size: 16px;
    appearance: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .recipe-select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .recipe-select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-alpha);
  }

  :global(.select-icon) {
    position: absolute;
    right: 12px;
    color: var(--text-secondary);
    pointer-events: none;
    transition: transform 0.2s ease;
  }

  .select-wrapper:focus-within :global(.select-icon) {
    transform: rotate(180deg);
  }  .controls {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    position: relative;
  }

  .control-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .control-btn:hover:not(:disabled) {
    background: var(--primary);
    color: white;
  }

  .control-btn:disabled {
    color: var(--muted-foreground);
    cursor: not-allowed;
  }

  .control-btn.reset {
    position: absolute;
    right: -80px;
  }

  .play-btn {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: none;
    background: var(--primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
  }

  .play-btn:hover:not(:disabled) {
    transform: scale(1.05);
  }

  .play-btn:disabled {
    background: var(--muted);
    color: var(--muted-foreground);
    box-shadow: none;
  }

  .play-btn.agitating {
    animation: pulse 1s infinite;
    background: var(--destructive);
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  .agitation-info {
    padding: 1rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    text-align: center;
    color: var(--muted-foreground);
    font-size: 0.9rem;
    max-width: 300px;
  }

  .steps-section {
    flex: 1;
    background: var(--secondary);
    overflow-y: auto;
    min-height: 0; /* Allow flex child to shrink */
  }

  .completion {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
    min-height: 300px;
  }

  .completion-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .completion h2 {
    margin-bottom: 1rem;
  }

  .completion p {
    color: var(--muted-foreground);
    margin-bottom: 2rem;
    max-width: 300px;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn.primary {
    background: var(--primary);
    color: white;
  }

  .btn.primary:hover {
    transform: scale(1.02);
  }
</style>