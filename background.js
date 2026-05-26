import { scoreState } from "./score.js";

const bgTimelapse = document.querySelector('.background');

let isTransitioning = false;

const bedrooms=[
    './assets/background/bedroom1.png',
    './assets/background/bedroom2.png',
    './assets/background/bedroom3.png',
    './assets/background/bedroom4.png',
    './assets/background/bedroom5.png',
    './assets/background/bedroom6.png',
    './assets/background/bedroom7.png',
    './assets/background/bedroom8.png',
    './assets/background/bedroom10.png',
    './assets/background/bedroom10_black_hole.png'
];

const SINGULARITE = 1000000000; // Ex: 1 Milliard de shorties générés

const paliers_bed = [
    // --- PHASE 1 : L'accumulation (Multiplicateur x10) ---
    1000,                 // bedroom2 : Quelques déchets
    10000,                // bedroom3 : Ça s'accumule
    100000,               // bedroom4 : Ça devient sale
    1000000,              // bedroom5 : Très sale
    10000000,             // bedroom6 : Taudis absolu
    SINGULARITE,          // bedroom7 : L'espace-temps commence à se plier (1 Milliard)
    SINGULARITE * 100,    // bedroom8 : Le trou noir se forme (100 Milliards)
    SINGULARITE * 10000,   // bedroom10 : Absorption totale (10 Trillions)
    SINGULARITE * 20000
];

export function changerBackground() {
    let targetIndex = 0;
    while (targetIndex < paliers_bed.length && scoreState.total_score > paliers_bed[targetIndex]) {
        targetIndex++;
    }
    targetIndex = Math.min(targetIndex, bedrooms.length - 1);
    bgTimelapse.style.backgroundImage = `url("${bedrooms[targetIndex]}")`;
}


export function changerAmbiance(moment, vitesse = 5) {
    if (isTransitioning) return;
    if (bgTimelapse.classList.contains(moment)) return;

    isTransitioning = true;
    bgTimelapse.style.setProperty('--transition-vitesse', `${vitesse}s`);
    const ancienneTransition = bgTimelapse.style.transition;
    bgTimelapse.style.transition = 'none';
    bgTimelapse.classList.remove('day', 'night');
    void bgTimelapse.offsetWidth;
    bgTimelapse.style.transition = '';
    bgTimelapse.classList.add(moment);
    const onTransitionEnd = () => {
        isTransitioning = false;
        bgTimelapse.removeEventListener('transitionend', onTransitionEnd);
    };
    bgTimelapse.addEventListener('transitionend', onTransitionEnd);
}