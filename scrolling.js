import { medias } from "./constantes/medias.js";
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

// --- GESTION DES MÉDIAS ---
function getNextMedia() {
    return medias[Math.floor(Math.random() * medias.length)];
}

function finishAnimation() {
    if (activeCleanup) activeCleanup();
}

export function nextMedia(isClick = false) {
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