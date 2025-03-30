/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://zeyuxia:<db_password>@cluster0.mlrjvkn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		// Ensure MongoDB client is connected
		if (!client.isConnected()) {
			await client.connect();
		}

		const db = client.db('your_database_name'); // Replace with your database name
		const collection = db.collection('your_collection_name'); // Replace with your collection name

		switch (url.pathname) {
			case '/login':
				const loginBody = await request.json();
				// Example: Query MongoDB
				const user = await collection.findOne({ username: loginBody.username });
				if (user) {
					return new Response(JSON.stringify(user), { status: 200 });
				} else {
					return new Response('User not found', { status: 404 });
				}

			case '/register':
				const registerBody = await request.json();
				// Example: Insert into MongoDB
				const result = await collection.insertOne(registerBody);
				return new Response(JSON.stringify(result), { status: 201 });

			case '/profile':
				return new Response('Hello, World!');

			case '/matches':
				return new Response('Hello, World!');

			default:
				return new Response('Not Found', { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;
