const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- Starting CreditIQ Vercel Monorepo Build ---');

const frontendDir = path.join(__dirname, '..', 'frontend');
const rootNextDir = path.join(__dirname, '..', '.next');
const frontendNextDir = path.join(frontendDir, '.next');

// 1. Install frontend dependencies (including build devDependencies)
console.log('Installing frontend dependencies (including dev/build dependencies)...');
execSync('npm install --include=dev', {
  cwd: frontendDir,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

// 2. Build Next.js app in frontend directory
console.log('Running Next.js production build...');
execSync('npm run build', {
  cwd: frontendDir,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

// 3. Mirror .next, .vercel, and public artifacts to root for root-level Vercel runner
console.log('Mirroring build artifacts (.next, .vercel, public) to root...');
if (fs.existsSync(frontendNextDir)) {
  fs.cpSync(frontendNextDir, rootNextDir, { recursive: true });
}
const frontendVercelDir = path.join(frontendDir, '.vercel');
const rootVercelDir = path.join(__dirname, '..', '.vercel');
if (fs.existsSync(frontendVercelDir)) {
  fs.cpSync(frontendVercelDir, rootVercelDir, { recursive: true });
}
const frontendPublicDir = path.join(frontendDir, 'public');
const rootPublicDir = path.join(__dirname, '..', 'public');
if (fs.existsSync(frontendPublicDir) && !fs.existsSync(rootPublicDir)) {
  fs.cpSync(frontendPublicDir, rootPublicDir, { recursive: true });
}

console.log('--- CreditIQ Build & Artifact Mirror Complete ---');
