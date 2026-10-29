# HPS Tools — Local Setup & Development Guide

This guide walks you through setting up and running **HPS Tools** on your local machine for rapid development and testing.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ or v22+ LTS recommended)
- **Package Manager**: `npm` (v9+), `pnpm`, or `bun`
- **Modern Browser**: Chrome, Edge, Safari, or Firefox (supporting modern Canvas and WebAssembly APIs)

---

## 2. Quickstart Installation

1. Clone or download your repository:
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd hpstools
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## 3. Available NPM Scripts

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm run dev` | Launch Dev Server | Starts the Express server (`server.ts`) with Vite middlewares mounted at `http://localhost:3000`. |
| `npm run build` | Production Build | Runs Vite production bundler to compile optimized static assets into the `dist/` folder. |
| `npm run preview`| Preview Build | Spawns a local static server to preview the built `dist/` directory. |
| `npm test` | Run Test Suites | Executes all automated unit and integration tests under `tests/**/*.test.ts` via `tsx --test`. |
| `npm run lint` | Type Check | Validates TypeScript types across the entire project with `tsc --noEmit`. |
| `npm run clean` | Clean Artifacts | Deletes the `dist/` directory to ensure a fresh compilation state. |

---

## 4. Environment Variables

Create a `.env` file in the project root if you want to override default server settings (see `.env.example`):

```bash
# Optional: Port for local server (defaults to 3000)
PORT=3000

# Optional: Master Admin Email for website control panel
ADMIN_EMAIL="admin@hpstools.com"

# Optional: Master Admin Password for /admin access
ADMIN_PASSWORD="HarshitAdmin2026!"

# Optional: Cryptographic secret used for signing session tokens
SESSION_SECRET="your-secure-random-hmac-secret-key"
```

---

## 5. Running Automated Tests

Run the test runner to verify calculation algorithms, unit conversions, and structural integrity:

```bash
npm test
```

Expected output:
```text
✔ Calculator Logic: handles standard arithmetic, operator precedence, and parentheses
✔ Calculator Logic: handles division by zero safely
✔ Loan Calculator: standard 30-year fixed loan calculation
✔ Date of Birth Calculator: exact age and milestone calculation
✔ Password Generator: length and character constraint validation
✔ Word Counter: calculates live word, character, sentence, and paragraph counts
✔ Unit Converter: converts length, temperature, speed, area, and volume correctly
✔ Tools Registry: contains exactly 21 tools with valid paths and descriptions
✔ App Structure Integrity: verifies all core service directories and modules exist
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
```
