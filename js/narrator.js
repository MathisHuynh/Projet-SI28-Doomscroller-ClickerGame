import { playAnimalese } from './animaleseMan.js';
import { scoreState } from './score.js';

export let isInMain = false;

const narrator = document.querySelector(".narrator");
const dialog = narrator ? narrator.querySelector(".dialog") : null;
const text_div = narrator ? narrator.querySelector(".dialog p") : null;
const sprite = narrator ? narrator.querySelector(".sprite") : null;

const narrator_sprites=[
    './assets/UI/start/idle.gif',
    './assets/UI/start/talk.gif',
    './assets/UI/start/clock.gif',
    './assets/UI/start/angry.png',
    './assets/UI/start/shock.png',
];

const narratorPreload = [];
narrator_sprites.forEach(src => {
    const img = new Image();
    img.src = src;
    narratorPreload.push(img);
});

let skipCurrent = false;
let resolveNext = null;

function typeWriter(element, text, delay = 100, i = 0) {
    if (!element) return;
    if (i === 0) {
        element.innerHTML = "";
    }
    if (skipCurrent) {
        element.innerHTML = text;
        return;
    }
    element.innerHTML += text[i];
    if (i === text.length - 1) {
        return;
    }
    setTimeout(() => typeWriter(element, text, delay, i + 1), delay);
}

export function narratorSay(text, delay = 38, pitch = 0.8, speed = 1.5) {
    if (!narrator || !text_div) return 0;
    narrator.classList.add("is-talking");
    dialog.classList.add("visible");
    const audio = playAnimalese(text, pitch, speed, false);
    typeWriter(text_div, text, delay);
    
    return {
        stop: () => {
            skipCurrent = true;
            if (audio && audio.pause) audio.pause();
            text_div.innerHTML = text;
            narrator.classList.remove("is-talking");
        }
    };
}

function narratorAppear(top = 28, left = 15) {
    return new Promise((resolve) => {
        narrator.style.top = String(top) + "%";
        narrator.style.left = String(left) + "%";
        narrator.classList.remove("is-closed");
        narrator.classList.add("is-open");
        function handleTransitionEnd(event) {
            if (event.target === narrator) {
                narrator.removeEventListener("animationend", handleTransitionEnd);
                resolve();
            }
        }
        narrator.addEventListener("animationend", handleTransitionEnd);
    });
}

function narratorDisappear() {
    narrator.classList.remove("is-open");
    narrator.classList.add("is-closed");
}

function handleDialogClick() {
    if (!skipCurrent) {
        skipCurrent = true;
    } else if (resolveNext) {
        resolveNext();
    }
}

export async function narratorDialog(texts, top = 28, left = 15, delay = 38, pitch = 0.8, speed = 1.5) {
    narrator.addEventListener("click", handleDialogClick);
    await narratorAppear(top, left);
    
    for (const text of texts) {
        skipCurrent = false;
        const interaction = narratorSay(text, delay, pitch, speed);
        
        await new Promise(resolve => {
            resolveNext = () => {
                resolveNext = null;
                resolve();
            };
            const checkSkip = setInterval(() => {
                if (skipCurrent) {
                    interaction.stop();
                    clearInterval(checkSkip);
                }
            }, 50);
        });
    }
    
    narrator.removeEventListener("click", handleDialogClick);
    dialog.classList.remove("visible");
    setTimeout(() => {
        narratorDisappear();
    }, 1000);
}

const main = document.querySelector(".main");
const main_shutter = main.querySelector(".shutter");
export function openMain(){
    isInMain = true;
    scoreState.t_begin = Date.now();
    main.classList.remove("is-closed");
    main.classList.add("is-open");
 }
export function closeMain() {
    isInMain = false;
    scoreState.t_end = Date.now();
    setTimeout(() =>  {
        const sfx = new Audio("./assets/audio/shutter.mp3");
        main_shutter.classList.add("closed");
        if (sfx.paused) sfx.play().catch(() => {});
        setTimeout(() => {
            main_shutter.classList.add("shake");
            setTimeout(() => {
                main_shutter.classList.remove("shake"); 
                main.classList.remove("is-open");
                main.classList.add("is-closed");
            }, 500); // 200ms = 0.2s (durée du shake)
        }, 100); // 100ms = 0.1s (durée de la transition du shutter)
    },200);
}

export function triggerAlarm(){

}

export function end(){
    const end_box=document.getElementById('end-text-box');
    end_box.classList.add('is-open');
    const t=document.getElementById('time');
    const score_tot=document.getElementById('total_score');
    const c_t=document.getElementById('corresponding_time');
    const e_impact=document.getElementById('e_impact');
    const env_impact=document.getElementById('env_impact');
    const ratio_world=document.getElementById('ratio_world');
    typeWriter(t,"Temps réel écoulé : "+String((scoreState.t_end-scoreState.t_begin)/1000)+" s",10);
    typeWriter(score_tot,"Nombre de Shorties visionnés : "+String(Math.round(scoreState.total_score)),10);
    typeWriter(c_t,"Temps d'écran correspondant : "+String(Math.round(scoreState.total_score*20))+" s",10);
    typeWriter(e_impact,"Energie consommée : "+String((scoreState.total_score*0.00002).toFixed(2))+" kWh",10); //0.02WH/tiktok
    typeWriter(env_impact,"CO2 émit : "+String((0.00000263*scoreState.total_score/3).toFixed(2))+" tonnes",10)//2.63g/min => 0.00000263t/min
    typeWriter(ratio_world,"% du flux mondial quotidien : "+String((scoreState.total_score*100/650000000000).toFixed(3))+"% (env. 650 milliards/jours)",10);
}

function inhibitAction(){
    main.style.pointerEvents="none";
    document.body.style.cursor = "none";
}
function enableAction(){
    main.style.pointerEvents="auto";
    document.body.style.cursor = "default";
}


const tuto_text = [
    "Ça claque hein ?",
    "Bon, ça c'est juste Serge. Mon petit frère.",
    "Ne fais pas attention à lui.",
    "Regarde plutôt son écran.",
    "Tu as devant toi la toute dernière invention de ces formidables humains de la Silicon Valley.",
    "Fini les journées remplies de productivité.",
    "Fini l'ennui.",  
    "Fini les objectifs personnels.",
    "Avec cette application révolutionnaire, tu vas pouvoir t'amuser jusqu'à...",
    "Eh bien jusqu'à la fin des TEMPS !",
    "C'est pas incroyable ça ?",
    "Avec plus de 16 000 vidéos postées chaque minute...",
    "Tu n'arriveras jamais au bout.",
    "Littéralement.",
    "Même en regardant des vidéos jusqu'à la fin de ta vie",
    "Et ça, c'est ce qu'on appelle du contenu de qualité.",
    "Bon allez, trêve de bavardage.",
    "Je vais te montrer.",
    "Commence par faire bouger ta souris du bas vers le haut de l'écran."
];
export async function tuto(){
    openMain();
    inhibitAction();
    narratorDialog(tuto_text);
    enableAction();
}