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