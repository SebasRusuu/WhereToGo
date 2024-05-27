# Dockerfile para a aplicação React
FROM node:18

# Definir o diretório de trabalho no contêiner
WORKDIR /web

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código da aplicação
COPY . .

# Compilar a aplicação React
CMD npm start

EXPOSE 3000
