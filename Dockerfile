# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (cache based on package-lock.json)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
# Note: next.config.js must have output: 'export'
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS runner

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets from builder stage
COPY --from=builder /app/out /usr/share/nginx/html

# Expose port 3000
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
