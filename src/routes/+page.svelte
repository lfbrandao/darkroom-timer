<svelte:options runes={true} />
<script lang="ts">
  import Timer from '../components/Timer.svelte';
</script>

<main class="app">
  <Timer />
</main>

<style>
  .app {
    min-height: 100vh;
    background: var(--background);
    color: var(--foreground);
    display: flex;
    flex-direction: column;
    overflow: visible;
  }
</style>
