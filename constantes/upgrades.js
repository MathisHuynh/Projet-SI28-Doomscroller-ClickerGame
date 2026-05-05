import { defaultVal } from "./defaultVal.js"
import { stats } from "./stats.js";

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


export function checkPowerup(upgrade,lvl) {
    const upg = upgrades.find(u => u.nom === upgrade);

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
        nom : 'clicker',
        desc:"Augmente la puissance de scroll.",
        prixstr: document.querySelector('.prix-clicker'),
        prix: parseFloat(document.querySelector('.prix-clicker').innerHTML),
        bonusstr: document.querySelector('.bonus-clicker'),
        bonus: parseFloat(document.querySelector('.bonus-clicker').innerHTML),
        niveau: document.querySelector('.niveau-clicker'),
        multiplicateurScore: 1.03,
        multiplicateurPrix: 1.2,
        powerup:[{
            nom:'Clicker',
            niveau:[15],
            desc: 'Permet de scroller avec un seul clic',
            achat: function(){
                const clicker = document.querySelector('.clicker');
                if (clicker) {
                    clicker.style.pointerEvents = 'auto';    
                    clicker.style.cursor = 'pointer';                }
            },
            },
            {
            nom:'X clicker',
            niveau:[10,30,50,70,100,150,200,250,300],
            desc: 'Augmente le multiplicateur de puissance de clic',
            achat: function(){
                stats.spcm += 1;
            },
        }],
        achat: function(){
            let pu = checkPowerup(this.nom,parseInt(this.niveau.textContent))
            if(pu!==0 && this.powerup.length>pu) this.powerup.at(pu-1).achat();
            else if(pu!==0) this.powerup.at(this.powerup.length-1).achat();
            else stats.spc += this.bonus;
        }
    },
    
    {
        nom : 'scroller',
        desc:"Scrolle automatiquement pour toi.",
        prixstr: document.querySelector('.prix-scroller'),
        prix: parseFloat(document.querySelector('.prix-scroller').innerHTML),
        bonusstr: document.querySelector('.bonus-scroller'),
        bonus: parseFloat(document.querySelector('.bonus-scroller').innerHTML),
        niveau: document.querySelector('.niveau-scroller'),
        multiplicateurScore: 1.03,
        multiplicateurPrix: 1.2,
        powerup:[{
            nom:'X scroller',
            niveau: [10, 20, 30, 50, 70, 100,150, 200, 250,300],
            desc: 'Augmente le multiplicateur de puissance de scroll',
            achat: function(){
                stats.spsm += 1;
            }
        }],
        achat: function(){
            let pu = checkPowerup(this.nom,parseInt(this.niveau.textContent))
            if(pu!==0) this.powerup.at((pu-1)%this.powerup.length).achat();
            stats.sps += this.bonus;
        }
    },
]