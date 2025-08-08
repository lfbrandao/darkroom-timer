<script lang="ts">
  import '../styles/app.css';
  import '../globals.css';
  import { onMount } from 'svelte';
  
  // Import the app stores
  import { recipe } from '../stores/app';
  import { timer } from '../stores/timer';

  // Load the recipe on mount
  onMount(() => {
    timer.loadRecipe($recipe);
  });
</script>

<slot />
