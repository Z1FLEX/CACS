#!/bin/bash

# Docker Environment Switch Script
# Usage: ./docker-switch.sh [dev|prod]

set -e

ENVIRONMENT=${1:-prod}

echo "Switching to $ENVIRONMENT environment..."

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Remove old images to free up space (optional)
if [ "$ENVIRONMENT" = "dev" ]; then
    echo "Removing old production images to free space..."
    docker-compose build --no-cache
fi

# Start the appropriate environment
if [ "$ENVIRONMENT" = "dev" ]; then
    echo "Starting development environment with volume mounts..."
    docker-compose -f docker-compose.dev.yml up --build
else
    echo "Starting production environment..."
    docker-compose up --build -d
fi

echo "Environment switched to $ENVIRONMENT successfully!"
