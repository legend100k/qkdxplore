# Node.js Quick Reference Cheatsheet

## 📦 npm Commands

```bash
# Package Management
npm install                      # Install all dependencies from package.json
npm install <package>            # Add package to dependencies
npm install -D <package>         # Add package to devDependencies
npm uninstall <package>          # Remove package
npm update                       # Update all packages
npm outdated                     # Check for outdated packages

# Scripts
npm run <script-name>            # Run custom script from package.json
npm start                        # Run "start" script (shorthand)
npm test                         # Run "test" script (shorthand)

# Info
npm list                         # List installed packages
npm list --depth=0               # List only top-level packages
npm view <package>               # View package info from registry
npm search <keyword>             # Search npm registry

# Project Init
npm init                         # Create new package.json (interactive)
npm init -y                      # Create package.json with defaults
```

## 🔧 Built-in Modules

### Path Module
```javascript
import path from 'path';

path.join('folder', 'file.txt')           // 'folder/file.txt'
path.resolve(__dirname, 'src')            // '/absolute/path/to/src'
path.basename('/folder/file.txt')         // 'file.txt'
path.dirname('/folder/file.txt')          // '/folder'
path.extname('file.txt')                  // '.txt'
path.parse('/folder/file.txt')            // { root, dir, base, ext, name }
```

### File System Module (Promises)
```javascript
import fs from 'fs/promises';

// Read
const data = await fs.readFile('file.txt', 'utf-8');
const files = await fs.readdir('folder');

// Write
await fs.writeFile('file.txt', 'content');
await fs.appendFile('file.txt', 'more content');

// Check
const exists = await fs.access('file.txt').then(() => true).catch(() => false);
const stats = await fs.stat('file.txt');
console.log(stats.isFile(), stats.isDirectory());

// Operations
await fs.mkdir('folder', { recursive: true });
await fs.rename('old.txt', 'new.txt');
await fs.unlink('file.txt');  // delete file
await fs.rmdir('folder');     // delete empty folder
await fs.rm('folder', { recursive: true }); // delete folder with contents
```

### Process Module
```javascript
import process from 'process';

process.cwd()                    // Current working directory
process.version                  // Node.js version
process.platform                 // 'linux', 'darwin', 'win32'
process.arch                     // 'x64', 'arm64'
process.env.NODE_ENV             // Environment variables
process.argv                     // Command line arguments
process.exit(0)                  // Exit with code

// Events
process.on('SIGINT', () => {     // Ctrl+C handler
  console.log('Graceful shutdown');
  process.exit(0);
});
```

### HTTP Module
```javascript
import http from 'http';

const server = http.createServer((req, res) => {
  // Request
  console.log(req.method);       // 'GET', 'POST', etc.
  console.log(req.url);          // '/path?query=value'
  console.log(req.headers);      // Request headers
  
  // Response
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello' }));
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### URL Module
```javascript
import { URL, fileURLToPath } from 'url';

const url = new URL('https://example.com/path?key=value#hash');
console.log(url.hostname);       // 'example.com'
console.log(url.pathname);       // '/path'
console.log(url.searchParams.get('key')); // 'value'

// ES Modules: Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

## 🔄 Async Patterns

### Promises
```javascript
// Create promise
const myPromise = new Promise((resolve, reject) => {
  if (success) resolve(data);
  else reject(error);
});

// Chain promises
myPromise
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('Done'));
```

### Async/Await
```javascript
// Basic usage
async function fetchData() {
  try {
    const data = await fs.readFile('file.txt', 'utf-8');
    return data;
  } catch (error) {
    console.error(error);
  }
}

// Parallel execution
const [result1, result2, result3] = await Promise.all([
  fetchData1(),
  fetchData2(),
  fetchData3(),
]);

// Race (first to complete wins)
const fastest = await Promise.race([
  fetch('https://api1.com'),
  fetch('https://api2.com'),
]);
```

## 📝 ES Modules vs CommonJS

### ES Modules (Modern - This Project)
```javascript
// Import
import fs from 'fs';
import { readFile } from 'fs/promises';
import * as path from 'path';
import myFunc from './utils.js';

// Export
export const myVar = 123;
export function myFunc() { }
export default class MyClass { }
```

### CommonJS (Legacy)
```javascript
// Import
const fs = require('fs');
const { readFile } = require('fs/promises');
const path = require('path');

// Export
module.exports = { myVar, myFunc };
exports.myVar = 123;
```

## 🎯 package.json Structure

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "type": "module",                    // Use ES Modules
  "main": "index.js",                  // Entry point
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",    // Node 18+ watch mode
    "test": "jest",
    "build": "vite build"
  },
  "dependencies": {                    // Runtime dependencies
    "react": "^18.0.0"                 // ^ = compatible versions
  },
  "devDependencies": {                 // Development only
    "typescript": "^5.0.0"
  },
  "engines": {                         // Required Node.js version
    "node": ">=18.0.0"
  }
}
```

## 🔍 Common Patterns

### Read JSON File
```javascript
import fs from 'fs/promises';

const data = await fs.readFile('data.json', 'utf-8');
const json = JSON.parse(data);
```

### Write JSON File
```javascript
const data = { name: 'John', age: 30 };
await fs.writeFile('data.json', JSON.stringify(data, null, 2));
```

### Walk Directory Recursively
```javascript
async function walkDir(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      await walkDir(fullPath);
    } else {
      console.log(fullPath);
    }
  }
}
```

### Simple HTTP GET Request
```javascript
import https from 'https';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const html = await get('https://example.com');
```

### Environment Variables
```javascript
// Read from .env file (requires dotenv package)
import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL || 'default-url';
const port = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === 'development';
```

### Command Line Arguments
```javascript
// Run: node script.js arg1 arg2 --flag
const args = process.argv.slice(2);
console.log(args); // ['arg1', 'arg2', '--flag']

// Better: use a package like 'minimist'
import minimist from 'minimist';
const args = minimist(process.argv.slice(2));
// { _: ['arg1', 'arg2'], flag: true }
```

## 🚀 This Project's Commands

```bash
# Development
npm run dev              # Start Vite dev server (port 8080)
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint

# Learning Scripts
node learn-nodejs.mjs         # Core Node.js concepts
node simple-server.mjs        # HTTP server demo
node analyze-project.mjs      # Analyze project files
```

## 🐛 Debugging

### Console Methods
```javascript
console.log('Message');
console.error('Error');
console.warn('Warning');
console.table([{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]);
console.time('label');
// ... code ...
console.timeEnd('label');  // Prints elapsed time
```

### Node.js Debugger
```bash
# Run with inspector
node --inspect index.js
node --inspect-brk index.js  # Break at first line

# Then open chrome://inspect in Chrome
```

### Debug in Code
```javascript
debugger;  // Breakpoint when running with --inspect
```

## 🔐 Environment Best Practices

```javascript
// .env file (never commit to git!)
DATABASE_URL=postgresql://localhost/mydb
API_KEY=secret123

// .gitignore
node_modules/
.env
dist/

// Use in code
import 'dotenv/config';
const apiKey = process.env.API_KEY;
```

## 📊 Performance

```javascript
// Measure time
console.time('operation');
await heavyOperation();
console.timeEnd('operation');

// Memory usage
const used = process.memoryUsage();
console.log({
  rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
  heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
  heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
});
```

---

## 💡 Pro Tips

1. **Always use async/await** for file operations
2. **Use path.join()** instead of string concatenation for paths
3. **Handle errors** with try/catch or .catch()
4. **Use ES Modules** (type: "module" in package.json)
5. **Keep dependencies updated** with `npm update`
6. **Use --watch flag** in Node 18+ for auto-reload during development
7. **Lock versions** with package-lock.json (commit it!)
8. **Use .env files** for configuration (never commit them!)

---

**Quick Reference for Node.js v24.8.0** 🚀
