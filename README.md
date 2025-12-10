# Marvel Universe

This is an interactive Marvel-themed website built using HTML, CSS, Tailwind, and ReactJS. The project is primarily React-based and features a dynamic Hero section, where videos change on-click, along with engaging animations in the subsequent sections.

## Quick Start

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The app will open automatically in your browser at `http://localhost:5173`

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 14 or higher recommended)
- **npm** (comes with Node.js) or **yarn**

You can check if you have Node.js installed by running:
```bash
node --version
npm --version
```

## Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/angelbertsisora-wq/Marvel-Universe.git
   cd Marvel-Universe
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

   This will install all the required packages listed in `package.json`.

## Running the Project

### Development Mode

To run the project in development mode with hot-reload:

1. **Navigate to the project directory**:
   ```bash
   cd Marvel-Universe
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - The development server will start and automatically open your browser
   - The default URL is `http://localhost:5173`
   - If port 5173 is in use, Vite will automatically use the next available port
   - Check the terminal output for the exact URL if it differs

4. **The server features**:
   - Hot Module Replacement (HMR) - changes reload automatically
   - Fast refresh for React components
   - Real-time error reporting in the browser console

**Note**: Keep the terminal window open while the development server is running. Press `Ctrl + C` to stop the server.

### Build for Production

To create a production build of the project:

```bash
npm run build
```

This will create an optimized production build in the `dist` folder.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

This will start a local server to preview the production build.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run deploy` - Deploy to GitHub Pages (runs build first)

## Project Structure

```
Marvel-Universe/
├── public/          # Static assets (images, videos, fonts)
├── src/
│   ├── components/  # React components
│   ├── context/     # React context providers
│   ├── App.jsx      # Main App component
│   ├── main.jsx     # Entry point
│   └── index.css    # Global styles
├── index.html       # HTML template
├── package.json     # Dependencies and scripts
└── vite.config.js   # Vite configuration
```

## Technologies Used

- **React** - UI library
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **GSAP** - Animation library
- **React Icons** - Icon library

## Troubleshooting

If you encounter any issues:

1. **Port already in use**: The default port is 5173. If it's occupied, Vite will try the next available port automatically.

2. **Dependencies issues**: Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.

3. **Build errors**: Make sure all dependencies are installed and you're using a compatible Node.js version.
