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
        element.textContent = "";
    }
    element.textContent += text[i];
    if (i === text.length - 1) {
        return;
    }
    setTimeout(() => typeWriter(element, text, delay, i + 1), delay);
}

export function narratorSay(text, delay = 70, pitch = 1.0, speed = 1.0) {
    if (!narrator || !text_div) return;
    narrator.classList.add("is-talking");
    dialog.classList.add("visible")
    playAnimalese(text, pitch, speed, false);
    typeWriter(text_div, text, delay);
    setTimeout(() => {
        narrator.classList.remove("is-talking");
    }, text.length * delay + 1000);
}