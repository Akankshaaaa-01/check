const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const exts = ['.js', '.jsx', '.ts', '.tsx', '.json'];

function walk(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) {
      if (it.name === 'node_modules' || it.name === '.git') continue;
      walk(full, files);
    } else if (/\.(js|jsx|ts|tsx)$/.test(it.name)) {
      files.push(full);
    }
  }
  return files;
}

function resolveImport(fromFile, importPath) {
  if (/^[\.\/]/.test(importPath)) {
    const base = path.resolve(path.dirname(fromFile), importPath);
    // try exact files
    for (const e of exts) {
      if (fs.existsSync(base + e)) return base + e;
    }
    // try index files in dir
    for (const e of exts) {
      if (fs.existsSync(path.join(base, 'index' + e))) return path.join(base, 'index' + e);
    }
    // try if path has extension already
    if (fs.existsSync(base)) return base;
    return null;
  }
  // non-relative imports not checked
  return true;
}

const files = walk(root);
let missing = [];
const importRegex = /import\s+(?:[^'"\n]+)\s+from\s+['"]([^'"]+)['"]/g;
const requireRegex = /require\(['"]([^'"]+)['"]\)/g;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = importRegex.exec(src)) !== null) {
    const p = m[1];
    const resolved = resolveImport(f, p);
    if (resolved === null) missing.push({ file: f, import: p });
  }
  while ((m = requireRegex.exec(src)) !== null) {
    const p = m[1];
    const resolved = resolveImport(f, p);
    if (resolved === null) missing.push({ file: f, import: p });
  }
}

if (missing.length === 0) {
  console.log('No missing relative imports detected.');
  process.exit(0);
}

console.log('Missing imports found:');
for (const mi of missing) {
  console.log(`${mi.file} -> ${mi.import}`);
}
process.exit(2);
