<script lang="ts">
	import './global.css';
</script>

<div class="app">
	<header>
		<nav>
			<h1>Chmury - projekt</h1>
			<ul>
				<!--<li><a href="/tabela/raa">Relacje Autor-Artykul</a></li>
				<li><a href="/tabela/rra">Relacje Redaktor-Artykul</a></li> -->
			</ul>
		</nav>
		<!-- <nav>
			<h2>Tabele</h2>
			
		</nav> -->
		<!-- <nav>
			<h2>Widoki</h2>
			<ul>
				<li>
					<a href="/widok/autorzy_artykuly">Autorzy i artykuły</a><a
						href="/widok/redaktorzy_przypisania">Przypisania redaktorów</a
					><a href="/widok/sfinalizowane_artykuly">Artykuły sfinalizowane</a>
				</li>
			</ul>
		</nav> -->
	</header>
	<main>
		<slot />
	</main>
	<footer>Marcin Kiżewski</footer>
</div>
