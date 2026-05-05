# Use an official Node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
#COPY package*.json ./
# Copiar package.json e yarn.lock
COPY package.json yarn.lock ./

# Remove node_modules and package-lock.json if they exist
#RUN rm -rf node_modules package-lock.json

# Install dependencies
#RUN npm install
#RUN npm ci 

# Instalar dependências com Yarn (clean install)
RUN yarn install --frozen-lockfile

# Copy the rest of the application code to the working directory
COPY . .

# Build the Vite project
#RUN npm run build
RUN yarn build

# Install serve to serve static files
#RUN npm install -g serve
RUN yarn global add serve

# Expose the port the app runs on
EXPOSE 3002

# Serve the built files
# CMD ["serve", "-s", "dist"]
# É necessário indicar em que porta o serve deve executar a aplicação. A configuração do
# package.json não funciona na produção, apenas no desenvolvimento.
CMD ["serve", "-s", "dist","-l","3002"]
