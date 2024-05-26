# Dockerfile para o servidor Node.js
FROM node:14

# Definir o diretório de trabalho no contêiner
WORKDIR /server

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código da aplicação
COPY . .


# Expor a porta que o aplicativo irá rodar
EXPOSE 4000

# Comando para rodar a aplicação
CMD ["npm", "start"]
