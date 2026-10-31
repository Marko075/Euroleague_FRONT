# Euroleague — front

Interface web de notre application **Euroleague** : une mini-ligue européenne de basket avec ses clubs, ses joueurs,
son calendrier, ses classements et ses statistiques. Depuis le calendrier, on peut aussi **simuler** les matchs à venir.

Projet réalisé en groupe de 3 dans le cadre du cours *Java – Spring / Application d'entreprise* (5A).
Les données viennent de notre propre API Spring Boot : [Euroleague_BACK](https://github.com/Marko075/Euroleague_BACK).

## Pages

Une fois le front lancé :

- http://localhost:4200/ : accueil (prochain match avec compte à rebours, dernier résultat, leaders, classement,
  actus et vidéos).
- http://localhost:4200/joueurs : les joueurs sous forme de cartes aux couleurs de leur club, avec des filtres par
  club, poste et nom.
- http://localhost:4200/clubs : les clubs de la ligue.
- http://localhost:4200/clubs/1 : fiche d'un club (salle, chiffres clés, forme, calendrier, effectif, carte et météo).
- http://localhost:4200/saisons : mini-saisons et journées. Un clic sur un score ouvre le match.
- http://localhost:4200/matchs : matchs joués avec le score, le MVP et la feuille de stats de chaque joueur. Filtres
  par mini-saison, journée et club.
- http://localhost:4200/classements : classement de chaque mini-saison, avec podium.
- http://localhost:4200/calendrier : calendrier de tous les matchs et panneau de **simulation** (jouer une journée,
  une mini-saison, réinitialiser).
- http://localhost:4200/statistiques : statistiques d'un joueur sur une période (totaux et moyennes par match).

## Stack

Angular 17 · TypeScript · Angular Material · Bootstrap 5 · SCSS (thème sombre commun dans `src/_arene.scss`).

API externes utilisées **en complément** de notre back, uniquement sur la fiche club et l'accueil :
météo ([Open-Meteo](https://open-meteo.com/)), carte ([OpenStreetMap](https://www.openstreetmap.org/))
et vidéos officielles EuroLeague (YouTube, chargées seulement au clic).

## Démarrer le projet pas à pas

### Prérequis

- [Node.js](https://nodejs.org/en/download) (version 18 ou plus récente)
- Angular CLI (facultatif, `npm start` suffit) : `npm install -g @angular/cli@17`
- **Le back doit tourner** sur http://localhost:8080 : suivre d'abord le README de
  [Euroleague_BACK](https://github.com/Marko075/Euroleague_BACK) (base Docker puis `./mvnw spring-boot:run`).

### 1. Cloner le dépôt

```bash
git clone https://github.com/Marko075/Euroleague_FRONT.git
cd Euroleague_FRONT
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer l'application

```bash
npm start
```

Puis ouvrir http://localhost:4200.

## Organisation du code

```
src/app/
├── home/            accueil (logique dans accueil.ts, vidéos dans videos.ts)
├── joueur/  club/  club-detail/  saison/  match/  classement/  calendrier/  statistiques/
├── navbar/  footer/  entete-page/   composants communs
├── services/        appels HTTP vers l'API (un service par ressource + simulation, météo)
└── models/          interfaces TypeScript des données reçues
```

## Utilisation de l'IA

Voir la section « Utilisation de l'IA » du README du back
([Euroleague_BACK](https://github.com/Marko075/Euroleague_BACK#utilisation-de-lia)). En résumé : l'IA nous a surtout
servi pour le front (mise en page, styles, composants visuels), pour générer les données de démo et pour commenter le
code à certains endroits. La logique métier du back a été écrite au maximum par nous.
