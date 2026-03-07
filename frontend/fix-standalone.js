const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') && !fullPath.endsWith('.spec.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.match(/@Component\s*\(\s*\{/) && !content.includes('standalone:')) {
                content = content.replace(/@Component\s*\(\s*\{/, '@Component({\n  standalone: false,');
                fs.writeFileSync(fullPath, content);
                console.log('Fixed: ' + fullPath);
            }
        }
    }
}

const targetDir = path.join(__dirname, 'src', 'app');
processDir(targetDir);
console.log('Done fixing components.');
