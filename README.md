# TP2 NestJS

Implémentation du TP2 NestJS : Gestionnaire de CVs, base de données relationnelle, seed standalone, authentification JWT (Passport) et contrôle d'accès basé sur les rôles.

## Installation

Node.js 22.12 ou supérieur et une base PostgreSQL.

```sh
npm install
cp .env.example .env
```

Renseigner dans `.env` :

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | URL PostgreSQL (`sslmode=require` active TLS) |
| `SECRET` | Clé secrète utilisée pour signer et vérifier les JWT |
| `JWT_EXPIRES_IN` | Durée de validité du token en secondes (3600 par défaut) |
| `PORT` | Port HTTP (3000 par défaut) |

Le fichier `.env` reste local et n'est pas versionné.

```sh
npm run start:dev      # développement
npm run build && npm run start:prod
npm run seed:cvs       # données fictives (application standalone)
```

TypeORM synchronise les tables avec `synchronize: true`.
Si `ts-node` pose problème selon l'environnement, `npm run seed:cvs:build` compile puis exécute le même seeder.

## Notions utilisées

| Notion | Pages du cours | Fichiers |
| --- | --- | --- |
| Relations `ManyToOne`, `OneToMany`, `ManyToMany`, `JoinTable`, `JoinColumn` | 271 à 283 | `src/cv/entities/`, `src/user/entities/`, `src/skill/entities/` |
| Service CRUD générique (`CrudService<T>`) | 284 | `src/common/crud/crud.service.ts` |
| Mapped types, `@Type`, validation | 101 à 127 | `src/cv/dto/`, `src/skill/dto/`, `src/user/dto/` |
| Standalone application et seed avec falso | 285 à 289 | `src/commands/cv.seeder.ts` |
| Hachage du mot de passe avec bcrypt | 295 | `src/auth/auth.service.ts` |
| Inscription et connexion | 293 à 297 | `src/auth/` |
| Passport JWT, `JwtModule`, `JwtStrategy` | 300 à 309 | `src/auth/auth.module.ts`, `src/auth/strategies/` |
| Guards, `AuthGuard('jwt')`, `AdminGuard` | 310 à 315 | `src/auth/guards/` |
| Décorateur de paramètre `@GetUser()` | 316 à 317 | `src/auth/decorators/get-user.decorator.ts` |
| Propriétaire du Cv et restrictions selon les rôles | 318 à 320 | `src/cv/cv.service.ts` |
| Colonne `select: false` | 204 | `src/user/entities/user.entity.ts` |

## Modèle de données

* `users` : `id`, `username` (unique), `email` (unique), `password` (haché, masqué par défaut), `role`, timestamps.
* `cvs` : `id`, `name`, `firstname`, `age`, `cin` (unique), `job`, `path`, `userId`, timestamps.
* `skills` : `id`, `designation` (unique), timestamps.
* Un user possède plusieurs cvs (`ManyToOne` / `OneToMany`, suppression en cascade).
* Un cv est associé à plusieurs skills et une skill peut figurer dans plusieurs cvs (`ManyToMany`, table `cv_skills`).

`role` est une chaîne dynamique (`user`, `admin`, etc.) : le propriétaire de l'application peut ajouter de nouveaux rôles à tout moment.
Les champs temporels (`createdAt`, `updatedAt`, `deletedAt`) proviennent de `TimestampEntity`, héritée par toutes les entités.

## Routes

| Méthode | Route | Accès | Action |
| --- | --- | --- | --- |
| POST | `/auth/register` | public | Créer un compte (rôle `user`) |
| POST | `/auth/login` | public | Renvoie `{ "access_token": "<jwt>" }` |
| POST | `/cv` | connecté | Créer un cv dont le propriétaire est le user connecté |
| GET | `/cv` | connecté | Admin : tous les cvs. User : uniquement ses propres cvs |
| GET | `/cv/:id` | propriétaire ou admin | Lire un cv |
| PATCH | `/cv/:id` | propriétaire | Modifier son cv |
| DELETE | `/cv/:id` | propriétaire | Supprimer son cv |
| GET | `/skill`, `/skill/:id` | connecté | Consulter les skills |
| POST, PATCH, DELETE | `/skill`, `/skill/:id`, `/skill/:id/soft`, `/skill/:id/restore` | admin | Gérer les skills |
| GET, DELETE | `/user`, `/user/:id` | admin | Consulter et supprimer les users |
| PATCH | `/user/:id/role` | admin | Modifier le rôle d'un utilisateur |

Les routes protégées attendent le header `Authorization: Bearer <token>`.
Sans token valide, la réponse est `401 Unauthorized`.
Un utilisateur connecté sans privilège suffisant reçoit `403 Forbidden`.

## Exemples d'utilisation

```sh
# 1. Inscription
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"sami","email":"sami@mail.tn","password":"Password123!"}'

# 2. Authentification et récupération du token JWT
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"sami","password":"Password123!"}' | sed 's/.*"access_token":"\([^"]*\)".*/\1/')

# 3. Création d'un CV lié à l'utilisateur connecté
curl -X POST http://localhost:3000/cv \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Ben Ali","firstname":"Sami","age":24,"cin":12345678,"job":"Développeur","path":"uploads/cvs/sami.pdf","skillIds":[1,2]}'

# 4. Liste des CVs accessibles (ses propres CVs si rôle user, tous si admin)
curl http://localhost:3000/cv -H "Authorization: Bearer $TOKEN"
```

Le token peut être inspecté sur [jwt.io](https://jwt.io/) : son payload contient `userId`, `username`, `email` et `role`.

## Seed de la base de données

`npm run seed:cvs` démarre une application standalone (`NestFactory.createApplicationContext`),
récupère les services via le conteneur IoC (`app.get(...)`) et peuple la base avec :
- 1 administrateur (`admin`)
- 5 utilisateurs
- 10 compétences (`Skill`)
- 20 CVs avec compétences associées

Le mot de passe de tous les comptes générés est `Password123!`.
L'exécution est idempotente : si l'administrateur existe déjà, le seed ne duplique pas les données.

## Règles de gestion et sécurité

* **Propriété des CVs** : un CV ne peut être modifié ou supprimé que par son auteur.
* **Cloisonnement des accès** : un utilisateur classique ne voit que ses propres CVs ; seul l'administrateur a une vue globale.
* **Codes d'état HTTP** : `404` en cas d'identifiant introuvable, `400` pour validation invalide, `409` pour un conflit d'unicité (`username`, `email`, `cin`, `skill`), `403` pour refus d'accès.
* **Sécurité des mots de passe** : hachage avec salt `bcrypt` et colonne `password` déclarée en `select: false`.
