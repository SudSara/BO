# Use official Node.js image as base
FROM node:22.2.0

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for npm install
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port that your app will run on
EXPOSE 8080

# Command to run the Node.js app
CMD ["node", "server.js"]
