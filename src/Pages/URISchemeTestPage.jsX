import React, { useState, useEffect } from 'react';

const URISchemeTestPage = () => {
  const [uri, setUri] = useState('reweard://verify-email?token=abc123');
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showManualFallback, setShowManualFallback] = useState(false);

  useEffect(() => {
    addLog('🎯 ReWeard URI Scheme Tester Ready', 'info');
    addLog('Click any button below to open the ReWeard app', 'info');

    // Listen for page visibility to detect if app opened
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addLog('✅ App opened successfully!', 'success');
        setIsLoading(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type, id: Date.now() }]);
  };

  const clearLogs = () => setLogs([]);

  // Main function to open ReWeard app
  const openReWeardApp = (customUri = uri) => {
    addLog(`🚀 Opening ReWeard app: ${customUri}`, 'info');
    setIsLoading(true);
    setShowManualFallback(false);

    try {
      // Primary method: Direct window.location
      window.location.href = customUri;
      addLog('📱 Attempting to open app...', 'info');

      // Fallback: If still on page after 3 seconds, show manual options
      setTimeout(() => {
        if (!document.hidden) {
          addLog('⚠️ App might not have opened automatically', 'warning');
          setShowManualFallback(true);
          setIsLoading(false);
        }
      }, 3000);

    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
      setIsLoading(false);
      setShowManualFallback(true);
    }
  };

  // Alternative method using hidden iframe
  const openWithIframe = (customUri = uri) => {
    addLog(`🔄 Trying iframe method: ${customUri}`, 'info');

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = customUri;
    document.body.appendChild(iframe);

    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.remove();
      }
    }, 2000);
  };

  // Copy URI to clipboard
  const copyToClipboard = async (customUri = uri) => {
    try {
      await navigator.clipboard.writeText(customUri);
      addLog('✅ URI copied to clipboard!', 'success');
      alert(`Copied to clipboard: ${customUri}\n\nPaste this in your browser address bar to open the ReWeard app.`);
    } catch (err) {
      prompt('Copy this URI manually:', customUri);
    }
  };

  // Quick test scenarios
  const quickTests = [
    { 
      name: '🏠 Home', 
      uri: 'reweard://home',
      description: 'Open app home screen'
    },
    { 
      name: '👤 Profile', 
      uri: 'reweard://profile',
      description: 'Open user profile'
    },
    { 
      name: '📧 Email Verification', 
      uri: 'reweard://verify-email?token=test123',
      description: 'Email verification with test token'
    },
    { 
      name: '🛍️ Product View', 
      uri: 'reweard://product?id=12345',
      description: 'View specific product'
    },
    { 
      name: '⚙️ Settings', 
      uri: 'reweard://settings',
      description: 'Open app settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🚀 ReWeard App Launcher
          </h1>
          <p className="text-gray-600">
            Test your custom URI scheme: <code className="bg-gray-200 px-2 py-1 rounded">reweard://</code>
          </p>
        </div>

        {/* Custom URI Input */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Custom URI Test</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              placeholder="reweard://verify-email?token=abc123"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => openReWeardApp()}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Opening...
                </>
              ) : (
                'Open App'
              )}
            </button>
          </div>

          {/* Manual Fallback Options */}
          {showManualFallback && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">App didn't open? Try these:</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => openWithIframe()}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                >
                  Try Alternative Method
                </button>
                <button
                  onClick={() => copyToClipboard()}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => openReWeardApp()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Test Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickTests.map((test, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <h3 className="font-medium text-lg mb-2">{test.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                <button
                  onClick={() => openReWeardApp(test.uri)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Console Log */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Console Output</h2>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear
            </button>
          </div>
          
          <div 
            className="bg-black text-green-400 font-mono text-sm rounded-lg p-4 h-64 overflow-y-auto"
          >
            {logs.length === 0 ? (
              <div className="text-gray-500">Ready to test ReWeard app links...</div>
            ) : (
              logs.map(log => (
                <div
                  key={log.id}
                  className={`mb-1 ${
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warning' ? 'text-yellow-400' : 'text-green-400'
                  }`}
                >
                  [{log.timestamp}] {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">How to Use:</h3>
          <ol className="text-blue-700 space-y-1">
            <li>1. Make sure your ReWeard app is installed on this device</li>
            <li>2. Click any "Open App" button above</li>
            <li>3. Your browser should ask permission to open the app</li>
            <li>4. Allow the redirect to open ReWeard app</li>
            <li>5. If it doesn't work, try the fallback options or copy the link manually</li>
          </ol>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-100 rounded-lg p-4 mt-6 text-sm">
          <details>
            <summary className="cursor-pointer font-semibold">Debug Information</summary>
            <div className="mt-2 space-y-1">
              <div><strong>User Agent:</strong> {navigator.userAgent}</div>
              <div><strong>Platform:</strong> {navigator.platform}</div>
              <div><strong>Current URL:</strong> {window.location.href}</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default URISchemeTestPage;