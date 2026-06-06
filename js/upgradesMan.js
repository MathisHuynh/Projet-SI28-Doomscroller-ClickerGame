import { upgrades, checkPowerup } from "../constantes/upgrades.js";
import { cursor } from "./cursor.js";
import { scoreState, scorestr, updateScoresAuto } from "./score.js"; 

// --- GESTION DES INTERFACES ---
export const desc = document.querySelector('.desc');
export const _upgrades = document.getElementById('upgrades');

export  function indiquerAchetable(){
    upgrades.forEach(u => {
        const upgstr = document.getElementById(u.id);
        upgstr.classList.remove('achetable');
        if(u.prix<=scoreState.score){
            upgstr.classList.add('achetable');
        }
    })
};


window.afficherDesc = function(upgradeID) {
    const upg = upgrades.find(u => u.id === upgradeID);
    if (!upg) return;
    const niveauActuel = parseInt(upg.niveau.textContent);
    const puIndex = checkPowerup(upgradeID, niveauActuel);
    if (puIndex !== 0 && upg.powerup && upg.powerup[puIndex - 1]) {
        const nextPowerup = upg.powerup[puIndex - 1];
        desc.innerHTML = `<u>POWERUP: ${nextPowerup.nom}</u><br><br>${nextPowerup.desc}`;
    } else {
        let next_pu=999;
        upg.powerup.forEach(pu => {
            pu.niveau.forEach(nv => {
                if(nv>niveauActuel && nv<next_pu) next_pu=nv;
            })
        })
        const pu_str = (next_pu!==999)? `<br>Prochain POWERUP: Niveau ${next_pu}` : '';
        desc.innerHTML = `<u>${upg.nom}</u><br><br>${upg.desc || "Amélioration standard"}${pu_str}`;
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
let buySignal = null;
export function setBuySignal(callback) {
    buySignal = callback;
}
function acheterUpgrade(upgradeID) {
    const mu = upgrades.find((u) => u.id === upgradeID);
    const up = document.getElementById(upgradeID);
    cursor.src = "./assets/UI/cursor/click.png";
    
    if (scoreState.score >= mu.prix) {
        scoreState.score -= mu.prix;
        mu.achat();
        
        let nouveauNiveau = parseInt(mu.niveau.textContent) + 1;
        mu.niveau.textContent = nouveauNiveau;
        mu.bonus = parseFloat((mu.bonus * mu.multiplicateurScore).toFixed(2));
        mu.prix *= mu.multiplicateurPrix;
        mu.prixstr.textContent = Math.round(mu.prix);
        
        updateScoresAuto(); 
        
        switchPowerup(upgradeID);
        afficherDesc(upgradeID);
    }
    setTimeout(() => {
        cursor.src = "./assets/UI/cursor/pointer.png";
    }, 100);
    if (buySignal) {
        buySignal();
        buySignal = null;
    }
};

window.acheterUpgrade=acheterUpgrade;