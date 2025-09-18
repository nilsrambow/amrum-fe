
# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port (default for Vue CLI is 8080)
EXPOSE 8080

# Start the development server
CMD ["npm", "run", "serve"]
