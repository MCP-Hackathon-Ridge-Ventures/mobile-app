import { MiniAppViewer } from "@/components/MiniAppViewer";
import React from "react";

const testHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Mini App</title>
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
            max-width: 400px;
            width: 90%;
        }

        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            opacity: 0;
            animation: fadeInUp 0.8s ease forwards;
        }

        p {
            font-size: 1.1rem;
            margin-bottom: 2rem;
            opacity: 0;
            animation: fadeInUp 0.8s ease 0.3s forwards;
        }

        .buttons {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            opacity: 0;
            animation: fadeInUp 0.8s ease 0.6s forwards;
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

        .close-btn {
            background: rgba(255, 107, 107, 0.8);
            border-color: rgba(255, 107, 107, 1);
        }

        .status {
            margin-top: 2rem;
            font-size: 0.9rem;
            opacity: 0.8;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .counter {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 25px;
            margin: 1rem 0;
            font-size: 1.2rem;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Test Mini App</h1>
        <p>This is a self-contained mini-app running in a WebView!</p>
        
        <div class="counter">
            Counter: <span id="counter">0</span>
        </div>

        <div class="buttons">
            <button onclick="incrementCounter()">Increment Counter</button>
            <button onclick="showAlert()">Show Alert</button>
            <button onclick="logMessage()">Log Message</button>
            <button onclick="closeApp()" class="close-btn">Close Mini App</button>
        </div>

        <div class="status">
            <div>Host API: <span id="hostStatus">Checking...</span></div>
            <div>Platform: <span id="platform">Unknown</span></div>
        </div>
    </div>

    <script>
        let counter = 0;

        function init() {
            updateCounter();
            checkHostAPI();
            
            if (window.MiniAppHost) {
                window.MiniAppHost.log('✅ Mini-app initialized successfully!');
            }
        }

        function incrementCounter() {
            counter++;
            updateCounter();
            
            if (window.MiniAppHost) {
                window.MiniAppHost.log(\`Counter incremented to \${counter}\`);
            }
        }

        function updateCounter() {
            document.getElementById('counter').textContent = counter;
        }

        function showAlert() {
            alert('Hello from the Mini App! 👋');
        }

        function logMessage() {
            const message = \`Mini-app says hello at \${new Date().toLocaleTimeString()}\`;
            console.log(message);
            
            if (window.MiniAppHost) {
                window.MiniAppHost.log(message);
            }
        }

        function closeApp() {
            if (window.MiniAppHost && window.MiniAppHost.close) {
                window.MiniAppHost.close();
            } else {
                alert('Close function not available');
            }
        }

        function checkHostAPI() {
            const hostStatus = document.getElementById('hostStatus');
            const platform = document.getElementById('platform');
            
            if (window.MiniAppHost) {
                hostStatus.textContent = '✅ Available';
                hostStatus.style.color = '#4ade80';
                
                try {
                    const hostInfo = window.MiniAppHost.getHostInfo();
                    platform.textContent = hostInfo.platform || 'Unknown';
                } catch (e) {
                    platform.textContent = 'Error getting info';
                }
            } else {
                hostStatus.textContent = '❌ Not Available';
                hostStatus.style.color = '#f87171';
                platform.textContent = 'Web Browser';
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }

        setTimeout(checkHostAPI, 500);
        setTimeout(checkHostAPI, 1000);
    </script>
</body>
</html>`;

export default function TestWebViewScreen() {
  return (
    <MiniAppViewer
      deploymentId="test"
      files={[]}
      appName="Test WebView Mini App"
      testHtmlContent={testHtmlContent}
    />
  );
}
