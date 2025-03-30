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

// this is a couple matching project.



export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		switch (url.pathname) {
			case '/uuid':
				return new Response(crypto.randomUUID());

			case '/login':
				// login and register is now just dummy one.
				// they receive post of email and password
				// return a jwt token
				const loginBody = await request.json();
				return new Response('Hello, World!');
			case '/register':
				// register and login is now just dummy one.
				// they receive post of email and password
				// return a jwt token
				return new Response('Hello, World!');

			case '/profile':
				// get:
				// param of page.
				
				return new Response('Hello, World!');
			
			case '/matches':
				// get matches
				return new Response('Hello, World!');

			default:
				return new Response('Not Found', { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;
