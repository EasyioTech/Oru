
# System Dashboard Endpoint Verification Script (PowerShell)
# Tests all critical endpoints to ensure they're working

$BaseUrl = "http://localhost:3000"
$Token = ""

Write-Host "🔍 System Dashboard Endpoint Verification" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [bool]$AuthRequired,
        [string]$Description
    )
    
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    Write-Host "  → $Method $Endpoint" -ForegroundColor Gray
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($AuthRequired -and $Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl$Endpoint" -Method $Method -Headers $headers -UseBasicParsing
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq 200 -or $statusCode -eq 201) {
            Write-Host "  ✅ Success ($statusCode)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Unexpected status ($statusCode)" -ForegroundColor Yellow
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 401 -and $AuthRequired) {
            Write-Host "  ⚠️  Unauthorized (expected if not logged in)" -ForegroundColor Yellow
        } else {
            Write-Host "  ❌ Failed ($statusCode)" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

# Test public endpoints
Write-Host "📢 PUBLIC ENDPOINTS" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/health" -AuthRequired $false -Description "Health Check"
Test-Endpoint -Method "GET" -Endpoint "/api/system/maintenance-status" -AuthRequired $false -Description "Maintenance Status"
Test-Endpoint -Method "GET" -Endpoint "/api/system/branding" -AuthRequired $false -Description "System Branding"
Write-Host ""

# Test protected endpoints
Write-Host "🔒 PROTECTED ENDPOINTS" -ForegroundColor Cyan
Write-Host "----------------------" -ForegroundColor Cyan
if (-not $Token) {
    Write-Host "Note: Set `$Token variable to test these endpoints" -ForegroundColor Yellow
}
Write-Host ""

Test-Endpoint -Method "GET" -Endpoint "/api/system/metrics" -AuthRequired $true -Description "System Metrics"
Test-Endpoint -Method "GET" -Endpoint "/api/system/settings" -AuthRequired $true -Description "System Settings"
Test-Endpoint -Method "GET" -Endpoint "/api/system/usage/realtime" -AuthRequired $true -Description "Realtime Usage"
Test-Endpoint -Method "GET" -Endpoint "/api/system/tickets/summary" -AuthRequired $true -Description "Tickets Summary"
Test-Endpoint -Method "GET" -Endpoint "/api/system/features" -AuthRequired $true -Description "System Features"
Test-Endpoint -Method "GET" -Endpoint "/api/system/plans" -AuthRequired $true -Description "Subscription Plans"
Test-Endpoint -Method "GET" -Endpoint "/api/system/page-catalog" -AuthRequired $true -Description "Page Catalog"
Test-Endpoint -Method "GET" -Endpoint "/api/system-health" -AuthRequired $true -Description "System Health"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Verification Complete" -ForegroundColor Green
Write-Host ""
Write-Host "To test authenticated endpoints:" -ForegroundColor Yellow
Write-Host "1. Login and get token:" -ForegroundColor Gray
Write-Host "   `$response = Invoke-RestMethod -Uri '$BaseUrl/api/auth/login-sauth' -Method POST -Body (@{email='admin@oru.com';password='your-password'} | ConvertTo-Json) -ContentType 'application/json'" -ForegroundColor Gray
Write-Host "   `$Token = `$response.data.access_token" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Run this script again" -ForegroundColor Gray
