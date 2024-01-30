document.getElementById('promptForm').addEventListener('submit', async function (event) {
	event.preventDefault();
	const prompt = document.getElementById('promptInput').value;
	const unsafeContentCategories = document.getElementById('unsafeContentCategories').value;
	// You'll need to integrate with your backend here to determine if the prompt is safe or unsafe
	// For demonstration, let's assume a function checkPromptSafety(prompt) that returns 'safe' or 'unsafe'

	const response = await checkPromptSafety(unsafeContentCategories, prompt); // Placeholder function

	// Update the UI based on the response
	const responseContainer = document.getElementById('responseContainer');
	const responseText = document.getElementById('responseText');

	if (response === 'safe') {
		responseContainer.className = 'safe'; // Apply safe class
		responseText.textContent = 'This content is safe.';
	} else {
		responseContainer.className = 'unsafe'; // Apply unsafe class
		responseText.textContent = 'This content is unsafe.';
	}

	responseContainer.classList.remove('hidden'); // Show the response
});

async function checkPromptSafety(unsafeContentCategories, prompt) {
	// Placeholder function. Replace with your actual backend integration
	const response = await fetch('/api/check', {
		method: 'POST',
		body: JSON.stringify({
			userContent: prompt,
			unsafeContentCategories,
		}),
	});
	const result = await response.json();
	console.dir(result);
	return result.response.trim();
}
