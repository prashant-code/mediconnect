#!/bin/bash

# =================================================================================================
# MediConnect Backend - Docker Build & Deployment Script
# =================================================================================================
# This script builds the backend Docker image, obfuscating the source code during the process.
#
# USAGE:
#   chmod +x mkdocker.sh
#   ./mkdocker.sh
#
# DEPLOYMENT INSTRUCTIONS (Linux / OVH / Rocky Linux):
#
# 1. PREREQUISITES:
#    - Docker and Docker Compose installed.
#    - A PostgreSQL instance running (preferably in a container).
#
# 2. RUNNING THE CONTAINER:
#    Use the following command to run this image. Ensure you provide the necessary environment
#    variables, especially the DATABASE_URL.
#
#    docker run -d \
#      --name mediconnect-backend \
#      --network host \  # Or access via internal network if using docker-compose
#      -p 3000:3000 \
#      -e PORT=3000 \
#      -e DATABASE_URL="postgresql://admin:password@localhost:5432/mediconnect?schema=public" \
#      -e JWT_SECRET="supersecret_production_key" \
#      mediconnect-backend:latest
#
# 3. USING DOCKER COMPOSE (Recommended):
#    Refer to the `docker-compose.prod.yml` in the root directory for a full stack deployment.
#    
#    Command: docker-compose -f ../docker-compose.prod.yml up -d
#
# =================================================================================================

IMAGE_NAME="mediconnect-backend"
TAG="latest"

echo "---------------------------------------------------------"
echo "Started building $IMAGE_NAME:$TAG..."
echo "---------------------------------------------------------"

# Build the Docker image
# We explicitly target the current directory for the Dockerfile context
cd "$(dirname "$0")"
docker build -t $IMAGE_NAME:$TAG .

if [ $? -eq 0 ]; then
  echo "---------------------------------------------------------"
  echo "SUCCESS: Image $IMAGE_NAME:$TAG built successfully!"
  echo "---------------------------------------------------------"
  echo "You can now run it using the instructions in the header of this script."
else
  echo "---------------------------------------------------------"
  echo "ERROR: Docker build failed."
  echo "---------------------------------------------------------"
  exit 1
fi
