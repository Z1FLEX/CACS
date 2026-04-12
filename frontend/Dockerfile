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

ARG NGINX_TEMPLATE=nginx.http.conf

# Remove default nginx config and ensure the template directory exists for envsubst.
RUN rm /etc/nginx/conf.d/default.conf && \
    mkdir -p /etc/nginx/templates

# Copy both templates and activate the selected one at build time.
COPY nginx.http.conf /tmp/nginx.http.conf
COPY nginx.https.conf /tmp/nginx.https.conf
RUN cp "/tmp/${NGINX_TEMPLATE}" /etc/nginx/templates/default.conf.template && \
    rm /tmp/nginx.http.conf /tmp/nginx.https.conf

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Healthcheck (important)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1/healthz || exit 1

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
