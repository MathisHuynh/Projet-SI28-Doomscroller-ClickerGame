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

const bedroomsPreload = [];
bedrooms.forEach(src => {
    const img = new Image();
    img.src = src;
    bedroomsPreload.push(img);
});

const SINGULARITE = 1000000000;

const paliers_bed = [
    1000,                 // bedroom2
    10000,                // bedroom3
    100000,               // bedroom4
    1000000,              // bedroom5
    10000000,             // bedroom6
    SINGULARITE,          // bedroom7
    SINGULARITE * 100,    // bedroom8
    SINGULARITE * 10000,   // bedroom10
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