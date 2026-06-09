import { playAnimalese, stopAnimalese } from './animaleseMan.js';
import { scoreState, setScoreSignal, setScoreSignalThresh } from './score.js';
import { setBuySignal,acheterUpgrade } from './upgradesMan.js';
import { triggerMainGlitch } from './glitch.js';
import { bgm } from './audio.js';

export let isInMain = false;

const narrator = document.querySelector(".narrator");
const dialog = narrator ? narrator.querySelector(".dialog") : null;
const text_div = narrator ? narrator.querySelector(".dialog p") : null;
const sprite = narrator ? narrator.querySelector(".sprite") : null;

const narrator_sprites=[
    './assets/UI/start/idle.gif',
    './assets/UI/start/talk.gif',
    './assets/UI/start/clock.gif',
    './assets/UI/start/angry.png',
    './assets/UI/start/shock.png',
];

const narratorPreload = [];
narrator_sprites.forEach(src => {
    const img = new Image();
    img.src = src;
    narratorPreload.push(img);
});

let skipCurrent = false;
let resolveNext = null;

function typeWriter(element, text, delay = 100, i = 0) {
    if (!element) return;
    if (i === 0) {
        element.innerHTML = "";
    }
    if (skipCurrent) {
        element.innerHTML = text;
        return;
    }
    element.innerHTML += text[i];
    if (i === text.length - 1) {
        return;
    }
    setTimeout(() => typeWriter(element, text, delay, i + 1), delay);
}

function narratorSay(text, delay = 38, width = 16, pitch = 0.8, speed = 1.5) {
    if (!narrator || !text_div) return 0;
    narrator.classList.add("is-talking");
    dialog.style.width=(width*(45/16))+"rem";
    dialog.style.height=(width*(18/16))+"rem";
    dialog.classList.add("visible");
    dialog.querySelector("p").style.fontSize=(width*(2/16))+"rem";
    const audio = playAnimalese(text, pitch, speed, false);
    typeWriter(text_div, text, delay);
    setTimeout(() => {
        narrator.classList.remove("is-talking");
    },(delay+10)*text.length)
    return {
        stop: () => {
            skipCurrent = true;
            stopAnimalese();
            text_div.innerHTML = text;
            narrator.classList.remove("is-talking");
        }
    };
}

function narratorAppear(top = 28, left = 22,width = 16) {
    return new Promise((resolve) => {
        narrator.style.top = String(top) + "%";
        narrator.style.left = String(left) + "%";
        sprite.style.width = width + "rem";
        sprite.style.height = (width*(37/16)) + "rem";
        narrator.classList.remove("is-closed");
        narrator.classList.add("is-open");
        function handleTransitionEnd(event) {
            if (event.target === narrator) {
                narrator.removeEventListener("animationend", handleTransitionEnd);
                resolve();
            }
        }
        narrator.addEventListener("animationend", handleTransitionEnd);
    });
}

function narratorDisappear() {
    return new Promise((resolve) => {
        narrator.classList.remove("is-open");
        narrator.classList.add("is-closed");
        function handleTransitionEnd(event) {
            if (event.target === narrator) {
                narrator.removeEventListener("animationend", handleTransitionEnd);
                resolve();
            }
        }
        narrator.addEventListener("animationend", handleTransitionEnd);
    });
}

function handleDialogClick() {
    if (!skipCurrent) {
        skipCurrent = true;
    } else if (resolveNext) {
        resolveNext();
    }
}

export async function narratorDialog(texts, top = 28, left = 22,width=16,disappear=true, delay = 38, pitch = 0.8, speed = 1.5) {
    document.addEventListener("click", handleDialogClick);
    if(!narrator.classList.contains("is-open")) await narratorAppear(top, left,width);
    for (const text of texts) {
        skipCurrent = false;
        const interaction = narratorSay(text, delay,width, pitch, speed);
        await new Promise(resolve => {
            resolveNext = () => {
                resolveNext = null;
                resolve();
            };
            const checkSkip = setInterval(() => {
                if (skipCurrent) {
                    interaction.stop();
                    clearInterval(checkSkip);
                }
            }, 50);
        });
    }
    document.removeEventListener("click", handleDialogClick);
    dialog.classList.remove("visible");
    await new Promise(resolve => setTimeout(resolve,1000));
    if (disappear) await narratorDisappear();
}

const main = document.querySelector(".main");
const main_shutter = main.querySelector(".shutter");
export function openMain(){
    isInMain = true;
    scoreState.t_begin = Date.now();
    main.classList.remove("is-closed");
    main.classList.add("is-open");
 }
export function closeMain() {
    isInMain = false;
    scoreState.t_end = Date.now();
    setTimeout(() =>  {
        const sfx = new Audio("./assets/audio/shutter.mp3");
        main_shutter.classList.add("closed");
        if (sfx.paused) sfx.play().catch(() => {});
        setTimeout(() => {
            main_shutter.classList.add("shake");
            setTimeout(() => {
                main_shutter.classList.remove("shake"); 
                main.classList.remove("is-open");
                main.classList.add("is-closed");
            }, 500); // 200ms = 0.2s (durée du shake)
        }, 100); // 100ms = 0.1s (durée de la transition du shutter)
    },200);
}

export function triggerAlarm(){
    const check=setInterval(()=>{
        if(scoreState.total_score>1000000000*2000000000000000000){
            playEndSequence();
            clearInterval(check);
        }
    },1000);
}

export function end(){
    const end_box=document.getElementById('endbox');
    end_box.classList.add('is-open');
    const room=document.getElementById('room-state');
    room.style.backgroundImage=document.querySelector('.background').style.backgroundImage;
    const t=document.getElementById('time');
    const score_tot=document.getElementById('total_score');
    const c_t=document.getElementById('corresponding_time');
    const e_impact=document.getElementById('e_impact');
    const env_impact=document.getElementById('env_impact');
    const ratio_world=document.getElementById('ratio_world');
    typeWriter(t,"Temps réel écoulé : "+String((scoreState.t_end-scoreState.t_begin)/1000)+" s",10);
    typeWriter(score_tot,"Nombre de Shorties visionnés : "+String(Math.round(scoreState.total_score)),10);
    typeWriter(c_t,"Temps d'écran correspondant : env. "+String(Math.round(scoreState.total_score*20))+" s",10);
    typeWriter(e_impact,"Energie consommée : env. "+String((scoreState.total_score*0.00002).toFixed(2))+" kWh",10); //0.02WH/tiktok
    typeWriter(env_impact,"CO2 émit : env. "+String((0.00000263*scoreState.total_score/3).toFixed(2))+" tonnes",10)//2.63g/min => 0.00000263t/min
    typeWriter(ratio_world,"% du flux mondial quotidien : env. "+String((scoreState.total_score*100/650000000000).toFixed(3))+"% (env. 650 milliards/jours)",10);
}

function inhibitAction(){
    main.style.pointerEvents="none";
    document.body.style.cursor = "none";
}
function enableAction(){
    main.style.pointerEvents="auto";
    document.body.style.cursor="default";
}


const tuto_scroll_text = [
    "Ça claque hein ?",
    "Bon, ça c'est juste Serge. Mon petit frère.",
    "Ne fais pas attention à lui.",
    "Regarde plutôt son écran.",
    "Tu as devant toi la toute dernière invention de ces formidables humains de la Silicon Valley.",
    "Fini les journées remplies de productivité.",
    "Fini l'ennui.",  
    "Fini les objectifs personnels.",
    "Avec cette application révolutionnaire, tu vas pouvoir t'amuser jusqu'à...",
    "Eh bien jusqu'à la fin des TEMPS !",
    "C'est pas incroyable ça ?",
    "Avec plus de 16 000 vidéos postées chaque minute...",
    "Tu n'arriveras jamais au bout.",
    "Littéralement.",
    "Même en regardant des vidéos jusqu'à la fin de ta vie",
    "Et ça, c'est ce qu'on appelle du contenu de qualité.",
    "Bon allez, trêve de bavardage.",
    "Je vais te montrer.",
    "Commence par faire bouger ta souris du bas vers le haut de l'écran."
];

const tuto_scroll_text1 = [
    "Magnifique !",
    "Tu vois ?",
    "En un seul mouvement, tu as déjà accès à une toute nouvelle vidéo.",
    "Une expérience technologique sans précédent.",
    "Enfin... depuis environ 2018.",
    "Maintenant regarde en haut de ton écran.",
    "Tu vois ce petit compteur ?",
    "Ce sont tes Shorties.",
    "Tu viens d'en obtenir un en scrollant.",
    "Félicitations.",
    "Ta carrière professionnelle sur cette application est officiellement lancée.",
    "Essaie maintenant d'en obtenir 15."
];

const tuto_upgrade_text = [
    "Regarde-moi ça !",
    "Déjà 15 Shorties.",
    "Tu progresses à une vitesse terrifiante.",
    "Maintenant que tu as assez de Shorties, essaie d'acheter une amélioration."
]

const tuto_upgrade_text1 = [
    "INCROYABLE !!!",
    "Regarde ça !",
    "Tu gagnes désormais deux fois plus de Shorties par scroll.",
    "La technologie moderne est vraiment fascinante.",
    "Tu ne produis rien.",
    "Tu ne construis rien.",
    "Mais les chiffres montent.",
    "Et ça, ça fait plaisir.",
    "Bon, je ne vais pas m'éterniser.",
    "Tu as compris le principe.",
    "Scrolle un maximum.",
    "Regarde toujours plus de contenu.",
    "Débloque toujours plus d'améliorations.",
    "Fais grimper ces chiffres vers des sommets totalement déraisonnables.",
    "Ah oui."
]

const dialog_text = [
    "Bonjour à toi, jeune amateur de scroll. Comment vas-tu en cette magnifique journée ?",
    "Qu'avais-tu prévu de faire aujourd'hui ? Apprendre une nouvelle langue ? Lire un livre ? Faire du sport ? Voir tes amis ?",
    "Quoi ? Non ?",
    "Ah...",
    "Donc tu comptais déjà passer les six prochaines heures à regarder ton écran.",
    "Excellent choix.",
    "Dans ce cas, j'ai exactement ce qu'il te faut !",  
    "Je te présente la toute dernière application : DOOMSCROLLER™ !!!",
];

const tuto_stop_text = [
    "Il y a quand même un petit détail que je suis légalement obligé de mentionner.",
    "Malgré le fait que ces magnifiques, sublimes, extraordinaires humains de la Silicon Valley aient créé cette merveille...",
    "Ils recommandent apparemment de ne pas passer trop de temps dessus.",
    "Blablabla.",
    "Santé mentale.",
    "Blablabla.",
    "Temps d'écran.",
    "Blablabla.",
    "Toucher de l'herbe.",
    "Enfin bref.",
    "Tout ce jargon technique de spécialistes.",
    "Si jamais tu souhaites arrêter l'expérience à tout moment...",
    "Tu peux essayer d'appuyer sur ce gros bouton rouge.",
    "Personnellement je ne vois pas pourquoi tu ferais ça.",
    "Mais l'option existe.",
    "Voilà, c'est tout pour moi.",
    "Je reviendrai te voir plus tard.",
    "D'ici là...",
    "Bon scroll.",
    "À plus tard !"
];

const good_end=[
  "Zzzzzzzzz...",
  "Hein ? Déjà ?",
  "Attends une seconde...",
  "Tu as vraiment appuyé sur le bouton ?",
  "Volontairement ?",
  "Eh bien... je dois avouer que je ne m'attendais pas à ça.",
  "La plupart des gens continuent de scroller jusqu'à ce que leur batterie meure. Puis la recharge. Puis recommencent.",
  "Toi, tu t'es arrêté.",
  "C'est presque inquiétant.",
  "Mais probablement une bonne décision.",
  "Après tout...",
  "Passer l'intégralité de son après-midi à regarder des vidéos de chat, de recettes improbables et de théories du complot sur les pigeons n'était peut-être pas indispensable.",
  "Tu sais, on n'y pense pas souvent, mais chaque scroll laisse une petite trace.",
  "Sur ton cerveau.",
  "Sur les serveurs.",
  "Sur la planète.",
  "Sur l'estime de soi de quelqu'un qui a passé trois heures à monter une vidéo de 12 secondes.",
  "J'ai connu des gens qui n'ont jamais réussi à s'arrêter.",
  "Ils ont dit : \"Encore une dernière vidéo.\"",
  "C'était il y a sept ans.",
  "Je crois qu'ils sont toujours là.",
  "Quelque part.",
  "Au fond d'un algorithme.",
  "À regarder des compilations de chaises qui tombent.",
  "Triste destin.",
  "Enfin... pas pour les chaises.",
  "Bref.",
  "Tu as repris le contrôle.",
  "Ou alors tu as simplement cliqué sur le mauvais bouton.",
  "Dans les deux cas, le résultat est le même.",
  "Félicitations.",
  "Merci d'avoir participé à cette expérience.",
  "Et si tu connais quelqu'un qui scrolle depuis suffisamment longtemps pour avoir vu trois refontes de son application préférée...",
  "Partage-lui le jeu.",
  "Il est peut-être encore possible de le sauver."
]

const bad_end1=[
    "Et me revoilà ! Comment tu v...",
    "...",
    "Attends.",
    "Mais c'est quoi cette odeur ?!",
    "Oh non.",
    "NON NON NON.",
    "Tu n'as quand même pas...",
    "...",
    "TU N'AS PAS BOUGÉ DEPUIS LA DERNIÈRE FOIS QU'ON S'EST VUS ?!",
    "...",
    "Je n'ai même pas les mots !",
    "Enfin si, j'en ai beaucoup, mais ils ne passeraient pas la censure.",
    "Attends...",
    "Tu es en train de me dire que tu as consacré environ 1 % de toute ta vie active...",
    "À REGARDER DES GENS DONNER LEUR AVIS SUR DES CHOSES QU'ILS NE CONNAISSENT PAS ?!",
    "Magnifique.",
    "Absolument magnifique.",
    "MOUAHAHAHAHA !",
    "Je dois reconnaître que je m'attendais un peu à ce résultat.",
    "Après tout, je t'avais prévenu.",
    "Cette application a été conçue par des ingénieurs extrêmement talentueux.",
    "Des psychologues.",
    "Des data scientists.",
    "Et probablement un sorcier.",
    "Leur unique objectif : te faire oublier le temps.",
    "Et visiblement... mission accomplie.",
    "Bon.",
    "Comme je t'apprécie à peu près autant qu'une prise secteur apprécie un Nokia...",
    "Je vais quand même essayer de t'aider.",
    "Laisse-moi regarder les dégâts."
]

const bad_end2=[
    "Voyons les statistiques...",
    "Ouh là.",
    "Ouh là là.",
    "Ouuuuuh là là là.",
    "C'est spectaculaire.",
    "Enfin... pour moi.",
    "Les actionnaires sont en larmes.",
    "De joie.",
    "Les serveurs ont chauffé tout l'hiver grâce à toi.",
    "Tu as probablement financé trois yachts et une quatrième résidence secondaire.",
    "Très beau travail.",
    "Maintenant... regardons ton cerveau."
]

const bad_end3=[
    "Ah non, pardon.",
    "Ça, c'est celui que tu avais au début de l'expérience.",
    "Souvenirs, souvenirs...",
    "À l'époque, tu savais encore où tu avais posé tes clés.",
    "Tu pouvais lire un article de plus de deux paragraphes.",
    "Et tu étais capable de rester assis sans sortir ton téléphone toutes les sept secondes.",
    "Quel homme.",
    "Bon.",
    "Maintenant voici l'état actuel."
]

const bad_end4=[
    "Ah oui.",
    "C'est à peu près ce que je craignais.",
    "Il reste encore quelques neurones.",
    "Ils sont actuellement occupés à regarder des vidéos de chats.",
    "Tu as perdu toutes tes fonctions motrices.",
    "Toutes tes fonctions cognitives.",
    "Et probablement ton mot de passe Netflix.",
    "Tu es désormais incapable de faire autre chose que scroller.",
    "Même respirer te demande un effort considérable.",
    "Extraordinaire.",
    "Les résultats dépassent toutes mes espérances."
]

export async function narratorStart(){
    await narratorDialog(dialog_text);
    openMain();
    inhibitAction();
    await new Promise(resolve => setTimeout(resolve,1000));
    await narratorDialog(tuto_scroll_text,20,50,10);
    enableAction();
    setScoreSignalThresh(1)
    await new Promise((resolve) => {setScoreSignal(resolve);})
    inhibitAction();
    await narratorDialog(tuto_scroll_text1,20,50,10);
    enableAction();
    setScoreSignalThresh(14)
    await new Promise((resolve) => {setScoreSignal(resolve);})
    inhibitAction();
    await narratorDialog(tuto_upgrade_text,20,50,10);
    enableAction();
    await new Promise((resolve) => {setBuySignal(resolve);})
    inhibitAction();
    await narratorDialog(tuto_upgrade_text1,20,50,10);
    await narratorDialog(tuto_stop_text,50,50,10);
    enableAction();
}

const explosionContainer = document.getElementById('explosions');
function createExplosion() {
    if (!explosionContainer) return;
    const div = document.createElement('div');
    div.style.backgroundImage='url("./assets/explosion.gif")';
    div.className = 'explosion';
    const x = Math.random() * 20 - 10;
    const y = Math.random() * 20 - 10;
    div.style.top = (y-60) + "%";
    div.style.left = (x-50) + "%";
    explosionContainer.appendChild(div);
    div.addEventListener('animationend', () => div.remove(), { once: true });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export const _stop_button = document.querySelector(".stop_button");
export const _stop_buttonImg = document.querySelector(".stop_img");
export function apocalypse(){
    createExplosion()
    _stop_button.classList.add("broken");
    _stop_buttonImg.src="./assets/UI/stop_button_broken.png";
    triggerAlarm();
}

export function narratorGoodEnding(){
    narratorDialog(good_end,20,10,10);
}

const spaceSequence = document.querySelector(".space-sequence");
const nokia = document.getElementById("nokia");
const blackhole= document.getElementById("blackhole");
const earth= document.getElementById("earth");
const error_win=document.getElementById("window-error");
const brain0=document.getElementById("brain0");
const brain1=document.getElementById("brain1");
export async function playEndSequence() {
    isInMain=false;
    spaceSequence.classList.add("active");
    await new Promise(r => setTimeout(r, 200));
    triggerMainGlitch(1);
    await new Promise(r => setTimeout(r, 800));
    nokia.classList.add("animate-nokia");
    triggerMainGlitch(1);
    await new Promise(r => setTimeout(r, 1200));
    triggerMainGlitch(2);
    await new Promise(r => setTimeout(r,800))
    blackhole.classList.add("animate-blackhole");
    earth.classList.add("animate-earth");
    triggerMainGlitch(3);
    triggerMainGlitch(1);
    await new Promise(r => setTimeout(r, 2000));
    triggerMainGlitch(3,false);
    bgm.pause();
    blackhole.classList.add("freeze");
    error_win.style.display="block";
    document.body.style.cursor="wait";
    main.style.cursor="wait";
    await new Promise(r => setTimeout(r, 500));
    for(let i=0;i<10;i++){
        triggerMainGlitch(3,false);
        await new Promise(r => setTimeout(r, 100));
    }
    triggerMainGlitch(3,false,true);
    await narratorDialog(bad_end1,20,10,10);
    closeMain();
    await new Promise(r => setTimeout(r, 1000));
    document.body.style.cursor="default";
    end();
    await narratorDialog(bad_end2,20,10,10);
    brain0.style.display="block";
    await narratorDialog(bad_end3,50,65,10,false);
    brain1.style.display="block";
    await narratorDialog(bad_end4,50,65,10);
}