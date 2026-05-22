import { defaultVal } from "./defaultVal.js"
import { stats } from "./stats.js";

const powerupsfx = new Audio('/assets/audio/powerup.mp3');

function creerUpgrades(){
    const upgrades_cont=document.getElementById('upgrades');
    const template = document.getElementById('template-upgrade').textContent;

    defaultVal.forEach((obj) => {
        let html = template;
        Object.keys(obj).forEach((key) =>{
            const regex = new RegExp(`{{${key}}}`,'g');
            html = html.replace(regex, obj[key])
        })
        upgrades_cont.innerHTML += html
    })
}
creerUpgrades()

function playupgradesfx(){
    const upgradesfx = new Audio('/assets/audio/upgrade.mp3');
    upgradesfx.currentTime = 0;
    upgradesfx.playbackRate = 0.8 + Math.random()*0.4;
    upgradesfx.play();
}


export function checkPowerup(upgrade,lvl) {
    const upg = upgrades.find(u => u.id === upgrade);
    let i = 0;
    for(const pow of upg.powerup){
        i += 1;
        let j = 0;
        for (const niv of pow.niveau) {
            j += 1;
            if (lvl === niv - 1){
                return i;
            }
        }
    }
    return 0;
}


export const upgrades=[
    {
        nom : 'Ecran supplémentaire',
        id: "clicker",
        desc:"Augmente le nombre de shorties consommé par scroll.",
        prixstr: document.querySelector('.prix-clicker'),
        prix: parseFloat(document.querySelector('.prix-clicker').innerHTML),
        bonusstr: document.querySelector('.bonus-clicker'),
        bonus: parseFloat(document.querySelector('.bonus-clicker').innerHTML),
        niveau: document.querySelector('.niveau-clicker'),
        multiplicateurScore: 1.03,
        multiplicateurPrix: 1.2,
        powerup:[{
            nom:'Bouton de scroll',
            niveau:[15],
            desc: 'Permet de scroller avec un seul clic',
            achat: function(){
                const clicker = document.querySelector('.clicker');
                if (clicker) clicker.style.pointerEvents = 'auto';
                powerupsfx.currentTime = 0;
                powerupsfx.play();
            },
            },
            {
            nom:'Image rémanente',
            niveau:[10,30,50,70,100,150,200,250,300],
            desc: '"Vous scrollez tellement vite que vous pouvez voir plusieurs shorties sur un seul écran!"<br>Augmente le multiplicateur de shorties manuel.',
            achat: function(){
                powerupsfx.currentTime = 0;
                powerupsfx.play();
                stats.spcm += 1;
            },
        }],
        achat: function(){
            let pu = checkPowerup(this.id,parseInt(this.niveau.textContent))
            if(pu!==0 && this.powerup.length>pu) this.powerup.at(pu-1).achat();
            else if(pu!==0) this.powerup.at(this.powerup.length-1).achat();
            else{
                playupgradesfx();
                stats.spc += this.bonus;
            }
        }
    },
    
    {
        nom : 'Bras automatique',
        id: "scroller",
        desc:"Un bras robotique qui scrolle automatiquement pour toi.<br>Génère passivement des shorties",
        prixstr: document.querySelector('.prix-scroller'),
        prix: parseFloat(document.querySelector('.prix-scroller').innerHTML),
        bonusstr: document.querySelector('.bonus-scroller'),
        bonus: parseFloat(document.querySelector('.bonus-scroller').innerHTML),
        niveau: document.querySelector('.niveau-scroller'),
        multiplicateurScore: 1.03,
        multiplicateurPrix: 1.2,
        powerup:[{
            nom:'WD-40',
            niveau: [10, 20, 30, 50, 70, 100,150, 200, 250,300],
            desc: '"Un petit coup de lubrifiant et on repart"<br>Augmente le multiplicateur de shorties généré par les bras automatiques.',
            achat: function(){
                powerupsfx.currentTime = 0;
                powerupsfx.play();
                stats.spsm += 1;
            }
        }],
        achat: function(){
            let pu = checkPowerup(this.id,parseInt(this.niveau.textContent))
            if(pu!==0) this.powerup.at((pu-1)%this.powerup.length).achat();
            else{
                playupgradesfx();
                stats.sps += this.bonus;
            }
        }
    },
]