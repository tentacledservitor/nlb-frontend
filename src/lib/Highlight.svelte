<script lang="ts">
  // Unused because of slot (for now)
  // export let message = "Player did thing";
  // export let url = "#";

  export let count = 0;
  $: highlights = count === 1 ? "highlight" : "highlights";
</script>

<p class="highlight-text">
  <!-- Not certain if I should have a slot or make it a prop -->
  <slot />

  <span class="highlights">{count + " " + highlights}</span>

  <!-- Maybe break the button off into its own component depending on how hard it is -->
  <span class="highlight-button">highlight</span>
</p>

<span class="highlight-button"></span>

<style>

</style>