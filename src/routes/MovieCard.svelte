<script lang="ts">
	import { invalidateAll } from "$app/navigation";

	export let title: string;
	export let overallRating: number;
	export let userRating: number | null = null;

	let tempUserRating: number | null = userRating;

	const rate = async (newRating: number) => {
		tempUserRating = newRating;
		console.log(`User rated ${title} with ${newRating} stars.`);

    const data = new FormData();
    data.append("title", title);
    data.append("rating", `${newRating}`);

    await fetch("?/rateMovie", {
      method: 'POST',
      body: data,
    })

    invalidateAll();
	};
</script>

<div class="card">
	<div class="title">{title}</div>
	<div class="ratings">
		<div class="overall-rating">Overall Rating: {overallRating} ★</div>
		<div class="user-rating">
			<p>Your Rating:</p>
			<div class="stars">
				{#each [1, 2, 3, 4, 5] as star}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<span
						class="star {star <= (tempUserRating || 0) ? 'active' : ''}"
						on:click={() => rate(star)}
					>
						★
					</span>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.card {
		border: 1px solid #ccc;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		padding: 1rem;
		max-width: 300px;
		margin: 0 auto;
		text-align: center;
		background: #fff;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.card:hover {
		transform: scale(1.02);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.title {
		color: #333;
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	.ratings {
		margin-top: 1rem;
	}

	.overall-rating {
		font-size: 1.2rem;
		color: #888;
	}

	.user-rating {
		margin-top: 0.5rem;
	}

	.stars {
		display: flex;
		justify-content: center;
		gap: 0.3rem;
	}

	.star {
		font-size: 1.5rem;
		color: #ccc;
		cursor: pointer;
		transition: color 0.2s;
	}

	.star.active,
	.star:hover {
		color: gold;
	}
</style>
