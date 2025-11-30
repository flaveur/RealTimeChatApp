const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  console.log('Running pnpm build... (this may take a few seconds)');
  execSync('pnpm build', { stdio: 'inherit' });
} catch (err) {
  console.error('Build failed:', err.message);
  process.exit(2);
}

const assetsDir = path.join(__dirname, '..', 'dist', 'client', 'assets');
let file = null;
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  for (const f of files) {
    if (f.startsWith('styles-') && f.endsWith('.css')) {
      file = path.join(assetsDir, f);
      break;
    }
  }
}
if (!file) {
  console.error('No generated styles-*.css file found in', assetsDir);
  process.exit(3);
}
console.log('Found generated CSS:', file);
const content = fs.readFileSync(file, 'utf8');

const checks = [
  { name: 'min-h-screen', ok: /min-h-screen/.test(content) },
  { name: 'flex', ok: /\.flex\{/.test(content) || /\bflex\b/.test(content) },
  { name: 'text-center', ok: /text-center/.test(content) },
  { name: 'block', ok: /\.block\{/.test(content) || /\bblock\b/.test(content) },
];

console.log('\nTailwind presence checks:');
checks.forEach(c => console.log(` - ${c.name}: ${c.ok ? 'FOUND' : 'MISSING'}`));

const sampleSnippet = content.slice(0, 800);
console.log('\n--- CSS preview (first 800 chars) ---\n');
console.log(sampleSnippet);

if (!checks.every(c => c.ok)) {
  console.error('\nOne or more Tailwind checks failed.');
  process.exit(4);
}

console.log('\nTailwind appears to be present in the generated CSS.');
