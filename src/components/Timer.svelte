<script lang="ts">
  import { timer, currentStep, totalTime, elapsedTime, isCompleted } from '../stores/timer';
  import { recipe } from '../stores/app';
  import { Play, Pause, RotateCcw, SkipBack, SkipForward } from 'lucide-svelte';
  import CircularTimer from './CircularTimer.svelte';
  import StepsList from './StepsList.svelte';
  import { onMount } from 'svelte';

  let developerTime = 480; // 8 minutes in seconds
  let totalSolution = 500; // 500ml

  $: canSkipForward = $timer.currentStepIndex < $timer.steps.length - 1 && !$isCompleted;
  $: canSkipBackward = $timer.currentStepIndex > 0;

  onMount(() => {
    // Load the single recipe and apply initial developer time
    timer.loadRecipe($recipe);
    updateDeveloperTime();
  });

  const updateDeveloperTime = () => {
    if ($timer.isRunning) return;
    
    // Update the first step (developer) duration
    timer.updateStepDuration(0, developerTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeInput = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const parseTimeInput = (timeStr: string): number => {
    const parts = timeStr.split(':');
    const mins = parseInt(parts[0]) || 0;
    const secs = parseInt(parts[1]) || 0;
    return mins * 60 + secs;
  };

  const handleTimeChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    developerTime = parseTimeInput(target.value);
    updateDeveloperTime();
  };
</script>

<div class="timer-screen">
  <!-- Timer Display -->
  <div class="timer-section">
    <CircularTimer 
      totalTime={$totalTime}
      currentTime={$timer.timeRemaining}
      showAgitation={$timer.showAgitation}
      isRunning={$timer.isRunning}
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

    <!-- User Controls -->
    <div class="user-controls">
      <div class="control-group">
        <label for="developer-time">Developer Time</label>
        <input 
          id="developer-time"
          type="text"
          value={formatTimeInput(developerTime)}
          on:change={handleTimeChange}
          disabled={$timer.isRunning}
          pattern="[0-9]+:[0-5][0-9]"
          placeholder="8:00"
        />
      </div>
      
      <div class="control-group">
        <label for="total-solution">Total Solution</label>
        <div class="solution-input">
          <input 
            id="total-solution"
            type="number"
            bind:value={totalSolution}
            disabled={$timer.isRunning}
            min="100"
            max="2000"
            step="50"
          />
          <span class="unit">ml</span>
        </div>
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
      <StepsList steps={$timer.steps} currentStepIndex={$timer.currentStepIndex} {totalSolution} />
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

  .timer-section {
    padding: 2rem 1rem;
    background: var(--background);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    flex-shrink: 0; /* Prevent this section from shrinking */
  }

  .controls {
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

  .user-controls {
    display: flex;
    gap: 1.5rem;
    align-items: flex-end;
    padding: 1.5rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    max-width: 400px;
    width: 100%;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .control-group label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--muted-foreground);
  }

  .control-group input {
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--background);
    color: var(--foreground);
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .control-group input:focus {
    outline: none;
    border-color: var(--primary);
  }

  .control-group input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .solution-input {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .solution-input input {
    flex: 1;
  }

  .unit {
    font-size: 0.9rem;
    color: var(--muted-foreground);
    font-weight: 500;
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