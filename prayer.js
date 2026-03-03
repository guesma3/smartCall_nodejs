import axios from 'axios';
import https from 'https';
import * as cheerio from 'cheerio';

async function getPrayerTimes(ville = '58') {
    try {
        // Create https agent that doesn't reject unauthorized certificates
        const agent = new https.Agent({
            rejectUnauthorized: false
        });

        // Fetch the HTML from the URL with the custom agent
        const response = await axios.get(`https://www.habous.gov.ma/prieres/horaire-api.php?ville=${ville}`, {
            httpsAgent: agent
        });
        
        const html = response.data;
        const $ = cheerio.load(html);

        //console.log('HTML content received. Looking for prayer times...');
        
        // Let's first debug by logging all tables found
        const tableCount = $('table').length;
        //console.log(`Found ${tableCount} tables in the HTML`);

        const prayerTimes = {};
    
        // Method 2: Alternative approach - look for specific patterns
        if (Object.keys(prayerTimes).length === 0) {
           // console.log('\nTrying alternative parsing method...');
            
            // Look for prayer times in the entire HTML
            const text = $('body').text();
            
            // Try to find patterns like "05:39", "13:33", etc.
            const timePattern = /\b\d{1,2}:\d{2}\b/g;
            const times = text.match(timePattern) || [];
            
            //console.log('Found times:', times);
            
            // If we find exactly 5 times, assume they're prayer times in order
            if (times.length >= 5) {
                prayerTimes.fajr = times[0];
                prayerTimes.dhuhr = times[2];
                prayerTimes.asr = times[3];
                prayerTimes.maghrib = times[4];
                prayerTimes.isha = times[5];
            }
        }

        if (Object.keys(prayerTimes).length === 0) {
            console.log('\nCould not find prayer times. Here are the first 500 chars of HTML:');
            console.log(html.substring(0, 500));
        }

        console.log(prayerTimes);
        return prayerTimes;

    } catch (error) {
        console.error('Error fetching prayer times:', error.message);
        throw error;
    }
}

// Get ville from command line arguments or use default
const ville = process.argv[2] || '58';  //58 casablanca

// Execute the function
getPrayerTimes(ville);