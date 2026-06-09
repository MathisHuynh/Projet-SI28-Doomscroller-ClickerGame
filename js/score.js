import { stats } from "../constantes/stats.js";
import { nextMedia, isLoading } from "./scrolling.js";

export let scorestr = document.querySelector('.score-val');
export let cpsstr = document.getElementById("cps");
export let spcstr = document.getElementById("spc");
export let spsstr = document.getElementById("sps");
export let loading_ratestr = document.getElementById("loading_rate");
export let max_loadingstr = document.getElementById("max_loading");


let divImgClickable = document.querySelector('.div-img-clickable');

let scoreSignalThresh = 1;
let nscoreSignal=0;
export function setScoreSignalThresh(n=1){
    scoreSignalThresh=n;
}
let scoreSignal = null;
export function setScoreSignal(callback) {
    scoreSignal = callback;
    nscoreSignal = 0;
}


export const scoreState = {
    total_score: 0,
    score: 0,
    t_begin: 0,
    t_end: 0
};

let clickTimes = [];

export function getSpsEffectif() {
    let totalSps = 0;
    for (const key in stats.batiments) {
        const batiment = stats.batiments[key];
        totalSps += batiment.productionSps * batiment.multiplicateurSps;
    }
    return totalSps;
}

export function getCPS() {
    const now = Date.now();
    clickTimes = clickTimes.filter(time => now - time < 1000);
    return clickTimes.length;
}

const feedbackContainer = document.getElementById('feedback-container');

function createFeedback(val) {
    const x = Math.random() * 10;
    const y = Math.random() * 10;
    const div = document.createElement('div');
    div.className = 'clickfeedback fade-up';
    div.style.position = 'absolute';
    div.style.top = (40 + y) + "%";
    div.style.left = (43 + x) + "%";
    div.textContent = "+" + Math.round(val);
    const img = document.createElement('img');
    img.src = "./assets/currency.png";
    img.className = "onclickicon";
    div.appendChild(img);
    feedbackContainer.appendChild(div);
    div.addEventListener('animationend', () => div.remove(), { once: true });
    if (feedbackContainer.children.length > 15) {
        feedbackContainer.removeChild(feedbackContainer.firstChild);
    }
}

function calculCpcEffectif() {
    const spsActuel = getSpsEffectif();
    const indexationPassive = spsActuel * 0.01;
    return (stats.spcBase + indexationPassive) * stats.batiments.clicker.multiplicateurSpc;
}

export function incrementerScore(event, isClick) {
    if (isLoading) return;
    clickTimes.push(Date.now());
    nextMedia(isClick);
    const valClic = calculCpcEffectif();
    scoreState.score += valClic;
    scoreState.total_score += valClic;
    scorestr.textContent = Math.round(scoreState.score);
    createFeedback(valClic);
    if (scoreSignal) {
        nscoreSignal += valClic;
        if (nscoreSignal >= scoreSignalThresh) {
            scoreSignal();
            scoreSignal = null;
        }
    }
}

export function updateScoresAuto() {
    const spsEffectif = getSpsEffectif(); 
    cpsstr.textContent = getCPS();
    spcstr.textContent = Math.round(calculCpcEffectif());
    spsstr.textContent = Math.round(spsEffectif);
    scorestr.textContent = Math.round(scoreState.score);
    loading_ratestr.textContent = (stats.loading_rate*100).toFixed(1);
    max_loadingstr.textContent = stats.loading_max_time.toFixed(2);
    if (isLoading) return;
    scoreState.total_score += (spsEffectif / 20);
    scoreState.score += (spsEffectif / 20);
}