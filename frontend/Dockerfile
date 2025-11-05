# 1. Using the official Node.js image
# Choose a stable LTS version (e.g. 20) and use the 'alpine' option
# for a smaller image size. This gives us Node.js and npm.
FROM node:20-alpine

# 2. Setting the working directory
# All subsequent commands will be executed in this folder inside the container.
WORKDIR /app

# 3. Copying configuration files
# First, copy only package.json and package-lock.json.
# This allows Docker to cache the RUN step if the dependencies have not changed.
COPY package*.json ./

# 4. Installing dependencies (npm install)
# npm is now available and used to install the dependencies.
# If you have devDependencies, you can add --production to skip them for the final image.
RUN npm install

# 5. Copying the application code
# Copy all other project code (including server.js, routes, controllers, etc.).
COPY . .

# 6. Specifying the port
# Specify which port your backend server listens on (e.g. 5000)
EXPOSE 3000

# 7. Application startup command
# This command will be executed when the container is started.
# Replace "npm start" with your actual command to start the server.
CMD ["npm", "run", "dev"]
