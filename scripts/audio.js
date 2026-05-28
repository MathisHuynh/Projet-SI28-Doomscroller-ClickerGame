import { stats } from "../constantes/stats.js";
import { getCPS, getSpsEffectif } from "./score.js";

// --- CONFIGURATION DES PALIERS ---
const paliers = [
    1, 100, 1500, 5000, 10000, 25000, 50000, 100000, 250000, 500000,
    1000000, 2000000, 5000000, 10000000, 20000000, 40000000, 70000000, 100000000,
    200000000, 400000000, 700000000, 1000000000, 2000000000, 4000000000, 7000000000, 100000000000
];

export const music = [
    new Audio('./assets/audio/bgm/1.wav'),
    new Audio('./assets/audio/bgm/2.wav'),
    new Audio('./assets/audio/bgm/3.wav'),
    new Audio('./assets/audio/bgm/4.wav'),
    new Audio('./assets/audio/bgm/5.wav'),
    new Audio('./assets/audio/bgm/6.wav'),
    new Audio('./assets/audio/bgm/7.wav'),
    new Audio('./assets/audio/bgm/8.wav'),
    new Audio('./assets/audio/bgm/9.wav'),
    new Audio('./assets/audio/bgm/10.wav'),
    new Audio('./assets/audio/bgm/11.wav'),
    new Audio('./assets/audio/bgm/12.wav'),
    new Audio('./assets/audio/bgm/13.wav'),
    new Audio('./assets/audio/bgm/14.wav'),
    new Audio('./assets/audio/bgm/15.wav'),
    new Audio('./assets/audio/bgm/16.wav'),
    new Audio('./assets/audio/bgm/17.wav'),
    new Audio('./assets/audio/bgm/18.wav'),
    new Audio('./assets/audio/bgm/19.wav'),
    new Audio('./assets/audio/bgm/20.wav'),
    new Audio('./assets/audio/bgm/21.wav'),
    new Audio('./assets/audio/bgm/22.wav'),
    new Audio('./assets/audio/bgm/23.wav'),
    new Audio('./assets/audio/bgm/24.wav'),
    new Audio('./assets/audio/bgm/25.wav'),
    new Audio('./assets/audio/bgm/26.wav'),
    new Audio('./assets/audio/bgm/27.wav'),
];

music.forEach(track => {
    track.volume = 1;
    track.loop = false;
});

let currentTrackIndex = 0;
let nextTrackIndex = 0;
export let bgm = music[currentTrackIndex];


// --- GESTION DU BOUCLAGE ET DES TRANSITIONS DYNAMIQUES (4 PÉRIODES) ---
function handleLoop() {
    if (isNaN(bgm.duration) || bgm.duration === 0) return;
    // L'API "timeupdate" se déclenche toutes les ~250ms.
    // Un buffer de 0.25 garantit de ne rater aucune transition.
    const buffer = 0.25; 
    const duration = bgm.duration;
    const periodLength = duration / 4;
    const timeInPeriod = bgm.currentTime % periodLength;
    const isNearBoundary = timeInPeriod > (periodLength - buffer);
    const isNearEnd = bgm.currentTime > (duration - buffer);
    if (isNearBoundary) {
        if (nextTrackIndex !== currentTrackIndex) {
            const oldTime = bgm.currentTime;
            bgm.removeEventListener('timeupdate', handleLoop);
            bgm.pause();
            currentTrackIndex = nextTrackIndex;
            bgm = music[currentTrackIndex];
            bgm.currentTime = isNearEnd ? 0 : oldTime;
            bgm.addEventListener('timeupdate', handleLoop);
            bgm.play().catch(() => {});
        } else if (isNearEnd) {
            bgm.currentTime = 0;
            bgm.play().catch(() => {});
        }
    }
}
bgm.addEventListener('timeupdate', handleLoop);


export function playscoresfx() {
    const clicksfx = new Audio('./assets/audio/click.mp3');
    clicksfx.currentTime = 0;
    clicksfx.playbackRate = 0.8 + Math.random() * 0.4;
    clicksfx.play();
}

export function adaptSoundTrack() {
    const cpsActuel = getCPS();
    const spsActuel = getSpsEffectif(); 
    const indexationPassive = spsActuel * 0.01;
    const spcEffectif = (stats.spcBase + indexationPassive) * stats.batiments.clicker.multiplicateurSpc;
    const scoreps = (cpsActuel * spcEffectif) + spsActuel;
    
    let targetIndex = 0;
    while (targetIndex < paliers.length && scoreps >= paliers[targetIndex]) {
        targetIndex++;
    }
    targetIndex = Math.min(targetIndex, music.length - 1);
    
    nextTrackIndex = targetIndex;
}

export function lancerMusique() {
    if (bgm.paused) {
        bgm.play().catch(() => console.log("L'audio attend une action utilisateur (clic) pour démarrer."));
    }
}