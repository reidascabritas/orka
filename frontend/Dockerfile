FROM node:20-alpine

WORKDIR /app

# Instalar dependências
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copiar código
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
