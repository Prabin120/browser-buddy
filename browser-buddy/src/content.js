const pageChat = "http://127.0.0.1:8000/api/chat"; // Replace with actual validation endpoint
const youtubeVideoSetup = "http://127.0.0.1:8000/api/youtube-setup"; // Replace with actual YouTube video setup endpoint

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openOptions') {
        chrome.runtime.openOptionsPage();
    }
});

chrome.storage.sync.get(['apiKey'], (result) => {
    // if (!result.apiKey) {
    //     console.log('Browser Buddy inactive: API key not set.');
    //     return;
    // }
    injectChatBot(result.apiKey);

    // Listen for URL changes (for SPAs like YouTube)
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            injectChatBot();
        }
    }).observe(document, { subtree: true, childList: true });
});


function injectChatBot(apiKeyAvailable) {
    if (document.getElementById('browser-buddy-chat-btn')) return;
    const { chatBtn, chatInputArea, chatInput, sendBtn } = chatComponents();
    chatInputArea.appendChild(chatInput);
    chatInputArea.appendChild(sendBtn);
    const { chatWindow, chatMessages } = createChatWindow(chatInputArea);
    document.body.appendChild(chatBtn);
    document.body.appendChild(chatWindow);
    let chatHistory = [];
    // let chatType = 'page';
    chatBtn.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
    });

    let isYoutube = isYouTubeVideo();
    let selectedLanguage = "en"; // default

    // if (isYoutube) {
    //     // Info message
    //     chatType = 'youtube';
    //     const infoDiv = document.createElement('div');
    //     infoDiv.textContent = 'Want to clear doubt about this YouTube video? Ask below!';
    //     infoDiv.style.color = '#4f8cff';
    //     infoDiv.style.margin = '16px 0';

    //     // Language selector
    //     const langLabel = document.createElement('label');
    //     langLabel.textContent = 'Choose language: ';
    //     langLabel.style.marginRight = '8px';
    //     langLabel.style.color = '#4f8cff';

    //     const langSelect = document.createElement('select');
    //     langSelect.style.marginLeft = '4px';
    //     langSelect.style.marginBottom = '8px';
    //     langSelect.innerHTML = `
    //         <option value="en">English</option>
    //         <option value="hi">Hindi</option>
    //         <option value="es">Spanish</option>
    //         <option value="fr">French</option>
    //         <option value="de">German</option>
    //         <!-- Add more languages as needed -->
    //     `;
    //     langSelect.addEventListener('change', (e) => {
    //         selectedLanguage = e.target.value;
    //     });

    //     // Show "Learn about this video" button
    //     const learnBtn = document.createElement('button');
    //     learnBtn.textContent = 'Learn about this video';
    //     learnBtn.style.background = '#4f8cff';
    //     learnBtn.style.color = 'white';
    //     learnBtn.style.border = 'none';
    //     learnBtn.style.borderRadius = '6px';
    //     learnBtn.style.padding = '8px 16px';
    //     learnBtn.style.cursor = 'pointer';
    //     learnBtn.style.marginTop = '8px';

    //     // Hide chat input and messages initially
    //     chatInputArea.style.display = 'none';

    //     // Only show chat input/messages after clicking the button
    //     learnBtn.addEventListener('click', () => {
    //         infoDiv.style.display = 'none';
    //         learnBtn.style.display = 'none';
    //         langLabel.style.display = 'none';
    //         langSelect.style.display = 'none';
    //         chatInputArea.style.display = 'flex';
    //         chatMessages.innerHTML = ''; // Optionally clear previous messages

    //         // Show loading message
    //         const aiDiv = document.createElement('div');
    //         aiDiv.textContent = 'Browser Buddy: Loading video context...';
    //         aiDiv.style.marginBottom = '8px';
    //         aiDiv.style.color = '#4f8cff';
    //         chatMessages.appendChild(aiDiv);

    //         chrome.storage.sync.get(['apiKey'], async (result) => {
    //             const apiKey = result.apiKey;
    //             if (!apiKey) {
    //                 aiDiv.textContent = 'Browser Buddy: Please set your API key in settings.';
    //                 return;
    //             }
    //             try {
    //                 const payload = {
    //                     api_key: apiKey,
    //                     url: location.href, // YouTube video URL
    //                     language: selectedLanguage // Selected language
    //                 };

    //                 const response = await fetch(youtubeVideoSetup, {
    //                     method: 'POST',
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                     },
    //                     body: JSON.stringify(payload)
    //                 });
    //                 if (!response.ok) {
    //                     aiDiv.textContent = 'Browser Buddy: Error from server.';
    //                     return;
    //                 }
    //                 const data = await response.json();
    //                 aiDiv.textContent = 'Browser Buddy: ' + (data.answer || 'Ready! Ask your question below.');
    //             } catch (err) {
    //                 aiDiv.textContent = 'Browser Buddy: Failed to connect to backend.';
    //             }
    //         });
    //     });

    //     chatMessages.appendChild(infoDiv);
    //     chatMessages.appendChild(langLabel);
    //     chatMessages.appendChild(langSelect);
    //     chatMessages.appendChild(learnBtn);
    // }

    sendBtn.addEventListener('click', async () => {
        const userMsg = chatInput.value.trim();
        if (!userMsg) return;
        const userDiv = document.createElement('div');
        userDiv.textContent = 'You: ' + userMsg;
        userDiv.style.marginBottom = '8px';
        chatMessages.appendChild(userDiv);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
        chatHistory.push({ role: 'user', content: userMsg });

        // Show loading message
        const aiDiv = document.createElement('div');
        aiDiv.textContent = 'Browser Buddy: ...';
        aiDiv.style.marginBottom = '8px';
        aiDiv.style.color = '#4f8cff';
        chatMessages.appendChild(aiDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // For YouTube, send the URL and language; otherwise, send page text
        const pageContent = isYoutube ? location.href : document.body.innerText;
        const language = isYoutube ? selectedLanguage : undefined;

        chrome.storage.sync.get(['apiKey'], async (result) => {
            const apiKey = result.apiKey;
            if (!apiKey) {
                aiDiv.textContent = 'Browser Buddy: Please set your API key in settings.';
                return;
            }
            try {
                const payload = {
                    api_key: apiKey,
                    content: pageContent,
                    question: userMsg,
                    history: chatHistory,
                    // type: chatType,
                    url: location.href
                };  
                if (language) payload.language = language;

                const response = await fetch(pageChat, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) {
                    aiDiv.textContent = 'Browser Buddy: Error from server.';
                    return;
                }
                const data = await response.json();
                aiDiv.textContent = 'Browser Buddy: ' + (data.answer || 'No answer received.');
                chatHistory.push({ role: 'assistant', content: data.answer });
            } catch (err) {
                aiDiv.textContent = 'Browser Buddy: Failed to connect to backend.';
            }
        });
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });
}

function chatComponents() {
    const chatBtn = document.createElement('div');
    chatBtn.id = 'browser-buddy-chat-btn';
    chatBtn.style.position = 'fixed';
    chatBtn.style.bottom = '24px';
    chatBtn.style.right = '24px';
    chatBtn.style.width = '56px';
    chatBtn.style.height = '56px';
    chatBtn.style.background = '#4f8cff';
    chatBtn.style.borderRadius = '50%';
    chatBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    chatBtn.style.display = 'flex';
    chatBtn.style.alignItems = 'center';
    chatBtn.style.justifyContent = 'center';
    chatBtn.style.cursor = 'pointer';
    chatBtn.style.zIndex = '999999';
    chatBtn.title = 'Chat with Browser Buddy';
    chatBtn.innerHTML = '<span style="color:white;font-size:28px;">💬</span>';

    // Chat input area (to be passed as content)
    const chatInputArea = document.createElement('div');
    chatInputArea.style.display = 'flex';
    chatInputArea.style.padding = '8px';

    const chatInput = document.createElement('input');
    chatInput.type = 'text';
    chatInput.placeholder = 'Ask something...';
    chatInput.style.flex = '1';
    chatInput.style.padding = '8px';
    chatInput.style.border = '1px solid #ccc';
    chatInput.style.borderRadius = '6px';

    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Send';
    sendBtn.style.marginLeft = '8px';
    sendBtn.style.padding = '8px 12px';
    sendBtn.style.background = '#4f8cff';
    sendBtn.style.color = 'white';
    sendBtn.style.border = 'none';
    sendBtn.style.borderRadius = '6px';
    sendBtn.style.cursor = 'pointer';

    return {
        chatBtn,
        chatInputArea,
        chatInput,
        sendBtn
    };
}

function createChatWindow(contentElement) {
    // Create chat window container
    const chatWindow = document.createElement('div');
    chatWindow.id = 'browser-buddy-chat-window';
    chatWindow.style.position = 'fixed';
    chatWindow.style.bottom = '90px';
    chatWindow.style.right = '24px';
    chatWindow.style.width = '320px';
    chatWindow.style.height = '400px';
    chatWindow.style.background = 'white';
    chatWindow.style.border = '1px solid #ccc';
    chatWindow.style.borderRadius = '12px';
    chatWindow.style.boxShadow = '0 2px 16px rgba(0,0,0,0.2)';
    chatWindow.style.display = 'none';
    chatWindow.style.flexDirection = 'column';
    chatWindow.style.zIndex = '999999';
    chatWindow.style.overflow = 'auto';

    // --- Custom resize handle (top-left) ---
    const resizeHandle = document.createElement('div');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.left = '0';
    resizeHandle.style.top = '0';
    resizeHandle.style.width = '18px';
    resizeHandle.style.height = '18px';
    resizeHandle.style.cursor = 'nwse-resize';
    resizeHandle.style.background = 'rgba(79,140,255,0.7)';
    resizeHandle.style.borderTopLeftRadius = '12px';
    resizeHandle.style.zIndex = '1000000';
    resizeHandle.title = 'Resize';

    // Smooth resizing logic
    resizeHandle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        document.body.style.userSelect = 'none';
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = parseInt(document.defaultView.getComputedStyle(chatWindow).width, 10);
        const startHeight = parseInt(document.defaultView.getComputedStyle(chatWindow).height, 10);

        function doDrag(ev) {
            const newWidth = Math.max(200, startWidth - (ev.clientX - startX));
            const newHeight = Math.max(200, startHeight - (ev.clientY - startY));
            chatWindow.style.width = newWidth + 'px';
            chatWindow.style.height = newHeight + 'px';
        }

        function stopDrag() {
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
            document.body.style.userSelect = '';
        }

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    });

    chatWindow.appendChild(resizeHandle);

    // --- Chat header with settings icon ---
    const chatHeader = document.createElement('div');
    chatHeader.style.background = '#4f8cff';
    chatHeader.style.color = 'white';
    chatHeader.style.padding = '12px';
    chatHeader.style.borderTopLeftRadius = '12px';
    chatHeader.style.borderTopRightRadius = '12px';
    chatHeader.style.fontWeight = 'bold';
    chatHeader.style.display = 'flex';
    chatHeader.style.justifyContent = 'space-between';
    chatHeader.style.alignItems = 'center';

    chatHeader.textContent = 'Browser Buddy';

    // Settings icon
    const settingsIcon = document.createElement('span');
    settingsIcon.innerHTML = '⚙️';
    settingsIcon.style.cursor = 'pointer';
    settingsIcon.style.marginLeft = '12px';
    settingsIcon.title = 'Settings';

    settingsIcon.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'openOptions' });
    });

    chatHeader.appendChild(settingsIcon);

    // Chat messages area
    const chatMessages = document.createElement('div');
    chatMessages.style.flex = '1';
    chatMessages.style.padding = '12px';
    chatMessages.style.overflowY = 'auto';
    chatMessages.style.fontSize = '14px';

    // Compose chat window
    chatWindow.appendChild(chatHeader);
    chatWindow.appendChild(chatMessages);
    chatWindow.appendChild(contentElement);

    // Make sure chatWindow is positioned relative for the handle
    chatWindow.style.position = 'fixed';

    return { chatWindow, chatMessages };
}

function isYouTubeVideo() {
    return location.hostname.includes('youtube.com') && location.pathname === '/watch';
}