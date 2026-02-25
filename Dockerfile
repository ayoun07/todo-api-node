FROM node:20-alpine AS release

COPY package*.json ./
RUN npm install
COPY . .

# supprestion les fichiers de tests dans l'image finale
RUN rm -rf test/ 

EXPOSE 3000
CMD ["node", "src/server.js"]
