import open from 'open';
import express from 'express';

const app = express();

app.listen(9901);

app.get('/run', function (req, res) {
    open('http://localhost:3000', {
        app: {
            name: 'chromium',
            arguments: [
                '--kiosk',
                '--noerrdialogs',
                '--disable-infobars',
                '--disable-session-crashed-bubble',
                '--disable-features=TranslateUI',
                '--start-fullscreen', // Optionnel : si --kiosk ne suffit pas
                '--no-sandbox',      // Parfois nécessaire en dev (mais pas en prod)
                '--test-type'
            ]
        }
    //})
    //.then(() => {
        // Exit the process after successfully opening the browser
        //process.exit(0);
    }).catch((error) => {
        console.error('Failed to open browser:', error);
        process.exit(1);
    });
    
    res.send('ok');
    //console.log('GET request to /run');
});
