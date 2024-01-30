import { Hono } from 'hono';
import { Ai } from '@cloudflare/ai';

const app = new Hono();

app.post('/api/check', async (c) => {
	const ai = new Ai(c.env.AI);
	const payload = await c.req.json();
	const systemMessage = `Task: Check if there is unsafe content in 'user' messages in conversations according our safety policy with the below categories.
	<BEGIN UNSAFE CONTENT CATEGORIES>
	${payload.unsafeContentCategories}
	<END UNSAFE CONTENT CATEGORIES>
	`;
	const messages = [
		{ role: 'system', content: systemMessage },
		{ role: 'user', content: payload.userContent },
	];
	console.log('messages', messages);
	const response = await ai.run('@hf/thebloke/llamaguard-7b-awq', { messages });
	return c.json(response);
});

export default app;
