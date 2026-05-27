import { medias } from "./constantes/medias.js";
import { stats } from "./constantes/stats.js";
import { getCPS, incrementerScore } from "./score.js";

// --- CONFIGURATION DU GLISSEMENT ---
export var area = document.getElementById('area');
export var scrollContent = document.getElementById('scrollContent');

export const scrollState = {
    isDragging: false,
    lastY: 0,
    currentOffset: 0
};

export var rafId = null;
const MAX_CPS_EFFECT = 10;
let activeCleanup = null;

let last_media = null;
// --- GESTION DES MÉDIAS ---
export function getNextMedia() {
    let new_media = medias[Math.floor(Math.random() * medias.length)];
    if(last_media!==null){
        while(new_media===last_media) new_media = medias[Math.floor(Math.random() * medias.length)];
    }
    last_media = new_media;
    return new_media;
}

function finishAnimation() {
    if (activeCleanup) activeCleanup();
}

const loading = document.querySelector(".loading");
const loading_sfx = new Audio("./assets/audio/loading.mp3");
loading_sfx.volume = 0.6;

const loading_end_sfx = new Audio("./assets/audio/loading_end.mp3");
loading_end_sfx.volume=0.2;

export let isLoading = false;
function rollLoading(){
        if(stats.batiments.cable.productionSps===0){
        let roll = Math.random();
        if (roll <= stats.loading_rate) {
            loading.style.display = "block";
            isLoading = true;
            const minTime = 1;
            const maxTime = stats.loading_max_time;
            const loadDuration = (Math.random() * (maxTime - minTime) + minTime) * 1000;
            loading_sfx.currentTime=0;
            loading_sfx.play().catch(() => {});
            setTimeout(() => {
                loading.style.display = "none";
                isLoading = false;
                loading_end_sfx.currentTime=0;
                loading_end_sfx.play().catch(() => {});
            }, loadDuration);
        }
    }
}

const _phone = document.querySelector(".clicker");

export function nextMedia(isClick = false) {
    if (isLoading) return; 
    rollLoading();

    finishAnimation();
    scrollState.isDragging = false;
    cancelAnimationFrame(rafId);
    const scrollArea = document.querySelector('.scroll-area');
    const itemHeight = (scrollContent.querySelector('.item')) ? scrollContent.querySelector('.item').offsetHeight : 0;
    scrollState.currentOffset = itemHeight;
    let duration = 0.5;
    
    if (isClick) {
        const cps = getCPS();
        duration = Math.max(0.05, 0.25 - (cps / MAX_CPS_EFFECT) * 0.2);
    }
    if (scrollArea) {
        const popDuration = 0.1;
        scrollArea.style.transition = `transform ${popDuration}s cubic-bezier(0.25, 1, 0.5, 1)`;
        scrollArea.style.transform = 'scale(1.02)';
        _phone.src = "./assets/phone_click.png";
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
            _phone.src = "./assets/phone.gif";
        }
        const items = scrollContent.querySelectorAll('.item img');
        if (items.length >= 2) {
            items[0].src = items[1].src;
            items[1].src = getNextMedia().src;
        }
        scrollState.currentOffset = 0;
        scrollContent.style.transform = `translateY(0px)`;
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

// --- LOGIQUE DE DÉPLACEMENT ---
export function applyOffset(offset) {
    scrollState.currentOffset = Math.max(0, offset);
    scrollContent.style.transform = `translateY(${-scrollState.currentOffset}px)`;
}

export function handleGestureEnd() {
    scrollState.isDragging = false;
    area.classList.remove('dragging');
    const itemHeight = (scrollContent.querySelector('.item')) ? scrollContent.querySelector('.item').offsetHeight : 0;
    if (scrollState.currentOffset >= itemHeight * 0.4) {
        incrementerScore(null, false);
    } else {
        scrollState.currentOffset = 0;
        scrollContent.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        scrollContent.style.transform = 'translateY(0px)';
    }
}