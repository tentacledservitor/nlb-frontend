<script lang="ts">
  import { page } from '$app/stores';
</script>

<nav>
  <ul>
    <!-- TODO: Make valid URL -->
    <li class:active={$page.url.pathname === '/news'}>
      <a sveltekit:prefetch href="/news">News</a>
    </li>
    <li class:active={$page.url.pathname === '/live'}>
      <a sveltekit:prefetch href="/live">Games</a>
    </li>
    <li class:active={$page.url.pathname === '/standings'}>
      <a sveltekit:prefetch href="/standings">Standings</a>
    </li>
    <li class:active={$page.url.pathname === '/archive'}>
      <a sveltekit:prefetch href="/archive">Archives</a>
    </li>
    <li class:active={$page.url.pathname === '/hall'}>
      <a href="/hall">Hall</a>
    </li>
    <li class:active={$page.url.pathname === '/narrative'}>
      <a sveltekit:prefetch href="/narrative">Narratives</a>
    </li>
  </ul>
</nav>

<style>

</style>