#!/usr/bin/env node

/**
 * Simple CLI Tool - Package Information
 * 
 * Shows how to create command-line tools with Node.js
 * Run: node package-info.mjs [package-name]
 * 
 * Examples:
 *   node package-info.mjs
 *   node package-info.mjs react
 *   node package-info.mjs --all
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const packageName = args[0];
const showAll = args.includes('--all');

// ANSI colors for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Main function
async function main() {
  try {
    // Read package.json
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageData = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageData);
    
    console.log('');
    console.log(colorize('📦 Package Information Tool', 'bright'));
    console.log(colorize('━'.repeat(60), 'cyan'));
    console.log('');
    
    // If specific package requested
    if (packageName && packageName !== '--all') {
      const allDeps = { 
        ...packageJson.dependencies, 
        ...packageJson.devDependencies 
      };
      
      if (allDeps[packageName]) {
        console.log(colorize(`Package: ${packageName}`, 'green'));
        console.log(`Version: ${allDeps[packageName]}`);
        
        // Try to read from node_modules
        try {
          const pkgPath = path.join(__dirname, 'node_modules', packageName, 'package.json');
          const pkgData = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
          console.log(`Description: ${pkgData.description || 'N/A'}`);
          console.log(`License: ${pkgData.license || 'N/A'}`);
          console.log(`Homepage: ${pkgData.homepage || 'N/A'}`);
        } catch {
          console.log(colorize('(Run npm install to see more details)', 'yellow'));
        }
      } else {
        console.log(colorize(`❌ Package "${packageName}" not found in dependencies`, 'yellow'));
      }
      console.log('');
      return;
    }
    
    // Show project info
    console.log(colorize('🎯 Project:', 'cyan'));
    console.log(`   Name: ${packageJson.name}`);
    console.log(`   Version: ${packageJson.version}`);
    console.log(`   Type: ${packageJson.type || 'commonjs'}`);
    console.log('');
    
    // Show scripts
    console.log(colorize('🔧 Available Scripts:', 'cyan'));
    Object.entries(packageJson.scripts || {}).forEach(([name, command]) => {
      console.log(`   ${colorize('npm run ' + name, 'green').padEnd(35)} → ${command}`);
    });
    console.log('');
    
    // Dependencies
    const deps = Object.entries(packageJson.dependencies || {});
    const devDeps = Object.entries(packageJson.devDependencies || {});
    
    console.log(colorize('📚 Dependencies:', 'cyan'));
    console.log(`   Production: ${deps.length} packages`);
    console.log(`   Development: ${devDeps.length} packages`);
    console.log(`   Total: ${deps.length + devDeps.length} packages`);
    console.log('');
    
    if (showAll) {
      console.log(colorize('Production Dependencies:', 'green'));
      deps.forEach(([name, version]) => {
        console.log(`   ${name.padEnd(40)} ${version}`);
      });
      console.log('');
      
      console.log(colorize('Development Dependencies:', 'blue'));
      devDeps.forEach(([name, version]) => {
        console.log(`   ${name.padEnd(40)} ${version}`);
      });
      console.log('');
    } else {
      console.log(colorize('💡 Tip: Run with --all to see all dependencies', 'yellow'));
      console.log('');
    }
    
    // Calculate approximate size
    try {
      const nodeModulesPath = path.join(__dirname, 'node_modules');
      const files = await fs.readdir(nodeModulesPath);
      console.log(colorize('📊 Stats:', 'cyan'));
      console.log(`   Installed packages: ${files.length} folders in node_modules/`);
      console.log('');
    } catch {
      console.log(colorize('   (node_modules not found - run npm install)', 'yellow'));
      console.log('');
    }
    
    // Usage help
    console.log(colorize('Usage:', 'magenta'));
    console.log('   node package-info.mjs              Show project summary');
    console.log('   node package-info.mjs react        Show specific package info');
    console.log('   node package-info.mjs --all        Show all dependencies');
    console.log('');
    
  } catch (error) {
    console.error(colorize('❌ Error:', 'yellow'), error.message);
    process.exit(1);
  }
}

// Run main function
main();
