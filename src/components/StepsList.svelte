<script lang="ts">
  import type { Step } from '../stores/app';
  import { Check } from 'lucide-svelte';

  export let steps: Step[];
  export let currentStepIndex: number;

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<div class="steps-list">
  <div class="steps-header">
    <h3>Development Steps</h3>
  </div>
  
  <div class="steps">
    {#each steps as step, index}
      <div class="step {index === currentStepIndex ? 'current' : ''} {step.completed ? 'completed' : ''}">
        <div class="step-indicator">
          {#if step.completed}
            <Check size={16} />
          {:else}
            <span class="step-number">{index + 1}</span>
          {/if}
        </div>
        
        <div class="step-content">
          <div class="step-name">{step.name}</div>
          <div class="step-time">{formatTime(step.duration)}</div>
          
          {#if step.initialAgitation || step.agitationInterval}
            <div class="agitation-info">
              {#if step.initialAgitation}
                Initial: {step.initialAgitation}s
              {/if}
              {#if step.agitationInterval && step.agitationDuration}
                • Every {step.agitationInterval}s for {step.agitationDuration}s
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .steps-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .steps-header {
    padding: 1rem;
    background: var(--background);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .steps-header h3 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .steps {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
    flex: 1;
  }

  .step {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    transition: all 0.2s;
  }

  .step.current {
    border-color: var(--primary);
    background: var(--primary);
    color: white;
  }

  .step.current .step-time,
  .step.current .agitation-info {
    color: rgba(255, 255, 255, 0.8);
  }

  .step.completed {
    opacity: 0.6;
  }

  .step-indicator {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--muted);
    color: var(--muted-foreground);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  .step.current .step-indicator {
    background: white;
    color: var(--primary);
  }

  .step.completed .step-indicator {
    background: var(--primary);
    color: white;
  }

  .step-content {
    flex: 1;
  }

  .step-name {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .step-time {
    font-size: 0.9rem;
    color: var(--muted-foreground);
    margin-bottom: 0.25rem;
  }

  .agitation-info {
    font-size: 0.8rem;
    color: var(--muted-foreground);
  }
</style>