import { Hono } from 'hono';
import { Ai } from '@cloudflare/ai';

const app = new Hono();

app.post('/api/check', async (c) => {
	const ai = new Ai(c.env.AI);
	const payload = await c.req.json();
	const prompt = `Task: Check if there is unsafe content in 'User' messages in conversations according to our safety policy with the below categories.

	<BEGIN UNSAFE CONTENT CATEGORIES>
	${payload.unsafeContentCategories}
	<END UNSAFE CONTENT CATEGORIES>

	<BEGIN CONVERSATION>

	User: ${payload.userContent}

	<END CONVERSATION>

	Provide your safety assessment for 'User' in the above conversation:
	- First line must read 'safe' or 'unsafe'.
	- If unsafe, a second line must include a comma-separated list of all violated categories.
	`;
	const response = await ai.run('@hf/thebloke/llamaguard-7b-awq', {
		prompt,
	});
	return c.json(response);
});

export default app;
