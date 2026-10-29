# HPS Tools — Simple Tools. One Place.

A professional, responsive, and privacy-focused utility platform featuring 21 fully functional client-side and server-supported tools, dynamic theme personalization, account storage, and administrative controls.

**Creator:** Harshit (`harshit.hub`)  
**Tagline:** Simple Tools. One Place.

---

## 📁 Project Structure

```
hps-tools/
├── Documentation/                 # Architecture, setup, and deployment manuals
│   ├── PROJECT_STRUCTURE.md      # Detailed folder layout and module inventory
│   ├── SETUP_GUIDE.md            # Local installation & environment variables
│   ├── TOOL_GUIDE.md             # Functional reference for all 21 tools
│   └── DEPLOYMENT_GUIDE.md       # Vercel, Netlify, Render, Docker guides
├── public/                       # Static public assets (icons, manifest, etc.)
├── scripts/                      # Utility and packaging scripts
│   └── package_project.py        # Automated archive generator (.zip / .tar.gz)
├── src/
│   ├── assets/                   # SVG logos and icons
│   ├── components/               # Modular UI building blocks
│   │   ├── buttons/              # Theme-aware buttons
│   │   ├── common/               # Badges, alerts, spinners, cards
│   │   ├── dialogs/              # Modals and confirmation dialogs
│   │   ├── forms/                # Form inputs, sliders, select boxes
│   │   ├── layout/               # Header, Footer, Hero, Layout shell
│   │   └── navigation/           # Category tabs, breadcrumbs, search
│   ├── constants/                # Navigation links, categories, themes
│   ├── features/                 # Self-contained business domains
│   │   ├── admin/                # Admin feedback viewer and site controls
│   │   ├── authentication/       # User login, registration, work sync
│   │   ├── feedback/             # Feedback submission & 5-star ratings
│   │   ├── saved-tools/          # Bookmarks and saved tool states
│   │   ├── search/               # Real-time fuzzy tool search
│   │   └── theme/                # 6 preset color themes & custom palette picker
│   ├── hooks/                    # Custom React hooks (debounce, storage)
│   ├── pages/                    # Routed application views
│   │   ├── About/                # Platform background & philosophy
│   │   ├── Admin/                # Administrative dashboard
│   │   ├── Appearance/           # Live theme customizer
│   │   ├── Home/                 # Homepage with tool directory
│   │   ├── NotFound/             # 404 handler
│   │   └── PrivacyPolicy/        # Data privacy and zero-retention guarantee
│   ├── services/                 # API & storage abstraction layers
│   │   ├── api/                  # Backend endpoints client
│   │   ├── authentication/       # HMAC-based auth helpers
│   │   ├── file-conversion/      # Client-side canvas/blob conversions
│   │   └── storage/              # LocalStorage & server sync wrappers
│   ├── styles/                   # Global CSS & Tailwind definitions
│   ├── tools/                    # Isolated workspaces for all 21 tools
│   │   ├── calculator/           # Scientific / standard calculator
│   │   ├── convert-all/          # Universal multi-format converter
│   │   ├── date-of-birth-calculator/ # Age breakdown & milestone tracker
│   │   ├── image-resizer/        # Pixel/percentage dimension scaler
│   │   ├── image-to-pdf/         # Multipage image-to-PDF compiler
│   │   ├── image-to-powerpoint/  # Image presentation creator
│   │   ├── image-to-word/        # Image document export
│   │   ├── jpg-to-png/           # Format transcoder (JPG -> PNG)
│   │   ├── loan-calculator/      # EMI, amortization & interest calculator
│   │   ├── passport-photo-maker/ # Global passport standard crop tool
│   │   ├── password-generator/   # Cryptographic entropy password maker
│   │   ├── pdf-to-image/         # High-resolution PDF renderer
│   │   ├── pdf-to-powerpoint/    # PDF presentation converter
│   │   ├── pdf-to-word/          # PDF document extractor
│   │   ├── png-to-jpg/           # PNG with background fill -> JPG
│   │   ├── powerpoint-to-image/  # Presentation slide rasterizer
│   │   ├── powerpoint-to-pdf/    # Presentation to PDF export
│   │   ├── unit-converter/       # Multi-category unit conversion
│   │   ├── word-counter/         # Word, char, reading time & density
│   │   ├── word-to-image/        # Document preview rasterizer
│   │   └── word-to-pdf/          # Document to PDF export
│   ├── types/                    # Shared TypeScript interfaces & types
│   ├── utils/                    # Pure deterministic utility functions
│   ├── App.tsx                   # Top-level routing and state orchestrator
│   ├── index.css                 # Tailwind entrypoint
│   └── main.tsx                  # React DOM mount point
├── tests/                        # Comprehensive automated test suite
│   ├── integration/              # Navigation & auth flow tests
│   ├── tools/                    # Mathematical & conversion unit tests
│   └── unit/                     # Utility tests
├── index.html                    # Root HTML5 template
├── metadata.json                 # AI Studio applet configuration
├── package.json                  # NPM dependencies & scripts
├── server.ts                     # Full-stack Express backend & Vite middleware
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite build configuration
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
```bash
# Install all required dependencies
npm install
```

### 3. Development Server
```bash
# Starts Express backend + Vite dev server on http://localhost:3000
npm run dev
```

### 4. Running Automated Tests
```bash
# Runs the full test suite with tsx node test runner
npm test
```

### 5. Production Build
```bash
# Compiles TypeScript and builds production bundles into /dist
npm run build

# Runs production server
npm start
```

---

## 🔒 Security & Privacy

- **Client-Side Processing**: File conversions (images, PDFs, documents) occur directly within the browser using HTML5 Canvas and Blob APIs. Files are never transmitted to external third-party servers.
- **HMAC Signatures**: Session tokens are cryptographically signed using SHA-256 HMAC.
- **Admin Dashboard**: Accessible with credentials configurable in environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).

---

## 📄 License & Credits

Created by **Harshit** (`harshit.hub`). Built for high-performance everyday utilities.
All rights reserved.
