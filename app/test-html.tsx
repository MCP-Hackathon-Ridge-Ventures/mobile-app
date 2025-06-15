import { MiniAppViewer } from "@/components/MiniAppViewer";
import React from "react";
import { View } from "react-native";

const testHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Mini App</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            text-align: center;
            max-width: 400px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            margin-top: 50px;
        }
        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        p {
            font-size: 1.2em;
            margin-bottom: 20px;
            opacity: 0.9;
        }
        button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 1.1em;
            border-radius: 10px;
            cursor: pointer;
            transition: background 0.3s;
            margin: 10px;
            min-width: 120px;
        }
        button:hover {
            background: #45a049;
        }
        button:active {
            transform: scale(0.98);
        }
        .counter {
            font-size: 3em;
            margin: 20px 0;
            color: #FFD700;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .close-btn {
            background: #f44336;
        }
        .close-btn:hover {
            background: #da190b;
        }
        .status {
            background: rgba(0,0,0,0.3);
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
            font-size: 0.9em;
        }
        .feature-list {
            text-align: left;
            background: rgba(0,0,0,0.2);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .feature-list ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .feature-list li {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Mini App Test</h1>
        <p>This mini-app is running on a local HTTP server!</p>
        
        <div class="counter" id="counter">0</div>
        
        <button onclick="increment()">Increment Counter</button>
        <button onclick="testFeatures()">Test Features</button>
        <button class="close-btn" onclick="closeMiniApp()">Close Mini App</button>
        
        <div class="feature-list">
            <h3>✅ Server Features Working:</h3>
            <ul>
                <li>Local HTTP server serving files</li>
                <li>JavaScript execution in WebView</li>
                <li>CSS styling and animations</li>
                <li>Host API communication</li>
                <li>Console logging to React Native</li>
            </ul>
        </div>
        
        <div class="status" id="status">Ready to test!</div>
    </div>

    <script>
        let count = 0;
        
        function increment() {
            count++;
            document.getElementById('counter').textContent = count;
            updateStatus(\`Counter incremented to \${count}\`);
            console.log('Counter incremented to', count);
        }
        
        function testFeatures() {
            console.log('Testing mini-app features...');
            console.warn('This is a test warning');
            console.error('This is a test error (not real)');
            
            updateStatus('Check React Native console for log messages!');
            
            // Test host API
            if (window.MiniAppHost) {
                const hostInfo = window.MiniAppHost.getHostInfo();
                console.log('Host info:', hostInfo);
                window.MiniAppHost.log('Successfully called MiniAppHost.log()');
                
                updateStatus(\`Running on \${hostInfo.platform} with local server: \${hostInfo.hasLocalServer}\`);
            } else {
                updateStatus('MiniAppHost API not available');
            }
        }
        
        function closeMiniApp() {
            console.log('Close button pressed');
            if (window.MiniAppHost) {
                window.MiniAppHost.close();
            } else {
                alert('MiniAppHost not available - running in regular browser');
            }
        }
        
        function updateStatus(message) {
            document.getElementById('status').textContent = message;
        }
        
        // Initialize when page loads
        window.addEventListener('load', function() {
            console.log('🎉 Mini-app loaded successfully with local server!');
            updateStatus('Mini-app loaded and ready!');
            
            // Test host API on load
            setTimeout(() => {
                if (window.MiniAppHost) {
                    const hostInfo = window.MiniAppHost.getHostInfo();
                    updateStatus(\`Connected to \${hostInfo.platform} host v\${hostInfo.version}\`);
                } else {
                    updateStatus('Running in browser mode');
                }
            }, 1000);
        });
    </script>
</body>
</html>`;

export default function TestHtmlScreen() {
  return (
    <View style={{ flex: 1 }}>
      <MiniAppViewer
        deploymentId="test-html-server"
        files={[]}
        appName="Test HTML Server Mini-App"
        testHtmlContent={testHtmlContent}
      />
    </View>
  );
}
