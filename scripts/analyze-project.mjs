#!/usr/bin/env node

/**
 * Project Analysis Tool
 * Demonstrates: Working with files, async operations, and data processing
 * 
 * Run: node analyze-project.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility: Count lines in a file
async function countLines(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

// Utility: Get file extension
function getExtension(filename) {
  return path.extname(filename).slice(1);
}

// Utility: Recursively walk directory
async function walkDirectory(dir, fileList = []) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    // Skip node_modules, dist, and hidden folders
    if (file.name === 'node_modules' || 
        file.name === 'dist' || 
        file.name === '.git' ||
        file.name.startsWith('.')) {
      continue;
    }
    
    if (file.isDirectory()) {
      await walkDirectory(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Main analysis function
async function analyzeProject() {
  console.log('🔍 Analyzing Quantum BB84 Playground Project...\n');
  
  const srcPath = path.join(__dirname, 'src');
  
  try {
    // Get all files in src
    console.log('📂 Scanning files...');
    const allFiles = await walkDirectory(srcPath);
    
    // Group by extension
    const filesByExt = {};
    let totalLines = 0;
    
    for (const file of allFiles) {
      const ext = getExtension(file);
      const lines = await countLines(file);
      
      if (!filesByExt[ext]) {
        filesByExt[ext] = { count: 0, lines: 0, files: [] };
      }
      
      filesByExt[ext].count++;
      filesByExt[ext].lines += lines;
      filesByExt[ext].files.push({
        name: path.relative(srcPath, file),
        lines
      });
      
      totalLines += lines;
    }
    
    // Display results
    console.log('\n📊 PROJECT STATISTICS');
    console.log('═'.repeat(60));
    console.log(`Total Files: ${allFiles.length}`);
    console.log(`Total Lines of Code: ${totalLines.toLocaleString()}`);
    console.log('');
    
    console.log('📝 Files by Type:');
    const sortedExts = Object.entries(filesByExt)
      .sort((a, b) => b[1].lines - a[1].lines);
    
    for (const [ext, data] of sortedExts) {
      const percentage = ((data.lines / totalLines) * 100).toFixed(1);
      console.log(`  ${ext.padEnd(10)} ${String(data.count).padStart(3)} files  ${String(data.lines).padStart(6)} lines  (${percentage}%)`);
    }
    
    // Find largest files
    console.log('\n📈 Largest Files (Top 10):');
    const allFilesWithLines = [];
    for (const [ext, data] of Object.entries(filesByExt)) {
      for (const file of data.files) {
        allFilesWithLines.push({ ...file, ext });
      }
    }
    
    allFilesWithLines
      .sort((a, b) => b.lines - a.lines)
      .slice(0, 10)
      .forEach((file, i) => {
        console.log(`  ${String(i + 1).padStart(2)}. ${file.name.padEnd(50)} ${String(file.lines).padStart(5)} lines`);
      });
    
    // React components count
    const componentFiles = allFilesWithLines.filter(f => 
      f.name.includes('components/') && 
      (f.ext === 'tsx' || f.ext === 'jsx')
    );
    console.log(`\n⚛️  React Components: ${componentFiles.length}`);
    
    // Read package.json for dependencies
    const packageJson = JSON.parse(
      await fs.readFile(path.join(__dirname, 'package.json'), 'utf-8')
    );
    
    console.log('\n📦 Dependencies:');
    console.log(`  Production: ${Object.keys(packageJson.dependencies || {}).length}`);
    console.log(`  Development: ${Object.keys(packageJson.devDependencies || {}).length}`);
    
    // Top dependencies (by usage in imports)
    console.log('\n🔝 Most Used Dependencies (approximate):');
    const importCounts = {};
    
    for (const file of allFiles) {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = await fs.readFile(file, 'utf-8');
        const imports = content.match(/import .+ from ['"](.+?)['"]/g) || [];
        
        for (const imp of imports) {
          const match = imp.match(/from ['"](.+?)['"]/);
          if (match) {
            const pkg = match[1];
            // Only count external packages (not relative imports)
            if (!pkg.startsWith('.') && !pkg.startsWith('@/')) {
              const pkgName = pkg.startsWith('@') 
                ? pkg.split('/').slice(0, 2).join('/')
                : pkg.split('/')[0];
              importCounts[pkgName] = (importCounts[pkgName] || 0) + 1;
            }
          }
        }
      }
    }
    
    Object.entries(importCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([pkg, count], i) => {
        console.log(`  ${String(i + 1).padStart(2)}. ${pkg.padEnd(30)} ${count} imports`);
      });
    
    console.log('\n✅ Analysis complete!');
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the analysis
analyzeProject();
