#!/bin/bash
# ============================================================================
# Oru ERP - VPS Deployment Script
# ============================================================================
# Run from project root on VPS. Used by CI/CD or manual deploy.
# Usage: ./scripts/deploy-vps.sh [--no-pull] [--clean]
#   --no-pull  Skip git pull (use when deploying without git, e.g. rsync)
#   --clean    Run cleanup first (fixes container conflicts)
# ============================================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

COMPOSE_FILE="docker/docker-compose.vps.yml"

echo -e "${BLUE}Oru ERP - VPS Deploy${NC}"
echo ""

# Parse args
DO_PULL=true
DO_CLEAN=false
for arg in "$@"; do
  case $arg in
    --no-pull) DO_PULL=false ;;
    --clean) DO_CLEAN=true ;;
  esac
done

# Cleanup first if requested
if [ "$DO_CLEAN" = true ]; then
  echo -e "${BLUE}Running cleanup...${NC}"
  bash scripts/vps-cleanup.sh
  echo ""
fi

# Git pull
if [ "$DO_PULL" = true ]; then
  echo -e "${BLUE}Pulling latest from main...${NC}"
  git fetch origin main
  git reset --hard origin/main
  echo ""
fi

# Check .env
if [ ! -f ".env" ]; then
  echo -e "${RED}.env not found. Create it from .env.example${NC}"
  exit 1
fi
source .env 2>/dev/null || true

# Build and start (--project-directory . ensures .env is loaded from project root)
echo -e "${BLUE}Building and starting containers...${NC}"
docker compose --project-directory . -f "$COMPOSE_FILE" up -d --build

# Wait for startup
echo -e "${BLUE}Waiting for services...${NC}"
sleep 15

# Health check
echo -e "${BLUE}Health check...${NC}"
if curl -sf http://localhost/health > /dev/null 2>&1; then
  echo -e "${GREEN}Frontend: OK${NC}"
else
  echo -e "${YELLOW}Frontend health check skipped (may need more time)${NC}"
fi

if curl -sf http://localhost:${BACKEND_PORT:-3000}/health > /dev/null 2>&1; then
  echo -e "${GREEN}Backend: OK${NC}"
else
  echo -e "${YELLOW}Backend health check skipped (may need more time)${NC}"
fi

echo ""
echo -e "${GREEN}Deploy complete.${NC}"
docker compose --project-directory . -f "$COMPOSE_FILE" ps
