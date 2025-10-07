
# Use official Node.js image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN apt-get update && apt-get install -y \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb \
&& rm -rf /var/lib/apt/lists/*
RUN npm install

# Copy the rest of the application code
COPY . .

# Run lint with --fix to automatically fix linting errors
RUN npm run lint:fix

# Expose port 
EXPOSE 8080

# Start the development server
CMD ["npm", "run", "serve"]
