# frontend/Dockerfile

FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Start Vite with host flag so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]
