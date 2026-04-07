# ========================
# BUILD STAGE
# ========================
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies (better caching)
COPY package*.json ./
RUN npm ci

# Copy only necessary files
COPY . .

# Build argument for API base URL
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# ========================
# PRODUCTION STAGE
# ========================
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Healthcheck (important)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --quiet --spider http://localhost || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]