
    // Check if the browser supports the beforeinstallprompt event
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        window.addEventListener('beforeinstallprompt', (event) => {
            // Prevent the default browser prompt
            event.preventDefault();

            // Create the humorous installation prompt
            const installPrompt = document.createElement('div');
            installPrompt.className = 'install-prompt';
            installPrompt.innerHTML = `
                <div class="install-prompt-content">
                    <div class="install-prompt-icon">🚀</div>
                    <div class="install-prompt-text">
                        <p>Don't be the only one without our web app! It's cooler than a penguin in shades. 🐧😎</p>
                    </div>
                    <div class="install-prompt-button">
		        <button id="dismiss-button">Nah, I'm Good</button>
                        <button id="install-button">Get Cool</button>
                        
                    </div>
                </div>
            `;

            // Append the prompt to the bottom of the body
            document.body.appendChild(installPrompt);

            const installButton = document.getElementById('install-button');
            const dismissButton = document.getElementById('dismiss-button');

            // Handle user actions
            installButton.addEventListener('click', () => {
                // Show the browser's installation prompt
                event.prompt();
                // Wait for the user to respond
                event.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the installation');
                    }
                    // Remove the prompt
                    document.body.removeChild(installPrompt);
                });
            });

            dismissButton.addEventListener('click', () => {
                // Dismiss the prompt
                document.body.removeChild(installPrompt);
            });
        });
    }
