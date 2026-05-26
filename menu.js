let current = "boutique";

const trophies = document.querySelector('.trophies');
const boutique = document.querySelector('.boutique');

const b_trophies = document.getElementById('trophies');
const b_boutique = document.getElementById('boutique');

window.afficherMenu = function(menu) {
    if(current===menu) return;
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