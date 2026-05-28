# Doomscroller

> Un jeu incrémental satirique et immersif explorant les mécanismes de l'addiction aux écrans et aux formats courts.

---

## Présentation du Projet

**Doomscroller** est un *idle game* (jeu incrémental) développé en technologies web natives (**HTML5, CSS3, JavaScript**). 

Ce projet a été conçu et réalisé dans le cadre de l'unité d'enseignement **SI28 - Écriture interactive et multimédia** à l'**Université de Technologie de Compiègne (UTC)**. Il propose une critique interactive de la surconsommation de contenus éphémères sur les plateformes modernes (TikTok, YouTube Shorts, Instagram Reels).

---

## Mécaniques de Jeu (Gameplay)

* **Boucle Principale :** Le joueur génère des **Shorties** en simulant un mouvement de scroll (drag and drop) ou en cliquant sur l'interface de smartphone dédiée.
* **Système d'Upgrades :** Les points accumulés permettent d'investir dans des structures automatisées et des améliorations technologiques. Le coût et la production suivent une courbe exponentielle, fidèle aux standards des jeux incrémentaux.
* **Collection & Rareté :** Chaque interaction offre une probabilité de capturer des contenus rares classés par paliers de rareté (*Uncommon, Rare, Epic, Legendary, Mythical Shorty Pull*), incitant le joueur à poursuivre sa collection.

---

## Note d'Intention & Dimension Multimédia

### L'Analogie de l'Addiction
Le choix du genre *clicker/idle* est une mise en abyme délibérée. En banalisant et en récompensant un geste mécanique simple (le *scroll*), le jeu reproduit fidèlement la boucle de rétroaction dopamine-dépendante des réseaux sociaux. Plus la production s'automatise, plus le joueur est dépossédé de son action, symbolisant la perte de contrôle de l'utilisateur face aux algorithmes.

### Dégradation de l'Expérience Utilisateur (UX)
L'expérience est évolutive et perturbatrice. Au fur et à mesure que le score augmente et s'approche de la singularité, l'interface subit une **surcharge sensorielle et visuelle** progressive :
* Apparition d'images rémanentes et de flashs lumineux.
* Distorsions graphiques de l'environnement (pixel art évolutif, anomalies visuelles).
* Sound design devenant de plus en plus anxiogène et saturé.

L'objectif étant de provoquer une rupture de l'engagement en transformant un espace initialement ludique en un environnement hostile et étouffant.

### Épilogue et Prise de Conscience
Le jeu ne possède pas de fin structurelle, reflétant l'infinité des flux d'actualités réels. Cependant, un système de sortie est proposé via un bouton d'arrêt d'urgence. Quitter l'expérience déclenche un bilan analytique et culpabilisant, quantifiant précisément le temps perdu, l'énergie consommée et l'équivalent en impact environnemental, etc.

---

## Technologies Utilisées

* **Langages :** HTML5, CSS3, JavaScript (ES6+ moderne, architecture en modules).
* **Design Visuel :** Pixel Art adaptatif avec gestion de filtres dynamiques (cycles jour/nuit) et effets de distorsion CSS.
* **Audio :** API Web Audio / Gestion des flux audio natifs pour l'adaptation de la bande-son en fonction des SPS (Shorties Par Seconde).

---

## Équipe et Contributions

* **Développement & Programmation :** Mathis HUYNH
* **Conception des Assets Visuels :** Matthieu PANICO, Mathis HUYNH & IA (Génération du fond de la section gauche)
* **Sound Design & Composition Musicale :** Mathis HUYNH