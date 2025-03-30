import { MongoClient } from 'mongodb';

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

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const MONGO_URI = `mongodb+srv://zeyuxia:${env.DB_PASS}@cluster0.mlrjvkn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
		const client = new MongoClient(MONGO_URI);
		const dbName = 'hoomatches';

		const addCorsHeaders = (response: Response): Response => {
			const headers = new Headers(response.headers);
			headers.set('Access-Control-Allow-Origin', '*');
			return new Response(response.body, { ...response, headers });
		};

		switch (url.pathname) {

			case '/login': {
				if (request.method !== 'POST') {
					const response = new Response(JSON.stringify({ success: false, message: 'Method Not Allowed' }), {
						status: 405,
						headers: { 'Content-Type': 'application/json' },
					});
					return addCorsHeaders(response);
				}

				let body: { username: string; password: string };
				try {
					body = await request.json();
				} catch {
					const response = new Response(JSON.stringify({ success: false, message: 'Invalid JSON' }), {
						status: 400,
						headers: { 'Content-Type': 'application/json' },
					});
					return addCorsHeaders(response);
				}

				const { username, password } = body;
				if (!username || !password) {
					const response = new Response(JSON.stringify({ success: false, message: 'Missing username or password' }), {
						status: 400,
						headers: { 'Content-Type': 'application/json' },
					});
					return addCorsHeaders(response);
				}

				try {
					await client.connect();
					const db = client.db(dbName);
					const collection = db.collection('user');

					const user = await collection.findOne({ username, password });
					if (user) {
						const response = new Response(JSON.stringify({ success: true, message: 'Login successful', user: { username } }), {
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						 });
						return addCorsHeaders(response);
					} else {
						const response = new Response(JSON.stringify({ success: false, message: 'Invalid credentials' }), {
							status: 401,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					}
				} catch (error) {
					console.error('Database connection error:', error);
					const response = new Response(JSON.stringify({ success: false, message: 'Internal Server Error' }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
					return addCorsHeaders(response);
				} finally {
					await client.close();
				}
			}

			case '/register': {
				if (request.method !== 'POST') {
					const response = new Response(JSON.stringify({ success: false, message: 'Method Not Allowed' }), {
						status: 405,
						headers: { 'Content-Type': 'application/json' },
					});
					return addCorsHeaders(response);
				}

				let body: { username: string; email: string; password: string };
				try {
					body = await request.json();
				} catch {
					const response = new Response(JSON.stringify({ success: false, message: 'Invalid JSON' }), {
						status: 400,
						headers: { 'Content-Type': 'application/json' },
					});
					return addCorsHeaders(response);
				}

				const { username, email, password } = body;
				if (!username || !email || !password) {
					const response = new Response(JSON.stringify({ success: false, message: 'Missing username, email, or password' }), {
						status: 400,
						headers: { 'Content-Type': 'application/json' },
					});
					return addCorsHeaders(response);
				}

				try {
					await client.connect();
					const db = client.db(dbName);
					const collection = db.collection('user');

					// Check if the username or email already exists
					const existingUser = await collection.findOne({ $or: [{ username }, { email }] });
					if (existingUser) {
						const response = new Response(JSON.stringify({ success: false, message: 'Username or email already exists' }), {
							status: 409,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					}

					// Insert the new user
					await collection.insertOne({ username, email, password });
					const response = new Response(JSON.stringify({ success: true, message: 'User registered successfully' }), {
						status: 201,
						headers: { 'Content-Type': 'application/json' },
					});
					return addCorsHeaders(response);
				} catch (error) {
					console.error('Database connection error:', error);
					const response = new Response(JSON.stringify({ success: false, message: 'Internal Server Error' }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
					return addCorsHeaders(response);
				} finally {
					await client.close();
				}
			}

			case '/profile': {
				if (request.method === 'POST') {
					let body: { username: string; qna: { qid: number; answer: string }[] };
					try {
						body = await request.json();
					} catch {
						const response = new Response(JSON.stringify({ success: false, message: 'Invalid JSON' }), {
							status: 400,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					}

					const { username, qna } = body;
					if (!username || !qna || !Array.isArray(qna)) {
						const response = new Response(JSON.stringify({ success: false, message: 'Missing or invalid parameters' }), {
							status: 400,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					}

					try {
						await client.connect();
						const db = client.db(dbName);
						const collection = db.collection('user');

						// Update the user's information in the database
						const updates = qna.reduce((acc: Record<string, string>, item) => {
							acc[`information.${item.qid}`] = item.answer;
							return acc;
						}, {});

						const result = await collection.updateOne(
							{ username },
							{ $set: updates }
						);

						if (result.matchedCount === 0) {
							const response = new Response(JSON.stringify({ success: false, message: 'User not found' }), {
								status: 404,
								headers: { 'Content-Type': 'application/json' },
							});
							return addCorsHeaders(response);
						}

						const response = new Response(JSON.stringify({ success: true, message: 'Answers updated successfully' }), {
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					} catch (error) {
						console.error('Database connection error:', error);
						const response = new Response(JSON.stringify({ success: false, message: 'Internal Server Error' }), {
							status: 500,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					} finally {
						await client.close();
					}
				}

				if (request.method === 'GET') {
					const step = parseInt(url.searchParams.get('step') || '1', 10);
					if (isNaN(step) || step < 1 || step > 3) {
						const response = new Response(JSON.stringify({ success: false, message: 'Invalid step parameter' }), {
							status: 400,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					}

					const steps = [
						{
							current_step: 1,
							total_steps: 3,
							current_step_title: "Basic Information",
							qna: [
								{ qid: 0, question: "What is your age? (Please enter a number)", answer: "", placeholder: "25" },
								{ qid: 1, question: "What is your preferred gender for a match?", answer: "", placeholder: "Male/Female/Non-binary" },
								{ qid: 2, question: "What is your acceptable age difference range?", answer: "", placeholder: "±3 years" }
							]
						},
						{
							current_step: 2,
							total_steps: 3,
							current_step_title: "Personality & Compatibility",
							qna: [
								{ qid: 3, question: "How would you describe your personality?", answer: "", placeholder: "Outgoing and thoughtful" },
								{ qid: 4, question: "What is your role in relationships?", answer: "", placeholder: "Listener/Caregiver/Equal Partner" },
								{ qid: 5, question: "What do you value most in a relationship?", answer: "", placeholder: "Trust/Communication/Shared Values" },
								{ qid: 6, question: "Should your partner share similar personality traits?", answer: "", placeholder: "Yes/No/Somewhat" },
								{ qid: 7, question: "What is your MBTI type?", answer: "", placeholder: "INFP" },
								{ qid: 8, question: "Preferred partner MBTI type?", answer: "", placeholder: "ENFJ/Any" },
								{ qid: 9, question: "What is your zodiac sign?", answer: "", placeholder: "Leo" },
								{ qid: 10, question: "Preferred partner zodiac sign?", answer: "", placeholder: "Aquarius/Any" }
							]
						},
						{
							current_step: 3,
							total_steps: 3,
							current_step_title: "Interests & Activities",
							qna: [
								{ qid: 11, question: "What type of people do you want to meet at the event?", answer: "", placeholder: "Creative/Adventurous/Intellectual" },
								{ qid: 12, question: "What's your ideal date activity?", answer: "", placeholder: "Dinner/Museum/Outdoor Adventure" },
								{ qid: 13, question: "What hobbies would you share with a partner?", answer: "", placeholder: "Hiking/Cooking/Gaming" },
								{ qid: 14, question: "Which Valentine's event interests you most?", answer: "", placeholder: "Cocktail Party/Workshop/Speed Dating" },
								{ qid: 15, question: "What aspect matters most in partner compatibility?", answer: "", placeholder: "Values/Hobbies/Communication Style" }
							]
						}
					];

					const stepData = steps[step - 1];

					try {
						await client.connect();
						const db = client.db(dbName);
						const collection = db.collection('user');

						// Assuming the username is passed as a query parameter for simplicity
						const username = url.searchParams.get('username');
						if (!username) {
							const response = new Response(JSON.stringify({ success: false, message: 'Missing username parameter' }), {
								status: 400,
								headers: { 'Content-Type': 'application/json' },
							});
							return addCorsHeaders(response);
						}

						const user = await collection.findOne({ username });
						if (user && user.information) {
							stepData.qna.forEach(q => {
								q.answer = user.information[q.qid] || "";
							});
						}

						const response = new Response(JSON.stringify({ success: true, data: stepData }), {
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					} catch (error) {
						console.error('Database connection error:', error);
						const response = new Response(JSON.stringify({ success: false, message: 'Internal Server Error' }), {
							status: 500,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					} finally {
						await client.close();
					}
				}
			}

			case '/match': {
				if (request.method === 'POST') {
					let body: { action: string; username: string };
					try {
						body = await request.json();
					} catch {
						const response = new Response(JSON.stringify({ success: false, message: 'Invalid JSON' }), {
							status: 400,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					}

					const { action, username } = body;
					if (!action || !username) {
						const response = new Response(JSON.stringify({ success: false, message: 'Missing action or username' }), {
							status: 400,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					}

					try {
						await client.connect();
						const db = client.db(dbName);
						const collection = db.collection('match');

						if (action === 'continue') {
							// Handle "continue" action
							await collection.updateOne(
								{ user_a: username, status: 'match' },
								{ $set: { status: 'a_continue' } }
							);
							await collection.updateOne(
								{ user_b: username, status: 'match' },
								{ $set: { status: 'b_continue' } }
							);
							await collection.updateOne(
								{ user_a: username, status: 'b_continue' },
								{ $set: { status: 'finish' } }
							);
							await collection.updateOne(
								{ user_b: username, status: 'a_continue' },
								{ $set: { status: 'finish' } }
							);
						} else if (action === 'skip') {
							// Handle "skip" action
							await collection.updateMany(
								{ user_a: username },
								{ $set: { status: 'skip' } }
							);
							await collection.updateMany(
								{ user_b: username },
								{ $set: { status: 'skip' } }
							);
						} else {
							const response = new Response(JSON.stringify({ success: false, message: 'Invalid action' }), {
								status: 400,
								headers: { 'Content-Type': 'application/json' },
							});
							return addCorsHeaders(response);
						}

						const response = new Response(JSON.stringify({ success: true, message: 'Action processed successfully' }), {
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					} catch (error) {
						console.error('Database connection error:', error);
						const response = new Response(JSON.stringify({ success: false, message: 'Internal Server Error' }), {
							status: 500,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					} finally {
						await client.close();
					}
				}

				if (request.method === 'GET') {
					const username = url.searchParams.get('username');
					if (!username) {
						const response = new Response(JSON.stringify({ success: false, message: 'Missing username parameter' }), {
							status: 400,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					}

					// Simulate random matching logic
					const randomValue = Math.random();
					if (randomValue < 0.8) {
						const response = new Response(JSON.stringify({ success: true, contact: 'userb@example.com' }), {
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					} else {
						const response = new Response(JSON.stringify({ success: false, reason: 'not enough user' }), {
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						});
						return addCorsHeaders(response);
					}
				}

				const response = new Response(JSON.stringify({ success: false, message: 'Method Not Allowed' }), {
					status: 405,
					headers: { 'Content-Type': 'application/json' },
				});
				return addCorsHeaders(response);
			}

			default: {
				const response = new Response('Not Found', { status: 404 });
				return addCorsHeaders(response);
			}
		}
	},
} satisfies ExportedHandler<Env>;
