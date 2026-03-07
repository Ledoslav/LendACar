const fs = require('fs');
const path = require('path');

/**
 * Robust CDR Fix Script (V3)
 * 
 * Goals:
 * 1. Inject 'private cdr = inject(ChangeDetectorRef);' at the top of the class.
 * 2. Ensure ChangeDetectorRef and inject are imported from @angular/core.
 * 3. Add this.cdr.detectChanges(); to every .subscribe() callback.
 * 4. Handle cases where detectChanges is already present.
 */

const APP_DIR = path.join(__dirname, 'src', 'app');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Only patch component .ts files that actually use subscribe
  if (!filePath.endsWith('.component.ts') || !content.includes('.subscribe(')) return;

  let original = content;

  // 1. Fix Imports
  // Ensure ChangeDetectorRef and inject are imported from @angular/core
  const ngCoreImportMatch = content.match(/import\s*\{([^}]*)\}\s*from\s*'@angular\/core';/);
  if (ngCoreImportMatch) {
    let imports = ngCoreImportMatch[1].split(',').map(i => i.trim());
    let modified = false;
    if (!imports.includes('ChangeDetectorRef')) {
      imports.push('ChangeDetectorRef');
      modified = true;
    }
    if (!imports.includes('inject')) {
      imports.push('inject');
      modified = true;
    }
    if (modified) {
      const newImportLine = `import { ${imports.join(', ')} } from '@angular/core';`;
      content = content.replace(ngCoreImportMatch[0], newImportLine);
    }
  }

  // 2. Inject CDR field
  // We use inject() style to avoid constructor complexity
  // We place it right after the class declaration line
  if (!content.includes('private cdr = inject(ChangeDetectorRef);') && !content.includes('private cdr=inject(ChangeDetectorRef);')) {
    content = content.replace(/(export class \w+[^\{]*\{)/, '$1\n  private cdr = inject(ChangeDetectorRef);');
  }

  // 3. Patch subscribe callbacks
  // Pattern: .subscribe(...)
  // We look for the closing ) of the subscribe call.
  // Actually, a more robust way is to find .subscribe( and then find the corresponding closing paren.
  // Then we look for { } blocks inside that.
  
  // Let's use a simpler heuristic: find '})' or '}' followed by ')' and insert detectChanges before it.
  // Often it's .subscribe({ next: (v) => { ... } }) or .subscribe(v => { ... })
  
  // Pattern 1: Shorthand style .subscribe(v => { ... })
  content = content.replace(/(\.subscribe\s*\((?:[^\{]|\n)*\{)((?:[^\}]|\n)*)\}/g, (match, prefix, body) => {
    // If body already has detectChanges, skip
    if (body.includes('this.cdr.detectChanges()')) return match;
    
    // Add detectChanges to the body
    return `${prefix}${body}\n      this.cdr.detectChanges();\n    }`;
  });

  // Pattern 2: Object style .subscribe({ next: (v) => { ... } })
  content = content.replace(/(next\s*:\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>\s*\{)((?:[^\}]|\n)*)\}/g, (match, prefix, body) => {
    if (body.includes('this.cdr.detectChanges()')) return match;
    return `${prefix}${body}\n      this.cdr.detectChanges();\n    }`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched: ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else {
      patchFile(fullPath);
    }
  }
}

walk(APP_DIR);
console.log('CDR Fix Script Completed.');
