<svelte:options runes={true} />
<script lang="ts">
  import { timer, totalTime, isCompleted } from '../stores/timer';
  import { Play, Pause } from 'lucide-svelte';
  import CircularTimer from './CircularTimer.svelte';
  import StepsList from './StepsList.svelte';
  import { mirrorStore, mirrorStores } from '$lib/runes';

  // Local mirror of timer store for runes mode
  let t = $state({
    steps: [] as any[],
    currentStepIndex: 0,
    timeRemaining: 0,
    isRunning: false,
    showAgitation: false
  });
  let totalTimeVal = $state(0);
  let isCompletedVal = $state(false);

  // keep local state in sync with stores
  $effect(() => {
    const unsubs = [
      mirrorStore(timer, (val) => {
        t.steps = val.steps;
        t.currentStepIndex = val.currentStepIndex;
        t.timeRemaining = val.timeRemaining;
        t.isRunning = val.isRunning;
        t.showAgitation = val.showAgitation;
      }),
      mirrorStore(totalTime, (v) => { totalTimeVal = v; }),
      mirrorStore(isCompleted, (v) => { isCompletedVal = v; })
    ];
    return mirrorStores(unsubs);
  });

  let developerTime = $state(480); // 8 minutes in seconds
  let totalSolution = $state(500); // 500ml

  const updateDeveloperTime = () => {
    if (t.isRunning) return;
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

  const handleStepSelect = (stepIndex: number) => {
    if (t.isRunning) return; // Don't allow step changes while running
    timer.jumpToStep(stepIndex);
  };
</script>

<div class="timer-screen">
  <!-- Timer Display -->
  <div class="timer-section">
    <CircularTimer 
      totalTime={totalTimeVal}
      currentTime={t.timeRemaining}
      showAgitation={t.showAgitation}
      isRunning={t.isRunning}
    />

    <!-- Controls -->
    <div class="controls">
      <button 
        class="control-btn cancel"
        onclick={() => timer.reset()}
      >
        Cancel
      </button>

      <button 
        class="play-btn"
        disabled={isCompletedVal}
        onclick={() => t.isRunning ? timer.pause() : timer.start()}
      >
        {#if t.isRunning}
          Pause
        {:else}
          Start
        {/if}
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
          onchange={handleTimeChange}
          disabled={t.isRunning}
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
            disabled={t.isRunning}
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
    {#if isCompletedVal}
      <div class="completion">
        <div class="completion-icon">✅</div>
        <h2>Development Complete!</h2>
        <p>All development steps have been completed successfully.</p>
        <button class="btn primary" onclick={() => timer.reset()}>
          Start New Development
        </button>
      </div>
    {:else}
      <StepsList 
        steps={t.steps} 
        currentStepIndex={t.currentStepIndex} 
        {totalSolution}
        onStepSelect={handleStepSelect}
      />
    {/if}
  </div>
</div>

<style>
  .timer-screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    overflow: visible;
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
    justify-content: space-between;
    width: 100%;
    max-width: 400px;
    position: relative;
  }

  .control-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 24px;
    border: none;
    background: transparent;
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .control-btn:hover:not(:disabled) {
    background: var(--primary);
    color: white;
  }

  .control-btn:disabled {
    color: var(--muted-foreground);
    cursor: not-allowed;
  }

  .control-btn.cancel {
    color: var(--muted-foreground);
  }

  .control-btn.cancel:hover:not(:disabled) {
    background: var(--muted);
    color: var(--foreground);
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

  .user-controls {
    display: flex;
    gap: 1.5rem;
    align-items: flex-end;
    flex-wrap: wrap; /* allow wrapping on narrow widths */
    padding: 1.5rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    max-width: 640px; /* give enough room for two controls side-by-side */
    width: 100%;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1 1 260px; /* grow, shrink, base width */
    min-width: 200px; /* prevent overly small inputs */
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
    flex: 1 1 auto;
    min-width: 0; /* allow shrinking in flex container */
  }

  .unit {
    font-size: 0.9rem;
    color: var(--muted-foreground);
    font-weight: 500;
    white-space: nowrap;
  }

  .steps-section {
    background: var(--secondary);
    overflow: visible;
    min-height: 0;
  }

  /* Mobile: keep both controls side-by-side, reduce spacing */
  @media (max-width: 480px) {
    .user-controls {
      gap: 0.75rem;
      padding: 1rem;
    }

    .control-group {
      flex: 1 1 48%;
      min-width: 0; /* allow two-up on very small screens */
    }

    .control-group label {
      font-size: 0.8rem;
    }

    .control-group input {
      padding: 0.6rem;
      font-size: 0.95rem;
    }

    .solution-input {
      gap: 0.25rem;
    }
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