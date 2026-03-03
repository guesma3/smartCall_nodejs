// Time

let timeCycle = 0;
setInterval(() => {
    const maintenant = new Date();
    const hours = maintenant.toLocaleTimeString('en-GB', {
        timeZone: 'Africa/casablanca',
        hour: '2-digit',
        hour12: false
    });
    const minutes = maintenant.toLocaleTimeString('en-GB', {
        timeZone: 'Africa/casablanca',
        minute: '2-digit',
    });
    const seconds = maintenant.toLocaleTimeString('en-GB', {
        timeZone: 'Africa/casablanca',
        second: '2-digit'
    });
    let classSep = "";
    if (timeCycle === 0) {
        classSep = 'class="sep2"';
        timeCycle++;
    } else {
        classSep = 'class="sep1"';
        timeCycle = 0;
    }
    const sep = '<span ' + classSep + '>:</span>';
    const timeClock = hours + sep + minutes + sep + seconds;
    document.getElementById('timeInfos').innerHTML = timeClock;
}, 1000);

// Infos

const marqueesEl = document.getElementById('marquees');
const slider = document.getElementById('slide');

let mesImages = [
    "images/001.jpg",
    "images/002.jpg",
    "images/003.jpg",
    "images/004.jpg",
];
let oldImages = [];
let sliderIndex = 0;
const slideElement = document.getElementById("slideElement");
function changerImage() {
    const addedSlides = mesImages.filter(img => !oldImages.includes(img));
    const imagesChanged = (addedSlides.length > 0) || (oldImages.length !== mesImages.length);
    if (imagesChanged) { sliderIndex = 0; oldImages = [...mesImages]; }

    slideElement.style.opacity = 0;
    setTimeout(() => {
        sliderIndex = (sliderIndex + 1) % oldImages.length;
        slideElement.src = oldImages[sliderIndex];
        slideElement.style.opacity = 1;
    }, 1000);
}
setInterval(() => { changerImage(); }, 5000);

let oldMarquees = [];
checkInfos();
setInterval(checkInfos, 10000);
async function checkInfos() {
    try {
        const response = await fetch('/data2');
        const data = await response.json();
        const meteoHtml = '<div class="bloc"><img src="img/w1.png">' + data.temperature + '°C</div><div class="bloc"><img src="img/humidity.svg">' + data.temperature + '%</div><div class="bloc"><img src="img/wind.svg">' + data.vent + 'Km/h</div>';
        let internet = Number(data.internet);
        let weatherInfos = (internet) ? meteoHtml : "------";
        let fajr = (internet) ? data.fajr : "--:--";
        let dhuhr = (internet) ? data.dhuhr : "--:--";
        let asr = (internet) ? data.asr : "--:--";
        let maghrib = (internet) ? data.maghrib : "--:--";
        let isha = (internet) ? data.isha : "--:--";
        mesImages = data.images;

        document.getElementById('weatherInfos').innerHTML = weatherInfos;
        document.getElementById('fajrTime').innerHTML = fajr;
        document.getElementById('dhuhrTime').innerHTML = dhuhr;
        document.getElementById('asrTime').innerHTML = asr;
        document.getElementById('maghribTime').innerHTML = maghrib;
        document.getElementById('ishaTime').innerHTML = isha;

        let marquees = data.marquees;
        const added = marquees.filter(msg => !oldMarquees.includes(msg));
        const marqueesChanged = (added.length > 0) || (oldMarquees.length !== marquees.length);

        if (marqueesChanged) {
            let allMarquees = '<marquee behavior="" direction=""><div class="messages">';
            marquees.forEach(item => {
                allMarquees += '<h1>' + item + '</h1>';
                allMarquees += '<img src="img/a.jpg">';
            });
            allMarquees += '</div></marquee>';
            marqueesEl.innerHTML = "";
            marqueesEl.innerHTML = allMarquees;
            oldMarquees = [...marquees];
        }
    } catch (error) {
        console.log("Erreur: " + error);
    }
}

// Urgence
let urgence_exist = false;
const urgentFloat = document.getElementById('urgent-float');
let oldGreen = [];
let oldRed = [];
let currentRed = []
let appels = [];
checkUR();
setInterval(checkUR, 1000);
async function checkUR() {
    try {
        const response = await fetch('/data1');
        const data = await response.json();
        const currentGreen = data.green;
        currentRed = data.red;
        const added = currentGreen.filter(num => !oldGreen.includes(num));
        const added2 = currentRed.filter(num => !oldRed.includes(num));
        const greenChanged = (added.length > 0) || (oldGreen.length !== currentGreen.length);
        const redChanged = (added2.length > 0) || (oldRed.length !== currentRed.length);

        if (currentGreen.length === 0 && currentRed.length === 0) {
            if (greenChanged || redChanged) {
                urgentFloat.innerHTML = "";
                urgentFloat.style.opacity = "0";
                urgentFloat.style.height = "0";
                urgentFloat.style.width = "100%";
            }
        } else if (greenChanged || redChanged) {
            setUrgentFloat(currentGreen, currentRed);
        }
        function setUrgentFloat(currentGreen, currentRed) {
            urgentFloat.innerHTML = "";
            urgentFloat.style.opacity = "1";
            urgentFloat.style.height = "100%";
            urgentFloat.style.width = "100%";
            const numLength = currentGreen.length + currentRed.length;
            currentRed.forEach(alert => {
                let numDiv = document.createElement('div');
                numDiv.textContent = alert;
                if (numLength < 2) {
                    numDiv.classList = "roomNum waiting dims1";
                } else if (numLength < 3) {
                    numDiv.classList = "roomNum waiting dims2";
                } else if (numLength < 5) {
                    numDiv.classList = "roomNum waiting dims3";
                } else if (numLength < 7) {
                    numDiv.classList = "roomNum waiting dims4";
                } else if (numLength < 17) {
                    numDiv.classList = "roomNum waiting dims5";
                } else if (numLength < 26) {
                    numDiv.classList = "roomNum waiting dims6";
                } else if (numLength < 100) {
                    numDiv.classList = "roomNum waiting dims7";
                } else {
                    numDiv.classList = "roomNum waiting dims8";
                }
                tmpClasses = numDiv.getAttribute("class");
                numDiv.classList = tmpClasses + ' animated';
                urgentFloat.append(numDiv);
            });
            currentGreen.forEach(alert => {
                let numDiv = document.createElement('div');
                numDiv.textContent = alert;
                if (numLength < 2) {
                    numDiv.classList = "roomNum ok dims1";
                } else if (numLength < 3) {
                    numDiv.classList = "roomNum ok dims2";
                } else if (numLength < 5) {
                    numDiv.classList = "roomNum ok dims3";
                } else if (numLength < 7) {
                    numDiv.classList = "roomNum ok dims4";
                } else if (numLength < 17) {
                    numDiv.classList = "roomNum ok dims5";
                } else if (numLength < 26) {
                    numDiv.classList = "roomNum ok dims6";
                } else if (numLength < 100) {
                    numDiv.classList = "roomNum ok dims7";
                } else {
                    numDiv.classList = "roomNum ok dims8";
                }
                tmpClasses = numDiv.getAttribute("class");
                numDiv.classList = tmpClasses + ' animated';
                urgentFloat.append(numDiv);
            });
        }
        added2.forEach(element => { appels.push(element); console.log(appels); });
        oldGreen = [...currentGreen];
        oldRed = [...currentRed];
    } catch (error) { console.log("Error: " + error) }
}

// Sound

let pistes = ["102", "105", "107"];
let enLecture = false;

// Lancer la lecture
lirePlaylist();

// Exemple : Ajouter une piste dynamiquement après 10 secondes
setTimeout(() => {
    //pistes.push("110");
    console.log("Nouvelle piste ajoutée !");
    console.log(pistes);
    //if (!enLecture) lirePlaylist(); // Relancer si la liste était vide
}, 3000);

async function lirePlaylist() {
    if (enLecture) return; // Évite de lancer plusieurs boucles en même temps
    enLecture = true;

    while (pistes.length > 0) {
        // .shift() retire et récupère le premier élément (index 0)
        //const pisteActuelle = pistes.shift();
        const pisteActuelle = "102";
        
        console.log("Lecture de : " + pisteActuelle);

        // Attendre la fin de l'audio avant de passer au suivant
        await jouerAudio(pisteActuelle);
        
        console.log("Terminé. Reste en file : " + pistes.length);
    }

    enLecture = false;
    console.log("Liste vide.");
}

// Fonction utilitaire pour transformer l'audio en Promesse
function jouerAudio(url) {
    return new Promise((resolve) => {
        const audio = new Audio("mp3/"+url+".mp3");
        audio.onended = resolve; // Résout la promesse quand l'audio finit
        audio.onerror = resolve; // Passe au suivant même en cas d'erreur
        audio.play();
    });
}

