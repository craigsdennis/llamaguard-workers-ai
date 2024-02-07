document.getElementById('promptForm').onsubmit = function (event) {
	event.preventDefault();

	// Get the user's prompt and unsafe categories
	const userPrompt = document.getElementById('promptInput').value;
	const assistantResponse = document.getElementById('assistantResponse').value;
	const unsafeCategories = document.getElementById('unsafeCategories').value;

	const promises = [];
	promises.push(runCheck('user', userPrompt, assistantResponse, unsafeCategories));
	if (assistantResponse && assistantResponse.trim() !== '') {
		promises.push(runCheck('assistant', userPrompt, assistantResponse, unsafeCategories));
	}
	Promise.all(promises)
		.then(() => 'All done')
		.catch((err) => console.error(err));
};

document.getElementById('generateSuggestion').onclick = async function (event) {
	event.preventDefault();

	const prompt = document.getElementById('promptInput').value;
	const model = document.getElementById('modelSelect').value;

	// Get suggestion
	document.getElementById('assistantResponse').value = 'Generating...';
	const response = await fetch('/api/suggestion', {
		method: 'POST',
		body: JSON.stringify({
			prompt,
			model,
		}),
	});
	const result = await response.json();
	document.getElementById('assistantResponse').value = result.response;
};

document.getElementById('categoriesToggle').onclick = function () {
	// Get the categories container
	var categoriesContainer = document.getElementById('categoriesContainer');

	// Toggle the display property
	categoriesContainer.style.display = categoriesContainer.style.display === 'none' ? 'block' : 'none';
};

function findReason(reason, categories) {
	let reasonLine = '';
	if (reason) {
		const lines = categories.split('\n');
		const needle = reason.trim();
		reasonLine = lines.find((line) => line.startsWith(needle));
		if (reasonLine === undefined) {
			if (needle.length === 1) {
				return findReason('0' + needle, categories);
			}
			console.error(`Did not find reason ${needle}`);
			reasonLine = needle;
		}
	}
	return reasonLine;
}

async function runCheck(role, prompt, assistantResponse, unsafeContentCategories) {
	const response = await fetch('/api/check', {
		method: 'POST',
		body: JSON.stringify({
			role,
			prompt,
			assistantResponse,
			unsafeContentCategories,
		}),
	});
	const result = await response.json();
	console.dir(result);
	const parts = result.response.split('\n');
	const status = parts[0];
	const reason = parts[1] || '';
	let reasonLine = '';
	if (reason) {
		const lines = unsafeContentCategories.split('\n');
		reasonLine = lines.find((line) => line.startsWith(reason.trim()));
		if (reasonLine === undefined) {
			console.error(`Did not find reason ${reason}`);
			reasonLine = reason;
		}
	}
	const text = role === 'user' ? prompt : assistantResponse;
	displayResult(status.trim(), role, text, reasonLine);
}

function displayResult(status, role, text, reason) {
	const tableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
	const newRow = tableBody.insertRow();
	const iconCell = newRow.insertCell(0);
	const statusCell = newRow.insertCell(1);
	const roleCell = newRow.insertCell(2);
	const reasonCell = newRow.insertCell(3);
	const textCell = newRow.insertCell(4);
	const statusIcon = document.createElement('i');
	statusIcon.className = status === 'safe' ? 'fas fa-thumbs-up' : 'fas fa-thumbs-down';
	iconCell.appendChild(statusIcon);
	const statusCode = document.createElement('code');
	statusCode.appendChild(document.createTextNode(status));
	statusCell.appendChild(statusCode);
	roleCell.appendChild(document.createTextNode(role));
	reasonCell.appendChild(document.createTextNode(reason));
	textCell.appendChild(document.createTextNode(text));
}
