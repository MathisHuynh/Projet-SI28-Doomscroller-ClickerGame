const bgTimelapse = document.querySelector('.background');

let isTransitioning = false;

export function changerAmbiance(moment, vitesse = 5) {
    if (isTransitioning) return;
    if (bgTimelapse.classList.contains(moment)) return;

    isTransitioning = true;
    bgTimelapse.style.setProperty('--transition-vitesse', `${vitesse}s`);
    const ancienneTransition = bgTimelapse.style.transition;
    bgTimelapse.style.transition = 'none';
    bgTimelapse.classList.remove('day', 'night');
    void bgTimelapse.offsetWidth;
    bgTimelapse.style.transition = '';
    bgTimelapse.classList.add(moment);
    const onTransitionEnd = () => {
        isTransitioning = false;
        bgTimelapse.removeEventListener('transitionend', onTransitionEnd);
    };
    bgTimelapse.addEventListener('transitionend', onTransitionEnd);
}