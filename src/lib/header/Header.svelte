<script lang="ts">
  import HeaderEra from "./HeaderEra.svelte";
  import Nav from "./Nav.svelte";
</script>

<header class="header">
  <div class="header-links">
    <div class="header-logo">
      <h1>
        <!-- TODO: Make valid URL -->
        <a href="#">
          Narrative League Blaseball
        </a>
      </h1>
      <!-- TODO: Change name to be better -->
      <HeaderEra title="Season 3"/>
    </div>
    <div class="header-social">
      <!-- TODO: Social media links go here -->
    </div>
  </div>
  <!-- Ticker goes here -->

  <Nav />
</header>
<style>

</style>