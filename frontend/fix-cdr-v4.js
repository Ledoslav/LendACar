const fs = require('fs');
const path = require('path');

/**
 * CDR Fix Script V4 - Surgical approach
 */

const APP_DIR = path.join(__dirname, 'src', 'app');

function findClosingBrace(content, startIndex) {
  let depth = 0;
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!filePath.endsWith('.component.ts') || !content.includes('.subscribe(')) return;

  let original = content;

  // 1. Imports
  const ngCoreMatch = content.match(/import\s*\{([^}]*)\}\s*from\s*'@angular\/core';/);
  if (ngCoreMatch) {
    let imports = ngCoreMatch[1].split(',').map(i => i.trim()).filter(Boolean);
    let modified = false;
    if (!imports.includes('ChangeDetectorRef')) { imports.push('ChangeDetectorRef'); modified = true; }
    if (!imports.includes('inject')) { imports.push('inject'); modified = true; }
    if (modified) {
      content = content.replace(ngCoreMatch[0], `import { ${imports.join(', ')} } from '@angular/core';`);
    }
  }

  // 2. Class Field
  if (!content.includes('private cdr = inject(ChangeDetectorRef);') && !content.includes('private cdr=inject(ChangeDetectorRef);')) {
    content = content.replace(/(export class \w+[^\{]*\{)/, '$1\n  private cdr = inject(ChangeDetectorRef);');
  }

  // 3. Subscribe Callbacks
  // We search for .subscribe( followed by anything until {
  let newContent = '';
  let lastIndex = 0;
  let searchIndex = 0;

  while (true) {
    const subIdx = content.indexOf('.subscribe(', searchIndex);
    if (subIdx === -1) {
      newContent += content.substring(lastIndex);
      break;
    }

    // Move search index forward
    searchIndex = subIdx + 11;
    
    // Find the callback start {
    // We look for => { or function(...) {
    const arrowIdx = content.indexOf('=>', subIdx);
    const funcIdx = content.indexOf('function', subIdx);
    
    // We want the first { after subIdx, but it must be part of the subscribe args
    const openBraceIdx = content.indexOf('{', subIdx);
    
    // If we find an open brace before the next subscribe OR within a reasonable range
    if (openBraceIdx !== -1 && (openBraceIdx - subIdx < 200)) {
       const closeBraceIdx = findClosingBrace(content, openBraceIdx);
       if (closeBraceIdx !== -1) {
         // Process this block
         const body = content.substring(openBraceIdx + 1, closeBraceIdx);
         if (!body.includes('this.cdr.detectChanges()')) {
           // Insert detectChanges before the closing brace
           const patchedBody = body + '\n    this.cdr.detectChanges();';
           newContent += content.substring(lastIndex, openBraceIdx + 1) + patchedBody;
           lastIndex = closeBraceIdx;
           searchIndex = closeBraceIdx;
           continue;
         }
       }
    }
    
    newContent += content.substring(lastIndex, searchIndex);
    lastIndex = searchIndex;
  }

  if (newContent !== original) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Patched: ${filePath}`);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full);
    else patchFile(full);
  });
}

walk(APP_DIR);
console.log('CDR Fix Script V4 Completed.');
