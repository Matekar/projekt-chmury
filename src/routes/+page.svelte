<script lang="ts">
	import MovieCard from './MovieCard.svelte';

	export let data;
	export let selectedUser: string | null = null;

	const handleUserChange = (event: Event) => {
		const target = event.target as HTMLSelectElement;
		selectedUser = target.value;
		console.log(`Selected user: ${selectedUser}`);
	};
</script>

<article>
	<form action="?/fetchUserMovies" method="post">
		<label for="user-dropdown">User:</label>
		<select id="user-dropdown" on:change={handleUserChange} bind:value={selectedUser} name="name">
			<option value="" disabled selected>Select a user</option>
			{#each data.props.users as user}
				<option value={user.name}>{user.name}</option>
			{/each}
		</select>
		<button>Select User</button>
	</form>
	<hr />
	{#if data.props.ratedMovies}
		<h2>Rated Movies:</h2>
		<div class="row">
			{#each data.props.ratedMovies as movie}
				<MovieCard title={movie.title} overallRating={movie.rating} userRating={movie.userRating} />
			{/each}
		</div>
	{/if}

	{#if data.props.unratedMovies}
		<h2>Unrated Movies:</h2>
		<div class="row">
			{#each data.props.unratedMovies as movie}
				<MovieCard title={movie.title} overallRating={movie.rating} userRating={null} />
			{/each}
		</div>
	{/if}
</article>

<style>
	article {
		display: grid;
		grid-template-columns: 1fr;
	}

	hr {
		width: 100%;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		flex-basis: 20%;
		flex-direction: row;
		justify-content: left;
		gap: 1rem;
	}

	label {
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	select {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 8px;
		background-color: #f9f9f9;
		color: #333;
		outline: none;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
	}

	select:focus {
		border-color: #007bff;
		background-color: #fff;
		box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
	}

	select:hover {
		background-color: #eee;
	}

	option {
		padding: 0.5rem;
		font-size: 1rem;
	}
</style>
