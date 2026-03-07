const fs = require('fs');
let f = fs.readFileSync('src/app/pretraga/pretraga-home/pretraga-home.component.ts', 'utf8');
f = f.replace(/this\.loadBookmarks\(\);\r?\n\s*\}/, "this.loadBookmarks();\n        }\n        this.cdr.detectChanges();");
fs.writeFileSync('src/app/pretraga/pretraga-home/pretraga-home.component.ts', f);
console.log('Done!');
