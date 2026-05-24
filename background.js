const bgTimelapse = document.querySelector('.background');

// const filters = ['day', 'night'];
// let status = 0;

// changerAmbiance(filters[status % 2]);
// status += 1;

// export function changerAmbiance(moment, vitesse = 5) {
//     if (isTransitioning) return;
//     isTransitioning = true;
//     bgTimelapse.style.setProperty('--transition-vitesse', `${vitesse}s`);
//     bgTimelapse.classList.remove('day', 'night');
//     if (moment === 'day') {
//         bgTimelapse.classList.add('day');
//     } else if (moment === 'night') {
//         bgTimelapse.classList.add('night');
//     }
//     setTimeout(() => {
//         isTransitioning = false;
//     }, vitesse * 1000);
// }


let isTransitioning = false;

export function changerAmbiance(moment, vitesse = 5) {
    if (isTransitioning) return;
    if (bgTimelapse.classList.contains(moment)) return;

    isTransitioning = true;

    // 1. On applique la nouvelle vitesse
    bgTimelapse.style.setProperty('--transition-vitesse', `${vitesse}s`);

    // 2. FORCAGE : On retire temporairement la transition pour forcer la mise à jour
    // Si on ne fait pas ça, le navigateur garde l'ancienne durée en mémoire
    const ancienneTransition = bgTimelapse.style.transition;
    bgTimelapse.style.transition = 'none';

    // 3. On déclenche le changement d'état
    bgTimelapse.classList.remove('day', 'night');
    
    // On force un recalcul (reflow) pour que le 'transition: none' soit pris en compte
    void bgTimelapse.offsetWidth;

    // 4. On remet la transition et on ajoute la classe
    bgTimelapse.style.transition = ''; // Retour au CSS d'origine (avec la variable)
    bgTimelapse.classList.add(moment);

    // 5. Gestion propre du verrou
    const onTransitionEnd = () => {
        isTransitioning = false;
        bgTimelapse.removeEventListener('transitionend', onTransitionEnd);
    };
    bgTimelapse.addEventListener('transitionend', onTransitionEnd);
}