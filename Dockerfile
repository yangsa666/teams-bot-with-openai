# Use a specific lightweight Node.js v23 Alpine base image
FROM node:23.2-alpine

# Set environment variables
ENV NODE_ENV=production

# Set working directory inside the container
RUN mkdir -p /usr/src/kustobuddy
WORKDIR /usr/src/kustobuddy

# Copy package.json and package-lock.json files
COPY package*.json /usr/src/kustobuddy/

# Install dependencies 
# TODO: Using npm ci for reproducibility
RUN npm install

# Copy only necessary application files
COPY . /usr/src/kustobuddy

# Expose application port
EXPOSE 3978

# Define the default command
CMD ["node", "index.js"]
