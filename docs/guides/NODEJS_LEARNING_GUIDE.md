# Node.js Learning Guide
### Using the Quantum BB84 Playground Project

---

## 📚 Table of Contents
1. [What is Node.js?](#what-is-nodejs)
2. [Node.js in This Project](#nodejs-in-this-project)
3. [Essential Node.js Concepts](#essential-nodejs-concepts)
4. [Hands-On Examples](#hands-on-examples)
5. [Next Steps](#next-steps)

---

## What is Node.js?

**Node.js** is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows you to:
- Run JavaScript outside the browser
- Build web servers and APIs
- Create command-line tools
- Handle file operations
- Manage packages with npm

### Why Node.js for This Project?

This is a **React + Vite** project that uses Node.js for:
1. **Package Management** (npm/node_modules)
2. **Build Tools** (Vite, TypeScript compiler)
3. **Development Server** (Hot reload, fast refresh)
4. **Code Quality** (ESLint, TypeScript)

---

## Node.js in This Project

### Project Structure
```
quantum-bb84-playground-52/
├── package.json          ← Project configuration & dependencies
├── package-lock.json     ← Lock file for exact versions
├── node_modules/         ← All installed packages (55 prod + 17 dev)
├── vite.config.ts        ← Build tool configuration (uses Node.js APIs)
├── tsconfig.json         ← TypeScript configuration
└── src/                  ← Your React code
```

### package.json Breakdown

```json
{
  "name": "vite_react_shadcn_ts",
  "type": "module",  // ← ES Modules (import/export)
  
  "scripts": {
    "dev": "vite",                    // Start dev server
    "build": "vite build",            // Production build
    "lint": "eslint .",               // Check code quality
    "preview": "vite preview"         // Preview production build
  },
  
  "dependencies": {
    // Packages needed at runtime (in browser)
    "react": "^18.3.1",
    "recharts": "^2.15.4",
    // ... 53 more
  },
  
  "devDependencies": {
    // Packages needed only during development
    "vite": "^5.4.19",
    "typescript": "^5.8.3",
    "eslint": "^9.32.0",
    // ... 14 more
  }
}
```

---

## Essential Node.js Concepts

### 1. Module System

Node.js uses **ES Modules** (modern) in this project:

```javascript
// Importing from npm packages
import { useState } from 'react';          // from node_modules/react
import { Button } from '@/components/ui';   // using @ alias (= src/)

// Importing local files
import App from './App.tsx';                // relative path

// Importing Node.js built-in modules
import path from 'path';
import fs from 'fs/promises';
```

**How module resolution works:**
1. `'react'` → Look in `node_modules/react/package.json` → Find entry point
2. `'./App'` → Look in current directory for `App.tsx`
3. `'@/components'` → Resolve `@` alias to `src/` (defined in vite.config.ts)

### 2. Built-in Node.js Modules

Node.js comes with powerful built-in modules:

```javascript
import path from 'path';           // File path operations
import fs from 'fs/promises';      // File system (async)
import http from 'http';           // HTTP server
import process from 'process';     // Process information
import { fileURLToPath } from 'url';  // URL utilities
```

**Example from vite.config.ts:**
```typescript
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // ← Node.js path module!
    },
  },
});
```

### 3. Asynchronous Programming

Node.js is **single-threaded** but **non-blocking**:

```javascript
// Old way: Callbacks (avoid)
fs.readFile('file.txt', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Modern way: Promises + async/await
const data = await fs.readFile('file.txt', 'utf-8');
console.log(data);

// Multiple operations run concurrently!
const [file1, file2, file3] = await Promise.all([
  fs.readFile('file1.txt'),
  fs.readFile('file2.txt'),
  fs.readFile('file3.txt'),
]);
```

### 4. npm Commands

```bash
# Install all dependencies from package.json
npm install

# Add a new package
npm install react-query          # Adds to dependencies
npm install -D eslint            # Adds to devDependencies

# Run scripts from package.json
npm run dev                      # Runs "vite"
npm run build                    # Runs "vite build"
npm run lint                     # Runs "eslint ."

# Update packages
npm update                       # Update all packages
npm outdated                     # Check for outdated packages

# Remove packages
npm uninstall react-query
```

### 5. The Event Loop

Node.js uses an **event loop** to handle async operations:

```
┌───────────────────────────┐
│        Timers             │  setTimeout, setInterval
├───────────────────────────┤
│     I/O Callbacks         │  Network, file operations
├───────────────────────────┤
│         Poll              │  Retrieve new I/O events
├───────────────────────────┤
│         Check             │  setImmediate
├───────────────────────────┤
│    Close Callbacks        │  socket.close()
└───────────────────────────┘
```

---

## Hands-On Examples

I've created 3 learning scripts for you:

### 1. `scripts/learn-nodejs.mjs` - Core Concepts
```bash
node scripts/learn-nodejs.mjs
```
**Teaches:**
- Path operations
- File system operations
- Environment variables
- Module resolution
- Async operations

### 2. `scripts/simple-server.mjs` - HTTP Server
```bash
node scripts/simple-server.mjs
# Then visit: http://localhost:3000
```
**Teaches:**
- Creating HTTP servers
- Routing
- Request/response handling
- JSON APIs
- Graceful shutdown

### 3. `scripts/analyze-project.mjs` - Real-World Tool
```bash
node scripts/analyze-project.mjs
```
**Teaches:**
- File traversal
- Async operations at scale
- Data processing
- Practical utilities

---

## How This Project Uses Node.js

### Development Workflow

```bash
npm run dev
```

**What happens:**
1. npm looks for "dev" script in package.json → `"vite"`
2. Runs `node_modules/.bin/vite`
3. Vite (a Node.js application) starts:
   - Reads `vite.config.ts` (Node.js file!)
   - Starts dev server on port 8080
   - Watches files for changes
   - Hot-reloads browser on save
   - Transforms TypeScript to JavaScript
   - Bundles modules

### Build Process

```bash
npm run build
```

**What happens:**
1. TypeScript compiler checks types
2. Vite bundles all files
3. Optimizes for production
4. Outputs to `dist/` folder
5. All powered by Node.js!

---

## Important Files Using Node.js

### vite.config.ts
```typescript
import { defineConfig } from "vite";
import path from "path";  // ← Node.js built-in module

export default defineConfig({
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // ← Node.js API
    },
  },
});
```

### tailwind.config.ts
```typescript
export default {
  plugins: [require("tailwindcss-animate")],  // ← CommonJS require
} satisfies Config;
```

---

## Project Statistics (via scripts/analyze-project.mjs)

```
📊 PROJECT STATISTICS
═══════════════════════════════════════
Total Files: 113
Total Lines of Code: 27,638

📝 Files by Type:
  tsx         84 files   12,769 lines  (46.2%)
  ts          12 files    1,145 lines  (4.1%)

⚛️  React Components: 79

📦 Dependencies:
  Production: 55
  Development: 17

🔝 Most Used:
  1. react                67 imports
  2. lucide-react         38 imports
  3. sonner               12 imports
```

---

## Next Steps

### 1. Learn by Doing
- Modify the example scripts
- Add new npm scripts to package.json
- Create your own Node.js utilities

### 2. Build a Simple API
```javascript
// api-server.mjs
import http from 'http';

const server = http.createServer((req, res) => {
  if (req.url === '/api/hello') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Hello from Node.js!' }));
  }
});

server.listen(4000, () => {
  console.log('API running on http://localhost:4000');
});
```

### 3. Explore Popular Node.js Frameworks
- **Express.js** - Web framework for APIs
- **Fastify** - Fast web framework
- **NestJS** - Full-featured framework (TypeScript)
- **Next.js** - React framework with Node.js backend

### 4. Learn More About
- **Streams** - Processing large data efficiently
- **Workers** - Multi-threading in Node.js
- **Databases** - MongoDB, PostgreSQL with Node.js
- **Testing** - Jest, Vitest for Node.js apps
- **Deployment** - Deploy Node.js to production

---

## Resources

### Official Documentation
- [Node.js Docs](https://nodejs.org/docs)
- [npm Docs](https://docs.npmjs.com)

### Your Project Commands
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # Check code quality
npm run preview     # Preview production build
```

### Learning Scripts in This Project
```bash
node scripts/learn-nodejs.mjs     # Core concepts
node scripts/simple-server.mjs    # HTTP server demo
node scripts/analyze-project.mjs  # Project analysis tool
```

---

## Key Takeaways

✅ **Node.js** = JavaScript runtime outside the browser  
✅ **npm** = Package manager (like apt for Ubuntu, pip for Python)  
✅ **package.json** = Project manifest with dependencies & scripts  
✅ **node_modules/** = Where all packages are installed  
✅ **ES Modules** = Modern import/export syntax  
✅ **Async/Await** = Handle async operations cleanly  
✅ **Built-in Modules** = path, fs, http, process, etc.  
✅ **Event Loop** = How Node.js handles concurrency  

---

**Your project has 27,638 lines of code across 113 files, all orchestrated by Node.js!** 🚀

---

Made with ❤️ for learning Node.js
