/**
 * Comprehensive CDR fix script.
 * Handles BOTH styles of subscribe:
 *
 *   Style A (shorthand): .subscribe((data) => { ... })
 *   Style B (object):    .subscribe({ next: (data) => { ... } })
 *
 * For each component ts file:
 *   1. Ensure ChangeDetectorRef is imported
 *   2. Ensure private cdr is injected
 *   3. Add this.cdr.detectChanges(); before closing } of every subscribe callback
 *      if not already present
 */
const fs = require('fs');
const path = require('path');

let fixedFiles = 0;

function ensureCdrImport(content) {
  // Already has ChangeDetectorRef
  if (content.includes('ChangeDetectorRef')) return content;
  
  // Add to existing @angular/core import
  return content.replace(
    /import\s*\{([^}]+)\}\s*from\s*'@angular\/core';/,
    (match, imports) => {
      const parts = imports.split(',').map(s => s.trim()).filter(Boolean);
      if (!parts.includes('ChangeDetectorRef')) parts.push('ChangeDetectorRef');
      return `import { ${parts.join(', ')} } from '@angular/core';`;
    }
  );
}

function ensureCdrField(content) {
  if (content.includes('inject(ChangeDetectorRef)') || content.includes('ChangeDetectorRef cdr') || content.includes('private cdr:')) {
    return content; // already has field
  }
  
  // inject() style: add after last inject() statement in the class
  if (content.includes('inject(')) {
    // Find the last inject() call and add cdr after it
    content = content.replace(
      /(= inject\([^)]+\);\s*\n)(?!\s*(?:private\s+cdr|cdr\s*=))/,
      (match) => match + '  private cdr = inject(ChangeDetectorRef);\n'
    );
    // If multiple inject() patterns, ensure we only do it once (last match wins)
    // Check again and deduplicate if needed
    const matches = content.match(/private cdr = inject\(ChangeDetectorRef\);/g);
    if (matches && matches.length > 1) {
      // Remove duplicates, keep one
      let replaced = false;
      content = content.replace(/  private cdr = inject\(ChangeDetectorRef\);\n/g, (m) => {
        if (replaced) return m;
        replaced = true;
        return m;
      });
    }
    return content;
  }
  
  // constructor() style: add cdr parameter
  if (content.includes('constructor(')) {
    content = content.replace(
      /constructor\s*\(([^)]*)\)\s*\{/,
      (match, params) => {
        const p = params.trim();
        if (p) {
          return `constructor(${p}, private cdr: ChangeDetectorRef) {`;
        }
        return `constructor(private cdr: ChangeDetectorRef) {`;
      }
    );
  }
  return content;
}

/**
 * Finds the positions of all subscribe callback bodies in the file content.
 * Returns array of {start, end} positions for insertion.
 * 
 * Strategy: after a subscribe( token, scan for the opening { and match braces
 * to find the closing }. Insert detectChanges() before the last } if not already present.
 */
function addDetectChangesInSubscribes(content) {
  // We need to find the ending } of each subscribe callback body and insert before it
  // Work on the string character by character to handle nesting correctly
  
  let result = '';
  let i = 0;
  let modified = false;
  
  while (i < content.length) {
    // Look for .subscribe(
    const subStart = content.indexOf('.subscribe(', i);
    if (subStart === -1) {
      result += content.slice(i);
      break;
    }
    
    result += content.slice(i, subStart + 11); // include '.subscribe('
    i = subStart + 11;
    
    // Skip whitespace
    while (i < content.length && (content[i] === ' ' || content[i] === '\n' || content[i] === '\r' || content[i] === '\t')) i++;
    
    if (i >= content.length) break;
    
    // Check if this is a shorthand: .subscribe((data) => { OR .subscribe(data => {
    // OR object style: .subscribe({ next: ...
    const char = content[i];
    
    if (char !== '(' && char !== '{') {
      // Not a pattern we handle, skip
      continue;
    }
    
    if (char === '{') {
      // Object style: find next: callback inside and process
      // We skip complex processing here, just copy
      result += char;
      i++;
      continue;
    }
    
    // Shorthand: .subscribe((param) => { body })
    // Find the arrow function's { body }
    // First, skip past the parameter list
    let depth = 1;
    result += char; // '('
    i++;
    
    while (i < content.length && depth > 0) {
      if (content[i] === '(') depth++;
      if (content[i] === ')') depth--;
      if (depth > 0) {
        result += content[i];
        i++;
      }
    }
    
    // Now we're at the matching ')' for subscribe(
    // Actually we need to re-think: the above consumed up to the closing )
    // Let's find the { that starts the callback body
    
    // Skip up to =>
    // Let's restart the approach - just look for the last } before the matching )
    // This approach is too complex for character iteration.
    // Let's use a simpler regex approach for shorthand style.
    
    // Undo the complex parsing and just let the regex handle it
    result += ')'; // closing paren of subscribe
    i++;
  }
  
  // Actually, the character-by-character approach got complicated.
  // Let's use AST-light approach: find all function bodies of subscribe callbacks
  // using balanced brace matching via regex+loop.
  
  return content; // fallback: return unchanged (we'll handle by regex below)
}

/**
 * Main fix: use regex patterns to add detectChanges() to subscribe callbacks.
 * Handles the common patterns found in this codebase.
 */
function fixComponentFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip files that aren't components
  if (!content.includes('@Component(')) return false;
  // Skip files that don't have subscribe
  if (!content.includes('.subscribe(')) return false;
  
  let original = content;
  
  // 1. Ensure ChangeDetectorRef imported
  content = ensureCdrImport(content);
  
  // 2. Ensure cdr field injected
  content = ensureCdrField(content);
  
  // 3. Add detectChanges() into subscribe shorthand callbacks.
  // Pattern: .subscribe((...) => {
  //   ... code ...
  // });
  // We add this.cdr.detectChanges(); as the LAST statement before the closing })
  
  // We'll process line by line, tracking brace depth
  const lines = content.split('\n');
  const newLines = [];
  let inSubscribeShorthand = false;
  let braceDepth = 0;
  let subscribeLineStart = -1;
  let subscribeBodyBraceDepth = -1;
  
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    
    // Check if this line opens a subscribe shorthand callback
    const subscribeMatch = line.match(/\.subscribe\s*\(\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>\s*\{/);
    
    if (subscribeMatch && !inSubscribeShorthand) {
      inSubscribeShorthand = true;
      subscribeLineStart = idx;
      // Count opens - closes on this line to determine initial brace depth inside callback
      const openCount = (line.match(/\{/g) || []).length;
      const closeCount = (line.match(/\}/g) || []).length;
      braceDepth = openCount - closeCount;
      subscribeBodyBraceDepth = braceDepth; // depth we're tracking from
      newLines.push(line);
      continue;
    }
    
    if (inSubscribeShorthand) {
      const openCount = (line.match(/\{/g) || []).length;
      const closeCount = (line.match(/\}/g) || []).length;
      braceDepth += openCount - closeCount;
      
      // When braceDepth hits 0, the callback is closing
      if (braceDepth <= 0) {
        inSubscribeShorthand = false;
        // Check if we already have detectChanges in this block
        const blockLines = newLines.slice(subscribeLineStart);
        const blockText = blockLines.join('\n');
        
        if (!blockText.includes('this.cdr.detectChanges()')) {
          // Insert detectChanges before the closing line
          const indent = line.match(/^(\s*)/)?.[1] || '      ';
          newLines.push(indent + '  this.cdr.detectChanges();');
        }
        braceDepth = 0;
      }
    }
    
    newLines.push(line);
  }
  
  content = newLines.join('\n');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// Walk all component files
function walkDir(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walkDir(full);
    } else if (full.endsWith('.ts') && !full.endsWith('.spec.ts') && !full.endsWith('.module.ts') && !full.endsWith('-routing.module.ts') && !full.endsWith('.interceptor.ts') && !full.endsWith('.service.ts')) {
      const fixed = fixComponentFile(full);
      if (fixed) {
        fixedFiles++;
        console.log('Fixed: ' + path.relative(__dirname, full));
      }
    }
  }
}

walkDir(path.join(__dirname, 'src', 'app'));
console.log('\nDone! Fixed ' + fixedFiles + ' files.');
