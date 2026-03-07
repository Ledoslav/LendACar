/**
 * Globally injects ChangeDetectorRef.detectChanges() into all Angular components
 * that use subscribe() calls but don't already have detectChanges().
 *
 * It also ensures ChangeDetectorRef is imported and injected in each such component.
 */
const fs = require('fs');
const path = require('path');

let fixedCount = 0;
let skippedCount = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip files that are already fixed or aren't components
  if (!content.includes('.subscribe(')) return;
  if (!content.includes('@Component(')) return;

  let modified = false;

  // 1. Ensure ChangeDetectorRef is imported
  if (!content.includes('ChangeDetectorRef')) {
    content = content.replace(
      /from '@angular\/core';/,
      "from '@angular/core';"
    );
    // Replace the import line to inject ChangeDetectorRef
    content = content.replace(
      /import\s*\{([^}]*)\}\s*from\s*'@angular\/core';/,
      (match, imports) => {
        const importList = imports.split(',').map(s => s.trim()).filter(Boolean);
        if (!importList.includes('ChangeDetectorRef')) {
          importList.push('ChangeDetectorRef');
        }
        return `import { ${importList.join(', ')} } from '@angular/core';`;
      }
    );
    modified = true;
  }

  // 2. Inject cdr field if class uses constructor injection pattern and doesn't have cdr
  if (!content.includes('ChangeDetectorRef') || content.includes('ChangeDetectorRef') && !content.includes('this.cdr')) {
    // For inject() style
    if (content.includes('= inject(') && !content.includes('inject(ChangeDetectorRef)')) {
      // Find a good insertion point: after the last inject() call in the class
      content = content.replace(
        /(= inject\([^)]+\);)\s*\n(?![\s\S]*= inject\()/,
        (match) => {
          modified = true;
          return match.trimEnd() + '\n  private cdr = inject(ChangeDetectorRef);\n';
        }
      );
    }
    // For constructor injection style
    else if (content.includes('constructor(') && !content.includes('ChangeDetectorRef cdr')) {
      content = content.replace(
        /constructor\s*\(([^)]*)\)/,
        (match, params) => {
          const trimmed = params.trim();
          modified = true;
          if (trimmed) {
            return `constructor(${trimmed}, private cdr: ChangeDetectorRef)`;
          } else {
            return `constructor(private cdr: ChangeDetectorRef)`;
          }
        }
      );
    }
  }

  // 3. Inject detectChanges() after every subscribe next: callback that doesn't have it yet
  // Target pattern:  next: (response) => { ... }  or  next: (data) => { ... }
  // We add detectChanges() before the closing } of the next callback if not present
  content = content.replace(
    /next:\s*\(([^)]*)\)\s*=>\s*\{([\s\S]*?)(?=\s*\},?\s*(?:error:|complete:|}\s*\)))/g,
    (match, param, body) => {
      if (body.includes('this.cdr.detectChanges()')) return match; // Already fixed
      if (!body.trim()) return match; // Empty body
      modified = true;
      const trimmedBody = body.trimEnd();
      return `next: (${param}) => {${trimmedBody}\n        this.cdr.detectChanges()`;
    }
  );

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixedCount++;
    console.log('Fixed: ' + path.relative(__dirname, filePath));
  } else {
    skippedCount++;
  }
}

function walkDir(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walkDir(full);
    } else if (full.endsWith('.ts') && !full.endsWith('.spec.ts') && !full.endsWith('.module.ts') && !full.endsWith('-routing.module.ts')) {
      processFile(full);
    }
  }
}

walkDir(path.join(__dirname, 'src', 'app'));
console.log(`\nDone! Fixed ${fixedCount} files, skipped ${skippedCount} files.`);
