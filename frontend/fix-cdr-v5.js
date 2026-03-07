const fs = require('fs');
const path = require('path');

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

  const original = content;

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
  if (!content.includes('cdr = inject(ChangeDetectorRef);')) {
    content = content.replace(/(export class \w+[^\{]*\{)/, '$1\n  private cdr = inject(ChangeDetectorRef);');
  }

  // 3. Find all .subscribe( ... ) blocks
  let searchIndex = 0;
  while (true) {
    const subIdx = content.indexOf('.subscribe(', searchIndex);
    if (subIdx === -1) break;

    // Find the closing paren of .subscribe(...)
    let depth = 1;
    let endSubIdx = -1;
    for (let i = subIdx + 11; i < content.length; i++) {
      if (content[i] === '(') depth++;
      else if (content[i] === ')') {
        depth--;
        if (depth === 0) {
          endSubIdx = i;
          break;
        }
      }
    }

    if (endSubIdx === -1) {
      searchIndex = subIdx + 11;
      continue;
    }

    // Now scan that specific segment for any { } blocks (callbacks)
    const subBlock = content.substring(subIdx, endSubIdx + 1);
    
    // We want to find every { inside subBlock and inject detectChanges before the matching }
    let lastIdx = 0;
    let patchedSubBlock = '';
    while (true) {
        const braceIdx = subBlock.indexOf('{', lastIdx);
        if (braceIdx === -1) {
            patchedSubBlock += subBlock.substring(lastIdx);
            break;
        }
        
        const closeBraceIdx = findClosingBrace(subBlock, braceIdx);
        if (closeBraceIdx === -1) {
            patchedSubBlock += subBlock.substring(lastIdx, braceIdx + 1);
            lastIdx = braceIdx + 1;
            continue;
        }
        
        // This is a block { ... } inside the subscribe
        const body = subBlock.substring(braceIdx + 1, closeBraceIdx);
        
        // Don't patch if it's an object literal or already has detectChanges
        // A simple heuristic: if it contains ':' but not as part of a label or ternary?
        // Actually, many callbacks have ternary.
        // Let's check if it has a '.' or ';' - usually indicates it's a function body.
        // Or check if '=>' or 'function' precedes it.
        const preceding = subBlock.substring(0, braceIdx);
        const isCallback = preceding.match(/=>\s*$/) || preceding.match(/next\s*:\s*(?:\([^)]*\)|[a-zA-Z_$][0-9A-Za-z_$]*)\s*$/) || preceding.match(/error\s*:\s*(?:\([^)]*\)|[a-zA-Z_$][0-9A-Za-z_$]*)\s*$/);
        
        if (isCallback && !body.includes('this.cdr.detectChanges()')) {
            patchedSubBlock += subBlock.substring(lastIdx, closeBraceIdx) + '\n    this.cdr.detectChanges();\n  }';
            lastIdx = closeBraceIdx + 1;
        } else {
            patchedSubBlock += subBlock.substring(lastIdx, closeBraceIdx + 1);
            lastIdx = closeBraceIdx + 1;
        }
    }
    
    if (patchedSubBlock !== subBlock) {
        content = content.substring(0, subIdx) + patchedSubBlock + content.substring(endSubIdx + 1);
        searchIndex = subIdx + patchedSubBlock.length;
    } else {
        searchIndex = endSubIdx + 1;
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
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
console.log('CDR Fix Script V5 Completed.');
