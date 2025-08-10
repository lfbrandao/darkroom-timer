<script lang="ts">
  export let totalTime: number;
  export let currentTime: number;
  export let showAgitation: boolean;
  export let isRunning: boolean = true;

  let agitationStartTime: number | null = null;
  let agitationAnimationActive = false;
  let animationDuration = 0;

  $: progress = totalTime > 0 ? (totalTime - currentTime) / totalTime : 0;
  $: displayTime = formatTime(currentTime);
  $: shouldAnimateAgitation = showAgitation && isRunning;

  // Handle agitation animation timing
  $: if (showAgitation && !agitationAnimationActive && isRunning) {
    agitationStartTime = Date.now();
    agitationAnimationActive = true;
    animationDuration = 0;
  } else if (!showAgitation || !isRunning) {
    agitationAnimationActive = false;
    agitationStartTime = null;
    animationDuration = 0;
  }

  // Update animation duration when running
  $: if (agitationAnimationActive && isRunning && agitationStartTime) {
    animationDuration = Math.min(Date.now() - agitationStartTime, 2000);
  }

  $: agitationShakeActive = agitationAnimationActive && 
    isRunning &&
    animationDuration < 2000; // 2 seconds

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<div class="circular-timer {agitationShakeActive ? 'agitating' : ''}">
  <svg class="timer-svg" viewBox="0 0 200 200">
    <!-- Background circle -->
    <circle
      cx="100"
      cy="100"
      r="90"
      fill="none"
      stroke="var(--border)"
      stroke-width="6"
    />
    
    <!-- Progress circle -->
    <circle
      cx="100"
      cy="100"
      r="90"
      fill="none"
      stroke={showAgitation ? 'var(--destructive)' : 'var(--primary)'}
      stroke-width="6"
      stroke-linecap="round"
      stroke-dasharray={2 * Math.PI * 90}
      stroke-dashoffset={2 * Math.PI * 90 * (1 - progress)}
      transform="rotate(-90 100 100)"
      class="progress-circle"
    />
  </svg>
  
  <div class="timer-content">
    <div class="time-display">{displayTime}</div>
    {#if showAgitation}
      <div class="agitate-text {shouldAnimateAgitation ? 'pulsing' : ''}">AGITATE</div>
    {/if}
  </div>
</div>

<style>
  .circular-timer {
    position: relative;
    width: 200px;
    height: 200px;
    transition: all 0.3s ease;
  }

  .circular-timer.agitating {
    animation: shake 0.5s infinite;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }

  .timer-svg {
    width: 100%;
    height: 100%;
  }

  .progress-circle {
    transition: stroke-dashoffset 1s linear, stroke 0.3s ease;
  }

  .timer-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .time-display {
    font-size: 2rem;
    font-weight: 600;
    color: var(--foreground);
    margin-bottom: 0.25rem;
  }

  .agitate-text {
    font-size: 1rem;
    font-weight: 700;
    color: var(--destructive);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .agitate-text.pulsing {
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
</style>