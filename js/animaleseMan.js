let synth = null;
let isReady = false;
let audioQueue = [];
let currentPlayingAudio = null;

export function initAnimalese() {
    synth = new window.Animalese('./assets/audio/animalese.wav', function() {
        console.log("Moteur Animalese prêt");
        isReady = true;
    });
}

export function playAnimalese(text, pitch = 1.0, speed = 1.0, shorten = false) {
    if (!isReady || !synth) return;
    
    stopAnimalese();

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
    if (audioQueue.length === 0) {
        currentPlayingAudio = null;
        return;
    }
    
    currentPlayingAudio = audioQueue.shift();
    currentPlayingAudio.volume = 0.4;
    currentPlayingAudio.play().catch(e => console.log("Lecture bloquée"));
    
    currentPlayingAudio.onended = () => {
        playNext();
    };
}

export function stopAnimalese() {
    audioQueue = [];
    if (currentPlayingAudio) {
        currentPlayingAudio.pause();
        currentPlayingAudio.currentTime = 0;
        currentPlayingAudio.onended = null;
        currentPlayingAudio = null;
    }
}