# Darkroom Timer

A professional iOS-style darkroom timer app for film development with recipe management and chemistry calculator.

## Features

- **Timer**: Circular countdown timer with complex agitation patterns
- **Recipes**: Manage multiple development workflows (Rodinal, D-76, HC-110, etc.)
- **Calculator**: Calculate exact chemical dilution ratios
- **Agitation Control**: Precise timing for initial and interval agitations
- **Sound Alerts**: Audio notifications for agitation and step completion
- **Dark Theme**: Professional iOS-style dark interface with red accents

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Timer
- Select a recipe from the dropdown
- Press play to start the timer
- Follow agitation prompts (visual and audio cues)
- Use skip controls to navigate between steps

### Recipes
- Choose from curated professional development recipes
- Preset recipes for common developers (Rodinal, D-76, HC-110)
- Each recipe includes proper agitation patterns and timing
- Recipes are defined in `src/lib/recipes.json`

### Chemistry Calculator
- Enter dilution ratio (e.g., 1:25) and total volume
- Get exact amounts of chemical and water needed
- Supports various ratio formats (1:25, 1+50, 1-31)

## Development

### Project Structure

- `/src/routes` - SvelteKit pages and layouts
- `/src/components` - Svelte components  
- `/src/stores` - Svelte stores for state management
- `/src/lib` - Shared utilities and data (recipes.json)
- `/src/styles` - Component-specific CSS
- `/static` - Static assets (favicon, etc.)
- `src/globals.css` - Global CSS and Tailwind configuration
- `src/app.html` - Main HTML template

### Technologies

- SvelteKit + Svelte 5 + TypeScript
- Tailwind CSS v4
- Vite 7
- Lucide Svelte icons
- GitHub Pages deployment

## Deployment

This app is automatically deployed to GitHub Pages using GitHub Actions. When you push to the main branch, the app will be built and deployed.

### GitHub Pages Setup

1. Go to your repository settings
2. Navigate to Pages section
3. Set Source to "GitHub Actions"
4. The app will be available at `https://yourusername.github.io/darkroom-timer-svelte/`

## License

This project is open source and available under the MIT License.