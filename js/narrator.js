import { playAnimalese } from './animaleseMan.js';

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

function typeWriter(element, text, delay = 100, i = 0) {
    if (!element) return;
    if (i === 0) {
        element.innerHTML = "";
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
    dialog.classList.add("visible")
    playAnimalese(text, pitch, speed, false);
    typeWriter(text_div, text, delay);
    const textTime= text.length * delay;
    setTimeout(() => {
        narrator.classList.remove("is-talking");
    },  textTime + 500);
    return textTime + 2000;
}


const dialog_text = [
    "Bonjour à toi, jeune amateur de scroll. Comment vas-tu en cette magnifique journée ?",
    "Qu'avais-tu prévu de faire aujourd'hui ? Apprendre une nouvelle langue ? Lire un livre ? Faire du sport ? Voir tes amis ?",
    "Quoi ? Non ?",
    "Ah...",
    "Donc tu comptais déjà passer les six prochaines heures à regarder ton écran.",
    "Excellent choix.",
    "Dans ce cas, j'ai exactement ce qu'il te faut !",  
    "Je te présente la toute dernière application : DOOMSCROLLER™ !!!",
];

export async function narratorDialog(texts = dialog_text, delay = 38, pitch = 0.8, speed = 1.5){
    for (const text of texts) {
        const duration = narratorSay(text, delay, pitch, speed);
        await new Promise(resolve => setTimeout(resolve, duration));
    }
    dialog.classList.remove("visible");
}