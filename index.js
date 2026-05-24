import { stats } from "./constantes/stats.js";
import { bgm, adaptSoundTrack, lancerMusique } from "./audio.js";
import { changerAmbiance } from "./background.js";
import { updateScoresAuto, getCPS, incrementerScore, getSpsEffectif } from "./score.js";
import { _upgrades, indiquerAchetable } from "./upgradesMan.js";
import { area, scrollContent, scrollState, applyOffset, handleGestureEnd, nextMedia } from "./scrolling.js";
import { cursor, _clicker } from "./cursor.js";

import "./trophies.js";

let loading = document.querySelector('.loading');

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
    if (!scrollState.isDragging) cursor.src = "./assets/UI/cursor/grab.png";
});
area.addEventListener('mouseleave', () => {
    if (!scrollState.isDragging) cursor.src = "./assets/UI/cursor/default.png";
});
area.addEventListener('mousedown', (e) => {
    scrollState.isDragging = true;
    scrollState.lastY = e.clientY;
    area.classList.add('dragging');
    cursor.src = "./assets/UI/cursor/grabbing.png";
    e.preventDefault();
});
area.addEventListener('mouseup', () => {
    if (scrollState.isDragging) {
        handleGestureEnd();
        cursor.src = "./assets/UI/cursor/grab.png";
    }
});

// --- INTERACTIONS DU CLICKER ---
_clicker.addEventListener('mouseenter', () => { cursor.src = "./assets/UI/cursor/pointer.png"; });
_clicker.addEventListener('mouseleave', () => { cursor.src = "./assets/UI/cursor/default.png"; });
_clicker.addEventListener('mousedown', () => { cursor.src = "./assets/UI/cursor/click.png"; });
_clicker.addEventListener('mouseup', () => { cursor.src = "./assets/UI/cursor/pointer.png"; });

// --- BOUCLE PRINCIPALE ---

const filters = ['day', 'night'];
let status = 0;

setInterval(() => {
    updateScoresAuto();
    adaptSoundTrack();
    indiquerAchetable();

    //--- Auto Scrolling ---
    if (!window.compteurAuto) window.compteurAuto = 0;
    window.compteurAuto++;
    const spsActuel = getSpsEffectif();
    const isSingularityUnlocked = stats.batiments.singularity.niveau > 0;
    let scaling;
    if (!isSingularityUnlocked) scaling = Math.min(199, Math.log10(Math.max(1, spsActuel)) * 30);
    else scaling = 200;
    const seuil = 200 - scaling;
    if (window.compteurAuto >= seuil && spsActuel > 0) {
        if (getCPS() < 1 && !scrollState.isDragging) nextMedia(false); 
        window.compteurAuto = 0;
    }

    //--- Cycle jour/nuit ---
    if(!window.compteurTemps) window.compteurTemps = 0;
    window.compteurTemps++;
    let multiplier = filters[status%2]==='day'? 1 : 0.8; 
    let cycle = window.compteurTemps%(600*multiplier) //Une minute pour le cycle normal
    if(cycle===0){
        changerAmbiance(filters[status%2]);
        status += 1;
    }

    if (bgm.paused) bgm.play().catch(() => {});
}, 100);

window.incrementerScore = incrementerScore;