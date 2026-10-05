const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- Starting CreditIQ Vercel Monorepo Build ---');

const frontendDir = path.join(__dirname, '..', 'frontend');
const rootNextDir = path.join(__dirname, '..', '.next');
const frontendNextDir = path.join(frontendDir, '.next');

// 1. Install frontend dependencies
console.log('Installing frontend dependencies...');
execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });

// 2. Build Next.js app in frontend directory
console.log('Running Next.js production build...');
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

// 3. Mirror .next artifacts to root for root-level Vercel runner
console.log('Mirroring .next directory to root...');
if (fs.existsSync(frontendNextDir)) {
  fs.cpSync(frontendNextDir, rootNextDir, { recursive: true });
}

console.log('--- CreditIQ Build & Artifact Mirror Complete ---');
