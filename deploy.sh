#!/bin/bash

# ============================================================================
# BuildFlow ERP - Production Deployment Script
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.vps exists
if [ ! -f ".env.vps" ]; then
    print_error ".env.vps file not found! Please create it from .env.example"
    exit 1
fi

# Copy .env.vps to .env for Docker Compose
print_status "Copying .env.vps to .env..."
cp .env.vps .env
print_success "Environment configuration copied"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1 && ! docker compose version > /dev/null 2>&1; then
    print_error "Docker Compose is not installed or not in PATH"
    exit 1
fi

# Determine Docker Compose command
if command -v docker-compose > /dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

print_status "Using Docker Compose command: $DOCKER_COMPOSE"

# Stop existing containers
print_status "Stopping existing containers..."
$DOCKER_COMPOSE -f docker-compose.prod.yml down --remove-orphans || true

# Clean up old images (optional)
read -p "Do you want to clean up old Docker images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Cleaning up old Docker images..."
    docker image prune -f
    print_success "Old images cleaned up"
fi

# Build and start services
print_status "Building and starting services..."
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
check_service_health() {
    local service_name=$1
    local container_name=$2
    
    if $DOCKER_COMPOSE -f docker-compose.prod.yml ps | grep -q "$container_name.*Up"; then
        print_success "$service_name is running"
    else
        print_error "$service_name failed to start"
        return 1
    fi
}

# Check all services
check_service_health "PostgreSQL" "buildflow-postgres"
check_service_health "Redis" "buildflow-redis"
check_service_health "Backend" "buildflow-backend"
check_service_health "Frontend" "buildflow-frontend"

# Show logs if there are issues
read -p "Do you want to see the logs? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    $DOCKER_COMPOSE -f docker-compose.prod.yml logs --tail=50
fi

# Show access information
print_success "Deployment completed!"
echo
print_status "Application URLs:"
echo "  Frontend: http://localhost:${FRONTEND_PORT:-80}"
echo "  Backend:  http://localhost:${BACKEND_PORT:-3000}"
echo
print_status "Useful commands:"
echo "  View logs: $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f"
echo "  Stop services: $DOCKER_COMPOSE -f docker-compose.prod.yml down"
echo "  Restart services: $DOCKER_COMPOSE -f docker-compose.prod.yml restart"
echo
print_status "For production deployment, make sure to:"
echo "  1. Update domain names in .env.vps"
echo "  2. Configure SSL certificates"
echo "  3. Set up proper firewall rules"
echo "  4. Configure backup strategies"
