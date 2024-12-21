import { NEO4J_USER, NEO4J_URI, NEO4J_PASSWORD } from '$env/static/private';
import type { NumericRange } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import neo4j, { Driver, Integer, Session } from 'neo4j-driver';

let username: string | null = null;
let driver: Driver | null = null;

async function initializeNeo4j(): Promise<Driver> {
	if (!driver) {
		const uri = NEO4J_URI;
		const user = NEO4J_USER;
		const password = NEO4J_PASSWORD;

		if (!uri || !user || !password) {
			throw new Error('Brak konfiguracji Neo4j. Sprawdź plik .env.');
		}

		driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
	}
	return driver;
}

async function fetchMovies(): Promise<{ title: string; rating: number }[]> {
	const driver = await initializeNeo4j();
	const session: Session = driver.session();

	try {
		const result = await session.run(`
            MATCH (m:Movie)
            RETURN m.title AS title, m.rating AS rating
            ORDER BY m.rating DESC
        `);

		const movies = result.records.map((record) => ({
			title: record.get('title'),
			rating: record.get('rating')
		}));
		return movies;
	} catch (error) {
		console.error('Błąd podczas pobierania danych z Neo4j:', error);
		throw new Error('Nie udało się pobrać danych z bazy.');
	} finally {
		await session.close();
	}
}

async function fetchUsers(): Promise<{ name: string }[]> {
	const driver = await initializeNeo4j();
	const session: Session = driver.session();

	try {
		const result = await session.run(`
          MATCH (u:User)
          RETURN u.name AS name
      `);

		return result.records.map((record) => ({
			name: record.get('name')
		}));
	} catch (error) {
		console.error('Error fetching users:', error);
		throw new Error('Could not fetch users.');
	} finally {
		await session.close();
	}
}

async function addUser(name: string, age: number): Promise<string> {
	const driver = await initializeNeo4j();
	const session: Session = driver.session();

	try {
		const result = await session.run(
			`
			MATCH (u:User)
      WITH COUNT(u) AS userCount
      CREATE (newUser:User {userId: $id, name: $name, age: $age})
      RETURN newUser.id AS id
		`,
			{
				id: `u${Math.floor(Date.now() / 1000)}`,
				name,
				age
			}
		);

		const createdUserId = result.records[0]?.get('id') as string;
		return createdUserId || 'Unknown ID';
	} catch (err) {
		console.error('ERR: ', err);
	} finally {
		await session.close();
	}
}

async function fetchUserMovies(name: string): Promise<{
	ratedMovies: { title: string; rating: number; userRating: Integer }[];
	unratedMovies: { title: string; rating: number }[];
}> {
	const driver = await initializeNeo4j();
	const session: Session = driver.session();

	try {
		const result = await session.run(
			`
          MATCH (u:User {name: $name})
          OPTIONAL MATCH (u)-[r:RATED]->(m:Movie)
          WITH u, collect({title: m.title, rating: m.rating, userRating: toInteger(r.rating)}) AS ratedMovies
          MATCH (m:Movie) WHERE NOT (u)-[:RATED]->(m)
          RETURN ratedMovies, collect({title: m.title, rating: m.rating}) AS unratedMovies
          `,
			{ name }
		);

		const record = result.records[0];

		const ratedMovies = record && record.has('ratedMovies') ? record.get('ratedMovies') : [];
		const unratedMovies = record && record.has('unratedMovies') ? record.get('unratedMovies') : [];

		return {
			ratedMovies,
			unratedMovies
		};
	} catch (error) {
		console.error('Error fetching user movies:', error);
		throw new Error('Could not fetch user movies.');
	} finally {
		await session.close();
	}
}

async function rateMovie(username: string, movieTitle: string, rating: string) {
	const driver = await initializeNeo4j();
	const session: Session = driver.session();

	try {
		await session.run(
			`
        MATCH (u:User {name: $name}), (m:Movie {title: $movieTitle})
        MERGE (u)-[r:RATED]->(m)
        SET r.rating = $rating
        RETURN m.title, r.rating
        `,
			{ name: username, movieTitle, rating }
		);
	} catch (error) {
		console.error('Error creating RATED relationship:', error);
		throw new Error('Could not create RATED relationship.');
	} finally {
		await session.close();
	}
}

async function updateMovieRating(title: string) {
	const driver = await initializeNeo4j();
	const session: Session = driver.session();

	try {
		const result = await session.run(
			`
      MATCH (m:Movie {title: $title})<-[r:RATED]-(u:User)
      WITH m, avg(toFloat(r.rating)) AS averageRating
      SET m.rating = averageRating
      RETURN m.title AS title, m.rating AS updatedRating
      `,
			{ title }
		);

		const record = result.records[0];
		if (record) {
			console.log(
				`Rating for ${record.get('title')} updated, new rating: ${record.get('updatedRating')}`
			);
		} else {
			console.log('MOvie not found');
		}
	} catch (err) {
		console.error('ERR: ', err);
	} finally {
		await session.close();
	}
}

export const load: PageServerLoad = async () => {
	const users = await fetchUsers();
	let unratedMovies = null;
	let ratedMovies = null;

	if (username != null) {
		const fetchResult = await fetchUserMovies(username);

		if (fetchResult.ratedMovies[0].title != null) {
			ratedMovies = fetchResult.ratedMovies.map((movie) => ({
				...movie,
				userRating: movie.userRating.low
			}));
		}
		unratedMovies = fetchResult.unratedMovies;
	}

	return {
		props: {
			users,
			ratedMovies,
			unratedMovies
		}
	};
};

export const actions = {
	addUser: async (e) => {
		const data = await e.request.formData();
		const name = data.get('name');
		const age = data.get('age');

		if (typeof name?.valueOf() != 'string' && isNaN(parseInt(age?.valueOf() as string))) {
			return {
				status: 400,
				body: { error: 'ERR' }
			};
		}

		try {
			await addUser(name?.valueOf() as string, parseInt(age?.valueOf() as string));
			return { success: true };
		} catch (err) {
			return { success: false };
		}
	},

	fetchUserMovies: async (e) => {
		const data = await e.request.formData();
		const name = data.get('name');

		if (typeof name?.valueOf() == 'string') {
			username = name.valueOf() as string;
			return { success: true };
		} else return { success: false };
	},

	rateMovie: async (e) => {
		const data = await e.request.formData();

		const title = data.get('title') as string;
		const rating = data.get('rating') as string;

		if (!username || !title || !rating) {
			return {
				status: 400,
				body: { error: 'ERR' }
			};
		}

		try {
			await rateMovie(username, title, rating);
			await updateMovieRating(title);
			return { success: true };
		} catch (err) {
			return { success: false };
		}
	}
};
