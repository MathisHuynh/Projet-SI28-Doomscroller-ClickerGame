import { stats } from "./constantes/stats.js";
import { playscoresfx } from "./audio.js";
import { nextMedia, isLoading } from "./scrolling.js";

export let scorestr = document.querySelector('.score-val');
export let cpsstr = document.getElementById("cps");
export let spcstr = document.getElementById("spc");
export let spsstr = document.getElementById("sps");
let divImgClickable = document.querySelector('.div-img-clickable');

export const scoreState = {
    total_score: 0,
    score: 10000000000000000000,
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

function createFeedback(val) {
    const x = Math.random() * 10;
    const y = Math.random() * 10;
    const div = document.createElement('div');
    div.className = 'clickfeedback fade-up';
    div.style.top = (40 + y) + "%";
    div.style.left = (43 + x) + "%";
    div.textContent = "+" + Math.round(val);
    
    const img = document.createElement('img');
    img.src = "./assets/currency.png";
    img.className = "onclickicon";
    div.appendChild(img);
    divImgClickable.appendChild(div);
    
    div.addEventListener('animationend', () => div.remove(), { once: true });
    if (divImgClickable.children.length > 15) {
        divImgClickable.removeChild(divImgClickable.firstChild);
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
    playscoresfx();
    nextMedia(isClick);
    
    const valClic = calculCpcEffectif();
    scoreState.score += valClic;
    scoreState.total_score += valClic;
    
    scorestr.textContent = Math.round(scoreState.score);
    createFeedback(valClic);
}

export function updateScoresAuto() {
    if (isLoading) return;
    const spsEffectif = getSpsEffectif(); 
    scoreState.total_score += (spsEffectif / 10);
    scoreState.score += (spsEffectif / 10);
    scorestr.textContent = Math.round(scoreState.score);
    cpsstr.textContent = getCPS();
    spcstr.textContent = Math.round(calculCpcEffectif());
    spsstr.textContent = Math.round(spsEffectif);
}