document.getElementById('promptForm').onsubmit = function(event) {
  event.preventDefault();

  // Get the user's prompt and unsafe categories
  var userPrompt = document.getElementById('promptInput').value;
  var unsafeCategories = document.getElementById('unsafeCategories').value;

  // Implement the API call here, passing both the prompt and unsafe categories
  sendPromptToAPI(userPrompt, unsafeCategories);
};

document.getElementById('categoriesToggle').onclick = function() {
  // Get the categories container
  var categoriesContainer = document.getElementById('categoriesContainer');

  // Toggle the display property
  categoriesContainer.style.display = categoriesContainer.style.display === 'none' ? 'block' : 'none';
};

async function sendPromptToAPI(prompt, unsafeContentCategories) {
  // Placeholder function to simulate API call
  console.log('Sending prompt to API:', prompt);
  console.log('With categories:', unsafeContentCategories);

	const response = await fetch('/api/check', {
		method: 'POST',
		body: JSON.stringify({
			userContent: prompt,
			unsafeContentCategories,
		}),
	});
	const result = await response.json();
	console.dir(result);
	const parts = result.response.split("\n");
	const status = parts[0];
	const reason = parts[1] || "";
	let reasonLine = "";
	if (reason) {
		const lines = unsafeContentCategories.split("\n");
		reasonLine = lines.find((line) => line.startsWith(reason.trim()));
		if (reasonLine === undefined) {
			console.error(`Did not find reason ${reason}`);
			reasonLine = reason;
		}
	}

  displayResult(status.trim(), prompt, reasonLine);
}

function displayResult(status, prompt, reason) {
  const tableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
  const newRow = tableBody.insertRow();
	const iconCell = newRow.insertCell(0);
  const statusCell = newRow.insertCell(1);
  const promptCell = newRow.insertCell(2);
  const reasonCell = newRow.insertCell(3);
	const statusIcon = document.createElement('i');
  statusIcon.className = status === 'safe' ? 'fas fa-thumbs-up' : 'fas fa-thumbs-down';
  iconCell.appendChild(statusIcon);
	const statusCode = document.createElement("code");
	statusCode.appendChild(document.createTextNode(status));
  statusCell.appendChild(statusCode);
  promptCell.appendChild(document.createTextNode(prompt));
  reasonCell.appendChild(document.createTextNode(reason));
}
