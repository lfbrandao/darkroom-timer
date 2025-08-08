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
- Recipes are defined in `src/data/recipes.json`

### Chemistry Calculator
- Enter dilution ratio (e.g., 1:25) and total volume
- Get exact amounts of chemical and water needed
- Supports various ratio formats (1:25, 1+50, 1-31)

## Development

### Project Structure

- `/src/components` - Svelte components
- `/src/stores` - Svelte stores for state management
- `/src/styles` - Component-specific CSS
- `/styles` - Global CSS and Tailwind configuration
- `src/App.svelte` - Main application component

### Technologies

- Svelte 5 + TypeScript
- Tailwind CSS v4
- Vite 7
- Lucide Svelte icons

## License

This project is open source and available under the MIT License.