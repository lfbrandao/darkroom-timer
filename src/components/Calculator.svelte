<script lang="ts">
  import { Beaker } from 'lucide-svelte';

  let dilutionRatio = '';
  let totalVolume = '500';
  let amounts = { chemical: 0, water: 0 };
  let showResults = false;
  let errorMessage = '';

  function parseDilution(ratio: string) {
    // Clean up the input and handle various formats
    const cleaned = ratio.trim().replace(/\s+/g, '');
    
    // Match patterns like "1:25", "1-25", "1+25", "1 25"
    const match = cleaned.match(/^(\d+)[:+\-\s](\d+)$/);
    if (match) {
      return {
        chemical: parseInt(match[1]),
        water: parseInt(match[2])
      };
    }
    return null;
  }

  function calculateAmounts() {
    errorMessage = '';
    showResults = false;

    const volume = parseInt(totalVolume) || 0;
    if (volume <= 0) {
      errorMessage = 'Please enter a valid volume';
      return;
    }

    const ratio = parseDilution(dilutionRatio);
    if (!ratio) {
      errorMessage = 'Please enter a valid ratio (e.g., 1:25)';
      return;
    }

    const totalParts = ratio.chemical + ratio.water;
    const chemicalAmount = (ratio.chemical / totalParts) * volume;
    const waterAmount = (ratio.water / totalParts) * volume;

    amounts = {
      chemical: Math.round(chemicalAmount),
      water: Math.round(waterAmount)
    };

    showResults = true;
  }

  function formatRatio() {
    const ratio = parseDilution(dilutionRatio);
    if (ratio) {
      return `${ratio.chemical}:${ratio.water}`;
    }
    return dilutionRatio;
  }
</script>

<div class="calculator-screen">
  <header class="header">
    <h1>Dilution Calculator</h1>
  </header>

  <div class="content">
    <div class="intro">
      <Beaker size={40} color="var(--primary)" />
      <h2>Chemical Dilution</h2>
      <p>Calculate how much chemical you need</p>
    </div>

    <div class="form">
      <div class="field">
        <label for="dilution">Dilution Ratio</label>
        <input 
          id="dilution"
          type="text" 
          bind:value={dilutionRatio} 
          placeholder="1:25"
          class="large-input"
        />
        <div class="field-hint">Enter ratio like 1:25, 1+50, or 1-31</div>
      </div>

      <div class="field">
        <label for="volume">Total Volume (ml)</label>
        <input 
          id="volume"
          type="number" 
          bind:value={totalVolume} 
          placeholder="500"
          class="large-input"
        />
      </div>

      <button class="calculate-btn" on:click={calculateAmounts}>
        Calculate Solution
      </button>

      {#if errorMessage}
        <div class="error">
          {errorMessage}
        </div>
      {/if}
    </div>

    {#if showResults}
      <div class="results">
        <h3>Solution Recipe ({formatRatio()})</h3>
        <div class="recipe">
          <div class="ingredient chemical">
            <span class="name">Chemical</span>
            <span class="amount">{amounts.chemical} ml</span>
          </div>
          <div class="ingredient water">
            <span class="name">Water</span>
            <span class="amount">{amounts.water} ml</span>
          </div>
        </div>
        <div class="total-check">
          Total: {totalVolume} ml
        </div>
        <div class="note">
          Add chemical to water, mix gently
        </div>
      </div>
    {/if}

    <div class="quick-ratios">
      <h3>Quick Ratios</h3>
      <div class="ratio-buttons">
        <button class="ratio-btn" on:click={() => dilutionRatio = '1:25'}>1:25</button>
        <button class="ratio-btn" on:click={() => dilutionRatio = '1:50'}>1:50</button>
        <button class="ratio-btn" on:click={() => dilutionRatio = '1:31'}>1:31</button>
        <button class="ratio-btn" on:click={() => dilutionRatio = '1:1'}>1:1</button>
      </div>
    </div>
  </div>
</div>

<style>
  .calculator-screen {
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

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field label {
    font-weight: 600;
    color: var(--foreground);
    font-size: 1rem;
  }

  .large-input {
    padding: 1rem;
    background: var(--background);
    border: 2px solid var(--border);
    border-radius: 12px;
    color: var(--foreground);
    font-size: 1.1rem;
    text-align: center;
    transition: border-color 0.2s ease;
  }

  .large-input:focus {
    outline: none;
    border-color: var(--primary);
  }

  .field-hint {
    font-size: 0.8rem;
    color: var(--muted-foreground);
    text-align: center;
    margin-top: -0.25rem;
  }

  .calculate-btn {
    padding: 1.25rem;
    background: var(--primary);
    color: var(--primary-foreground);
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 0.5rem;
  }

  .calculate-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .calculate-btn:active {
    transform: translateY(0);
  }

  .error {
    background: var(--destructive);
    color: var(--destructive-foreground);
    padding: 0.75rem;
    border-radius: 8px;
    text-align: center;
    font-size: 0.9rem;
  }

  .results {
    background: var(--card);
    border: 2px solid var(--primary);
    border-radius: 12px;
    padding: 1.25rem;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .results h3 {
    margin: 0 0 1rem;
    color: var(--primary);
    text-align: center;
    font-size: 1.1rem;
  }

  .recipe {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .ingredient {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-radius: 8px;
  }

  .ingredient.chemical {
    background: var(--primary);
    color: var(--primary-foreground);
  }

  .ingredient.water {
    background: var(--secondary);
    color: var(--foreground);
  }

  .ingredient .name {
    font-weight: 600;
    font-size: 1rem;
  }

  .ingredient .amount {
    font-weight: 700;
    font-size: 1.1rem;
  }

  .total-check {
    text-align: center;
    font-size: 0.9rem;
    color: var(--muted-foreground);
    margin-bottom: 0.75rem;
  }

  .note {
    font-size: 0.85rem;
    color: var(--muted-foreground);
    background: var(--secondary);
    padding: 0.75rem;
    border-radius: 8px;
    text-align: center;
  }

  .quick-ratios {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem;
  }

  .quick-ratios h3 {
    margin: 0 0 0.75rem;
    color: var(--muted-foreground);
    font-size: 0.9rem;
    text-align: center;
  }

  .ratio-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .ratio-btn {
    padding: 0.75rem;
    background: var(--secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--foreground);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .ratio-btn:hover {
    background: var(--primary);
    color: var(--primary-foreground);
    border-color: var(--primary);
  }

  .ratio-btn:active {
    transform: scale(0.98);
  }
</style>