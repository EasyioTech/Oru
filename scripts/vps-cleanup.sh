#!/bin/bash
# ============================================================================
# Oru ERP - VPS Cleanup Script
# ============================================================================
# Fixes container conflicts and cleans up before fresh deploy.
# Run from project root: ./scripts/vps-cleanup.sh
# ============================================================================

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

COMPOSE_FILE="docker/docker-compose.vps.yml"

echo -e "${BLUE}VPS Cleanup - Stopping and removing buildflow containers${NC}"
echo ""

# Try compose down first (only works if .env exists)
if [ -f ".env" ]; then
  set -a
  source .env 2>/dev/null || true
  set +a
  echo -e "${BLUE}Stopping compose stack...${NC}"
  docker compose --project-directory . -f "$COMPOSE_FILE" down 2>/dev/null || true
fi

# Force remove containers by name (works even without .env)
echo -e "${BLUE}Removing any leftover containers...${NC}"
for name in buildflow-frontend buildflow-backend buildflow-redis buildflow-postgres; do
  if docker ps -a --format '{{.Names}}' | grep -q "^${name}$"; then
    docker rm -f "$name" 2>/dev/null || true
    echo "  Removed $name"
  fi
done

echo ""
echo -e "${YELLOW}Cleanup done. You can now run: ./scripts/deploy-vps.sh${NC}"
echo -e "${YELLOW}Make sure .env exists in project root with POSTGRES_PASSWORD, JWT_SECRET, etc.${NC}"
