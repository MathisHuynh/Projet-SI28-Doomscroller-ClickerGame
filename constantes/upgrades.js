import { defaultVal } from "./defaultVal.js"
import { stats } from "./stats.js";

const powerupsfx = new Audio('./assets/audio/powerup.mp3');
powerupsfx.volume = 0.3;
export let isWheelUnlocked = false;
export let isClickerEnabled = false;

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
    const upgradesfx = new Audio('./assets/audio/upgrade.mp3');
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
function generateVisual(upgradeID) {
    const div = document.createElement("div");
    div.className = `visual ${upgradeID}-visual`;
    const img = document.createElement("img");
    img.src = `./assets/upgrades/visual/${upgradeID}_visual.gif`;
    div.appendChild(img);
    return div;
}
function spacingVisuals(upgradeID, duration = 40) {
    const visuals = document.querySelectorAll('.visual.' + upgradeID + '-visual');
    const totalElements = visuals.length;
    
    visuals.forEach((div, index) => {
        div.style.animationName = 'none';
        const delaiMemeMoment = -(duration / totalElements) * index;
        div.style.animationDelay = `${delaiMemeMoment}s`;
        void div.offsetHeight;
        div.style.animationName = `${upgradeID}-animation`; 
    });
}

const div_clicker = document.querySelector(".div-img-clickable");
const scroll_area = div_clicker.querySelector(".scroll-area");

export const behaviour = {
    dragger: {
        desc: "Augmente la consommation manuelle de shorties.",
        multiplicateurScore: 1.05,
        multiplicateurPrix: 1.2,
        powerup: [
            {
                nom: 'Images rémanentes',
                img: './assets/upgrades/icon/after_images.png',
                niveau: [10, 20, 30, 40, 50, 70, 100],
                desc: '"Vous scrollez tellement vite que vous pouvez voir plusieurs shorties sur un seul écran!"<br>Augmente le multiplicateur de shorties généré par le scrolling manuel.',
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
                scroll_area.appendChild(generateVisual("dragger"));
                spacingVisuals("dragger",90);
                stats.spcBase += this.bonus;
                stats.batiments.scroller.productionSps += 0.8;
            }
        }
    },
    robot: {
        desc: "Scrolle automatiquement pour toi. Le premier grand pas vers l'automatisation.",
        multiplicateurScore: 1.08,
        multiplicateurPrix: 1.25,
        powerup: [
            {
                nom: 'Scroller',
                img: './assets/upgrades/icon/scroller.png',
                niveau: [5],
                desc: 'Permet de scroller avec la molette de la souris!',
                achat: function() {
                    isWheelUnlocked=true;
                    powerupsfx.play().catch(() => {});
                },
            },
            {
            nom: 'WD-40', img: './assets/upgrades/icon/WD40.png', niveau: [15, 25, 50],
            desc: '"Un petit coup de lubrifiant et ça repart".<br>Double l\'efficacité des Bras Robotiques et augmente le multiplicateur manuel.',
            achat: function() { stats.batiments.scroller.multiplicateurSps *= 2;stats.batiments.clicker.multiplicateurSpc+=1; powerupsfx.play().catch(() => {}); }
        }],
        achat: function() {
            let pu = checkPowerup(this.id, parseInt(this.niveau.textContent));
            if (pu !== 0) this.powerup.at((pu - 1) % this.powerup.length).achat();
            else { playupgradesfx(); stats.batiments.scroller.productionSps += this.bonus; stats.spcBase+=this.bonus}
        }
    },
    router:{
        desc: "Améliore la qualité du réseau et réduit le temps de chargement.",
        multiplicateurScore: 0.95,
        multiplicateurPrix: 1.8,
        powerup: [{
            nom: 'Relai Wi-Fi', img: './assets/upgrades/icon/relay.png', niveau: [5, 10, 15, 20],
            desc: '"On baigne dans les ondes.".<br>Réduit le taux d\'apparition des chargements.',
            achat: function() { stats.loading_rate *= 0.7; powerupsfx.play().catch(() => {}); }
        },{
            nom: 'Fibre Mondiale', img: './assets/upgrades/icon/fiber.png', niveau: [30],
            desc: '"Une connexion directe aux dorsales dinternet.".<br>Le débit est absolu, il n\'y a plus de chargement.',
            achat: function() { stats.loading_rate *= 0; powerupsfx.play().catch(() => {}); }
        },
        ],
        achat: function() {
            let pu = checkPowerup(this.id, parseInt(this.niveau.textContent));
            if (pu !== 0) this.powerup.at((pu - 1) % this.powerup.length).achat();
            else { playupgradesfx(); stats.loading_max_time = Math.max(0,stats.loading_max_time-this.bonus); }
        },
        
    },
    farm: {
        desc: "Une ferme remplie de téléphones qui scrollent tout seuls.",
        multiplicateurScore: 1.10,
        multiplicateurPrix: 1.25,
        powerup: [
            {
            nom: 'Boutton de scroll', img: './assets/upgrades/icon/scrolling_button.png', niveau: [5],
            desc: 'Permet de scroller en un seul clic!',
            achat: function() {
                powerupsfx.play().catch(() => {});
                isClickerEnabled=true;
            }
            },
            {
            nom: 'Arrosoires Energétiques', img: './assets/upgrades/icon/farm_up.png', niveau: [10, 25, 50],
            desc: '"On les épuise et ça repart!"<br>Multiplie par 2 la production de vos ferme.',
            achat: function() { stats.batiments.farm.multiplicateurSps *= 2; powerupsfx.play().catch(() => {}); }
        }],
        achat: function() {
            let pu = checkPowerup(this.id, parseInt(this.niveau.textContent));
            if (pu !== 0) this.powerup.at((pu - 1) % this.powerup.length).achat();
            else { playupgradesfx(); stats.batiments.farm.productionSps += this.bonus; stats.spcBase+=this.bonus/2}
        }
    },
    algo: {
        desc: "Un algorithme de recommandation qui aspire le contenu sans fin.",
        multiplicateurScore: 1.12,
        multiplicateurPrix: 1.28,
        powerup: [{
            nom: 'Rétention d\'Attention', img: './assets/upgrades/icon/algo_up.png', niveau: [10, 25, 50],
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
            nom: 'Refroidissement Liquide', img: './assets/upgrades/icon/server_up.png', niveau: [10, 25, 50],
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
            nom: 'Deep Learning', img: './assets/upgrades/icon/neural_up.png', niveau: [10, 25, 50],
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
        desc: "Les shorties ont un accès direct à vos synapses.",
        multiplicateurScore: 1.18,
        multiplicateurPrix: 1.33,
        powerup: [{
            nom: 'Vitesse Lumière', img: './assets/upgrades/icon/cable_up.png', niveau: [10, 25],
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
            nom: 'Ascension', img: './assets/upgrades/icon/singularity_up.png', niveau: [5],
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