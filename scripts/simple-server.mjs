#!/usr/bin/env node

/**
 * Simple HTTP Server in Node.js
 * This demonstrates what a Node.js backend server looks like
 * 
 * Your project uses Python (Flask) for backend, but in many projects
 * you'd use Node.js with Express.js for the backend too.
 * 
 * Run: node simple-server.mjs
 * Then visit: http://localhost:3000
 */

import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Create HTTP server
const server = http.createServer(async (req, res) => {
  console.log(`📨 ${req.method} ${req.url}`);
  
  // Route: Homepage
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Node.js Server Demo</title>
          <style>
            body { 
              font-family: system-ui; 
              max-width: 800px; 
              margin: 50px auto; 
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            h1 { font-size: 2.5rem; }
            code { background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px; }
            a { color: #ffd700; }
          </style>
        </head>
        <body>
          <h1>🚀 Node.js HTTP Server</h1>
          <p>This is a simple HTTP server created with Node.js!</p>
          
          <h2>Available Routes:</h2>
          <ul>
            <li><a href="/api/package">GET /api/package</a> - Get package.json info</li>
            <li><a href="/api/files">GET /api/files</a> - List src files</li>
            <li><a href="/health">GET /health</a> - Health check</li>
          </ul>
          
          <h2>How it works:</h2>
          <p>Node.js's <code>http</code> module creates a server that listens for requests</p>
          <p>Each request triggers a callback with <code>req</code> (request) and <code>res</code> (response)</p>
          
          <p style="margin-top: 50px; opacity: 0.7;">
            Press Ctrl+C in terminal to stop the server
          </p>
        </body>
      </html>
    `);
    return;
  }
  
  // Route: API endpoint for package info
  if (req.url === '/api/package') {
    try {
      const packagePath = path.join(__dirname, 'package.json');
      const packageData = await fs.readFile(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageData);
      
      // Return JSON response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        name: packageJson.name,
        version: packageJson.version,
        dependencies: Object.keys(packageJson.dependencies || {}).length,
        devDependencies: Object.keys(packageJson.devDependencies || {}).length,
        scripts: Object.keys(packageJson.scripts || {})
      }, null, 2));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }
  
  // Route: API endpoint for listing files
  if (req.url === '/api/files') {
    try {
      const srcPath = path.join(__dirname, 'src');
      const files = await fs.readdir(srcPath);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        path: 'src/',
        count: files.length,
        files: files 
      }, null, 2));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }
  
  // Route: Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }, null, 2));
    return;
  }
  
  // 404 Not Found
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

// Start the server
server.listen(PORT, () => {
  console.log('');
  console.log('🎯 Node.js HTTP Server Started!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  • http://localhost:${PORT}/`);
  console.log(`  • http://localhost:${PORT}/api/package`);
  console.log(`  • http://localhost:${PORT}/api/files`);
  console.log(`  • http://localhost:${PORT}/health`);
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
