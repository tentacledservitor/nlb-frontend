<script lang="ts">
	import Highlight from "$lib/Highlight.svelte";
	interface Highlighted {
		message: string;
		url: string;
		count: number;
	}
	
	let testHighlights: Highlighted[] = [
		{
			message: "Player did thing",
			url: "#",
			count: 1
		},
		{
			message: "Player 2 did thing",
			url: "#",
			count: 2
		},
		{
			message: "Player 3 did thing",
			url: "#",
			count: 3
		}
	]
</script>

<svelte:head>
	<title>News</title>
	<meta name="description" content="News" />
</svelte:head>

<section>
	<h2>News</h2>
	<div class="content-box">
		<div class="main-box">
			
		</div>
		<div class="sidebar">
			<h3>Highlights</h3>
			{#each testHighlights as highlight}
				<Highlight count={highlight.count}>
					<a href={highlight.url}>
						{highlight.message}
					</a>
				</Highlight>
			{/each}
		</div>
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
