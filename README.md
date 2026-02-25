# 📝 Todo API Node.js (CI/CD)

## [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ayoun07_todo-api-node&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ayoun07_todo-api-node) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=ayoun07_todo-api-node&metric=coverage)](https://sonarcloud.io/summary/new_code?id=ayoun07_todo-api-node)


Cette API permet de gérer une liste de tâches (To-Do List). Ce projet a été conçu pour mettre en œuvre une chaîne **CI/CD complète** avec un focus sur la qualité du code et la sécurité.

## 🚀 Fonctionnalités
- Gestion des tâches (CRUD : Create, Read, Update, Delete). 
- Documentation interactive via **Swagger**.
- Base de données légère avec **SQLite**.

---

## 🛠️ Stack Technique
- **Runtime** : Node.js
- **Framework** : Express.js
- **Base de données** : SQLite
- **Documentation** : Swagger UI

---

## 🔒 Sécurité et Qualité (CI/CD)
Ce projet intègre les meilleurs outils du marché pour garantir un code robuste :

1. **CodeQL (SAST)** : Analyse statique du code source pour détecter les vulnérabilités logiques (Injections SQL, failles de code).
2. **Trivy (SCA)** : Scanner de vulnérabilités pour l'image Docker et les dépendances `npm`.
3. **Dependabot** : Mise à jour automatique des dépendances obsolètes ou vulnérables.
4. **SonarCloud** : Analyse de la qualité du code (bugs, code smells, duplication).

---

## 📦 Installation et Utilisation

### 1. Pré-requis
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) (optionnel, pour le déploiement)

### 2. Installation locale
```bash
# Cloner le projet
git clone https://github.com/ayoun07/todo-api-node.git
cd todo-api-node

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env  # Puis remplissez SECRET_KEY et API_KEY

```

### 3. Lancer l'application
```bash
npm start
```

- L'API sera disponible sur : http://localhost:3000
- La documentation Swagger est sur : http://localhost:3000/api-docs

### 🐳 Docker
Pour créer et lancer l'image Docker :

```Bash
docker build -t todo-api-node .
docker run -p 3000:3000 todo-api-node
```

### 🧪 Tests de Sécurité Locaux
-Scan CodeQL
```Bash
# Créer la base de données CodeQL
codeql database create ./ma-db --language=javascript --overwrite

# Lancer l'analyse
codeql database analyze ./ma-db codeql/javascript-queries --format=csv --output=resultats_securite.csv
```

### Scan Trivy
```Bash
# Scanner le dossier courant
trivy fs .

# Scanner l'image Docker
trivy image todo-api-node
```
