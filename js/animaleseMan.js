let synth = null;
let isReady = false;

let audioQueue = [];

const home = document.querySelector(".home");

export function initAnimalese() {
    synth = new window.Animalese('./assets/audio/animalese.wav', function() {
        console.log("Moteur Animalese prêt");
        isReady = true;
    });
}

export function playAnimalese(text, pitch = 1.0, speed = 1.0, shorten = false) {
    if (!isReady || !synth) return;
    const chunks = text.match(/.{1,40}(\s|$)/g) || [text];
    audioQueue = chunks.map(chunk => {
        const cleanChunk = chunk.toUpperCase().replace(/[^A-Z ]/g, "");
        const result = synth.Animalese(cleanChunk, shorten, pitch);
        const dataURI = (typeof result === 'string') ? result : result.dataURI;
        const audio = new Audio(dataURI);
        audio.playbackRate = speed; 
        return audio;
    });
    playNext();
}

function playNext() {
    if (audioQueue.length === 0) return;
    const currentAudio = audioQueue.shift();
    currentAudio.play().catch(e => console.log("Lecture bloquée"));
    currentAudio.onended = () => {
        playNext();
    };
}