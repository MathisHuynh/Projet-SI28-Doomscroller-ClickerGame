import { upgrades, checkPowerup } from "./constantes/upgrades.js";
import { stats } from "./constantes/stats.js";
import { medias } from "./constantes/medias.js"

// --- INITIALISATION DES VARIABLES DE DONNÉES ---
let scorestr = document.querySelector('.score-val');

let total_score = 0;
let score = 100000;

let loading = document.querySelector('.loading');

let trophies = document.querySelector('.trophies');

let cpsstr = document.getElementById("cps");
let spcstr = document.getElementById("spc");
let spsstr = document.getElementById("sps");
let divImgClickable = document.querySelector('.div-img-clickable');

// --- CURSEUR ---
const cursor = document.querySelector('.cursor');

const _upgrades = document.querySelectorAll('.upgrade');
const _clicker = document.querySelector('.clicker');

// --- GESTION AUDIO ---
const bgm = new Audio('/assets/audio/bgm.mp3');
bgm.volume = 0.2;
bgm.loop = true;

// --- AFFICHAGE DES DESCRIPTIONS ---

const desc = document.querySelector('.desc');

// --- GESTION DU MOUVEMENT ---
window.addEventListener('mousemove', (e) => {

    //const {width,height} = cursor.getBoundingClientRect();
    cursor.style.left = `${e.clientX}px`; //-width/2
    cursor.style.top = `${e.clientY}px`; //-height/2

    if (desc.style.display === 'block') {
        desc.style.left = (e.clientX+22) + 'px';
        desc.style.top = (e.clientY+22) + 'px';
    }
});

// --- AFFICHAGE ET LOGIQUE POWERUP ---
window.afficherDesc = function(upgradeID) {
    const upg = upgrades.find(u => u.id === upgradeID);
    if (!upg) return;

    const niveauActuel = parseInt(upg.niveau.textContent);
    const puIndex = checkPowerup(upgradeID, niveauActuel);

    // Mise à jour du contenu
    if (puIndex !== 0 && upg.powerup && upg.powerup[puIndex - 1]) {
        const nextPowerup = upg.powerup[puIndex - 1];
        desc.innerHTML = `<u>POWERUP: ${nextPowerup.nom}</u><br><br>${nextPowerup.desc}`;
    } else {
        desc.innerHTML = `<u>${upg.nom}</u><br><br>${upg.desc || "Amélioration standard"}`;
    }

    // Affichage
    desc.style.display = 'block';
};

// --- FERMETURE ---
window.cacherDesc = function() {
    desc.style.display = 'none';
};

// --- AFFICHAGE TROPHIES ---

window.afficherTrophies = function(){
    if(trophies.style.display==='none'){
        trophies.style.display='block';
    }else{
        trophies.style.display='none';
    }
};

// --- LOGIQUE DE CLIC ET CPS ---
let clickTimes = [];
const MAX_CPS_EFFECT = 10;

function getCPS() {
    const now = Date.now();
    clickTimes = clickTimes.filter(time => now - time < 1000);
    return clickTimes.length;
}

function createFeedback(val){
    const x = Math.random() * 10;
    const y = Math.random() * 10;

    const div = document.createElement('div');
    div.className = 'clickfeedback fade-up';
    div.style.top = (40 + y) + "%";
    div.style.left = (43 + x) + "%";
    
    div.textContent = "+" + Math.round(val) + " ";
    const img = document.createElement('img');
    img.src = "./assets/currency.gif";
    img.className = "onclickicon";
    img.draggable = false;
    div.appendChild(img);
    
    divImgClickable.appendChild(div);

    div.addEventListener('animationend', () => div.remove(), { once: true }); 

    if (divImgClickable.children.length > 15) {
        divImgClickable.removeChild(divImgClickable.firstChild);
    }
}

function playscoresfx(){
    const clicksfx = new Audio('/assets/audio/click.mp3');
    clicksfx.currentTime = 0;
    clicksfx.playbackRate = 0.8 + Math.random()*0.4;
    clicksfx.play();
}

function incrementerScore(event, isClick, val = stats.spc*stats.spcm) {
    clickTimes.push(Date.now());

    playscoresfx();


    nextMedia(isClick);

    score += stats.spc;
    total_score += stats.spc;
    scorestr.textContent = Math.round(score);

    // Feedback
    createFeedback(val);
}

// --- LOGIQUE D'ACHAT ---
function acheterUpgrade(upgradeID) {
    const mu = upgrades.find((u) => u.id === upgradeID);
    const up= document.getElementById(upgradeID);
    cursor.src = "./assets/UI/cursor/click.png";
    up.style.transform= "scale(1.02)";
    

    if (score >= mu.prix) {    
        score -= mu.prix;
        mu.achat(); // Logique interne powerup
        
        // MAJ stats et niveaux
        let nouveauNiveau = parseInt(mu.niveau.textContent) + 1;
        mu.niveau.textContent = nouveauNiveau;
        
        // MAJ bonus
        mu.bonus = parseFloat((mu.bonus * mu.multiplicateurScore).toFixed(2));
        mu.bonusstr.textContent = mu.bonus;

        // MAJ prix
        mu.prix *= mu.multiplicateurPrix;
        mu.prixstr.textContent = Math.round(mu.prix);

        scorestr.textContent = Math.round(score);
        
        afficherDesc(upgradeID);
    }

    setTimeout(() => {
        cursor.src = "./assets/UI/cursor/pointer.png";
        up.style.transform= "scale(1)";
    }, 100);
}

// --- LOGIQUE DE SCROLLING ET ANIMATION ---
var area = document.getElementById('area');
var scrollContent = document.getElementById('scrollContent');
var isDragging = false;
var lastY = 0;
var currentOffset = 0;
var rafId = null;

function getNextMedia() {
    return medias[Math.floor(Math.random() * medias.length)];
}

let activeCleanup = null;

function finishAnimation() {
    if (activeCleanup) activeCleanup();
}

function nextMedia(isClick = false) {
    finishAnimation();
    isDragging = false; 
    cancelAnimationFrame(rafId);

    const scrollArea = document.querySelector('.scroll-area');
    const itemHeight = (scrollContent.querySelector('.item')) ? scrollContent.querySelector('.item').offsetHeight : 0;
    currentOffset = itemHeight; 

    

    let duration = 0.5;
    if (isClick) {
        const cps = getCPS();
        duration = Math.max(0.05, 0.25 - (cps / MAX_CPS_EFFECT) * 0.2);
    }

    if (scrollArea) {
        const popDuration = 0.1;
        scrollArea.style.transition = `transform ${popDuration}s cubic-bezier(0.25, 1, 0.5, 1)`;
        scrollArea.style.transform = 'scale(1.02)';

        setTimeout(() => {
            if (scrollArea) scrollArea.style.transform = 'scale(1)';
        }, popDuration * 1000);
    }

    const performCleanup = () => {
        scrollContent.removeEventListener('transitionend', handleEnd);
        scrollContent.style.transition = 'none';
        
        if (scrollArea) {
            scrollArea.style.transition = 'none';
            scrollArea.style.transform = 'scale(1)';
        }

        const items = scrollContent.querySelectorAll('.item img');
        if (items.length >= 2) {
            // 1. L'item 1 (celui qui vient d'arriver au centre) devient l'item 0
            // On s'assure qu'il passe en version animée (.gif)
            
            //let centerSrc = items[1].src.replace('.png', '.gif');
            //items[0].src = centerSrc;
            items[0].src=items[1].src;

            // 2. On récupère le futur média pour l'item 1 (celui qui est caché en bas)
            //const nextData = getNextMedia();
            
            // 3. On force ce futur média en version fixe (.png) 
            // pour qu'il ne s'anime pas pendant qu'il monte au prochain scroll
            items[1].src = getNextMedia().src; //.src.replace('.gif', '.png');
        }

        currentOffset = 0;
        scrollContent.style.transform = `translateY(0px)`;
        
        // "Force Reflow" pour que le navigateur valide le changement de position sans transition
        void scrollContent.offsetHeight; 
        activeCleanup = null;
    };

    const handleEnd = (e) => {
        if (e.target === scrollContent && e.propertyName === 'transform') performCleanup();
    };

    activeCleanup = performCleanup;
    scrollContent.addEventListener('transitionend', handleEnd);

    scrollContent.style.transition = `transform ${duration}s cubic-bezier(0.23, 1, 0.32, 1)`;
    scrollContent.style.transform = `translateY(${-itemHeight}px)`;
}

// --- LISTENERS ET BOUCLE DE JEU ---
function applyOffset(offset) {
    currentOffset = Math.max(0, offset);
    scrollContent.style.transform = `translateY(${-currentOffset}px)`;
}

function handleGestureEnd() {
    isDragging = false;
    area.classList.remove('dragging');
    const itemHeight = (scrollContent.querySelector('.item')) ? scrollContent.querySelector('.item').offsetHeight : 0;
    
    if (currentOffset >= itemHeight * 0.4) {
        incrementerScore(null, false);
    } else {
        currentOffset = 0;
        scrollContent.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        scrollContent.style.transform = 'translateY(0px)';
    }
}

document.addEventListener('mouseleave',()=>{
    cursor.style.display="none";
});
document.addEventListener('mouseenter',()=>{
    cursor.style.display="block";
});
document.addEventListener('mouseup', (e) => {
    if (isDragging) {
        // 2. On vérifie si on est encore au-dessus de l'area
        const rect = area.getBoundingClientRect();
        const isInsideArea = (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
        );
        // 3. On applique le bon pointeur
        if (isInsideArea) {
            cursor.src = "./assets/UI/cursor/grab.png";  // Retour au survol si on est dedans
        } else {
            cursor.src = "./assets/UI/cursor/default.png";  // Retour au curseur normal si on est dehors
        }
        // 4. On termine le geste en dernier
        handleGestureEnd();
    }
});
document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let dy = lastY - e.clientY;
    let max = scrollContent.scrollHeight - area.clientHeight;
    applyOffset(Math.min(max, currentOffset + dy));
    lastY = e.clientY;
});


_upgrades.forEach((element) => {    
    element.addEventListener('mouseenter', () =>{
        cursor.src="./assets/UI/cursor/pointer.png"
    });

    element.addEventListener('mouseleave', () =>{
        cursor.src="./assets/UI/cursor/default.png"
    });
    
});


// --- EFFET HOVER SUR L'AREA ---
area.addEventListener('mouseenter', () => {
    if (!isDragging) {
        cursor.src = "./assets/UI/cursor/grab.png";
    }
});

area.addEventListener('mouseleave', () => {
    if (!isDragging) {
        cursor.src = "./assets/UI/cursor/default.png";
    }
});

area.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastY = e.clientY;
    area.classList.add('dragging');
    cursor.src="./assets/UI/cursor/grabbing.png"
    e.preventDefault();
});

area.addEventListener('mouseup', () => {
    if (isDragging){
        handleGestureEnd();
        cursor.src="./assets/UI/cursor/grab.png"
    }
});


_clicker.addEventListener('mouseenter', () => {
    cursor.src="./assets/UI/cursor/pointer.png"
});
_clicker.addEventListener('mouseleave', () => {
    cursor.src="./assets/UI/cursor/default.png"
});
_clicker.addEventListener('mousedown', () => {
    cursor.src="./assets/UI/cursor/click.png"
});
_clicker.addEventListener('mouseup', () => {
    cursor.src="./assets/UI/cursor/pointer.png"
});


setInterval(() => {
    total_score += (stats.sps / 10);
    score += (stats.sps / 10);

    if (!window.compteurAuto) window.compteurAuto = 0;
    window.compteurAuto++;

    if (window.compteurAuto >= 40-Math.min(20,stats.sps) && stats.sps>0) {
        if (getCPS() < 1 && !isDragging) {
            nextMedia(false);
            
        }
        window.compteurAuto = 0;
    }

    scorestr.textContent = Math.round(score);
    
    cpsstr.textContent = getCPS();
    spcstr.textContent = Math.round(stats.spc * stats.spcm);
    spsstr.textContent = Math.round(stats.sps * stats.spsm);
    
    if (bgm.paused) bgm.play().catch(()=>{}); 
}, 100);

window.incrementerScore = incrementerScore;
window.acheterUpgrade = acheterUpgrade;