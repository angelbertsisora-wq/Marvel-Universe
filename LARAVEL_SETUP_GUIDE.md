# Laravel + React + Inertia.js Setup Guide

## Prerequisites

Before starting, ensure you have:
- ✅ **PHP 8.1+** installed
- ✅ **Composer** installed (PHP package manager)
- ✅ **Node.js 18+** and **npm** installed
- ✅ **XAMPP** installed and running (for MySQL)
- ✅ **Git** installed

## Step 1: Install Composer (if not installed)

1. Download Composer from: https://getcomposer.org/download/
2. Follow the installation wizard
3. Verify installation: `composer --version`

## Step 2: Start XAMPP MySQL

1. Open **XAMPP Control Panel**
2. Start **Apache** and **MySQL** services
3. Open **phpMyAdmin** (http://localhost/phpmyadmin)
4. Create a new database named: `marvel_universe`

## Step 3: Create Laravel Project

Run these commands in your terminal:

```bash
# Navigate to your project directory
cd "D:\3RD_YEAR\1st Sem\ITE-110\Marvel-Universe-main"

# Create new Laravel project (this will create a 'marvel-laravel' folder)
composer create-project laravel/laravel marvel-laravel

# Navigate into the Laravel project
cd marvel-laravel
```

## Step 4: Configure Database Connection

Edit `.env` file in the Laravel project:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=marvel_universe
DB_USERNAME=root
DB_PASSWORD=
```

## Step 5: Install Inertia.js Server-Side

**⚠️ IMPORTANT: Make sure you're inside the `marvel-laravel` folder!**

```bash
# Navigate to Laravel project (if not already there)
cd marvel-laravel

# Install Inertia.js server-side
composer require inertiajs/inertia-laravel
```

## Step 6: Publish Inertia Middleware

**Still in the `marvel-laravel` folder:**

```bash
php artisan inertia:middleware
```

## Step 7: Install Inertia.js Client-Side (React)

**Still in the `marvel-laravel` folder:**

```bash
npm install @inertiajs/react @inertiajs/inertia
npm install react react-dom
npm install @vitejs/plugin-react
```

## Step 8: Install Laravel Breeze (Authentication)

```bash
composer require laravel/breeze --dev
php artisan breeze:install react
npm install && npm run dev
php artisan migrate
```

## Step 9: Configure Vite for React + Inertia

The `vite.config.js` will be automatically configured by Breeze.

## Step 10: Test the Setup

```bash
# Start Laravel development server
php artisan serve

# In another terminal, start Vite
npm run dev
```

Visit: http://localhost:8000

---

## Project Structure After Setup

```
marvel-laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Middleware/
│   └── Models/
├── database/
│   └── migrations/
├── resources/
│   ├── js/
│   │   ├── Pages/          # Inertia pages (React components)
│   │   ├── Components/     # Reusable React components
│   │   └── app.jsx         # Main entry point
│   └── views/
│       └── app.blade.php   # Root template
├── routes/
│   └── web.php            # Define routes
├── .env                   # Environment config
└── package.json
```

## Next Steps

1. ✅ Database configured
2. ✅ Laravel + Inertia.js setup complete
3. ⏭️ Migrate your React components
4. ⏭️ Set up API integration
5. ⏭️ Create CRUD operations

