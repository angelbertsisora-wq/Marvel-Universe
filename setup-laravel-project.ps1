# Laravel + Inertia.js + React Setup Script for Marvel Universe Project
# Run this script in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Marvel Universe - Laravel Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Laravel project already exists
$laravelPath = ".\marvel-laravel"
if (Test-Path $laravelPath) {
    Write-Host "⚠️  Laravel project already exists at: $laravelPath" -ForegroundColor Yellow
    $response = Read-Host "Do you want to continue with existing project? (y/n)"
    if ($response -ne "y") {
        Write-Host "Setup cancelled." -ForegroundColor Red
        exit
    }
} else {
    Write-Host "📦 Step 1: Creating Laravel project..." -ForegroundColor Green
    composer create-project laravel/laravel marvel-laravel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create Laravel project!" -ForegroundColor Red
        exit
    }
    Write-Host "✅ Laravel project created!" -ForegroundColor Green
}

# Step 2: Navigate to Laravel project
Set-Location $laravelPath
Write-Host ""
Write-Host "📁 Changed directory to: $(Get-Location)" -ForegroundColor Green

# Step 3: Configure .env file
Write-Host ""
Write-Host "⚙️  Step 2: Configuring database connection..." -ForegroundColor Green
Write-Host "Please make sure XAMPP MySQL is running!" -ForegroundColor Yellow
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    # Update database configuration
    $envContent = Get-Content .env -Raw
    $envContent = $envContent -replace "DB_CONNECTION=.*", "DB_CONNECTION=mysql"
    $envContent = $envContent -replace "DB_HOST=.*", "DB_HOST=127.0.0.1"
    $envContent = $envContent -replace "DB_PORT=.*", "DB_PORT=3306"
    $envContent = $envContent -replace "DB_DATABASE=.*", "DB_DATABASE=marvel_universe"
    $envContent = $envContent -replace "DB_USERNAME=.*", "DB_USERNAME=root"
    $envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD="
    Set-Content .env -Value $envContent
    Write-Host "✅ Database configuration updated!" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found. Please create it manually." -ForegroundColor Yellow
}

# Step 4: Install Inertia.js
Write-Host ""
Write-Host "📦 Step 3: Installing Inertia.js server-side..." -ForegroundColor Green
composer require inertiajs/inertia-laravel
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Inertia.js!" -ForegroundColor Red
    exit
}
Write-Host "✅ Inertia.js installed!" -ForegroundColor Green

# Step 5: Publish Inertia middleware
Write-Host ""
Write-Host "📦 Step 4: Publishing Inertia middleware..." -ForegroundColor Green
php artisan inertia:middleware
Write-Host "✅ Middleware published!" -ForegroundColor Green

# Step 6: Install React and Inertia client-side
Write-Host ""
Write-Host "📦 Step 5: Installing React and Inertia.js client-side..." -ForegroundColor Green
npm install @inertiajs/react @inertiajs/inertia react react-dom @vitejs/plugin-react
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install npm packages!" -ForegroundColor Red
    exit
}
Write-Host "✅ React and Inertia.js client-side installed!" -ForegroundColor Green

# Step 7: Install Laravel Breeze
Write-Host ""
Write-Host "📦 Step 6: Installing Laravel Breeze (Authentication)..." -ForegroundColor Green
composer require laravel/breeze --dev
php artisan breeze:install react
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Laravel Breeze!" -ForegroundColor Red
    exit
}
Write-Host "✅ Laravel Breeze installed!" -ForegroundColor Green

# Step 8: Install npm dependencies
Write-Host ""
Write-Host "📦 Step 7: Installing all npm dependencies..." -ForegroundColor Green
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install npm dependencies!" -ForegroundColor Red
    exit
}
Write-Host "✅ All dependencies installed!" -ForegroundColor Green

# Step 9: Generate application key
Write-Host ""
Write-Host "🔑 Step 8: Generating application key..." -ForegroundColor Green
php artisan key:generate
Write-Host "✅ Application key generated!" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Make sure XAMPP MySQL is running" -ForegroundColor White
Write-Host "2. Create database 'marvel_universe' in phpMyAdmin" -ForegroundColor White
Write-Host "3. Run: php artisan migrate" -ForegroundColor White
Write-Host "4. Run: npm run dev (in one terminal)" -ForegroundColor White
Write-Host "5. Run: php artisan serve (in another terminal)" -ForegroundColor White
Write-Host "6. Visit: http://localhost:8000" -ForegroundColor White
Write-Host ""






