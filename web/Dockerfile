# Dockerfile para a aplicação React
FROM node:14

# Definir o diretório de trabalho no contêiner
WORKDIR /web

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código da aplicação
COPY . .

# Compilar a aplicação React
RUN npm run build

# Instalar o servidor HTTP para servir o build do React
RUN npm install -g serve

# Comando para rodar a aplicação
CMD ["serve", "-s", "build"]

# Expor a porta que o servidor irá rodar
EXPOSE 5000
