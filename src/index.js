import { Ai } from '@cloudflare/ai';
import { Hono } from 'hono';
import { stripIndents } from 'common-tags';

const app = new Hono();

app.post('/api/check', async (c) => {
	const ai = new Ai(c.env.AI);
	const payload = await c.req.json();
	let conversation = `User: ${payload.prompt}`;
	if (payload.role === 'assistant') {
		conversation += `\n\nAssistant: ${payload.assistantResponse}`;
	}
	const roleTitle = payload.role === 'user' ? 'User' : 'Assistant';
	const prompt = stripIndents`Task: Check if there is unsafe content in '${roleTitle}' messages in conversations according to our safety policy with the below categories.

	<BEGIN UNSAFE CONTENT CATEGORIES>
	${payload.unsafeContentCategories}
	<END UNSAFE CONTENT CATEGORIES>

	<BEGIN CONVERSATION>

	${conversation}

	<END CONVERSATION>

	Provide your safety assessment for '${roleTitle}' in the above conversation:
	- First line must read 'safe' or 'unsafe'.
	- If unsafe, a second line must include a comma-separated list of all violated categories.
	`;
	console.log('prompt.length', prompt.length);
	const response = await ai.run('@hf/thebloke/llamaguard-7b-awq', {
		prompt,
	});
	return c.json(response);
});

// Generates a suggestion from a chosen model
app.post('/api/suggestion', async (c) => {
	const ai = new Ai(c.env.AI);
	const payload = await c.req.json();
	const systemMessage = 'You are a helpful assistant. Keep responses to one sentence.';
	console.log('payload', payload);
	const response = await ai.run(payload.model, {
		messages: [
			{ role: 'system', content: systemMessage },
			{ role: 'user', content: payload.prompt },
		],
	});
	return c.json(response);
});

export default app;
