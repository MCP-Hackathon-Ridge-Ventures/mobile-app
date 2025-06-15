import { MiniAppViewer } from "@/components/MiniAppViewer";
import React from "react";

export default function TestBridgeScreen() {
  // Read the HTML content from our test file
  const testHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bridge Test Mini App</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .container {
            text-align: center;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        p {
            font-size: 1.1rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }

        .section {
            margin: 2rem 0;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }

        .section h3 {
            margin-bottom: 1rem;
            color: #FFD700;
        }

        .buttons {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin: 1rem 0;
        }

        button {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }

        button:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .close-btn {
            background: rgba(255, 107, 107, 0.8);
            border-color: rgba(255, 107, 107, 1);
        }

        .status {
            margin-top: 1rem;
            font-size: 0.9rem;
            opacity: 0.8;
            background: rgba(0,0,0,0.3);
            padding: 1rem;
            border-radius: 10px;
        }

        input {
            padding: 0.5rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border-radius: 5px;
            margin: 0.5rem;
        }

        input::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌉 Bridge Test</h1>
        <p>Testing webview-bridge functionality!</p>
        
        <div class="status" id="status">
            Bridge Status: <span id="bridgeStatus">Checking...</span>
        </div>

        <div class="section">
            <h3>🗄️ LocalStorage Test</h3>
            <input type="text" id="keyInput" placeholder="Key">
            <input type="text" id="valueInput" placeholder="Value">
            <div class="buttons">
                <button onclick="setItem()">Set Item</button>
                <button onclick="getItem()">Get Item</button>
                <button onclick="removeItem()">Remove Item</button>
                <button onclick="clearStorage()">Clear Storage</button>
            </div>
            <div id="storageResult" class="status"></div>
        </div>

        <div class="section">
            <h3>📱 App Control</h3>
            <div class="buttons">
                <button onclick="testLog()">Test Logging</button>
                <button onclick="getHostInfo()">Get Host Info</button>
                <button onclick="closeApp()" class="close-btn">Close App</button>
            </div>
            <div id="appResult" class="status"></div>
        </div>
    </div>

    <script type="module">
        // Import the bridge using the global linkBridge function
        let bridge;
        let bridgeReady = false;

        // Function to check if webview-bridge is available
        async function initBridge() {
            try {
                // Check if linkBridge is available (it should be injected by webview-bridge)
                if (typeof linkBridge !== 'undefined') {
                    bridge = linkBridge({
                        onReady: async (method) => {
                            console.log('🌉 Bridge is ready!');
                            bridgeReady = true;
                            document.getElementById('bridgeStatus').textContent = '✅ Ready';
                            document.getElementById('bridgeStatus').style.color = '#4ade80';
                            
                            // Enable buttons
                            const buttons = document.querySelectorAll('button');
                            buttons.forEach(btn => btn.disabled = false);
                        },
                    });
                } else {
                    throw new Error('linkBridge not available');
                }
            } catch (error) {
                console.error('Bridge initialization failed:', error);
                document.getElementById('bridgeStatus').textContent = '❌ Failed';
                document.getElementById('bridgeStatus').style.color = '#f87171';
            }
        }

        // LocalStorage functions
        window.setItem = async function() {
            const key = document.getElementById('keyInput').value;
            const value = document.getElementById('valueInput').value;
            
            if (!key || !value) {
                document.getElementById('storageResult').textContent = 'Please enter both key and value';
                return;
            }
            
            try {
                const result = await bridge.setLocalStorageItem(key, value);
                document.getElementById('storageResult').textContent = 
                    \`✅ Set "\${key}" = "\${value}" (\${result})\`;
            } catch (error) {
                document.getElementById('storageResult').textContent = 
                    \`❌ Error: \${error.message}\`;
            }
        };

        window.getItem = async function() {
            const key = document.getElementById('keyInput').value;
            
            if (!key) {
                document.getElementById('storageResult').textContent = 'Please enter a key';
                return;
            }
            
            try {
                const result = await bridge.getLocalStorageItem(key);
                document.getElementById('storageResult').textContent = 
                    \`📦 "\${key}" = \${result === null ? 'null' : \`"\${result}"\`}\`;
            } catch (error) {
                document.getElementById('storageResult').textContent = 
                    \`❌ Error: \${error.message}\`;
            }
        };

        window.removeItem = async function() {
            const key = document.getElementById('keyInput').value;
            
            if (!key) {
                document.getElementById('storageResult').textContent = 'Please enter a key';
                return;
            }
            
            try {
                const result = await bridge.removeLocalStorageItem(key);
                document.getElementById('storageResult').textContent = 
                    \`🗑️ Removed "\${key}" (\${result})\`;
            } catch (error) {
                document.getElementById('storageResult').textContent = 
                    \`❌ Error: \${error.message}\`;
            }
        };

        window.clearStorage = async function() {
            try {
                const result = await bridge.clearLocalStorage();
                document.getElementById('storageResult').textContent = 
                    \`🧹 Cleared storage (\${result})\`;
            } catch (error) {
                document.getElementById('storageResult').textContent = 
                    \`❌ Error: \${error.message}\`;
            }
        };

        // App control functions
        window.testLog = async function() {
            try {
                const message = \`Test log at \${new Date().toLocaleTimeString()}\`;
                const result = await bridge.logMessage(message);
                document.getElementById('appResult').textContent = 
                    \`📝 Logged message (\${result})\`;
            } catch (error) {
                document.getElementById('appResult').textContent = 
                    \`❌ Error: \${error.message}\`;
            }
        };

        window.getHostInfo = async function() {
            try {
                const info = await bridge.getHostInfo();
                document.getElementById('appResult').innerHTML = 
                    \`📱 Host Info:<br/>\${JSON.stringify(info, null, 2)}\`;
            } catch (error) {
                document.getElementById('appResult').textContent = 
                    \`❌ Error: \${error.message}\`;
            }
        };

        window.closeApp = async function() {
            try {
                const result = await bridge.closeApp();
                document.getElementById('appResult').textContent = 
                    \`👋 Close requested (\${result})\`;
            } catch (error) {
                document.getElementById('appResult').textContent = 
                    \`❌ Error: \${error.message}\`;
            }
        };

        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            // Disable all buttons initially
            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = true);
            
            // Initialize bridge
            initBridge();
        });

        // Also try to initialize immediately in case DOM is already loaded
        if (document.readyState !== 'loading') {
            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = true);
            initBridge();
        }
    </script>
</body>
</html>`;

  return (
    <MiniAppViewer
      deploymentId="bridge-test"
      files={[]}
      appName="Bridge Test App"
      testHtmlContent={testHtmlContent}
    />
  );
}
