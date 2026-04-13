# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
ENV VITE_API_URL=/api/v1
RUN npm run build

# Stage 2: Serve the built app using NGINX
FROM nginx:alpine

# Copy the build output from the builder stage into NGINX
COPY --from=builder /app/dist /usr/share/nginx/html

# We will mount the custom nginx.conf later via docker-compose
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
