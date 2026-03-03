import axios from 'axios';
//"Je teste une URL toutes les 3 secondes jusqu’à ce qu’elle réponde correctement, puis j’arrête."

const TARGET_URL = 'http://127.0.0.1:5678/webhook/startup';
const CHECK_INTERVAL = 3000; // 3 seconds

let isChecking = false;
let intervalId;

async function checkUrl() {
    // If a check is already in progress, skip this iteration
    if (isChecking) {
        return;
    }
    
    isChecking = true;
    
    try {
        const response = await axios.get(TARGET_URL);
        
        // Check if the response is successful (status code 2xx)
        if (response.status >= 200 && response.status < 300) {
            console.log(`✅ Success! URL ${TARGET_URL} responded with status: ${response.status}`);
            console.log('Exiting...');
            clearInterval(intervalId);
            process.exit(0);
        } else {
            console.log(`⚠️  URL responded with non-2xx status: ${response.status}`);
        }
    } catch (error) {
        if (error.response) {
            // Server responded with error status
            console.log(`❌ Server error: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
            // Request was made but no response received
            console.log('❌ No response received - server may be down or unreachable');
        } else {
            // Something else went wrong
            console.log('❌ Error:', error.message);
        }
    } finally {
        // Always reset the checking flag
        isChecking = false;
    }
}

console.log(`Starting URL health check for: ${TARGET_URL}`);
console.log('Checking every 3 seconds...\n');

// Start checking immediately
checkUrl();

// Set up interval for subsequent checks
intervalId = setInterval(checkUrl, CHECK_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Shutting down...');
    clearInterval(intervalId);
    process.exit(0);
});