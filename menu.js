let current = "boutique";

const trophies = document.querySelector('.trophies');
const boutique = document.querySelector('.boutique');

const b_trophies = document.getElementById('trophies');
const b_boutique = document.getElementById('boutique');

const menu_sfx = new Audio('./assets/audio/open_menu.mp3');
menu_sfx.volume=0.4;

window.afficherMenu = function(menu) {
    if(current===menu) return;
    menu_sfx.currentTime=0;
    menu_sfx.play().catch(() => {});
    if (menu==="boutique"){
        b_trophies.classList.remove('selected');
        trophies.classList.remove('selected');
        b_boutique.classList.add('selected');
        boutique.classList.add('selected');
    }else if(menu ==="trophies"){
        b_trophies.classList.add('selected');
        trophies.classList.add('selected');
        b_boutique.classList.remove('selected');
        boutique.classList.remove('selected');
    }
    current = menu;
};