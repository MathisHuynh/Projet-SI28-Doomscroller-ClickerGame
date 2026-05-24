import { desc } from "./upgradesMan.js";

// --- LOGIQUE DU CURSEUR VISUEL ---
export const cursor = document.querySelector('.cursor');
export const _clicker = document.querySelector('.clicker');

window.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    if (desc.style.display === 'block') {
        desc.style.left = (e.clientX + 22) + 'px';
        desc.style.top = (e.clientY + 22) + 'px';
    }
});

document.addEventListener('mouseleave', () => { cursor.style.display = "none"; });
document.addEventListener('mouseenter', () => { cursor.style.display = "block"; });