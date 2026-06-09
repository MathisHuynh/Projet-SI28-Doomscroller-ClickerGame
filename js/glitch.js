// ─── INITIALISATION DE L'AUDIO CONTEXT (SÉCURISÉE) ───
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/**
 * Génère un effet sonore unitaire de glitch (Bitcrush, Laser ou Freeze)
 * @param {number} amount - Niveau d'intensité influençant la destruction et la durée
 * @returns {number} Durée réelle du signal généré en millisecondes
 */
function playRandomGlitchSound(amount) {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // La durée de base augmente proportionnellement à l'intensité (amount)
    const baseDuration = Math.random() * 0.2 + 0.05; 
    const duration = baseDuration * (amount * 0.8); 
    
    // Nœud de volume global pour ce son avec une coupure exponentielle propre (pas de "clic" audio)
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.12*0.4, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001*0.5, audioCtx.currentTime + duration);

    // Choix aléatoire du signal (0: Bruit blanc Bitcrush, 1: Descente de fréquence, 2: Signal Carré fixe)
    const signalType = Math.floor(Math.random() * 3);

    if (signalType === 0) {
        // --- TYPE 0 : BRUIT BLANC QUANTIFIÉ (EFFET BITCRUSH) ---
        const bufferSize = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Plus l'intensité est forte, moins il y a de paliers de quantification (son ultra-écrasé)
        const steps = Math.max(2, 6 - amount); 

        for (let i = 0; i < bufferSize; i++) {
            const noise = Math.random() * 2 - 1;
            data[i] = Math.round(noise * steps) / steps;
        }
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(gainNode);
        source.start();
    } else {
        // --- TYPE 1 & 2 : SYNTHÈSE PAR OSCILLATEUR (SANGUIN/MATÉRIEL) ---
        const osc = audioCtx.createOscillator();
        osc.type = (signalType === 1) ? 'sawtooth' : 'square';
        
        // Fréquences de base plus chaotiques et aiguës si l'intensité grimpe
        const baseFreq = (signalType === 1) ? 600 : 150;
        osc.frequency.setValueAtTime(baseFreq + (Math.random() * 300 * amount), audioCtx.currentTime);
        
        if (signalType === 1) {
            // Effet laser descendant
            osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + duration);
        }

        // Filtre de crête pour donner une texture métallique au bug
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = Math.random() * 1200 + 200;
        filter.Q.value = 10 * amount;

        osc.connect(filter);
        filter.connect(gainNode);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    gainNode.connect(audioCtx.destination);
    return duration * 1000; // Renvoie la durée exacte en millisecondes
}

/**
 * Déclenche un glitch cyber-corrompu sur le jeu (RVB variable, carrés de négatif, tremblement, audio)
 * @param {number} amount - Intensité du glitch (1 = Léger, 3 = Critique, 5+ = Crash total du système)
 */
export function triggerMainGlitch(amount = 1,remove=true,keep=false) {
    const wrapper = document.querySelector('.glitch-target');
    if (!wrapper) return;

    // Récupération de .main pour y injecter directement les carrés (Correction z-index)
    const mainContainer = wrapper.querySelector('.main') || wrapper;

    // ─── 1. MODIFICATION DYNAMIQUE DU FILTRE RVB SVG ───
    const offsetRed = document.getElementById('rgb-offset-red');
    const offsetBlue = document.getElementById('rgb-offset-blue');
    if (offsetRed && offsetBlue) {
        // Le décalage des pixels en pixels grandit en fonction de l'intensité
        const shiftX = 12 * amount;
        const shiftY = 4 * amount;
        offsetRed.setAttribute('dx', shiftX);
        offsetRed.setAttribute('dy', shiftY);
        offsetBlue.setAttribute('dx', -shiftX);
        offsetBlue.setAttribute('dy', -shiftY);
    }

    // ─── 2. CALCUL DE LA DURÉE DU FREEZE VISUEL ───
    const baseFreezeTime = Math.random() * 100 + 100; // Entre 100 et 200ms de base
    const totalDuration = baseFreezeTime * (amount * 0.9); // Élastique selon le amount

    // ─── 3. POLYPHONIE AUDIO ET TEXTURE D'ACOUPHÈNE ───
    // Plus le amount est grand, plus le moteur superpose des sons de bugs en simultané
    const numberOfSimultaneousSounds = Math.floor(amount);
    for (let i = 0; i < numberOfSimultaneousSounds; i++) {
        // Légère désynchronisation temporelle pour créer un cluster de bruit réaliste
        setTimeout(() => playRandomGlitchSound(amount), i * (50 / amount));
    }

    // Effet d'acouphène strident si l'intensité devient critique (>= 3)
    if (amount >= 3) {
        const tinnitusOsc = audioCtx.createOscillator();
        const tinnitusGain = audioCtx.createGain();
        
        tinnitusOsc.type = 'sine'; // Onde sinusoïdale pure
        // Fréquence ultra-aiguë typique des traumatismes auditifs et des crashs de machines
        tinnitusOsc.frequency.setValueAtTime(7200 + (Math.random() * 1200), audioCtx.currentTime);
        
        // Volume contrôlé pour protéger les oreilles des joueurs
        tinnitusGain.gain.setValueAtTime(0.03 * (amount / 3), audioCtx.currentTime); 
        tinnitusGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (totalDuration / 1000));
        
        tinnitusOsc.connect(tinnitusGain);
        tinnitusGain.connect(audioCtx.destination);
        tinnitusOsc.start();
        tinnitusOsc.stop(audioCtx.currentTime + (totalDuration / 1000));
    }

    // ─── 4. INJECTION DES CARRÉS DE NÉGATIF DANS LE MAIN ───
    // On active la classe sur le wrapper pour appliquer le CSS de secousse et RVB aux enfants non-immunisés
    wrapper.classList.add('glitch-active');

    const activeSquares = [];
    // Le nombre de bugs géométriques se scale sur l'intensité
    const numberOfSquares = Math.floor((Math.random() * 4 + 2) * amount);

    for (let i = 0; i < numberOfSquares; i++) {
        const square = document.createElement('div');
        square.classList.add('glitch-negative-square');
        if(!remove) square.style.zIndex=1000001;

        // Les blocs deviennent de plus en plus MASSIFS et invasifs selon l'intensité
        const width = (Math.random() * 15 + 5) * (1 + amount * 0.15); 
        const height = (Math.random() * 10 + 3) * (1 + amount * 0.15); 
        const top = Math.random() * (100 - height); 
        const left = Math.random() * (100 - width); 

        square.style.width = `${width}vw`;
        square.style.height = `${height}vh`;
        square.style.top = `${top}%`;
        square.style.left = `${left}%`;

        // Injection dans le .main (ainsi, ils respectent l'empilement sous les éléments immunisés)
        mainContainer.appendChild(square);
        activeSquares.push(square);
    }

    // ─── 5. NETTOYAGE ET RESTAURATION DU SYSTÈME ───
    if(!keep){
        setTimeout(() => {
            wrapper.classList.remove('glitch-active');
            activeSquares.forEach(sq => sq.remove());
        }, totalDuration);
    }
}