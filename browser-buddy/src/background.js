// This file contains the background script that manages events and handles communication between the content script and other parts of the extension.

chrome.runtime.onInstalled.addListener(() => {
    console.log('Browser extension installed');
    chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageContent') {
        chrome.storage.sync.get(['apiKey'], (result) => {
            if (!result.apiKey) {
                // API key not set, prompt user to set it up
                chrome.runtime.openOptionsPage();
                sendResponse({ error: 'API key not set. Please configure the extension.' });
            } else {
                // API key is set, proceed as normal
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'fetchContent' }, (response) => {
                        sendResponse(response);
                    });
                });
            }
        });
        return true; // Indicates that the response will be sent asynchronously
    }
});