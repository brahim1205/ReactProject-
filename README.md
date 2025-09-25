# 📋 TodoList - Application Full-Stack SOLID

Une application moderne de gestion de tâches (TodoList) développée avec une architecture **SOLID** complète, utilisant **React** (frontend) et **Node.js/TypeScript** (backend) avec **Prisma** et **PostgreSQL**.

## 🎯 **Vue d'ensemble**

Cette application permet aux utilisateurs de :
- ✅ S'inscrire et se connecter
- ✅ Créer, modifier et supprimer des tâches
- ✅ Assigner des tâches à d'autres utilisateurs
- ✅ Filtrer les tâches par priorité ou par créateur
- ✅ Télécharger des images pour les tâches
- ✅ Interface responsive et moderne

## 🛠️ **Technologies utilisées**

### **Frontend (React)**
- **React 19** - Bibliothèque UI moderne
- **React Router DOM** - Routage client
- **Axios** - Client HTTP pour les appels API
- **Tailwind CSS** - Framework CSS utilitaire
- **DaisyUI** - Composants UI basés sur Tailwind
- **Lucide React** - Icônes modernes
- **Vite** - Outil de build ultra-rapide

### **Backend (Node.js/TypeScript)**
- **Node.js** - Runtime JavaScript serveur
- **TypeScript** - JavaScript typé
- **Express.js** - Framework web
- **Prisma** - ORM moderne pour base de données
- **SQLite** - Base de données embarquée (développement)
- **JWT** - Authentification par token
- **bcrypt** - Hashage des mots de passe
- **Multer** - Upload de fichiers
- **Zod** - Validation de données
- **CORS** - Gestion des requêtes cross-origin

### **Outils de développement**
- **ESLint** - Linting du code
- **Nodemon** - Redémarrage automatique du serveur
- **ts-node** - Exécution TypeScript directe

## 📋 **Prérequis**

Avant de commencer, assurez-vous d'avoir installé :
- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**
- **PostgreSQL** (version 12 ou supérieure)
- **Git**

## 🚀 **Installation et Configuration**

### **1. Clonage du projet**
```bash
git clone <url-du-repo>
cd todolist
```

### **2. Installation des dépendances**

#### **Frontend**
```bash
npm install
```

#### **Backend**
```bash
cd backend
npm install
```

### **3. Configuration de la base de données**

#### **Création de la base PostgreSQL**
```sql
CREATE DATABASE todolist_db;
```

#### **Configuration des variables d'environnement**
Créez un fichier `.env` dans le dossier `backend/` :
```env
DATABASE_URL="postgresql://username:password@localhost:5432/todolist_db"
JWT_SECRET="votre-secret-jwt-super-securise"
PORT=3011
```

### **4. Migration et seeding de la base de données**
```bash
# Depuis le dossier backend/
npm run db:migrate
npm run seed
```

### **5. Démarrage de l'application**

#### **Terminal 1 : Backend**
```bash
cd backend
npm run dev
```
Le serveur backend sera accessible sur `http://localhost:3011`

#### **Terminal 2 : Frontend**
```bash
npm run dev
```
L'application frontend sera accessible sur `http://localhost:5173`

## 🏗️ **Architecture SOLID**

Ce projet respecte **100% des principes SOLID** :

### **1. Single Responsibility Principle (SRP)**
Chaque classe/module a une seule responsabilité :
- **Contrôleurs** : Gestion HTTP uniquement
- **Services métier** : Logique métier uniquement
- **Repositories** : Accès données uniquement
- **Hooks React** : Une responsabilité UI spécifique

### **2. Open/Closed Principle (OCP)**
Extension sans modification :
- **Interfaces TypeScript** permettent l'ajout de nouvelles fonctionnalités
- **Injection de dépendances** permet de changer d'implémentation

### **3. Liskov Substitution Principle (LSP)**
Toutes les implémentations respectent leurs contrats d'interface.

### **4. Interface Segregation Principle (ISP)**
Interfaces spécialisées et minimales.

### **5. Dependency Inversion Principle (DIP)**
Dépendances abstraites (interfaces) plutôt que concrètes.

## 📁 **Structure du projet**

```
todolist/
├── backend/                          # API Backend
│   ├── src/
│   │   ├── controllers/             # Contrôleurs HTTP
│   │   │   ├── auth.controller.ts
│   │   │   └── todo.controller.ts
│   │   ├── services/                # Services métier
│   │   │   ├── TodoService.ts
│   │   │   └── ValidationService.ts
│   │   ├── repositories/            # Accès données
│   │   │   ├── TodoRepository.ts
│   │   │   └── UserRepository.ts
│   │   ├── routes/                  # Définition des routes
│   │   │   ├── auth.routes.ts
│   │   │   └── todo.routes.ts
│   │   ├── types/                   # Interfaces TypeScript
│   │   │   └── index.ts
│   │   ├── middlewares/             # Middlewares Express
│   │   │   ├── auth.middleware.ts
│   │   │   └── upload.ts
│   │   ├── container.ts             # Injection de dépendances
│   │   ├── app.ts                   # Configuration Express
│   │   └── server.ts                # Point d'entrée serveur
│   ├── prisma/
│   │   ├── schema.prisma            # Schéma base de données
│   │   └── migrations/              # Migrations Prisma
│   └── uploads/                     # Fichiers uploadés
│
├── src/                             # Application Frontend
│   ├── components/                  # Composants React
│   │   ├── TodoList.jsx
│   │   ├── TodoFilters.jsx
│   │   ├── AddTodoForm.jsx
│   │   └── AuthForm.jsx
│   ├── services/                    # Services frontend
│   │   ├── business/                # Logique métier
│   │   │   ├── TodoBusinessService.js
│   │   │   ├── AuthBusinessService.js

