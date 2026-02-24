# 1. Étape de base / Dépendances
FROM node:20-alpine AS base
COPY package*.json ./
RUN npm install

# 2. Étape de Build & Tests (C'est ici que Vitest/Jest intervient)
FROM base AS tester
COPY . .
# On lance les tests. Si les tests échouent, le build Docker s'arrête ici !
RUN npm run test

# 3. Étape de Production (Légère)
FROM node:20-alpine AS release
# On ne copie que ce qui est nécessaire depuis l'étape 'base'
COPY --from=base ./node_modules ./node_modules
COPY . .
# Optionnel : supprimer les fichiers de tests dans l'image finale
RUN rm -rf testing/ 

EXPOSE 3000
CMD ["node", "src/server.js"]