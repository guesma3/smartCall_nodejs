import axios from 'axios';
import { Buffer } from 'buffer';

import { SerialPort } from 'serialport';
import express from 'express';
import bodyParser from 'body-parser';

//import path from 'path';
import fs from 'fs-extra';
import moment from 'moment-timezone';


const app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(8080);
app.use(express.static('/home/user/Nettronic/public'));


const directoryPath1 = '/home/user/Nettronic/public/images';


let port = new SerialPort({
  path: '/dev/serial0',//'/dev/ttyUSB0'
  baudRate: 57600,
  autoOpen: false,
})

var green = [];
var red = [];
//var green = [];
//var red = [];
var settings = {};
var heur = 0;
var cartes = [];


// GET method route
app.get('/data1', function (req, res) { // from index.html
  res.json({
    green: green,
    red: red

  });
  //console.log('GET request to the data');
});






// post /open and log data coming
app.post('/open', function (req, res) {  // from n8n
  res.sendStatus(200);

  //return 1;

  const data = req.body;
  console.log('Data received:', data);

  //port.path = data.path;
  port.settings.path = data.path;
  //console.log(port);
  port.open(function (err) {
    if (err) {
      return console.log('Error opening port: ', err.message);
    }
  })

  // The open event is always emitted
  port.on('open', function () {
    console.log('port opened');
    //portIsOpenned = 1;
  });
  let buffer = '';
  port.on('data', function (chunk) {
    buffer += chunk.toString();

    // Check if we have a complete line (ends with newline)
    const newlineIndex = buffer.indexOf('\n');
    if (newlineIndex === -1) {
      return; // No complete message yet
    }
    // Extract the line (excluding the newline)
    const line = buffer.substring(0, newlineIndex).trim();

    // Keep any leftover data (should be empty in your case, but safe)
    //buffer = buffer.substring(newlineIndex + 1);
    buffer = "";

    if (line === '') return;

    //console.log('read ');

    //var d = port.read().toString();
    //console.log(d);
   

    const cleanData = extractJsonFromNoise(stripSpecialChars(line));


    if (!cleanData) {
      console.warn('Aucun JSON valide extrait de:', line);
      return;
    }
    //console.log('Données métier reçues:', cleanData);


    var trame = cleanData;
    try {
      //trame = JSON.parse(line); //Then parse it
      console.log('Etat : ', trame['e'], ' Slave : ', trame['s']);

      if (trame.hasOwnProperty('e') && trame.hasOwnProperty('s')) {
        //console.log('trame : ', trame);
        var s = trame['s'];
        var e = trame['e'];
        //var carte = cartes[s]
        if (s >= 0 && s <= 50) {
          //console.log('s : ', s);


          if (!cartes[s]) {
            cartes[s] = { "etat": -1, "type": -1, "t1": -1, "t2": -1, "origine": -1 };
          }
          if (e != cartes[s].etat) {

            console.log('etat changed : ', trame);
            var chambre = (settings.nom && settings.nom[s - 1]) ? settings.nom[s - 1] : `Chambre_${s - 1}`; // s-1 because chambre start at 1
            if (e == 1 || e == 2 || e == 3) { // call   0-1
              if (cartes[s].origine == -1)
                cartes[s].origine = e;
              //cartes[s].t1 = Math.floor(Date.now() / 1000) ;
              if (cartes[s].t1 == -1)
                cartes[s].t1 = getCasablancaTime();
              cartes[s].type = 1;

              if (!red.includes(chambre))
                red.push(chambre);
              var index = green.indexOf(chambre);
              if (index !== -1)
                green.splice(index, 1);
            } else if (e == 4) { // presence
              // Scenario: 4... (Start of Visit) OR ...-4... (Nurse Arrives)
              if (cartes[s].etat == 0 || cartes[s].etat == -1) {
                // Direct Visit (4-0)
                // t1 : le temps du e=4
                if (cartes[s].origine == -1) cartes[s].origine = 4;
                cartes[s].t1 = getCasablancaTime();
                cartes[s].type = 1; // Temporary
              }
              // Case: Prior Call -> Presence
              else {
                // Nurse arrived after call.  
                cartes[s].t2 = getCasablancaTime();
              }

              if (!green.includes(chambre))
                green.push(chambre);
              var index = red.indexOf(chambre);
              if (index !== -1)
                red.splice(index, 1);

            } else if (e == 0) {  // normale
              var finalType = 1; // Default to 1 (Unanswered)

              // t2 : le temps du e=0
              // t2 : le temps du e=0 (if not already set by e=4)
              if (cartes[s].t2 == -1)
                cartes[s].t2 = getCasablancaTime();

              // Determine Type based on sequence
              // Scenario: 4-0 > origine = 4 , type = 2
              if (cartes[s].origine == 4) {
                finalType = 2; // Visit
              }
              // Scenarios: Calls (1 or 3)
              else if (cartes[s].origine == 1 || cartes[s].origine == 3) {
                // If ended with Presence (4) -> Answered (Type 0)
                // Scenarios: 1-2-3-4-0, 1-2-4-0, 3-4-0
                if (cartes[s].etat == 4) {
                  finalType = 0;
                }
                // If ended without Presence -> Unanswered (Type 1)
                // Scenarios: 1-2-3-0, 3-0
                else {
                  finalType = 1;
                }
              }

              let logData = {
                "chambre": chambre,
                "type": finalType,
                "t1": cartes[s].t1,
                "t2": cartes[s].t2,
                "origine": cartes[s].origine
              };

              //console.log('chambre : ', chambre);
              //console.log('Log data to send:', logData);

              //use axios to post
              axios.post('http://127.0.0.1:5678/webhook/log_chambres', logData)
                .then(function (response) {
                  //console.log('Data sent successfully:', response.data);
                })
                .catch(function (error) {
                  console.error('Error sending data:', error);
                });

              // Reset visuals
              var index = red.indexOf(chambre);
              if (index !== -1)
                red.splice(index, 1);

              index = green.indexOf(chambre);
              if (index !== -1)
                green.splice(index, 1);

              // Reset Card State
              cartes[s].origine = -1;
              cartes[s].t1 = -1;
              cartes[s].t2 = -1;
              cartes[s].type = -1;

            }
            cartes[s].etat = e;
            sendToNuxt();

          }

        }

      } else {
        //console.log('trame err : ',trame);
      }



    } catch (err) {
      if (err instanceof SyntaxError) {
        console.log('Ignored invalid JSON:', line);
      } else {
        console.error(err);
      }
    }



  });

});


app.post('/chambres', function (req, res) { // from n8n

  const data = req.body;
  console.log('Data received:', data);
  res.sendStatus(200);
  console.log('POST request to /chambres');
  settings = data;
  console.log(settings);
  for (let i = 0; i < settings.nbChambres; i++) {
    cartes[i] = JSON.parse('{"etat":0, "type":0, "t1":-1, "t2":-1 ,"origine":-1}');
  }


  console.log(cartes);
});


function sendToNuxt() {
  const d = {
    call: {
      green: green,
      red: red
    }
  }
  //console.log('Calling..');
  //axios.post('http://192.168.168.19:3000/api/post/call', d)
  axios.post('http://localhost:3000/api/post/call', d)
    .then(function (response) {
      //console.log('Data sent successfully:', response.data);
    })
    .catch(function (error) {
      console.error('Error sending data:', error);
    });
}
//sendToNuxt();



function stripSpecialChars(str) {
  if (typeof str !== 'string') return '';
  
  // [^{}":,0-9a-zA-Z] signifie : tout ce qui N'EST PAS dans cette liste est supprimé
  return str.replace(/[^{}":,0-9a-zA-Z]/g, '');
}


function extractJsonFromNoise(str) {
  if (typeof str !== 'string') return null;

  const startIdx = str.indexOf('{');
  const endIdx = str.lastIndexOf('}');

  // Vérification basique : doit avoir un début et une fin, et le début doit être avant la fin
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return null;
  }

  // Extraction de la partie potentielle
  const potentialJson = str.substring(startIdx, endIdx + 1);

  try {
    const parsed = JSON.parse(potentialJson);

    // Validation supplémentaire : s'assurer que c'est bien un objet ou un tableau
    if (parsed && (typeof parsed === 'object' || Array.isArray(parsed))) {
      return parsed;
    }

    return null;
  } catch (error) {
    return null;
  }
}



function getCasablancaTime() {
  return moment().tz('Africa/Casablanca').format('YYYY-MM-DD HH:mm:ss');
}

console.log(getCasablancaTime()); // Output: 2024-01-15 14:30:45