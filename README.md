## Backend Training API
API REST complete avec authentification JWT, gestion des roles et base MongoDB

## Demo en ligne
L'API est deployée sur render : https://backend-training bzph.onrender.com

## Fonctionnalite

- AUthentification JWT(register/login)
- hashage de mot de passe avec bcrypt
- securité: cors, helmet, express-rate-limiting
- 

## Stack Technique
**node.js*=> Runtime,
*express*=> Framework web,
*MongoDB Atlas* => base de donnée NoSQL,
*Bcrypt* => hash password,
*Cors helmet rate-limiting* => securité

## Installation Local

````bash
*Cloner le Projet*
git clone hppts://github.com/Dou840/backend-training.git

- Installer les dependances
npm install

- Lancé le serveur
npm start

## EndPoint API

*Authentification*

Methode | URL                                                      | Description
Post    | https://backend-training bzph.onrender.com/auth/register |  creer un compte
Post    | https://backend-training bzph.onrender.com/auth/login    | connecter

*Utilisateur*

Methode | URL                                                      | Description
get    | https://backend-training bzph.onrender.com/users | lister tous les users
Po    | https://backend-training bzph.onrender.com/auth/login    | connecter