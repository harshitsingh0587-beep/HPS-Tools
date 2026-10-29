# HPS Tools — Project Structure & Architecture Guide

Welcome to the technical architecture documentation for **HPS Tools** ("Simple Tools. One Place."). This document explains how the entire project is organized, allowing you to easily navigate, control, and extend the codebase.

---

## 1. Directory Tree Overview

```text
/
├── public/                       # Static public assets served as-is (icons, manifests, redirects)
│   ├── _redirects                # Netlify SPA redirect rules (/* /index.html 200)
│   ├── favicon.svg               # HPS browser favicon
│   └── manifest.json             # Progressive Web App (PWA) manifest
│
├── Documentation/                # Developer & administrator documentation
│   ├── PROJECT_STRUCTURE.md      # Complete architectural layout and code organization (this file)
│   ├── SETUP_GUIDE.md            # Local installation, dev environment, and npm scripts
│   ├── TOOL_GUIDE.md             # In-depth guide to all 21 tools and how to add new ones
│   └── DEPLOYMENT_GUIDE.md       # Zero-cost production deployment (Netlify, Vercel, GitHub Pages)
│
├── src/                          # Application source code
│   ├── assets/                   # Vector graphics, logos, and static design elements
│   ├── components/               # Modular, reusable presentation UI components
│   │   ├── common/               # Core atomic elements (Icon, Logo, Badge, ToolCard)
│   │   ├── layout/               # Global framing (Header, Footer, WorkspaceShell, ThemeModal)
│   │   ├── navigation/           # Navigation links and breadcrumb trails
│   │   ├── forms/                # Form fields (InputField, SelectField, SliderField)
│   │   ├── buttons/              # Interactive controls (Button, CopyButton)
│   │   └── dialogs/              # Modals and alert dialog frames (Modal)
│   │
│   ├── constants/                # Single sources of truth for static configurations
│   │   ├── toolsRegistry.ts      # Complete metadata and tags for all 21 tools
│   │   ├── routes.ts             # Canonical URL paths across the app
│   │   ├── themePresets.ts       # 6 starter color schemes + Dark Mode
│   │   └── index.ts              # Central exports
│   │
│   ├── features/                 # Self-contained business capability slices
│   │   ├── admin/                # Admin controls, metrics, announcement banner settings
│   │   ├── authentication/       # User profile session, token management, and login modal
│   │   ├── feedback/             # Real-time feedback submission & 5-star rating system
│   │   ├── saved-tools/          # User personal workspace & work item persistence
│   │   ├── search/               # Real-time search engine with keyword filtering
│   │   └── theme/                # Dynamic CSS custom property theme manager
│   │
│   ├── hooks/                    # Reusable React hooks
│   │   ├── useAuth.ts            # Current authenticated session and permissions
│   │   ├── useTheme.ts           # Active appearance, dark mode, and color overrides
│   │   ├── useLocalStorage.ts    # Type-safe browser storage hook
│   │   └── useToolSearch.ts      # Live catalog search and category filtering
│   │
│   ├── pages/                    # Top-level route views
│   │   ├── Home/                 # Directory homepage with live search and category pills
│   │   ├── About/                # Philosophy, security architecture, and hosting info
│   │   ├── PrivacyPolicy/        # 100% in-browser privacy policy and terms
│   │   ├── NotFound/             # 404 handler with recommended quick tools
│   │   ├── Admin/                # Secure administrative dashboard (/admin)
│   │   └── Appearance/           # Dedicated theme customizer page (/settings/appearance)
│   │
│   ├── services/                 # Pure TypeScript business logic and network adapters
│   │   ├── api/                  # Fetch client and HTTP adapters for /api/* endpoints
│   │   ├── authentication/       # Cryptographic tokens, auth persistence, and sessions
│   │   ├── file-conversion/      # Client-side generators (PDF, DOCX, PPTX, Canvas image)
│   │   └── storage/              # Resilient localStorage abstractions
│   │
│   ├── tools/                    # Dedicated workspace folders for all 21 tools
│   │   ├── calculator/           # Smart mathematical calculator with precedence
│   │   ├── password-generator/   # Cryptographically secure random password generator
│   │   ├── word-counter/         # Live word, character, and reading time counter
│   │   ├── unit-converter/       # Universal metric/imperial multi-category converter
│   │   ├── date-of-birth-calculator/ # Age, leap year, and milestone countdown
│   │   ├── loan-calculator/      # Loan, mortgage, and full amortization schedule
│   │   ├── passport-photo-maker/ # Biometric ID photo generator (35x45mm, 2x2 inch, 300 DPI)
│   │   ├── image-resizer/        # Pixel, cm, and inch image scaler with aspect lock
│   │   ├── convert-all/          # Multi-format document conversion hub
│   │   ├── pdf-to-image/         # High-resolution PDF page image extractor
│   │   ├── image-to-pdf/         # Multi-image to PDF compiler with page margins
│   │   ├── pdf-to-word/          # PDF to Microsoft Word (.docx) transformer
│   │   ├── word-to-pdf/          # Word (.docx) to PDF compiler
│   │   ├── word-to-image/        # Word (.docx) to PNG cards renderer
│   │   ├── image-to-word/        # Scans/photos to Microsoft Word (.docx) packager
│   │   ├── pdf-to-powerpoint/    # PDF slides to Microsoft PowerPoint (.pptx)
│   │   ├── powerpoint-to-pdf/    # PowerPoint (.pptx) to PDF handout compiler
│   │   ├── image-to-powerpoint/  # Images to 16:9 PowerPoint (.pptx) presentations
│   │   ├── powerpoint-to-image/  # PowerPoint slide decks to PNG graphic cards
│   │   ├── jpg-to-png/           # Lossless JPG to transparent PNG converter
│   │   └── png-to-jpg/           # PNG to compressed JPG with custom fill
│   │
│   ├── types/                    # TypeScript interfaces, unions, and data shapes
│   ├── utils/                    # Pure deterministic utility functions (math, dob, loan, etc.)
│   ├── App.tsx                   # Master application coordinator and client-side router
│   ├── index.css                 # Tailwind CSS v4 directives and CSS custom properties
│   └── main.tsx                  # React 19 DOM entry point
│
├── tests/                        # Comprehensive test suites
│   ├── unit/                     # Unit tests for core algorithms (math, loan, dob, text, units)
│   ├── tools/                    # Tool registry verification tests
│   └── integration/              # Project structure and filesystem integrity tests
│
├── server.ts                     # Express production server & API handler for /api/*
├── vite.config.ts                # Vite build and development server configuration
├── tsconfig.json                 # TypeScript compiler options
└── package.json                  # Dependencies, build scripts, and metadata
```

---

## 2. Key Architectural Principles

### 1. In-Browser Client-Side Processing
All mathematical computations, text analysis, document parsing, image manipulations, and file conversions occur **strictly on the user's client machine** using JavaScript, WebAssembly, and HTML5 Canvas. No confidential user files are transmitted to backend servers.

### 2. Zero-Spaghetti Modular Workspaces
Each tool resides in its own isolated folder within `src/tools/<tool-name>/`. Every tool exposes an `index.ts` and renders inside a standard `WorkspaceShell`. Modifying one tool cannot inadvertently break another tool.

### 3. Centralized Registry
`src/constants/toolsRegistry.ts` acts as the single source of truth for tool IDs, names, search keywords, categories, and paths. Adding a new tool only requires creating its workspace folder and registering its entry in `toolsRegistry.ts`.

### 4. Resilient Multi-Layer Theming
The visual system uses CSS custom properties (`--hps-primary`, `--hps-accent`, `--hps-bg`, `--hps-surface`, `--hps-text`, `--hps-border`). When a user switches presets or adjusts custom hex colors in `/settings/appearance`, the changes take effect instantaneously across all components without reloading.
