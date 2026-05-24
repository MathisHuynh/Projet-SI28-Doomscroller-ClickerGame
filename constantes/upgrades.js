import { defaultVal } from "./defaultVal.js"
import { stats } from "./stats.js";

const powerupsfx = new Audio('/assets/audio/powerup.mp3');
powerupsfx.volume = 0.3;

function creerUpgrades(){
    const upgrades_cont = document.getElementById('upgrades');
    const template = document.getElementById('template-upgrade').innerHTML;

    defaultVal.forEach((obj) => {
        let html = template;
        Object.keys(obj).forEach((key) =>{
            const regex = new RegExp(`{{${key}}}`,'g');
            html = html.replace(regex, obj[key]);
        });
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html.trim();
        const upgradeNode = tempDiv.firstChild;
        upgrades_cont.appendChild(upgradeNode);

        const mu = upgrades.find(u => u.id === obj.id);
        if (mu) {
            mu.prixstr = upgradeNode.querySelector(`.prix-${obj.id}`);
            mu.niveau = upgradeNode.querySelector(`.niveau-${obj.id}`);
        }
    });
}

function playupgradesfx(){
    const upgradesfx = new Audio('/assets/audio/upgrade.mp3');
    upgradesfx.currentTime = 0;
    upgradesfx.volume = 0.3;
    upgradesfx.playbackRate = 0.8 + Math.random()*0.4;
    upgradesfx.play();
}

export function checkPowerup(upgradeId, lvl) {
    const upg = upgrades.find(u => u.id === upgradeId);
    if (!upg || !upg.powerup) return 0;
    
    let i = 0;
    for(const pow of upg.powerup){
        i += 1;
        for (const niv of pow.niveau) {
            if (lvl === niv - 1){
                return i;
            }
        }
    }
    return 0;
}

export const behaviour = {
    clicker: {
        desc: "Augmente le nombre de shorties consommé par clic (et génère un revenu passif).",
        multiplicateurScore: 1.05,
        multiplicateurPrix: 1.25,
        powerup: [
            {
                nom: 'Bouton de scroll',
                img: './assets/upgrades/clicker_up_placeholder.png',
                niveau: [15],
                desc: 'Permet de scroller avec un seul clic',
                achat: function() {
                    const clicker = document.querySelector('.clicker');
                    if (clicker) clicker.style.pointerEvents = 'auto';
                    powerupsfx.play().catch(() => {});
                },
            },
            {
                nom: 'Images rémanentes',
                img: './assets/upgrades/clicker_up_placeholder.png',
                niveau: [10, 30, 50, 70, 100],
                desc: '"Vous scrollez tellement vite que vous pouvez voir plusieurs shorties sur un seul écran!"<br>Augmente le multiplicateur de shorties généré par vos écrans.',
                achat: function() {
                    powerupsfx.play().catch(() => {});
                    stats.batiments.clicker.multiplicateurSpc *= 1.5;
                },
            }
        ],
        achat: function() {
            let pu = checkPowerup(this.id, parseInt(this.niveau.textContent));
            if (pu !== 0 && this.powerup.length > pu) this.powerup.at(pu - 1).achat();
            else if (pu !== 0) this.powerup.at(this.powerup.length - 1).achat();
            else { 
                playupgradesfx();
                stats.spcBase += this.bonus;
                stats.batiments.clicker.productionSps += this.bonus * 0.2; 
            }
        }
    },
    scroller: {
        desc: "Scrolle automatiquement pour toi. Le premier grand pas vers l'automatisation.",
        multiplicateurScore: 1.08,
        multiplicateurPrix: 1.25,
        powerup: [{
            nom: 'WD-40', img: './assets/upgrades/WD40.png', niveau: [10, 25, 50],
            desc: '"Un petit coup de lubrifiant et ça repart".<br>Double l\'efficacité des Bras Robotiques.',
            achat: function() { stats.batiments.scroller.multiplicateurSps *= 2; powerupsfx.play().catch(() => {}); }
        }],
        achat: function() {
            let pu = checkPowerup(this.id, parseInt(this.niveau.textContent));
            if (pu !== 0) this.powerup.at((pu - 1) % this.powerup.length).achat();
            else { playupgradesfx(); stats.batiments.scroller.productionSps += this.bonus; }
        }
    },
    farm: {
        desc: "Une usine remplie de téléphones qui scrollent tout seuls.",
        multiplicateurScore: 1.10,
        multiplicateurPrix: 1.25,
        powerup: [{
            nom: 'Batteries Lithium', img: './assets/upgrades/farm_up.png', niveau: [10, 25, 50],
            desc: '"On les épuise et ça repart!"<br>Multiplie par 2 la production de vos usines.',
            achat: function() { stats.batiments.farm.multiplicateurSps *= 2; powerupsfx.play().catch(() => {}); }
        }],
        achat: function() {
            let pu = checkPowerup(this.id, parseInt(this.niveau.textContent));
            if (pu !== 0) this.powerup.at((pu - 1) % this.powerup.length).achat();
            else { playupgradesfx(); stats.batiments.farm.productionSps += this.bonus; }
        }
    },
    algo: {
        desc: "Un algorithme de recommandation qui aspire le contenu sans fin.",
        multiplicateurScore: 1.12,
        multiplicateurPrix: 1.28,
        powerup: [{
            nom: 'Rétention d\'Attention', img: './assets/upgrades/algo_up.png', niveau: [10, 25, 50],
            desc: '"Ils savent tout de vous."<br>Double l\'efficacité de l\'algo.',
            achat: function() { stats.batiments.algo.multiplicateurSps *= 2; powerupsfx.play().catch(() => {}); }
        }],
        achat: function() {
            let pu = checkPowerup(this.id, parseInt(this.niveau.textContent));
            if (pu !== 0) this.powerup.at((pu - 1) % this.powerup.length).achat();
            else { playupgradesfx(); stats.batiments.algo.productionSps += this.bonus; }
        }
    },
    server: {
        desc: "Des grappes de serveurs entièrement dédiées au scroll compulsif.",
        multiplicateurScore: 1.14,
        multiplicateurPrix: 1.30,
        powerup: [{
            nom: 'Refroidissement Liquide', img: './assets/upgrades/server_up.png', niveau: [10, 25, 50],
            desc: '"On peut s\'en sortir avec un ou deux lacs en moins..."<br>Double l\'efficacité de la production des serveurs.',
            achat: function() { stats.batiments.server.multiplicateurSps *= 2; powerupsfx.play().catch(() => {}); }
        }],
        achat: function() {
            let pu = checkPowerup(this.id, parseInt(this.niveau.textContent));
            if (pu !== 0) this.powerup.at((pu - 1) % this.powerup.length).achat();
            else { playupgradesfx(); stats.batiments.server.productionSps += this.bonus; }
        }
    },
    neural: {
        desc: "Une IA capable d'analyser des millions de vidéos par seconde.",
        multiplicateurScore: 1.16,
        multiplicateurPrix: 1.32,
        powerup: [{
            nom: 'Deep Learning', img: './assets/upgrades/neural_up.png', niveau: [10, 25, 50],
            desc: '"Elle pense comme toi <3! (Elle pense mieux que toi)"<br>L\'IA s\'améliore et consomme 2 fois plus vite.',
            achat: function() { stats.batiments.neural.multiplicateurSps *= 2; powerupsfx.play().catch(() => {}); }
        }],
        achat: function() {
            let pu = checkPowerup(this.id, parseInt(this.niveau.textContent));
            if (pu !== 0) this.powerup.at((pu - 1) % this.powerup.length).achat();
            else { playupgradesfx(); stats.batiments.neural.productionSps += this.bonus; }
        }
    },
    cable: {
        desc: "Un accès direct aux dorsales d'internet. Le débit est absolu.",
        multiplicateurScore: 1.18,
        multiplicateurPrix: 1.33,
        powerup: [{
            nom: 'Vitesse Lumière', img: './assets/upgrades/cable_up.png', niveau: [10, 25],
            desc: '"Einstein avait tort."<br>Le réseau va 2 fois plus vite.',
            achat: function() { stats.batiments.cable.multiplicateurSps *= 2; powerupsfx.play().catch(() => {}); }
        }],
        achat: function() {
            let pu = checkPowerup(this.id, parseInt(this.niveau.textContent));
            if (pu !== 0) this.powerup.at((pu - 1) % this.powerup.length).achat();
            else { playupgradesfx(); stats.batiments.cable.productionSps += this.bonus; }
        }
    },
    singularity: {
        desc: "La machine, le contenu et l'utilisateur ne font plus qu'un.",
        multiplicateurScore: 3,
        multiplicateurPrix: 1.3,
        powerup: [{
            nom: 'Ascension', img: './assets/upgrades/singularity_up.png', niveau: [5],
            desc: '"Juste une dernière question pour le Multivac."<br>Le bout du voyage : production de #3?0?<h? multipliée par 5.',
            achat: function() { stats.batiments.singularity.multiplicateurSps *= 100; powerupsfx.play().catch(() => {}); }
        }],
        achat: function() {
            let pu = checkPowerup(this.id, parseInt(this.niveau.textContent));
            if (pu !== 0) this.powerup.at((pu - 1) % this.powerup.length).achat();
            else { playupgradesfx(); stats.batiments.singularity.productionSps += this.bonus; }
        }
    }
};

export const upgrades = defaultVal.map((data) => {
    const comp = behaviour[data.id];
    return {
        id: data.id,
        nom: data.nom,
        img: data.image,
        prix: data.prix,
        bonus: data.bonusinit,
        prixstr: null,
        niveau: null,
        ...comp
    };
});

creerUpgrades();