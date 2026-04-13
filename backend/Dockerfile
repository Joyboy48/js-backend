# Use official Node.js Alpine image for a small footprint
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies (only production deps if building for prod, but we'll do all for now)
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 8000

# Create logs and temp directories and give user permission
RUN mkdir -p logs public/temp && chown -R node:node logs public/temp

# Use non-root user for security (provided by the node image)
USER node

# Start the application
CMD ["npm", "start"]
