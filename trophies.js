let trophies = document.querySelector('.trophies');

window.afficherTrophies = function() {
    if (trophies.style.display === 'none') {
        trophies.style.display = 'block';
    } else {
        trophies.style.display = 'none';
    }
};