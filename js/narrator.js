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

export function narratorSay(text, delay = 38, pitch = 0.8, speed = 1.5, top = 28, left = 15) {
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

function narratorDisappear(){
    narrator.classList.remove("is-open");
    narrator.classList.add("is-closed");
}


export async function narratorDialog(texts, endfunc = {}, top = 28, left = 15, delay = 38, pitch = 0.8, speed = 1.5){
    await narratorAppear(top,left);
    for (const text of texts) {
        const duration = narratorSay(text, delay, pitch, speed,top,left);
        await new Promise(resolve => setTimeout(resolve, duration));
    }
    dialog.classList.remove("visible");
    setTimeout(() => {
        narratorDisappear();
        endfunc();
    },1000)
}

export function openMain(){
    const main = document.querySelector(".main");
    main.classList.add("is-open");
 }