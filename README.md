# Description

## Test Technique

### Objectif 

Créer une API REST permettant de :
- Créer des salles de réunion
- Réserver des créneaux horaires pour ces salles
- Consulter la disponibilité des salles
- Visualiser les statistiques d'utilisation

### Gestion des salles 

Chaque salle possède : 
- Un nom unique
- Une capacité maximale

### Réservations

Fonctionnalités attendues : 
- Un utilisateur peut réserver une salle à condition qu'elle soit libre
- Impossible de réserver dans le passé 
- Pas de chevauchement de réservation pour une même salle
- Les réservations doivent être atomiques

### Statistiques à exposer via l'API

Endpoints attendus : 
- Taux d'occupation par salle (quotidien, hebdo, mensuel)
- Top 3 des salles les plus réservées
- Durée moyenne des réunions 

### Questions et choix avant de développer

Afin d'avoir quelque chose de cohérent, certaines règles sont ajoutées / explicitées : 

#### Réservation 
- Durée minimale : 1 minute
- Durée maximale : 24h
- Pas de limitation de date dans le futur
- Impossible de réserver avant maintenant (passé = avant l'instant présent)
- Pas de buffer entre réservations : on peut réserver 10h-11h puis 11h-12h
- Toute réservation qui chevauche même partiellement une existante est refusée
- Validation : StartTime >= EndTime → Erreur | Durée de 0 minute → Erreur

#### Format des dates
- Stockage : UTC en base de données
- API accepte : ISO avec timezone OU UTC si pas de timezone
- API retourne : UTC avec indication timezone
- Calculs stats : En UTC
- Timezone par défaut : Europe/Paris

### Les tests automatisés

- Tests unitaires
- Au moins un test d'intégration

## Requirements 

- Node.js (v22)
- PNPM
- Docker

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash

# .env
$ cp .env.copy .env

# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```