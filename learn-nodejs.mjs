#!/usr/bin/env node

// This is a standalone Node.js script to demonstrate core concepts
// Run it with: node learn-nodejs.mjs

import path from 'path';           // Built-in Node.js module
import fs from 'fs/promises';      // Built-in file system module (promise-based)
import { fileURLToPath } from 'url'; // For ES modules

// In ES modules, __dirname isn't available by default, so we create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Node.js Learning Script\n');

// 1. PATH OPERATIONS
console.log('1️⃣ PATH OPERATIONS:');
console.log('   Current file:', __filename);
console.log('   Current directory:', __dirname);
console.log('   Resolved path to src:', path.resolve(__dirname, './src'));
console.log('   Joined paths:', path.join(__dirname, 'src', 'components'));
console.log('');

// 2. FILE SYSTEM OPERATIONS
console.log('2️⃣ FILE SYSTEM OPERATIONS:');
try {
  // Read package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageData = await fs.readFile(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageData);
  
  console.log('   Project name:', packageJson.name);
  console.log('   Number of dependencies:', Object.keys(packageJson.dependencies || {}).length);
  console.log('   Number of devDependencies:', Object.keys(packageJson.devDependencies || {}).length);
  console.log('');
  
  // List available npm scripts
  console.log('   Available scripts:');
  Object.entries(packageJson.scripts || {}).forEach(([name, command]) => {
    console.log(`     - npm run ${name.padEnd(12)} → ${command}`);
  });
  console.log('');
  
} catch (error) {
  console.error('   Error reading package.json:', error.message);
}

// 3. ENVIRONMENT VARIABLES
console.log('3️⃣ ENVIRONMENT VARIABLES:');
console.log('   Node version:', process.version);
console.log('   Platform:', process.platform);
console.log('   Architecture:', process.arch);
console.log('   Current working directory:', process.cwd());
console.log('');

// 4. MODULE RESOLUTION
console.log('4️⃣ MODULE RESOLUTION:');
console.log('   When you import "react", Node.js looks in:');
console.log('   → node_modules/react/package.json → "main" or "exports" field');
console.log('   → Finds: node_modules/react/index.js (or .mjs, .cjs)');
console.log('');

// 5. ASYNC OPERATIONS (Node.js is non-blocking!)
console.log('5️⃣ ASYNC OPERATIONS:');
console.log('   Node.js is single-threaded but can handle multiple operations');
console.log('   Starting 3 async operations...');

const operation1 = new Promise(resolve => {
  setTimeout(() => resolve('   ✓ Operation 1 done (100ms)'), 100);
});

const operation2 = new Promise(resolve => {
  setTimeout(() => resolve('   ✓ Operation 2 done (50ms)'), 50);
});

const operation3 = new Promise(resolve => {
  setTimeout(() => resolve('   ✓ Operation 3 done (150ms)'), 150);
});

// All run concurrently!
const results = await Promise.all([operation1, operation2, operation3]);
results.forEach(result => console.log(result));
console.log('');

// 6. LIST FILES IN SRC
console.log('6️⃣ LISTING FILES IN SRC:');
try {
  const srcPath = path.join(__dirname, 'src');
  const files = await fs.readdir(srcPath);
  console.log(`   Found ${files.length} items in src/:`, files.slice(0, 10).join(', '));
  console.log('');
} catch (error) {
  console.error('   Error reading src:', error.message);
}

console.log('✅ Node.js tutorial complete!');
console.log('\nKey Takeaways:');
console.log('• Node.js lets you run JavaScript outside the browser');
console.log('• npm manages packages and scripts');
console.log('• Built-in modules: path, fs, process, url, etc.');
console.log('• ES modules use import/export');
console.log('• Everything is async and non-blocking');
