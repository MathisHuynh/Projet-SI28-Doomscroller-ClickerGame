import { upgrades, checkPowerup } from "./constantes/upgrades.js";
import { cursor } from "./cursor.js";
import { scoreState, scorestr, updateScoresAuto } from "./score.js"; // Import de updateScoresAuto ajouté

// --- GESTION DES INTERFACES ---
export const desc = document.querySelector('.desc');
export const _upgrades = document.getElementById('upgrades');

window.afficherDesc = function(upgradeID) {
    const upg = upgrades.find(u => u.id === upgradeID);
    if (!upg) return;
    const niveauActuel = parseInt(upg.niveau.textContent);
    const puIndex = checkPowerup(upgradeID, niveauActuel);
    if (puIndex !== 0 && upg.powerup && upg.powerup[puIndex - 1]) {
        const nextPowerup = upg.powerup[puIndex - 1];
        desc.innerHTML = `<u>POWERUP: ${nextPowerup.nom}</u><br><br>${nextPowerup.desc}`;
    } else {
        desc.innerHTML = `<u>${upg.nom}</u><br><br>${upg.desc || "Amélioration standard"}`;
    }
    desc.style.display = 'block';
};

window.cacherDesc = function() {
    desc.style.display = 'none';
};

export function switchPowerup(upgradeID) {
    const upg = upgrades.find(u => u.id === upgradeID);
    if (!upg) return;
    const niveauActuel = parseInt(upg.niveau.textContent);
    const puIndex = checkPowerup(upgradeID, niveauActuel);
    const upgstr = document.getElementById(upgradeID) || upg.niveau.closest('.upgrade');
    if (!upgstr) return;
    const upgimg = upgstr.querySelector('.upgrade-img');
    const upgtxt = upgstr.querySelector('.upgrade-txt');
    if (puIndex !== 0 && upg.powerup && upg.powerup[puIndex - 1]) {
        upgstr.classList.add('has-powerup');
        upgimg.src = upg.powerup[puIndex - 1].img;
        upgtxt.textContent = upg.powerup[puIndex - 1].nom;
    } else {
        upgstr.classList.remove('has-powerup');
        upgimg.src = upg.img;
        upgtxt.textContent = upg.nom;
    }
}

// --- BOUTIQUE ET ACHATS ---
window.acheterUpgrade = function(upgradeID) {
    const mu = upgrades.find((u) => u.id === upgradeID);
    const up = document.getElementById(upgradeID);
    cursor.src = "./assets/UI/cursor/click.png";
    
    if (scoreState.score >= mu.prix) {
        scoreState.score -= mu.prix;
        mu.achat(); // C'est ici que l'upgrade modifie l'objet "stats" global
        
        let nouveauNiveau = parseInt(mu.niveau.textContent) + 1;
        mu.niveau.textContent = nouveauNiveau;
        mu.bonus = parseFloat((mu.bonus * mu.multiplicateurScore).toFixed(2));
        mu.prix *= mu.multiplicateurPrix;
        mu.prixstr.textContent = Math.round(mu.prix);
        
        // On force la mise à jour visuelle immédiate des compteurs et des statistiques SPC/SPS
        updateScoresAuto(); 
        
        switchPowerup(upgradeID);
        afficherDesc(upgradeID);
    }
    setTimeout(() => {
        cursor.src = "./assets/UI/cursor/pointer.png";
    }, 100);
};