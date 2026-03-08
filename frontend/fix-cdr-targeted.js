/**
 * Targeted fixes for components where the global script caused syntax errors.
 */
const fs = require('fs');
const path = require('path');

// ------------------------------------------------------------------
// 1. vehicle-overview: detectChanges inserted inside object literal
// ------------------------------------------------------------------
const vehicleOverviewPath = path.join(__dirname, 'src', 'app', 'administrator', 'vehicle-overview', 'vehicle-overview.component.ts');
let vo = fs.readFileSync(vehicleOverviewPath, 'utf8');

// Fix: detectChanges was placed between `: undefined` and `}`, breaking the object literal.
// Transform:  `: undefined\n        this.cdr.detectChanges()\n          }\n        }));`
// Into:       `: undefined\n          }\n        }));\n\n        this.cdr.detectChanges();`
vo = vo.replace(
  /: undefined\s*\n\s*this\.cdr\.detectChanges\(\)\s*\n\s*\}\s*\n\s*\}\)\);/,
  ': undefined\n          }\n        }));\n\n        this.cdr.detectChanges();'
);

// Fix: `location.reload();\n        this.cdr.detectChanges()` — detectChanges after reload is unreachable;
// remove location.reload() (it prevents detectChanges from running) and keep detectChanges.
vo = vo.replace(/location\.reload\(\);\s*\n\s*this\.cdr\.detectChanges\(\)/g, 'this.cdr.detectChanges()');

fs.writeFileSync(vehicleOverviewPath, vo, 'utf8');
console.log('Fixed: vehicle-overview.component.ts');

// ------------------------------------------------------------------
// 2. navbar: detectChanges placed AFTER a `return;` statement
// ------------------------------------------------------------------
const navbarPath = path.join(__dirname, 'src', 'app', 'user', 'navbar', 'navbar.component.ts');
let nb = fs.readFileSync(navbarPath, 'utf8');

// Fix: `return;\n        this.cdr.detectChanges()` — detectChanges is unreachable, move it before return
// In companyAdminEmail block, the `return;` is hit in both branches so we instead add
// detectChanges before each `return;` inside the subscribe block (all 3 of them).
// Strategy: remove the misplaced line and fix the placement.
nb = nb.replace(/return;\s*\n\s*this\.cdr\.detectChanges\(\)\s*\n/, 'this.cdr.detectChanges();\n        return;\n');

fs.writeFileSync(navbarPath, nb, 'utf8');
console.log('Fixed: navbar.component.ts');

// ------------------------------------------------------------------
// 3. reservation-form: double comma in constructor params
// ------------------------------------------------------------------
const reservationFormPath = path.join(__dirname, 'src', 'app', 'vehicle', 'reservation-form', 'reservation-form.component.ts');
let rf = fs.readFileSync(reservationFormPath, 'utf8');

// Fix: `private activityService: ActivityService,, private cdr: ChangeDetectorRef`
rf = rf.replace(/ActivityService,, private cdr/, 'ActivityService, private cdr');

fs.writeFileSync(reservationFormPath, rf, 'utf8');
console.log('Fixed: reservation-form.component.ts');

console.log('\nAll targeted fixes applied!');
