# Frontend Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files and install packages
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the production app
RUN npm run build

# Expose port for Vite preview
EXPOSE 5173

# Correct CMD syntax — tell Docker to run the preview server
CMD ["npm", "run", "preview", "--", "--host"]
