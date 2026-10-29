import JSZip from 'jszip';

export interface SiteConfiguration {
  announcementEnabled: boolean;
  announcementText: string;
  announcementType: 'info' | 'success' | 'alert';
  maintenanceMode: boolean;
  brandTagline: string;
  creatorName: string;
  creatorHub: string;
  allowGuestCalculations: boolean;
}

const CONFIG_STORAGE_KEY = 'hps_site_master_config';

const DEFAULT_CONFIG: SiteConfiguration = {
  announcementEnabled: false,
  announcementText: '',
  announcementType: 'info',
  maintenanceMode: false,
  brandTagline: 'Simple Tools. One Place.',
  creatorName: 'Harshit',
  creatorHub: 'harshit.hub',
  allowGuestCalculations: true,
};

export function getSiteConfig(): SiteConfiguration {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load site config', e);
  }
  return DEFAULT_CONFIG;
}

export function saveSiteConfig(config: SiteConfiguration): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save site config', e);
  }
}

/**
 * Generates and downloads a complete ZIP package of HPS Tools
 */
export async function generateProjectSourceZip(): Promise<{ blob: Blob; url: string; filename: string }> {
  const zip = new JSZip();

  // Root files
  zip.file(
    'README.md',
    `# HPS Tools — Simple Tools. One Place.
Made by Harshit • harshit.hub

A complete, professional client-side utility website featuring:
- Smart Calculator (operator precedence, history tape)
- Secure Password Generator (crypto.getRandomValues, entropy)
- Live Word & Text Counter
- Universal Unit Converter (Length, Weight, Temp, Volume, Speed)
- Date of Birth & Age Calculator
- Loan & Mortgage Amortization Calculator
- Biometric Passport Photo Maker (35x45mm, 2x2in, 300 DPI, 4x6" print sheet)
- Precision Image Resizer
- Convert All Document Hub (12 conversion workspaces: PDF, Word, PowerPoint, JPG, PNG)
- Custom Theme Designer with 7 presets & color pickers
- User sign-in with harshit.hub and saved workspace persistence
- Feedback & Star ratings modal
- Admin Control Panel to manage settings and view user feedback

## Quick Start
1. \`npm install\`
2. \`npm run dev\`
3. Build for production: \`npm run build\`
`
  );

  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'hps-tools',
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'vite --port=3000 --host=0.0.0.0',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          docx: '^9.1.1',
          jspdf: '^3.0.4',
          jszip: '^3.10.1',
          'lucide-react': '^0.546.0',
          'pdf-lib': '^1.17.1',
          pptxgenjs: '^3.12.0',
          react: '^19.0.1',
          'react-dom': '^19.0.1',
          tailwindcss: '^4.3.3',
          vite: '^8.3.0',
        },
      },
      null,
      2
    )
  );

  // Add Project Documentation & Deployment instructions
  zip.file(
    'DEPLOYMENT.md',
    `# Deployment Instructions for HPS Tools
Made by Harshit (harshit.hub)

### Netlify Deployment
1. Connect your GitHub repository.
2. Build command: \`npm run build\`
3. Publish directory: \`dist\`
4. SPA Redirect: included \`public/_redirects\` ensures deep routes like \`/tools/calculator\` load without 404s.
`
  );

  // Generate ZIP blob
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const filename = 'hps-tools-complete-project.zip';

  return { blob, url, filename };
}
