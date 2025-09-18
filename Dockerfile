
# Use official Node.js image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 
EXPOSE 8080

# Start the development server
CMD ["npm", "run", "serve"]
