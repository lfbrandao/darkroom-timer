<svelte:options runes={true} />
<script lang="ts">
  import type { Step } from '../stores/app';
  import { Check } from 'lucide-svelte';

  const { steps, currentStepIndex, totalSolution = 500, onStepSelect } = $props<{
    steps: Step[];
    currentStepIndex: number;
    totalSolution?: number;
    onStepSelect: (stepIndex: number) => void;
  }>();

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function calculateChemicalAmounts(dilution: string, total: number): { chemical: number; water: number } {
    // Parse dilution ratio like "1:25" or "1:4"
    const parts = dilution.split(':');
    const chemicalParts = parseInt(parts[0]) || 1;
    const waterParts = parseInt(parts[1]) || 1;
    
    const totalParts = chemicalParts + waterParts;
    const chemicalAmount = (total * chemicalParts) / totalParts;
    const waterAmount = total - chemicalAmount;
    
    // Round to nearest 5ml
    const chemical = Math.round(chemicalAmount / 5) * 5;
    const water = total - chemical;
    
    return { chemical, water };
  }

  function getChemicalName(stepName: string): string {
    const name = stepName.toLowerCase();
    if (name.includes('developer')) return 'developer';
    if (name.includes('stop')) return 'stop bath';
    if (name.includes('fix')) return 'fixer';
    if (name.includes('wash')) return 'water';
    return 'chemical';
  }
</script>

<div class="steps-list">
  <div class="steps-header">
    <h3>Development Steps</h3>
  </div>
  
  <div class="steps">
    {#each steps as step, index}
      <div 
        class="step {index === currentStepIndex ? 'current' : ''} {step.completed ? 'completed' : ''}"
        onclick={() => onStepSelect(index)}
        onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? onStepSelect(index) : null}
        role="button"
        tabindex="0"
      >
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
          
          {#if step.dilution}
            {@const amounts = calculateChemicalAmounts(step.dilution, totalSolution)}
            {@const chemicalName = getChemicalName(step.name)}
            <div class="dilution-info">
              Dilution: {step.dilution} ({amounts.chemical}ml {chemicalName}, {amounts.water}ml water)
            </div>
          {/if}
          
          {#if step.initialAgitation || (step.agitationInterval && step.agitationDuration) || (step.agitationDuration && !step.initialAgitation && !step.agitationInterval)}
            <div class="agitation-info">
              {#if step.initialAgitation}
                Initial: {step.initialAgitation}s
              {/if}
              {#if step.agitationInterval && step.agitationDuration}
                • Every {step.agitationInterval}s for {step.agitationDuration}s
              {/if}
              {#if step.agitationDuration && !step.initialAgitation && !step.agitationInterval}
                • Continuous agitation
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
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    transition: all 0.2s;
    cursor: pointer;
    user-select: none;
  }

  .step:hover:not(.current) {
    background: var(--background);
    border-color: var(--primary);
    transform: translateY(-1px);
  }

  .step:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .step.current {
    border-color: var(--primary);
    background: var(--primary);
    color: white;
  }

  .step.current .step-time,
  .step.current .agitation-info,
  .step.current .dilution-info {
    color: rgba(255, 255, 255, 0.9);
  }

  .step.completed {
    opacity: 0.6;
  }

  .step-indicator {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--muted);
    color: var(--muted-foreground);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 600;
    flex-shrink: 0;
    margin-top: 0.1rem;
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
    margin-bottom: 0.1rem;
    font-size: 0.9rem;
  }

  .step-time {
    font-size: 0.8rem;
    color: var(--muted-foreground);
    margin-bottom: 0.2rem;
  }

  .dilution-info {
    font-size: 0.75rem;
    color: var(--muted-foreground);
    font-weight: 400;
    margin-bottom: 0.2rem;
    line-height: 1.3;
  }

  .agitation-info {
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
</style>