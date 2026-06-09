import { stats } from "./constantes/stats.js";
import { bgm, adaptSoundTrack, lancerMusique } from "./js/audio.js";
import { changerAmbiance, changerBackground } from "./js/background.js";
import { updateScoresAuto, getCPS, incrementerScore, getSpsEffectif, scoreState } from "./js/score.js";
import { _upgrades, indiquerAchetable } from "./js/upgradesMan.js";
import { area, scrollContent, scrollState, applyOffset, handleGestureEnd, nextMedia, getNextMedia, isLoading } from "./js/scrolling.js";
import { cursor, _clicker } from "./js/cursor.js";
import "./js/menu.js";
import {narratorStart, openMain, closeMain, isInMain, end, apocalypse, _stop_button, _stop_buttonImg, narratorGoodEnding, playEndSequence, triggerAlarm} from "./js/narrator.js"
import { initAnimalese } from './js/animaleseMan.js';
import {triggerMainGlitch} from "./js/glitch.js";
import "./js/trophies.js";
import { isClickerEnabled } from "./constantes/upgrades.js";

// --- INTERACTION SOURIS GLOBALE ---
document.addEventListener('mouseup', (e) => {
    if (scrollState.isDragging) {
        const rect = area.getBoundingClientRect();
        const isInsideArea = (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
        );
        if (isInsideArea) {
            cursor.src = "./assets/UI/cursor/grab.png";
        } else {
            cursor.src = "./assets/UI/cursor/default.png";
        }
        handleGestureEnd();
    }
});

document.addEventListener('mousemove', (e) => {
    if (!scrollState.isDragging) return;
    let dy = scrollState.lastY - e.clientY;
    let max = scrollContent.scrollHeight - area.clientHeight;
    applyOffset(Math.min(max, scrollState.currentOffset + dy));
    scrollState.lastY = e.clientY;
});

// --- INTERACTIONS DE LA BOUTIQUE ---
if (_upgrades) {
    _upgrades.addEventListener('mouseover', (e) => {
        const upgradeElement = e.target.closest('.upgrade');
        if (!upgradeElement || upgradeElement.classList.contains('ishovered')) return;
        cursor.src = "./assets/UI/cursor/pointer.png";
        upgradeElement.classList.add('ishovered');
        const currencyImg = upgradeElement.querySelector('.currency-img');
        if (currencyImg) currencyImg.src = "./assets/currency.gif";
    });
    _upgrades.addEventListener('mouseout', (e) => {
        const upgradeElement = e.target.closest('.upgrade');
        if (!upgradeElement) return;
        const related = e.relatedTarget;
        if (related && upgradeElement.contains(related)) return;
        cursor.src = "./assets/UI/cursor/default.png";
        upgradeElement.classList.remove('ishovered');
        const currencyImg = upgradeElement.querySelector('.currency-img');
        if (currencyImg) currencyImg.src = "./assets/currency.png";
    });
}

// --- INTERACTIONS DE LA ZONE DE GLISSEMENT ---
area.addEventListener('mouseenter', () => {
    if(!isClickerEnabled){
        if (!scrollState.isDragging) cursor.src = "./assets/UI/cursor/grab.png";
    }else{
        cursor.src = "./assets/UI/cursor/pointer.png";
    }
});
area.addEventListener('mouseleave', () => {
    if (!scrollState.isDragging) cursor.src = "./assets/UI/cursor/default.png";
});
area.addEventListener('mousedown', (e) => {
    if (isLoading) return;

    if(!isClickerEnabled){
        scrollState.isDragging = true;
        scrollState.lastY = e.clientY;
        area.classList.add('dragging');
        cursor.src = "./assets/UI/cursor/grabbing.png";
        e.preventDefault();
    }else{
        cursor.src = "./assets/UI/cursor/click.png";
        incrementerScore(null,true)
    }
});
area.addEventListener('mouseup', () => {
    if(!isClickerEnabled){
        if (scrollState.isDragging) {
            handleGestureEnd();
            cursor.src = "./assets/UI/cursor/grab.png";
        }
    }else{
        cursor.src = "./assets/UI/cursor/pointer.png";
    }
});

// --- INTERACTIONS DU CLICKER ---
_clicker.addEventListener('mouseenter', () => { cursor.src = "./assets/UI/cursor/pointer.png"; });
_clicker.addEventListener('mouseleave', () => { cursor.src = "./assets/UI/cursor/default.png"; });
_clicker.addEventListener('mousedown', () => { cursor.src = "./assets/UI/cursor/click.png"; });
_clicker.addEventListener('mouseup', () => { cursor.src = "./assets/UI/cursor/pointer.png"; });

// --- INTERACTIONS DU BOUTON STOP ---

const _stop_button_hit = document.querySelector(".stop_hitbox");

_stop_button_hit.addEventListener('mouseenter', () => { cursor.src = "./assets/UI/cursor/pointer.png"; });
_stop_button_hit.addEventListener('mouseleave', () => { cursor.src = "./assets/UI/cursor/default.png"; });

const exp_thresh= 2518914070;
const MIN_SPS = 251891407;
const MAX_SPS = 97948186772;

window.clickStop = function(){
    const sfx = new Audio("./assets/audio/stop_push.mp3");
    if (sfx.paused) sfx.play().catch(() => {});
    cursor.src="./assets/UI/cursor/click.png";
    _stop_buttonImg.src="./assets/UI/stop_button_pushed.png";

    const gone=!(getSpsEffectif()<exp_thresh);
    if(gone){
        let exp=new Audio("./assets/audio/explosion.mp3");
        exp.play();
    }
    setTimeout(() => {
        cursor.src = "./assets/UI/cursor/pointer.png";
        _stop_buttonImg.src="./assets/UI/stop_button.png";
        if(!gone){
            bgm.pause();
            closeMain();
            setTimeout(()=>{
                if(scoreState.total_score<100){
                    narratorGoodEnding();
                }
                end();
            },1000)
        }else{
            apocalypse();
        }
    }, 100);
};

// -- INTERACTIONS DE LA VITRE ---
const _safety_glass = document.querySelector(".safety_glass");
let isOpen = false;
_safety_glass.addEventListener('mouseenter', () => { cursor.src = "./assets/UI/cursor/grab.png"; });
_safety_glass.addEventListener('mouseleave', () => { cursor.src = "./assets/UI/cursor/default.png"; });

window.clickGlass = function(){
    cursor.src="./assets/UI/cursor/grabbing.png";
    if(!isOpen){
        _safety_glass.classList.add("open");
        isOpen=true;
    }
    else{
        _safety_glass.classList.remove("open");
        isOpen=false;
    }
    setTimeout(() => {
        cursor.src = "./assets/UI/cursor/pointer.png";
    }, 100);
};


// --- BOUCLE PRINCIPALE ---

const filters = ['day', 'night'];
let status = 0;

setInterval(() => {
    if(!isInMain) return;
    updateScoresAuto();
    adaptSoundTrack();
    indiquerAchetable();
    changerBackground();

    //--- Auto Scrolling ---
    if (!window.compteurAuto) window.compteurAuto = 0;
    window.compteurAuto++;
    const spsActuel = getSpsEffectif();
    const isSingularityUnlocked = stats.batiments.singularity.niveau > 0;
    let scaling;
    if (!isSingularityUnlocked) scaling = Math.min(99, Math.log2(spsActuel)*6)//Math.log10(Math.max(1, spsActuel)) * 30);
    else scaling = 100;
    const seuil = 100 - scaling;
    if (window.compteurAuto/2 >= seuil && spsActuel > 0 && !isLoading) {
        if (getCPS() < 1 && !scrollState.isDragging) nextMedia(false); 
        window.compteurAuto = 0;
    }

    //--- Cycle jour/nuit ---
    if(!window.compteurTemps) window.compteurTemps = 0;
    window.compteurTemps++;
    let multiplier = filters[status%2]==='day'? 1 : 0.8;
    const mod=Math.max(1,Math.round(1200*multiplier/Math.max(1,spsActuel*0.00000001)));
    let cycle = (window.compteurTemps/2)%mod //deux minute pour le cycle normal
    if(cycle===0){
        if(mod<50){
            changerAmbiance(filters[status%2], Math.min(Math.max(0.1, Math.round(1200*multiplier/Math.max(1,spsActuel*0.00000001))),5))
        }else changerAmbiance(filters[status%2]);
        status += 1;
    }

    //--- Glitch ---
    if (spsActuel >= MIN_SPS) {
        const logMin = Math.log10(MIN_SPS);
        const logMax = Math.log10(MAX_SPS);
        const logActuel = Math.log10(spsActuel);
        let t = (logActuel - logMin) / (logMax - logMin);
        t = Math.min(1, Math.max(0, t)); 
        let seuil = 1 - t;
        if (Math.random() > seuil) {
            if(spsActuel>MAX_SPS){
                triggerMainGlitch(1+t*1.1)
            }
            else{
                triggerMainGlitch(1);
            }
        }
    }
    if (bgm.paused) bgm.play().catch(() => {});
}, 50);



const mediaImg = document.querySelectorAll('.item img');
mediaImg.forEach(img => {
    img.src = getNextMedia().src;
});

window.incrementerScore = incrementerScore;


const start = document.querySelector(".start");

const home = document.querySelector(".home");
async function startInteraction() {
    home.removeEventListener('click', startInteraction);
    const titleCard = document.querySelector(".title-card");
    titleCard.classList.remove("is-open")
    titleCard.classList.add("is-closed")
    start.classList.add("is-open");
    await new Promise(resolve => setTimeout(resolve, 1000));
    narratorStart();
    // openMain();
    // openMain();
    // playEndSequence();
}
home.addEventListener('click', startInteraction);


window.addEventListener("load", () => {
    updateProgressBar(100);
    const loaderWrapper = document.getElementById("loader-wrapper");
    const titleCard = document.querySelector(".title-card");
    
    setTimeout(() => {
        initAnimalese(); 
        loaderWrapper.classList.add("loader-hidden");
        loaderWrapper.addEventListener("transitionend", () => loaderWrapper.remove());
        titleCard.classList.add("is-open");
    }, 2000);
});

function updateProgressBar(percent) {
    const fill = document.getElementById('fill');
    if (fill) fill.style.width = percent + "%";
}

const resources = document.querySelectorAll('img, audio, script');
let loadedCount = 0;
resources.forEach(res => {
    res.addEventListener('load', () => {
        loadedCount++;
        let progress = (loadedCount / resources.length) * 100;
        updateProgressBar(progress);
    });
});
