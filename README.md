# 🎬 Marvel Universe - Interactive MCU Website

An interactive Marvel Cinematic Universe (MCU) website featuring real-time upcoming film data, user authentication, favorites management, and immersive animations. Built with Laravel, React, and Inertia.js.

---

## 👥 Development Team

**Project Members:**
- **Jude Amancio**
- **Angelbert Sisora**
- **Ted Theone Cabanete**
- **Hanz Monoy**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [How It Works](#how-it-works)
- [System Architecture](#system-architecture)
- [Quick Start Guide](#quick-start-guide)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Marvel Universe is a full-stack web application that provides Marvel fans with:
- **Real-time MCU film data** from external APIs
- **User authentication** with secure session management
- **Personal favorites system** for tracking preferred films
- **Interactive UI** with smooth animations and video backgrounds
- **Responsive design** that works on all devices

The system combines the power of Laravel's backend with React's dynamic frontend, connected seamlessly through Inertia.js for a single-page application experience without building a separate API.

---

## ✨ Features

### 🔐 User Authentication
- Secure user registration and login
- Session-based authentication using Laravel Breeze
- User data stored in MySQL database
- Protected routes and resources

### 🎬 Upcoming Films Integration
- Real-time data from `whenisthenextmcufilm.com` API
- Automatic caching to reduce API calls
- Countdown timers for upcoming releases
- Film posters and release information

### ⭐ Favorites Management
- Add/remove favorite films
- Personal notes and theories for each film
- Persistent storage in database
- Accessible only when logged in

### 🎨 Interactive UI Components
- Hero section with video background
- Smooth scroll animations using GSAP
- Responsive navigation bar
- Modal dialogs for favorites and authentication
- Audio player integration

### 📱 Responsive Design
- Mobile-first approach
- Works seamlessly on desktop, tablet, and mobile
- Adaptive layouts and components

---

## 🛠️ Technology Stack

### Backend
- **Laravel 12** - PHP framework
- **MySQL** - Database (via XAMPP)
- **Laravel Breeze** - Authentication scaffolding
- **Inertia.js** - SPA bridge between Laravel and React

### Frontend
- **React 18** - UI library
- **Inertia.js** - SPA framework
- **Vite** - Build tool and dev server
- **GSAP** - Animation library
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library

### External Services
- **Cloudinary** - Video and image hosting
- **whenisthenextmcufilm.com API** - MCU film data

---

## 🔄 How It Works

### System Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ──────> │   Laravel    │ ──────> │   React     │
│  (User)     │ Request │  (Backend)   │ Response│  (Frontend) │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │    MySQL     │
                        │  (Database)  │
                        └──────────────┘
                              ▲
                              │
                        ┌──────────────┐
                        │ External API │
                        │  (MCU Films) │
                        └──────────────┘
```

### Data Flow

#### 1. **Page Load Flow**
```
User visits homepage
    ↓
Laravel route handler executes
    ↓
MarvelApiController fetches film data (with caching)
    ↓
Data passed to React via Inertia props
    ↓
React components render with data
```

#### 2. **Authentication Flow**
```
User clicks "Sign-up" or "Log-in"
    ↓
Redirects to Laravel auth routes (/register or /login)
    ↓
Laravel validates credentials
    ↓
User data stored in MySQL database
    ↓
Session created
    ↓
Redirects back to homepage
    ↓
Navbar updates based on auth state
```

#### 3. **Favorites Flow**
```
User clicks "Favorites" (must be logged in)
    ↓
FavoritesModal opens
    ↓
User adds/removes favorite
    ↓
Inertia form submits to Laravel controller
    ↓
FavoriteController saves to MySQL
    ↓
Frontend updates via Inertia response
```

#### 4. **API Integration Flow**
```
Page loads or user scrolls to films section
    ↓
Laravel checks cache for film data
    ↓
If cached: Return cached data
    ↓
If not cached: Fetch from external API
    ↓
Validate and enrich data
    ↓
Cache for 1 hour
    ↓
Return to frontend
```

### Key Components

#### Backend (Laravel)
- **MarvelApiController** - Handles external API calls and caching
- **FavoriteController** - Manages user favorites CRUD operations
- **FilmNoteController** - Handles film notes and theories
- **Auth Controllers** - User registration, login, logout

#### Frontend (React)
- **MarvelHome** - Main page component
- **Navbar** - Navigation with auth-aware buttons
- **Hero** - Video background hero section
- **UpcomingFilms** - Displays API film data
- **FavoritesModal** - Manages user favorites
- **AuthModal** - Login/signup modal (legacy, now uses Laravel routes)

#### Database Schema
- **users** - User accounts (Laravel Breeze)
- **favorites** - User favorite films
- **film_notes** - User notes and theories for films

---

## 🚀 Quick Start Guide

### 📋 Quick Checklist for New Users

marvel-laravel/

This folder contains the final, complete, and functional version of the project.

**First time setting up? Follow these steps in order:**

1. ✅ **Download & Install Prerequisites** (see below)
   - PHP 8.2+
   - Composer
   - Node.js & npm
   - XAMPP

2. ✅ **Install Project Dependencies**
   - Run `composer install`
   - Run `npm install`

3. ✅ **Configure Database**
   - Start XAMPP (Apache + MySQL)
   - Create `marvel_universe` database

4. ✅ **Run Setup Commands**
   - Configure `.env` file
   - Run migrations
   - Build frontend

5. ✅ **Start Server & Test**
   - Run `php artisan serve`
   - Open browser and test

---

## ⚠️ IMPORTANT: Prerequisites Installation

**Before starting, make sure you have all required software installed!**

### Required Software Downloads

#### 1. **PHP** (Version 8.2 or higher)
- **Download:** https://www.php.net/downloads.php
- **Verify installation:**
  ```bash
  php -v
  ```
  Should show PHP version 8.2 or higher

#### 2. **Composer** (PHP Dependency Manager)
- **Download:** https://getcomposer.org/download/
- **Verify installation:**
  ```bash
  composer --version
  ```
  Should show Composer version

#### 3. **Node.js and npm** (JavaScript Package Manager)
- **Download:** https://nodejs.org/ (Download LTS version)
- **Verify installation:**
  ```bash
  node -v
  npm -v
  ```
  Should show Node.js and npm versions

#### 4. **XAMPP** (Apache + MySQL Server)
- **Download:** https://www.apachefriends.org/download.html
- **Includes:** Apache, MySQL, phpMyAdmin
- **Verify installation:** Open XAMPP Control Panel

#### 5. **Git** (Optional, for version control)
- **Download:** https://git-scm.com/downloads
- **Verify installation:**
  ```bash
  git --version
  ```

---

## 📦 Install Project Dependencies

**After installing all prerequisites above, install project dependencies:**

### Step 1: Install PHP Dependencies (Composer)
```bash
cd marvel-laravel
composer install
```
This will download Laravel framework and all PHP packages listed in `composer.json`.

**Expected output:** Should see "Package operations: X installs, Y updates, Z removals"

### Step 2: Install JavaScript Dependencies (npm)
```bash
cd marvel-laravel
npm install
```
This will download React, Inertia.js, Vite, and all JavaScript packages listed in `package.json`.

**Expected output:** Should see "added X packages" message

### Step 3: Verify Installations
```bash
# Check Composer packages
composer show

# Check npm packages
npm list --depth=0
```

**If you see errors:**
- **Composer errors:** Make sure PHP is in your system PATH
- **npm errors:** Make sure Node.js is installed correctly
- **Permission errors:** Run terminal as Administrator (Windows) or use `sudo` (Mac/Linux)

---

## 🚀 Essential Setup Steps (After Prerequisites)

### Step 1: Start XAMPP
1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** (both should show green)
3. Open phpMyAdmin: `http://localhost/phpmyadmin`
4. Verify `marvel_universe` database exists (create if needed)

### Step 2: Configure Laravel
```bash
cd marvel-laravel

# Check .env file has correct database settings:
# DB_DATABASE=marvel_universe
# DB_USERNAME=root
# DB_PASSWORD=

# Clear and cache config
php artisan config:clear
php artisan cache:clear
```

### Step 3: Run Migrations
```bash
php artisan migrate
```
If you see "Nothing to migrate", run:
```bash
php artisan migrate:fresh
```

### Step 4: Build Frontend
```bash
# If you haven't run npm install yet, do it first:
npm install

# Then build for production:
npm run build      # Production build
# OR for development with hot reload:
npm run dev        # Development with hot reload (keeps running)
```

### Step 5: Start Server
```bash
php artisan serve
```
Open: `http://127.0.0.1:8000`

---

## ✅ Quick Verification (2 minutes)

### Test 1: Main Page
- [ ] Page loads at `http://127.0.0.1:8000`
- [ ] Hero video plays
- [ ] Navbar shows "Log-in" and "Sign-up" (when not logged in)
- [ ] Navbar does **NOT** show "Favorites" (when not logged in)

### Test 2: Registration
- [ ] Click "Sign-up" → redirects to `/register`
- [ ] Fill form and submit
- [ ] Redirects back to main page
- [ ] Navbar now shows user name, "Favorites", and "Logout"
- [ ] Check phpMyAdmin → `users` table has new entry

### Test 3: API Integration
- [ ] Scroll to "Upcoming Films" section
- [ ] Should display film data (not "Loading..." or error)
- [ ] Test API directly: `http://127.0.0.1:8000/api/marvel/upcoming-films`
- [ ] Should return JSON data

### Test 4: Favorites (must be logged in)
- [ ] Click "Favorites" button
- [ ] Modal opens
- [ ] Add a favorite film
- [ ] Check phpMyAdmin → `favorites` table has entry

---

## 🔧 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| **"php: command not found"** | Install PHP and add to system PATH |
| **"composer: command not found"** | Install Composer and add to system PATH |
| **"npm: command not found"** | Install Node.js from nodejs.org |
| **"composer install" fails** | Check PHP version: `php -v` (needs 8.2+) |
| **"npm install" fails** | Check Node.js version: `node -v` (needs 16+) |
| Database connection error | Start MySQL in XAMPP, check `.env` |
| "Nothing to migrate" | Run `php artisan migrate:fresh` |
| White screen | Run `php artisan view:clear && npm run build` |
| API not loading | Check internet, clear cache: `php artisan cache:clear` |
| Favorites not showing | Make sure you're logged in |
| SSL certificate error | Already fixed, but if persists check logs |
| **Port 8000 already in use** | Stop other Laravel servers or use: `php artisan serve --port=8001` |

---

## 📋 Full Testing Checklist

See `TESTING_CHECKLIST.md` for comprehensive testing guide.

---

## 🎯 Before Demo/Presentation

Run these commands:
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
npm run build
php artisan serve
```

Then verify:
- ✅ Can register/login
- ✅ Favorites only visible when logged in
- ✅ API loads film data
- ✅ No console errors (F12)
- ✅ All database tables exist

---

## 📚 Additional Documentation

- **TESTING_CHECKLIST.md** - Comprehensive testing guide
- **QUICK_START.md** - Quick reference (if exists)

---

## 🔒 Security Features

- **CSRF Protection** - Laravel's built-in CSRF token validation
- **SQL Injection Prevention** - Eloquent ORM parameter binding
- **XSS Prevention** - Input sanitization and output escaping
- **Password Hashing** - Bcrypt encryption for user passwords
- **Session Security** - Secure session management
- **Input Validation** - Server-side validation for all user inputs

---

## 🌐 API Endpoints

### Public Endpoints
- `GET /` - Homepage
- `GET /api/marvel/upcoming-films` - Get upcoming MCU films (cached)

### Protected Endpoints (Require Authentication)
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add favorite
- `POST /api/favorites/toggle` - Toggle favorite
- `DELETE /api/favorites/{id}` - Remove favorite
- `GET /api/film-notes` - Get film notes
- `POST /api/film-notes` - Add film note
- `PUT /api/film-notes/{id}` - Update film note
- `DELETE /api/film-notes/{id}` - Delete film note

---

## 📝 License

This project is developed for educational purposes.

---

## 🙏 Acknowledgments

- **Marvel Cinematic Universe** - For the amazing content
- **whenisthenextmcufilm.com** - For providing the MCU API
- **Laravel Community** - For the excellent framework
- **React Team** - For the powerful UI library

---

**Need Help?** Check `TESTING_CHECKLIST.md` for detailed steps and solutions.

**Developed by:** Jude Amancio, Angelbert Sisora, Ted Theone Cabanete, Hanz Monoy
