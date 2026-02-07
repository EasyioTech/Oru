# ============================================================================
# BuildFlow ERP - Production Deployment Script (PowerShell)
# ============================================================================

param(
    [switch]$Clean,
    [switch]$Logs,
    [switch]$Help
)

# Color functions
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Show help
if ($Help) {
    Write-Host "BuildFlow ERP - Production Deployment Script"
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Clean    Clean up old Docker images before deployment"
    Write-Host "  -Logs     Show logs after deployment"
    Write-Host "  -Help     Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy.ps1                    # Basic deployment"
    Write-Host "  .\deploy.ps1 -Clean            # Deploy with image cleanup"
    Write-Host "  .\deploy.ps1 -Clean -Logs      # Deploy with cleanup and show logs"
    exit 0
}

# Check if .env.vps exists
if (-not (Test-Path ".env.vps")) {
    Write-Error ".env.vps file not found! Please create it from .env.example"
    exit 1
}

# Copy .env.vps to .env for Docker Compose
Write-Status "Copying .env.vps to .env..."
Copy-Item ".env.vps" ".env" -Force
Write-Success "Environment configuration copied"

# Check if Docker is running
try {
    $null = docker info 2>$null
} catch {
    Write-Error "Docker is not running. Please start Docker Desktop first."
    exit 1
}

# Check if Docker Compose is available
$dockerCompose = "docker-compose"
if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
    $dockerCompose = "docker-compose"
} elseif (Get-Command "docker" -ErrorAction SilentlyContinue) {
    try {
        $null = docker compose version 2>$null
        $dockerCompose = "docker compose"
    } catch {
        Write-Error "Docker Compose is not installed or not in PATH"
        exit 1
    }
} else {
    Write-Error "Docker is not installed or not in PATH"
    exit 1
}

Write-Status "Using Docker Compose command: $dockerCompose"

# Stop existing containers
Write-Status "Stopping existing containers..."
try {
    & $dockerCompose -f docker-compose.prod.yml down --remove-orphans 2>$null
} catch {
    Write-Warning "No existing containers to stop"
}

# Clean up old images if requested
if ($Clean) {
    Write-Status "Cleaning up old Docker images..."
    docker image prune -f
    Write-Success "Old images cleaned up"
}

# Build and start services
Write-Status "Building and starting services..."
try {
    & $dockerCompose -f docker-compose.prod.yml up -d --build
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Error "Failed to start services: $($_.Exception.Message)"
    exit 1
}

# Wait for services to be healthy
Write-Status "Waiting for services to be healthy..."
Start-Sleep -Seconds 30

# Check service health
function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [string]$ContainerName
    )
    
    $output = & $dockerCompose -f docker-compose.prod.yml ps 2>$null
    if ($output -match "$ContainerName.*Up") {
        Write-Success "$ServiceName is running"
        return $true
    } else {
        Write-Error "$ServiceName failed to start"
        return $false
    }
}

# Check all services
$allHealthy = $true
$allHealthy = $allHealthy -and (Test-ServiceHealth "PostgreSQL" "buildflow-postgres")
$allHealthy = $allHealthy -and (Test-ServiceHealth "Redis" "buildflow-redis")
$allHealthy = $allHealthy -and (Test-ServiceHealth "Backend" "buildflow-backend")
$allHealthy = $allHealthy -and (Test-ServiceHealth "Frontend" "buildflow-frontend")

# Show logs if requested or if services failed
if ($Logs -or -not $allHealthy) {
    Write-Status "Showing logs..."
    & $dockerCompose -f docker-compose.prod.yml logs --tail=50
}

# Show deployment summary
if ($allHealthy) {
    Write-Success "Deployment completed successfully!"
    
    # Get environment variables
    $envFile = Get-Content ".env" | Where-Object { $_ -match "^[A-Z_]+" }
    $frontendPort = ($envFile | Where-Object { $_ -match "^FRONTEND_PORT=" }) -replace "FRONTEND_PORT=", ""
    $backendPort = ($envFile | Where-Object { $_ -match "^BACKEND_PORT=" }) -replace "BACKEND_PORT=", ""
    
    Write-Host ""
    Write-Status "Application URLs:"
    Write-Host "  Frontend: http://localhost:$($frontendPort -eq '' ? '80' : $frontendPort)"
    Write-Host "  Backend:  http://localhost:$($backendPort -eq '' ? '3000' : $backendPort)"
    Write-Host ""
    Write-Status "Useful commands:"
    Write-Host "  View logs: $dockerCompose -f docker-compose.prod.yml logs -f"
    Write-Host "  Stop services: $dockerCompose -f docker-compose.prod.yml down"
    Write-Host "  Restart services: $dockerCompose -f docker-compose.prod.yml restart"
    Write-Host ""
    Write-Status "For production deployment, make sure to:"
    Write-Host "  1. Update domain names in .env.vps"
    Write-Host "  2. Configure SSL certificates"
    Write-Host "  3. Set up proper firewall rules"
    Write-Host "  4. Configure backup strategies"
} else {
    Write-Error "Deployment completed with errors. Please check the logs above."
    exit 1
}
