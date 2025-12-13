#!/bin/bash

# =================================================================================================
# MediConnect Frontend - Docker Build & Deployment Script
# =================================================================================================
# This script builds the frontend Docker image using Next.js standalone mode for optimized production.
#
# USAGE:
#   chmod +x mkdocker.sh
#   ./mkdocker.sh
#
# DEPLOYMENT INSTRUCTIONS (Linux / OVH / Rocky Linux):
#
# 1. PREREQUISITES:
#    - Docker and Docker Compose installed.
#    - Backend service running and accessible.
#
# 2. CONFIGURATION:
#    NOTE: Next.js 'public' environment variables (NEXT_PUBLIC_*) are baked in at BUILD TIME.
#    If you need to change the API URL for different environments, you must either:
#    a) Rebuild the image with the new ARG/ENV.
#    b) Use a runtime configuration pattern (more complex).
#    
#    For this build, ensure your .env.production or build args reflect the production API URL.
#
# 3. RUNNING THE CONTAINER:
#    docker run -d \
#      --name mediconnect-frontend \
#      -p 80:3000 \
#      mediconnect-frontend:latest
#
# 4. USING DOCKER COMPOSE:
#    Refer to `docker-compose.prod.yml` in the root.
#
# =================================================================================================

IMAGE_NAME="mediconnect-frontend"
TAG="latest"

echo "---------------------------------------------------------"
echo "Started building $IMAGE_NAME:$TAG..."
echo "---------------------------------------------------------"

# Ensure output: "standalone" is enabled in next.config.mjs if not already
# This is just a reminder, ideally the code should already have it.

cd "$(dirname "$0")"
docker build -t $IMAGE_NAME:$TAG .

if [ $? -eq 0 ]; then
  echo "---------------------------------------------------------"
  echo "SUCCESS: Image $IMAGE_NAME:$TAG built successfully!"
  echo "---------------------------------------------------------"
  echo "Run it with: docker run -p 3000:3000 $IMAGE_NAME:$TAG"
else
  echo "---------------------------------------------------------"
  echo "ERROR: Docker build failed."
  echo "---------------------------------------------------------"
  exit 1
fi
