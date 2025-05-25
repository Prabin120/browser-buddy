const validateApiKey = "http://127.0.0.1:8000/api/test-api-key"; // Replace with actual validation endpoint

document.getElementById('saveBtn').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    document.getElementById('status').textContent = 'Validating API key...';
    // Validate API key format (simple check, can be improved)
    const apiKeyPattern = /^[a-zA-Z0-9-_]{32,}$/; // Example pattern, adjust as needed
    const isValidApiKey = apiKeyPattern.test(apiKey);
    if (!isValidApiKey) {
        document.getElementById('status').textContent = 'Invalid API key format.';
        return;
    }
    // Validate API key via backend (POST)
    let checkApiKey;
    try {
        checkApiKey = await fetch(validateApiKey, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: apiKey,
                content: "Test",
                question: "Hi"
            })
        });
    } catch (err) {
        document.getElementById('status').textContent = 'Could not reach validation server.';
        return;
    }

    if (!checkApiKey.ok) {
        document.getElementById('status').textContent = 'API key validation failed. Please check your key.';
        return;
    }

    chrome.storage.sync.set({ apiKey }, () => {
        document.getElementById('status').textContent = 'API key saved!';
    });
});

// Load existing API key if present
window.onload = () => {
    chrome.storage.sync.get(['apiKey'], (result) => {
        if (result.apiKey) {
            document.getElementById('apiKey').value = result.apiKey;
        }
    });
};