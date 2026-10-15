# BINEX
![Binext](docs/binex.png "Optional Title")
Binex is a simulated footwear e-commerce that support a great variety of models, segments and sizes. Its API built with NestJS, includes an authentication system, role-based permissions, catalog and stock management by SKU, and a product search system with filters.

## Project Status
🛠️ In development

## Technologies
![NodeJS](https://img.shields.io/badge/node.js-6DA55F.svg?style=for-the-badge&logo=node.js&logoColor=white) ![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) 	![TypeORM](https://img.shields.io/badge/TypeORM-FE0803.svg?style=for-the-badge&logo=typeorm&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

## Primary Functionalities
- User authentication system
- Role-Based Access Control (RBAC)
- Product management
- Product search and filtering
- SKU-based stock management

## Roadmap
- Cookie-based authentication
- Improve stock management system with stock status
- Shopping cart system
- Product search pagination
- Custom roles and permissions management

## Architecture
Controller → Service → Repository → Database

## Environment variables
```bash
# Application
PORT=
NODE_ENV=development
RUN_SEED=false
DATABASE_TYPE=postgres

POSTGRES_URL=
POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

JWT_SECRET=
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

ROOT_ADMIN_EMAIL=
ROOT_ADMIN_PASSWORD=
ROOT_ADMIN_FIRST_NAME=
ROOT_ADMIN_LAST_NAME=
```


## Project setup

```bash
$ npm install
```

## Local Postgres Database
```bash
# Docker restart (delete all)
$ docker-compose down -v

# Docker up
$ docker-compose up --build
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

# load seed
$ npm run start:seed
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Postman Collections
Auth collection
[![Import Auth Collection](https://run.pstmn.io/button.svg)](https://mider2014-6714345.postman.co/workspace/binex-api~d41a00ea-a32b-4b37-8860-850fc3d3ae2a/collection/49262125-e5eec5d4-4442-4bb7-88f4-97ce9a2a0411?action=share&source=copy-link&creator=49262125)

Brands collection
[![Import Brand Collection](https://run.pstmn.io/button.svg)](https://mider2014-6714345.postman.co/workspace/binex-api~d41a00ea-a32b-4b37-8860-850fc3d3ae2a/collection/49262125-db485a98-1cf1-4a88-95bc-de98429f2384?action=share&source=copy-link&creator=49262125)

Models collection
[![Import Models Collection](https://run.pstmn.io/button.svg)](https://mider2014-6714345.postman.co/workspace/binex-api~d41a00ea-a32b-4b37-8860-850fc3d3ae2a/collection/49262125-1a3676b4-eeb5-467f-abf4-5910c2bc1a3e?action=share&source=copy-link&creator=49262125)

Model Segments collection
[![Import Model Segments Collection](https://run.pstmn.io/button.svg)](https://mider2014-6714345.postman.co/workspace/binex-api~d41a00ea-a32b-4b37-8860-850fc3d3ae2a/collection/49262125-e996f0a0-c3c9-46bc-bd72-f4d0e51e16cd?action=share&source=copy-link&creator=49262125)

Products collection
[![Import Products Collection](https://run.pstmn.io/button.svg)](https://mider2014-6714345.postman.co/workspace/binex-api~d41a00ea-a32b-4b37-8860-850fc3d3ae2a/collection/49262125-40154b82-7327-4abb-9d2a-1dea537e4ad6?action=share&source=copy-link&creator=49262125)

Search collection
[![Import Search Collection](https://run.pstmn.io/button.svg)](https://mider2014-6714345.postman.co/workspace/binex-api~d41a00ea-a32b-4b37-8860-850fc3d3ae2a/collection/49262125-de690ef1-ebd6-4eb1-9ee5-2666cceb6e94?action=share&source=copy-link&creator=49262125)

Stock collection
[![Import Search Collection](https://run.pstmn.io/button.svg)](https://mider2014-6714345.postman.co/workspace/binex-api~d41a00ea-a32b-4b37-8860-850fc3d3ae2a/collection/49262125-243b3807-8894-4408-a6d3-739d93f4cd40?action=share&source=copy-link&creator=49262125)

Users collection
[![Import Users Collection](https://run.pstmn.io/button.svg)](https://mider2014-6714345.postman.co/workspace/binex-api~d41a00ea-a32b-4b37-8860-850fc3d3ae2a/collection/49262125-afe2860b-de81-4a4f-90ad-4e2d7291131c?action=share&source=copy-link&creator=49262125)

Cloudinary collection
[![Import Cloudinary Collection](https://run.pstmn.io/button.svg)](https://mider2014-6714345.postman.co/workspace/binex-api~d41a00ea-a32b-4b37-8860-850fc3d3ae2a/collection/49262125-25474f0a-7445-4d53-8660-4cc298178a9c?action=share&source=copy-link&creator=49262125)

Or you can import them using the JSON files located in `./postman/`.

## License
MIT License